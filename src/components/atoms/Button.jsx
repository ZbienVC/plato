import React from 'react';
import './Button.css';

/**
 * BUTTON COMPONENT - Atomic Design Level
 * Variants: primary, secondary, tertiary, danger
 * Sizes: sm, md, lg
 * States: default, hover, active, disabled, loading
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${loading ? 'btn-loading' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          <span className="btn-text">{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          <span className="btn-text">{children}</span>
        </>
      )}
    </button>
  );
};

/**
 * ICON BUTTON - For standalone icons (circular, 40x40px)
 */
export const IconButton = ({
  children,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className={`icon-btn ${loading ? 'icon-btn-loading' : ''} ${className}`}
      {...props}
    >
      {loading ? <span className="spinner-small"></span> : children}
    </button>
  );
};

export default Button;
