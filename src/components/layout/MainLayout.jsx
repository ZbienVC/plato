import React from 'react';
import { motion } from 'framer-motion';
import { BottomNav } from './BottomNav';
import { FAB } from './FAB';

export function MainLayout({
  children, activeTab, onTabChange,
  onFABPress, showFAB = true, shouldPulseFAB = false,
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative max-w-[430px] mx-auto">
      <div className="flex-1 overflow-y-auto overscroll-y-contain relative z-10"
        style={{ paddingBottom: '90px' }}>
        <div className="px-4 pt-12 pb-6 space-y-5 flex flex-col justify-start">
          {children}
        </div>
      </div>

      {showFAB && <FAB onClick={onFABPress} pulse={shouldPulseFAB} />}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
