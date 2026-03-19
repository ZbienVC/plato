import React from 'react';
import { ProgressRing } from '../molecules/ProgressRing';
import { MacroCard } from '../molecules/MacroCard';
import { COLORS } from '../../utils/constants';

/**
 * Combined calorie ring + 3 macro bars dashboard widget
 * Visual feedback animations on food logging
 */
export function MacroDashboard({
  targets = { calories: 2000, protein: 150, carbs: 200, fat: 65 },
  current = { calories: 0, protein: 0, carbs: 0, fat: 0 },
  mealBreakdown = [], // [{ label: 'Breakfast', protein: 28, carbs: 42, fat: 10 }, ...]
  dark = true,
  className = '',
}) {
  return (
    <div className={className}>
      {/* Calorie Ring — Center */}
      <div className="flex justify-center mb-6">
        <ProgressRing
          value={current.calories}
          max={targets.calories}
          size={180}
          strokeWidth={12}
          color={COLORS.calories}
          label="calories"
          sublabel={`${Math.round(Math.max(0, targets.calories - current.calories))} remaining`}
        />
      </div>

      {/* Macro Bars — 3 columns */}
      <div className="flex gap-3">
        <MacroCard
          label="Protein"
          current={current.protein}
          target={targets.protein}
          color={COLORS.protein}
          unit="g"
          breakdown={mealBreakdown.map(m => ({ label: m.label, value: m.protein }))}
          suggestion={
            current.protein < targets.protein * 0.5
              ? 'Try adding eggs or Greek yogurt to hit your target'
              : undefined
          }
        />
        <MacroCard
          label="Carbs"
          current={current.carbs}
          target={targets.carbs}
          color={COLORS.carbs}
          unit="g"
          breakdown={mealBreakdown.map(m => ({ label: m.label, value: m.carbs }))}
        />
        <MacroCard
          label="Fat"
          current={current.fat}
          target={targets.fat}
          color={COLORS.fat}
          unit="g"
          breakdown={mealBreakdown.map(m => ({ label: m.label, value: m.fat }))}
        />
      </div>
    </div>
  );
}
