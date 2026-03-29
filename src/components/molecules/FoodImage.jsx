import React from 'react';
import breakfastOats from '../../images/breakfast-oats.jpg';
import chickenSalad from '../../images/chicken-salad.jpg';
import salmonBowl from '../../images/salmon-bowl.jpg';
import smoothieGlass from '../../images/smoothie.jpg';
import snackBoard from '../../images/snack-board.jpg';
import pastaBowl from '../../images/pasta.jpg';

const KEYWORD_IMAGES = [
  { tokens: ['oat', 'yogurt', 'breakfast', 'egg', 'toast', 'parfait'], src: breakfastOats },
  { tokens: ['salmon', 'shrimp', 'tuna', 'poke', 'fish'], src: salmonBowl },
  { tokens: ['chicken', 'turkey', 'salad', 'wrap', 'shawarma'], src: chickenSalad },
  { tokens: ['smoothie', 'shake', 'drink'], src: smoothieGlass },
  { tokens: ['snack', 'apple', 'almond', 'trail', 'cottage'], src: snackBoard },
  { tokens: ['pasta', 'bowl', 'rice', 'curry'], src: pastaBowl },
];

const TYPE_FALLBACKS = {
  breakfast: breakfastOats,
  lunch: chickenSalad,
  dinner: salmonBowl,
  snack: snackBoard,
  default: pastaBowl,
};

function getImageForMeal(name = '', mealType = 'default') {
  const lower = name.toLowerCase();
  const keywordMatch = KEYWORD_IMAGES.find(entry => entry.tokens.some(token => lower.includes(token)));
  if (keywordMatch) return keywordMatch.src;
  const typeKey = mealType?.toLowerCase?.() || 'default';
  return TYPE_FALLBACKS[typeKey] || TYPE_FALLBACKS.default;
}

const SIZES = {
  xs: 'w-10 h-10 rounded-lg',
  sm: 'w-12 h-12 rounded-xl',
  md: 'w-16 h-16 rounded-2xl',
  lg: 'w-full h-40 rounded-2xl',
  hero: 'w-full h-52 rounded-3xl',
};

export function FoodImage({ mealName = '', mealType = 'default', size = 'md', name = '' }) {
  const resolvedName = mealName || name;
  const imageSrc = getImageForMeal(resolvedName, mealType);
  const sizeClass = SIZES[size] || SIZES.md;
  const showLabel = size === 'lg' || size === 'hero';
  const label = resolvedName || mealType;

  return (
    <div className={`relative overflow-hidden flex-shrink-0 bg-slate-200 shadow-sm ${sizeClass}`}>
      <img
        src={imageSrc}
        alt={resolvedName || `${mealType} meal`}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
      {showLabel && (
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xs font-semibold text-white drop-shadow truncate">{label}</p>
        </div>
      )}
    </div>
  );
}
