import React from 'react';

const variants = {
  default: {
    dark: 'bg-slate-800/50 border-white/[0.06]',
    light: 'bg-white border-slate-200/60',
  },
  glass: {
    dark: 'bg-[#0f1629]/80 backdrop-blur-xl border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
    light: 'bg-white/85 backdrop-blur-xl border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
  },
  elevated: {
    dark: 'bg-[#161e35] border-white/[0.08] shadow-xl',
    light: 'bg-white border-slate-200 shadow-lg',
  },
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export function Card({
  children,
  variant = 'default',
  padding = 'lg',
  dark = true,
  hover = false,
  onClick,
  className = '',
  ...props
}) {
  const mode = dark ? 'dark' : 'light';

  return (
    <div
      onClick={onClick}
      className={`
        ${variants[variant][mode]}
        ${paddings[padding]}
        border rounded-2xl
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
