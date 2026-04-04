import React, { useState, useCallback, useRef } from 'react';
import { searchFood } from '../../lib/api';
import { Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function FoodSearch({ onSelect, placeholder = 'Search food (e.g. chicken breast)...' }) {
  const { toggleFavorite, isFavorite } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const doSearch = useCallback(
    debounce(async (q) => {
      if (q.length < 2) { setResults([]); return; }
      setLoading(true);
      try {
        const r = await searchFood(q);
        setResults(r.slice(0, 12));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350),
    []
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  const handleSelect = (food) => {
    onSelect?.(food);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
          </div>
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            âœ•
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          <div className="max-h-80 overflow-y-auto">
            {results.map((food) => (
              <div key={food.fdcId} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                style={{ flex: 1, display: 'flex' }}
                onClick={() => handleSelect(food)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{food.name}</p>
                  {food.brand && (
                    <p className="truncate text-xs text-slate-400">{food.brand}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">{food.serving}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">{food.calories} <span className="text-xs font-normal text-slate-400">kcal</span></p>
                  <div className="flex gap-2 mt-0.5 justify-end">
                    <span className="text-xs text-blue-500">{food.protein}P</span>
                    <span className="text-xs text-amber-500">{food.carbs}C</span>
                    <span className="text-xs text-rose-500">{food.fat}F</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400">Data from USDA FoodData Central</p>
          </div>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
          <p className="text-sm text-slate-400 text-center">No results for "{query}"</p>
          <p className="text-xs text-slate-300 text-center mt-1">Try a simpler term (e.g. "chicken" not "grilled chicken breast")</p>
        </div>
      )}
    </div>
  );
}
