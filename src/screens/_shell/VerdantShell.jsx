import React from 'react';
import { BottomNav } from './BottomNav';

/**
 * The mobile canvas frame for the Elevated Verdant app: mesh page
 * background, grain overlay, the active screen, and the floating nav.
 * Screens render their own contextual top bar + scroll region.
 */
export function VerdantShell({ active, onNav, onFab, children }) {
  return (
    <div
      className="verdant-root"
      style={{
        position: 'relative', width: '100%', maxWidth: 'var(--content-max)', margin: '0 auto',
        height: '100dvh', background: 'var(--page-bg)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 'var(--grain-op)',
          mixBlendMode: 'overlay',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Ccircle cx='1' cy='1' r='.5' fill='white'/%3E%3C/svg%3E\")",
          backgroundSize: '3px 3px',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {children}
      </div>
      <BottomNav active={active} onNav={onNav} onFab={onFab} />
    </div>
  );
}
