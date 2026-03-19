import React, { useState, useMemo } from 'react';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { RestaurantItem } from '../molecules/RestaurantItem';
import { RESTAURANTS } from '../../utils/constants';
import { RESTAURANT_MENUS } from '../../services/restaurantData';

/**
 * Restaurant browsing experience
 * Grid view → Menu view with macro filtering + inline logging
 */
export function RestaurantBrowser({ onLog, onClose, dark = true }) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('protein');

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
    
    const sorted = [...items].sort((a, b) => {
      switch (activeFilter) {
        case 'protein': return b.protein - a.protein;
        case 'lowcal': return a.calories - b.calories;
        case 'macros': return (b.protein / b.calories) - (a.protein / a.calories);
        case 'balanced': {
          const balanceA = Math.abs(a.protein * 4 / a.calories - 0.3) + Math.abs(a.carbs * 4 / a.calories - 0.4);
          const balanceB = Math.abs(b.protein * 4 / b.calories - 0.3) + Math.abs(b.carbs * 4 / b.calories - 0.4);
          return balanceA - balanceB;
        }
        default: return 0;
      }
    });

    return sorted;
  }, [selectedRestaurant, activeFilter]);

  const handleLog = (item) => {
    if (onLog) {
      onLog({
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        type: 'lunch',
        restaurant: selectedRestaurant?.name,
      });
    }
  };

  // === MENU VIEW ===
  if (selectedRestaurant) {
    return (
      <div className="animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedRestaurant(null)}
            className={`p-2 rounded-xl ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}
          >
            <span className="text-lg">←</span>
          </button>
          <span className="text-2xl">{selectedRestaurant.emoji}</span>
          <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
            {selectedRestaurant.name}
          </h2>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all
                ${activeFilter === filter.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : dark
                    ? 'bg-white/5 text-slate-400 border border-white/10 hover:border-emerald-500/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Sort label */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          Sorted by: {filters.find(f => f.id === activeFilter)?.label}
        </p>

        {/* Menu items */}
        <div className="space-y-3">
          {menuItems.map((item, i) => (
            <RestaurantItem
              key={item.name}
              item={item}
              rank={i < 3 ? i + 1 : undefined}
              onLog={handleLog}
              dark={dark}
            />
          ))}
        </div>

        {menuItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Menu coming soon for {selectedRestaurant.name}</p>
          </div>
        )}
      </div>
    );
  }

  // === GRID VIEW ===
  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
          🍽️ Restaurant Mode
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl p-2">
            ✕
          </button>
        )}
      </div>

      {/* Search */}
      <Input
        type="search"
        placeholder="Search restaurants..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<span>🔍</span>}
        dark={dark}
        className="mb-6"
      />

      {/* Restaurant grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredRestaurants.map(restaurant => (
          <Card
            key={restaurant.id}
            variant="glass"
            padding="md"
            dark={dark}
            hover
            onClick={() => setSelectedRestaurant(restaurant)}
            className="text-center"
          >
            <div
              className="w-full h-1 rounded-full mb-3"
              style={{ background: restaurant.color }}
            />
            <span className="text-3xl mb-2 block">{restaurant.emoji}</span>
            <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>
              {restaurant.name}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
