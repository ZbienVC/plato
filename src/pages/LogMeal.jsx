import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function LogMeal() {
  const { setShowVoiceLog } = useApp();

  const actions = [
    { t: 'Voice Log', d: 'Speak your meal', c: 'from-teal-500/12 to-teal-500/5', ic: '#14B8A6',
      svg: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></>,
      action: () => setShowVoiceLog(true) },
    { t: 'Scan Plate', d: 'Photo your meal', c: 'from-indigo-500/12 to-indigo-500/5', ic: '#6366F1',
      svg: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
      action: () => {} },
    { t: 'Barcode', d: 'Scan a product', c: 'from-amber-500/12 to-amber-500/5', ic: '#F59E0B',
      svg: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="7" y2="16"/><line x1="11" y1="8" x2="11" y2="16"/><line x1="15" y1="8" x2="15" y2="16"/></>,
      action: () => {} },
    { t: 'Restaurant', d: 'Browse menus', c: 'from-rose-500/12 to-rose-500/5', ic: '#F43F5E',
      svg: <><path d="M3 3h18v18H3z"/><path d="M3 9h18"/><path d="M9 21V9"/></>,
      action: () => {} },
    { t: 'Manual Entry', d: 'Type macros', c: 'from-purple-500/12 to-purple-500/5', ic: '#A855F7',
      svg: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
      action: () => {} },
    { t: 'Quick Add', d: 'Recent meals', c: 'from-cyan-500/12 to-cyan-500/5', ic: '#06B6D4',
      svg: <><polyline points="12 8 12 12 14 14"/><circle cx="12" cy="12" r="10"/></>,
      action: () => {} },
  ];

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6 pb-4">
      <motion.div variants={item}>
        <h1 className="text-[24px] font-extrabold tracking-tight text-white">Log a meal</h1>
        <p className="text-[13px] text-slate-500 mt-1">Search, scan, or speak what you ate.</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Search food..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-[14px] outline-none glass text-white placeholder-slate-600 focus:border-teal-500/40 transition-colors"
        />
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a, i) => (
          <motion.button key={i} variants={item} whileTap={{ scale: 0.97 }} onClick={a.action}
            className="glass rounded-2xl p-5 text-left hover:border-white/[0.12] transition-colors">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.c} flex items-center justify-center mb-3`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={a.ic}
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{a.svg}</svg>
            </div>
            <p className="text-[14px] font-bold text-white">{a.t}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{a.d}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
