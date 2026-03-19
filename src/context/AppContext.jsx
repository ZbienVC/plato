import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

// Helper: load from localStorage with fallback
function loadState(key, fallback) {
  try {
    const saved = localStorage.getItem(`plato_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

// Helper: save to localStorage
function saveState(key, value) {
  try {
    localStorage.setItem(`plato_${key}`, JSON.stringify(value));
  } catch { /* quota exceeded, ignore */ }
}

export function AppProvider({ children }) {
  // === THEME ===
  const [dark, setDark] = useState(() => loadState('dark', true));

  // === USER PROFILE ===
  const [userProfile, setUserProfile] = useState(() => loadState('userProfile', {
    name: '',
    age: 25,
    birthday: null,
    gender: 'male',
    height: { feet: 5, inches: 8 },
    weight: 180,
    activityLevel: 'moderate',
  }));

  // === PLAN CONFIG ===
  const [planConfig, setPlanConfig] = useState(() => loadState('planConfig', {
    goal: 'maintain',
    trainingType: 'strength',
    trainingDays: 4,
    dietStyle: 'high-protein',
    mealsPerDay: 3,
    cookTime: 'moderate',
    cuisines: [],
    restrictions: '',
    activity: 'moderate',
  }));

  // === ACTIVE PLAN ===
  const [plan, setPlan] = useState(() => loadState('plan', null));

  // === DAILY LOG ===
  const today = new Date().toISOString().split('T')[0];
  const [dailyLog, setDailyLog] = useState(() => {
    const saved = loadState('dailyLog', null);
    // Reset if it's a new day
    if (saved && saved.date === today) return saved;
    return {
      date: today,
      meals: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };
  });

  // === HISTORY (past daily logs) ===
  const [logHistory, setLogHistory] = useState(() => loadState('logHistory', []));

  // === COLLECTIONS ===
  const [savedPlans, setSavedPlans] = useState(() => loadState('savedPlans', []));
  const [recipes, setRecipes] = useState(() => loadState('recipes', []));
  const [favorites, setFavorites] = useState(() => loadState('favorites', []));
  const [groceryList, setGroceryList] = useState(() => loadState('groceryList', []));

  // === UI STATE (not persisted) ===
  const [activeTab, setActiveTab] = useState('home');
  const [showVoiceLog, setShowVoiceLog] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(() => loadState('advancedMode', false));
  const [showMealImages, setShowMealImages] = useState(() => loadState('showMealImages', true));

  // === WEIGHT TRACKING ===
  const [weightEntries, setWeightEntries] = useState(() => loadState('weightEntries', []));

  // === STREAK ===
  const [streak, setStreak] = useState(() => loadState('streak', 0));

  // === PERSIST STATE ON CHANGE ===
  useEffect(() => { saveState('dark', dark); }, [dark]);
  useEffect(() => { saveState('userProfile', userProfile); }, [userProfile]);
  useEffect(() => { saveState('planConfig', planConfig); }, [planConfig]);
  useEffect(() => { saveState('plan', plan); }, [plan]);
  useEffect(() => { saveState('dailyLog', dailyLog); }, [dailyLog]);
  useEffect(() => { saveState('logHistory', logHistory); }, [logHistory]);
  useEffect(() => { saveState('savedPlans', savedPlans); }, [savedPlans]);
  useEffect(() => { saveState('recipes', recipes); }, [recipes]);
  useEffect(() => { saveState('favorites', favorites); }, [favorites]);
  useEffect(() => { saveState('groceryList', groceryList); }, [groceryList]);
  useEffect(() => { saveState('advancedMode', advancedMode); }, [advancedMode]);
  useEffect(() => { saveState('showMealImages', showMealImages); }, [showMealImages]);
  useEffect(() => { saveState('weightEntries', weightEntries); }, [weightEntries]);
  useEffect(() => { saveState('streak', streak); }, [streak]);

  // === ACTIONS ===
  const logMeal = useCallback((meal) => {
    setDailyLog(prev => ({
      ...prev,
      meals: [...prev.meals, { ...meal, loggedAt: new Date().toISOString() }],
      totalCalories: prev.totalCalories + (meal.calories || 0),
      totalProtein: prev.totalProtein + (meal.protein || 0),
      totalCarbs: prev.totalCarbs + (meal.carbs || 0),
      totalFat: prev.totalFat + (meal.fat || 0),
    }));
  }, []);

  const logWeight = useCallback((weight) => {
    const date = new Date().toISOString().split('T')[0];
    setWeightEntries(prev => {
      // Replace today's entry if exists, otherwise append
      const existing = prev.findIndex(e => e.date === date);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { weight, date };
        return next;
      }
      return [...prev, { weight, date }];
    });
    setUserProfile(prev => ({ ...prev, weight }));
  }, []);

  const toggleFavorite = useCallback((meal) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.name === meal.name);
      if (exists) return prev.filter(f => f.name !== meal.name);
      return [...prev, meal];
    });
  }, []);

  const savePlan = useCallback((planToSave) => {
    setSavedPlans(prev => [...prev, { ...planToSave, savedAt: new Date().toISOString() }]);
  }, []);

  const saveRecipe = useCallback((recipe) => {
    setRecipes(prev => {
      const exists = prev.find(r => r.title === recipe.title);
      if (exists) return prev;
      return [...prev, { ...recipe, savedAt: new Date().toISOString() }];
    });
  }, []);

  // Archive today's log to history (called at day boundary)
  const archiveDailyLog = useCallback(() => {
    setDailyLog(prev => {
      if (prev.meals.length > 0) {
        setLogHistory(hist => [...hist, prev]);
      }
      return {
        date: new Date().toISOString().split('T')[0],
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    });
  }, []);

  // Reset all data
  const resetAll = useCallback(() => {
    const keys = ['dark', 'userProfile', 'planConfig', 'plan', 'dailyLog', 'logHistory',
      'savedPlans', 'recipes', 'favorites', 'groceryList', 'advancedMode',
      'showMealImages', 'weightEntries', 'streak'];
    keys.forEach(k => localStorage.removeItem(`plato_${k}`));
    window.location.reload();
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
    logHistory, setLogHistory, archiveDailyLog,
    // Collections
    savedPlans, setSavedPlans, savePlan,
    recipes, setRecipes, saveRecipe,
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
    // Utils
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
