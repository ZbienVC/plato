import React from 'react';
import { motion } from 'framer-motion';

export function FAB({ onClick, pulse = false }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={`fixed z-50 w-14 h-14 rounded-2xl
        flex items-center justify-center
        ${pulse ? 'animate-pulse' : ''}
      `}
      style={{ bottom: '96px', right: 'max(20px, calc((100vw - 430px) / 2 + 20px))', background: 'linear-gradient(135deg,#10b981,#6366f1)', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}
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
