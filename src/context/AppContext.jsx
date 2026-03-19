import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // === THEME ===
  const [dark, setDark] = useState(true);

  // === USER PROFILE ===
  const [userProfile, setUserProfile] = useState({
    name: '',
    age: 25,
    birthday: null,
    gender: 'male',
    height: { feet: 5, inches: 8 },
    weight: 180,
    activityLevel: 'moderate',
  });

  // === PLAN CONFIG ===
  const [planConfig, setPlanConfig] = useState({
    goal: 'maintain',
    trainingType: 'strength',
    trainingDays: 4,
    dietStyle: 'high-protein',
    mealsPerDay: 3,
    cookTime: 'moderate',
    cuisines: [],
    restrictions: '',
    activity: 'moderate',
  });

  // === ACTIVE PLAN ===
  const [plan, setPlan] = useState(null);

  // === DAILY LOG ===
  const [dailyLog, setDailyLog] = useState({
    date: new Date().toISOString().split('T')[0],
    meals: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });

  // === COLLECTIONS ===
  const [savedPlans, setSavedPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [groceryList, setGroceryList] = useState([]);

  // === UI STATE ===
  const [activeTab, setActiveTab] = useState('home');
  const [showVoiceLog, setShowVoiceLog] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showMealImages, setShowMealImages] = useState(true);

  // === WEIGHT TRACKING ===
  const [weightEntries, setWeightEntries] = useState([]);

  // === STREAK ===
  const [streak, setStreak] = useState(0);

  // === ACTIONS ===
  const logMeal = useCallback((meal) => {
    setDailyLog(prev => ({
      ...prev,
      meals: [...prev.meals, { ...meal, loggedAt: new Date() }],
      totalCalories: prev.totalCalories + (meal.calories || 0),
      totalProtein: prev.totalProtein + (meal.protein || 0),
      totalCarbs: prev.totalCarbs + (meal.carbs || 0),
      totalFat: prev.totalFat + (meal.fat || 0),
    }));
  }, []);

  const logWeight = useCallback((weight) => {
    setWeightEntries(prev => [
      ...prev,
      { weight, date: new Date().toISOString().split('T')[0] }
    ]);
    setUserProfile(prev => ({ ...prev, weight }));
  }, []);

  const toggleFavorite = useCallback((meal) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.name === meal.name);
      if (exists) return prev.filter(f => f.name !== meal.name);
      return [...prev, meal];
    });
  }, []);

  const value = {
    // Theme
    dark, setDark,
    // User
    userProfile, setUserProfile,
    planConfig, setPlanConfig,
    // Plan
    plan, setPlan,
    // Daily
    dailyLog, setDailyLog, logMeal,
    // Collections
    savedPlans, setSavedPlans,
    recipes, setRecipes,
    favorites, setFavorites, toggleFavorite,
    groceryList, setGroceryList,
    // UI
    activeTab, setActiveTab,
    showVoiceLog, setShowVoiceLog,
    advancedMode, setAdvancedMode,
    showMealImages, setShowMealImages,
    // Weight
    weightEntries, setWeightEntries, logWeight,
    // Streak
    streak, setStreak,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
