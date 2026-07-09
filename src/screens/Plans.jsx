import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Upload, Lock, Utensils, CalendarDays, ShoppingCart,
  Plus, Check, ArrowRightLeft, Heart, Sparkles, ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';

const cardStyle = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = { font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--sage)' };

const MACRO_GRADS = {
  calories: 'var(--macro-carbs-grad, linear-gradient(90deg,#8CE0CE,#43C6AC))',
  protein: 'var(--macro-protein-grad, linear-gradient(90deg,#5FD4C4,#43C6AC))',
  carbs: 'var(--macro-carbs-grad, linear-gradient(90deg,#F0CC9C,#E7B67C))',
  fat: 'var(--macro-fat-grad, linear-gradient(90deg,#ECBFC6,#E1A0AB))',
};
const CAL_GRAD = 'linear-gradient(90deg,#8CE0CE,#43C6AC)';
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TINTS = ['#5FD4C4', '#43C6AC', '#E1A0AB', '#E7B67C', '#AEA6EA'];

function tabStyle(active) {
  return {
    flex: 1, padding: '10px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
    font: '600 13px var(--font-ui)', transition: 'all .16s var(--ease-out)',
    color: active ? 'var(--on-accent)' : 'var(--sage)',
    background: active ? 'var(--primary)' : 'transparent',
  };
}
function iconBtnStyle() {
  return {
    width: 38, height: 38, borderRadius: 999, border: '1px solid var(--glass-border)',
    background: 'var(--glass-fill)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  };
}

export function Plans({ onFab }) {
  const {
    plan, dailyLog, logMeal, setActiveTab,
    recipes, savedRecipes, saveRecipe,
    isPremiumActive, openPremiumModal,
  } = useApp();
  const { targets, current } = useMacros();

  const [tab, setTab] = useState('week'); // week | recipes | restaurant

  const per = plan?.mealsPerDay || 3;
  const todayIndex = useMemo(() => {
    if (!plan?.createdAt) return new Date().getDay();
    const created = new Date(plan.createdAt);
    const elapsed = Math.floor((Date.now() - created.getTime()) / 86400000);
    return (created.getDay() + Math.max(0, elapsed)) % 7;
  }, [plan]);

  const [selectedDay, setSelectedDay] = useState(todayIndex);

  // Meals for the selected day, grouped from the flat plan.meals array.
  const dayMeals = useMemo(() => {
    if (!plan?.meals?.length) return [];
    const start = selectedDay * per;
    return plan.meals.slice(start, start + per);
  }, [plan, selectedDay, per]);

  const isLogged = (name) => (dailyLog?.meals || []).some(
    m => (m.name || '').toLowerCase() === (name || '').toLowerCase()
  );

  // Day macro totals for the selected day (sum of that day's planned meals).
  const dayTotals = useMemo(() => {
    return dayMeals.reduce((acc, m) => ({
      calories: acc.calories + (Number(m.calories) || 0),
      protein: acc.protein + (Number(m.protein) || 0),
      carbs: acc.carbs + (Number(m.carbs) || 0),
      fat: acc.fat + (Number(m.fat) || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [dayMeals]);

  // For the day the user has actually been logging, compare live logged intake vs targets.
  const viewingToday = selectedDay === todayIndex;
  const summaryValues = viewingToday ? current : dayTotals;

  const goToGenerate = () => setActiveTab('meals');
  const goImport = () => (onFab ? onFab() : setActiveTab('log'));

  return (
    <>
      <div style={{ height: 12 }} />

      {/* Top bar */}
      <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px 10px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-.02em', color: 'var(--ink)' }}>plans</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={goToGenerate} aria-label="Regenerate plan" style={iconBtnStyle()}><RefreshCw size={18} /></button>
          <button onClick={() => setActiveTab('grocery')} aria-label="Grocery list" style={iconBtnStyle()}><Upload size={17} /></button>
        </div>
      </div>

      {/* Segmented tabs */}
      <div style={{ flex: 'none', padding: '0 20px 12px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 14, padding: 4, gap: 3 }}>
          <button onClick={() => setTab('week')} style={tabStyle(tab === 'week')}>my plan</button>
          <button onClick={() => setActiveTab('recipes')} style={tabStyle(false)}>recipes</button>
          <button onClick={() => setActiveTab('restaurant')} style={tabStyle(false)}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
              restaurant
              <span style={{ color: 'var(--warning)', display: 'inline-flex' }}><Lock size={12} /></span>
            </span>
          </button>
        </div>
      </div>

      {/* Scroll region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2px 18px var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>

        {tab === 'week' && (
          plan?.meals?.length ? (
            <WeekView
              plan={plan}
              per={per}
              todayIndex={todayIndex}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              dayMeals={dayMeals}
              summaryValues={summaryValues}
              targets={targets}
              viewingToday={viewingToday}
              isLogged={isLogged}
              logMeal={logMeal}
              onGrocery={() => setActiveTab('grocery')}
              onRegenerate={goToGenerate}
              onImport={goImport}
            />
          ) : (
            <EmptyWeek onGenerate={goToGenerate} />
          )
        )}

        {tab === 'recipes' && (
          <RecipesView recipes={recipes} savedRecipes={savedRecipes} saveRecipe={saveRecipe} />
        )}

        {tab === 'restaurant' && (
          isPremiumActive()
            ? <RestaurantUnlocked />
            : <RestaurantLock onUnlock={openPremiumModal} />
        )}
      </div>
    </>
  );
}

/* ---------- My plan (week) ---------- */

function WeekView({ plan, per, todayIndex, selectedDay, setSelectedDay, dayMeals, summaryValues, targets, viewingToday, isLogged, logMeal, onGrocery, onRegenerate, onImport }) {
  const dayCount = Math.max(1, Math.ceil((plan.meals?.length || 0) / per));
  const days = Array.from({ length: Math.min(7, dayCount) });

  const calTarget = targets.calories || 2000;
  const onTrack = (summaryValues.calories || 0) <= calTarget * 1.1;

  const summaryRows = [
    { key: 'calories', label: 'calories', val: summaryValues.calories || 0, tgt: calTarget },
    { key: 'protein', label: 'protein', val: summaryValues.protein || 0, tgt: targets.protein || 0 },
    { key: 'carbs', label: 'carbs', val: summaryValues.carbs || 0, tgt: targets.carbs || 0 },
    { key: 'fat', label: 'fat', val: summaryValues.fat || 0, tgt: targets.fat || 0 },
  ];

  const anyLogged = dayMeals.some(m => isLogged(m.name));
  const loggedCals = dayMeals.filter(m => isLogged(m.name)).reduce((s, m) => s + (Number(m.calories) || 0), 0);
  const plannedCals = dayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '-.01em', color: 'var(--ink)' }}>
            {(plan.name || 'your week').toLowerCase()}
          </div>
          <div style={{ marginTop: 2, font: '500 12px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>
            {(targets.calories || 2000).toLocaleString()} cal/day · {Math.round(targets.protein || 0)}g protein target
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--sage)', font: '600 11px var(--font-ui)', flex: 'none' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: onTrack ? 'var(--success)' : 'var(--danger)' }} />
          {onTrack ? 'on track' : 'over target'}
        </div>
      </div>

      {/* Day selector pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
        {days.map((_, i) => {
          const sel = selectedDay === i;
          const isToday = i === todayIndex;
          // ring fill: logged progress only meaningful for today, otherwise plan completeness
          const dMeals = (plan.meals || []).slice(i * per, i * per + per);
          const dPlanned = dMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0);
          const dLogged = isToday
            ? dMeals.filter(m => isLogged(m.name)).reduce((s, m) => s + (Number(m.calories) || 0), 0)
            : 0;
          const pct = dPlanned > 0 ? Math.min(100, Math.round((dLogged / dPlanned) * 100)) : 0;
          const ring = pct > 0
            ? `conic-gradient(var(--primary) 0% ${pct}%, var(--divider-strong) ${pct}% 100%)`
            : 'var(--divider-strong)';
          return (
            <button key={i} onClick={() => setSelectedDay(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1 }}>
              <div style={{ width: 42, height: 42, borderRadius: 999, padding: 3, background: ring }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  font: '700 13px var(--font-ui)',
                  background: sel ? 'var(--primary)' : 'var(--surface-1)',
                  color: sel ? 'var(--on-accent)' : 'var(--ink)',
                }}>{DAY_LETTERS[i % 7]}</div>
              </div>
              <span style={{ font: '600 11px var(--font-ui)', color: isToday ? 'var(--ink)' : 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                {isToday ? 'today' : `d${i + 1}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day macro summary vs targets */}
      <div style={{ ...cardStyle, borderRadius: 'var(--r-card)', padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 14px' }}>
          {summaryRows.map(s => {
            const over = s.tgt > 0 && s.val > s.tgt;
            const pct = s.tgt > 0 ? Math.min(100, Math.round((s.val / s.tgt) * 100)) : 0;
            const grad = s.key === 'calories' ? CAL_GRAD : MACRO_GRADS[s.key];
            const unit = s.key === 'calories' ? '' : 'g';
            return (
              <div key={s.key}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ font: '600 10px var(--font-ui)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sage)' }}>{s.label}</span>
                  <span style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>/{Math.round(s.tgt).toLocaleString()}{unit}</span>
                </div>
                <div style={{ marginTop: 3, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-.02em', color: over ? 'var(--danger)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round(s.val).toLocaleString()}{unit}
                </div>
                <div style={{ marginTop: 7, position: 'relative', height: 6, borderRadius: 999, background: 'var(--hairline)', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: over ? 'var(--danger)' : grad, borderRadius: 999, transition: 'width .6s var(--ease-out)' }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, paddingTop: 13, borderTop: '1px solid var(--hairline)', font: '500 12px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
          {viewingToday && anyLogged
            ? `${Math.round(loggedCals).toLocaleString()} logged · ${Math.round(plannedCals).toLocaleString()} planned today`
            : `${Math.round(plannedCals).toLocaleString()} planned · ${dayMeals.length} meals`}
        </div>
      </div>

      {/* Meal cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {dayMeals.map((m, i) => {
          const logged = isLogged(m.name);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, ...cardStyle, borderRadius: 'var(--r-tile)', padding: '11px 12px', opacity: logged ? 0.62 : 1, transition: 'opacity .3s var(--ease-out)' }}>
              <div style={{ width: 48, height: 48, flex: 'none', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(150deg,${TINTS[i % TINTS.length]},var(--brand-forest))`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14)', color: 'rgba(255,255,255,.9)' }}>
                <Utensils size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={microLabel}>{(m.type || m.slot || 'meal')}</div>
                <div style={{ marginTop: 2, font: '600 15px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(m.name || 'meal').toLowerCase()}</div>
                <div style={{ marginTop: 2, font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {Math.round(m.calories || 0)} kcal · {Math.round(m.protein || 0)}p {Math.round(m.carbs || 0)}c {Math.round(m.fat || 0)}f
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7, flex: 'none' }}>
                {logged ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--brand-jade)', font: '600 12px var(--font-ui)' }}>
                    <span style={{ width: 18, height: 18, borderRadius: 999, background: 'rgba(67,198,172,.16)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Check size={11} strokeWidth={2.6} /></span>logged
                  </div>
                ) : (
                  <button onClick={() => logMeal(m)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: 'var(--on-accent)', font: '600 12px var(--font-ui)', padding: '7px 12px', borderRadius: 999 }}>
                    <Plus size={13} strokeWidth={2.4} />log
                  </button>
                )}
                <button onClick={onRegenerate} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sage)', font: '600 11px var(--font-ui)' }}>
                  <ArrowRightLeft size={13} />swap
                  <span style={{ color: 'var(--warning)', display: 'inline-flex' }}><Lock size={10} /></span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={onGrocery} style={{ display: 'flex', alignItems: 'center', gap: 10, ...cardStyle, borderRadius: 18, padding: 14, cursor: 'pointer' }}>
          <span style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(231,182,124,.14)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><ShoppingCart size={18} /></span>
          <span style={{ textAlign: 'left', font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>grocery list</span>
        </button>
        <button onClick={onImport} style={{ display: 'flex', alignItems: 'center', gap: 10, ...cardStyle, borderRadius: 18, padding: 14, cursor: 'pointer' }}>
          <span style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(95,212,196,.14)', color: 'var(--info)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Plus size={18} /></span>
          <span style={{ textAlign: 'left', font: '600 13px var(--font-ui)', color: 'var(--ink)' }}>import recipe</span>
        </button>
      </div>

      <button onClick={onRegenerate} style={{ width: '100%', height: 50, borderRadius: 'var(--r-control)', border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)', font: '600 14px var(--font-ui)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <RefreshCw size={16} />regenerate plan
      </button>
    </div>
  );
}

/* ---------- Empty state ---------- */

function EmptyWeek({ onGenerate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', gap: 6, minHeight: 480 }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(67,198,172,.35), rgba(15,148,130,.12) 60%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CalendarDays size={42} color="var(--brand-jade)" strokeWidth={1.6} />
      </div>
      <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', color: 'var(--ink)' }}>no plan yet</div>
      <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 250, lineHeight: 1.5 }}>
        generate a plan tailored to your goals — 7 days of meals that hit your macros.
      </div>
      <button onClick={onGenerate} style={{ marginTop: 18, height: 50, padding: '0 26px', border: 'none', borderRadius: 'var(--r-control)', background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)' }}>
        generate plan
      </button>
    </div>
  );
}

/* ---------- Recipes ---------- */

function RecipesView({ recipes, savedRecipes, saveRecipe }) {
  const list = recipes && recipes.length ? recipes : [];
  const savedCount = (savedRecipes?.length || 0) + (recipes?.length || 0);
  const isSaved = (r) => (recipes || []).some(x => (x.title || x.name) === (r.title || r.name));

  if (!list.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', gap: 6, minHeight: 420 }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, rgba(95,212,196,.30), rgba(15,148,130,.10) 60%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={40} color="var(--macro-fat)" strokeWidth={1.6} />
        </div>
        <div style={{ marginTop: 14, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', color: 'var(--ink)' }}>no saved recipes</div>
        <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 250, lineHeight: 1.5 }}>
          save recipes from your plan or explore and they'll show up here.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '-.01em', color: 'var(--ink)' }}>recipe book</div>
        <div style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)' }}>{savedCount} saved</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {list.map((r, i) => {
          const title = r.title || r.name || 'recipe';
          const saved = isSaved(r);
          return (
            <div key={i} style={{ ...cardStyle, borderRadius: 'var(--r-tile)', overflow: 'hidden' }}>
              <div style={{ height: 82, position: 'relative', background: `linear-gradient(150deg,${TINTS[i % TINTS.length]},var(--brand-forest))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Utensils size={26} color="rgba(255,255,255,.85)" strokeWidth={1.5} />
                <button onClick={() => saveRecipe(r)} aria-label="Save recipe" style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 999, border: 'none', background: 'rgba(7,13,12,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: saved ? 'var(--macro-fat)' : '#EAF1EF' }}>
                  <Heart size={15} fill={saved ? 'var(--macro-fat)' : 'none'} strokeWidth={1.9} />
                </button>
              </div>
              <div style={{ padding: '11px 12px 13px' }}>
                <div style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title.toLowerCase()}</div>
                <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--macro-cal, var(--brand-jade))', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.calories || 0)} kcal</span>
                  <span style={{ font: '500 11px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{Math.round(r.protein || 0)}p {Math.round(r.carbs || 0)}c {Math.round(r.fat || 0)}f</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Restaurant (premium-gated) ---------- */

function RestaurantLock({ onUnlock }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '50px 26px', gap: 6, minHeight: 460 }}>
      <div style={{ width: 82, height: 82, borderRadius: 24, background: 'linear-gradient(140deg, rgba(231,182,124,.2), rgba(231,182,124,.06))', border: '1px solid rgba(231,182,124,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
        <Lock size={34} strokeWidth={1.7} />
      </div>
      <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, background: 'rgba(231,182,124,.14)', color: 'var(--warning)', font: '700 10px var(--font-ui)', letterSpacing: '.14em', textTransform: 'uppercase' }}>plato plus</div>
      <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)' }}>restaurant mode</div>
      <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 270, lineHeight: 1.55 }}>
        log real menu macros from 14+ chains and find on-plan picks near you.
      </div>
      <button onClick={onUnlock} style={{ marginTop: 20, height: 52, padding: '0 30px', border: 'none', borderRadius: 'var(--r-control)', background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', cursor: 'pointer', boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Sparkles size={17} />start free trial
      </button>
      <div style={{ marginTop: 12, font: '500 12px var(--font-ui)', color: 'var(--muted)' }}>48 hours free · then $59.99/yr · cancel anytime</div>
    </div>
  );
}

function RestaurantUnlocked() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '50px 26px', gap: 8, minHeight: 460 }}>
      <div style={{ width: 82, height: 82, borderRadius: 24, background: 'linear-gradient(140deg, rgba(67,198,172,.22), rgba(15,148,130,.08))', border: '1px solid rgba(67,198,172,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-jade)' }}>
        <Sparkles size={34} strokeWidth={1.7} />
      </div>
      <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, background: 'rgba(67,198,172,.14)', color: 'var(--brand-jade)', font: '700 10px var(--font-ui)', letterSpacing: '.14em', textTransform: 'uppercase' }}>plato plus</div>
      <div style={{ marginTop: 12, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)' }}>restaurant mode</div>
      <div style={{ font: '400 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 270, lineHeight: 1.55 }}>
        restaurant mode is unlocked. browse chain menus with real macros from the explore tab.
      </div>
    </div>
  );
}
