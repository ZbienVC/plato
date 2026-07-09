import React, { useMemo, useState } from 'react';
import { TrendingUp, Lock, Flame, Clock, BarChart3, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = { font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sage)' };

const PERIODS = [
  { key: 'week', label: 'week', locked: false, days: 7 },
  { key: 'month', label: 'month', locked: false, days: 30 },
  { key: 'quarter', label: 'quarter', locked: true, days: 90 },
  { key: 'year', label: 'year', locked: true, days: 365 },
];

const DAY_LABELS = ['s', 'm', 't', 'w', 't', 'f', 's'];

function periodTabStyle(active, locked) {
  return {
    flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
    font: '600 13px var(--font-ui)', transition: 'all .16s var(--ease-out)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
    color: active ? 'var(--on-accent)' : locked ? 'var(--muted)' : 'var(--sage)',
    background: active ? 'var(--primary)' : 'transparent',
  };
}

function dayKey(offsetFromToday) {
  const d = new Date();
  d.setDate(d.getDate() - offsetFromToday);
  return d.toISOString().split('T')[0];
}

// Build a fast lookup of logHistory (+ live dailyLog) keyed by date.
function buildDayMap(logHistory, dailyLog) {
  const map = new Map();
  (logHistory || []).forEach(l => { if (l?.date) map.set(l.date, l); });
  if (dailyLog?.date) map.set(dailyLog.date, dailyLog); // freshest wins
  return map;
}

export function Insights({ onFab }) {
  const { logHistory, dailyLog, openPremiumModal } = useApp();
  const { current, targets } = useMacros();

  const [period, setPeriod] = useState('week');
  const activePeriod = PERIODS.find(p => p.key === period) || PERIODS[0];
  const days = activePeriod.days;

  const dayMap = useMemo(() => buildDayMap(logHistory, dailyLog), [logHistory, dailyLog]);

  // Ordered oldest -> newest across the series.
  const series = useMemo(() => {
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const key = dayKey(i);
      const log = dayMap.get(key) || null;
      const cals = log?.totalCalories || 0;
      arr.push({ key, log, logged: !!log && cals > 0, calories: cals, protein: log?.totalProtein || 0 });
    }
    return arr;
  }, [dayMap, days]);

  const loggedDays = series.filter(d => d.logged);
  const loggedCount = loggedDays.length;

  // Empty state — not enough data to surface anything meaningful.
  const empty = loggedCount < 2;

  // Averages across logged days only.
  const avgCal = loggedCount ? Math.round(loggedDays.reduce((s, d) => s + d.calories, 0) / loggedCount) : 0;
  const calTarget = targets.calories || 2000;

  // Macro balance donut from CURRENT macros (today's live intake).
  const macroCals = {
    protein: (current.protein || 0) * 4,
    carbs: (current.carbs || 0) * 4,
    fat: (current.fat || 0) * 9,
  };
  const macroTotal = macroCals.protein + macroCals.carbs + macroCals.fat;
  const pctProtein = macroTotal > 0 ? Math.round((macroCals.protein / macroTotal) * 100) : 0;
  const pctCarbs = macroTotal > 0 ? Math.round((macroCals.carbs / macroTotal) * 100) : 0;
  const pctFat = macroTotal > 0 ? Math.max(0, 100 - pctProtein - pctCarbs) : 0;
  const donutBg = macroTotal > 0
    ? `conic-gradient(var(--macro-protein) 0% ${pctProtein}%, var(--macro-carbs) ${pctProtein}% ${pctProtein + pctCarbs}%, var(--macro-fat) ${pctProtein + pctCarbs}% 100%)`
    : 'var(--hairline)';

  // Headline derived from adherence.
  const onTargetDays = loggedDays.filter(d => d.calories <= calTarget * 1.1).length;
  const headline = loggedCount
    ? (onTargetDays >= Math.ceil(loggedCount * 0.7)
        ? `you stayed near your calorie target ${onTargetDays} of ${loggedCount} logged days.`
        : `you logged ${loggedCount} ${loggedCount === 1 ? 'day' : 'days'} this ${activePeriod.label} — keep it steady to spot patterns.`)
    : '';

  // Best streak of consecutive logged days within the series.
  const bestStreak = useMemo(() => {
    let best = 0, run = 0;
    series.forEach(d => { if (d.logged) { run += 1; best = Math.max(best, run); } else run = 0; });
    return best;
  }, [series]);

  const openUpsell = () => openPremiumModal && openPremiumModal();

  return (
    <>
      <div style={{ height: 12 }} />

      {/* Top bar */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 10px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: 'var(--ink)' }}>insights</div>
        <div style={{ font: '600 11px var(--font-ui)', color: 'var(--sage)', textTransform: 'lowercase' }}>this {activePeriod.label}</div>
      </div>

      {/* Period segmented control */}
      <div style={{ flex: 'none', padding: '0 20px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 13, padding: 4, gap: 3 }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => (p.locked ? openUpsell() : setPeriod(p.key))}
              style={periodTabStyle(period === p.key, p.locked)}
            >
              {p.label}
              {p.locked && <span style={{ display: 'inline-flex', color: 'var(--warning)' }}><Lock size={11} strokeWidth={2.4} /></span>}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {empty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '56px 24px', gap: 6, minHeight: 440 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(95,212,196,.32), rgba(15,148,130,.1) 60%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={40} color="var(--info)" strokeWidth={1.6} />
            </div>
            <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', color: 'var(--ink)' }}>your insights are brewing</div>
            <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 250, lineHeight: 1.5 }}>
              log a few more days and we'll surface your trends, adherence, and patterns here.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Headline summary tile */}
            <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: '16px 18px', borderLeft: '3px solid var(--macro-protein)' }}>
              <div style={microLabel}>this {activePeriod.label}</div>
              <div style={{ marginTop: 7, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.35, letterSpacing: '-.01em', color: 'var(--ink)' }}>{headline}</div>
            </div>

            {/* Macro balance donut (from current macros) */}
            <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: 18 }}>
              <div style={{ ...microLabel, marginBottom: 14 }}>macro balance</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ position: 'relative', width: 118, height: 118, flex: 'none' }}>
                  <div style={{ width: 118, height: 118, borderRadius: '50%', background: donutBg, WebkitMask: 'radial-gradient(circle, transparent 55%, #000 56%)', mask: 'radial-gradient(circle, transparent 55%, #000 56%)' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(current.calories || 0).toLocaleString()}</span>
                    <span style={{ font: '600 9px var(--font-ui)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sage)' }}>today kcal</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {[
                    { label: 'protein', color: 'var(--macro-protein)', pct: pctProtein },
                    { label: 'carbs', color: 'var(--macro-carbs)', pct: pctCarbs },
                    { label: 'fat', color: 'var(--macro-fat)', pct: pctFat },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 3, background: m.color, flex: 'none' }} />
                      <span style={{ flex: 1, font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>{m.label}</span>
                      <span style={{ font: '700 13px var(--font-display)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>{m.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calories trend mini-chart */}
            <TrendCard
              title="calories vs target"
              rightLabel={`target ${calTarget.toLocaleString()}`}
              values={series.map(d => d.calories)}
              target={calTarget}
              color="#43C6AC"
              gradId="itrend-cal"
            />

            {/* Protein trend mini-chart */}
            <TrendCard
              title="protein trend"
              rightLabel={`target ${Math.round(targets.protein || 0)}g`}
              values={series.map(d => d.protein)}
              target={targets.protein || 0}
              color="#5FD4C4"
              gradId="itrend-pro"
            />

            {/* Logging adherence heat-strip */}
            <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: 18 }}>
              <div style={{ ...microLabel, marginBottom: 13 }}>logging adherence</div>
              <div style={{ display: 'flex', gap: days > 7 ? 6 : 9, flexWrap: 'wrap' }}>
                {series.map((d, i) => {
                  const over = d.logged && d.calories > calTarget * 1.1;
                  const bg = !d.logged
                    ? 'var(--hairline)'
                    : over
                      ? 'var(--warning)'
                      : d.calories >= calTarget * 0.75
                        ? 'var(--brand-jade)'
                        : 'rgba(67,198,172,.4)';
                  const sz = days > 7 ? 20 : 30;
                  return <div key={i} title={d.key} style={{ width: sz, height: sz, borderRadius: 6, background: bg }} />;
                })}
              </div>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                {[
                  { label: 'logged', color: 'var(--brand-jade)' },
                  { label: 'over target', color: 'var(--warning)' },
                  { label: 'missed', color: 'var(--hairline)' },
                ].map(l => (
                  <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: l.color }} />{l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Consistency + best streak */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: 14 }}>
                <div style={microLabel}>consistency</div>
                <div style={{ marginTop: 6, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{loggedCount}/{days}</div>
                <div style={{ marginTop: 2, font: '600 11px var(--font-ui)', color: 'var(--success)' }}>days logged</div>
              </div>
              <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: 14 }}>
                <div style={microLabel}>best streak</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ color: 'var(--primary)', display: 'inline-flex', alignSelf: 'center' }}><Flame size={16} /></span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{bestStreak}</span>
                </div>
                <div style={{ marginTop: 2, font: '600 11px var(--font-ui)', color: 'var(--sage)' }}>days in a row</div>
              </div>
            </div>

            {/* Weight vs intake — Plato Plus gated */}
            <div style={{ ...cardStyle, position: 'relative', borderRadius: 'var(--r-card)', padding: 18, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={microLabel}>weight vs intake</div>
                <span style={{ padding: '4px 9px', borderRadius: 999, background: 'rgba(231,182,124,.15)', color: 'var(--warning)', font: '700 9px var(--font-ui)', letterSpacing: '.12em', textTransform: 'uppercase' }}>plato plus</span>
              </div>
              <div style={{ filter: 'blur(5px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none', marginTop: 12 }}>
                <svg viewBox="0 0 300 70" preserveAspectRatio="none" style={{ width: '100%', height: 60 }}>
                  <path d="M0,20 L60,24 L120,18 L180,28 L240,26 L300,34" fill="none" stroke="#43C6AC" strokeWidth="2.5" />
                  <path d="M0,44 L60,40 L120,46 L180,38 L240,42 L300,36" fill="none" stroke="#5FD4C4" strokeWidth="2.5" />
                </svg>
                <div style={{ marginTop: 8, font: '500 13px var(--font-ui)', color: 'var(--ink)' }}>see how your intake shapes your weight trend over time.</div>
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0 24px', textAlign: 'center', background: 'linear-gradient(180deg,transparent,var(--glass-scrim) 55%)' }}>
                <div style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)' }}>see how intake shapes your weight</div>
                <button onClick={openUpsell} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 18px', borderRadius: 999, background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 13px var(--font-ui)', border: 'none', cursor: 'pointer', boxShadow: '0 10px 24px -10px rgba(67,198,172,.6)' }}>
                  <Lock size={14} strokeWidth={2.2} />unlock full history
                </button>
              </div>
            </div>

            {/* What we noticed */}
            <div>
              <div style={{ ...microLabel, letterSpacing: '.16em', padding: '6px 4px 8px' }}>what we noticed</div>
              <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', overflow: 'hidden' }}>
                {[
                  { Icon: TrendingUp, bg: 'rgba(231,182,124,.14)', color: 'var(--warning)', text: avgCal > calTarget ? `you averaged ${avgCal.toLocaleString()} kcal — about ${(avgCal - calTarget).toLocaleString()} over target.` : `you averaged ${avgCal.toLocaleString()} kcal, under your ${calTarget.toLocaleString()} target.` },
                  { Icon: BarChart3, bg: 'rgba(95,212,196,.14)', color: 'var(--info)', text: `you logged ${loggedCount} of the last ${days} days.` },
                  { Icon: Clock, bg: 'rgba(67,198,172,.14)', color: 'var(--brand-jade)', text: bestStreak >= 3 ? `your best run was ${bestStreak} days in a row — nice consistency.` : 'log daily to build a longer streak.' },
                ].map((n, i, all) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderBottom: i < all.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                    <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: n.bg, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><n.Icon size={16} /></span>
                    <span style={{ flex: 1, font: '500 13px var(--font-ui)', color: 'var(--ink)', lineHeight: 1.4 }}>{n.text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

/* ---------- Trend mini-chart ---------- */

function TrendCard({ title, rightLabel, values, target, color, gradId }) {
  const W = 300, H = 96;
  const vals = values && values.length ? values : [0];
  const max = Math.max(target || 0, ...vals) * 1.15 || 1;
  const n = vals.length;
  const x = (i) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v) => H - (v / max) * H;

  // Only plot logged (non-zero) points; keep the line continuous across them.
  const pts = vals.map((v, i) => ({ x: x(i), y: y(v), on: v > 0 }));
  const drawn = pts.filter(p => p.on);
  const linePath = drawn.length
    ? drawn.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';
  const areaPath = drawn.length
    ? `${linePath} L${drawn[drawn.length - 1].x.toFixed(1)},${H} L${drawn[0].x.toFixed(1)},${H} Z`
    : '';
  const targetY = target > 0 ? y(target) : null;
  const last = drawn.length ? drawn[drawn.length - 1] : null;

  const labels = n <= 7 ? DAY_LABELS.slice(0, n) : null;

  return (
    <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={microLabel}>{title}</div>
        <div style={{ font: '600 12px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>{rightLabel}</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 92, display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {targetY != null && (
          <line x1="0" y1={targetY} x2={W} y2={targetY} stroke="var(--warning)" strokeWidth="1.4" strokeDasharray="4 4" opacity=".6" />
        )}
        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}
        {linePath && <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
        {last && <circle cx={last.x} cy={last.y} r="3.5" fill={color} />}
      </svg>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          {labels.map((d, i) => <span key={i} style={{ font: '600 10px var(--font-ui)', color: 'var(--muted)' }}>{d}</span>)}
        </div>
      )}
    </div>
  );
}
