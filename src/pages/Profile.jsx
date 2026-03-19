import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { WeightTracker } from '../components/organisms/WeightTracker';
import { SettingsPanel } from '../components/organisms/SettingsPanel';

export function Profile() {
  const [showWeightTracker, setShowWeightTracker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const {
    dark, setDark, userProfile, planConfig, plan, streak,
    weightEntries, logWeight, advancedMode, setAdvancedMode,
    showMealImages, setShowMealImages, resetAll, logHistory,
  } = useApp();
  const { targets, current } = useMacros();

  const latestWeight = weightEntries.length > 0
    ? weightEntries[weightEntries.length - 1].weight
    : userProfile.weight;
  const weightTrend = weightEntries.length >= 2
    ? (weightEntries[weightEntries.length - 1].weight - weightEntries[weightEntries.length - 2].weight).toFixed(1)
    : null;

  const totalMealsLogged = (logHistory || []).reduce((sum, day) => sum + (day.meals?.length || 0), 0);

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div>
        <h1 className={`text-[24px] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          Profile
        </h1>
      </div>

      {/* User card */}
      <div className={`p-5 rounded-2xl border ${
        dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[22px] font-black">
              {(userProfile.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className={`text-[18px] font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              {userProfile.name || 'User'}
            </p>
            <p className={`text-[12px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              {planConfig.goal?.replace('-', ' ')?.replace(/^\w/, c => c.toUpperCase()) || 'No goal set'}
              {planConfig.trainingDays ? ` · ${planConfig.trainingDays}x/week` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Weight', value: `${latestWeight}`, unit: 'lbs', color: 'text-emerald-400' },
          { label: 'Streak', value: `${streak}`, unit: 'days', color: 'text-amber-400' },
          { label: 'Logged', value: `${totalMealsLogged}`, unit: 'meals', color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className={`text-center p-4 rounded-2xl border ${
            dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
          }`}>
            <p className={`text-[22px] font-black ${s.color}`}>{s.value}</p>
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{s.unit}</p>
            <p className={`text-[10px] mt-0.5 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weight section */}
      <div className={`p-5 rounded-2xl border ${
        dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-[15px] font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
            Weight
          </h2>
          <button onClick={() => setShowWeightTracker(true)}
            className="text-emerald-400 text-[12px] font-semibold"
          >Log Weight</button>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-[32px] font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{latestWeight}</span>
          <span className={`text-[14px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>lbs</span>
          {weightTrend && (
            <span className={`text-[13px] font-semibold ml-2 ${
              parseFloat(weightTrend) < 0 ? 'text-emerald-400' : parseFloat(weightTrend) > 0 ? 'text-amber-400' : 'text-slate-500'
            }`}>
              {parseFloat(weightTrend) > 0 ? '+' : ''}{weightTrend} lbs
            </span>
          )}
        </div>
        {/* Mini chart */}
        {weightEntries.length > 1 && (
          <div className="flex items-end gap-[3px] h-12 mt-4">
            {weightEntries.slice(-14).map((e, i, arr) => {
              const min = Math.min(...arr.map(x => x.weight)) - 1;
              const max = Math.max(...arr.map(x => x.weight)) + 1;
              const h = 10 + ((e.weight - min) / (max - min || 1)) * 80;
              return (
                <div key={i}
                  className={`flex-1 rounded-sm ${i === arr.length - 1 ? 'bg-emerald-400' : 'bg-emerald-500/30'}`}
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Daily targets */}
      {plan && (
        <div className={`p-5 rounded-2xl border ${
          dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
        }`}>
          <h2 className={`text-[15px] font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>
            Daily Targets
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Calories', value: targets.calories, unit: 'cal', color: 'bg-emerald-400' },
              { label: 'Protein', value: targets.protein, unit: 'g', color: 'bg-blue-400' },
              { label: 'Carbs', value: targets.carbs, unit: 'g', color: 'bg-amber-400' },
              { label: 'Fat', value: targets.fat, unit: 'g', color: 'bg-purple-400' },
            ].map(t => (
              <div key={t.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${t.color}`} />
                  <span className={`text-[13px] ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{t.label}</span>
                </div>
                <span className={`text-[13px] font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {t.value} {t.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body details */}
      <div className={`p-5 rounded-2xl border ${
        dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
      }`}>
        <h2 className={`text-[15px] font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>
          Body Details
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Age', value: userProfile.age ? `${userProfile.age} years` : '—' },
            { label: 'Gender', value: userProfile.gender ? userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1) : '—' },
            { label: 'Height', value: userProfile.height ? `${userProfile.height.feet}'${userProfile.height.inches}"` : '—' },
            { label: 'Activity', value: (planConfig.activity || planConfig.activityLevel || '—').replace(/^\w/, c => c.toUpperCase()) },
            { label: 'Diet', value: (planConfig.dietStyle || '—').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) },
          ].map(d => (
            <div key={d.label} className="flex items-center justify-between">
              <span className={`text-[13px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{d.label}</span>
              <span className={`text-[13px] font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu links */}
      <div>
        <h2 className={`text-[17px] font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
          More
        </h2>
        <div className="space-y-2">
          {[
            {
              label: 'Weight Tracking',
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
              action: () => setShowWeightTracker(true),
            },
            {
              label: 'Weekly Insights',
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
              action: () => {},
            },
            {
              label: 'Settings',
              icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
              action: () => setShowSettings(true),
            },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
                dark
                  ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  dark ? 'bg-white/[0.04]' : 'bg-slate-50'
                }`}>
                  {item.icon}
                </div>
                <span className={`font-semibold text-[13px] ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {item.label}
                </span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? '#4a5580' : '#94a3b8'} strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showWeightTracker && (
        <WeightTracker entries={weightEntries} onLog={logWeight} dark={dark} onClose={() => setShowWeightTracker(false)} />
      )}
      {showSettings && (
        <SettingsPanel
          dark={dark}
          onClose={() => setShowSettings(false)}
          onReset={resetAll}
          settings={{ darkMode: dark, showMealImages, advancedMode }}
          onUpdateSettings={(s) => {
            if (s.darkMode !== undefined) setDark(s.darkMode);
            if (s.showMealImages !== undefined) setShowMealImages(s.showMealImages);
            if (s.advancedMode !== undefined) setAdvancedMode(s.advancedMode);
          }}
        />
      )}
    </div>
  );
}
