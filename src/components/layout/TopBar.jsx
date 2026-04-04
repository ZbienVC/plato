import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Search, MoreHorizontal, X } from 'lucide-react';

const PAGE_TITLES = {
  home: 'Plato',
  log: 'Log Meal',
  meals: 'Meal Plans',
  explore: 'Explore',
  profile: 'Profile',
  weight: 'Weight Tracker',
  grocery: 'Grocery List',
  achievements: 'Achievements',
  settings: 'Settings',
  help: 'Help & Feedback',
};

export function TopBar({ activeTab }) {
  const { setDrawerOpen, userProfile, setActiveTab, premium, isPremiumActive, openPremiumModal } = useApp();
  const title = PAGE_TITLES[activeTab] || 'Plato';
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [trialCountdown, setTrialCountdown] = useState('');
  const premiumActive = isPremiumActive?.() ?? false;

  useEffect(() => {
    if (premium?.status !== 'trial' || !premium?.trialExpiresAt) {
      setTrialCountdown('');
      return undefined;
    }
    const calc = () => {
      const expires = new Date(premium.trialExpiresAt).getTime();
      if (!Number.isFinite(expires)) {
        setTrialCountdown('');
        return;
      }
      const diff = Math.max(0, expires - Date.now());
      const hours = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;
        setTrialCountdown(`${days}d ${remHours}h`);
        return;
      }
      if (hours >= 1) {
        setTrialCountdown(`${hours}h ${mins}m`);
        return;
      }
      setTrialCountdown(`${Math.max(5, mins)}m`);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [premium?.status, premium?.trialExpiresAt]);

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const premiumStatus = premium?.status || 'free';
  const premiumCopy = premiumActive
    ? 'Active'
    : premiumStatus === 'trial'
      ? `Trial · ${trialCountdown || '48h'}`
      : 'Free tier';
  const premiumSubtext = premiumActive
    ? 'Voice + Restaurant unlocked'
    : premiumStatus === 'trial'
      ? '48h full access'
      : 'Voice + Restaurant locked';
  const premiumPillClasses = '';

  const handlePremiumClick = () => {
    if (premiumActive) return;
    openPremiumModal?.();
  };

  // Right action by tab
  const renderRight = () => {
    if (activeTab === 'home') {
      return (
        <button
          onClick={() => setShowNotif(v => !v)}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors relative"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {/* Red dot indicator */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
      );
    }
    if (activeTab === 'explore') {
      return (
        <button
          onClick={() => setShowSearch(v => !v)}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          {showSearch ? <X className="w-5 h-5 text-slate-600" /> : <Search className="w-5 h-5 text-slate-600" />}
        </button>
      );
    }
    if (activeTab === 'meals') {
      return (
        <button
          onClick={() => setActiveTab('settings')}
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
        >
          <MoreHorizontal className="w-5 h-5 text-slate-600" />
        </button>
      );
    }
    return <div className="w-9 h-9" />;
  };

  return (
    <div className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: "rgba(240,253,244,0.88)", borderColor: "rgba(16,185,129,0.1)" }}>
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Avatar → opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm active:scale-95 transition-transform"
        >
          {initials}
        </button>

        {/* Center: Title */}
        <h1 className="font-bold text-slate-900 text-base absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>

        {/* Right: Contextual action */}
        {renderRight()}
      </div>

      {!premiumActive && (
        <div className="px-4 pb-2.5">
          <button type="button" onClick={handlePremiumClick}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 transition-all"
            style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.07),rgba(99,102,241,0.07))", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.04em" }}>FREE TIER</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Voice locked</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981" }}>Upgrade</span>
          </button>
        </div>
      )}

      {/* Notification panel */}
      {showNotif && activeTab === 'home' && (
        <div className="px-4 py-3 border-t border-slate-100 bg-white">
          <p className="text-xs font-semibold text-slate-500 mb-2">Notifications</p>
          <p className="text-sm text-slate-400 text-center py-4">No new notifications</p>
        </div>
      )}
    </div>
  );
}
