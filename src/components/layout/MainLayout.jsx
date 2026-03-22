import React from 'react';
import { BottomNav } from './BottomNav';
import { FAB } from './FAB';

export function MainLayout({
  children, activeTab, onTabChange,
  onFABPress, showFAB = true, shouldPulseFAB = false,
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F1A] relative max-w-md mx-auto">
      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-72 h-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.1)_0,transparent_70%)] animate-float-slow"
          style={{ top: '-8%', right: '-20%' }} />
        <div className="absolute w-56 h-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,transparent_70%)] animate-breathe"
          style={{ bottom: '15%', left: '-18%' }} />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain relative z-10"
        style={{ paddingBottom: '90px' }}>
        <div className="px-5 pt-14 pb-8 space-y-6 flex flex-col justify-start">
          {children}
        </div>
      </div>

      {showFAB && <FAB onClick={onFABPress} pulse={shouldPulseFAB} />}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
