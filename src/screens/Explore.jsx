import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, Plus, Check, Flame, Clock, MapPin, Leaf, ChefHat, Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';

const shimmerTile = {
  background: 'linear-gradient(100deg,var(--surface-2) 30%,var(--surface-3) 50%,var(--surface-2) 70%)',
  backgroundSize: '200% 100%',
  animation: 'vd-shimmer 1.4s linear infinite',
};

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const sectionTitle = { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-.01em', color: 'var(--ink)' };

const TINTS = ['#5FD4C4', '#43C6AC', '#E7B67C', '#AEA6EA', '#0F9482', '#E1A0AB'];
const tintGrad = (i) => `linear-gradient(150deg,${TINTS[i % TINTS.length]},var(--brand-forest))`;

// Curated fallbacks used when the user hasn't logged enough real meals yet.
const CURATED = [
  { name: 'greek yogurt', calories: 120, protein: 17, carbs: 7, fat: 0 },
  { name: 'chicken breast', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: '2 eggs', calories: 140, protein: 12, carbs: 1, fat: 10 },
  { name: 'oats', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: 'banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'almonds', calories: 170, protein: 6, carbs: 6, fat: 15 },
];

const TRENDING = [
  { name: 'greek yogurt', calories: 120, protein: 17, carbs: 7, fat: 0 },
  { name: 'grilled chicken', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: 'banana', calories: 105, protein: 1, carbs: 27, fat: 0 },
  { name: 'protein latte', calories: 190, protein: 15, carbs: 18, fat: 6 },
  { name: 'avocado', calories: 240, protein: 3, carbs: 12, fat: 22 },
  { name: 'blueberries', calories: 85, protein: 1, carbs: 21, fat: 0 },
];

const RESTAURANTS = [
  { name: 'sweetgreen', cuisine: 'salads & bowls', letter: 'S' },
  { name: 'chipotle', cuisine: 'mexican', letter: 'C' },
  { name: 'cava', cuisine: 'mediterranean', letter: 'V' },
];

const SEASONAL = [
  { name: 'peaches', calories: 60, protein: 1, carbs: 15, fat: 0 },
  { name: 'sweet corn', calories: 90, protein: 3, carbs: 19, fat: 1 },
  { name: 'tomatoes', calories: 22, protein: 1, carbs: 5, fat: 0 },
  { name: 'zucchini', calories: 33, protein: 2, carbs: 6, fat: 1 },
  { name: 'watermelon', calories: 46, protein: 1, carbs: 11, fat: 0 },
];

const CATS = ['all', 'trending', 'high protein', 'quick', 'seasonal', 'recipes', 'snacks'];

export function Explore({ onFab }) {
  const {
    dailyLog, logMeal, recipes, savedRecipes, saveRecipe,
    isPremiumActive, openPremiumModal, setActiveTab,
  } = useApp();
  useMacros(); // keep the screen subscribed to macro data shape

  const [cat, setCat] = useState('all');
  const [toast, setToast] = useState(null);

  // Live connectivity — drives the offline banner and the loading skeleton.
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);
  const offline = !online;

  const showToast = (msg) => {
    setToast(msg);
    if (showToast._t) clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 2000);
  };

  const openLog = () => (onFab ? onFab() : setActiveTab('log'));

  // Switching category briefly shows the skeleton (mirrors the design's loading state)
  // while results settle. Skip the flash when offline (nothing to fetch).
  const selectCat = (c) => {
    setCat(c);
    if (c === cat || offline) return;
    setLoading(true);
    if (selectCat._t) clearTimeout(selectCat._t);
    selectCat._t = setTimeout(() => setLoading(false), 420);
  };

  const addFood = (food) => {
    logMeal({ ...food, source: 'explore' });
    showToast(`added ${food.name} to today`);
  };

  // Build quick-add from real logged meals (frequency-ranked), fall back to curated.
  const quick = useMemo(() => {
    const meals = dailyLog?.meals || [];
    const map = new Map();
    for (const m of meals) {
      const key = (m.name || '').trim().toLowerCase();
      if (!key) continue;
      const prev = map.get(key);
      if (prev) prev.count += 1;
      else map.set(key, {
        name: key,
        calories: Math.round(m.calories || 0),
        protein: Math.round(m.protein || 0),
        carbs: Math.round(m.carbs || 0),
        fat: Math.round(m.fat || 0),
        count: 1,
      });
    }
    const fromLog = [...map.values()].sort((a, b) => b.count - a.count);
    if (fromLog.length === 0) return [];
    // Top up to 6 with curated items not already present.
    const names = new Set(fromLog.map(q => q.name));
    const filler = CURATED.filter(c => !names.has(c.name));
    return [...fromLog, ...filler].slice(0, 6);
  }, [dailyLog]);

  const quickIsEmpty = quick.length === 0;

  // Recipe inspiration from real recipes, fall back to a small curated pair.
  const recipeCards = useMemo(() => {
    const src = (recipes && recipes.length ? recipes : savedRecipes) || [];
    if (src.length) {
      return src.slice(0, 3).map((r, i) => ({
        raw: r,
        title: (r.name || r.title || 'recipe').toLowerCase(),
        calories: Math.round(r.calories || 0),
        protein: Math.round(r.protein || 0),
        servings: r.servings || r.mealsPerDay || null,
        time: r.time || r.cookTime || '25 min',
        tint: i,
      }));
    }
    return [
      { raw: { name: 'sheet-pan salmon', calories: 540, protein: 42, servings: 4 }, title: 'sheet-pan salmon', calories: 540, protein: 42, servings: 4, time: '25 min', tint: 5 },
      { raw: { name: 'high-protein burrito bowl', calories: 610, protein: 48, servings: 2 }, title: 'high-protein burrito bowl', calories: 610, protein: 48, servings: 2, time: '20 min', tint: 1 },
    ];
  }, [recipes, savedRecipes]);

  const premium = typeof isPremiumActive === 'function' ? isPremiumActive() : false;

  // Category chips lightly filter which sections are emphasized. 'all' shows everything.
  const show = (key) => cat === 'all' || cat === key;
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long' }).toLowerCase();

  return (
    <>
      <div style={{ height: 12 }} />

      {/* top bar */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: 'var(--ink)' }}>explore</div>
      </div>

      {/* scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {/* offline banner */}
        {offline && (
          <div style={{ margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--glass-border)', borderLeft: '3px solid var(--info)' }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--info)', flex: 'none', boxShadow: '0 0 8px var(--info)' }} />
            <span style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>you're offline — showing saved picks</span>
          </div>
        )}

        {/* search-prompt field → opens log (sticky) */}
        <div style={{ position: 'sticky', top: 0, zIndex: 3 }}>
          <button
            onClick={openLog}
            style={{ width: '100%', height: 48, borderRadius: 'var(--r-control)', border: '1px solid var(--glass-border)', background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 15px', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Search size={19} /></span>
            <span style={{ font: '500 14px var(--font-ui)', color: 'var(--muted)' }}>search foods, recipes, restaurants</span>
          </button>
        </div>

        {/* category chips */}
        <div
          className="no-scrollbar"
          style={{
            display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 0 4px',
            WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 14px,#000 calc(100% - 26px),transparent)',
            maskImage: 'linear-gradient(90deg,transparent,#000 14px,#000 calc(100% - 26px),transparent)',
          }}
        >
          {CATS.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => selectCat(c)}
                style={{
                  flex: 'none', padding: '8px 15px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap',
                  font: '600 13px var(--font-ui)', transition: 'all .16s var(--ease-out)',
                  color: active ? 'var(--on-accent)' : 'var(--sage)',
                  background: active ? 'var(--primary)' : 'var(--surface-2)',
                  border: active ? '1px solid transparent' : '1px solid var(--glass-border)',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* loading skeleton */}
        {loading && (
          <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ ...shimmerTile, width: 132, height: 130, borderRadius: 18 }} />
              <div style={{ ...shimmerTile, width: 132, height: 130, borderRadius: 18 }} />
              <div style={{ ...shimmerTile, width: 132, height: 130, borderRadius: 18 }} />
            </div>
            <div style={{ ...shimmerTile, height: 104, borderRadius: 20 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ ...shimmerTile, height: 60, borderRadius: 16 }} />
              <div style={{ ...shimmerTile, height: 60, borderRadius: 16 }} />
              <div style={{ ...shimmerTile, height: 60, borderRadius: 16 }} />
              <div style={{ ...shimmerTile, height: 60, borderRadius: 16 }} />
            </div>
          </div>
        )}

        {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingTop: 16 }}>

          {/* trending now */}
          {show('trending') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
                <span style={{ color: 'var(--warning)', display: 'inline-flex' }}><Flame size={16} /></span>
                <div style={sectionTitle}>trending now</div>
              </div>
              {offline ? (
                <div style={{ padding: 20, borderRadius: 18, border: '1px dashed var(--glass-border)', textAlign: 'center', font: '500 13px var(--font-ui)', color: 'var(--muted)' }}>
                  trending needs a connection
                </div>
              ) : (
              <div className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 0 4px', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 16px,#000 calc(100% - 24px),transparent)', maskImage: 'linear-gradient(90deg,transparent,#000 16px,#000 calc(100% - 24px),transparent)' }}>
                {TRENDING.map((t, i) => (
                  <div key={t.name} style={{ ...cardStyle, flex: 'none', width: 134, borderRadius: 18, overflow: 'hidden' }}>
                    <div style={{ height: 78, background: tintGrad(i), position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,.85)', display: 'inline-flex' }}><ChefHat size={24} strokeWidth={1.5} /></span>
                      <button
                        onClick={() => addFood(t)}
                        aria-label={`Add ${t.name}`}
                        style={{ position: 'absolute', top: 7, right: 7, width: 26, height: 26, borderRadius: 999, border: 'none', background: 'var(--primary)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Plus size={14} strokeWidth={2.6} />
                      </button>
                    </div>
                    <div style={{ padding: '9px 11px 11px' }}>
                      <div style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                      <div style={{ marginTop: 2, font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{t.calories} kcal · {t.protein}g protein</div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* recipe inspiration → meals tab */}
          {show('recipes') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
                <div style={sectionTitle}>recipe inspiration</div>
                <button onClick={() => setActiveTab('meals')} style={{ font: '600 13px var(--font-ui)', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>see all</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recipeCards.map((r) => (
                  <div key={r.title} style={{ ...cardStyle, display: 'flex', gap: 12, borderRadius: 20, padding: 10 }}>
                    <div style={{ width: 86, height: 86, flex: 'none', borderRadius: 14, background: tintGrad(r.tint), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,.85)', display: 'inline-flex' }}><ChefHat size={26} strokeWidth={1.5} /></span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ font: '600 15px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                      <div style={{ marginTop: 3, font: '500 12px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                        {r.calories} kcal · {r.protein}g protein{r.servings ? ` · ${r.servings} servings` : ''}
                      </div>
                      <div style={{ marginTop: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '600 11px var(--font-ui)', color: 'var(--sage)' }}>
                          <Clock size={13} />{r.time}
                        </span>
                        <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--muted)' }} />
                        <button
                          onClick={() => { if (r.raw && saveRecipe) saveRecipe(r.raw); setActiveTab('meals'); }}
                          style={{ font: '600 11px var(--font-ui)', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          add to plan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* restaurants near you — Plato Plus teaser */}
          <div>
            <div style={{ ...cardStyle, position: 'relative', borderRadius: 'var(--r-card)', padding: '16px 16px 4px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><MapPin size={16} /></span>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-.01em', color: 'var(--ink)' }}>restaurants near you</div>
                </div>
                <span style={{ padding: '4px 9px', borderRadius: 999, background: 'rgba(231,182,124,.15)', color: 'var(--warning)', font: '700 9px var(--font-ui)', letterSpacing: '.12em', textTransform: 'uppercase' }}>Plato Plus</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, paddingBottom: premium ? 8 : 44 }}>
                {RESTAURANTS.map((v, i) => (
                  <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, flex: 'none', borderRadius: 11, background: `linear-gradient(140deg,${TINTS[i % TINTS.length]},var(--brand-mint))`, color: '#04231C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>{v.letter}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)' }}>{v.name}</div>
                      <div style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)' }}>{v.cuisine} · macros for every item</div>
                    </div>
                  </div>
                ))}
              </div>
              {!premium && (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 74, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14, background: 'linear-gradient(180deg,transparent,var(--glass-scrim) 60%)' }}>
                  <button
                    onClick={() => openPremiumModal && openPremiumModal()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 18px', borderRadius: 999, background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 13px var(--font-ui)', border: 'none', cursor: 'pointer', boxShadow: '0 10px 24px -10px rgba(67,198,172,.6)' }}
                  >
                    <Lock size={14} strokeWidth={2.2} />unlock nearby spots
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* in-season produce */}
          {show('seasonal') && (
            <div>
              <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: 'var(--success)', display: 'inline-flex' }}><Leaf size={16} /></span>
                  <span style={{ font: '600 10px var(--font-ui)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sage)' }}>in season · {monthLabel}</span>
                </div>
                <div style={{ marginTop: 10, font: '500 14px var(--font-ui)', color: 'var(--ink)', lineHeight: 1.5 }}>
                  peak-season produce is cheaper, sweeter, and higher in nutrients. tap to add today.
                </div>
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SEASONAL.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => addFood(s)}
                      style={{ padding: '8px 13px', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)', font: '600 13px var(--font-ui)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Plus size={12} strokeWidth={2.4} /></span>{s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* quick add — from real logged meals */}
          {show('quick') && (
            <div>
              <div style={{ ...sectionTitle, marginBottom: 11 }}>quick add</div>
              {quickIsEmpty ? (
                <div style={{ padding: '26px 20px', borderRadius: 18, border: '1px dashed var(--glass-border)', textAlign: 'center' }}>
                  <div style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)' }}>nothing here yet</div>
                  <div style={{ marginTop: 4, font: '400 13px var(--font-ui)', color: 'var(--sage)' }}>log a meal or two and your quick-adds show up here.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {quick.map((q, i) => (
                    <button
                      key={q.name}
                      onClick={() => addFood(q)}
                      style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--r-control)', padding: '11px 12px', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ width: 34, height: 34, flex: 'none', borderRadius: 10, background: tintGrad(i), boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.name}</div>
                        <div style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{q.calories} kcal</div>
                      </div>
                      <span style={{ color: 'var(--primary)', display: 'inline-flex', flex: 'none' }}><Plus size={18} strokeWidth={2.2} /></span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
        )}
      </div>

      {/* quick-add confirmation toast */}
      {toast && (
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 'calc(var(--nav-safe-pad, 92px))', zIndex: 6, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '11px 16px', borderRadius: 14, background: 'var(--glass-fill)', border: '1px solid var(--divider-strong)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 18px 40px -18px rgba(0,0,0,.9)', animation: 'slideUp .24s var(--ease-out)' }}>
            <span style={{ width: 19, height: 19, borderRadius: 999, background: 'var(--success)', color: 'var(--on-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
              <Check size={12} strokeWidth={3} />
            </span>
            <span style={{ font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>{toast}</span>
          </div>
        </div>
      )}
    </>
  );
}
