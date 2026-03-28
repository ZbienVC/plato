import React from 'react';
import { Utensils, Coffee, Salad, Apple, ChefHat } from 'lucide-react';

const MEAL_GRADIENTS = {
  breakfast: { gradient: 'from-amber-400 to-orange-500', icon: Coffee },
  lunch: { gradient: 'from-green-400 to-emerald-500', icon: Salad },
  dinner: { gradient: 'from-violet-500 to-purple-600', icon: Utensils },
  snack: { gradient: 'from-pink-400 to-rose-500', icon: Apple },
  default: { gradient: 'from-slate-400 to-slate-600', icon: ChefHat },
};

const FOOD_GRADIENTS = [
  'from-green-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-orange-400 to-amber-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-cyan-400 to-sky-500',
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
  return Math.abs(hash);
}

export function FoodImage({ mealName = '', mealType = 'default', size = 'md', name = '' }) {
  // Support legacy 'name' prop
  const resolvedName = mealName || name;
  const config = MEAL_GRADIENTS[mealType?.toLowerCase()] || MEAL_GRADIENTS.default;
  const gradientIndex = hashString(resolvedName) % FOOD_GRADIENTS.length;
  const gradient = resolvedName ? FOOD_GRADIENTS[gradientIndex] : config.gradient;
  const Icon = config.icon;

  const sizes = {
    sm: 'w-12 h-12 rounded-xl',
    md: 'w-16 h-16 rounded-2xl',
    lg: 'w-full h-40 rounded-2xl',
    hero: 'w-full h-52 rounded-3xl',
  };

  const iconSizes = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-10 h-10', hero: 'w-14 h-14' };

  return (
    <div className={`bg-gradient-to-br ${gradient} ${sizes[size] || sizes.md} flex items-center justify-center flex-shrink-0 shadow-sm`}>
      <Icon className={`${iconSizes[size] || iconSizes.md} text-white/80`} />
    </div>
  );
}
