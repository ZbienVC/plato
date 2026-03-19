import React from 'react';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { MacroDashboard } from '../components/organisms/MacroDashboard';
import { MealCard } from '../components/molecules/MealCard';
import { Card } from '../components/atoms/Card';
import { Button } from '../components/atoms/Button';
import { getGreeting, formatDate } from '../utils/formatters';

/**
 * Home Dashboard — Tab 1
 * Today's progress, next meal, logged meals, streak, weekly snapshot
 */
export function Home() {
  const { dark, userProfile, plan, dailyLog, logMeal, streak, setActiveTab } = useApp();
  const { targets, current, remaining, progress } = useMacros();

  // Find next unlogged meal from plan
  const nextMeal = plan?.meals?.find((meal, i) =>
    !dailyLog.meals.find(m => m.name === meal.name)
  );

  const mealBreakdown = dailyLog.meals.map(m => ({
    label: m.type ? m.type.charAt(0).toUpperCase() + m.type.slice(1) : 'Meal',
    protein: m.protein || 0,
    carbs: m.carbs || 0,
    fat: m.fat || 0,
  }));

  return (
    <div className="px-4 pt-6 pb-4 animate-fadeIn">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className={`text-2xl font-extrabold ${dark ? 'text-white' : 'text-slate-900'}`}>
          {getGreeting(userProfile.name || 'there')}
        </h1>
        <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          {formatDate(new Date())}
        </p>
      </div>

      {/* Macro Dashboard */}
      <MacroDashboard
        targets={targets}
        current={current}
        mealBreakdown={mealBreakdown}
        dark={dark}
        className="mb-6"
      />

      {/* Next Up Card */}
      {nextMeal && (
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            NEXT UP
          </p>
          <MealCard
            meal={nextMeal}
            mealSlot={nextMeal.type?.charAt(0).toUpperCase() + nextMeal.type?.slice(1)}
            onLog={(meal) => logMeal(meal)}
            dark={dark}
          />
        </div>
      )}

      {/* Today's Log */}
      {dailyLog.meals.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            TODAY'S LOG
          </p>
          <div className="space-y-2">
            {dailyLog.meals.map((meal, i) => (
              <MealCard
                key={i}
                meal={meal}
                mealSlot={meal.type?.charAt(0).toUpperCase() + meal.type?.slice(1)}
                logged
                dark={dark}
              />
            ))}
          </div>
        </div>
      )}

      {/* Log CTA if empty */}
      {dailyLog.meals.length === 0 && !nextMeal && (
        <Card variant="glass" padding="lg" dark={dark} className="mb-6 text-center">
          <span className="text-4xl block mb-3">🍽️</span>
          <h3 className={`font-bold text-lg mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
            Nothing logged yet
          </h3>
          <p className={`text-sm mb-4 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
            Tap the + tab or 🎙️ button to log your first meal today.
          </p>
          <Button variant="primary" onClick={() => setActiveTab('log')}>
            Log a Meal
          </Button>
        </Card>
      )}

      {/* Streak */}
      {streak > 0 && (
        <Card variant="glass" padding="md" dark={dark} className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {streak}-day streak
                </p>
                <p className="text-xs text-slate-500">Keep it going!</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {Array(7).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${
                    i < Math.min(streak, 7)
                      ? 'bg-emerald-500'
                      : dark ? 'bg-white/[0.06]' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Weekly Snapshot */}
      <Card variant="glass" padding="md" dark={dark}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          THIS WEEK
        </p>
        <div className="flex justify-between items-end h-16">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
            const filled = i <= (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 rounded-sm transition-all ${
                    filled
                      ? 'bg-emerald-500/80'
                      : dark ? 'bg-white/[0.06]' : 'bg-slate-200'
                  }`}
                  style={{ height: filled ? `${20 + Math.random() * 30}px` : '8px' }}
                />
                <span className={`text-[10px] font-bold ${
                  isToday ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  {day}
                </span>
                {filled && <span className="text-[8px] text-emerald-400">✓</span>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
