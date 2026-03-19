import React, { useState } from 'react';
import { Card } from '../atoms/Card';

/**
 * Meal card displaying meal name, macros, and actions
 * Supports: tap to expand, swipe gestures (future), log/swap actions
 */
export function MealCard({
  meal,
  mealSlot, // "Breakfast", "Lunch", etc.
  time,
  showImage = false,
  onLog,
  onSwap,
  onExpand,
  logged = false,
  dark = true,
  className = '',
}) {
  const [expanded, setExpanded] = useState(false);

  const handleTap = () => {
    setExpanded(!expanded);
    if (onExpand) onExpand(meal);
  };

  const mealEmoji = {
    breakfast: '☕',
    lunch: '🥪',
    dinner: '🍽️',
    snack: '🍎',
  };

  return (
    <Card
      variant="glass"
      padding="md"
      dark={dark}
      onClick={handleTap}
      className={`${logged ? 'opacity-60' : ''} ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Meal slot emoji */}
        <div className="text-2xl mt-0.5">
          {mealEmoji[meal?.type] || '🍽️'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              {mealSlot && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {mealSlot}{time ? ` · ${time}` : ''}
                </p>
              )}
              <h3 className={`font-bold text-base mt-0.5 ${dark ? 'text-white' : 'text-slate-900'}`}>
                {meal?.name || 'Unnamed Meal'}
              </h3>
            </div>
            {logged && (
              <span className="text-emerald-400 text-sm font-bold">✓</span>
            )}
          </div>

          {/* Macro chips */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-semibold text-emerald-400">
              {meal?.calories || 0} cal
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-blue-400">
              {meal?.protein || 0}g P
            </span>
            <span className="text-xs text-amber-400">
              {meal?.carbs || 0}g C
            </span>
            <span className="text-xs text-purple-400">
              {meal?.fat || 0}g F
            </span>
          </div>

          {/* Action buttons */}
          {!logged && (onLog || onSwap) && (
            <div className="flex gap-2 mt-3">
              {onLog && (
                <button
                  onClick={(e) => { e.stopPropagation(); onLog(meal); }}
                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  I ate this ✓
                </button>
              )}
              {onSwap && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSwap(meal); }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400 hover:bg-white/10 transition-colors"
                >
                  Swap
                </button>
              )}
            </div>
          )}

          {/* Expanded: ingredients + instructions */}
          {expanded && meal?.ingredients && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Ingredients
              </p>
              <ul className="space-y-1">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
              {meal.instructions && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 mt-3">
                    Instructions
                  </p>
                  <ol className="space-y-1">
                    {meal.instructions.map((step, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                        <span className="text-slate-600 font-bold">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
