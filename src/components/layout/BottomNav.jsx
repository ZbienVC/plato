import React from 'react';
import { NAV_TABS } from '../../utils/constants';

/**
 * Bottom tab navigation bar
 * 4 tabs: Home, Log, Meals, You
 * Hides on scroll down, shows on scroll up (handled by MainLayout)
 */
export function BottomNav({
  activeTab,
  onTabChange,
  visible = true,
  dark = true,
  className = '',
}) {
  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-40
        transition-transform duration-300
        ${visible ? 'translate-y-0' : 'translate-y-full'}
        ${className}
      `}
    >
      <div
        className={`
          max-w-[420px] mx-auto
          ${dark
            ? 'bg-[#0a0f1f]/95 border-t border-white/[0.06]'
            : 'bg-white/95 border-t border-slate-200'
          }
          backdrop-blur-xl
          flex items-center justify-around
          px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]
        `}
      >
        {NAV_TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center
                w-16 py-1.5 rounded-xl
                transition-all duration-200
                ${isActive
                  ? 'text-emerald-400'
                  : dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                }
              `}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`text-xl transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {tab.emoji}
              </span>
              <span className={`text-[10px] font-bold mt-0.5 transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-emerald-400 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
