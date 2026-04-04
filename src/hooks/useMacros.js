import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

/**
 * Computed macro data for the current day
 * Returns: { caloriesProgress, proteinProgress, carbsProgress, fatProgress, remaining, isOnTrack }
 */
export function useMacros() {
  const { plan, dailyLog, planConfig, userProfile } = useApp();

  return useMemo(() => {
    // Use planConfig targets if no active plan yet (set during onboarding)
    const defaultTargets = {
      calories: planConfig?.calories || (userProfile?.calorieTarget) || 2000,
      protein:  planConfig?.protein  || (userProfile?.proteinTarget) || 150,
      carbs:    planConfig?.carbs    || (userProfile?.carbTarget)    || 200,
      fat:      planConfig?.fat      || (userProfile?.fatTarget)     || 65,
    };

    if (!plan) {
      const todayLog = dailyLog?.date === new Date().toISOString().split('T')[0] ? dailyLog : null;
      const cur = { calories: todayLog?.totalCalories || 0, protein: todayLog?.totalProtein || 0, carbs: todayLog?.totalCarbs || 0, fat: todayLog?.totalFat || 0 };
      return {
        targets: defaultTargets,
        current: cur,
        remaining: {
          calories: Math.max(0, defaultTargets.calories - cur.calories),
          protein:  Math.max(0, defaultTargets.protein  - cur.protein),
          carbs:    Math.max(0, defaultTargets.carbs    - cur.carbs),
          fat:      Math.max(0, defaultTargets.fat      - cur.fat),
        },
        progress: {
          calories: defaultTargets.calories > 0 ? Math.min(1, cur.calories / defaultTargets.calories) : 0,
          protein:  defaultTargets.protein  > 0 ? Math.min(1, cur.protein  / defaultTargets.protein)  : 0,
          carbs:    defaultTargets.carbs    > 0 ? Math.min(1, cur.carbs    / defaultTargets.carbs)    : 0,
          fat:      defaultTargets.fat      > 0 ? Math.min(1, cur.fat      / defaultTargets.fat)      : 0,
        },
        isOnTrack: true,
      };
    }

    const targets = {
      calories: plan.calories || defaultTargets.calories,
      protein:  plan.protein  || defaultTargets.protein,
      carbs:    plan.carbs    || defaultTargets.carbs,
      fat:      plan.fat      || defaultTargets.fat,
    };

    // Guard against stale log from a different day
    const isToday = dailyLog?.date === new Date().toISOString().split('T')[0];
    const current = {
      calories: isToday ? (dailyLog?.totalCalories || 0) : 0,
      protein:  isToday ? (dailyLog?.totalProtein  || 0) : 0,
      carbs:    isToday ? (dailyLog?.totalCarbs    || 0) : 0,
      fat:      isToday ? (dailyLog?.totalFat      || 0) : 0,
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
