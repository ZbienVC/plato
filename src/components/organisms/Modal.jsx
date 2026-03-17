import React, { useEffect } from 'react';
import './Modal.css';

/**
 * MODAL COMPONENT - Overlay dialog
 */
export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  footer = null,
  fullHeight = false,
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal ${fullHeight ? 'modal-full-height' : ''} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * BOTTOM SHEET - Mobile-first modal that slides from bottom
 */
export const BottomSheet = ({
  isOpen,
  title,
  children,
  onClose,
  footer = null,
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="bottom-sheet-overlay" onClick={onClose}>
      <div 
        className={`bottom-sheet ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="bottom-sheet-handle"></div>

        {/* Header */}
        {title && (
          <div className="bottom-sheet-header">
            <h2 className="bottom-sheet-title">{title}</h2>
          </div>
        )}

        {/* Content */}
        <div className="bottom-sheet-content">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="bottom-sheet-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
