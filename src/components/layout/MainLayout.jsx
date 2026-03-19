import React from 'react';
import { BottomNav } from './BottomNav';
import { FAB } from './FAB';

/**
 * Main layout shell — safe area padding, scroll container, bottom nav
 */
export function MainLayout({
  children,
  activeTab,
  onTabChange,
  onFABPress,
  showFAB = true,
  shouldPulseFAB = false,
  dark = true,
}) {
  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'bg-[#080d1a]' : 'bg-[#f8f9fb]'}`}
      style={{ maxWidth: '430px', margin: '0 auto', position: 'relative' }}
    >
      {/* Scrollable content area */}
      <div
        className="flex-1 overflow-y-auto overscroll-y-contain"
        style={{ paddingBottom: '88px' }}
      >
        <div className="px-6 pt-14 pb-6">
          {children}
        </div>
      </div>

      {/* FAB */}
      {showFAB && (
        <FAB
          onClick={onFABPress}
          pulse={shouldPulseFAB}
          dark={dark}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        dark={dark}
      />
    </div>
  );
}
