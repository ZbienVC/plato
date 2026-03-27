import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-200',
  secondary: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200',
  ghost: 'bg-transparent text-slate-500 border border-slate-200 hover:bg-slate-50',
  danger: 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100',
  success: 'bg-green-50 text-green-600 border border-green-200',
};

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  onClick,
  fullWidth = false,
  className = '',
  ...props
}) {
  const baseClasses = `
    relative z-10 pointer-events-auto cursor-pointer
    ${fullWidth ? 'w-full' : ''}
    rounded-xl font-semibold transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    touch-manipulation select-none
    flex items-center justify-center gap-2
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          <span className="truncate">{children}</span>
          {iconRight && <span>{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
}

export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;
