import React, { useState, useMemo } from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

/**
 * Grocery List — auto-generated from meal plan ingredients
 * Categorized by aisle, checkable items
 */
export function GroceryList({ meals = [], dark = true, onClose }) {
  const [checkedItems, setCheckedItems] = useState(new Set());

  // Generate grocery list from meal ingredients
  const groceryItems = useMemo(() => {
    const items = {};
    
    (meals || []).forEach(meal => {
      (meal.ingredients || []).forEach(ing => {
        const normalized = ing.toLowerCase().replace(/^\d+(\.\d+)?\s*(oz|cups?|tbsp|tsp|g|slices?|scoops?|medium|large|small)\s*/i, '').trim();
        const key = normalized.split(',')[0].trim();
        if (key.length < 2) return;
        // Skip spices/seasonings
        if (['salt', 'pepper', 'salt and pepper', 'black pepper', 'herbs', 'spices', 'seasoning'].includes(key)) return;

        if (!items[key]) {
          items[key] = { name: key.charAt(0).toUpperCase() + key.slice(1), count: 1, category: categorize(key) };
        } else {
          items[key].count++;
        }
      });
    });

    return Object.values(items).sort((a, b) => a.category.localeCompare(b.category));
  }, [meals]);

  const toggleCheck = (name) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Group by category
  const grouped = useMemo(() => {
    const groups = {};
    groceryItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [groceryItems]);

  const totalItems = groceryItems.length;
  const checkedCount = checkedItems.size;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-[420px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden ${
        dark ? 'bg-[#0f1629]' : 'bg-white'
      } shadow-2xl`}>
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/[0.06]">
          <div>
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
              🛒 Grocery List
            </h2>
            <p className="text-xs text-slate-500">
              {checkedCount} of {totalItems} items checked
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl p-2">✕</button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-2">
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {totalItems === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl block mb-3">🛒</span>
              <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>No items yet</p>
              <p className="text-sm text-slate-500">Generate a meal plan to create your grocery list.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  {category}
                </p>
                <div className="space-y-1">
                  {items.map(item => {
                    const checked = checkedItems.has(item.name);
                    return (
                      <button
                        key={item.name}
                        onClick={() => toggleCheck(item.name)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          checked
                            ? dark ? 'bg-emerald-500/5 opacity-50' : 'bg-emerald-50 opacity-50'
                            : dark ? 'bg-white/5 hover:bg-white/10' : 'app-card-soft hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          checked
                            ? 'bg-emerald-500 border-emerald-500'
                            : dark ? 'border-slate-600' : 'border-slate-300'
                        }`}>
                          {checked && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className={`text-sm flex-1 text-left ${
                          checked
                            ? 'line-through text-slate-500'
                            : dark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {item.name}
                        </span>
                        {item.count > 1 && (
                          <span className="text-[10px] text-slate-500 font-bold">×{item.count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex gap-3 flex-shrink-0 border-t border-white/[0.06]">
          <Button variant="ghost" size="md" className="flex-1" onClick={() => setCheckedItems(new Set())}>
            Clear All
          </Button>
          <Button variant="primary" size="md" className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

function categorize(name) {
  const n = name.toLowerCase();
  if (['chicken', 'beef', 'turkey', 'salmon', 'shrimp', 'tuna', 'pork', 'eggs', 'egg'].some(p => n.includes(p))) return '🥩 Protein';
  if (['milk', 'cheese', 'yogurt', 'cream', 'butter', 'cottage'].some(p => n.includes(p))) return '🥛 Dairy';
  if (['rice', 'pasta', 'oats', 'quinoa', 'bread', 'tortilla', 'bagel', 'toast', 'granola', 'crackers'].some(p => n.includes(p))) return '🌾 Grains';
  if (['banana', 'apple', 'berries', 'pineapple', 'lemon', 'lime', 'avocado', 'tomato', 'cranberries', 'raisins'].some(p => n.includes(p))) return '🍎 Produce';
  if (['spinach', 'broccoli', 'onion', 'garlic', 'pepper', 'carrot', 'mushroom', 'asparagus', 'lettuce', 'romaine', 'cucumber', 'corn', 'beans', 'chickpeas', 'lentils', 'edamame', 'sweet potato', 'brussels'].some(p => n.includes(p))) return '🥬 Vegetables';
  if (['oil', 'olive', 'coconut', 'almond butter', 'peanut butter', 'tahini', 'walnuts', 'almonds', 'cashews', 'pumpkin seeds'].some(p => n.includes(p))) return '🥜 Nuts & Oils';
  if (['protein powder', 'protein', 'whey', 'chia', 'honey', 'chocolate chips'].some(p => n.includes(p))) return '📦 Pantry';
  if (['soy sauce', 'teriyaki', 'vinegar', 'salsa', 'hot sauce', 'mustard', 'mayo', 'ranch', 'balsamic', 'hummus', 'sriracha', 'curry paste', 'fish sauce'].some(p => n.includes(p))) return '🧂 Condiments';
  return '🛒 Other';
}
