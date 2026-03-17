import React, { useState } from 'react';
import './Input.css';

/**
 * INPUT COMPONENT - Text input field
 */
export const Input = ({
  type = 'text',
  placeholder = '',
  label = '',
  value,
  onChange,
  onFocus,
  onBlur,
  error = '',
  disabled = false,
  icon = null,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-container ${isFocused ? 'input-focused' : ''} ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          disabled={disabled}
          className="input"
          {...props}
        />
      </div>
      {error && <p className="input-error-message">{error}</p>}
    </div>
  );
};

/**
 * TEXTAREA COMPONENT
 */
export const Textarea = ({
  placeholder = '',
  label = '',
  value,
  onChange,
  onFocus,
  onBlur,
  error = '',
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-container textarea-container ${isFocused ? 'input-focused' : ''} ${error ? 'input-error' : ''}`}>
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          disabled={disabled}
          rows={rows}
          className="input textarea"
          {...props}
        />
      </div>
      {error && <p className="input-error-message">{error}</p>}
    </div>
  );
};

/**
 * SELECT COMPONENT
 */
export const Select = ({
  label = '',
  value,
  onChange,
  options = [],
  error = '',
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-container select-container ${error ? 'input-error' : ''}`}>
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="input select"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-arrow">▼</span>
      </div>
      {error && <p className="input-error-message">{error}</p>}
    </div>
  );
};

export default Input;
