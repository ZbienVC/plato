import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealPlanViewer } from '../components/organisms/MealPlanViewer';
import { RecipeBook } from '../components/organisms/RecipeBook';
import { GroceryList } from '../components/organisms/GroceryList';
import { YouTubeImporter } from '../components/organisms/YouTubeImporter';
import { Card } from '../components/atoms/Card';
import { MealCard } from '../components/molecules/MealCard';

export function MealPlans() {
  const {
    dark, plan, logMeal, savedPlans, recipes, favorites,
    setActiveTab, saveRecipe,
  } = useApp();
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);

  const hasPlan = plan && plan.meals && plan.meals.length > 0;
  const mealsPerDay = plan?.mealsPerDay || 3;
  const totalDays = hasPlan ? Math.ceil(plan.meals.length / mealsPerDay) : 0;
  const dayMeals = hasPlan
    ? plan.meals.slice(selectedDay * mealsPerDay, (selectedDay + 1) * mealsPerDay)
    : [];
  const mealSlotNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2', 'Snack 3'];

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div>
        <h1 className={`text-[24px] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          Meal Plans
        </h1>
        <p className={`text-[13px] mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          {hasPlan
            ? `${plan.calories} cal/day · ${plan.protein}g protein`
            : 'Generate a plan to get started'}
        </p>
      </div>

      {/* Plan overview card */}
      {hasPlan && (
        <div className={`p-5 rounded-2xl border ${
          dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
        }`}>
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'Calories', value: plan.calories, color: 'text-emerald-400' },
              { label: 'Protein', value: `${plan.protein}g`, color: 'text-blue-400' },
              { label: 'Carbs', value: `${plan.carbs}g`, color: 'text-amber-400' },
              { label: 'Fat', value: `${plan.fat}g`, color: 'text-purple-400' },
            ].map(m => (
              <div key={m.label}>
                <p className={`text-[20px] font-black ${m.color}`}>{m.value}</p>
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day selector */}
      {hasPlan && totalDays > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {Array.from({ length: totalDays }).map((_, i) => (
            <button key={i} onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                selectedDay === i
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : dark
                    ? 'bg-white/[0.04] text-slate-400 border border-white/[0.08]'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >Day {i + 1}</button>
          ))}
        </div>
      )}

      {/* Day meals */}
      {hasPlan && (
        <div>
          <h2 className={`text-[17px] font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
            Day {selectedDay + 1} Meals
          </h2>
          <div className="space-y-3">
            {dayMeals.map((meal, i) => (
              <MealCard
                key={i}
                meal={meal}
                mealSlot={mealSlotNames[i] || `Meal ${i + 1}`}
                dark={dark}
                onLog={(m) => logMeal({
                  name: m.name, calories: m.calories,
                  protein: m.protein, carbs: m.carbs, fat: m.fat,
                })}
              />
            ))}
          </div>
        </div>
      )}

      {/* No plan state */}
      {!hasPlan && (
        <div className={`text-center p-8 rounded-2xl border ${
          dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
        }`}>
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
            dark ? 'bg-white/[0.04]' : 'bg-slate-50'
          }`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h3 className={`text-[18px] font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
            No plan generated yet
          </h3>
          <p className={`text-[13px] mb-6 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Complete onboarding to generate your first meal plan.
          </p>
        </div>
      )}

      {/* Discover */}
      <div>
        <h2 className={`text-[17px] font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
          Discover
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              title: 'Recipes',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              ),
              action: () => setShowRecipeBook(true),
            },
            {
              title: 'Import',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ),
              action: () => setShowYouTube(true),
            },
            {
              title: 'Grocery',
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              ),
              action: () => setShowGroceryList(true),
            },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              className={`p-4 rounded-2xl text-center transition-all border ${
                dark
                  ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] active:scale-[0.98]'
                  : 'bg-white border-slate-100 hover:border-slate-200 active:scale-[0.98]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${
                dark ? 'bg-white/[0.04]' : 'bg-slate-50'
              }`}>
                {item.icon}
              </div>
              <p className={`text-[12px] font-semibold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Saved */}
      <div>
        <h2 className={`text-[17px] font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
          Saved
        </h2>
        <div className="space-y-2">
          {[
            {
              label: 'Favorite Meals', count: favorites.length,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
              action: () => {},
            },
            {
              label: 'Saved Recipes', count: recipes.length,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
              action: () => setShowRecipeBook(true),
            },
            {
              label: 'Saved Plans', count: savedPlans.length,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /></svg>,
              action: () => {},
            },
            {
              label: 'Grocery List', count: null,
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
              action: () => setShowGroceryList(true),
            },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
                dark
                  ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  dark ? 'bg-white/[0.04]' : 'bg-slate-50'
                }`}>
                  {item.icon}
                </div>
                <span className={`font-semibold text-[13px] ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.count !== null && (
                  <span className={`text-[12px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>({item.count})</span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? '#4a5580' : '#94a3b8'} strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showRecipeBook && (
        <RecipeBook
          recipes={(plan?.meals || []).map(m => ({
            title: m.name, calories: m.calories, protein: m.protein,
            carbs: m.carbs, fat: m.fat, ingredients: m.ingredients,
            instructions: m.instructions,
          }))}
          dark={dark}
          onClose={() => setShowRecipeBook(false)}
        />
      )}
      {showGroceryList && (
        <GroceryList meals={plan?.meals || []} dark={dark} onClose={() => setShowGroceryList(false)} />
      )}
      {showYouTube && (
        <YouTubeImporter dark={dark} onImport={(r) => saveRecipe(r)} onClose={() => setShowYouTube(false)} />
      )}
    </div>
  );
}
