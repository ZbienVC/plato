import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Search, MoreHorizontal } from 'lucide-react';

const PAGE_TITLES = {
  home: 'Plato',
  log: 'Log Meal',
  meals: 'Meal Plans',
  explore: 'Explore',
  profile: 'Profile',
  weight: 'Weight',
  grocery: 'Grocery List',
  achievements: 'Achievements',
  settings: 'Settings',
  help: 'Help & Feedback',
};

const PAGE_ACTIONS = {
  home: { icon: Bell, action: 'notifications' },
  log: null,
  meals: { icon: MoreHorizontal, action: 'menu' },
  explore: { icon: Search, action: 'search' },
};

export function TopBar({ activeTab }) {
  const { setDrawerOpen, userProfile } = useApp();
  const title = PAGE_TITLES[activeTab] || 'Plato';
  const actionConfig = PAGE_ACTIONS[activeTab];
  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Avatar → opens drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
        >
          {initials}
        </button>

        {/* Center: Title */}
        <h1 className="font-bold text-slate-900 text-base absolute left-1/2 -translate-x-1/2">
          {title}
        </h1>

        {/* Right: Contextual action */}
        {actionConfig ? (
          <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <actionConfig.icon className="w-5 h-5 text-slate-600" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </div>
    </div>
  );
}
