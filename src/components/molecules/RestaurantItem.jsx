import React from 'react';

const rankBadges = {
  1: { emoji: '🥇', color: 'text-amber-400' },
  2: { emoji: '🥈', color: 'text-slate-300' },
  3: { emoji: '🥉', color: 'text-amber-600' },
};

/**
 * Single restaurant menu item with rank, macros, and log button
 */
export function RestaurantItem({
  item,
  rank,
  onLog,
  dark = true,
  className = '',
}) {
  const badge = rankBadges[rank];

  return (
    <div className={`
      p-4 rounded-xl border transition-all duration-200
      ${dark
        ? 'bg-slate-800/50 border-white/[0.06] hover:border-emerald-500/30'
        : 'bg-white border-slate-200 hover:border-emerald-500/30'
      }
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {badge && <span className="text-lg">{badge.emoji}</span>}
            <h4 className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              {item.name}
            </h4>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-semibold text-emerald-400">
              {item.calories} cal
            </span>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">
                {item.protein}g P
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                {item.carbs}g C
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                {item.fat}g F
              </span>
            </div>
          </div>
        </div>
        {onLog && (
          <button
            onClick={() => onLog(item)}
            className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            + LOG
          </button>
        )}
      </div>
    </div>
  );
}
