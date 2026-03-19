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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40
      bg-[#0B0F1A]/90 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="flex items-center justify-around h-16 px-4">
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke={active ? '#14B8A6' : '#475569'} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.d} />
              </svg>
              <span className={`text-[10px] font-semibold tracking-wide ${
                active ? 'text-teal-400' : 'text-slate-600'
              }`}>{tab.label}</span>
              {active && (
                <motion.div layoutId="navIndicator"
                  className="absolute -top-px h-[2px] w-8 bg-gradient-to-r from-teal-400 to-indigo-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
