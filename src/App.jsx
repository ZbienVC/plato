import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { VerdantShell } from './screens/_shell/VerdantShell';
import { Home } from './screens/Home';
import { Onboarding } from './pages/Onboarding';
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

// Transitional wrapper: hosts a not-yet-converted legacy page inside the
// Verdant frame with a scroll region that clears the floating nav.
function ScreenScroll({ children }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 14, paddingBottom: 'var(--nav-safe-pad)', position: 'relative', zIndex: 1 }}>
      <div className="page-shell" style={{ paddingBottom: 24 }}>{children}</div>
    </div>
  );
}

function Explore() {
  const { logMeal } = useApp();
  const foods = [
    { name: 'Chicken & Rice', calories: 450, protein: 42, carbs: 38, fat: 8 },
    { name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 9, fat: 2 },
    { name: 'Protein Shake', calories: 160, protein: 30, carbs: 8, fat: 3 },
    { name: 'Oatmeal', calories: 280, protein: 8, carbs: 48, fat: 6 },
    { name: 'Eggs (3)', calories: 210, protein: 18, carbs: 1, fat: 14 },
    { name: 'Salad + Chicken', calories: 380, protein: 35, carbs: 12, fat: 16 },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', margin: '0 0 12px' }}>quick add</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {foods.map(food => (
          <button key={food.name} onClick={() => logMeal({ ...food, slot: 'snack' })} className="glass" style={{ borderRadius: 'var(--r-card)', padding: 14, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
            <p style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)', margin: 0 }}>{food.name}</p>
            <p style={{ font: '500 12px var(--font-ui)', color: 'var(--sage)', margin: '4px 0 0' }}>{food.calories} kcal</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ font: '600 12px var(--font-ui)', color: 'var(--macro-protein)' }}>{food.protein}P</span>
              <span style={{ font: '600 12px var(--font-ui)', color: 'var(--macro-carbs)' }}>{food.carbs}C</span>
              <span style={{ font: '600 12px var(--font-ui)', color: 'var(--macro-fat)' }}>{food.fat}F</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AppContent() {
  const {
    activeTab, setActiveTab, userProfile,
    showVoiceLog, setShowVoiceLog, logMeal,
    premiumModalOpen, closePremiumModal,
    authModalOpen, setAuthModalOpen, loginSuccess,
  } = useApp();
  const { showToast, ToastContainer } = useToast();

  const [welcomeDone, setWelcomeDone] = useState(
    () => localStorage.getItem('plato_welcome_done') === 'true' || !!userProfile?.name
  );
  const [hasOnboarded, setHasOnboarded] = useState(
    () => localStorage.getItem('plato_onboarded') === 'true' || !!userProfile?.name
  );

  const completeOnboarding = () => { localStorage.setItem('plato_onboarded', 'true'); setHasOnboarded(true); };
  const handleWelcomeGuest = () => { localStorage.setItem('plato_welcome_done', 'true'); setWelcomeDone(true); };
  const handleWelcomeAuth = () => {
    const alreadyOnboarded = localStorage.getItem('plato_onboarded') === 'true' || !!userProfile?.name;
    localStorage.setItem('plato_welcome_done', 'true');
    setWelcomeDone(true);
    if (alreadyOnboarded) setHasOnboarded(true);
  };

  if (!welcomeDone) return <WelcomeScreen onContinueAsGuest={handleWelcomeGuest} onAuthSuccess={handleWelcomeAuth} />;
  if (!hasOnboarded) return <Onboarding onComplete={completeOnboarding} />;

  const openLog = () => setActiveTab('log');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <Home onFab={openLog} />;
      case 'log': return <ScreenScroll><LogMeal /></ScreenScroll>;
      case 'meals': return <ScreenScroll><MealPlans /></ScreenScroll>;
      case 'explore': return <ScreenScroll><Explore /></ScreenScroll>;
      case 'profile': return <ScreenScroll><Profile /></ScreenScroll>;
      case 'weight': return <ScreenScroll><WeightTracker /></ScreenScroll>;
      case 'grocery': return <ScreenScroll><GroceryList /></ScreenScroll>;
      case 'settings': return <ScreenScroll><SettingsPanel /></ScreenScroll>;
      default: return <Home onFab={openLog} />;
    }
  };

  const navActive = ['home', 'meals', 'explore', 'profile'].includes(activeTab) ? activeTab : '';

  return (
    <>
      <VerdantShell active={navActive} onNav={setActiveTab} onFab={openLog}>
        {renderScreen()}
      </VerdantShell>
      {showVoiceLog && (
        <VoiceLogOverlay
          onClose={() => setShowVoiceLog(false)}
          onSave={(entry) => logMeal(entry)}
          onSuccess={() => { setShowVoiceLog(false); showToast('Meal logged from voice!', 'success', 2400); }}
        />
      )}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={loginSuccess} />
      <PremiumPaywallModal open={premiumModalOpen} onClose={closePremiumModal} showToast={showToast} />
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
