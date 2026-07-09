import React from 'react';
import { Home, CalendarDays, Plus, Compass, User } from 'lucide-react';

const ITEMS = [
  { key: 'home', label: 'home', Icon: Home },
  { key: 'meals', label: 'plans', Icon: CalendarDays },
  { key: 'explore', label: 'explore', Icon: Compass },
  { key: 'profile', label: 'you', Icon: User },
];

/**
 * Floating glass bottom nav with a raised center FAB.
 * Home · Plans · [ + ] · Explore · You  (activeTab-driven for now).
 */
export function BottomNav({ active, onNav, onFab }) {
  // insert FAB in the middle of the 4 items → [home, plans, FAB, explore, you]
  const left = ITEMS.slice(0, 2);
  const right = ITEMS.slice(2);

  const item = ({ key, label, Icon }) => {
    const on = active === key;
    return (
      <button
        key={key}
        onClick={() => onNav(key)}
        style={{
          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 3, flex: 1, background: 'none', border: 'none', cursor: 'pointer',
          color: on ? 'var(--primary)' : 'var(--muted)', transition: 'color .2s var(--ease-out)',
        }}
      >
        {on && (
          <span style={{
            position: 'absolute', top: 1, width: 42, height: 24, borderRadius: 999,
            background: 'radial-gradient(circle, rgba(67,198,172,.5), transparent 70%)', filter: 'blur(7px)',
          }} />
        )}
        <Icon size={23} strokeWidth={1.9} />
        <span style={{ font: '600 10px var(--font-ui)', letterSpacing: '.06em' }}>{label}</span>
      </button>
    );
  };

  return (
    <div
      className="glass-nav"
      style={{
        position: 'absolute', left: 16, right: 16, bottom: 16, height: 64, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px',
        borderRadius: 999, background: 'var(--glass-fill)', border: '1px solid var(--divider-strong)',
        boxShadow: '0 24px 48px -24px rgba(0,0,0,.9)',
      }}
    >
      {left.map(item)}
      <button
        onClick={onFab}
        aria-label="Log food"
        style={{
          flex: 'none', width: 56, height: 56, borderRadius: 'var(--r-fab)', marginTop: -20,
          background: 'linear-gradient(140deg,#43C6AC,#0F9482)', color: '#04231C', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 16px 30px -10px rgba(67,198,172,.6), inset 0 1px 0 rgba(255,255,255,.3)',
        }}
      >
        <Plus size={26} strokeWidth={2.4} />
      </button>
      {right.map(item)}
    </div>
  );
}
