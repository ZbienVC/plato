import React from 'react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { MacroDashboard } from '../components/organisms/MacroDashboard';
import { MealCard } from '../components/molecules/MealCard';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';

/**
 * Home — main dashboard
 * Shows macro dashboard, today's meals, quick actions
 * Has empty/welcome state when no plan exists
 */
export function Home() {
  const {
    dark, plan, dailyLog, logMeal, userProfile,
    activeTab, setActiveTab, setShowVoiceLog,
    showMealImages, streak, favorites, toggleFavorite,
  } = useApp();
  const { targets, current, remaining } = useMacros();

  const hasName = userProfile?.name;
  const hasPlan = plan && plan.meals && plan.meals.length > 0;
  const todayMeals = dailyLog?.meals || [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Get today's planned meals (cycle through plan by day)
  const dayIndex = Math.floor((Date.now() - new Date(plan?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) % 7;
  const mealsPerDay = plan?.mealsPerDay || 3;
  const todaysPlannedMeals = hasPlan
    ? plan.meals.slice(dayIndex * mealsPerDay, (dayIndex + 1) * mealsPerDay)
    : [];

  const mealSlotNames = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2', 'Snack 3'];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
          {greeting}{hasName ? `, ${userProfile.name}` : ''} 👋
        </h1>
        <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          {hasPlan
            ? `Day ${dayIndex + 1} · ${remaining.calories > 0 ? `${remaining.calories} cal remaining` : 'Goals hit! 🎉'}`
            : 'Ready to start your nutrition journey?'
          }
        </p>
      </div>

      {/* Streak banner */}
      {streak > 0 && (
        <Card variant="glass" padding="md" dark={dark}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                {streak} day streak!
              </p>
              <p className="text-xs text-slate-500">Keep it up — consistency is everything.</p>
            </div>
          </div>
        </Card>
      )}

      {/* EMPTY STATE — No plan yet */}
      {!hasPlan && (
        <div className="space-y-4">
          <Card variant="glass" padding="xl" dark={dark} className="text-center">
            <span className="text-5xl block mb-4">🍽️</span>
            <h2 className={`text-xl font-extrabold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
              No plan yet
            </h2>
            <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Generate a personalized meal plan based on your goals, or start logging meals manually.
            </p>
            <div className="flex gap-3">
              <Button variant="primary" size="lg" className="flex-1" onClick={() => setActiveTab('meals')}>
                Generate Plan 🚀
              </Button>
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setShowVoiceLog(true)}>
                Log a Meal 🎙️
              </Button>
            </div>
          </Card>

          {/* Quick tips */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '🎙️', title: 'Voice Log', desc: 'Speak your meal to log it instantly', action: () => setShowVoiceLog(true) },
              { emoji: '📋', title: 'Meal Plans', desc: 'Get a custom 7-day plan', action: () => setActiveTab('meals') },
              { emoji: '🏪', title: 'Restaurants', desc: 'Find the best macros nearby', action: () => setActiveTab('meals') },
              { emoji: '👤', title: 'Profile', desc: 'Set your goals and targets', action: () => setActiveTab('you') },
            ].map((tip, i) => (
              <Card
                key={i}
                variant="glass"
                padding="md"
                dark={dark}
                hover
                onClick={tip.action}
              >
                <span className="text-2xl block mb-2">{tip.emoji}</span>
                <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {tip.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">{tip.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE STATE — Has a plan */}
      {hasPlan && (
        <>
          {/* Macro Dashboard */}
          <MacroDashboard
            targets={targets}
            current={current}
            dark={dark}
          />

          {/* Quick log banner */}
          {todayMeals.length === 0 && (
            <Card
              variant="glass"
              padding="md"
              dark={dark}
              onClick={() => setShowVoiceLog(true)}
              hover
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-lg">🎙️</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                    Haven't logged yet today
                  </p>
                  <p className="text-xs text-slate-500">Tap to voice log your first meal</p>
                </div>
                <span className="text-emerald-400 text-xl">→</span>
              </div>
            </Card>
          )}

          {/* Today's Plan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                Today's Plan
              </h2>
              <button
                onClick={() => setActiveTab('meals')}
                className="text-emerald-400 text-xs font-bold hover:text-emerald-300"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {todaysPlannedMeals.map((meal, i) => {
                const isLogged = todayMeals.some(
                  m => m.name === meal.name || m.name?.toLowerCase() === meal.name?.toLowerCase()
                );
                const isFav = favorites.some(f => f.name === meal.name);
                return (
                  <MealCard
                    key={i}
                    meal={meal}
                    mealSlot={mealSlotNames[i] || `Meal ${i + 1}`}
                    logged={isLogged}
                    showImage={showMealImages}
                    dark={dark}
                    onLog={(m) => logMeal({
                      name: m.name,
                      calories: m.calories,
                      protein: m.protein,
                      carbs: m.carbs,
                      fat: m.fat,
                    })}
                    onSwap={() => {}}
                  />
                );
              })}
              {todaysPlannedMeals.length === 0 && (
                <Card variant="glass" padding="lg" dark={dark} className="text-center">
                  <p className="text-slate-500 text-sm">No planned meals for today</p>
                </Card>
              )}
            </div>
          </div>

          {/* Logged today */}
          {todayMeals.length > 0 && (
            <div>
              <h2 className={`text-lg font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
                Logged Today ({todayMeals.length})
              </h2>
              <div className="space-y-2">
                {todayMeals.map((meal, i) => (
                  <Card key={i} variant="glass" padding="sm" dark={dark}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 text-sm">✓</span>
                        <div>
                          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                            {meal.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-400">{meal.calories} cal</p>
                        <p className="text-[10px] text-slate-500">
                          {meal.protein}P · {meal.carbs}C · {meal.fat}F
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Water / Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card variant="glass" padding="md" dark={dark} className="text-center">
              <p className="text-2xl font-black text-emerald-400">{todayMeals.length}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Meals</p>
            </Card>
            <Card variant="glass" padding="md" dark={dark} className="text-center">
              <p className="text-2xl font-black text-blue-400">{current.protein}g</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Protein</p>
            </Card>
            <Card variant="glass" padding="md" dark={dark} className="text-center">
              <p className="text-2xl font-black text-amber-400">
                {targets.calories > 0 ? Math.round((current.calories / targets.calories) * 100) : 0}%
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Daily Goal</p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
