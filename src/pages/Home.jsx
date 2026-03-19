import React from 'react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { MacroDashboard } from '../components/organisms/MacroDashboard';
import { MealCard } from '../components/molecules/MealCard';
import { Card } from '../components/atoms/Card';

export function Home() {
  const {
    dark, plan, dailyLog, logMeal, userProfile,
    setActiveTab, setShowVoiceLog,
    showMealImages, streak, favorites,
  } = useApp();
  const { targets, current, remaining } = useMacros();

  const hasName = userProfile?.name;
  const hasPlan = plan && plan.meals && plan.meals.length > 0;
  const todayMeals = dailyLog?.meals || [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const dayIndex = Math.floor((Date.now() - new Date(plan?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) % 7;
  const mealsPerDay = plan?.mealsPerDay || 3;
  const todaysPlannedMeals = hasPlan
    ? plan.meals.slice(dayIndex * mealsPerDay, (dayIndex + 1) * mealsPerDay)
    : [];
  const mealSlotNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2', 'Snack 3'];

  return (
    <div className="space-y-6 pb-4">
      {/* Greeting */}
      <div>
        <h1 className={`text-[24px] font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          {greeting}{hasName ? `, ${userProfile.name}` : ''}
        </h1>
        <p className={`text-[13px] mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          {hasPlan
            ? `Day ${dayIndex + 1} · ${remaining.calories > 0 ? `${remaining.calories} cal remaining` : 'Goals hit!'}`
            : 'Ready to start your nutrition journey?'}
        </p>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
          dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
        }`}>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 12c-2-2.67-4-4-4-6a4 4 0 0 1 8 0c0 2-2 3.33-4 6z" />
              <path d="M12 21a9 9 0 0 0 9-9c0-3-1-5.5-3-8l-3 3-3-3c-2 2.5-3 5-3 8a9 9 0 0 0 9 9z" />
            </svg>
          </div>
          <div>
            <p className={`text-[14px] font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              {streak} day streak
            </p>
            <p className={`text-[12px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Keep it up — consistency is key.</p>
          </div>
        </div>
      )}

      {/* === EMPTY STATE === */}
      {!hasPlan && (
        <div className="space-y-4">
          <div className={`text-center p-8 rounded-2xl border ${
            dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
          }`}>
            <div className={`w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
              dark ? 'bg-white/[0.04]' : 'bg-slate-50'
            }`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h2 className={`text-[20px] font-extrabold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
              No plan yet
            </h2>
            <p className={`text-[13px] mb-6 max-w-[260px] mx-auto leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Generate a personalized meal plan based on your goals, or start logging meals manually.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActiveTab('meals')}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[13px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform"
              >Generate Plan</button>
              <button onClick={() => setShowVoiceLog(true)}
                className={`flex-1 py-3.5 rounded-xl font-semibold text-[13px] border ${
                  dark ? 'border-white/[0.08] text-slate-300' : 'border-slate-200 text-slate-600'
                }`}
              >Log a Meal</button>
            </div>
          </div>

          {/* Quick tips */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Voice Log', desc: 'Speak your meal to log it', icon: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2', action: () => setShowVoiceLog(true) },
              { title: 'Meal Plans', desc: 'Get a custom 7-day plan', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2', action: () => setActiveTab('meals') },
              { title: 'Restaurants', desc: 'Find the best macros nearby', icon: 'M3 3h18v18H3zM3 9h18M9 21V9', action: () => setActiveTab('meals') },
              { title: 'Profile', desc: 'Set your goals and targets', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', action: () => setActiveTab('you') },
            ].map((tip, i) => (
              <button key={i} onClick={tip.action}
                className={`p-4 rounded-2xl text-left transition-all border ${
                  dark
                    ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                  dark ? 'bg-white/[0.04]' : 'bg-slate-50'
                }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={tip.icon} />
                  </svg>
                </div>
                <p className={`text-[13px] font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>{tip.title}</p>
                <p className={`text-[11px] mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{tip.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === ACTIVE STATE === */}
      {hasPlan && (
        <>
          <MacroDashboard targets={targets} current={current} dark={dark} />

          {/* Quick log nudge */}
          {todayMeals.length === 0 && (
            <button onClick={() => setShowVoiceLog(true)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                dark
                  ? 'bg-white/[0.02] border-white/[0.06] hover:border-emerald-500/30'
                  : 'bg-white border-slate-100 hover:border-emerald-500/40'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className={`text-[13px] font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Haven't logged yet today
                </p>
                <p className={`text-[11px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Tap to voice log your first meal</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Today's Plan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-[17px] font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Today's Plan
              </h2>
              <button onClick={() => setActiveTab('meals')}
                className="text-emerald-400 text-[12px] font-semibold"
              >View All</button>
            </div>
            <div className="space-y-3">
              {todaysPlannedMeals.map((meal, i) => {
                const isLogged = todayMeals.some(
                  m => m.name?.toLowerCase() === meal.name?.toLowerCase()
                );
                return (
                  <MealCard
                    key={i}
                    meal={meal}
                    mealSlot={mealSlotNames[i] || `Meal ${i + 1}`}
                    logged={isLogged}
                    showImage={showMealImages}
                    dark={dark}
                    onLog={(m) => logMeal({
                      name: m.name, calories: m.calories,
                      protein: m.protein, carbs: m.carbs, fat: m.fat,
                    })}
                    onSwap={() => {}}
                  />
                );
              })}
            </div>
          </div>

          {/* Logged today */}
          {todayMeals.length > 0 && (
            <div>
              <h2 className={`text-[17px] font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
                Logged Today
              </h2>
              <div className="space-y-2">
                {todayMeals.map((meal, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${
                    dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-[13px] font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                          {meal.name}
                        </p>
                        <p className={`text-[11px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-bold text-emerald-400">{meal.calories} cal</p>
                      <p className={`text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {meal.protein}P · {meal.carbs}C · {meal.fat}F
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Meals', value: todayMeals.length, color: 'text-emerald-400' },
              { label: 'Protein', value: `${current.protein}g`, color: 'text-blue-400' },
              { label: 'Daily Goal', value: `${targets.calories > 0 ? Math.round((current.calories / targets.calories) * 100) : 0}%`, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className={`text-center p-4 rounded-2xl border ${
                dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-100'
              }`}>
                <p className={`text-[22px] font-black ${s.color}`}>{s.value}</p>
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
