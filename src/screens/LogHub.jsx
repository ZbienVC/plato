import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Search, Zap, PencilLine, Mic, Barcode, Camera,
  X, ChevronLeft, Plus, Minus, Check, Flashlight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { searchFood } from '../lib/api';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = { font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)' };
const fieldLabel = { font: '600 10px var(--font-ui)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sage)', marginBottom: 7 };

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];

function defaultSlot() {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

// ~12 curated common foods for quick-add.
const QUICK_FOODS = [
  { name: 'greek yogurt', calories: 120, protein: 17, carbs: 8, fat: 0, tint: '#5FD4C4' },
  { name: 'chicken breast', calories: 165, protein: 31, carbs: 0, fat: 4, tint: '#43C6AC' },
  { name: '2 eggs', calories: 140, protein: 12, carbs: 1, fat: 10, tint: '#E7B67C' },
  { name: 'oats', calories: 150, protein: 5, carbs: 27, fat: 3, tint: '#AEA6EA' },
  { name: 'banana', calories: 105, protein: 1, carbs: 27, fat: 0, tint: '#E7B67C' },
  { name: 'almonds', calories: 170, protein: 6, carbs: 6, fat: 15, tint: '#E1A0AB' },
  { name: 'brown rice', calories: 215, protein: 5, carbs: 45, fat: 2, tint: '#8CE0CE' },
  { name: 'avocado', calories: 240, protein: 3, carbs: 12, fat: 22, tint: '#0F9482' },
  { name: 'protein shake', calories: 160, protein: 30, carbs: 5, fat: 2, tint: '#5FD4C4' },
  { name: 'apple', calories: 95, protein: 0, carbs: 25, fat: 0, tint: '#43C6AC' },
  { name: 'peanut butter', calories: 190, protein: 8, carbs: 6, fat: 16, tint: '#E7B67C' },
  { name: 'salmon fillet', calories: 280, protein: 39, carbs: 0, fat: 13, tint: '#E1A0AB' },
];

const TILES = [
  { mode: 'search', title: 'search', sub: 'usda database', Icon: Search, iconBg: 'rgba(67,198,172,.14)', iconColor: 'var(--brand-jade)', locked: false },
  { mode: 'quick', title: 'quick log', sub: 'common foods', Icon: Zap, iconBg: 'rgba(231,182,124,.14)', iconColor: 'var(--warning)', locked: false },
  { mode: 'manual', title: 'manual', sub: 'enter macros', Icon: PencilLine, iconBg: 'rgba(174,166,234,.16)', iconColor: 'var(--info)', locked: false },
  { mode: 'voice', title: 'voice log', sub: 'just say it', Icon: Mic, iconBg: 'rgba(95,212,196,.14)', iconColor: 'var(--info)', locked: true },
  { mode: 'scan', title: 'scan', sub: 'packaged food', Icon: Barcode, iconBg: 'rgba(67,198,172,.14)', iconColor: 'var(--brand-jade)', locked: false },
  { mode: 'photo', title: 'photo', sub: 'snap your plate', Icon: Camera, iconBg: 'rgba(225,160,171,.16)', iconColor: 'var(--macro-fat)', locked: true },
];

const SHEET_TITLES = {
  hub: 'log a meal', search: 'search foods', quick: 'quick log',
  manual: 'manual entry', confirm: 'confirm',
};

function slotBtn(active) {
  return {
    flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
    font: '600 12px var(--font-ui)', transition: 'all .16s var(--ease-out)',
    color: active ? 'var(--on-accent)' : 'var(--sage)',
    background: active ? 'var(--primary)' : 'transparent',
  };
}

export function LogHub({ onFab }) {
  const { logMeal, setActiveTab, isPremiumActive, openPremiumModal, setShowVoiceLog, dailyLog } = useApp();
  const { current, targets } = useMacros();

  const [mode, setMode] = useState('hub'); // hub | search | quick | manual | confirm | scan
  const [slot, setSlot] = useState(defaultSlot());
  const [toast, setToast] = useState(null);

  // search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  // confirm state
  const [confirmFood, setConfirmFood] = useState(null);
  const [qty, setQty] = useState(1);

  // manual state
  const [manual, setManual] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  // scan fallback state
  const [barcode, setBarcode] = useState('');

  const toastT = useRef(null);
  const debounceT = useRef(null);
  useEffect(() => () => { clearTimeout(toastT.current); clearTimeout(debounceT.current); }, []);

  const showToast = useCallback((m) => {
    clearTimeout(toastT.current);
    setToast(m);
    toastT.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const closeToHome = () => (onFab ? onFab() : setActiveTab('home'));

  const commitLog = useCallback((meal) => {
    logMeal({ ...meal, type: meal.type || slot, slot: meal.slot || slot });
  }, [logMeal, slot]);

  // ── recent: last few things logged today ───────────────────────────────
  const recent = (dailyLog?.meals || []).slice(-3).reverse();

  // ── debounced search ────────────────────────────────────────────────────
  const runSearch = useCallback((q) => {
    clearTimeout(debounceT.current);
    const trimmed = q.trim();
    if (!trimmed) { setResults([]); setSearched(false); setSearching(false); return; }
    setSearching(true);
    debounceT.current = setTimeout(async () => {
      try {
        const res = await searchFood(trimmed);
        setResults(Array.isArray(res) ? res : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
        setSearched(true);
      }
    }, 320);
  }, []);

  const onQueryChange = (v) => { setQuery(v); runSearch(v); };

  // ── open confirm for a food result ──────────────────────────────────────
  const openConfirm = (food) => {
    setConfirmFood({
      name: food.name || 'food',
      source: food.brand ? food.brand : 'usda',
      serving: food.serving || 'per serving',
      calories: Number(food.calories) || 0,
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
    });
    setQty(1);
    setMode('confirm');
  };

  const back = () => {
    if (mode === 'confirm') { setMode(confirmFood ? 'search' : 'hub'); return; }
    setMode('hub');
  };

  // ── tile handlers ───────────────────────────────────────────────────────
  const openTile = (m) => {
    if (m === 'voice') { isPremiumActive() ? setShowVoiceLog(true) : openPremiumModal(); return; }
    if (m === 'photo') { openPremiumModal(); return; }
    setMode(m);
  };

  const quickLog = (food) => {
    commitLog(food);
    showToast(`logged ${food.name}`);
  };

  const confirmLog = () => {
    if (!confirmFood) return;
    const q = Math.max(1, qty);
    commitLog({
      name: confirmFood.name,
      calories: Math.round(confirmFood.calories * q),
      protein: Math.round(confirmFood.protein * q),
      carbs: Math.round(confirmFood.carbs * q),
      fat: Math.round(confirmFood.fat * q),
    });
    setActiveTab('home');
  };

  const manualLog = () => {
    const name = manual.name.trim() || 'custom meal';
    commitLog({
      name,
      calories: Math.round(Number(manual.calories) || 0),
      protein: Math.round(Number(manual.protein) || 0),
      carbs: Math.round(Number(manual.carbs) || 0),
      fat: Math.round(Number(manual.fat) || 0),
    });
    setActiveTab('home');
  };

  const scanFallbackLog = () => {
    // no real scanner — log a placeholder scanned item, then land on home
    commitLog({ name: barcode.trim() ? `scanned · ${barcode.trim()}` : 'scanned item', calories: 0, protein: 0, carbs: 0, fat: 0 });
    setActiveTab('home');
  };

  const isSheet = ['hub', 'search', 'quick', 'manual', 'confirm'].includes(mode);

  return (
    <>
      <div style={{ height: 12 }} />

      {/* Top bar */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {mode !== 'hub' && (
            <button onClick={back} aria-label="Back" style={iconBtn()}><ChevronLeft size={18} /></button>
          )}
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: 'var(--ink)' }}>log</div>
        </div>
        <button onClick={closeToHome} aria-label="Close" style={iconBtn()}><X size={18} /></button>
      </div>

      {/* Sub-title micro-label */}
      <div style={{ flex: 'none', padding: '0 20px 10px', position: 'relative', zIndex: 2 }}>
        <div style={microLabel}>{SHEET_TITLES[mode] || 'log a meal'}</div>
      </div>

      {/* Scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {/* ── HUB ─────────────────────────────────────────────── */}
        {mode === 'hub' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              {TILES.map((t) => (
                <button
                  key={t.mode}
                  onClick={() => openTile(t.mode)}
                  style={{ position: 'relative', textAlign: 'left', ...cardStyle, borderRadius: 'var(--r-tile)', padding: 15, cursor: 'pointer' }}
                >
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: t.iconBg, color: t.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <t.Icon size={21} strokeWidth={1.9} />
                  </span>
                  <div style={{ marginTop: 11, font: '700 15px var(--font-ui)', color: 'var(--ink)' }}>{t.title}</div>
                  <div style={{ marginTop: 2, font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>{t.sub}</div>
                  {t.locked && (
                    <span style={{ position: 'absolute', top: 13, right: 13, display: 'inline-flex', alignItems: 'center', padding: '3px 7px', borderRadius: 999, background: 'rgba(231,182,124,.15)', color: 'var(--warning)', font: '700 9px var(--font-ui)', letterSpacing: '.1em', textTransform: 'uppercase' }}>plus</span>
                  )}
                </button>
              ))}
            </div>

            {recent.length > 0 && (
              <div>
                <div style={microLabel}>recent</div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {recent.map((r, i) => {
                    const tints = ['#5FD4C4', '#43C6AC', '#E7B67C'];
                    return (
                      <button
                        key={i}
                        onClick={() => quickLog({ name: r.name, calories: r.calories || 0, protein: r.protein || 0, carbs: r.carbs || 0, fat: r.fat || 0 })}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', color: 'var(--ink)', font: '600 13px var(--font-ui)', cursor: 'pointer' }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: 3, background: tints[i % 3] }} />
                        {(r.name || 'meal').toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SEARCH ──────────────────────────────────────────── */}
        {mode === 'search' && (
          <div>
            <div style={{ position: 'sticky', top: 0, paddingBottom: 12, background: 'var(--bg-base, transparent)', zIndex: 3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 15px', borderRadius: 'var(--r-control)', background: 'var(--surface-2)', border: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Search size={18} /></span>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="search foods…"
                  style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none', color: 'var(--ink)', font: '500 14px var(--font-ui)' }}
                />
                {query && (
                  <button onClick={() => onQueryChange('')} aria-label="Clear" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'inline-flex' }}><X size={16} /></button>
                )}
              </div>
            </div>

            {searching && (
              <div style={{ padding: '30px 0', textAlign: 'center', font: '500 13px var(--font-ui)', color: 'var(--muted)' }}>searching…</div>
            )}

            {!searching && !query.trim() && (
              <div style={{ padding: '40px 20px', textAlign: 'center', font: '500 13px var(--font-ui)', color: 'var(--sage)', lineHeight: 1.5 }}>
                search 300k+ foods from usda fooddata central.
              </div>
            )}

            {!searching && query.trim() && searched && results.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', font: '500 13px var(--font-ui)', color: 'var(--sage)' }}>
                no results for “{query.trim()}”
              </div>
            )}

            {!searching && results.length > 0 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {results.map((r, i) => (
                    <button
                      key={r.fdcId ?? i}
                      onClick={() => openConfirm(r)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 6px', background: 'none', border: 'none', borderBottom: '1px solid var(--hairline)', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(r.name || 'food').toLowerCase()}</div>
                        <div style={{ marginTop: 2, font: '500 11px var(--font-ui)', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {(r.brand ? `${r.brand} · ` : '')}{r.serving || 'per serving'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flex: 'none' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--macro-cal, var(--brand-jade))', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.calories || 0)}</div>
                        <div style={{ marginTop: 1, font: '500 10px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.protein || 0)}P {Math.round(r.carbs || 0)}C {Math.round(r.fat || 0)}F</div>
                      </div>
                      <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 999, background: 'var(--primary)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} strokeWidth={2.6} /></span>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 14, textAlign: 'center', font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>data from usda fooddata central</div>
              </>
            )}
          </div>
        )}

        {/* ── QUICK ───────────────────────────────────────────── */}
        {mode === 'quick' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {QUICK_FOODS.map((q) => (
              <button
                key={q.name}
                onClick={() => quickLog(q)}
                style={{ display: 'flex', alignItems: 'center', gap: 11, ...cardStyle, borderRadius: 'var(--r-control)', padding: 12, cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 36, height: 36, flex: 'none', borderRadius: 11, background: `linear-gradient(150deg,${q.tint},var(--brand-forest))`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.name}</div>
                  <div style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{q.calories} kcal</div>
                </div>
                <span style={{ color: 'var(--primary)', display: 'inline-flex', flex: 'none' }}><Plus size={18} strokeWidth={2.2} /></span>
              </button>
            ))}
          </div>
        )}

        {/* ── MANUAL ──────────────────────────────────────────── */}
        {mode === 'manual' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={fieldLabel}>food name</div>
              <input
                value={manual.name}
                onChange={(e) => setManual((s) => ({ ...s, name: e.target.value }))}
                placeholder="post-workout shake"
                style={{ width: '100%', height: 48, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)', padding: '0 14px', outline: 'none', font: '500 15px var(--font-ui)' }}
              />
            </div>

            <div>
              <div style={fieldLabel}>macros</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <MacroField dot="var(--macro-cal)" unit="kcal" value={manual.calories} onChange={(v) => setManual((s) => ({ ...s, calories: v }))} />
                <MacroField dot="var(--macro-protein)" unit="P" value={manual.protein} onChange={(v) => setManual((s) => ({ ...s, protein: v }))} />
                <MacroField dot="var(--macro-carbs)" unit="C" value={manual.carbs} onChange={(v) => setManual((s) => ({ ...s, carbs: v }))} />
                <MacroField dot="var(--macro-fat)" unit="F" value={manual.fat} onChange={(v) => setManual((s) => ({ ...s, fat: v }))} />
              </div>
            </div>

            <div>
              <div style={fieldLabel}>meal</div>
              <SlotPicker slot={slot} setSlot={setSlot} />
            </div>

            <button
              onClick={manualLog}
              style={primaryBtn()}
            >log meal</button>
          </div>
        )}

        {/* ── CONFIRM ─────────────────────────────────────────── */}
        {mode === 'confirm' && confirmFood && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <div style={{ font: '700 18px var(--font-ui)', color: 'var(--ink)' }}>{confirmFood.name.toLowerCase()}</div>
              <div style={{ marginTop: 3, font: '500 12px var(--font-ui)', color: 'var(--muted)' }}>from {confirmFood.source.toLowerCase()} · {confirmFood.serving}</div>
            </div>

            {/* quantity stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: '11px 15px' }}>
              <span style={{ font: '600 13px var(--font-ui)', color: 'var(--sage)' }}>servings</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease" style={stepBtn()}><Minus size={16} /></button>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'center' }}>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase" style={stepBtn()}><Plus size={16} /></button>
              </div>
            </div>

            {/* meal slot */}
            <div>
              <div style={fieldLabel}>meal</div>
              <SlotPicker slot={slot} setSlot={setSlot} />
            </div>

            {/* live macro preview */}
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: 15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                <PreviewCell color="var(--macro-cal)" label="kcal" value={Math.round(confirmFood.calories * qty)} />
                <PreviewCell color="var(--macro-protein)" label="protein" value={Math.round(confirmFood.protein * qty)} />
                <PreviewCell color="var(--macro-carbs)" label="carbs" value={Math.round(confirmFood.carbs * qty)} />
                <PreviewCell color="var(--macro-fat)" label="fat" value={Math.round(confirmFood.fat * qty)} />
              </div>
            </div>

            <button onClick={confirmLog} style={primaryBtn()}>log meal</button>
          </div>
        )}

        {/* ── SCAN (free, no scanner) ─────────────────────────── */}
        {mode === 'scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingTop: 10 }}>
            {/* capture-style viewfinder */}
            <div style={{ position: 'relative', width: '100%', maxWidth: 260, aspectRatio: '250 / 170', borderRadius: 14, background: 'linear-gradient(180deg,#0a1512,#050a09)', overflow: 'hidden' }}>
              <Corner style={{ top: 0, left: 0, borderTop: '3px solid var(--brand-jade)', borderLeft: '3px solid var(--brand-jade)', borderRadius: '10px 0 0 0' }} />
              <Corner style={{ top: 0, right: 0, borderTop: '3px solid var(--brand-jade)', borderRight: '3px solid var(--brand-jade)', borderRadius: '0 10px 0 0' }} />
              <Corner style={{ bottom: 0, left: 0, borderBottom: '3px solid var(--brand-jade)', borderLeft: '3px solid var(--brand-jade)', borderRadius: '0 0 0 10px' }} />
              <Corner style={{ bottom: 0, right: 0, borderBottom: '3px solid var(--brand-jade)', borderRight: '3px solid var(--brand-jade)', borderRadius: '0 0 10px 0' }} />
              <div style={{ position: 'absolute', top: '50%', left: 14, right: 14, height: 2, background: 'var(--brand-jade)', boxShadow: '0 0 12px var(--brand-jade)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', gap: 3, opacity: 0.5 }}>
                {[2, 4, 2, 5, 2, 3, 2, 5].map((w, i) => (
                  <div key={i} style={{ width: w, height: 44, background: '#EAF1EF' }} />
                ))}
              </div>
            </div>

            <div style={{ font: '600 15px var(--font-ui)', color: 'var(--ink)' }}>point at a barcode</div>
            <div style={{ font: '500 13px var(--font-ui)', color: 'var(--sage)', textAlign: 'center', maxWidth: 260, lineHeight: 1.5, marginTop: -14 }}>
              barcode scanning is free. line up a package barcode inside the frame — or enter it by hand.
            </div>

            {/* manual barcode fallback */}
            <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="enter barcode number"
                inputMode="numeric"
                style={{ width: '100%', height: 48, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)', padding: '0 14px', outline: 'none', font: '500 15px var(--font-ui)', textAlign: 'center', letterSpacing: '.05em', fontVariantNumeric: 'tabular-nums' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => { setBarcode(''); showToast('scanning again'); }}
                  style={{ flex: 1, height: 44, borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)', font: '600 13px var(--font-ui)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                ><Flashlight size={16} />scan again</button>
                <button
                  onClick={scanFallbackLog}
                  style={{ flex: 1, height: 44, borderRadius: 999, border: 'none', background: 'var(--primary)', color: 'var(--on-accent)', font: '600 13px var(--font-ui)', cursor: 'pointer' }}
                >enter manually</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* toast */}
      {toast && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 26, zIndex: 9, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '12px 17px', borderRadius: 14, background: 'var(--glass-fill)', border: '1px solid var(--divider-strong)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 18px 40px -18px rgba(0,0,0,.9)' }}>
            <span style={{ width: 19, height: 19, borderRadius: 999, background: 'var(--success)', color: 'var(--on-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Check size={12} strokeWidth={3} /></span>
            <span style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function iconBtn() {
  return {
    width: 36, height: 36, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)',
    background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  };
}

function stepBtn() {
  return {
    width: 32, height: 32, borderRadius: 999, border: '1px solid var(--glass-border)',
    background: 'var(--surface-3)', color: 'var(--ink)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };
}

function primaryBtn() {
  return {
    marginTop: 4, width: '100%', height: 52, border: 'none', borderRadius: 'var(--r-control)',
    background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C',
    font: '700 16px var(--font-ui)', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)',
  };
}

function MacroField({ dot, unit, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: '11px 13px' }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, flex: 'none' }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
        placeholder="0"
        inputMode="numeric"
        style={{ width: '100%', minWidth: 0, border: 'none', background: 'none', outline: 'none', color: 'var(--ink)', font: '700 16px var(--font-display)', fontVariantNumeric: 'tabular-nums' }}
      />
      <span style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', flex: 'none' }}>{unit}</span>
    </div>
  );
}

function SlotPicker({ slot, setSlot }) {
  return (
    <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 13, padding: 4, gap: 3 }}>
      {SLOTS.map((s) => (
        <button key={s} onClick={() => setSlot(s)} style={slotBtn(slot === s)}>{s}</button>
      ))}
    </div>
  );
}

function PreviewCell({ color, label, value }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-.02em', color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ marginTop: 2, font: '600 9px var(--font-ui)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sage)' }}>{label}</div>
    </div>
  );
}

function Corner({ style }) {
  return <div style={{ position: 'absolute', width: 34, height: 34, ...style }} />;
}
