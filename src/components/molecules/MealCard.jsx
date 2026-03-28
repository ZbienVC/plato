import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { FoodImage } from './FoodImage';

export function MealCard({ meal, mealSlot, time, onLog, onSwap, logged = false, className = '' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={() => setExpanded(!expanded)}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 card-lift cursor-pointer ${logged ? 'opacity-60' : ''} ${className}`}
    >
      <FoodImage mealName={meal?.name || ''} mealType={mealSlot?.toLowerCase() || 'default'} size="md" />
      <div className="flex-1 min-w-0">
        {mealSlot && (
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">
            {mealSlot}{time ? ` · ${time}` : ''}
          </p>
        )}
        <p className="font-semibold text-slate-900 truncate">{meal?.name || 'Unnamed'}</p>
        <p className="text-xs text-slate-400 mt-0.5">{meal?.calories || 0} kcal</p>
        <div className="flex gap-3 mt-1">
          <span className="text-xs text-blue-500 font-medium">{meal?.protein || 0}g P</span>
          <span className="text-xs text-amber-500 font-medium">{meal?.carbs || 0}g C</span>
          <span className="text-xs text-rose-500 font-medium">{meal?.fat || 0}g F</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        {!logged && onLog && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={e => { e.stopPropagation(); onLog(meal); }}
            className="p-2 rounded-xl bg-green-50 text-green-600"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        )}
        {logged && (
          <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        )}
        {!logged && onSwap && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={e => { e.stopPropagation(); onSwap(meal); }}
            className="p-2 rounded-xl bg-slate-100 text-slate-500"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
          </motion.button>
        )}
      </div>

      {/* Expanded ingredients */}
      <AnimatePresence>
        {expanded && meal?.ingredients && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden w-full mt-2"
            onClick={e => e.stopPropagation()}
          >
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ingredients</p>
              <ul className="space-y-0.5">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-start gap-1">
                    <span className="text-green-400 mt-0.5">·</span>{ing}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
