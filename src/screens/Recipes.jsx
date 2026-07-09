import React, { useMemo, useState } from 'react';
import {
  Search, Heart, ChevronLeft, Clock, Users, Plus, Minus, Utensils,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = { font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)' };
const TINTS = ['#E1A0AB', '#43C6AC', '#E7B67C', '#5FD4C4', '#AEA6EA'];

// Small curated fallback list — only surfaced when the user hasn't saved anything of their own.
const CURATED = [
  {
    title: 'teriyaki salmon bowl', calories: 540, protein: 42, carbs: 38, fat: 22, time: 25, servings: 2,
    ingredients: [
      { name: 'salmon fillet', base: 2, unit: 'fillet' },
      { name: 'brown rice', base: 1, unit: 'cup' },
      { name: 'broccoli', base: 2, unit: 'cups' },
      { name: 'teriyaki sauce', base: 3, unit: 'tbsp' },
      { name: 'sesame oil', base: 1, unit: 'tsp' },
      { name: 'green onion', base: 2, unit: 'stalks' },
    ],
    steps: [
      'cook the brown rice per package directions.',
      'roast broccoli at 425°F for 18 minutes until charred.',
      'sear salmon 4 min per side, brushing with teriyaki.',
      'assemble bowls; top with sesame oil and green onion.',
    ],
  },
  {
    title: 'chicken burrito bowl', calories: 610, protein: 45, carbs: 58, fat: 20, time: 20, servings: 2,
    ingredients: [
      { name: 'chicken breast', base: 2, unit: 'breasts' },
      { name: 'white rice', base: 1, unit: 'cup' },
      { name: 'black beans', base: 1, unit: 'cup' },
      { name: 'salsa', base: 4, unit: 'tbsp' },
      { name: 'avocado', base: 1, unit: 'whole' },
      { name: 'lime', base: 1, unit: 'wedge' },
    ],
    steps: [
      'season and grill the chicken, then slice.',
      'warm the rice and black beans.',
      'build bowls with rice, beans, chicken and salsa.',
      'top with avocado and a squeeze of lime.',
    ],
  },
  {
    title: 'overnight oats', calories: 380, protein: 18, carbs: 52, fat: 11, time: 5, servings: 1,
    ingredients: [
      { name: 'rolled oats', base: 0.5, unit: 'cup' },
      { name: 'greek yogurt', base: 0.5, unit: 'cup' },
      { name: 'milk', base: 0.5, unit: 'cup' },
      { name: 'chia seeds', base: 1, unit: 'tbsp' },
      { name: 'berries', base: 0.5, unit: 'cup' },
      { name: 'honey', base: 1, unit: 'tsp' },
    ],
    steps: [
      'stir oats, yogurt, milk and chia in a jar.',
      'sweeten with honey to taste.',
      'refrigerate overnight, at least 6 hours.',
      'top with berries before eating.',
    ],
  },
  {
    title: 'greek salad', calories: 320, protein: 12, carbs: 18, fat: 24, time: 10, servings: 2,
    ingredients: [
      { name: 'cucumber', base: 1, unit: 'whole' },
      { name: 'cherry tomatoes', base: 1, unit: 'cup' },
      { name: 'red onion', base: 0.5, unit: 'whole' },
      { name: 'feta', base: 0.5, unit: 'cup' },
      { name: 'olives', base: 0.25, unit: 'cup' },
      { name: 'olive oil', base: 2, unit: 'tbsp' },
    ],
    steps: [
      'chop cucumber, tomatoes and red onion.',
      'toss with olives and crumbled feta.',
      'dress with olive oil, oregano and lemon.',
      'season with salt and pepper to taste.',
    ],
  },
];

function fmtAmt(base, scale) {
  const r = Math.round(base * scale * 10) / 10;
  return r % 1 === 0 ? r.toFixed(0) : r.toFixed(1);
}

// Normalize any saved/curated recipe into the shape the viewer needs.
function normalize(r) {
  const title = r.title || r.name || 'recipe';
  return {
    title,
    calories: Number(r.calories) || 0,
    protein: Number(r.protein) || 0,
    carbs: Number(r.carbs) || 0,
    fat: Number(r.fat) || 0,
    time: Number(r.time) || 0,
    servings: Math.max(1, Number(r.servings) || 1),
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    steps: Array.isArray(r.steps)
      ? r.steps
      : Array.isArray(r.instructions) ? r.instructions : [],
    _raw: r,
  };
}

export function Recipes({ onFab }) {
  const { recipes, savedRecipes, saveRecipe, logMeal, setActiveTab } = useApp();
  useMacros(); // keep the screen in the macro-aware surface even though totals are per-recipe

  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const [servings, setServings] = useState(1);
  const [toast, setToast] = useState(null);
  const toastRef = React.useRef(null);

  const showToast = (msg) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(msg);
    toastRef.current = setTimeout(() => setToast(null), 1800);
  };
  React.useEffect(() => () => { if (toastRef.current) clearTimeout(toastRef.current); }, []);

  // The user's own book: savedRecipes + the extended recipes store, de-duped by title.
  const userBook = useMemo(() => {
    const seen = new Set();
    const out = [];
    [...(savedRecipes || []), ...(recipes || [])].forEach(r => {
      const n = normalize(r);
      const key = n.title.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(n);
    });
    return out;
  }, [savedRecipes, recipes]);

  const hasSaved = userBook.length > 0;
  const book = useMemo(() => (hasSaved ? userBook : CURATED.map(normalize)), [hasSaved, userBook]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return book;
    return book.filter(r => r.title.toLowerCase().includes(q));
  }, [book, query]);

  const isSaved = (r) => (recipes || []).some(x => (x.title || x.name || '').toLowerCase() === r.title.toLowerCase())
    || (savedRecipes || []).some(x => (x.title || x.name || '').toLowerCase() === r.title.toLowerCase());

  const openViewer = (r) => {
    setServings(r.servings || 1);
    setOpenIndex(r);
  };
  const active = openIndex; // the normalized recipe currently open, or null

  const onSave = (r) => {
    if (isSaved(r)) { showToast('already in your book'); return; }
    saveRecipe(r._raw || { title: r.title, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat });
    showToast(`saved ${r.title}`);
  };

  const onLog = (r) => {
    const scale = r.servings > 0 ? servings / r.servings : 1;
    logMeal({
      name: r.title,
      calories: r.calories * scale,
      protein: r.protein * scale,
      carbs: r.carbs * scale,
      fat: r.fat * scale,
      source: 'recipe',
    });
    showToast(`logged ${r.title}`);
  };

  const onAddToPlan = (r) => {
    if (!isSaved(r)) {
      saveRecipe(r._raw || { title: r.title, calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat });
    }
    showToast('added to your plan');
    if (onFab) onFab(); else setActiveTab('meals');
  };

  return (
    <>
      <div style={{ height: 12 }} />

      {/* Top bar: title + search */}
      <div style={{ flex: 'none', padding: '6px 20px 12px', position: 'relative', zIndex: 2 }}>
        {active ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setOpenIndex(null)} aria-label="Back to recipe book" style={{
              width: 38, height: 38, flex: 'none', borderRadius: 999, border: '1px solid var(--glass-border)',
              background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              recipe
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: 'var(--ink)' }}>recipes</div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, height: 46, padding: '0 14px', borderRadius: 'var(--r-control)', background: 'var(--surface-2)', border: '1px solid var(--glass-border)' }}>
              <span style={{ color: 'var(--sage)', display: 'inline-flex', flex: 'none' }}><Search size={18} /></span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search recipes"
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', font: '500 14px var(--font-ui)' }}
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search" style={{ flex: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', font: '500 12px var(--font-ui)' }}>clear</button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>
        {active
          ? <Viewer
              recipe={active}
              servings={servings}
              setServings={setServings}
              saved={isSaved(active)}
              onToggleSave={() => onSave(active)}
              onLog={() => onLog(active)}
              onAddToPlan={() => onAddToPlan(active)}
            />
          : <Book
              recipes={filtered}
              query={query}
              hasSaved={hasSaved}
              savedCount={userBook.length}
              isSaved={isSaved}
              onOpen={openViewer}
              onSave={onSave}
            />}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 'calc(var(--nav-safe-pad) + 8px)', zIndex: 9, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '12px 17px', borderRadius: 14, background: 'var(--glass-fill)', border: '1px solid var(--divider-strong)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 18px 40px -18px rgba(0,0,0,.9)' }}>
            <span style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Book (grid) ---------- */

function Book({ recipes, query, hasSaved, savedCount, isSaved, onOpen, onSave }) {
  if (!recipes.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', gap: 6, minHeight: 420 }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(225,160,171,.30), rgba(15,148,130,.10) 60%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={40} color="var(--macro-fat)" strokeWidth={1.6} />
        </div>
        <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', color: 'var(--ink)' }}>
          {query ? 'no matches' : 'no saved recipes'}
        </div>
        <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 250, lineHeight: 1.5 }}>
          {query ? 'try a different search.' : 'save recipes and they\'ll show up in your book here.'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '-.01em', color: 'var(--ink)' }}>
          {hasSaved ? 'recipe book' : 'discover'}
        </div>
        <div style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>
          {hasSaved ? `${savedCount} saved` : 'curated picks'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {recipes.map((r, i) => {
          const saved = isSaved(r);
          const thumb = `linear-gradient(150deg,${TINTS[i % TINTS.length]},var(--brand-forest))`;
          const meta = `${Math.round(r.calories)} kcal${r.time ? ` · ${r.time} min` : ''}`;
          return (
            <button
              key={r.title + i}
              onClick={() => onOpen(r)}
              style={{ textAlign: 'left', ...cardStyle, borderRadius: 'var(--r-tile)', overflow: 'hidden', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ height: 88, position: 'relative', background: thumb, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Utensils size={26} color="rgba(255,255,255,.85)" strokeWidth={1.5} />
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={saved ? 'Saved' : 'Save recipe'}
                  onClick={(e) => { e.stopPropagation(); onSave(r); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onSave(r); } }}
                  style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 999, background: 'rgba(7,13,12,.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: saved ? 'var(--macro-fat)' : '#EAF1EF' }}
                >
                  <Heart size={15} fill={saved ? 'var(--macro-fat)' : 'none'} strokeWidth={1.9} />
                </span>
              </div>
              <div style={{ padding: '11px 12px 13px' }}>
                <div style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                <div style={{ marginTop: 5, font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{meta}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ font: '600 11px var(--font-ui)', color: 'var(--macro-protein)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.protein)}p</span>
                  <span style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.carbs)}c {Math.round(r.fat)}f</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Viewer (sheet) ---------- */

function Viewer({ recipe, servings, setServings, saved, onToggleSave, onLog, onAddToPlan }) {
  const scale = recipe.servings > 0 ? servings / recipe.servings : 1;
  const thumb = `linear-gradient(150deg,${TINTS[0]},var(--brand-forest))`;

  const macros = [
    { key: 'kcal', val: Math.round(recipe.calories), color: 'var(--macro-cal)' },
    { key: 'protein', val: Math.round(recipe.protein), color: 'var(--macro-protein)' },
    { key: 'carbs', val: Math.round(recipe.carbs), color: 'var(--macro-carbs)' },
    { key: 'fat', val: Math.round(recipe.fat), color: 'var(--macro-fat)' },
  ];

  const ingredients = recipe.ingredients;
  const steps = recipe.steps;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 172, borderRadius: 'var(--r-card)', overflow: 'hidden', background: thumb, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Utensils size={48} color="rgba(255,255,255,.8)" strokeWidth={1.3} />
        <button
          onClick={onToggleSave}
          aria-label={saved ? 'Saved' : 'Save recipe'}
          style={{ position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: 999, border: 'none', background: 'rgba(7,13,12,.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: saved ? 'var(--macro-fat)' : '#EAF1EF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Heart size={17} fill={saved ? 'var(--macro-fat)' : 'none'} strokeWidth={1.9} />
        </button>
      </div>

      {/* Title + meta */}
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em', color: 'var(--ink)' }}>{recipe.title}</div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 14, font: '500 12px var(--font-ui)', color: 'var(--sage)', flexWrap: 'wrap' }}>
          {recipe.time > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={14} />{recipe.time} min</span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontVariantNumeric: 'tabular-nums' }}>
            <Users size={14} />{servings} {servings === 1 ? 'serving' : 'servings'}
          </span>
        </div>
      </div>

      {/* Per-serving macros */}
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-control)', padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
        {macros.map(m => (
          <div key={m.key}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-.02em', color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.val}</div>
            <div style={{ font: '600 9px var(--font-ui)', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sage)' }}>{m.key}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: -8, textAlign: 'center', font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>per serving</div>

      {/* Ingredients + servings scaler */}
      {ingredients.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={microLabel}>ingredients</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setServings(s => Math.max(1, s - 1))}
                aria-label="Fewer servings"
                style={scalerBtn}
              ><Minus size={15} /></button>
              <span style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', minWidth: 56, textAlign: 'center' }}>
                {servings} {servings === 1 ? 'serving' : 'servings'}
              </span>
              <button
                onClick={() => setServings(s => Math.min(12, s + 1))}
                aria-label="More servings"
                style={scalerBtn}
              ><Plus size={15} /></button>
            </div>
          </div>
          <div style={{ marginTop: 10, ...cardStyle, borderRadius: 'var(--r-control)', overflow: 'hidden' }}>
            {ingredients.map((ig, i) => {
              const label = typeof ig === 'string' ? ig : ig.name;
              const amt = typeof ig === 'string' || ig.base == null
                ? null
                : `${fmtAmt(ig.base, scale)} ${ig.unit || ''}`.trim();
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: i < ingredients.length - 1 ? '1px solid var(--hairline)' : 'none' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--brand-jade)', flex: 'none' }} />
                  <span style={{ flex: 1, font: '500 14px var(--font-ui)', color: 'var(--ink)' }}>{label}</span>
                  {amt && <span style={{ font: '600 13px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>{amt}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Method */}
      {steps.length > 0 && (
        <div>
          <div style={microLabel}>method</div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((sp, i) => (
              <div key={i} style={{ display: 'flex', gap: 12 }}>
                <span style={{ width: 24, height: 24, flex: 'none', borderRadius: 999, background: 'rgba(67,198,172,.14)', color: 'var(--brand-jade)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 12px var(--font-display)' }}>{i + 1}</span>
                <span style={{ flex: 1, font: '500 14px var(--font-ui)', color: 'var(--ink)', lineHeight: 1.5 }}>{typeof sp === 'string' ? sp : sp.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 4, display: 'flex', gap: 10 }}>
        <button
          onClick={onLog}
          style={{ flex: 1, height: 52, border: 'none', borderRadius: 'var(--r-control)', background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)' }}
        >log now</button>
        <button
          onClick={onAddToPlan}
          style={{ flex: 1, height: 52, borderRadius: 'var(--r-control)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)', font: '600 15px var(--font-ui)', cursor: 'pointer' }}
        >add to plan</button>
      </div>
    </div>
  );
}

const scalerBtn = {
  width: 30, height: 30, borderRadius: 999, border: '1px solid var(--glass-border)',
  background: 'var(--surface-2)', color: 'var(--ink)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
