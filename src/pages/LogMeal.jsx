import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { MEAL_DATABASE } from '../services/mealGenerator';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const QUICK_FOODS = [
  { name: 'Scrambled Eggs (2)', calories: 180, protein: 12, carbs: 2, fat: 14, type: 'breakfast' },
  { name: 'Protein Shake', calories: 160, protein: 30, carbs: 8, fat: 3, type: 'snack' },
  { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0, type: 'snack' },
  { name: 'Chicken Breast 4oz', calories: 185, protein: 35, carbs: 0, fat: 4, type: 'lunch' },
  { name: 'Banana', calories: 90, protein: 1, carbs: 23, fat: 0, type: 'snack' },
  { name: 'Oatmeal (1 cup)', calories: 150, protein: 5, carbs: 27, fat: 3, type: 'breakfast' },
  { name: 'Brown Rice (1 cup)', calories: 215, protein: 5, carbs: 45, fat: 2, type: 'lunch' },
  { name: 'Almonds (1oz)', calories: 160, protein: 6, carbs: 6, fat: 14, type: 'snack' },
];

export function LogMeal() {
  const { logMeal, setShowVoiceLog, setActiveTab, dailyLog } = useApp();
  const [activeTab, setTab] = useState('manual');
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [logged, setLogged] = useState(null);

  const recentMeals = dailyLog?.meals?.slice(-4) || [];

  const searchResults = search.length > 1
    ? MEAL_DATABASE.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const handleLog = (meal) => {
    logMeal(meal);
    setLogged(meal.name);
    setTimeout(() => setLogged(null), 2000);
  };

  const handleCustomLog = () => {
    if (!customName) return;
    handleLog({
      name: customName,
      calories: parseInt(customCals) || 0,
      protein: parseInt(customProtein) || 0,
      carbs: parseInt(customCarbs) || 0,
      fat: parseInt(customFat) || 0,
      type: 'lunch',
    });
    setCustomName(''); setCustomCals(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
  };

  const TABS = ['manual', 'voice', 'scan', 'quick'];

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 pb-4">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900">Log a Meal</h1>
        <p className="text-sm text-slate-400 mt-0.5">Search, scan, or speak what you ate.</p>
      </motion.div>

      {/* Tab bar */}
      <motion.div variants={item} className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}>
            {t === 'quick' ? 'Quick Add' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Success toast */}
      <AnimatePresence>
        {logged && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="text-sm font-semibold text-green-700">Logged: {logged}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MANUAL TAB */}
      {activeTab === 'manual' && (
        <motion.div variants={item} className="space-y-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search food database..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="app-card space-y-1 p-3">
              {searchResults.map((m, i) => (
                <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleLog({ name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, type: m.type || 'lunch' })}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.protein}P · {m.carbs}C · {m.fat}F</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{m.calories}</span>
                    <span className="text-xs text-slate-400">cal</span>
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Recent meals */}
          {recentMeals.length > 0 && search.length < 2 && (
            <div className="app-card">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent</p>
              <div className="space-y-2">
                {recentMeals.map((m, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleLog(m)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">{new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{m.calories} cal</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Custom entry */}
          <div className="app-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Custom Entry</p>
            <div className="space-y-2">
              <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Food name"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              <div className="grid grid-cols-4 gap-2">
                {[['Cal', customCals, setCustomCals], ['Pro', customProtein, setCustomProtein], ['Carb', customCarbs, setCustomCarbs], ['Fat', customFat, setCustomFat]].map(([label, val, setter]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 text-center mb-1">{label}</p>
                    <input value={val} onChange={e => setter(e.target.value)} type="number" placeholder="0"
                      className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-center text-slate-900 outline-none focus:border-green-400" />
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleCustomLog}
                className="w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold mt-1">
                Add Food
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* VOICE TAB */}
      {activeTab === 'voice' && (
        <motion.div variants={item} className="app-card flex flex-col items-center py-10 gap-6">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowVoiceLog(true)}
            className="relative w-24 h-24 rounded-full bg-green-500 shadow-xl shadow-green-300/60 flex items-center justify-center"
          >
            <div className="absolute inset-0 rounded-full bg-green-500 animate-pulse-ring opacity-40" />
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
            </svg>
          </motion.button>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-800">Tap to speak your meal</p>
            <p className="text-sm text-slate-400 mt-1">e.g. "I had grilled chicken with rice and broccoli"</p>
          </div>
        </motion.div>
      )}

      {/* SCAN TAB */}
      {activeTab === 'scan' && (
        <motion.div variants={item} className="app-card flex flex-col items-center py-10 gap-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-800">Scan Coming Soon</p>
            <p className="text-sm text-slate-400 mt-1">Photo recognition & barcode scanning</p>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Coming Soon</span>
        </motion.div>
      )}

      {/* QUICK ADD TAB */}
      {activeTab === 'quick' && (
        <motion.div variants={item} className="app-card">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Common Foods</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_FOODS.map((food, i) => (
              <motion.button key={i} whileTap={{ scale: 0.96 }}
                onClick={() => handleLog(food)}
                className="text-left p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-green-200 transition-colors">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{food.name}</p>
                <p className="text-xs text-green-500 font-bold mt-1">{food.calories} cal</p>
                <p className="text-xs text-slate-400 mt-0.5">{food.protein}P · {food.carbs}C · {food.fat}F</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
