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
  const {
    dark, setDark, userProfile, planConfig, plan, streak,
    weightEntries, logWeight, advancedMode, setAdvancedMode,
    showMealImages, setShowMealImages, resetAll, logHistory,
  } = useApp();
  const { targets } = useMacros();

  const latestW = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : userProfile.weight;
  const wTrend = weightEntries.length >= 2 ? (weightEntries[weightEntries.length - 1].weight - weightEntries[weightEntries.length - 2].weight).toFixed(1) : null;
  const totalLogged = (logHistory || []).reduce((s, d) => s + (d.meals?.length || 0), 0);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6 pb-4">
      <motion.div variants={item}>
        <h1 className="text-[24px] font-extrabold tracking-tight text-white">Profile</h1>
      </motion.div>

      {/* User card */}
      <motion.div variants={item} className="glass rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white text-[20px] font-black">{(userProfile.name || 'U')[0].toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-white truncate">{userProfile.name || 'User'}</p>
            <p className="text-[12px] text-slate-500">
              {planConfig.goal?.replace('-', ' ')?.replace(/^\w/, c => c.toUpperCase()) || 'No goal'}
              {planConfig.trainingDays ? ` · ${planConfig.trainingDays}x/week` : ''}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {[
          { l: 'Weight', v: latestW, u: 'lbs', c: 'text-teal-400', bg: 'from-teal-500/8' },
          { l: 'Streak', v: streak, u: 'days', c: 'text-amber-400', bg: 'from-amber-500/8' },
          { l: 'Logged', v: totalLogged, u: 'meals', c: 'text-blue-400', bg: 'from-blue-500/8' },
        ].map(s => (
          <div key={s.l} className={`text-center py-4 rounded-2xl glass bg-gradient-to-b ${s.bg} to-transparent`}>
            <p className={`text-[20px] font-black tabular-nums ${s.c}`}>{s.v}</p>
            <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{s.u}</p>
          </div>
        ))}
      </motion.div>

      {/* Weight */}
      <motion.div variants={item} className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-white">Weight</h2>
          <button onClick={() => setShowWeight(true)} className="text-teal-400 text-[12px] font-semibold">Log</button>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[30px] font-black text-white tabular-nums">{latestW}</span>
          <span className="text-[13px] text-slate-500">lbs</span>
          {wTrend && (
            <span className={`text-[12px] font-semibold ml-1 ${+wTrend < 0 ? 'text-teal-400' : +wTrend > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
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
              return <div key={i} className={`flex-1 rounded-sm ${i === a.length - 1 ? 'bg-teal-400' : 'bg-teal-500/25'}`} style={{ height: `${h}%` }} />;
            })}
          </div>
        )}
      </motion.div>

      {/* Targets */}
      {plan && (
        <motion.div variants={item} className="glass rounded-2xl p-5">
          <h2 className="text-[15px] font-bold text-white mb-3">Daily Targets</h2>
          <div className="space-y-2.5">
            {[
              { l: 'Calories', v: `${targets.calories} cal`, c: 'bg-teal-400' },
              { l: 'Protein', v: `${targets.protein}g`, c: 'bg-blue-400' },
              { l: 'Carbs', v: `${targets.carbs}g`, c: 'bg-amber-400' },
              { l: 'Fat', v: `${targets.fat}g`, c: 'bg-purple-400' },
            ].map(t => (
              <div key={t.l} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${t.c}`} />
                  <span className="text-[13px] text-slate-400">{t.l}</span>
                </div>
                <span className="text-[13px] font-bold text-white tabular-nums">{t.v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Body */}
      <motion.div variants={item} className="glass rounded-2xl p-5">
        <h2 className="text-[15px] font-bold text-white mb-3">Details</h2>
        <div className="space-y-2.5">
          {[
            { l: 'Age', v: userProfile.age ? `${userProfile.age}` : '—' },
            { l: 'Gender', v: userProfile.gender?.charAt(0).toUpperCase() + userProfile.gender?.slice(1) || '—' },
            { l: 'Height', v: userProfile.height ? `${userProfile.height.feet}'${userProfile.height.inches}"` : '—' },
            { l: 'Activity', v: (planConfig.activity || '—').replace(/^\w/, c => c.toUpperCase()) },
            { l: 'Diet', v: (planConfig.dietStyle || '—').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) },
          ].map(d => (
            <div key={d.l} className="flex items-center justify-between">
              <span className="text-[13px] text-slate-500">{d.l}</span>
              <span className="text-[13px] font-semibold text-white">{d.v}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Links */}
      <motion.div variants={item}>
        <div className="space-y-2">
          {[
            { l: 'Weight Tracking', ic: '#14B8A6', a: () => setShowWeight(true) },
            { l: 'Insights', ic: '#3B82F6', a: () => {} },
            { l: 'Settings', ic: '#A855F7', a: () => setShowSettings(true) },
          ].map((x, i) => (
            <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={x.a}
              className="w-full glass rounded-xl px-4 py-3.5 flex items-center justify-between hover:border-white/[0.12] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full" style={{ background: x.ic }} />
                </div>
                <span className="text-[13px] font-semibold text-white">{x.l}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {showWeight && <WeightTracker entries={weightEntries} onLog={logWeight} dark onClose={() => setShowWeight(false)} />}
      {showSettings && <SettingsPanel dark onClose={() => setShowSettings(false)} onReset={resetAll}
        settings={{ darkMode: dark, showMealImages, advancedMode }}
        onUpdateSettings={s => { if (s.darkMode !== undefined) setDark(s.darkMode); if (s.showMealImages !== undefined) setShowMealImages(s.showMealImages); if (s.advancedMode !== undefined) setAdvancedMode(s.advancedMode); }}
      />}
    </motion.div>
  );
}
