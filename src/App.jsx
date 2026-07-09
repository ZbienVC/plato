import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { VerdantShell } from './screens/_shell/VerdantShell';
import { Home } from './screens/Home';
import { Explore } from './screens/Explore';
import { Plans } from './screens/Plans';
import { You } from './screens/You';
import { Weight } from './screens/Weight';
import { Settings } from './screens/Settings';
import { LogHub } from './screens/LogHub';
import { Grocery } from './screens/Grocery';
import { Insights } from './screens/Insights';
import { Recipes } from './screens/Recipes';
import { Restaurant } from './screens/Restaurant';
import { Onboarding } from './screens/Onboarding';
import { Splash } from './screens/Splash';
import { VoiceLogOverlay } from './components/organisms/VoiceLogOverlay';
import { PaywallSheet } from './screens/PaywallSheet';
import { useToast } from './components/organisms/Toast';
import { AuthSheet } from './screens/AuthSheet';
import { WelcomeScreen } from './pages/WelcomeScreen';
import './styles/index.css';

function AppContent() {
  const {
    activeTab, setActiveTab, userProfile,
    showVoiceLog, setShowVoiceLog, logMeal,
    premiumModalOpen, closePremiumModal,
    authModalOpen, setAuthModalOpen, loginSuccess,
  } = useApp();
  const { showToast, ToastContainer } = useToast();

  const [splashDone, setSplashDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1700);
    return () => clearTimeout(t);
  }, []);

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

  if (!splashDone) return <Splash />;
  if (!welcomeDone) return <WelcomeScreen onContinueAsGuest={handleWelcomeGuest} onAuthSuccess={handleWelcomeAuth} />;
  if (!hasOnboarded) return <Onboarding onComplete={completeOnboarding} />;

  const openLog = () => setActiveTab('log');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <Home onFab={openLog} />;
      case 'log': return <LogHub onFab={openLog} />;
      case 'meals': return <Plans onFab={openLog} />;
      case 'explore': return <Explore onFab={openLog} />;
      case 'profile': return <You onFab={openLog} />;
      case 'weight': return <Weight onFab={openLog} />;
      case 'grocery': return <Grocery onFab={openLog} />;
      case 'insights': return <Insights onFab={openLog} />;
      case 'recipes': return <Recipes onFab={openLog} />;
      case 'restaurant': return <Restaurant onFab={openLog} />;
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
      <AuthSheet open={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={loginSuccess} />
      <PaywallSheet open={premiumModalOpen} onClose={closePremiumModal} showToast={showToast} />
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
