import React, { useState, useRef, useCallback } from 'react';
import { BottomNav } from './BottomNav';
import { FAB } from './FAB';

/**
 * Main app shell with:
 * - Scrollable content area (420px max-width)
 * - Bottom tab navigation
 * - Floating action button
 * - Scroll-direction-aware nav visibility
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
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollRef = useRef(null);

  const handleScroll = useCallback((e) => {
    const currentY = e.target.scrollTop;
    const delta = currentY - lastScrollY.current;

    // Show nav when scrolling up, hide when scrolling down
    if (delta > 10 && currentY > 100) {
      setNavVisible(false);
    } else if (delta < -10 || currentY < 50) {
      setNavVisible(true);
    }

    lastScrollY.current = currentY;
  }, []);

  return (
    <div className={`min-h-screen ${dark ? 'app-bg-dark' : 'app-bg-light'}`}>
      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-w-[420px] mx-auto min-h-screen pb-24 overflow-y-auto"
      >
        {children}
      </div>

      {/* FAB */}
      {showFAB && (
        <FAB
          onClick={onFABPress}
          shouldPulse={shouldPulseFAB}
          dark={dark}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        visible={navVisible}
        dark={dark}
      />
    </div>
  );
}
