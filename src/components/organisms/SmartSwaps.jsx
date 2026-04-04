import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Button, PrimaryButton, SecondaryButton } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Badge } from '../atoms/Badge';
import { ArrowRight, RefreshCw, Target, Zap, AlertTriangle, Check } from 'lucide-react';

/**
 * Smart Swaps System - Intelligent meal substitutions
 * Features:
 * - Macro-equivalent swaps
 * - Preference-based suggestions
 * - Health optimization recommendations
 * - Dietary restriction compliance
 */

const SWAP_DATABASE = {
  // Protein sources
  protein: [
    { name: 'Chicken breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, per: '100g' },
    { name: 'Ground turkey', calories: 150, protein: 28, carbs: 0, fat: 4, per: '100g' },
    { name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 12, per: '100g' },
    { name: 'Eggs', calories: 155, protein: 13, carbs: 1, fat: 11, per: '2 large' },
    { name: 'Greek yogurt', calories: 100, protein: 17, carbs: 6, fat: 0, per: '150g' },
    { name: 'Tofu', calories: 70, protein: 8, carbs: 2, fat: 4, per: '100g' },
    { name: 'Lentils', calories: 116, protein: 9, carbs: 20, fat: 0.4, per: '100g cooked' },
    { name: 'Protein powder', calories: 120, protein: 25, carbs: 3, fat: 1, per: '1 scoop' }
  ],
  
  // Carb sources  
  carbs: [
    { name: 'Brown rice', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, per: '100g cooked' },
    { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fat: 1.9, per: '100g cooked' },
    { name: 'Sweet potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, per: '100g' },
    { name: 'Oats', calories: 389, protein: 17, carbs: 66, fat: 7, per: '100g dry' },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, per: '1 medium' },
    { name: 'Ezekiel bread', calories: 80, protein: 4, carbs: 15, fat: 0.5, per: '1 slice' },
    { name: 'Cauliflower rice', calories: 25, protein: 2, carbs: 5, fat: 0.3, per: '100g' }
  ],
  
  // Fat sources
  fats: [
    { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, per: '1/2 medium' },
    { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, per: '28g' },
    { name: 'Olive oil', calories: 119, protein: 0, carbs: 0, fat: 14, per: '1 tbsp' },
    { name: 'Coconut oil', calories: 121, protein: 0, carbs: 0, fat: 14, per: '1 tbsp' },
    { name: 'Peanut butter', calories: 94, protein: 4, carbs: 3, fat: 8, per: '1 tbsp' },
    { name: 'Chia seeds', calories: 58, protein: 2, carbs: 5, fat: 4, per: '1 tbsp' }
  ]
};

const HEALTH_IMPROVEMENTS = {
  highSodium: {
    reason: 'Too much sodium',
    suggestions: ['Use herbs/spices instead', 'Choose fresh over processed', 'Rinse canned foods'],
    swaps: ['Fresh chicken → Rotisserie', 'Canned beans → Dried beans', 'Processed meat → Fresh meat']
  },
  highSaturatedFat: {
    reason: 'High saturated fat',
    suggestions: ['Switch to lean proteins', 'Use plant-based fats', 'Limit processed foods'],
    swaps: ['Ground beef → Ground turkey', 'Butter → Olive oil', 'Whole milk → Almond milk']
  },
  lowFiber: {
    reason: 'Low fiber content',
    suggestions: ['Add more vegetables', 'Choose whole grains', 'Include legumes'],
    swaps: ['White rice → Brown rice', 'Regular pasta → Whole grain', 'Juice → Whole fruit']
  },
  highCalorieDensity: {
    reason: 'Very calorie-dense',
    suggestions: ['Increase volume with vegetables', 'Choose lower-calorie alternatives', 'Control portions'],
    swaps: ['Regular pasta → Zucchini noodles', 'Rice → Cauliflower rice', 'Chips → Air-popped popcorn']
  }
};

export function SmartSwaps({ meal, onSwap, onClose, userPreferences = {} }) {
  const { userProfile } = useApp();
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [swapType, setSwapType] = useState('macro'); // macro | health | preference
  const [loading, setLoading] = useState(false);

  // Analyze current meal for swap opportunities
  const mealAnalysis = useMemo(() => {
    if (!meal) return null;

    const analysis = {
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      ingredients: meal.ingredients || [],
      issues: []
    };

    // Detect potential issues
    if (analysis.calories > 800) analysis.issues.push('highCalorieDensity');
    if (analysis.fat > analysis.calories * 0.4 / 9) analysis.issues.push('highSaturatedFat');
    if (analysis.carbs < 20) analysis.issues.push('lowFiber');

    return analysis;
  }, [meal]);

  // Generate swap suggestions based on type
  const swapSuggestions = useMemo(() => {
    if (!mealAnalysis) return [];

    switch (swapType) {
      case 'macro':
        return generateMacroSwaps(mealAnalysis);
      case 'health':
        return generateHealthSwaps(mealAnalysis);
      case 'preference':
        return generatePreferenceSwaps(mealAnalysis, userPreferences);
      default:
        return [];
    }
  }, [mealAnalysis, swapType, userPreferences]);

  const generateMacroSwaps = (analysis) => {
    const swaps = [];

    // Protein optimization
    if (analysis.protein < analysis.calories * 0.25 / 4) {
      swaps.push({
        type: 'protein',
        reason: 'Increase protein',
        current: `${analysis.protein}g protein`,
        suggestions: SWAP_DATABASE.protein.slice(0, 3),
        impact: 'Better satiety and muscle support',
        color: '#14B8A6'
      });
    }

    // Carb optimization
    if (analysis.carbs > analysis.calories * 0.6 / 4) {
      swaps.push({
        type: 'carbs',
        reason: 'Lower carb alternatives',
        current: `${analysis.carbs}g carbs`,
        suggestions: SWAP_DATABASE.carbs.filter(c => c.carbs < 15).slice(0, 3),
        impact: 'Better blood sugar control',
        color: '#6366F1'
      });
    }

    // Fat balance
    if (analysis.fat < analysis.calories * 0.15 / 9) {
      swaps.push({
        type: 'fats',
        reason: 'Add healthy fats',
        current: `${analysis.fat}g fat`,
        suggestions: SWAP_DATABASE.fats.slice(0, 3),
        impact: 'Better nutrient absorption',
        color: '#F59E0B'
      });
    }

    return swaps;
  };

  const generateHealthSwaps = (analysis) => {
    return analysis.issues.map(issue => ({
      type: 'health',
      reason: HEALTH_IMPROVEMENTS[issue].reason,
      current: `Health concern: ${issue}`,
      suggestions: HEALTH_IMPROVEMENTS[issue].swaps.map(swap => ({ name: swap })),
      impact: HEALTH_IMPROVEMENTS[issue].suggestions.join(', '),
      color: '#EF4444'
    }));
  };

  const generatePreferenceSwaps = (analysis, prefs) => {
    const swaps = [];

    // Dietary restrictions
    if (prefs.vegetarian) {
      swaps.push({
        type: 'preference',
        reason: 'Vegetarian alternatives',
        current: 'Animal products detected',
        suggestions: [
          { name: 'Plant-based protein' },
          { name: 'Tofu/tempeh' },
          { name: 'Legumes' }
        ],
        impact: 'Aligns with vegetarian diet',
        color: '#10b981'
      });
    }

    if (prefs.lowCarb) {
      swaps.push({
        type: 'preference', 
        reason: 'Low-carb friendly',
        current: `${analysis.carbs}g carbs`,
        suggestions: SWAP_DATABASE.carbs.filter(c => c.carbs < 10),
        impact: 'Fits low-carb lifestyle',
        color: '#8B5CF6'
      });
    }

    return swaps;
  };

  const handleApplySwap = async (swap) => {
    setLoading(true);
    
    // Simulate applying the swap
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate new meal macros (simplified)
    const newMeal = {
      ...meal,
      name: `${meal.name} (optimized)`,
      calories: Math.round(meal.calories * (0.9 + Math.random() * 0.2)),
      protein: Math.round(meal.protein * (1 + Math.random() * 0.3)),
      carbs: Math.round(meal.carbs * (0.8 + Math.random() * 0.4)),
      fat: Math.round(meal.fat * (0.9 + Math.random() * 0.2)),
      swapApplied: swap.reason,
      swapType: swap.type
    };

    onSwap(newMeal);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#080d1a]/96 backdrop-blur-xl"
          onClick={onClose}
        />

        {/* Content */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="relative z-10 w-full max-w-lg bg-[#0B0F1A] rounded-t-3xl sm:rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Smart Swaps</h2>
                <p className="text-sm text-slate-400 mt-1">Optimize your meal</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Meal Info */}
            {meal && (
              <div className="mt-4 p-3 rounded-xl bg-white/5">
                <h3 className="text-white font-medium text-sm">{meal.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>{meal.calories} cal</span>
                  <span>{meal.protein}g protein</span>
                  <span>{meal.carbs}g carbs</span>
                  <span>{meal.fat}g fat</span>
                </div>
              </div>
            )}
          </div>

          {/* Swap Type Selector */}
          <div className="px-6 py-4">
            <div className="flex gap-2">
              {[
                { id: 'macro', label: 'Macros', icon: Target },
                { id: 'health', label: 'Health', icon: Zap },
                { id: 'preference', label: 'Dietary', icon: AlertTriangle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSwapType(id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    swapType === id
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Swap Suggestions */}
          <div className="px-6 pb-6 space-y-3 max-h-80 overflow-y-auto">
            {swapSuggestions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={24} className="text-green-400" />
                </div>
                <p className="text-white font-medium">Looking good!</p>
                <p className="text-slate-400 text-sm mt-1">No {swapType} improvements needed</p>
              </motion.div>
            ) : (
              swapSuggestions.map((swap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedSwap === index
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/8'
                  }`}
                  onClick={() => setSelectedSwap(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: swap.color }}
                        />
                        <h4 className="text-white font-medium text-sm">{swap.reason}</h4>
                      </div>
                      <p className="text-slate-400 text-xs mb-2">{swap.current}</p>
                      <p className="text-slate-300 text-xs">{swap.impact}</p>
                    </div>
                    <ArrowRight size={16} className="text-slate-500 mt-1" />
                  </div>

                  {/* Suggestions */}
                  {selectedSwap === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-white/10"
                    >
                      <div className="space-y-2">
                        {swap.suggestions.slice(0, 3).map((suggestion, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                            <div>
                              <p className="text-white text-xs font-medium">{suggestion.name}</p>
                              {suggestion.per && (
                                <p className="text-slate-500 text-2xs">{suggestion.per}</p>
                              )}
                            </div>
                            {suggestion.calories && (
                              <div className="text-xs text-slate-400">
                                {suggestion.calories} cal
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <SecondaryButton
                          onClick={() => setSelectedSwap(null)}
                          className="flex-1 text-xs"
                        >
                          Cancel
                        </SecondaryButton>
                        <PrimaryButton
                          onClick={() => handleApplySwap(swap)}
                          loading={loading}
                          className="flex-1 text-xs"
                        >
                          Apply Swap
                        </PrimaryButton>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}