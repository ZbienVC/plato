import React, { useEffect, useState } from 'react';
import './Toast.css';

/**
 * TOAST COMPONENT - Temporary notification messages
 */
export const Toast = ({
  id,
  message,
  type = 'default',
  duration = 3000,
  onClose = () => {},
  action = null,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration === 0) return; // Never auto-close if duration is 0

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const typeMap = {
    default: 'toast-default',
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
  };

  const iconMap = {
    default: '💬',
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`toast ${typeMap[type]} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon">{iconMap[type]}</span>
      <span className="toast-message">{message}</span>
      {action && (
        <button
          className="toast-action"
          onClick={() => {
            action.onClick?.();
            setIsExiting(true);
            setTimeout(() => onClose(id), 300);
          }}
        >
          {action.label}
        </button>
      )}
      <button
        className="toast-close"
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(id), 300);
        }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

/**
 * TOAST CONTAINER - Manages multiple toasts
 */
export const ToastContainer = ({ toasts = [], onRemove = () => {} }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  );
};

export default Toast;
