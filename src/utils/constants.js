// ========== DESIGN TOKENS ==========
export const COLORS = {
  // Dark mode
  dark: {
    bg: '#080d1a',
    bgGradient: 'radial-gradient(ellipse at top, #0d1b3e 0%, #080d1a 60%)',
    card: '#0f1629',
    cardAlt: '#161e35',
    cardElevated: '#1d2745',
    border: 'rgba(255,255,255,0.06)',
    text: '#f0f4ff',
    textMuted: '#8b9cc8',
    textDim: '#4a5580',
  },
  // Light mode
  light: {
    bg: '#f5f3ee',
    bgGradient: 'radial-gradient(ellipse at top, #e8f5e9 0%, #f5f3ee 60%)',
    card: '#ffffff',
    border: 'rgba(0,0,0,0.06)',
    text: '#1a1a2e',
    textMuted: '#64748b',
    textDim: '#94a3b8',
  },
  // Accents
  accent: '#10d9a0',
  accentDark: '#059669',
  secondary: '#6366f1',
  gradient: 'linear-gradient(135deg, #10d9a0, #6366f1)',
  // Macros
  protein: '#3B82F6',
  carbs: '#F59E0B',
  fat: '#8B5CF6',
  calories: '#10d9a0',
  // Status
  success: '#10d9a0',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const MAX_WIDTH = '420px';

// ========== RESTRICTION SYNONYMS ==========
export const RESTRICTION_SYNONYMS = {
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
  'fish': ['salmon', 'tuna', 'cod', 'tilapia', 'bass', 'trout'],
};

// ========== INGREDIENT CATEGORIES ==========
export const INGREDIENT_CATEGORIES = {
  spices: [
    'salt', 'pepper', 'garlic powder', 'onion powder', 'paprika', 'cumin', 'coriander',
    'oregano', 'basil', 'thyme', 'rosemary', 'parsley', 'cilantro', 'dill', 'sage',
    'bay leaf', 'cinnamon', 'nutmeg', 'ginger', 'turmeric', 'chili powder', 'cayenne',
    'red pepper flakes', 'vanilla extract', 'almond extract', 'black pepper', 'sea salt',
    'kosher salt', 'italian seasoning', 'herbs', 'spices', 'seasoning'
  ],
  sauces: [
    'soy sauce', 'fish sauce', 'worcestershire', 'hot sauce', 'sriracha', 'tabasco',
    'vinegar', 'balsamic', 'rice vinegar', 'apple cider vinegar', 'lemon juice',
    'lime juice', 'mustard', 'dijon', 'ketchup', 'bbq sauce', 'salsa', 'pico de gallo'
  ],
  oils: [
    'oil', 'olive oil', 'coconut oil', 'avocado oil', 'vegetable oil', 'canola oil',
    'sesame oil', 'butter', 'ghee', 'lard', 'cooking spray'
  ],
};

// ========== MEAL DISTRIBUTIONS ==========
export const MEAL_DISTRIBUTIONS = {
  1: [{ type: 'dinner', ratio: 1.0, label: 'Main Meal' }],
  2: [{ type: 'breakfast', ratio: 0.40, label: 'Breakfast' }, { type: 'dinner', ratio: 0.60, label: 'Dinner' }],
  3: [{ type: 'breakfast', ratio: 0.28, label: 'Breakfast' }, { type: 'lunch', ratio: 0.35, label: 'Lunch' }, { type: 'dinner', ratio: 0.37, label: 'Dinner' }],
  4: [{ type: 'breakfast', ratio: 0.22, label: 'Breakfast' }, { type: 'lunch', ratio: 0.28, label: 'Lunch' }, { type: 'dinner', ratio: 0.32, label: 'Dinner' }, { type: 'snack', ratio: 0.18, label: 'Snack' }],
  5: [{ type: 'breakfast', ratio: 0.20, label: 'Breakfast' }, { type: 'snack', ratio: 0.12, label: 'Morning Snack' }, { type: 'lunch', ratio: 0.25, label: 'Lunch' }, { type: 'dinner', ratio: 0.30, label: 'Dinner' }, { type: 'snack', ratio: 0.13, label: 'Evening Snack' }],
  6: [{ type: 'breakfast', ratio: 0.18, label: 'Breakfast' }, { type: 'snack', ratio: 0.11, label: 'Snack 1' }, { type: 'lunch', ratio: 0.22, label: 'Lunch' }, { type: 'snack', ratio: 0.11, label: 'Snack 2' }, { type: 'dinner', ratio: 0.27, label: 'Dinner' }, { type: 'snack', ratio: 0.11, label: 'Snack 3' }],
};

// ========== RESTAURANT LIST ==========
export const RESTAURANTS = [
  { id: 'chipotle', name: 'Chipotle', emoji: '🌯', color: '#A01913' },
  { id: 'mcdonalds', name: "McDonald's", emoji: '🍟', color: '#FFC72C' },
  { id: 'subway', name: 'Subway', emoji: '🥖', color: '#008C15' },
  { id: 'chickfila', name: 'Chick-fil-A', emoji: '🐔', color: '#E51636' },
  { id: 'sweetgreen', name: 'Sweetgreen', emoji: '🥗', color: '#2D5C2E' },
  { id: 'panera', name: 'Panera Bread', emoji: '🍞', color: '#4B7A3E' },
  { id: 'shakeshack', name: 'Shake Shack', emoji: '🍔', color: '#1F1F1F' },
  { id: 'starbucks', name: 'Starbucks', emoji: '☕', color: '#00704A' },
  { id: 'cheesecake', name: 'Cheesecake Factory', emoji: '🧀', color: '#6B3A2A' },
  { id: 'texasroadhouse', name: 'Texas Roadhouse', emoji: '🥩', color: '#C41230' },
];

// ========== NAV TABS ==========
export const NAV_TABS = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'log', label: 'Log', emoji: '➕' },
  { id: 'meals', label: 'Meals', emoji: '🍽️' },
  { id: 'you', label: 'You', emoji: '👤' },
];
