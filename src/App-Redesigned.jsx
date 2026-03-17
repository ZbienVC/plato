import React, { useState, useEffect } from 'react';
import { Home, MealDetail, MealPlans, Profile } from './pages';
import { MainLayout } from './components/layout';
import './App-Redesigned.css';

/**
 * APP REDESIGNED - Phase 1 Complete
 * New design system with atomic components, responsive layout, dark theme
 * Route-based navigation using MainLayout tab system
 */
export default function AppRedesigned() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme] = useState('dark'); // #0F0F0F dark background

  // Navigation between pages
  const handleTabChange = (tab) => {
    setCurrentPage(tab);
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Map tab values to page components
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home activeTab={currentPage} onTabChange={handleTabChange} />;
      case 'meals':
        return <MealPlans activeTab={currentPage} onTabChange={handleTabChange} />;
      case 'detail':
        return <MealDetail activeTab={currentPage} onTabChange={handleTabChange} />;
      case 'profile':
        return <Profile activeTab={currentPage} onTabChange={handleTabChange} />;
      default:
        return <Home activeTab={currentPage} onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className={`app-redesigned ${theme === 'dark' ? 'dark' : 'light'}`}>
      <MainLayout
        activeTab={currentPage}
        onTabChange={handleTabChange}
        onQuickLog={() => {/* Will add voice logging */}}
      >
        {renderPage()}
      </MainLayout>
    </div>
  );
}
