import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft, Share, Plus, Check, Apple, Beef, Wheat, Package,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = { font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)' };

// Aisle definitions — tint + icon + keyword matchers for classifying ingredients.
const AISLES = [
  { key: 'produce', tint: 'var(--brand-jade)', Icon: Apple, kw: ['spinach', 'lettuce', 'kale', 'tomato', 'onion', 'garlic', 'pepper', 'cucumber', 'carrot', 'celery', 'avocado', 'banana', 'apple', 'berry', 'blueberr', 'strawberr', 'lemon', 'lime', 'broccoli', 'zucchini', 'mushroom', 'potato', 'greens', 'herb', 'cilantro', 'parsley', 'basil', 'ginger', 'fruit', 'veg', 'salad'] },
  { key: 'protein', tint: 'var(--macro-protein)', Icon: Beef, kw: ['chicken', 'beef', 'steak', 'pork', 'turkey', 'salmon', 'tuna', 'fish', 'shrimp', 'egg', 'tofu', 'tempeh', 'yogurt', 'greek', 'cottage', 'protein', 'whey', 'bacon', 'sausage', 'ham'] },
  { key: 'grains', tint: 'var(--macro-carbs)', Icon: Wheat, kw: ['rice', 'quinoa', 'oat', 'bread', 'pasta', 'noodle', 'tortilla', 'bagel', 'cereal', 'flour', 'grain', 'barley', 'couscous', 'wrap', 'bun'] },
];
const PANTRY = { key: 'pantry', tint: 'var(--accent-violet)', Icon: Package };

function classify(name) {
  const n = (name || '').toLowerCase();
  for (const a of AISLES) if (a.kw.some(k => n.includes(k))) return a.key;
  return PANTRY.key;
}
const AISLE_META = [...AISLES, PANTRY].reduce((m, a) => { m[a.key] = a; return m; }, {});
const AISLE_ORDER = ['produce', 'protein', 'grains', 'pantry'];

const SCOPES = [
  { key: 'week', label: 'this week', days: 7 },
  { key: 'three', label: 'next 3 days', days: 3 },
  { key: 'day', label: 'today', days: 1 },
];

export function Grocery({ onFab }) {
  const {
    plan, groceryList, setGroceryList, groceryChecked, setGroceryChecked, setActiveTab,
  } = useApp();

  // onFab is provided by the shell for the center action button; nav here uses setActiveTab.
  void onFab;

  const [draft, setDraft] = useState('');
  const [scope, setScope] = useState('week');
  const [toast, setToast] = useState(null);
  const [offline, setOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
  const toastTimer = useRef(null);

  // Toast helper — mirrors the design's transient confirmation banner.
  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }, []);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // Live offline detection for the offline sync banner.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Derive the working item list. Prefer plan ingredients; fall back to groceryList state.
  // Each item: { name, qty, aisle }. The active scope trims how many plan days feed the list.
  const items = useMemo(() => {
    const out = [];
    const seen = new Set();
    const push = (name, qty, aisle) => {
      const key = (name || '').trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push({ name: name.trim(), qty: qty || '', aisle: aisle || classify(name) });
    };

    const days = SCOPES.find(s => s.key === scope)?.days ?? 7;
    const allMeals = plan?.meals || [];
    // Scope narrows the plan window; when meals carry no day grouping we cap by proportion.
    const scopedMeals = days >= 7
      ? allMeals
      : allMeals.slice(0, Math.max(1, Math.ceil(allMeals.length * (days / 7))));
    const planIngredients = scopedMeals.flatMap(m => m.ingredients || []);
    if (planIngredients.length) {
      planIngredients.forEach(ing => {
        if (typeof ing === 'string') {
          push(ing, '', classify(ing));
        } else if (ing && typeof ing === 'object') {
          const name = ing.name || ing.item || ing.ingredient || '';
          const qty = ing.quantity || ing.qty || ing.amount || '';
          push(name, qty, ing.category || ing.aisle || classify(name));
        }
      });
    }

    // Merge in hand-added / state grocery items (also the source when no plan ingredients).
    (groceryList || []).forEach(gi => {
      if (typeof gi === 'string') push(gi, '', classify(gi));
      else if (gi && typeof gi === 'object') {
        const name = gi.name || gi.item || '';
        push(name, gi.quantity || gi.qty || '', gi.category || gi.aisle || classify(name));
      }
    });

    return out;
  }, [plan, groceryList, scope]);

  const total = items.length;
  const isChecked = (name) => !!groceryChecked[name.toLowerCase()];
  const checkedCount = items.filter(it => isChecked(it.name)).length;
  const pct = total ? Math.round((checkedCount / total) * 100) : 0;

  const toggle = (name) => {
    const k = name.toLowerCase();
    setGroceryChecked(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const clearChecked = () => {
    // Uncheck everything currently checked in this list.
    setGroceryChecked(prev => {
      const next = { ...prev };
      items.forEach(it => { delete next[it.name.toLowerCase()]; });
      return next;
    });
    showToast('cleared checked items');
  };

  const addItem = () => {
    const name = draft.trim();
    if (!name) { showToast('type an item first'); return; }
    setGroceryList(prev => {
      const list = prev || [];
      if (list.some(g => ((typeof g === 'string' ? g : g?.name) || '').trim().toLowerCase() === name.toLowerCase())) return list;
      return [...list, { name, quantity: '', category: classify(name), checked: false }];
    });
    setDraft('');
    showToast('added ' + name);
  };

  const share = async () => {
    const lines = items.map(it => `• ${it.name}${it.qty ? ' — ' + it.qty : ''}`).join('\n');
    const text = `Plato grocery list\n${lines}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'Grocery list', text });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch { /* user dismissed / unsupported — still confirm */ }
    showToast('share link copied');
  };

  // Group into aisle sections, preserving canonical order.
  const sections = useMemo(() => {
    const byAisle = {};
    items.forEach(it => {
      const a = AISLE_META[it.aisle] ? it.aisle : PANTRY.key;
      (byAisle[a] = byAisle[a] || []).push(it);
    });
    return AISLE_ORDER
      .filter(a => byAisle[a]?.length)
      .map(a => ({ ...AISLE_META[a], items: byAisle[a] }));
  }, [items]);

  const empty = total === 0;

  const iconBtn = {
    width: 38, height: 38, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)',
    background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  };

  return (
    <>
      <style>{`@keyframes g-toast{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes g-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div style={{ height: 12 }} />

      {/* Top bar */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setActiveTab('meals')} aria-label="Back to plans" style={iconBtn}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--ink)' }}>grocery</div>
        </div>
        <button onClick={share} aria-label="Share list" style={iconBtn}>
          <Share size={17} />
        </button>
      </div>

      {/* Scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 20px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {empty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', gap: 6, minHeight: 460 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(231,182,124,.3), rgba(15,148,130,.1) 60%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
              <ShoppingCartIcon />
            </div>
            <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', color: 'var(--ink)' }}>your list is empty</div>
            <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 250, lineHeight: 1.5 }}>
              it builds itself from your meal plan — generate a plan or add items by hand.
            </div>
            <button
              onClick={() => setActiveTab('meals')}
              style={{ marginTop: 18, height: 50, padding: '0 26px', border: 'none', borderRadius: 'var(--r-control)', background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)' }}
            >
              build a plan
            </button>

            {/* Even when empty, allow hand-adding items */}
            <div style={{ marginTop: 26, width: '100%', maxWidth: 320, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px dashed var(--divider-strong)', borderRadius: 'var(--r-control)', padding: '6px 6px 6px 15px' }}>
              <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Plus size={18} /></span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
                placeholder="add an item"
                style={{ flex: 1, minWidth: 0, height: 40, border: 'none', background: 'none', outline: 'none', color: 'var(--ink)', font: '500 14px var(--font-ui)', fontFamily: 'var(--font-ui)' }}
              />
              <button onClick={addItem} style={{ height: 36, padding: '0 15px', borderRadius: 11, border: 'none', background: 'var(--primary)', color: 'var(--on-accent)', font: '600 13px var(--font-ui)', cursor: 'pointer' }}>add</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Offline sync banner */}
            {offline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderLeft: '3px solid var(--info)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--info)', flex: 'none', boxShadow: '0 0 8px var(--info)' }} />
                <span style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>offline — check items off, we&apos;ll sync your list later</span>
              </div>
            )}

            {/* Scope segmented control */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', borderRadius: 13, padding: 4 }}>
              {SCOPES.map(s => {
                const active = scope === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setScope(s.key)}
                    style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer', font: '600 12px var(--font-ui)', transition: 'all .16s var(--ease-out)', color: active ? 'var(--on-accent)' : 'var(--sage)', background: active ? 'var(--primary)' : 'transparent' }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Progress */}
            <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', padding: '15px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-.02em', color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{checkedCount}</span> of {total} checked
                </span>
                <span style={{ font: '600 12px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
              </div>
              <div style={{ marginTop: 11, height: 8, borderRadius: 999, background: 'var(--hairline)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#8CE0CE,#43C6AC)', borderRadius: 999, transition: 'width .4s var(--ease-out)' }} />
              </div>
            </div>

            {/* Aisle sections */}
            {sections.map(sec => {
              const SecIcon = sec.Icon;
              return (
                <div key={sec.key}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px 9px' }}>
                    <span style={{ color: sec.tint, display: 'inline-flex' }}><SecIcon size={15} /></span>
                    <span style={microLabel}>{sec.key}</span>
                    <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
                  </div>
                  <div style={{ ...cardStyle, borderRadius: 18, overflow: 'hidden' }}>
                    {sec.items.map((it, i) => {
                      const ck = isChecked(it.name);
                      const last = i === sec.items.length - 1;
                      return (
                        <button
                          key={it.name}
                          onClick={() => toggle(it.name)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', background: 'none', border: 'none', borderBottom: last ? 'none' : '1px solid var(--hairline)', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <span style={{ width: 22, height: 22, flex: 'none', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ck ? 'var(--primary)' : 'transparent', border: ck ? '1px solid var(--primary)' : '1.5px solid var(--divider-strong)' }}>
                            {ck && <Check size={13} strokeWidth={3} color="var(--on-accent)" />}
                          </span>
                          <span style={{ flex: 1, minWidth: 0, font: '600 14px var(--font-ui)', color: ck ? 'var(--muted)' : 'var(--ink)', textDecoration: ck ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {it.name.toLowerCase()}
                          </span>
                          {it.qty ? (
                            <span style={{ flex: 'none', font: '500 12px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', textDecoration: ck ? 'line-through' : 'none', opacity: ck ? 0.6 : 1 }}>
                              {it.qty}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Add-item input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px dashed var(--divider-strong)', borderRadius: 'var(--r-control)', padding: '6px 6px 6px 15px' }}>
              <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Plus size={18} /></span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
                placeholder="add an item"
                style={{ flex: 1, minWidth: 0, height: 40, border: 'none', background: 'none', outline: 'none', color: 'var(--ink)', font: '500 14px var(--font-ui)', fontFamily: 'var(--font-ui)' }}
              />
              <button onClick={addItem} style={{ height: 36, padding: '0 15px', borderRadius: 11, border: 'none', background: 'var(--primary)', color: 'var(--on-accent)', font: '600 13px var(--font-ui)', cursor: 'pointer' }}>add</button>
            </div>

            {/* Action row — clear checked + share list */}
            <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
              <button
                onClick={clearChecked}
                disabled={checkedCount === 0}
                style={{ flex: 1, height: 48, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--sage)', font: '600 14px var(--font-ui)', cursor: checkedCount === 0 ? 'default' : 'pointer', opacity: checkedCount === 0 ? 0.55 : 1 }}
              >
                clear checked
              </button>
              <button
                onClick={share}
                style={{ flex: 1, height: 48, borderRadius: 14, border: 'none', background: 'var(--surface-3)', color: 'var(--ink)', font: '600 14px var(--font-ui)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Share size={16} />share list
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transient toast */}
      {toast && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 88, zIndex: 6, display: 'flex', justifyContent: 'center', animation: 'g-toast .24s var(--ease-out)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '11px 16px', borderRadius: 14, background: 'var(--glass-fill)', border: '1px solid var(--divider-strong)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 18px 40px -18px rgba(0,0,0,.9)' }}>
            <span style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}

// Cart glyph for the empty state — matches the design's inline SVG (open cart outline).
function ShoppingCartIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="18" cy="21" r="1" />
      <path d="M2 3h3l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}
