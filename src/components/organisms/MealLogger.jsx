import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../atoms/Input';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { INGREDIENT_NUTRITION } from '../../services/nutritionLookup';

/**
 * Log action sheet — search, recent, frequent, manual entry
 * Opens as a bottom sheet overlay from the Log tab
 */
export function MealLogger({
  onLog,
  onScan,
  onRestaurant,
  onVoice,
  recentMeals = [],
  frequentMeals = [],
  dark = true,
  onClose,
}) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mealSlot, setMealSlot] = useState('lunch');
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus search after a brief delay
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!search || search.length < 2) { setSearchResults([]); return; }
    const q = search.toLowerCase();
    const results = Object.keys(INGREDIENT_NUTRITION)
      .filter(name => name.includes(q))
      .slice(0, 8)
      .map(name => {
        const data = INGREDIENT_NUTRITION[name];
        const firstUnit = data[Object.keys(data)[0]];
        const cal = Math.round((firstUnit.protein * 4) + (firstUnit.carbs * 4) + (firstUnit.fat * 9));
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          calories: cal,
          protein: Math.round(firstUnit.protein),
          carbs: Math.round(firstUnit.carbs),
          fat: Math.round(firstUnit.fat),
          unit: Object.keys(data)[0].replace('per', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase(),
        };
      });
    setSearchResults(results);
  }, [search]);

  const handleQuickLog = (meal) => {
    if (onLog) onLog(meal);
  };

  const handleConfirmLog = () => {
    if (!selectedItem) return;
    onLog({
      ...selectedItem,
      calories: selectedItem.calories * quantity,
      protein: selectedItem.protein * quantity,
      carbs: selectedItem.carbs * quantity,
      fat: selectedItem.fat * quantity,
      type: mealSlot,
    });
    setSelectedItem(null);
    setQuantity(1);
  };

  const mealSlots = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="animate-fadeIn">
      {/* Drag handle */}
      <div className="flex justify-center mb-4">
        <div className={`w-10 h-1 rounded-full ${dark ? 'bg-white/20' : 'bg-slate-300'}`} />
      </div>

      <h2 className={`text-xl font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}>
        What did you eat?
      </h2>

      {/* Search */}
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search food..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<span>🔍</span>}
        dark={dark}
        className="mb-4"
      />

      {/* Action buttons grid */}
      {!search && !selectedItem && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { emoji: '📷', label: 'Scan Plate', action: onScan },
            { emoji: '📱', label: 'Barcode', action: onScan },
            { emoji: '🍽️', label: 'Restaurant', action: onRestaurant },
            { emoji: '✏️', label: 'Manual Entry', action: () => setSelectedItem({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, manual: true }) },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className={`
                p-4 rounded-xl text-center transition-all active:scale-95
                ${dark
                  ? 'bg-white/5 border border-white/[0.06] hover:border-emerald-500/30'
                  : 'bg-slate-50 border border-slate-200 hover:border-emerald-500/30'
                }
              `}
            >
              <span className="text-2xl block mb-1">{btn.emoji}</span>
              <span className={`text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                {btn.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && !selectedItem && (
        <div className="space-y-2 mb-4">
          {searchResults.map((item, i) => (
            <button
              key={i}
              onClick={() => setSelectedItem(item)}
              className={`
                w-full p-3 rounded-xl text-left transition-all
                ${dark
                  ? 'bg-white/5 hover:bg-white/10 border border-white/[0.06]'
                  : 'bg-white hover:bg-slate-50 border border-slate-200'
                }
              `}
            >
              <p className={`font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                {item.name}
              </p>
              <p className="text-xs text-slate-500">
                {item.calories} cal · {item.protein}g P · {item.carbs}g C · {item.fat}g F
                <span className="text-slate-600"> per {item.unit}</span>
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Confirmation sheet */}
      {selectedItem && !selectedItem.manual && (
        <Card variant="glass" padding="lg" dark={dark} className="mb-4">
          <h3 className={`font-bold text-lg mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
            {selectedItem.name}
          </h3>

          {/* Quantity stepper */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Servings</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold"
              >-</button>
              <span className="text-lg font-bold text-white w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 0.5)}
                className="w-8 h-8 rounded-lg bg-white/10 text-white font-bold"
              >+</button>
            </div>
          </div>

          {/* Meal slot */}
          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Meal</span>
            <select
              value={mealSlot}
              onChange={(e) => setMealSlot(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                dark ? 'bg-white/10 text-white border-white/10' : 'bg-slate-100 text-slate-900'
              } border`}
            >
              {mealSlots.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Live macro preview */}
          <div className="grid grid-cols-4 gap-2 mb-4 text-center">
            <div>
              <p className="text-lg font-black text-emerald-400">{Math.round(selectedItem.calories * quantity)}</p>
              <p className="text-[10px] text-slate-500">cal</p>
            </div>
            <div>
              <p className="text-lg font-black text-blue-400">{Math.round(selectedItem.protein * quantity)}g</p>
              <p className="text-[10px] text-slate-500">protein</p>
            </div>
            <div>
              <p className="text-lg font-black text-amber-400">{Math.round(selectedItem.carbs * quantity)}g</p>
              <p className="text-[10px] text-slate-500">carbs</p>
            </div>
            <div>
              <p className="text-lg font-black text-purple-400">{Math.round(selectedItem.fat * quantity)}g</p>
              <p className="text-[10px] text-slate-500">fat</p>
            </div>
          </div>

          {/* Log button */}
          <Button variant="primary" size="lg" fullWidth onClick={handleConfirmLog}>
            LOG MEAL ✓
          </Button>
        </Card>
      )}

      {/* Recent meals */}
      {!search && !selectedItem && recentMeals.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            RECENT
          </p>
          {recentMeals.slice(0, 5).map((meal, i) => (
            <button
              key={i}
              onClick={() => handleQuickLog(meal)}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-all
                ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
              `}
            >
              <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{meal.name}</span>
              <span className="text-xs text-emerald-400 font-bold">{meal.calories} cal</span>
            </button>
          ))}
        </div>
      )}

      {/* Frequent meals */}
      {!search && !selectedItem && frequentMeals.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            FREQUENT
          </p>
          {frequentMeals.slice(0, 5).map((meal, i) => (
            <button
              key={i}
              onClick={() => handleQuickLog(meal)}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl mb-1 transition-all
                ${dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
              `}
            >
              <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{meal.name}</span>
              <span className="text-xs text-emerald-400 font-bold">{meal.calories} cal</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
