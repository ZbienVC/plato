import React from 'react';
import { motion } from 'framer-motion';

const TABS = [
  { key: 'home', label: 'Home', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10' },
  { key: 'log', label: 'Log', d: 'M12 5v14M5 12h14' },
  { key: 'meals', label: 'Meals', d: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
  { key: 'you', label: 'You', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z' },
];

export function BottomNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40
      bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          // Log tab gets FAB treatment — don't show normal item
          if (tab.key === 'log') {
            return (
              <motion.button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center justify-center gap-1 py-1 px-4"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg -mt-6 ${
                  active
                    ? 'bg-green-500 shadow-green-200'
                    : 'bg-green-500 shadow-green-200'
                }`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d={tab.d} />
                  </svg>
                </div>
                <span className="text-[9px] font-semibold tracking-wide text-green-500">{tab.label}</span>
              </motion.button>
            );
          }
          return (
            <motion.button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-5 relative"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={active ? '#22C55E' : '#94A3B8'} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.d} />
              </svg>
              <span className={`text-[10px] font-semibold tracking-wide ${
                active ? 'text-green-500' : 'text-slate-400'
              }`}>{tab.label}</span>
              {active && (
                <motion.div layoutId="navDot"
                  className="absolute bottom-0.5 w-1 h-1 rounded-full bg-green-500"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
}
