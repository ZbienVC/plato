import React from 'react';

const variants = {
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/10 text-red-400 border-red-500/30',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  accent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500',
  count: 'bg-emerald-500 text-white border-transparent',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
  lg: 'px-4 py-1.5 text-sm',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) {
  return (
    <span className={`
      ${variants[variant]}
      ${sizes[size]}
      inline-flex items-center gap-1
      font-bold rounded-full border
      ${className}
    `}>
      {children}
    </span>
  );
}
