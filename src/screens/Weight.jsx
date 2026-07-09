import React, { useMemo, useState } from 'react';
import { ChevronLeft, Plus, TrendingUp, TrendingDown, LineChart, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = { font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)' };

// "2026-07-05" -> "jul 5"
function shortDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toLowerCase();
}
// "2026-07-05" -> "jul"
function monthLabel(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
}
function fmtWeight(n) {
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 1 });
}
function fmtDelta(n) {
  const s = Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (n < 0) return `−${s}`; // minus sign
  if (n > 0) return `+${s}`;
  return '0';
}

export function Weight({ onFab }) {
  const { userProfile, weightEntries, logWeight, setActiveTab } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState('');

  // Chronologically sorted ascending by date (oldest -> newest)
  const sorted = useMemo(() => {
    return [...(weightEntries || [])]
      .filter(e => e && e.date != null && Number.isFinite(Number(e.weight)))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [weightEntries]);

  const hasEntries = sorted.length > 0;

  const latest = hasEntries ? sorted[sorted.length - 1] : null;
  // Current weight: latest weigh-in, else userProfile.weight
  const current = latest ? Number(latest.weight) : (Number.isFinite(Number(userProfile?.weight)) ? Number(userProfile.weight) : null);

  const first = hasEntries ? Number(sorted[0].weight) : null;
  const sinceDelta = first != null && current != null ? current - first : null;
  const losing = sinceDelta != null && sinceDelta < 0;

  const submit = () => {
    const n = Number(draft);
    if (!Number.isFinite(n) || n <= 0) return;
    logWeight(n);
    setDraft('');
    setFormOpen(false);
  };

  const goBack = () => setActiveTab('profile');
  const openAdd = () => {
    if (onFab) { onFab(); return; }
    setDraft(current != null ? String(fmtWeight(current)) : '');
    setFormOpen(true);
  };

  // ---- trend chart geometry (built from sorted entries) ----
  const chart = useMemo(() => {
    if (sorted.length === 0) return null;
    const W = 300, H = 120, padTop = 12, padBottom = 20;
    const vals = sorted.map(e => Number(e.weight));
    let min = Math.min(...vals);
    let max = Math.max(...vals);
    if (min === max) { min -= 1; max += 1; } // flat line safeguard
    const n = sorted.length;
    const x = (i) => n === 1 ? W : (i / (n - 1)) * W;
    const y = (v) => padTop + (1 - (v - min) / (max - min)) * (H - padTop - padBottom);
    const pts = sorted.map((e, i) => [x(i), y(Number(e.weight))]);
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const area = `${line} L${W},${H} L0,${H} Z`;
    const last = pts[pts.length - 1];
    // faint horizontal grid lines
    const grid = [0.25, 0.5, 0.75].map(f => padTop + f * (H - padTop - padBottom));
    return { W, H, line, area, last, grid };
  }, [sorted]);

  return (
    <>
      {/* status bar spacer */}
      <div style={{ height: 12 }} />

      {/* top bar */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={goBack}
            aria-label="Back"
            style={{ width: 38, height: 38, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          ><ChevronLeft size={18} /></button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--ink)' }}>weight</div>
        </div>
        <button
          onClick={openAdd}
          aria-label="Add weigh-in"
          style={{ width: 38, height: 38, flex: 'none', borderRadius: 999, border: 'none', background: 'var(--primary)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        ><Plus size={18} strokeWidth={2.4} /></button>
      </div>

      {/* scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {/* Inline add-entry form */}
        {formOpen && (
          <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: 16, marginBottom: 14 }}>
            <div style={microLabel}>log a weigh-in</div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-control)', padding: '10px 14px' }}>
                <input
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setFormOpen(false); }}
                  placeholder="0.0"
                  style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums' }}
                />
                <span style={{ font: '500 14px var(--font-ui)', color: 'var(--sage)' }}>lb</span>
              </div>
              <button
                onClick={submit}
                style={{ flex: 'none', height: 48, padding: '0 20px', border: 'none', borderRadius: 'var(--r-control)', background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)' }}
              >save</button>
            </div>
            <button
              onClick={() => setFormOpen(false)}
              style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--sage)', font: '500 13px var(--font-ui)', cursor: 'pointer', padding: 0 }}
            >cancel</button>
          </div>
        )}

        {/* Empty state */}
        {!hasEntries ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', gap: 6, minHeight: 460 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(67,198,172,.3), rgba(15,148,130,.1) 60%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-jade)' }}>
              <LineChart size={42} strokeWidth={1.6} />
            </div>
            <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', color: 'var(--ink)' }}>start your weight journey</div>
            <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 250, lineHeight: 1.5 }}>log your first weigh-in and watch your trend take shape.</div>
            <button
              onClick={openAdd}
              style={{ marginTop: 18, height: 50, padding: '0 26px', border: 'none', borderRadius: 16, background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)' }}
            >log weight</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Hero current weight + delta since first entry */}
            <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: 18 }}>
              <div style={{ font: '600 10px var(--font-ui)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sage)' }}>current weight</div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 38, letterSpacing: '-.03em', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{fmtWeight(current)}</span>
                <span style={{ font: '500 15px var(--font-ui)', color: 'var(--sage)' }}>lb</span>
                {sinceDelta != null && sinceDelta !== 0 && (
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, font: '600 13px var(--font-ui)', color: losing ? 'var(--success)' : 'var(--warning)', fontVariantNumeric: 'tabular-nums' }}>
                    {losing ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                    {fmtWeight(Math.abs(sinceDelta))} lb since {monthLabel(sorted[0].date)}
                  </span>
                )}
              </div>
            </div>

            {/* Trend chart: inline SVG polyline from weightEntries */}
            {chart && (
              <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: '18px 16px 14px' }}>
                <svg viewBox={`0 0 ${chart.W} ${chart.H}`} preserveAspectRatio="none" style={{ width: '100%', height: 120, display: 'block', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="wtfill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#43C6AC" stopOpacity=".26" />
                      <stop offset="1" stopColor="#43C6AC" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* faint grid */}
                  {chart.grid.map((gy, i) => (
                    <line key={i} x1="0" y1={gy} x2={chart.W} y2={gy} stroke="var(--hairline)" strokeWidth="1" />
                  ))}
                  {/* area fill */}
                  <path d={chart.area} fill="url(#wtfill)" />
                  {/* jade line */}
                  <path d={chart.line} fill="none" stroke="#43C6AC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                  {/* latest point */}
                  <circle cx={chart.last[0]} cy={chart.last[1]} r="4" fill="#43C6AC" />
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>{monthLabel(sorted[0].date)}</span>
                  <span style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>{sorted.length === 1 ? 'today' : monthLabel(sorted[sorted.length - 1].date)}</span>
                </div>
              </div>
            )}

            {/* Recent weigh-ins */}
            <div>
              <div style={{ ...microLabel, padding: '6px 4px 8px' }}>recent weigh-ins</div>
              <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', overflow: 'hidden' }}>
                {[...sorted].reverse().map((e, i, arr) => {
                  const idxAsc = sorted.length - 1 - i;
                  const prev = idxAsc > 0 ? Number(sorted[idxAsc - 1].weight) : null;
                  const delta = prev != null ? Number(e.weight) - prev : null;
                  const down = delta != null && delta < 0;
                  const up = delta != null && delta > 0;
                  const color = delta == null ? 'var(--muted)' : down ? 'var(--success)' : up ? 'var(--warning)' : 'var(--muted)';
                  const isFirst = i === 0;
                  return (
                    <div key={e.date} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                      <span style={{ flex: 1, font: '600 14px var(--font-ui)', color: 'var(--ink)' }}>{isFirst ? 'today' : shortDate(e.date)}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{fmtWeight(e.weight)}</span>
                      <span style={{ width: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, font: '600 12px var(--font-ui)', color, fontVariantNumeric: 'tabular-nums' }}>
                        {delta == null ? <Minus size={12} /> : down ? <ArrowDown size={12} /> : up ? <ArrowUp size={12} /> : <Minus size={12} />}
                        {delta == null ? '' : fmtDelta(delta)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
