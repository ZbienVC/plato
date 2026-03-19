import { MEAL_DISTRIBUTIONS } from '../utils/constants';
import { parseRestrictions, isMealAllowed } from '../utils/macroCalculator';

export const MEAL_DATABASE = [
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

export const generateMealPlan = (targetCalories, macros, mealsPerDay, form) => {
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

export { MEAL_DATABASE, generateMealPlan };
