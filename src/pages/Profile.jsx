import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { Card } from '../components/atoms/Card';
import { StatTile } from '../components/molecules/StatTile';
import { Button } from '../components/atoms/Button';
import { WeightTracker } from '../components/organisms/WeightTracker';
import { SettingsPanel } from '../components/organisms/SettingsPanel';
import { calculateAge } from '../utils/formatters';

/**
 * Profile / You — Tab 4
 * Profile stats, weight chart, weekly summary, insights, achievements, settings
 */
export function Profile() {
  const [showWeightTracker, setShowWeightTracker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const {
    dark, setDark, userProfile, planConfig, plan, streak,
    weightEntries, logWeight, advancedMode, setAdvancedMode,
    showMealImages, setShowMealImages, resetAll,
  } = useApp();
  const { targets, current } = useMacros();

  const latestWeight = weightEntries.length > 0
    ? weightEntries[weightEntries.length - 1].weight
    : userProfile.weight;

  const weightTrend = weightEntries.length >= 2
    ? (weightEntries[weightEntries.length - 1].weight - weightEntries[weightEntries.length - 2].weight).toFixed(1)
    : null;

  return (
    <div className="px-4 pt-6 pb-4 animate-fadeIn">
      {/* Profile card */}
      <Card variant="glass" padding="lg" dark={dark} className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
            👤
          </div>
          <div>
            <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              {userProfile.name || 'Your Profile'}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-emerald-400 font-bold">
                🎯 {planConfig.goal?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              {streak > 0 && (
                <span className="text-xs text-amber-400 font-bold">
                  🔥 {streak}-day streak
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className={`p-2 rounded-lg text-center ${dark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <p className="text-[10px] text-slate-500">Age</p>
            <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              {calculateAge(userProfile.birthday) || userProfile.age}
            </p>
          </div>
          <div className={`p-2 rounded-lg text-center ${dark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <p className="text-[10px] text-slate-500">Weight</p>
            <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              {latestWeight} lbs
            </p>
          </div>
          <div className={`p-2 rounded-lg text-center ${dark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <p className="text-[10px] text-slate-500">Cal/day</p>
            <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              {targets.calories}
            </p>
          </div>
        </div>
      </Card>

      {/* Weight section */}
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          WEIGHT
        </p>
        <Card variant="glass" padding="md" dark={dark}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
                {latestWeight} lbs
              </p>
              {weightTrend && (
                <p className={`text-sm font-semibold ${
                  parseFloat(weightTrend) < 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {parseFloat(weightTrend) > 0 ? '+' : ''}{weightTrend} lbs
                </p>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowWeightTracker(true)}>
              + Log Weight
            </Button>
          </div>

          {/* Mini weight chart */}
          {weightEntries.length > 1 && (
            <div className="flex items-end justify-between h-16 gap-1">
              {weightEntries.slice(-14).map((entry, i) => {
                const min = Math.min(...weightEntries.slice(-14).map(e => e.weight));
                const max = Math.max(...weightEntries.slice(-14).map(e => e.weight));
                const range = max - min || 1;
                const height = 8 + ((entry.weight - min) / range) * 48;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-emerald-500/50 rounded-sm"
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Weekly summary */}
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          THIS WEEK
        </p>
        <div className="grid grid-cols-3 gap-3">
          <StatTile label="Avg Cal" value={Math.round(current.calories * 0.9)} trend="-5%" dark={dark} />
          <StatTile label="Avg Protein" value={`${Math.round(current.protein * 0.95)}g`} trend="+3%" dark={dark} />
          <StatTile label="Days Logged" value="5/7" dark={dark} />
        </div>
      </div>

      {/* AI Insight */}
      <Card variant="glass" padding="md" dark={dark} className="mb-6">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
              You consistently under-eat protein at breakfast. Try adding eggs or Greek yogurt to hit your daily target earlier.
            </p>
            <button className="text-xs text-emerald-400 font-bold mt-2">
              Show me recipes →
            </button>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          ACHIEVEMENTS
        </p>
        <div className="space-y-2">
          {[
            { emoji: '🏆', label: 'First Plan', earned: true },
            { emoji: '🔥', label: '7-Day Streak', earned: streak >= 7 },
            { emoji: '📸', label: 'Scan Master', earned: false },
            { emoji: '🎯', label: 'Macro Perfect', earned: false },
          ].map((badge, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                badge.earned
                  ? dark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                  : dark ? 'bg-white/[0.02] border border-white/[0.04]' : 'bg-slate-50 border border-slate-200'
              }`}
            >
              <span className={`text-lg ${badge.earned ? '' : 'opacity-30'}`}>{badge.emoji}</span>
              <span className={`text-sm font-semibold ${
                badge.earned
                  ? dark ? 'text-emerald-400' : 'text-emerald-700'
                  : dark ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {badge.label}
              </span>
              {badge.earned && <span className="ml-auto text-emerald-400 text-xs font-bold">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Settings links */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          MORE
        </p>
        <div className="space-y-1">
          {/* Dark mode toggle */}
          <div className={`flex items-center justify-between p-4 rounded-xl ${dark ? 'bg-white/5' : 'bg-white'}`}>
            <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
              Dark Mode
            </span>
            <button
              onClick={() => setDark(!dark)}
              className={`w-12 h-6 rounded-full relative transition-colors ${dark ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${dark ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Meal images toggle */}
          <div className={`flex items-center justify-between p-4 rounded-xl ${dark ? 'bg-white/5' : 'bg-white'}`}>
            <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
              Meal Photos
            </span>
            <button
              onClick={() => setShowMealImages(!showMealImages)}
              className={`w-12 h-6 rounded-full relative transition-colors ${showMealImages ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${showMealImages ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Nav links */}
          {[
            { label: 'Weekly Insights', emoji: '📊', action: () => {} },
            { label: 'Nutrient Support', emoji: '💊', action: () => {} },
            { label: 'Future You', emoji: '🎯', action: () => {} },
            { label: 'Import / Export', emoji: '📤', action: () => {} },
            { label: 'Settings', emoji: '⚙️', action: () => setShowSettings(true) },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`
                w-full flex items-center justify-between p-4 rounded-xl transition-all
                ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
              `}
            >
              <div className="flex items-center gap-3">
                <span>{item.emoji}</span>
                <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {item.label}
                </span>
              </div>
              <span className="text-slate-500">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Weight Tracker Modal */}
      {showWeightTracker && (
        <WeightTracker
          entries={weightEntries}
          onLog={logWeight}
          dark={dark}
          onClose={() => setShowWeightTracker(false)}
        />
      )}

      {/* Settings Panel Modal */}
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
