import React, { useState } from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

/**
 * Settings Panel — user preferences, data management, about
 */
export function SettingsPanel({ dark = true, onClose, onReset, settings = {}, onUpdateSettings }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-3">
        {title}
      </p>
      {children}
    </div>
  );

  const Toggle = ({ label, description, value, onChange }) => (
    <div className={`flex items-center justify-between p-3 rounded-xl mb-2 ${
      dark ? 'bg-white/5' : 'bg-slate-50'
    }`}>
      <div className="flex-1 mr-4">
        <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-all ${
          value ? 'bg-emerald-500' : dark ? 'bg-slate-700' : 'bg-slate-300'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${
          value ? 'left-[22px]' : 'left-0.5'
        }`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-[420px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden ${
        dark ? 'bg-[#0f1629]' : 'bg-white'
      } shadow-2xl`}>
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/[0.06]">
          <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
            ⚙️ Settings
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl p-2">✕</button>
        </div>

        {/* Tab bar */}
        <div className="flex px-5 pt-3 gap-2 border-b border-white/[0.06]">
          {[
            { key: 'general', label: 'General' },
            { key: 'display', label: 'Display' },
            { key: 'data', label: 'Data' },
            { key: 'about', label: 'About' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg transition-all ${
                activeSection === tab.key
                  ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500'
                  : dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {activeSection === 'general' && (
            <>
              <Section title="Notifications">
                <Toggle
                  label="Meal Reminders"
                  description="Remind me to log meals"
                  value={settings.mealReminders ?? true}
                  onChange={(v) => onUpdateSettings?.({ ...settings, mealReminders: v })}
                />
                <Toggle
                  label="Weekly Reports"
                  description="Summary of your nutrition week"
                  value={settings.weeklyReports ?? true}
                  onChange={(v) => onUpdateSettings?.({ ...settings, weeklyReports: v })}
                />
              </Section>

              <Section title="Units">
                <div className="flex gap-2 mb-2">
                  {['Imperial (lbs/ft)', 'Metric (kg/cm)'].map((unit, i) => (
                    <button
                      key={i}
                      onClick={() => onUpdateSettings?.({ ...settings, units: i === 0 ? 'imperial' : 'metric' })}
                      className={`flex-1 p-3 rounded-xl text-sm font-bold transition-all ${
                        (settings.units || 'imperial') === (i === 0 ? 'imperial' : 'metric')
                          ? 'bg-emerald-500/10 border-2 border-emerald-500 text-emerald-400'
                          : dark
                            ? 'bg-white/5 border-2 border-transparent text-slate-400'
                            : 'bg-slate-100 border-2 border-transparent text-slate-600'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </Section>
            </>
          )}

          {activeSection === 'display' && (
            <>
              <Section title="Appearance">
                <Toggle
                  label="Dark Mode"
                  description="Toggle dark/light theme"
                  value={settings.darkMode ?? true}
                  onChange={(v) => onUpdateSettings?.({ ...settings, darkMode: v })}
                />
                <Toggle
                  label="Meal Images"
                  description="Show food images in meal cards"
                  value={settings.showMealImages ?? true}
                  onChange={(v) => onUpdateSettings?.({ ...settings, showMealImages: v })}
                />
                <Toggle
                  label="Advanced Macros"
                  description="Show micronutrients and fiber"
                  value={settings.advancedMode ?? false}
                  onChange={(v) => onUpdateSettings?.({ ...settings, advancedMode: v })}
                />
              </Section>

              <Section title="Dashboard">
                <Toggle
                  label="Compact View"
                  description="Smaller cards on home screen"
                  value={settings.compactView ?? false}
                  onChange={(v) => onUpdateSettings?.({ ...settings, compactView: v })}
                />
              </Section>
            </>
          )}

          {activeSection === 'data' && (
            <>
              <Section title="Data Management">
                <Card variant="glass" padding="md" dark={dark} className="mb-3">
                  <p className={`text-sm font-semibold mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
                    Export Data
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Download all your data as JSON
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => {
                    const data = {};
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key.startsWith('plato_')) {
                        data[key] = JSON.parse(localStorage.getItem(key));
                      }
                    }
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `plato-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}>
                    📥 Export JSON
                  </Button>
                </Card>

                <Card variant="glass" padding="md" dark={dark} className="mb-3">
                  <p className={`text-sm font-semibold mb-1 text-red-400`}>
                    Reset All Data
                  </p>
                  <p className="text-xs text-slate-500 mb-3">
                    Delete everything and start fresh. This cannot be undone.
                  </p>
                  {confirmReset ? (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1" onClick={() => setConfirmReset(false)}>
                        Cancel
                      </Button>
                      <button
                        onClick={onReset}
                        className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all"
                      >
                        Yes, Delete Everything
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmReset(true)}
                      className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      🗑️ Reset All Data
                    </button>
                  )}
                </Card>
              </Section>
            </>
          )}

          {activeSection === 'about' && (
            <Section title="About Plato">
              <Card variant="glass" padding="lg" dark={dark} className="text-center">
                <span className="text-4xl block mb-3">🍽️</span>
                <h3 className={`text-xl font-extrabold mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
                  PLATO
                </h3>
                <p className="text-emerald-400 text-sm font-semibold mb-1">
                  AI Nutrition Companion
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Version 2.0.0 · Modular Architecture
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Built with React + Vite + Tailwind</p>
                  <p className="text-xs text-slate-500">Designed for performance and extensibility</p>
                  <p className="text-xs text-slate-400 mt-3">© 2026 Plato · All rights reserved</p>
                </div>
              </Card>
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex-shrink-0 border-t border-white/[0.06]">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
