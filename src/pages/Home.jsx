import React from 'react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { MacroDashboard } from '../components/organisms/MacroDashboard';
import { MealCard } from '../components/molecules/MealCard';

export function Home() {
  const {
    dark, plan, dailyLog, logMeal, userProfile,
    setActiveTab, setShowVoiceLog, showMealImages, streak, favorites,
  } = useApp();
  const { targets, current, remaining } = useMacros();

  const hasName = userProfile?.name;
  const hasPlan = plan?.meals?.length > 0;
  const todayMeals = dailyLog?.meals || [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dayIndex = Math.floor((Date.now() - new Date(plan?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) % 7;
  const mealsPerDay = plan?.mealsPerDay || 3;
  const todaysPlannedMeals = hasPlan ? plan.meals.slice(dayIndex * mealsPerDay, (dayIndex + 1) * mealsPerDay) : [];
  const mealSlotNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2', 'Snack 3'];

  return (
    <div className="space-y-5 pb-4 stagger">
      {/* Greeting */}
      <div className="animate-fadeIn">
        <h1 className="text-[26px] font-extrabold tracking-tight text-white">
          {greeting}{hasName ? `, ${userProfile.name}` : ''}
        </h1>
        <p className="text-[13px] mt-1 text-slate-500">
          {hasPlan
            ? `Day ${dayIndex + 1} · ${remaining.calories > 0 ? `${remaining.calories} cal remaining` : 'Goals hit!'}`
            : 'Ready to start your nutrition journey?'}
        </p>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
              <path d="M12 12c-2-2.67-4-4-4-6a4 4 0 0 1 8 0c0 2-2 3.33-4 6z" />
              <path d="M12 21a9 9 0 0 0 9-9c0-3-1-5.5-3-8l-3 3-3-3c-2 2.5-3 5-3 8a9 9 0 0 0 9 9z" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-white">{streak} day streak</p>
            <p className="text-[11px] text-slate-500">Consistency is everything.</p>
          </div>
        </div>
      )}

      {/* === EMPTY STATE === */}
      {!hasPlan && (
        <div className="space-y-4 animate-fadeIn">
          <div className="glass-card rounded-2xl p-7 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <defs><linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10d9a0" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="url(#emptyGrad)" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="url(#emptyGrad)" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="url(#emptyGrad)" strokeWidth="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="url(#emptyGrad)" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="text-[20px] font-extrabold text-white mb-2">No plan yet</h2>
            <p className="text-[13px] text-slate-400 mb-6 max-w-[240px] mx-auto leading-relaxed">
              Generate a personalized meal plan or start logging meals right away.
            </p>
            <div className="flex gap-3 max-w-[300px] mx-auto">
              <button onClick={() => setActiveTab('meals')}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[13px] shadow-glow-emerald press"
              >Generate Plan</button>
              <button onClick={() => setShowVoiceLog(true)}
                className="flex-1 py-3.5 rounded-xl glass-card text-slate-300 font-semibold text-[13px] press"
              >Log a Meal</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Voice Log', desc: 'Speak to log meals', color: 'from-emerald-500/15 to-teal-500/10', iconColor: '#10d9a0',
                icon: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2', action: () => setShowVoiceLog(true) },
              { title: 'Meal Plans', desc: 'Custom 7-day plans', color: 'from-blue-500/15 to-indigo-500/10', iconColor: '#6366f1',
                icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2', action: () => setActiveTab('meals') },
              { title: 'Restaurants', desc: 'Find best macros', color: 'from-amber-500/15 to-orange-500/10', iconColor: '#f59e0b',
                icon: 'M3 3h18v18H3zM3 9h18M9 21V9', action: () => setActiveTab('meals') },
              { title: 'Profile', desc: 'Set your targets', color: 'from-purple-500/15 to-pink-500/10', iconColor: '#a855f7',
                icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', action: () => setActiveTab('you') },
            ].map((tip, i) => (
              <button key={i} onClick={tip.action}
                className="glass-card rounded-2xl p-4 text-left press hover:border-white/[0.12] transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center mb-3`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tip.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={tip.icon} />
                  </svg>
                </div>
                <p className="text-[13px] font-bold text-white">{tip.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{tip.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === ACTIVE STATE === */}
      {hasPlan && (
        <>
          <div className="animate-fadeIn">
            <MacroDashboard targets={targets} current={current} dark={dark} />
          </div>

          {/* Voice log nudge */}
          {todayMeals.length === 0 && (
            <button onClick={() => setShowVoiceLog(true)}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 press hover:border-white/[0.12] transition-all animate-fadeIn"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-semibold text-white">Log your first meal</p>
                <p className="text-[11px] text-slate-500">Tap to voice log</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a5580" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          )}

          {/* Today's Plan */}
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-bold text-white">Today's Plan</h2>
              <button onClick={() => setActiveTab('meals')} className="text-emerald-400 text-[12px] font-semibold press">View All</button>
            </div>
            <div className="space-y-3">
              {todaysPlannedMeals.map((meal, i) => (
                <MealCard
                  key={i} meal={meal} mealSlot={mealSlotNames[i] || `Meal ${i + 1}`}
                  logged={todayMeals.some(m => m.name?.toLowerCase() === meal.name?.toLowerCase())}
                  showImage={showMealImages} dark={dark}
                  onLog={(m) => logMeal({ name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat })}
                  onSwap={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Logged */}
          {todayMeals.length > 0 && (
            <div className="animate-fadeIn">
              <h2 className="text-[17px] font-bold text-white mb-3">Logged Today</h2>
              <div className="space-y-2">
                {todayMeals.map((meal, i) => (
                  <div key={i} className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{meal.name}</p>
                        <p className="text-[11px] text-slate-500">{new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-emerald-400 tabular-nums">{meal.calories} cal</p>
                      <p className="text-[10px] text-slate-500 tabular-nums">{meal.protein}P · {meal.carbs}C · {meal.fat}F</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 animate-fadeIn">
            {[
              { label: 'Meals', value: todayMeals.length, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-teal-500/5' },
              { label: 'Protein', value: `${current.protein}g`, color: 'text-blue-400', bg: 'from-blue-500/10 to-indigo-500/5' },
              { label: 'Goal', value: `${targets.calories > 0 ? Math.round((current.calories / targets.calories) * 100) : 0}%`, color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/5' },
            ].map(s => (
              <div key={s.label} className={`text-center p-4 rounded-2xl glass-card bg-gradient-to-br ${s.bg}`}>
                <p className={`text-[22px] font-black tabular-nums ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
