import React, { useState } from 'react';
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
  const { setDrawerOpen, userProfile, setActiveTab } = useApp();
  const title = PAGE_TITLES[activeTab] || 'Plato';
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

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
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
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
