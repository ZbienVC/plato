import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  error,
  label,
  className = '',
  dark = true,
  ...props
}, ref) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl
            ${dark
              ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/10'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20'
            }
            border transition-all duration-200
            focus:outline-none focus:ring-2
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});
