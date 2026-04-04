import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { auth } from '../lib/api';

const GOAL_ML = 2500; // 10 glasses default
const GLASS_ML = 250;

const QUICK_AMOUNTS = [
  { label: '1 glass', ml: 250 },
  { label: '500ml', ml: 500 },
  { label: '750ml', ml: 750 },
];

export function WaterWidget() {
  const [totalMl, setTotalMl] = useState(() => {
    try { return parseInt(localStorage.getItem('plato_water_today') || '0') || 0; } catch { return 0; }
  });
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Load from backend if logged in
  useEffect(() => {
    if (!auth.isLoggedIn()) return;
    fetch(`/api/water?date=${today}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('plato_token')}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setTotalMl(data.total_ml || 0); })
      .catch(() => {});
  }, [today]);

  const logWater = async (ml: number) => {
    // Optimistic update
    const next = totalMl + ml;
    setTotalMl(next);
    localStorage.setItem('plato_water_today', String(next));

    if (!auth.isLoggedIn()) return;
    try {
      await fetch('/api/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('plato_token')}`,
        },
        body: JSON.stringify({ amount_ml: ml, date: today }),
      });
    } catch { /* offline â€” local update stays */ }
  };

  const pct = Math.min(totalMl / GOAL_ML, 1);
  const glasses = Math.floor(totalMl / GLASS_ML);
  const goalGlasses = Math.floor(GOAL_ML / GLASS_ML);
  const remaining = Math.max(0, GOAL_ML - totalMl);

  return (
    <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Water Intake</p>
            <p className="text-xs text-slate-500">{glasses} / {goalGlasses} glasses</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-sky-600 tabular-nums">
            {totalMl >= 1000 ? `${(totalMl / 1000).toFixed(1)}L` : `${totalMl}ml`}
          </p>
          {remaining > 0 && (
            <p className="text-xs text-slate-400">{remaining}ml left</p>
          )}
          {remaining === 0 && (
            <p className="text-xs text-sky-600 font-semibold">Goal reached! ðŸŽ‰</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-sky-100 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Glass icons */}
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: goalGlasses }, (_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${i < glasses ? 'bg-sky-400' : 'bg-sky-100'}`}
          />
        ))}
      </div>

      {/* Quick add buttons */}
      <div className="flex gap-2">
        {QUICK_AMOUNTS.map(({ label, ml }) => (
          <motion.button
            key={label}
            whileTap={{ scale: 0.95 }}
            onClick={() => logWater(ml)}
            className="flex-1 py-2 rounded-xl bg-white border border-sky-200 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition-colors"
          >
            + {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
