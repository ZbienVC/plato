import React from 'react';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { Drawer } from './Drawer';

export function MainLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="max-w-[430px] mx-auto bg-slate-50 min-h-screen flex flex-col relative">
      <Drawer />
      
      {/* Top bar — sticky */}
      <TopBar activeTab={activeTab} />

      {/* Scrollable page content */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: '72px' }}>
        <div className="px-4 py-4">
          {children}
        </div>
      </div>

      {/* Bottom nav — fixed */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40">
        <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
}
