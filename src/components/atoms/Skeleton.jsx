import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`bg-slate-200/70 rounded-lg animate-pulse ${className}`} />
  );
}
