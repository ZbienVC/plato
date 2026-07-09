import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const sectionLabel = { font: '600 10px var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)', padding: '0 4px 9px' };
const rowLabel = { font: '600 14px var(--font-ui)', color: 'var(--ink)' };
const rowSub = { marginTop: 1, font: '500 12px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' };

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 46, height: 27, borderRadius: 999, border: 'none', cursor: 'pointer', flex: 'none',
        position: 'relative', transition: 'background .2s var(--ease-out)',
        background: on ? 'var(--primary)' : 'var(--divider-strong)',
      }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: 999, background: '#fff', transition: 'left .2s var(--ease-out)', boxShadow: '0 2px 5px rgba(0,0,0,.3)' }} />
    </button>
  );
}

function Seg({ options, value, onChange, radius = 12, pad = 4, gap = 3 }) {
  return (
    <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: radius, padding: pad, gap }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: 1, padding: '9px 0', borderRadius: Math.max(6, radius - 3), border: 'none', cursor: 'pointer',
              font: '600 13px var(--font-ui)', transition: 'all .16s var(--ease-out)', whiteSpace: 'nowrap',
              color: active ? 'var(--on-accent)' : 'var(--sage)',
              background: active ? 'var(--primary)' : 'transparent',
            }}
          >{o.label}</button>
        );
      })}
    </div>
  );
}

function UnitSeg({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              font: '600 12px var(--font-ui)', transition: 'all .16s var(--ease-out)',
              color: active ? 'var(--on-accent)' : 'var(--sage)',
              background: active ? 'var(--primary)' : 'transparent',
            }}
          >{o.label}</button>
        );
      })}
    </div>
  );
}

export function Settings({ onFab }) {
  const {
    theme, setTheme,
    waterGoalCups, setWaterGoalCups,
    premium, isLoggedIn, logout, resetAll,
    setActiveTab,
  } = useApp();
  const { targets } = useMacros();
  // onFab is provided by the shell for the center action button; nav here uses setActiveTab.
  void onFab;

  // Local-only UI state (no backing store yet — see comments)
  const [units, setUnits] = useState({ energy: 'kcal', weight: 'lb', height: 'ftin' });
  const [motion, setMotion] = useState(false);
  const [notif, setNotif] = useState({ meal: true, water: true, weekly: true });
  const [toast, setToast] = useState(null);

  const toastT = React.useRef(null);
  const showToast = (m) => {
    if (toastT.current) clearTimeout(toastT.current);
    setToast(m);
    toastT.current = setTimeout(() => setToast(null), 1800);
  };
  React.useEffect(() => () => { if (toastT.current) clearTimeout(toastT.current); }, []);

  const setUnit = (k, v) => setUnits(s => ({ ...s, [k]: v }));
  const toggleNotif = (k) => setNotif(s => ({ ...s, [k]: !s[k] }));

  const waterMl = (waterGoalCups * 250).toLocaleString('en-US');
  const waterDown = () => setWaterGoalCups(Math.max(4, waterGoalCups - 1));
  const waterUp = () => setWaterGoalCups(Math.min(16, waterGoalCups + 1));

  const macroLine = `${(targets.calories || 0).toLocaleString()} kcal · ${Math.round(targets.protein || 0)} / ${Math.round(targets.carbs || 0)} / ${Math.round(targets.fat || 0)} g`;
  void premium;

  // "sync now" row — mirrors the design's "synced 2m ago" trailing label.
  const [syncLabel, setSyncLabel] = useState('synced 2m ago');
  const handleSync = () => { setSyncLabel('syncing…'); showToast('synced'); setTimeout(() => setSyncLabel('synced just now'), 700); };
  // Data export is a no-op placeholder — no export pipeline exists yet.
  const handleExport = () => showToast('export coming soon');
  const handleReset = () => {
    if (typeof window !== 'undefined' && window.confirm && !window.confirm('Reset all data? This cannot be undone.')) return;
    resetAll();
    showToast('all data reset');
  };
  const handleSignOut = () => { logout(); };

  const stepBtn = {
    width: 30, height: 30, borderRadius: 999, border: '1px solid var(--glass-border)',
    background: 'var(--surface-3)', color: 'var(--ink)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };
  const listBtn = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
  };
  const chevron = <span style={{ color: 'var(--muted)', display: 'inline-flex' }}><ChevronRight size={18} /></span>;

  return (
    <>
      {/* status bar spacer + top bar */}
      <div style={{ height: 12 }} />
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 20px 14px', position: 'relative', zIndex: 2 }}>
        <button
          onClick={() => setActiveTab('profile')}
          aria-label="Back to profile"
          style={{ width: 38, height: 38, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ChevronLeft size={18} />
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--ink)' }}>settings</div>
      </div>

      {/* scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 1 }}>

        {/* appearance */}
        <div>
          <div style={sectionLabel}>appearance</div>
          <div style={{ ...cardStyle, borderRadius: 18, padding: '15px 16px' }}>
            <div style={rowLabel}>theme</div>
            <div style={{ marginTop: 11 }}>
              <Seg
                options={[{ value: 'system', label: 'system' }, { value: 'light', label: 'light' }, { value: 'dark', label: 'dark' }]}
                value={theme}
                onChange={setTheme}
              />
            </div>
            <div style={{ marginTop: 15, paddingTop: 14, borderTop: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={rowLabel}>reduce motion</div>
                <div style={rowSub}>calmer transitions, static orb</div>
              </div>
              <Toggle on={motion} onClick={() => setMotion(v => !v)} />
            </div>
          </div>
        </div>

        {/* units */}
        <div>
          <div style={sectionLabel}>units</div>
          <div style={{ ...cardStyle, borderRadius: 18, overflow: 'hidden' }}>
            {[
              { key: 'energy', label: 'energy', opts: [{ value: 'kcal', label: 'kcal' }, { value: 'kj', label: 'kJ' }] },
              { key: 'weight', label: 'body weight', opts: [{ value: 'lb', label: 'lb' }, { value: 'kg', label: 'kg' }] },
              { key: 'height', label: 'height', opts: [{ value: 'ftin', label: 'ft·in' }, { value: 'cm', label: 'cm' }] },
            ].map((u, i, arr) => (
              <div key={u.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                <span style={rowLabel}>{u.label}</span>
                <UnitSeg options={u.opts} value={units[u.key]} onChange={(v) => setUnit(u.key, v)} />
              </div>
            ))}
          </div>
        </div>

        {/* goals */}
        <div>
          <div style={sectionLabel}>goals</div>
          <div style={{ ...cardStyle, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--hairline)' }}>
              <div>
                <div style={rowLabel}>water target</div>
                <div style={rowSub}>{waterMl} ml / day</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={waterDown} aria-label="Decrease water target" style={stepBtn}><Minus size={16} /></button>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', minWidth: 52, textAlign: 'center' }}>{waterGoalCups} cups</span>
                <button onClick={waterUp} aria-label="Increase water target" style={stepBtn}><Plus size={16} /></button>
              </div>
            </div>
            <button onClick={() => setActiveTab('profile')} style={listBtn}>
              <div>
                <div style={rowLabel}>calorie &amp; macro targets</div>
                <div style={rowSub}>{macroLine}</div>
              </div>
              {chevron}
            </button>
          </div>
        </div>

        {/* notifications */}
        <div>
          <div style={sectionLabel}>notifications</div>
          <div style={{ ...cardStyle, borderRadius: 18, overflow: 'hidden' }}>
            {[
              { key: 'meal', label: 'meal reminders' },
              { key: 'water', label: 'water reminders' },
              { key: 'weekly', label: 'weekly report' },
            ].map((n, i, arr) => (
              <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                <span style={rowLabel}>{n.label}</span>
                <Toggle on={notif[n.key]} onClick={() => toggleNotif(n.key)} />
              </div>
            ))}
          </div>
        </div>

        {/* account & data */}
        <div>
          <div style={sectionLabel}>account &amp; data</div>
          <div style={{ ...cardStyle, borderRadius: 18, overflow: 'hidden' }}>
            <button onClick={handleExport} style={{ ...listBtn, borderBottom: '1px solid var(--hairline)' }}>
              <span style={rowLabel}>export my data</span>
              {chevron}
            </button>
            <button onClick={handleSync} style={{ ...listBtn, borderBottom: '1px solid var(--hairline)' }}>
              <span style={rowLabel}>sync now</span>
              <span style={{ font: '500 12px var(--font-ui)', color: 'var(--muted)' }}>{syncLabel}</span>
            </button>
            {isLoggedIn ? (
              <button onClick={handleSignOut} style={{ ...listBtn, alignItems: 'center', gap: 8, borderBottom: '1px solid var(--hairline)' }}>
                <span style={{ ...rowLabel, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><LogOut size={16} /></span>
                  account &amp; password
                </span>
                {chevron}
              </button>
            ) : (
              <button onClick={() => setActiveTab('profile')} style={{ ...listBtn, borderBottom: '1px solid var(--hairline)' }}>
                <span style={rowLabel}>account &amp; password</span>
                {chevron}
              </button>
            )}
            <button onClick={handleReset} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}>
              <span style={{ font: '600 14px var(--font-ui)' }}>reset all data</span>
            </button>
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, padding: '2px 0 8px' }}>
            <img src="/plato-logo.png" alt="Plato" width={54} height={54} style={{ display: 'block', width: 54, height: 54, borderRadius: 16, boxShadow: '0 12px 26px -14px rgba(0,0,0,.65),0 0 18px -8px rgba(67,198,172,.4)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, letterSpacing: '-.02em', color: 'var(--ink)' }}>Plato</div>
            <div style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>version 2.0.0</div>
            <div style={{ font: '600 11px var(--font-ui)', color: 'var(--sage)', letterSpacing: '.02em' }}>terms · privacy</div>
          </div>
        </div>

      </div>

      {/* toast */}
      {toast && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 'calc(var(--nav-safe-pad, 26px) + 8px)', zIndex: 9, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '12px 17px', borderRadius: 14, background: 'var(--glass-fill)', border: '1px solid var(--divider-strong)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 18px 40px -18px rgba(0,0,0,.9)' }}>
            <span style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
