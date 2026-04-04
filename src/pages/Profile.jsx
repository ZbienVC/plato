import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { WeightTracker } from '../components/organisms/WeightTracker';
import { SettingsPanel } from '../components/organisms/SettingsPanel';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

export function Profile() {
  const [showWeight, setShowWeight] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTargets, setEditingTargets] = useState(false);
  const {
    dark, setDark, userProfile, setUserProfile, planConfig, plan, streak,
    weightEntries, logWeight, advancedMode, setAdvancedMode,
    showMealImages, setShowMealImages, resetAll, logHistory,
    isLoggedIn, setAuthModalOpen, logout,
  } = useApp();
  const { targets } = useMacros();

  const latestW = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : userProfile.weight;
  const wTrend = weightEntries.length >= 2
    ? (weightEntries[weightEntries.length - 1].weight - weightEntries[weightEntries.length - 2].weight).toFixed(1)
    : null;
  const totalLogged = (logHistory || []).reduce((s, d) => s + (d.meals?.length || 0), 0);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 pb-4">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      </motion.div>

      <motion.div variants={item} className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${isLoggedIn ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${isLoggedIn ? "bg-green-100" : "bg-slate-200"}`}>
            {isLoggedIn ? "âœ“" : "â˜"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{isLoggedIn ? "Syncing across devices" : "Sync your data"}</p>
            <p className="text-xs text-slate-500">{isLoggedIn ? "Logs backed up to cloud" : "Sign in to save logs everywhere"}</p>
          </div>
        </div>
        {isLoggedIn ? (
          <button onClick={logout} className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors px-2 py-1">Sign out</button>
        ) : (
          <button onClick={() => setAuthModalOpen(true)} className="px-3 py-1.5 rounded-xl bg-green-500 text-white text-xs font-semibold">Sign in</button>
        )}
      </motion.div>



      {/* User card */}
      <motion.div variants={item} className="app-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-black">{(userProfile.name || 'U')[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-slate-900 truncate">{userProfile.name || 'User'}</p>
            <p className="text-sm text-slate-400">
              {planConfig.goal?.replace('-', ' ')?.replace(/^\w/, c => c.toUpperCase()) || 'No goal set'}
              {planConfig.trainingDays ? ` · ${planConfig.trainingDays}x/week` : ''}
            </p>
          </div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {[
          { l: 'Weight', v: latestW, u: 'lbs', color: '#22C55E', bg: '#F0FDF4' },
          { l: 'Streak', v: streak, u: 'days', color: '#F97316', bg: '#FFF7ED' },
          { l: 'Logged', v: totalLogged, u: 'meals', color: '#3B82F6', bg: '#EFF6FF' },
        ].map(s => (
          <div key={s.l} className="text-center py-4 rounded-xl border border-slate-100" style={{ background: s.bg }}>
            <p className="text-xl font-black tabular-nums" style={{ color: s.color }}>{s.v}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{s.u}</p>
          </div>
        ))}
      </motion.div>

      {/* Weight Tracker */}
      <motion.div variants={item} className="app-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Weight</h2>
          <button onClick={() => setShowWeight(true)} className="text-green-500 text-xs font-semibold">Log</button>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900 tabular-nums">{latestW}</span>
          <span className="text-sm text-slate-400">lbs</span>
          {wTrend && (
            <span className={`text-sm font-semibold ml-1 ${+wTrend < 0 ? 'text-green-500' : +wTrend > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
              {+wTrend > 0 ? '+' : ''}{wTrend}
            </span>
          )}
        </div>
        {weightEntries.length > 1 && (
          <div className="flex items-end gap-[3px] h-10 mt-3">
            {weightEntries.slice(-14).map((e, i, a) => {
              const mn = Math.min(...a.map(x => x.weight)) - 1;
              const mx = Math.max(...a.map(x => x.weight)) + 1;
              const h = 10 + ((e.weight - mn) / (mx - mn || 1)) * 80;
              return <div key={i} className={`flex-1 rounded-sm ${i === a.length - 1 ? 'bg-green-500' : 'bg-green-200'}`} style={{ height: `${h}%` }} />;
            })}
          </div>
        )}
      </motion.div>

      {/* Daily Targets */}
      {plan && (
        <motion.div variants={item} className="app-card">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Daily Targets</h2>
          <div className="space-y-2.5">
            {[
              { l: 'Calories', v: `${targets.calories} cal`, color: '#22C55E' },
              { l: 'Protein', v: `${targets.protein}g`, color: '#3B82F6' },
              { l: 'Carbs', v: `${targets.carbs}g`, color: '#F59E0B' },
              { l: 'Fat', v: `${targets.fat}g`, color: '#F43F5E' },
            ].map(t => (
              <div key={t.l} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-sm text-slate-500">{t.l}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums">{t.v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Body Details */}
      <motion.div variants={item} className="app-card">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Details</h2>
        <div className="space-y-2.5">
          {[
            { l: 'Age', v: userProfile.age ? `${userProfile.age}` : '—' },
            { l: 'Gender', v: userProfile.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : '—' },
            { l: 'Height', v: userProfile.height ? `${userProfile.height.feet}'${userProfile.height.inches}"` : '—' },
            { l: 'Activity', v: (planConfig.activity || '—').replace(/^\w/, c => c.toUpperCase()) },
            { l: 'Diet', v: (planConfig.dietStyle || '—').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) },
          ].map(d => (
            <div key={d.l} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{d.l}</span>
              <span className="text-sm font-semibold text-slate-800">{d.v}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Links */}
      <motion.div variants={item} className="space-y-2">
        {[
          { l: 'Weight Tracking', color: '#22C55E', a: () => setShowWeight(true) },
          { l: 'Settings', color: '#6366F1', a: () => setShowSettings(true) },
        ].map((x, i) => (
          <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={x.a}
            className="w-full app-card flex items-center justify-between hover:bg-slate-50 transition-colors !py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full" style={{ background: x.color }} />
              </div>
              <span className="text-sm font-semibold text-slate-700">{x.l}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </motion.button>
        ))}
      </motion.div>

      {showWeight && <WeightTracker entries={weightEntries} onLog={logWeight} dark={false} onClose={() => setShowWeight(false)} />}
      {showSettings && (
        <SettingsPanel dark={false} onClose={() => setShowSettings(false)} onReset={resetAll}
          settings={{ darkMode: dark, showMealImages, advancedMode }}
          onUpdateSettings={s => {
            if (s.darkMode !== undefined) setDark(s.darkMode);
            if (s.showMealImages !== undefined) setShowMealImages(s.showMealImages);
            if (s.advancedMode !== undefined) setAdvancedMode(s.advancedMode);
          }}
        />
      )}
    </motion.div>
  );
}
