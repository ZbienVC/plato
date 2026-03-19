import React from 'react';

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const variants = {
  default: 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white',
  accent: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400',
  ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white',
  danger: 'bg-transparent hover:bg-red-500/10 text-slate-400 hover:text-red-400',
};

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  ariaLabel,
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        ${sizes[size]}
        ${variants[variant]}
        rounded-xl flex items-center justify-center
        transition-all duration-200 active:scale-95
        ${className}
      `}
      {...props}
    >
      <span className={iconSizes[size]}>{icon}</span>
    </button>
  );
}
