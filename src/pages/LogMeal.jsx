import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealLogger } from '../components/organisms/MealLogger';
import { RestaurantBrowser } from '../components/organisms/RestaurantBrowser';

/**
 * Log Meal — Tab 2
 * Action sheet with search, quick actions, recent/frequent meals
 * Sub-views: Restaurant browser, Scanner
 */
export function LogMeal() {
  const { dark, logMeal, dailyLog, setActiveTab, setShowVoiceLog } = useApp();
  const [subView, setSubView] = useState('main'); // main | restaurant | scan

  const handleLog = (meal) => {
    logMeal(meal);
    // Brief success feedback, then go to home
    setTimeout(() => setActiveTab('home'), 500);
  };

  if (subView === 'restaurant') {
    return (
      <div className="px-4 pt-6 pb-4">
        <RestaurantBrowser
          onLog={handleLog}
          onClose={() => setSubView('main')}
          dark={dark}
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <MealLogger
        onLog={handleLog}
        onScan={() => {/* TODO: Camera scanner */}}
        onRestaurant={() => setSubView('restaurant')}
        onVoice={() => setShowVoiceLog(true)}
        recentMeals={dailyLog.meals.slice(-5).reverse()}
        frequentMeals={[]} // TODO: Track frequent meals
        dark={dark}
      />
    </div>
  );
}
