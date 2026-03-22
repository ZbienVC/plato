import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Button, PrimaryButton, SecondaryButton } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { RestaurantItem } from '../molecules/RestaurantItem';
import { RESTAURANTS } from '../../utils/constants';
import { RESTAURANT_MENUS } from '../../services/restaurantData';
import { 
  Search, Star, Heart, MapPin, Clock, Filter, 
  TrendingUp, Award, Zap, Target, ChevronLeft, 
  Plus, Check, Bookmark
} from 'lucide-react';

/**
 * Enhanced Restaurant browsing experience
 * Features:
 * - Favorites system
 * - Smart recommendations based on macros
 * - Location-based suggestions (mock)
 * - Advanced filtering and sorting
 * - Meal combination suggestions
 */

const MOCK_USER_LOCATION = { lat: 40.7589, lng: -73.9851 }; // NYC

const ENHANCED_RESTAURANTS = RESTAURANTS.map(restaurant => ({
  ...restaurant,
  rating: 4.0 + Math.random() * 1,
  distance: Math.round((Math.random() * 5 + 0.1) * 10) / 10,
  deliveryTime: Math.round(15 + Math.random() * 25),
  popular: Math.random() > 0.6,
  macroFriendly: Math.random() > 0.4,
  specialties: getRestaurantSpecialties(restaurant.id)
}));

function getRestaurantSpecialties(restaurantId) {
  const specialties = {
    chipotle: ['High Protein', 'Customizable', 'Fresh'],
    mcdonalds: ['Quick Service', '24/7', 'Breakfast'],
    subway: ['Low Cal Options', 'Fresh Veggies', 'Protein Bowls'],
    chickfila: ['High Protein', 'Quality Chicken', 'Healthy Sides'],
    panera: ['Fresh Bread', 'Salads', 'Clean Eating'],
    taco_bell: ['Vegetarian Options', 'Fresco Style', 'Quick']
  };
  return specialties[restaurantId] || ['Fresh Food', 'Good Value'];
}

const FILTER_PRESETS = [
  { id: 'nearby', label: 'Nearby', icon: MapPin, color: '#14B8A6' },
  { id: 'protein', label: 'High Protein', icon: Zap, color: '#F59E0B' },
  { id: 'lowcal', label: 'Low Cal', icon: Target, color: '#EF4444' },
  { id: 'popular', label: 'Popular', icon: TrendingUp, color: '#8B5CF6' },
  { id: 'macro', label: 'Macro Friendly', icon: Award, color: '#22C55E' }
];

const MEAL_COMBINATIONS = [
  {
    name: 'Balanced Builder',
    description: 'Protein + Carbs + Healthy Fat',
    targetMacros: { protein: 30, carbs: 40, fat: 15 },
    suggestions: ['Chicken + Rice + Avocado', 'Salmon + Sweet Potato + Nuts']
  },
  {
    name: 'Lean & Clean',
    description: 'High protein, low fat',
    targetMacros: { protein: 35, carbs: 30, fat: 8 },
    suggestions: ['Grilled Chicken + Salad', 'Turkey + Veggies']
  },
  {
    name: 'Cutting Phase',
    description: 'Low calorie, high satiety',
    targetMacros: { protein: 25, carbs: 20, fat: 6 },
    suggestions: ['Protein Bowl + Extra Veggies', 'Grilled Option + Side Salad']
  }
];

export function RestaurantBrowserEnhanced({ onLog, onClose, dark = true }) {
  const { userProfile, dailyLog } = useApp();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('nearby');
  const [favorites, setFavorites] = useState(new Set());
  const [view, setView] = useState('restaurants'); // restaurants | menu | combinations
  const [selectedItems, setSelectedItems] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Calculate remaining macros for smart recommendations
  const remainingMacros = useMemo(() => {
    const targets = userProfile.macroTargets || { calories: 2000, protein: 150, carbs: 200, fat: 65 };
    const consumed = dailyLog?.totalMacros || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return {
      calories: Math.max(0, targets.calories - consumed.calories),
      protein: Math.max(0, targets.protein - consumed.protein),
      carbs: Math.max(0, targets.carbs - consumed.carbs),
      fat: Math.max(0, targets.fat - consumed.fat)
    };
  }, [userProfile, dailyLog]);

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    let filtered = ENHANCED_RESTAURANTS.filter(restaurant => {
      if (search && !restaurant.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (showOnlyFavorites && !favorites.has(restaurant.id)) {
        return false;
      }
      return true;
    });

    // Apply active filter
    switch (activeFilter) {
      case 'nearby':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'protein':
        filtered = filtered.filter(r => r.macroFriendly || r.specialties.includes('High Protein'));
        break;
      case 'lowcal':
        filtered = filtered.filter(r => r.specialties.includes('Low Cal Options') || r.id === 'subway');
        break;
      case 'popular':
        filtered = filtered.filter(r => r.popular).sort((a, b) => b.rating - a.rating);
        break;
      case 'macro':
        filtered = filtered.filter(r => r.macroFriendly);
        break;
    }

    return filtered;
  }, [search, activeFilter, favorites, showOnlyFavorites]);

  // Get menu items for selected restaurant
  const menuItems = useMemo(() => {
    if (!selectedRestaurant) return [];
    const items = RESTAURANT_MENUS[selectedRestaurant.id] || [];
    
    // Add recommendation scores based on remaining macros
    return items.map(item => ({
      ...item,
      recommendationScore: calculateRecommendationScore(item, remainingMacros),
      macroFit: calculateMacroFit(item, remainingMacros)
    })).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }, [selectedRestaurant, remainingMacros]);

  const calculateRecommendationScore = (item, remaining) => {
    let score = 0;
    
    // Protein efficiency
    if (item.protein > 0) score += (item.protein / item.calories) * 100;
    
    // Fits remaining macros
    if (item.calories <= remaining.calories) score += 20;
    if (item.protein <= remaining.protein) score += 15;
    if (item.carbs <= remaining.carbs) score += 10;
    if (item.fat <= remaining.fat) score += 10;
    
    // Bonus for balanced macros
    const proteinRatio = (item.protein * 4) / item.calories;
    const carbRatio = (item.carbs * 4) / item.calories;
    const fatRatio = (item.fat * 9) / item.calories;
    
    if (proteinRatio >= 0.2 && proteinRatio <= 0.4) score += 15;
    if (carbRatio >= 0.3 && carbRatio <= 0.6) score += 10;
    if (fatRatio >= 0.15 && fatRatio <= 0.35) score += 10;
    
    return Math.round(score);
  };

  const calculateMacroFit = (item, remaining) => {
    if (item.calories > remaining.calories) return 'over';
    if (item.protein > remaining.protein * 0.8) return 'perfect';
    if (item.protein > remaining.protein * 0.5) return 'good';
    return 'light';
  };

  const toggleFavorite = (restaurantId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(restaurantId)) {
      newFavorites.delete(restaurantId);
    } else {
      newFavorites.add(restaurantId);
    }
    setFavorites(newFavorites);
  };

  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setView('menu');
  };

  const handleAddItem = (item) => {
    setSelectedItems(prev => [...prev, item]);
  };

  const handleLogCombination = () => {
    if (selectedItems.length === 0) return;

    const combinedMeal = {
      name: `${selectedRestaurant.name} Combination`,
      type: 'restaurant',
      restaurant: selectedRestaurant.name,
      items: selectedItems.map(item => item.name),
      calories: selectedItems.reduce((sum, item) => sum + item.calories, 0),
      protein: selectedItems.reduce((sum, item) => sum + item.protein, 0),
      carbs: selectedItems.reduce((sum, item) => sum + item.carbs, 0),
      fat: selectedItems.reduce((sum, item) => sum + item.fat, 0),
      loggedAt: new Date().toISOString()
    };

    onLog(combinedMeal);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
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
          className="relative z-10 w-full h-[90vh] max-w-lg bg-[#0B0F1A] rounded-t-3xl sm:rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              {view !== 'restaurants' ? (
                <button
                  onClick={() => {
                    if (view === 'menu') {
                      setView('restaurants');
                      setSelectedRestaurant(null);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                >
                  <ChevronLeft size={16} />
                </button>
              ) : (
                <div />
              )}

              <div className="text-center">
                <h2 className="text-lg font-bold text-white">
                  {view === 'restaurants' ? 'Restaurants' : 
                   view === 'menu' ? selectedRestaurant?.name : 'Meal Combos'}
                </h2>
                {view === 'restaurants' && (
                  <p className="text-xs text-slate-400">
                    {remainingMacros.calories} cal remaining
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Search and Filters */}
            {view === 'restaurants' && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      variant="search"
                      placeholder="Search restaurants..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <button
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      showOnlyFavorites
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart size={16} fill={showOnlyFavorites ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Filter Presets */}
                <div className="flex gap-2 overflow-x-auto">
                  {FILTER_PRESETS.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        activeFilter === filter.id
                          ? 'text-white border border-white/20'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: activeFilter === filter.id ? `${filter.color}20` : undefined,
                        borderColor: activeFilter === filter.id ? `${filter.color}40` : undefined,
                        color: activeFilter === filter.id ? filter.color : undefined
                      }}
                    >
                      <filter.icon size={12} />
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Items Summary */}
            {view === 'menu' && selectedItems.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">
                      {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{selectedItems.reduce((sum, item) => sum + item.calories, 0)} cal</span>
                      <span>{selectedItems.reduce((sum, item) => sum + item.protein, 0)}g protein</span>
                    </div>
                  </div>
                  <PrimaryButton
                    onClick={handleLogCombination}
                    className="text-xs px-4 py-2"
                  >
                    Log All
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {view === 'restaurants' && (
                <motion.div
                  key="restaurants"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-3"
                >
                  {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No restaurants found</p>
                      <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredRestaurants.map((restaurant, index) => (
                      <motion.div
                        key={restaurant.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleSelectRestaurant(restaurant)}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white font-medium">{restaurant.name}</h3>
                              {restaurant.popular && (
                                <Badge variant="warning" className="text-2xs">Popular</Badge>
                              )}
                              {restaurant.macroFriendly && (
                                <Badge variant="success" className="text-2xs">Macro Friendly</Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                              <div className="flex items-center gap-1">
                                <Star size={10} fill="currentColor" />
                                {restaurant.rating.toFixed(1)}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={10} />
                                {restaurant.distance} mi
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={10} />
                                {restaurant.deliveryTime} min
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {restaurant.specialties.slice(0, 2).map(specialty => (
                                <span
                                  key={specialty}
                                  className="text-2xs text-slate-500 bg-white/5 px-2 py-0.5 rounded"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(restaurant.id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              favorites.has(restaurant.id)
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Heart size={14} fill={favorites.has(restaurant.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {view === 'menu' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-4 space-y-3"
                >
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium text-sm">{item.name}</h4>
                            {item.recommendationScore > 70 && (
                              <Badge variant="success" className="text-2xs">Recommended</Badge>
                            )}
                            {item.macroFit === 'perfect' && (
                              <Badge variant="primary" className="text-2xs">Perfect Fit</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-3 text-xs mb-2">
                            <div className="text-center">
                              <div className="text-white font-semibold">{item.calories}</div>
                              <div className="text-slate-500">Cal</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-semibold">{item.protein}g</div>
                              <div className="text-slate-500">Protein</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-semibold">{item.carbs}g</div>
                              <div className="text-slate-500">Carbs</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-semibold">{item.fat}g</div>
                              <div className="text-slate-500">Fat</div>
                            </div>
                          </div>

                          {item.recommendationScore > 50 && (
                            <div className="text-xs text-slate-400">
                              Recommendation score: {item.recommendationScore}/100
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <SecondaryButton
                            onClick={() => handleAddItem(item)}
                            className="text-xs px-3 py-1.5"
                            icon={<Plus size={12} />}
                          >
                            Add
                          </SecondaryButton>
                          <PrimaryButton
                            onClick={() => onLog(item)}
                            className="text-xs px-3 py-1.5"
                          >
                            Log Now
                          </PrimaryButton>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}