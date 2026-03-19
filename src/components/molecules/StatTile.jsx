import React from 'react';
import { Card } from '../atoms/Card';

/**
 * Compact stat display with label, value, and optional trend
 */
export function StatTile({
  label,
  value,
  trend, // "+3%" or "-5%"
  icon,
  dark = true,
  className = '',
}) {
  const isTrendPositive = trend && !trend.startsWith('-');
  const trendColor = isTrendPositive ? 'text-emerald-400' : 'text-red-400';

  return (
    <Card variant="glass" padding="md" dark={dark} className={className}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-emerald-400 w-4 h-4">{icon}</span>}
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
      </div>
      <p className="text-xl font-black text-white tabular-nums">
        {value}
      </p>
      {trend && (
        <p className={`text-xs font-semibold mt-1 ${trendColor}`}>
          {trend}
        </p>
      )}
    </Card>
  );
}
