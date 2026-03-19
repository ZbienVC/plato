import React, { useState } from 'react';
import { FoodImage } from './FoodImage';

/**
 * Meal card — clean, no emojis
 */
export function MealCard({
  meal,
  mealSlot,
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

  return (
    <div
      onClick={handleTap}
      className={`rounded-2xl overflow-hidden transition-all border cursor-pointer ${
        logged ? 'opacity-50' : ''
      } ${
        dark
          ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
          : 'bg-white border-slate-100 hover:border-slate-200'
      } ${className}`}
    >
      {/* Food image */}
      {showImage && meal?.name && (
        <FoodImage name={meal.name} height="120px" rounded="rounded-none" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {mealSlot && (
              <p className={`text-[11px] font-semibold uppercase tracking-[1px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {mealSlot}{time ? ` · ${time}` : ''}
              </p>
            )}
            <h3 className={`font-bold text-[15px] mt-0.5 ${dark ? 'text-white' : 'text-slate-900'}`}>
              {meal?.name || 'Unnamed Meal'}
            </h3>
          </div>
          {logged && (
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 ml-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Macro chips */}
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[12px] font-semibold text-emerald-400 tabular-nums">
            {meal?.calories || 0} cal
          </span>
          <span className={`text-[11px] ${dark ? 'text-slate-600' : 'text-slate-300'}`}>|</span>
          <span className="text-[11px] text-blue-400 tabular-nums">{meal?.protein || 0}g P</span>
          <span className="text-[11px] text-amber-400 tabular-nums">{meal?.carbs || 0}g C</span>
          <span className="text-[11px] text-purple-400 tabular-nums">{meal?.fat || 0}g F</span>
        </div>

        {/* Action buttons */}
        {!logged && (onLog || onSwap) && (
          <div className="flex gap-2 mt-3">
            {onLog && (
              <button
                onClick={(e) => { e.stopPropagation(); onLog(meal); }}
                className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[12px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                I ate this
              </button>
            )}
            {onSwap && (
              <button
                onClick={(e) => { e.stopPropagation(); onSwap(meal); }}
                className={`px-4 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                  dark
                    ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:bg-white/[0.08]'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Swap
              </button>
            )}
          </div>
        )}

        {/* Expanded: ingredients */}
        {expanded && meal?.ingredients && (
          <div className={`mt-3 pt-3 border-t ${dark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-[1px] mb-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Ingredients
            </p>
            <ul className="space-y-1">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className={`text-[12px] flex items-start gap-2 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="text-emerald-500/60 mt-[3px]">·</span>
                  {ing}
                </li>
              ))}
            </ul>
            {meal.instructions && (
              <>
                <p className={`text-[11px] font-semibold uppercase tracking-[1px] mb-2 mt-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Instructions
                </p>
                <ol className="space-y-1">
                  {meal.instructions.map((step, i) => (
                    <li key={i} className={`text-[12px] flex items-start gap-2 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span className={`font-bold ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{i + 1}.</span>
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
  );
}
