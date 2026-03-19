import React, { useState } from 'react';
import { MealCard } from '../molecules/MealCard';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

/**
 * Day-by-day meal plan viewer with day selector, meal cards, and actions
 */
export function MealPlanViewer({
  plan,
  mealStates = {}, // { [mealIndex]: 'ate' | 'skipped' | 'swapped' }
  onLogMeal,
  onSwapMeal,
  onGenerateNew,
  dark = true,
}) {
  const [dayIndex, setDayIndex] = useState(0);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1; // Mon=0

  if (!plan || !plan.meals || plan.meals.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">🍽️</span>
        <h3 className={`text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
          No Active Plan
        </h3>
        <p className={`text-sm mb-6 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
          Generate a personalized meal plan to get started.
        </p>
        {onGenerateNew && (
          <Button variant="primary" size="lg" onClick={onGenerateNew}>
            🔄 Generate New Plan
          </Button>
        )}
      </div>
    );
  }

  const mealSlotLabels = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Snack 2', 'Snack 3'];
  const mealTimes = ['8:00am', '12:30pm', '6:30pm', '3:00pm', '10:15am', '9:00pm'];

  return (
    <div>
      {/* Plan header */}
      <Card variant="glass" padding="md" dark={dark} className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">YOUR PLAN</p>
            <h3 className={`font-bold text-lg ${dark ? 'text-white' : 'text-slate-900'}`}>
              {plan.name || 'Custom Plan'}
            </h3>
            <p className={`text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              {plan.calories} cal · Day {dayIndex + 1}
            </p>
          </div>
          <span className="text-3xl">🍽️</span>
        </div>
      </Card>

      {/* Day selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setDayIndex(Math.max(0, dayIndex - 1))}
          className={`p-2 rounded-lg ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
          disabled={dayIndex === 0}
        >
          ◀
        </button>

        <div className="flex gap-1">
          {days.map((day, i) => (
            <button
              key={day}
              onClick={() => setDayIndex(i)}
              className={`
                w-10 h-10 rounded-xl text-xs font-bold transition-all
                ${dayIndex === i
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : i === todayIndex
                    ? dark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900'
                    : dark ? 'text-slate-500 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-100'
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>

        <button
          onClick={() => setDayIndex(Math.min(6, dayIndex + 1))}
          className={`p-2 rounded-lg ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
          disabled={dayIndex === 6}
        >
          ▶
        </button>
      </div>

      {/* Meal cards */}
      <div className="space-y-3 mb-6">
        {plan.meals.map((meal, i) => (
          <MealCard
            key={`${dayIndex}-${i}`}
            meal={meal}
            mealSlot={mealSlotLabels[i] || `Meal ${i + 1}`}
            time={mealTimes[i]}
            logged={mealStates[`${dayIndex}-${i}`] === 'ate'}
            onLog={onLogMeal ? () => onLogMeal(meal, i) : undefined}
            onSwap={onSwapMeal ? () => onSwapMeal(meal, i) : undefined}
            dark={dark}
          />
        ))}
      </div>

      {/* Generate new plan CTA */}
      {onGenerateNew && (
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onGenerateNew}
        >
          🔄 Generate New Plan
        </Button>
      )}
    </div>
  );
}
