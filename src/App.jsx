import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { LogMeal } from './pages/LogMeal';
import { MealPlans } from './pages/MealPlans';
import { Profile } from './pages/Profile';
import { WeightTracker } from './components/organisms/WeightTracker';
import { GroceryList } from './components/organisms/GroceryList';
import { SettingsPanel } from './components/organisms/SettingsPanel';
import { VoiceLogOverlay } from './components/organisms/VoiceLogOverlay';
import { PremiumPaywallModal } from './components/organisms/PremiumPaywallModal';
import { useToast } from './components/organisms/Toast';
import { AuthModal } from './components/organisms/AuthModal';
import { WelcomeScreen } from './pages/WelcomeScreen';
import './styles/index.css';

// Simple Explore page
function Explore() {
  const { plan, logMeal } = useApp();
  const meals = plan?.meals || [];
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">Quick Log</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Chicken & Rice', calories: 450, protein: 42, carbs: 38, fat: 8 },
            { name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 9, fat: 2 },
            { name: 'Protein Shake', calories: 160, protein: 30, carbs: 8, fat: 3 },
            { name: 'Oatmeal', calories: 280, protein: 8, carbs: 48, fat: 6 },
            { name: 'Eggs (3)', calories: 210, protein: 18, carbs: 1, fat: 14 },
            { name: 'Salad + Chicken', calories: 380, protein: 35, carbs: 12, fat: 16 },
          ].map((food) => (
            <button
              key={food.name}
              onClick={() => logMeal({ ...food, loggedAt: new Date().toISOString(), slot: 'snack' })}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-left hover:border-green-200 hover:shadow-md transition-all"
            >
              <p className="font-semibold text-slate-900 text-sm">{food.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{food.calories} kcal</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-blue-500 font-medium">{food.protein}P</span>
                <span className="text-xs text-amber-500 font-medium">{food.carbs}C</span>
                <span className="text-xs text-rose-500 font-medium">{food.fat}F</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple Achievements page
function Achievements() {
  const { streak, dailyLog } = useApp();
  const milestones = [
    { label: 'First log', done: dailyLog?.meals?.length > 0, icon: '🌱' },
    { label: '3-day streak', done: streak >= 3 },
    { label: '7-day streak', done: streak >= 7 },
    { label: 'Logged 10 meals', done: (dailyLog?.meals?.length || 0) >= 10 },
    { label: '30-day streak', done: streak >= 30 },
  ];
  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-slate-900">Achievements</h2>
      {milestones.map((m) => (
        <div key={m.label} className={`bg-white rounded-2xl border p-4 flex items-center gap-3 ${m.done ? 'border-green-200' : 'border-slate-100'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${m.done ? 'bg-green-100' : 'bg-slate-100'}`}>
            <span className="text-lg">{m.done ? '✓' : '○'}</span>
          </div>
          <div>
            <p className={`font-semibold text-sm ${m.done ? 'text-green-700' : 'text-slate-500'}`}>{m.label}</p>
            <p className="text-xs text-slate-400">{m.done ? 'Completed!' : 'Keep going'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Help page
function HelpPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900">Help & Feedback</h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
        {[
          { q: 'How do I log a meal?', a: 'Tap the + button in the bottom nav, then choose Manual, Voice, or Quick Add.' },
          { q: 'How do I generate a meal plan?', a: 'Go to Plans tab and tap "Generate Plan". Set your preferences first in Settings.' },
          { q: 'Can I log custom foods?', a: 'Yes! In the Log tab, select Manual and enter your food details.' },
        ].map((item) => (
          <div key={item.q} className="border-b border-slate-50 last:border-0 pb-3 last:pb-0">
            <p className="font-semibold text-slate-900 text-sm">{item.q}</p>
            <p className="text-slate-500 text-sm mt-1">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppContent() {
  const {
    activeTab, setActiveTab,
    userProfile, plan,
    showVoiceLog, setShowVoiceLog,
    logMeal,
    premiumModalOpen,
    closePremiumModal,
    authModalOpen,
    setAuthModalOpen,
    loginSuccess,
  } = useApp();
  const { showToast, ToastContainer } = useToast();

  // Welcome → Onboarding → Dashboard flow
  const [welcomeDone, setWelcomeDone] = useState(
    () => localStorage.getItem('plato_welcome_done') === 'true' || !!userProfile?.name
  );
  const [hasOnboarded, setHasOnboarded] = useState(
    () => localStorage.getItem('plato_onboarded') === 'true' || !!userProfile?.name
  );

  const completeOnboarding = () => {
    localStorage.setItem('plato_onboarded', 'true');
    setHasOnboarded(true);
  };

  const handleWelcomeGuest = () => {
    localStorage.setItem('plato_welcome_done', 'true');
    setWelcomeDone(true);
  };

  const handleWelcomeAuth = () => {
    // After auth, check if returning user (has onboarded before)
    const alreadyOnboarded = localStorage.getItem('plato_onboarded') === 'true' || !!userProfile?.name;
    localStorage.setItem('plato_welcome_done', 'true');
    setWelcomeDone(true);
    if (alreadyOnboarded) {
      setHasOnboarded(true);
    }
    // New users fall through to onboarding
  };

  // Show welcome screen first time
  if (!welcomeDone) {
    return <WelcomeScreen onContinueAsGuest={handleWelcomeGuest} onAuthSuccess={handleWelcomeAuth} />;
  }

  // Then onboarding for new users
  if (!hasOnboarded) {
    return (
      <div>
        <Onboarding onComplete={completeOnboarding} />
      </div>
    );
  }

  // Safety guard - only re-show onboarding if we genuinely have no name AND haven't onboarded
  // (never triggers mid-session - hasOnboarded flag prevents re-entry)
  if (!hasOnboarded && !userProfile?.name) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':         return <Home />;
      case 'log':          return <LogMeal />;
      case 'meals':        return <MealPlans />;
      case 'explore':      return <Explore />;
      case 'profile':      return <Profile />;
      case 'weight':       return <WeightTracker />;
      case 'grocery':      return <GroceryList />;
      case 'achievements': return <Achievements />;
      case 'settings':     return <SettingsPanel />;
      case 'help':         return <HelpPage />;
      default:             return <Home />;
    }
  };

  return (
    <>
      <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </MainLayout>
      {showVoiceLog && (
        <VoiceLogOverlay
          onClose={() => setShowVoiceLog(false)}
          onSave={(entry) => logMeal(entry)}
          onSuccess={() => {
            setShowVoiceLog(false);
            showToast('Meal logged from voice!', 'success', 2400);
          }}
        />
      )}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={loginSuccess}
      />
      <PremiumPaywallModal
        open={premiumModalOpen}
        onClose={closePremiumModal}
        showToast={showToast}
      />
      <ToastContainer />
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
