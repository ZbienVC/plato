import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

/**
 * Recipe Book — flip-through recipe viewer
 * Shows recipes from meal plan + saved recipes
 */
export function RecipeBook({ recipes = [], dark = true, onClose }) {
  const [page, setPage] = useState(0);
  const [flipping, setFlipping] = useState(null);
  const total = recipes.length;
  const recipe = recipes[page] || null;

  const flipTo = (dir) => {
    if (dir === 'forward' && page >= total - 1) return;
    if (dir === 'back' && page <= 0) return;
    setFlipping(dir);
    setTimeout(() => {
      setPage(p => dir === 'forward' ? p + 1 : p - 1);
      setFlipping(null);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-[420px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden border-2 ${
        dark ? 'bg-[#1e1b14] border-amber-600' : 'bg-[#fef9f0] border-amber-500'
      } shadow-2xl ${flipping === 'forward' ? 'animate-scaleIn' : flipping === 'back' ? 'animate-scaleIn' : ''}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <div>
              <p className="text-amber-100 font-extrabold text-sm">PLATO RECIPE BOOK</p>
              <p className="text-amber-200 text-[10px]">
                {total === 0 ? 'No recipes yet' : `Recipe ${page + 1} of ${total}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black/25 text-amber-100 flex items-center justify-center text-lg hover:bg-black/40 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        {total === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <span className="text-5xl mb-4">📭</span>
            <h3 className="text-amber-600 font-bold text-lg mb-2">No recipes yet</h3>
            <p className="text-amber-700 text-sm">Generate a meal plan to fill your recipe book!</p>
          </div>
        ) : recipe && (
          <div className="flex-1 overflow-y-auto p-5">
            {/* Recipe title */}
            <h2 className={`text-xl font-extrabold mb-4 ${dark ? 'text-amber-100' : 'text-amber-900'}`}>
              {recipe.title || recipe.name}
            </h2>

            {/* Macro grid */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { label: 'Calories', value: recipe.calories, unit: 'kcal', color: 'text-orange-400' },
                { label: 'Protein', value: recipe.protein, unit: 'g', color: 'text-blue-400' },
                { label: 'Carbs', value: recipe.carbs, unit: 'g', color: 'text-green-400' },
                { label: 'Fat', value: recipe.fat, unit: 'g', color: 'text-yellow-400' },
              ].map(m => (
                <div key={m.label} className={`rounded-lg p-2 text-center border ${
                  dark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                }`}>
                  <p className={`text-lg font-black ${m.color}`}>{m.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Ingredients */}
            <div className="mb-5">
              <h3 className="text-amber-600 text-xs font-extrabold uppercase tracking-wider mb-2 pb-1 border-b border-amber-600/30">
                Ingredients
              </h3>
              <ul className="space-y-1">
                {(recipe.ingredients || []).map((ing, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${dark ? 'text-amber-100' : 'text-amber-900'}`}>
                    <span className="text-amber-600 font-bold mt-0.5">·</span>
                    {ing}
                  </li>
                ))}
                {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                  <li className="text-amber-700 text-xs italic">No ingredients listed</li>
                )}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-amber-600 text-xs font-extrabold uppercase tracking-wider mb-2 pb-1 border-b border-amber-600/30">
                Instructions
              </h3>
              <ol className="space-y-2">
                {(recipe.instructions || []).map((step, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${dark ? 'text-amber-100' : 'text-amber-900'}`}>
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className={`px-4 py-3 flex items-center justify-between flex-shrink-0 border-t ${
          dark ? 'bg-[#292015] border-amber-800' : 'bg-amber-50 border-amber-300'
        }`}>
          <button
            onClick={() => flipTo('back')}
            disabled={page === 0 || total === 0}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              page === 0 ? 'bg-black/10 text-amber-800 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            ← Prev
          </button>
          <div className="flex gap-1">
            {total <= 12 ? (
              Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`rounded-full transition-all ${
                    i === page ? 'w-5 h-2 bg-amber-600' : 'w-2 h-2 bg-amber-300'
                  }`}
                />
              ))
            ) : (
              <span className="text-amber-600 text-xs font-semibold">{page + 1}/{total}</span>
            )}
          </div>
          <button
            onClick={() => flipTo('forward')}
            disabled={page >= total - 1 || total === 0}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              page >= total - 1 ? 'bg-black/10 text-amber-800 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700'
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
