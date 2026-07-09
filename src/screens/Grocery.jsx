import React, { useMemo, useState } from 'react';
import {
  ChevronLeft, ShoppingCart, Plus, Check, Trash2, Apple, Beef, Wheat, Package,
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

export function Grocery({ onFab }) {
  const {
    plan, groceryList, setGroceryList, groceryChecked, setGroceryChecked, setActiveTab,
  } = useApp();

  // onFab is provided by the shell for the center action button; nav here uses setActiveTab.
  void onFab;

  const [draft, setDraft] = useState('');

  // Derive the working item list. Prefer plan ingredients; fall back to groceryList state.
  // Each item: { name, qty, aisle }.
  const items = useMemo(() => {
    const out = [];
    const seen = new Set();
    const push = (name, qty, aisle) => {
      const key = (name || '').trim().toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push({ name: name.trim(), qty: qty || '', aisle: aisle || classify(name) });
    };

    const planIngredients = (plan?.meals || []).flatMap(m => m.ingredients || []);
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
  }, [plan, groceryList]);

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
  };

  const addItem = () => {
    const name = draft.trim();
    if (!name) return;
    setGroceryList(prev => {
      const list = prev || [];
      if (list.some(g => ((typeof g === 'string' ? g : g?.name) || '').trim().toLowerCase() === name.toLowerCase())) return list;
      return [...list, { name, quantity: '', category: classify(name), checked: false }];
    });
    setDraft('');
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

  return (
    <>
      <div style={{ height: 12 }} />

      {/* Top bar */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setActiveTab('meals')}
            aria-label="Back to plans"
            style={{ width: 38, height: 38, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--ink)' }}>grocery</div>
        </div>
        <button
          onClick={clearChecked}
          disabled={checkedCount === 0}
          aria-label="Clear checked items"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 13px', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', color: checkedCount === 0 ? 'var(--muted)' : 'var(--sage)', font: '600 12px var(--font-ui)', cursor: checkedCount === 0 ? 'default' : 'pointer', opacity: checkedCount === 0 ? 0.6 : 1 }}
        >
          <Trash2 size={15} />clear
        </button>
      </div>

      {/* Scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {empty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', gap: 6, minHeight: 460 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(231,182,124,.3), rgba(15,148,130,.1) 60%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
              <ShoppingCart size={42} strokeWidth={1.5} />
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
                  <div style={{ ...cardStyle, borderRadius: 'var(--r-tile)', overflow: 'hidden' }}>
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

            {/* Sticky add-item input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px dashed var(--divider-strong)', borderRadius: 'var(--r-control)', padding: '6px 6px 6px 15px', position: 'sticky', bottom: 8, zIndex: 3, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
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

            {/* Clear checked action */}
            <button
              onClick={clearChecked}
              disabled={checkedCount === 0}
              style={{ width: '100%', height: 48, borderRadius: 'var(--r-control)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--sage)', font: '600 14px var(--font-ui)', cursor: checkedCount === 0 ? 'default' : 'pointer', opacity: checkedCount === 0 ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Trash2 size={16} />clear checked
            </button>
          </div>
        )}
      </div>
    </>
  );
}
