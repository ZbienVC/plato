import React from 'react';
import { BottomNav, FAB } from '../molecules';
import './MainLayout.css';

/**
 * MAIN LAYOUT - Wraps all pages with nav and FAB
 */
export const MainLayout = ({
  children,
  activeTab = 'home',
  onTabChange = () => {},
  onQuickLog = () => {},
  showFAB = true,
}) => {
  return (
    <div className="main-layout">
      {/* Main Content */}
      <main className="main-layout-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Floating Action Button (Quick Log) */}
      {showFAB && (
        <FAB
          onClick={onQuickLog}
          icon="🎤"
          label="Quick Log"
          tooltipText="Quick meal log"
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabs={[
          { id: 'home', label: 'Home', icon: '🏠' },
          { id: 'meals', label: 'Meals', icon: '🍽️' },
          { id: 'detail', label: 'Detail', icon: '📊' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ]}
      />
    </div>
  );
};

export default MainLayout;
