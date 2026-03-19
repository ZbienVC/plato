import React, { useState, useEffect } from 'react';

/**
 * Floating Action Button for voice meal logging
 * Fixed position, bottom-right, above tab bar
 * Pulses gently if user hasn't logged in 4+ hours
 */
export function FAB({
  onClick,
  shouldPulse = false,
  dark = true,
  className = '',
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!shouldPulse) { setPulse(false); return; }
    const interval = setInterval(() => setPulse(p => !p), 3000);
    return () => clearInterval(interval);
  }, [shouldPulse]);

  return (
    <button
      onClick={onClick}
      aria-label="Voice log meal"
      className={`
        fixed z-50 w-14 h-14
        bottom-[calc(4rem+max(0.5rem,env(safe-area-inset-bottom))+0.75rem)]
        right-[max(1rem,calc((100vw-420px)/2+1rem))]
        bg-gradient-to-br from-emerald-500 to-teal-600
        rounded-full shadow-lg shadow-emerald-500/30
        flex items-center justify-center
        transition-all duration-200
        active:scale-90 hover:scale-105
        hover:shadow-emerald-500/40
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <span className="text-2xl">🎙️</span>
    </button>
  );
}
