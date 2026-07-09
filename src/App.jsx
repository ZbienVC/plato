import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { VerdantShell } from './screens/_shell/VerdantShell';
import { Home } from './screens/Home';
import { Explore } from './screens/Explore';
import { Plans } from './screens/Plans';
import { You } from './screens/You';
import { Weight } from './screens/Weight';
import { Settings } from './screens/Settings';
import { Onboarding } from './pages/Onboarding';
import { LogMeal } from './pages/LogMeal';
import { GroceryList } from './components/organisms/GroceryList';
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
      case 'meals': return <Plans onFab={openLog} />;
      case 'explore': return <Explore onFab={openLog} />;
      case 'profile': return <You onFab={openLog} />;
      case 'weight': return <Weight onFab={openLog} />;
      case 'grocery': return <ScreenScroll><GroceryList /></ScreenScroll>;
      case 'settings': return <Settings onFab={openLog} />;
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
