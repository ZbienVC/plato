import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { RESTAURANTS } from '../../utils/constants';
import { RESTAURANT_MENUS } from '../../services/restaurantData';

export function RestaurantBrowser({ onLog, onClose, dark = false }) {
  const { logMeal } = useApp();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('protein');

  const handleLog = onLog || logMeal;

  const filters = [
    { id: 'protein', label: 'Most Protein' },
    { id: 'lowcal', label: 'Lowest Cal' },
    { id: 'macros', label: 'Best Macros' },
    { id: 'balanced', label: 'Balanced' },
  ];

  const filteredRestaurants = RESTAURANTS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const menuItems = useMemo(() => {
    if (!selectedRestaurant) return [];
    const items = RESTAURANT_MENUS[selectedRestaurant.id] || [];
    return [...items].sort((a, b) => {
      switch (activeFilter) {
        case 'protein': return b.protein - a.protein;
        case 'lowcal': return a.calories - b.calories;
        case 'macros': return (b.protein / b.calories) - (a.protein / a.calories);
        default: return 0;
      }
    });
  }, [selectedRestaurant, activeFilter]);

  const doLog = (item) => {
    handleLog({
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      type: 'lunch',
      restaurant: selectedRestaurant?.name,
    });
  };

  if (selectedRestaurant) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setSelectedRestaurant(null)}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </motion.button>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: selectedRestaurant.color }}>
            <span className="text-white font-black text-sm">{selectedRestaurant.name.charAt(0)}</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">{selectedRestaurant.name}</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3">
          {filters.map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.id ? 'text-white btn-primary' : 'bg-white border border-slate-200 text-slate-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <div key={i} className="app-card flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-900">{item.calories} cal</span>
                  <span className="text-xs text-blue-500">{item.protein}g P</span>
                  <span className="text-xs text-amber-500">{item.carbs}g C</span>
                  <span className="text-xs text-rose-500">{item.fat}g F</span>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => doLog(item)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                Log
              </motion.button>
            </div>
          ))}
          {menuItems.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-6">Menu coming soon</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900">Restaurant Mode</h2>
        {onClose && <button onClick={onClose} className="text-slate-400 text-xl">✕</button>}
      </div>

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
        {['all','fast-casual','fast-food','cafe','grocery','snacks'].map(cat => (
          <button key={cat} onClick={() => setSearch(cat === 'all' ? '' : cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all capitalize"
            style={{ background: search === cat ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(255,255,255,0.8)', color: search === cat ? '#fff' : '#64748b', border: '1px solid rgba(99,102,241,0.15)' }}>
            {cat === 'all' ? 'All' : cat.replace('-',' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredRestaurants.map(restaurant => (
          <motion.button key={restaurant.id} whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedRestaurant(restaurant)}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center text-center hover:border-slate-200 hover:shadow-md transition-all">
            {/* Brand color top bar */}
            <div className="w-full h-1 rounded-full mb-3" style={{ background: restaurant.color }} />
            {/* Brand logo badge */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm" style={{ background: restaurant.color }}>
              <span className="text-white font-black text-xl leading-none">
                {restaurant.name.charAt(0)}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 text-center leading-tight">{restaurant.name}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
