import React, { useEffect, useMemo, useState } from 'react';
import { X, Check, Mic, Camera, MapPin, ArrowRightLeft, TrendingUp, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Five gated Plus features. Barcode is intentionally NOT listed — it's free.
const BENEFITS = [
  { icon: Mic, bg: 'rgba(95,212,196,.14)', color: 'var(--info)', title: 'voice logging', desc: 'say what you ate, we do the macros' },
  { icon: Camera, bg: 'rgba(225,160,171,.16)', color: 'var(--macro-fat)', title: 'photo logging', desc: 'snap your plate for instant estimates' },
  { icon: MapPin, bg: 'rgba(231,182,124,.14)', color: 'var(--warning)', title: 'restaurant mode', desc: 'real menu macros from 14+ chains' },
  { icon: ArrowRightLeft, bg: 'rgba(174,166,234,.16)', color: 'var(--accent-violet, #AEA6EA)', title: 'concierge swaps', desc: 'swap any meal, keep your macros' },
  { icon: TrendingUp, bg: 'rgba(67,198,172,.14)', color: 'var(--brand-jade)', title: 'insights pro', desc: 'deep history, correlations & export' },
];

const PLANS = {
  monthly: { price: '$7.99', per: '/ month', fine: 'free for 48 hours, then $7.99/mo · cancel anytime' },
  annual: { price: '$59.99', per: '/ year', fine: 'free for 48 hours, then $59.99/yr · cancel anytime' },
};

function planStyle(active) {
  return {
    position: 'relative', textAlign: 'center', padding: '14px 10px',
    borderRadius: 'var(--r-control)', cursor: 'pointer',
    transition: 'all .16s var(--ease-out)', background: 'var(--surface-2)',
    border: active ? '1.5px solid var(--primary)' : '1.5px solid var(--glass-border)',
    boxShadow: active ? '0 8px 24px -12px rgba(67,198,172,.4)' : 'none',
  };
}

const linkStyle = {
  background: 'none', border: 'none', color: 'var(--sage)',
  font: '600 12px var(--font-ui)', cursor: 'pointer',
};

// Trial status derived from real premium context. Kept at module scope (like
// Home.jsx's trialLabel) so the React Compiler doesn't flag the Date.now()
// read as impure inside render.
function trialInfo(premium) {
  if (premium?.status !== 'trial' || !premium?.trialExpiresAt) return { isTrial: false, hoursLeft: 0 };
  const ms = new Date(premium.trialExpiresAt).getTime() - Date.now();
  if (ms <= 0) return { isTrial: false, hoursLeft: 0 };
  return { isTrial: true, hoursLeft: Math.max(1, Math.ceil(ms / 3600000)) };
}

export function PaywallSheet({ open, onClose, showToast }) {
  const { premium, startTrial, activatePremium, premiumCheckoutUrl } = useApp();

  const [email, setEmail] = useState(premium?.email || '');
  const [plan, setPlan] = useState('annual');
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);

  const checkoutConfigured = useMemo(() => Boolean(premiumCheckoutUrl), [premiumCheckoutUrl]);

  // Trial-active state: the sheet shows a "you're on a free trial" chip and a
  // "manage subscription" CTA instead of the trial pitch. Bound to real
  // premium context — not mock — so it reflects the user's actual status.
  const { isTrial, hoursLeft } = trialInfo(premium);

  const selected = PLANS[plan] || PLANS.annual;
  const ctaLabel = isTrial ? 'manage subscription' : 'start 48-hour free trial';
  const fineprint = isTrial
    ? `your trial ends in ${hoursLeft}h · ${plan === 'annual' ? '$59.99/yr' : '$7.99/mo'} after · cancel anytime`
    : selected.fine;

  // Seed the email field + trigger the slide-in when the sheet opens. The
  // `setEntered(false)` lives in the cleanup (not the effect body) so it runs
  // on close/unmount, resetting the transform for the next open.
  useEffect(() => {
    if (!open) return undefined;
    // Seed the email + flip the slide-in transform on the next frame. Doing
    // this in the rAF callback (not the effect body) keeps the render pass clean.
    const id = requestAnimationFrame(() => {
      setEmail(premium?.email || '');
      setEntered(true);
    });
    return () => {
      cancelAnimationFrame(id);
      setEntered(false);
    };
  }, [open, premium?.email]);

  if (!open) return null;

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await startTrial(email);
      if (checkoutConfigured) {
        window.open(premiumCheckoutUrl, '_blank', 'noopener,noreferrer');
      }
      showToast?.('trial started', 'success');
      onClose?.();
    } catch (err) {
      showToast?.(err?.message || 'could not start trial', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await activatePremium(email);
      showToast?.('premium unlocked', 'success');
      onClose?.();
    } catch (err) {
      showToast?.(err?.message || 'could not unlock', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trial CTA opens secure checkout to manage the subscription; otherwise it
  // starts the trial. Both flows are preserved from the original wiring.
  const handlePrimary = isTrial ? handleUnlock : handleStart;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(4,9,8,.64)',
        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 430, maxHeight: '96%',
          display: 'flex', flexDirection: 'column',
          borderRadius: '28px 28px 0 0',
          background: 'var(--sheet-fill, var(--glass-fill))',
          border: '1px solid var(--glass-border)', borderBottom: 'none',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 -20px 50px -20px rgba(0,0,0,.8)',
          overflow: 'hidden',
          transform: entered ? 'translateY(0)' : 'translateY(20px)',
          opacity: entered ? 1 : 0.4,
          transition: 'transform .3s var(--ease-out), opacity .3s var(--ease-out)',
        }}
      >
        {/* Grab handle */}
        <div style={{ flex: 'none', display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--divider-strong)' }} />
        </div>

        {/* Close button */}
        <div style={{ flex: 'none', display: 'flex', justifyContent: 'flex-end', padding: '4px 16px 0' }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 34, height: 34, borderRadius: 999,
              border: '1px solid var(--glass-border)', background: 'var(--surface-2)',
              color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={17} strokeWidth={2} />
          </button>
        </div>

        {/* Scroll region */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 22px 24px' }}>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 19,
              background: 'linear-gradient(140deg,#43C6AC,#0F9482)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 18px 44px -16px rgba(67,198,172,.6)', color: '#04231C',
            }}>
              <Sparkles size={30} strokeWidth={1.9} />
            </div>
            <div style={{
              marginTop: 16, fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 26, letterSpacing: '-.02em', lineHeight: 1.15, color: 'var(--ink)',
            }}>
              unlock everything Plato Plus can do
            </div>
            {isTrial && (
              <div style={{
                marginTop: 8, padding: '6px 13px', borderRadius: 999,
                background: 'rgba(67,198,172,.14)', color: 'var(--primary)',
                font: '600 13px var(--font-ui)', fontVariantNumeric: 'tabular-nums',
              }}>
                you're on a free trial · {hoursLeft}h left
              </div>
            )}
          </div>

          {/* Benefit rows */}
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {BENEFITS.map((b) => (
              <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 4px' }}>
                <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 12, background: b.bg, color: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <b.icon size={20} strokeWidth={1.8} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 15px var(--font-ui)', color: 'var(--ink)' }}>{b.title}</div>
                  <div style={{ marginTop: 1, font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>{b.desc}</div>
                </div>
                <span style={{ color: 'var(--success)', display: 'inline-flex', flex: 'none' }}>
                  <Check size={18} strokeWidth={2.4} />
                </span>
              </div>
            ))}
          </div>

          {/* Plan toggle */}
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setPlan('monthly')} style={planStyle(plan === 'monthly')}>
              <div style={{ font: '600 12px var(--font-ui)', color: 'var(--sage)' }}>monthly</div>
              <div style={{ marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)' }}>$7.99</div>
              <div style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>/ month</div>
            </button>
            <button onClick={() => setPlan('annual')} style={planStyle(plan === 'annual')}>
              <span style={{ position: 'absolute', top: -9, right: 12, padding: '3px 8px', borderRadius: 999, background: 'var(--primary)', color: 'var(--on-accent)', font: '700 9px var(--font-ui)', letterSpacing: '.08em', textTransform: 'uppercase' }}>save 37%</span>
              <div style={{ font: '600 12px var(--font-ui)', color: 'var(--sage)' }}>annual</div>
              <div style={{ marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)' }}>$59.99</div>
              <div style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>/ year</div>
            </button>
          </div>

          {/* Email input (screen-specific: needed to seed startTrial/activatePremium) */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            style={{
              marginTop: 14, width: '100%', height: 46, padding: '0 16px',
              borderRadius: 'var(--r-control)', border: '1px solid var(--glass-border)',
              background: 'var(--surface-2)', color: 'var(--ink)',
              font: '500 14px var(--font-ui)', outline: 'none',
            }}
          />

          {/* Primary CTA */}
          <button
            onClick={handlePrimary}
            disabled={loading}
            style={{
              marginTop: 16, width: '100%', height: 54, border: 'none',
              borderRadius: 16,
              background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C',
              font: '700 16px var(--font-ui)', cursor: loading ? 'default' : 'pointer',
              boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            }}
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  style={{
                    width: 18, height: 18, borderRadius: 999,
                    border: '2.5px solid rgba(4,35,28,.35)', borderTopColor: '#04231C',
                    animation: 'pwspin .8s linear infinite',
                  }}
                />
                starting…
              </>
            ) : ctaLabel}
          </button>

          {/* Fine print */}
          <div style={{ marginTop: 11, textAlign: 'center', font: '500 11px var(--font-ui)', color: 'var(--muted)', lineHeight: 1.5 }}>
            {fineprint}
          </div>

          {/* Footer links — "restore purchase" reuses the activatePremium unlock flow */}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button onClick={handleUnlock} disabled={loading} style={linkStyle}>restore purchase</button>
            <button
              onClick={() => window.open('https://plato.app/terms', '_blank', 'noopener,noreferrer')}
              style={linkStyle}
            >
              terms
            </button>
          </div>
        </div>
      </div>

      {/* Spinner keyframes (matches design's pwspin) */}
      <style>{'@keyframes pwspin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}
