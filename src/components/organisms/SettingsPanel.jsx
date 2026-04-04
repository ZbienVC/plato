import React, { useState } from 'react';
import { Bell, Ruler, Trash2, Info, ChevronRight, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-green-500' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function MacroGoalsEditor() {
  const { planConfig, setPlanConfig } = useApp();
  const [editing, setEditing] = React.useState(false);
  const [vals, setVals] = React.useState({
    calories: planConfig?.calories || 2000,
    protein: planConfig?.protein || 150,
    carbs: planConfig?.carbs || 200,
    fat: planConfig?.fat || 65,
  });

  const save = () => {
    setPlanConfig(p => ({ ...(p || {}), ...vals }));
    setEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-slate-900">My Macro Goals</p>
          <p className="text-xs text-slate-400 mt-0.5">Your daily nutrition targets</p>
        </div>
        <button onClick={() => setEditing(e => !e)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>
      {editing ? (
        <div className="space-y-3">
          {[
            { key: 'calories', label: 'Calories', unit: 'kcal', color: '#10b981' },
            { key: 'protein',  label: 'Protein',  unit: 'g',    color: '#6366f1' },
            { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#f59e0b' },
            { key: 'fat',      label: 'Fat',      unit: 'g',    color: '#f43f5e' },
          ].map(({ key, label, unit, color }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-sm text-slate-600 w-16">{label}</span>
              <input type="number" value={vals[key]}
                onChange={e => setVals(v => ({ ...v, [key]: parseInt(e.target.value) || 0 }))}
                className="premium-input text-sm py-2 flex-1" />
              <span className="text-xs text-slate-400">{unit}</span>
            </div>
          ))}
          <button onClick={save} className="w-full py-2.5 rounded-xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            Save Goals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {[
            { l: 'Cal', v: planConfig?.calories || 2000, c: '#10b981' },
            { l: 'Pro', v: `${planConfig?.protein || 150}g`, c: '#6366f1' },
            { l: 'Carb', v: `${planConfig?.carbs || 200}g`, c: '#f59e0b' },
            { l: 'Fat', v: `${planConfig?.fat || 65}g`, c: '#f43f5e' },
          ].map(({ l, v, c }) => (
            <div key={l} className="text-center app-card-soft py-2">
              <p className="text-base font-black tabular-nums" style={{ color: c }}>{v}</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{l}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export function SettingsPanel() {
  const { dark, setDark, setActiveTab } = useApp();
  const [mealReminders, setMealReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [units, setUnits] = useState('imperial');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('home')}
          className="w-9 h-9 rounded-full app-card-soft flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
      </div>

      {/* Appearance */}
      <div className="app-card">
        <div className="px-4 py-3 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Appearance</p>
        </div>
        <div className="divide-y divide-slate-50">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              {dark ? <Moon className="w-5 h-5 text-slate-500" /> : <Sun className="w-5 h-5 text-slate-500" />}
              <div>
                <p className="text-sm font-semibold text-slate-900">Dark Mode</p>
                <p className="text-xs text-slate-400">Switch app appearance</p>
              </div>
            </div>
            <Toggle value={dark} onChange={setDark} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="app-card">
        <div className="px-4 py-3 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Notifications</p>
        </div>
        <div className="divide-y divide-slate-50">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Meal Reminders</p>
                <p className="text-xs text-slate-400">Remind me to log meals</p>
              </div>
            </div>
            <Toggle value={mealReminders} onChange={setMealReminders} />
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Weekly Reports</p>
                <p className="text-xs text-slate-400">Summary of your nutrition week</p>
              </div>
            </div>
            <Toggle value={weeklyReports} onChange={setWeeklyReports} />
          </div>
        </div>
      </div>

      {/* Units */}
      <div className="app-card">
        <div className="px-4 py-3 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Units</p>
        </div>
        <div className="px-4 py-4">
            <button
              onClick={() => setUnits('imperial')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${units === 'imperial' ? 'text-white btn-primary' : 'text-slate-500 app-card-soft'}`}>
              Imperial
            </button>
            <button
              onClick={() => setUnits('metric')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${units === 'metric' ? 'text-white btn-primary' : 'text-slate-500 app-card-soft'}`}>
              Metric
            </button>
          </div>
        </div>
      </div>

        <div className="px-4 py-3 border-b border-slate-50">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">About</p>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { label: 'Version', value: '2.0.0' },
            { label: 'Privacy Policy', value: '' },
            { label: 'Terms of Service', value: '' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-400" />
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
              </div>
              {item.value
                ? <span className="text-sm text-slate-400">{item.value}</span>
                : <ChevronRight className="w-4 h-4 text-slate-300" />
              }
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="app-card">
        <div className="px-4 py-3 border-b border-red-50">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-widest">Danger Zone</p>
        </div>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-600">Reset All Data</p>
              <p className="text-xs text-slate-400">Clears all your logs and settings</p>
            </div>
          </button>
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-sm text-slate-700 font-medium">Are you sure? This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 rounded-xl app-card-soft text-slate-700 text-sm font-semibold">Cancel</button>
              <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold">Reset</button>
            </div>
          </div>
        )}

      {/* Custom Macro Goals */}
      <div className="app-card">
        <MacroGoalsEditor />
      </div>
      </div>
    </div>
  );
}
