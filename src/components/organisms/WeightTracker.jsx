import React, { useState } from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

/**
 * Weight Tracker — log weight entries, view chart, see trends
 */
export function WeightTracker({ entries = [], onLog, dark = true, onClose }) {
  const [newWeight, setNewWeight] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleLog = () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) return;
    if (onLog) onLog(weight);
    setNewWeight('');
    setShowInput(false);
  };

  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
  const oldest = entries.length > 1 ? entries[0] : null;
  const totalChange = latest && oldest ? (latest.weight - oldest.weight).toFixed(1) : null;
  const weeklyAvg = entries.length >= 7
    ? (entries.slice(-7).reduce((sum, e) => sum + e.weight, 0) / 7).toFixed(1)
    : null;

  // Chart data — normalize heights
  const chartEntries = entries.slice(-30);
  const min = chartEntries.length > 0 ? Math.min(...chartEntries.map(e => e.weight)) - 2 : 0;
  const max = chartEntries.length > 0 ? Math.max(...chartEntries.map(e => e.weight)) + 2 : 1;
  const range = max - min || 1;

  const bmiCard = bmi ? (
    <div className="app-card" style={{ marginBottom: 12 }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Body Mass Index</p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: bmiColor + "18", color: bmiColor }}>{bmiCategory}</span>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <p className="text-3xl font-black" style={{ color: bmiColor }}>{bmi}</p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>BMI</p>
        </div>
        <div className="flex-1">
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.1)" }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min(100, ((bmi - 15) / 25) * 100)}%`,
              background: bmiColor
            }} />
          </div>
          <div className="flex justify-between text-[10px] mt-1" style={{ color: "#94a3b8" }}>
            <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
          </div>
        </div>
      </div>
      {idealWeightMin > 0 && (
        <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
          Ideal range: <span style={{ color: "#1e293b", fontWeight: 600 }}>{idealWeightMin}–{idealWeightMax} lbs</span>
        </p>
      )}
    </div>
  ) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-[420px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden ${
        dark ? 'bg-[#0f1629]' : 'bg-white'
      } shadow-2xl`}>
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/[0.06]">
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              ⚖️ Weight Tracking
            </h2>
            <p className="text-xs text-slate-500">
              {entries.length} entries recorded
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl p-2">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Current weight */}
          {latest && (
            <Card variant="glass" padding="lg" dark={dark} className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Current</p>
                  <p className={`text-3xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {latest.weight} <span className="text-lg text-slate-500">lbs</span>
                  </p>
                </div>
                {totalChange && (
                  <div className={`text-right ${parseFloat(totalChange) < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <p className="text-sm font-bold">
                      {parseFloat(totalChange) > 0 ? '+' : ''}{totalChange} lbs
                    </p>
                    <p className="text-[10px] text-slate-500">total change</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Stats row */}
          {entries.length > 1 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Card variant="glass" padding="sm" dark={dark} className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Highest</p>
                <p className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {Math.max(...entries.map(e => e.weight))} lbs
                </p>
              </Card>
              <Card variant="glass" padding="sm" dark={dark} className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Lowest</p>
                <p className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {Math.min(...entries.map(e => e.weight))} lbs
                </p>
              </Card>
              <Card variant="glass" padding="sm" dark={dark} className="text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase">7d Avg</p>
                <p className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {weeklyAvg || '—'} lbs
                </p>
              </Card>
            </div>
          )}

          {/* Chart */}
          {bmiCard}
          {chartEntries.length > 1 && (
            <Card variant="glass" padding="md" dark={dark} className="mb-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                30-DAY TREND
              </p>
              <div className="flex items-end gap-[2px] h-24">
                {chartEntries.map((entry, i) => {
                  const height = 8 + ((entry.weight - min) / range) * 80;
                  const isLatest = i === chartEntries.length - 1;
                  const bmiCard = bmi ? (
    <div className="app-card" style={{ marginBottom: 12 }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Body Mass Index</p>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: bmiColor + "18", color: bmiColor }}>{bmiCategory}</span>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <p className="text-3xl font-black" style={{ color: bmiColor }}>{bmi}</p>
          <p className="text-xs" style={{ color: "#94a3b8" }}>BMI</p>
        </div>
        <div className="flex-1">
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.1)" }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min(100, ((bmi - 15) / 25) * 100)}%`,
              background: bmiColor
            }} />
          </div>
          <div className="flex justify-between text-[10px] mt-1" style={{ color: "#94a3b8" }}>
            <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
          </div>
        </div>
      </div>
      {idealWeightMin > 0 && (
        <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
          Ideal range: <span style={{ color: "#1e293b", fontWeight: 600 }}>{idealWeightMin}–{idealWeightMax} lbs</span>
        </p>
      )}
    </div>
  ) : null;

  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm transition-all ${
                        isLatest ? 'bg-emerald-400' : 'bg-emerald-500/40'
                      }`}
                      style={{ height: `${height}%` }}
                      title={`${entry.date}: ${entry.weight} lbs`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[9px] text-slate-500">{chartEntries[0]?.date}</span>
                <span className="text-[9px] text-slate-500">{chartEntries[chartEntries.length - 1]?.date}</span>
              </div>
            </Card>
          )}

          {/* Log weight input */}
          {showInput ? (
            <Card variant="glass" padding="md" dark={dark} className="mb-4">
              <p className={`text-sm font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
                Log today's weight
              </p>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="180"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  dark={dark}
                  className="flex-1"
                />
                <Button variant="primary" onClick={handleLog}>
                  Log ✓
                </Button>
              </div>
            </Card>
          ) : (
            <Button variant="secondary" fullWidth onClick={() => setShowInput(true)} className="mb-4">
              + Log Weight
            </Button>
          )}

          {/* History */}
          {entries.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                HISTORY
              </p>
              <div className="space-y-1">
                {[...entries].reverse().slice(0, 20).map((entry, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      dark ? 'bg-white/[0.03]' : 'app-card-soft'
                    }`}
                  >
                    <span className="text-xs text-slate-500">{entry.date}</span>
                    <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {entry.weight} lbs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entries.length === 0 && !showInput && (
            <div className="text-center py-8">
              <span className="text-4xl block mb-3">⚖️</span>
              <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>No entries yet</p>
              <p className="text-sm text-slate-500">Start tracking your weight to see trends.</p>
            </div>
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
