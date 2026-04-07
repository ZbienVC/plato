import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { auth, saveLogEntry as apiSaveLog, getProfile } from '../lib/api';
import { MEAL_DATABASE } from '../services/mealGenerator';
import { saveLogEntry } from '../lib/api';

const AppContext = createContext(null);
const STORAGE_PREFIX = 'plato_';
const PREMIUM_STORAGE_KEY = 'plato.premium.v1';
const DEFAULT_PREMIUM_STATE = { status: 'free', email: undefined, trialExpiresAt: undefined };
const PREMIUM_CHECKOUT_URL = (import.meta.env?.VITE_PREMIUM_CHECKOUT_URL || '').trim();
const PREMIUM_LEAD_WEBHOOK = (import.meta.env?.VITE_PREMIUM_LEAD_WEBHOOK || '').trim();
const PREMIUM_CONTACT_EMAIL = 'hi@platoapp.com';

// Helper: load from localStorage with fallback
function loadState(key, fallback) {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

// Helper: save to localStorage
function saveState(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch { /* quota exceeded, ignore */ }
}

function loadPremiumState() {
  try {
    const saved = localStorage.getItem(PREMIUM_STORAGE_KEY);
    if (!saved) return { ...DEFAULT_PREMIUM_STATE };
    const parsed = JSON.parse(saved);
    if (parsed.status === 'trial' && parsed.trialExpiresAt) {
      const expiresAt = new Date(parsed.trialExpiresAt).getTime();
      if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
        return { status: 'free', email: parsed.email };
      }
    }
    return { ...DEFAULT_PREMIUM_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_PREMIUM_STATE };
  }
}

function savePremiumState(state) {
  try {
    localStorage.setItem(PREMIUM_STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function inferSlotFromTime(date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
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
  const [planLoading, setPlanLoading] = useState(false);

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
  const [favoriteFoods, setFavoriteFoods] = useState(() => loadState('favoriteFoods', []));
  const [recipes, setRecipes] = useState(() => loadState('recipes', []));
  const [favorites, setFavorites] = useState(() => loadState('favorites', []));
  const [groceryList, setGroceryList] = useState(() => loadState('groceryList', []));

  // === UI STATE (not persisted) ===
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showVoiceLog, setShowVoiceLog] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(() => loadState('advancedMode', false));
  const [showMealImages, setShowMealImages] = useState(() => loadState('showMealImages', true));
  const [premium, setPremium] = useState(() => loadPremiumState());
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  // === AUTH STATE ===
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('plato_token') || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isLoggedIn = !!authToken;

  const loginSuccess = useCallback(async () => {
    const token = localStorage.getItem('plato_token');
    setAuthToken(token);
    setAuthModalOpen(false);
    // After login, hydrate profile from backend if available
    if (token) {
      try {
        const serverProfile = await getProfile();
        if (serverProfile && serverProfile.name) {
          // Merge server profile into local state (server is source of truth)
          setUserProfile(prev => ({ ...prev, ...serverProfile }));
          saveState('userProfile', { ...serverProfile });
          // Mark as onboarded if they have a name
          localStorage.setItem('plato_onboarded', 'true');
        }
      } catch { /* server unavailable - use local state */ }
    }
  }, []);

  const logout = useCallback(() => {
    auth.logout();
    setAuthToken(null);
    // Clear user-specific cached state on logout
    // (keep planConfig and preferences but reset profile)
    setUserProfile({ name: '', age: '', gender: 'prefer_not_to_say', height: { feet: 5, inches: 7 }, weight: 150, activityLevel: 'moderate', goal: 'maintain' });
    localStorage.removeItem('plato_userProfile');
  }, []);

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
  useEffect(() => { saveState('favoriteFoods', favoriteFoods); }, [favoriteFoods]);
  useEffect(() => { saveState('recipes', recipes); }, [recipes]);
  useEffect(() => { saveState('favorites', favorites); }, [favorites]);
  useEffect(() => { saveState('groceryList', groceryList); }, [groceryList]);
  useEffect(() => { saveState('advancedMode', advancedMode); }, [advancedMode]);
  useEffect(() => { saveState('showMealImages', showMealImages); }, [showMealImages]);
  useEffect(() => { saveState('weightEntries', weightEntries); }, [weightEntries]);
  useEffect(() => { saveState('streak', streak); }, [streak]);
  useEffect(() => { saveState('savedRecipes', savedRecipes); }, [savedRecipes]);
  useEffect(() => { saveState('groceryChecked', groceryChecked); }, [groceryChecked]);
  useEffect(() => { savePremiumState(premium); }, [premium]);

  useEffect(() => {
    if (premium.status !== 'trial' || !premium.trialExpiresAt) return undefined;
    const expiresAt = new Date(premium.trialExpiresAt).getTime();
    if (!Number.isFinite(expiresAt)) return undefined;
    if (expiresAt <= Date.now()) {
      setPremium(prev => ({ status: 'free', email: prev.email }));
      return undefined;
    }
    const timer = setTimeout(() => {
      setPremium(prev => ({ status: 'free', email: prev.email }));
    }, expiresAt - Date.now());
    return () => clearTimeout(timer);
  }, [premium.status, premium.trialExpiresAt]);

  const premiumIsActive = useMemo(() => (
    premium.status === 'active'
    || (premium.status === 'trial' && premium.trialExpiresAt && new Date(premium.trialExpiresAt).getTime() > Date.now())
  ), [premium.status, premium.trialExpiresAt]);

  const postPremiumLead = useCallback(async (payload) => {
    if (!PREMIUM_LEAD_WEBHOOK) return;
    try {
      await fetch(PREMIUM_LEAD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('premium lead webhook failed', err);
    }
  }, []);

  const startTrial = useCallback(async (email) => {
    const normalizedEmail = (email || '').trim();
    if (!normalizedEmail) throw new Error('Email is required');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const nextState = { status: 'trial', email: normalizedEmail, trialExpiresAt: expiresAt };
    setPremium(nextState);
    await postPremiumLead({ email: normalizedEmail, status: 'trial', trialExpiresAt: expiresAt });
    return nextState;
  }, [postPremiumLead]);

  const activatePremium = useCallback(async (email) => {
    const normalizedEmail = (email || '').trim();
    if (!normalizedEmail) throw new Error('Email is required');
    const nextState = { status: 'active', email: normalizedEmail };
    setPremium(nextState);
    await postPremiumLead({ email: normalizedEmail, status: 'active' });
    return nextState;
  }, [postPremiumLead]);

  const isPremiumActive = useCallback(() => premiumIsActive, [premiumIsActive]);
  const openPremiumModal = useCallback(() => setPremiumModalOpen(true), []);
  const closePremiumModal = useCallback(() => setPremiumModalOpen(false), []);

  // === ACTIONS ===
  const logMeal = useCallback((meal) => {
    const loggedAt = new Date();
    const baseSlot = meal.slot || meal.type || inferSlotFromTime(loggedAt);
    const inferredSlot = typeof baseSlot === 'string' ? baseSlot.toLowerCase() : 'lunch';

    const normalizedMeal = {
      name: meal.name || 'Meal',
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fat: Number(meal.fat) || 0,
      type: inferredSlot,
      slot: inferredSlot,
      loggedAt: loggedAt.toISOString(),
      source: meal.source || 'manual',
      notes: meal.notes || '',
    };

    setDailyLog(prev => ({
      ...prev,
      meals: [...prev.meals, normalizedMeal],
      totalCalories: prev.totalCalories + normalizedMeal.calories,
      totalProtein: prev.totalProtein + normalizedMeal.protein,
      totalCarbs: prev.totalCarbs + normalizedMeal.carbs,
      totalFat: prev.totalFat + normalizedMeal.fat,
    }));

    saveLogEntry(normalizedMeal).catch(() => {});
  }, [setDailyLog]);

  const toggleFoodFavorite = useCallback((food) => {
    setFavoriteFoods(prev => {
      const exists = prev.find(f => f.name === food.name);
      if (exists) return prev.filter(f => f.name !== food.name);
      return [{ ...food, savedAt: Date.now() }, ...prev].slice(0, 50);
    });
  }, []);

  const isFoodFavorite = useCallback((name) => {
    return favoriteFoods.some(f => f.name === name);
  }, [favoriteFoods]);

  const copyYesterdayMeals = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    const yesterdayLog = (logHistory || []).find(l => l.date === yesterdayKey);
    if (!yesterdayLog || !yesterdayLog.meals || yesterdayLog.meals.length === 0) return false;
    yesterdayLog.meals.forEach(meal => {
      logMeal({ ...meal, loggedAt: new Date().toISOString() });
    });
    return yesterdayLog.meals.length;
  }, [logHistory, logMeal]);

  const removeMeal = useCallback((index) => {
    setDailyLog(prev => {
      if (!prev) return prev
      const meals = [...(prev.meals || [])]
      meals.splice(index, 1)
      const updated = {
        ...prev,
        meals,
        totalCalories: meals.reduce((s, m) => s + (m.calories || 0), 0),
        totalProtein:  meals.reduce((s, m) => s + (m.protein || 0), 0),
        totalCarbs:    meals.reduce((s, m) => s + (m.carbs || 0), 0),
        totalFat:      meals.reduce((s, m) => s + (m.fat || 0), 0),
      }
      saveState('dailyLog', updated)
      return updated
    })
  }, [])

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
    keys.forEach(k => localStorage.removeItem(`${STORAGE_PREFIX}${k}`));
    localStorage.removeItem(PREMIUM_STORAGE_KEY);
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
    planLoading, setPlanLoading,
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
    // Premium
    premium,
    startTrial,
    activatePremium,
    isPremiumActive,
    premiumModalOpen,
    setPremiumModalOpen,
    removeMeal,
    copyYesterdayMeals,
    favoriteFoods, toggleFoodFavorite, isFoodFavorite,
    openPremiumModal,
    // auth
    isLoggedIn,
    authToken,
    authModalOpen,
    setAuthModalOpen,
    loginSuccess,
    logout,
    closePremiumModal,
    premiumCheckoutUrl: PREMIUM_CHECKOUT_URL,
    premiumContactEmail: PREMIUM_CONTACT_EMAIL,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
