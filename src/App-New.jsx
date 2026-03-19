import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { VoiceLogModal } from './components/organisms/VoiceLogModal';
import { Home } from './pages/Home';
import { LogMeal } from './pages/LogMeal';
import { MealPlans } from './pages/MealPlans';
import { Profile } from './pages/Profile';
import './styles/index.css';

/**
 * App shell — renders active tab inside MainLayout
 * Manages voice log modal overlay
 */
function AppContent() {
  const {
    dark,
    activeTab, setActiveTab,
    showVoiceLog, setShowVoiceLog,
    logMeal, dailyLog,
  } = useApp();

  // Check if user should be nudged to log (4+ hours since last log)
  const lastLogTime = dailyLog.meals.length > 0
    ? new Date(dailyLog.meals[dailyLog.meals.length - 1].loggedAt).getTime()
    : 0;
  const hoursSinceLog = lastLogTime > 0
    ? (Date.now() - lastLogTime) / (1000 * 60 * 60)
    : 99;
  const shouldPulseFAB = hoursSinceLog >= 4;

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'log': return <LogMeal />;
      case 'meals': return <MealPlans />;
      case 'you': return <Profile />;
      default: return <Home />;
    }
  };

  return (
    <>
      <MainLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFABPress={() => setShowVoiceLog(true)}
        showFAB={activeTab !== 'log'} // Hide FAB on log tab (redundant)
        shouldPulseFAB={shouldPulseFAB}
        dark={dark}
      >
        {renderTab()}
      </MainLayout>

      {/* Voice Log Modal (Global Overlay) */}
      {showVoiceLog && (
        <VoiceLogModal
          dark={dark}
          onLog={logMeal}
          onClose={() => setShowVoiceLog(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
