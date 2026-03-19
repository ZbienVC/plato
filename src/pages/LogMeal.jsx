import React from 'react';
import { useApp } from '../context/AppContext';
import { MealLogger } from '../components/organisms/MealLogger';

/**
 * Log tab — search food, scan, barcode, restaurant, manual entry
 */
export function LogMeal() {
  const { dark, logMeal, setActiveTab, setShowVoiceLog } = useApp();

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className={`text-[24px] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          Log a meal
        </h1>
        <p className={`text-[13px] mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          Search, scan, or enter what you ate.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={dark ? '#4a5580' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          placeholder="Search food..."
          className={`w-full pl-12 pr-4 py-4 rounded-2xl text-[15px] outline-none border ${
            dark
              ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-slate-600 focus:border-emerald-500/50'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
          }`}
        />
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            title: 'Scan Plate',
            desc: 'Take a photo of your meal',
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            ),
            action: () => {},
          },
          {
            title: 'Barcode',
            desc: 'Scan a product barcode',
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="7" y1="8" x2="7" y2="16" />
                <line x1="10" y1="8" x2="10" y2="16" />
                <line x1="13" y1="8" x2="13" y2="16" />
                <line x1="17" y1="8" x2="17" y2="16" />
              </svg>
            ),
            action: () => {},
          },
          {
            title: 'Restaurant',
            desc: 'Browse restaurant menus',
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            ),
            action: () => {},
          },
          {
            title: 'Manual Entry',
            desc: 'Enter macros yourself',
            icon: (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            ),
            action: () => {},
          },
        ].map((item, i) => (
          <button key={i} onClick={item.action}
            className={`p-5 rounded-2xl text-left transition-all border ${
              dark
                ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] active:scale-[0.98]'
                : 'bg-white border-slate-100 hover:border-slate-200 active:scale-[0.98]'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
              dark ? 'bg-white/[0.04]' : 'bg-slate-50'
            }`}>
              {item.icon}
            </div>
            <p className={`text-[14px] font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              {item.title}
            </p>
            <p className={`text-[11px] mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              {item.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Voice log hint */}
      <button onClick={() => setShowVoiceLog(true)}
        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
          dark
            ? 'bg-white/[0.02] border-white/[0.06] hover:border-emerald-500/30'
            : 'bg-white border-slate-100 hover:border-emerald-500/40'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className={`text-[13px] font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            Voice log
          </p>
          <p className={`text-[11px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            Say what you ate and we'll log it
          </p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={dark ? '#4a5580' : '#94a3b8'} strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
