import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FoodImage } from './FoodImage';

export function MealCard({ meal, mealSlot, time, showImage = false, onLog, onSwap, logged = false, className = '' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div whileTap={{ scale: 0.99 }} onClick={() => setExpanded(!expanded)}
      className={`glass rounded-2xl overflow-hidden cursor-pointer transition-colors hover:border-white/[0.12] ${logged ? 'opacity-50' : ''} ${className}`}>

      {showImage && meal?.name && <FoodImage name={meal.name} height="100px" rounded="rounded-none" />}

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {mealSlot && <p className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-500">{mealSlot}{time ? ` · ${time}` : ''}</p>}
            <h3 className="font-bold text-[15px] text-white mt-0.5 truncate">{meal?.name || 'Unnamed'}</h3>
          </div>
          {logged && (
            <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-[12px] font-semibold text-teal-400 tabular-nums">{meal?.calories || 0} cal</span>
          <span className="text-slate-700">|</span>
          <span className="text-[11px] text-blue-400 tabular-nums">{meal?.protein || 0}g P</span>
          <span className="text-[11px] text-amber-400 tabular-nums">{meal?.carbs || 0}g C</span>
          <span className="text-[11px] text-purple-400 tabular-nums">{meal?.fat || 0}g F</span>
        </div>

        {!logged && (onLog || onSwap) && (
          <div className="flex gap-2 mt-3">
            {onLog && (
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={e => { e.stopPropagation(); onLog(meal); }}
                className="px-5 py-2 bg-teal-500/10 border border-teal-500/25 rounded-xl text-[12px] font-semibold text-teal-400 whitespace-nowrap">
                I ate this
              </motion.button>
            )}
            {onSwap && (
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={e => { e.stopPropagation(); onSwap(meal); }}
                className="px-4 py-2 glass rounded-xl text-[12px] font-semibold text-slate-400 whitespace-nowrap">
                Swap
              </motion.button>
            )}
          </div>
        )}

        {expanded && meal?.ingredients && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.3 }}
            className="mt-3 pt-3 border-t border-white/[0.06] overflow-hidden">
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-slate-500 mb-2">Ingredients</p>
            <ul className="space-y-1">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="text-[12px] text-slate-400 flex items-start gap-2">
                  <span className="text-teal-500/50 mt-[3px]">·</span>{ing}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
