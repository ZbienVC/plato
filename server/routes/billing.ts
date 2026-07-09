import express from 'express';
import { randomUUID } from 'crypto';

const CONFIGURED = !!process.env.STRIPE_SECRET_KEY;

/**
 * Lazily/dynamically load the Stripe SDK. Only ever invoked from inside a
 * handler and only when CONFIGURED is true, so importing this module never
 * requires the `stripe` package to be installed.
 */
async function getStripe(): Promise<any> {
  const mod: any = await import('stripe');
  const Stripe = mod.default || mod;
  return new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-06-20',
  });
}

/**
 * Middleware factory: gate a route behind an active/trialing subscription.
 * Mount AFTER authMiddleware so req.userId is populated.
 */
export function requirePremium(db: any) {
  return (req: any, res: any, next: any) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'unauthorized' });
      }
      const row: any = db
        .prepare('SELECT status FROM subscriptions WHERE user_id = ?')
        .get(userId);
      const status = row?.status || 'free';
      if (status === 'active' || status === 'trialing') {
        return next();
      }
      return res.status(402).json({ error: 'premium required' });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'premium check failed', detail: String(err) });
    }
  };
}

export function billingRouter(ctx: any) {
  const { db, authMiddleware } = ctx;
  const router = express.Router();

  const now = () => new Date().toISOString();
  const appUrl = () =>
    (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');

  // Upsert a subscription row from a Stripe subscription object.
  const upsertSubscription = (opts: {
    userId: string;
    status: string;
    plan: string | null;
    currentPeriodEnd: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  }) => {
    db.prepare(
      `INSERT INTO subscriptions
         (user_id, status, plan, current_period_end, stripe_customer_id, stripe_subscription_id, updated_at)
       VALUES (@user_id, @status, @plan, @current_period_end, @stripe_customer_id, @stripe_subscription_id, @updated_at)
       ON CONFLICT(user_id) DO UPDATE SET
         status = excluded.status,
         plan = excluded.plan,
         current_period_end = excluded.current_period_end,
         stripe_customer_id = COALESCE(excluded.stripe_customer_id, subscriptions.stripe_customer_id),
         stripe_subscription_id = COALESCE(excluded.stripe_subscription_id, subscriptions.stripe_subscription_id),
         updated_at = excluded.updated_at`
    ).run({
      user_id: opts.userId,
      status: opts.status,
      plan: opts.plan,
      current_period_end: opts.currentPeriodEnd,
      stripe_customer_id: opts.stripeCustomerId,
      stripe_subscription_id: opts.stripeSubscriptionId,
      updated_at: now(),
    });
  };

  // GET /api/billing/status — current subscription state for the user.
  router.get('/api/billing/status', authMiddleware, (req: any, res) => {
    try {
      const row: any = db
        .prepare('SELECT * FROM subscriptions WHERE user_id = ?')
        .get(req.userId);
      return res.status(200).json({
        status: row?.status || 'free',
        plan: row?.plan || null,
        currentPeriodEnd: row?.current_period_end || null,
        configured: CONFIGURED,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'failed to read billing status', detail: String(err) });
    }
  });

  // POST /api/billing/checkout — create a Stripe Checkout Session.
  router.post('/api/billing/checkout', authMiddleware, async (req: any, res) => {
    if (!CONFIGURED) {
      return res.status(501).json({
        error: 'billing not configured',
        hint: 'set STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL',
      });
    }
    try {
      const stripe = await getStripe();
      const body = req.body || {};
      const price =
        body.plan === 'annual'
          ? process.env.STRIPE_PRICE_ANNUAL
          : process.env.STRIPE_PRICE_MONTHLY;
      if (!price) {
        return res.status(501).json({
          error: 'billing not configured',
          hint: 'set STRIPE_PRICE_MONTHLY and STRIPE_PRICE_ANNUAL',
        });
      }

      // Reuse an existing Stripe customer id if we already have one.
      const existing: any = db
        .prepare('SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?')
        .get(req.userId);
      const user: any = db
        .prepare('SELECT email FROM users WHERE id = ?')
        .get(req.userId);

      const base = appUrl();
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price, quantity: 1 }],
        success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/billing/cancel`,
        client_reference_id: req.userId,
        ...(existing?.stripe_customer_id
          ? { customer: existing.stripe_customer_id }
          : user?.email
          ? { customer_email: user.email }
          : {}),
        subscription_data: {
          metadata: { userId: req.userId },
        },
        metadata: { userId: req.userId },
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'failed to create checkout session', detail: String(err) });
    }
  });

  // POST /api/billing/portal — create a Stripe billing portal session.
  router.post('/api/billing/portal', authMiddleware, async (req: any, res) => {
    if (!CONFIGURED) {
      return res.status(501).json({
        error: 'billing not configured',
        hint: 'set STRIPE_SECRET_KEY, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_ANNUAL',
      });
    }
    try {
      const row: any = db
        .prepare('SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?')
        .get(req.userId);
      if (!row?.stripe_customer_id) {
        return res
          .status(400)
          .json({ error: 'no stripe customer for user' });
      }
      const stripe = await getStripe();
      const base = appUrl();
      const session = await stripe.billingPortal.sessions.create({
        customer: row.stripe_customer_id,
        return_url: `${base}/billing`,
      });
      return res.status(200).json({ url: session.url });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'failed to create portal session', detail: String(err) });
    }
  });

  // POST /api/billing/webhook — Stripe event ingestion.
  // NOTE: express.raw({ type: 'application/json' }) must be applied at mount
  // time so req.body is the raw Buffer needed for signature verification.
  router.post('/api/billing/webhook', async (req: any, res) => {
    if (!CONFIGURED) {
      return res.status(501).json({
        error: 'billing not configured',
        hint: 'set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET',
      });
    }
    try {
      const stripe = await getStripe();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const sig = req.headers['stripe-signature'];

      let event: any;
      if (webhookSecret && sig) {
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (verifyErr) {
          return res
            .status(400)
            .json({ error: 'invalid signature', detail: String(verifyErr) });
        }
      } else {
        // No secret configured: best-effort parse (dev only).
        event =
          typeof req.body === 'string' || Buffer.isBuffer(req.body)
            ? JSON.parse(req.body.toString())
            : req.body;
      }

      const type: string = event?.type || '';

      if (type.startsWith('customer.subscription.')) {
        const sub: any = event.data?.object || {};
        const userId =
          sub.metadata?.userId ||
          sub.metadata?.user_id ||
          null;
        const stripeCustomerId =
          typeof sub.customer === 'string' ? sub.customer : sub.customer?.id || null;
        const stripeSubscriptionId = sub.id || null;
        const status = sub.status || 'active';
        const plan =
          sub.items?.data?.[0]?.price?.id ||
          sub.plan?.id ||
          null;
        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        // Resolve the user: prefer metadata, fall back to existing customer id.
        let resolvedUserId: string | null = userId;
        if (!resolvedUserId && stripeCustomerId) {
          const byCustomer: any = db
            .prepare(
              'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?'
            )
            .get(stripeCustomerId);
          resolvedUserId = byCustomer?.user_id || null;
        }

        if (resolvedUserId) {
          upsertSubscription({
            userId: resolvedUserId,
            status:
              type === 'customer.subscription.deleted' ? 'canceled' : status,
            plan,
            currentPeriodEnd,
            stripeCustomerId,
            stripeSubscriptionId,
          });
        }
      } else if (type === 'checkout.session.completed') {
        // On checkout completion, link the customer/subscription to the user.
        const session: any = event.data?.object || {};
        const userId =
          session.client_reference_id ||
          session.metadata?.userId ||
          session.metadata?.user_id ||
          null;
        const stripeCustomerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id || null;
        const stripeSubscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id || null;

        if (userId) {
          upsertSubscription({
            userId,
            status: 'active',
            plan: null,
            currentPeriodEnd: null,
            stripeCustomerId,
            stripeSubscriptionId,
          });
        }
      }

      return res.status(200).json({ received: true });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'webhook handling failed', detail: String(err) });
    }
  });

  // Touch randomUUID so the import is used even before Stripe wiring lands.
  void randomUUID;

  return router;
}
