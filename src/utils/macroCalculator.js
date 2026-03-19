import { INGREDIENT_CATEGORIES } from './constants';
import { INGREDIENT_NUTRITION } from '../services/nutritionLookup';

/**
 * Parse ingredient line to extract quantity, unit, and name
 * Examples: "6oz chicken breast", "1 cup rice", "2 tbsp almond butter"
 */
export const parseIngredientLine = (line) => {
  if (!line) return null;
  const normalized = line.toLowerCase().trim();

  // Pattern: "6oz chicken" or "6 oz chicken"
  const ozMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*oz\s+(.+)$/);
  if (ozMatch) return { qty: parseFloat(ozMatch[1]), unit: 'oz', name: ozMatch[2].trim() };

  // Pattern: "1 cup rice"
  const cupMatch = normalized.match(/^(\d+(?:\.\d+)?)\s+cups?\s+(.+)$/);
  if (cupMatch) return { qty: parseFloat(cupMatch[1]), unit: 'cup', name: cupMatch[2].trim() };

  // Pattern: "2 tbsp butter"
  const tbspMatch = normalized.match(/^(\d+(?:\.\d+)?)\s+(tbsp|tablespoons?)\s+(.+)$/);
  if (tbspMatch) return { qty: parseFloat(tbspMatch[1]), unit: 'tbsp', name: tbspMatch[3].trim() };

  // Pattern: "1 tsp oil"
  const tspMatch = normalized.match(/^(\d+(?:\.\d+)?)\s+(tsp|teaspoons?)\s+(.+)$/);
  if (tspMatch) return { qty: parseFloat(tspMatch[1]), unit: 'tsp', name: tspMatch[3].trim() };

  // Pattern: "4 eggs" or "2 scoops protein"
  const countMatch = normalized.match(/^(\d+(?:\.\d+)?)\s+(eggs?|scoops?|slices?)\s*(.*)$/);
  if (countMatch) {
    const unit = countMatch[2].replace(/s$/, '');
    const name = countMatch[3].trim() || countMatch[2].replace(/s$/, '');
    return { qty: parseFloat(countMatch[1]), unit, name };
  }

  // Pattern: "170g yogurt"
  const gramMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*g\s+(.+)$/);
  if (gramMatch) {
    return { qty: parseFloat(gramMatch[1]) / 240, unit: 'cup', name: gramMatch[2].trim() };
  }

  // Pattern: "1 medium banana"
  const mediumMatch = normalized.match(/^(\d+(?:\.\d+)?)\s+(medium|large|small)\s+(.+)$/);
  if (mediumMatch) {
    return { qty: parseFloat(mediumMatch[1]), unit: mediumMatch[2], name: mediumMatch[3].trim() };
  }

  // Fallback
  return { qty: 1, unit: 'serving', name: normalized };
};

/**
 * Check if ingredient matches a category
 */
export const matchesCategory = (name, category) => {
  if (!name) return false;
  const nameLower = name.toLowerCase().trim();
  return category.some(item => nameLower.includes(item) || item.includes(nameLower));
};

/**
 * Determine if ingredient should be ignored in macro calculations
 */
export const shouldIgnoreIngredient = (parsed, nutritionData) => {
  if (!parsed) return { shouldIgnore: true, reason: 'unparseable' };
  const { qty, unit, name } = parsed;

  if (matchesCategory(name, INGREDIENT_CATEGORIES.spices)) {
    if (!qty || qty === 0) return { shouldIgnore: true, reason: 'spice-negligible' };
    if ((unit === 'tsp' && qty < 1) || (unit === 'g' && qty < 5)) return { shouldIgnore: true, reason: 'spice-small-amount' };
    if (nutritionData) {
      const estimatedCals = estimateCalories(qty, unit, nutritionData);
      if (estimatedCals < 10) return { shouldIgnore: true, reason: 'spice-low-calorie' };
    }
  }

  if (matchesCategory(name, INGREDIENT_CATEGORIES.sauces)) {
    if (!qty || qty === 0) return { shouldIgnore: true, reason: 'sauce-to-taste' };
    if (unit === 'tbsp' && qty < 1) return { shouldIgnore: true, reason: 'sauce-small-amount' };
    if (unit === 'tsp' && qty < 3) return { shouldIgnore: true, reason: 'sauce-small-amount' };
  }

  return { shouldIgnore: false, reason: null };
};

/**
 * Estimate calories from quantity and nutrition data
 */
export const estimateCalories = (qty, unit, nutritionData) => {
  if (!nutritionData || !qty) return 0;
  const unitMap = { oz: 'perOz', cup: 'perCup', tbsp: 'perTbsp', tsp: 'perTsp', g: 'perG' };
  const perUnit = nutritionData[unitMap[unit]] || nutritionData[Object.keys(nutritionData)[0]];
  if (!perUnit) return 0;
  return (perUnit.protein * 4 + perUnit.carbs * 4 + perUnit.fat * 9) * qty;
};

/**
 * Apply conservative defaults for vague ingredient quantities
 */
export const applyDefaultQuantity = (parsed) => {
  if (!parsed) return parsed;
  let { qty, unit, name } = parsed;
  if (matchesCategory(name, INGREDIENT_CATEGORIES.oils) && (!qty || qty === 0)) { qty = 1; unit = 'tsp'; }
  if (matchesCategory(name, INGREDIENT_CATEGORIES.sauces) && (!qty || qty === 0)) { qty = 1; unit = 'tbsp'; }
  return { qty, unit, name };
};

/**
 * Calculate confidence score for a single ingredient
 */
export const calculateIngredientConfidence = (parsed, nutritionData, perUnit) => {
  let confidence = 0.5;
  if (!parsed) return 0.4;
  const { qty, unit, name } = parsed;

  if (qty && qty > 0) {
    confidence += 0.15;
    if (['oz', 'g', 'cup', 'tbsp', 'tsp', 'egg', 'slice', 'scoop'].includes(unit)) confidence += 0.15;
    else if (unit) confidence += 0.05;
  } else {
    confidence -= 0.1;
  }

  if (nutritionData) {
    confidence += INGREDIENT_NUTRITION[name] ? 0.15 : 0.05;
    if (perUnit) confidence += 0.1;
  } else {
    confidence -= 0.15;
  }

  return Math.max(0.4, Math.min(0.95, confidence));
};

/**
 * Compute meal macros with confidence scoring from ingredients array
 */
export const computeMealMacrosFromIngredients = (ingredients) => {
  if (!ingredients || ingredients.length === 0) {
    return { protein: 0, carbs: 0, fat: 0, calories: 0, macroConfidence: 0.5, ingredientDetails: [] };
  }

  let totalProtein = 0, totalCarbs = 0, totalFat = 0;
  const ingredientDetails = [];
  let weightedConfidenceSum = 0, totalCalorieWeight = 0;

  for (const ingredientLine of ingredients) {
    const parsed = parseIngredientLine(ingredientLine);
    if (!parsed) {
      ingredientDetails.push({ line: ingredientLine, confidence: 0.4, calories: 0, reason: 'unparseable' });
      continue;
    }

    const adjusted = applyDefaultQuantity(parsed);
    const { qty, unit, name } = adjusted;

    // Look up nutrition
    let nutritionData = null;
    if (INGREDIENT_NUTRITION[name]) {
      nutritionData = INGREDIENT_NUTRITION[name];
    } else {
      for (const key of Object.keys(INGREDIENT_NUTRITION)) {
        if (name.includes(key) || key.includes(name)) { nutritionData = INGREDIENT_NUTRITION[key]; break; }
      }
    }

    const finalIgnore = shouldIgnoreIngredient(adjusted, nutritionData);
    if (finalIgnore.shouldIgnore) {
      ingredientDetails.push({ line: ingredientLine, name, qty, unit, protein: 0, carbs: 0, fat: 0, calories: 0, confidence: 0.95, matchType: 'ignored', ignoreReason: finalIgnore.reason });
      continue;
    }

    let perUnit = null;
    let iP = 0, iC = 0, iF = 0, iCal = 0;

    if (!nutritionData) {
      iP = 5; iC = 10; iF = 2; iCal = (5 * 4) + (10 * 4) + (2 * 9);
    } else {
      const unitMap = { oz: 'perOz', cup: 'perCup', tbsp: 'perTbsp', tsp: 'perTsp', egg: 'perEgg', scoop: 'perScoop', slice: 'perSlice', medium: 'perMedium', large: 'perLarge', quarter: 'perQuarter' };
      perUnit = nutritionData[unitMap[unit]] || nutritionData[Object.keys(nutritionData)[0]];

      if (perUnit) {
        iP = perUnit.protein * qty;
        iC = perUnit.carbs * qty;
        iF = perUnit.fat * qty;
        iCal = (iP * 4) + (iC * 4) + (iF * 9);

        // Cap sauce calories at 100
        if (matchesCategory(name, INGREDIENT_CATEGORIES.sauces) && iCal > 100) {
          const scale = 100 / iCal;
          iP *= scale; iC *= scale; iF *= scale; iCal = 100;
        }
      }
    }

    const confidence = calculateIngredientConfidence(parsed, nutritionData, perUnit);
    ingredientDetails.push({
      line: ingredientLine, name, qty, unit,
      protein: iP, carbs: iC, fat: iF, calories: iCal,
      confidence, matchType: nutritionData ? (INGREDIENT_NUTRITION[name] ? 'exact' : 'fuzzy') : 'estimated'
    });

    totalProtein += iP;
    totalCarbs += iC;
    totalFat += iF;
    weightedConfidenceSum += confidence * iCal;
    totalCalorieWeight += iCal;
  }

  totalProtein = Math.round(totalProtein);
  totalCarbs = Math.round(totalCarbs);
  totalFat = Math.round(totalFat);
  const calories = Math.round((totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9));
  const macroConfidence = totalCalorieWeight > 0 ? Math.round((weightedConfidenceSum / totalCalorieWeight) * 100) / 100 : 0.5;

  return { protein: totalProtein, carbs: totalCarbs, fat: totalFat, calories, macroConfidence, ingredientDetails };
};

/**
 * Get confidence tier label
 */
export const getConfidenceTierLabel = (confidence) => {
  if (confidence >= 0.80) return 'High confidence';
  if (confidence >= 0.65) return 'Estimated';
  return 'Rough estimate';
};

/**
 * Get confidence explanation
 */
export const getConfidenceExplanation = (confidence, ingredientDetails) => {
  const tier = getConfidenceTierLabel(confidence);
  const estimates = ingredientDetails.filter(i => i.matchType === 'estimated').length;
  let explanation = `${tier} - `;
  if (tier === 'High confidence') explanation += 'Ingredients have precise quantities and known nutrition data.';
  else if (tier === 'Estimated') explanation += 'Most ingredients matched, some quantities approximated.';
  else explanation += 'Several ingredients lack precise data. Macros are conservative estimates.';
  if (estimates > 0) explanation += ` ${estimates} ingredient${estimates > 1 ? 's' : ''} estimated.`;
  return explanation;
};

/**
 * Parse and expand user restrictions into forbidden keywords
 */
export const parseRestrictions = (restrictionString) => {
  if (!restrictionString || restrictionString.trim() === '') return new Set();
  const { RESTRICTION_SYNONYMS } = require('./constants');
  const forbidden = new Set();
  const tokens = restrictionString.toLowerCase().split(/[,\s]+/).map(t => t.trim()).filter(t => t.length > 0);
  for (const token of tokens) {
    let normalized = token;
    if (token === 'tree nuts' || token === 'treenuts') normalized = 'tree_nuts';
    if (RESTRICTION_SYNONYMS[normalized]) {
      for (const keyword of RESTRICTION_SYNONYMS[normalized]) forbidden.add(keyword);
    } else {
      forbidden.add(normalized);
    }
  }
  return forbidden;
};

/**
 * Check if a meal violates restrictions (true = allowed)
 */
export const isMealAllowed = (meal, forbiddenKeywords) => {
  if (forbiddenKeywords.size === 0) return true;
  const mealName = (meal.name || '').toLowerCase();
  for (const keyword of forbiddenKeywords) {
    if (mealName.includes(keyword)) return false;
  }
  if (meal.ingredients) {
    for (const ingredient of meal.ingredients) {
      const lower = ingredient.toLowerCase();
      for (const keyword of forbiddenKeywords) {
        if (lower.includes(keyword)) return false;
      }
    }
  }
  return true;
};
