import React from 'react';
import { Home, Plus, BookOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'log', label: 'Log', icon: Plus },
  { id: 'meals', label: 'Plans', icon: BookOpen },
  { id: 'explore', label: 'Explore', icon: Search },
];

export function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav ">
      <div className="flex items-center justify-around">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const isLog = id === 'log';

          if (isLog) {
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className="flex flex-col items-center -mt-6 relative"
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-all ${isActive ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-green-500/30' : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20'}`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-green-600' : 'text-slate-400'}`}>{label}</span>
              </button>
            );
          }

          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center py-1 px-3 relative min-w-[60px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-green-50 rounded-xl"
                  transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                />
              )}
              <div className="relative">
                <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[10px] font-medium mt-0.5 transition-colors ${isActive ? 'text-green-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
