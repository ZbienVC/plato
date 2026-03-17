import React from 'react';
import './Badge.css';

/**
 * BADGE COMPONENT - Status labels, tags, counters
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`} {...props}>
      {children}
    </span>
  );
};

/**
 * STATUS BADGE - For status indicators (live, building, coming soon)
 */
export const StatusBadge = ({
  status = 'active',
  children,
  className = '',
}) => {
  const statusMap = {
    active: 'status-active',
    pending: 'status-pending',
    inactive: 'status-inactive',
    success: 'status-success',
    error: 'status-error',
    warning: 'status-warning',
  };

  return (
    <span className={`status-badge ${statusMap[status]} ${className}`}>
      <span className="status-dot"></span>
      {children}
    </span>
  );
};

export default Badge;
