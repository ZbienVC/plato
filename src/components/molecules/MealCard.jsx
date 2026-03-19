import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MealCard({ meal, mealSlot, time, onLog, onSwap, logged = false, className = '' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      whileTap={{ scale: 0.985 }}
      onClick={() => setExpanded(!expanded)}
      className={`rounded-2xl cursor-pointer transition-all ${logged ? 'opacity-40' : ''} ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            {mealSlot && (
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-teal-400/60 mb-1">
                {mealSlot}{time ? ` · ${time}` : ''}
              </p>
            )}
            <h3 className="font-bold text-[15px] text-white leading-tight truncate">
              {meal?.name || 'Unnamed'}
            </h3>
          </div>
          {logged && (
            <div className="w-6 h-6 rounded-full bg-teal-500/15 flex items-center justify-center shrink-0 mt-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          )}
        </div>

        {/* Macros row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[13px] font-bold text-teal-400 tabular-nums">
            {meal?.calories || 0} cal
          </span>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-blue-400/80 tabular-nums font-medium">{meal?.protein || 0}g P</span>
            <span className="text-[11px] text-amber-400/80 tabular-nums font-medium">{meal?.carbs || 0}g C</span>
            <span className="text-[11px] text-purple-400/80 tabular-nums font-medium">{meal?.fat || 0}g F</span>
          </div>
        </div>

        {/* Action buttons */}
        {!logged && (onLog || onSwap) && (
          <div className="flex gap-2">
            {onLog && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={e => { e.stopPropagation(); onLog(meal); }}
                className="px-4 py-2 rounded-lg text-[12px] font-bold text-teal-400 whitespace-nowrap"
                style={{
                  background: 'rgba(20,184,166,0.12)',
                  border: '1px solid rgba(20,184,166,0.25)',
                }}
              >
                I ate this
              </motion.button>
            )}
            {onSwap && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={e => { e.stopPropagation(); onSwap(meal); }}
                className="px-4 py-2 rounded-lg text-[12px] font-semibold text-slate-400 whitespace-nowrap"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Swap
              </motion.button>
            )}
          </div>
        )}

        {/* Expanded ingredients */}
        <AnimatePresence>
          {expanded && meal?.ingredients && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-slate-500 mb-2">
                  Ingredients
                </p>
                <ul className="space-y-1">
                  {meal.ingredients.map((ing, i) => (
                    <li key={i} className="text-[12px] text-slate-400 flex items-start gap-2">
                      <span className="text-teal-500/40 mt-[3px]">·</span>{ing}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
