import React from 'react';
import { BottomNav } from './BottomNav';
import { FAB } from './FAB';

export function MainLayout({
  children, activeTab, onTabChange,
  onFABPress, showFAB = true, shouldPulseFAB = false, dark = true,
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#050810] relative"
      style={{ maxWidth: '430px', margin: '0 auto' }}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/[0.04] blur-[100px] animate-float-slow" style={{ top: '-5%', right: '-20%' }} />
        <div className="absolute w-[200px] h-[200px] rounded-full bg-blue-500/[0.03] blur-[80px] animate-float-reverse" style={{ bottom: '20%', left: '-15%' }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain relative z-10"
        style={{ paddingBottom: '88px' }}
      >
        <div className="px-6 pt-14 pb-6">
          {children}
        </div>
      </div>

      {showFAB && <FAB onClick={onFABPress} pulse={shouldPulseFAB} dark={dark} />}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} dark={dark} />
    </div>
  );
}
