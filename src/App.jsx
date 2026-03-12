import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Sparkles, Loader2, RefreshCw, Star, Heart, Menu, X, TrendingUp, TrendingDown, User, Settings, Calendar, Zap, Award, Target, Bell, ChevronRight, ChevronDown, CheckCircle, Activity, Utensils, BarChart3, Flame, Camera, Scan, QrCode, Plus, Minus, Edit3, Trash2, ImagePlus, AlertCircle, Search, BookOpen, Youtube, FileText, ShoppingCart, CalendarPlus, ExternalLink, Key, Lock, Unlock, Save, Globe, Check, BookmarkPlus, Info, Dumbbell, Sun, Moon, Clock } from 'lucide-react';

// ========== BUG FIX: INGREDIENT NUTRITION LOOKUP TABLE ==========
/**
 * Ingredient nutrition data per standard serving
 * Format: { protein, carbs, fat } per unit
 * Calories computed as: protein*4 + carbs*4 + fat*9
 */
const INGREDIENT_NUTRITION = {
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
  
  // Oils & Fats (tbsp + tsp)
  'olive oil': { 
    perTbsp: { protein: 0, carbs: 0, fat: 14 },
    perTsp: { protein: 0, carbs: 0, fat: 4.7 }
  },
  'oil': { 
    perTbsp: { protein: 0, carbs: 0, fat: 14 },
    perTsp: { protein: 0, carbs: 0, fat: 4.7 }
  },
  'coconut oil': { 
    perTbsp: { protein: 0, carbs: 0, fat: 14 },
    perTsp: { protein: 0, carbs: 0, fat: 4.7 }
  },
  'butter': { 
    perTbsp: { protein: 0.1, carbs: 0, fat: 11.5 },
    perTsp: { protein: 0, carbs: 0, fat: 3.8 }
  },
  
  // Sauces & Condiments (tbsp + tsp where applicable)
  'teriyaki sauce': { 
    perTbsp: { protein: 1, carbs: 3, fat: 0 },
    perTsp: { protein: 0.3, carbs: 1, fat: 0 }
  },
  'soy sauce': { 
    perTbsp: { protein: 1, carbs: 1, fat: 0 },
    perTsp: { protein: 0.3, carbs: 0.3, fat: 0 }
  },
  'fish sauce': { 
    perTbsp: { protein: 0.5, carbs: 0.5, fat: 0 },
    perTsp: { protein: 0.2, carbs: 0.2, fat: 0 }
  },
  'hot sauce': { 
    perTbsp: { protein: 0, carbs: 0.5, fat: 0 },
    perTsp: { protein: 0, carbs: 0.2, fat: 0 }
  },
  'marinara sauce': { perCup: { protein: 4, carbs: 20, fat: 4 } },
  'tahini dressing': { perTbsp: { protein: 2.6, carbs: 3, fat: 8 } },
  'parmesan': { perOz: { protein: 10, carbs: 1, fat: 7 } }
};

/**
 * Restriction synonym expansion map
 * Maps user input to forbidden ingredient keywords
 */
const RESTRICTION_SYNONYMS = {
  'tree_nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut'],
  'nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut', 'peanut'],
  'peanuts': ['peanut'],
  'peanut': ['peanut'],
  'walnuts': ['walnut'],
  'walnut': ['walnut'],
  'almonds': ['almond'],
  'almond': ['almond'],
  'dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'whey'],
  'gluten': ['wheat', 'barley', 'rye', 'pasta', 'bread', 'flour'],
  'soy': ['soy', 'tofu', 'edamame'],
  'shellfish': ['shrimp', 'crab', 'lobster', 'clam', 'oyster', 'mussel'],
  'fish': ['salmon', 'tuna', 'cod', 'tilapia', 'bass', 'trout']
};

/**
 * Parse ingredient line to extract quantity, unit, and name
 * Examples: "6oz chicken breast", "1 cup rice", "2 tbsp almond butter"
 * Returns: { qty: number, unit: string, name: string }
 */
const parseIngredientLine = (line) => {
  if (!line) return null;
  
  const normalized = line.toLowerCase().trim();
  
  // Pattern: "6oz chicken" or "6 oz chicken"
  const ozPattern = /^(\d+(?:\.\d+)?)\s*oz\s+(.+)$/;
  const ozMatch = normalized.match(ozPattern);
  if (ozMatch) {
    return { qty: parseFloat(ozMatch[1]), unit: 'oz', name: ozMatch[2].trim() };
  }
  
  // Pattern: "1 cup rice" or "1.5 cups rice"
  const cupPattern = /^(\d+(?:\.\d+)?)\s+cups?\s+(.+)$/;
  const cupMatch = normalized.match(cupPattern);
  if (cupMatch) {
    return { qty: parseFloat(cupMatch[1]), unit: 'cup', name: cupMatch[2].trim() };
  }
  
  // Pattern: "2 tbsp butter" or "2 tablespoons butter"
  const tbspPattern = /^(\d+(?:\.\d+)?)\s+(tbsp|tablespoons?)\s+(.+)$/;
  const tbspMatch = normalized.match(tbspPattern);
  if (tbspMatch) {
    return { qty: parseFloat(tbspMatch[1]), unit: 'tbsp', name: tbspMatch[3].trim() };
  }
  
  // Pattern: "4 eggs" or "2 scoops protein"
  const countPattern = /^(\d+(?:\.\d+)?)\s+(eggs?|scoops?|slices?)\s*(.*)$/;
  const countMatch = normalized.match(countPattern);
  if (countMatch) {
    const unit = countMatch[2].replace(/s$/, ''); // singular
    const name = countMatch[3].trim() || countMatch[2].replace(/s$/, '');
    return { qty: parseFloat(countMatch[1]), unit, name };
  }
  
  // Pattern: "170g yogurt"
  const gramPattern = /^(\d+(?:\.\d+)?)\s*g\s+(.+)$/;
  const gramMatch = normalized.match(gramPattern);
  if (gramMatch) {
    // Convert grams to approximate cups for yogurt/liquids (240g = 1 cup)
    const grams = parseFloat(gramMatch[1]);
    return { qty: grams / 240, unit: 'cup', name: gramMatch[2].trim() };
  }
  
  // Pattern: "1 medium banana"
  const mediumPattern = /^(\d+(?:\.\d+)?)\s+(medium|large|small)\s+(.+)$/;
  const mediumMatch = normalized.match(mediumPattern);
  if (mediumMatch) {
    return { qty: parseFloat(mediumMatch[1]), unit: mediumMatch[2], name: mediumMatch[3].trim() };
  }
  
  // Fallback: assume 1 serving of whatever it is
  return { qty: 1, unit: 'serving', name: normalized };
};

/**
 * Compute meal macros by summing ingredient contributions
 * Returns: { protein, carbs, fat, calories }
 */
// ========== PART 1: MACRO CONFIDENCE SCORING ==========

// ========== PART 3: EDGE CASE DETECTION ==========

/**
 * Ingredient category classifications for special handling
 */
const INGREDIENT_CATEGORIES = {
  // Spices and herbs (negligible macros if small amounts)
  spices: [
    'salt', 'pepper', 'garlic powder', 'onion powder', 'paprika', 'cumin', 'coriander',
    'oregano', 'basil', 'thyme', 'rosemary', 'parsley', 'cilantro', 'dill', 'sage',
    'bay leaf', 'cinnamon', 'nutmeg', 'ginger', 'turmeric', 'chili powder', 'cayenne',
    'red pepper flakes', 'vanilla extract', 'almond extract', 'black pepper', 'sea salt',
    'kosher salt', 'italian seasoning', 'herbs', 'spices', 'seasoning'
  ],
  
  // Sauces and condiments (only count if substantial quantity)
  sauces: [
    'soy sauce', 'fish sauce', 'worcestershire', 'hot sauce', 'sriracha', 'tabasco',
    'vinegar', 'balsamic', 'rice vinegar', 'apple cider vinegar', 'lemon juice', 
    'lime juice', 'mustard', 'dijon', 'ketchup', 'bbq sauce', 'salsa', 'pico de gallo'
  ],
  
  // Oils and fats (always count, default to 1 tsp if vague)
  oils: [
    'oil', 'olive oil', 'coconut oil', 'avocado oil', 'vegetable oil', 'canola oil',
    'sesame oil', 'butter', 'ghee', 'lard', 'cooking spray'
  ]
};

/**
 * Check if ingredient matches a category
 */
const matchesCategory = (name, category) => {
  if (!name) return false;
  const nameLower = name.toLowerCase().trim();
  return category.some(item => 
    nameLower.includes(item) || item.includes(nameLower)
  );
};

/**
 * Determine if ingredient should be ignored in macro calculations
 * Returns { shouldIgnore: boolean, reason: string }
 */
const shouldIgnoreIngredient = (parsed, nutritionData) => {
  if (!parsed) return { shouldIgnore: true, reason: 'unparseable' };
  
  const { qty, unit, name } = parsed;
  const nameLower = name.toLowerCase().trim();
  
  // Spices: Ignore if no quantity or very small quantity
  if (matchesCategory(name, INGREDIENT_CATEGORIES.spices)) {
    // "to taste", "pinch", or no quantity -> ignore
    if (!qty || qty === 0) {
      return { shouldIgnore: true, reason: 'spice-negligible' };
    }
    
    // Small amounts -> ignore (<1 tsp or <5g)
    if ((unit === 'tsp' && qty < 1) || (unit === 'g' && qty < 5)) {
      return { shouldIgnore: true, reason: 'spice-small-amount' };
    }
    
    // Estimated calorie contribution < 10 -> ignore
    if (nutritionData) {
      const estimatedCals = estimateCalories(qty, unit, nutritionData);
      if (estimatedCals < 10) {
        return { shouldIgnore: true, reason: 'spice-low-calorie' };
      }
    }
  }
  
  // Sauces: Only count if >=1 tbsp
  if (matchesCategory(name, INGREDIENT_CATEGORIES.sauces)) {
    // "to taste" or no quantity -> ignore
    if (!qty || qty === 0) {
      return { shouldIgnore: true, reason: 'sauce-to-taste' };
    }
    
    // Less than 1 tbsp -> ignore
    if (unit === 'tbsp' && qty < 1) {
      return { shouldIgnore: true, reason: 'sauce-small-amount' };
    }
    if (unit === 'tsp' && qty < 3) { // < 1 tbsp
      return { shouldIgnore: true, reason: 'sauce-small-amount' };
    }
  }
  
  return { shouldIgnore: false, reason: null };
};

/**
 * Estimate calories from quantity and nutrition data
 */
const estimateCalories = (qty, unit, nutritionData) => {
  if (!nutritionData || !qty) return 0;
  
  // Find matching unit data
  let perUnit = null;
  if (unit === 'oz' && nutritionData.perOz) perUnit = nutritionData.perOz;
  else if (unit === 'cup' && nutritionData.perCup) perUnit = nutritionData.perCup;
  else if (unit === 'tbsp' && nutritionData.perTbsp) perUnit = nutritionData.perTbsp;
  else if (unit === 'tsp' && nutritionData.perTsp) perUnit = nutritionData.perTsp;
  else if (unit === 'g' && nutritionData.perG) perUnit = nutritionData.perG;
  else {
    // Default to first available
    perUnit = nutritionData[Object.keys(nutritionData)[0]];
  }
  
  if (!perUnit) return 0;
  
  return (perUnit.protein * 4 + perUnit.carbs * 4 + perUnit.fat * 9) * qty;
};

/**
 * Apply conservative defaults for vague ingredient quantities
 */
const applyDefaultQuantity = (parsed, nutritionData) => {
  if (!parsed) return parsed;
  
  let { qty, unit, name } = parsed;
  
  // Oils: If vague quantity, default to 1 tsp
  if (matchesCategory(name, INGREDIENT_CATEGORIES.oils)) {
    if (!qty || qty === 0) {
      qty = 1;
      unit = 'tsp';
    }
  }
  
  // Sauces: If vague but mentioned, default to 1 tbsp
  if (matchesCategory(name, INGREDIENT_CATEGORIES.sauces)) {
    if (!qty || qty === 0) {
      qty = 1;
      unit = 'tbsp';
    }
  }
  
  return { qty, unit, name };
};

// ========== END EDGE CASE DETECTION ==========

/**
 * Calculate confidence score for a single ingredient
 * Returns 0.4-0.95 based on parsing and data quality
 */
const calculateIngredientConfidence = (parsed, nutritionData, perUnit) => {
  let confidence = 0.5; // Base confidence
  
  // No parsed data -> very low confidence
  if (!parsed) return 0.4;
  
  const { qty, unit, name } = parsed;
  
  // Quantity signals
  if (qty && qty > 0) {
    confidence += 0.15; // Has explicit quantity
    
    // Clear unit
    if (unit && ['oz', 'g', 'cup', 'tbsp', 'tsp', 'egg', 'slice', 'scoop'].includes(unit)) {
      confidence += 0.15; // Precise unit
    } else if (unit) {
      confidence += 0.05; // Has unit but vague
    }
  } else {
    confidence -= 0.1; // No quantity (e.g., "to taste")
  }
  
  // Nutrition data quality
  if (nutritionData) {
    if (INGREDIENT_NUTRITION[name]) {
      confidence += 0.15; // Exact match in database
    } else {
      confidence += 0.05; // Fuzzy match
    }
    
    // Unit match quality
    if (perUnit) {
      confidence += 0.1; // Found matching unit nutrition
    }
  } else {
    confidence -= 0.15; // No nutrition data, using estimates
  }
  
  // Cap at reasonable bounds
  return Math.max(0.4, Math.min(0.95, confidence));
};

/**
 * Compute meal macros with confidence scoring
 * Returns { protein, carbs, fat, calories, macroConfidence, ingredientDetails }
 */
const computeMealMacrosFromIngredients = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return { 
      protein: 0, 
      carbs: 0, 
      fat: 0, 
      calories: 0,
      macroConfidence: 0.5, // Neutral for empty
      ingredientDetails: []
    };
  }
  
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalCalories = 0;
  
  const ingredientDetails = []; // Track per-ingredient confidence
  let weightedConfidenceSum = 0;
  let totalCalorieWeight = 0;
  
  for (const ingredientLine of ingredients) {
    const parsed = parseIngredientLine(ingredientLine);
    if (!parsed) {
      // Track unparseable ingredients with low confidence
      ingredientDetails.push({
        line: ingredientLine,
        confidence: 0.4,
        calories: 0,
        reason: 'unparseable'
      });
      continue;
    }
    
    // PART 3: Apply edge case handling
    // Check if ingredient should be ignored in macros
    const ignoreCheck = shouldIgnoreIngredient(parsed, null); // Check before nutrition lookup
    
    // Apply default quantities for vague ingredients (oils, sauces)
    const adjustedParsed = applyDefaultQuantity(parsed, null);
    const { qty, unit, name } = adjustedParsed;
    
    // Look up nutrition data
    let nutritionData = null;
    let lookupKey = null;
    
    // Try exact match first
    if (INGREDIENT_NUTRITION[name]) {
      lookupKey = name;
      nutritionData = INGREDIENT_NUTRITION[name];
    } else {
      // Try partial match (e.g., "grilled chicken" matches "chicken breast")
      for (const key of Object.keys(INGREDIENT_NUTRITION)) {
        if (name.includes(key) || key.includes(name)) {
          lookupKey = key;
          nutritionData = INGREDIENT_NUTRITION[key];
          break;
        }
      }
    }
    
    // Re-check ignore status with nutrition data
    const finalIgnoreCheck = shouldIgnoreIngredient(adjustedParsed, nutritionData);
    
    let perUnit = null;
    let ingredientProtein = 0;
    let ingredientCarbs = 0;
    let ingredientFat = 0;
    let ingredientCalories = 0;
    
    // If ingredient should be ignored, set macros to 0 but still track it
    if (finalIgnoreCheck.shouldIgnore) {
      ingredientProtein = 0;
      ingredientCarbs = 0;
      ingredientFat = 0;
      ingredientCalories = 0;
      
      // Track as ignored ingredient
      ingredientDetails.push({
        line: ingredientLine,
        name,
        qty,
        unit,
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0,
        confidence: 0.95, // High confidence in ignoring (intentional)
        matchType: 'ignored',
        ignoreReason: finalIgnoreCheck.reason
      });
      
      // Don't add to totals, continue to next ingredient
      continue;
    }
    
    if (!nutritionData) {
      // Unknown ingredient - use conservative estimates
      ingredientProtein = 5;
      ingredientCarbs = 10;
      ingredientFat = 2;
      ingredientCalories = (5 * 4) + (10 * 4) + (2 * 9);
    } else {
      // Get the per-unit nutrition
      if (unit === 'oz' && nutritionData.perOz) perUnit = nutritionData.perOz;
      else if (unit === 'cup' && nutritionData.perCup) perUnit = nutritionData.perCup;
      else if (unit === 'tbsp' && nutritionData.perTbsp) perUnit = nutritionData.perTbsp;
      else if (unit === 'tsp' && nutritionData.perTsp) perUnit = nutritionData.perTsp;
      else if (unit === 'egg' && nutritionData.perEgg) perUnit = nutritionData.perEgg;
      else if (unit === 'scoop' && nutritionData.perScoop) perUnit = nutritionData.perScoop;
      else if (unit === 'slice' && nutritionData.perSlice) perUnit = nutritionData.perSlice;
      else if (unit === 'medium' && nutritionData.perMedium) perUnit = nutritionData.perMedium;
      else if (unit === 'large' && nutritionData.perLarge) perUnit = nutritionData.perLarge;
      else if (unit === 'quarter' && nutritionData.perQuarter) perUnit = nutritionData.perQuarter;
      else {
        // Default to first available unit
        perUnit = nutritionData[Object.keys(nutritionData)[0]];
      }
      
      if (perUnit) {
        ingredientProtein = perUnit.protein * qty;
        ingredientCarbs = perUnit.carbs * qty;
        ingredientFat = perUnit.fat * qty;
        ingredientCalories = (ingredientProtein * 4) + (ingredientCarbs * 4) + (ingredientFat * 9);
        
        // PART 3: Cap sauce calorie contribution at 100 cal
        if (matchesCategory(name, INGREDIENT_CATEGORIES.sauces) && ingredientCalories > 100) {
          const scaleFactor = 100 / ingredientCalories;
          ingredientProtein *= scaleFactor;
          ingredientCarbs *= scaleFactor;
          ingredientFat *= scaleFactor;
          ingredientCalories = 100;
        }
      }
    }
    
    // Calculate confidence for this ingredient
    const confidence = calculateIngredientConfidence(parsed, nutritionData, perUnit);
    
    // Track ingredient details
    ingredientDetails.push({
      line: ingredientLine,
      name,
      qty,
      unit,
      protein: ingredientProtein,
      carbs: ingredientCarbs,
      fat: ingredientFat,
      calories: ingredientCalories,
      confidence,
      matchType: nutritionData ? (INGREDIENT_NUTRITION[name] ? 'exact' : 'fuzzy') : 'estimated'
    });
    
    // Accumulate totals
    totalProtein += ingredientProtein;
    totalCarbs += ingredientCarbs;
    totalFat += ingredientFat;
    totalCalories += ingredientCalories;
    
    // Weight confidence by calorie contribution
    weightedConfidenceSum += confidence * ingredientCalories;
    totalCalorieWeight += ingredientCalories;
  }
  
  // Calculate weighted average confidence
  const macroConfidence = totalCalorieWeight > 0 
    ? weightedConfidenceSum / totalCalorieWeight
    : 0.5; // Default if no calories
  
  // Round to whole numbers
  totalProtein = Math.round(totalProtein);
  totalCarbs = Math.round(totalCarbs);
  totalFat = Math.round(totalFat);
  
  // Compute final calories from macros (4/4/9 formula)
  const calories = Math.round((totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9));
  
  return { 
    protein: totalProtein, 
    carbs: totalCarbs, 
    fat: totalFat, 
    calories,
    macroConfidence: Math.round(macroConfidence * 100) / 100, // Round to 2 decimals
    ingredientDetails
  };
};

/**
 * Get confidence tier label for UI display
 * @param {number} confidence - 0.4 to 0.95
 * @returns {string} - 'High confidence', 'Estimated', or 'Rough estimate'
 */
const getConfidenceTierLabel = (confidence) => {
  if (confidence >= 0.80) return 'High confidence';
  if (confidence >= 0.65) return 'Estimated';
  return 'Rough estimate';
};

/**
 * Get confidence explanation for tooltip
 */
const getConfidenceExplanation = (confidence, ingredientDetails) => {
  const tier = getConfidenceTierLabel(confidence);
  const exactMatches = ingredientDetails.filter(i => i.matchType === 'exact').length;
  const fuzzyMatches = ingredientDetails.filter(i => i.matchType === 'fuzzy').length;
  const estimates = ingredientDetails.filter(i => i.matchType === 'estimated').length;
  
  let explanation = `${tier} - `;
  
  if (tier === 'High confidence') {
    explanation += 'Ingredients have precise quantities and known nutrition data.';
  } else if (tier === 'Estimated') {
    explanation += 'Most ingredients matched, some quantities approximated.';
  } else {
    explanation += 'Several ingredients lack precise data. Macros are conservative estimates.';
  }
  
  if (estimates > 0) {
    explanation += ` ${estimates} ingredient${estimates > 1 ? 's' : ''} estimated.`;
  }
  
  return explanation;
};

// ========== END MACRO CONFIDENCE SCORING ==========


/**
 * Normalize and expand user restrictions into forbidden keywords
 * Input: "tree nuts, peanuts" or "treenuts, dairy"
 * Output: Set of forbidden keywords
 */
const parseRestrictions = (restrictionString) => {
  if (!restrictionString || restrictionString.trim() === '') {
    return new Set();
  }
  
  const forbidden = new Set();
  
  // Tokenize: split by comma and space, lowercase, trim
  const tokens = restrictionString
    .toLowerCase()
    .split(/[,\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
  
  for (const token of tokens) {
    // Normalize variants
    let normalized = token;
    if (token === 'tree nuts' || token === 'treenuts') {
      normalized = 'tree_nuts';
    }
    
    // Expand using synonym map
    if (RESTRICTION_SYNONYMS[normalized]) {
      for (const keyword of RESTRICTION_SYNONYMS[normalized]) {
        forbidden.add(keyword);
      }
    } else {
      // Direct keyword
      forbidden.add(normalized);
    }
  }
  
  return forbidden;
};

/**
 * Check if a meal violates any restrictions
 * Returns: true if meal is ALLOWED, false if BLOCKED
 */
const isMealAllowed = (meal, forbiddenKeywords) => {
  if (forbiddenKeywords.size === 0) return true;
  
  // Check meal name
  const mealName = (meal.name || '').toLowerCase();
  for (const keyword of forbiddenKeywords) {
    if (mealName.includes(keyword)) {
      return false;
    }
  }
  
  // Check ingredients
  if (meal.ingredients) {
    for (const ingredient of meal.ingredients) {
      const ingredientLower = ingredient.toLowerCase();
      for (const keyword of forbiddenKeywords) {
        if (ingredientLower.includes(keyword)) {
          return false;
        }
      }
    }
  }
  
  return true;
};

/**
 * Test helper for meal macro math validation
 * Run manually to verify ingredient-based calculations
 */
const testMealMacroMath = () => {
  console.log('=== MEAL MACRO MATH TEST ===');
  
  const testMeals = [
    {
      name: 'Test Meal 1: Chicken & Rice',
      ingredients: ['6oz chicken breast', '1 cup brown rice', '1 cup vegetables']
    },
    {
      name: 'Test Meal 2: Protein Shake',
      ingredients: ['1 scoop protein', '1 cup milk', '1 banana']
    },
    {
      name: 'Test Meal 3: Eggs & Toast',
      ingredients: ['4 eggs', '2 slices toast', '1/4 avocado']
    }
  ];
  
  for (const meal of testMeals) {
    const computed = computeMealMacrosFromIngredients(meal.ingredients);
    const expectedCalories = (computed.protein * 4) + (computed.carbs * 4) + (computed.fat * 9);
    const calorieDiff = Math.abs(computed.calories - expectedCalories);
    
    console.log(`\n${meal.name}:`);
    console.log(`  Ingredients: ${meal.ingredients.join(', ')}`);
    console.log(`  Computed: ${computed.protein}p / ${computed.carbs}c / ${computed.fat}f`);
    console.log(`  Calories: ${computed.calories} (4/4/9 check: ${expectedCalories}, diff: ${calorieDiff})`);
    console.log(`  ${calorieDiff <= 5 ? '\u2714 PASS' : '\u2718 FAIL'}`);
  }
};

/**
 * Test helper for restriction filtering
 */
const testRestrictionFiltering = () => {
  console.log('\n=== RESTRICTION FILTERING TEST ===');
  
  const testCases = [
    { input: 'treenuts', shouldBlock: ['almond butter', 'walnut bread', 'pecan pie'] },
    { input: 'peanuts', shouldBlock: ['peanut butter', 'peanut sauce'] },
    { input: 'nuts', shouldBlock: ['almond milk', 'peanut butter', 'walnut'] },
    { input: 'dairy', shouldBlock: ['milk', 'greek yogurt', 'cheese'] }
  ];
  
  for (const testCase of testCases) {
    console.log(`\nInput: "${testCase.input}"`);
    const forbidden = parseRestrictions(testCase.input);
    console.log(`  Forbidden keywords: ${Array.from(forbidden).join(', ')}`);
    
    for (const item of testCase.shouldBlock) {
      const mockMeal = { name: item, ingredients: [item] };
      const allowed = isMealAllowed(mockMeal, forbidden);
      console.log(`  “${item}”: ${allowed ? '\u2718 FAIL (should be blocked)' : '\u2714 PASS (correctly blocked)'}`);
    }
  }
};

// Uncomment to run tests manually:
// testMealMacroMath();
// testRestrictionFiltering();

// ========== END BUG FIX ADDITIONS ==========

// ========== MEAL DATABASE + PLAN GENERATOR ==========

const MEAL_DATABASE = [
  // BREAKFAST OPTIONS
  { name: 'Greek Yogurt Parfait', type: 'breakfast', calories: 380, protein: 28, carbs: 42, fat: 10, prepTime: 5, tags: ['quick', 'high-protein', 'no-cook'], cuisines: ['any'], ingredients: ['1 cup Greek yogurt', '1/2 cup granola', '1/2 cup mixed berries', '1 tbsp honey', '1 tbsp almond butter'], instructions: ['Layer Greek yogurt in a bowl', 'Top with granola and berries', 'Drizzle with honey and almond butter', 'Serve immediately'] },
  { name: 'Avocado Toast with Eggs', type: 'breakfast', calories: 420, protein: 22, carbs: 38, fat: 22, prepTime: 10, tags: ['quick', 'vegetarian'], cuisines: ['american'], ingredients: ['2 slices whole grain toast', '1 avocado', '2 eggs', '1 tsp olive oil', 'salt and pepper', 'red pepper flakes'], instructions: ['Toast bread until golden', 'Mash avocado with salt and lemon', 'Fry eggs in olive oil to your liking', 'Spread avocado on toast, top with eggs', 'Season with pepper flakes'] },
  { name: 'Protein Oatmeal Bowl', type: 'breakfast', calories: 440, protein: 32, carbs: 52, fat: 10, prepTime: 10, tags: ['high-protein', 'meal-prep'], cuisines: ['any'], ingredients: ['1 cup oats', '1 scoop protein powder', '1 banana', '1 cup almond milk', '1 tbsp peanut butter', '1/2 cup berries'], instructions: ['Cook oats with almond milk for 3-4 min', 'Stir in protein powder off heat', 'Top with sliced banana and berries', 'Add peanut butter drizzle'] },
  { name: 'Veggie Egg White Scramble', type: 'breakfast', calories: 310, protein: 28, carbs: 28, fat: 10, prepTime: 10, tags: ['low-fat', 'high-protein', 'vegetarian'], cuisines: ['american'], ingredients: ['4 egg whites', '1 whole egg', '1 cup spinach', '1/2 cup mushrooms', '1/4 cup tomatoes', '1 slice whole grain toast', '1 tsp olive oil'], instructions: ['Sauté mushrooms and spinach in olive oil', 'Add tomatoes and cook 1 min', 'Whisk eggs with egg whites and add to pan', 'Scramble until cooked through', 'Serve with toast'] },
  { name: 'Banana Protein Smoothie', type: 'breakfast', calories: 390, protein: 35, carbs: 48, fat: 8, prepTime: 5, tags: ['quick', 'high-protein', 'no-cook'], cuisines: ['any'], ingredients: ['1 banana', '1 scoop protein powder', '1 cup almond milk', '1 tbsp almond butter', '1/2 cup Greek yogurt', 'ice'], instructions: ['Add all ingredients to blender', 'Blend until smooth', 'Add more milk if too thick', 'Serve immediately'] },
  { name: 'Smoked Salmon Bagel', type: 'breakfast', calories: 450, protein: 30, carbs: 45, fat: 16, prepTime: 5, tags: ['quick', 'high-protein'], cuisines: ['american'], ingredients: ['1 whole grain bagel', '3oz smoked salmon', '2 tbsp cream cheese', 'capers', 'red onion', 'fresh dill'], instructions: ['Toast bagel halves', 'Spread cream cheese on each half', 'Layer salmon on top', 'Garnish with capers, onion, and dill'] },
  { name: 'Cottage Cheese Bowl', type: 'breakfast', calories: 350, protein: 30, carbs: 35, fat: 8, prepTime: 5, tags: ['quick', 'high-protein', 'no-cook'], cuisines: ['any'], ingredients: ['1 cup cottage cheese', '1/2 cup pineapple chunks', '1/4 cup granola', '1 tbsp honey', 'cinnamon'], instructions: ['Spoon cottage cheese into bowl', 'Top with pineapple and granola', 'Drizzle with honey', 'Dust with cinnamon'] },
  { name: 'Breakfast Burrito', type: 'breakfast', calories: 520, protein: 32, carbs: 48, fat: 20, prepTime: 15, tags: ['high-protein', 'meal-prep'], cuisines: ['mexican'], ingredients: ['1 large tortilla', '3 eggs', '2oz ground turkey', '1/4 cup black beans', '2 tbsp salsa', '1 tbsp olive oil', 'salt and pepper'], instructions: ['Cook turkey in olive oil, season well', 'Scramble eggs in same pan', 'Warm tortilla', 'Layer turkey, eggs, beans, salsa', 'Roll tightly and serve'] },
  { name: 'Overnight Oats', type: 'breakfast', calories: 420, protein: 20, carbs: 58, fat: 12, prepTime: 5, tags: ['meal-prep', 'no-cook'], cuisines: ['any'], ingredients: ['1 cup oats', '1 cup almond milk', '1 scoop protein powder', '1 tbsp chia seeds', '1 tbsp peanut butter', '1/2 cup berries'], instructions: ['Mix oats, milk, protein powder, and chia seeds', 'Refrigerate overnight (min 4 hours)', 'Top with berries and peanut butter before serving', 'Add more milk if needed'] },
  { name: 'Turkish Eggs (Cilbir)', type: 'breakfast', calories: 390, protein: 24, carbs: 18, fat: 26, prepTime: 15, tags: ['vegetarian', 'high-protein'], cuisines: ['mediterranean'], ingredients: ['2 eggs', '1/2 cup Greek yogurt', '1 clove garlic', '2 tbsp butter', '1 tsp paprika', '1 tsp chili flakes', '1 slice crusty bread'], instructions: ['Mix yogurt with minced garlic, salt', 'Poach eggs in simmering water', 'Melt butter with paprika and chili flakes', 'Spoon yogurt on plate, top with eggs', 'Drizzle spiced butter over top'] },

  // LUNCH OPTIONS
  { name: 'Grilled Chicken Caesar Salad', type: 'lunch', calories: 480, protein: 42, carbs: 22, fat: 26, prepTime: 20, tags: ['high-protein', 'low-carb'], cuisines: ['american', 'italian'], ingredients: ['6oz chicken breast', '3 cups romaine lettuce', '2 tbsp Caesar dressing', '2 tbsp parmesan', '1/2 cup croutons', 'black pepper'], instructions: ['Grill chicken breast seasoned with salt and pepper', 'Slice chicken and let rest', 'Toss romaine with Caesar dressing', 'Top with chicken, parmesan, and croutons'] },
  { name: 'Turkey & Hummus Wrap', type: 'lunch', calories: 460, protein: 36, carbs: 42, fat: 16, prepTime: 5, tags: ['quick', 'meal-prep', 'no-cook'], cuisines: ['mediterranean', 'american'], ingredients: ['1 large whole wheat wrap', '4oz turkey breast', '3 tbsp hummus', '1/2 cup mixed greens', '1/4 cucumber', '1/4 cup roasted red peppers', '1 tbsp olive oil'], instructions: ['Spread hummus on wrap', 'Layer turkey, greens, cucumber, and peppers', 'Drizzle with olive oil', 'Roll tightly and cut in half'] },
  { name: 'Asian Salmon Rice Bowl', type: 'lunch', calories: 540, protein: 40, carbs: 48, fat: 16, prepTime: 20, tags: ['high-protein', 'meal-prep'], cuisines: ['asian'], ingredients: ['5oz salmon fillet', '1 cup cooked brown rice', '1 cup edamame', '1/2 avocado', '2 tbsp soy sauce', '1 tbsp sesame oil', '1 tsp ginger'], instructions: ['Cook salmon in pan with sesame oil 4 min per side', 'Mix soy sauce and ginger for sauce', 'Assemble rice in bowl', 'Top with salmon, edamame, and avocado', 'Drizzle sauce over everything'] },
  { name: 'Lentil Soup', type: 'lunch', calories: 380, protein: 22, carbs: 52, fat: 8, prepTime: 30, tags: ['vegetarian', 'vegan', 'meal-prep', 'high-fiber'], cuisines: ['mediterranean'], ingredients: ['1 cup red lentils', '1 can diced tomatoes', '1 onion', '3 cloves garlic', '2 carrots', '2 cups vegetable broth', '1 tsp cumin', '1 tsp turmeric', '1 tbsp olive oil'], instructions: ['Sauté onion, garlic, carrots in olive oil', 'Add lentils, tomatoes, broth, and spices', 'Simmer 25 min until lentils are soft', 'Blend partially for creamier texture', 'Season and serve with crusty bread'] },
  { name: 'Shrimp Taco Bowl', type: 'lunch', calories: 490, protein: 38, carbs: 50, fat: 14, prepTime: 20, tags: ['high-protein', 'quick'], cuisines: ['mexican'], ingredients: ['6oz shrimp', '1 cup cooked rice', '1/2 cup black beans', '1/4 cup corn', '2 tbsp salsa', '2 tbsp Greek yogurt', '1 lime', 'cilantro', '1 tsp cumin'], instructions: ['Season and sauté shrimp with cumin 2-3 min per side', 'Build bowl with rice base', 'Add beans, corn, and shrimp', 'Top with salsa, yogurt, lime juice, and cilantro'] },
  { name: 'Caprese Chicken Sandwich', type: 'lunch', calories: 510, protein: 40, carbs: 44, fat: 18, prepTime: 15, tags: ['high-protein'], cuisines: ['italian', 'american'], ingredients: ['5oz chicken breast', '2 slices sourdough', '2oz fresh mozzarella', '2 tomato slices', 'fresh basil', '1 tbsp balsamic glaze', '1 tsp olive oil'], instructions: ['Pound chicken thin, cook in olive oil 3-4 min per side', 'Toast bread', 'Layer chicken, mozzarella, tomato, and basil', 'Drizzle with balsamic glaze'] },
  { name: 'Quinoa Power Bowl', type: 'lunch', calories: 500, protein: 30, carbs: 54, fat: 18, prepTime: 25, tags: ['vegetarian', 'meal-prep', 'high-protein'], cuisines: ['mediterranean', 'any'], ingredients: ['1 cup cooked quinoa', '1/2 cup chickpeas', '1 cup roasted vegetables', '2 tbsp tahini dressing', '1/4 avocado', 'handful mixed greens', '1 tbsp olive oil', 'lemon'], instructions: ['Roast vegetables with olive oil at 400F for 20 min', 'Make tahini dressing with lemon and water', 'Build bowl with quinoa base', 'Top with chickpeas, veggies, greens, avocado', 'Drizzle tahini dressing'] },
  { name: 'BLT Chicken Salad', type: 'lunch', calories: 450, protein: 38, carbs: 20, fat: 24, prepTime: 15, tags: ['high-protein', 'low-carb', 'quick'], cuisines: ['american'], ingredients: ['5oz grilled chicken', '3 cups mixed greens', '3 strips turkey bacon', '1/2 cup cherry tomatoes', '1/4 avocado', '2 tbsp light ranch dressing'], instructions: ['Cook turkey bacon until crispy', 'Slice grilled chicken', 'Combine greens, tomatoes, and avocado', 'Top with chicken and crumbled bacon', 'Drizzle with ranch dressing'] },
  { name: 'Spicy Tuna Poke Bowl', type: 'lunch', calories: 520, protein: 36, carbs: 52, fat: 16, prepTime: 15, tags: ['high-protein', 'quick'], cuisines: ['asian'], ingredients: ['5oz sushi-grade tuna', '1 cup sushi rice', '1/2 avocado', '1/4 cup cucumber', '2 tbsp soy sauce', '1 tbsp sriracha mayo', '1 tsp sesame seeds', 'green onions'], instructions: ['Cube tuna and marinate in soy sauce', 'Cook rice and let cool slightly', 'Build bowl with rice base', 'Add tuna, avocado, and cucumber', 'Drizzle sriracha mayo and garnish'] },
  { name: 'Chicken Shawarma Bowl', type: 'lunch', calories: 530, protein: 42, carbs: 45, fat: 18, prepTime: 25, tags: ['high-protein', 'meal-prep'], cuisines: ['mediterranean'], ingredients: ['6oz chicken thigh', '1 cup brown rice', '1/2 cup cucumber', '1/2 cup tomatoes', '3 tbsp hummus', '2 tbsp tzatziki', '1 tsp cumin', '1 tsp paprika', 'lemon'], instructions: ['Marinate chicken in cumin, paprika, and lemon', 'Cook chicken in pan until cooked through', 'Slice and serve over rice', 'Add cucumber, tomatoes, hummus', 'Top with tzatziki'] },

  // DINNER OPTIONS
  { name: 'Grilled Salmon with Asparagus', type: 'dinner', calories: 520, protein: 44, carbs: 30, fat: 22, prepTime: 25, tags: ['high-protein', 'low-carb'], cuisines: ['american', 'mediterranean'], ingredients: ['6oz salmon fillet', '1 cup asparagus', '1 cup quinoa cooked', '1 lemon', '2 tbsp olive oil', '2 cloves garlic', 'fresh dill', 'salt and pepper'], instructions: ['Preheat grill or grill pan to medium-high', 'Season salmon with garlic, dill, salt, pepper', 'Toss asparagus with olive oil and salt', 'Grill salmon 4-5 min per side', 'Grill asparagus 3-4 min', 'Serve with quinoa and lemon wedges'] },
  { name: 'Chicken Teriyaki with Rice', type: 'dinner', calories: 560, protein: 45, carbs: 58, fat: 14, prepTime: 25, tags: ['high-protein', 'meal-prep'], cuisines: ['asian'], ingredients: ['6oz chicken breast', '1 cup brown rice cooked', '1 cup stir fry vegetables', '3 tbsp teriyaki sauce', '1 tbsp sesame oil', '1 tsp ginger', 'green onions', 'sesame seeds'], instructions: ['Cook rice per package instructions', 'Slice chicken and cook in sesame oil', 'Add ginger and teriyaki sauce', 'Stir-fry vegetables separately', 'Combine and garnish with onions and sesame seeds'] },
  { name: 'Beef and Broccoli', type: 'dinner', calories: 540, protein: 42, carbs: 44, fat: 18, prepTime: 25, tags: ['high-protein'], cuisines: ['asian'], ingredients: ['5oz lean beef strips', '2 cups broccoli', '1 cup brown rice', '3 tbsp soy sauce', '1 tbsp oyster sauce', '1 tbsp sesame oil', '3 cloves garlic', '1 tsp cornstarch'], instructions: ['Cook rice per instructions', 'Marinate beef in soy sauce and cornstarch', 'Stir-fry garlic in sesame oil', 'Add beef, cook 3-4 min', 'Add broccoli and sauces', 'Toss until coated and broccoli tender'] },
  { name: 'Pasta Primavera with Shrimp', type: 'dinner', calories: 550, protein: 38, carbs: 62, fat: 14, prepTime: 25, tags: ['high-protein'], cuisines: ['italian'], ingredients: ['6oz shrimp', '2oz pasta', '1 cup mixed vegetables', '2 cloves garlic', '1/4 cup white wine', '1 tbsp olive oil', '2 tbsp parmesan', 'fresh basil', 'cherry tomatoes'], instructions: ['Cook pasta al dente', 'Sauté garlic in olive oil', 'Add shrimp and cook 2 min per side', 'Add vegetables and wine, simmer 3 min', 'Toss with pasta and tomatoes', 'Top with parmesan and basil'] },
  { name: 'Turkey Meatballs with Marinara', type: 'dinner', calories: 510, protein: 40, carbs: 50, fat: 16, prepTime: 35, tags: ['high-protein', 'meal-prep'], cuisines: ['italian'], ingredients: ['6oz ground turkey', '2oz pasta', '1/2 cup marinara sauce', '1 egg', '2 tbsp breadcrumbs', '2 cloves garlic', 'fresh parsley', '2 tbsp parmesan', '1 tsp olive oil'], instructions: ['Mix turkey with egg, breadcrumbs, garlic, parsley', 'Form into 1.5 inch meatballs', 'Brown in olive oil 2 min per side', 'Simmer in marinara 15 min', 'Cook pasta, serve topped with meatballs and sauce'] },
  { name: 'Baked Lemon Herb Chicken', type: 'dinner', calories: 490, protein: 46, carbs: 28, fat: 18, prepTime: 35, tags: ['high-protein', 'meal-prep'], cuisines: ['mediterranean', 'american'], ingredients: ['6oz chicken breast', '1 cup roasted vegetables', '1 cup quinoa cooked', '1 lemon', '3 cloves garlic', '2 tbsp olive oil', 'fresh rosemary', 'fresh thyme', 'salt and pepper'], instructions: ['Preheat oven to 400F', 'Marinate chicken with lemon, garlic, herbs, and olive oil', 'Roast vegetables with olive oil for 20 min', 'Bake chicken 22-25 min until cooked through', 'Serve with quinoa and roasted vegetables'] },
  { name: 'Pork Tenderloin with Sweet Potato', type: 'dinner', calories: 530, protein: 40, carbs: 46, fat: 18, prepTime: 40, tags: ['high-protein', 'meal-prep'], cuisines: ['american'], ingredients: ['5oz pork tenderloin', '1 medium sweet potato', '1 cup Brussels sprouts', '2 tbsp olive oil', '2 cloves garlic', 'fresh rosemary', 'apple cider vinegar', 'salt and pepper'], instructions: ['Preheat oven to 425F', 'Season pork with garlic, rosemary, salt, pepper', 'Cube sweet potato and halve Brussels sprouts', 'Roast veggies with olive oil 25 min', 'Sear pork 2 min per side, finish in oven 15 min', 'Rest pork 5 min before slicing'] },
  { name: 'Thai Green Curry', type: 'dinner', calories: 510, protein: 36, carbs: 48, fat: 18, prepTime: 30, tags: ['high-protein'], cuisines: ['asian'], ingredients: ['5oz chicken breast', '1 cup jasmine rice', '1 cup mixed vegetables', '1/2 cup coconut milk', '2 tbsp green curry paste', '1 tbsp fish sauce', 'fresh Thai basil', 'lime'], instructions: ['Cook rice per package', 'Cook chicken pieces in curry paste 3-4 min', 'Add coconut milk and vegetables', 'Simmer 10 min until vegetables tender', 'Season with fish sauce and lime juice', 'Serve over rice with fresh basil'] },
  { name: 'Stuffed Bell Peppers', type: 'dinner', calories: 490, protein: 34, carbs: 48, fat: 16, prepTime: 45, tags: ['meal-prep', 'high-protein'], cuisines: ['american', 'mediterranean'], ingredients: ['2 bell peppers', '4oz ground turkey', '1/2 cup brown rice cooked', '1/2 cup black beans', '1/2 cup marinara sauce', '2oz shredded cheese', '1 tsp cumin', '1 tsp paprika'], instructions: ['Preheat oven to 375F', 'Halve and deseed peppers', 'Cook turkey with spices', 'Mix with rice, beans, and marinara', 'Fill peppers with mixture', 'Top with cheese', 'Bake 25-30 min'] },
  { name: 'Moroccan Chicken Tagine', type: 'dinner', calories: 520, protein: 38, carbs: 50, fat: 16, prepTime: 40, tags: ['high-protein', 'meal-prep'], cuisines: ['mediterranean'], ingredients: ['6oz chicken thigh', '1 cup couscous', '1 can chickpeas', '1 cup diced tomatoes', '1/2 cup raisins', '1 tsp cinnamon', '1 tsp cumin', '1 tsp turmeric', '2 tbsp olive oil', 'fresh cilantro'], instructions: ['Brown chicken in olive oil', 'Add spices and toast 1 min', 'Add tomatoes, chickpeas, raisins, and water', 'Simmer 25 min until chicken is tender', 'Prepare couscous per package', 'Serve stew over couscous with cilantro'] },

  // SNACK OPTIONS
  { name: 'Protein Shake', type: 'snack', calories: 280, protein: 30, carbs: 22, fat: 6, prepTime: 5, tags: ['quick', 'high-protein', 'no-cook'], cuisines: ['any'], ingredients: ['1 scoop protein powder', '1 cup almond milk', '1/2 banana', '1 tbsp almond butter', 'ice'], instructions: ['Add all ingredients to blender', 'Blend until smooth', 'Serve immediately'] },
  { name: 'Apple & Almond Butter', type: 'snack', calories: 220, protein: 6, carbs: 30, fat: 10, prepTime: 2, tags: ['quick', 'vegetarian', 'no-cook'], cuisines: ['any'], ingredients: ['1 large apple', '2 tbsp almond butter'], instructions: ['Core and slice apple', 'Serve with almond butter for dipping'] },
  { name: 'Greek Yogurt & Honey', type: 'snack', calories: 200, protein: 18, carbs: 22, fat: 3, prepTime: 2, tags: ['quick', 'high-protein', 'no-cook'], cuisines: ['any'], ingredients: ['1 cup Greek yogurt', '1 tbsp honey', '1/4 cup berries', 'cinnamon'], instructions: ['Spoon yogurt into bowl', 'Top with berries and honey', 'Dust with cinnamon'] },
  { name: 'Rice Cakes with Tuna', type: 'snack', calories: 200, protein: 22, carbs: 18, fat: 3, prepTime: 5, tags: ['quick', 'high-protein', 'low-fat', 'no-cook'], cuisines: ['any'], ingredients: ['2 rice cakes', '3oz canned tuna', '1 tbsp light mayo', 'cucumber slices', 'salt and pepper'], instructions: ['Mix tuna with mayo, salt, and pepper', 'Top rice cakes with tuna mixture', 'Add cucumber slices on top'] },
  { name: 'Trail Mix', type: 'snack', calories: 260, protein: 8, carbs: 24, fat: 16, prepTime: 2, tags: ['quick', 'no-cook', 'vegan'], cuisines: ['any'], ingredients: ['2 tbsp almonds', '2 tbsp cashews', '2 tbsp dark chocolate chips', '2 tbsp dried cranberries', '1 tbsp pumpkin seeds'], instructions: ['Mix all ingredients together', 'Store in airtight container', 'Serve as needed'] },
  { name: 'Cottage Cheese & Pineapple', type: 'snack', calories: 190, protein: 20, carbs: 20, fat: 2, prepTime: 2, tags: ['quick', 'high-protein', 'low-fat', 'no-cook'], cuisines: ['any'], ingredients: ['1/2 cup cottage cheese', '1/2 cup pineapple chunks', 'cinnamon'], instructions: ['Scoop cottage cheese into bowl', 'Top with pineapple', 'Dust with cinnamon'] },
  { name: 'Edamame with Sea Salt', type: 'snack', calories: 180, protein: 16, carbs: 14, fat: 8, prepTime: 5, tags: ['vegetarian', 'vegan', 'high-protein'], cuisines: ['asian', 'any'], ingredients: ['1 cup edamame in pods', 'sea salt', '1 tsp sesame oil'], instructions: ['Microwave edamame 2-3 minutes', 'Toss with sesame oil and sea salt', 'Serve warm or at room temperature'] },
  { name: 'Beef Jerky & Cheese', type: 'snack', calories: 230, protein: 22, carbs: 6, fat: 12, prepTime: 2, tags: ['quick', 'high-protein', 'no-cook', 'low-carb'], cuisines: ['american'], ingredients: ['1.5oz beef jerky', '1oz cheddar cheese', '5-6 whole grain crackers'], instructions: ['Arrange jerky, cheese, and crackers on plate', 'Serve immediately'] },
];

const generateMealPlan = (targetCalories, macros, mealsPerDay, form) => {
  const mealDistributions = {
    1: [{ type: 'dinner', ratio: 1.0, label: 'Main Meal' }],
    2: [{ type: 'breakfast', ratio: 0.40, label: 'Breakfast' }, { type: 'dinner', ratio: 0.60, label: 'Dinner' }],
    3: [{ type: 'breakfast', ratio: 0.28, label: 'Breakfast' }, { type: 'lunch', ratio: 0.35, label: 'Lunch' }, { type: 'dinner', ratio: 0.37, label: 'Dinner' }],
    4: [{ type: 'breakfast', ratio: 0.22, label: 'Breakfast' }, { type: 'lunch', ratio: 0.28, label: 'Lunch' }, { type: 'dinner', ratio: 0.32, label: 'Dinner' }, { type: 'snack', ratio: 0.18, label: 'Snack' }],
    5: [{ type: 'breakfast', ratio: 0.20, label: 'Breakfast' }, { type: 'snack', ratio: 0.12, label: 'Morning Snack' }, { type: 'lunch', ratio: 0.25, label: 'Lunch' }, { type: 'dinner', ratio: 0.30, label: 'Dinner' }, { type: 'snack', ratio: 0.13, label: 'Evening Snack' }],
    6: [{ type: 'breakfast', ratio: 0.18, label: 'Breakfast' }, { type: 'snack', ratio: 0.11, label: 'Snack 1' }, { type: 'lunch', ratio: 0.22, label: 'Lunch' }, { type: 'snack', ratio: 0.11, label: 'Snack 2' }, { type: 'dinner', ratio: 0.27, label: 'Dinner' }, { type: 'snack', ratio: 0.11, label: 'Snack 3' }],
  };

  const distribution = mealDistributions[Math.min(6, Math.max(1, mealsPerDay))] || mealDistributions[3];

  const forbiddenKeywords = parseRestrictions(form.restrictions || form.allergies || '');

  const scoreMeal = (meal) => {
    let score = Math.random() * 0.3;
    if ((form.secondaryGoals || []).includes('build-muscle') || form.trainingType === 'strength') {
      score += (meal.protein / meal.calories) * 200;
    }
    if (form.dietStyle === 'low-carb' || form.dietStyle === 'keto') {
      score += meal.tags.includes('low-carb') ? 1.5 : 0;
    }
    if (form.dietStyle === 'plant-based') {
      score += meal.tags.includes('vegetarian') ? 2 : (meal.tags.includes('vegan') ? 3 : -1);
    }
    if (form.cookTime === 'quick') {
      score += meal.prepTime <= 15 ? 1 : 0;
    }
    if (form.cuisines && form.cuisines.length > 0) {
      const hasMatch = meal.cuisines.some(c => form.cuisines.includes(c) || c === 'any');
      score += hasMatch ? 0.8 : 0;
    }
    return score;
  };

  const usedMealNames = new Set();

  return distribution.map((slot) => {
    const targetSlotCalories = Math.round(targetCalories * slot.ratio);

    const eligible = MEAL_DATABASE.filter(meal => {
      if (meal.type !== slot.type) return false;
      if (usedMealNames.has(meal.name)) return false;
      return isMealAllowed(meal, forbiddenKeywords);
    });

    let selectedMeal = null;

    if (eligible.length >= 2) {
      const scored = eligible.map(m => ({ ...m, score: scoreMeal(m) })).sort((a, b) => b.score - a.score);
      const pool = scored.slice(0, Math.min(5, scored.length));
      selectedMeal = pool[Math.floor(Math.random() * pool.length)];
    }

    if (!selectedMeal) {
      const proteins = ['chicken breast', 'salmon', 'turkey breast', 'eggs', 'lean beef', 'shrimp', 'tuna', 'greek yogurt'];
      const carbs = ['brown rice', 'quinoa', 'sweet potato', 'oats', 'pasta', 'whole grain toast'];
      const veggies = ['broccoli', 'spinach', 'mixed vegetables', 'asparagus', 'stir fry vegetables'];
      const fats = ['olive oil', 'avocado', 'almond butter', 'peanut butter'];
      const cookMethods = ['Grilled', 'Baked', 'Pan-Seared', 'Roasted', 'Steamed'];

      const protein = proteins[Math.floor(Math.random() * proteins.length)];
      const carb = slot.type === 'snack' ? null : carbs[Math.floor(Math.random() * carbs.length)];
      const veggie = slot.type === 'snack' ? null : veggies[Math.floor(Math.random() * veggies.length)];
      const fat = fats[Math.floor(Math.random() * fats.length)];
      const cookMethod = cookMethods[Math.floor(Math.random() * cookMethods.length)];

      const mealName = slot.type === 'snack'
        ? `${protein.charAt(0).toUpperCase() + protein.slice(1)} Snack`
        : `${cookMethod} ${protein.charAt(0).toUpperCase() + protein.slice(1)}`;

      const ingredients = [
        slot.type !== 'snack' ? `6oz ${protein}` : `3oz ${protein}`,
        carb ? `1 cup ${carb}` : null,
        veggie ? `1 cup ${veggie}` : null,
        `1 tbsp ${fat}`,
        'salt and pepper',
        'garlic and herbs'
      ].filter(Boolean);

      selectedMeal = {
        name: mealName,
        type: slot.type,
        calories: targetSlotCalories,
        protein: Math.round(macros.protein * slot.ratio),
        carbs: Math.round(macros.carbs * slot.ratio),
        fat: Math.round(macros.fat * slot.ratio),
        prepTime: 20,
        tags: ['balanced'],
        cuisines: ['any'],
        ingredients,
        instructions: [
          `Prepare ${protein} using your preferred method`,
          carb ? `Cook ${carb} per package instructions` : null,
          veggie ? `Steam or sauté ${veggie} until tender` : null,
          'Season with salt, pepper, and herbs',
          'Combine and serve hot'
        ].filter(Boolean)
      };
    }

    const scale = targetSlotCalories / selectedMeal.calories;
    const scaledMeal = {
      ...selectedMeal,
      calories: targetSlotCalories,
      protein: Math.round(selectedMeal.protein * scale),
      carbs: Math.round(selectedMeal.carbs * scale),
      fat: Math.round(selectedMeal.fat * scale),
    };

    usedMealNames.add(selectedMeal.name);
    return scaledMeal;
  });
};

// ========== END MEAL DATABASE + PLAN GENERATOR ==========

// Recipe Book Modal Component
function RecipeBook({ mealPlan, recipes, dark, page, setPage, flipping, setFlipping, onClose }) {
  const allRecipes = [
    ...(mealPlan || []).map(meal => ({
      id: meal.name, title: meal.name, calories: meal.calories,
      protein: meal.protein, carbs: meal.carbs, fat: meal.fat,
      ingredients: meal.ingredients || [], instructions: meal.instructions || [],
      source: 'meal-plan'
    })),
    ...(recipes || []).map(r => ({ ...r, source: 'saved' }))
  ].filter((r, i, arr) => arr.findIndex(x => x.title === r.title) === i);

  const recipe = allRecipes[page] || null;
  const total = allRecipes.length;

  const flipTo = (dir) => {
    if (dir === 'forward' && page >= total - 1) return;
    if (dir === 'back' && page <= 0) return;
    setFlipping(dir);
    setTimeout(() => {
      setPage(p => dir === 'forward' ? p + 1 : p - 1);
      setFlipping(null);
    }, 350);
  };

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px',background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)'}}>
      <style>{`@keyframes flipF{0%{transform:rotateY(0);opacity:1}50%{transform:rotateY(-90deg);opacity:0}100%{transform:rotateY(0);opacity:1}}@keyframes flipB{0%{transform:rotateY(0);opacity:1}50%{transform:rotateY(90deg);opacity:0}100%{transform:rotateY(0);opacity:1}}.flipF{animation:flipF 0.35s ease-in-out}.flipB{animation:flipB 0.35s ease-in-out}`}</style>
      <div style={{width:'100%',maxWidth:'680px',maxHeight:'90vh',display:'flex',flexDirection:'column',background:dark?'#1e1b14':'#fef9f0',border:'3px solid #d97706',borderRadius:'16px',overflow:'hidden',boxShadow:'0 25px 60px rgba(0,0,0,0.5)'}} className={flipping==='forward'?'flipF':flipping==='back'?'flipB':''}>
        {/* Header */}
        <div style={{background:'linear-gradient(135deg,#d97706,#92400e)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <span style={{fontSize:'22px'}}>📖</span>
            <div>
              <div style={{color:'#fef3c7',fontWeight:'800',fontSize:'16px'}}>PLATO RECIPE BOOK</div>
              <div style={{color:'#fde68a',fontSize:'11px'}}>{total === 0 ? 'No recipes yet' : `Recipe ${page+1} of ${total}`}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:'rgba(0,0,0,0.25)',border:'none',color:'#fef3c7',borderRadius:'8px',width:'32px',height:'32px',fontSize:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>

        {/* Body */}
        {total === 0 ? (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px',textAlign:'center'}}>
            <div style={{fontSize:'60px',marginBottom:'16px'}}>📭</div>
            <h3 style={{color:dark?'#fef3c7':'#92400e',fontWeight:'700',fontSize:'20px',marginBottom:'8px'}}>No recipes yet</h3>
            <p style={{color:dark?'#d97706':'#b45309',fontSize:'14px'}}>Generate a meal plan to fill your recipe book!</p>
          </div>
        ) : (
          <div style={{display:'flex',flex:1,minHeight:0,overflow:'hidden'}}>
            {/* Left page */}
            <div style={{flex:'0 0 44%',borderRight:`2px solid ${dark?'#78350f':'#fcd34d'}`,display:'flex',flexDirection:'column',overflow:'hidden'}}>
              <RecipeBookImage recipeName={recipe?.title} dark={dark} />
              <div style={{padding:'14px',overflowY:'auto'}}>
                <h2 style={{color:dark?'#fef3c7':'#78350f',fontWeight:'800',fontSize:'15px',lineHeight:'1.3',marginBottom:'12px'}}>{recipe?.title}</h2>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                  {[{l:'Calories',v:recipe?.calories,u:'kcal',c:'#f97316'},{l:'Protein',v:recipe?.protein,u:'g',c:'#3b82f6'},{l:'Carbs',v:recipe?.carbs,u:'g',c:'#22c55e'},{l:'Fat',v:recipe?.fat,u:'g',c:'#eab308'}].map(m=>(
                    <div key={m.l} style={{background:dark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',borderRadius:'8px',padding:'8px',textAlign:'center',border:`1px solid ${m.c}44`}}>
                      <div style={{color:m.c,fontWeight:'800',fontSize:'17px'}}>{m.v}</div>
                      <div style={{color:dark?'#d97706':'#92400e',fontSize:'9px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.5px'}}>{m.l}</div>
                      <div style={{color:dark?'#a16207':'#b45309',fontSize:'9px'}}>{m.u}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Right page */}
            <div style={{flex:1,overflowY:'auto',padding:'14px',position:'relative'}}>
              <div style={{position:'absolute',inset:0,backgroundImage:`repeating-linear-gradient(to bottom,transparent,transparent 31px,${dark?'rgba(217,119,6,0.07)':'rgba(217,119,6,0.13)'} 31px,${dark?'rgba(217,119,6,0.07)':'rgba(217,119,6,0.13)'} 32px)`,pointerEvents:'none'}}/>
              <div style={{position:'relative'}}>
                <h3 style={{color:'#d97706',fontWeight:'800',fontSize:'12px',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px',borderBottom:'1px solid #d97706',paddingBottom:'4px'}}>Ingredients</h3>
                <ul style={{marginBottom:'16px',listStyle:'none',padding:0}}>
                  {(recipe?.ingredients||[]).map((ing,i)=>(
                    <li key={i} style={{display:'flex',gap:'6px',marginBottom:'4px',fontSize:'12px',color:dark?'#fef3c7':'#44200e'}}>
                      <span style={{color:'#d97706',fontWeight:'700',flexShrink:0}}>·</span>{ing}
                    </li>
                  ))}
                  {(!recipe?.ingredients||recipe.ingredients.length===0)&&<li style={{color:dark?'#a16207':'#b45309',fontSize:'11px',fontStyle:'italic'}}>No ingredients listed</li>}
                </ul>
                <h3 style={{color:'#d97706',fontWeight:'800',fontSize:'12px',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px',borderBottom:'1px solid #d97706',paddingBottom:'4px'}}>Instructions</h3>
                <ol style={{listStyle:'none',padding:0}}>
                  {(recipe?.instructions||[]).map((step,i)=>(
                    <li key={i} style={{display:'flex',gap:'8px',marginBottom:'8px',fontSize:'12px',color:dark?'#fef3c7':'#44200e'}}>
                      <span style={{background:'#d97706',color:'white',fontWeight:'800',fontSize:'10px',minWidth:'18px',height:'18px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:'1px'}}>{i+1}</span>
                      {step}
                    </li>
                  ))}
                  {(!recipe?.instructions||recipe.instructions.length===0)&&<li style={{color:dark?'#a16207':'#b45309',fontSize:'11px',fontStyle:'italic'}}>No instructions listed</li>}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div style={{background:dark?'#292015':'#fef3c7',borderTop:`2px solid ${dark?'#78350f':'#fcd34d'}`,padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <button onClick={()=>flipTo('back')} disabled={page===0||total===0} style={{background:page===0?'rgba(0,0,0,0.1)':'#d97706',color:page===0?(dark?'#78350f':'#a16207'):'white',border:'none',borderRadius:'8px',padding:'7px 14px',fontWeight:'700',fontSize:'12px',cursor:page===0?'not-allowed':'pointer'}}>← Prev</button>
          <div style={{display:'flex',gap:'5px',alignItems:'center'}}>
            {total<=12?Array.from({length:total}).map((_,i)=>(<button key={i} onClick={()=>setPage(i)} style={{width:i===page?'18px':'7px',height:'7px',borderRadius:'4px',background:i===page?'#d97706':'#fcd34d',border:'none',cursor:'pointer',transition:'all 0.2s'}}/>)):(<span style={{color:dark?'#d97706':'#92400e',fontSize:'12px',fontWeight:'600'}}>{page+1}/{total}</span>)}
          </div>
          <button onClick={()=>flipTo('forward')} disabled={page>=total-1||total===0} style={{background:page>=total-1?'rgba(0,0,0,0.1)':'#d97706',color:page>=total-1?(dark?'#78350f':'#a16207'):'white',border:'none',borderRadius:'8px',padding:'7px 14px',fontWeight:'700',fontSize:'12px',cursor:page>=total-1?'not-allowed':'pointer'}}>Next →</button>
        </div>
      </div>
    </div>
  );
}

// Meal card image component - fetches real food photo from TheMealDB with gradient fallback
// Curated food photo lookup — direct Unsplash photo IDs, no API key needed
const FOOD_PHOTOS = {
  chicken:   'photo-1532550907401-a500c9a57435',
  salmon:    'photo-1467003909585-2f8a72700288',
  fish:      'photo-1467003909585-2f8a72700288',
  tuna:      'photo-1599084993091-1cb5c0721cc6',
  shrimp:    'photo-1565680018434-b513d5e5fd47',
  beef:      'photo-1546833999-b9f581a1996d',
  steak:     'photo-1546833999-b9f581a1996d',
  turkey:    'photo-1574672280600-4accfa5b6f98',
  pork:      'photo-1529692236671-f1f6cf9683ba',
  egg:       'photo-1482049016688-2d3e1b311543',
  eggs:      'photo-1482049016688-2d3e1b311543',
  oatmeal:   'photo-1517673132405-a56a62b18caf',
  oats:      'photo-1517673132405-a56a62b18caf',
  pasta:     'photo-1551892374-ecf8754cf8b0',
  rice:      'photo-1536304993881-ff86d42818e0',
  quinoa:    'photo-1512621776951-a57141f2eefd',
  salad:     'photo-1512621776951-a57141f2eefd',
  soup:      'photo-1547592180-85f173990554',
  stir:      'photo-1512058454905-6b841e7ad132',
  bowl:      'photo-1546069901-ba9599a7e63c',
  smoothie:  'photo-1505252585461-04db1eb84625',
  shake:     'photo-1563729784474-d77dbb933a9e',
  pancake:   'photo-1567620905732-2d1ec7ab7445',
  waffle:    'photo-1484723091739-30a097e8f929',
  toast:     'photo-1528736235302-52922df5c122',
  sandwich:  'photo-1528736235302-52922df5c122',
  wrap:      'photo-1565299507177-b0ac66763828',
  burger:    'photo-1568901346375-23c9450c58cd',
  pizza:     'photo-1513104890138-7c749659a591',
  tacos:     'photo-1565299585323-38d6b0865b47',
  sushi:     'photo-1579871494447-9811cf80d66c',
  veggie:    'photo-1540420773420-3366772f4999',
  vegetable: 'photo-1540420773420-3366772f4999',
  fruit:     'photo-1490474418585-ba9bad8fd0ea',
  yogurt:    'photo-1488477181946-6428a0291777',
  cottage:   'photo-1563636619-e9143da7973b',
  bread:     'photo-1509440159596-0249088772ff',
  lentil:    'photo-1547592180-85f173990554',
  bean:      'photo-1512621776951-a57141f2eefd',
  tofu:      'photo-1546069901-ba9599a7e63c',
  avocado:   'photo-1512621776951-a57141f2eefd',
  sweet:     'photo-1518977676601-b53f82aba655',
  potato:    'photo-1518977676601-b53f82aba655',
  broccoli:  'photo-1459411621453-7b03977f4bfc',
  default:   'photo-1546069901-ba9599a7e63c',
};

function getMealPhoto(mealName) {
  if (!mealName) return FOOD_PHOTOS.default;
  const lower = mealName.toLowerCase();
  for (const [key, id] of Object.entries(FOOD_PHOTOS)) {
    if (key !== 'default' && lower.includes(key)) return id;
  }
  return FOOD_PHOTOS.default;
}

function MealCardImage({ mealName }) {
  const [imgSrc, setImgSrc] = React.useState(null);
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    if (!mealName) return;
    setImgSrc(null); setImgLoaded(false); setImgError(false);

    // Step 1: Try TheMealDB (works for common/traditional meals)
    const shortName = mealName.split(' ').slice(0,2).join(' ');
    fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(shortName))
      .then(r => r.json())
      .then(data => {
        if (data.meals && data.meals[0]?.strMealThumb) {
          setImgSrc(data.meals[0].strMealThumb);
        } else {
          // Step 2: Curated Unsplash photo by food keyword
          const photoId = getMealPhoto(mealName);
          setImgSrc(`https://images.unsplash.com/${photoId}?w=480&q=80&fit=crop`);
        }
      })
      .catch(() => {
        const photoId = getMealPhoto(mealName);
        setImgSrc(`https://images.unsplash.com/${photoId}?w=480&q=80&fit=crop`);
      });
  }, [mealName]);

  const colors = [
    ['#10d9a0','#059669'],['#6366f1','#4f46e5'],['#f59e0b','#d97706'],
    ['#ef4444','#dc2626'],['#3b82f6','#2563eb'],['#8b5cf6','#7c3aed'],
  ];
  const colorPair = colors[(mealName ? mealName.charCodeAt(0) : 0) % colors.length];

  return (
    <div style={{ position:'relative', width:'100%', height:'180px', overflow:'hidden', borderRadius:'12px 12px 0 0', flexShrink:0 }}>
      {/* Gradient always behind as fallback */}
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontSize:'52px', opacity:0.25 }}>&#127860;</span>
      </div>
      {/* Real photo fades in on load */}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={mealName}
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(false); }}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: imgLoaded && !imgError ? 1 : 0, transition:'opacity 0.5s ease' }}
        />
      )}
      {/* Bottom gradient for text readability */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'70px', background:'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }} />
    </div>
  );
}

// Recipe Book image component - fetches from TheMealDB then Unsplash fallback
function RecipeBookImage({ recipeName, dark }) {
  const [src, setSrc] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  React.useEffect(() => {
    setSrc(null); setLoaded(false);
    if (!recipeName) return;
    const name = recipeName.split(' ').slice(0, 3).join(' ');
    fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(name))
      .then(r => r.json())
      .then(data => {
        if (data.meals && data.meals[0] && data.meals[0].strMealThumb) {
          setSrc(data.meals[0].strMealThumb + '/preview');
        } else {
          setSrc('https://source.unsplash.com/400x280/?' + encodeURIComponent(name + ',food,meal'));
        }
      })
      .catch(() => setSrc('https://source.unsplash.com/400x280/?healthy,food'));
  }, [recipeName]);
  return (
    <div style={{width:'100%', height:'180px', background: dark ? '#292015' : '#fef3c7', position:'relative', overflow:'hidden', flexShrink:0}}>
      {src ? (
        <img
          src={src}
          alt={recipeName}
          style={{width:'100%', height:'100%', objectFit:'cover', opacity: loaded ? 1 : 0, transition:'opacity 0.4s'}}
          onLoad={() => setLoaded(true)}
          onError={() => setSrc('https://source.unsplash.com/400x280/?food,healthy,meal')}
        />
      ) : null}
      {!loaded && (
        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'8px'}}>
          <span style={{fontSize:'40px'}}>🍽️</span>
          <span style={{color:'#d97706', fontSize:'11px', fontWeight:'600'}}>Loading photo...</span>
        </div>
      )}
      {/* Gradient overlay for text legibility */}
      <div style={{position:'absolute', bottom:0, left:0, right:0, height:'60px', background:'linear-gradient(to top, rgba(0,0,0,0.5), transparent)'}} />
    </div>
  );
}

export default function App() {
  // ========== API CONFIGURATION ==========
  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem('plato_api_config');
    return saved ? JSON.parse(saved) : {
      IMAGE_PROVIDER: 'svg',
      USE_DEMO_MODE: true,
      UNSPLASH_ACCESS_KEY: '',
      SPOONACULAR_API_KEY: '',
      ANTHROPIC_API_KEY: '',
      RAPIDAPI_KEY: ''
    };
  });
  
  const [showAPISettings, setShowAPISettings] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('plato_api_config', JSON.stringify(apiConfig));
  }, [apiConfig]);
  // ========== END API CONFIGURATION ==========
  
  // Inject styles via useEffect instead of style tag
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
      
      * {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .tabular-nums { font-variant-numeric: tabular-nums; }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes wave {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(100px); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-12px); }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes scan {
        0% { top: 0; }
        50% { top: 100%; }
        100% { top: 0; }
      }
      
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
      
      @keyframes gradientShift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
      .animate-slideIn { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-wave { animation: wave 20s ease-in-out infinite; }
      .animate-pulse { animation: pulse 4s ease-in-out infinite; }
      .animate-scan { animation: scan 2s ease-in-out infinite; }
      .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
      .animate-gradientShift { 
        background-size: 200% 200%;
        animation: gradientShift 8s ease infinite;
      }
      
      .shimmer-effect {
        position: relative;
        overflow: hidden;
      }
      
      .shimmer-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        animation: shimmer 3s infinite;
      }
      
      .progress-ring { 
        transition: stroke-dashoffset 1000ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .btn-press { 
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      .btn-press:active:not(:disabled) { 
        transform: scale(0.97);
      }
      
      .glass { 
        background: rgba(255, 255, 255, 0.85); 
        backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8);
      }
      
      .glass-dark { 
        background: rgba(10, 15, 30, 0.85); 
        backdrop-filter: blur(24px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
      }
      
      .gradient-mesh {
        background: 
          radial-gradient(at 0% 0%, rgba(16, 217, 160, 0.12) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(99, 102, 241, 0.12) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(16, 217, 160, 0.08) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(99, 102, 241, 0.08) 0px, transparent 50%);
      }
      
      .shadow-premium { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25); }
      .shadow-premium-lg { box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35); }
      .shadow-premium-xl { box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45); }

      .gradient-text {
        background: linear-gradient(135deg, #10d9a0, #6366f1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .stat-num {
        font-weight: 900;
        letter-spacing: -1px;
        font-variant-numeric: tabular-nums;
        background: linear-gradient(135deg, #10d9a0, #6eb4f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .section-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.5px;
      }
    `;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [step, setStep] = useState('welcome');
  const [name, setName] = useState('');
  const [plan, setPlan] = useState(null);
  const [form, setForm] = useState({
    gender:'male',
    age:30,
    birthday: '', // YYYY-MM-DD format
    height:68, // Total inches
    weight:160,
    activity:'moderate',
    goals:'maintenance', // Legacy field (kept for backward compat)
    primaryGoal: 'maintain', // NEW: Energy direction
    secondaryGoals: [], // NEW: Multi-select emphasis areas
    meals:3,
    dessert:false,
    allergies:'',
    restrictions:'',
    cuisines:[],
    cookTime:'any',
    lifestyle:'balanced',
    foodComplexity:'balanced',
    trainingType:'hybrid',
    dietStyle:'balanced',
    targetRate:'moderate',
    trainingDays:3
  });
  
  // ========== PROFILE/PLAN SEPARATION (ADDITIVE) ==========
  // UserProfile: Persistent, global demographic data (collected once in onboarding)
  const [userProfile, setUserProfile] = useState({
    gender: 'male',
    age: 30,
    birthday: '', // YYYY-MM-DD format
    height: 68, // inches
    weight: 160 // lbs
  });
  
  // PlanConfig: Per-plan settings (versioned, can have multiple)
  const [planConfig, setPlanConfig] = useState({
    activity: 'moderate',
    trainingType: 'hybrid',
    goals: 'maintenance', // Legacy field
    primaryGoal: 'maintain', // NEW: Energy direction
    secondaryGoals: [], // NEW: Multi-select emphasis
    targetRate: 'moderate',
    trainingDays: 3,
    meals: 3,
    allergies: '',
    restrictions: '',
    cookTime: 'any',
    dietStyle: 'balanced',
    cuisines: []
  });
  
  // Create New Plan flow state
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [createPlanStep, setCreatePlanStep] = useState(1); // 1=training, 2=meals
  const [tempPlanConfig, setTempPlanConfig] = useState({
    activity: 'moderate',
    trainingType: 'hybrid',
    goals: 'maintenance', // Legacy field
    primaryGoal: 'maintain', // NEW
    secondaryGoals: [], // NEW
    targetRate: 'moderate',
    trainingDays: 3,
    meals: 3,
    allergies: '',
    restrictions: '',
    cookTime: 'any',
    dietStyle: 'balanced',
    cuisines: []
  }); // Temporary during creation
  
  // Profile editing
  const [showEditProfile, setShowEditProfile] = useState(false);
  // ========== END PROFILE/PLAN SEPARATION ==========
  
  // ========== MULTI-GOAL MODEL (ADDITIVE - Logic Fix) ==========
  /**
   * New goal structure:
   * - primaryGoal: Energy direction (lose/maintain/gain) - REQUIRED, single-select
   * - secondaryGoals: Emphasis areas (muscle/performance/endurance/recovery/health) - OPTIONAL, multi-select
   * - targetRate: Pace constrained by primary + secondary
   * 
   * This prevents logical contradictions like "lose fat at aggressive pace while building muscle"
   */
  
  /**
   * Migration map: Old goal format -> New two-layer format
   */
  const GOAL_MIGRATION_MAP = {
    'fat-loss': { primaryGoal: 'lose', secondaryGoals: [] },
    'maintenance': { primaryGoal: 'maintain', secondaryGoals: [] },
    'lean-bulk': { primaryGoal: 'gain', secondaryGoals: ['build-muscle'] },
    'performance': { primaryGoal: 'maintain', secondaryGoals: ['improve-performance'] },
    
    // Legacy variants
    'lose': { primaryGoal: 'lose', secondaryGoals: [] },
    'maintain': { primaryGoal: 'maintain', secondaryGoals: [] },
    'gain': { primaryGoal: 'gain', secondaryGoals: [] },
    'muscle': { primaryGoal: 'gain', secondaryGoals: ['build-muscle'] },
    'bulk': { primaryGoal: 'gain', secondaryGoals: ['build-muscle'] }
  };
  
  /**
   * Migrate old goal format to new two-layer format
   * Called once on app load and whenever old format is detected
   */
  const migrateGoalFormat = (oldGoal) => {
    if (!oldGoal || typeof oldGoal !== 'string') {
      // Default to maintenance
      return { primaryGoal: 'maintain', secondaryGoals: [] };
    }
    
    // Check if already new format (has primaryGoal)
    if (typeof oldGoal === 'object' && oldGoal.primaryGoal) {
      return oldGoal;
    }
    
    // Migrate from old format
    const migrated = GOAL_MIGRATION_MAP[oldGoal] || { primaryGoal: 'maintain', secondaryGoals: [] };
    
    return migrated;
  };
  
  /**
   * Get valid target rate options based on primary goal and secondary goals
   * Returns array of valid rate options, -ally filtered
   */
  const getValidTargetRates = (primaryGoal, secondaryGoals = []) => {
    // Maintain weight: No pace selector needed
    if (primaryGoal === 'maintain') {
      return null; // Hide pace selector entirely
    }
    
    const hasBuildMuscle = secondaryGoals.includes('build-muscle');
    const hasPerformance = secondaryGoals.includes('improve-performance');
    
    // DEBUG LOG
    console.log('getValidTargetRates:', { primaryGoal, secondaryGoals, hasBuildMuscle, hasPerformance });
    
    if (primaryGoal === 'lose') {
      // Losing fat
      const rates = [
        { value: 'slow', label: 'Slow', desc: '0.5 lb/week', recommended: hasBuildMuscle },
        { value: 'moderate', label: 'Moderate', desc: '1 lb/week', recommended: !hasBuildMuscle },
        { value: 'aggressive', label: 'Aggressive', desc: '1.5+ lb/week', disabled: hasBuildMuscle }
      ];
      
      // Filter out disabled options
      const filtered = rates.filter(r => !r.disabled);
      console.log('Returning lose rates:', filtered);
      return filtered;
    }
    
    if (primaryGoal === 'gain') {
      // Gaining weight
      const rates = [
        { value: 'lean', label: 'Lean', desc: '0.5 lb/week', recommended: hasBuildMuscle || hasPerformance },
        { value: 'moderate', label: 'Moderate', desc: '1 lb/week', recommended: !hasBuildMuscle && !hasPerformance },
        { value: 'aggressive', label: 'Aggressive', desc: '1.5+ lb/week', disabled: hasPerformance }
      ];
      
      // Filter out disabled options
      const filtered = rates.filter(r => !r.disabled);
      console.log('Returning gain rates:', filtered);
      return filtered;
    }
    
    return [];
  };
  
  /**
   * Validate and constrain target rate based on goals
   * If current rate is invalid for new goal combo, return default
   */
  const getConstrainedTargetRate = (primaryGoal, secondaryGoals, currentRate) => {
    const validRates = getValidTargetRates(primaryGoal, secondaryGoals);
    
    if (!validRates || validRates.length === 0) {
      return 'moderate'; // Default fallback
    }
    
    // Check if current rate is valid
    const isValid = validRates.some(r => r.value === currentRate);
    if (isValid) {
      return currentRate;
    }
    
    // Return recommended rate or first valid option
    const recommended = validRates.find(r => r.recommended);
    return recommended ? recommended.value : validRates[0].value;
  };
  
  /**
   * Apply goal migration to form state on mount
   */
  useEffect(() => {
    // Check if form.goals is old format
    if (form.goals && typeof form.goals === 'string') {
      const migrated = migrateGoalFormat(form.goals);
      setForm(prev => ({
        ...prev,
        primaryGoal: migrated.primaryGoal,
        secondaryGoals: migrated.secondaryGoals,
        // Keep old 'goals' for backward compat initially, will phase out
        goals: migrated.primaryGoal
      }));
    }
    
    // Same for planConfig
    if (planConfig.goals && typeof planConfig.goals === 'string') {
      const migrated = migrateGoalFormat(planConfig.goals);
      setPlanConfig(prev => ({
        ...prev,
        primaryGoal: migrated.primaryGoal,
        secondaryGoals: migrated.secondaryGoals,
        goals: migrated.primaryGoal
      }));
    }
  }, []); // Run once on mount
  // ========== END MULTI-GOAL MODEL ==========
  
  // Initialize userProfile and planConfig from form on mount
  useEffect(() => {
    // Sync demographic data to userProfile (once)
    setUserProfile({
      gender: form.gender,
      age: form.age,
      birthday: form.birthday,
      height: form.height,
      weight: form.weight
    });
    
    // Sync plan settings to planConfig
    setPlanConfig({
      activity: form.activity,
      trainingType: form.trainingType,
      goals: form.goals,
      targetRate: form.targetRate,
      trainingDays: form.trainingDays,
      meals: form.meals,
      allergies: form.allergies,
      restrictions: form.restrictions,
      cookTime: form.cookTime,
      dietStyle: form.dietStyle,
      cuisines: form.cuisines
    });
  }, []); // Run once on mount
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // ========== IMPORT/EXPORT FEATURE (ADDITIVE) ==========
  const [showImportExport, setShowImportExport] = useState(false);
  const [exportMode, setExportMode] = useState(false); // false = main screen, true = export preview
  const [importMode, setImportMode] = useState(false); // false = main screen, true = import flow
  const [importStep, setImportStep] = useState('input'); // 'input', 'reviewing'
  const [importSource, setImportSource] = useState('paste'); // 'paste', 'file'
  const [importText, setImportText] = useState('');
  const [parsedPlan, setParsedPlan] = useState(null); // Parsed import ready for review
  const [exportText, setExportText] = useState('');
  const [showExportOptions, setShowExportOptions] = useState(false);
  // ========== END IMPORT/EXPORT STATES ==========

  // Achievement System
  const [achievements, setAchievements] = useState([
    {id: 'first-plan', name: 'First Steps', desc: 'Generate your first meal plan', icon: '\uD83C\uDFC6', unlocked: false, progress: 0, target: 1},
    {id: 'week-streak', name: 'Week Warrior', desc: 'Track meals for 7 days', icon: '\uD83D\uDD25', unlocked: false, progress: 0, target: 7},
    {id: 'macro-master', name: 'Macro Master', desc: 'Hit your macros 5 times', icon: '\uD83D\uDCAA', unlocked: false, progress: 0, target: 5},
  ]);
  const [showAchievement, setShowAchievement] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  // Meal interactions
  const [swapping, setSwapping] = useState(null);
  const [favs, setFavs] = useState([]);
  const [ratings, setRatings] = useState({});
  const [showMealReplace, setShowMealReplace] = useState(null);
  const [customMeal, setCustomMeal] = useState({name:'', calories:0, protein:0, carbs:0, fat:0});
  const [expandedMeals, setExpandedMeals] = useState({});
  const [replacingMealIndex, setReplacingMealIndex] = useState(null); // Track which meal is being replaced via scan
  
  // Grocery list & saved plans
  const [groceryList, setGroceryList] = useState([]);
  const [showGroceryList, setShowGroceryList] = useState(false);
  
  // ========== GROCERY LIST EXECUTION ENGINE (ADDITIVE) ==========
  const [groceryListFinalized, setGroceryListFinalized] = useState(false); // Live vs Finalized
  const [lastPlanVersion, setLastPlanVersion] = useState(null); // Track plan changes
  const [showPlanChangePrompt, setShowPlanChangePrompt] = useState(false);
  const [showOrderGroceries, setShowOrderGroceries] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('instacart');
  const [groceryExportText, setGroceryExportText] = useState('');
  const [showGroceryExport, setShowGroceryExport] = useState(false);
  // ========== END GROCERY LIST STATES ==========
  
  const [savedPlans, setSavedPlans] = useState([]);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  
  // ========== PLATE SIZE CALIBRATION (for portion estimation) ==========
  const [plateSize, setPlateSize] = useState(() => {
    const saved = localStorage.getItem('plato_plate_size');
    return saved || 'unknown'; // 'small' (9"), 'standard' (10.25"), 'large' (12"), 'unknown'
  });
  
  const [showPlateSizePrompt, setShowPlateSizePrompt] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('plato_plate_size', plateSize);
  }, [plateSize]);
  
  // ========== TRAINING CONTEXT (ADDITIVE - Daily Signal) ==========
  // Lightweight daily training signal for nutrition adjustments
  // Resets automatically each day, no historical tracking
  const [dailyTrainingContext, setDailyTrainingContext] = useState(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('plato_training_context');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reset if it's a new day
      if (parsed.date !== today) {
        return { date: today, trained: false, type: null, intensity: null };
      }
      return parsed;
    }
    return { date: today, trained: false, type: null, intensity: null };
  });
  
  // Persist training context and auto-reset daily
  useEffect(() => {
    const today = new Date().toDateString();
    if (dailyTrainingContext.date !== today) {
      setDailyTrainingContext({ date: today, trained: false, type: null, intensity: null });
      // Reset manual edit flag on new day
      setManualMacroEditToday(false);
      setTrainingAdjustedMeals(new Set());
      setOriginalMealMacros({});
    } else {
      localStorage.setItem('plato_training_context', JSON.stringify(dailyTrainingContext));
    }
  }, [dailyTrainingContext]);
  
  // ========== TRAINING CONTEXT ADJUSTMENTS (ADDITIVE) ==========
  // Track if user manually edited macros today
  const [manualMacroEditToday, setManualMacroEditToday] = useState(false);
  
  // Track which meals have been adjusted by training context
  const [trainingAdjustedMeals, setTrainingAdjustedMeals] = useState(new Set());
  
  // Store original meal macros before training adjustments
  const [originalMealMacros, setOriginalMealMacros] = useState({});
  // ========== END TRAINING CONTEXT ADJUSTMENTS ==========
  // ========== END TRAINING CONTEXT ==========
  
  // Daily nutrition tracking
  const [showDailyTracker, setShowDailyTracker] = useState(false);
  
  // ========== DAILY INTAKE HEADER (ADDITIVE) ==========
  const [macrosExpanded, setMacrosExpanded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 = expanded, 1 = collapsed
  // ========== END DAILY INTAKE HEADER STATES ==========
  const [dailyLog, setDailyLog] = useState({
    date: new Date().toLocaleDateString(),
    meals: [],
    water: 0,
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  });
  const [trackingHistory, setTrackingHistory] = useState([]);
  
  // Scanning feature
  const [showScanning, setShowScanning] = useState(false);
  const [scanMode, setScanMode] = useState(null); // 'barcode' | 'plate' | null
  const [scanResult, setScanResult] = useState(null);
  const [plateResult, setPlateResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [autoAdjustMeals, setAutoAdjustMeals] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Nutrition cache (in-memory for now, will persist to DB later)
  const nutritionCacheRef = useRef(new Map());
  const USDA_API_KEY = 'DEMO_KEY'; // Free tier: 30 requests/hour, 50/day - Replace with your key from https://fdc.nal.usda.gov/api-key-signup.html
  
  // Adaptive system
  const [weighIns, setWeighIns] = useState([]);
  const [editingWeighIn, setEditingWeighIn] = useState(null); // For editing existing entries
  const [showWeighInModal, setShowWeighInModal] = useState(false);
  const [newWeighIn, setNewWeighIn] = useState({ weight: '', note: '' });
  const [adaptiveRecommendation, setAdaptiveRecommendation] = useState(null);
  const [baselineTDEE, setBaselineTDEE] = useState(null);
  const [actualTDEE, setActualTDEE] = useState(null);
  
  // ========== WEIGHT TRACKING (ADDITIVE) ==========
  const [showWeightTracking, setShowWeightTracking] = useState(false);
  const [weightTrackingTimeRange, setWeightTrackingTimeRange] = useState('30'); // '7', '30', '90', 'all'
  // ========== END WEIGHT TRACKING ==========
  
  // ========== RECIPES FEATURE (ADDITIVE) ==========
  const [recipes, setRecipes] = useState([]);
  const [recipeFavorites, setRecipeFavorites] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [showRecipeSearch, setShowRecipeSearch] = useState(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [recipeSearchResults, setRecipeSearchResults] = useState([]);
  const [recipeSearchLoading, setRecipeSearchLoading] = useState(false);
  
  // ========== USE INGREDIENTS FEATURE (ADDITIVE) ==========
  const [showUseIngredients, setShowUseIngredients] = useState(false);
  const [ingredientFlowStep, setIngredientFlowStep] = useState(1); // 1=input, 2=review, 3=results
  const [selectedImages, setSelectedImages] = useState([]); // Max 8
  const [manualIngredients, setManualIngredients] = useState([]);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [confirmedIngredients, setConfirmedIngredients] = useState([]);
  const [excludedIngredients, setExcludedIngredients] = useState([]);
  const [showExcludeSection, setShowExcludeSection] = useState(false); // PART 2: Toggle for exclude section
  const [ingredientOptions, setIngredientOptions] = useState({
    preferQuick: false,
    preferHighProtein: false,
    allowPantryStaples: true
  });
  const [ingredientRecipeSuggestions, setIngredientRecipeSuggestions] = useState([]);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [selectedIngredientRecipe, setSelectedIngredientRecipe] = useState(null);
  const [currentIngredientInput, setCurrentIngredientInput] = useState('');
  const [currentExcludeInput, setCurrentExcludeInput] = useState(''); // PART 2: Separate input for exclude
  
  // PART 1: Ingredient Input & Normalization
  /**
   * Normalize a single ingredient string
   * - Lowercase
   * - Trim whitespace
   * - Basic singularization (remove trailing 's' for common cases)
   */
  const normalizeIngredient = (ingredient) => {
    if (!ingredient || typeof ingredient !== 'string') return '';
    
    let normalized = ingredient.toLowerCase().trim();
    
    // Remove quantities and common units
    normalized = normalized.replace(/^\d+(\.\d+)?\s*(oz|g|kg|lb|lbs|cup|cups|tbsp|tsp|tablespoon|tablespoons|teaspoon|teaspoons)?\s*/i, '');
    
    // Basic singularization - remove trailing 's' if it makes sense
    // Exceptions: words that should stay plural or end in 'ss', 'us', etc.
    const pluralExceptions = ['lettuce', 'swiss', 'grass', 'moss', 'brussels', 'lentils', 'oats', 'grits'];
    const shouldSingularize = !pluralExceptions.some(ex => normalized.includes(ex));
    
    if (shouldSingularize && normalized.endsWith('s') && !normalized.endsWith('ss') && normalized.length > 3) {
      // Check if it's likely a plural (e.g., "tomatoes" -> "tomato", "peppers" -> "pepper")
      if (normalized.endsWith('ies')) {
        normalized = normalized.slice(0, -3) + 'y'; // berries -> berry
      } else if (normalized.endsWith('oes')) {
        normalized = normalized.slice(0, -2); // tomatoes -> tomato
      } else {
        normalized = normalized.slice(0, -1); // peppers -> pepper
      }
    }
    
    return normalized;
  };
  
  /**
   * Parse ingredient input (comma-separated or line-separated)
   * Returns array of normalized, deduplicated ingredients
   */
  const parseIngredientInput = (input) => {
    if (!input) return [];
    
    // Split by commas or newlines
    const raw = input.split(/[,\n]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    // Normalize each ingredient
    const normalized = raw.map(normalizeIngredient).filter(s => s.length > 0);
    
    // Deduplicate
    return [...new Set(normalized)];
  };
  
  /**
   * Add ingredient(s) from text input
   */
  const addIngredientsFromInput = (input, isExclude = false) => {
    const newIngredients = parseIngredientInput(input);
    
    if (newIngredients.length === 0) return;
    
    if (isExclude) {
      // Add to exclude list, remove duplicates
      const combined = [...excludedIngredients, ...newIngredients];
      setExcludedIngredients([...new Set(combined)]);
      // Clear exclude input
      setCurrentExcludeInput('');
    } else {
      // Add to include list, remove duplicates
      const combined = [...confirmedIngredients, ...newIngredients];
      setConfirmedIngredients([...new Set(combined)]);
      // Clear include input
      setCurrentIngredientInput('');
    }
  };
  
  /**
   * Remove ingredient chip
   */
  const removeIngredient = (ingredient, isExclude = false) => {
    if (isExclude) {
      setExcludedIngredients(excludedIngredients.filter(i => i !== ingredient));
    } else {
      setConfirmedIngredients(confirmedIngredients.filter(i => i !== ingredient));
    }
  };
  
  /**
   * Handle Enter key in ingredient input
   */
  const handleIngredientKeyPress = (e, isExclude = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredientsFromInput(currentIngredientInput, isExclude);
    }
  };
  
  // Saved Recipes & Favorites Modal States
  const [showSavedRecipes, setShowSavedRecipes] = useState(false);
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [recipeBookPage, setRecipeBookPage] = useState(0);
  const [recipeBookFlipping, setRecipeBookFlipping] = useState(null); // 'forward' | 'back' | null
  const [showFavoriteMeals, setShowFavoriteMeals] = useState(false);
  
  // ========== INSIGHT & INTENT FEATURES (ADDITIVE) ==========
  const [showMealAnalysis, setShowMealAnalysis] = useState(false); // User preference
  const [showFutureYou, setShowFutureYou] = useState(false);
  
  // ========== RECIPE FILTERS & DISCOVERY (ADDITIVE) ==========
  const [showFilters, setShowFilters] = useState(false);
  const [recipeFilters, setRecipeFilters] = useState({
    category: null,
    macroFocus: null,
    cuisine: [],
    includeIngredients: [],
    excludeIngredients: [],
    advanced: {
      maxTime: null,
      equipment: [],
      diet: []
    }
  });
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // ========== END RECIPE FILTERS & DISCOVERY ==========
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeInReview, setRecipeInReview] = useState(null);
  const [showAddToPlanModal, setShowAddToPlanModal] = useState(false);
  const [addToPlanRecipe, setAddToPlanRecipe] = useState(null);
  const [addToPlanConfig, setAddToPlanConfig] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    meal: 'lunch', 
    servings: 1 
  });
  const [showYouTubeImport, setShowYouTubeImport] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeImportLoading, setYoutubeImportLoading] = useState(false);
  const [youtubeTranscript, setYoutubeTranscript] = useState('');
  
  // ========== MEAL IMAGES FEATURE (ADDITIVE) ==========
  const [showMealImages, setShowMealImages] = useState(true); // User setting
  const [mealImages, setMealImages] = useState({}); // {mealKey: {url, status, createdAt}}
  // ========== END MEAL IMAGES FEATURE ==========
  
  // ========== END RECIPES FEATURE ==========
  
  // Advanced mode
  const [advancedMode, setAdvancedMode] = useState(false);
  const [showMacroBands, setShowMacroBands] = useState(false);
  
  // ========== DAILY INTAKE SUMMARY VISIBILITY (ADDITIVE) ==========
  const [showDailyIntakeSummary, setShowDailyIntakeSummary] = useState(() => {
    // Default ON for users with nutrition mode
    const saved = localStorage.getItem('plato_show_daily_intake_summary');
    if (saved !== null) return saved === 'true';
    return true; // Default ON
  });
  // ========== END DAILY INTAKE SUMMARY VISIBILITY ==========
  
  const [hasSeenAdvancedExplanation, setHasSeenAdvancedExplanation] = useState(() => {
    return localStorage.getItem('plato_seen_advanced_explanation') === 'true';
  });
  const [showAdvancedExplanation, setShowAdvancedExplanation] = useState(false);
  
  // ========== NUTRITION INTELLIGENCE SYSTEM (ADDITIVE) ==========
  const [nutrientIntent, setNutrientIntent] = useState(null); // User's optional nutrition focus
  const [showSmartSwap, setShowSmartSwap] = useState(false);
  const [swapMealIndex, setSwapMealIndex] = useState(null);
  const [swapIntent, setSwapIntent] = useState(null);
  const [showWeeklyInsights, setShowWeeklyInsights] = useState(false);
  const [weeklyNutritionData, setWeeklyNutritionData] = useState([]);
  // ========== END NUTRITION INTELLIGENCE SYSTEM ==========
  
  // ========== MICRONUTRIENT ANALYSIS (ADDITIVE, ADVANCED MODE ONLY) ==========
  const [expandedMealMicros, setExpandedMealMicros] = useState({}); // { mealIndex: true/false }
  const [showDailyMicroSummary, setShowDailyMicroSummary] = useState(false);
  const [dailyMicroData, setDailyMicroData] = useState(null); // Calculated on demand
  const [expandedMicronutrients, setExpandedMicronutrients] = useState({}); // { nutrient: true/false } for detail expansion
  // ========== END MICRONUTRIENT ANALYSIS ==========
  
  // ========== NUTRIENT SUPPORT SUGGESTIONS (ADDITIVE) ==========
  const [showNutrientSupport, setShowNutrientSupport] = useState(false);
  const [nutrientSupportTimeRange, setNutrientSupportTimeRange] = useState(14); // 7 or 14 days
  const [expandedNutrients, setExpandedNutrients] = useState({}); // { nutrient: true/false }
  const [expandedSupplements, setExpandedSupplements] = useState({}); // { nutrient: true/false }
  const [showPerformanceSupplements, setShowPerformanceSupplements] = useState(false);
  // ========== END NUTRIENT SUPPORT SUGGESTIONS ==========
  
  // Onboarding phases
  const [onboardingPhase, setOnboardingPhase] = useState(1); // 1, 2, or 3
  
  // Height in separate units for better UX
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(8);
  const [useMetric, setUseMetric] = useState(false);
  
  // Intent-aware flow (NEW)
  const [userIntent, setUserIntent] = useState(null); // 'meals' | 'nutrition' | 'both' | null
  const [showNutritionDetails, setShowNutritionDetails] = useState(false); // Collapsed by default for meal-only intent
  
  // Meal states (NEW)
  const [mealStates, setMealStates] = useState({}); // { mealId: 'planned' | 'skipped' | 'ate-other' }
  
  // AI Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {role: 'assistant', content: 'Hi! I\'m Plato, your AI nutrition coach. Ask me anything about your meal plan, nutrition, or fitness goals!'}
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, {id, message, type}]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };
  
  // Calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  
  // Toggle Daily Intake Summary visibility
  const toggleDailyIntakeSummary = (value) => {
    setShowDailyIntakeSummary(value);
    localStorage.setItem('plato_show_daily_intake_summary', value.toString());
    showToast('Updated', 'success');
  };

  // Scroll listener for smooth header interpolation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Start collapsing after 20px, fully collapsed by 120px (100px transition range)
      const startCollapse = 20;
      const endCollapse = 120;
      const range = endCollapse - startCollapse;
      
      let progress = 0;
      if (scrollY <= startCollapse) {
        progress = 0; // Fully expanded
      } else if (scrollY >= endCollapse) {
        progress = 1; // Fully collapsed
      } else {
        // Interpolate between 0 and 1
        progress = (scrollY - startCollapse) / range;
      }
      
      setScrollProgress(progress);
      
      // Auto-collapse macros when starting to scroll
      if (progress > 0.1 && macrosExpanded) {
        setMacrosExpanded(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [macrosExpanded]);

  // ========== CALCULATION ENGINE ==========
  
  // Calculate BMR using Mifflin-St Jeor equation
  const calculateBMR = (sex, weight, height, age) => {
    // Convert to metric if needed
    const weightKg = weight * 0.453592; // lbs to kg
    const heightCm = height * 2.54; // inches to cm
    
    if (sex === 'male') {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
  };
  
  // Calculate TDEE from BMR and activity level
  const calculateTDEE = (bmr, activityLevel) => {
    const multipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'very-active': 1.725,
      'athlete': 1.9
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.55));
  };
  
  // Apply goal adjustment to TDEE (UPDATED for two-layer goal system)
  const applyGoalAdjustment = (tdee, primaryGoal, secondaryGoals, targetRate) => {
    // Primary goal determines energy direction
    const baseAdjustments = {
      'lose': { slow: -250, moderate: -500, aggressive: -750 },
      'maintain': { slow: 0, moderate: 0, aggressive: 0 },
      'gain': { lean: 250, moderate: 375, aggressive: 500 }
    };
    
    // Get base adjustment from primary goal
    let adjustment = baseAdjustments[primaryGoal]?.[targetRate] || 0;
    
    // Secondary goals can modify the magnitude (but not direction)
    if (secondaryGoals && secondaryGoals.length > 0) {
      // Build muscle during fat loss = smaller deficit for muscle retention
      if (primaryGoal === 'lose' && secondaryGoals.includes('build-muscle')) {
        adjustment = Math.max(adjustment, -500); // Cap at -500 cal deficit
      }
      
      // Performance during gain = lean gains to avoid excess fat
      if (primaryGoal === 'gain' && secondaryGoals.includes('improve-performance')) {
        adjustment = Math.min(adjustment, 375); // Cap at +375 cal surplus
      }
      
      // Endurance emphasis = slightly higher calories
      if (secondaryGoals.includes('improve-endurance')) {
        adjustment += 50; // Extra energy for endurance work
      }
    }
    
    return Math.round(tdee + adjustment);
  };
  
  // Calculate macro split based on training type, diet style, and secondary goals
  const calculateMacros = (calories, trainingType, dietStyle, weight, secondaryGoals = []) => {
    // Base protein multipliers from training type
    const proteinMultipliers = {
      'strength': 1.2,
      'cardio': 0.8,
      'hybrid': 1.0,
      'sport': 1.1
    };
    
    let proteinMultiplier = proteinMultipliers[trainingType] || 1.0;
    
    // Secondary goals modify protein floor
    if (secondaryGoals.includes('build-muscle')) {
      proteinMultiplier = Math.max(proteinMultiplier, 1.2); // Ensure high protein
    }
    
    const proteinGrams = Math.round(weight * proteinMultiplier);
    const proteinCals = proteinGrams * 4;
    
    // Fat floor (minimum for hormones)
    let fatGrams = Math.round(weight * 0.3);
    
    // Performance emphasis = slightly higher fat for energy
    if (secondaryGoals.includes('improve-performance')) {
      fatGrams = Math.round(weight * 0.35);
    }
    
    const fatCals = fatGrams * 9;
    
    // Remaining calories to carbs (flexible)
    let remainingCals = calories - proteinCals - fatCals;
    let carbGrams = Math.round(remainingCals / 4);
    
    // Endurance emphasis = prioritize carbs
    if (secondaryGoals.includes('improve-endurance')) {
      // Shift 50 calories from fat to carbs
      fatGrams = Math.max(Math.round(weight * 0.25), fatGrams - 6);
      remainingCals = calories - proteinCals - (fatGrams * 9);
      carbGrams = Math.round(remainingCals / 4);
    }
    
    // Adjust based on diet style (overrides secondary goals)
    if (dietStyle === 'high-protein') {
      return {
        protein: Math.round(proteinGrams * 1.3),
        carbs: Math.round(carbGrams * 0.8),
        fat: fatGrams
      };
    } else if (dietStyle === 'low-carb' || dietStyle === 'keto') {
      return {
        protein: proteinGrams,
        carbs: Math.round(carbGrams * 0.4),
        fat: Math.round((calories - proteinCals - (carbGrams * 0.4 * 4)) / 9)
      };
    }
    
    return { protein: proteinGrams, carbs: carbGrams, fat: fatGrams };
  };
  
  // Macro flexibility bands
  const getMacroBands = (targetMacros) => {
    return {
      protein: {
        min: Math.round(targetMacros.protein * 0.9),
        target: targetMacros.protein,
        max: Math.round(targetMacros.protein * 1.1),
        priority: 'high'
      },
      carbs: {
        min: Math.round(targetMacros.carbs * 0.8),
        target: targetMacros.carbs,
        max: Math.round(targetMacros.carbs * 1.2),
        priority: 'flexible'
      },
      fat: {
        min: Math.round(targetMacros.fat * 0.85),
        target: targetMacros.fat,
        max: Math.round(targetMacros.fat * 1.15),
        priority: 'moderate'
      }
    };
  };
  
  // Adaptive weight trend calculation
  const calculateWeightTrend = (weighIns) => {
    if (weighIns.length < 2) return null;
    
    // CRITICAL FIX: weighIns array is sorted newest-first (descending by date)
    // But trend calculation expects oldest-first (time increases with index)
    const chronologicalOrder = [...weighIns].reverse();
    
    // Calculate actual time span in days
    const oldestDate = new Date(chronologicalOrder[0].date);
    const newestDate = new Date(chronologicalOrder[chronologicalOrder.length - 1].date);
    const totalDays = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
    
    // Require minimum 1 day span for meaningful trend
    // If entries are within same day, Don't show a trend (too volatile)
    if (totalDays < 1) {
      return null; // Not enough time has passed for a reliable trend
    }
    
    // Calculate total weight change
    const totalWeightChange = chronologicalOrder[chronologicalOrder.length - 1].weight - chronologicalOrder[0].weight;
    
    // Convert to weekly rate
    const dailyRate = totalWeightChange / totalDays;
    const weeklyRate = dailyRate * 7;
    
    return weeklyRate;
  };
  
  // Generate adaptive recommendation
  const generateAdaptiveRecommendation = (trend, goal, currentCalories) => {
    const expectedRates = {
      'fat-loss': { aggressive: -2, moderate: -1, slow: -0.5 },
      'lean-bulk': { aggressive: 1, moderate: 0.5, slow: 0.25 }
    };
    
    const expected = expectedRates[goal.type]?.[goal.rate] || 0;
    const variance = trend - expected;
    
    if (Math.abs(variance) < 0.15) {
      return {
        status: 'on-track',
        message: ' Perfect! Your progress is right on target.',
        adjustment: 0,
        confidence: 'high'
      };
    } else if (variance < -0.25) {
      // Losing too fast
      const adjustment = Math.min(200, Math.round(currentCalories * 0.05));
      return {
        status: 'too-fast',
        message: `You're losing faster than planned. Consider adding ${adjustment} calories.`,
        adjustment: adjustment,
        confidence: 'medium',
        reason: 'Preserve muscle and energy'
      };
    } else if (variance > 0.25) {
      // Too slow or gaining
      const adjustment = Math.min(200, Math.round(currentCalories * 0.05));
      return {
        status: 'too-slow',
        message: `Progress slower than target. Consider reducing ${adjustment} calories.`,
        adjustment: -adjustment,
        confidence: 'medium',
        reason: 'Adjust for actual TDEE'
      };
    }
    
    return null;
  };

  const unlockAchievement = (achievementId) => {
    setAchievements(prev => prev.map(ach => {
      if (ach.id === achievementId && !ach.unlocked) {
        setShowAchievement(ach);
        setTimeout(() => setShowAchievement(null), 5000); // Show banner for 5s
        // Note: Removed toast notification here - achievement banner is sufficient
        return {...ach, unlocked: true, progress: ach.target};
      }
      return ach;
    }));
  };

  const skipMeal = (mealIndex) => {
    const meal = plan.meals[mealIndex];
    const newPlan = {...plan};
    newPlan.meals.splice(mealIndex, 1);
    newPlan.calories -= meal.calories;
    newPlan.protein -= meal.protein;
    newPlan.carbs -= meal.carbs;
    newPlan.fat -= meal.fat;
    setPlan(newPlan);
    showToast('Meal removed & macros recalculated!', 'success');
  };

  // NEW: Meal state management (planned/skipped/ate-other)
  const setMealState = (mealIndex, state) => {
    const mealKey = `meal-${mealIndex}`;
    setMealStates({...mealStates, [mealKey]: state});
    
    if (state === 'skipped') {
      showToast('Meal skipped. Remaining meals adapt automatically.', 'info');
    } else if (state === 'ate-other') {
      showToast('Logged as ate something else. Quick log to track it.', 'info');
    } else {
      showToast('Meal marked as planned', 'success');
    }
  };

  const getMealState = (mealIndex) => {
    const mealKey = `meal-${mealIndex}`;
    return mealStates[mealKey] || 'planned';
  };

  const replaceMeal = (mealIndex) => {
    if (!customMeal.name || !customMeal.calories) {
      showToast('Please enter meal details', 'error');
      return;
    }
    const oldMeal = plan.meals[mealIndex];
    const newPlan = {...plan};
    newPlan.meals[mealIndex] = {
      name: customMeal.name,
      calories: parseInt(customMeal.calories),
      protein: parseInt(customMeal.protein) || 0,
      carbs: parseInt(customMeal.carbs) || 0,
      fat: parseInt(customMeal.fat) || 0,
      ingredients: ['Custom meal'],
      instructions: ['Prepare as desired']
    };
    newPlan.calories = newPlan.calories - oldMeal.calories + newPlan.meals[mealIndex].calories;
    newPlan.protein = newPlan.protein - oldMeal.protein + newPlan.meals[mealIndex].protein;
    newPlan.carbs = newPlan.carbs - oldMeal.carbs + newPlan.meals[mealIndex].carbs;
    newPlan.fat = newPlan.fat - oldMeal.fat + newPlan.meals[mealIndex].fat;
    setPlan(newPlan);
    setShowMealReplace(null);
    setCustomMeal({name:'', calories:0, protein:0, carbs:0, fat:0});
    
    // Mark manual edit - prevents training adjustments
    setManualMacroEditToday(true);
    
    showToast('Meal replaced & macros recalculated!', 'success');
  };

  const toggleFavorite = (mealIndex) => {
    const meal = plan.meals[mealIndex];
    const mealKey = `${meal.name}-${meal.calories}`;
    
    if (favs.some(f => f.key === mealKey)) {
      setFavs(favs.filter(f => f.key !== mealKey));
      showToast('Removed from favorites', 'info');
    } else {
      setFavs([...favs, {...meal, key: mealKey, savedAt: new Date()}]);
      showToast('Added to favorites! ❤️', 'success');
    }
  };

  const isFavorite = (mealIndex) => {
    const meal = plan.meals[mealIndex];
    const mealKey = `${meal.name}-${meal.calories}`;
    return favs.some(f => f.key === mealKey);
  };

  const toggleMealExpanded = (mealIndex) => {
    setExpandedMeals({...expandedMeals, [mealIndex]: !expandedMeals[mealIndex]});
  };

  
  // Toggle grocery item by ID (for meal card interactions)
  const toggleGroceryItem = (id) => {
    setGroceryList(groceryList.map(item => 
      item.id === id ? {...item, checked: !item.checked} : item
    ));
  };
  
  // Mark item as "already have" (for meal card interactions)
  const markAsAlreadyHave = (id) => {
    setGroceryList(groceryList.map(item =>
      item.id === id ? {...item, checked: true, alreadyHave: true} : item
    ));
  };
  
  const savePlan = () => {
    const savedPlan = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      plan: {...plan},
      ratings: {...ratings},
      favs: [...favs]
    };
    setSavedPlans([savedPlan, ...savedPlans]);
    showToast('Plan saved!', 'success');
  };

  const loadPlan = (savedPlan) => {
    setPlan(savedPlan.plan);
    setRatings(savedPlan.ratings);
    setFavs(savedPlan.favs);
    setShowSavedPlans(false);
    showToast('Plan loaded!', 'success');
  };

  const deleteSavedPlan = (id) => {
    setSavedPlans(savedPlans.filter(p => p.id !== id));
    showToast('Plan deleted!', 'success');
  };

  const updateTrainingContext = (updates) => {
    const today = new Date().toDateString();
    setDailyTrainingContext(prev => ({
      ...prev,
      date: today,
      ...updates
    }));
  };

  // ========== TRAINING CONTEXT MACRO ADJUSTMENT LOGIC ==========
  /**
   * Calculate subtle macro adjustments based on training context
   * Constraints:
   * - Total calories remain unchanged
   * - Only adjust unlogged meals
   * - Protein: +10% of remaining, max +15g/day
   * - Carbs: +10% of remaining, max +30g/day (strength/mixed only)
   * - Fat: reduce to maintain calorie neutrality, max -5%
   */
  const calculateTrainingAdjustments = () => {
    // Skip conditions
    if (!plan) return null;
    if (!dailyTrainingContext.trained || !dailyTrainingContext.type) return null;
    if (manualMacroEditToday) return null;
    if (!advancedMode) return null; // Only applies in Advanced Mode
    
    // Check if all meals are logged
    const loggedMealCount = dailyLog.meals.length;
    if (loggedMealCount >= plan.meals.length) return null;
    
    // Skip if only one small meal remains
    const remainingMealCount = plan.meals.length - loggedMealCount;
    if (remainingMealCount === 1) {
      const avgCaloriesPerMeal = plan.calories / plan.meals.length;
      if (avgCaloriesPerMeal < 400) return null; // Small meal
    }
    
    // Late-day detection: Skip if training logged after 6pm
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 18) return null; // After 6pm, adjustments apply tomorrow
    
    // Calculate remaining targets
    const remainingProtein = Math.max(0, plan.protein - dailyLog.totalProtein);
    const remainingCarbs = Math.max(0, plan.carbs - dailyLog.totalCarbs);
    const remainingFat = Math.max(0, plan.fat - dailyLog.totalFat);
    
    // Intensity multiplier
    const intensityMultipliers = {
      light: 0.5,
      moderate: 0.75,
      hard: 1.0
    };
    const intensity = dailyTrainingContext.intensity || 'moderate';
    const multiplier = intensityMultipliers[intensity];
    
    // Calculate raw adjustments based on training type
    let proteinAdjust = 0;
    let carbsAdjust = 0;
    let fatAdjust = 0;
    
    switch (dailyTrainingContext.type) {
      case 'strength':
        // Protein primary, carbs secondary
        proteinAdjust = Math.min(
          remainingProtein * 0.10 * multiplier,  // 10% of remaining
          15 * multiplier                         // Max 15g/day
        );
        carbsAdjust = Math.min(
          remainingCarbs * 0.10 * multiplier,    // 10% of remaining
          30 * multiplier                         // Max 30g/day
        );
        break;
        
      case 'cardio':
        // Carbs primary, protein minimal
        carbsAdjust = Math.min(
          remainingCarbs * 0.10 * multiplier,
          30 * multiplier
        );
        proteinAdjust = Math.min(
          remainingProtein * 0.05 * multiplier,  // Half the strength adjustment
          8 * multiplier                          // Half the cap
        );
        break;
        
      case 'mixed':
        // Smaller shifts in both, never max simultaneously
        proteinAdjust = Math.min(
          remainingProtein * 0.07 * multiplier,  // 70% of strength
          10 * multiplier
        );
        carbsAdjust = Math.min(
          remainingCarbs * 0.07 * multiplier,
          20 * multiplier
        );
        break;
    }
    
    // Round to whole numbers
    proteinAdjust = Math.round(proteinAdjust);
    carbsAdjust = Math.round(carbsAdjust);
    
    // Calculate calorie impact
    const proteinCalories = proteinAdjust * 4;
    const carbsCalories = carbsAdjust * 4;
    const totalAddedCalories = proteinCalories + carbsCalories;
    
    // Reduce fat to maintain calorie neutrality
    const fatCaloriesToRemove = totalAddedCalories;
    const fatGramsToRemove = fatCaloriesToRemove / 9;
    const maxFatReduction = remainingFat * 0.05; // Max 5% reduction
    
    fatAdjust = -Math.min(fatGramsToRemove, maxFatReduction);
    fatAdjust = Math.round(fatAdjust);
    
    // Verify calorie neutrality (within 5 calories due to rounding)
    const netCalories = (proteinAdjust * 4) + (carbsAdjust * 4) + (fatAdjust * 9);
    if (Math.abs(netCalories) > 5) {
      // Adjustment too large, scale back
      const scaleFactor = 5 / Math.abs(netCalories);
      proteinAdjust = Math.round(proteinAdjust * scaleFactor);
      carbsAdjust = Math.round(carbsAdjust * scaleFactor);
      fatAdjust = Math.round(fatAdjust * scaleFactor);
    }
    
    // Return null if adjustments are negligible
    if (Math.abs(proteinAdjust) < 2 && Math.abs(carbsAdjust) < 3 && Math.abs(fatAdjust) < 1) {
      return null;
    }
    
    return {
      protein: proteinAdjust,
      carbs: carbsAdjust,
      fat: fatAdjust,
      appliedToMealCount: remainingMealCount
    };
  };
  
  /**
   * Apply training adjustments to unlogged meals
   */
  const applyTrainingAdjustmentsToMeals = (adjustments) => {
    if (!adjustments || !plan) return;
    
    // Build set of logged meal names for comparison
    const loggedMealNames = new Set(dailyLog.meals.map(m => m.name));
    
    const perMealProtein = adjustments.protein / adjustments.appliedToMealCount;
    const perMealCarbs = adjustments.carbs / adjustments.appliedToMealCount;
    const perMealFat = adjustments.fat / adjustments.appliedToMealCount;
    
    let adjustedCount = 0;
    
    const updatedMeals = plan.meals.map((meal, idx) => {
      // Skip meals that have been logged (simple name matching)
      // Note: This is a best-effort approach since we Don't have perfect meal-to-plan mapping
      if (loggedMealNames.has(meal.name) && adjustedCount < dailyLog.meals.length) {
        adjustedCount++;
        return meal;
      }
      
      // Store original if not already stored
      if (!originalMealMacros[idx]) {
        setOriginalMealMacros(prev => ({
          ...prev,
          [idx]: {
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            calories: meal.calories
          }
        }));
      }
      
      // Apply adjustments
      return {
        ...meal,
        protein: Math.round(meal.protein + perMealProtein),
        carbs: Math.round(meal.carbs + perMealCarbs),
        fat: Math.round(meal.fat + perMealFat),
        calories: Math.round(
          (meal.protein + perMealProtein) * 4 +
          (meal.carbs + perMealCarbs) * 4 +
          (meal.fat + perMealFat) * 9
        ),
        _trainingAdjusted: true
      };
    });
    
    setPlan({
      ...plan,
      meals: updatedMeals
    });
    
    // Mark meals as adjusted
    const adjustedIndices = new Set();
    updatedMeals.forEach((meal, idx) => {
      if (meal._trainingAdjusted) adjustedIndices.add(idx);
    });
    setTrainingAdjustedMeals(adjustedIndices);
  };
  
  /**
   * Revert training adjustments when toggled off
   */
  const revertTrainingAdjustments = () => {
    if (!plan || Object.keys(originalMealMacros).length === 0) return;
    
    const revertedMeals = plan.meals.map((meal, idx) => {
      if (originalMealMacros[idx]) {
        return {
          ...meal,
          ...originalMealMacros[idx],
          _trainingAdjusted: false
        };
      }
      return meal;
    });
    
    setPlan({
      ...plan,
      meals: revertedMeals
    });
    
    setTrainingAdjustedMeals(new Set());
    setOriginalMealMacros({});
  };
  
  // Apply adjustments when training context changes
  useEffect(() => {
    if (!plan) return;
    
    if (dailyTrainingContext.trained && dailyTrainingContext.type) {
      const adjustments = calculateTrainingAdjustments();
      if (adjustments) {
        applyTrainingAdjustmentsToMeals(adjustments);
      }
    } else {
      // Training toggled off or cleared
      revertTrainingAdjustments();
    }
  }, [dailyTrainingContext.trained, dailyTrainingContext.type, dailyTrainingContext.intensity]);
  
  // Check if adjustments are active
  const hasActiveTrainingAdjustments = () => {
    return dailyTrainingContext.trained && 
           dailyTrainingContext.type && 
           trainingAdjustedMeals.size > 0;
  };
  // ========== END TRAINING CONTEXT MACRO ADJUSTMENT LOGIC ==========

  const logMealToDay = (meal) => {
    const newDailyLog = {
      ...dailyLog,
      meals: [...dailyLog.meals, {...meal, loggedAt: new Date()}],
      totalCalories: dailyLog.totalCalories + meal.calories,
      totalProtein: dailyLog.totalProtein + meal.protein,
      totalCarbs: dailyLog.totalCarbs + meal.carbs,
      totalFat: dailyLog.totalFat + meal.fat
    };
    setDailyLog(newDailyLog);
    showToast('Meal logged to today!', 'success');
    setMacrosExpanded(false); // Auto-collapse after logging
  };

  const addWater = () => {
    setDailyLog({...dailyLog, water: dailyLog.water + 1});
    if ((dailyLog.water + 1) >= 8) {
      showToast('Water goal reached! ', 'success');
    }
  };

  const completeDailyLog = () => {
    const completedLog = {
      ...dailyLog,
      id: Date.now(),
      completed: true
    };
    setTrackingHistory([completedLog, ...trackingHistory]);
    setDailyLog({
      date: new Date().toLocaleDateString(),
      meals: [],
      water: 0,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    });
    showToast('Day logged! Great job! ', 'success');
  };

  // ========== MICRONUTRIENT ANALYSIS ENGINE (ADDITIVE, ISOLATED) ==========
  
  // Daily reference values (RDA/AI for adults)
  const MICRONUTRIENT_DV = {
    fiber: { amount: 28, unit: 'g', name: 'Fiber' },
    iron: { amount: 18, unit: 'mg', name: 'Iron' },
    calcium: { amount: 1000, unit: 'mg', name: 'Calcium' },
    magnesium: { amount: 400, unit: 'mg', name: 'Magnesium' },
    potassium: { amount: 3500, unit: 'mg', name: 'Potassium' },
    vitaminA: { amount: 900, unit: 'mcg', name: 'Vitamin A' },
    vitaminC: { amount: 90, unit: 'mg', name: 'Vitamin C' },
    vitaminD: { amount: 20, unit: 'mcg', name: 'Vitamin D' },
    vitaminB12: { amount: 2.4, unit: 'mcg', name: 'Vitamin B12' }
  };

  // Ingredient-to-micronutrient mapping (common foods)
  const INGREDIENT_MICROS = {
    // Proteins
    'chicken breast': { fiber: 0, iron: 1, calcium: 15, magnesium: 30, potassium: 250, vitaminA: 10, vitaminC: 2, vitaminD: 0, vitaminB12: 0.3 },
    'salmon': { fiber: 0, iron: 1, calcium: 15, magnesium: 35, potassium: 350, vitaminA: 50, vitaminC: 0, vitaminD: 10, vitaminB12: 3 },
    'turkey breast': { fiber: 0, iron: 1.5, calcium: 20, magnesium: 30, potassium: 280, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0.4 },
    'lean beef': { fiber: 0, iron: 2.5, calcium: 10, magnesium: 25, potassium: 320, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 2 },
    'eggs': { fiber: 0, iron: 1.2, calcium: 50, magnesium: 12, potassium: 140, vitaminA: 80, vitaminC: 0, vitaminD: 1.5, vitaminB12: 0.6 },
    'greek yogurt': { fiber: 0, iron: 0.2, calcium: 200, magnesium: 20, potassium: 250, vitaminA: 5, vitaminC: 1, vitaminD: 0, vitaminB12: 1 },
    
    // Grains
    'brown rice': { fiber: 2, iron: 0.8, calcium: 20, magnesium: 85, potassium: 85, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0 },
    'quinoa': { fiber: 3, iron: 2, calcium: 30, magnesium: 120, potassium: 320, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0 },
    'oats': { fiber: 4, iron: 2, calcium: 50, magnesium: 70, potassium: 150, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0 },
    'pasta': { fiber: 2, iron: 1.5, calcium: 10, magnesium: 35, potassium: 60, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0 },
    'toast': { fiber: 2, iron: 1.2, calcium: 80, magnesium: 25, potassium: 90, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0 },
    
    // Vegetables
    'broccoli': { fiber: 2.5, iron: 0.7, calcium: 45, magnesium: 20, potassium: 290, vitaminA: 60, vitaminC: 80, vitaminD: 0, vitaminB12: 0 },
    'spinach': { fiber: 2, iron: 3, calcium: 100, magnesium: 80, potassium: 560, vitaminA: 470, vitaminC: 28, vitaminD: 0, vitaminB12: 0 },
    'sweet potato': { fiber: 4, iron: 0.7, calcium: 40, magnesium: 30, potassium: 540, vitaminA: 960, vitaminC: 20, vitaminD: 0, vitaminB12: 0 },
    'asparagus': { fiber: 2, iron: 2, calcium: 25, magnesium: 15, potassium: 200, vitaminA: 45, vitaminC: 7, vitaminD: 0, vitaminB12: 0 },
    'vegetables': { fiber: 2, iron: 1, calcium: 40, magnesium: 25, potassium: 250, vitaminA: 100, vitaminC: 20, vitaminD: 0, vitaminB12: 0 },
    
    // Fruits
    'banana': { fiber: 3, iron: 0.3, calcium: 5, magnesium: 30, potassium: 420, vitaminA: 4, vitaminC: 10, vitaminD: 0, vitaminB12: 0 },
    'berries': { fiber: 4, iron: 0.4, calcium: 15, magnesium: 10, potassium: 150, vitaminA: 5, vitaminC: 30, vitaminD: 0, vitaminB12: 0 },
    'apple': { fiber: 4, iron: 0.2, calcium: 10, magnesium: 8, potassium: 195, vitaminA: 3, vitaminC: 8, vitaminD: 0, vitaminB12: 0 },
    
    // Other
    'almond butter': { fiber: 3, iron: 1, calcium: 90, magnesium: 90, potassium: 240, vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0 },
    'avocado': { fiber: 7, iron: 0.6, calcium: 15, magnesium: 30, potassium: 485, vitaminA: 10, vitaminC: 10, vitaminD: 0, vitaminB12: 0 },
    'milk': { fiber: 0, iron: 0, calcium: 300, magnesium: 25, potassium: 350, vitaminA: 50, vitaminC: 0, vitaminD: 2.5, vitaminB12: 1.2 }
  };

  // Calculate micronutrients for a single meal
  const calculateMealMicros = (meal) => {
    if (!meal || !meal.ingredients) return null;
    
    const totals = {
      fiber: 0,
      iron: 0,
      calcium: 0,
      magnesium: 0,
      potassium: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminB12: 0
    };

    meal.ingredients.forEach(ingredient => {
      const ingredientName = ingredient.toLowerCase().replace(/\d+/g, '').trim();
      
      // Try to find match in our database
      for (const [key, micros] of Object.entries(INGREDIENT_MICROS)) {
        if (ingredientName.includes(key)) {
          Object.keys(totals).forEach(nutrient => {
            totals[nutrient] += micros[nutrient] || 0;
          });
          break; // Only match once per ingredient
        }
      }
    });

    // Calculate percentages of DV
    const percentages = {};
    Object.keys(totals).forEach(nutrient => {
      const dv = MICRONUTRIENT_DV[nutrient].amount;
      percentages[nutrient] = Math.round((totals[nutrient] / dv) * 100);
    });

    return {
      totals,
      percentages
    };
  };

  // Calculate daily micronutrient totals from all meals
  const calculateDailyMicros = (meals) => {
    if (!meals || meals.length === 0) return null;

    const dailyTotals = {
      fiber: 0,
      iron: 0,
      calcium: 0,
      magnesium: 0,
      potassium: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminB12: 0
    };

    meals.forEach(meal => {
      const mealMicros = calculateMealMicros(meal);
      if (mealMicros) {
        Object.keys(dailyTotals).forEach(nutrient => {
          dailyTotals[nutrient] += mealMicros.totals[nutrient];
        });
      }
    });

    // Calculate percentages
    const percentages = {};
    Object.keys(dailyTotals).forEach(nutrient => {
      const dv = MICRONUTRIENT_DV[nutrient].amount;
      percentages[nutrient] = Math.round((dailyTotals[nutrient] / dv) * 100);
    });

    // Categorize nutrients
    const strengths = [];
    const gaps = [];
    const adequate = [];

    Object.keys(percentages).forEach(nutrient => {
      const pct = percentages[nutrient];
      const name = MICRONUTRIENT_DV[nutrient].name;
      
      if (pct >= 80) {
        strengths.push({ nutrient, name, percentage: pct });
      } else if (pct < 40) {
        gaps.push({ nutrient, name, percentage: pct });
      } else {
        adequate.push({ nutrient, name, percentage: pct });
      }
    });

    return {
      totals: dailyTotals,
      percentages,
      strengths,
      gaps,
      adequate
    };
  };

  // Get status color for a percentage
  const getMicroStatus = (percentage) => {
    if (percentage >= 80) return 'strong';
    if (percentage >= 40) return 'adequate';
    return 'low';
  };

  // Get color classes for status
  const getMicroStatusColor = (status, dark) => {
    if (status === 'strong') return dark ? 'text-emerald-400 bg-emerald-900/30' : 'text-emerald-700 bg-emerald-50';
    if (status === 'adequate') return dark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-700 bg-blue-50';
    return dark ? 'text-orange-400 bg-orange-900/30' : 'text-orange-700 bg-orange-50';
  };

  // Get bar chart color for micronutrient percentage (Senior UX color system)
  const getMicroBarColor = (percentage, dark) => {
    if (percentage >= 80) {
      // Success tone - muted green
      return dark ? '#34d399' : '#10b981'; // emerald-400 / emerald-500
    } else if (percentage >= 40) {
      // Calm accent - soft blue
      return dark ? '#60a5fa' : '#3b82f6'; // blue-400 / blue-500
    } else {
      // Muted neutral - soft gray
      return dark ? '#64748b' : '#94a3b8'; // slate-500 / slate-400
    }
  };

  // Get background color for micronutrient bars
  const getMicroBarBgColor = (dark) => {
    return dark ? '#1e293b' : '#e2e8f0'; // slate-800 / slate-200
  };

  // ========== END MICRONUTRIENT ANALYSIS ENGINE ==========

  const quickLogFood = (name, calories, protein, carbs, fat) => {
    const quickMeal = {
      name,
      calories: parseInt(calories),
      protein: parseInt(protein),
      carbs: parseInt(carbs),
      fat: parseInt(fat)
    };
    logMealToDay(quickMeal);
  };

  const mealSwap = async (mealIndex) => {
    // Open Smart Swap modal instead of random swap
    setSwapMealIndex(mealIndex);
    setShowSmartSwap(true);
  };
  
  // ========== INTELLIGENT SWAP SYSTEM ==========
  const executeSmartSwap = async (intent) => {
    setSwapIntent(intent);
    setSwapping(swapMealIndex);
    setShowSmartSwap(false);
    
    await new Promise(r => setTimeout(r, 1200));
    
    const currentMeal = plan.meals[swapMealIndex];
    const currentMacros = {
      calories: currentMeal.calories,
      protein: currentMeal.protein,
      carbs: currentMeal.carbs,
      fat: currentMeal.fat
    };
    
    // Calculate current daily micronutrient gaps (if in Advanced Mode)
    let microGaps = [];
    if (advancedMode && dailyMicroData) {
      microGaps = dailyMicroData.gaps.map(g => g.nutrient);
    }
    
    // Intent-aware meal database with quality tags
    const mealDatabase = [
      // High Protein Options
      {
        name: 'Grilled Salmon with Quinoa',
        calories: 520, protein: 42, carbs: 48, fat: 18,
        tags: ['High protein', 'Omega-3 rich'],
        prepTime: 25,
        microStrengths: ['vitaminD', 'vitaminB12', 'magnesium'],
        ingredients: ['wild-caught salmon', 'quinoa', 'lemon', 'olive oil', 'garlic'],
        instructions: ['Season salmon', 'Cook quinoa', 'Grill salmon 4-5 min per side', 'Serve with lemon']
      },
      {
        name: 'Chicken & Veggie Stir-Fry',
        calories: 480, protein: 45, carbs: 42, fat: 15,
        tags: ['High protein', 'Vegetable-forward'],
        prepTime: 20,
        microStrengths: ['vitaminA', 'vitaminC', 'iron'],
        ingredients: ['chicken breast', 'brown rice', 'bell peppers', 'broccoli', 'soy sauce'],
        instructions: ['Cook rice', 'Stir-fry chicken', 'Add vegetables', 'Season and serve']
      },
      {
        name: 'Greek Yogurt Power Bowl',
        calories: 420, protein: 35, carbs: 48, fat: 12,
        tags: ['High protein', 'Quick prep'],
        prepTime: 5,
        microStrengths: ['calcium', 'vitaminB12', 'potassium'],
        ingredients: ['Greek yogurt', 'granola', 'berries', 'honey', 'almonds'],
        instructions: ['Layer yogurt in bowl', 'Top with granola and berries', 'Drizzle with honey']
      },
      
      // Similar Calories, Balanced
      {
        name: 'Turkey & Sweet Potato Bowl',
        calories: 510, protein: 38, carbs: 52, fat: 16,
        tags: ['Balanced', 'Nutrient-dense'],
        prepTime: 30,
        microStrengths: ['vitaminA', 'potassium', 'fiber'],
        ingredients: ['ground turkey', 'sweet potato', 'spinach', 'avocado', 'lime'],
        instructions: ['Roast sweet potato cubes', 'Cook turkey', 'Assemble bowl', 'Top with avocado']
      },
      {
        name: 'Shrimp Burrito Bowl',
        calories: 495, protein: 36, carbs: 54, fat: 14,
        tags: ['Balanced', 'Flavorful'],
        prepTime: 25,
        microStrengths: ['vitaminB12', 'iron', 'magnesium'],
        ingredients: ['shrimp', 'brown rice', 'black beans', 'salsa', 'cilantro'],
        instructions: ['Cook rice and beans', 'Sauté shrimp', 'Assemble bowl', 'Top with salsa']
      },
      
      // Lighter Options
      {
        name: 'Garden Salad with Grilled Chicken',
        calories: 380, protein: 32, carbs: 28, fat: 16,
        tags: ['Light', 'Vegetable-forward'],
        prepTime: 15,
        microStrengths: ['vitaminA', 'vitaminC', 'fiber'],
        ingredients: ['chicken breast', 'mixed greens', 'cherry tomatoes', 'cucumber', 'olive oil'],
        instructions: ['Grill chicken', 'Toss salad ingredients', 'Slice chicken on top', 'Drizzle dressing']
      },
      {
        name: 'Veggie Egg White Scramble',
        calories: 340, protein: 28, carbs: 32, fat: 12,
        tags: ['Light', 'Quick prep'],
        prepTime: 10,
        microStrengths: ['vitaminA', 'vitaminC', 'potassium'],
        ingredients: ['egg whites', 'spinach', 'mushrooms', 'tomatoes', 'whole grain toast'],
        instructions: ['Sauté vegetables', 'Add egg whites', 'Scramble until cooked', 'Serve with toast']
      },
      
      // Faster Prep
      {
        name: 'Tuna Avocado Wrap',
        calories: 465, protein: 34, carbs: 38, fat: 20,
        tags: ['Quick prep', 'Portable'],
        prepTime: 5,
        microStrengths: ['vitaminD', 'vitaminB12', 'omega3'],
        ingredients: ['canned tuna', 'avocado', 'whole wheat wrap', 'lettuce', 'tomato'],
        instructions: ['Mash tuna with avocado', 'Spread on wrap', 'Add vegetables', 'Roll and serve']
      },
      {
        name: 'Protein Smoothie Bowl',
        calories: 415, protein: 32, carbs: 50, fat: 10,
        tags: ['Quick prep', 'Refreshing'],
        prepTime: 5,
        microStrengths: ['calcium', 'vitaminC', 'potassium'],
        ingredients: ['protein powder', 'banana', 'berries', 'almond milk', 'granola'],
        instructions: ['Blend protein, banana, berries, milk', 'Pour into bowl', 'Top with granola']
      },
      
      // Micronutrient Rich
      {
        name: 'Salmon & Kale Power Plate',
        calories: 505, protein: 40, carbs: 42, fat: 18,
        tags: ['Nutrient-dense', 'Anti-inflammatory'],
        prepTime: 25,
        microStrengths: ['vitaminD', 'calcium', 'iron', 'vitaminA', 'vitaminC'],
        ingredients: ['salmon', 'kale', 'quinoa', 'lemon', 'walnuts'],
        instructions: ['Bake salmon', 'Massage kale with lemon', 'Cook quinoa', 'Combine and top with walnuts']
      },
      {
        name: 'Beef & Spinach Stir-Fry',
        calories: 520, protein: 42, carbs: 44, fat: 18,
        tags: ['Nutrient-dense', 'Iron-rich'],
        prepTime: 20,
        microStrengths: ['iron', 'vitaminB12', 'vitaminA', 'magnesium'],
        ingredients: ['lean beef', 'spinach', 'brown rice', 'garlic', 'ginger'],
        instructions: ['Cook rice', 'Stir-fry beef', 'Add spinach and aromatics', 'Serve hot']
      }
    ];
    
    // Smart filtering based on intent
    let filteredMeals = [...mealDatabase];
    
    if (intent === 'similar') {
      // Similar calories (within 10%)
      filteredMeals = filteredMeals.filter(m => 
        Math.abs(m.calories - currentMacros.calories) / currentMacros.calories < 0.10
      );
    } else if (intent === 'protein') {
      // Higher protein than current
      filteredMeals = filteredMeals.filter(m => m.protein > currentMacros.protein)
        .sort((a, b) => b.protein - a.protein);
    } else if (intent === 'micronutrients') {
      // Meals that help fill micronutrient gaps
      if (microGaps.length > 0) {
        filteredMeals = filteredMeals.map(m => ({
          ...m,
          gapScore: m.microStrengths.filter(s => microGaps.includes(s)).length
        }))
        .sort((a, b) => b.gapScore - a.gapScore);
      } else {
        // If no gaps, prioritize nutrient-dense meals
        filteredMeals = filteredMeals.filter(m => m.tags.includes('Nutrient-dense'));
      }
    } else if (intent === 'faster') {
      // Faster prep time
      filteredMeals = filteredMeals.filter(m => m.prepTime <= 15)
        .sort((a, b) => a.prepTime - b.prepTime);
    } else if (intent === 'lighter') {
      // Lower calories
      filteredMeals = filteredMeals.filter(m => m.calories < currentMacros.calories * 0.85)
        .sort((a, b) => a.calories - b.calories);
    }
    
    // If no results from filtering, fall back to balanced options
    if (filteredMeals.length === 0) {
      filteredMeals = mealDatabase.filter(m => m.tags.includes('Balanced'));
    }
    
    // Pick a random meal from filtered results
    const selectedMeal = filteredMeals[Math.floor(Math.random() * Math.min(3, filteredMeals.length))];
    
    const updatedMeals = [...plan.meals];
    updatedMeals[swapMealIndex] = selectedMeal;
    
    setPlan({
      ...plan,
      meals: updatedMeals,
      protein: updatedMeals.reduce((sum, m) => sum + m.protein, 0),
      carbs: updatedMeals.reduce((sum, m) => sum + m.carbs, 0),
      fat: updatedMeals.reduce((sum, m) => sum + m.fat, 0),
      calories: updatedMeals.reduce((sum, m) => sum + m.calories, 0)
    });
    
    setSwapping(null);
    setSwapIntent(null);
    showToast(`Swapped to ${selectedMeal.name}`, 'success');
  };
  // ========== END INTELLIGENT SWAP SYSTEM ==========

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {role: 'user', content: chatInput};
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    await new Promise(r => setTimeout(r, 1500));
    
    const query = chatInput.toLowerCase();
    let response = '';
    
    // Food comparison questions
    if ((query.includes('or') || query.includes('vs')) && 
        (query.includes('chicken') || query.includes('beef') || query.includes('fish') || 
         query.includes('turkey') || query.includes('pork') || query.includes('salmon'))) {
      const foods = query.split(/\s+or\s+|\s+vs\.?\s+/);
      if (form.dietStyle === 'plant-based') {
        response = "Since you're following a plant-based diet, I'd recommend neither! Try tofu, tempeh, or legumes instead for your protein needs.";
      } else if (form.goals === 'fat-loss') {
        response = query.includes('chicken') 
          ? "Chicken is your best bet for fat loss! It's leaner with ~31g protein per 4oz vs beef's ~26g, and has less saturated fat."
          : query.includes('fish') || query.includes('salmon')
          ? "Fish, especially salmon, is excellent! High in protein and omega-3s which support fat loss and reduce inflammation."
          : "For fat loss, go with the leaner option. Chicken breast and fish are typically lower in calories than beef.";
      } else if (form.goals === 'lean-bulk') {
        response = query.includes('beef') 
          ? "Beef is great for bulking! Higher calories, more iron, and creatine for muscle growth. Aim for 90/10 lean ground beef."
          : "Both work for bulking! Beef has more calories and iron, chicken is leaner. Rotate between them for variety and different nutrients.";
      } else {
        response = "Both are excellent protein sources! Chicken is leaner (~165 cal/4oz), beef has more iron and B12 (~250 cal/4oz). Rotate them for nutrient diversity!";
      }
    }
    // Macro questions
    else if (query.includes('protein') || query.includes('macro')) {
      response = `Your current protein target is ${plan.protein}g per day. For your ${form.trainingType} training and ${form.goals} goal, aim to hit this consistently. Spread it across your ${form.meals} meals (~${Math.round(plan.protein/form.meals)}g per meal).`;
    }
    // Calorie questions
    else if (query.includes('calorie') || query.includes('deficit') || query.includes('surplus')) {
      const deficit = form.goals === 'fat-loss' ? 'deficit' : form.goals === 'lean-bulk' ? 'surplus' : 'maintenance';
      response = `You're targeting ${plan.calories} calories for ${form.goals}. This puts you in a ${deficit} based on your ${form.activity} activity level and ${form.weight}lbs bodyweight. ${form.targetRate === 'aggressive' ? 'Your aggressive rate means faster results but requires strict adherence.' : form.targetRate === 'slow' ? 'Your slow & steady approach is sustainable and easier to stick to long-term.' : 'Your moderate pace balances results with sustainability.'}`;
    }
    // Meal timing
    else if (query.includes('when') && (query.includes('eat') || query.includes('meal'))) {
      response = `With ${form.meals} meals per day, space them every ${Math.round(16/form.meals)} hours while awake. For ${form.trainingType} training, prioritize protein within 2 hours post-workout. Meal timing matters less than total daily intake!`;
    }
    // Cardio questions
    else if (query.includes('cardio') || query.includes('running')) {
      response = form.trainingType === 'strength' 
        ? "Since you're focused on strength training, keep cardio to 2-3 sessions of 20-30min weekly. Too much interferes with recovery and gains."
        : form.trainingType === 'cardio'
        ? "You're already doing cardio training! Aim for 4-5 sessions weekly. Mix steady-state and HIIT for best results."
        : "As a hybrid athlete, balance 2-3 cardio sessions with your strength work. Don't let cardio interfere with recovery!";
    }
    // Cheat meal questions
    else if (query.includes('cheat') || query.includes('treat')) {
      response = form.targetRate === 'aggressive'
        ? "With your aggressive target, save cheat meals for special occasions only (1-2x per month). Stay focused!"
        : "Build in 1 flexible meal per week. Stay within ~500 calories of your target and you'll be fine. Sustainability > perfection!";
    }
    // Supplement questions
    else if (query.includes('supplement') || query.includes('creatine') || query.includes('protein powder')) {
      response = "Focus on whole foods first! If you're struggling to hit protein targets, whey/plant protein powder helps. Creatine (5g daily) is proven for strength gains. Everything else is optional.";
    }
    // Water/hydration
    else if (query.includes('water') || query.includes('hydrat')) {
      response = `Aim for ${Math.round(form.weight / 2)} oz daily (bodyweight / 2). More if you're training hard or it's hot. Track it in the daily tracker!`;
    }
    // Sleep
    else if (query.includes('sleep')) {
      response = "Sleep is crucial! Aim for 7-9 hours. Poor sleep kills recovery, increases hunger hormones, and makes fat loss nearly impossible. Prioritize it as much as your training!";
    }
    // Alcohol
    else if (query.includes('alcohol') || query.includes('drink') || query.includes('beer') || query.includes('wine')) {
      response = form.goals === 'fat-loss'
        ? "Alcohol impacts fat loss significantly (7 cal/gram). If you drink, limit to 1-2x weekly, choose lower-calorie options (vodka soda, light beer), and account for the calories."
        : "Moderate drinking is fine for maintenance/bulking. Just remember: alcohol = 7 cal/gram, similar to fat. Account for it in your daily totals.";
    }
    // Progress tracking
    else if (query.includes('track') || query.includes('progress') || query.includes('measure')) {
      response = "Track weekly: bodyweight (same day/time), progress photos, and how clothes fit. Scale weight fluctuates daily due to water/food. Focus on 2-4 week trends, not daily changes!";
    }
    // Meal prep
    else if (query.includes('meal prep') || query.includes('prepare')) {
      response = form.cookTime === 'quick'
        ? "You prefer quick meals! Batch cook proteins on Sunday (chicken, ground beef), pre-chop veggies, cook rice/quinoa in bulk. Assemble meals in 5-10min throughout the week."
        : "Dedicate 2-3 hours on Sunday. Cook all proteins, grains, and roast veggies. Portion into containers. You'll have grab-and-go meals all week!";
    }
    // Specific diet questions
    else if (query.includes('keto') || query.includes('low carb')) {
      response = form.dietStyle === 'keto'
        ? "You're doing keto! Keep carbs under 30g daily, fat at 70-75% of calories, protein moderate. Track closely - it's easy to get kicked out of ketosis."
        : "Keto can work but isn't necessary for fat loss. Your current balanced approach is more sustainable and allows for better training performance!";
    }
    else if (query.includes('plant') || query.includes('vegan') || query.includes('vegetarian')) {
      response = form.dietStyle === 'plant-based'
        ? "Great choice! Focus on complete proteins: tofu, tempeh, seitan, quinoa, legume combinations. Supplement B12, consider vitamin D and omega-3s (algae-based)."
        : "Plant-based can work great! Just ensure adequate protein from varied sources and consider B12 supplementation. Would you like me to adjust your plan?";
    }
    // Generic/unclear questions
    else if (query.includes('help') || query.includes('start') || query.includes('begin')) {
      response = `Welcome! You're set up for ${form.goals} with ${plan.calories} calories and ${plan.protein}g protein daily. Start by following your meal plan, use the grocery list feature, and track daily in the tracker. Questions? Just ask!`;
    }
    else if (query.includes('thanks') || query.includes('thank')) {
      response = "You're welcome! Remember, consistency beats perfection. You've got this! ";
    }
    // Default intelligent response
    else {
      response = `Great question! Based on your ${form.goals} goal and ${form.trainingType} training, here's what I'd recommend: Focus on hitting your ${plan.calories} calories and ${plan.protein}g protein daily. Your ${form.dietStyle} diet approach is solid. Need specifics on protein sources, meal timing, or anything else?`;
    }
    
    const aiResponse = {
      role: 'assistant',
      content: response
    };
    
    setChatMessages(prev => [...prev, aiResponse]);
    setChatLoading(false);
  };

  const gen = async () => {
    setLoading(true);
    setLoadingStep(0);
    
    // CRITICAL: Sync userProfile with form data during initial onboarding
    // This ensures userProfile is the canonical source of truth going forward
    const totalHeightInches = useMetric ? form.height / 2.54 : (heightFeet * 12 + heightInches);
    setUserProfile({
      gender: form.gender,
      age: form.age,
      birthday: form.birthday,
      height: totalHeightInches,
      weight: form.weight
    });
    
    const steps = ['Understanding your goals...', 'Balancing your meals...', 'Keeping prep time realistic...', 'Final check for sustainability...'];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      setLoadingStep(i + 1);
    }
    
    setTimeout(() => {
      // For meals-only users: Use generic defaults
      if (userIntent === 'meals') {
        const mealsPerDay = form.meals;
        // Simple generic calorie target (2000 for moderate activity)
        const genericCalories = 2000;
        // Generic balanced macros
        const genericMacros = {
          protein: Math.round(genericCalories * 0.30 / 4), // 30% protein
          carbs: Math.round(genericCalories * 0.40 / 4),   // 40% carbs
          fat: Math.round(genericCalories * 0.30 / 9)      // 30% fat
        };
        
        const generatedMeals = generateMealPlan(genericCalories, genericMacros, mealsPerDay, form);
        
        setPlan({
          name: name || 'User',
          calories: genericCalories,
          protein: genericMacros.protein,
          carbs: genericMacros.carbs,
          fat: genericMacros.fat,
          meals: generatedMeals,
          // No calculation data for meals-only users (can be added later)
          isMealsOnly: true // Flag to hide macro displays
        });
      } else {
        // Full experience: Calculate everything using form (which now synced to userProfile)
        const bmr = calculateBMR(form.gender, form.weight, totalHeightInches, form.age);
        const tdee = calculateTDEE(bmr, form.activity);
        setBaselineTDEE(tdee);
        setActualTDEE(tdee);
        
        // Use new two-layer goal system (with fallback to legacy)
        const primaryGoal = form.primaryGoal || form.goals || 'maintain';
        const secondaryGoals = form.secondaryGoals || [];
        
        const targetCalories = applyGoalAdjustment(tdee, primaryGoal, secondaryGoals, form.targetRate);
        const macros = calculateMacros(targetCalories, form.trainingType, form.dietStyle, form.weight, secondaryGoals);
        const mealsPerDay = form.meals;
        const generatedMeals = generateMealPlan(targetCalories, macros, mealsPerDay, form);
        
        setPlan({
          name: name || 'User',
          calories: targetCalories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          bmr: Math.round(bmr),
          tdee: tdee,
          meals: generatedMeals,
          calculationData: {
            sex: form.gender,
            age: form.age,
            weight: form.weight,
            height: totalHeightInches,
            activity: form.activity,
            goal: form.goals, // Legacy field
            primaryGoal: form.primaryGoal || form.goals, // NEW
            secondaryGoals: form.secondaryGoals || [], // NEW
            targetRate: form.targetRate,
            trainingType: form.trainingType
          },
          isMealsOnly: false
        });
      }
      
      setStep('results');
      setLoading(false);
      unlockAchievement('first-plan');
    }, 500);
  };
  
  // Start a new plan creation flow from menu
  // ========== CREATE NEW PLAN (CORRECTED FLOW) ==========
  const startNewPlan = () => {
    // LOGIC-LEAK PREVENTION: Do NOT route to onboarding
    // Do NOT show demographic questions
    
    // If user has an existing unsaved plan, prompt to save it
    if (plan && !savedPlans.find(sp => sp.plan === plan)) {
      const shouldSave = window.confirm(
        'Would you like to save your current plan before creating a new one?'
      );
      
      if (shouldSave) {
        savePlan();
      }
    }
    
    // Set temp config to current plan config (or keep existing defaults)
    setTempPlanConfig({
      activity: planConfig.activity,
      trainingType: planConfig.trainingType,
      goals: planConfig.goals,
      targetRate: planConfig.targetRate,
      trainingDays: planConfig.trainingDays,
      meals: planConfig.meals,
      allergies: planConfig.allergies,
      restrictions: planConfig.restrictions,
      cookTime: planConfig.cookTime,
      dietStyle: planConfig.dietStyle,
      cuisines: planConfig.cuisines
    });
    
    // Open Plan Config flow (NOT onboarding)
    setCreatePlanStep(1);
    setShowCreatePlan(true);
    setMenuOpen(false);
  };
  
  // Generate plan from PlanConfig + UserProfile
  const generatePlanFromConfig = async (config) => {
    try {
      setLoading(true);
      setLoadingStep(0);
      
      const steps = ['Calculating nutrition...', 'Generating meals...', 'Almost ready'];
      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        setLoadingStep(i + 1);
      }
      
      // Give a small delay before final processing
      await new Promise(r => setTimeout(r, 400));
      
      // Use UserProfile (read-only) + PlanConfig to generate
      const combinedForm = {
        ...userProfile,  // Demographics (never re-asked)
        ...config        // Plan settings (editable)
      };
      
      // Calculate nutrition using the same logic as gen()
      const bmr = calculateBMR(userProfile.gender, userProfile.weight, userProfile.height, userProfile.age);
      const tdee = calculateTDEE(bmr, config.activity);
      setBaselineTDEE(tdee);
      setActualTDEE(tdee);
      
      // Use new two-layer goal system (with fallback to legacy)
      const primaryGoal = config.primaryGoal || config.goals || 'maintain';
      const secondaryGoals = config.secondaryGoals || [];
      
      const targetCalories = applyGoalAdjustment(tdee, primaryGoal, secondaryGoals, config.targetRate);
      const macros = calculateMacros(targetCalories, config.trainingType, config.dietStyle, userProfile.weight, secondaryGoals);
      const generatedMeals = generateMealPlan(targetCalories, macros, config.meals, combinedForm);
      
      // Create new plan with config reference
      const newPlan = {
        name: name || 'User',
        calories: targetCalories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        meals: generatedMeals,
        bmr: Math.round(bmr),
        tdee: tdee,
        calculationData: {
          sex: userProfile.gender,
          age: userProfile.age,
          weight: userProfile.weight,
          height: userProfile.height,
          activity: config.activity,
          goal: config.goals, // Legacy field
          primaryGoal: config.primaryGoal || config.goals, // NEW
          secondaryGoals: config.secondaryGoals || [], // NEW
          targetRate: config.targetRate,
          trainingType: config.trainingType
        },
        planConfig: {...config},  // Store plan config with plan
        createdAt: new Date().toISOString(),
        isMealsOnly: false
      };
      
      setPlan(newPlan);
      setPlanConfig(config); // Update active plan config
      setLoading(false);
      setShowCreatePlan(false);
      showToast('New plan created!', 'success');
    } catch (error) {
      console.error('Error creating plan:', error);
      setLoading(false);
      showToast('Error creating plan. Please try again.', 'error');
    }
  };
  // ========== END CREATE NEW PLAN ==========
  
  // ========== IMPORT/EXPORT HELPERS (ADDITIVE) ==========
  
  // Generate clean export text from current plan
  const generateExportText = (planToExport) => {
    if (!planToExport) return '';
    
    try {
      const daysToExport = 7; // Export 7 days
      let text = `MEAL PLAN\n`;
      text += `Calories: ${Math.round(planToExport.calories || 0).toLocaleString()} / day\n`;
      text += `Macros: ${Math.round(planToExport.protein || 0)}g Protein - ${Math.round(planToExport.carbs || 0)}g Carbs - ${Math.round(planToExport.fat || 0)}g Fat\n\n`;
      
      if (!planToExport.meals || planToExport.meals.length === 0) {
        text += `No meals in plan.\n`;
        return text;
      }
      
      for (let day = 1; day <= daysToExport; day++) {
        text += `DAY ${day}\n\n`;
        
        let dayCalories = 0;
        let dayProtein = 0;
        let dayCarbs = 0;
        let dayFat = 0;
        
        planToExport.meals.forEach(meal => {
          text += `${meal.name || 'Unnamed Meal'}\n`;
          
          if (meal.foods && meal.foods.length > 0) {
            meal.foods.forEach(food => {
              text += `- ${food.name || 'Unknown food'}`;
              if (food.portion) text += ` (${food.portion})`;
              text += `\n`;
            });
          }
          
          text += `Calories: ${Math.round(meal.calories || 0)}\n`;
          text += `Macros: ${Math.round(meal.protein || 0)}P / ${Math.round(meal.carbs || 0)}C / ${Math.round(meal.fat || 0)}F\n\n`;
          
          dayCalories += meal.calories || 0;
          dayProtein += meal.protein || 0;
          dayCarbs += meal.carbs || 0;
          dayFat += meal.fat || 0;
        });
        
        text += `Daily Total\n`;
        text += `Calories: ${Math.round(dayCalories).toLocaleString()}\n`;
        text += `Protein: ${Math.round(dayProtein)}g\n`;
        text += `Carbs: ${Math.round(dayCarbs)}g\n`;
        text += `Fat: ${Math.round(dayFat)}g\n\n`;
        
        if (day < daysToExport) text += `---\n\n`;
      }
      
      // Micronutrient highlights (simplified)
      text += `Micronutrient Highlights\n`;
      text += `- Strong in: Protein, Fiber\n`;
      text += `- Balanced in: Vitamins, Minerals\n\n`;
      
      text += `Generated with Plato`;
      
      return text;
    } catch (error) {
      console.error('Error in generateExportText:', error);
      return 'Error generating export text';
    }
  };
  
  // Parse imported text into a meal plan structure
  const parseImportedPlan = async (inputText) => {
    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Mock parser - in production, this would use AI/NLP
    // For now, we'll create a simple pattern-based parser
    
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l);
    const meals = [];
    let currentMeal = null;
    let confidence = 'high';
    
    // Simple heuristic: look for meal names and food items
    const mealNames = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Check if this line is a meal name
      const foundMeal = mealNames.find(m => lowerLine.includes(m));
      if (foundMeal) {
        if (currentMeal) meals.push(currentMeal);
        currentMeal = {
          name: foundMeal.charAt(0).toUpperCase() + foundMeal.slice(1),
          foods: [],
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          confidence: 'high'
        };
      }
      // Check if this is a food item (starts with -, -, or number)
      else if (currentMeal && (line.startsWith('-') || line.startsWith('-') || /^\d/.test(line))) {
        let foodName = line.replace(/^[--\d.)\s]+/, '').trim();
        let portion = '';
        
        // Try to extract portion
        const portionMatch = foodName.match(/\(([^)]+)\)/);
        if (portionMatch) {
          portion = portionMatch[1];
          foodName = foodName.replace(/\([^)]+\)/, '').trim();
        }
        
        // Estimate macros (mock - in production would use food database)
        const estimatedCalories = 100 + Math.random() * 200;
        const estimatedProtein = 10 + Math.random() * 20;
        const estimatedCarbs = 10 + Math.random() * 30;
        const estimatedFat = 5 + Math.random() * 15;
        
        currentMeal.foods.push({
          name: foodName,
          portion: portion || 'estimated',
          calories: estimatedCalories,
          protein: estimatedProtein,
          carbs: estimatedCarbs,
          fat: estimatedFat,
          confidence: portion ? 'high' : 'estimated'
        });
        
        currentMeal.calories += estimatedCalories;
        currentMeal.protein += estimatedProtein;
        currentMeal.carbs += estimatedCarbs;
        currentMeal.fat += estimatedFat;
        
        if (!portion) {
          currentMeal.confidence = 'estimated';
          confidence = 'estimated';
        }
      }
    });
    
    if (currentMeal) meals.push(currentMeal);
    
    // If no meals found, create a default structure
    if (meals.length === 0) {
      meals.push({
        name: 'Breakfast',
        foods: [{
          name: 'Sample Meal',
          portion: '1 serving',
          calories: 400,
          protein: 30,
          carbs: 40,
          fat: 12,
          confidence: 'estimated'
        }],
        calories: 400,
        protein: 30,
        carbs: 40,
        fat: 12,
        confidence: 'estimated'
      });
      confidence = 'estimated';
    }
    
    return {
      meals,
      confidence,
      totalCalories: meals.reduce((sum, m) => sum + m.calories, 0),
      totalProtein: meals.reduce((sum, m) => sum + m.protein, 0),
      totalCarbs: meals.reduce((sum, m) => sum + m.carbs, 0),
      totalFat: meals.reduce((sum, m) => sum + m.fat, 0)
    };
  };
  
  // Create a new plan from imported data
  const createPlanFromImport = () => {
    if (!parsedPlan) return;
    
    const newPlan = {
      name: name || 'User',
      calories: Math.round(parsedPlan.totalCalories),
      protein: Math.round(parsedPlan.totalProtein),
      carbs: Math.round(parsedPlan.totalCarbs),
      fat: Math.round(parsedPlan.totalFat),
      meals: parsedPlan.meals,
      bmr: plan?.bmr || 1500,
      tdee: plan?.tdee || 2000,
      calculationData: plan?.calculationData || {
        sex: userProfile.gender,
        age: userProfile.age,
        weight: userProfile.weight,
        height: userProfile.height,
        activity: 'moderate',
        goal: 'maintenance',
        targetRate: 'moderate',
        trainingType: 'hybrid'
      },
      planConfig: planConfig || {
        activity: 'moderate',
        trainingType: 'hybrid',
        goals: 'maintenance',
        targetRate: 'moderate',
        trainingDays: 3,
        meals: parsedPlan.meals.length,
        allergies: '',
        restrictions: '',
        cookTime: 'any',
        dietStyle: 'balanced',
        cuisines: []
      },
      createdAt: new Date().toISOString(),
      isMealsOnly: false,
      imported: true
    };
    
    setPlan(newPlan);
    setShowImportExport(false);
    setImportMode(false);
    setParsedPlan(null);
    setImportText('');
    setImportStep('input');
    showToast('Plan imported successfully!', 'success');
  };
  
  // Update food portion in parsed plan
  const updateImportedFoodPortion = (mealIndex, foodIndex, newPortion) => {
    if (!parsedPlan) return;
    
    const updated = {...parsedPlan};
    updated.meals[mealIndex].foods[foodIndex].portion = newPortion;
    
    // Recalculate meal macros (in production, would use food database)
    // For now, just update the portion text
    setParsedPlan(updated);
  };
  
  // Remove food from parsed plan
  const removeImportedFood = (mealIndex, foodIndex) => {
    if (!parsedPlan) return;
    
    const updated = {...parsedPlan};
    const removedFood = updated.meals[mealIndex].foods[foodIndex];
    
    // Update meal totals
    updated.meals[mealIndex].calories -= removedFood.calories;
    updated.meals[mealIndex].protein -= removedFood.protein;
    updated.meals[mealIndex].carbs -= removedFood.carbs;
    updated.meals[mealIndex].fat -= removedFood.fat;
    
    // Remove food
    updated.meals[mealIndex].foods.splice(foodIndex, 1);
    
    // Recalculate totals
    updated.totalCalories = updated.meals.reduce((sum, m) => sum + m.calories, 0);
    updated.totalProtein = updated.meals.reduce((sum, m) => sum + m.protein, 0);
    updated.totalCarbs = updated.meals.reduce((sum, m) => sum + m.carbs, 0);
    updated.totalFat = updated.meals.reduce((sum, m) => sum + m.fat, 0);
    
    setParsedPlan(updated);
  };
  
  // Copy text to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
  };
  
  // Download as text file
  const downloadTextFile = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded!', 'success');
  };
  
  // ========== END IMPORT/EXPORT HELPERS ==========
  
  // ========== GROCERY LIST EXECUTION ENGINE (ADDITIVE) ==========
  
  // Generate grocery list from meal plan
  const generateGroceryList = (mealPlan) => {
    if (!mealPlan || !mealPlan.meals) return [];
    
    const ingredientMap = new Map();
    
    mealPlan.meals.forEach(meal => {
      // Support both 'foods' and 'ingredients' arrays
      const items = meal.foods || meal.ingredients || [];
      
      items.forEach(item => {
        // Handle both object format {name, portion} and string format
        const itemName = typeof item === 'string' ? item : item.name;
        const itemPortion = typeof item === 'string' ? '1 serving' : (item.portion || '1 serving');
        
        const key = itemName.toLowerCase().trim();
        
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          // Track which meals use this ingredient
          existing.usedInMeals = (existing.usedInMeals || 1) + 1;
          existing.quantity = `${existing.usedInMeals} portions`;
        } else {
          ingredientMap.set(key, {
            name: itemName,
            portion: itemPortion,
            quantity: itemPortion,
            category: categorizeIngredient(itemName),
            checked: false,
            alreadyHave: false,
            usedInMeals: 1,
            id: Math.random().toString(36).substr(2, 9)
          });
        }
      });
    });
    
    // Convert to array and sort by category
    const categoryOrder = ['Protein', 'Produce', 'Dairy', 'Grains', 'Pantry', 'Frozen', 'Other'];
    const list = Array.from(ingredientMap.values());
    
    return list.sort((a, b) => {
      const catCompare = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (catCompare !== 0) return catCompare;
      return a.name.localeCompare(b.name);
    });
  };
  
  // Categorize ingredient by name (simple heuristic)
  const categorizeIngredient = (name) => {
    const lower = name.toLowerCase();
    
    if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || 
        lower.includes('fish') || lower.includes('salmon') || lower.includes('turkey') ||
        lower.includes('shrimp') || lower.includes('eggs')) {
      return 'Protein';
    }
    if (lower.includes('broccoli') || lower.includes('spinach') || lower.includes('tomato') ||
        lower.includes('lettuce') || lower.includes('carrot') || lower.includes('pepper') ||
        lower.includes('onion') || lower.includes('garlic') || lower.includes('mushroom') ||
        lower.includes('cucumber') || lower.includes('avocado')) {
      return 'Produce';
    }
    if (lower.includes('cheese') || lower.includes('milk') || lower.includes('yogurt') ||
        lower.includes('butter') || lower.includes('cream')) {
      return 'Dairy';
    }
    if (lower.includes('rice') || lower.includes('pasta') || lower.includes('bread') ||
        lower.includes('quinoa') || lower.includes('oats') || lower.includes('tortilla')) {
      return 'Grains';
    }
    if (lower.includes('frozen')) {
      return 'Frozen';
    }
    if (lower.includes('oil') || lower.includes('sauce') || lower.includes('spice') ||
        lower.includes('salt') || lower.includes('pepper')) {
      return 'Pantry';
    }
    
    return 'Other';
  };
  
  // Check if plan has changed since last grocery list generation
  const hasPlanChanged = () => {
    if (!plan || !lastPlanVersion) return false;
    return JSON.stringify(plan.meals) !== JSON.stringify(lastPlanVersion);
  };
  
  // Regenerate grocery list from current plan
  const regenerateGroceryList = () => {
    if (!plan) return;
    
    const newList = generateGroceryList(plan);
    setGroceryList(newList);
    setLastPlanVersion(JSON.parse(JSON.stringify(plan.meals)));
    setGroceryListFinalized(false);
    setShowPlanChangePrompt(false);
  };
  
  // Finalize grocery list (lock it)
  const finalizeGroceryList = () => {
    setGroceryListFinalized(true);
    setLastPlanVersion(JSON.parse(JSON.stringify(plan.meals)));
    showToast('Grocery list finalized', 'success');
  };
  
  // Unfinalize grocery list (unlock it)
  const unfinalizeGroceryList = () => {
    setGroceryListFinalized(false);
    showToast('Grocery list unlocked', 'success');
  };
  
  // Update grocery item quantity
  const updateGroceryQuantity = (index, newQuantity) => {
    const updated = [...groceryList];
    updated[index].quantity = newQuantity;
    setGroceryList(updated);
  };
  
  // Remove grocery item
  const removeGroceryItem = (index) => {
    const updated = groceryList.filter((_, i) => i !== index);
    setGroceryList(updated);
  };
  
  // Toggle grocery item checked (by index, for grocery list screen)
  const toggleGroceryChecked = (index) => {
    const updated = [...groceryList];
    updated[index].checked = !updated[index].checked;
    // When unchecking, also clear already flag
    if (!updated[index].checked) {
      updated[index].already = false;
    }
    setGroceryList(updated);
  };
  
  // Generate provider-formatted grocery list
  const generateProviderFormat = (provider) => {
    let formatted = '';
    
    switch (provider) {
      case 'instacart':
      case 'amazon':
      case 'uber':
        // Simple list format for all providers
        groceryList.forEach(item => {
          if (!item.checked) { // Only include unchecked items
            formatted += `${item.name} - ${item.quantity}\n`;
          }
        });
        break;
      
      case 'copy':
      default:
        // Checklist format
        formatted = ' GROCERY LIST\n\n';
        
        const categories = [...new Set(groceryList.map(i => i.category))];
        categories.forEach(category => {
          formatted += `${category.toUpperCase()}\n`;
          groceryList
            .filter(i => i.category === category && !i.checked)
            .forEach(item => {
              formatted += `☐ ${item.name} - ${item.quantity}\n`;
            });
          formatted += '\n';
        });
        
        formatted += 'Generated with Plato';
        break;
    }
    
    return formatted.trim();
  };
  
  // Redirect to grocery provider
  const orderWithProvider = (provider) => {
    const listText = generateProviderFormat(provider);
    
    let url = '';
    switch (provider) {
      case 'instacart':
        // Instacart doesn't have a direct API, so we'll copy to clipboard
        copyToClipboard(listText);
        url = 'https://www.instacart.com';
        break;
      case 'amazon':
        copyToClipboard(listText);
        url = 'https://www.amazon.com/alm/storefront?almBrandId=QW1hem9uIEZyZXNo';
        break;
      case 'uber':
        copyToClipboard(listText);
        url = 'https://www.ubereats.com/category/grocery';
        break;
      default:
        return;
    }
    
    showToast('Grocery list copied! Opening provider...', 'success');
    setTimeout(() => {
      window.open(url, '_blank');
    }, 500);
    
    setShowOrderGroceries(false);
  };
  
  // ========== END GROCERY LIST HELPERS ==========
  
  // ========== USE INGREDIENTS ADAPTERS (ADDITIVE) ==========
  
  // Mock vision adapter - analyzes images and returns detected ingredients
  const analyzeIngredientsFromImages = async (images) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Mock detection - in production, this would call vision API
    const mockDetected = [
      'chicken breast', 'broccoli', 'rice', 'eggs', 'cheese',
      'tomatoes', 'onions', 'garlic', 'olive oil', 'pasta'
    ];
    
    // Return random subset to simulate detection
    const count = Math.min(images.length * 2, mockDetected.length);
    return mockDetected.slice(0, count);
  };
  
  // Recipe database for ingredient-based generation
  const ingredientRecipeDatabase = [
    // Chicken recipes
    {
      title: 'Garlic Herb Chicken with Roasted Broccoli',
      time: 30,
      difficulty: 'Easy',
      ingredients: ['chicken breast', 'broccoli', 'garlic', 'olive oil', 'herbs'],
      instructions: ['Preheat oven to 400°F', 'Season chicken with garlic and herbs', 'Roast chicken and broccoli for 25 minutes', 'Serve hot'],
      macros: { calories: 380, protein: 42, carbs: 12, fat: 18 }
    },
    {
      title: 'Chicken Fried Rice',
      time: 20,
      difficulty: 'Easy',
      ingredients: ['chicken breast', 'rice', 'eggs', 'onions', 'garlic', 'soy sauce'],
      instructions: ['Cook rice and set aside', 'Dice chicken and cook in pan', 'Push chicken aside, scramble eggs', 'Add rice and mix', 'Season with soy sauce'],
      macros: { calories: 450, protein: 35, carbs: 48, fat: 12 }
    },
    {
      title: 'Creamy Chicken Pasta',
      time: 25,
      difficulty: 'Medium',
      ingredients: ['chicken breast', 'pasta', 'cheese', 'garlic', 'cream'],
      instructions: ['Cook pasta according to package', 'Sauté chicken until golden', 'Add cream and cheese', 'Toss with pasta', 'Garnish and serve'],
      macros: { calories: 520, protein: 38, carbs: 52, fat: 18 }
    },
    // Egg recipes
    {
      title: 'Vegetable Frittata',
      time: 15,
      difficulty: 'Easy',
      ingredients: ['eggs', 'broccoli', 'cheese', 'onions', 'tomatoes'],
      instructions: ['Whisk eggs with cheese', 'Sauté vegetables', 'Pour eggs over vegetables', 'Cook until set', 'Slice and serve'],
      macros: { calories: 280, protein: 22, carbs: 8, fat: 18 }
    },
    {
      title: 'Scrambled Eggs with Tomatoes',
      time: 10,
      difficulty: 'Easy',
      ingredients: ['eggs', 'tomatoes', 'onions', 'cheese'],
      instructions: ['Dice tomatoes and onions', 'Scramble eggs in pan', 'Add vegetables', 'Top with cheese', 'Serve immediately'],
      macros: { calories: 240, protein: 18, carbs: 6, fat: 16 }
    },
    // Pasta recipes
    {
      title: 'Garlic Tomato Pasta',
      time: 20,
      difficulty: 'Easy',
      ingredients: ['pasta', 'tomatoes', 'garlic', 'olive oil', 'cheese'],
      instructions: ['Boil pasta', 'Sauté garlic in olive oil', 'Add diced tomatoes', 'Toss with pasta', 'Top with cheese'],
      macros: { calories: 420, protein: 14, carbs: 68, fat: 12 }
    },
    {
      title: 'Cheesy Broccoli Pasta',
      time: 25,
      difficulty: 'Easy',
      ingredients: ['pasta', 'broccoli', 'cheese', 'garlic', 'olive oil'],
      instructions: ['Cook pasta and broccoli together', 'Drain and return to pot', 'Add cheese and garlic', 'Toss with olive oil', 'Serve warm'],
      macros: { calories: 380, protein: 16, carbs: 58, fat: 10 }
    },
    // Rice bowls
    {
      title: 'Veggie Rice Bowl',
      time: 25,
      difficulty: 'Easy',
      ingredients: ['rice', 'broccoli', 'eggs', 'onions', 'soy sauce'],
      instructions: ['Cook rice', 'Steam broccoli', 'Fry egg sunny-side up', 'Combine in bowl', 'Drizzle with soy sauce'],
      macros: { calories: 340, protein: 14, carbs: 56, fat: 8 }
    },
    {
      title: 'Cheesy Rice Casserole',
      time: 35,
      difficulty: 'Medium',
      ingredients: ['rice', 'cheese', 'broccoli', 'onions', 'cream'],
      instructions: ['Cook rice', 'Mix with cheese and cream', 'Add vegetables', 'Bake at 375°F for 20 minutes', 'Let cool slightly'],
      macros: { calories: 420, protein: 18, carbs: 48, fat: 18 }
    },
    // Simple quick meals
    {
      title: 'Caprese Salad',
      time: 5,
      difficulty: 'Easy',
      ingredients: ['tomatoes', 'cheese', 'olive oil'],
      instructions: ['Slice tomatoes and cheese', 'Arrange on plate', 'Drizzle with olive oil', 'Add salt and pepper', 'Serve fresh'],
      macros: { calories: 220, protein: 12, carbs: 8, fat: 16 }
    },
    {
      title: 'Garlic Sauté Broccoli',
      time: 10,
      difficulty: 'Easy',
      ingredients: ['broccoli', 'garlic', 'olive oil'],
      instructions: ['Cut broccoli into florets', 'Heat olive oil', 'Add garlic and broccoli', 'Sauté until tender', 'Season and serve'],
      macros: { calories: 120, protein: 4, carbs: 12, fat: 7 }
    },
    {
      title: 'Tomato Basil Bruschetta',
      time: 10,
      difficulty: 'Easy',
      ingredients: ['tomatoes', 'garlic', 'olive oil', 'bread'],
      instructions: ['Dice tomatoes', 'Mix with minced garlic', 'Toast bread slices', 'Top with tomato mixture', 'Drizzle with olive oil'],
      macros: { calories: 180, protein: 5, carbs: 28, fat: 6 }
    }
  ];
  
  // PART 7: Macro Estimation Database for Ingredients
  
  /**
   * Simple macro database for common ingredients (per 100g unless specified)
   * Format: { calories, protein, carbs, fat }
   */
  const INGREDIENT_MACROS = {
    // Proteins
    'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
    'pork': { calories: 242, protein: 27, carbs: 0, fat: 14 },
    'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13 },
    'tuna': { calories: 130, protein: 28, carbs: 0, fat: 1 },
    'shrimp': { calories: 99, protein: 24, carbs: 0, fat: 0.3 },
    'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
    
    // Carbs
    'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
    'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
    'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    'oats': { calories: 389, protein: 17, carbs: 66, fat: 7 },
    'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
    
    // Vegetables (low cal)
    'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
    'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    'onion': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
    'pepper': { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2 },
    'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
    
    // Dairy
    'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
    'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
    'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
    
    // Fats (minimal, as they're minor ingredients)
    'oil': { calories: 884, protein: 0, carbs: 0, fat: 100 },
    'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 }
  };
  
  /**
   * Estimate macros for a recipe based on ingredients
   * Returns: { calories, protein, carbs, fat, confidence }
   */
  const estimateRecipeMacros = (ingredients) => {
    if (!ingredients || ingredients.length === 0) {
      return {
        calories: 400,
        protein: 30,
        carbs: 40,
        fat: 15,
        confidence: 0.3,
        source: 'default'
      };
    }
    
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let matchedCount = 0;
    
    ingredients.forEach(ing => {
      const name = typeof ing === 'string' ? ing : (ing.name || ing.strIngredient || '');
      const nameLower = name.toLowerCase();
      
      // Find matching ingredient in database
      let matched = false;
      for (const [key, macros] of Object.entries(INGREDIENT_MACROS)) {
        if (nameLower.includes(key) || key.includes(nameLower)) {
          // Estimate portion size (rough heuristic)
          let portionMultiplier = 1.0; // Default 100g
          
          // Adjust based on typical serving sizes
          if (key === 'rice' || key === 'pasta') portionMultiplier = 1.5; // ~150g cooked
          if (key === 'chicken' || key === 'beef' || key === 'pork') portionMultiplier = 1.5; // ~150g
          if (key === 'egg') portionMultiplier = 1; // 1 egg = ~50g but counted as 1 unit
          if (key === 'oil' || key === 'butter') portionMultiplier = 0.15; // ~15g (1 tbsp)
          
          totalCalories += macros.calories * portionMultiplier;
          totalProtein += macros.protein * portionMultiplier;
          totalCarbs += macros.carbs * portionMultiplier;
          totalFat += macros.fat * portionMultiplier;
          
          matchedCount++;
          matched = true;
          break;
        }
      }
      
      // If no match and it's a primary/secondary ingredient, add generic estimate
      if (!matched) {
        const classification = classifyIngredient(name);
        if (classification === 'primary') {
          // Generic protein or carb
          totalCalories += 150;
          totalProtein += 15;
          totalCarbs += 15;
          totalFat += 3;
        } else if (classification === 'secondary') {
          // Generic vegetable
          totalCalories += 30;
          totalProtein += 2;
          totalCarbs += 6;
          totalFat += 0.3;
        }
        // Minor ingredients ignored
      }
    });
    
    // Calculate confidence based on match rate
    const primarySecondaryCount = ingredients.filter(ing => {
      const name = typeof ing === 'string' ? ing : (ing.name || ing.strIngredient || '');
      const classification = classifyIngredient(name);
      return classification !== 'minor';
    }).length;
    
    const confidence = primarySecondaryCount > 0 
      ? Math.min(0.9, matchedCount / primarySecondaryCount)
      : 0.5;
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      confidence: confidence,
      source: 'estimated'
    };
  };
  
  // PART 4: Ingredient Classification & Scoring
  
  /**
   * Classify ingredient as Primary, Secondary, or Minor
   */
  const classifyIngredient = (ingredientName) => {
    const name = ingredientName.toLowerCase();
    
    // MINOR: Spices, herbs, condiments, oils (ignored in scoring)
    const minorKeywords = [
      // Spices & herbs
      'salt', 'pepper', 'cumin', 'paprika', 'oregano', 'basil', 'thyme', 
      'rosemary', 'cinnamon', 'nutmeg', 'ginger', 'garlic powder', 'onion powder',
      'chili powder', 'cayenne', 'turmeric', 'coriander', 'parsley', 'cilantro',
      'dill', 'mint', 'sage', 'bay leaf', 'clove',
      // Condiments
      'soy sauce', 'fish sauce', 'worcestershire', 'vinegar', 'mustard',
      'ketchup', 'hot sauce', 'sriracha', 'lemon juice', 'lime juice',
      // Oils & fats
      'oil', 'olive oil', 'vegetable oil', 'coconut oil', 'butter', 'ghee',
      // Baking
      'baking powder', 'baking soda', 'yeast', 'vanilla', 'extract'
    ];
    
    if (minorKeywords.some(keyword => name.includes(keyword) || keyword.includes(name))) {
      return 'minor';
    }
    
    // PRIMARY: Proteins, main carbs, high-calorie items
    const primaryKeywords = [
      // Proteins
      'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'fish', 'salmon',
      'tuna', 'cod', 'shrimp', 'prawn', 'crab', 'lobster', 'scallop',
      'tofu', 'tempeh', 'seitan', 'egg',
      // Main carbs
      'rice', 'pasta', 'noodle', 'bread', 'tortilla', 'potato', 'sweet potato',
      'quinoa', 'couscous', 'bulgur', 'farro', 'polenta'
    ];
    
    if (primaryKeywords.some(keyword => name.includes(keyword) || keyword.includes(name))) {
      return 'primary';
    }
    
    // SECONDARY: Everything else (vegetables, fruits, dairy, nuts, sauces with substance)
    return 'secondary';
  };
  
  /**
   * Calculate ingredient match score for a recipe
   * Returns: { score, primaryMatched, secondaryMatched, primaryTotal, secondaryTotal, displayText }
   */
  const calculateIngredientScore = (recipe, userIngredients) => {
    // Defensive check
    if (!recipe || !recipe.ingredients || !Array.isArray(recipe.ingredients)) {
      return {
        score: 0,
        percentage: 0,
        primaryMatched: 0,
        secondaryMatched: 0,
        primaryTotal: 0,
        secondaryTotal: 0,
        displayText: 'Uses 0 of 0 main ingredients (0%)'
      };
    }
    
    // Classify all recipe ingredients
    let primaryTotal = 0;
    let secondaryTotal = 0;
    let primaryMatched = 0;
    let secondaryMatched = 0;
    
    recipe.ingredients.forEach(ingredient => {
      // Handle both string format and object format
      const ingredientName = typeof ingredient === 'string' 
        ? ingredient 
        : (ingredient.name || ingredient.strIngredient || '');
      
      if (!ingredientName) return; // Skip if no name
      
      const classification = classifyIngredient(ingredientName);
      
      if (classification === 'minor') {
        return; // Ignore in scoring
      }
      
      // Check if user has this ingredient
      const userHasIt = userIngredients.some(userIng => {
        if (!userIng || typeof userIng !== 'string') return false;
        const userLower = userIng.toLowerCase();
        const recipeLower = ingredientName.toLowerCase();
        return recipeLower.includes(userLower) || userLower.includes(recipeLower);
      });
      
      if (classification === 'primary') {
        primaryTotal++;
        if (userHasIt) primaryMatched++;
      } else if (classification === 'secondary') {
        secondaryTotal++;
        if (userHasIt) secondaryMatched++;
      }
    });
    
    // Calculate weighted score
    const weightedMatched = (primaryMatched * 2) + (secondaryMatched * 1);
    const weightedTotal = (primaryTotal * 2) + (secondaryTotal * 1);
    
    const score = weightedTotal > 0 ? (weightedMatched / weightedTotal) : 0;
    const percentage = Math.round(score * 100);
    
    // Generate display text
    const totalMainIngredients = primaryTotal + secondaryTotal;
    const totalMatched = primaryMatched + secondaryMatched;
    const displayText = `Uses ${totalMatched} of ${totalMainIngredients} main ingredients (${percentage}%)`;
    
    return {
      score,
      percentage,
      primaryMatched,
      secondaryMatched,
      primaryTotal,
      secondaryTotal,
      displayText
    };
  };
  
  // Generate recipes from ingredients - simple keyword matching
  // PART 3: MealDB API Integration
  const generateRecipesFromIngredients = async (ingredients, options) => {
    try {
      const candidateRecipes = new Map(); // Use Map to deduplicate by recipe ID
      
      // Step 1: Call MealDB filter.php for each included ingredient
      for (const ingredient of ingredients) {
        try {
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
          const data = await response.json();
          
          if (data.meals) {
            // Add each meal to candidate set
            data.meals.forEach(meal => {
              if (!candidateRecipes.has(meal.idMeal)) {
                candidateRecipes.set(meal.idMeal, {
                  id: meal.idMeal,
                  name: meal.strMeal,
                  image: meal.strMealThumb,
                  source: 'mealdb',
                  matchedIngredients: [ingredient]
                });
              } else {
                // Add this ingredient to matched list
                candidateRecipes.get(meal.idMeal).matchedIngredients.push(ingredient);
              }
            });
          }
        } catch (err) {
          console.error(`Error fetching recipes for ingredient "${ingredient}":`, err);
        }
      }
      
      if (candidateRecipes.size === 0) {
        return []; // No recipes found for any ingredient
      }
      
      // Step 2: Fetch full details for each candidate recipe
      const detailedRecipes = [];
      const recipeIds = Array.from(candidateRecipes.keys()).slice(0, 20); // Limit to 20 for performance
      
      for (const recipeId of recipeIds) {
        try {
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
          const data = await response.json();
          
          if (data.meals && data.meals[0]) {
            const meal = data.meals[0];
            
            // Extract ingredients from meal
            const recipeIngredients = [];
            for (let i = 1; i <= 20; i++) {
              const ingredient = meal[`strIngredient${i}`];
              const measure = meal[`strMeasure${i}`];
              if (ingredient && ingredient.trim()) {
                recipeIngredients.push({
                  name: ingredient.trim(),
                  measure: measure?.trim() || ''
                });
              }
            }
            
            // Step 3: Apply allergen/restriction filtering (hard filter)
            const restrictionString = form.restrictions || form.allergies || '';
            const forbiddenKeywords = parseRestrictions(restrictionString);
            
            // Check if recipe contains any allergen/restriction
            const hasRestriction = recipeIngredients.some(ing => {
              const ingName = ing.name.toLowerCase();
              return Array.from(forbiddenKeywords).some(forbidden => 
                ingName.includes(forbidden) || forbidden.includes(ingName)
              );
            });
            
            if (hasRestriction) {
              continue; // Skip this recipe - contains allergen
            }
            
            // Step 4: Apply user-defined exclusions (hard filter)
            const hasExcludedIngredient = recipeIngredients.some(ing => {
              const ingName = ing.name.toLowerCase();
              return excludedIngredients.some(excluded => 
                ingName.includes(excluded) || excluded.includes(ingName)
              );
            });
            
            if (hasExcludedIngredient) {
              continue; // Skip this recipe - contains excluded ingredient
            }
            
            // Parse instructions
            const instructions = meal.strInstructions 
              ? meal.strInstructions.split(/\r?\n/).filter(s => s.trim().length > 0)
              : [];
            
            // Get matched ingredients from candidate
            const candidate = candidateRecipes.get(recipeId);
            
            detailedRecipes.push({
              id: meal.idMeal,
              name: meal.strMeal,
              image: meal.strMealThumb,
              category: meal.strCategory,
              area: meal.strArea,
              ingredients: recipeIngredients,
              instructions: instructions,
              source: 'mealdb',
              tags: meal.strTags ? meal.strTags.split(',') : [],
              youtubeUrl: meal.strYoutube,
              matchedIngredients: candidate.matchedIngredients
            });
          }
        } catch (err) {
          console.error(`Error fetching details for recipe ${recipeId}:`, err);
        }
      }
      
      // Step 5: Apply ingredient scoring to each recipe
      const scoredRecipes = detailedRecipes.map(recipe => {
        const scoreData = calculateIngredientScore(recipe, ingredients);
        return {
          ...recipe,
          ingredientScore: scoreData.score,
          ingredientPercentage: scoreData.percentage,
          ingredientMatchText: scoreData.displayText,
          primaryMatched: scoreData.primaryMatched,
          secondaryMatched: scoreData.secondaryMatched,
          primaryTotal: scoreData.primaryTotal,
          secondaryTotal: scoreData.secondaryTotal
        };
      });
      
      // Step 6: Sort by ingredient match score (highest first)
      scoredRecipes.sort((a, b) => b.ingredientScore - a.ingredientScore);
      
      return scoredRecipes;
      
    } catch (error) {
      console.error('Error in generateRecipesFromIngredients:', error);
      return [];
    }
  };
  
  // Add recipe to meal plan (opens meal slot picker)
  const addRecipeToMealPlan = (recipe) => {
    // Convert recipe to meal format and use existing addToPlanRecipe flow
    if (!plan || !plan.meals) {
      showToast('Please create a meal plan first', 'error');
      return;
    }
    
    // Convert MealDB recipe format to internal format
    const convertedRecipe = {
      id: recipe.id,
      title: recipe.name || recipe.title,
      creatorName: recipe.area || 'MealDB',
      source: recipe.source || 'mealdb',
      ingredients: (recipe.ingredients || []).map(ing => {
        const name = typeof ing === 'string' ? ing : (ing.name || ing.strIngredient || '');
        const measure = typeof ing === 'string' ? '' : (ing.measure || ing.strMeasure || '');
        return {
          quantity: 1,
          unit: measure || '',
          name: name
        };
      }),
      instructions: recipe.instructions || [],
      // PART 7: Use macro estimation for MealDB recipes
      nutritionPerServing: (() => {
        // If recipe already has macros, use them
        if (recipe.macros) {
          return recipe.macros;
        }
        if (recipe.calories && recipe.protein && recipe.carbs && recipe.fat) {
          return {
            calories: recipe.calories,
            protein: recipe.protein,
            carbs: recipe.carbs,
            fat: recipe.fat
          };
        }
        
        // Otherwise, estimate from ingredients
        const estimated = estimateRecipeMacros(recipe.ingredients);
        return {
          calories: estimated.calories,
          protein: estimated.protein,
          carbs: estimated.carbs,
          fat: estimated.fat,
          _macroConfidence: estimated.confidence,
          _macroSource: 'estimated'
        };
      })(),
      servings: 1,
      cookTime: recipe.time || 30,
      category: recipe.category || 'Main',
      cuisine: recipe.area || '',
      // Pass through scoring data
      ingredientScore: recipe.ingredientScore,
      ingredientPercentage: recipe.ingredientPercentage,
      ingredientMatchText: recipe.ingredientMatchText
    };
    
    // Set as recipe to add and open modal
    setAddToPlanRecipe(convertedRecipe);
    setShowAddToPlanModal(true);
    setShowUseIngredients(false); // Close the use ingredients modal
  };
  
  // Add missing ingredients to grocery list
  const addMissingToGrocery = (recipe) => {
    if (!recipe.missingIngredients || recipe.missingIngredients.length === 0) {
      showToast('No missing ingredients!', 'info');
      return;
    }
    const newItems = recipe.missingIngredients.map(ing => ({
      id: Math.random().toString(36).substr(2, 9),
      name: ing,
      quantity: '1 serving',
      category: categorizeIngredient(ing),
      checked: false,
      alreadyHave: false,
      usedInMeals: 1
    }));
    setGroceryList(prev => [...prev, ...newItems]);
    showToast(`Added ${recipe.missingIngredients.length} items to grocery list!`, 'success');
  };
  
  // Reset Use Ingredients flow
  const resetIngredientFlow = () => {
    setIngredientFlowStep(1);
    setSelectedImages([]);
    setManualIngredients([]);
    setDetectedIngredients([]);
    setConfirmedIngredients([]);
    setExcludedIngredients([]);
    setIngredientRecipeSuggestions([]);
    setSelectedIngredientRecipe(null);
    setCurrentIngredientInput('');
    setCurrentExcludeInput(''); // PART 2: Clear exclude input
    setShowExcludeSection(false); // PART 2: Collapse exclude section
  };
  
  // ========== INSIGHT & INTENT LOGIC (ADDITIVE) ==========
  
  // FEATURE C: Meal Confidence Badge - score calculation
  const getMealConfidence = (meal) => {
    if (!meal || !plan) return null;
    
    // Extract meal macros
    const { calories, protein, carbs, fat } = meal;
    const dailyCalories = plan.calories;
    
    // Calculate macro percentages of this meal
    const proteinCals = protein * 4;
    const carbCals = carbs * 4;
    const fatCals = fat * 9;
    const totalMacroCalories = proteinCals + carbCals + fatCals;
    
    const proteinPercent = (proteinCals / totalMacroCalories) * 100;
    const proteinGramsPerCal = protein / calories;
    
    // Calorie density relative to daily target
    const caloriesPerMeal = dailyCalories / (plan.meals?.length || 3);
    const calorieDensityRatio = calories / caloriesPerMeal;
    
    // Micronutrient strength (if available in meal data)
    const hasMicroData = meal.micronutrients && Object.keys(meal.micronutrients).length > 0;
    let microStrength = 0;
    if (hasMicroData) {
      // Count how many micros are >30% of RDA
      const strongMicros = Object.values(meal.micronutrients).filter(val => val > 30).length;
      microStrength = strongMicros;
    }
    
    // Soft heuristic classification (no hard thresholds)
    
    // Protein-forward: High protein density + significant protein percentage
    if (proteinGramsPerCal > 0.15 && proteinPercent > 35) {
      return {
        label: 'Protein-forward',
        explanation: 'High protein with substantial amino acid coverage',
        icon: 'zap'
      };
    }
    
    // Micronutrient-dense: Strong micro presence + reasonable calories
    if (microStrength >= 4 && calorieDensityRatio < 1.3) {
      return {
        label: 'Micronutrient-dense',
        explanation: 'Rich in vitamins and minerals relative to calories',
        icon: 'activity'
      };
    }
    
    // Energy-dense: High calories relative to typical meal
    if (calorieDensityRatio > 1.4) {
      return {
        label: 'Energy-dense',
        explanation: 'Higher calorie concentration for fueling activity',
        icon: 'flame'
      };
    }
    
    // Light / Low-energy: Lower calories, balanced macros
    if (calorieDensityRatio < 0.7) {
      return {
        label: 'Light',
        explanation: 'Lower calorie option with adequate nutrition',
        icon: 'feather'
      };
    }
    
    // Balanced: Everything else (most meals fall here)
    return {
      label: 'Balanced',
      explanation: 'Well-distributed macros with complete nutrition',
      icon: 'circle'
    };
  };
  
  // FEATURE D: Future You - Weight Range Forecast
  const calculateFutureYouForecast = () => {
    // Require minimum data points
    if (weighIns.length < 3) {
      return {
        hasData: false,
        weightRange: null,
        energyTrend: null,
        adherenceRisk: null
      };
    }
    
    // Calculate average daily calorie balance (last 7 days of tracking)
    const recentLogs = trackingHistory.slice(-7);
    if (recentLogs.length < 3) {
      return { hasData: false };
    }
    
    const avgDailyIntake = recentLogs.reduce((sum, log) => {
      const dayTotal = log.meals.reduce((mealSum, m) => mealSum + (m.calories || 0), 0);
      return sum + dayTotal;
    }, 0) / recentLogs.length;
    
    const targetCalories = plan?.calories || actualTDEE;
    const avgDailyBalance = avgDailyIntake - targetCalories;
    
    // Weight change forecast using 3500 cal ≈ 1 lb rule
    const forecastDays = 14;
    const totalBalanceOver14Days = avgDailyBalance * forecastDays;
    const expectedWeightChange = totalBalanceOver14Days / 3500; // in lbs
    
    // Calculate recent weight trend as confidence modifier
    const recentWeighIns = weighIns.slice(-7);
    let trendVolatility = 0;
    
    if (recentWeighIns.length >= 3) {
      const weights = recentWeighIns.map(w => w.weight);
      const diffs = [];
      for (let i = 1; i < weights.length; i++) {
        diffs.push(Math.abs(weights[i] - weights[i-1]));
      }
      trendVolatility = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    }
    
    // Adjust range width based on volatility
    // Low volatility = narrower range, high volatility = wider range
    const baseRangeWidth = 0.5; // lbs
    const volatilityMultiplier = Math.min(2, 1 + (trendVolatility * 0.5));
    const rangeWidth = baseRangeWidth * volatilityMultiplier;
    
    // Calculate range (always show range, never single value)
    const weightRangeLow = expectedWeightChange - rangeWidth;
    const weightRangeHigh = expectedWeightChange + rangeWidth;
    
    // Clamp extreme values
    const clampedLow = Math.max(-5, Math.min(5, weightRangeLow));
    const clampedHigh = Math.max(-5, Math.min(5, weightRangeHigh));
    
    // Energy Trend (qualitative)
    let energyTrend = 'stable';
    const calorieAdequacy = avgDailyIntake / targetCalories;
    const carbAdequacy = recentLogs.reduce((sum, log) => {
      const dayCarbs = log.meals.reduce((mealSum, m) => mealSum + (m.carbs || 0), 0);
      return sum + dayCarbs;
    }, 0) / recentLogs.length;
    
    const targetCarbs = plan?.carbs || 200;
    const carbRatio = carbAdequacy / targetCarbs;
    
    if (calorieAdequacy > 0.95 && carbRatio > 0.9) {
      energyTrend = 'improving';
    } else if (calorieAdequacy < 0.80 || carbRatio < 0.70) {
      energyTrend = 'likely low';
    } else if (trendVolatility > 1.5) {
      energyTrend = 'volatile';
    }
    
    // Adherence Risk (qualitative)
    let adherenceRisk = 'low';
    const missedMeals = recentLogs.reduce((count, log) => {
      const expectedMeals = plan?.meals?.length || 3;
      const actualMeals = log.meals.length;
      return count + Math.max(0, expectedMeals - actualMeals);
    }, 0);
    
    const swapCount = recentLogs.reduce((count, log) => {
      return count + (log.swaps || 0);
    }, 0);
    
    const caloriSwings = recentLogs.map(log => {
      const dayTotal = log.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
      return Math.abs(dayTotal - targetCalories);
    });
    const avgSwing = caloriSwings.reduce((a, b) => a + b, 0) / caloriSwings.length;
    
    if (missedMeals > 3 || swapCount > 5 || avgSwing > 400) {
      adherenceRisk = 'elevated';
    } else if (missedMeals > 1 || swapCount > 2 || avgSwing > 250) {
      adherenceRisk = 'moderate';
    }
    
    return {
      hasData: true,
      weightRange: {
        low: clampedLow,
        high: clampedHigh,
        days: forecastDays
      },
      energyTrend,
      adherenceRisk,
      dataQuality: {
        logCount: recentLogs.length,
        weighInCount: recentWeighIns.length
      }
    };
  };
  
  // ========== END INSIGHT & INTENT LOGIC ==========
  
  // Reset Use Ingredients flow (duplicate removed)
  
  // ========== END USE INGREDIENTS ADAPTERS ==========
  
  // ========== NUTRIENT SUPPORT SUGGESTIONS (ADDITIVE) ==========
  
  // Nutrient -> Food sources mapping
  const NUTRIENT_FOOD_SOURCES = {
    vitaminC: {
      name: 'Vitamin C',
      foods: ['Bell peppers', 'Oranges', 'Strawberries', 'Broccoli', 'Brussels sprouts', 'Kiwi'],
      mealAddIns: ['Add citrus to breakfast', 'Include colorful veggies at lunch', 'Snack on berries']
    },
    vitaminD: {
      name: 'Vitamin D',
      foods: ['Fatty fish (salmon, mackerel)', 'Egg yolks', 'Fortified milk', 'Fortified cereals', 'Mushrooms (UV-exposed)'],
      mealAddIns: ['Include fatty fish 2-3x/week', 'Use fortified milk', 'Get sunlight exposure']
    },
    calcium: {
      name: 'Calcium',
      foods: ['Dairy products', 'Fortified plant milk', 'Leafy greens', 'Sardines with bones', 'Tofu (calcium-set)', 'Almonds'],
      mealAddIns: ['Add cheese to meals', 'Include yogurt as snack', 'Use fortified milk']
    },
    iron: {
      name: 'Iron',
      foods: ['Red meat', 'Poultry', 'Beans', 'Lentils', 'Spinach', 'Fortified cereals'],
      mealAddIns: ['Pair iron sources with vitamin C', 'Include lean meats', 'Add beans to meals']
    },
    magnesium: {
      name: 'Magnesium',
      foods: ['Nuts (almonds, cashews)', 'Seeds (pumpkin)', 'Whole grains', 'Spinach', 'Black beans', 'Avocado'],
      mealAddIns: ['Snack on nuts', 'Use whole grains', 'Add seeds to meals']
    },
    potassium: {
      name: 'Potassium',
      foods: ['Bananas', 'Sweet potatoes', 'Spinach', 'Beans', 'Yogurt', 'Salmon'],
      mealAddIns: ['Include potatoes/sweet potatoes', 'Add bananas to breakfast', 'Use beans in meals']
    },
    zinc: {
      name: 'Zinc',
      foods: ['Oysters', 'Beef', 'Pumpkin seeds', 'Chickpeas', 'Cashews', 'Chicken'],
      mealAddIns: ['Include lean meats', 'Snack on seeds', 'Add legumes to meals']
    },
    vitaminB12: {
      name: 'Vitamin B12',
      foods: ['Meat', 'Fish', 'Eggs', 'Dairy', 'Fortified cereals', 'Nutritional yeast'],
      mealAddIns: ['Include animal products daily', 'Use fortified cereals', 'Add nutritional yeast']
    }
  };
  
  // Supplement information with safe ranges
  const SUPPLEMENT_INFO = {
    vitaminC: {
      forms: ['capsule', 'chewable', 'powder'],
      range: '500-1000mg daily',
      note: 'Water-soluble, excess excreted'
    },
    vitaminD: {
      forms: ['softgel', 'gummy', 'drops'],
      range: '1000-2000 IU daily',
      note: 'Fat-soluble, take with food'
    },
    calcium: {
      forms: ['tablet', 'chewable', 'gummy'],
      range: '500-1000mg daily',
      note: 'Split doses for better absorption'
    },
    iron: {
      forms: ['tablet', 'liquid', 'gummy'],
      range: '18-27mg daily',
      note: 'May cause constipation, take with vitamin C'
    },
    magnesium: {
      forms: ['capsule', 'powder', 'gummy'],
      range: '200-400mg daily',
      note: 'Glycinate form for better tolerance'
    },
    zinc: {
      forms: ['tablet', 'lozenge', 'capsule'],
      range: '15-30mg daily',
      note: 'Take with food to avoid nausea'
    },
    vitaminB12: {
      forms: ['sublingual', 'capsule', 'spray'],
      range: '500-1000mcg daily',
      note: 'Sublingual may absorb better'
    }
  };
  
  // Performance supplements (Advanced Mode only)
  const PERFORMANCE_SUPPLEMENTS = {
    creatine: {
      name: 'Creatine Monohydrate',
      purpose: 'Supports strength and power output',
      range: '3-5g daily',
      note: 'Well-researched, no loading phase needed',
      forms: ['powder', 'capsule']
    },
    omega3: {
      name: 'Omega-3 (EPA/DHA)',
      purpose: 'Supports recovery and joint health',
      range: '1000-2000mg combined EPA+DHA daily',
      note: 'Choose molecularly distilled for purity',
      forms: ['softgel', 'liquid']
    },
    electrolytes: {
      name: 'Electrolyte Mix',
      purpose: 'Supports hydration during training',
      range: '1-2 servings on training days',
      note: 'Useful for intense or long sessions',
      forms: ['powder', 'tablet']
    },
    protein: {
      name: 'Protein Powder',
      purpose: 'Convenient protein source',
      range: '20-30g per serving',
      note: 'Whole foods preferred, but convenient',
      forms: ['powder (whey)', 'powder (plant)']
    }
  };
  
  // Analyze nutrient status over time range
  const analyzeNutrientStatus = (timeRangeDays) => {
    if (!dailyLog || !dailyLog.meals || dailyLog.meals.length === 0) {
      return { consistentlyLow: [], adequate: [], noData: true };
    }
    
    // For MVP, analyze current day's logged meals
    // In production, would analyze multiple days from history
    const summary = calculateDailyMicros(dailyLog.meals);
    if (!summary) {
      return { consistentlyLow: [], adequate: [], noData: true };
    }
    
    const consistentlyLow = [];
    const adequate = [];
    
    Object.keys(summary.percentages).forEach(nutrient => {
      const pct = summary.percentages[nutrient];
      const info = NUTRIENT_FOOD_SOURCES[nutrient];
      
      if (info) {
        if (pct < 50) {
          consistentlyLow.push({
            nutrient,
            name: info.name,
            percentage: pct,
            foods: info.foods,
            mealAddIns: info.mealAddIns
          });
        } else {
          adequate.push({ nutrient, name: info.name, percentage: pct });
        }
      }
    });
    
    return { consistentlyLow, adequate, noData: false };
  };
  
  // Build Amazon search links
  const buildAmazonSearchLinks = (supplementKey, isPerformance = false) => {
    const info = isPerformance ? PERFORMANCE_SUPPLEMENTS[supplementKey] : SUPPLEMENT_INFO[supplementKey];
    if (!info) return [];
    
    const nutrientName = isPerformance ? info.name : NUTRIENT_FOOD_SOURCES[supplementKey]?.name || supplementKey;
    const baseQuery = nutrientName.toLowerCase().replace(/[()]/g, '');
    
    const links = [
      {
        label: 'Best value search',
        url: `https://www.amazon.com/s?k=${encodeURIComponent(baseQuery + ' ' + info.forms[0] + ' 250 count')}`
      },
      {
        label: 'Third-party tested',
        url: `https://www.amazon.com/s?k=${encodeURIComponent(baseQuery + ' USP verified ' + info.forms[0])}`
      }
    ];
    
    if (info.forms.length > 1) {
      links.push({
        label: `${info.forms[1]} form`,
        url: `https://www.amazon.com/s?k=${encodeURIComponent(baseQuery + ' ' + info.forms[1])}`
      });
    }
    
    return links;
  };
  
  // ========== END NUTRIENT SUPPORT SUGGESTIONS ==========
  
  // ========== BUG FIX: RESTRICTION FILTERING ==========
  
  /**
   * Restriction synonyms for semantic matching
   * Maps user input to expanded list of forbidden keywords
   */
  const RESTRICTION_SYNONYMS = {
    'tree_nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut'],
    'nuts': ['almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut', 'peanut', 'nut butter'],
    'peanuts': ['peanut'],
    'peanut': ['peanut'],
    'dairy': ['milk', 'yogurt', 'cheese', 'butter', 'cream', 'whey'],
    'gluten': ['wheat', 'bread', 'pasta', 'tortilla', 'oats', 'flour'],
    'soy': ['soy', 'tofu', 'edamame', 'tempeh'],
    'eggs': ['egg'],
    'egg': ['egg'],
    'shellfish': ['shrimp', 'crab', 'lobster', 'shellfish'],
    'fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia'],
  };
  
  /**
   * Parse restriction string into normalized forbidden keyword set
   */
  const parseRestrictions = (restrictionString) => {
    if (!restrictionString || typeof restrictionString !== 'string') {
      return new Set();
    }
    
    // Split by commas and spaces, lowercase, trim
    const tokens = restrictionString
      .toLowerCase()
      .split(/[,\s]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    const forbiddenKeywords = new Set();
    
    for (let token of tokens) {
      // Normalize variants
      if (token === 'tree nuts' || token === 'treenuts') {
        token = 'tree_nuts';
      }
      
      // Check if it's a known category
      if (RESTRICTION_SYNONYMS[token]) {
        RESTRICTION_SYNONYMS[token].forEach(kw => forbiddenKeywords.add(kw));
      } else {
        // Add the token itself as a keyword
        // Also check for plural/singular variants
        forbiddenKeywords.add(token);
        
        // Add plural if singular
        if (!token.endsWith('s')) {
          forbiddenKeywords.add(token + 's');
        }
        // Add singular if plural
        if (token.endsWith('s') && token.length > 2) {
          forbiddenKeywords.add(token.slice(0, -1));
        }
      }
    }
    
    return forbiddenKeywords;
  };
  
  /**
   * Check if a meal is allowed given forbidden keywords
   */
  const isMealAllowed = (meal, forbiddenKeywords) => {
    if (!forbiddenKeywords || forbiddenKeywords.size === 0) {
      return true;
    }
    
    // Check meal name
    const mealNameLower = (meal.name || '').toLowerCase();
    for (const keyword of forbiddenKeywords) {
      if (mealNameLower.includes(keyword)) {
        return false;
      }
    }
    
    // Check ingredients
    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      for (const ingredient of meal.ingredients) {
        const ingredientLower = (ingredient || '').toLowerCase();
        for (const keyword of forbiddenKeywords) {
          if (ingredientLower.includes(keyword)) {
            return false;
          }
        }
      }
    }
    
    return true;
  };
  
  // ========== INTERNAL TESTING HELPERS ==========
  
  /**
   * Test meal macro calculation against ingredient sums
   * Call manually in console: testMealMacroMath()
   */
  const testMealMacroMath = () => {
    console.log('=== MEAL MACRO MATH TEST ===');
    
    const testMeals = [
      {
        name: 'Test: Lean Beef Stir Fry',
        ingredients: ['6oz lean beef', '1 cup rice', 'Stir fry vegetables', 'Soy sauce']
      },
      {
        name: 'Test: Protein Pancakes',
        ingredients: ['2 scoops protein powder', '2 eggs', '1 banana', '1/4 cup oats']
      },
      {
        name: 'Test: Apple & Almond Butter',
        ingredients: ['1 large apple', '2 tbsp almond butter']
      }
    ];
    
    testMeals.forEach(meal => {
      const computed = computeMealMacrosFromIngredients(meal.ingredients);
      const calorieCheck = (computed.protein * 4) + (computed.carbs * 4) + (computed.fat * 9);
      const calorieMatch = Math.abs(calorieCheck - computed.calories) <= 1;
      
      console.log(`\n${meal.name}:`);
      console.log(`  Ingredients: ${meal.ingredients.join(', ')}`);
      console.log(`  Computed: ${computed.protein}p / ${computed.carbs}c / ${computed.fat}f = ${computed.calories} cal`);
      console.log(`  4/4/9 Check: ${calorieCheck} cal (${calorieMatch ? '✔ PASS' : '✘ FAIL'})`);
    });
    
    console.log('\n=== END TEST ===');
  };
  
  /**
   * Test restriction filtering
   * Call manually in console: testRestrictionFiltering()
   */
  const testRestrictionFiltering = () => {
    console.log('=== RESTRICTION FILTERING TEST ===');
    
    const testCases = [
      {
        restriction: 'treenuts',
        meals: [
          { name: 'Apple & Almond Butter', ingredients: ['1 apple', '2 tbsp almond butter'] },
          { name: 'Chicken & Rice', ingredients: ['6oz chicken', '1 cup rice'] }
        ]
      },
      {
        restriction: 'nuts, peanuts',
        meals: [
          { name: 'Peanut Butter Toast', ingredients: ['2 slices toast', '2 tbsp peanut butter'] },
          { name: 'Walnut Salad', ingredients: ['Lettuce', 'Walnuts'] },
          { name: 'Plain Chicken', ingredients: ['6oz chicken breast'] }
        ]
      }
    ];
    
    testCases.forEach(testCase => {
      console.log(`\nRestriction: "${testCase.restriction}"`);
      const forbidden = parseRestrictions(testCase.restriction);
      console.log(`  Forbidden keywords: ${Array.from(forbidden).join(', ')}`);
      
      testCase.meals.forEach(meal => {
        const allowed = isMealAllowed(meal, forbidden);
        console.log(`  ${meal.name}: ${allowed ? '✔ ALLOWED' : '✘ BLOCKED'}`);
      });
    });
    
    console.log('\n=== END TEST ===');
  };
  
  // Expose test functions to window for manual testing
  if (typeof window !== 'undefined') {
    window.testMealMacroMath = testMealMacroMath;
    window.testRestrictionFiltering = testRestrictionFiltering;
  }
  
  // ========== END BUG FIXES ==========


  // ========== SCANNING FEATURE ==========
  
  // Nutrition Lookup Service (Mock with realistic API structure)
  const lookupBarcode = async (code) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    // Extended mock database with real product examples
    const mockDatabase = {
      '012000161551': {
        name: 'Greek Yogurt - Plain Nonfat',
        brand: 'Chobani',
        servingSize: '170g',
        nutrition: { calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0, sugar: 4 }
      },
      '028400064903': {
        name: 'Chocolate Chip Cookie Dough Protein Bar',
        brand: 'Quest',
        servingSize: '60g',
        nutrition: { calories: 200, protein: 20, carbs: 22, fat: 9, fiber: 14, sugar: 1 }
      },
      '018894009429': {
        name: 'Organic Brown Rice',
        brand: 'Lundberg',
        servingSize: '45g',
        nutrition: { calories: 160, protein: 4, carbs: 35, fat: 1.5, fiber: 2, sugar: 0 }
      },
      '041220576142': {
        name: 'Creamy Peanut Butter',
        brand: 'Jif',
        servingSize: '32g',
        nutrition: { calories: 190, protein: 8, carbs: 7, fat: 16, fiber: 2, sugar: 3 }
      },
      '030000010426': {
        name: 'Cheerios Cereal',
        brand: 'General Mills',
        servingSize: '28g',
        nutrition: { calories: 100, protein: 3, carbs: 20, fat: 2, fiber: 3, sugar: 1 }
      },
      '021130126019': {
        name: 'Organic Whole Milk',
        brand: 'Horizon',
        servingSize: '240ml',
        nutrition: { calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, sugar: 12 }
      }
    };
    
    if (mockDatabase[code]) {
      return { success: true, ...mockDatabase[code], barcode: code, source: 'local' };
    }
    
    // In production, uncomment this to use Open Food Facts:
    /*
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}.json`
      );
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        return {
          success: true,
          name: data.product.product_name || 'Unknown Product',
          brand: data.product.brands || '',
          servingSize: data.product.serving_size || '100g',
          nutrition: {
            calories: Math.round(data.product.nutriments['energy-kcal_100g'] || 0),
            protein: Math.round(data.product.nutriments.proteins_100g || 0),
            carbs: Math.round(data.product.nutriments.carbohydrates_100g || 0),
            fat: Math.round(data.product.nutriments.fat_100g || 0),
            fiber: Math.round(data.product.nutriments.fiber_100g || 0),
            sugar: Math.round(data.product.nutriments.sugars_100g || 0)
          },
          imageUrl: data.product.image_url,
          barcode: code,
          source: 'openfoodfacts'
        };
      }
    } catch (error) {
      console.error('Open Food Facts API error:', error);
    }
    */
    
    // Fallback: generate realistic mock data with variation
    const foodTypes = [
      { name: 'Protein Bar', calRange: [180, 220], proteinRange: [15, 25] },
      { name: 'Greek Yogurt', calRange: [80, 150], proteinRange: [12, 20] },
      { name: 'Granola', calRange: [120, 180], proteinRange: [3, 6] },
      { name: 'Almond Butter', calRange: [180, 220], proteinRange: [6, 10] },
      { name: 'Protein Shake', calRange: [140, 180], proteinRange: [20, 30] }
    ];
    
    const randomFood = foodTypes[Math.floor(Math.random() * foodTypes.length)];
    const calories = Math.floor(Math.random() * (randomFood.calRange[1] - randomFood.calRange[0])) + randomFood.calRange[0];
    const protein = Math.floor(Math.random() * (randomFood.proteinRange[1] - randomFood.proteinRange[0])) + randomFood.proteinRange[0];
    
    return {
      success: true,
      name: randomFood.name,
      brand: 'Generic Brand',
      servingSize: '100g',
      nutrition: {
        calories,
        protein,
        carbs: Math.floor((calories - (protein * 4)) * 0.6 / 4),
        fat: Math.floor((calories - (protein * 4)) * 0.4 / 9),
        fiber: Math.floor(Math.random() * 5),
        sugar: Math.floor(Math.random() * 10)
      },
      barcode: code,
      source: 'generated'
    };
  };

  // Plate AI Service (Sophisticated Mock)
  const analyzePlate = async (imageDataUrl, sizeContext = {}) => {
    setAnalyzing(true);
    
    // Deterministic pipeline: Vision -> Portion -> Nutrition -> Scoring
    const errors = [];
    const debugInfo = {
      sizeContext: sizeContext // Store user-provided size context
    };
    
    let pipelineResult = {
      success: true,
      confidence: 0.0,
      foods: [],
      totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      needsReview: true,
      errors: [],
      imageUrl: imageDataUrl,
      debug: {}
    };
    
    try {
      // STEP 1: Vision Identification
      const visionResult = await visionIdentifyFoods(imageDataUrl);
      
      // Store vision debug info
      if (visionResult.debug) {
        debugInfo.vision = visionResult.debug;
      }
      
      if (!visionResult.success) {
        errors.push(visionResult.error || 'Vision analysis failed');
        pipelineResult.confidence = 0.0;
        pipelineResult.debug = debugInfo;
      } else {
        // STEP 2: Portion Estimation (with user-provided size context)
        const portionResult = await portionEstimate(visionResult.items, sizeContext);
        
        // STEP 3: Nutrition Lookup
        const nutritionStartTime = Date.now();
        const nutritionResult = await nutritionLookup(portionResult.items);
        const nutritionEndTime = Date.now();
        
        // Store nutrition debug info
        debugInfo.nutrition = {
          lookupTimeMs: nutritionEndTime - nutritionStartTime,
          itemsProcessed: nutritionResult.items.length,
          cacheHits: nutritionResult.items.filter(i => 
            nutritionCacheRef.current.has(i.name.toLowerCase().trim())
          ).length,
          sources: nutritionResult.items.reduce((acc, item) => {
            acc[item.nutritionSource] = (acc[item.nutritionSource] || 0) + 1;
            return acc;
          }, {}),
          timestamp: new Date().toISOString()
        };
        
        // STEP 4: Confidence Scoring
        const scoringResult = calculatePlateConfidence(nutritionResult.items);
        
        pipelineResult = {
          success: true,
          confidence: scoringResult.overallConfidence,
          foods: nutritionResult.items,
          totalNutrition: nutritionResult.totals,
          needsReview: scoringResult.overallConfidence < 0.75,
          errors: [],
          imageUrl: imageDataUrl,
          debug: debugInfo
        };
      }
    } catch (error) {
      errors.push(`Analysis error: ${error.message}`);
      pipelineResult.confidence = 0.0;
      debugInfo.error = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      pipelineResult.debug = debugInfo;
    }
    
    // If vision/nutrition not configured, return low-confidence placeholder
    if (errors.length > 0) {
      pipelineResult = {
        success: true,
        confidence: 0.0,
        foods: [{
          id: 'placeholder-1',
          name: 'Unverified items (requires review)',
          portion: 'Unknown',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          confidence: 0.0,
          source: 'placeholder'
        }],
        totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        needsReview: true,
        errors: errors,
        imageUrl: imageDataUrl,
        debug: debugInfo
      };
    }
    
    setAnalyzing(false);
    return pipelineResult;
  };
  
  // ========== PLATE ANALYSIS PIPELINE STEPS ==========
  
  /**
   * STEP 1: Vision Identification
   * Uses Claude Vision API to identify foods in image
   * Returns: { success, items: [{ name, category, visiblePortionPercent, confidence, notes }], debug }
   */
  const visionIdentifyFoods = async (imageDataUrl) => {
    // Enable vision analysis (using Claude's built-in API access in artifacts)
    const hasVisionAPI = true;
    
    if (!hasVisionAPI) {
      return {
        success: false,
        error: 'Vision API not configured',
        items: [],
        debug: {}
      };
    }
    
    try {
      // Calculate image size for debugging
      const imageSizeBytes = Math.round((imageDataUrl.length * 3) / 4);
      
      // Extract base64 data and detect media type
      let base64Data, mediaType;
      
      if (imageDataUrl.startsWith('data:')) {
        // Extract media type from data URL
        const matches = imageDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mediaType = matches[1]; // e.g., "image/jpeg" or "image/png" or "image/avif"
          base64Data = matches[2];
        } else {
          throw new Error('Invalid data URL format');
        }
      } else {
        // Assume it's already base64 without prefix
        base64Data = imageDataUrl;
        mediaType = 'image/jpeg'; // Default fallback
      }
      
      // Claude API only supports: jpeg, png, webp, gif
      const claudeSupportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      
      // If format is not supported (e.g., AVIF, HEIC), convert to JPEG
      if (!claudeSupportedTypes.includes(mediaType)) {
        console.log(`Converting unsupported format ${mediaType} to JPEG...`);
        
        // Convert to JPEG using canvas
        const convertedDataUrl = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Convert to JPEG with 92% quality
            const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
            resolve(jpegDataUrl);
          };
          img.onerror = () => reject(new Error(`Failed to load image for conversion from ${mediaType}`));
          img.src = imageDataUrl;
        });
        
        // Extract the converted JPEG data
        const jpegMatches = convertedDataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (jpegMatches) {
          mediaType = jpegMatches[1];
          base64Data = jpegMatches[2];
          console.log(`Converted to ${mediaType}`);
        }
      }
      
      // Claude Vision API — temporarily disabled to control API costs
      // Re-enable when backend proxy is set up
      throw new Error('SCAN_DISABLED');
      // eslint-disable-next-line no-unreachable
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk-ant-api03-', // API key handled by Claude artifacts environment
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          temperature: 0, // Deterministic - same image always gives same result
          messages: [{
            role: 'user',
            content: [{
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            }, {
              type: 'text',
              text: `Analyze this meal photo and identify all visible foods.

CRITICAL: Return ONLY valid JSON with this exact structure (no markdown, no backticks, no preamble):

{
  "items": [
    {
      "name": "roasted chicken thigh",
      "category": "protein",
      "visiblePortionPercent": 85,
      "confidence": 0.88,
      "notes": "Appears to have crispy skin, likely roasted or grilled"
    }
  ]
}

RULES:
1. Detect ONLY foods clearly visible in the image
2. Use specific names: "roasted chicken thigh" not just "chicken"
3. Include cooking method if visible: roasted, grilled, fried, steamed, raw
4. Categories: protein, carb, vegetable, fruit, dairy, fat, sauce, beverage
5. visiblePortionPercent: How much of a typical serving is visible (0-100)
6. confidence: 0.0-1.0 based on how certain you are
7. For sauces/oils/dressings: ONLY include if clearly visible (pooling, sheen, drizzle)
   - If uncertain about sauce: confidence < 0.6
   - Default assumption: NO hidden sauces unless visible
8. If multiple candidates (e.g., "could be beef or pork"):
   - Add primary item with lower confidence (0.6-0.7)
   - Add note: "Could also be [alternative]"
9. Provide honest confidence scores:
   - 0.9+: Completely certain
   - 0.7-0.9: Very likely
   - 0.5-0.7: Probable but uncertain
   - <0.5: Guessing, include alternatives in notes

Return ONLY the JSON object. No explanation before or after.`
            }]
          }]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vision API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Extract text content
      const textContent = data.content.find(c => c.type === 'text')?.text || '';
      
      // Parse JSON (handle markdown wrappers and various formats)
      let parsedJson;
      try {
        // First try direct parse
        parsedJson = JSON.parse(textContent);
      } catch (e) {
        // Remove markdown code blocks (```json ... ``` or ``` ... ```)
        let cleanedText = textContent.trim();
        
        // Remove opening markdown fence
        cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/i, '');
        
        // Remove closing markdown fence
        cleanedText = cleanedText.replace(/\n?```\s*$/i, '');
        
        // Try parsing cleaned text
        try {
          parsedJson = JSON.parse(cleanedText);
        } catch (e2) {
          // Last resort: extract anything between { and }
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedJson = JSON.parse(jsonMatch[0]);
          } else {
            // Log the problematic response for debugging
            console.error('Failed to parse JSON from vision response:', textContent);
            throw new Error(`Could not extract valid JSON from response. Raw text: ${textContent.substring(0, 200)}...`);
          }
        }
      }
      
      // Validate structure
      if (!parsedJson.items || !Array.isArray(parsedJson.items)) {
        throw new Error('Invalid JSON structure: missing items array');
      }
      
      // Validate each item
      parsedJson.items.forEach((item, idx) => {
        if (!item.name) throw new Error(`Item ${idx}: missing name`);
        if (!item.category) throw new Error(`Item ${idx}: missing category`);
        if (typeof item.visiblePortionPercent !== 'number') throw new Error(`Item ${idx}: invalid visiblePortionPercent`);
        if (typeof item.confidence !== 'number') throw new Error(`Item ${idx}: invalid confidence`);
      });
      
      return {
        success: true,
        items: parsedJson.items.map((item, idx) => ({
          id: `vision-${Date.now()}-${idx}`,
          name: item.name,
          category: item.category,
          visiblePortionPercent: item.visiblePortionPercent,
          detectionConfidence: item.confidence,
          notes: item.notes || '',
          source: 'vision'
        })),
        debug: {
          visionRawJson: textContent,
          visionModel: 'claude-sonnet-4-20250514',
          imageSizeBytes: imageSizeBytes,
          mediaType: mediaType,
          originalMediaType: imageDataUrl.startsWith('data:') ? imageDataUrl.match(/^data:([^;]+);/)?.[1] : 'unknown',
          itemCount: parsedJson.items.length,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Vision identification error:', error);
      return {
        success: false,
        error: error.message,
        items: [],
        debug: {
          errorMessage: error.message,
          errorStack: error.stack,
          timestamp: new Date().toISOString()
        }
      };
    }
  };
  
  /**
   * STEP 2: Portion Estimation (Conservative by Default)
   * Estimates portion sizes with bounds to avoid overestimation
   * Returns: { items: [{ ...food, portionGrams, gramsLow, gramsHigh, portionConfidence }] }
   */
  const portionEstimate = async (items, sizeContext = {}) => {
    // Extract size context with defaults
    const {
      plateSize: userPlateSize = plateSize,
      mealSizeEstimate = 'medium',
      plateDimension = null
    } = sizeContext;
    
    return {
      items: items.map(item => {
        const portionEstimate = estimatePortionsConservative(
          item, 
          userPlateSize, 
          mealSizeEstimate, 
          plateDimension
        );
        return {
          ...item,
          portionGrams: portionEstimate.grams,
          gramsLow: portionEstimate.gramsLow,
          gramsHigh: portionEstimate.gramsHigh,
          portionText: generatePortionText(
            portionEstimate.grams, 
            item.name, 
            item.category, 
            portionEstimate.gramsLow, 
            portionEstimate.gramsHigh
          ),
          portionConfidence: portionEstimate.confidence,
          portionBasis: portionEstimate.basis
        };
      })
    };
  };
  
  /**
   * Conservative portion estimation with bounds
   * Avoids overestimation - "confidently wrong" is worse than "uncertain but safe"
   */
  const estimatePortionsConservative = (item, userPlateSize, mealSizeEstimate = 'medium', plateDimension = null) => {
    const category = item.category;
    const visiblePercent = item.visiblePortionPercent || 100;
    const notes = item.notes || '';
    
    // MEAL SIZE MULTIPLIER (user context)
    let mealSizeMultiplier = 1.0;
    if (mealSizeEstimate === 'small') mealSizeMultiplier = 0.75;
    else if (mealSizeEstimate === 'large') mealSizeMultiplier = 1.3;
    // medium stays at 1.0
    
    // CONSERVATIVE DEFAULTS (smaller than typical restaurant portions)
    const conservativeDefaults = {
      'protein': {
        base: 120,        // 4.2 oz (vs typical 6 oz) - conservative
        min: 80,          // 2.8 oz - lower bound
        max: 180,         // 6.3 oz - upper bound
        confidence: 0.65
      },
      'carb': {
        base: 150,        // ~1 cup cooked (standard serving)
        min: 100,         // ~2/3 cup
        max: 220,         // ~1.5 cups
        confidence: 0.70
      },
      'vegetable': {
        base: 80,         // Conservative (vs 100g typical)
        min: 50,
        max: 120,
        confidence: 0.72
      },
      'fruit': {
        base: 120,
        min: 80,
        max: 160,
        confidence: 0.70
      },
      'dairy': {
        base: 200,        // ~3/4 cup (vs typical 1 cup)
        min: 150,
        max: 300,
        confidence: 0.68
      },
      'fat': {
        base: 0,          // DEFAULT TO ZERO unless visible
        min: 0,
        max: 5,
        confidence: 0.50
      },
      'sauce': {
        base: 0,          // DEFAULT TO ZERO unless visible
        min: 0,
        max: 10,
        confidence: 0.50
      },
      'beverage': {
        base: 240,
        min: 180,
        max: 350,
        confidence: 0.75
      }
    };
    
    const defaults = conservativeDefaults[category] || {
      base: 100,
      min: 60,
      max: 150,
      confidence: 0.60
    };
    
    // SAUCE/OIL SPECIAL HANDLING - only if explicitly visible
    if (category === 'sauce' || category === 'fat') {
      // Check if notes indicate visibility
      const visibilityKeywords = ['sheen', 'pooling', 'drizzle', 'visible', 'coating', 'glossy'];
      const hasVisibilityIndicator = visibilityKeywords.some(kw => notes.toLowerCase().includes(kw));
      
      if (!hasVisibilityIndicator && visiblePercent < 40) {
        // Not clearly visible - assume minimal
        return {
          grams: 0,
          gramsLow: 0,
          gramsHigh: 5,
          confidence: 0.40,
          basis: 'not clearly visible, assumed minimal'
        };
      } else if (hasVisibilityIndicator) {
        // Visible but still conservative
        return {
          grams: category === 'sauce' ? 10 : 5,
          gramsLow: 5,
          gramsHigh: category === 'sauce' ? 20 : 15,
          confidence: 0.55,
          basis: 'visible but conservative estimate'
        };
      }
    }
    
    // PLATE SIZE CALIBRATION
    let plateSizeMultiplier = 1.0;
    let plateSizeConfidencePenalty = 0;
    
    // If custom dimension provided, use it directly
    if (plateDimension && plateDimension > 0) {
      // Standard plate is 10.25", so scale relative to that
      plateSizeMultiplier = plateDimension / 10.25;
      plateSizeConfidencePenalty = 0; // User provided exact measurement - high confidence
    } else if (userPlateSize === 'small') {
      plateSizeMultiplier = 0.85;  // 9" plate - portions typically smaller
      plateSizeConfidencePenalty = 0;
    } else if (userPlateSize === 'standard') {
      plateSizeMultiplier = 1.0;   // 10.25" plate - baseline
      plateSizeConfidencePenalty = 0;
    } else if (userPlateSize === 'large') {
      plateSizeMultiplier = 1.15;  // 12" plate - portions typically larger
      plateSizeConfidencePenalty = 0;
    } else {
      // Unknown plate size - assume standard but reduce confidence
      plateSizeMultiplier = 1.0;
      plateSizeConfidencePenalty = 0.10;
    }
    
    // VISIBLE PORTION ADJUSTMENT
    // Be conservative with scaling - Don't over-extrapolate from partial views
    let portionMultiplier = visiblePercent / 100;
    
    // If only partial portion visible, increase uncertainty
    let uncertaintyMultiplier = 1.0;
    if (visiblePercent < 60) {
      // Less than 60% visible - wider bounds, lower confidence
      uncertaintyMultiplier = 1.4;
      plateSizeConfidencePenalty += 0.10;
    } else if (visiblePercent < 80) {
      // 60-80% visible - moderate uncertainty
      uncertaintyMultiplier = 1.2;
      plateSizeConfidencePenalty += 0.05;
    }
    
    // SIZE CUES FROM NOTES
    const sizeKeywords = {
      large: ['large', 'big', 'thick', 'generous', 'full'],
      small: ['small', 'thin', 'light', 'minimal', 'little']
    };
    
    let sizeAdjustment = 1.0;
    const notesLower = notes.toLowerCase();
    
    if (sizeKeywords.large.some(kw => notesLower.includes(kw))) {
      sizeAdjustment = 1.15;
    } else if (sizeKeywords.small.some(kw => notesLower.includes(kw))) {
      sizeAdjustment = 0.85;
    }
    
    // CALCULATE FINAL ESTIMATE (including meal size estimate)
    const baseGrams = defaults.base * plateSizeMultiplier * portionMultiplier * sizeAdjustment * mealSizeMultiplier;
    const rangeLow = defaults.min * plateSizeMultiplier * portionMultiplier * sizeAdjustment * mealSizeMultiplier / uncertaintyMultiplier;
    const rangeHigh = defaults.max * plateSizeMultiplier * portionMultiplier * sizeAdjustment * mealSizeMultiplier * uncertaintyMultiplier;
    
    // CONFIDENCE CALCULATION
    let confidence = defaults.confidence;
    confidence -= plateSizeConfidencePenalty;
    
    // Reduce confidence if bounds are very wide
    const boundsRatio = rangeHigh / Math.max(rangeLow, 1);
    if (boundsRatio > 2.5) {
      confidence -= 0.10;
    } else if (boundsRatio > 2.0) {
      confidence -= 0.05;
    }
    
    // Cap confidence
    confidence = Math.max(0.30, Math.min(0.85, confidence));
    
    // GENERATE BASIS DESCRIPTION
    let basis = 'conservative default';
    if (userPlateSize !== 'unknown') {
      basis = `${userPlateSize} plate, ${Math.round(visiblePercent)}% visible`;
    } else {
      basis = `assumed standard plate, ${Math.round(visiblePercent)}% visible`;
    }
    
    if (sizeAdjustment !== 1.0) {
      basis += sizeAdjustment > 1 ? ', appears large' : ', appears small';
    }
    
    return {
      grams: Math.round(baseGrams),
      gramsLow: Math.round(rangeLow),
      gramsHigh: Math.round(rangeHigh),
      confidence: Math.round(confidence * 100) / 100,
      basis: basis
    };
  };
  
  /**
   * STEP 3: Nutrition Lookup
   * Looks up nutrition data from USDA FoodData Central with caching
   * Returns: { items: [{ ...food, calories, protein, carbs, fat, fiber, nutritionConfidence }], totals }
   */
  const nutritionLookup = async (items) => {
    const hasNutritionAPI = true; // USDA FDC is free and public
    
    if (!hasNutritionAPI) {
      return {
        items: items.map(item => ({
          ...item,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          nutritionConfidence: 0.0,
          nutritionSource: 'none'
        })),
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      };
    }
    
    const enrichedItems = [];
    
    for (const item of items) {
      try {
        // Get nutrition data (with caching)
        const nutritionData = await lookupUSDANutrition(item.name, item.category);
        
        // Estimate portion if not already set
        const portionGrams = item.portionGrams || estimatePortionGrams(item);
        const gramsLow = item.gramsLow || Math.round(portionGrams * 0.7);
        const gramsHigh = item.gramsHigh || Math.round(portionGrams * 1.3);
        
        // Calculate macros from per-100g values
        const macros = calculateMacrosFromPer100g(nutritionData.per100g, portionGrams);
        
        // Generate friendly portion text
        const portionText = generatePortionText(portionGrams, item.name, item.category, gramsLow, gramsHigh);
        
        enrichedItems.push({
          ...item,
          portion: portionText,
          portionGrams: portionGrams,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          fiber: macros.fiber || 0,
          sugar: macros.sugar || 0,
          nutritionConfidence: nutritionData.confidence,
          nutritionSource: nutritionData.source,
          fdcId: nutritionData.fdcId,
          foodDescription: nutritionData.description
        });
      } catch (error) {
        console.error(`Nutrition lookup failed for ${item.name}:`, error);
        // Fallback to estimated values
        enrichedItems.push({
          ...item,
          portion: 'Unknown',
          portionGrams: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          nutritionConfidence: 0.0,
          nutritionSource: 'error'
        });
      }
    }
    
    // Calculate totals
    const totals = enrichedItems.reduce((sum, item) => ({
      calories: sum.calories + (item.calories || 0),
      protein: sum.protein + (item.protein || 0),
      carbs: sum.carbs + (item.carbs || 0),
      fat: sum.fat + (item.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return {
      items: enrichedItems,
      totals: totals
    };
  };
  
  /**
   * Lookup nutrition data from USDA FoodData Central with caching
   */
  const lookupUSDANutrition = async (foodName, category) => {
    // Normalize food name for cache key
    const normalizedKey = foodName.toLowerCase().trim();
    
    // Check cache first
    const cached = nutritionCacheRef.current.get(normalizedKey);
    if (cached) {
      console.log(`Cache hit for: ${foodName}`);
      return cached;
    }
    
    console.log(`Cache miss, querying USDA for: ${foodName}`);
    
    try {
      // Query USDA FoodData Central
      const searchQuery = encodeURIComponent(foodName);
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${searchQuery}&pageSize=10&api_key=${USDA_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.foods || data.foods.length === 0) {
        throw new Error('No foods found in USDA database');
      }
      
      // Rank and select best match
      const bestMatch = rankUSDAMatches(data.foods, foodName, category);
      
      if (!bestMatch) {
        throw new Error('No suitable match found');
      }
      
      // Extract nutrition per 100g
      const per100g = extractNutritionPer100g(bestMatch);
      
      const nutritionData = {
        per100g: per100g,
        confidence: bestMatch.matchScore,
        source: 'usda',
        fdcId: bestMatch.fdcId,
        description: bestMatch.description
      };
      
      // Cache the result
      nutritionCacheRef.current.set(normalizedKey, nutritionData);
      
      return nutritionData;
      
    } catch (error) {
      console.error('USDA lookup error:', error);
      // Return estimated values as fallback
      return {
        per100g: estimateMacrosPer100g(category),
        confidence: 0.4,
        source: 'estimated',
        fdcId: null,
        description: 'Estimated values (USDA lookup failed)'
      };
    }
  };
  
  /**
   * Rank USDA matches and select best one
   */
  const rankUSDAMatches = (foods, searchTerm, category) => {
    const searchLower = searchTerm.toLowerCase();
    
    const scoredFoods = foods.map(food => {
      let score = 0.5; // Base score
      const description = food.description.toLowerCase();
      
      // Prefer Foundation and SR Legacy over branded
      if (food.dataType === 'Foundation') score += 0.3;
      else if (food.dataType === 'SR Legacy') score += 0.25;
      else if (food.dataType === 'Survey (FNDDS)') score += 0.2;
      
      // Exact word matches
      const searchWords = searchLower.split(/\s+/);
      const descWords = description.split(/\s+/);
      const matchingWords = searchWords.filter(w => descWords.includes(w));
      score += (matchingWords.length / searchWords.length) * 0.3;
      
      // Cooking method match (roasted, grilled, fried, steamed, raw)
      const cookingMethods = ['roasted', 'roast', 'grilled', 'grill', 'fried', 'fry', 'steamed', 'steam', 'baked', 'bake', 'raw'];
      const searchHasMethod = cookingMethods.some(m => searchLower.includes(m));
      const descHasMethod = cookingMethods.some(m => description.includes(m));
      
      if (searchHasMethod && descHasMethod) {
        const matchingMethod = cookingMethods.find(m => searchLower.includes(m) && description.includes(m));
        if (matchingMethod) score += 0.2;
      }
      
      // Penalize if search has cooking method but desc doesn't (or vice versa)
      if (searchHasMethod && !descHasMethod) score -= 0.1;
      
      // Category-specific preferences
      if (category === 'protein') {
        if (description.includes('meat') || description.includes('poultry') || 
            description.includes('fish') || description.includes('seafood')) {
          score += 0.1;
        }
      }
      
      // Prefer simpler descriptions (less likely to be complex recipes)
      if (description.split(',').length <= 2) score += 0.05;
      
      return {
        ...food,
        matchScore: Math.min(0.95, score)
      };
    });
    
    // Sort by score descending
    scoredFoods.sort((a, b) => b.matchScore - a.matchScore);
    
    return scoredFoods[0];
  };
  
  /**
   * Extract nutrition values per 100g from USDA food object
   */
  const extractNutritionPer100g = (food) => {
    const nutrients = food.foodNutrients || [];
    
    const findNutrient = (searchTerms) => {
      const nutrient = nutrients.find(n => 
        searchTerms.some(term => 
          n.nutrientName?.toLowerCase().includes(term.toLowerCase())
        )
      );
      return nutrient?.value || 0;
    };
    
    // Extract nutrients (USDA values are already per 100g for most entries)
    const calories = findNutrient(['energy', 'calories']);
    const protein = findNutrient(['protein']);
    const carbs = findNutrient(['carbohydrate, by difference', 'carbohydrate']);
    const fat = findNutrient(['total lipid', 'fat, total']);
    const fiber = findNutrient(['fiber, total dietary', 'fiber']);
    const sugar = findNutrient(['sugars, total', 'sugar']);
    
    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
      sugar: Math.round(sugar * 10) / 10
    };
  };
  
  /**
   * Calculate macros from per-100g values scaled to portion
   */
  const calculateMacrosFromPer100g = (per100g, grams) => {
    const multiplier = grams / 100;
    
    return {
      calories: Math.round(per100g.calories * multiplier),
      protein: Math.round(per100g.protein * multiplier * 10) / 10,
      carbs: Math.round(per100g.carbs * multiplier * 10) / 10,
      fat: Math.round(per100g.fat * multiplier * 10) / 10,
      fiber: Math.round((per100g.fiber || 0) * multiplier * 10) / 10,
      sugar: Math.round((per100g.sugar || 0) * multiplier * 10) / 10
    };
  };
  
  /**
   * Estimate portion in grams based on visiblePortionPercent and category
   */
  const estimatePortionGrams = (item) => {
    const visiblePercent = item.visiblePortionPercent || 100;
    
    // Typical serving sizes in grams by category
    const typicalServings = {
      'protein': 170, // ~6 oz
      'carb': 150,    // ~1 cup cooked rice/pasta
      'vegetable': 100, // ~1 cup
      'fruit': 120,   // ~1 medium fruit
      'dairy': 245,   // ~1 cup
      'fat': 14,      // ~1 tbsp
      'sauce': 30,    // ~2 tbsp
      'beverage': 240 // ~1 cup
    };
    
    const baseGrams = typicalServings[item.category] || 100;
    return Math.round(baseGrams * (visiblePercent / 100));
  };
  
  /**
   * Generate friendly portion text with household equivalents
   * Now uses conservative midpoint estimate with bounds stored separately
   */
  const generatePortionText = (grams, foodName, category, gramsLow, gramsHigh) => {
    if (!grams || grams === 0) return 'Unknown';
    
    const portions = [];
    
    // Add grams (midpoint)
    portions.push(`${grams}g`);
    
    // Add range if available and significant
    if (gramsLow && gramsHigh && (gramsHigh - gramsLow) > grams * 0.3) {
      portions.push(`(${gramsLow}-${gramsHigh}g range)`);
    }
    
    // Add household equivalents based on category and grams
    if (category === 'protein') {
      const oz = Math.round(grams / 28.35);
      if (oz >= 1) portions.push(`~${oz} oz`);
    } else if (category === 'carb' || category === 'vegetable') {
      const cups = grams / 150;
      if (cups >= 0.25 && cups < 0.4) portions.push('~1/4 cup');
      else if (cups >= 0.4 && cups < 0.6) portions.push('~1/2 cup');
      else if (cups >= 0.6 && cups < 0.9) portions.push('~3/4 cup');
      else if (cups >= 0.9 && cups < 1.3) portions.push('~1 cup');
      else if (cups >= 1.3 && cups < 1.7) portions.push('~1.5 cups');
      else if (cups >= 1.7) portions.push(`~${Math.round(cups * 2) / 2} cups`);
    } else if (category === 'fat' || category === 'sauce') {
      if (grams === 0) {
        portions.push('(not visible)');
      } else {
        const tbsp = Math.round(grams / 14);
        if (tbsp >= 1) portions.push(`~${tbsp} tbsp`);
        else {
          const tsp = Math.round(grams / 5);
          if (tsp >= 1) portions.push(`~${tsp} tsp`);
        }
      }
    } else if (category === 'beverage' || category === 'dairy') {
      const cups = grams / 240;
      if (cups >= 0.9) portions.push(`~${Math.round(cups * 2) / 2} cups`);
      else {
        const oz = Math.round(grams / 30);
        if (oz >= 1) portions.push(`~${oz} fl oz`);
      }
    }
    
    return portions.join(' - ');
  };
  
  /**
   * Fallback macro estimation by category (when USDA fails)
   */
  const estimateMacrosPer100g = (category) => {
    const estimates = {
      'protein': { calories: 165, protein: 25, carbs: 0, fat: 7 },
      'carb': { calories: 130, protein: 3, carbs: 28, fat: 0.5 },
      'vegetable': { calories: 30, protein: 2, carbs: 6, fat: 0.2 },
      'fruit': { calories: 50, protein: 0.5, carbs: 13, fat: 0.2 },
      'dairy': { calories: 60, protein: 3.5, carbs: 5, fat: 3 },
      'fat': { calories: 880, protein: 0, carbs: 0, fat: 100 },
      'sauce': { calories: 50, protein: 1, carbs: 8, fat: 2 },
      'beverage': { calories: 40, protein: 0, carbs: 10, fat: 0 }
    };
    
    return estimates[category] || { calories: 100, protein: 5, carbs: 15, fat: 3 };
  };
  
  /**
   * STEP 4: Confidence Scoring
   * Calculates overall plate confidence
   * Returns: { overallConfidence, needsReview }
   */
  const calculatePlateConfidence = (items) => {
    if (items.length === 0) {
      return {
        overallConfidence: 0.0,
        needsReview: true
      };
    }
    
    // Weighted average: detection 40%, portion 30%, nutrition 30%
    const overallConfidence = items.reduce((sum, item) => {
      const itemConfidence = 
        (item.detectionConfidence || 0) * 0.4 +
        (item.portionConfidence || 0) * 0.3 +
        (item.nutritionConfidence || 0) * 0.3;
      return sum + itemConfidence;
    }, 0) / items.length;
    
    return {
      overallConfidence: Math.round(overallConfidence * 100) / 100,
      needsReview: overallConfidence < 0.75
    };
  };

  // ========== RECIPE FUNCTIONS (ADDITIVE) ==========
  
  const searchRecipesWithAI = async (query) => {
    setRecipeSearchLoading(true);
    setRecipeSearchResults([]);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResults = [
      {
        id: `search-${Date.now()}-1`,
        title: 'High Protein Brownies',
        sourceType: 'web',
        sourceUrl: 'https://example.com/recipe1',
        creatorName: 'FitnessFoodie',
        servings: 12,
        ingredients: [
          { name: 'black beans', quantity: '1', unit: 'can (15oz)', optional: false },
          { name: 'protein powder', quantity: '1/2', unit: 'cup', optional: false },
          { name: 'cocoa powder', quantity: '1/3', unit: 'cup', optional: false },
          { name: 'eggs', quantity: '3', unit: 'large', optional: false },
          { name: 'honey', quantity: '1/3', unit: 'cup', optional: false }
        ],
        steps: [
          'Preheat oven to 350°F and grease an 8x8 baking pan',
          'Drain and rinse black beans thoroughly',
          'Blend beans, eggs, honey, and vanilla until smooth',
          'Mix in protein powder and cocoa powder',
          'Pour into pan and bake for 25-30 minutes'
        ],
        nutritionPerServing: { calories: 145, protein: 8, carbs: 22, fat: 3 },
        tags: ['high-protein', 'dessert'],
        createdAt: new Date().toISOString()
      }
    ];
    
    setRecipeSearchResults(mockResults);
    setRecipeSearchLoading(false);
  };
  
  const importFromYouTube = async (url) => {
    setYoutubeImportLoading(true);
    
    try {
      // Extract video ID from URL
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
      if (!videoId) {
        showToast('Invalid YouTube URL', 'error');
        setYoutubeImportLoading(false);
        return;
      }
      
      // Simulate fetching transcript and AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulated AI-extracted recipe (this demonstrates what the real API would return)
      // In production, you'd fetch real transcript and use Claude API
      const extractedRecipe = {
        title: 'Chicken Teriyaki Bowl',
        servings: 4,
        ingredients: [
          { name: 'chicken breast', quantity: '1.5', unit: 'lbs', optional: false },
          { name: 'soy sauce', quantity: '1/4', unit: 'cup', optional: false },
          { name: 'honey', quantity: '2', unit: 'tbsp', optional: false },
          { name: 'garlic', quantity: '3', unit: 'cloves', optional: false },
          { name: 'fresh ginger', quantity: '1', unit: 'tbsp', optional: false },
          { name: 'white rice', quantity: '2', unit: 'cups', optional: false },
          { name: 'broccoli', quantity: '2', unit: 'cups', optional: false }
        ],
        steps: [
          'Cook rice according to package directions',
          'Cut chicken into bite-sized pieces',
          'In a small bowl, mix soy sauce, honey, minced garlic, and grated ginger',
          'Heat a large pan over medium-high heat and add chicken',
          'Cook chicken for 5-7 minutes until cooked through',
          'Pour sauce over chicken and simmer for 3-4 minutes until sauce thickens',
          'Steam broccoli until tender but still bright green, about 4-5 minutes',
          'Serve rice in bowls, top with chicken, and arrange broccoli on the side'
        ],
        nutritionPerServing: { 
          calories: 420, 
          protein: 38, 
          carbs: 48, 
          fat: 6 
        }
      };
      
      // Create recipe object
      const importedRecipe = {
        id: `yt-${Date.now()}`,
        title: extractedRecipe.title,
        sourceType: 'youtube',
        sourceUrl: url,
        creatorName: 'YouTube Import',
        servings: extractedRecipe.servings,
        ingredients: extractedRecipe.ingredients,
        steps: extractedRecipe.steps,
        nutritionPerServing: extractedRecipe.nutritionPerServing,
        tags: ['youtube', 'imported'],
        createdAt: new Date().toISOString()
      };
      
      setRecipeInReview(importedRecipe);
      setShowYouTubeImport(false);
      setYoutubeUrl('');
      setYoutubeImportLoading(false);
      showToast('Recipe extracted successfully!', 'success');
      
    } catch (error) {
      console.error('YouTube import error:', error);
      showToast('Failed to extract recipe. Please try again.', 'error');
      setYoutubeImportLoading(false);
    }
  };
  
  const saveRecipe = (recipe) => {
    const recipeToSave = { ...recipe, lastUsedAt: new Date().toISOString() };
    setRecipes(prev => {
      const existing = prev.find(r => r.id === recipe.id);
      if (existing) return prev.map(r => r.id === recipe.id ? recipeToSave : r);
      return [...prev, recipeToSave];
    });
    setRecentRecipes(prev => [recipe.id, ...prev.filter(id => id !== recipe.id)].slice(0, 10));
    showToast('Recipe saved!', 'success');
  };
  
  const addRecipeToPlan = () => {
    if (!addToPlanRecipe || !plan || !plan.meals) {
      showToast('No meal plan available', 'error');
      return;
    }
    
    const { meal, servings } = addToPlanConfig;
    const recipe = addToPlanRecipe;
    
    const scaledNutrition = {
      calories: Math.round(recipe.nutritionPerServing.calories * servings),
      protein: Math.round(recipe.nutritionPerServing.protein * servings),
      carbs: Math.round(recipe.nutritionPerServing.carbs * servings),
      fat: Math.round(recipe.nutritionPerServing.fat * servings)
    };
    
    // Simple meal index mapping based on selection
    let mealIndex = -1;
    
    // Map selection to meal index
    // Typical plan structure: [meal1, meal2, meal3] or [meal1, meal2, meal3, meal4, meal5]
    // Common patterns: breakfast=0, lunch=1, dinner=2 for 3-meal plans
    if (plan.meals.length === 3) {
      mealIndex = meal === 'breakfast' ? 0 : meal === 'lunch' ? 1 : 2;
    } else if (plan.meals.length === 4) {
      mealIndex = meal === 'breakfast' ? 0 : meal === 'lunch' ? 1 : meal === 'dinner' ? 3 : 2;
    } else if (plan.meals.length === 5) {
      mealIndex = meal === 'breakfast' ? 0 : meal === 'lunch' ? 2 : 4;
    } else {
      // Fallback: try to find by name
      mealIndex = plan.meals.findIndex(m => {
        const mealName = (m.name || '').toLowerCase();
        return mealName.includes(meal.toLowerCase());
      });
    }
    
    // If still not found, use first available slot
    if (mealIndex === -1 || mealIndex >= plan.meals.length) {
      mealIndex = 0;
      showToast('Using first meal slot', 'info');
    }
    
    // Update the meal in the array
    const updatedMeals = [...plan.meals];
    updatedMeals[mealIndex] = {
      name: recipe.title,
      ingredients: recipe.ingredients.map(i => {
        if (typeof i === 'string') return i;
        const qty = parseFloat(i.quantity) * servings;
        const unit = i.unit || '';
        const name = i.name || '';
        return `${qty} ${unit} ${name}`.trim();
      }),
      instructions: recipe.instructions || [],
      source: recipe.source || 'mealdb',
      ...scaledNutrition,
      // PART 7: Include macro confidence if available
      macroConfidence: recipe.nutritionPerServing._macroConfidence || 0.8,
      _macroSource: recipe.nutritionPerServing._macroSource || 'imported'
    };
    
    setPlan(prev => ({
      ...prev,
      meals: updatedMeals
    }));
    
    // Update recipe last used timestamp if it exists in recipes array
    setRecipes(prev => prev.map(r => 
      r.id === recipe.id ? { ...r, lastUsedAt: new Date().toISOString() } : r
    ));
    
    setShowAddToPlanModal(false);
    setAddToPlanRecipe(null);
    showToast(`Added to ${meal}!`, 'success');
  };
  
  // ========== END RECIPE FUNCTIONS ==========
  
  // ========== RECIPE FILTERS & DISCOVERY FUNCTIONS (ADDITIVE) ==========
  
  // Generate recommended recipes (curated list for MVP)
  const generateRecommendedRecipes = () => {
    return [
      {
        id: 'rec-1',
        title: 'High Protein Overnight Oats',
        category: 'Breakfast',
        cuisine: 'American',
        cookTime: 5,
        nutritionPerServing: { calories: 320, protein: 25, carbs: 42, fat: 6 },
        servings: 1,
        ingredients: ['1 cup oats', '1 scoop protein powder', '1 cup almond milk', '1 tbsp chia seeds', 'Berries'],
        instructions: ['Mix all ingredients', 'Refrigerate overnight', 'Top with berries']
      },
      {
        id: 'rec-2',
        title: 'Chicken Stir Fry Bowl',
        category: 'Lunch',
        cuisine: 'Asian',
        cookTime: 15,
        nutritionPerServing: { calories: 450, protein: 42, carbs: 48, fat: 12 },
        servings: 2,
        ingredients: ['8oz chicken breast', '2 cups mixed vegetables', '1 cup rice', 'Soy sauce', 'Garlic'],
        instructions: ['Cook rice', 'Stir fry chicken and vegetables', 'Season with soy sauce', 'Serve over rice']
      },
      {
        id: 'rec-3',
        title: 'Mediterranean Quinoa Salad',
        category: 'Lunch',
        cuisine: 'Mediterranean',
        cookTime: 20,
        nutritionPerServing: { calories: 380, protein: 14, carbs: 52, fat: 14 },
        servings: 4,
        ingredients: ['2 cups quinoa', 'Cucumber', 'Tomatoes', 'Feta cheese', 'Olives', 'Olive oil', 'Lemon'],
        instructions: ['Cook quinoa', 'Chop vegetables', 'Mix all ingredients', 'Dress with olive oil and lemon']
      },
      {
        id: 'rec-4',
        title: 'Sheet Pan Salmon & Veggies',
        category: 'Dinner',
        cuisine: 'American',
        cookTime: 25,
        nutritionPerServing: { calories: 420, protein: 38, carbs: 28, fat: 18 },
        servings: 2,
        ingredients: ['12oz salmon', 'Broccoli', 'Sweet potato', 'Olive oil', 'Lemon', 'Garlic'],
        instructions: ['Preheat oven to 400°F', 'Arrange on sheet pan', 'Drizzle with oil', 'Bake 20 minutes']
      },
      {
        id: 'rec-5',
        title: 'Protein Energy Balls',
        category: 'Snack',
        cuisine: 'American',
        cookTime: 10,
        nutritionPerServing: { calories: 120, protein: 6, carbs: 14, fat: 5 },
        servings: 12,
        ingredients: ['1 cup oats', '1/2 cup peanut butter', '1/4 cup honey', '1/4 cup protein powder', 'Dark chocolate chips'],
        instructions: ['Mix all ingredients', 'Roll into balls', 'Refrigerate 30 minutes']
      },
      {
        id: 'rec-6',
        title: 'Turkey Taco Bowl',
        category: 'Dinner',
        cuisine: 'Mexican',
        cookTime: 20,
        nutritionPerServing: { calories: 480, protein: 45, carbs: 52, fat: 14 },
        servings: 2,
        ingredients: ['1lb ground turkey', 'Brown rice', 'Black beans', 'Salsa', 'Avocado', 'Lettuce'],
        instructions: ['Cook turkey with taco seasoning', 'Prepare rice and beans', 'Assemble bowls', 'Top with salsa and avocado']
      },
      {
        id: 'rec-7',
        title: 'Greek Yogurt Parfait',
        category: 'Breakfast',
        cuisine: 'Mediterranean',
        cookTime: 5,
        nutritionPerServing: { calories: 280, protein: 22, carbs: 38, fat: 4 },
        servings: 1,
        ingredients: ['1.5 cups Greek yogurt', 'Granola', 'Mixed berries', 'Honey'],
        instructions: ['Layer yogurt in bowl', 'Add granola and berries', 'Drizzle with honey']
      },
      {
        id: 'rec-8',
        title: 'Air Fryer Chicken Wings',
        category: 'Dinner',
        cuisine: 'American',
        cookTime: 25,
        nutritionPerServing: { calories: 320, protein: 28, carbs: 2, fat: 22 },
        servings: 4,
        ingredients: ['2lbs chicken wings', 'Olive oil', 'Paprika', 'Garlic powder', 'Salt'],
        instructions: ['Toss wings with oil and seasonings', 'Air fry at 400°F for 20 minutes', 'Flip halfway through']
      }
    ];
  };
  
  // Build query object from search text and filters
  const buildRecipeQuery = () => {
    return {
      text: recipeSearchQuery || null,
      category: recipeFilters.category,
      macroFocus: recipeFilters.macroFocus,
      cuisine: recipeFilters.cuisine.length > 0 ? recipeFilters.cuisine : null,
      includeIngredients: recipeFilters.includeIngredients.length > 0 ? recipeFilters.includeIngredients : null,
      excludeIngredients: recipeFilters.excludeIngredients.length > 0 ? recipeFilters.excludeIngredients : null,
      advanced: {
        maxTime: recipeFilters.advanced.maxTime,
        equipment: recipeFilters.advanced.equipment.length > 0 ? recipeFilters.advanced.equipment : null,
        diet: recipeFilters.advanced.diet.length > 0 ? recipeFilters.advanced.diet : null
      }
    };
  };
  
  // Apply filters to recipe list
  const applyRecipeFilters = (recipes) => {
    const query = buildRecipeQuery();
    
    return recipes.filter(recipe => {
      // Text search (if present)
      if (query.text) {
        const searchLower = query.text.toLowerCase();
        const matchesText = 
          recipe.title.toLowerCase().includes(searchLower) ||
          recipe.ingredients.some(ing => {
            const ingName = typeof ing === 'string' ? ing : (ing.name || ing.strIngredient || '');
            return ingName.toLowerCase().includes(searchLower);
          });
        if (!matchesText) return false;
      }
      
      // Category filter
      if (query.category && recipe.category !== query.category) return false;
      
      // Cuisine filter
      if (query.cuisine && !query.cuisine.includes(recipe.cuisine)) return false;
      
      // Macro focus filter (semantic matching)
      if (query.macroFocus) {
        const nutrition = recipe.nutritionPerServing;
        const proteinRatio = nutrition.protein / (nutrition.calories / 4);
        
        if (query.macroFocus === 'High protein' && proteinRatio < 0.25) return false;
        if (query.macroFocus === 'Low calorie' && nutrition.calories > 350) return false;
        if (query.macroFocus === 'Low carb' && nutrition.carbs > 30) return false;
      }
      
      // Include ingredients
      if (query.includeIngredients) {
        const hasAllIngredients = query.includeIngredients.every(ing => 
          recipe.ingredients.some(recipeIng => {
            const ingName = typeof recipeIng === 'string' ? recipeIng : (recipeIng.name || recipeIng.strIngredient || '');
            return ingName.toLowerCase().includes(ing.toLowerCase());
          })
        );
        if (!hasAllIngredients) return false;
      }
      
      // Exclude ingredients
      if (query.excludeIngredients) {
        const hasExcludedIngredient = query.excludeIngredients.some(ing =>
          recipe.ingredients.some(recipeIng => {
            const ingName = typeof recipeIng === 'string' ? recipeIng : (recipeIng.name || recipeIng.strIngredient || '');
            return ingName.toLowerCase().includes(ing.toLowerCase());
          })
        );
        if (hasExcludedIngredient) return false;
      }
      
      // Advanced: Max time
      if (query.advanced.maxTime && recipe.cookTime > query.advanced.maxTime) return false;
      
      return true;
    });
  };
  
  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    if (recipeFilters.category) count++;
    if (recipeFilters.macroFocus) count++;
    if (recipeFilters.cuisine.length > 0) count++;
    if (recipeFilters.includeIngredients.length > 0) count++;
    if (recipeFilters.excludeIngredients.length > 0) count++;
    if (recipeFilters.advanced.maxTime) count++;
    if (recipeFilters.advanced.equipment.length > 0) count++;
    if (recipeFilters.advanced.diet.length > 0) count++;
    return count;
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setRecipeFilters({
      category: null,
      macroFocus: null,
      cuisine: [],
      includeIngredients: [],
      excludeIngredients: [],
      advanced: {
        maxTime: null,
        equipment: [],
        diet: []
      }
    });
  };
  
  // Initialize recommended recipes when modal opens
  useEffect(() => {
    if (showRecipeSearch && recommendedRecipes.length === 0) {
      setRecommendedRecipes(generateRecommendedRecipes());
    }
  }, [showRecipeSearch]);
  
  // ========== END RECIPE FILTERS & DISCOVERY FUNCTIONS ==========
  
  // ========== ADVANCED MODE FIRST-TIME EXPLANATION ==========
  useEffect(() => {
    if (advancedMode && !hasSeenAdvancedExplanation) {
      setShowAdvancedExplanation(true);
      setHasSeenAdvancedExplanation(true);
      localStorage.setItem('plato_seen_advanced_explanation', 'true');
    }
  }, [advancedMode]);
  // ========== END ADVANCED MODE EXPLANATION ==========
  
  // ========== MEAL IMAGE FUNCTIONS (ADDITIVE) ==========
  
  // Generate deterministic cache key from meal data
  const getMealKey = (meal) => {
    if (!meal || !meal.name) return null;
    // Use name + first ingredient for uniqueness
    const ingredient = meal.ingredients?.[0] || '';
    return `${meal.name}-${ingredient}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
  };
  
  // Image generation adapter - generates SVG placeholders (external images blocked by CSP)
  const generateMealImage = async (meal) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate unique color from meal name
    const hash = meal.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    const color1 = `hsl(${hue}, 70%, 60%)`;
    const color2 = `hsl(${(hue + 30) % 360}, 70%, 50%)`;
    
    // Create food-themed SVG with gradient
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
        <defs>
          <linearGradient id='grad${hash}' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' style='stop-color:${color1};stop-opacity:1' />
            <stop offset='100%' style='stop-color:${color2};stop-opacity:1' />
          </linearGradient>
        </defs>
        <rect fill='url(%23grad${hash})' width='400' height='300'/>
        <circle cx='200' cy='150' r='80' fill='white' opacity='0.2'/>
        <text x='50%' y='45%' font-family='Arial' font-size='28' font-weight='bold' fill='white' text-anchor='middle' opacity='0.9'>${meal.name}</text>
        <text x='50%' y='60%' font-family='Arial' font-size='16' fill='white' text-anchor='middle' opacity='0.7'>${meal.calories || 0} cal - ${meal.protein || 0}g protein</text>
      </svg>
    `.trim();
    
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };
  
  // Hook to trigger image generation for all meals - simplified approach
  useEffect(() => {
    if (!showMealImages || !plan?.meals) return;
    
    plan.meals.forEach(meal => {
      const mealKey = getMealKey(meal);
      if (!mealKey || mealImages[mealKey]) return;
      
      // Start generation immediately
      (async () => {
        setMealImages(prev => ({...prev, [mealKey]: { status: 'loading', url: null }}));
        
        try {
          const url = await generateMealImage(meal);
          setMealImages(prev => ({...prev, [mealKey]: { status: 'ready', url }}));
        } catch (e) {
          setMealImages(prev => ({...prev, [mealKey]: { status: 'error', url: null }}));
        }
      })();
    });
  }, [plan?.meals?.length, showMealImages]); // Only re-run when number of meals changes
  
  // ========== END MEAL IMAGE FUNCTIONS ==========

  // ========== WEIGH-IN HANDLER ==========
  const handleWeighIn = () => {
    if (!newWeighIn.weight || newWeighIn.weight <= 0) {
      showToast('Please enter a valid weight', 'error');
      return;
    }

    // Validate weight entry constraints
    const now = new Date();
    const today = now.toDateString();
    
    // Check for entries today
    const todayEntries = weighIns.filter(w => new Date(w.date).toDateString() === today);
    
    // Rule 1: Maximum 2 entries per day
    if (todayEntries.length >= 2) {
      showToast('Maximum 2 weight entries per day. Edit an existing entry instead.', 'error');
      return;
    }
    
    // Rule 2: Minimum 8 hours between entries
    if (todayEntries.length > 0) {
      const lastEntry = todayEntries[0]; // Most recent entry today
      const hoursSinceLastEntry = (now - new Date(lastEntry.date)) / (1000 * 60 * 60);
      
      if (hoursSinceLastEntry < 8) {
        const hoursRemaining = Math.ceil(8 - hoursSinceLastEntry);
        showToast(`Please wait ${hoursRemaining} more hour${hoursRemaining > 1 ? 's' : ''} before logging again.`, 'error');
        return;
      }
    }

    // Round to 2 decimal places
    const roundedWeight = Math.round(parseFloat(newWeighIn.weight) * 100) / 100;

    const weighIn = {
      id: Date.now(),
      weight: roundedWeight,
      note: newWeighIn.note,
      date: new Date(),
      dateString: new Date().toLocaleDateString()
    };

    const updatedWeighIns = [...weighIns, weighIn].sort((a, b) => b.date - a.date);
    setWeighIns(updatedWeighIns);
    
    // CRITICAL: Auto-update profile weight with latest entry
    // This is the SINGLE SOURCE OF TRUTH for weight
    // All dependent calculations will be reactively updated via useEffect below
    setUserProfile(prev => ({
      ...prev,
      weight: weighIn.weight
    }));

    // Calculate trend if enough data
    if (updatedWeighIns.length >= 2) {
      const recentWeighIns = updatedWeighIns.slice(0, 4); // Last 4 weeks
      const trend = calculateWeightTrend(recentWeighIns);
      
      if (trend !== null && plan?.calculationData) {
        const recommendation = generateAdaptiveRecommendation(
          trend,
          { type: plan.calculationData.goal, rate: plan.calculationData.targetRate },
          plan.calories
        );
        
        if (recommendation) {
          setAdaptiveRecommendation(recommendation);
        }
      }
    }

    setNewWeighIn({ weight: '', note: '' });
    setShowWeighInModal(false);
    showToast('Weight logged successfully!', 'success');
    unlockAchievement('week-streak');
  };
  
  // Edit existing weight entry
  const handleEditWeighIn = (entry) => {
    setEditingWeighIn({
      id: entry.id,
      weight: entry.weight.toString(),
      note: entry.note || ''
    });
  };
  
  // Save edited weight entry
  const saveEditedWeighIn = () => {
    if (!editingWeighIn.weight || editingWeighIn.weight <= 0) {
      showToast('Please enter a valid weight', 'error');
      return;
    }
    
    // Round to 2 decimal places
    const roundedWeight = Math.round(parseFloat(editingWeighIn.weight) * 100) / 100;
    
    const updatedWeighIns = weighIns.map(w => 
      w.id === editingWeighIn.id 
        ? { ...w, weight: roundedWeight, note: editingWeighIn.note }
        : w
    );
    
    setWeighIns(updatedWeighIns);
    
    // If editing the most recent entry, update profile weight
    if (updatedWeighIns[0].id === editingWeighIn.id) {
      setUserProfile(prev => ({
        ...prev,
        weight: roundedWeight
      }));
    }
    
    setEditingWeighIn(null);
    showToast('Weight entry updated!', 'success');
  };
  
  // Delete weight entry
  const handleDeleteWeighIn = (entryId) => {
    if (!window.confirm('Delete this weight entry?')) return;
    
    const updatedWeighIns = weighIns.filter(w => w.id !== entryId);
    setWeighIns(updatedWeighIns);
    
    // If we deleted the most recent entry, update profile with new most recent
    if (weighIns[0].id === entryId && updatedWeighIns.length > 0) {
      setUserProfile(prev => ({
        ...prev,
        weight: updatedWeighIns[0].weight
      }));
    }
    
    showToast('Weight entry deleted', 'success');
  };
  
  // ========== REACTIVE DERIVED STATE UPDATES ==========
  // When userProfile.weight changes, recalculate nutrition targets
  // WITHOUT regenerating the meal plan
  useEffect(() => {
    // Only recalculate if we have an active plan with calculation data
    if (!plan || !plan.calculationData || plan.isMealsOnly) return;
    
    // Skip if weight hasn't actually changed
    if (plan.calculationData.weight === userProfile.weight) return;
    
    // Recalculate BMR, TDEE, and macros with new weight
    const newBMR = calculateBMR(
      userProfile.gender,
      userProfile.weight,
      userProfile.height,
      userProfile.birthday ? calculateAge(userProfile.birthday) : userProfile.age
    );
    const newTDEE = calculateTDEE(newBMR, plan.calculationData.activity);
    
    // Use new goal format (with fallback)
    const primaryGoal = plan.calculationData.primaryGoal || plan.calculationData.goal || 'maintain';
    const secondaryGoals = plan.calculationData.secondaryGoals || [];
    
    const newTargetCalories = applyGoalAdjustment(
      newTDEE,
      primaryGoal,
      secondaryGoals,
      plan.calculationData.targetRate
    );
    const newMacros = calculateMacros(
      newTargetCalories,
      plan.calculationData.trainingType,
      planConfig.dietStyle,
      userProfile.weight,
      secondaryGoals
    );
    
    // Update plan with new targets (DOES NOT regenerate meals)
    // These updated targets apply to:
    // - Daily nutrition tracking displays
    // - Future meal plan generations
    // - Tomorrow's planning
    setPlan(prev => ({
      ...prev,
      calories: newTargetCalories,
      protein: newMacros.protein,
      carbs: newMacros.carbs,
      fat: newMacros.fat,
      bmr: Math.round(newBMR),
      tdee: newTDEE,
      calculationData: {
        ...prev.calculationData,
        weight: userProfile.weight  // Mark plan as using this weight
      }
    }));
    
    // Update baseline TDEE for tracking
    setBaselineTDEE(newTDEE);
    setActualTDEE(newTDEE);
    
    console.log(' Nutrition targets recalculated due to weight change:', {
      oldWeight: plan.calculationData.weight,
      newWeight: userProfile.weight,
      oldCalories: plan.calories,
      newCalories: newTargetCalories
    });
    
  }, [userProfile.weight, plan?.calculationData?.weight]);
  // ========== END REACTIVE DERIVED STATE UPDATES ==========
  // ========== END WEIGH-IN HANDLER ==========

  // Barcode Scanner Component
  const BarcodeScanner = () => {
    const [scanError, setScanError] = useState(null);
    const [manualEntry, setManualEntry] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
      startBarcodeScanner();
      return () => stopBarcodeScanner();
    }, []);

    const startBarcodeScanner = async () => {
      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 1280, height: 720 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setIsScanning(true);
          
          // Start continuous scanning
          requestAnimationFrame(scanFrame);
        }
      } catch (error) {
        setScanError('Camera access denied. Please enable camera permissions.');
        console.error('Camera error:', error);
      }
    };

    const scanFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !isScanning) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.ready === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple barcode detection simulation
        // In production, use BarcodeDetector API or @zxing/browser
        if (window.BarcodeDetector) {
          try {
            const barcodeDetector = new BarcodeDetector({
              formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code']
            });
            const barcodes = await barcodeDetector.detect(imageData);
            
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              setIsScanning(false);
              handleBarcodeDetected(code);
              return;
            }
          } catch (err) {
            console.error('Barcode detection error:', err);
          }
        }
      }
      
      if (isScanning) {
        requestAnimationFrame(scanFrame);
      }
    };

    const handleBarcodeDetected = async (code) => {
      setScanning(true);
      const result = await lookupBarcode(code);
      setScanResult(result);
      setScanning(false);
      stopBarcodeScanner();
    };

    const stopBarcodeScanner = () => {
      setIsScanning(false);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };

    const handleManualScan = async () => {
      if (manualCode.trim()) {
        setScanning(true);
        const result = await lookupBarcode(manualCode);
        setScanResult(result);
        setScanning(false);
      }
    };

    const simulateScan = async () => {
      setScanning(true);
      // Simulate barcode detection
      const testCodes = ['012000161551', '028400064903', '018894009429'];
      const testCode = testCodes[Math.floor(Math.random() * testCodes.length)];
      await new Promise(r => setTimeout(r, 800));
      const result = await lookupBarcode(testCode);
      setScanResult(result);
      setScanning(false);
    };

    return (
      <div className={`min-h-screen ${dark?'app-bg-dark':'app-bg-light'} pb-20`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${dark?'text-white':'text-slate-900'}`}>
              Scan Barcode
            </h2>
            <button
              onClick={() => { stopBarcodeScanner(); setScanMode(null); }}
              className={`p-2 rounded-xl ${dark?'bg-slate-800 hover:bg-slate-700':'bg-white hover:bg-slate-100'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {scanError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 dark:text-red-300 mb-4">{scanError}</p>
              <button
                onClick={() => setManualEntry(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
              >
                Enter Code Manually
              </button>
            </div>
          ) : (
            <div className="relative w-full h-[50vh] bg-black rounded-2xl overflow-hidden mb-6">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Scanner overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-40 border-4 border-blue-500 rounded-xl">
                  <div className="absolute inset-x-0 h-0.5 bg-blue-400 animate-scan" />
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-blue-500" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-blue-500" />
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-blue-500" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-blue-500" />
                </div>
              </div>

              <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full inline-block">
                  {scanning ? 'Scanning...' : isScanning ? 'Scanning continuously...' : 'Center barcode in frame'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {!window.BarcodeDetector && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-3">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Note:</strong> Real-time barcode scanning not available on this browser. Use the demo button or manual entry.
                </p>
              </div>
            )}

            <button
              onClick={simulateScan}
              disabled={scanning}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 btn-press"
            >
              {scanning ? 'Scanning...' : 'Simulate Scan (Demo)'}
            </button>

            <button
              onClick={() => setManualEntry(!manualEntry)}
              className={`w-full py-3 rounded-xl font-semibold ${dark?'bg-slate-800 text-white':'bg-white text-slate-900'}`}
            >
              Enter Code Manually
            </button>

            {manualEntry && (
              <div className="flex gap-2 animate-slideDown">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                  placeholder="Enter barcode number..."
                  className={`flex-1 px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-slate-200'} border-2 focus:border-blue-500 focus:outline-none`}
                />
                <button
                  onClick={handleManualScan}
                  disabled={!manualCode.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  Scan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Photo Capture Component
  const PhotoCapture = () => {
    const [cameraError, setCameraError] = useState(null);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [mealSizeEstimate, setMealSizeEstimate] = useState('medium'); // small, medium, large, unknown
    const [plateDimension, setPlateDimension] = useState(''); // inches or cm

    useEffect(() => {
      startPhotoCamera();
      return () => stopPhotoCamera();
    }, []);

    const startPhotoCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: 1920, height: 1080 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (error) {
        setCameraError('Camera access denied');
        console.error('Camera error:', error);
      }
    };

    const stopPhotoCamera = () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };

    const capturePhoto = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
      stopPhotoCamera();
    };

    const handleFileSelect = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCapturedImage(e.target?.result);
          stopPhotoCamera();
        };
        reader.readAsDataURL(file);
      }
    };

    if (capturedImage && !plateResult) {
      return (
        <div className={`min-h-screen ${dark?'app-bg-dark':'app-bg-light'} p-6`}>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${dark?'text-white':'text-slate-900'}`}>
                Confirm Photo
              </h2>
            </div>

            <img src={capturedImage} className="w-full rounded-2xl mb-4" alt="Captured plate" />
            
            {/* Size Context Summary */}
            {(plateSize !== 'unknown' || mealSizeEstimate !== 'medium' || plateDimension) && (
              <div className={`p-4 rounded-xl mb-4 ${dark?'bg-slate-800 border border-slate-700':'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm font-semibold ${dark?'text-white':'text-slate-900'}`}>
                    Size Context for Analysis
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {plateSize !== 'unknown' && (
                    <div className={dark?'text-slate-300':'text-slate-600'}>
                      Plate: <span className="font-medium">{plateSize}</span>
                    </div>
                  )}
                  {mealSizeEstimate !== 'medium' && (
                    <div className={dark?'text-slate-300':'text-slate-600'}>
                      Meal: <span className="font-medium">{mealSizeEstimate}</span>
                    </div>
                  )}
                  {plateDimension && (
                    <div className={dark?'text-slate-300':'text-slate-600'}>
                      Dimension: <span className="font-medium">{plateDimension}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={async () => {
                  setAnalyzing(true);
                  try {
                    const result = await analyzePlate(capturedImage, {
                      plateSize,
                      mealSizeEstimate,
                      plateDimension: plateDimension ? parseFloat(plateDimension) : null
                    });
                    setPlateResult(result);
                  } catch (e) {
                    if (e.message === 'SCAN_DISABLED') {
                      alert('Plate scan is temporarily unavailable. This feature will be back soon!');
                    }
                  }
                  setAnalyzing(false);
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold btn-press flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Analyze My Plate
              </button>

              <button
                onClick={() => {
                  setCapturedImage(null);
                  startPhotoCamera();
                }}
                className={`w-full py-3 rounded-xl font-semibold ${dark?'bg-slate-800 text-white':'bg-white text-slate-900'}`}
              >
                Retake Photo
              </button>

              <button
                onClick={() => {
                  setCapturedImage(null);
                  setScanMode(null);
                }}
                className={`w-full py-3 rounded-xl font-semibold ${dark?'bg-slate-700 text-white':'bg-slate-100 text-slate-900'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen ${dark?'app-bg-dark':'app-bg-light'} pb-20`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${dark?'text-white':'text-slate-900'}`}>
                Capture Your Plate
              </h2>
              <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full mt-2">
                BETA
              </span>
            </div>
            <button
              onClick={() => { stopPhotoCamera(); setScanMode(null); }}
              className={`p-2 rounded-xl ${dark?'bg-slate-800 hover:bg-slate-700':'bg-white hover:bg-slate-100'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {cameraError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 dark:text-red-300 mb-4">{cameraError}</p>
              <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                Choose Photo from Library
              </label>
            </div>
          ) : (
            <>
              <div className="relative w-full h-[60vh] bg-black rounded-2xl overflow-hidden mb-6">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Plate guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-80 h-80 rounded-full border-4 border-white/40 border-dashed" />
                </div>

                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <p className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full inline-block">
                    Center your plate in the circle
                  </p>
                </div>
              </div>

              {/* Meal Size Context Panel */}
              <div className={`mb-4 ${dark?'bg-slate-800':'bg-white'} rounded-xl p-4`}>
                <button
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    <span className={`font-semibold ${dark?'text-white':'text-slate-900'}`}>
                      Meal Size Context
                    </span>
                    {(plateSize !== 'unknown' || mealSizeEstimate !== 'medium' || plateDimension) && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                        Set
                      </span>
                    )}
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-transform ${showSizeGuide ? 'rotate-90' : ''}`} />
                </button>
                
                {showSizeGuide && (
                  <div className="mt-4 space-y-4 animate-slideDown">
                    {/* Plate Size (from calibration) */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${dark?'text-slate-300':'text-slate-700'}`}>
                        Plate Size
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'small', label: 'Small', size: '9"' },
                          { value: 'standard', label: 'Standard', size: '10"' },
                          { value: 'large', label: 'Large', size: '12"' },
                          { value: 'unknown', label: "Don't know" }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setPlateSize(option.value)}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${
                              plateSize === option.value
                                ? 'bg-blue-600 text-white'
                                : dark?'bg-slate-700 text-slate-300 hover:bg-slate-600':'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <div>{option.label}</div>
                            {option.size && <div className="text-[10px] opacity-70">{option.size}</div>}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Meal Size Estimate */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${dark?'text-slate-300':'text-slate-700'}`}>
                        Meal Size Estimate
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'small', label: 'Small', icon: '' },
                          { value: 'medium', label: 'Medium', icon: '' },
                          { value: 'large', label: 'Large', icon: '' },
                          { value: 'unknown', label: "Don't know", icon: '' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setMealSizeEstimate(option.value)}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${
                              mealSizeEstimate === option.value
                                ? 'bg-purple-600 text-white'
                                : dark?'bg-slate-700 text-slate-300 hover:bg-slate-600':'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <div className="text-lg mb-1">{option.icon}</div>
                            <div>{option.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Optional: Plate Dimension Input */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${dark?'text-slate-300':'text-slate-700'}`}>
                        Custom Dimension (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={plateDimension}
                          onChange={(e) => setPlateDimension(e.target.value)}
                          placeholder="e.g., 10.5"
                          className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                            dark?'bg-slate-700 text-white border-slate-600':'bg-white text-slate-900 border-slate-300'
                          } border`}
                        />
                        <span className={`px-3 py-2 rounded-lg ${dark?'bg-slate-700 text-slate-300':'bg-slate-100 text-slate-600'} text-sm font-medium`}>
                          inches
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${dark?'text-slate-500':'text-slate-400'}`}>
                        Helps improve portion accuracy if you know exact size
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-8">
                <label className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <ImagePlus className={`w-7 h-7 ${dark?'text-white':'text-slate-900'}`} />
                </label>

                <button
                  onClick={capturePhoto}
                  className="w-20 h-20 rounded-full bg-white border-4 border-blue-500 shadow-2xl btn-press relative"
                >
                  <div className="absolute inset-0 rounded-full bg-blue-500 animate-pulse-ring" />
                </button>

                <div className="w-14 h-14" />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Scan Result Sheet
  const ScanResultSheet = () => {
    const [servings, setServings] = useState(1);
    const [mealSlot, setMealSlot] = useState('now');

    if (!scanResult) return null;

    const scaledNutrition = {
      calories: Math.round(scanResult.nutrition.calories * servings),
      protein: Math.round(scanResult.nutrition.protein * servings),
      carbs: Math.round(scanResult.nutrition.carbs * servings),
      fat: Math.round(scanResult.nutrition.fat * servings)
    };

    const handleConfirm = () => {
      const logEntry = {
        id: Date.now(),
        name: scanResult.name,
        brand: scanResult.brand,
        servings,
        ...scaledNutrition,
        source: 'barcode',
        timestamp: new Date(),
        mealSlot
      };

      // Check if we're replacing a meal in the plan
      if (replacingMealIndex !== null) {
        // Replace the meal in the plan
        const newMeals = [...plan.meals];
        newMeals[replacingMealIndex] = {
          name: scanResult.name,
          calories: scaledNutrition.calories,
          protein: scaledNutrition.protein,
          carbs: scaledNutrition.carbs,
          fat: scaledNutrition.fat,
          ingredients: scanResult.brand ? [`${servings} serving(s) ${scanResult.brand}`] : [`${servings} serving(s)`],
          instructions: ['Scanned item']
        };
        
        setPlan({...plan, meals: newMeals});
        showToast('Meal replaced successfully', 'success');
        setReplacingMealIndex(null);
      } else {
        // Add to daily log (original behavior)
        setDailyLog(prev => ({
          ...prev,
          meals: [...prev.meals, logEntry],
          totalCalories: prev.totalCalories + scaledNutrition.calories,
          totalProtein: prev.totalProtein + scaledNutrition.protein,
          totalCarbs: prev.totalCarbs + scaledNutrition.carbs,
          totalFat: prev.totalFat + scaledNutrition.fat
        }));
        showToast('Added to log', 'success');
        setMacrosExpanded(false); // Auto-collapse after logging
      }

      // Add to recent scans (keep last 10)
      setRecentScans(prev => {
        const updated = [scanResult, ...prev.filter(s => s.barcode !== scanResult.barcode)];
        return updated.slice(0, 10);
      });

      setScanResult(null);
      setScanMode(null);
      setShowScanning(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-slideUp">
        <div className={`${dark?'bg-slate-800':'bg-white'} rounded-t-3xl w-full max-h-[85vh] overflow-y-auto`}>
          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`text-2xl font-bold ${dark?'text-white':'text-slate-900'}`}>
                  {scanResult.name}
                </h3>
                {scanResult.brand && (
                  <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                    {scanResult.brand}
                  </p>
                )}
              </div>
              <button
                onClick={() => setScanResult(null)}
                className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Serving adjuster */}
            <div className={`flex items-center justify-between p-4 rounded-xl ${dark?'bg-slate-700':'bg-slate-100'}`}>
              <span className={`font-semibold ${dark?'text-white':'text-slate-900'}`}>
                Servings ({scanResult.servingSize})
              </span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  className={`w-10 h-10 rounded-xl ${dark?'bg-slate-600 hover:bg-slate-500':'bg-white hover:bg-slate-200'} flex items-center justify-center font-bold`}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold w-16 text-center">{servings}</span>
                <button
                  onClick={() => setServings(servings + 0.5)}
                  className={`w-10 h-10 rounded-xl ${dark?'bg-slate-600 hover:bg-slate-500':'bg-white hover:bg-slate-200'} flex items-center justify-center font-bold`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Nutrition display */}
            <div className="grid grid-cols-4 gap-3">
              <div className={`p-4 rounded-xl text-center ${dark?'bg-slate-700':'bg-blue-50'}`}>
                <div className="text-2xl font-bold text-blue-600">{scaledNutrition.calories}</div>
                <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>Calories</div>
              </div>
              <div className={`p-4 rounded-xl text-center ${dark?'bg-slate-700':'bg-purple-50'}`}>
                <div className="text-2xl font-bold text-purple-600">{scaledNutrition.protein}g</div>
                <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>Protein</div>
              </div>
              <div className={`p-4 rounded-xl text-center ${dark?'bg-slate-700':'bg-amber-50'}`}>
                <div className="text-2xl font-bold text-amber-600">{scaledNutrition.carbs}g</div>
                <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>Carbs</div>
              </div>
              <div className={`p-4 rounded-xl text-center ${dark?'bg-slate-700':'bg-emerald-50'}`}>
                <div className="text-2xl font-bold text-emerald-600">{scaledNutrition.fat}g</div>
                <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>Fat</div>
              </div>
            </div>

            {/* Meal slot */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${dark?'text-slate-300':'text-slate-700'}`}>
                Add to meal
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['now', 'breakfast', 'lunch', 'dinner', 'snack'].map(slot => (
                  <button
                    key={slot}
                    onClick={() => setMealSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold capitalize btn-press ${
                      mealSlot === slot
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {slot === 'now' ? 'Now' : slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setScanResult(null);
                  setReplacingMealIndex(null);
                }}
                className={`flex-1 py-3.5 rounded-xl font-semibold ${dark?'bg-slate-700 text-white':'bg-slate-100 text-slate-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-2 py-3.5 px-8 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
              >
                {replacingMealIndex !== null ? 'Replace Meal' : 'Add to Log'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Plate Result Sheet
  const PlateResultSheet = () => {
    const [editMode, setEditMode] = useState(false);
    const [foods, setFoods] = useState(plateResult?.foods || []);
    const [mealSlot, setMealSlot] = useState('now');
    
    // Confirmation tracking for low-confidence items
    const [itemConfirmations, setItemConfirmations] = useState({});
    const [hasReviewedOnce, setHasReviewedOnce] = useState(false);
    const [userCorrections, setUserCorrections] = useState([]);
    
    // Manual correction states
    const [editingItemId, setEditingItemId] = useState(null);
    const [searchingItemId, setSearchingItemId] = useState(null);
    const [usdaSearchResults, setUsdaSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemGrams, setNewItemGrams] = useState(100);

    if (!plateResult) return null;

    // Updated confidence thresholds - more strict
    const confidenceColor = plateResult.confidence >= 0.75 ? 'emerald' : 
                           plateResult.confidence >= 0.60 ? 'amber' : 'red';
    const confidenceLabel = plateResult.confidence >= 0.75 ? 'Good' : 
                           plateResult.confidence >= 0.60 ? 'Needs Review' : 'Low - Manual Entry Required';
    
    // Determine if analysis needs review
    const needsReview = plateResult.needsReview || plateResult.confidence < 0.75;
    const hasErrors = plateResult.errors && plateResult.errors.length > 0;
    
    // Check if any individual item has low confidence (<0.6)
    const lowConfidenceItems = foods.filter(food => {
      const itemConfidence = food.confidence || 
                            (food.detectionConfidence || 0) * 0.4 + 
                            (food.portionConfidence || 0) * 0.3 + 
                            (food.nutritionConfidence || 0) * 0.3;
      return itemConfidence < 0.6;
    });
    
    // Require explicit confirmation for low-confidence items
    const requiresConfirmation = needsReview || lowConfidenceItems.length > 0;
    
    // Check if all low-confidence items are confirmed
    const allLowConfidenceItemsConfirmed = lowConfidenceItems.every(
      food => itemConfirmations[food.id] === true
    );
    
    // Can only log if: (1) high confidence OR (2) user has reviewed and confirmed all low-confidence items
    const canLog = !requiresConfirmation || (hasReviewedOnce && allLowConfidenceItemsConfirmed);
    
    // USDA Search Handler
    const handleUSDASearch = async (foodId, query) => {
      setIsSearching(true);
      setSearchQuery(query);
      setSearchingItemId(foodId);
      
      try {
        const response = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${USDA_API_KEY}`
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        
        // Rank matches (using same logic as nutritionLookup)
        const rankedResults = data.foods.map(food => {
          const score = rankUSDAMatch(food, query);
          return { ...food, matchScore: score };
        }).sort((a, b) => b.matchScore - a.matchScore);
        
        setUsdaSearchResults(rankedResults);
      } catch (error) {
        console.error('USDA search error:', error);
        showToast('Search failed. Please try again.', 'error');
      } finally {
        setIsSearching(false);
      }
    };
    
    // Rank USDA match (simplified version)
    const rankUSDAMatch = (food, searchTerm) => {
      let score = 0.5;
      const description = food.description.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      if (food.dataType === 'Foundation') score += 0.3;
      else if (food.dataType === 'SR Legacy') score += 0.25;
      else if (food.dataType === 'Survey (FNDDS)') score += 0.2;
      
      const searchWords = searchLower.split(/\s+/);
      const descWords = description.split(/\s+/);
      const matchingWords = searchWords.filter(w => descWords.includes(w));
      score += (matchingWords.length / searchWords.length) * 0.3;
      
      return Math.min(0.95, score);
    };
    
    // Apply selected USDA match
    const applyUSDAMatch = async (foodId, usdaFood) => {
      const food = foods.find(f => f.id === foodId);
      if (!food) return;
      
      // Extract nutrition from USDA food
      const per100g = extractNutritionPer100g(usdaFood);
      
      // Recalculate macros with current portion
      const portionGrams = food.portionGrams || 100;
      const macros = calculateMacrosFromPer100g(per100g, portionGrams);
      
      // Update food item
      const updatedFood = {
        ...food,
        name: usdaFood.description,
        fdcId: usdaFood.fdcId,
        nutritionSource: 'usda',
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        fiber: macros.fiber,
        sugar: macros.sugar,
        per100g: per100g
      };
      
      setFoods(foods.map(f => f.id === foodId ? updatedFood : f));
      
      // Track correction
      setUserCorrections(prev => [...prev, {
        foodId,
        originalName: food.name,
        newName: usdaFood.description,
        originalFdcId: food.fdcId,
        newFdcId: usdaFood.fdcId,
        timestamp: new Date().toISOString(),
        type: 'usda_swap'
      }]);
      
      // Cache it
      const normalizedKey = usdaFood.description.toLowerCase().trim();
      nutritionCacheRef.current.set(normalizedKey, {
        per100g,
        confidence: 0.90,
        source: 'usda',
        fdcId: usdaFood.fdcId,
        description: usdaFood.description
      });
      
      setSearchingItemId(null);
      setUsdaSearchResults([]);
      showToast('Food updated successfully!', 'success');
    };
    
    // Extract nutrition from USDA food (same as in main code)
    const extractNutritionPer100g = (food) => {
      const nutrients = food.foodNutrients || [];
      
      const findNutrient = (searchTerms) => {
        const nutrient = nutrients.find(n => 
          searchTerms.some(term => 
            n.nutrientName?.toLowerCase().includes(term.toLowerCase())
          )
        );
        return nutrient?.value || 0;
      };
      
      return {
        calories: Math.round(findNutrient(['energy', 'calories'])),
        protein: Math.round(findNutrient(['protein']) * 10) / 10,
        carbs: Math.round(findNutrient(['carbohydrate, by difference', 'carbohydrate']) * 10) / 10,
        fat: Math.round(findNutrient(['total lipid', 'fat, total']) * 10) / 10,
        fiber: Math.round(findNutrient(['fiber, total dietary', 'fiber']) * 10) / 10,
        sugar: Math.round(findNutrient(['sugars, total', 'sugar']) * 10) / 10
      };
    };
    
    // Calculate macros from per100g (same as in main code)
    const calculateMacrosFromPer100g = (per100g, grams) => {
      const multiplier = grams / 100;
      
      return {
        calories: Math.round(per100g.calories * multiplier),
        protein: Math.round(per100g.protein * multiplier * 10) / 10,
        carbs: Math.round(per100g.carbs * multiplier * 10) / 10,
        fat: Math.round(per100g.fat * multiplier * 10) / 10,
        fiber: Math.round((per100g.fiber || 0) * multiplier * 10) / 10,
        sugar: Math.round((per100g.sugar || 0) * multiplier * 10) / 10
      };
    };
    
    // Update portion size
    const updatePortion = (foodId, newGrams) => {
      const food = foods.find(f => f.id === foodId);
      if (!food || !food.per100g) return;
      
      const macros = calculateMacrosFromPer100g(food.per100g, newGrams);
      const portionText = generatePortionText(newGrams, food.name, food.category, food.gramsLow, food.gramsHigh);
      
      const updatedFood = {
        ...food,
        portionGrams: newGrams,
        portion: portionText,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat
      };
      
      setFoods(foods.map(f => f.id === foodId ? updatedFood : f));
      
      // Track correction
      setUserCorrections(prev => [...prev, {
        foodId,
        originalGrams: food.portionGrams,
        newGrams,
        timestamp: new Date().toISOString(),
        type: 'portion_update'
      }]);
    };
    
    // Add missing item
    const addMissingItem = async () => {
      if (!newItemName.trim()) return;
      
      setIsSearching(true);
      
      try {
        // Search USDA for the item
        const nutritionData = await lookupUSDANutrition(newItemName, 'carb'); // Default category
        
        const macros = calculateMacrosFromPer100g(nutritionData.per100g, newItemGrams);
        const portionText = generatePortionText(newItemGrams, newItemName, 'carb');
        
        const newFood = {
          id: `manual-${Date.now()}`,
          name: nutritionData.description || newItemName,
          category: 'carb',
          portion: portionText,
          portionGrams: newItemGrams,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          nutritionSource: nutritionData.source,
          fdcId: nutritionData.fdcId,
          per100g: nutritionData.per100g,
          confidence: 1.0, // User-added
          detectionConfidence: 1.0,
          portionConfidence: 0.8,
          nutritionConfidence: nutritionData.confidence
        };
        
        setFoods([...foods, newFood]);
        
        // Track addition
        setUserCorrections(prev => [...prev, {
          type: 'item_added',
          itemName: newItemName,
          grams: newItemGrams,
          timestamp: new Date().toISOString()
        }]);
        
        setShowAddItem(false);
        setNewItemName('');
        setNewItemGrams(100);
        showToast('Item added successfully!', 'success');
      } catch (error) {
        console.error('Error adding item:', error);
        showToast('Could not find item in database', 'error');
      } finally {
        setIsSearching(false);
      }
    };

    const totalNutrition = foods.reduce((sum, food) => ({
      calories: sum.calories + food.calories,
      protein: sum.protein + food.protein,
      carbs: sum.carbs + food.carbs,
      fat: sum.fat + food.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const handleConfirm = () => {
      // Calculate total nutrition from all foods
      const totalNutrition = foods.reduce((acc, food) => ({
        calories: acc.calories + food.calories,
        protein: acc.protein + food.protein,
        carbs: acc.carbs + food.carbs,
        fat: acc.fat + food.fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      // Check if we're replacing a meal in the plan
      if (replacingMealIndex !== null) {
        // Replace the meal in the plan
        const newMeals = [...plan.meals];
        newMeals[replacingMealIndex] = {
          name: mealSlot === 'now' ? 'Scanned Meal' : mealSlot.charAt(0).toUpperCase() + mealSlot.slice(1),
          calories: totalNutrition.calories,
          protein: totalNutrition.protein,
          carbs: totalNutrition.carbs,
          fat: totalNutrition.fat,
          ingredients: foods.map(f => `${f.name} (${f.portion})`),
          instructions: ['Analyzed from photo'],
          foods: foods.map(f => ({
            name: f.name,
            portion: f.portion,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat
          }))
        };
        
        setPlan({...plan, meals: newMeals});
        showToast('Meal replaced successfully!', 'success');
        setReplacingMealIndex(null);
      } else {
        // Add to daily log (original behavior)
        foods.forEach(food => {
          const logEntry = {
            id: Date.now() + Math.random(),
            name: food.name,
            portion: food.portion,
            ...food,
            source: 'plate-ai',
            confidence: plateResult.confidence,
            timestamp: new Date(),
            mealSlot
          };

          setDailyLog(prev => ({
            ...prev,
            meals: [...prev.meals, logEntry],
            totalCalories: prev.totalCalories + food.calories,
            totalProtein: prev.totalProtein + food.protein,
            totalCarbs: prev.totalCarbs + food.carbs,
            totalFat: prev.totalFat + food.fat
          }));
        });
        
        showToast('Meal logged successfully!', 'success');
        setMacrosExpanded(false); // Auto-collapse after logging
      }
      
      // Store user corrections for future improvement
      if (userCorrections.length > 0) {
        console.log('User corrections recorded:', userCorrections);
        
        // Save corrections to localStorage (simple DB for now)
        const correctionRecord = {
          imageHash: plateResult.imageUrl ? plateResult.imageUrl.substring(0, 50) : Date.now().toString(),
          timestamp: new Date().toISOString(),
          originalPredictions: plateResult.foods.map(f => ({
            name: f.name,
            fdcId: f.fdcId,
            grams: f.portionGrams
          })),
          corrections: userCorrections,
          finalFoods: foods.map(f => ({
            name: f.name,
            fdcId: f.fdcId,
            grams: f.portionGrams,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat
          }))
        };
        
        // Append to corrections history
        const existingCorrections = JSON.parse(localStorage.getItem('plato_user_corrections') || '[]');
        existingCorrections.push(correctionRecord);
        
        // Keep last 100 corrections
        if (existingCorrections.length > 100) {
          existingCorrections.shift();
        }
        
        localStorage.setItem('plato_user_corrections', JSON.stringify(existingCorrections));
        
        // TODO: Send to backend when DB layer ready
        // await saveUserCorrections(correctionRecord);
      }

      // Close everything and return to meal plan
      setPlateResult(null);
      setScanMode(null);
      setCapturedImage(null);
      setShowScanning(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-[100] animate-slideUp" onClick={(e) => {
        if (e.target === e.currentTarget) setPlateResult(null);
      }}>
        <div className={`fixed inset-x-0 bottom-0 ${dark?'glass-dark':'glass'} rounded-t-3xl flex flex-col`}
             style={{ height: '90vh', maxHeight: '90vh' }}>
          
          {/* FIXED HEADER */}
          <div className={`flex-shrink-0 p-6 pb-4 border-b ${dark?'border-slate-700':'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className={`text-2xl font-bold ${dark?'text-white':'text-slate-900'}`}>
                  Plate Analysis
                </h3>
                <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                  BETA
                </span>
              </div>
              <button
                onClick={() => setPlateResult(null)}
                className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-slate-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-5">{/* Confidence indicator */}
            <div className={`flex items-center gap-4 p-4 rounded-xl bg-${confidenceColor}-50 dark:bg-${confidenceColor}-900/20 border border-${confidenceColor}-200 dark:border-${confidenceColor}-800`}>
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" 
                          className={`${dark?'text-slate-700':'text-slate-200'}`} strokeWidth="5" fill="none" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor"
                          className={`text-${confidenceColor}-500`} strokeWidth="5" fill="none"
                          strokeDasharray={`${plateResult.confidence * 175.93} 175.93`}
                          strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {Math.round(plateResult.confidence * 100)}%
                </span>
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-${confidenceColor}-700 dark:text-${confidenceColor}-300`}>
                  Confidence: {confidenceLabel}
                </p>
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'} mt-1`}>
                  {needsReview ? 'Please review and edit before saving' : 'Estimates can be off. Edit anytime.'}
                </p>
              </div>
            </div>
            
            {/* Error display for when vision/nutrition is not configured */}
            {hasErrors && (
              <div className={`p-4 rounded-xl ${dark?'bg-orange-900/20 border border-orange-700/30':'bg-orange-50 border border-orange-200'}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${dark?'text-orange-400':'text-orange-600'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${dark?'text-orange-400':'text-orange-700'} mb-1`}>
                      Analysis Not Available
                    </p>
                    <ul className={`text-xs space-y-1 ${dark?'text-orange-300':'text-orange-600'}`}>
                      {plateResult.errors.map((error, idx) => (
                        <li key={idx}>- {error}</li>
                      ))}
                    </ul>
                    <p className={`text-xs mt-2 ${dark?'text-orange-300':'text-orange-600'}`}>
                      Please manually enter your meal details or configure vision/nutrition APIs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Detected foods */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-semibold ${dark?'text-white':'text-slate-900'}`}>
                  Detected Items ({foods.length})
                </h4>
                <div className="flex items-center gap-2">
                  {!showAddItem && (
                    <button
                      onClick={() => setShowAddItem(true)}
                      className="text-green-600 text-sm font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Missing
                    </button>
                  )}
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-blue-600 text-sm font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
              
              {/* Add Missing Item UI */}
              {showAddItem && (
                <div className={`p-4 rounded-xl mb-3 ${dark?'bg-green-900/20 border border-green-700/30':'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`font-semibold ${dark?'text-green-300':'text-green-700'}`}>
                      Add Missing Item
                    </p>
                    <button
                      onClick={() => {
                        setShowAddItem(false);
                        setNewItemName('');
                        setNewItemGrams(100);
                      }}
                      className={`p-1 rounded ${dark?'hover:bg-green-800':'hover:bg-green-100'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${dark?'text-green-300':'text-green-700'}`}>
                        Item name (e.g., "butter", "gravy", "ranch dressing")
                      </label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Enter food name..."
                        className={`w-full px-3 py-2 rounded-lg border ${dark?'bg-slate-700 border-slate-600 text-white placeholder-slate-400':'bg-white border-slate-300 placeholder-slate-400'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${dark?'text-green-300':'text-green-700'}`}>
                        Estimated amount (grams)
                      </label>
                      <input
                        type="number"
                        value={newItemGrams}
                        onChange={(e) => setNewItemGrams(parseInt(e.target.value) || 100)}
                        className={`w-full px-3 py-2 rounded-lg border ${dark?'bg-slate-700 border-slate-600 text-white':'bg-white border-slate-300'}`}
                        min="1"
                      />
                    </div>
                    <button
                      onClick={addMissingItem}
                      disabled={!newItemName.trim() || isSearching}
                      className={`w-full py-2.5 rounded-lg font-semibold ${
                        !newItemName.trim() || isSearching
                          ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg'
                      }`}
                    >
                      {isSearching ? 'Adding...' : 'Add Item'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {foods.map((food, i) => (
                  <div key={food.id} className={`p-4 rounded-xl ${dark?'bg-slate-700':'bg-slate-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className={`font-semibold ${dark?'text-white':'text-slate-900'}`}>
                            {food.name}
                          </h5>
                          {food.nutritionSource && (
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              food.nutritionSource === 'usda' 
                                ? dark?'bg-green-900/30 text-green-400':'bg-green-100 text-green-700'
                                : food.nutritionSource === 'estimated'
                                ? dark?'bg-orange-900/30 text-orange-400':'bg-orange-100 text-orange-700'
                                : dark?'bg-slate-600 text-slate-300':'bg-slate-200 text-slate-600'
                            }`}>
                              {food.nutritionSource === 'usda' ? 'USDA' : 
                               food.nutritionSource === 'estimated' ? 'Est.' : 
                               food.nutritionSource.toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {/* Portion editor */}
                        {editingItemId === food.id ? (
                          <div className="space-y-2 my-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={food.portionGrams || 100}
                                onChange={(e) => updatePortion(food.id, parseInt(e.target.value) || 100)}
                                className={`w-24 px-3 py-1.5 rounded-lg border ${dark?'bg-slate-600 border-slate-500 text-white':'bg-white border-slate-300'}`}
                                min="1"
                              />
                              <span className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>grams</span>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className={`ml-auto px-3 py-1.5 rounded-lg text-sm font-medium ${dark?'bg-slate-600 text-white':'bg-slate-200 text-slate-900'}`}
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                            {food.portion}
                          </p>
                        )}
                        
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="text-blue-600 font-medium">{food.calories} cal</span>
                          <span className="text-purple-600 font-medium">{food.protein}g protein</span>
                          <span className="text-amber-600 font-medium">{food.carbs}g carbs</span>
                          <span className="text-emerald-600 font-medium">{food.fat}g fat</span>
                        </div>
                        
                        {/* Correction buttons */}
                        {!editMode && searchingItemId !== food.id && editingItemId !== food.id && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleUSDASearch(food.id, food.name)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${dark?'bg-slate-600 hover:bg-slate-500 text-white':'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}
                            >
                              <Search className="w-3.5 h-3.5" />
                              Search Matches
                            </button>
                            <button
                              onClick={() => setEditingItemId(food.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${dark?'bg-slate-600 hover:bg-slate-500 text-white':'bg-slate-200 hover:bg-slate-300 text-slate-900'}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Portion
                            </button>
                          </div>
                        )}
                      </div>
                      {editMode && (
                        <button
                          onClick={() => setFoods(foods.filter(f => f.id !== food.id))}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {food.confidence && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`h-1.5 flex-1 progress-bar-track`}>
                          <div 
                            className={`h-full rounded-full bg-${confidenceColor}-500`}
                            style={{ width: `${food.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {Math.round(food.confidence * 100)}%
                        </span>
                      </div>
                    )}
                    
                    {/* USDA Search Results */}
                    {searchingItemId === food.id && (
                      <div className={`mt-3 p-3 rounded-lg ${dark?'bg-slate-800 border border-slate-600':'bg-white border border-slate-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-sm font-semibold ${dark?'text-white':'text-slate-900'}`}>
                            {isSearching ? 'Searching...' : `${usdaSearchResults.length} matches found`}
                          </p>
                          <button
                            onClick={() => {
                              setSearchingItemId(null);
                              setUsdaSearchResults([]);
                            }}
                            className={`p-1 rounded ${dark?'hover:bg-slate-700':'hover:bg-slate-100'}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {isSearching ? (
                          <div className="text-center py-4">
                            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {usdaSearchResults.map((result, idx) => (
                              <button
                                key={result.fdcId}
                                onClick={() => applyUSDAMatch(food.id, result)}
                                className={`w-full text-left p-2.5 rounded-lg transition-all ${dark?'hover:bg-slate-700':'hover:bg-slate-100'}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${dark?'text-white':'text-slate-900'}`}>
                                      {result.description}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                                        result.dataType === 'Foundation' 
                                          ? dark?'bg-green-900/30 text-green-400':'bg-green-100 text-green-700'
                                          : result.dataType === 'SR Legacy'
                                          ? dark?'bg-blue-900/30 text-blue-400':'bg-blue-100 text-blue-700'
                                          : dark?'bg-slate-700 text-slate-400':'bg-slate-200 text-slate-600'
                                      }`}>
                                        {result.dataType}
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        {Math.round(result.matchScore * 100)}% match
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${dark?'text-slate-400':'text-slate-600'}`} />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Confirmation checkbox for low-confidence items */}
                    {requiresConfirmation && lowConfidenceItems.some(item => item.id === food.id) && (
                      <div className={`mt-3 p-3 rounded-lg ${dark?'bg-amber-900/20 border border-amber-700/30':'bg-amber-50 border border-amber-200'}`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={itemConfirmations[food.id] || false}
                            onChange={(e) => {
                              setItemConfirmations(prev => ({
                                ...prev,
                                [food.id]: e.target.checked
                              }));
                              if (!hasReviewedOnce) {
                                setHasReviewedOnce(true);
                              }
                            }}
                            className="mt-0.5 w-5 h-5 rounded border-2 border-amber-500 text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1">
                            <p className={`text-xs font-semibold ${dark?'text-amber-300':'text-amber-700'}`}>
                              Low confidence - please verify
                            </p>
                            <p className={`text-xs mt-1 ${dark?'text-amber-400':'text-amber-600'}`}>
                              Check that the food name and portion look correct. Edit if needed.
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {editMode && (
                <button
                  onClick={() => {
                    // Track corrections when user finishes editing
                    const originalFoods = plateResult?.foods || [];
                    const corrections = [];
                    
                    // Detect changes
                    foods.forEach((currentFood, idx) => {
                      const originalFood = originalFoods.find(f => f.id === currentFood.id);
                      if (originalFood) {
                        const changes = {};
                        if (originalFood.name !== currentFood.name) changes.name = { from: originalFood.name, to: currentFood.name };
                        if (originalFood.portion !== currentFood.portion) changes.portion = { from: originalFood.portion, to: currentFood.portion };
                        if (originalFood.calories !== currentFood.calories) changes.calories = { from: originalFood.calories, to: currentFood.calories };
                        
                        if (Object.keys(changes).length > 0) {
                          corrections.push({
                            foodId: currentFood.id,
                            originalConfidence: originalFood.confidence || 0,
                            changes: changes,
                            timestamp: new Date().toISOString()
                          });
                        }
                      }
                    });
                    
                    // Detect deletions
                    originalFoods.forEach(originalFood => {
                      if (!foods.find(f => f.id === originalFood.id)) {
                        corrections.push({
                          foodId: originalFood.id,
                          originalConfidence: originalFood.confidence || 0,
                          changes: { deleted: true },
                          timestamp: new Date().toISOString()
                        });
                      }
                    });
                    
                    if (corrections.length > 0) {
                      setUserCorrections(prev => [...prev, ...corrections]);
                    }
                    
                    setEditMode(false);
                  }}
                  className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold ${dark?'bg-slate-600 text-white':'bg-slate-200 text-slate-900'}`}
                >
                  Done Editing
                </button>
              )}
            </div>

            {/* Total nutrition */}
            <div className={`p-4 rounded-xl ${dark?'bg-slate-700':'bg-slate-100'}`}>
              <h4 className={`text-sm font-semibold mb-3 ${dark?'text-slate-300':'text-slate-700'}`}>
                Total Nutrition
              </h4>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalNutrition.calories}</div>
                  <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>Cal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalNutrition.protein}g</div>
                  <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{totalNutrition.carbs}g</div>
                  <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{totalNutrition.fat}g</div>
                  <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>Fat</div>
                </div>
              </div>
            </div>

            {/* Meal slot */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${dark?'text-slate-300':'text-slate-700'}`}>
                Add to meal
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['now', 'breakfast', 'lunch', 'dinner', 'snack'].map(slot => (
                  <button
                    key={slot}
                    onClick={() => setMealSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold capitalize btn-press ${
                      mealSlot === slot
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : dark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {slot === 'now' ? 'Now' : slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Debug Section (Dev Mode) */}
            {plateResult.debug && Object.keys(plateResult.debug).length > 0 && (
              <details className={`p-4 rounded-xl ${dark?'bg-slate-700':'bg-slate-100'}`}>
                <summary className={`cursor-pointer font-semibold text-sm ${dark?'text-slate-300':'text-slate-700'} flex items-center gap-2`}>
                  <code className="text-xs"> Debug Info</code>
                  <span className="text-xs opacity-60">(Click to expand)</span>
                </summary>
                <div className="mt-3 space-y-3">
                  {/* Vision Debug */}
                  {plateResult.debug.vision && (
                    <div className={`p-3 rounded-lg ${dark?'bg-slate-800':'bg-slate-50'}`}>
                      <p className={`text-xs font-semibold mb-2 ${dark?'text-blue-400':'text-blue-700'}`}>
                        Vision Analysis
                      </p>
                      <div className="space-y-1 text-xs font-mono">
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Model: {plateResult.debug.vision.visionModel}
                        </p>
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Image Size: {(plateResult.debug.vision.imageSizeBytes / 1024).toFixed(1)} KB
                        </p>
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Items Detected: {plateResult.debug.vision.itemCount}
                        </p>
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Timestamp: {new Date(plateResult.debug.vision.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {plateResult.debug.vision.visionRawJson && (
                        <div className="mt-2">
                          <p className={`text-xs font-semibold mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                            Raw JSON Response:
                          </p>
                          <pre className={`text-xs p-2 rounded overflow-x-auto ${dark?'bg-slate-900 text-green-400':'bg-white text-slate-900'}`}>
                            {JSON.stringify(JSON.parse(plateResult.debug.vision.visionRawJson), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Nutrition Debug */}
                  {plateResult.debug.nutrition && (
                    <div className={`p-3 rounded-lg ${dark?'bg-slate-800':'bg-slate-50'}`}>
                      <p className={`text-xs font-semibold mb-2 ${dark?'text-green-400':'text-green-700'}`}>
                        Nutrition Lookup
                      </p>
                      <div className="space-y-1 text-xs font-mono">
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Lookup Time: {plateResult.debug.nutrition.lookupTimeMs}ms
                        </p>
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Items Processed: {plateResult.debug.nutrition.itemsProcessed}
                        </p>
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Cache Hits: {plateResult.debug.nutrition.cacheHits} / {plateResult.debug.nutrition.itemsProcessed}
                        </p>
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Sources: {JSON.stringify(plateResult.debug.nutrition.sources)}
                        </p>
                        <p className={dark?'text-slate-400':'text-slate-600'}>
                          Cache Size: {nutritionCacheRef.current.size} items
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Debug */}
                  {plateResult.debug.error && (
                    <div className={`p-3 rounded-lg ${dark?'bg-red-900/20':'bg-red-50'}`}>
                      <p className={`text-xs font-semibold mb-2 ${dark?'text-red-400':'text-red-700'}`}>
                        Error Details
                      </p>
                      <div className="space-y-1 text-xs font-mono">
                        <p className={dark?'text-red-300':'text-red-600'}>
                          {plateResult.debug.error.message}
                        </p>
                        {plateResult.debug.error.stack && (
                          <pre className={`text-xs mt-2 p-2 rounded overflow-x-auto ${dark?'bg-red-950 text-red-300':'bg-white text-red-700'}`}>
                            {plateResult.debug.error.stack}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Full Debug Object */}
                  <div className={`p-3 rounded-lg ${dark?'bg-slate-800':'bg-slate-50'}`}>
                    <p className={`text-xs font-semibold mb-2 ${dark?'text-slate-400':'text-slate-600'}`}>
                      Complete Debug Object
                    </p>
                    <pre className={`text-xs p-2 rounded overflow-x-auto ${dark?'bg-slate-900 text-green-400':'bg-white text-slate-900'}`}>
                      {JSON.stringify(plateResult.debug, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Actions */}
            </div>
          </div>
          
          {/* FIXED FOOTER */}
          <div className={`flex-shrink-0 p-6 pt-4 border-t ${dark?'border-slate-700':'border-slate-200'} ${dark?'bg-slate-800':'bg-white'}`}>
            <div className="space-y-3">
              {/* Warning for low confidence */}
              {needsReview && !canLog && (
                <div className={`p-3 rounded-lg ${dark?'bg-yellow-900/20 border border-yellow-700/30':'bg-yellow-50 border border-yellow-200'}`}>
                  <p className={`text-xs ${dark?'text-yellow-300':'text-yellow-700'}`}>
                    <strong>⚠️ Review Required:</strong> {lowConfidenceItems.length > 0 
                      ? `${lowConfidenceItems.length} item${lowConfidenceItems.length > 1 ? 's' : ''} need${lowConfidenceItems.length === 1 ? 's' : ''} confirmation. Check the boxes to confirm.`
                      : 'Low confidence detection. Please verify all items and portions before saving.'}
                  </p>
                </div>
              )}
              
              {/* Info when ready to log after review */}
              {requiresConfirmation && canLog && (
                <div className={`p-3 rounded-lg ${dark?'bg-green-900/20 border border-green-700/30':'bg-green-50 border border-green-200'}`}>
                  <p className={`text-xs ${dark?'text-green-300':'text-green-700'}`}>
                    <strong>✔ Ready to log:</strong> You've reviewed and confirmed all items.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPlateResult(null);
                    setReplacingMealIndex(null);
                  }}
                  className={`flex-1 py-3.5 rounded-xl font-semibold ${dark?'bg-slate-700 text-white':'bg-slate-100 text-slate-900'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!canLog || (hasErrors && foods.length === 0)}
                  className={`flex-2 py-3.5 px-8 rounded-xl font-semibold transition-all ${
                    !canLog || (hasErrors && foods.length === 0)
                      ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {!canLog 
                    ? lowConfidenceItems.length > 0 
                      ? `Review & Confirm (${lowConfidenceItems.filter(f => !itemConfirmations[f.id]).length} left)`
                      : 'Review Required'
                    : hasErrors 
                      ? 'Manual Entry Required' 
                      : replacingMealIndex !== null 
                        ? 'Replace Meal' 
                        : requiresConfirmation
                          ? 'Confirm & Log'
                          : 'Looks Right'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Scanning Hub Main Screen
  if (showScanning && !scanMode) {
    return (
      <div className={`min-h-screen ${dark?'app-bg-dark':'app-bg-light'} p-6 pb-24`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-3xl font-bold ${dark?'text-white':'text-slate-900'}`}>
              Scan Food
            </h1>
            <button
              onClick={() => setShowScanning(false)}
              className={`p-2 rounded-xl ${dark?'bg-slate-800 hover:bg-slate-700':'bg-white hover:bg-slate-100'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {/* Barcode Scan */}
            <button
              onClick={() => setScanMode('barcode')}
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-left shadow-xl hover:shadow-2xl transition-all btn-press"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Scan className="w-9 h-9" />
                </div>
                <CheckCircle className="w-6 h-6 opacity-80" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Scan Packaged Food</h3>
              <p className="text-blue-100">Barcode & QR codes - High accuracy</p>
            </button>

            {/* Plate AI */}
            <button
              onClick={() => setScanMode('plate')}
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white text-left shadow-xl hover:shadow-2xl transition-all btn-press relative overflow-hidden"
            >
              <span className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur text-xs font-bold rounded-full">
                BETA
              </span>
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Camera className="w-9 h-9" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Analyze My Plate</h3>
              <p className="text-purple-100">Photo-based estimates - Quick logging</p>
            </button>
          </div>

          {/* Recent Scans */}
          {recentScans.length > 0 && (
            <div className="mt-8">
              <h3 className={`text-lg font-bold mb-4 ${dark?'text-white':'text-slate-900'}`}>
                Recently Scanned
              </h3>
              <div className="space-y-2">
                {recentScans.slice(0, 5).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setScanResult(item)}
                    className={`w-full p-4 rounded-xl text-left ${dark?'bg-slate-800 hover:bg-slate-700':'bg-white hover:bg-slate-50'} transition-all`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${dark?'text-white':'text-slate-900'}`}>
                          {item.name}
                        </h4>
                        {item.brand && (
                          <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                            {item.brand}
                          </p>
                        )}
                      </div>
                      <ChevronRight className={`w-5 h-5 ${dark?'text-slate-500':'text-slate-400'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className={`mt-8 p-5 rounded-xl ${dark?'bg-slate-800':'bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`font-semibold ${dark?'text-white':'text-slate-900'}`}>
                  Auto-adjust remaining meals
                </h4>
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'} mt-1`}>
                  Recalculate meal plan after logging
                </p>
              </div>
              <button
                onClick={() => setAutoAdjustMeals(!autoAdjustMeals)}
                className={`relative w-14 h-8 rounded-full transition-all ${autoAdjustMeals ? 'bg-blue-600' : dark?'bg-slate-700':'bg-slate-300'}`}
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${autoAdjustMeals ? 'transform translate-x-6' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render scan modes
  if (scanMode === 'barcode') {
    return (
      <>
        <BarcodeScanner />
        {scanResult && <ScanResultSheet />}
      </>
    );
  }

  if (scanMode === 'plate') {
    return (
      <>
        <PhotoCapture />
        {analyzing && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 animate-pulse-ring" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 animate-pulse-ring" style={{animationDelay: '0.5s'}} />
                <Sparkles className="w-24 h-24 text-purple-400 animate-pulse" />
              </div>
              <p className="text-white text-xl font-semibold">Analyzing your plate...</p>
              <p className="text-purple-300 text-sm mt-2">Using AI to detect foods and portions</p>
            </div>
          </div>
        )}
        {plateResult && <PlateResultSheet />}
      </>
    );
  }
  if (showOnboarding) {
    const screens = [
      {
        title: 'Welcome to Plato',
        subtitle: 'Your Personal Nutrition Coach',
        description: 'Science-based meal planning powered by AI. Get personalized nutrition guidance tailored to your goals.',
        icon: Target,
        color: 'from-blue-500 to-indigo-600'
      },
      {
        title: 'Smart Meal Planning',
        subtitle: 'Customized to Your Needs',
        description: 'Generate meal plans that match your dietary preferences, activity level, and fitness goals.',
        icon: Utensils,
        color: 'from-purple-500 to-pink-600'
      },
      {
        title: 'Track Your Progress',
        subtitle: 'Stay on Target',
        description: 'Monitor your daily intake, log meals, and watch your progress toward your nutrition goals.',
        icon: BarChart3,
        color: 'from-emerald-500 to-teal-600'
      },
      {
        title: 'AI-Powered Guidance',
        subtitle: 'Expert Support Anytime',
        description: 'Get instant answers to your nutrition questions from your AI coach, available 24/7.',
        icon: Sparkles,
        color: 'from-amber-500 to-orange-600'
      }
    ];

    const current = screens[onboardingStep];
    const IconComponent = current.icon;

    return (
      <div className={`min-h-screen relative overflow-hidden ${dark?'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800':'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'}`}>
        {/* Subtle background accent - single element */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 pointer-events-none ${
          dark ? 'bg-blue-500' : 'bg-blue-400'
        }`} style={{transform: 'translate(30%, -30%)'}} />

        {/* Progress indicators */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {screens.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === onboardingStep
                  ? 'w-8 bg-blue-600'
                  : idx < onboardingStep
                  ? 'w-1.5 bg-blue-600'
                  : `w-1.5 ${dark ? 'bg-slate-700' : 'bg-slate-300'}`
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
          <div className="max-w-lg w-full text-center animate-fadeIn">
            {/* Icon with refined spacing */}
            <div className="mb-10">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${
                dark 
                  ? 'bg-blue-600/10 border border-blue-500/20' 
                  : 'bg-blue-50 border border-blue-100'
              } shadow-lg`}>
                <IconComponent className={`w-10 h-10 ${dark ? 'text-blue-400' : 'text-blue-600'}`} strokeWidth={1.5} />
              </div>
            </div>

            {/* Text content with refined spacing */}
            <div className="space-y-5 mb-12">
              <h1 className={`text-4xl md:text-5xl font-bold leading-tight ${dark?'text-white':'text-slate-900'}`}>
                {current.title}
              </h1>
              <p className={`text-xl font-semibold ${dark?'text-blue-400':'text-blue-600'}`}>
                {current.subtitle}
              </p>
              <p className={`text-base leading-relaxed ${dark?'text-slate-400':'text-slate-600'} max-w-md mx-auto`}>
                {current.description}
              </p>
            </div>

            {/* Navigation with refined spacing */}
            <div className="flex gap-3 max-w-sm mx-auto">
              {onboardingStep > 0 && (
                <button
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className={`flex-1 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    dark 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
                  }`}
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (onboardingStep === screens.length - 1) {
                    setShowOnboarding(false);
                  } else {
                    setOnboardingStep(onboardingStep + 1);
                  }
                }}
                className={`flex-1 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${
                  dark
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-900/30'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/30'
                }`}
              >
                {onboardingStep === screens.length - 1 ? 'Get Started' : 'Continue'}
              </button>
            </div>
          </div>
        </div>

        {/* Skip button - refined positioning */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOnboarding(false);
          }}
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 px-4 py-2 text-sm font-medium ${
            dark?'text-slate-400 hover:text-slate-200':'text-slate-500 hover:text-slate-700'
          } transition-all z-20 rounded-lg hover:bg-slate-800/50 dark:hover:bg-slate-800/50`}
        >
          Skip introduction
        </button>
      </div>
    );
  }

  if (step === 'welcome') {
    return (
      <div className={`min-h-screen relative overflow-hidden ${dark?'app-bg-dark':'app-bg-light'} flex items-center justify-center p-6`}>
        {/* Subtle animated background */}
        <div className="absolute inset-0 gradient-mesh opacity-40" />
        
        <div className="relative z-10 max-w-lg w-full animate-fadeIn">
          <div className={`${dark?'glass-dark':'glass'} rounded-3xl p-8 md:p-12 shadow-2xl`}>
            <div className="text-center space-y-6">
              {/* Logo/Brand */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg mb-2">
                <ChefHat className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              
              <div>
                <h1 className={`text-5xl font-extrabold mb-3 gradient-text`}>
                  Plato
                </h1>
                <p className={`text-lg ${dark?'text-slate-300':'text-slate-600'}`}>
                  AI-Powered Nutrition Coaching
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && name && setStep('intent')}
                  className={`w-full px-5 py-4 rounded-xl text-center font-medium ${dark?'bg-slate-800 text-white border-slate-700 placeholder-slate-500':'bg-white border-slate-200 placeholder-slate-400'} border-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all`}
                />
                
                <button
                  onClick={() => name && setStep('intent')}
                  disabled={!name}
                  className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed btn-press transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    Get Started
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </button>

                <button
                  onClick={() => setDark(!dark)}
                  className={`w-full px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${dark?'bg-slate-800 text-slate-300 hover:bg-slate-700':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {dark ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Intent Selection Screen (NEW)
  if (step === 'intent') {
    return (
      <div className={`min-h-screen ${dark?'app-bg-dark':'app-bg-light'} flex items-center justify-center p-6`}>
        <div className="relative z-10 max-w-4xl w-full animate-fadeIn">
          <div className={`${dark?'glass-dark':'glass'} rounded-3xl p-8 md:p-12 shadow-2xl`}>
            <div className="text-center mb-8">
              <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${dark?'text-white':'text-slate-900'}`}>
                What would you like help with, {name}?
              </h2>
              <p className={`text-lg ${dark?'text-slate-400':'text-slate-600'}`}>
                Choose your focus (you can always adjust later)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-3xl mx-auto">
              {/* Meal Planning Only */}
              <button
                onClick={() => {
                  setUserIntent('meals');
                  setShowNutritionDetails(false);
                  setStep('input');
                  setOnboardingPhase(2); // Skip to meal preferences
                }}
                className={`p-8 rounded-2xl text-left transition-all btn-press ${
                  dark 
                    ? 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-green-500' 
                    : 'bg-white hover:bg-green-50 border-2 border-slate-200 hover:border-green-400'
                } shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Utensils className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${dark?'text-white':'text-slate-900'}`}>
                  Create a Meal Plan
                </h3>
                <p className={`text-base mb-3 ${dark?'text-slate-300':'text-slate-600'}`}>
                  Get delicious, easy meals to cook today
                </p>
                <p className={`text-sm font-medium flex items-center gap-2 ${dark?'text-slate-400':'text-slate-500'}`}>
                  <Zap className="w-4 h-4" />
                  <span>Fastest setup - Focus on food</span>
                </p>
              </button>

              {/* Do Both (RECOMMENDED) */}
              <button
                onClick={() => {
                  setUserIntent('both');
                  setShowNutritionDetails(true);
                  setStep('input');
                  setOnboardingPhase(1); // Full flow
                }}
                className="p-8 rounded-2xl text-left transition-all btn-press bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-6 right-6 px-3 py-1.5 bg-white/20 backdrop-blur text-xs font-bold rounded-full">
                  RECOMMENDED
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">Meals + Nutrition</h3>
                <p className="text-blue-100 text-base mb-3">
                  Complete meal plan with personalized targets
                </p>
                <p className="text-sm text-blue-200 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Complete experience - Adaptive learning</span>
                </p>
              </button>
            </div>

            <button
              onClick={() => setStep('welcome')}
              className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all ${
                dark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-700'
              }`}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'input') {
    const phaseConfig = {
      1: {
        title: "Let's Calculate Your Plan",
        subtitle: "Basic information for accurate calculations",
        progress: "1 of 2"
      },
      2: {
        title: "Meal Preferences",
        subtitle: "Help us plan meals you'll love",
        progress: "2 of 2"
      }
    };

    const currentPhase = phaseConfig[onboardingPhase];

    return (
      <div className={`min-h-screen ${dark?'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800':'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'} p-6 py-10`}>
        <div className="max-w-2xl mx-auto">
          <div className={`${
            dark
              ? 'bg-slate-800/90 border border-slate-700/50 backdrop-blur-sm'
              : 'bg-white border border-slate-200/50 backdrop-blur-sm'
          } rounded-2xl shadow-2xl p-8 md:p-10 animate-fadeIn`}>
            {/* Phase Progress - refined spacing */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-2">
                {[1, 2].map(phase => (
                  <div
                    key={phase}
                    className={`h-1.5 rounded-full transition-all ${
                      phase === onboardingPhase ? 'w-12 bg-blue-600' :
                      phase < onboardingPhase ? 'w-1.5 bg-blue-600' :
                      `w-1.5 ${dark ? 'bg-slate-700' : 'bg-slate-300'}`
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className={`text-2xl md:text-3xl font-bold ${dark?'text-white':'text-slate-900'}`}>
                    {currentPhase.title}
                  </h2>
                </div>
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                  {currentPhase.subtitle} - Step {currentPhase.progress}
                </p>
              </div>
              <button
                onClick={() => setDark(!dark)}
                className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${dark?'bg-slate-700/50 hover:bg-slate-700 border border-slate-600':'bg-slate-100 hover:bg-slate-200 border border-slate-200'}`}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 animate-ping" />
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
                <p className={`text-lg font-medium ${dark?'text-slate-300':'text-slate-600'} mb-2`}>
                  {['Understanding your goals', 'Balancing your meals', 'Keeping prep time realistic', 'Final check for sustainability'][loadingStep] || 'Building your plan...'}
                </p>
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-500'}`}>
                  This will only take a moment
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6 mb-8">
                  {/* PHASE 1: Core Profile (SKIP for meals-only users) */}
                  {onboardingPhase === 1 && userIntent !== 'meals' && (
                    <>
                      {/* Basic Info Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block mb-2.5 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>Birthday</label>
                      <input
                        type="date"
                        value={form.birthday}
                        onChange={(e) => {
                          const age = calculateAge(e.target.value);
                          setForm({...form, birthday: e.target.value, age: age || 30});
                        }}
                        max={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-2.5 rounded-xl ${dark?'bg-slate-800/50 text-white border-slate-700':'bg-white text-slate-900 border-slate-200'} border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      />
                    </div>

                    <div>
                      <label className={`block mb-2.5 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>Weight (lbs)</label>
                      <input
                        type="number"
                        value={form.weight}
                        onChange={(e) => setForm({...form, weight: parseInt(e.target.value)})}
                        className={`w-full px-4 py-2.5 rounded-xl ${dark?'bg-slate-800/50 text-white border-slate-700':'bg-white text-slate-900 border-slate-200'} border focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                      />
                    </div>

                    <div>
                      <label className={`block mb-2.5 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>Height</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Ft"
                          value={heightFeet}
                          onChange={(e) => {
                            setHeightFeet(parseInt(e.target.value) || 0);
                            setForm({...form, height: (parseInt(e.target.value) || 0) * 12 + heightInches});
                          }}
                          className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white text-slate-900 border-slate-200'} border-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all`}
                        />
                        <input
                          type="number"
                          placeholder="In"
                          value={heightInches}
                          onChange={(e) => {
                            setHeightInches(parseInt(e.target.value) || 0);
                            setForm({...form, height: heightFeet * 12 + (parseInt(e.target.value) || 0)});
                          }}
                          className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white text-slate-900 border-slate-200'} border-2 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live TDEE Preview */}
                  {form.age && form.weight && form.height && (
                    <div className={`p-4 rounded-xl ${dark?'bg-blue-900/20 border-blue-800':'bg-blue-50 border-blue-200'} border-2 animate-slideDown`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${dark?'text-blue-300':'text-blue-700'}`}>
                            Estimated Daily Burn (TDEE)
                          </p>
                          <p className={`text-xs ${dark?'text-blue-400':'text-blue-600'} mt-1`}>
                            Based on your profile & activity level
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">
                            {calculateTDEE(calculateBMR(form.gender, form.weight, form.height, form.age), form.activity)}
                          </p>
                          <p className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>calories/day</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  <div>
                    <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>Gender</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {val: 'male', label: 'Male', icon: User},
                        {val: 'female', label: 'Female', icon: User}
                      ].map(g => (
                        <button
                          key={g.val}
                          onClick={() => setForm({...form, gender: g.val})}
                          className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold btn-press transition-all ${
                            form.gender === g.val
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                              : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-2 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                          }`}
                        >
                          <g.icon className="w-4 h-4" />
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div>
                    <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>Activity Level</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        {val: 'sedentary', label: 'Sedentary', desc: 'Office work'},
                        {val: 'light', label: 'Light', desc: 'Some activity'},
                        {val: 'moderate', label: 'Moderate', desc: 'Regular exercise'},
                        {val: 'very-active', label: 'Very Active', desc: 'Daily training'}
                      ].map(a => (
                        <button
                          key={a.val}
                          onClick={() => setForm({...form, activity: a.val})}
                          className={`py-3 px-3 rounded-xl text-sm font-semibold btn-press transition-all ${
                            form.activity === a.val
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }`}
                        >
                          <div className="font-semibold">{a.label}</div>
                          <div className={`text-xs mt-1 ${form.activity === a.val ? 'text-blue-100' : dark ? 'text-slate-500' : 'text-slate-500'}`}>{a.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Training Type */}
                  <div>
                    <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>Training Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        {val: 'strength', label: 'Strength'},
                        {val: 'cardio', label: 'Cardio'},
                        {val: 'hybrid', label: 'Hybrid'},
                        {val: 'sport', label: 'Sport'}
                      ].map(t => (
                        <button
                          key={t.val}
                          onClick={() => setForm({...form, trainingType: t.val})}
                          className={`py-3 px-3 rounded-xl text-sm font-semibold btn-press transition-all ${
                            form.trainingType === t.val
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ========== PRIMARY GOAL (Energy Direction) ========== */}
                  <div>
                    <div className="mb-4">
                      <label className={`block mb-1.5 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                        Primary Goal
                      </label>
                      <p className={`text-xs ${dark?'text-slate-500':'text-slate-600'}`}>
                        Choose your main energy direction
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {val: 'lose', label: 'Lose Fat', icon: TrendingDown, desc: 'Calorie deficit'},
                        {val: 'maintain', label: 'Maintain', icon: Target, desc: 'Stay consistent'},
                        {val: 'gain', label: 'Gain Weight', icon: TrendingUp, desc: 'Calorie surplus'}
                      ].map(g => {
                        const IconComponent = g.icon;
                        return (
                          <button
                            key={g.val}
                            onClick={() => {
                              // Update primary goal
                              const newPrimaryGoal = g.val;
                              
                              // Get constrained target rate for new combo
                              const constrainedRate = getConstrainedTargetRate(
                                newPrimaryGoal, 
                                form.secondaryGoals || [], 
                                form.targetRate
                              );
                              
                              setForm({
                                ...form, 
                                primaryGoal: newPrimaryGoal,
                                goals: newPrimaryGoal, // Keep legacy field synced
                                targetRate: constrainedRate
                              });
                            }}
                            className={`py-4 px-3 rounded-xl text-sm font-semibold transition-all ${
                              form.primaryGoal === g.val
                                ? dark
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 border border-blue-500'
                                  : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500'
                                : dark 
                                  ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-slate-600' 
                                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-center mb-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                form.primaryGoal === g.val
                                  ? 'bg-white/20 ring-2 ring-white/30'
                                  : dark ? 'bg-slate-700/50' : 'bg-slate-100'
                              }`}>
                                <IconComponent className="w-6 h-6" strokeWidth={2} />
                              </div>
                            </div>
                            <div className="font-semibold text-sm mb-1">{g.label}</div>
                            <div className={`text-xs ${
                              form.primaryGoal === g.val 
                                ? 'text-blue-100' 
                                : dark ? 'text-slate-500' : 'text-slate-500'
                            }`}>{g.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ========== SECONDARY GOALS (Optional Emphasis) ========== */}
                  {form.primaryGoal && (
                    <div className="animate-slideDown">
                      <div className="mb-4">
                        <label className={`block mb-1.5 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                          Secondary Emphasis <span className="text-xs font-normal text-slate-500">(Optional)</span>
                        </label>
                        <p className={`text-xs ${dark?'text-slate-500':'text-slate-600'}`}>
                          Select additional focus areas - these affect macro strategy and meal composition
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                        {[
                          {val: 'build-muscle', label: 'Build Muscle', icon: Dumbbell, desc: 'High protein'},
                          {val: 'improve-performance', label: 'Performance', icon: Zap, desc: 'Energy optimization'},
                          {val: 'improve-endurance', label: 'Endurance', icon: Activity, desc: 'Carb focus'},
                          {val: 'general-health', label: 'General Health', icon: Heart, desc: 'Micronutrients'}
                        ].map(g => {
                          const isSelected = (form.secondaryGoals || []).includes(g.val);
                          const IconComponent = g.icon;
                          
                          return (
                            <button
                              key={g.val}
                              onClick={() => {
                                const currentSecondary = form.secondaryGoals || [];
                                let newSecondary;
                                
                                if (isSelected) {
                                  // Remove from selection
                                  newSecondary = currentSecondary.filter(s => s !== g.val);
                                } else {
                                  // Add to selection
                                  newSecondary = [...currentSecondary, g.val];
                                }
                                
                                // Get constrained target rate for new combo
                                const constrainedRate = getConstrainedTargetRate(
                                  form.primaryGoal, 
                                  newSecondary, 
                                  form.targetRate
                                );
                                
                                setForm({
                                  ...form,
                                  secondaryGoals: newSecondary,
                                  targetRate: constrainedRate
                                });
                              }}
                              className={`py-4 px-3 rounded-xl text-sm font-semibold transition-all ${
                                isSelected
                                  ? dark
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 border border-indigo-500'
                                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500'
                                  : dark 
                                    ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-slate-600' 
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-center mb-2.5">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-white/20 ring-2 ring-white/30'
                                    : dark ? 'bg-slate-700/50' : 'bg-slate-100'
                                }`}>
                                  <IconComponent className="w-5 h-5" strokeWidth={2} />
                                </div>
                              </div>
                              <div className="font-semibold text-xs">{g.label}</div>
                              <div className={`text-xs mt-1 ${isSelected ? 'text-purple-100' : dark ? 'text-slate-500' : 'text-slate-500'}`}>{g.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Helper text for multi-select */}
                      {(form.secondaryGoals || []).length > 0 && (
                        <p className={`text-xs mt-3 ${dark?'text-blue-400':'text-blue-600'}`}>
                          ✔ {(form.secondaryGoals || []).length} emphasis area{(form.secondaryGoals || []).length > 1 ? 's' : ''} selected
                        </p>
                      )}
                    </div>
                  )}

                  {/* ========== TARGET RATE (- filtering) ========== */}
                  {form.primaryGoal && (() => {
                    const validRates = getValidTargetRates(form.primaryGoal, form.secondaryGoals || []);
                    
                    // Hide pace selector for maintenance
                    if (!validRates) {
                      return (
                        <div className="animate-slideDown">
                          <div className={`py-4 px-4 rounded-xl text-center ${dark?'bg-slate-800 border-2 border-blue-500':'bg-blue-50 border-2 border-blue-400'}`}>
                            <div className="font-bold text-lg text-blue-600">Maintain Current Weight</div>
                            <div className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                              Calories balanced with expenditure
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="animate-slideDown">
                        <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                          {form.primaryGoal === 'lose' ? 'How fast do you want to lose?' :
                           form.primaryGoal === 'gain' ? 'How fast do you want to gain?' :
                           'Target Pace'}
                        </label>
                        
                        {/* Show context-aware helper text */}
                        {(form.secondaryGoals || []).includes('build-muscle') && form.primaryGoal === 'lose' && (
                          <p className={`text-xs mb-3 ${dark?'text-blue-400':'text-blue-600'}`}>
                             Slower pace recommended for muscle retention during fat loss
                          </p>
                        )}
                        {(form.secondaryGoals || []).includes('improve-performance') && form.primaryGoal === 'gain' && (
                          <p className={`text-xs mb-3 ${dark?'text-blue-400':'text-blue-600'}`}>
                             Leaner gains recommended for performance optimization
                          </p>
                        )}
                        
                        <div className="grid grid-cols-3 gap-3">
                          {validRates.map(r => (
                            <button
                              key={r.value}
                              onClick={() => setForm({...form, targetRate: r.value})}
                              className={`py-4 px-3 rounded-xl text-sm font-semibold btn-press transition-all ${
                                form.targetRate === r.value
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                  : r.recommended
                                  ? dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-2 border-green-500' : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-green-400'
                                  : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-2 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                              }`}
                            >
                              <div className="font-bold">{r.label}</div>
                              <div className={`text-xs mt-1 ${form.targetRate === r.value ? 'text-blue-200' : dark ? 'text-slate-500' : 'text-slate-500'}`}>
                                {r.desc}
                              </div>
                              {r.recommended && form.targetRate !== r.value && (
                                <div className={`text-xs mt-1 font-semibold ${dark ? 'text-green-400' : 'text-green-600'}`}>
                                  Recommended
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Training Days Per Week - MOVED FROM PHASE 3 */}
                  <div>
                    <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                      Training Days Per Week
                    </label>
                    <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
                      <button
                        onClick={() => setForm({...form, trainingDays: Math.max(0, form.trainingDays - 1)})}
                        className="w-14 h-14 rounded-xl bg-white dark:bg-slate-600 flex items-center justify-center font-bold text-xl hover:bg-slate-50 dark:hover:bg-slate-500 transition-all shadow-md btn-press"
                      >
                        <Minus className="w-6 h-6" />
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-5xl font-bold text-blue-600">{form.trainingDays}</div>
                        <div className={`text-sm mt-2 ${dark?'text-slate-300':'text-slate-700'} font-semibold`}>
                          days per week
                        </div>
                      </div>
                      <button
                        onClick={() => setForm({...form, trainingDays: Math.min(7, form.trainingDays + 1)})}
                        className="w-14 h-14 rounded-xl bg-white dark:bg-slate-600 flex items-center justify-center font-bold text-xl hover:bg-slate-50 dark:hover:bg-slate-500 transition-all shadow-md btn-press"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                    <p className={`text-xs mt-2 ${dark?'text-slate-400':'text-slate-600'} text-center`}>
                      This helps us adjust your macro ratios for training days
                    </p>
                  </div>
                    </>
                  )}

                  {/* PHASE 2: Meal Preferences */}
                  {onboardingPhase === 2 && (
                    <>
                      {/* Meals Per Day */}
                      <div>
                        <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                          Meals Per Day
                        </label>
                        <div className="grid grid-cols-5 gap-3">
                          {[2, 3, 4, 5, 6].map(n => (
                            <button
                              key={n}
                              onClick={() => setForm({...form, meals: n})}
                              className={`py-4 rounded-xl text-lg font-bold transition-all btn-press ${
                                form.meals === n
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                  : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-2 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <p className={`text-xs mt-2 ${dark?'text-slate-400':'text-slate-600'}`}>
                          Choose how many times you prefer to eat each day
                        </p>
                      </div>

                      {/* Allergies/Restrictions */}
                      <div>
                        <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                          Allergies & Restrictions
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., nuts, dairy, gluten..."
                          value={form.restrictions}
                          onChange={(e) => setForm({...form, restrictions: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white':'bg-white'} border-2 ${dark?'border-slate-700':'border-gray-200'} focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all`}
                        />
                        <p className={`text-xs mt-2 ${dark?'text-slate-400':'text-slate-600'}`}>
                          Let us know about any dietary restrictions
                        </p>
                      </div>

                      {/* Meal Prep Time */}
                      <div>
                        <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                          Meal Prep Time Preference
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            {val: 'quick', label: 'Quick', icon: Zap, desc: '<15min'},
                            {val: 'moderate', label: 'Moderate', icon: Clock, desc: '15-30min'},
                            {val: 'any', label: 'Any Time', icon: ChefHat, desc: 'No limit'}
                          ].map(t => {
                            const IconComponent = t.icon;
                            return (
                              <button
                                key={t.val}
                                onClick={() => setForm({...form, cookTime: t.val})}
                                className={`py-4 px-3 rounded-xl text-sm font-semibold transition-all ${
                                  form.cookTime === t.val
                                    ? dark
                                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30 border border-blue-500'
                                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500'
                                    : dark 
                                      ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-slate-600' 
                                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center justify-center mb-2">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                                    form.cookTime === t.val
                                      ? 'bg-white/20 ring-2 ring-white/30'
                                      : dark ? 'bg-slate-700/50' : 'bg-slate-100'
                                  }`}>
                                    <IconComponent className="w-5 h-5" strokeWidth={2} />
                                  </div>
                                </div>
                                <div className="font-bold">{t.label}</div>
                                <div className={`text-xs mt-1 ${form.cookTime === t.val ? 'text-blue-100' : dark ? 'text-slate-500' : 'text-slate-500'}`}>
                                  {t.desc}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Macro Philosophy - MOVED FROM PHASE 3 */}
                      <div>
                        <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                          Macro Philosophy
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {[
                            {val: 'high-protein', label: 'High Protein', desc: '40/30/30'},
                            {val: 'low-carb', label: 'Low Carb', desc: '<30% carbs'},
                            {val: 'balanced', label: 'Balanced', desc: '30/40/30'},
                            {val: 'keto', label: 'Keto', desc: '<20g carbs'},
                            {val: 'plant-based', label: 'Plant Based', desc: 'No animal'}
                          ].map(d => (
                            <button
                              key={d.val}
                              onClick={() => setForm({...form, dietStyle: d.val})}
                              className={`py-4 px-3 rounded-xl text-sm font-semibold btn-press transition-all ${
                                form.dietStyle === d.val
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                  : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-2 border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200'
                              }`}
                            >
                              <div className="font-bold">{d.label}</div>
                              <div className={`text-xs mt-1 ${form.dietStyle === d.val ? 'text-blue-100' : dark ? 'text-slate-500' : 'text-slate-500'}`}>
                                {d.desc}
                              </div>
                            </button>
                          ))}
                        </div>
                        <p className={`text-xs mt-2 ${dark?'text-slate-400':'text-slate-600'}`}>
                          This adjusts your macro ratios (Protein/Carbs/Fat)
                        </p>
                      </div>

                      {/* Cuisine Preferences - NEW */}
                      <div>
                        <label className={`block mb-3 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                          Cuisine Preferences <span className={`text-xs font-normal ${dark?'text-slate-500':'text-slate-500'}`}>(Optional)</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {[
                            {val: 'italian', label: 'Italian'},
                            {val: 'mediterranean', label: 'Mediterranean'},
                            {val: 'american', label: 'American'},
                            {val: 'asian', label: 'Asian'},
                            {val: 'mexican', label: 'Mexican'},
                            {val: 'indian', label: 'Indian'},
                            {val: 'middle-eastern', label: 'Middle Eastern'}
                          ].map(c => (
                            <button
                              key={c.val}
                              onClick={() => {
                                const newCuisines = form.cuisines.includes(c.val)
                                  ? form.cuisines.filter(cuisine => cuisine !== c.val)
                                  : [...form.cuisines, c.val];
                                setForm({...form, cuisines: newCuisines});
                              }}
                              className={`py-3 px-3 rounded-xl text-sm font-semibold btn-press transition-all ${
                                form.cuisines.includes(c.val)
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                  : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                {form.cuisines.includes(c.val) && <CheckCircle className="w-3.5 h-3.5" />}
                                <span>{c.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <p className={`text-xs mt-2 ${dark?'text-slate-400':'text-slate-600'}`}>
                          Select all that interest you (or skip to see all options)
                        </p>
                      </div>
                    </>
                  )}

                  {/* PHASE 3: Training & Advanced (Optional) - SKIP for meals-only users */}
                  {onboardingPhase === 3 && userIntent !== 'meals' && (
                    <>
                      {/* Phase 3 is now lighter - Training Days and Macro Philosophy moved to earlier phases */}
                      {/* This phase can be used for future advanced options */}
                    </>
                  )}
                </div>

                {/* Phase Navigation Buttons */}
                <div className="flex gap-3">
                  {onboardingPhase > 1 && userIntent !== 'meals' && (
                    <button
                      onClick={() => setOnboardingPhase(onboardingPhase - 1)}
                      className={`flex-1 py-4 rounded-xl font-semibold text-base ${dark?'bg-slate-700 text-white hover:bg-slate-600':'bg-slate-100 text-slate-900 hover:bg-slate-200'} transition-all btn-press`}
                    >
                      Back
                    </button>
                  )}
                  
                  {/* For meals-only: Phase 2 generates directly */}
                  {/* For nutrition users: Phase 2 also generates now (Phase 3 moved to Phase 1 & 2) */}
                  {onboardingPhase === 2 ? (
                    <button
                      onClick={gen}
                      className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl btn-press transition-all relative overflow-hidden group animate-gradientShift"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        <Sparkles className="w-6 h-6" />
                        {userIntent === 'meals' ? 'Create My Meals' : 'Build My Day'}
                      </span>
                    </button>
                  ) : onboardingPhase < 2 ? (
                    <button
                      onClick={() => setOnboardingPhase(onboardingPhase + 1)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl btn-press transition-all"
                    >
                      Continue
                    </button>
                  ) : null}
                </div>

                {/* Remove skip option - Phase 3 no longer needed */}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== RECIPE MODALS (CHECK FIRST) ==========
  
  // AI Recipe Search Modal
  if (showRecipeSearch) {
    // Determine what to display
    const hasSearchQuery = recipeSearchQuery.trim().length > 0;
    const hasActiveFilters = getActiveFilterCount() > 0;
    const isSearching = recipeSearchLoading;
    
    // Get recipes to display
    let displayedRecipes = [];
    if (hasSearchQuery || hasActiveFilters) {
      // Show filtered search results or filtered recommendations
      const baseRecipes = recipeSearchResults.length > 0 ? recipeSearchResults : recommendedRecipes;
      displayedRecipes = applyRecipeFilters(baseRecipes);
    } else {
      // Show recommended recipes by default
      displayedRecipes = recommendedRecipes;
    }
    
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowRecipeSearch(false)} />
        <div className={`fixed inset-x-4 top-20 bottom-20 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl ${dark?'bg-slate-800':'bg-white'} rounded-3xl shadow-xl z-50 overflow-hidden flex flex-col`}>
          <div className={`p-6 border-b ${dark?'border-slate-700':'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-black ${dark?'text-white':'text-gray-900'}`}>Discover Recipes</h2>
              <button onClick={() => setShowRecipeSearch(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={recipeSearchQuery}
                onChange={(e) => setRecipeSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchRecipesWithAI(recipeSearchQuery)}
                placeholder="Search recipes..."
                className={`flex-1 px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500`}
              />
              <button
                onClick={() => searchRecipesWithAI(recipeSearchQuery)}
                disabled={!recipeSearchQuery || recipeSearchLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold disabled:opacity-50 btn-press"
              >
                {recipeSearchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                hasActiveFilters 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : dark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="font-semibold text-sm">Filters</span>
              {hasActiveFilters && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-12">
                <Loader2 className={`w-12 h-12 mx-auto mb-4 ${dark?'text-purple-400':'text-purple-600'} animate-spin`} />
                <p className={`${dark?'text-slate-400':'text-gray-600'}`}>Searching recipes...</p>
              </div>
            )}
            
            {/* Results or Recommendations */}
            {!isSearching && (
              <>
                {/* Section Header */}
                <div className="mb-4">
                  <h3 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                    {hasSearchQuery || hasActiveFilters ? `Found ${displayedRecipes.length} recipes` : 'Recommended for You'}
                  </h3>
                  {!hasSearchQuery && !hasActiveFilters && (
                    <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                      Popular recipes to get you started
                    </p>
                  )}
                </div>
                
                {/* Recipe Cards */}
                {displayedRecipes.length > 0 ? (
                  <div className="space-y-4">
                    {displayedRecipes.map((result) => (
                      <div key={result.id} className={`${dark?'bg-slate-700':'bg-gray-50'} rounded-2xl p-4`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`font-bold ${dark?'text-white':'text-gray-900'} flex-1`}>{result.title}</h3>
                          {result.cookTime && (
                            <span className={`text-xs px-2 py-1 rounded-full ${dark?'bg-slate-600 text-slate-300':'bg-gray-200 text-gray-600'}`}>
                              {result.cookTime} min
                            </span>
                          )}
                        </div>
                        
                        {/* Category & Cuisine Tags */}
                        <div className="flex gap-2 mb-3">
                          {result.category && (
                            <span className={`text-xs px-2 py-1 rounded-full ${dark?'bg-purple-900/30 text-purple-300':'bg-purple-100 text-purple-700'}`}>
                              {result.category}
                            </span>
                          )}
                          {result.cuisine && (
                            <span className={`text-xs px-2 py-1 rounded-full ${dark?'bg-blue-900/30 text-blue-300':'bg-blue-100 text-blue-700'}`}>
                              {result.cuisine}
                            </span>
                          )}
                        </div>
                        
                        {/* Nutrition */}
                        <div className="flex gap-4 text-sm mb-3">
                          <span className={`${dark?'text-purple-400':'text-purple-600'} font-semibold`}>
                            {result.nutritionPerServing.calories} cal
                          </span>
                          <span className={`${dark?'text-slate-400':'text-gray-600'}`}>
                            {result.nutritionPerServing.protein}g P
                          </span>
                          <span className={`${dark?'text-slate-400':'text-gray-600'}`}>
                            {result.nutritionPerServing.carbs}g C
                          </span>
                          <span className={`${dark?'text-slate-400':'text-gray-600'}`}>
                            {result.nutritionPerServing.fat}g F
                          </span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setRecipeInReview(result);
                            setShowRecipeSearch(false);
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl font-semibold text-sm btn-press"
                        >
                          View Recipe
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center py-12">
                    <div className={`text-6xl mb-4`}></div>
                    <h3 className={`text-lg font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                      No recipes found
                    </h3>
                    <p className={`text-sm mb-4 ${dark?'text-slate-400':'text-gray-600'}`}>
                      Try adjusting your filters or search terms
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className={`px-4 py-2 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-100 text-gray-900'} font-semibold text-sm`}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <>
            <div className="fixed inset-0 bg-black/70 z-[100]" onClick={() => setShowFilters(false)} />
            <div className={`fixed inset-x-0 bottom-0 ${dark?'bg-slate-800':'bg-white'} rounded-t-3xl shadow-2xl z-[100] max-h-[80vh] overflow-hidden flex flex-col`}>
              {/* Header - Fixed */}
              <div className={`p-6 border-b ${dark?'border-slate-700':'border-gray-200'} flex-shrink-0`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-2xl font-bold ${dark?'text-white':'text-gray-900'}`}>Filters</h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={clearAllFilters}
                      className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${dark?'bg-slate-700 text-purple-400 hover:bg-slate-600':'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                    >
                      Clear all
                    </button>
                    <button onClick={() => setShowFilters(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                
                {/* Category Filter */}
                <div className="mb-6">
                  <label className={`block text-sm font-bold mb-3 ${dark?'text-slate-300':'text-gray-700'}`}>
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Meal Prep', 'Quick'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setRecipeFilters({...recipeFilters, category: recipeFilters.category === cat ? null : cat})}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          recipeFilters.category === cat
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Macro Focus Filter */}
                <div className="mb-6">
                  <label className={`block text-sm font-bold mb-3 ${dark?'text-slate-300':'text-gray-700'}`}>
                    Macro Focus
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['High protein', 'Low calorie', 'Low carb', 'Balanced', 'High fiber'].map(macro => (
                      <button
                        key={macro}
                        onClick={() => setRecipeFilters({...recipeFilters, macroFocus: recipeFilters.macroFocus === macro ? null : macro})}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          recipeFilters.macroFocus === macro
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {macro}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Cuisine Filter */}
                <div className="mb-6">
                  <label className={`block text-sm font-bold mb-3 ${dark?'text-slate-300':'text-gray-700'}`}>
                    Cuisine (multi-select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['American', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'Indian'].map(cuisine => (
                      <button
                        key={cuisine}
                        onClick={() => {
                          const newCuisines = recipeFilters.cuisine.includes(cuisine)
                            ? recipeFilters.cuisine.filter(c => c !== cuisine)
                            : [...recipeFilters.cuisine, cuisine];
                          setRecipeFilters({...recipeFilters, cuisine: newCuisines});
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          recipeFilters.cuisine.includes(cuisine)
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : dark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Advanced Filters Toggle */}
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center gap-2 text-sm font-semibold mb-4 ${dark?'text-purple-400':'text-purple-600'}`}
                >
                  <ChevronRight className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-90' : ''}`} />
                  More filters
                </button>
                
                {/* Advanced Filters */}
                {showAdvancedFilters && (
                  <div className={`mb-6 p-4 rounded-xl ${dark?'bg-slate-700':'bg-gray-50'}`}>
                    <div className="mb-4">
                      <label className={`block text-sm font-bold mb-2 ${dark?'text-slate-300':'text-gray-700'}`}>
                        Max cooking time
                      </label>
                      <select
                        value={recipeFilters.advanced.maxTime || ''}
                        onChange={(e) => setRecipeFilters({
                          ...recipeFilters,
                          advanced: {...recipeFilters.advanced, maxTime: e.target.value ? parseInt(e.target.value) : null}
                        })}
                        className={`w-full px-4 py-2 rounded-xl ${dark?'bg-slate-600 text-white':'bg-white'} border-2 ${dark?'border-slate-500':'border-gray-200'}`}
                      >
                        <option value="">Any time</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fixed Footer with Apply Button */}
              <div className={`p-6 border-t ${dark?'border-slate-700':'border-gray-200'} flex-shrink-0`}>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  // ========== USE INGREDIENTS, SAVED RECIPES, FAVORITE MEALS (MUST COME BEFORE RESULTS) ==========
  
  if (showUseIngredients) {
    return (
      <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => {
                if (ingredientFlowStep === 1) {
                  setShowUseIngredients(false);
                  resetIngredientFlow();
                } else {
                  setIngredientFlowStep(ingredientFlowStep - 1);
                }
              }}
              className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
            >
              <X className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
              Use Ingredients
            </h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
              Find recipes using ingredients you already have
            </h2>
            <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
              Take photos, choose from your gallery, or type ingredients manually
            </p>
          </div>

          {/* Simple working interface */}
          <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg mb-4`}>
            <h3 className={`text-lg font-semibold mb-4 ${dark?'text-white':'text-gray-900'}`}>
              What ingredients do you have?
            </h3>
            
            <div className="space-y-2 mb-3">
              <textarea
                value={currentIngredientInput}
                onChange={(e) => setCurrentIngredientInput(e.target.value)}
                onKeyPress={handleIngredientKeyPress}
                placeholder="Type ingredients (comma-separated or one per line)&#10;Examples: chicken, rice, tomatoes&#10;Or paste a list from your notes"
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${dark?'bg-slate-700 border-slate-600 text-white placeholder-slate-400':'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => addIngredientsFromInput(currentIngredientInput, false)}
                  disabled={!currentIngredientInput.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    currentIngredientInput.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Ingredients
                </button>
              </div>
            </div>
            
            {/* Ingredient Chips */}
            {confirmedIngredients.length > 0 && (
              <div className="space-y-2">
                <div className={`text-xs font-medium ${dark?'text-slate-400':'text-gray-600'}`}>
                  Your ingredients ({confirmedIngredients.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {confirmedIngredients.map((ing, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${dark?'bg-emerald-900/30 border border-emerald-700':'bg-emerald-50 border border-emerald-200'} transition-all hover:shadow-md`}
                    >
                      <span className={`text-sm font-medium ${dark?'text-emerald-300':'text-emerald-700'}`}>
                        {ing}
                      </span>
                      <button 
                        onClick={() => removeIngredient(ing, false)}
                        className={`hover:opacity-70 transition-opacity`}
                      >
                        <X className={`w-3.5 h-3.5 ${dark?'text-emerald-400':'text-emerald-600'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PART 2: Optional Exclude Ingredients Section */}
          <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg mb-4`}>
            <button
              onClick={() => setShowExcludeSection(!showExcludeSection)}
              className={`w-full flex items-center justify-between ${dark?'text-white':'text-gray-900'} transition-all`}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  Exclude ingredients
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${dark?'bg-slate-700 text-slate-400':'bg-gray-100 text-gray-600'}`}>
                  Optional
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showExcludeSection ? 'rotate-180' : ''} ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            
            {showExcludeSection && (
              <div className="mt-4 space-y-3 animate-slideDown">
                <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                  Recipes containing these ingredients will be filtered out
                </p>
                
                <textarea
                  value={currentExcludeInput}
                  onChange={(e) => setCurrentExcludeInput(e.target.value)}
                  onKeyPress={(e) => handleIngredientKeyPress(e, true)}
                  placeholder="e.g., dairy, nuts, shellfish"
                  rows={2}
                  className={`w-full px-4 py-3 rounded-lg border ${dark?'bg-slate-700 border-slate-600 text-white placeholder-slate-400':'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-red-500 resize-none`}
                />
                
                <button
                  onClick={() => addIngredientsFromInput(currentExcludeInput, true)}
                  disabled={!currentExcludeInput.trim()}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                    currentExcludeInput.trim()
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Exclusions
                </button>
                
                {/* Exclude Chips */}
                {excludedIngredients.length > 0 && (
                  <div className="space-y-2">
                    <div className={`text-xs font-medium ${dark?'text-slate-400':'text-gray-600'}`}>
                      Excluded ingredients ({excludedIngredients.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {excludedIngredients.map((ing, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${dark?'bg-red-900/30 border border-red-700':'bg-red-50 border border-red-200'} transition-all hover:shadow-md`}
                        >
                          <span className={`text-sm font-medium ${dark?'text-red-300':'text-red-700'}`}>
                            {ing}
                          </span>
                          <button 
                            onClick={() => removeIngredient(ing, true)}
                            className={`hover:opacity-70 transition-opacity`}
                          >
                            <X className={`w-3.5 h-3.5 ${dark?'text-red-400':'text-red-600'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              if (confirmedIngredients.length === 0) {
                showToast('Please add at least one ingredient', 'error');
                return;
              }
              
              setIngredientLoading(true);
              const recipes = await generateRecipesFromIngredients(confirmedIngredients, ingredientOptions);
              setIngredientRecipeSuggestions(recipes);
              setIngredientLoading(false);
              setIngredientFlowStep(3);
            }}
            disabled={confirmedIngredients.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              confirmedIngredients.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg'
            }`}
          >
            {ingredientLoading ? 'Finding Recipes...' : 'Find Recipes'}
          </button>

          {/* Recipe Results */}
          {ingredientFlowStep === 3 && ingredientRecipeSuggestions.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className={`text-xl font-bold mb-4 ${dark?'text-white':'text-gray-900'}`}>
                Found {ingredientRecipeSuggestions.length} Recipe{ingredientRecipeSuggestions.length !== 1 ? 's' : ''}
              </h3>
              
              {ingredientRecipeSuggestions.map((recipe, idx) => (
                <div
                  key={recipe.id || idx}
                  onClick={() => setSelectedIngredientRecipe(selectedIngredientRecipe?.id === recipe.id ? null : recipe)}
                  className={`${dark?'bg-slate-800 hover:bg-slate-750':'bg-white hover:bg-gray-50'} rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all ${
                    selectedIngredientRecipe?.id === recipe.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* PART 5: Collapsed Card View */}
                  <div className="flex gap-4 p-4">
                    {/* Recipe Image */}
                    {recipe.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={recipe.image} 
                          alt={recipe.name || recipe.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Recipe Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                          {recipe.name || recipe.title}
                        </h4>
                        
                        {/* Source Badge */}
                        {recipe.source === 'mealdb' && (
                          <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${dark?'bg-blue-900/30 text-blue-400':'bg-blue-50 text-blue-700'} border ${dark?'border-blue-700':'border-blue-200'}`}>
                            Imported
                          </span>
                        )}
                      </div>
                      
                      {/* Ingredient Match Text */}
                      <div className={`text-sm font-medium mb-1 ${
                        recipe.ingredientPercentage >= 75 
                          ? dark?'text-emerald-400':'text-emerald-600'
                          : recipe.ingredientPercentage >= 50
                          ? dark?'text-yellow-400':'text-yellow-600'
                          : dark?'text-orange-400':'text-orange-600'
                      }`}>
                        {recipe.ingredientMatchText || `Uses ${recipe.matchCount || 0} ingredients`}
                      </div>
                      
                      {/* Category & Area */}
                      <div className="flex items-center gap-2 text-xs">
                        {recipe.category && (
                          <span className={`${dark?'text-slate-400':'text-gray-600'}`}>
                            {recipe.category}
                          </span>
                        )}
                        {recipe.area && (
                          <>
                            <span className={`${dark?'text-slate-600':'text-gray-400'}`}>-</span>
                            <span className={`${dark?'text-slate-400':'text-gray-600'}`}>
                              {recipe.area}
                            </span>
                          </>
                        )}
                        {recipe.time && (
                          <>
                            <span className={`${dark?'text-slate-600':'text-gray-400'}`}>-</span>
                            <span className={`${dark?'text-slate-400':'text-gray-600'}`}>
                              {recipe.time} min
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Expand Chevron */}
                    <div className="flex-shrink-0 flex items-center">
                      <ChevronDown className={`w-5 h-5 transition-transform ${
                        selectedIngredientRecipe?.id === recipe.id ? 'rotate-180' : ''
                      } ${dark?'text-slate-400':'text-gray-600'}`} />
                    </div>
                  </div>
                  
                  {/* PART 6: Expanded View */}
                  {selectedIngredientRecipe?.id === recipe.id && (
                    <div className={`border-t ${dark?'border-slate-700':'border-gray-200'} animate-slideDown`}>
                      <div className="p-4 space-y-4">
                        
                        {/* A) Ingredients Section */}
                        <div>
                          <h5 className={`font-semibold mb-3 flex items-center gap-2 ${dark?'text-white':'text-gray-900'}`}>
                            <ChefHat className="w-4 h-4" />
                            Ingredients
                          </h5>
                          
                          {/* You Have / You Need */}
                          <div className="space-y-3">
                            {(() => {
                              const userHas = [];
                              const userNeeds = [];
                              
                              recipe.ingredients.forEach(ing => {
                                const ingName = typeof ing === 'string' ? ing : (ing.name || ing.strIngredient || '');
                                const ingMeasure = typeof ing === 'string' ? '' : (ing.measure || ing.strMeasure || '');
                                
                                // Check if user has this ingredient
                                const hasIt = confirmedIngredients.some(userIng => {
                                  const userLower = userIng.toLowerCase();
                                  const recipeLower = ingName.toLowerCase();
                                  return recipeLower.includes(userLower) || userLower.includes(recipeLower);
                                });
                                
                                const displayText = ingMeasure ? `${ingMeasure} ${ingName}` : ingName;
                                
                                if (hasIt) {
                                  userHas.push(displayText);
                                } else {
                                  userNeeds.push(displayText);
                                }
                              });
                              
                              return (
                                <>
                                  {/* You Have */}
                                  {userHas.length > 0 && (
                                    <div className={`p-3 rounded-lg ${dark?'bg-emerald-900/20 border border-emerald-700/30':'bg-emerald-50 border border-emerald-200'}`}>
                                      <div className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark?'text-emerald-400':'text-emerald-700'}`}>
                                        <Check className="w-4 h-4" />
                                        You have ({userHas.length})
                                      </div>
                                      <ul className="space-y-1">
                                        {userHas.map((ing, i) => (
                                          <li key={i} className={`text-sm flex items-start gap-2 ${dark?'text-emerald-300':'text-emerald-700'}`}>
                                            <span className="text-emerald-500">✔</span>
                                            <span>{ing}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* You Need */}
                                  {userNeeds.length > 0 && (
                                    <div className={`p-3 rounded-lg ${dark?'bg-orange-900/20 border border-orange-700/30':'bg-orange-50 border border-orange-200'}`}>
                                      <div className={`text-sm font-semibold mb-2 flex items-center gap-2 ${dark?'text-orange-400':'text-orange-700'}`}>
                                        <ShoppingCart className="w-4 h-4" />
                                        You need ({userNeeds.length})
                                      </div>
                                      <ul className="space-y-1">
                                        {userNeeds.map((ing, i) => (
                                          <li key={i} className={`text-sm flex items-start gap-2 ${dark?'text-orange-300':'text-orange-700'}`}>
                                            <span className="text-orange-500">○</span>
                                            <span>{ing}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        
                        {/* B) Instructions */}
                        {recipe.instructions && recipe.instructions.length > 0 && (
                          <div>
                            <h5 className={`font-semibold mb-3 flex items-center gap-2 ${dark?'text-white':'text-gray-900'}`}>
                              <BookOpen className="w-4 h-4" />
                              Instructions
                            </h5>
                            <ol className="space-y-2">
                              {recipe.instructions.map((step, i) => (
                                <li key={i} className="flex gap-3">
                                  <span className={`flex-shrink-0 w-6 h-6 rounded-full ${dark?'bg-blue-900/30 text-blue-400':'bg-blue-100 text-blue-600'} flex items-center justify-center text-xs font-bold`}>
                                    {i + 1}
                                  </span>
                                  <p className={`text-sm flex-1 ${dark?'text-slate-300':'text-gray-700'}`}>
                                    {step}
                                  </p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {/* C) Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addRecipeToMealPlan(recipe);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${dark?'bg-blue-600 hover:bg-blue-700 text-white':'bg-blue-500 hover:bg-blue-600 text-white'}`}
                          >
                            <CalendarPlus className="w-4 h-4" />
                            Add to Meal Plan
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveRecipe(recipe);
                              showToast('Recipe saved!', 'success');
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${dark?'bg-purple-600 hover:bg-purple-700 text-white':'bg-purple-500 hover:bg-purple-600 text-white'}`}
                          >
                            <BookmarkPlus className="w-4 h-4" />
                            Save Recipe
                          </button>
                          
                          {(() => {
                            // Calculate missing ingredients for grocery list
                            const missing = recipe.ingredients.filter(ing => {
                              const ingName = typeof ing === 'string' ? ing : (ing.name || ing.strIngredient || '');
                              return !confirmedIngredients.some(userIng => {
                                const userLower = userIng.toLowerCase();
                                const recipeLower = ingName.toLowerCase();
                                return recipeLower.includes(userLower) || userLower.includes(recipeLower);
                              });
                            });
                            
                            if (missing.length > 0) {
                              return (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Add missing items to grocery list
                                    const newItems = missing.map(ing => {
                                      const ingName = typeof ing === 'string' ? ing : (ing.name || ing.strIngredient || '');
                                      const ingMeasure = typeof ing === 'string' ? '' : (ing.measure || ing.strMeasure || '');
                                      return {
                                        id: Math.random().toString(36).substr(2, 9),
                                        name: ingName,
                                        quantity: ingMeasure || '1',
                                        category: categorizeIngredient(ingName),
                                        checked: false,
                                        alreadyHave: false
                                      };
                                    });
                                    
                                    setGroceryList([...groceryList, ...newItems]);
                                    showToast(`Added ${missing.length} items to grocery list`, 'success');
                                  }}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${dark?'bg-emerald-600 hover:bg-emerald-700 text-white':'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  Add {missing.length} to Grocery
                                </button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (showSavedRecipes) {
    return (
      <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
        <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button onClick={() => setShowSavedRecipes(false)} className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}>
              <X className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>Saved Recipes</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          {recipes.length === 0 ? (
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-12 text-center shadow-lg`}>
              <BookOpen className={`w-16 h-16 mx-auto mb-4 ${dark?'text-slate-600':'text-gray-300'}`} />
              <h2 className={`text-xl font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                No Saved Recipes Yet
              </h2>
              <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'} mb-6`}>
                Save recipes from "Use Ingredients" or "Find Recipes"
              </p>
              <button
                onClick={() => setShowSavedRecipes(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Browse Recipes
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {recipes.map((recipe, idx) => (
                <div key={recipe.id || idx} className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-5 shadow-lg`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                        {recipe.title}
                      </h3>
                      {recipe.time && (
                        <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                          {recipe.time} min - {recipe.difficulty}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setRecipes(recipes.filter(r => r.id !== recipe.id));
                        showToast('Recipe removed', 'success');
                      }}
                      className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
                    >
                      <Trash2 className={`w-4 h-4 ${dark?'text-red-400':'text-red-600'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  if (showFavoriteMeals) {
    return (
      <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
        <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button onClick={() => setShowFavoriteMeals(false)} className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}>
              <X className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>Favorite Meals</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          {favs.length === 0 ? (
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-12 text-center shadow-lg`}>
              <Heart className={`w-16 h-16 mx-auto mb-4 ${dark?'text-slate-600':'text-gray-300'}`} />
              <h2 className={`text-xl font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                No Favorite Meals Yet
              </h2>
              <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'} mb-6`}>
                Heart meals you love from your daily plan to save them here!
              </p>
              <button
                onClick={() => setShowFavoriteMeals(false)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                View Meal Plan
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {favs.map((fav, idx) => (
                <div key={idx} className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-5 shadow-lg`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                        {fav.name}
                      </h3>
                      <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                        {fav.calories} cal - {fav.protein}g P - {fav.carbs}g C - {fav.fat}g F
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFavs(favs.filter((_, i) => i !== idx));
                        showToast('Removed from favorites', 'success');
                      }}
                      className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
                    >
                      <Heart className={`w-5 h-5 ${dark?'text-red-400':'text-red-600'} fill-current`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // ========== FEATURE D: FUTURE YOU FORECAST MODAL (ADDITIVE) ==========
  
  if (showFutureYou) {
    const forecast = calculateFutureYouForecast();
    
    return (
      <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={() => setShowFutureYou(false)}
              className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
            >
              <X className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
              Future You
            </h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {!forecast.hasData ? (
            /* Insufficient Data State */
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-12 text-center shadow-lg`}>
              <Target className={`w-16 h-16 mx-auto mb-4 ${dark?'text-slate-600':'text-gray-300'}`} />
              <h2 className={`text-xl font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                Not Enough Data Yet
              </h2>
              <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'} mb-6`}>
                Keep logging meals and weight to see insights about where your current habits are leading.
              </p>
              <div className={`text-xs ${dark?'text-slate-500':'text-gray-500'}`}>
                Need at least 3 days of meal logs and 3 weigh-ins
              </div>
            </div>
          ) : (
            <>
              {/* Section 1: Weight Range Forecast */}
              <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className={`w-6 h-6 ${dark?'text-indigo-400':'text-indigo-600'}`} />
                  <h2 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                    Expected Weight Change
                  </h2>
                </div>
                
                {/* Visual: Range band */}
                <div className="mb-4">
                  <div className={`text-center py-6 px-4 rounded-lg ${dark?'bg-slate-900':'bg-gray-50'}`}>
                    <div className={`text-3xl font-bold mb-2 ${dark?'text-indigo-400':'text-indigo-600'}`}>
                      {forecast.weightRange.low >= 0 ? '+' : ''}{forecast.weightRange.low.toFixed(1)} to {forecast.weightRange.high >= 0 ? '+' : ''}{forecast.weightRange.high.toFixed(1)} lbs
                    </div>
                    <div className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                      Likely change over the next {forecast.weightRange.days} days
                    </div>
                  </div>
                  
                  {/* Range visualization */}
                  <div className="mt-4 relative h-12 flex items-center">
                    <div className={`absolute inset-0 rounded-full ${dark?'bg-slate-700':'bg-gray-200'}`}></div>
                    <div 
                      className={`absolute h-8 rounded-full ${dark?'bg-indigo-600/30 border-2 border-indigo-500':'bg-indigo-200 border-2 border-indigo-400'}`}
                      style={{
                        left: `${((forecast.weightRange.low + 5) / 10) * 100}%`,
                        width: `${((forecast.weightRange.high - forecast.weightRange.low) / 10) * 100}%`
                      }}
                    ></div>
                    <div className={`absolute w-px h-full ${dark?'bg-slate-500':'bg-gray-400'}`} style={{left: '50%'}}></div>
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className={dark?'text-slate-500':'text-gray-500'}>-5 lbs</span>
                    <span className={dark?'text-slate-400':'text-gray-600'}>No change</span>
                    <span className={dark?'text-slate-500':'text-gray-500'}>+5 lbs</span>
                  </div>
                </div>
                
                <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                  Based on your recent calorie balance and weight trend. This is an estimate, not a guarantee.
                </p>
              </div>

              {/* Section 2: Energy Trend */}
              <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center gap-3 mb-4">
                  <Zap className={`w-6 h-6 ${dark?'text-yellow-400':'text-yellow-600'}`} />
                  <h2 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                    Energy Trend
                  </h2>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`px-4 py-2 rounded-lg ${
                    forecast.energyTrend === 'improving' ? (dark?'bg-green-900/30 text-green-400':'bg-green-100 text-green-700') :
                    forecast.energyTrend === 'volatile' ? (dark?'bg-orange-900/30 text-orange-400':'bg-orange-100 text-orange-700') :
                    forecast.energyTrend === 'likely low' ? (dark?'bg-slate-700 text-slate-300':'bg-gray-200 text-gray-700') :
                    (dark?'bg-blue-900/30 text-blue-400':'bg-blue-100 text-blue-700')
                  } font-medium capitalize`}>
                    {forecast.energyTrend === 'likely low' ? 'Likely Low' : forecast.energyTrend}
                  </div>
                </div>
                
                <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                  {forecast.energyTrend === 'improving' && 'Your calorie and carb intake are supporting consistent energy levels.'}
                  {forecast.energyTrend === 'stable' && 'Your current intake is maintaining steady energy availability.'}
                  {forecast.energyTrend === 'volatile' && 'Daily intake varies significantly, which may affect energy consistency.'}
                  {forecast.energyTrend === 'likely low' && 'Current intake may not be fully supporting energy demands.'}
                </p>
              </div>

              {/* Section 3: Adherence Risk */}
              <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg`}>
                <div className="flex items-center gap-3 mb-4">
                  <Activity className={`w-6 h-6 ${dark?'text-emerald-400':'text-emerald-600'}`} />
                  <h2 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                    Adherence Pattern
                  </h2>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`px-4 py-2 rounded-lg ${
                    forecast.adherenceRisk === 'low' ? (dark?'bg-emerald-900/30 text-emerald-400':'bg-emerald-100 text-emerald-700') :
                    forecast.adherenceRisk === 'moderate' ? (dark?'bg-blue-900/30 text-blue-400':'bg-blue-100 text-blue-700') :
                    (dark?'bg-slate-700 text-slate-300':'bg-gray-200 text-gray-700')
                  } font-medium capitalize`}>
                    {forecast.adherenceRisk} Risk
                  </div>
                </div>
                
                <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                  {forecast.adherenceRisk === 'low' && 'Your meal pattern is consistent and sustainable.'}
                  {forecast.adherenceRisk === 'moderate' && 'Some variation in meals and timing, which is normal.'}
                  {forecast.adherenceRisk === 'elevated' && 'Frequent changes to your plan may indicate it needs adjustment.'}
                </p>
              </div>

              {/* Data Quality Indicator */}
              <div className={`text-center text-xs ${dark?'text-slate-500':'text-gray-500'} pb-4`}>
                Based on {forecast.dataQuality.logCount} days of meal logs and {forecast.dataQuality.weighInCount} weigh-ins
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  
  // ========== END FUTURE YOU MODAL ==========
  
  // ========== GROCERY LIST EXECUTION ENGINE (ADDITIVE) ==========
  
  if (showGroceryList) {
    // Order Groceries Provider Selection
    if (showOrderGroceries) {
      return (
        <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
          <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              <button
                onClick={() => setShowOrderGroceries(false)}
                className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}
              >
                <ChevronRight className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'} rotate-180`} />
              </button>
              <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                Order Groceries
              </h1>
              <div className="w-10" />
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-4 space-y-4">
            <p className={`text-center ${dark?'text-slate-400':'text-gray-600'}`}>
              Select a provider to order your groceries
            </p>

            <div className="grid grid-cols-1 gap-3">
              {/* Instacart */}
              <button
                onClick={() => orderWithProvider('instacart')}
                className={`p-6 rounded-xl text-left transition-all border-2 ${dark?'border-slate-700 bg-slate-800 hover:bg-slate-700':'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${dark?'text-white':'text-gray-900'}`}>
                      Instacart
                    </h3>
                    <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                      Same-day delivery from local stores
                    </p>
                  </div>
                  <ChevronRight className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-400'}`} />
                </div>
              </button>

              {/* Amazon Fresh */}
              <button
                onClick={() => orderWithProvider('amazon')}
                className={`p-6 rounded-xl text-left transition-all border-2 ${dark?'border-slate-700 bg-slate-800 hover:bg-slate-700':'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${dark?'text-white':'text-gray-900'}`}>
                      Amazon Fresh
                    </h3>
                    <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                      Fast delivery with Amazon Prime
                    </p>
                  </div>
                  <ChevronRight className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-400'}`} />
                </div>
              </button>

              {/* Uber Eats */}
              <button
                onClick={() => orderWithProvider('uber')}
                className={`p-6 rounded-xl text-left transition-all border-2 ${dark?'border-slate-700 bg-slate-800 hover:bg-slate-700':'border-gray-200 bg-white hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${dark?'text-white':'text-gray-900'}`}>
                      Uber Eats
                    </h3>
                    <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                      Grocery delivery from Uber
                    </p>
                  </div>
                  <ChevronRight className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-400'}`} />
                </div>
              </button>
            </div>

            {/* Fallback: Copy List */}
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h3 className={`font-bold mb-3 ${dark?'text-white':'text-gray-900'}`}>
                Or copy your list
              </h3>
              <button
                onClick={() => {
                  const text = generateProviderFormat('copy');
                  copyToClipboard(text);
                  setShowOrderGroceries(false);
                }}
                className={`w-full ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'} py-3 rounded-xl font-semibold transition-all ${dark?'text-white':'text-gray-900'}`}
              >
                Copy Grocery List
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Main Grocery List Screen
    return (
      <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'} pb-40`}>
        <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4 sticky top-0 z-10`}>
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button
              onClick={() => setShowGroceryList(false)}
              className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}
            >
              <X className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            <div className="text-center">
              <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                Grocery List
              </h1>
              <p className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                {groceryListFinalized ? ' Finalized' : ' Live'}
              </p>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-4 space-y-6">
          {/* Status Indicator - Subtle */}
          {groceryListFinalized && (
            <div className={`flex items-center justify-center gap-2 text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
              <Lock className="w-4 h-4" />
              <span>List locked - changes to meal plan won't update this list</span>
            </div>
          )}

          {/* Grocery Items by Category */}
          {groceryList.length === 0 ? (
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-12 text-center`}>
              <ShoppingCart className={`w-16 h-16 mx-auto mb-4 ${dark?'text-slate-600':'text-gray-400'}`} />
              <h3 className={`text-lg font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                No items in list
              </h3>
              <p className={`${dark?'text-slate-400':'text-gray-600'}`}>
                Create a meal plan to generate your grocery list
              </p>
            </div>
          ) : (
            <>
              {[...new Set(groceryList.map(i => i.category))].map(category => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <h3 className={`section-label ${dark?'text-slate-500':'text-gray-500'}`}>
                      {category}
                    </h3>
                    <div className={`flex-1 h-px ${dark?'bg-slate-700':'bg-gray-200'}`} />
                  </div>
                  <div className={`${dark?'bg-slate-800/50':'bg-white'} rounded-xl overflow-hidden shadow-sm`}>
                    {groceryList
                      .map((item, idx) => ({ item, idx }))
                      .filter(({ item }) => item.category === category)
                      .map(({ item, idx }) => (
                        <div
                          key={idx}
                          className={`group flex items-center gap-3 px-4 py-3 border-b last:border-b-0 transition-colors ${
                            dark?'border-slate-700/50':'border-gray-100'
                          } ${
                            item.checked
                              ? dark?'bg-slate-900/30':'bg-gray-50/50'
                              : dark?'hover:bg-slate-700/30':'hover:bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => toggleGroceryChecked(idx)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              item.checked
                                ? item.already
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'bg-emerald-500 border-emerald-500'
                                : dark?'border-slate-600 hover:border-slate-500':'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {item.checked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${item.checked?'line-through opacity-60':''} ${dark?'text-white':'text-gray-900'}`}>
                              {item.name}
                            </div>
                            {item.usedInMeals > 1 && !item.checked && (
                              <div className={`text-xs mt-0.5 ${dark?'text-slate-500':'text-gray-500'}`}>
                                Used in {item.usedInMeals} meals
                              </div>
                            )}
                          </div>
                          
                          {item.already && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${dark?'bg-blue-500/20 text-blue-400':'bg-blue-100 text-blue-700'}`}>
                              Have it
                            </span>
                          )}
                          
                          {!groceryListFinalized && !item.checked && (
                            <button
                              onClick={() => removeGroceryItem(idx)}
                              className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${dark?'hover:bg-slate-700 text-slate-400 hover:text-red-400':'hover:bg-gray-100 text-gray-400 hover:text-red-600'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Bottom Action Bar */}
        {groceryList.length > 0 && (
          <div className={`fixed bottom-0 left-0 right-0 ${dark?'glass-dark border-white/10':'glass border-gray-200'} border-t p-4 shadow-2xl`}>
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowOrderGroceries(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold shadow-lg btn-press flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Order
                </button>
                <button
                  onClick={() => {
                    const text = generateProviderFormat('copy');
                    setGroceryExportText(text);
                    setShowGroceryExport(true);
                  }}
                  className={`${dark?'bg-slate-700 hover:bg-slate-600 text-white':'bg-gray-100 hover:bg-gray-200 text-gray-900'} py-3.5 rounded-xl font-bold btn-press flex items-center justify-center gap-2`}
                >
                  <ExternalLink className="w-5 h-5" />
                  Export
                </button>
              </div>
              
              <button
                onClick={() => groceryListFinalized ? unfinalizeGroceryList() : finalizeGroceryList()}
                className={`w-full mt-3 py-2.5 rounded-xl font-semibold btn-press transition-all flex items-center justify-center gap-2 ${
                  groceryListFinalized
                    ? dark?'bg-slate-700 hover:bg-slate-600 text-slate-300':'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    : dark?'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30':'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                {groceryListFinalized ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock List
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Lock List
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Export Modal */}
        {showGroceryExport && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowGroceryExport(false)} />
            <div className={`fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg ${dark?'bg-slate-800':'bg-white'} rounded-3xl shadow-xl z-50 p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'}`}>Export Grocery List</h2>
                <button onClick={() => setShowGroceryExport(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className={`${dark?'bg-slate-900':'bg-gray-50'} rounded-xl p-4 mb-4 max-h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap ${dark?'text-slate-300':'text-gray-800'}`}>
                {groceryExportText}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => copyToClipboard(groceryExportText)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold btn-press"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    downloadTextFile(groceryExportText, `plato-grocery-list-${new Date().toISOString().split('T')[0]}.txt`);
                    setShowGroceryExport(false);
                  }}
                  className={`${dark?'bg-slate-700 text-white':'bg-gray-200 text-gray-900'} py-3 rounded-xl font-bold btn-press`}
                >
                  Download
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
  
  // ========== END GROCERY LIST ==========
  
  // ========== IMPORT/EXPORT SCREENS (ADDITIVE) ==========
  
  if (showImportExport) {
    // EXPORT PREVIEW MODE
    if (exportMode) {
      return (
        <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
          {/* Header */}
          <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4 sticky top-0 z-10`}>
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <button
                onClick={() => setExportMode(false)}
                className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
              >
                <ChevronRight className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'} rotate-180`} />
              </button>
              <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                Export Preview
              </h1>
              <div className="w-10" />
            </div>
          </div>

          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* Preview Card */}
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h2 className={`text-lg font-bold mb-4 ${dark?'text-white':'text-gray-900'}`}>
                Clean Share Format
              </h2>
              <div className={`${dark?'bg-slate-900':'bg-gray-50'} rounded-xl p-4 font-mono text-sm whitespace-pre-wrap ${dark?'text-slate-300':'text-gray-800'} max-h-96 overflow-y-auto`}>
                {exportText}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => copyToClipboard(exportText)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg btn-press"
              >
                Copy
              </button>
              <button
                onClick={() => downloadTextFile(exportText, `plato-meal-plan-${new Date().toISOString().split('T')[0]}.txt`)}
                className={`${dark?'bg-slate-700 text-white':'bg-gray-200 text-gray-900'} py-4 rounded-xl font-bold btn-press`}
              >
                Download
              </button>
            </div>

            {/* Advanced Export (Collapsed) */}
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-4 shadow-lg`}>
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="w-full flex items-center justify-between"
              >
                <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>
                  Advanced Export
                </span>
                <ChevronDown className={`w-5 h-5 ${dark?'text-slate-400':'text-gray-600'} transition-transform ${showExportOptions?'rotate-180':''}`} />
              </button>
              
              {showExportOptions && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'} mb-3`}>
                    Structured JSON format for re-import or migration
                  </p>
                  <button
                    onClick={() => {
                      const jsonExport = JSON.stringify(plan, null, 2);
                      downloadTextFile(jsonExport, `plato-plan-${new Date().toISOString().split('T')[0]}.json`);
                    }}
                    className={`w-full ${dark?'bg-slate-700 text-white':'bg-gray-100 text-gray-900'} py-3 rounded-xl font-semibold btn-press`}
                  >
                    Download JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // IMPORT REVIEW MODE
    if (importMode && parsedPlan && importStep === 'reviewing') {
      const confidenceLevel = parsedPlan.confidence === 'high' ? 'high' : 'estimated';
      
      return (
        <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'} pb-24`}>
          {/* Sticky Header */}
          <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4 sticky top-0 z-10`}>
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <button
                onClick={() => {
                  setImportStep('input');
                  setParsedPlan(null);
                }}
                className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
              >
                <ChevronRight className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'} rotate-180`} />
              </button>
              <div className="text-center">
                <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                  Review Imported Plan
                </h1>
                <p className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                  Confirm meals and portions before creating a plan
                </p>
              </div>
              <div className="w-10" />
            </div>
          </div>

          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* Confidence Summary */}
            <div className={`${dark?'bg-blue-900/20 border border-blue-800/30':'bg-blue-50 border border-blue-200'} rounded-xl p-4`}>
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${dark?'text-blue-400':'text-blue-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${dark?'text-blue-300':'text-blue-900'}`}>
                    {confidenceLevel === 'high' 
                      ? 'Most meals were interpreted with high confidence'
                      : 'Some portions were estimated'}
                  </p>
                  <p className={`text-xs mt-1 ${dark?'text-blue-400':'text-blue-700'}`}>
                    Review and adjust portions as needed
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Summary */}
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-4 shadow-lg`}>
              <h3 className={`text-sm font-bold mb-3 ${dark?'text-white':'text-gray-900'}`}>
                Daily Totals
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div className={`${dark?'bg-slate-900':'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`text-xs ${dark?'text-slate-500':'text-gray-500'}`}>Calories</div>
                  <div className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                    {Math.round(parsedPlan.totalCalories)}
                  </div>
                </div>
                <div className={`${dark?'bg-slate-900':'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`text-xs ${dark?'text-slate-500':'text-gray-500'}`}>Protein</div>
                  <div className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                    {Math.round(parsedPlan.totalProtein)}g
                  </div>
                </div>
                <div className={`${dark?'bg-slate-900':'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`text-xs ${dark?'text-slate-500':'text-gray-500'}`}>Carbs</div>
                  <div className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                    {Math.round(parsedPlan.totalCarbs)}g
                  </div>
                </div>
                <div className={`${dark?'bg-slate-900':'bg-gray-50'} rounded-lg p-3`}>
                  <div className={`text-xs ${dark?'text-slate-500':'text-gray-500'}`}>Fat</div>
                  <div className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                    {Math.round(parsedPlan.totalFat)}g
                  </div>
                </div>
              </div>
            </div>

            {/* Meal-by-Meal Review */}
            <div className="space-y-3">
              {parsedPlan.meals.map((meal, mealIdx) => (
                <div key={mealIdx} className={`${dark?'bg-slate-800':'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
                  {/* Meal Header */}
                  <div className={`p-4 ${dark?'bg-slate-700/50':'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-bold ${dark?'text-white':'text-gray-900'}`}>
                          {meal.name}
                        </h3>
                        <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                          {Math.round(meal.calories)} cal - 
                          {Math.round(meal.protein)}P / 
                          {Math.round(meal.carbs)}C / 
                          {Math.round(meal.fat)}F
                        </p>
                      </div>
                      {meal.confidence === 'estimated' && (
                        <span className={`text-xs px-2 py-1 rounded-full ${dark?'bg-orange-900/30 text-orange-400':'bg-orange-100 text-orange-700'}`}>
                          Estimated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Food List */}
                  <div className="p-4 space-y-2">
                    {meal.foods.map((food, foodIdx) => (
                      <div key={foodIdx} className={`flex items-center gap-3 p-3 rounded-lg ${dark?'bg-slate-900':'bg-gray-50'}`}>
                        <div className="flex-1">
                          <div className={`font-medium ${dark?'text-white':'text-gray-900'}`}>
                            {food.name}
                          </div>
                          <input
                            type="text"
                            value={food.portion}
                            onChange={(e) => updateImportedFoodPortion(mealIdx, foodIdx, e.target.value)}
                            className={`text-sm mt-1 px-2 py-1 rounded ${dark?'bg-slate-800 text-slate-300 border-slate-700':'bg-white text-gray-700 border-gray-300'} border w-40`}
                            placeholder="portion"
                          />
                        </div>
                        <button
                          onClick={() => removeImportedFood(mealIdx, foodIdx)}
                          className={`p-2 rounded-lg ${dark?'hover:bg-slate-800 text-red-400':'hover:bg-gray-200 text-red-600'} transition-all`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Bottom CTA */}
          <div className={`fixed bottom-0 left-0 right-0 ${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-t p-4 shadow-lg`}>
            <div className="max-w-3xl mx-auto">
              <button
                onClick={createPlanFromImport}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg btn-press"
              >
                Create Plan
              </button>
              <p className={`text-xs text-center mt-2 ${dark?'text-slate-400':'text-gray-600'}`}>
                This will create a new plan using your existing profile
              </p>
            </div>
          </div>
        </div>
      );
    }

    // IMPORT INPUT MODE
    if (importMode && importStep === 'input') {
      return (
        <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
          {/* Header */}
          <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <button
                onClick={() => {
                  setImportMode(false);
                  setImportText('');
                }}
                className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
              >
                <ChevronRight className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'} rotate-180`} />
              </button>
              <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                Import Plan
              </h1>
              <div className="w-10" />
            </div>
          </div>

          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* Source Selection */}
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-4 shadow-lg`}>
              <h2 className={`text-sm font-bold mb-3 ${dark?'text-white':'text-gray-900'}`}>
                Import Source
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setImportSource('paste')}
                  className={`p-4 rounded-xl text-left transition-all border-2 ${
                    importSource === 'paste'
                      ? dark?'border-blue-500 bg-blue-900/20':'border-blue-500 bg-blue-50'
                      : dark?'border-slate-700 bg-slate-900':'border-gray-200 bg-gray-50'
                  }`}
                >
                  <FileText className={`w-6 h-6 mb-2 ${importSource === 'paste'?'text-blue-500':dark?'text-slate-400':'text-gray-600'}`} />
                  <div className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>
                    Paste Text
                  </div>
                </button>
                <button
                  onClick={() => setImportSource('file')}
                  className={`p-4 rounded-xl text-left transition-all border-2 ${
                    importSource === 'file'
                      ? dark?'border-blue-500 bg-blue-900/20':'border-blue-500 bg-blue-50'
                      : dark?'border-slate-700 bg-slate-900':'border-gray-200 bg-gray-50'
                  }`}
                >
                  <FileText className={`w-6 h-6 mb-2 ${importSource === 'file'?'text-blue-500':dark?'text-slate-400':'text-gray-600'}`} />
                  <div className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>
                    Upload File
                  </div>
                </button>
              </div>
            </div>

            {/* Input Area */}
            {importSource === 'paste' && (
              <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-4 shadow-lg`}>
                <label className={`block text-sm font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                  Paste Your Meal Plan
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your meal plan here...

Example:
Breakfast
- Eggs (3 large)
- Toast (2 slices)

Lunch
- Chicken breast (6 oz)
- Rice (1 cup)"
                  className={`w-full h-64 px-4 py-3 rounded-xl ${dark?'bg-slate-900 text-white border-slate-700':'bg-white text-gray-900 border-gray-300'} border-2 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm`}
                />
              </div>
            )}

            {importSource === 'file' && (
              <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-8 shadow-lg text-center`}>
                <input
                  type="file"
                  accept=".txt,.json,.csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        setImportText(evt.target.result);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'} transition-all cursor-pointer font-semibold ${dark?'text-white':'text-gray-900'}`}
                >
                  <FileText className="w-5 h-5" />
                  Choose File
                </label>
                <p className={`text-sm mt-3 ${dark?'text-slate-400':'text-gray-600'}`}>
                  Supports .txt, .json, .csv files
                </p>
              </div>
            )}

            {/* Process Button */}
            <button
              onClick={async () => {
                if (!importText.trim()) {
                  showToast('Please provide meal plan content', 'error');
                  return;
                }
                setLoading(true);
                const parsed = await parseImportedPlan(importText);
                setParsedPlan(parsed);
                setImportStep('reviewing');
                setLoading(false);
              }}
              disabled={!importText.trim() || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg btn-press disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Review Plan'}
            </button>
          </div>
        </div>
      );
    }

    // MAIN IMPORT/EXPORT SCREEN
    return (
      <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={() => setShowImportExport(false)}
              className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
            >
              <X className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
              Import / Export
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {/* Export Section */}
          <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                  Export Current Plan
                </h2>
                <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                  Share or save your meal plan
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                console.log('Export Plan clicked, plan:', plan);
                if (!plan) {
                  showToast('No plan to export', 'error');
                  return;
                }
                try {
                  const text = generateExportText(plan);
                  console.log('Generated export text:', text);
                  setExportText(text);
                  setExportMode(true);
                  console.log('Set exportMode to true');
                } catch (error) {
                  console.error('Error generating export:', error);
                  showToast('Error generating export', 'error');
                }
              }}
              disabled={!plan}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg btn-press disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Plan
            </button>
          </div>

          {/* Import Section */}
          <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
                  Import a Plan
                </h2>
                <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                  Load a meal plan from text or file
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setImportMode(true);
                setImportStep('input');
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg btn-press"
            >
              Import Plan
            </button>
          </div>

          {/* Info Card */}
          <div className={`${dark?'bg-blue-900/20 border border-blue-800/30':'bg-blue-50 border border-blue-200'} rounded-xl p-4`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${dark?'text-blue-400':'text-blue-600'}`} />
              <div>
                <p className={`text-sm font-medium ${dark?'text-blue-300':'text-blue-900'}`}>
                  Your profile data is never included in exports
                </p>
                <p className={`text-xs mt-1 ${dark?'text-blue-400':'text-blue-700'}`}>
                  Imports create new plans using your existing profile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // ========== END IMPORT/EXPORT SCREENS ==========
  
  // ========== CREATE NEW PLAN MODAL (CORRECTED FLOW) ==========
  
  if (showCreatePlan) {
    return (
      <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={() => setShowCreatePlan(false)}
              className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
            >
              <X className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
              Create New Plan
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          {/* Profile Preview */}
          <div className={`${dark?'bg-slate-800 border border-slate-700':'bg-blue-50 border border-blue-200'} rounded-xl p-4 mb-6`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className={`w-4 h-4 ${dark?'text-slate-400':'text-gray-600'}`} />
                  <h3 className={`text-sm font-semibold ${dark?'text-slate-300':'text-gray-700'}`}>Your Profile</h3>
                </div>
                <div className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                  {userProfile.weight} lbs - {Math.floor(userProfile.height / 12)}'{userProfile.height % 12}" - {userProfile.birthday ? calculateAge(userProfile.birthday) : userProfile.age} years
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreatePlan(false);
                  setShowEditProfile(true);
                }}
                className={`text-xs ${dark?'text-blue-400 hover:text-blue-300':'text-blue-600 hover:text-blue-700'} font-medium`}
              >
                Edit in Profile
              </button>
            </div>
          </div>

          <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'} mb-6 text-center`}>
            Create a new plan using your existing profile.
          </p>

          {/* Step 1: Training Context */}
          {createPlanStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold mb-1 ${dark?'text-white':'text-gray-900'}`}>Training Context</h2>
                <p className={`text-xs ${dark?'text-slate-500':'text-gray-500'} mb-4`}>
                  These settings affect how your meals are structured "” not your profile.
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Activity Level</label>
                <select
                  value={tempPlanConfig.activity}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, activity: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                  <option value="extra">Extra Active</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Training Type</label>
                <select
                  value={tempPlanConfig.trainingType}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, trainingType: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                >
                  <option value="body.ing">body.ing</option>
                  <option value="powerlifting">Powerlifting</option>
                  <option value="endurance">Endurance</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Training Days Per Week</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={tempPlanConfig.trainingDays}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, trainingDays: parseInt(e.target.value)})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Primary Goal</label>
                <select
                  value={tempPlanConfig.goals}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, goals: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                >
                  <option value="muscle">Gain Muscle</option>
                  <option value="fat">Lose Fat</option>
                  <option value="maintenance">Maintain</option>
                  <option value="recomp">Recomp</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Your Pace</label>
                <select
                  value={tempPlanConfig.targetRate}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, targetRate: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <button
                onClick={() => setCreatePlanStep(2)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg"
              >
                Continue to Meal Preferences
              </button>
            </div>
          )}

          {/* Step 2: Meal Preferences */}
          {createPlanStep === 2 && (
            <div className="space-y-6">
              <h2 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'}`}>Meal Preferences</h2>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Meals Per Day</label>
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={tempPlanConfig.meals}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, meals: parseInt(e.target.value)})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Macro Philosophy</label>
                <select
                  value={tempPlanConfig.dietStyle}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, dietStyle: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                >
                  <option value="balanced">Balanced</option>
                  <option value="keto">Keto</option>
                  <option value="highcarb">High-Carb</option>
                  <option value="paleo">Paleo</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Meal Prep Time</label>
                <select
                  value={tempPlanConfig.cookTime}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, cookTime: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                >
                  <option value="any">Any</option>
                  <option value="quick">Quick</option>
                  <option value="medium">Medium</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>Allergies (optional)</label>
                <input
                  type="text"
                  value={tempPlanConfig.allergies}
                  onChange={(e) => setTempPlanConfig({...tempPlanConfig, allergies: e.target.value})}
                  placeholder="e.g., nuts, dairy"
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white border-slate-700':'bg-white border-gray-300'} border-2`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCreatePlanStep(1)}
                  disabled={loading}
                  className={`flex-1 py-4 rounded-xl font-bold btn-press ${dark?'bg-slate-700 text-white':'bg-gray-200 text-gray-900'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Back
                </button>
                <button
                  onClick={() => generatePlanFromConfig(tempPlanConfig)}
                  disabled={loading}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg btn-press disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // ========== EDIT PROFILE MODAL (ADDITIVE) ==========
  
  if (showEditProfile) {
    return (
      <div className={`min-h-screen ${dark?'bg-slate-900':'bg-gray-50'}`}>
        {/* Header */}
        <div className={`${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'} border-b p-4`}>
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={() => setShowEditProfile(false)}
              className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
            >
              <X className={`w-6 h-6 ${dark?'text-slate-400':'text-gray-600'}`} />
            </button>
            <h1 className={`text-lg font-bold ${dark?'text-white':'text-gray-900'}`}>
              Edit Profile
            </h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          <div className={`${dark?'bg-slate-800':'bg-white'} rounded-xl p-6 shadow-lg space-y-6`}>
            <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
              Changes apply globally to all future plans.
            </p>

            {/* Weight */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                Weight (lbs)
              </label>
              <input
                type="number"
                value={userProfile.weight}
                onChange={(e) => setUserProfile({...userProfile, weight: parseInt(e.target.value)})}
                className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white border-slate-600':'bg-white border-gray-300'} border-2 focus:outline-none focus:border-blue-500`}
              />
            </div>

            {/* Height */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                Height
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={`block text-xs ${dark?'text-slate-400':'text-gray-600'} mb-1`}>Feet</label>
                  <input
                    type="number"
                    min="4"
                    max="7"
                    value={Math.floor(userProfile.height / 12)}
                    onChange={(e) => setUserProfile({...userProfile, height: parseInt(e.target.value) * 12 + (userProfile.height % 12)})}
                    className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white border-slate-600':'bg-white border-gray-300'} border-2 focus:outline-none focus:border-blue-500`}
                  />
                </div>
                <div className="flex-1">
                  <label className={`block text-xs ${dark?'text-slate-400':'text-gray-600'} mb-1`}>Inches</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={userProfile.height % 12}
                    onChange={(e) => setUserProfile({...userProfile, height: Math.floor(userProfile.height / 12) * 12 + parseInt(e.target.value)})}
                    className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white border-slate-600':'bg-white border-gray-300'} border-2 focus:outline-none focus:border-blue-500`}
                  />
                </div>
              </div>
            </div>

            {/* Birthday & Age */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                Birthday
              </label>
              <input
                type="date"
                value={userProfile.birthday}
                onChange={(e) => {
                  const age = calculateAge(e.target.value);
                  setUserProfile({...userProfile, birthday: e.target.value, age: age || userProfile.age});
                }}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white border-slate-600':'bg-white border-gray-300'} border-2 focus:outline-none focus:border-blue-500`}
              />
              {userProfile.birthday && (
                <p className={`text-sm mt-2 ${dark?'text-slate-400':'text-gray-600'}`}>
                  Age: {calculateAge(userProfile.birthday)} years old
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                Biological Sex
              </label>
              <select
                value={userProfile.gender}
                onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
                className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white border-slate-600':'bg-white border-gray-300'} border-2 focus:outline-none focus:border-blue-500`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <button
              onClick={() => {
                setShowEditProfile(false);
                showToast('Profile updated!', 'success');
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ========== END PROFILE/PLAN MODALS ==========
  
  // ========== END EARLY MODAL RETURNS ==========

  // YouTube Import Modal
  if (showYouTubeImport) {
    console.log('YouTube Import modal should be showing!');
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowYouTubeImport(false)} />
        <div className={`fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg ${dark?'bg-slate-800':'bg-white'} rounded-3xl shadow-xl z-50 p-6 animate-slideUp`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-black ${dark?'text-white':'text-gray-900'}`}>Import from YouTube</h2>
              <p className={`text-sm mt-1 ${dark?'text-slate-400':'text-gray-600'}`}>
                Paste a YouTube recipe video URL
              </p>
            </div>
            <button onClick={() => setShowYouTubeImport(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <label className={`block mb-2 font-semibold ${dark?'text-white':'text-gray-900'}`}>
              YouTube URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500`}
              autoFocus
            />
            <div className={`mt-3 p-3 rounded-xl ${dark?'bg-slate-700':'bg-blue-50'} flex gap-2`}>
              <div className={`${dark?'text-blue-400':'text-blue-600'} flex-shrink-0`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <p className={`text-sm ${dark?'text-slate-300':'text-gray-700'}`}>
                <span className="font-semibold">Demo Mode:</span> Paste any YouTube URL to see how the AI extraction works. This demonstrates structured recipe extraction - Ready to connect to real transcript API.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => importFromYouTube(youtubeUrl)}
            disabled={!youtubeUrl || youtubeImportLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold btn-press disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {youtubeImportLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Recipe...
              </>
            ) : (
              <>
                <Youtube className="w-5 h-5" />
                Extract Recipe (Demo)
              </>
            )}
          </button>
        </div>
      </>
    );
  }

  // Recipe Review Modal
  if (recipeInReview) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setRecipeInReview(null)} />
        <div className={`fixed inset-x-4 top-20 bottom-20 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl ${dark?'bg-slate-800':'bg-white'} rounded-3xl shadow-xl z-50 overflow-hidden flex flex-col animate-slideUp`}>
          <div className={`p-6 border-b ${dark?'border-slate-700':'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-2xl font-black ${dark?'text-white':'text-gray-900'}`}>Review Recipe</h2>
              <button onClick={() => setRecipeInReview(null)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className={`text-xl font-bold mb-4 ${dark?'text-white':'text-gray-900'}`}>{recipeInReview.title}</h3>
            
            {/* Nutrition */}
            <div className={`p-4 rounded-xl ${dark?'bg-slate-700':'bg-gray-50'} mb-6`}>
              <h4 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>
                Nutrition (per serving)
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className={`text-2xl font-black ${dark?'text-purple-400':'text-purple-600'} tabular-nums`}>
                    {recipeInReview.nutritionPerServing.calories}
                  </p>
                  <p className={`text-xs ${dark?'text-slate-400':'text-gray-500'}`}>calories</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${dark?'text-white':'text-gray-900'} tabular-nums`}>
                    {recipeInReview.nutritionPerServing.protein}g
                  </p>
                  <p className={`text-xs ${dark?'text-slate-400':'text-gray-500'}`}>protein</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${dark?'text-white':'text-gray-900'} tabular-nums`}>
                    {recipeInReview.nutritionPerServing.carbs}g
                  </p>
                  <p className={`text-xs ${dark?'text-slate-400':'text-gray-500'}`}>carbs</p>
                </div>
                <div>
                  <p className={`text-xl font-bold ${dark?'text-white':'text-gray-900'} tabular-nums`}>
                    {recipeInReview.nutritionPerServing.fat}g
                  </p>
                  <p className={`text-xs ${dark?'text-slate-400':'text-gray-500'}`}>fat</p>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <h4 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>Ingredients</h4>
              <ul className="space-y-2">
                {(recipeInReview.ingredients || []).map((ing, i) => (
                  <li key={i} className={`text-sm ${dark?'text-slate-300':'text-gray-700'}`}>
                    - {typeof ing === 'string' ? ing : `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ing}`}
                  </li>
                ))}
                {(!recipeInReview.ingredients || recipeInReview.ingredients.length === 0) && (
                  <li className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                    No ingredients available
                  </li>
                )}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h4 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>Instructions</h4>
              <ol className="space-y-3">
                {(recipeInReview.steps || recipeInReview.instructions || []).map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full ${dark?'bg-purple-900/30 text-purple-400':'bg-purple-100 text-purple-600'} flex items-center justify-center text-xs font-bold`}>
                      {i + 1}
                    </span>
                    <p className={`text-sm ${dark?'text-slate-300':'text-gray-700'}`}>
                      {typeof step === 'string' ? step : step.step || step.instruction || ''}
                    </p>
                  </li>
                ))}
                {(!recipeInReview.steps && !recipeInReview.instructions) && (
                  <li className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                    No instructions available
                  </li>
                )}
              </ol>
            </div>
          </div>
          
          <div className={`p-6 border-t ${dark?'border-slate-700':'border-gray-200'}`}>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  saveRecipe(recipeInReview);
                  setRecipeInReview(null);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold btn-press"
              >
                Save Recipe
              </button>
              <button
                onClick={() => {
                  saveRecipe(recipeInReview);
                  setAddToPlanRecipe(recipeInReview);
                  setShowAddToPlanModal(true);
                  setRecipeInReview(null);
                }}
                className={`px-4 py-3 rounded-xl font-semibold btn-press ${dark?'bg-slate-700 text-white':'bg-gray-100 text-gray-900'}`}
              >
                <CalendarPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Add to Plan Modal
  if (showAddToPlanModal && addToPlanRecipe) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddToPlanModal(false)} />
        <div className={`fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg ${dark?'bg-slate-800':'bg-white'} rounded-3xl shadow-xl z-50 p-6 animate-slideUp`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-black ${dark?'text-white':'text-gray-900'}`}>Add to Meal Plan</h2>
            <button onClick={() => setShowAddToPlanModal(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block mb-2 font-semibold ${dark?'text-white':'text-gray-900'}`}>Meal</label>
              <select
                value={addToPlanConfig.meal}
                onChange={(e) => setAddToPlanConfig({...addToPlanConfig, meal: e.target.value})}
                className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500`}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            
            <div>
              <label className={`block mb-2 font-semibold ${dark?'text-white':'text-gray-900'}`}>Servings</label>
              <input
                type="number"
                value={addToPlanConfig.servings}
                onChange={(e) => setAddToPlanConfig({...addToPlanConfig, servings: parseInt(e.target.value) || 1})}
                className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500`}
                min="1"
              />
              <p className={`text-sm mt-2 ${dark?'text-slate-400':'text-gray-600'}`}>
                {Math.round(addToPlanRecipe.nutritionPerServing.calories * addToPlanConfig.servings)} cal - 
                {Math.round(addToPlanRecipe.nutritionPerServing.protein * addToPlanConfig.servings)}g P - 
                {Math.round(addToPlanRecipe.nutritionPerServing.carbs * addToPlanConfig.servings)}g C - 
                {Math.round(addToPlanRecipe.nutritionPerServing.fat * addToPlanConfig.servings)}g F
              </p>
            </div>
          </div>
          
          <button
            onClick={addRecipeToPlan}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold btn-press"
          >
            Add to Plan
          </button>
        </div>
      </>
    );
  }

  // ========== END RECIPE MODALS ==========
  if (step === 'results' && plan) {
    return (
      <div className={`min-h-screen ${dark?'app-bg-dark':'app-bg-light'} p-4 md:p-6`}>
        <div className="max-w-7xl mx-auto animate-fadeIn pb-24">
          <div className={`${dark?'glass-dark':'glass'} rounded-3xl shadow-premium-xl p-6 md:p-8 mb-6 relative`}>
            <button
              onClick={() => setMenuOpen(true)}
              className={`absolute top-6 right-6 p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'} transition-all`}
            >
              <Menu className={`w-6 h-6 ${dark?'text-white':'text-gray-900'}`} />
            </button>
            <h1 className={`text-3xl md:text-4xl font-extrabold mb-2 gradient-text pr-14`}>
              {plan.name}'s Meal Plan
            </h1>
            <p className={`${dark?'text-slate-400':'text-slate-600'} pr-14`}>
              Your personalized nutrition guide
            </p>
          </div>

          {/* Nutrition Summary - Hidden for meals-only users */}
          {!plan.isMealsOnly && showDailyIntakeSummary ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className={`${dark?'glass-dark':'glass'} p-6 rounded-2xl shadow-premium text-center`}>
                <div className={`text-sm mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Calories</div>
                <div className="stat-num text-emerald-600">{plan.calories}</div>
              </div>
              <div className={`${dark?'glass-dark':'glass'} p-6 rounded-2xl shadow-premium text-center`}>
                <div className={`text-sm mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Protein</div>
                <div className="stat-num text-blue-600">{plan.protein}g</div>
              </div>
              <div className={`${dark?'glass-dark':'glass'} p-6 rounded-2xl shadow-premium text-center`}>
                <div className={`text-sm mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Carbs</div>
                <div className="stat-num text-orange-600">{plan.carbs}g</div>
              </div>
              <div className={`${dark?'glass-dark':'glass'} p-6 rounded-2xl shadow-premium text-center`}>
                <div className={`text-sm mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Fat</div>
                <div className="stat-num text-purple-600">{plan.fat}g</div>
              </div>
            </div>
          ) : !plan.isMealsOnly ? null : (
            // Personalization CTA for meals-only users
            <div className={`${dark?'glass-dark':'glass'} p-6 rounded-2xl shadow-premium mb-6`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h3 className={`font-bold text-lg ${dark?'text-white':'text-slate-900'}`}>
                      Want personalized nutrition targets?
                    </h3>
                  </div>
                  <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                    Add your stats to get custom calorie and macro breakdowns based on your goals
                  </p>
                </div>
                <button
                  onClick={() => {
                    // TODO: Navigate to profile/settings to add nutrition data
                    setStep('input');
                    setUserIntent('both');
                    setOnboardingPhase(1);
                  }}
                  className="ml-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl btn-press transition-all whitespace-nowrap"
                >
                  Personalize
                </button>
              </div>
            </div>
          )}

          {/* ========== DAILY INTAKE HEADER (ADDITIVE) ========== */}
          {!plan.isMealsOnly && showDailyIntakeSummary && (() => {
            // Calculate derived values
            const remaining = Math.round(plan.calories - dailyLog.totalCalories);
            const proteinRemaining = Math.round(plan.protein - dailyLog.totalProtein);
            const carbsRemaining = Math.round(plan.carbs - dailyLog.totalCarbs);
            const fatRemaining = Math.round(plan.fat - dailyLog.totalFat);
            
            // Interpolate values based on scroll progress (0 = expanded, 1 = collapsed)
            const progress = scrollProgress;
            
            // Height: 120px -> 48px (reduced from 140px)
            const height = 120 - (72 * progress);
            
            // Padding: 14px -> 0px (reduced from 16px)
            const paddingX = 14 * (1 - progress);
            const paddingTop = 14 * (1 - progress);
            const paddingBottom = 10 * (1 - progress);
            
            // Font sizes
            const labelOpacity = 1 - progress;
            const primaryFontSize = 30 - (14 * progress); // 30px -> 16px
            const secondaryOpacity = 1 - progress;
            
            // Border radius: rounded-2xl -> rounded-full (pill)
            const borderRadius = 16 - (4 * progress); // 16px -> 12px
            
            // Macro opacity
            const macroOpacity = Math.max(0, 1 - (progress * 2)); // Fade out faster
            
            return (
              <div 
                className={`sticky top-0 z-20 mb-6 overflow-hidden ${
                  dark ? 'bg-slate-900' : 'bg-white'
                }`}
                style={{
                  height: `${height}px`,
                  borderRadius: `${borderRadius}px`,
                  transition: 'none', // Smooth scroll-driven animation
                  paddingLeft: `${paddingX}px`,
                  paddingRight: `${paddingX}px`,
                  paddingTop: `${paddingTop}px`,
                  paddingBottom: `${paddingBottom}px`,
                }}
              >
                {/* Label - fades out */}
                <div 
                  className={`text-xs font-medium tracking-wide ${dark?'text-slate-500':'text-gray-500'}`}
                  style={{
                    opacity: labelOpacity,
                    marginBottom: `${4 * (1 - progress)}px`,
                    height: labelOpacity > 0 ? 'auto' : 0,
                    overflow: 'hidden'
                  }}
                >
                  CALORIES REMAINING
                </div>
                
                {/* Primary Number Row */}
                <div className="flex items-center justify-center" style={{ minHeight: '32px' }}>
                  <span 
                    className={`font-semibold tabular-nums transition-colors duration-200 ${
                      remaining < 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}
                    style={{
                      fontSize: `${primaryFontSize}px`,
                      lineHeight: '1.2'
                    }}
                  >
                    {remaining}
                  </span>
                  <span 
                    className="font-semibold tabular-nums ml-1"
                    style={{
                      fontSize: `${primaryFontSize * 0.6}px`,
                      opacity: progress < 1 ? secondaryOpacity * 0.7 : 1,
                      color: dark ? '#94a3b8' : '#64748b'
                    }}
                  >
                    {progress < 1 ? 'left' : 'of calories remaining today'}
                  </span>
                  
                  {/* Total - fades out */}
                  {progress < 0.5 && (
                    <span 
                      className={`font-semibold tabular-nums ml-2 ${dark?'text-slate-600':'text-gray-400'}`}
                      style={{
                        fontSize: `${primaryFontSize}px`,
                        opacity: secondaryOpacity,
                        lineHeight: '1.2'
                      }}
                    >
                      / {plan.calories}
                    </span>
                  )}
                </div>

                {/* Macros Row - Always visible, fades out during scroll */}
                {macroOpacity > 0 && (
                  <div 
                    className="flex items-center justify-center gap-3 mt-2"
                    style={{ 
                      opacity: macroOpacity,
                      height: macroOpacity > 0 ? 'auto' : 0,
                      overflow: 'hidden'
                    }}
                  >
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xs ${dark?'text-slate-500':'text-gray-500'}`}>Protein</span>
                      <span className="text-sm font-medium text-blue-500">{proteinRemaining}g</span>
                    </div>
                    <span className={`text-xs ${dark?'text-slate-600':'text-gray-400'}`}>-</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xs ${dark?'text-slate-500':'text-gray-500'}`}>Carbs</span>
                      <span className="text-sm font-medium text-orange-500">{carbsRemaining}g</span>
                    </div>
                    <span className={`text-xs ${dark?'text-slate-600':'text-gray-400'}`}>-</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xs ${dark?'text-slate-500':'text-gray-500'}`}>Fat</span>
                      <span className="text-sm font-medium text-purple-500">{fatRemaining}g</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          {/* ========== END DAILY INTAKE HEADER ========== */}

          {/* ========== TRAINING CONTEXT (ADDITIVE - Daily Signal) ========== */}
          {!plan.isMealsOnly && showDailyIntakeSummary && advancedMode && (
            <div className={`${dark?'glass-dark':'glass'} p-4 rounded-xl shadow-premium mb-6 animate-slideDown`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${dark?'bg-orange-500/20':'bg-orange-500/10'}`}>
                    <Zap className={`w-4 h-4 ${dark?'text-orange-400':'text-orange-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${dark?'text-white':'text-slate-900'}`}>
                      Training Context <span className={`text-xs font-normal ${dark?'text-slate-500':'text-slate-600'}`}>(Optional)</span>
                    </h3>
                    <p className={`text-xs ${dark?'text-slate-500':'text-slate-600'}`}>
                      Helps adjust calories, macros, and recovery nutrition
                    </p>
                  </div>
                </div>
              </div>

              {/* Training Toggle */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => updateTrainingContext({ 
                    trained: !dailyTrainingContext.trained,
                    type: dailyTrainingContext.trained ? null : dailyTrainingContext.type,
                    intensity: dailyTrainingContext.trained ? null : dailyTrainingContext.intensity
                  })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    dailyTrainingContext.trained
                      ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                      : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {dailyTrainingContext.trained ? <CheckCircle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  {dailyTrainingContext.trained ? 'Trained Today' : 'No Training'}
                </button>
              </div>

              {/* Training Details (only when trained = true) */}
              {dailyTrainingContext.trained && (
                <div className="space-y-3 pt-3 border-t border-slate-700 animate-slideDown">
                  {/* Training Type */}
                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${dark?'text-slate-400':'text-slate-600'}`}>
                      Training Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'strength', label: 'Strength', icon: '\uD83D\uDCAA' },
                        { val: 'cardio', label: 'Cardio', icon: '\u2764' },
                        { val: 'mixed', label: 'Mixed', icon: '⚡' }
                      ].map(type => (
                        <button
                          key={type.val}
                          onClick={() => updateTrainingContext({ type: type.val })}
                          className={`py-2 px-2 rounded-lg text-xs font-semibold btn-press transition-all ${
                            dailyTrainingContext.type === type.val
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                              : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }`}
                        >
                          <div className="text-base mb-0.5">{type.icon}</div>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intensity (optional) */}
                  <div>
                    <label className={`block text-xs font-semibold mb-2 ${dark?'text-slate-400':'text-slate-600'}`}>
                      Intensity <span className="font-normal">(Optional)</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'light', label: 'Light', desc: 'Easy' },
                        { val: 'moderate', label: 'Moderate', desc: 'Normal' },
                        { val: 'hard', label: 'Hard', desc: 'Intense' }
                      ].map(intensity => (
                        <button
                          key={intensity.val}
                          onClick={() => updateTrainingContext({ 
                            intensity: dailyTrainingContext.intensity === intensity.val ? null : intensity.val 
                          })}
                          className={`py-2 px-2 rounded-lg text-xs font-semibold btn-press transition-all ${
                            dailyTrainingContext.intensity === intensity.val
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                              : dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                          }`}
                        >
                          <div className="font-bold">{intensity.label}</div>
                          <div className={`text-xs ${dailyTrainingContext.intensity === intensity.val ? 'text-white/80' : dark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {intensity.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Adjustment Acknowledgment - Minimal, inline only */}
                  {dailyTrainingContext.type && (() => {
                    const adjustments = calculateTrainingAdjustments();
                    const hasAdjustments = adjustments !== null;
                    
                    return (
                      <div className={`p-3 rounded-lg ${dark?'bg-blue-900/20 border-blue-800':'bg-blue-50 border-blue-200'} border`}>
                        <p className={`text-xs ${dark?'text-blue-300':'text-blue-700'}`}>
                          {hasAdjustments ? (
                            <>
                              ✔ Training day noted. Remaining meals slightly adjusted for recovery.
                            </>
                          ) : (
                            <>
                               This helps optimize your nutrition for{' '}
                              <span className="font-semibold">
                                {dailyTrainingContext.intensity || 'moderate'} {dailyTrainingContext.type}
                              </span>
                              {' '}training recovery
                            </>
                          )}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          {/* ========== END TRAINING CONTEXT ========== */}

          {/* Advanced Metrics (when enabled) */}
          {advancedMode && plan.bmr && plan.tdee && (
            <div className={`${dark?'glass-dark':'glass'} p-6 rounded-2xl shadow-premium mb-6 animate-slideDown`}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-500" />
                <h3 className={`font-bold ${dark?'text-white':'text-slate-900'}`}>
                  Metabolic Breakdown
                </h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl ${dark?'bg-slate-800':'bg-blue-50'}`}>
                  <p className={`text-xs mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                    BMR (Basal Metabolic Rate)
                  </p>
                  <p className="text-2xl font-bold text-blue-600">{plan.bmr}</p>
                  <p className={`text-xs mt-1 ${dark?'text-slate-500':'text-slate-600'}`}>
                    Calories burned at rest
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl ${dark?'bg-slate-800':'bg-emerald-50'}`}>
                  <p className={`text-xs mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                    TDEE (Total Daily Energy)
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">{plan.tdee}</p>
                  <p className={`text-xs mt-1 ${dark?'text-slate-500':'text-slate-600'}`}>
                    With activity multiplier
                  </p>
                </div>
                
                <div className={`p-4 rounded-xl ${dark?'bg-slate-800':'bg-purple-50'}`}>
                  <p className={`text-xs mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                    Daily Adjustment
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {plan.calories - plan.tdee > 0 ? '+' : ''}{plan.calories - plan.tdee}
                  </p>
                  <p className={`text-xs mt-1 ${dark?'text-slate-500':'text-slate-600'}`}>
                    Based on your goal
                  </p>
                </div>
              </div>

              {/* Macro Bands */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`font-semibold ${dark?'text-white':'text-slate-900'}`}>
                    Macro Flexibility Bands
                  </h4>
                  <span className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>
                    Stay within ranges
                  </span>
                </div>
                
                <div className="space-y-4">
                  {(() => {
                    const bands = getMacroBands({ protein: plan.protein, carbs: plan.carbs, fat: plan.fat });
                    return Object.entries(bands).map(([macro, band]) => (
                      <div key={macro}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-semibold capitalize ${dark?'text-slate-300':'text-slate-700'}`}>
                            {macro}
                          </span>
                          <span className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                            {band.min}g - {band.max}g
                          </span>
                        </div>
                        <div className={`h-2 rounded-full ${dark?'bg-slate-700':'bg-slate-200'} relative overflow-hidden`}>
                          <div 
                            className={`absolute h-full rounded-full ${
                              macro === 'protein' ? 'bg-blue-500' :
                              macro === 'carbs' ? 'bg-orange-500' : 'bg-purple-500'
                            }`}
                            style={{
                              left: `${(band.min / band.max) * 100}%`,
                              right: `${100 - ((band.target / band.max) * 100)}%`
                            }}
                          />
                          <div 
                            className="absolute w-1 h-full bg-white"
                            style={{ left: `${(band.target / band.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 px-1">
            {/* Micronutrient Summary (Advanced Mode Only) */}
            {advancedMode && (
              <button
                onClick={() => {
                  const summary = calculateDailyMicros(plan.meals);
                  setDailyMicroData(summary);
                  setShowDailyMicroSummary(true);
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${dark?'bg-blue-600 text-white hover:bg-blue-700':'bg-blue-500 text-white hover:bg-blue-600'} shadow-premium-lg text-sm`}
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Micronutrient Summary</span>
                <span className="sm:hidden">Micros</span>
              </button>
            )}

            <button
              onClick={() => setShowScanning(true)}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl shadow-lg btn-press text-sm"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Food</span>
              <span className="sm:hidden">Scan</span>
            </button>
            <button
              onClick={() => setShowWeighInModal(true)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${dark?'bg-purple-600 text-white hover:bg-purple-700':'bg-purple-500 text-white hover:bg-purple-600'} shadow-premium-lg text-sm`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Log Weight</span>
              <span className="sm:hidden">Weight</span>
            </button>
            <button
              onClick={() => {
                // Generate grocery list if empty or plan changed
                if (groceryList.length === 0 || (!groceryListFinalized && hasPlanChanged())) {
                  regenerateGroceryList();
                }
                setShowGroceryList(true);
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${dark?'bg-blue-600 text-white hover:bg-blue-700':'bg-blue-500 text-white hover:bg-blue-600'} shadow-premium-lg text-sm`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Grocery List</span>
              <span className="sm:hidden">Grocery</span>
            </button>
            <button
              onClick={savePlan}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${dark?'bg-slate-800 text-white hover:bg-slate-700':'bg-white text-slate-900 hover:bg-gray-50'} shadow-premium text-sm`}
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Save Current Plan</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>

          <div className="space-y-4">
            {plan.meals.map((meal, idx) => {
              // Generate unique color from meal name
              const hash = meal.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const hue = hash % 360;
              
              return (
              <div key={idx} className={`${dark?'glass-dark':'glass'} p-6 rounded-2xl shadow-premium transition-all`}>
                {/* Meal Image - Real food photo from TheMealDB */}
                {showMealImages && (
                  <MealCardImage mealName={meal.name} />
                )}
                
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleFavorite(idx)}
                      className={`mt-1 transition-all ${isFavorite(idx) ? 'text-red-500 scale-110' : dark?'text-slate-600 hover:text-red-400':'text-gray-400 hover:text-red-500'}`}
                      title={isFavorite(idx) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`w-6 h-6 ${isFavorite(idx) ? 'fill-current' : ''}`} />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'}`}>{meal.name}</h3>
                        
                        {/* Source Badge - Subtle, informational only */}
                        {meal.source === 'mealdb' && (
                          <span 
                            className={`text-xs px-2 py-0.5 rounded-md ${
                              dark 
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-700/50' 
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                            title="Recipe imported from MealDB"
                          >
                            Imported
                          </span>
                        )}
                      </div>
                      
                      {/* Macro Confidence - Show only for imported or low confidence */}
                      {meal.macroConfidence && meal.macroConfidence < 0.9 && (
                        <div 
                          className={`text-xs mt-1 ${
                            meal.macroConfidence >= 0.80 ? (dark ? 'text-green-400' : 'text-green-600') :
                            meal.macroConfidence >= 0.65 ? (dark ? 'text-yellow-400' : 'text-yellow-600') :
                            (dark ? 'text-orange-400' : 'text-orange-600')
                          }`}
                          title={getConfidenceExplanation(meal.macroConfidence, meal._baseIngredientMacros?.ingredientDetails || [])}
                        >
                          {getConfidenceTierLabel(meal.macroConfidence)}
                        </div>
                      )}
                      
                      {/* Quality Tags - Calm, Descriptive */}
                      {meal.tags && meal.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {meal.tags.slice(0, 2).map((tag, i) => (
                            <span 
                              key={i}
                              className={`text-xs px-2 py-0.5 rounded-md ${
                                dark 
                                  ? 'bg-slate-700 text-slate-300' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {!plan.isMealsOnly && (
                        <div className={`text-sm mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                          {meal.calories} cal - {meal.protein}g protein - {meal.carbs}g carbs - {meal.fat}g fat
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => logMealToDay(meal)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${dark?'bg-emerald-700 text-white hover:bg-emerald-600':'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                      title="Log to today's tracker"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Log</span>
                    </button>
                    <button
                      onClick={() => mealSwap(idx)}
                      disabled={swapping === idx}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${dark?'bg-purple-600 hover:bg-purple-700 text-white':'bg-purple-500 hover:bg-purple-600 text-white'} disabled:opacity-50`}
                      title="Swap for different meal"
                    >
                      {swapping === idx ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Swap</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowMealReplace(idx)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${dark?'bg-blue-600 hover:bg-blue-700 text-white':'bg-blue-500 hover:bg-blue-600 text-white'}`}
                      title="Replace with custom meal"
                    >
                      Replace
                    </button>
                  </div>
                </div>

                {/* Collapsible Details Button */}
                <button
                  onClick={() => toggleMealExpanded(idx)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl mt-3 transition-all ${dark?'bg-slate-800 hover:bg-slate-700':'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>
                    {expandedMeals[idx] ? 'Hide' : 'View'} Recipe Details
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedMeals[idx] ? 'rotate-180' : ''} ${dark?'text-white':'text-gray-900'}`} />
                </button>

                {/* Collapsible Content */}
                {expandedMeals[idx] && (
                  <div className="mt-4 space-y-3 animate-slideDown">
                    {/* Recipe Source & Macro Confidence */}
                    <div className={`p-3 rounded-xl ${dark?'bg-slate-800 border border-slate-700':'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {meal.source === 'internal' ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className={`w-4 h-4 ${dark?'text-green-400':'text-green-600'}`} />
                              <span className={`text-sm font-medium ${dark?'text-slate-300':'text-gray-700'}`}>
                                Verified recipe
                              </span>
                            </div>
                          ) : meal.source === 'mealdb' ? (
                            <div className="flex items-center gap-2">
                              <Globe className={`w-4 h-4 ${dark?'text-blue-400':'text-blue-600'}`} />
                              <span className={`text-sm font-medium ${dark?'text-slate-300':'text-gray-700'}`}>
                                Imported recipe
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <ChefHat className={`w-4 h-4 ${dark?'text-slate-400':'text-gray-600'}`} />
                              <span className={`text-sm font-medium ${dark?'text-slate-300':'text-gray-700'}`}>
                                Recipe
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Macro Confidence Display */}
                      {meal.macroConfidence && (
                        <div className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                          <span className={`font-medium ${
                            meal.macroConfidence >= 0.80 ? (dark ? 'text-green-400' : 'text-green-600') :
                            meal.macroConfidence >= 0.65 ? (dark ? 'text-yellow-400' : 'text-yellow-600') :
                            (dark ? 'text-orange-400' : 'text-orange-600')
                          }`}>
                            {getConfidenceTierLabel(meal.macroConfidence)}
                          </span>
                          {meal.source === 'mealdb' && ' · Macros estimated from ingredients'}
                        </div>
                      )}
                      
                      {/* Detailed confidence explanation (only show for low confidence) */}
                      {meal.macroConfidence && meal.macroConfidence < 0.8 && meal._baseIngredientMacros?.ingredientDetails && (
                        <p className={`text-xs mt-2 ${dark?'text-slate-500':'text-gray-500'}`}>
                          {getConfidenceExplanation(meal.macroConfidence, meal._baseIngredientMacros.ingredientDetails)}
                        </p>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-xl ${dark?'bg-slate-800':'bg-gray-50'}`}>
                      <div className={`font-semibold mb-2 flex items-center gap-2 ${dark?'text-gray-300':'text-gray-700'}`}>
                        <ChefHat className="w-4 h-4" />
                        Ingredients:
                      </div>
                      <ul className="space-y-2">
                        {meal.ingredients.map((ing, i) => {
                          // Handle both string and object format
                          const ingName = typeof ing === 'string' ? ing : (ing.name || ing.strIngredient || '');
                          const ingMeasure = typeof ing === 'string' ? '' : (ing.measure || ing.strMeasure || '');
                          
                          // Find this ingredient in grocery list
                          const groceryItem = groceryList.find(item => 
                            item.name.toLowerCase() === ingName.toLowerCase()
                          );
                          
                          return (
                            <li key={i} className="flex items-center gap-2 group">
                              {groceryItem ? (
                                <>
                                  <button
                                    onClick={() => toggleGroceryItem(groceryItem.id)}
                                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                      groceryItem.checked
                                        ? groceryItem.already 
                                          ? 'bg-blue-500 border-blue-500'
                                          : 'bg-green-500 border-green-500'
                                        : dark?'border-slate-600 hover:border-slate-500':'border-gray-300 hover:border-gray-400'
                                    }`}
                                    title={groceryItem.already ? "already have" : "Check off"}
                                  >
                                    {groceryItem.checked && <CheckCircle className="w-3 h-3 text-white" />}
                                  </button>
                                  <span className={`flex-1 ${groceryItem.checked?'line-through opacity-50':''} ${dark?'text-slate-400':'text-gray-600'}`}>
                                    {ingMeasure ? `${ingMeasure} ${ingName}` : ingName}
                                  </span>
                                  <button
                                      onClick={() => markAsAlreadyHave(groceryItem.id)}
                                      className={`opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded transition-all ${dark?'bg-blue-600 hover:bg-blue-700 text-white':'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                    >
                                      Have it
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className={`${dark?'text-slate-400':'text-gray-600'}`}>
                                  - {ingMeasure ? `${ingMeasure} ${ingName}` : ingName}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    <div className={`p-4 rounded-xl ${dark?'bg-slate-800':'bg-gray-50'}`}>
                      <div className={`font-semibold mb-2 flex items-center gap-2 ${dark?'text-gray-300':'text-gray-700'}`}>
                        <span></span>
                        Instructions:
                      </div>
                      <ol className={`list-decimal list-inside space-y-1 ${dark?'text-slate-400':'text-gray-600'}`}>
                        {meal.instructions.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Micronutrient Analysis (Advanced Mode Only) */}
                {advancedMode && (
                  <>
                    <button
                      onClick={() => setExpandedMealMicros({...expandedMealMicros, [idx]: !expandedMealMicros[idx]})}
                      className={`w-full flex items-center justify-between px-4 py-2 rounded-xl mt-3 transition-all ${dark?'bg-blue-900/30 hover:bg-blue-900/40 border border-blue-700/30':'bg-blue-50 hover:bg-blue-100 border border-blue-200'}`}
                    >
                      <span className={`text-sm font-semibold ${dark?'text-blue-300':'text-blue-700'}`}>
                        {expandedMealMicros[idx] ? 'Hide' : 'View'} Micronutrients
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedMealMicros[idx] ? 'rotate-180' : ''} ${dark?'text-blue-300':'text-blue-700'}`} />
                    </button>

                    {expandedMealMicros[idx] && (() => {
                      const mealMicros = calculateMealMicros(meal);
                      if (!mealMicros) return null;

                      // Get top 6 contributors
                      const topMicros = Object.entries(mealMicros.percentages)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 6);

                      return (
                        <div className="mt-3 space-y-2 animate-slideDown">
                          {topMicros.map(([nutrient, percentage]) => {
                            const status = getMicroStatus(percentage);
                            const statusColor = getMicroStatusColor(status, dark);
                            const dvInfo = MICRONUTRIENT_DV[nutrient];

                            return (
                              <div key={nutrient} className={`flex items-center justify-between p-3 rounded-lg ${dark?'bg-slate-800':'bg-gray-50'}`}>
                                <span className={`text-sm font-medium ${dark?'text-slate-300':'text-slate-700'}`}>
                                  {dvInfo.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-bold px-2 py-1 rounded ${statusColor}`}>
                                    {percentage}% DV
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          <p className={`text-xs text-center pt-2 ${dark?'text-slate-500':'text-slate-600'}`}>
                            Showing top contributing micronutrients
                          </p>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {showAchievement && (
          <div className="fixed bottom-24 right-6 z-50 animate-slideUp">
            <div className={`${dark?'glass-dark':'glass'} rounded-2xl shadow-premium-xl p-4 max-w-sm border-l-4 border-yellow-400 backdrop-blur-xl`}>
              <div className="flex items-center gap-3">
                <div className="text-4xl animate-bounce">{showAchievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-bold text-yellow-500">ACHIEVEMENT UNLOCKED</span>
                  </div>
                  <div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{showAchievement.name}</div>
                  <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>{showAchievement.desc}</div>
                </div>
                <button 
                  onClick={() => setShowAchievement(null)}
                  className={`p-1 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-200'} transition-all`}
                >
                  <X className={`w-4 h-4 ${dark?'text-slate-400':'text-gray-500'}`} />
                </button>
              </div>
            </div>
          </div>
        )}



        <div className="fixed top-6 right-6 z-50 space-y-3">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`px-6 py-4 rounded-2xl shadow-premium-xl flex items-center gap-3 animate-slideIn ${
                toast.type === 'success'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                  : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
              }`}
            >
              <span className="font-semibold">{toast.message}</span>
            </div>
          ))}
        </div>

        {/* API Settings Modal */}
        {showAPISettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAPISettings(false)}>
            <div className={`${dark?'bg-slate-900':'bg-white'} rounded-2xl shadow-premium-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 z-10 p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">API Settings</h2>
                  </div>
                  <button onClick={() => setShowAPISettings(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className={`p-6 rounded-xl border-2 ${dark?'bg-slate-800 border-slate-700':'bg-blue-50 border-blue-200'} text-center`}>
                  <Key className={`w-12 h-12 mx-auto mb-3 ${dark?'text-blue-400':'text-blue-600'}`} />
                  <h3 className={`text-lg font-bold mb-2 ${dark?'text-white':'text-slate-900'}`}>
                    Demo Mode Active
                  </h3>
                  <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'} mb-4`}>
                    Plato is currently using demo data for all features. To enable real API integrations:
                  </p>
                  <ul className={`text-sm ${dark?'text-slate-300':'text-slate-700'} text-left space-y-2 max-w-md mx-auto`}>
                    <li>- Get a free Unsplash key for real meal photos</li>
                    <li>- Add Spoonacular API for 5000+ real recipes</li>
                    <li>- Configure Claude API for YouTube recipe extraction</li>
                  </ul>
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className={`text-xs ${dark?'text-slate-500':'text-slate-600'}`}>
                      See the integration guides in your downloaded files for setup instructions.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`sticky bottom-0 p-6 border-t ${dark?'border-slate-700 bg-slate-900':'border-slate-200 bg-white'}`}>
                <button
                  onClick={() => setShowAPISettings(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold btn-press"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Micronutrient Summary Modal (Advanced Mode Only) - ULTRA COMPACT */}
        {/* ========== NUTRIENT SUPPORT SUGGESTIONS SCREEN (ADDITIVE) ========== */}
        {showNutrientSupport && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNutrientSupport(false)}
          >
            <div 
              className={`${dark?'bg-slate-900':'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]`}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const analysis = analyzeNutrientStatus(nutrientSupportTimeRange);
                
                return (
                  <>
                    {/* Header */}
                    <div className={`px-6 py-4 border-b ${dark?'border-slate-700':'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'}`}>
                            Nutrient Support Suggestions
                          </h2>
                          <p className={`text-sm mt-1 ${dark?'text-slate-400':'text-gray-600'}`}>
                            Based on your logged meals. Not a medical diagnosis.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowNutrientSupport(false)}
                          className={`p-2 rounded-lg ${dark?'hover:bg-slate-800':'hover:bg-gray-100'}`}
                        >
                          <X className={`w-5 h-5 ${dark?'text-slate-400':'text-gray-600'}`} />
                        </button>
                      </div>
                      
                      {/* Time Range Selector */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setNutrientSupportTimeRange(7)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            nutrientSupportTimeRange === 7
                              ? 'bg-blue-500 text-white'
                              : dark?'bg-slate-800 text-slate-300 hover:bg-slate-700':'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Last 7 days
                        </button>
                        <button
                          onClick={() => setNutrientSupportTimeRange(14)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            nutrientSupportTimeRange === 14
                              ? 'bg-blue-500 text-white'
                              : dark?'bg-slate-800 text-slate-300 hover:bg-slate-700':'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Last 14 days
                        </button>
                      </div>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {analysis.noData ? (
                    <div className={`text-center py-12 ${dark?'text-slate-400':'text-gray-600'}`}>
                      <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">Log a few days to generate suggestions</p>
                      <p className="text-sm">Track your meals to see personalized nutrient support tips</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary Card */}
                      <div className={`p-4 rounded-xl ${dark?'bg-slate-800':'bg-gray-50'}`}>
                        {analysis.consistentlyLow.length > 0 ? (
                          <p className={`text-sm ${dark?'text-slate-300':'text-gray-700'}`}>
                            <span className="font-semibold">Consistently low in:</span>{' '}
                            {analysis.consistentlyLow.map(n => n.name).join(', ')}
                          </p>
                        ) : (
                          <p className={`text-sm ${dark?'text-slate-300':'text-gray-700'}`}>
                            <span className="font-semibold">Great work!</span> Your tracked meals show adequate nutrient coverage.
                          </p>
                        )}
                        {analysis.adequate.length > 0 && (
                          <p className={`text-sm mt-2 ${dark?'text-slate-400':'text-gray-600'}`}>
                            <span className="font-medium">Adequate in:</span>{' '}
                            {analysis.adequate.map(n => n.name).join(', ')}
                          </p>
                        )}
                      </div>
                      
                      {/* Nutrient Cards */}
                      {analysis.consistentlyLow.map((nutrient) => (
                        <div key={nutrient.nutrient} className={`p-5 rounded-xl border ${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'}`}>
                          {/* What we noticed */}
                          <h3 className={`font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                            {nutrient.name}
                          </h3>
                          <p className={`text-sm mb-4 ${dark?'text-slate-400':'text-gray-600'}`}>
                            Your {nutrient.name} intake has been consistently below food-based targets ({nutrient.percentage}% of daily value).
                          </p>
                          
                          {/* Food-first suggestions */}
                          <div className="mb-4">
                            <h4 className={`text-sm font-semibold mb-2 ${dark?'text-emerald-400':'text-emerald-700'}`}>
                              Food Sources
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {nutrient.foods.slice(0, 6).map((food, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-1 rounded-full ${dark?'bg-slate-700 text-slate-300':'bg-gray-100 text-gray-700'}`}
                                >
                                  {food}
                                </span>
                              ))}
                            </div>
                            {nutrient.mealAddIns && nutrient.mealAddIns.length > 0 && (
                              <div className={`mt-2 text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                                <span className="font-medium">Tips:</span> {nutrient.mealAddIns.join(' - ')}
                              </div>
                            )}
                          </div>
                          
                          {/* Optional supplement section */}
                          {SUPPLEMENT_INFO[nutrient.nutrient] && (
                            <div>
                              <button
                                onClick={() => setExpandedSupplements({
                                  ...expandedSupplements,
                                  [nutrient.nutrient]: !expandedSupplements[nutrient.nutrient]
                                })}
                                className={`flex items-center gap-2 text-sm font-semibold mb-2 ${dark?'text-blue-400 hover:text-blue-300':'text-blue-600 hover:text-blue-700'}`}
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${expandedSupplements[nutrient.nutrient]?'rotate-180':''}`} />
                                Optional supplement
                              </button>
                              
                              {expandedSupplements[nutrient.nutrient] && (
                                <div className={`pl-6 space-y-3 animate-slideDown ${dark?'text-slate-300':'text-gray-700'}`}>
                                  <p className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                                    Supplements are optional. Consider food sources first.
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Common range:</span> {SUPPLEMENT_INFO[nutrient.nutrient].range}
                                  </p>
                                  <p className="text-xs italic">
                                    {SUPPLEMENT_INFO[nutrient.nutrient].note}
                                  </p>
                                  
                                  {/* Amazon search links */}
                                  <div className="space-y-2">
                                    <p className={`text-xs font-semibold ${dark?'text-slate-500':'text-gray-500'}`}>
                                      Find options on Amazon:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {buildAmazonSearchLinks(nutrient.nutrient).map((link, idx) => (
                                        <a
                                          key={idx}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${dark?'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50':'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                                        >
                                          {link.label}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Performance Supplements (Advanced Mode Only) */}
                      {advancedMode && (
                        <div className={`p-5 rounded-xl border ${dark?'bg-slate-800 border-slate-700':'bg-white border-gray-200'}`}>
                          <button
                            onClick={() => setShowPerformanceSupplements(!showPerformanceSupplements)}
                            className="flex items-center justify-between w-full"
                          >
                            <h3 className={`font-bold ${dark?'text-white':'text-gray-900'}`}>
                              Performance Support
                            </h3>
                            <ChevronDown className={`w-5 h-5 transition-transform ${showPerformanceSupplements?'rotate-180':''} ${dark?'text-slate-400':'text-gray-600'}`} />
                          </button>
                          
                          {showPerformanceSupplements && (
                            <div className="mt-4 space-y-4">
                              {Object.entries(PERFORMANCE_SUPPLEMENTS).map(([key, supp]) => {
                                // Only show protein if protein is low
                                if (key === 'protein' && (!plan || dailyLog.totalProtein >= plan.protein * 0.8)) {
                                  return null;
                                }
                                
                                return (
                                  <div key={key} className={`p-4 rounded-lg ${dark?'bg-slate-900':'bg-gray-50'}`}>
                                    <h4 className={`font-semibold mb-1 ${dark?'text-white':'text-gray-900'}`}>
                                      {supp.name}
                                    </h4>
                                    <p className={`text-sm mb-2 ${dark?'text-slate-400':'text-gray-600'}`}>
                                      {supp.purpose}
                                    </p>
                                    <p className="text-sm mb-2">
                                      <span className="font-medium">Range:</span> {supp.range}
                                    </p>
                                    <p className={`text-xs italic mb-3 ${dark?'text-slate-500':'text-gray-500'}`}>
                                      {supp.note}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                      {buildAmazonSearchLinks(key, true).map((link, idx) => (
                                        <a
                                          key={idx}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${dark?'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50':'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                                        >
                                          {link.label}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Safety note */}
                      <div className={`p-3 rounded-lg text-xs ${dark?'bg-slate-800 text-slate-400':'bg-gray-50 text-gray-600'}`}>
                        Check with a clinician if you are pregnant, on medication, or managing a condition.
                      </div>
                    </>
                  )}
                </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
        {/* ========== END NUTRIENT SUPPORT SUGGESTIONS SCREEN ========== */}
        
        {showDailyMicroSummary && dailyMicroData && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
            onClick={() => setShowDailyMicroSummary(false)}
          >
            <div 
              className={`${dark?'bg-slate-900':'bg-white'} rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]`} 
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fixed Header */}
              <div className={`flex items-center justify-between px-4 py-3 border-b ${dark?'border-slate-700':'border-gray-200'} flex-shrink-0`}>
                <h2 className={`text-base font-bold ${dark?'text-white':'text-gray-900'}`}>
                  Micronutrients
                </h2>
                <button 
                  onClick={() => setShowDailyMicroSummary(false)} 
                  className={`p-1.5 rounded-lg ${dark?'hover:bg-slate-800':'hover:bg-gray-100'} transition-all`}
                  aria-label="Close"
                >
                  <X className={`w-5 h-5 ${dark?'text-slate-400':'text-gray-600'}`} />
                </button>
              </div>
              
              {/* Scrollable Content with proper overflow */}
              <div className="overflow-y-auto flex-1 px-4 py-3" style={{overflowY: 'auto', WebkitOverflowScrolling: 'touch'}}>
                {/* Ultra-Compact Grid - 2 columns */}
                <div className="grid grid-cols-2 gap-2">
                  {['iron', 'calcium', 'magnesium', 'potassium', 'vitaminA', 'vitaminC', 'vitaminD', 'vitaminB12', 'fiber'].map(nutrient => {
                    const data = dailyMicroData.percentages[nutrient];
                    const percentage = data !== undefined ? data : 0;
                    const info = {
                      iron: { name: 'Iron', short: 'Fe' },
                      calcium: { name: 'Calcium', short: 'Ca' },
                      magnesium: { name: 'Magnesium', short: 'Mg' },
                      potassium: { name: 'Potassium', short: 'K' },
                      vitaminA: { name: 'Vitamin A', short: 'A' },
                      vitaminC: { name: 'Vitamin C', short: 'C' },
                      vitaminD: { name: 'Vitamin D', short: 'D' },
                      vitaminB12: { name: 'Vitamin B12', short: 'B12' },
                      fiber: { name: 'Fiber', short: 'Fiber' }
                    }[nutrient];

                    const barColor = getMicroBarColor(percentage, dark);
                    const bgColor = getMicroBarBgColor(dark);
                    const displayPercentage = Math.min(percentage, 100);

                    return (
                      <div 
                        key={nutrient}
                        className={`p-2 rounded-lg ${dark?'bg-slate-800':'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${dark?'text-slate-300':'text-slate-700'}`}>
                            {info.name}
                          </span>
                          <span className={`text-xs font-bold ${percentage >= 80 ? (dark?'text-green-400':'text-green-600') : percentage >= 40 ? (dark?'text-blue-400':'text-blue-600') : (dark?'text-slate-500':'text-slate-500')}`}>
                            {percentage}%
                          </span>
                        </div>
                        
                        {/* Ultra-thin bar */}
                        <div className="relative h-1 rounded-full overflow-hidden" style={{backgroundColor: bgColor}}>
                          <div 
                            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${displayPercentage}%`,
                              backgroundColor: barColor
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Compact Coaching */}
                {dailyMicroData.gaps.length > 0 && (
                  <div className={`mt-3 p-2.5 rounded-lg ${dark?'bg-slate-800 border border-slate-700':'bg-blue-50 border border-blue-200'}`}>
                    <p className={`text-xs ${dark?'text-slate-300':'text-slate-700'} mb-1.5`}>
                      {dailyMicroData.gaps.length === 1 
                        ? `Add ${dailyMicroData.gaps[0].name.toLowerCase()}-rich foods`
                        : dailyMicroData.gaps.length === 2
                        ? `Add ${dailyMicroData.gaps[0].name.toLowerCase()} & ${dailyMicroData.gaps[1].name.toLowerCase()}`
                        : 'Focus on nutrient-dense foods'}
                    </p>
                    {dailyMicroData.gaps.length <= 2 && (
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const foodMap = {
                            'Iron': ['Meat', 'Lentils'],
                            'Calcium': ['Dairy', 'Greens'],
                            'Magnesium': ['Nuts', 'Grains'],
                            'Potassium': ['Banana', 'Avocado'],
                            'Vitamin A': ['Carrots', 'Squash'],
                            'Vitamin C': ['Citrus', 'Peppers'],
                            'Vitamin D': ['Fish', 'Milk'],
                            'Vitamin B12': ['Meat', 'Fish'],
                            'Fiber': ['Veggies', 'Fruits']
                          };
                          
                          const foods = [];
                          dailyMicroData.gaps.slice(0, 2).forEach(gap => {
                            const gapFoods = foodMap[gap.name];
                            if (gapFoods) foods.push(...gapFoods);
                          });
                          
                          return [...new Set(foods)].slice(0, 3).map(food => (
                            <span 
                              key={food} 
                              className={`text-xs px-1.5 py-0.5 rounded ${dark?'bg-slate-700 text-slate-300':'bg-white text-slate-700'}`}
                            >
                              {food}
                            </span>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fixed Footer */}
              <div className={`px-4 py-3 border-t ${dark?'border-slate-700':'border-gray-200'} flex-shrink-0`}>
                <button
                  onClick={() => setShowDailyMicroSummary(false)}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Mode First-Time Explanation (One-Time Only) */}
        {showAdvancedExplanation && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdvancedExplanation(false)}>
            <div className={`${dark?'bg-slate-800':'bg-white'} rounded-2xl shadow-premium-xl max-w-md w-full p-6 animate-slideUp`} onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full ${dark?'bg-blue-900/30':'bg-blue-100'} mx-auto mb-4 flex items-center justify-center`}>
                  <Activity className={`w-8 h-8 ${dark?'text-blue-400':'text-blue-600'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${dark?'text-white':'text-slate-900'}`}>
                  Advanced Mode Enabled
                </h3>
                <p className={`text-sm ${dark?'text-slate-300':'text-slate-600'} mb-6 leading-relaxed`}>
                  You now have access to micronutrient tracking, metabolic breakdowns, macro flexibility bands, and deeper nutritional analysis.
                </p>
                <button
                  onClick={() => setShowAdvancedExplanation(false)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold btn-press"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Smart Swap Modal - Intent-Aware Meal Swapping */}
        {showSmartSwap && swapMealIndex !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowSmartSwap(false)}>
            <div className={`${dark?'bg-slate-900':'bg-white'} rounded-2xl shadow-premium-xl max-w-md w-full p-6`} onClick={e => e.stopPropagation()}>
              <div className="mb-6">
                <h3 className={`text-xl font-bold ${dark?'text-white':'text-gray-900'} mb-2`}>
                  What do you want from this swap?
                </h3>
                <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                  Choose what matters most for your next meal
                </p>
              </div>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => executeSmartSwap('similar')}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    dark 
                      ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className={`font-semibold ${dark?'text-white':'text-gray-900'} mb-1`}>
                    Similar calories
                  </div>
                  <div className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                    Keep your daily totals on track
                  </div>
                </button>
                
                <button
                  onClick={() => executeSmartSwap('protein')}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    dark 
                      ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className={`font-semibold ${dark?'text-white':'text-gray-900'} mb-1`}>
                    Higher protein
                  </div>
                  <div className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                    Support muscle and recovery
                  </div>
                </button>
                
                {advancedMode && (
                  <button
                    onClick={() => executeSmartSwap('micronutrients')}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      dark 
                        ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className={`font-semibold ${dark?'text-white':'text-gray-900'} mb-1`}>
                      More micronutrients
                    </div>
                    <div className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                      Fill nutritional gaps
                    </div>
                  </button>
                )}
                
                <button
                  onClick={() => executeSmartSwap('faster')}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    dark 
                      ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className={`font-semibold ${dark?'text-white':'text-gray-900'} mb-1`}>
                    Faster prep
                  </div>
                  <div className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                    Rea- in 15 minutes or less
                  </div>
                </button>
                
                <button
                  onClick={() => executeSmartSwap('lighter')}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    dark 
                      ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className={`font-semibold ${dark?'text-white':'text-gray-900'} mb-1`}>
                    Lighter meal
                  </div>
                  <div className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                    Lower calorie option
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowSmartSwap(false)}
                className={`w-full mt-4 py-2.5 rounded-lg text-sm font-medium ${
                  dark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Weigh-In Modal */}
        {showWeighInModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowWeighInModal(false)}>
            <div className={`${dark?'bg-slate-900':'bg-white'} rounded-t-3xl md:rounded-3xl shadow-premium-xl max-w-2xl w-full max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
              {/* Fixed Header with Prominent Close Button */}
              <div className={`flex-shrink-0 ${dark?'bg-slate-800 border-b border-slate-700':'bg-white border-b border-gray-200'} p-4 md:p-6 sticky top-0 z-10`}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className={`text-xl md:text-2xl font-bold ${dark?'text-white':'text-gray-900'}`}>Weight Tracking</h2>
                    <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'} mt-1`}>
                      Track your progress over time
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowWeighInModal(false)} 
                    className={`flex-shrink-0 p-2 md:p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'} shadow-lg`}
                    aria-label="Close"
                  >
                    <X className={`w-5 h-5 md:w-6 md:h-6 ${dark?'text-white':'text-gray-900'}`} />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">{/* End of fixed header */}

              {/* Weight Input */}
              <div className={`${dark?'bg-slate-800 border border-slate-700':'bg-white border border-gray-200'} p-4 md:p-6 rounded-2xl shadow-lg mb-4 md:mb-6`}>
                <h3 className={`font-bold text-lg mb-4 ${dark?'text-white':'text-gray-900'}`}>Log Today's Weight</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block mb-2 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                      Weight (lbs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newWeighIn.weight}
                      onChange={(e) => setNewWeighIn({...newWeighIn, weight: e.target.value})}
                      placeholder="Enter weight..."
                      className={`w-full px-4 py-3 md:py-4 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-50'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all text-lg font-semibold`}
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className={`block mb-2 text-sm font-semibold ${dark?'text-slate-300':'text-slate-700'}`}>
                      Note (optional)
                    </label>
                    <input
                      type="text"
                      value={newWeighIn.note}
                      onChange={(e) => setNewWeighIn({...newWeighIn, note: e.target.value})}
                      placeholder="How are you feeling today?"
                      className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-50'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleWeighIn}
                  disabled={!newWeighIn.weight || newWeighIn.weight <= 0}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 md:py-4 rounded-xl font-bold hover:shadow-premium-lg transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Activity className="w-5 h-5" />
                  Save Weight
                </button>
              </div>

              {/* Weight History & Trend */}
              {weighIns.length > 0 && (
                <div className={`${dark?'bg-slate-800 border border-slate-700':'bg-white border border-gray-200'} p-4 md:p-6 rounded-2xl shadow-lg mb-4 md:mb-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-bold text-lg ${dark?'text-white':'text-gray-900'}`}>
                      Weight History
                    </h3>
                    <span className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                      {weighIns.length} {weighIns.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  {/* Trend Summary */}
                  {weighIns.length >= 2 && (() => {
                    const trend = calculateWeightTrend(weighIns.slice(0, 4));
                    
                    // If trend is null, not enough time has passed
                    if (trend === null) {
                      return (
                        <div className={`p-4 rounded-xl mb-4 border-2 ${dark?'bg-slate-700/50 border-slate-600':'bg-gray-100 border-gray-300'}`}>
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">⏳</span>
                            <div>
                              <p className={`text-sm font-semibold ${dark?'text-slate-300':'text-gray-700'}`}>
                                Need More Time for Trend
                              </p>
                              <p className={`text-xs ${dark?'text-slate-400':'text-slate-600'} mt-1`}>
                                Log weights at least 1 day apart to see weekly trend
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    const trendColor = trend < -0.05 ? 'text-blue-500' : trend > 0.05 ? 'text-orange-500' : 'text-slate-500';
                    const trendBg = trend < -0.05 ? 'bg-blue-500/10 border-blue-500/20' : trend > 0.05 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-slate-500/10 border-slate-500/20';
                    const trendIcon = trend < -0.05 ? '' : trend > 0.05 ? '' : '➡️';
                    const trendLabel = trend < -0.05 ? 'Losing' : trend > 0.05 ? 'Gaining' : 'Stable';
                    
                    return (
                      <div className={`p-4 rounded-xl mb-4 border-2 ${trendBg}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`section-label mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                              Weekly Trend
                            </p>
                            <p className={`text-2xl md:text-3xl font-black ${trendColor} mb-1`}>
                              {trend > 0 ? '+' : ''}{trend.toFixed(2)} lbs/week
                            </p>
                            <p className={`text-sm font-semibold ${trendColor}`}>
                              {trendLabel}
                            </p>
                          </div>
                          <span className="text-4xl md:text-5xl">{trendIcon}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Recent Entries */}
                  <div className="space-y-3">
                    <p className={`section-label ${dark?'text-slate-500':'text-gray-500'}`}>
                      Recent Entries
                    </p>
                    <div className="space-y-2">
                      {weighIns.slice(0, 10).map((entry, index) => (
                        <div key={entry.id} className={`p-4 rounded-xl ${dark?'bg-slate-700':'bg-slate-50'} ${editingWeighIn?.id === entry.id ? 'ring-2 ring-purple-500' : ''} hover:shadow-md transition-all`}>
                          {editingWeighIn?.id === entry.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div>
                                <label className={`block text-xs font-semibold mb-1 ${dark?'text-slate-300':'text-slate-700'}`}>
                                  Weight (lbs)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editingWeighIn.weight}
                                  onChange={(e) => setEditingWeighIn({...editingWeighIn, weight: e.target.value})}
                                  className={`w-full px-3 py-2 rounded-lg ${dark?'bg-slate-600 text-white':'bg-white'} border-2 ${dark?'border-slate-500':'border-gray-300'} focus:outline-none focus:border-purple-500`}
                                  autoFocus
                                />
                              </div>
                              <div>
                                <label className={`block text-xs font-semibold mb-1 ${dark?'text-slate-300':'text-slate-700'}`}>
                                  Note (optional)
                                </label>
                                <input
                                  type="text"
                                  value={editingWeighIn.note}
                                  onChange={(e) => setEditingWeighIn({...editingWeighIn, note: e.target.value})}
                                  className={`w-full px-3 py-2 rounded-lg ${dark?'bg-slate-600 text-white':'bg-white'} border-2 ${dark?'border-slate-500':'border-gray-300'} focus:outline-none focus:border-purple-500`}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={saveEditedWeighIn}
                                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold text-sm btn-press"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingWeighIn(null)}
                                  className={`flex-1 py-2 rounded-lg font-semibold text-sm ${dark?'bg-slate-600 text-white':'bg-gray-200 text-gray-900'} btn-press`}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className={`font-bold text-lg ${dark?'text-white':'text-gray-900'}`}>
                                    {entry.weight.toFixed(2)} lbs
                                  </p>
                                  {index === 0 && (
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                                  {entry.dateString}
                                </p>
                                {entry.note && (
                                  <p className={`text-sm mt-2 ${dark?'text-slate-400':'text-slate-600'} italic`}>
                                    "{entry.note}"
                                  </p>
                                )}
                              </div>
                              
                              {/* Edit/Delete Buttons */}
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleEditWeighIn(entry)}
                                  className={`p-2 rounded-lg transition-all ${dark?'hover:bg-slate-600':'hover:bg-gray-200'}`}
                                  title="Edit entry"
                                >
                                  <Edit3 className={`w-4 h-4 ${dark?'text-blue-400':'text-blue-600'}`} />
                                </button>
                                <button
                                  onClick={() => handleDeleteWeighIn(entry.id)}
                                  className={`p-2 rounded-lg transition-all ${dark?'hover:bg-slate-600':'hover:bg-gray-200'}`}
                                  title="Delete entry"
                                >
                                  <Trash2 className={`w-4 h-4 ${dark?'text-red-400':'text-red-600'}`} />
                                </button>
                              </div>
                            </div>
                          )}
                          
                          {/* Weight change indicator (only in view mode) */}
                          {!editingWeighIn && index > 0 && weighIns[index - 1] && (() => {
                            const diff = entry.weight - weighIns[index - 1].weight;
                            if (Math.abs(diff) < 0.01) return null;
                            return (
                              <div className={`text-sm font-semibold mt-2 ${diff > 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                                {diff > 0 ? '+' : ''}{diff.toFixed(2)} from previous
                              </div>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {weighIns.length === 0 && (
                <div className={`${dark?'bg-slate-800':'bg-white'} p-8 rounded-2xl shadow-premium text-center`}>
                  <p className={`text-lg font-semibold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                    Start tracking your weight
                  </p>
                  <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                    Log 2+ weigh-ins to see trends and get adaptive recommendations
                  </p>
                </div>
              )}
              </div>{/* End scrollable content */}
            </div>
          </div>
        )}


        {/* ===== RECIPE BOOK ===== */}
        {showRecipeBook && <RecipeBook mealPlan={mealPlan} recipes={recipes} dark={dark} page={recipeBookPage} setPage={setRecipeBookPage} flipping={recipeBookFlipping} setFlipping={setRecipeBookFlipping} onClose={() => setShowRecipeBook(false)} />}

        {/* Menu Sidebar */}
        {menuOpen && (
          <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div 
              className={`absolute top-0 right-0 h-full w-80 ${dark?'glass-dark':'glass'} shadow-premium-xl p-6 overflow-y-auto animate-slideIn`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${dark?'text-white':'text-gray-900'}`}>Menu</h2>
                <button onClick={() => setMenuOpen(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                  <X className={`w-6 h-6 ${dark?'text-white':'text-gray-900'}`} />
                </button>
              </div>

              {/* Profile Section */}
              <button
                onClick={() => {
                  setShowEditProfile(true);
                  setMenuOpen(false);
                }}
                className={`${dark?'bg-slate-800 hover:bg-slate-700':'bg-white hover:bg-gray-50'} p-6 rounded-2xl shadow-premium mb-6 w-full text-left transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${dark?'text-white':'text-gray-900'}`}>Profile</h3>
                      <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>{plan.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${dark?'text-blue-400':'text-blue-600'}`}>Edit</span>
                    <ChevronRight className={`w-4 h-4 ${dark?'text-blue-400':'text-blue-600'}`} />
                  </div>
                </div>
                <div className={`grid grid-cols-3 gap-2 text-sm`}>
                  <div className={`${dark?'bg-slate-900':'bg-gray-50'} p-2 rounded-lg`}>
                    <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'}`}>Age</div>
                    <div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{userProfile.birthday ? calculateAge(userProfile.birthday) : userProfile.age}</div>
                  </div>
                  <div className={`${dark?'bg-slate-900':'bg-gray-50'} p-2 rounded-lg`}>
                    <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'}`}>Weight</div>
                    <div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{userProfile.weight} lbs</div>
                  </div>
                  <div className={`${dark?'bg-slate-900':'bg-gray-50'} p-2 rounded-lg`}>
                    <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'}`}>Activity</div>
                    <div className={`font-bold capitalize ${dark?'text-white':'text-gray-900'}`}>{planConfig.activity.slice(0, 3)}</div>
                  </div>
                </div>
              </button>

              {/* Dark Mode Toggle */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-2xl shadow-premium mb-4`}>
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Dark Mode</span>
                  <button
                    onClick={() => setDark(!dark)}
                    className={`w-12 h-6 rounded-full transition-all ${dark?'bg-emerald-500':'bg-gray-300'} relative`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${dark?'right-0.5':'left-0.5'}`} />
                  </button>
                </div>
              </div>
              
              {/* Meal Images Toggle - Additive Feature */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-2xl shadow-premium mb-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Meal Images</span>
                    <p className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                      Show AI-generated photos
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMealImages(!showMealImages)}
                    className={`w-12 h-6 rounded-full transition-all ${showMealImages?'bg-purple-500':'bg-gray-300'} relative`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${showMealImages?'right-0.5':'left-0.5'}`} />
                  </button>
                </div>
              </div>

              {/* API Settings Button */}
              <button
                onClick={() => setShowAPISettings(true)}
                className={`w-full ${dark?'bg-gradient-to-r from-blue-600 to-indigo-600 text-white':'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200'} p-4 rounded-2xl shadow-premium mb-4 btn-press flex items-center justify-between group`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${dark?'bg-white/10':'bg-blue-100'}`}>
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">API Settings</div>
                    <div className={`text-xs ${dark?'text-blue-200':'text-blue-600'}`}>
                      Configure integrations
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Nutrition & Insights - Unified Card */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-2xl shadow-premium mb-6`}>
                <h3 className={`section-label mb-3 ${dark?'text-slate-500':'text-gray-500'}`}>
                  Nutrition & Insights
                </h3>
                
                {/* Advanced Mode Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Advanced Mode</span>
                    <p className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                      Show BMR, TDEE & macro bands
                    </p>
                  </div>
                  <button
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className={`w-12 h-6 rounded-full transition-all ${advancedMode?'bg-blue-500':'bg-gray-300'} relative`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${advancedMode?'right-0.5':'left-0.5'}`} />
                  </button>
                </div>

                {/* Daily Intake Summary Toggle (Unified Visibility Control) */}
                {!plan?.isMealsOnly && (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Daily Intake Summary</span>
                      <p className={`text-xs mt-1 ${dark?'text-slate-400':'text-slate-600'}`}>
                        Hides or shows calories and macros across your day
                      </p>
                    </div>
                    <button
                      onClick={() => toggleDailyIntakeSummary(!showDailyIntakeSummary)}
                      className={`w-12 h-6 rounded-full transition-all ${showDailyIntakeSummary?'bg-emerald-500':'bg-gray-300'} relative`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${showDailyIntakeSummary?'right-0.5':'left-0.5'}`} />
                    </button>
                  </div>
                )}
              </div>

              {/* Menu Categories - Organized by Function */}
              
              {/* MEAL PLANNING Section */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-2xl shadow-premium mb-4`}>
                <h3 className={`section-label mb-3 ${dark?'text-slate-500':'text-gray-500'}`}>Meal Planning</h3>
                <div className="space-y-2">
                  {/* Generate New Plan - PRIMARY ACTION */}
                  <button
                    onClick={startNewPlan}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700':'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'} text-white shadow-lg`}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold">Create New Plan</span>
                  </button>
                  
                  {/* Grocery List - EXECUTION HUB */}
                  <button
                    onClick={() => {
                      if (!plan) {
                        showToast('Create a meal plan first', 'error');
                        return;
                      }
                      // Generate grocery list if empty or plan changed
                      if (groceryList.length === 0 || (!groceryListFinalized && hasPlanChanged())) {
                        regenerateGroceryList();
                      }
                      setShowGroceryList(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700':'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'} text-white shadow-lg`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-semibold">Grocery List</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowSavedPlans(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <Calendar className={`w-5 h-5 ${dark?'text-blue-400':'text-blue-600'}`} />
                    <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Saved Plans</span>
                  </button>
                  
                  {/* Import/Export Button */}
                  <button
                    onClick={() => {
                      setShowImportExport(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <Save className={`w-5 h-5 ${dark?'text-indigo-400':'text-indigo-600'}`} />
                    <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Import / Export</span>
                  </button>
                </div>
              </div>

              {/* RECIPES Section */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-2xl shadow-premium mb-4`}>
                <h3 className={`section-label mb-3 ${dark?'text-slate-500':'text-gray-500'}`}>Recipes</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowUseIngredients(true);
                      resetIngredientFlow();
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700':'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'} text-white shadow-lg`}
                  >
                    <Camera className="w-5 h-5" />
                    <span className="font-semibold">Use Ingredients</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowRecipeSearch(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700':'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'} text-white`}
                  >
                    <BookOpen className="w-5 h-5" />
                    <span className="font-semibold">Find Recipes</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('YouTube Import button clicked!');
                      console.log('Current showYouTubeImport:', showYouTubeImport);
                      setShowYouTubeImport(true);
                      console.log('Set showYouTubeImport to true');
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800':'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'} text-white`}
                  >
                    <Youtube className="w-5 h-5" />
                    <span className="font-semibold">Import from YouTube</span>
                  </button>
                </div>
              </div>

              {/* TRACKING Section */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-2xl shadow-premium mb-4`}>
                <h3 className={`section-label mb-3 ${dark?'text-slate-500':'text-gray-500'}`}>Tracking</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowWeightTracking(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <TrendingUp className={`w-5 h-5 ${dark?'text-purple-400':'text-purple-600'}`} />
                    <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Weight Tracking</span>
                  </button>
                  
                  {/* Future You (Requires data) */}
                  <button
                    onClick={() => {
                      setShowFutureYou(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <Target className={`w-5 h-5 ${dark?'text-indigo-400':'text-indigo-600'}`} />
                    <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Future You</span>
                  </button>
                  
                  {/* Nutrient Support Suggestions */}
                  {!plan?.isMealsOnly && (
                    <button
                      onClick={() => {
                        setShowNutrientSupport(true);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <Activity className={`w-5 h-5 ${dark?'text-emerald-400':'text-emerald-600'}`} />
                      <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Nutrient Support</span>
                    </button>
                  )}
                  
                  {/* Nutrition Insights (Advanced Mode Only) */}
                  {advancedMode && (
                    <button
                      onClick={() => {
                        setShowWeeklyInsights(true);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      <Activity className={`w-5 h-5 ${dark?'text-blue-400':'text-blue-600'}`} />
                      <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Nutrition Insights</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Saved Recipes & Favorite Meals */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-2xl shadow-premium mb-6`}>
                <h3 className={`section-label mb-3 ${dark?'text-slate-500':'text-gray-500'}`}>My Collection</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setRecipeBookPage(0);
                      setShowRecipeBook(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-gradient-to-r from-amber-800/60 to-orange-800/60 hover:from-amber-700/60 hover:to-orange-700/60':'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200'}`}
                  >
                    <span className="text-xl">📖</span>
                    <div className="text-left">
                      <span className={`font-bold ${dark?'text-amber-200':'text-amber-800'}`}>Recipe Book</span>
                      <p className={`text-xs ${dark?'text-amber-400':'text-amber-600'}`}>Flip through your recipes</p>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowSavedRecipes(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <BookOpen className={`w-5 h-5 ${dark?'text-purple-400':'text-purple-600'}`} />
                    <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Saved Recipes ({recipes.length})</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowFavoriteMeals(true);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${dark?'bg-slate-700 hover:bg-slate-600':'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <Heart className={`w-5 h-5 ${dark?'text-red-400':'text-red-600'}`} />
                    <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>Favorite Meals ({favs.length})</span>
                  </button>
                </div>
              </div>

              {/* Stats Dashboard */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-6 rounded-2xl shadow-premium mb-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className={`w-6 h-6 ${dark?'text-emerald-400':'text-emerald-600'}`} />
                  <h3 className={`font-bold text-lg ${dark?'text-white':'text-slate-900'}`}>Your Stats</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl ${dark?'bg-slate-900':'bg-emerald-50'} text-center`}>
                    <div className={`text-2xl font-bold ${dark?'text-emerald-400':'text-emerald-600'}`}>{savedPlans.length}</div>
                    <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Saved Plans</div>
                  </div>
                  <div className={`p-3 rounded-xl ${dark?'bg-slate-900':'bg-blue-50'} text-center`}>
                    <div className={`text-2xl font-bold ${dark?'text-blue-400':'text-blue-600'}`}>
                      {dailyTrainingContext.trained ? '✔' : '"”'}
                    </div>
                    <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Today's Training</div>
                  </div>
                  <div className={`p-3 rounded-xl ${dark?'bg-slate-900':'bg-purple-50'} text-center`}>
                    <div className={`text-2xl font-bold ${dark?'text-purple-400':'text-purple-600'}`}>{weighIns.length}</div>
                    <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Weight Logs</div>
                  </div>
                  <div className={`p-3 rounded-xl ${dark?'bg-slate-900':'bg-indigo-50'} text-center`}>
                    <div className={`text-2xl font-bold ${dark?'text-indigo-400':'text-indigo-600'}`}>{trackingHistory.length}</div>
                    <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Days Tracked</div>
                  </div>
                  <div className={`p-3 rounded-xl ${dark?'bg-slate-900':'bg-pink-50'} text-center`}>
                    <div className={`text-2xl font-bold ${dark?'text-pink-400':'text-pink-600'}`}>{recipes.length}</div>
                    <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Saved Recipes</div>
                  </div>
                  <div className={`p-3 rounded-xl ${dark?'bg-slate-900':'bg-orange-50'} text-center`}>
                    <div className={`text-2xl font-bold ${dark?'text-orange-400':'text-orange-600'}`}>{dailyLog.meals.length}</div>
                    <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Today's Meals</div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className={`${dark?'bg-slate-800':'bg-white'} p-6 rounded-2xl shadow-premium`}>
                <div className="flex items-center gap-3 mb-4">
                  <Award className={`w-6 h-6 ${dark?'text-yellow-400':'text-yellow-600'}`} />
                  <h3 className={`font-bold text-lg ${dark?'text-white':'text-slate-900'}`}>Achievements</h3>
                </div>
                <div className="space-y-3">
                  {achievements.map(ach => (
                    <div key={ach.id} className={`flex items-center gap-3 p-3 rounded-xl ${ach.unlocked ? (dark?'bg-slate-700':'bg-emerald-50') : (dark?'bg-slate-900':'bg-gray-50')}`}>
                      <div className={`text-2xl ${ach.unlocked?'':'grayscale opacity-50'}`}>{ach.icon}</div>
                      <div className="flex-1">
                        <div className={`font-semibold text-sm ${dark?'text-white':'text-slate-900'}`}>{ach.name}</div>
                        <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>{ach.desc}</div>
                        {!ach.unlocked && (
                          <div className="mt-1">
                            <div className={`h-1.5 rounded-full ${dark?'bg-slate-800':'bg-gray-200'} overflow-hidden`}>
                              <div 
                                className="h-full bg-gradient-to-r from-sky-500 to-blue-600"
                                style={{width: `${(ach.progress / ach.target) * 100}%`}}
                              />
                            </div>
                            <div className={`text-xs mt-1 ${dark?'text-slate-500':'text-slate-500'}`}>
                              {ach.progress} / {ach.target}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Daily Nutrition Tracker Modal */}
        {showDailyTracker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDailyTracker(false)}>
            <div className={`${dark?'glass-dark':'glass'} rounded-3xl shadow-premium-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${dark?'text-white':'text-gray-900'}`}> Daily Tracker</h2>
                  <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>{dailyLog.date}</p>
                </div>
                <button onClick={() => setShowDailyTracker(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                  <X className={`w-6 h-6 ${dark?'text-white':'text-gray-900'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-xl text-center`}>
                  <div className={`text-xs mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Calories</div>
                  <div className="text-2xl font-bold text-emerald-500">{dailyLog.totalCalories}</div>
                  <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'}`}>/ {plan.calories}</div>
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{width: `${Math.min((dailyLog.totalCalories / plan.calories) * 100, 100)}%`}} />
                  </div>
                </div>
                <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-xl text-center`}>
                  <div className={`text-xs mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Protein</div>
                  <div className="text-2xl font-bold text-blue-500">{dailyLog.totalProtein}g</div>
                  <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'}`}>/ {plan.protein}g</div>
                </div>
                <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-xl text-center`}>
                  <div className={`text-xs mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Carbs</div>
                  <div className="text-2xl font-bold text-orange-500">{dailyLog.totalCarbs}g</div>
                  <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'}`}>/ {plan.carbs}g</div>
                </div>
                <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-xl text-center`}>
                  <div className={`text-xs mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Fat</div>
                  <div className="text-2xl font-bold text-purple-500">{dailyLog.totalFat}g</div>
                  <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'}`}>/ {plan.fat}g</div>
                </div>
                <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-xl text-center`}>
                  <div className={`text-xs mb-1 ${dark?'text-slate-400':'text-slate-600'}`}>Water</div>
                  <div className="text-2xl font-bold text-cyan-500">{dailyLog.water}</div>
                  <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'}`}>glasses</div>
                  <button
                    onClick={addWater}
                    className="mt-2 w-full bg-cyan-500 text-white text-xs py-1 rounded-lg hover:bg-cyan-600"
                  >
                    +1 
                  </button>
                </div>
              </div>

              <div className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-xl mb-6`}>
                <h3 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>Log Food</h3>
                
                {/* Quick Scan Button */}
                <button
                  onClick={() => {
                    setShowDailyTracker(false);
                    setShowScanning(true);
                  }}
                  className="w-full mb-3 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Scan className="w-5 h-5" />
                  Scan Food
                </button>

                {/* Manual Entry */}
                <div className="grid grid-cols-5 gap-2">
                  <input id="foodName" type="text" placeholder="Food name" className={`col-span-5 md:col-span-1 px-3 py-2 rounded-lg ${dark?'bg-slate-700 text-white':'bg-gray-100'} text-sm`} />
                  <input id="foodCals" type="number" placeholder="Cal" className={`px-3 py-2 rounded-lg ${dark?'bg-slate-700 text-white':'bg-gray-100'} text-sm`} />
                  <input id="foodProtein" type="number" placeholder="P" className={`px-3 py-2 rounded-lg ${dark?'bg-slate-700 text-white':'bg-gray-100'} text-sm`} />
                  <input id="foodCarbs" type="number" placeholder="C" className={`px-3 py-2 rounded-lg ${dark?'bg-slate-700 text-white':'bg-gray-100'} text-sm`} />
                  <input id="foodFat" type="number" placeholder="F" className={`px-3 py-2 rounded-lg ${dark?'bg-slate-700 text-white':'bg-gray-100'} text-sm`} />
                  <button
                    onClick={() => {
                      const name = document.getElementById('foodName').value;
                      const cals = document.getElementById('foodCals').value;
                      const protein = document.getElementById('foodProtein').value;
                      const carbs = document.getElementById('foodCarbs').value;
                      const fat = document.getElementById('foodFat').value;
                      if (name && cals) {
                        quickLogFood(name, cals, protein || 0, carbs || 0, fat || 0);
                        document.getElementById('foodName').value = '';
                        document.getElementById('foodCals').value = '';
                        document.getElementById('foodProtein').value = '';
                        document.getElementById('foodCarbs').value = '';
                        document.getElementById('foodFat').value = '';
                      }
                    }}
                    className="col-span-5 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 text-sm py-2"
                  >
                    Log Manually
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>Today's Meals ({dailyLog.meals.length})</h3>
                {dailyLog.meals.length === 0 ? (
                  <div className={`text-center py-8 ${dark?'text-slate-400':'text-slate-600'}`}>
                    <p>No meals logged yet</p>
                    <p className="text-sm mt-1">Use quick log or click target icon on meal cards</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dailyLog.meals.map((meal, idx) => (
                      <div key={idx} className={`${dark?'bg-slate-800':'bg-white'} p-3 rounded-xl flex justify-between items-start`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>{meal.name}</div>
                            {meal.source === 'barcode' && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                                Scanned
                              </span>
                            )}
                            {meal.source === 'plate-ai' && (
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
                                AI - {Math.round((meal.confidence || 0) * 100)}%
                              </span>
                            )}
                          </div>
                          <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>
                            {meal.calories} cal - {meal.protein}g P - {meal.carbs}g C - {meal.fat}g F
                          </div>
                          {meal.brand && (
                            <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'} mt-0.5`}>
                              {meal.brand}
                            </div>
                          )}
                        </div>
                        <div className={`text-xs ${dark?'text-slate-500':'text-slate-500'} text-right`}>
                          {meal.timestamp ? new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 
                           meal.loggedAt ? new Date(meal.loggedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : 'Now'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {dailyLog.meals.length > 0 && (
                <button
                  onClick={completeDailyLog}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-premium-lg"
                >
                  Complete Today's Log
                </button>
              )}

              {trackingHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>History</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {trackingHistory.slice(0, 5).map((log) => (
                      <div key={log.id} className={`${dark?'bg-slate-800':'bg-white'} p-3 rounded-lg text-sm`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>{log.date}</span>
                          <span className={`${dark?'text-slate-400':'text-slate-600'}`}>{log.meals.length} meals</span>
                        </div>
                        <div className={`text-xs mt-1 ${dark?'text-slate-500':'text-slate-500'}`}>
                          {log.totalCalories} cal - {log.totalProtein}g P - {log.water} glasses 
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Grocery List Modal */}
        {showGroceryList && (
          <div className={`fixed inset-0 ${dark?'glass-dark':'glass'} z-50 overflow-y-auto p-6 animate-slideIn backdrop-blur-xl`}>
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${dark?'text-white':'text-gray-900'}`}> Grocery List</h2>
                <button onClick={() => setShowGroceryList(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                  <X className={`w-6 h-6 ${dark?'text-white':'text-gray-900'}`} />
                </button>
              </div>
              
              <div className="space-y-2">
                {groceryList.map(item => (
                  <div
                    key={item.id}
                    className={`${dark?'glass-dark':'glass'} p-4 rounded-xl flex items-center gap-3 transition-all ${item.checked?'opacity-60':''}`}
                  >
                    <div 
                      onClick={() => toggleGroceryItem(item.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer ${
                        item.checked ? 'bg-emerald-500 border-emerald-500' : dark?'border-slate-600':'border-gray-300'
                      }`}
                    >
                      {item.checked && <span className="text-white text-sm">✔</span>}
                    </div>
                    <div className="flex-1">
                      <span className={`${item.checked?'line-through':''} ${dark?'text-white':'text-gray-900'}`}>
                        {item.name}
                      </span>
                      {item.usedIn > 1 && (
                        <span className={`ml-2 text-xs ${dark?'text-slate-400':'text-slate-600'}`}>
                          - Used in {item.usedIn} meals
                        </span>
                      )}
                    </div>
                    {!item.checked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsAlreadyHave(item.id);
                        }}
                        className={`text-xs px-2 py-1 rounded ${dark?'bg-slate-700 text-slate-300 hover:bg-slate-600':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Have it
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Saved Plans Modal */}
        {showSavedPlans && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSavedPlans(false)}>
            <div className={`${dark?'glass-dark':'glass'} rounded-3xl shadow-premium-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${dark?'text-white':'text-gray-900'}`}> Saved Plans</h2>
                <button onClick={() => setShowSavedPlans(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                  <X className={`w-6 h-6 ${dark?'text-white':'text-gray-900'}`} />
                </button>
              </div>
              {savedPlans.length === 0 ? (
                <div className={`text-center py-12 ${dark?'text-slate-400':'text-slate-600'}`}>
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No saved plans yet</p>
                  <p className="text-sm mt-2">Click "Save Plan" to save your current meal plan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedPlans.map(sp => (
                    <div key={sp.id} className={`${dark?'bg-slate-800':'bg-white'} p-4 rounded-xl shadow-premium`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{sp.plan.name}'s Plan</h3>
                          <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>Saved on {sp.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => loadPlan(sp)}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${dark?'bg-emerald-600 text-white hover:bg-emerald-700':'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteSavedPlan(sp.id)}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold ${dark?'bg-red-600 text-white hover:bg-red-700':'bg-red-500 text-white hover:bg-red-600'}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className={`${dark?'bg-slate-700':'bg-gray-50'} p-2 rounded-lg text-center`}>
                          <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Calories</div>
                          <div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{sp.plan.calories}</div>
                        </div>
                        <div className={`${dark?'bg-slate-700':'bg-gray-50'} p-2 rounded-lg text-center`}>
                          <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Protein</div>
                          <div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{sp.plan.protein}g</div>
                        </div>
                        <div className={`${dark?'bg-slate-700':'bg-gray-50'} p-2 rounded-lg text-center`}>
                          <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Carbs</div>
                          <div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{sp.plan.carbs}g</div>
                        </div>
                        <div className={`${dark?'bg-slate-700':'bg-gray-50'} p-2 rounded-lg text-center`}>
                          <div className={`text-xs ${dark?'text-slate-400':'text-slate-600'}`}>Fat</div>
                          <div className={`font-bold ${dark?'text-white':'text-gray-900'}`}>{sp.plan.fat}g</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weight Tracking Screen (Additive Feature) */}
        {showWeightTracking && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowWeightTracking(false)}>
            <div className={`${dark?'bg-slate-900':'bg-white'} rounded-3xl shadow-premium-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="sticky top-0 z-10 p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-600 to-pink-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-7 h-7 text-white" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Weight Tracking</h2>
                      <p className="text-sm text-purple-100">Monitor your progress over time</p>
                    </div>
                  </div>
                  <button onClick={() => setShowWeightTracking(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {weighIns.length === 0 ? (
                  /* Empty State */
                  <div className={`${dark?'bg-slate-800':'bg-gray-50'} rounded-2xl p-12 text-center`}>
                    <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${dark?'text-slate-600':'text-gray-300'}`} />
                    <h3 className={`text-xl font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>
                      Start Tracking Your Weight
                    </h3>
                    <p className={`text-sm ${dark?'text-slate-400':'text-gray-600'} mb-6 max-w-md mx-auto`}>
                      Log your weight regularly to see trends and track your progress toward your goals.
                    </p>
                    <button
                      onClick={() => {
                        setShowWeightTracking(false);
                        setShowWeighInModal(true);
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold btn-press"
                    >
                      Log Your First Weight
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Time Range Controls */}
                    <div className="flex justify-center mb-6">
                      <div className={`inline-flex p-1 rounded-xl ${dark?'bg-slate-800':'bg-gray-100'}`}>
                        {[
                          {val: '7', label: '7 Days'},
                          {val: '30', label: '30 Days'},
                          {val: '90', label: '90 Days'},
                          {val: 'all', label: 'All Time'}
                        ].map(range => (
                          <button
                            key={range.val}
                            onClick={() => setWeightTrackingTimeRange(range.val)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                              weightTrackingTimeRange === range.val
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                : dark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chart */}
                    {(() => {
                      // Filter data based on time range
                      const now = new Date();
                      const filteredData = weighIns.filter(w => {
                        if (weightTrackingTimeRange === 'all') return true;
                        const daysDiff = (now - w.date) / (1000 * 60 * 60 * 24);
                        return daysDiff <= parseInt(weightTrackingTimeRange);
                      }).reverse(); // Oldest first for chart

                      if (filteredData.length === 0) {
                        return (
                          <div className={`${dark?'bg-slate-800':'bg-gray-50'} rounded-2xl p-8 text-center mb-6`}>
                            <p className={`${dark?'text-slate-400':'text-gray-600'}`}>
                              No data in this time range
                            </p>
                          </div>
                        );
                      }

                      // Calculate chart dimensions and scale
                      const weights = filteredData.map(d => d.weight);
                      const minWeight = Math.min(...weights);
                      const maxWeight = Math.max(...weights);
                      const weightRange = maxWeight - minWeight || 5;
                      const padding = weightRange * 0.15;
                      const yMin = minWeight - padding;
                      const yMax = maxWeight + padding;

                      const chartWidth = 800;
                      const chartHeight = 300;
                      const chartPadding = { top: 20, right: 20, bottom: 40, left: 50 };

                      const xScale = (index) => {
                        const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
                        return chartPadding.left + (index / (filteredData.length - 1 || 1)) * innerWidth;
                      };

                      const yScale = (weight) => {
                        const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
                        return chartHeight - chartPadding.bottom - ((weight - yMin) / (yMax - yMin)) * innerHeight;
                      };

                      // Create line path
                      const linePath = filteredData.map((d, i) => {
                        const x = xScale(i);
                        const y = yScale(d.weight);
                        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                      }).join(' ');

                      // Calculate trend (minimum 3 data points for stability)
                      const trend = filteredData.length >= 3 ? calculateWeightTrend(filteredData.slice(-4)) : null;
                      const trendDirection = trend === null ? 'stable' : trend < -0.1 ? 'down' : trend > 0.1 ? 'up' : 'stable';

                      return (
                        <div className="mb-6">
                          {/* Trend Summary (only with sufficient data) */}
                          {trend !== null && filteredData.length >= 3 && (
                            <div className={`p-4 rounded-xl mb-4 ${dark?'bg-slate-800':'bg-gray-50'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-sm font-medium ${dark?'text-slate-400':'text-gray-600'}`}>
                                    Trend ({Math.min(filteredData.length, 4)}-point analysis)
                                  </p>
                                  <p className={`text-2xl font-bold ${
                                    trendDirection === 'down' ? 'text-blue-500' :
                                    trendDirection === 'up' ? 'text-orange-500' :
                                    dark ? 'text-slate-400' : 'text-gray-600'
                                  }`}>
                                    {trend > 0 ? '+' : ''}{trend.toFixed(2)} lbs/week
                                  </p>
                                </div>
                                <div className="text-3xl">
                                  {trendDirection === 'down' ? '' : trendDirection === 'up' ? '' : '➡️'}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SVG Chart */}
                          <div className={`${dark?'bg-slate-800':'bg-gray-50'} rounded-2xl p-6 overflow-x-auto`}>
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{minWidth: '600px'}}>
                              {/* Grid lines */}
                              {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                                const y = chartHeight - chartPadding.bottom - ratio * (chartHeight - chartPadding.top - chartPadding.bottom);
                                const weight = yMin + ratio * (yMax - yMin);
                                return (
                                  <g key={ratio}>
                                    <line
                                      x1={chartPadding.left}
                                      y1={y}
                                      x2={chartWidth - chartPadding.right}
                                      y2={y}
                                      stroke={dark ? '#334155' : '#e5e7eb'}
                                      strokeWidth="1"
                                      strokeDasharray="4"
                                    />
                                    <text
                                      x={chartPadding.left - 10}
                                      y={y + 4}
                                      textAnchor="end"
                                      fontSize="12"
                                      fill={dark ? '#94a3b8' : '#6b7280'}
                                    >
                                      {weight.toFixed(1)}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Line */}
                              <path
                                d={linePath}
                                fill="none"
                                stroke="url(#lineGradient)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />

                              {/* Gradient definition */}
                              <defs>
                                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#a855f7" />
                                  <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                              </defs>

                              {/* Data points */}
                              {filteredData.map((d, i) => {
                                const x = xScale(i);
                                const y = yScale(d.weight);
                                return (
                                  <g key={i}>
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r="6"
                                      fill={dark ? '#1e293b' : '#ffffff'}
                                      stroke="#a855f7"
                                      strokeWidth="3"
                                      className="cursor-pointer hover:r-8 transition-all"
                                      onClick={() => {
                                        // Show data point details
                                        alert(`${d.dateString}\n${d.weight} lbs${d.note ? `\nNote: ${d.note}` : ''}`);
                                      }}
                                    />
                                  </g>
                                );
                              })}

                              {/* X-axis labels */}
                              {filteredData.map((d, i) => {
                                if (filteredData.length > 10 && i % Math.ceil(filteredData.length / 8) !== 0) return null;
                                const x = xScale(i);
                                const label = new Date(d.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
                                return (
                                  <text
                                    key={`label-${i}`}
                                    x={x}
                                    y={chartHeight - 10}
                                    textAnchor="middle"
                                    fontSize="11"
                                    fill={dark ? '#94a3b8' : '#6b7280'}
                                  >
                                    {label}
                                  </text>
                                );
                              })}
                            </svg>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Weight History List */}
                    <div className={`${dark?'bg-slate-800':'bg-white'} rounded-2xl p-6 shadow-premium`}>
                      <h3 className={`font-bold text-lg mb-4 ${dark?'text-white':'text-gray-900'}`}>
                        Weight History ({weighIns.length} entries)
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {weighIns.slice(0, 20).map((entry, idx) => (
                          <div key={entry.id} className={`p-3 rounded-xl ${dark?'bg-slate-700':'bg-gray-50'} flex justify-between items-center`}>
                            <div>
                              <p className={`font-semibold ${dark?'text-white':'text-gray-900'}`}>
                                {entry.weight} lbs
                              </p>
                              <p className={`text-xs ${dark?'text-slate-400':'text-gray-600'}`}>
                                {entry.dateString}
                              </p>
                              {entry.note && (
                                <p className={`text-xs mt-1 ${dark?'text-slate-500':'text-gray-500'} italic`}>
                                  "{entry.note}"
                                </p>
                              )}
                            </div>
                            {idx === 0 && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded">
                                Latest
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer with action button */}
              <div className={`sticky bottom-0 p-6 border-t ${dark?'border-slate-700 bg-slate-900':'border-gray-200 bg-white'}`}>
                <button
                  onClick={() => {
                    setShowWeightTracking(false);
                    setShowWeighInModal(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold btn-press"
                >
                  Log New Weight
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Workout Tracking Modal */}
        {/* Meal Replace Modal */}
        {showMealReplace !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMealReplace(null)}>
            <div className={`${dark?'glass-dark':'glass'} rounded-3xl shadow-premium-xl p-6 max-w-md w-full`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${dark?'text-white':'text-gray-900'}`}> Replace Meal</h2>
                <button onClick={() => setShowMealReplace(null)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                  <X className={`w-6 h-6 ${dark?'text-white':'text-gray-900'}`} />
                </button>
              </div>

              <p className={`text-sm mb-4 ${dark?'text-slate-400':'text-slate-600'}`}>
                Choose how to replace this meal
              </p>

              {/* Scanning Options */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    setReplacingMealIndex(showMealReplace);
                    setShowScanning(true);
                    setScanMode('barcode');
                    setShowMealReplace(null);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${dark?'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800':'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'} text-white`}
                >
                  <Scan className="w-6 h-6" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Scan Barcode</div>
                    <div className="text-xs opacity-90">Scan packaged food barcode</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setReplacingMealIndex(showMealReplace);
                    setShowScanning(true);
                    setScanMode('plate');
                    setShowMealReplace(null);
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${dark?'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800':'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'} text-white`}
                >
                  <Camera className="w-6 h-6" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Scan Plate</div>
                    <div className="text-xs opacity-90">AI analyzes your meal photo</div>
                  </div>
                </button>
              </div>

              <div className={`flex items-center gap-2 mb-4 ${dark?'text-slate-400':'text-slate-600'}`}>
                <div className="flex-1 h-px bg-slate-300"></div>
                <span className="text-xs font-semibold">OR ENTER MANUALLY</span>
                <div className="flex-1 h-px bg-slate-300"></div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Meal name"
                  value={customMeal.name}
                  onChange={(e) => setCustomMeal({...customMeal, name: e.target.value})}
                  className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-700':'border-gray-200'} focus:outline-none focus:border-emerald-500`}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Calories"
                    value={customMeal.calories || ''}
                    onChange={(e) => setCustomMeal({...customMeal, calories: e.target.value})}
                    className={`px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-700':'border-gray-200'} focus:outline-none focus:border-emerald-500`}
                  />
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={customMeal.protein || ''}
                    onChange={(e) => setCustomMeal({...customMeal, protein: e.target.value})}
                    className={`px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-700':'border-gray-200'} focus:outline-none focus:border-emerald-500`}
                  />
                  <input
                    type="number"
                    placeholder="Carbs (g)"
                    value={customMeal.carbs || ''}
                    onChange={(e) => setCustomMeal({...customMeal, carbs: e.target.value})}
                    className={`px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-700':'border-gray-200'} focus:outline-none focus:border-emerald-500`}
                  />
                  <input
                    type="number"
                    placeholder="Fat (g)"
                    value={customMeal.fat || ''}
                    onChange={(e) => setCustomMeal({...customMeal, fat: e.target.value})}
                    className={`px-4 py-3 rounded-xl ${dark?'bg-slate-800 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-700':'border-gray-200'} focus:outline-none focus:border-emerald-500`}
                  />
                </div>

                <button
                  onClick={() => replaceMeal(showMealReplace)}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-premium-lg transition-all"
                >
                  Replace & Recalculate
                </button>
              </div>

              <div className={`mt-4 p-4 rounded-xl ${dark?'bg-slate-800':'bg-blue-50'}`}>
                <p className={`text-sm ${dark?'text-slate-300':'text-blue-900'}`}>
                   <strong>Tip:</strong> Your daily totals will automatically update
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Chat Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-premium-xl flex items-center justify-center transition-all ${chatOpen?'bg-gray-400':'bg-gradient-to-r from-sky-500 to-blue-600'} text-white hover:scale-110`}
        >
          {chatOpen ? <X className="w-6 h-6 sm:w-7 sm:h-7" /> : <span className="text-2xl sm:text-3xl"></span>}
        </button>

        {/* Chat Panel */}
        {chatOpen && (
          <div className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 max-w-md h-[70vh] sm:h-[500px] ${dark?'glass-dark':'glass'} rounded-3xl shadow-premium-xl flex flex-col animate-slideUp`}>
            <div className="p-4 border-b ${dark?'border-slate-700':'border-gray-200'} bg-gradient-to-r from-sky-500 to-blue-600 rounded-t-3xl">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <span className="text-2xl"></span>
                Chat with Plato
              </h3>
              <p className="text-sm text-emerald-100">Your AI nutrition assistant</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                      : dark ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-2xl ${dark?'bg-slate-800':'bg-gray-100'}`}>
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                  </div>
                </div>
              )}
            </div>

            <div className={`p-4 border-t ${dark?'border-slate-700':'border-gray-200'}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask me anything..."
                  className={`flex-1 px-4 py-2 rounded-xl ${dark?'bg-slate-800 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-700':'border-gray-200'} focus:outline-none focus:border-emerald-500`}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scanning Modals - Rendered within results screen */}
        {showScanning && !scanMode && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowScanning(false)}>
            <div className={`${dark?'glass-dark':'glass'} rounded-3xl shadow-premium-xl p-6 max-w-2xl w-full`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-3xl font-bold ${dark?'text-white':'text-slate-900'}`}>Scan Food</h2>
                <button onClick={() => setShowScanning(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                  <X className={`w-6 h-6 ${dark?'text-white':'text-gray-900'}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Barcode Scan Tile */}
                <button
                  onClick={() => setScanMode('barcode')}
                  className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-left shadow-xl hover:shadow-2xl transition-all btn-press"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Scan className="w-9 h-9" />
                    </div>
                    <CheckCircle className="w-6 h-6 opacity-80" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Scan Packaged Food</h3>
                  <p className="text-blue-100">Barcode & QR codes - High accuracy</p>
                </button>

                {/* Plate AI Tile */}
                <button
                  onClick={() => setScanMode('plate')}
                  className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white text-left shadow-xl hover:shadow-2xl transition-all btn-press relative overflow-hidden"
                >
                  <span className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur text-xs font-bold rounded-full">
                    BETA
                  </span>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Camera className="w-9 h-9" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Analyze My Plate</h3>
                  <p className="text-purple-100">Photo-based estimates - Quick logging</p>
                </button>
              </div>

              {/* Recently Scanned */}
              {recentScans.length > 0 && (
                <div className="mt-6">
                  <h3 className={`text-lg font-bold mb-3 ${dark?'text-white':'text-slate-900'}`}>
                    Recently Scanned
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recentScans.slice(0, 5).map((item, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setScanResult(item);
                          setShowScanning(false);
                        }}
                        className={`w-full p-3 rounded-xl text-left ${dark?'bg-slate-800 hover:bg-slate-700':'bg-white hover:bg-slate-50'} transition-all`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`font-semibold ${dark?'text-white':'text-slate-900'}`}>
                              {item.name}
                            </h4>
                            {item.brand && (
                              <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                                {item.brand}
                              </p>
                            )}
                          </div>
                          <ChevronRight className={`w-5 h-5 ${dark?'text-slate-500':'text-slate-400'}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========== RECIPE MODALS (ADDITIVE) ========== */}
        
        {/* AI Recipe Search Modal */}
        {showRecipeSearch && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowRecipeSearch(false)} />
            <div className={`fixed inset-x-4 top-20 bottom-20 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl ${dark?'bg-slate-800':'bg-white'} rounded-3xl shadow-xl z-50 overflow-hidden flex flex-col`}>
              <div className={`p-6 border-b ${dark?'border-slate-700':'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-2xl font-black ${dark?'text-white':'text-gray-900'}`}>Discover Recipes</h2>
                  <button onClick={() => setShowRecipeSearch(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipeSearchQuery}
                    onChange={(e) => setRecipeSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchRecipesWithAI(recipeSearchQuery)}
                    placeholder="e.g., high protein brownies"
                    className={`flex-1 px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500`}
                    autoFocus
                  />
                  <button
                    onClick={() => searchRecipesWithAI(recipeSearchQuery)}
                    disabled={!recipeSearchQuery || recipeSearchLoading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold disabled:opacity-50 btn-press"
                  >
                    {recipeSearchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {recipeSearchLoading && (
                  <div className="text-center py-12">
                    <Loader2 className={`w-12 h-12 mx-auto mb-4 ${dark?'text-purple-400':'text-purple-600'} animate-spin`} />
                    <p className={`${dark?'text-slate-400':'text-gray-600'}`}>Searching recipes...</p>
                  </div>
                )}
                
                {recipeSearchResults.length > 0 && (
                  <div className="space-y-4">
                    {recipeSearchResults.map((result) => (
                      <div key={result.id} className={`${dark?'bg-slate-700':'bg-gray-50'} rounded-2xl p-4`}>
                        <h3 className={`font-bold mb-2 ${dark?'text-white':'text-gray-900'}`}>{result.title}</h3>
                        <div className="flex gap-4 text-sm mb-3">
                          <span className={`${dark?'text-purple-400':'text-purple-600'} font-semibold`}>
                            {result.nutritionPerServing.calories} cal
                          </span>
                          <span className={`${dark?'text-slate-400':'text-gray-400'}`}>
                            {result.nutritionPerServing.protein}g P
                          </span>
                          <span className={`${dark?'text-slate-400':'text-gray-400'}`}>
                            {result.nutritionPerServing.carbs}g C
                          </span>
                          <span className={`${dark?'text-slate-400':'text-gray-400'}`}>
                            {result.nutritionPerServing.fat}g F
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setRecipeInReview(result);
                            setShowRecipeSearch(false);
                          }}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-xl font-semibold text-sm btn-press"
                        >
                          Review & Save
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Recipe Review Modal */}
        {recipeInReview && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setRecipeInReview(null)} />
            <div className={`fixed inset-x-4 top-20 bottom-20 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl ${dark?'bg-slate-800':'bg-white'} rounded-3xl shadow-xl z-50 overflow-hidden flex flex-col animate-slideUp`}>
              <div className={`p-6 border-b ${dark?'border-slate-700':'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-black ${dark?'text-white':'text-gray-900'}`}>Review Recipe</h2>
                  <button onClick={() => setRecipeInReview(null)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className={`text-xl font-bold mb-4 ${dark?'text-white':'text-gray-900'}`}>{recipeInReview.title}</h3>
                
                <div className={`p-4 rounded-xl ${dark?'bg-slate-700':'bg-gray-50'} mb-6`}>
                  <h4 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>
                    Nutrition (per serving)
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className={`text-2xl font-black ${dark?'text-purple-400':'text-purple-600'} tabular-nums`}>
                        {recipeInReview.nutritionPerServing.calories}
                      </p>
                      <p className={`text-xs ${dark?'text-slate-400':'text-gray-500'}`}>calories</p>
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${dark?'text-white':'text-gray-900'} tabular-nums`}>
                        {recipeInReview.nutritionPerServing.protein}g
                      </p>
                      <p className={`text-xs ${dark?'text-slate-400':'text-gray-500'}`}>protein</p>
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${dark?'text-white':'text-gray-900'} tabular-nums`}>
                        {recipeInReview.nutritionPerServing.carbs}g
                      </p>
                      <p className={`text-xs ${dark?'text-slate-400':'text-gray-500'}`}>carbs</p>
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${dark?'text-white':'text-gray-900'} tabular-nums`}>
                        {recipeInReview.nutritionPerServing.fat}g
                      </p>
                      <p className={`text-xs ${dark?'text-slate-400':'text-gray-500'}`}>fat</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>Ingredients</h4>
                  <ul className="space-y-2">
                    {(recipeInReview.ingredients || []).map((ing, i) => (
                      <li key={i} className={`text-sm ${dark?'text-slate-300':'text-gray-700'}`}>
                        - {typeof ing === 'string' ? ing : `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ing}`}
                      </li>
                    ))}
                    {(!recipeInReview.ingredients || recipeInReview.ingredients.length === 0) && (
                      <li className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                        No ingredients available
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className={`font-semibold mb-3 ${dark?'text-white':'text-gray-900'}`}>Instructions</h4>
                  <ol className="space-y-3">
                    {(recipeInReview.steps || recipeInReview.instructions || []).map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full ${dark?'bg-purple-900/30 text-purple-400':'bg-purple-100 text-purple-600'} flex items-center justify-center text-xs font-bold`}>
                          {i + 1}
                        </span>
                        <p className={`text-sm ${dark?'text-slate-300':'text-gray-700'}`}>
                          {typeof step === 'string' ? step : step.step || step.instruction || ''}
                        </p>
                      </li>
                    ))}
                    {(!recipeInReview.steps && !recipeInReview.instructions) && (
                      <li className={`text-sm ${dark?'text-slate-400':'text-gray-600'}`}>
                        No instructions available
                      </li>
                    )}
                  </ol>
                </div>
              </div>
              
              <div className={`p-6 border-t ${dark?'border-slate-700':'border-gray-200'}`}>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      saveRecipe(recipeInReview);
                      setRecipeInReview(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold btn-press"
                  >
                    Save Recipe
                  </button>
                  <button
                    onClick={() => {
                      saveRecipe(recipeInReview);
                      setAddToPlanRecipe(recipeInReview);
                      setShowAddToPlanModal(true);
                      setRecipeInReview(null);
                    }}
                    className={`px-4 py-3 rounded-xl font-semibold btn-press ${dark?'bg-slate-700 text-white':'bg-gray-100 text-gray-900'}`}
                  >
                    <CalendarPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add to Plan Modal */}
        {showAddToPlanModal && addToPlanRecipe && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddToPlanModal(false)} />
            <div className={`fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg ${dark?'bg-slate-800':'bg-white'} rounded-3xl shadow-xl z-50 p-6 animate-slideUp`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-black ${dark?'text-white':'text-gray-900'}`}>Add to Meal Plan</h2>
                <button onClick={() => setShowAddToPlanModal(false)} className={`p-2 rounded-xl ${dark?'hover:bg-slate-700':'hover:bg-gray-100'}`}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`block mb-2 font-semibold ${dark?'text-white':'text-gray-900'}`}>Meal</label>
                  <select
                    value={addToPlanConfig.meal}
                    onChange={(e) => setAddToPlanConfig({...addToPlanConfig, meal: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500`}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block mb-2 font-semibold ${dark?'text-white':'text-gray-900'}`}>Servings</label>
                  <input
                    type="number"
                    value={addToPlanConfig.servings}
                    onChange={(e) => setAddToPlanConfig({...addToPlanConfig, servings: parseInt(e.target.value) || 1})}
                    className={`w-full px-4 py-3 rounded-xl ${dark?'bg-slate-700 text-white':'bg-gray-100'} border-2 ${dark?'border-slate-600':'border-gray-200'} focus:outline-none focus:border-purple-500`}
                    min="1"
                  />
                  <p className={`text-sm mt-2 ${dark?'text-slate-400':'text-gray-600'}`}>
                    {Math.round(addToPlanRecipe.nutritionPerServing.calories * addToPlanConfig.servings)} cal - 
                    {Math.round(addToPlanRecipe.nutritionPerServing.protein * addToPlanConfig.servings)}g P - 
                    {Math.round(addToPlanRecipe.nutritionPerServing.carbs * addToPlanConfig.servings)}g C - 
                    {Math.round(addToPlanRecipe.nutritionPerServing.fat * addToPlanConfig.servings)}g F
                  </p>
                </div>
              </div>
              
              <button
                onClick={addRecipeToPlan}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold btn-press"
              >
                Add to Plan
              </button>
            </div>
          </>
        )}

        {/* ========== END RECIPE MODALS ========== */}
      </div>
    );
  }

  // ========== END SCANNING FEATURE ==========

  // ========== WEIGH-IN & ADAPTIVE SYSTEM ==========
  // handleWeighIn is defined earlier in the file before component rendering
  
  const applyAdaptiveAdjustment = () => {
    if (!adaptiveRecommendation || !plan) return;

    const newCalories = plan.calories + adaptiveRecommendation.adjustment;
    
    // Use secondary goals from calculation data if available
    const secondaryGoals = plan.calculationData?.secondaryGoals || [];
    
    const newMacros = calculateMacros(
      newCalories,
      plan.calculationData.trainingType,
      form.dietStyle,
      plan.calculationData.weight,
      secondaryGoals
    );

    setPlan({
      ...plan,
      calories: newCalories,
      protein: newMacros.protein,
      carbs: newMacros.carbs,
      fat: newMacros.fat
    });

    showToast('Plan updated with adaptive adjustment', 'success');
    setAdaptiveRecommendation(null);
  };

  // ========== RECIPE MODALS (CHECK FIRST) ==========

  // Adaptive Recommendation Banner
  if (adaptiveRecommendation && !showWeighInModal) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 animate-slideUp max-w-2xl mx-auto">
        <div className={`${dark?'glass-dark':'glass'} rounded-2xl shadow-premium-xl p-5 border-l-4 ${
          adaptiveRecommendation.status === 'on-track' ? 'border-emerald-500' :
          adaptiveRecommendation.status === 'too-fast' ? 'border-orange-500' :
          'border-blue-500'
        } backdrop-blur-xl`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Activity className={`w-5 h-5 ${
                  adaptiveRecommendation.status === 'on-track' ? 'text-emerald-500' :
                  adaptiveRecommendation.status === 'too-fast' ? 'text-orange-500' :
                  'text-blue-500'
                }`} />
                <span className={`text-xs font-bold uppercase ${
                  adaptiveRecommendation.status === 'on-track' ? 'text-emerald-500' :
                  adaptiveRecommendation.status === 'too-fast' ? 'text-orange-500' :
                  'text-blue-500'
                }`}>
                  ADAPTIVE RECOMMENDATION
                </span>
              </div>
              
              <p className={`font-semibold mb-1 ${dark?'text-white':'text-gray-900'}`}>
                {adaptiveRecommendation.message}
              </p>
              
              {adaptiveRecommendation.reason && (
                <p className={`text-sm ${dark?'text-slate-400':'text-slate-600'}`}>
                  {adaptiveRecommendation.reason}
                </p>
              )}

              {adaptiveRecommendation.adjustment !== 0 && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={applyAdaptiveAdjustment}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm btn-press"
                  >
                    Apply Adjustment
                  </button>
                  <button
                    onClick={() => setAdaptiveRecommendation(null)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm ${dark?'bg-slate-700 text-white':'bg-slate-100 text-slate-900'}`}
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
            
            {adaptiveRecommendation.status === 'on-track' && (
              <button
                onClick={() => setAdaptiveRecommendation(null)}
                className={`p-2 rounded-lg ${dark?'hover:bg-slate-700':'hover:bg-gray-200'} transition-all`}
              >
                <X className={`w-5 h-5 ${dark?'text-slate-400':'text-gray-500'}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== END WEIGH-IN & ADAPTIVE SYSTEM ==========

  return null;
}

