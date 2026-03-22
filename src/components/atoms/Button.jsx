import React from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-teal-400 to-indigo-500 text-white glow-teal shadow-lg',
  secondary: 'glass text-slate-300 border border-white/[0.08]',
  ghost: 'bg-transparent text-slate-400 hover:text-white border border-white/[0.04]',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  success: 'bg-teal-500/10 text-teal-400 border border-teal-500/25',
};

const sizes = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-6 py-3 text-[15px]',
  lg: 'px-8 py-4 text-[17px]',
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
    ${fullWidth ? 'w-full' : 'max-w-[280px] mx-auto w-fit min-w-[120px]'}
    rounded-xl font-bold transition-all duration-200
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
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
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
          {icon && <span className="w-5 h-5 flex-shrink-0">{icon}</span>}
          <span className="truncate">{children}</span>
          {iconRight && <span className="w-5 h-5 flex-shrink-0">{iconRight}</span>}
        </>
      )}
    </motion.button>
  );
}

// Specialized button variants for common use cases
export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
export const GhostButton = (props) => <Button variant="ghost" {...props} />;