import React, { useState } from 'react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

/**
 * YouTube Recipe Importer — paste a YouTube URL, AI extracts the recipe
 * Demo mode generates mock extraction
 */
export function YouTubeImporter({ dark = true, onImport, onClose }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const isValidYouTubeUrl = (url) => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url);
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleImport = async () => {
    if (!url.trim()) {
      setError('Please paste a YouTube URL');
      return;
    }
    if (!isValidYouTubeUrl(url)) {
      setError('That doesn\'t look like a YouTube URL');
      return;
    }

    setError('');
    setLoading(true);

    const steps = [
      'Fetching video info...',
      'Extracting transcript...',
      'Analyzing recipe content...',
      'Calculating nutrition...',
      'Formatting recipe...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadStep(i);
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
    }

    // Demo mode: generate a mock recipe based on the URL
    const videoId = extractVideoId(url);
    const demoRecipes = [
      {
        title: 'High-Protein Chicken Stir Fry',
        source: 'YouTube Import',
        videoId,
        calories: 520,
        protein: 45,
        carbs: 38,
        fat: 18,
        servings: 2,
        prepTime: 25,
        ingredients: [
          '2 chicken breasts (12oz total)',
          '2 cups broccoli florets',
          '1 red bell pepper, sliced',
          '2 cloves garlic, minced',
          '1 tbsp sesame oil',
          '2 tbsp soy sauce',
          '1 tbsp honey',
          '1 tsp ginger, grated',
          '1 cup brown rice (cooked)',
          'Sesame seeds for garnish',
        ],
        instructions: [
          'Slice chicken into thin strips, season with salt and pepper',
          'Heat sesame oil in a large wok over high heat',
          'Cook chicken 4-5 min until golden, set aside',
          'Add broccoli and bell pepper, stir fry 3 min',
          'Mix soy sauce, honey, and ginger in a small bowl',
          'Return chicken to wok, pour sauce over',
          'Toss everything together for 2 min',
          'Serve over brown rice, top with sesame seeds',
        ],
      },
      {
        title: 'Mediterranean Salmon Bowl',
        source: 'YouTube Import',
        videoId,
        calories: 580,
        protein: 42,
        carbs: 44,
        fat: 24,
        servings: 1,
        prepTime: 20,
        ingredients: [
          '6oz salmon fillet',
          '1 cup quinoa (cooked)',
          '1/2 cucumber, diced',
          '1/4 cup cherry tomatoes, halved',
          '2 tbsp hummus',
          '1/4 avocado, sliced',
          '1 tbsp olive oil',
          'Juice of 1/2 lemon',
          'Fresh dill',
          'Salt and pepper to taste',
        ],
        instructions: [
          'Season salmon with olive oil, salt, pepper, and lemon',
          'Pan-sear salmon 4 min per side over medium-high heat',
          'Build bowl: quinoa base, arrange veggies around edge',
          'Place salmon on top, add hummus and avocado',
          'Drizzle with olive oil and lemon juice',
          'Garnish with fresh dill',
        ],
      },
      {
        title: 'Protein Banana Pancakes',
        source: 'YouTube Import',
        videoId,
        calories: 420,
        protein: 35,
        carbs: 48,
        fat: 10,
        servings: 2,
        prepTime: 15,
        ingredients: [
          '2 ripe bananas',
          '3 eggs',
          '1 scoop vanilla protein powder',
          '1/4 cup oats',
          '1 tsp cinnamon',
          '1/2 tsp baking powder',
          '1 tsp coconut oil',
          'Berries for topping',
          '1 tbsp maple syrup',
        ],
        instructions: [
          'Mash bananas in a bowl until smooth',
          'Whisk in eggs, protein powder, oats, cinnamon, and baking powder',
          'Heat coconut oil in a non-stick pan over medium heat',
          'Pour 1/4 cup batter for each pancake',
          'Cook 2-3 min per side until golden',
          'Stack pancakes, top with berries and maple syrup',
        ],
      },
    ];

    const recipe = demoRecipes[Math.floor(Math.random() * demoRecipes.length)];
    setResult(recipe);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-[420px] max-h-[85vh] flex flex-col rounded-2xl overflow-hidden ${
        dark ? 'bg-[#0f1629]' : 'bg-white'
      } shadow-2xl`}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-xl">▶️</span>
            <div>
              <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                YouTube Importer
              </h2>
              <p className="text-xs text-slate-500">Paste a cooking video URL</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl p-2">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Input */}
          {!result && !loading && (
            <div>
              <Input
                label="YouTube URL"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                dark={dark}
                className="mb-3"
              />
              {error && (
                <p className="text-red-400 text-xs mb-3">{error}</p>
              )}
              <Button variant="primary" fullWidth size="lg" onClick={handleImport}>
                🔍 Extract Recipe
              </Button>

              <div className={`mt-6 p-4 rounded-xl ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-sm font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                  How it works
                </p>
                <div className="space-y-2">
                  {[
                    { step: '1', text: 'Paste any YouTube cooking video URL' },
                    { step: '2', text: 'AI extracts ingredients and instructions' },
                    { step: '3', text: 'Nutrition is auto-calculated per serving' },
                    { step: '4', text: 'Save to your recipe book or log it' },
                  ].map(s => (
                    <div key={s.step} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {s.step}
                      </span>
                      <span className="text-xs text-slate-400">{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-8">
              <div className="text-center mb-6">
                <span className="text-4xl block mb-3 animate-pulse">🧠</span>
                <p className={`font-bold ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Analyzing video...
                </p>
              </div>
              <div className="space-y-3">
                {[
                  'Fetching video info',
                  'Extracting transcript',
                  'Analyzing recipe content',
                  'Calculating nutrition',
                  'Formatting recipe',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      i < loadStep
                        ? 'bg-emerald-500 text-white'
                        : i === loadStep
                          ? 'border-2 border-emerald-500 animate-pulse'
                          : dark ? 'border border-slate-700' : 'border border-slate-300'
                    }`}>
                      {i < loadStep && '✓'}
                      {i === loadStep && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </div>
                    <span className={`text-sm ${
                      i <= loadStep
                        ? dark ? 'text-white' : 'text-slate-900'
                        : 'text-slate-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div>
              <Card variant="glass" padding="lg" dark={dark} className="mb-4">
                <h3 className={`text-lg font-extrabold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {result.title}
                </h3>
                <div className="flex gap-3 text-xs text-slate-500 mb-4">
                  <span>⏱️ {result.prepTime} min</span>
                  <span>🍽️ {result.servings} servings</span>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Cal', value: result.calories, color: 'text-orange-400' },
                    { label: 'Protein', value: `${result.protein}g`, color: 'text-blue-400' },
                    { label: 'Carbs', value: `${result.carbs}g`, color: 'text-green-400' },
                    { label: 'Fat', value: `${result.fat}g`, color: 'text-yellow-400' },
                  ].map(m => (
                    <div key={m.label} className={`text-center p-2 rounded-lg ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-lg font-black ${m.color}`}>{m.value}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{m.label}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Ingredients */}
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  Ingredients
                </p>
                <div className="space-y-1">
                  {result.ingredients.map((ing, i) => (
                    <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${
                      dark ? 'bg-white/[0.03]' : 'bg-slate-50'
                    }`}>
                      <span className="text-emerald-400 font-bold">·</span>
                      <span className={dark ? 'text-slate-300' : 'text-slate-700'}>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">
                  Instructions
                </p>
                <div className="space-y-2">
                  {result.instructions.map((step, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className={`text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="ghost" size="md" className="flex-1" onClick={() => { setResult(null); setUrl(''); }}>
                  Try Another
                </Button>
                <Button variant="primary" size="md" className="flex-1" onClick={() => {
                  if (onImport) onImport(result);
                  onClose();
                }}>
                  📕 Save Recipe
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
