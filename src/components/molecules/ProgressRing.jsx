import React, { useEffect, useState } from 'react';

/**
 * Animated SVG donut chart
 * Props: value, max, size, strokeWidth, color, trackColor, label, sublabel
 */
export function ProgressRing({
  value = 0,
  max = 100,
  size = 180,
  strokeWidth = 12,
  color = '#10d9a0',
  trackColor = 'rgba(255,255,255,0.06)',
  label,
  sublabel,
  animated = true,
  className = '',
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, animatedValue / max);
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  useEffect(() => {
    if (!animated) {
      setAnimatedValue(value);
      return;
    }
    // Animate from current to target
    const duration = 800;
    const startTime = performance.now();
    const startValue = animatedValue;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startValue + (value - startValue) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  // Dynamic color based on progress
  const getColor = () => {
    const pct = value / max;
    if (pct > 1) return '#EF4444'; // Over budget — red
    if (pct > 0.8) return '#F59E0B'; // Nearing limit — amber
    return color; // On track — accent
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: animated ? 'none' : 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tabular-nums gradient-text">
          {Math.round(animatedValue).toLocaleString()}
        </span>
        {max && (
          <span className="text-xs text-slate-500 mt-0.5">
            of {max.toLocaleString()}
          </span>
        )}
        {label && (
          <span className="text-sm text-slate-400 mt-1">{label}</span>
        )}
      </div>
      {sublabel && (
        <span className="text-xs text-slate-500 mt-2">{sublabel}</span>
      )}
    </div>
  );
}
