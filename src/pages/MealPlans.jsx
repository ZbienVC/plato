import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Salad, Utensils, Apple, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FoodImage } from '../components/molecules/FoodImage';
import { RecipeBook } from '../components/organisms/RecipeBook';
import { GroceryList } from '../components/organisms/GroceryList';
import { YouTubeImporter } from '../components/organisms/YouTubeImporter';
import { RestaurantBrowser } from '../components/organisms/RestaurantBrowser';
import { Skeleton } from '../components/atoms/Skeleton';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MEAL_TYPE_ICONS = {
  breakfast: <Coffee className="w-4 h-4 text-amber-600" />,
  lunch: <Salad className="w-4 h-4 text-green-600" />,
  dinner: <Utensils className="w-4 h-4 text-slate-600" />,
  snack: <Apple className="w-4 h-4 text-red-500" />,
};
const getMealIcon = (type) => MEAL_TYPE_ICONS[type?.toLowerCase()] || <Utensils className="w-4 h-4 text-slate-400" />;

const MacroSkeletonCard = () => (
  <div className="app-card">
    <Skeleton className="h-4 w-28 mb-4" />
    <div className="grid grid-cols-4 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-3 w-2/3 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

const PlanRowsSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="app-card">
        <div className="flex items-center gap-3">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export function MealPlans() {
  const { plan, planLoading, logMeal, savedPlans, recipes, favorites, setActiveTab, saveRecipe, swapMeal, showMealImages } = useApp();
  const [activeTab, setTab] = useState('plan');
  const [showRecipes, setShowRecipes] = useState(false);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [showGrocery, setShowGrocery] = useState(false);
  const [showYT, setShowYT] = useState(false);
  const [showRestaurant, setShowRestaurant] = useState(false);
  const [selDay, setSelDay] = useState(0);

  const hasPlan = plan?.meals?.length > 0;
  const mpd = plan?.mealsPerDay || 3;
  const days = hasPlan ? Math.ceil(plan.meals.length / mpd) : 0;
  const dayMeals = hasPlan ? plan.meals.slice(selDay * mpd, (selDay + 1) * mpd) : [];
  const slots = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2'];

  const TABS = ['plan', 'recipes', 'restaurant'];

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 pb-4">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900">Meal Plans</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {hasPlan ? `${plan.calories} cal/day · ${plan.protein}g protein` : 'Generate a plan to get started'}
        </p>
      </motion.div>

      {/* Sub-tab bar */}
      <motion.div variants={item} className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}>
            {t === 'plan' ? 'My Plan' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* MY PLAN TAB */}
      {activeTab === 'plan' && (
        <>
          {/* Macro summary */}
          {planLoading ? (
            <motion.div variants={item}>
              <MacroSkeletonCard />
            </motion.div>
          ) : hasPlan && (
            <motion.div variants={item} className="app-card">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { l: 'Cal', v: plan.calories, c: '#22C55E' },
                  { l: 'Protein', v: `${plan.protein}g`, c: '#3B82F6' },
                  { l: 'Carbs', v: `${plan.carbs}g`, c: '#F59E0B' },
                  { l: 'Fat', v: `${plan.fat}g`, c: '#F43F5E' },
                ].map(m => (
                  <div key={m.l}>
                    <p className="text-lg font-black tabular-nums" style={{ color: m.c }}>{m.v}</p>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">{m.l}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Day selector */}
          {hasPlan && days > 1 && (
            <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {Array.from({ length: days }).map((_, i) => (
                <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => setSelDay(i)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selDay === i ? 'bg-green-500 text-white shadow-sm shadow-green-200' : 'bg-white text-slate-500 border border-slate-200'
                  }`}>{DAY_NAMES[i] || `Day ${i+1}`}</motion.button>
              ))}
            </motion.div>
          )}

          {/* Day meals */}
          {planLoading ? (
            <motion.div variants={item}>
              <PlanRowsSkeleton />
            </motion.div>
          ) : hasPlan && dayMeals.length > 0 && (
            <motion.div variants={item} className="space-y-3">
              {dayMeals.map((meal, i) => (
                <div key={i} className="app-card overflow-hidden">
                  {showMealImages && (
                    <div className="mb-3">
                      <FoodImage mealName={meal.name} mealType={meal.type || slots[i]?.toLowerCase() || 'default'} size="lg" />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {!showMealImages && <FoodImage mealName={meal.name} mealType={meal.type || slots[i]?.toLowerCase() || 'default'} size="md" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {getMealIcon(meal.type)}
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{slots[i] || `Meal ${i+1}`}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900 truncate">{meal.name}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">{meal.calories} cal</span>
                          <span className="text-xs text-blue-500 tabular-nums font-medium">{meal.protein}g P</span>
                          <span className="text-xs text-amber-500 tabular-nums font-medium">{meal.carbs}g C</span>
                          <span className="text-xs text-rose-500 tabular-nums font-medium">{meal.fat}g F</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => logMeal({ name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, type: meal.type })}
                        className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold"
                      >
                        Log
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => swapMeal(i, meal)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Swap
                      </motion.button>
                    </div>
                  </div>
                  {meal.ingredients?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-50">
                      <p className="text-xs text-slate-400">{meal.ingredients.slice(0, 4).join(' · ')}{meal.ingredients.length > 4 ? ` +${meal.ingredients.length - 4}` : ''}</p>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Actions */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowGrocery(true)}
              className="app-card flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">Grocery List</span>
            </motion.button>

            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowYT(true)}
              className="app-card flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-slate-700">Import Recipe</span>
            </motion.button>
          </motion.div>

          {!hasPlan && (
            <motion.div variants={item} className="app-card text-center py-8">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 bg-green-50 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No plan yet</h3>
              <p className="text-sm text-slate-400 mb-4">Complete onboarding to generate a personalized plan.</p>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setActiveTab('you')}
                className="px-6 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold">
                Get Started
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {/* RECIPES TAB */}
      {activeTab === 'recipes' && (
        <motion.div variants={item} className="space-y-3">
          {recipes.length === 0 && (!plan?.meals || plan.meals.length === 0) ? (
            <div className="app-card text-center py-10">
              <p className="text-slate-400 text-sm">No recipes yet. Import from YouTube or generate a plan!</p>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowYT(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold">
                Import Recipe
              </motion.button>
            </div>
          ) : (
            <>
              {(plan?.meals || []).map((meal, i) => (
                <div key={i} className="app-card">
                  <div className="flex items-start gap-3">
                    <FoodImage mealName={meal.name} mealType={meal.type || 'default'} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{meal.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-900">{meal.calories} cal</span>
                        <span className="text-xs text-blue-500">{meal.protein}g P</span>
                        <span className="text-xs text-amber-500">{meal.carbs}g C</span>
                        <span className="text-xs text-rose-500">{meal.fat}g F</span>
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.92 }}
                      onClick={() => { setRecipeIndex(i); setShowRecipes(true); }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
                      View
                    </motion.button>
                  </div>
                </div>
              ))}
            </>
          )}
        </motion.div>
      )}

      {/* RESTAURANT TAB */}
      {activeTab === 'restaurant' && (
        <motion.div variants={item}>
          <RestaurantBrowser onLog={logMeal} dark={false} />
        </motion.div>
      )}

      {/* Modals */}
      {showRecipes && (
        <RecipeBook
          recipes={(plan?.meals || []).map(m => ({ title: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, ingredients: m.ingredients, instructions: m.instructions }))}
          initialPage={recipeIndex}
          dark={false}
          onClose={() => setShowRecipes(false)}
        />
      )}
      {showGrocery && <GroceryList meals={plan?.meals || []} dark={false} onClose={() => setShowGrocery(false)} />}
      {showYT && <YouTubeImporter dark={false} onImport={r => saveRecipe(r)} onClose={() => setShowYT(false)} />}
    </motion.div>
  );
}
