import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Scale, ShoppingCart, Trophy, Settings, HelpCircle, Flame, Moon, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DRAWER_ITEMS = [
  { icon: User, label: 'Profile & Stats', view: 'profile' },
  { icon: Scale, label: 'Weight Tracker', view: 'weight' },
  { icon: ShoppingCart, label: 'Grocery List', view: 'grocery' },
  { icon: Trophy, label: 'Achievements', view: 'achievements' },
  { icon: Settings, label: 'Settings', view: 'settings' },
  { icon: HelpCircle, label: 'Help & Feedback', view: 'help' },
];

export function Drawer() {
  const { drawerOpen, setDrawerOpen, userProfile, streak, dark, setDark, setActiveTab } = useApp();
  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleItem = (view) => {
    setDrawerOpen(false);
    setActiveTab(view);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed top-0 left-0 h-full w-[280px] z-[60] flex flex-col" style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(20px)", boxShadow: "4px 0 40px rgba(99,102,241,0.12)" }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Close button */}
            <div className="flex justify-end px-4 pt-4 pb-2">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-full hover:app-card-soft flex items-center justify-center"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* User section */}
            <div className="px-5 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3" style={{ background: "linear-gradient(135deg,#10b981,#6366f1)", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
                {initials}
              </div>
              <p className="font-bold text-slate-900 text-base">{userProfile?.name || 'Set your name'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-semibold text-slate-600">{streak || 0} day streak</span>
                {streak >= 7 && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>On Fire</span>}
              </div>
              {userProfile?.calorieTarget && (
                <p className="text-xs text-slate-400 mt-1">{userProfile.calorieTarget || 2000} cal target</p>
              )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 py-3 overflow-y-auto">
              {DRAWER_ITEMS.map(({ icon: Icon, label, view }) => (
                <button
                  key={view}
                  onClick={() => handleItem(view)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-left rounded-xl mx-1 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <Icon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  <span className="text-base font-medium text-slate-800">{label}</span>
                </button>
              ))}
            </nav>

            {/* Dark mode toggle */}
            <div className="border-t border-slate-100 px-5 py-4">
              <button
                onClick={() => setDark(d => !d)}
                className="flex items-center gap-4 w-full"
              >
                {dark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
                <span className="text-base font-medium text-slate-800">{dark ? 'Light Mode' : 'Dark Mode'}</span>
                <div className={`ml-auto w-11 h-6 rounded-full transition-colors ${dark ? '' : 'bg-slate-200'} relative flex-shrink-0`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
