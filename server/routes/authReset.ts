import express from 'express';
import { randomUUID } from 'crypto';

/**
 * authReset.ts — Password reset router for the Plato backend.
 *
 * Public routes (NO authMiddleware): requesting a reset and confirming a new
 * password. Uses the `password_resets` and `users` tables. Passwords are
 * hashed with bcryptjs.
 *
 * Routes:
 *   POST /api/auth/reset/request  { email }                -> always 200 { ok:true }
 *   POST /api/auth/reset/confirm  { token, password }      -> { ok:true, (token?) }
 */
export function authResetRouter(ctx: any) {
  const { db, signToken } = ctx;
  const router = express.Router();

  // bcryptjs is imported lazily so that a missing optional dependency does not
  // crash the module on import. Each handler awaits this to get the module.
  async function getBcrypt(): Promise<any> {
    const mod: any = await import('bcryptjs');
    return mod?.default ?? mod;
  }

  // A mail provider is considered configured if any of these env vars are set.
  // When none are configured we treat the environment as "dev/testable" and
  // surface the reset token in the response + log so the flow can be exercised.
  function hasMailProvider(): boolean {
    return Boolean(
      process.env.MAIL_PROVIDER ||
        process.env.SENDGRID_API_KEY ||
        process.env.RESEND_API_KEY ||
        process.env.SMTP_URL ||
        process.env.SMTP_HOST ||
        process.env.POSTMARK_API_TOKEN ||
        process.env.MAILGUN_API_KEY,
    );
  }

  // POST /api/auth/reset/request
  // Body: { email }. ALWAYS returns 200 { ok:true } so we never leak whether an
  // account exists for a given email. If the user does exist we generate and
  // store a single-use reset token that expires in 1 hour.
  router.post('/api/auth/reset/request', async (req: any, res) => {
    try {
      const email = String(req.body?.email ?? '')
        .trim()
        .toLowerCase();

      // Nothing to look up — still respond 200 to avoid enumeration.
      if (!email) {
        return res.status(200).json({ ok: true });
      }

      const user: any = db
        .prepare('SELECT id, email FROM users WHERE lower(email) = ?')
        .get(email);

      // No such user: respond identically to the success case (no leak).
      if (!user) {
        return res.status(200).json({ ok: true });
      }

      const token = randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // now + 1 hour
      const createdAt = now.toISOString();

      db.prepare(
        'INSERT INTO password_resets (token, user_id, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)',
      ).run(token, user.id, expiresAt, createdAt);

      // The front-end reset page consumes this link with the token.
      const appUrl = process.env.APP_URL || process.env.PUBLIC_URL || 'http://localhost:5173';
      const resetLink = `${appUrl.replace(/\/$/, '')}/reset?token=${token}`;

      const isProd = process.env.NODE_ENV === 'production';
      const mailConfigured = hasMailProvider();

      // ---------------------------------------------------------------------
      // TODO(mail): Real email delivery integration point.
      //
      // When a mail provider is configured, send the reset link to
      // `user.email` here (e.g. SendGrid / Resend / Postmark / SMTP). Do NOT
      // return the token in the response in that case — the user receives it
      // via email only. Example:
      //
      //   await sendMail({
      //     to: user.email,
      //     subject: 'Reset your Plato password',
      //     text: `Reset your password: ${resetLink}`,
      //   });
      // ---------------------------------------------------------------------

      if (isProd && mailConfigured) {
        // Production with a configured provider: the mail send above is the
        // only delivery channel; do not leak the token.
        return res.status(200).json({ ok: true });
      }

      // Dev / no-mail-provider path: log the link and return the token so the
      // reset flow is testable end to end without a mail integration.
      // eslint-disable-next-line no-console
      console.log(`[authReset] Password reset link for ${user.email}: ${resetLink}`);
      return res.status(200).json({ ok: true, devToken: token });
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'failed to process reset request', detail: String(err) });
    }
  });

  // POST /api/auth/reset/confirm
  // Body: { token, password }. Validates the token (exists, unused, not
  // expired), hashes the new password, updates the user, and marks the reset
  // token used.
  router.post('/api/auth/reset/confirm', async (req: any, res) => {
    try {
      const token = String(req.body?.token ?? '').trim();
      const password = String(req.body?.password ?? '');

      if (!token) {
        return res.status(400).json({ error: 'invalid or expired token' });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: 'password must be at least 6 characters' });
      }

      const reset: any = db
        .prepare(
          'SELECT token, user_id, expires_at, used FROM password_resets WHERE token = ?',
        )
        .get(token);

      const nowIso = new Date().toISOString();

      // Missing, already used, or expired -> uniform 400.
      if (!reset || reset.used === 1 || String(reset.expires_at) < nowIso) {
        return res.status(400).json({ error: 'invalid or expired token' });
      }

      const bcrypt = await getBcrypt();
      const passwordHash = await bcrypt.hash(password, 10);

      const updatedAt = new Date().toISOString();

      // Update the user's password and consume the reset token. Marking the
      // token used is scoped to this token so any other outstanding tokens are
      // left as-is (they will still expire on their own).
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
        passwordHash,
        reset.user_id,
      );
      db.prepare('UPDATE password_resets SET used = 1 WHERE token = ?').run(token);

      const payload: any = { ok: true };

      // Optionally hand back a fresh auth token so the user is signed in right
      // after resetting, if the caller wired up signToken.
      if (typeof signToken === 'function') {
        try {
          payload.token = signToken(reset.user_id);
        } catch {
          // Signing is best-effort; a failure here should not break the reset.
        }
      }

      // updatedAt is computed for consistency with other write paths; kept for
      // clarity even though users has no updated_at column in the base schema.
      void updatedAt;

      return res.status(200).json(payload);
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'failed to confirm password reset', detail: String(err) });
    }
  });

  return router;
}
