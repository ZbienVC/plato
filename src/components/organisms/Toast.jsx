import React, { useEffect, useState } from 'react';

/**
 * Toast notification — slides in from top
 * Auto-dismisses after duration
 * Supports: success, error, info variants
 */
export function Toast({
  message,
  variant = 'success', // success | error | info
  duration = 2000,
  onDismiss,
  action, // { label: 'UNDO', onClick: fn }
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    
    // Auto dismiss
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const colors = {
    success: 'bg-emerald-500/90 text-white',
    error: 'bg-red-500/90 text-white',
    info: 'bg-blue-500/90 text-white',
  };

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[60]
        max-w-[400px] w-[90%]
        ${colors[variant]}
        backdrop-blur-xl rounded-xl px-4 py-3
        flex items-center gap-3
        shadow-lg transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <span className="text-lg">{icons[variant]}</span>
      <p className="text-sm font-semibold flex-1">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-bold uppercase tracking-wider opacity-80 hover:opacity-100 px-2 py-1 rounded bg-white/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Toast manager hook — use in App level
 * Returns: { toasts, showToast, dismissToast }
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, variant = 'success', duration = 2000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, variant, duration }]);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
}
