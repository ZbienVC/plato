import React, { useState, useEffect } from 'react';

/**
 * Extract keyword from meal name for TheMealDB ingredient search
 */
function getMealIngredientKey(mealName) {
  if (!mealName) return null;
  const lower = mealName.toLowerCase();
  const keywords = [
    'chicken', 'salmon', 'beef', 'tuna', 'shrimp', 'pork', 'turkey', 'lamb',
    'egg', 'oat', 'pasta', 'rice', 'quinoa', 'tofu', 'lentil', 'bean',
    'potato', 'broccoli', 'spinach', 'avocado', 'banana', 'strawberry',
  ];
  for (const kw of keywords) {
    if (lower.includes(kw)) return kw;
  }
  return null;
}

/**
 * Simple string hash for consistent selection
 */
function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Color gradient pairs for fallback
 */
const GRADIENT_PAIRS = [
  ['#10d9a0', '#059669'],
  ['#6366f1', '#4f46e5'],
  ['#f59e0b', '#d97706'],
  ['#ef4444', '#dc2626'],
  ['#3b82f6', '#2563eb'],
  ['#8b5cf6', '#7c3aed'],
];

/**
 * FoodImage — fetches a food photo from TheMealDB
 * Falls back to a gradient with a food emoji
 *
 * @param {string} name - Meal/recipe name
 * @param {string} height - CSS height (default 180px)
 * @param {string} rounded - Tailwind rounding class
 * @param {boolean} showOverlay - Show bottom gradient for text readability
 */
export function FoodImage({
  name,
  height = '180px',
  rounded = 'rounded-t-xl',
  showOverlay = true,
  className = '',
}) {
  const [imgSrc, setImgSrc] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (!name) return;
    setImgSrc(null);
    setImgLoaded(false);

    const hash = strHash(name);
    const ingredient = getMealIngredientKey(name);

    const fetchImage = async () => {
      try {
        if (ingredient) {
          // Search by ingredient first
          const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`
          );
          const data = await res.json();
          if (data.meals?.length > 0) {
            setImgSrc(data.meals[hash % data.meals.length].strMealThumb);
            return;
          }
        }
        // Fallback: search by name
        const first = name.split(' ').slice(0, 2).join(' ');
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(first)}`
        );
        const data = await res.json();
        if (data.meals?.length > 0) {
          setImgSrc(data.meals[hash % data.meals.length].strMealThumb);
        }
      } catch {
        // Silent fail — gradient fallback shows
      }
    };

    fetchImage();
  }, [name]);

  const colorPair = GRADIENT_PAIRS[(name ? name.charCodeAt(0) : 0) % GRADIENT_PAIRS.length];

  return (
    <div
      className={`relative overflow-hidden flex-shrink-0 ${rounded} ${className}`}
      style={{ width: '100%', height }}
    >
      {/* Gradient fallback (always behind) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})` }}
      >
        <span className="text-5xl opacity-25">🍽️</span>
      </div>

      {/* Real photo (fades in on load) */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={name}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(false)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Bottom overlay for text readability */}
      {showOverlay && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
      )}
    </div>
  );
}
