import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MealCard } from '../components/molecules/MealCard';
import { RecipeBook } from '../components/organisms/RecipeBook';
import { GroceryList } from '../components/organisms/GroceryList';
import { YouTubeImporter } from '../components/organisms/YouTubeImporter';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function MealPlans() {
  const { plan, logMeal, savedPlans, recipes, favorites, setActiveTab, saveRecipe } = useApp();
  const [showRecipes, setShowRecipes] = useState(false);
  const [showGrocery, setShowGrocery] = useState(false);
  const [showYT, setShowYT] = useState(false);
  const [selDay, setSelDay] = useState(0);

  const hasPlan = plan?.meals?.length > 0;
  const mpd = plan?.mealsPerDay || 3;
  const days = hasPlan ? Math.ceil(plan.meals.length / mpd) : 0;
  const dayMeals = hasPlan ? plan.meals.slice(selDay * mpd, (selDay + 1) * mpd) : [];
  const slots = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2'];

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6 pb-4">
      <motion.div variants={item}>
        <h1 className="text-[24px] font-extrabold tracking-tight text-white">Meal Plans</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          {hasPlan ? `${plan.calories} cal/day · ${plan.protein}g protein` : 'Generate a plan to get started'}
        </p>
      </motion.div>

      {/* Macro summary */}
      {hasPlan && (
        <motion.div variants={item} className="glass rounded-2xl p-5">
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { l: 'Cal', v: plan.calories, c: 'text-teal-400' },
              { l: 'Protein', v: `${plan.protein}g`, c: 'text-blue-400' },
              { l: 'Carbs', v: `${plan.carbs}g`, c: 'text-amber-400' },
              { l: 'Fat', v: `${plan.fat}g`, c: 'text-purple-400' },
            ].map(m => (
              <div key={m.l}>
                <p className={`text-[18px] font-black tabular-nums ${m.c}`}>{m.v}</p>
                <p className="text-[9px] text-slate-500 font-semibold uppercase mt-0.5">{m.l}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Day selector */}
      {hasPlan && days > 1 && (
        <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {Array.from({ length: days }).map((_, i) => (
            <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => setSelDay(i)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                selDay === i ? 'bg-gradient-to-r from-teal-500 to-indigo-500 text-white glow-teal' : 'glass text-slate-400'
              }`}>Day {i + 1}</motion.button>
          ))}
        </motion.div>
      )}

      {/* Day meals */}
      {hasPlan && (
        <motion.div variants={item}>
          <h2 className="text-[16px] font-bold text-white mb-3">Day {selDay + 1}</h2>
          <div className="space-y-3">
            {dayMeals.map((meal, i) => (
              <MealCard key={i} meal={meal} mealSlot={slots[i] || `Meal ${i+1}`}
                onLog={m => logMeal({ name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat })} />
            ))}
          </div>
        </motion.div>
      )}

      {!hasPlan && (
        <motion.div variants={item} className="glass rounded-2xl p-7 text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 bg-teal-500/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          </div>
          <h3 className="text-[16px] font-bold text-white mb-1">No plan yet</h3>
          <p className="text-[13px] text-slate-400">Complete onboarding to generate a plan.</p>
        </motion.div>
      )}

      {/* Discover */}
      <motion.div variants={item}>
        <h2 className="text-[16px] font-bold text-white mb-3">Discover</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { t: 'Recipes', ic: '#14B8A6', c: 'from-teal-500/12', svg: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>, a: () => setShowRecipes(true) },
            { t: 'Import', ic: '#6366F1', c: 'from-indigo-500/12', svg: <polygon points="5 3 19 12 5 21 5 3"/>, a: () => setShowYT(true) },
            { t: 'Grocery', ic: '#F59E0B', c: 'from-amber-500/12', svg: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>, a: () => setShowGrocery(true) },
          ].map((x, i) => (
            <motion.button key={i} whileTap={{ scale: 0.97 }} onClick={x.a}
              className="glass rounded-2xl p-4 text-center hover:border-white/[0.12] transition-colors">
              <div className={`w-10 h-10 rounded-xl mx-auto bg-gradient-to-br ${x.c} to-transparent flex items-center justify-center mb-2`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={x.ic} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{x.svg}</svg>
              </div>
              <p className="text-[12px] font-semibold text-slate-300">{x.t}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Saved */}
      <motion.div variants={item}>
        <h2 className="text-[16px] font-bold text-white mb-3">Saved</h2>
        <div className="space-y-2">
          {[
            { l: 'Favorites', n: favorites.length, ic: '#F43F5E', a: () => {} },
            { l: 'Recipes', n: recipes.length, ic: '#F59E0B', a: () => setShowRecipes(true) },
            { l: 'Plans', n: savedPlans.length, ic: '#14B8A6', a: () => {} },
            { l: 'Grocery List', n: null, ic: '#A855F7', a: () => setShowGrocery(true) },
          ].map((x, i) => (
            <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={x.a}
              className="w-full glass rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-white/[0.12] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full" style={{ background: x.ic }} />
                </div>
                <span className="text-[13px] font-semibold text-white">{x.l}</span>
              </div>
              <div className="flex items-center gap-2">
                {x.n !== null && <span className="text-[12px] text-slate-500">({x.n})</span>}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {showRecipes && <RecipeBook recipes={(plan?.meals || []).map(m => ({ title: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, ingredients: m.ingredients, instructions: m.instructions }))} dark onClose={() => setShowRecipes(false)} />}
      {showGrocery && <GroceryList meals={plan?.meals || []} dark onClose={() => setShowGrocery(false)} />}
      {showYT && <YouTubeImporter dark onImport={r => saveRecipe(r)} onClose={() => setShowYT(false)} />}
    </motion.div>
  );
}
