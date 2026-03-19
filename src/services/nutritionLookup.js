/**
 * Ingredient nutrition data per standard serving
 * Format: { protein, carbs, fat } per unit
 * Calories computed as: protein*4 + carbs*4 + fat*9
 */
export const INGREDIENT_NUTRITION = {
  // Proteins
  'chicken breast': { perOz: { protein: 8.8, carbs: 0, fat: 1 } },
  'lean beef': { perOz: { protein: 7, carbs: 0, fat: 3 } },
  'ground turkey': { perOz: { protein: 7.5, carbs: 0, fat: 2.5 } },
  'salmon': { perOz: { protein: 7, carbs: 0, fat: 4 } },
  'turkey breast': { perOz: { protein: 8, carbs: 0.5, fat: 0.5 } },
  'shrimp': { perOz: { protein: 6, carbs: 0, fat: 0.3 } },
  'tuna': { perOz: { protein: 7.5, carbs: 0, fat: 0.5 } },

  // Eggs & Dairy
  'eggs': { perEgg: { protein: 6, carbs: 0.5, fat: 5 } },
  'egg whites': { perEgg: { protein: 3.6, carbs: 0.2, fat: 0.05 } },
  'greek yogurt': { perCup: { protein: 23, carbs: 9, fat: 0.5 } },
  'milk': { perCup: { protein: 8, carbs: 12, fat: 8 } },
  'almond milk': { perCup: { protein: 1, carbs: 1, fat: 2.5 } },

  // Grains & Starches
  'oats': { perCup: { protein: 6, carbs: 27, fat: 3.5 } },
  'quinoa': { perCup: { protein: 8, carbs: 39, fat: 3.5 } },
  'brown rice': { perCup: { protein: 5, carbs: 45, fat: 2 } },
  'white rice': { perCup: { protein: 4, carbs: 45, fat: 0.5 } },
  'pasta': { perCup: { protein: 8, carbs: 43, fat: 1.5 } },
  'sweet potato': { perMedium: { protein: 2, carbs: 27, fat: 0.2 } },
  'toast': { perSlice: { protein: 3, carbs: 15, fat: 1 } },
  'tortilla': { perLarge: { protein: 4, carbs: 36, fat: 3 } },

  // Proteins - Processed
  'protein powder': { perScoop: { protein: 25, carbs: 3, fat: 1.5 } },
  'protein': { perScoop: { protein: 25, carbs: 3, fat: 1.5 } },

  // Nuts & Nut Butters
  'almonds': { perOz: { protein: 6, carbs: 6, fat: 14 } },
  'almond butter': { perTbsp: { protein: 3.4, carbs: 3, fat: 9 } },
  'peanut butter': { perTbsp: { protein: 4, carbs: 3.5, fat: 8 } },
  'walnuts': { perOz: { protein: 4.3, carbs: 4, fat: 18 } },

  // Fruits & Vegetables
  'banana': { perMedium: { protein: 1.3, carbs: 27, fat: 0.4 } },
  'apple': { perLarge: { protein: 0.5, carbs: 31, fat: 0.5 } },
  'berries': { perCup: { protein: 1, carbs: 14, fat: 0.5 } },
  'vegetables': { perCup: { protein: 2, carbs: 10, fat: 0.2 } },
  'mixed vegetables': { perCup: { protein: 2, carbs: 10, fat: 0.2 } },
  'stir fry vegetables': { perCup: { protein: 2, carbs: 10, fat: 0 } },
  'spinach': { perCup: { protein: 1, carbs: 1.5, fat: 0.2 } },
  'broccoli': { perCup: { protein: 2.5, carbs: 6, fat: 0.3 } },
  'asparagus': { perCup: { protein: 3, carbs: 5, fat: 0.2 } },
  'mixed greens': { perCup: { protein: 1, carbs: 2, fat: 0.1 } },
  'avocado': { perQuarter: { protein: 0.5, carbs: 2, fat: 3.75 } },

  // Other
  'granola': { perCup: { protein: 6, carbs: 65, fat: 16 } },
  'honey': { perTbsp: { protein: 0, carbs: 17, fat: 0 } },

  // Oils & Fats
  'olive oil': { perTbsp: { protein: 0, carbs: 0, fat: 14 }, perTsp: { protein: 0, carbs: 0, fat: 4.7 } },
  'oil': { perTbsp: { protein: 0, carbs: 0, fat: 14 }, perTsp: { protein: 0, carbs: 0, fat: 4.7 } },
  'coconut oil': { perTbsp: { protein: 0, carbs: 0, fat: 14 }, perTsp: { protein: 0, carbs: 0, fat: 4.7 } },
  'butter': { perTbsp: { protein: 0.1, carbs: 0, fat: 11.5 }, perTsp: { protein: 0, carbs: 0, fat: 3.8 } },

  // Sauces & Condiments
  'teriyaki sauce': { perTbsp: { protein: 1, carbs: 3, fat: 0 }, perTsp: { protein: 0.3, carbs: 1, fat: 0 } },
  'soy sauce': { perTbsp: { protein: 1, carbs: 1, fat: 0 }, perTsp: { protein: 0.3, carbs: 0.3, fat: 0 } },
  'fish sauce': { perTbsp: { protein: 0.5, carbs: 0.5, fat: 0 }, perTsp: { protein: 0.2, carbs: 0.2, fat: 0 } },
  'hot sauce': { perTbsp: { protein: 0, carbs: 0.5, fat: 0 }, perTsp: { protein: 0, carbs: 0.2, fat: 0 } },
  'marinara sauce': { perCup: { protein: 4, carbs: 20, fat: 4 } },
  'tahini dressing': { perTbsp: { protein: 2.6, carbs: 3, fat: 8 } },
  'parmesan': { perOz: { protein: 10, carbs: 1, fat: 7 } },
};

/**
 * Look up nutrition data for an ingredient name
 * Tries exact match first, then partial/fuzzy match
 */
export const lookupIngredient = (name) => {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();

  // Exact match
  if (INGREDIENT_NUTRITION[normalized]) {
    return { key: normalized, data: INGREDIENT_NUTRITION[normalized], matchType: 'exact' };
  }

  // Partial match
  for (const key of Object.keys(INGREDIENT_NUTRITION)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return { key, data: INGREDIENT_NUTRITION[key], matchType: 'fuzzy' };
    }
  }

  return null;
};
