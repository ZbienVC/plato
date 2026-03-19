import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealPlanViewer } from '../components/organisms/MealPlanViewer';
import { RecipeBook } from '../components/organisms/RecipeBook';
import { GroceryList } from '../components/organisms/GroceryList';
import { YouTubeImporter } from '../components/organisms/YouTubeImporter';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';

/**
 * Meals — Tab 3
 * Current plan, day selector, meal cards, discover section, saved items
 */
export function MealPlans() {
  const {
    dark, plan, logMeal, savedPlans, recipes, favorites,
    setActiveTab, saveRecipe,
  } = useApp();
  const [mealStates, setMealStates] = useState({});
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);

  const handleLogMeal = (meal, index) => {
    logMeal(meal);
    setMealStates(prev => ({ ...prev, [`0-${index}`]: 'ate' }));
  };

  const handleGenerateNew = () => {
    // TODO: Navigate to plan generation flow
    setActiveTab('home');
  };

  return (
    <div className="px-4 pt-6 pb-4 animate-fadeIn">
      {/* Page title */}
      <h1 className={`text-2xl font-extrabold mb-6 ${dark ? 'text-white' : 'text-slate-900'}`}>
        🍽️ Meals
      </h1>

      {/* Meal Plan Viewer */}
      <MealPlanViewer
        plan={plan}
        mealStates={mealStates}
        onLogMeal={handleLogMeal}
        onSwapMeal={(meal, i) => {/* TODO: Swap flow */}}
        onGenerateNew={handleGenerateNew}
        dark={dark}
      />

      {/* Discover section */}
      <div className="mt-8">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          DISCOVER
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { emoji: '📖', label: 'Recipe Book', action: () => setShowRecipeBook(true) },
            { emoji: '🔍', label: 'Find Recipes', action: () => {} },
            { emoji: '▶️', label: 'YouTube', action: () => setShowYouTube(true) },
          ].map((item, i) => (
            <Card
              key={i}
              variant="glass"
              padding="md"
              dark={dark}
              hover
              onClick={item.action}
              className="text-center"
            >
              <span className="text-2xl block mb-1">{item.emoji}</span>
              <span className={`text-[10px] font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.label}
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Saved section */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          SAVED
        </p>
        <div className="space-y-2">
          {[
            { label: 'Favorite Meals', count: favorites.length, emoji: '❤️', action: () => {} },
            { label: 'Saved Recipes', count: recipes.length, emoji: '📕', action: () => setShowRecipeBook(true) },
            { label: 'Saved Plans', count: savedPlans.length, emoji: '📋', action: () => {} },
            { label: 'Grocery List', count: null, emoji: '🛒', action: () => setShowGroceryList(true) },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl transition-all
                ${dark
                  ? 'bg-white/5 border border-white/[0.06] hover:border-emerald-500/30'
                  : 'bg-white border border-slate-200 hover:border-emerald-500'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.emoji}</span>
                <span className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.count !== null && (
                  <span className="text-xs text-slate-500">({item.count})</span>
                )}
                <span className="text-slate-500">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Book Modal */}
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

      {/* Grocery List Modal */}
      {showGroceryList && (
        <GroceryList
          meals={plan?.meals || []}
          dark={dark}
          onClose={() => setShowGroceryList(false)}
        />
      )}

      {/* YouTube Importer Modal */}
      {showYouTube && (
        <YouTubeImporter
          dark={dark}
          onImport={(recipe) => saveRecipe(recipe)}
          onClose={() => setShowYouTube(false)}
        />
      )}
    </div>
  );
}
