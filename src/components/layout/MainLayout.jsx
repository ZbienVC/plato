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
        <div className="absolute w-72 h-72 rounded-full bg-teal-500/[0.04] blur-[100px] animate-float-slow"
          style={{ top: '-8%', right: '-20%' }} />
        <div className="absolute w-56 h-56 rounded-full bg-indigo-500/[0.03] blur-[80px] animate-breathe"
          style={{ bottom: '15%', left: '-18%' }} />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain relative z-10"
        style={{ paddingBottom: '90px' }}>
        <div className="px-5 pt-14 pb-8">
          {children}
        </div>
      </div>

      {showFAB && <FAB onClick={onFABPress} pulse={shouldPulseFAB} />}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
