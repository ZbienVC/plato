import React, { useEffect, useState } from 'react';

/**
 * Animated SVG donut chart
 * Renders children in center if provided, otherwise shows value/max
 */
export function ProgressRing({
  progress: progressProp,
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#10d9a0',
  bgColor = 'rgba(255,255,255,0.06)',
  trackColor,
  children,
  className = '',
}) {
  const [animated, setAnimated] = useState(0);

  // Support both progress (0-1) and value/max
  const targetProgress = progressProp != null
    ? Math.min(1, progressProp)
    : Math.min(1, (value || 0) / (max || 1));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - animated);
  const center = size / 2;

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const startVal = animated;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(startVal + (targetProgress - startVal) * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [targetProgress]);

  const ringColor = () => {
    if (targetProgress > 1) return '#EF4444';
    if (targetProgress > 0.85) return '#F59E0B';
    return color;
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={bgColor || trackColor || 'rgba(255,255,255,0.06)'}
          strokeWidth={strokeWidth} strokeLinecap="round"
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={ringColor()}
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            <span className="text-xl font-black tabular-nums text-white">
              {Math.round(value || 0)}
            </span>
            <span className="text-[9px] text-slate-500 font-semibold uppercase mt-0.5">
              / {max}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
