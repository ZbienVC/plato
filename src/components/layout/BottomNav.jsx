import React from 'react';

const TABS = [
  {
    key: 'home',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10d9a0' : '#4a5580'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'log',
    label: 'Log',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10d9a0' : '#4a5580'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    key: 'meals',
    label: 'Meals',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10d9a0' : '#4a5580'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: 'you',
    label: 'You',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10d9a0' : '#4a5580'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNav({ activeTab, onTabChange, dark = true }) {
  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full border-t ${
        dark
          ? 'bg-[#0a0f1e]/95 border-white/[0.06]'
          : 'bg-white/95 border-slate-200'
      } backdrop-blur-xl z-40`}
      style={{ maxWidth: '430px' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="flex flex-col items-center justify-center gap-1 py-1 px-4 transition-all"
            >
              {tab.icon(isActive)}
              <span className={`text-[10px] font-semibold tracking-wide ${
                isActive ? 'text-emerald-400' : dark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* Home indicator safe area */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  );
}
