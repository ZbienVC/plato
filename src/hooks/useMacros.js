import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Computed macro data for the current day
 * Returns: { caloriesProgress, proteinProgress, carbsProgress, fatProgress, remaining, isOnTrack }
 */
export function useMacros() {
  const { plan, dailyLog } = useApp();

  return useMemo(() => {
    if (!plan) {
      return {
        targets: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
        current: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        remaining: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
        progress: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        isOnTrack: true,
      };
    }

    const targets = {
      calories: plan.calories || 2000,
      protein: plan.protein || 150,
      carbs: plan.carbs || 200,
      fat: plan.fat || 65,
    };

    const current = {
      calories: dailyLog.totalCalories,
      protein: dailyLog.totalProtein,
      carbs: dailyLog.totalCarbs,
      fat: dailyLog.totalFat,
    };

    const remaining = {
      calories: Math.max(0, targets.calories - current.calories),
      protein: Math.max(0, targets.protein - current.protein),
      carbs: Math.max(0, targets.carbs - current.carbs),
      fat: Math.max(0, targets.fat - current.fat),
    };

    const progress = {
      calories: Math.min(1, current.calories / targets.calories),
      protein: Math.min(1, current.protein / targets.protein),
      carbs: Math.min(1, current.carbs / targets.carbs),
      fat: Math.min(1, current.fat / targets.fat),
    };

    const isOnTrack = current.calories <= targets.calories * 1.1;

    return { targets, current, remaining, progress, isOnTrack };
  }, [plan, dailyLog]);
}
