import React from 'react';
import './BottomNav.css';

/**
 * BOTTOM NAVIGATION - Mobile-first nav bar
 * 4 tabs: Home | Meals | Detail | Profile
 */
export const BottomNav = ({
  activeTab = 'home',
  onTabChange = () => {},
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'meals', label: 'Meals', icon: '🍽️' },
    { id: 'detail', label: 'Detail', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`bottom-nav-item ${activeTab === tab.id ? 'bottom-nav-item-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
            {activeTab === tab.id && <span className="bottom-nav-indicator"></span>}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
