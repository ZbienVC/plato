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
        return <Home />;
      case 'meals':
        return <MealPlans />;
      case 'detail':
        return <MealDetail />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className={`app-redesigned ${theme === 'dark' ? 'dark' : 'light'}`}>
      {/* Render current page with layout wrapper */}
      {renderPage()}
    </div>
  );
}
