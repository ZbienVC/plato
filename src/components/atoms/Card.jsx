import React from 'react';
import { motion } from 'framer-motion';

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export function Card({
  children,
  padding = 'md',
  hover = false,
  onClick,
  className = '',
  delay = 0,
  dark = false,
  variant = 'default',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={hover ? { y: -1 } : {}}
      onClick={onClick}
      className={`
        bg-white border border-slate-100 rounded-2xl shadow-sm
        ${paddings[padding]}
        ${onClick || hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
