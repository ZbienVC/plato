import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Coffee, Salad, Utensils, Apple, Plus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { FoodImage } from '../components/molecules/FoodImage';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const MEAL_ICONS = {
  breakfast: <Coffee className="w-4 h-4 text-amber-600" />,
  lunch: <Salad className="w-4 h-4 text-green-600" />,
  dinner: <Utensils className="w-4 h-4 text-slate-600" />,
  snack: <Apple className="w-4 h-4 text-red-500" />,
};
const getMealIcon = (type) => MEAL_ICONS[type?.toLowerCase()] || <Utensils className="w-4 h-4 text-slate-400" />;

/** Animated SVG progress ring */
function CalorieRing({ current, target }) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(current / target, 1) : 0;
  const dash = pct * circ;

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" className="rotate-[-90deg]">
      <circle cx="90" cy="90" r={r} fill="none" stroke="#E2E8F0" strokeWidth="12" />
      <motion.circle
        cx="90" cy="90" r={r}
        fill="none"
        stroke="#22C55E"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

/** Horizontal macro progress bar */
function MacroBar({ label, current, target, color }) {
  const pct = target > 0 ? Math.min(current / target, 1) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs font-semibold" style={{ color }}>{label}</span>
        <span className="text-xs text-slate-400 tabular-nums">{current}g / {target}g</span>
      </div>
      <div className="progress-bar">
        <motion.div
          className="progress-fill"
          style={{ background: color }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

const slots = ['breakfast', 'lunch', 'dinner', 'snack', 'snack'];

export function Home() {
  const { plan, dailyLog, logMeal, userProfile, setActiveTab, setShowVoiceLog, streak } = useApp();
  const { targets, current } = useMacros();
  const hasPlan = plan?.meals?.length > 0;
  const todayMeals = dailyLog?.meals || [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Streak tier
  const streakTier = streak >= 30 ? 'legendary' : streak >= 14 ? 'on-fire' : streak >= 7 ? 'hot' : streak >= 3 ? 'building' : 'start';
  const streakEmoji = { legendary: '🔥', 'on-fire': '🔥', hot: '🔥', building: '🔥', start: '✨' }[streakTier];
  const streakColor = streak >= 7 ? '#f97316' : streak >= 3 ? '#fb923c' : '#22c55e';
  const streakBg = streak >= 7 ? 'from-orange-50 to-amber-50 border-orange-100' : streak >= 3 ? 'from-amber-50 to-yellow-50 border-amber-100' : 'from-green-50 to-emerald-50 border-green-100';

  const dayIndex = Math.floor((Date.now() - new Date(plan?.createdAt || Date.now()).getTime()) / 86400000) % 7;
  const todaysPlanned = hasPlan ? plan.meals.slice(dayIndex * (plan.mealsPerDay || 3), (dayIndex + 1) * (plan.mealsPerDay || 3)) : [];

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 pb-4">
      {/* Header with gradient */}
      <motion.div variants={item} className="header-gradient rounded-2xl p-5">
        <p className="text-slate-500 text-sm">{dateStr}</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
          {greeting}{userProfile?.name ? `, ${userProfile.name}` : ''}
        </h1>
      </motion.div>

      {/* Streak Banner — always visible */}
      <motion.div
        variants={item}
        className={`bg-gradient-to-r ${streakBg} border rounded-2xl p-4 flex items-center gap-3`}
      >
        <motion.div
          animate={streak > 0 ? { scale: [1, 1.15, 1], rotate: [-3, 3, -3, 0] } : {}}
          transition={{ duration: 0.6, repeat: streak > 0 ? Infinity : 0, repeatDelay: 3 }}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${streakColor}18` }}
        >
          {streakEmoji}
        </motion.div>
        <div className="flex-1 min-w-0">
          {streak > 0 ? (
            <>
              <p className="text-sm font-bold text-slate-900">
                {streak} day streak{streak >= 7 ? ' 🎉' : ''}
              </p>
              <p className="text-xs text-slate-500">
                {streak >= 30 ? 'Legendary! You\'re unstoppable.' :
                 streak >= 14 ? 'Two weeks strong. Keep going!' :
                 streak >= 7 ? 'One week! You\'re on fire.' :
                 streak >= 3 ? 'Getting hot — don\'t break the chain!' :
                 'Nice start! Log meals daily to build your streak.'}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-900">Start your streak today</p>
              <p className="text-xs text-slate-500">Log a meal to begin your streak and build a healthy habit.</p>
            </>
          )}
        </div>
        {streak > 0 && (
          <div className="text-right shrink-0">
            <p className="text-2xl font-black tabular-nums" style={{ color: streakColor }}>{streak}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">days</p>
          </div>
        )}
      </motion.div>

      {/* Calorie Ring Card */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-center relative">
          <div className="ring-glow">
            <CalorieRing current={current.calories} target={targets.calories} />
          </div>
          <div className="absolute text-center">
            <p className="text-3xl font-black text-slate-900 tabular-nums">{current.calories.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-medium">of {targets.calories.toLocaleString()} kcal</p>
            {targets.calories > 0 && (
              <p className="text-xs font-semibold text-green-500 mt-1">
                {Math.max(0, targets.calories - current.calories)} remaining
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Macros */}
      <motion.div variants={item} className="app-card space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-slate-900">Macros Today</h2>
        </div>
        <MacroBar label="Protein" current={current.protein} target={targets.protein} color="#3B82F6" />
        <MacroBar label="Carbs" current={current.carbs} target={targets.carbs} color="#F59E0B" />
        <MacroBar label="Fat" current={current.fat} target={targets.fat} color="#F43F5E" />
      </motion.div>

      {/* Today's Logged Meals */}
      {todayMeals.length > 0 && (
        <motion.div variants={item} className="app-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">Today's Log</h2>
          </div>
          <div className="space-y-2">
            {todayMeals.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getMealIcon(m.type)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">{m.name}</p>
                    <p className="text-xs text-slate-400">{new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 tabular-nums">{m.calories} cal</p>
                  <p className="text-xs text-slate-400 tabular-nums">{m.protein}P · {m.carbs}C · {m.fat}F</p>
                </div>
              </div>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('log')}
            className="mt-3 w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold"
          >
            + Log Meal
          </motion.button>
        </motion.div>
      )}

      {/* Today's Plan */}
      {hasPlan && todaysPlanned.length > 0 && (
        <motion.div variants={item} className="app-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900">Today's Plan</h2>
            <button onClick={() => setActiveTab('meals')} className="text-sm text-green-600 font-medium">View All</button>
          </div>
          <div className="space-y-2">
            {todaysPlanned.map((meal, i) => {
              const logged = todayMeals.some(m => m.name?.toLowerCase() === meal.name?.toLowerCase());
              const slot = slots[i] || 'snack';
              return (
                <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
                  logged ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <FoodImage mealName={meal.name} mealType={meal.type || slot} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">{meal.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{meal.type || slot}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 tabular-nums">{meal.calories}</p>
                      <p className="text-xs text-slate-400">cal</p>
                    </div>
                    {!logged && (
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => logMeal({ name: meal.name, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, type: meal.type || slot })}
                        className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shrink-0"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </motion.button>
                    )}
                    {logged && (
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!hasPlan && todayMeals.length === 0 && (
        <motion.div variants={item} className="app-card text-center py-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 bg-green-50 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Start your day</h2>
          <p className="text-sm text-slate-400 mb-5 max-w-[220px] mx-auto">Generate a meal plan or log your first meal</p>
          <div className="flex gap-3 max-w-xs mx-auto">
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setActiveTab('meals')}
              className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm">
              Get a Plan
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setActiveTab('log')}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">
              Log Meal
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Log meal CTA if no meals logged yet but plan exists */}
      {hasPlan && todayMeals.length === 0 && (
        <motion.button variants={item} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab('log')}
          className="w-full app-card flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Log your first meal</p>
            <p className="text-xs text-slate-400">Tap to speak or type</p>
          </div>
          <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </motion.button>
      )}

      {/* Quick stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {[
          { l: 'Meals', v: todayMeals.length, color: '#22C55E', bg: '#F0FDF4' },
          { l: 'Protein', v: `${current.protein}g`, color: '#3B82F6', bg: '#EFF6FF' },
          { l: 'Progress', v: `${targets.calories > 0 ? Math.round(current.calories / targets.calories * 100) : 0}%`, color: '#F59E0B', bg: '#FFFBEB' },
        ].map(s => (
          <div key={s.l} className="text-center py-3 rounded-xl border border-slate-100"
            style={{ background: s.bg }}>
            <p className="text-xl font-black tabular-nums" style={{ color: s.color }}>{s.v}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{s.l}</p>
          </div>
        ))}
      </motion.div>

      {/* Streak widget removed — promoted to top banner */}
    </motion.div>
  );
}
