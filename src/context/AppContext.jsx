import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MEAL_DATABASE } from '../services/mealGenerator';

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
  const [dark, setDark] = useState(() => loadState('dark', false));

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showVoiceLog, setShowVoiceLog] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(() => loadState('advancedMode', false));
  // v3: force meal images off
  const [showMealImages, setShowMealImages] = useState(() => {
    const v = loadState('_mealImgV', 0);
    if (v < 3) { saveState('showMealImages', false); saveState('_mealImgV', 3); return false; }
    return loadState('showMealImages', false);
  });

  // === WEIGHT TRACKING ===
  const [weightEntries, setWeightEntries] = useState(() => loadState('weightEntries', []));

  // === STREAK ===
  const [streak, setStreak] = useState(() => loadState('streak', 0));

  // === SAVED RECIPES (alias) ===
  const [savedRecipes, setSavedRecipes] = useState(() => loadState('savedRecipes', []));
  const saveRecipeById = useCallback((recipe) => {
    setSavedRecipes(prev => {
      const updated = [...prev.filter(r => r.id !== recipe.id), recipe];
      saveState('savedRecipes', updated);
      return updated;
    });
  }, []);

  // === GROCERY CHECKLIST ===
  const [groceryChecked, setGroceryChecked] = useState(() => loadState('groceryChecked', {}));

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
  useEffect(() => { saveState('savedRecipes', savedRecipes); }, [savedRecipes]);
  useEffect(() => { saveState('groceryChecked', groceryChecked); }, [groceryChecked]);

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

  const swapMeal = useCallback((mealSlotIndex, currentMeal) => {
    setPlan(prevPlan => {
      if (!prevPlan || !prevPlan.meals) return prevPlan;
      
      const dayIndex = Math.floor((Date.now() - new Date(prevPlan.createdAt || Date.now()).getTime()) / 86400000) % 7;
      const absoluteIndex = dayIndex * (prevPlan.mealsPerDay || 3) + mealSlotIndex;
      
      const sameTypeMeals = MEAL_DATABASE.filter(m => m.type === currentMeal.type && m.name !== currentMeal.name);
      if (sameTypeMeals.length === 0) return prevPlan;
      
      const randomMeal = sameTypeMeals[Math.floor(Math.random() * sameTypeMeals.length)];
      
      const scale = currentMeal.calories / randomMeal.calories;
      const scaledMeal = {
        ...randomMeal,
        calories: currentMeal.calories,
        protein: Math.round(randomMeal.protein * scale),
        carbs: Math.round(randomMeal.carbs * scale),
        fat: Math.round(randomMeal.fat * scale),
      };
      
      const newMeals = [...prevPlan.meals];
      newMeals[absoluteIndex] = scaledMeal;
      
      return { ...prevPlan, meals: newMeals };
    });
  }, []);

  // Reset all data
  const resetAll = useCallback(() => {
    const keys = ['dark', 'userProfile', 'planConfig', 'plan', 'dailyLog', 'logHistory',
      'savedPlans', 'recipes', 'favorites', 'groceryList', 'advancedMode',
      'showMealImages', 'weightEntries', 'streak', 'savedRecipes', 'groceryChecked'];
    keys.forEach(k => localStorage.removeItem(`plato_${k}`));
    window.location.reload();
  }, []);

  const value = {
    // Theme
    dark, setDark,
    swapMeal,
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
    drawerOpen, setDrawerOpen,
    showVoiceLog, setShowVoiceLog,
    advancedMode, setAdvancedMode,
    showMealImages, setShowMealImages,
    // Weight
    weightEntries, setWeightEntries, logWeight,
    // Streak
    streak, setStreak,
    // Saved recipes (extended)
    savedRecipes, setSavedRecipes, saveRecipeById,
    // Grocery checklist
    groceryChecked, setGroceryChecked,
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
