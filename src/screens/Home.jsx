import React, { useEffect, useMemo, useState } from 'react';
import { Sun, Moon, Search, Mic, Camera, Barcode, Zap, Plus, Check, ChevronRight, Flame, Droplet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';

const RING_C = 578.05; // 2π·92

function greetingFor(name) {
  const h = new Date().getHours();
  const part = h < 12 ? 'good morning' : h < 18 ? 'good afternoon' : 'good evening';
  return name ? `${part}, ${name.split(' ')[0].toLowerCase()}` : part;
}
function dateLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase().replace(',', ' ·');
}
function trialLabel(premium) {
  if (premium?.status === 'active') return 'plus';
  if (premium?.status === 'trial' && premium.trialExpiresAt) {
    const ms = new Date(premium.trialExpiresAt).getTime() - Date.now();
    if (ms > 0) return `trial · ${Math.max(1, Math.round(ms / 3600000))}h`;
  }
  return 'free';
}

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = { font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)' };

export function Home({ onFab }) {
  const {
    userProfile, premium, dark, setTheme,
    streak, plan, dailyLog, logMeal, logHistory,
    waterCups, waterGoalCups, addWater, setActiveTab,
  } = useApp();
  const { current, targets } = useMacros();
  const [armed, setArmed] = useState(false);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => { const id = requestAnimationFrame(() => setArmed(true)); return () => cancelAnimationFrame(id); }, []);
  useEffect(() => {
    const up = () => setOnline(true), down = () => setOnline(false);
    window.addEventListener('online', up); window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  const cals = current.calories || 0;
  const calTarget = targets.calories || 2000;
  const over = cals > calTarget;
  const calPct = Math.min(100, calTarget > 0 ? (cals / calTarget) * 100 : 0);
  const left = Math.max(0, calTarget - cals);
  const ringOffset = armed ? RING_C * (1 - calPct / 100) : RING_C;
  const fillNow = armed ? calPct : 0;

  const macros = [
    { label: 'protein', cur: current.protein || 0, target: targets.protein || 0, grad: 'var(--macro-protein-grad)' },
    { label: 'carbs', cur: current.carbs || 0, target: targets.carbs || 0, grad: 'var(--macro-carbs-grad)' },
    { label: 'fat', cur: current.fat || 0, target: targets.fat || 0, grad: 'var(--macro-fat-grad)' },
  ].map(m => {
    const pct = m.target > 0 ? Math.min(100, (m.cur / m.target) * 100) : 0;
    return { ...m, pct: armed ? pct : 0, over: m.cur > m.target && m.target > 0 };
  });

  const todayMeals = useMemo(() => {
    if (!plan?.meals?.length) return [];
    const per = plan.mealsPerDay || 3;
    const dayIndex = plan.createdAt ? Math.floor((Date.now() - new Date(plan.createdAt).getTime()) / 86400000) % 7 : 0;
    return plan.meals.slice(dayIndex * per, dayIndex * per + per);
  }, [plan]);
  const isLogged = (name) => (dailyLog?.meals || []).some(m => (m.name || '').toLowerCase() === (name || '').toLowerCase());

  const loggedMealCount = (dailyLog?.meals || []).length;
  const isEmptyDay = loggedMealCount === 0 && cals === 0;

  // --- Insights: real protein-hit streak + calorie sparkline from log history ---
  const { insightText, spark, sparkColor, lowData } = useMemo(() => {
    const history = (logHistory || []).filter(l => l?.date).slice(-7);
    const proteinTarget = targets.protein || 0;
    let proteinRun = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (proteinTarget > 0 && (history[i].totalProtein || 0) >= proteinTarget) proteinRun++;
      else break;
    }
    if (proteinTarget > 0 && (current.protein || 0) >= proteinTarget) proteinRun++;

    const cals7 = [...history.map(l => l.totalCalories || l.calories || 0), cals];
    const recent = cals7.slice(-7);
    const enough = history.length >= 2;
    const max = Math.max(...recent, 1);
    const bars = recent.length
      ? recent.map(c => Math.max(6, Math.round((c / max) * 24) + 6))
      : [6, 6, 6, 6, 6, 6, 6];
    if (!enough) {
      return {
        insightText: "log a few more days and we'll spot your patterns.",
        spark: [6, 6, 6, 6, 6, 6, 6], sparkColor: 'var(--hairline)', lowData: true,
      };
    }
    return {
      insightText: proteinRun >= 2
        ? `you hit protein ${proteinRun} days running.`
        : over
          ? `you're ${(cals - calTarget).toLocaleString()} over today — heavier than planned.`
          : `${left.toLocaleString()} calories left to hit your target.`,
      spark: bars, sparkColor: 'var(--macro-protein)', lowData: false,
    };
  }, [logHistory, targets.protein, current.protein, cals, calTarget, over, left]);

  const showCoach = isEmptyDay && !!plan?.meals?.length;
  const coachText = 'tap + log on your first meal to fill your orb';

  const orbFill = over
    ? 'linear-gradient(180deg, #E7B67C, #E1616C 78%)'
    : 'linear-gradient(180deg, rgba(140,224,206,.95), #43C6AC 42%, #0F9482)';
  const orbGlow = over ? '0 0 60px -14px rgba(225,97,108,.5)' : '0 0 60px -14px rgba(67,198,172,.55)';

  const openLog = () => (onFab ? onFab() : setActiveTab('log'));

  return (
    <>
      {/* status bar */}
      <div style={{ height: 44, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 26px 0', position: 'relative', zIndex: 2 }}>
        <span style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>9:41</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--ink)' }}>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" /><rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" /><rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor" /><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" opacity=".4" /></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 4a11 11 0 0 1 14 0" /><path d="M3.6 6.6a7 7 0 0 1 8.8 0" /><path d="M6.2 9.1a3 3 0 0 1 3.6 0" /></svg>
          <svg width="25" height="14" viewBox="0 0 25 14" fill="none"><rect x="1" y="2" width="19" height="10" rx="2.6" stroke="currentColor" strokeWidth="1.3" opacity=".5" /><rect x="3" y="4" width="13" height="6" rx="1.2" fill="currentColor" /><rect x="21.5" y="5" width="2" height="4" rx="1" fill="currentColor" /></svg>
        </span>
      </div>
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '6px 20px 12px', position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            width: 40, height: 40, flex: 'none', borderRadius: 'var(--r-avatar)', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(140deg,#43C6AC,#0F9482)', color: '#04231C',
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25)',
          }}
        >{(userProfile?.name || 'P').trim().charAt(0).toUpperCase()}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-.01em', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {greetingFor(userProfile?.name)}
          </div>
          <div style={{ marginTop: 1, font: '500 11px var(--font-ui)', color: 'var(--muted)', textTransform: 'lowercase' }}>{dateLabel()}</div>
        </div>
        <div style={{ padding: '6px 11px', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', color: 'var(--sage)', font: '600 11px var(--font-ui)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {trialLabel(premium)}
        </div>
        <button
          onClick={() => setTheme(dark ? 'light' : 'dark')}
          aria-label="Toggle theme"
          style={{ width: 36, height: 36, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >{dark ? <Moon size={18} /> : <Sun size={18} />}</button>
      </div>

      {/* scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', zIndex: 1 }}>

        {/* Offline banner */}
        {!online && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderLeft: '3px solid var(--info)' }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--info)', flex: 'none', boxShadow: '0 0 8px var(--info)' }} />
            <span style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>you're offline — changes save on this device and sync later</span>
          </div>
        )}

        {/* Orb hero */}
        <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: '22px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 208, height: 208 }}>
            <svg width="208" height="208" viewBox="0 0 208 208" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="orbring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={over ? '#E7B67C' : '#0F9482'} />
                  <stop offset=".5" stopColor={over ? '#E1616C' : '#43C6AC'} />
                  <stop offset="1" stopColor={over ? '#E1616C' : '#8CE0CE'} />
                </linearGradient>
              </defs>
              <circle cx="104" cy="104" r="92" fill="none" stroke="var(--hairline)" strokeWidth="9" />
              <circle cx="104" cy="104" r="92" fill="none" stroke="url(#orbring)" strokeWidth="9" strokeLinecap="round"
                strokeDasharray={RING_C} style={{ strokeDashoffset: ringOffset, transition: 'stroke-dashoffset .95s var(--ease-out)' }} />
            </svg>
            <div style={{ position: 'absolute', top: 20, left: 20, width: 168, height: 168, borderRadius: '50%', overflow: 'hidden', background: 'var(--orb-shell)', boxShadow: `inset 0 2px 8px rgba(255,255,255,.05), ${orbGlow}`, animation: 'vd-breathe 6s ease-in-out infinite' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${fillNow}%`, background: orbFill, transition: 'height .95s var(--ease-out)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 30% 32%, rgba(140,224,206,.35), transparent 60%), radial-gradient(35% 28% at 70% 66%, rgba(95,212,196,.30), transparent 62%)', mixBlendMode: 'screen', animation: 'vd-caustic 8s ease-in-out infinite' }} />
              <div style={{ position: 'absolute', top: '13%', left: '18%', width: 46, height: 30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.22), transparent 70%)', filter: 'blur(2px)' }} />
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--orb-scrim)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2, font: '600 10px/1 var(--font-ui)', letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--orb-label)', textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>energy</div>
              <div style={{ position: 'relative', zIndex: 2, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, lineHeight: 1, letterSpacing: '-.03em', fontVariantNumeric: 'tabular-nums', color: 'var(--orb-text)', textShadow: '0 1px 3px rgba(0,0,0,.62), 0 0 18px rgba(0,0,0,.55)' }}>{cals.toLocaleString()}</div>
              <div style={{ position: 'relative', zIndex: 2, font: '500 13px var(--font-ui)', color: over ? '#FFD2D6' : 'var(--orb-sub)', fontVariantNumeric: 'tabular-nums', textShadow: '0 1px 3px rgba(0,0,0,.55)' }}>
                {over ? `${(cals - calTarget).toLocaleString()} over` : `of ${calTarget.toLocaleString()} · ${left.toLocaleString()} left`}
              </div>
            </div>
          </div>
        </div>

        {/* Macro cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {macros.map(m => (
            <div key={m.label} style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: '12px 12px 14px', minWidth: 0 }}>
              <div style={microLabel}>{m.label}</div>
              <div style={{ marginTop: 7, display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums', color: m.over ? 'var(--danger)' : 'var(--ink)' }}>{Math.round(m.cur)}</span>
                <span style={{ font: '400 12px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>/{Math.round(m.target)} g</span>
              </div>
              <div style={{ marginTop: 11, position: 'relative', height: 7, borderRadius: 999, background: 'var(--hairline)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${m.pct}%`, background: m.grad, borderRadius: 999, transition: 'width .9s var(--ease-out)' }} />
                {m.over && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '16%', background: 'var(--danger)', borderRadius: 999 }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Streak + Water */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: 14 }}>
            <div style={microLabel}>streak</div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ color: 'var(--primary)', display: 'inline-flex', alignSelf: 'center' }}><Flame size={18} /></span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-.02em', color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{streak || 0}</span>
              <span style={{ font: '400 13px var(--font-ui)', color: 'var(--sage)' }}>days</span>
            </div>
            <div style={{ marginTop: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const on = i < Math.min(7, streak || 0);
                const today = i === 6;
                return <div key={i} style={{ width: 9, height: 9, borderRadius: 999, flex: 'none', background: on ? 'var(--brand-jade)' : today ? 'transparent' : 'var(--hairline)', border: today && !on ? '1.5px solid var(--brand-jade)' : 'none', boxShadow: today && on ? '0 0 0 3px rgba(67,198,172,.20)' : 'none' }} />;
              })}
            </div>
            <div style={{ marginTop: 11, font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>{(streak || 0) > 1 ? `${streak} days · keep it going` : (streak || 0) === 1 ? 'day 1 · welcome' : 'log to start a streak'}</div>
          </div>

          <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={microLabel}>water</div>
              <button onClick={() => addWater(1)} aria-label="Add water" style={{ width: 26, height: 26, borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--surface-3)', color: 'var(--info)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} strokeWidth={2.4} /></button>
            </div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ color: 'var(--info)', display: 'inline-flex', alignSelf: 'center' }}><Droplet size={17} /></span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-.02em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{waterCups}</span>
              <span style={{ font: '400 13px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>/ {waterGoalCups} cups</span>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 5 }}>
              {Array.from({ length: waterGoalCups }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: 9, borderRadius: 999, background: i < waterCups ? 'var(--info)' : 'var(--hairline)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick log chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 0' }} className="no-scrollbar">
          {[
            { label: 'search', Icon: Search }, { label: 'voice', Icon: Mic, lock: true },
            { label: 'photo', Icon: Camera, lock: true }, { label: 'scan', Icon: Barcode }, { label: 'quick add', Icon: Zap },
          ].map(c => (
            <button key={c.label} onClick={openLog} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: 'none', height: 44, padding: '0 15px', borderRadius: 999, background: 'var(--glass-fill)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', color: 'var(--ink)', font: '500 13px var(--font-ui)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><c.Icon size={18} /></span>{c.label}
              {c.lock && <span style={{ color: 'var(--warning)', display: 'inline-flex', marginLeft: 1 }}><LockGlyph /></span>}
            </button>
          ))}
        </div>

        {/* Today's plan */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-.01em', color: 'var(--ink)' }}>today's plan</div>
            <button onClick={() => setActiveTab('meals')} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--primary)', font: '600 13px var(--font-ui)', background: 'none', border: 'none', cursor: 'pointer' }}>edit <ChevronRight size={15} /></button>
          </div>
          {showCoach && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '10px 0 2px', padding: '10px 12px', borderRadius: 14, background: 'rgba(67,198,172,.08)', border: '1px solid rgba(67,198,172,.16)' }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: 'radial-gradient(circle,#8CE0CE,#43C6AC)', boxShadow: '0 0 10px rgba(67,198,172,.5)', flex: 'none' }} />
              <span style={{ font: '500 13px var(--font-ui)', color: 'var(--ink)' }}>{coachText}</span>
            </div>
          )}
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayMeals.length === 0 && (
              <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ font: '500 13px var(--font-ui)', color: 'var(--sage)' }}>no plan yet — generate one in plans</div>
              </div>
            )}
            {todayMeals.map((m, i) => {
              const logged = isLogged(m.name);
              const tints = ['#5FD4C4', '#43C6AC', '#E1A0AB', '#E7B67C'];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, ...cardStyle, borderRadius: 'var(--r-card)', padding: '11px 12px', opacity: logged ? 0.58 : 1, transition: 'opacity .3s var(--ease-out)' }}>
                  <div style={{ width: 46, height: 46, flex: 'none', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(150deg,${tints[i % 4]},var(--brand-forest))`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14)', color: 'rgba(255,255,255,.9)' }}>
                    <Zap size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={microLabel}>{m.type || m.slot || 'meal'}</div>
                    <div style={{ marginTop: 2, font: '600 15px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(m.name || 'meal').toLowerCase()}</div>
                    <div style={{ marginTop: 2, font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(m.calories || 0)} kcal · {Math.round(m.protein || 0)}p {Math.round(m.carbs || 0)}c {Math.round(m.fat || 0)}f</div>
                  </div>
                  {logged ? (
                    <div style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand-jade)', font: '600 13px var(--font-ui)' }}>
                      <span style={{ width: 20, height: 20, borderRadius: 999, background: 'rgba(67,198,172,.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} strokeWidth={2.6} /></span>logged
                    </div>
                  ) : (
                    <button onClick={() => logMeal(m)} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: 'var(--on-accent)', font: '600 13px var(--font-ui)', padding: '8px 13px', borderRadius: 999 }}>
                      <Plus size={15} strokeWidth={2.3} />log
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: '15px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <div style={microLabel}>insights</div>
            <button onClick={() => setActiveTab('insights')} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: 'var(--primary)', font: '600 13px var(--font-ui)', background: 'none', border: 'none', cursor: 'pointer' }}>see all <ChevronRight size={15} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1, font: '500 15px var(--font-ui)', color: 'var(--ink)', lineHeight: 1.4 }}>{insightText}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 30 }}>
              {spark.map((h, i) => (
                <div key={i} style={{ width: 5, height: h, borderRadius: 3, background: lowData ? 'var(--hairline)' : sparkColor }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LockGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
