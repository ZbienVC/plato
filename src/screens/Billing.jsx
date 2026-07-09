import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Clock, CreditCard, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getBillingStatus, createCheckout, openBillingPortal } from '../lib/api';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const sectionLabel = { font: '600 10px var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)', padding: '6px 4px 8px' };
const rowLabel = { font: '600 14px var(--font-ui)', color: 'var(--ink)' };
const rowSub = { marginTop: 1, font: '500 12px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' };

// Human-friendly date, e.g. "aug 8, 2026"
function fmtDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    .toLowerCase();
}

// Hours remaining until a timestamp (floored, never negative)
function hoursLeft(value) {
  if (!value) return 0;
  const ms = new Date(value).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return 0;
  return Math.floor(ms / 3_600_000);
}

export function Billing({ onFab }) {
  const { premium, isPremiumActive, setActiveTab, openPremiumModal } = useApp();
  // onFab is provided by the shell for the center action button; nav here uses setActiveTab.
  void onFab;

  const [remote, setRemote] = useState(null); // backend billing status (null until loaded)
  const [phase, setPhase] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [busy, setBusy] = useState(null); // key of the in-flight action, disables its button
  const [toast, setToast] = useState(null);

  const toastT = useRef(null);
  const showToast = useCallback((m) => {
    if (toastT.current) clearTimeout(toastT.current);
    setToast(m);
    toastT.current = setTimeout(() => setToast(null), 1900);
  }, []);
  useEffect(() => () => { if (toastT.current) clearTimeout(toastT.current); }, []);

  // Load real billing status; fall back gracefully to the local premium state.
  // phase already initializes to 'loading', so no setState needed on mount.
  useEffect(() => {
    let alive = true;
    getBillingStatus()
      .then((data) => {
        if (!alive) return;
        setRemote(data || null);
        setPhase('ready');
      })
      .catch(() => {
        if (!alive) return;
        setRemote(null);
        setPhase('error');
      });
    return () => { alive = false; };
  }, []);

  const retry = useCallback(() => {
    setPhase('loading');
    getBillingStatus()
      .then((data) => { setRemote(data || null); setPhase('ready'); })
      .catch(() => { setRemote(null); setPhase('error'); });
  }, []);

  // Merge backend + local premium into a single view model.
  // Backend status wins when present; otherwise trust the local premium record.
  const view = useMemo(() => {
    const localStatus = premium?.status || 'free';
    const status = remote?.status || localStatus;
    const active = isPremiumActive();
    const isTrial = status === 'trial';
    const isCanceled = status === 'canceled';
    const isFree = status === 'free' || (!active && !isTrial && !isCanceled);
    const renewsAt = remote?.currentPeriodEnd || premium?.trialExpiresAt || null;
    const plan = remote?.plan === 'monthly' ? 'monthly' : 'annual';
    return { status, active, isTrial, isCanceled, isFree, renewsAt, plan };
  }, [remote, premium, isPremiumActive]);

  // Status chip copy + colors, keyed to the subscription state.
  const chip = useMemo(() => {
    if (view.isTrial) {
      const h = hoursLeft(premium?.trialExpiresAt);
      return { label: h > 0 ? `trial · ${h}h left` : 'trial', bg: 'rgba(231,182,124,.15)', color: 'var(--warning)' };
    }
    if (view.isCanceled) {
      const end = fmtDate(view.renewsAt);
      return { label: end ? `ends ${end}` : 'canceled', bg: 'var(--surface-3)', color: 'var(--sage)' };
    }
    return { label: 'active', bg: 'rgba(67,198,172,.14)', color: 'var(--success)' };
  }, [view.isTrial, view.isCanceled, view.renewsAt, premium]);

  // Renewal line under the plan header.
  const renewalText = useMemo(() => {
    const d = fmtDate(view.renewsAt);
    if (view.isTrial) return d ? `free trial converts on ${d}` : 'free trial in progress';
    if (view.isCanceled) return d ? `access ends ${d}` : 'access ending soon';
    return d ? `renews ${d}` : 'renews automatically';
  }, [view.isTrial, view.isCanceled, view.renewsAt]);

  const planPrice = view.plan === 'monthly' ? 'monthly · $6.99/mo' : 'annual · $59.99/yr';

  // ─── Actions ───────────────────────────────────────────────────────────────
  // Stripe portal handles change-plan, payment method, invoices, cancel & resume.
  const openPortal = useCallback(async (key, pending) => {
    setBusy(key);
    showToast(pending);
    try {
      const { url } = await openBillingPortal();
      if (url) { window.location.assign(url); return; }
      showToast('billing portal unavailable');
    } catch {
      showToast('billing not configured');
    } finally {
      setBusy(null);
    }
  }, [showToast]);

  const startCheckout = useCallback(async (plan) => {
    setBusy('checkout');
    showToast('opening checkout…');
    try {
      const { url } = await createCheckout(plan);
      if (url) { window.location.assign(url); return; }
      showToast('checkout unavailable');
    } catch {
      showToast('checkout not configured');
    } finally {
      setBusy(null);
    }
  }, [showToast]);

  const listBtn = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '15px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
  };
  const chevron = <span style={{ color: 'var(--muted)', display: 'inline-flex' }}><ChevronRight size={18} /></span>;
  const primaryBtn = {
    width: '100%', height: 50, borderRadius: 14, border: 'none',
    background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C',
    font: '700 14px var(--font-ui)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  };
  const neutralBtn = {
    width: '100%', height: 50, borderRadius: 14, border: '1px solid var(--glass-border)',
    background: 'var(--surface-2)', color: 'var(--ink)', font: '600 14px var(--font-ui)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  };

  return (
    <>
      {/* status bar spacer + top bar */}
      <div style={{ height: 12 }} />
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px 14px', position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => setActiveTab('profile')}
          aria-label="Back to you"
          style={{ width: 38, height: 38, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} />
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--ink)' }}>billing &amp; subscription</div>
      </div>

      {/* scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {/* loading */}
        {phase === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ ...cardStyle, borderRadius: 22, padding: 18, height: 96, opacity: .55 }} />
            <div style={{ ...cardStyle, borderRadius: 20, padding: 18, height: 64, opacity: .4 }} />
            <div style={{ textAlign: 'center', font: '500 13px var(--font-ui)', color: 'var(--muted)', paddingTop: 6 }}>loading your subscription…</div>
          </div>
        )}

        {/* error */}
        {phase === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 24px', gap: 10 }}>
            <span style={{ color: 'var(--warning)', display: 'inline-flex' }}><AlertCircle size={30} /></span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>couldn’t load billing</div>
            <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 250, lineHeight: 1.5 }}>we hit a snag reaching your subscription. check your connection and try again.</div>
            <button onClick={retry} style={{ ...neutralBtn, width: 'auto', padding: '0 22px', marginTop: 8 }}>retry</button>
          </div>
        )}

        {/* free — upsell */}
        {phase === 'ready' && view.isFree && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px', gap: 6 }}>
            <div style={{ width: 76, height: 76, borderRadius: 22, background: 'linear-gradient(140deg,#43C6AC,#0F9482)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 44px -16px rgba(67,198,172,.6)', color: '#04231C' }}>
              <Sparkles size={34} strokeWidth={1.9} />
            </div>
            <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-.01em', color: 'var(--ink)' }}>you’re on the free plan</div>
            <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 250, lineHeight: 1.5 }}>core tracking is free forever. unlock voice, photo, restaurant &amp; more with Plus.</div>
            <button
              onClick={openPremiumModal}
              style={{ marginTop: 18, height: 50, padding: '0 26px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', display: 'inline-flex', alignItems: 'center', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)' }}
            >explore Plato Plus</button>
            <button
              onClick={() => startCheckout('annual')}
              disabled={busy === 'checkout'}
              style={{ marginTop: 4, background: 'none', border: 'none', color: 'var(--sage)', font: '600 12px var(--font-ui)', cursor: busy === 'checkout' ? 'default' : 'pointer', opacity: busy === 'checkout' ? .6 : 1, textDecoration: 'underline', textUnderlineOffset: 3 }}
            >or start annual — $59.99/yr</button>
          </div>
        )}

        {/* active / trial / canceled — manage subscription */}
        {phase === 'ready' && !view.isFree && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* plan status card */}
            <div style={{ ...cardStyle, borderRadius: 22, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(140deg,#43C6AC,#0F9482)', color: '#04231C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={15} strokeWidth={2} />
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>Plato Plus</span>
                  </div>
                  <div style={{ marginTop: 6, font: '500 13px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>{planPrice}</div>
                </div>
                <span style={{ padding: '5px 11px', borderRadius: 999, background: chip.bg, color: chip.color, font: '600 11px var(--font-ui)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{chip.label}</span>
              </div>
              <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 9, font: '500 13px var(--font-ui)', color: 'var(--ink)' }}>
                <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Clock size={16} /></span>
                {renewalText}
              </div>
            </div>

            {/* payment method */}
            <div style={{ ...cardStyle, borderRadius: 20, padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 13 }}>
              <span style={{ width: 40, height: 28, borderRadius: 7, background: 'var(--surface-3)', border: '1px solid var(--glass-border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sage)' }}>
                <CreditCard size={16} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={rowLabel}>payment method</div>
                <div style={rowSub}>{view.isTrial ? 'no card on file yet' : 'managed securely by Stripe'}</div>
              </div>
              <button
                onClick={() => openPortal('payment', 'opening billing portal…')}
                disabled={busy === 'payment'}
                style={{ padding: '8px 13px', borderRadius: 11, border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)', font: '600 12px var(--font-ui)', cursor: busy === 'payment' ? 'default' : 'pointer', opacity: busy === 'payment' ? .6 : 1 }}
              >update</button>
            </div>

            {/* manage rows */}
            <div>
              <div style={sectionLabel}>manage</div>
              <div style={{ ...cardStyle, borderRadius: 20, overflow: 'hidden' }}>
                <button
                  onClick={() => openPortal('plan', 'opening billing portal…')}
                  disabled={busy === 'plan'}
                  style={{ ...listBtn, borderBottom: '1px solid var(--hairline)', opacity: busy === 'plan' ? .6 : 1 }}
                >
                  <span style={rowLabel}>change plan</span>
                  {chevron}
                </button>
                <button
                  onClick={() => openPortal('method', 'opening billing portal…')}
                  disabled={busy === 'method'}
                  style={{ ...listBtn, borderBottom: '1px solid var(--hairline)', opacity: busy === 'method' ? .6 : 1 }}
                >
                  <span style={rowLabel}>update payment method</span>
                  {chevron}
                </button>
                <button
                  onClick={() => openPortal('history', 'opening billing history…')}
                  disabled={busy === 'history'}
                  style={{ ...listBtn, opacity: busy === 'history' ? .6 : 1 }}
                >
                  <span style={rowLabel}>billing history</span>
                  {chevron}
                </button>
              </div>
            </div>

            {/* resume / cancel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 2 }}>
              {view.isCanceled ? (
                <button
                  onClick={() => openPortal('resume', 'resuming subscription…')}
                  disabled={busy === 'resume'}
                  style={{ ...primaryBtn, opacity: busy === 'resume' ? .6 : 1 }}
                >resume subscription</button>
              ) : (
                <button
                  onClick={() => openPortal('cancel', 'opening cancel flow…')}
                  disabled={busy === 'cancel'}
                  style={{ width: '100%', height: 50, borderRadius: 14, border: '1px solid rgba(225,97,108,.4)', background: 'transparent', color: 'var(--danger)', font: '600 14px var(--font-ui)', cursor: busy === 'cancel' ? 'default' : 'pointer', opacity: busy === 'cancel' ? .6 : 1 }}
                >cancel subscription</button>
              )}
            </div>

          </div>
        )}
      </div>

      {/* toast */}
      {toast && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 'calc(var(--nav-safe-pad, 26px) + 8px)', zIndex: 9, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '12px 17px', borderRadius: 14, background: 'var(--glass-fill)', border: '1px solid var(--divider-strong)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 18px 40px -18px rgba(0,0,0,.9)' }}>
            <span style={{ color: 'var(--brand-jade)', display: 'inline-flex' }}><Check size={15} strokeWidth={2.6} /></span>
            <span style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
