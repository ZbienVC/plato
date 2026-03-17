import React from 'react';
import './FAB.css';

/**
 * FLOATING ACTION BUTTON (FAB)
 * Used for primary action (Quick Log in Plato)
 */
export const FAB = ({
  onClick,
  icon = '🎤',
  label = 'Quick Log',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`fab ${disabled ? 'fab-disabled' : ''} ${loading ? 'fab-loading' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      title={label}
      aria-label={label}
      {...props}
    >
      <span className={`fab-icon ${loading ? 'fab-icon-spin' : ''}`}>
        {loading ? '⏳' : icon}
      </span>
      {!loading && <span className="fab-label">{label}</span>}
    </button>
  );
};

export default FAB;
