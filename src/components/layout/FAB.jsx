import React from 'react';
import { motion } from 'framer-motion';

export function FAB({ onClick, pulse = false }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={`fixed z-50 w-14 h-14 rounded-2xl
        bg-gradient-to-br from-teal-400 to-indigo-500
        flex items-center justify-center
        shadow-lg shadow-teal-500/20
        ${pulse ? 'animate-pulse' : ''}
      `}
      style={{ bottom: '96px', right: 'max(20px, calc((100vw - 448px) / 2 + 20px))' }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
      </svg>
    </motion.button>
  );
}
