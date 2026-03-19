import React from 'react';

/**
 * Floating Action Button — voice log trigger
 * Clean mic icon, no emoji
 */
export function FAB({ onClick, pulse = false, dark = true }) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed z-50 w-14 h-14 rounded-full
        bg-gradient-to-br from-emerald-400 to-teal-600
        flex items-center justify-center
        shadow-lg shadow-emerald-500/30
        active:scale-95 transition-transform
        ${pulse ? 'animate-pulse' : ''}
      `}
      style={{ bottom: '88px', right: 'max(20px, calc((100vw - 430px) / 2 + 20px))' }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
