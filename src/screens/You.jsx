import React, { useMemo } from 'react';
import {
  Settings, ChevronRight, User, Flame, Scale, TrendingUp,
  Award, CreditCard, HelpCircle, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = {
  font: '600 10px var(--font-ui)', letterSpacing: '.14em',
  textTransform: 'uppercase', color: 'var(--sage)',
};
const groupLabel = { ...microLabel, letterSpacing: '.16em', padding: '6px 4px 8px' };

function goalLabel(goal) {
  const map = { lose: 'lose weight', maintain: 'maintain', gain: 'gain muscle', recomp: 'recomp' };
  return map[goal] || (goal ? String(goal).toLowerCase() : 'maintain');
}

function trialLabel(premium, active) {
  if (active && premium?.status === 'active') return 'plus';
  if (premium?.status === 'trial' && premium.trialExpiresAt) {
    const ms = new Date(premium.trialExpiresAt).getTime() - Date.now();
    if (ms > 0) return `trial · ${Math.max(1, Math.round(ms / 3600000))}h`;
  }
  return 'free';
}

// Small chevron used on list rows
function Chevron() {
  return <span style={{ color: 'var(--muted)', display: 'inline-flex', flex: 'none' }}><ChevronRight size={18} /></span>;
}

// A grouped list row
function Row({ icon, iconBg, iconColor, label, trailing, onClick, last }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 13,
        padding: '14px 15px', background: 'none', border: 'none',
        borderBottom: last ? 'none' : '1px solid var(--hairline)',
        cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span style={{
        width: 36, height: 36, flex: 'none', borderRadius: 11, background: iconBg,
        color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</span>
      <span style={{ flex: 1, font: '600 15px var(--font-ui)', color: 'var(--ink)' }}>{label}</span>
      {trailing}
      <Chevron />
    </button>
  );
}

export function You({ onFab }) {
  const {
    userProfile, premium, isPremiumActive,
    streak, weightEntries, planConfig,
    isLoggedIn, setAuthModalOpen, logout,
    setActiveTab, openPremiumModal,
  } = useApp();
  const { targets, current, progress } = useMacros();

  // onFab is provided by the shell for the center action button; nav here uses setActiveTab.
  void onFab;

  const premiumActive = typeof isPremiumActive === 'function' ? isPremiumActive() : false;

  const name = (userProfile?.name || '').trim();
  const initial = (name || 'P').charAt(0).toUpperCase();

  // Current weight: userProfile.weight, else last weightEntries entry
  const lastEntry = weightEntries && weightEntries.length ? weightEntries[weightEntries.length - 1] : null;
  const currentWeight = Number(userProfile?.weight) || (lastEntry ? Number(lastEntry.weight) : 0);

  // Weight change this "month" — compare to the oldest entry within ~30 days
  const weightDelta = useMemo(() => {
    if (!weightEntries || weightEntries.length < 2) return null;
    const cutoff = Date.now() - 30 * 86400000;
    const recent = weightEntries.filter((e) => new Date(e.date).getTime() >= cutoff);
    const first = recent.length ? recent[0] : weightEntries[0];
    const last = weightEntries[weightEntries.length - 1];
    const d = Number(last.weight) - Number(first.weight);
    if (!isFinite(d) || d === 0) return null;
    return d;
  }, [weightEntries]);

  // Plan adherence ≈ calorie progress (0..1 → %)
  const adherence = Math.round(Math.min(1, progress?.calories || 0) * 100);
  const calTarget = targets?.calories || 2000;
  const goal = goalLabel(planConfig?.goal || userProfile?.goal);
  const billing = trialLabel(premium, premiumActive);

  const openSettings = () => setActiveTab('settings');
  const openWeight = () => setActiveTab('weight');
  const openInsights = () => setActiveTab('insights');
  // Achievements has no dedicated tab yet — fall back to settings for now.
  const openAchievements = () => setActiveTab('settings');
  // Billing has no dedicated tab yet — open the premium modal, else settings fallback.
  const openBilling = () => (openPremiumModal ? openPremiumModal() : setActiveTab('settings'));

  // Weight sparkline points from real entries (last up to 12)
  const spark = useMemo(() => {
    const pts = (weightEntries || []).slice(-12).map((e) => Number(e.weight)).filter((n) => isFinite(n));
    if (pts.length < 2) return null;
    const min = Math.min(...pts), max = Math.max(...pts);
    const span = max - min || 1;
    const W = 300, H = 44, PAD = 8;
    const step = pts.length > 1 ? W / (pts.length - 1) : W;
    const coords = pts.map((v, i) => {
      const x = Math.round(i * step);
      const y = Math.round(PAD + (1 - (v - min) / span) * (H - PAD));
      return [x, y];
    });
    const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
    const area = `${line} L${coords[coords.length - 1][0]},70 L${coords[0][0]},70 Z`;
    return { line, area, last: coords[coords.length - 1] };
  }, [weightEntries]);

  return (
    <>
      {/* status bar spacer */}
      <div style={{ height: 12 }} />

      {/* top bar: title + settings */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 22px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: 'var(--ink)' }}>you</div>
        <button
          onClick={openSettings}
          aria-label="Settings"
          style={{ width: 38, height: 38, borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        ><Settings size={18} /></button>
      </div>

      {/* scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>

        {/* IDENTITY */}
        {isLoggedIn ? (
          <button
            onClick={openSettings}
            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, ...cardStyle, borderRadius: 'var(--r-card)', padding: 16, cursor: 'pointer' }}
          >
            <div style={{ width: 58, height: 58, flex: 'none', borderRadius: 15, background: 'linear-gradient(140deg,#43C6AC,#0F9482)', color: '#04231C', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25)' }}>{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-.01em', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name || 'your profile'}</div>
              <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(67,198,172,.14)', color: 'var(--primary)', font: '600 11px var(--font-ui)' }}>{goal}</span>
                {premiumActive && (
                  <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(174,166,234,.16)', color: 'var(--accent-violet)', font: '600 11px var(--font-ui)' }}>plus</span>
                )}
                <span style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>{calTarget.toLocaleString()} kcal/day</span>
              </div>
            </div>
            <Chevron />
          </button>
        ) : (
          <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: 18, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto', borderRadius: 15, background: 'var(--surface-3)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={28} /></div>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-.01em', color: 'var(--ink)' }}>you're browsing as a guest</div>
            <div style={{ marginTop: 5, font: '400 13px var(--font-ui)', color: 'var(--sage)', lineHeight: 1.5 }}>create a free account to sync your plan, streak, and logs across devices.</div>
            <button
              onClick={() => setAuthModalOpen(true)}
              style={{ marginTop: 14, width: '100%', height: 48, border: 'none', borderRadius: 14, background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', cursor: 'pointer', boxShadow: '0 12px 30px -16px rgba(67,198,172,.7)' }}
            >create account</button>
            <button
              onClick={() => setAuthModalOpen(true)}
              style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--sage)', font: '600 13px var(--font-ui)', cursor: 'pointer' }}
            >i already have an account</button>
          </div>
        )}

        {/* STAT STRIP */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: 13 }}>
            <div style={microLabel}>weight</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{currentWeight ? Math.round(currentWeight) : '—'}</span>
              {currentWeight ? <span style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>lb</span> : null}
            </div>
            <div style={{ marginTop: 4, font: '600 11px var(--font-ui)', fontVariantNumeric: 'tabular-nums', color: weightDelta == null ? 'var(--sage)' : weightDelta < 0 ? 'var(--success)' : 'var(--warning)' }}>
              {weightDelta == null ? 'log to track' : `${weightDelta < 0 ? '−' : '+'}${Math.abs(Math.round(weightDelta))} this mo`}
            </div>
          </div>

          <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: 13 }}>
            <div style={microLabel}>streak</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ color: 'var(--primary)', display: 'inline-flex', alignSelf: 'center' }}><Flame size={15} /></span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{streak || 0}</span>
            </div>
            <div style={{ marginTop: 4, font: '600 11px var(--font-ui)', color: 'var(--sage)' }}>day streak</div>
          </div>

          <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: 13 }}>
            <div style={microLabel}>adherence</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{adherence}</span>
              <span style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>%</span>
            </div>
            <div style={{ marginTop: 4, font: '600 11px var(--font-ui)', color: adherence >= 100 ? 'var(--warning)' : 'var(--success)' }}>{current?.calories ? 'of plan' : 'log today'}</div>
          </div>
        </div>

        {/* WEIGHT TREND tile */}
        <button
          onClick={openWeight}
          style={{ width: '100%', textAlign: 'left', ...cardStyle, borderRadius: 'var(--r-card)', padding: 16, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={microLabel}>weight trend</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-.03em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{currentWeight ? Math.round(currentWeight) : '—'}</span>
                {currentWeight ? <span style={{ font: '500 13px var(--font-ui)', color: 'var(--sage)' }}>lb</span> : null}
                {weightDelta != null && (
                  <span style={{ font: '600 12px var(--font-ui)', color: weightDelta < 0 ? 'var(--success)' : 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>{weightDelta < 0 ? '↓' : '↑'} {Math.abs(Math.round(weightDelta))} this mo</span>
                )}
              </div>
            </div>
            <Chevron />
          </div>

          {spark ? (
            <>
              <svg viewBox="0 0 300 70" preserveAspectRatio="none" style={{ marginTop: 12, width: '100%', height: 64, display: 'block', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="you-wfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#43C6AC" stopOpacity=".28" />
                    <stop offset="1" stopColor="#43C6AC" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={spark.area} fill="url(#you-wfill)" />
                <path d={spark.line} fill="none" stroke="#43C6AC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={spark.last[0]} cy={spark.last[1]} r="4" fill="#43C6AC" />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>trend</span>
                <span style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{(weightEntries || []).slice(-12).length} entries</span>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 14, font: '500 13px var(--font-ui)', color: 'var(--sage)' }}>log a few weigh-ins to see your trend</div>
          )}
        </button>

        {/* PROGRESS group */}
        <div>
          <div style={groupLabel}>progress</div>
          <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', overflow: 'hidden' }}>
            <Row
              icon={<Scale size={19} />}
              iconBg="rgba(67,198,172,.14)"
              iconColor="var(--brand-jade)"
              label="weight"
              onClick={openWeight}
              trailing={<span style={{ font: '500 12px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{currentWeight ? `${Math.round(currentWeight)} lb` : 'log'}</span>}
            />
            <Row
              icon={<TrendingUp size={19} />}
              iconBg="rgba(95,212,196,.14)"
              iconColor="var(--info)"
              label="insights"
              onClick={openInsights}
              trailing={<span style={{ font: '500 12px var(--font-ui)', color: 'var(--muted)' }}>this week</span>}
            />
            <Row
              icon={<Award size={19} />}
              iconBg="rgba(231,182,124,.14)"
              iconColor="var(--warning)"
              label="achievements"
              onClick={openAchievements}
              trailing={<span style={{ font: '500 12px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{streak || 0} streak</span>}
              last
            />
          </div>
        </div>

        {/* ACCOUNT group */}
        <div>
          <div style={groupLabel}>account</div>
          <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', overflow: 'hidden' }}>
            <Row
              icon={<CreditCard size={19} />}
              iconBg="rgba(174,166,234,.16)"
              iconColor="var(--accent-violet)"
              label="billing & subscription"
              onClick={openBilling}
              trailing={
                <span style={{
                  padding: '4px 9px', borderRadius: 999,
                  background: billing === 'plus' ? 'rgba(174,166,234,.16)' : billing.startsWith('trial') ? 'rgba(231,182,124,.15)' : 'var(--surface-3)',
                  color: billing === 'plus' ? 'var(--accent-violet)' : billing.startsWith('trial') ? 'var(--warning)' : 'var(--sage)',
                  font: '600 11px var(--font-ui)', fontVariantNumeric: 'tabular-nums',
                }}>{billing}</span>
              }
              last
            />
          </div>
        </div>

        {/* APP group */}
        <div>
          <div style={groupLabel}>app</div>
          <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', overflow: 'hidden' }}>
            <Row
              icon={<Settings size={18} />}
              iconBg="var(--surface-3)"
              iconColor="var(--sage)"
              label="settings"
              onClick={openSettings}
            />
            <Row
              icon={<HelpCircle size={19} />}
              iconBg="rgba(95,212,196,.14)"
              iconColor="var(--info)"
              label="help & support"
              onClick={openSettings}
              last
            />
          </div>
        </div>

        {/* SIGN OUT */}
        {isLoggedIn && (
          <button
            onClick={logout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15, marginTop: 2, background: 'none', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-control)', color: 'var(--danger)', font: '600 14px var(--font-ui)', cursor: 'pointer' }}
          ><LogOut size={17} />sign out</button>
        )}

        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, padding: '2px 0 6px' }}>
          <img
            src="/plato-logo.png"
            alt="Plato"
            width="52"
            height="52"
            style={{ display: 'block', width: 52, height: 52, borderRadius: 15, boxShadow: '0 12px 24px -14px rgba(0,0,0,.6),0 0 16px -8px rgba(67,198,172,.4)' }}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, letterSpacing: '-.02em', color: 'var(--ink)' }}>Plato</div>
          <div style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>version 2.0 · made with care</div>
        </div>
      </div>
    </>
  );
}
