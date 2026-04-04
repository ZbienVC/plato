import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImagePlus, Mic, MicOff, Search, Sparkles, Upload, Wand2, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MEAL_DATABASE } from '../services/mealGenerator';
import { FoodImage } from '../components/molecules/FoodImage';
import { FoodSearch } from '../components/organisms/FoodSearch';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

const QUICK_FOODS = [
  // Breakfast
  { name: 'Scrambled Eggs (2)', calories: 180, protein: 12, carbs: 2, fat: 14, type: 'breakfast', category: 'Breakfast' },
  { name: 'Oatmeal (1 cup)', calories: 150, protein: 5, carbs: 27, fat: 3, type: 'breakfast', category: 'Breakfast' },
  { name: 'Greek Yogurt (7oz)', calories: 100, protein: 17, carbs: 6, fat: 0, type: 'breakfast', category: 'Breakfast' },
  { name: 'Whole Wheat Toast (2)', calories: 160, protein: 6, carbs: 30, fat: 2, type: 'breakfast', category: 'Breakfast' },
  { name: 'Avocado Toast', calories: 250, protein: 6, carbs: 26, fat: 14, type: 'breakfast', category: 'Breakfast' },
  // Protein
  { name: 'Chicken Breast (4oz)', calories: 185, protein: 35, carbs: 0, fat: 4, type: 'lunch', category: 'Protein' },
  { name: 'Salmon Fillet (4oz)', calories: 208, protein: 29, carbs: 0, fat: 10, type: 'dinner', category: 'Protein' },
  { name: 'Ground Beef 90/10 (4oz)', calories: 196, protein: 24, carbs: 0, fat: 11, type: 'dinner', category: 'Protein' },
  { name: 'Tuna (1 can)', calories: 130, protein: 30, carbs: 0, fat: 1, type: 'lunch', category: 'Protein' },
  { name: 'Hard Boiled Egg (1)', calories: 78, protein: 6, carbs: 1, fat: 5, type: 'snack', category: 'Protein' },
  // Carbs
  { name: 'Brown Rice (1 cup)', calories: 215, protein: 5, carbs: 45, fat: 2, type: 'lunch', category: 'Carbs' },
  { name: 'Sweet Potato (medium)', calories: 103, protein: 2, carbs: 24, fat: 0, type: 'lunch', category: 'Carbs' },
  { name: 'White Rice (1 cup)', calories: 200, protein: 4, carbs: 44, fat: 0, type: 'lunch', category: 'Carbs' },
  { name: 'Pasta (2oz dry)', calories: 200, protein: 7, carbs: 40, fat: 1, type: 'dinner', category: 'Carbs' },
  { name: 'Banana (medium)', calories: 105, protein: 1, carbs: 27, fat: 0, type: 'snack', category: 'Carbs' },
  // Snacks
  { name: 'Protein Shake', calories: 160, protein: 30, carbs: 8, fat: 3, type: 'snack', category: 'Snacks' },
  { name: 'Almonds (1oz)', calories: 160, protein: 6, carbs: 6, fat: 14, type: 'snack', category: 'Snacks' },
  { name: 'Apple (medium)', calories: 95, protein: 0, carbs: 25, fat: 0, type: 'snack', category: 'Snacks' },
  { name: 'Cottage Cheese (½ cup)', calories: 90, protein: 13, carbs: 4, fat: 2, type: 'snack', category: 'Snacks' },
  { name: 'Peanut Butter (2 tbsp)', calories: 190, protein: 7, carbs: 7, fat: 16, type: 'snack', category: 'Snacks' },
];

const QUICK_CATEGORIES = ['All', 'Breakfast', 'Protein', 'Carbs', 'Snacks'];

function parseMealFromText(text) {
  const raw = (text || '').trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const dbHit = MEAL_DATABASE.find(m => lower.includes(m.name.toLowerCase()));
  if (dbHit) return { ...dbHit };

  let type = 'lunch';
  if (lower.includes('breakfast') || lower.includes('eggs') || lower.includes('oatmeal') || lower.includes('yogurt')) type = 'breakfast';
  else if (lower.includes('dinner') || lower.includes('salmon') || lower.includes('steak')) type = 'dinner';
  else if (lower.includes('snack') || lower.includes('shake') || lower.includes('bar') || lower.includes('banana')) type = 'snack';

  let calories = 420;
  let protein = 28;
  let carbs = 34;
  let fat = 14;

  if (lower.includes('chicken')) { calories += 80; protein += 18; }
  if (lower.includes('rice')) carbs += 18;
  if (lower.includes('salad')) { calories -= 60; fat -= 2; }
  if (lower.includes('burger')) { calories += 220; fat += 14; }
  if (lower.includes('pizza')) { calories += 260; carbs += 24; fat += 10; }
  if (lower.includes('shake')) { protein += 12; calories -= 40; }
  if (lower.includes('eggs')) { protein += 10; fat += 8; }

  return {
    name: raw.charAt(0).toUpperCase() + raw.slice(1),
    calories: Math.max(80, calories),
    protein: Math.max(4, protein),
    carbs: Math.max(0, carbs),
    fat: Math.max(0, fat),
    type,
  };
}

export function LogMeal() {
  const { logMeal, dailyLog, isPremiumActive, openPremiumModal } = useApp();
  const [activeTab, setTab] = useState('manual');
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [logged, setLogged] = useState(null);
  const [quickCategory, setQuickCategory] = useState('All');
  const [quickSearch, setQuickSearch] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoMealName, setPhotoMealName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const premiumUnlocked = isPremiumActive?.() ?? false;
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);

  const recentMeals = dailyLog?.meals?.slice(-4) || [];
  const searchResults = useMemo(() => (
    search.length > 1
      ? MEAL_DATABASE.filter(m => m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
      : []
  ), [search]);

  const handleLog = (meal) => {
    logMeal(meal);
    setLogged(meal.name);
    setTimeout(() => setLogged(null), 2000);
  };

  const handleCustomLog = () => {
    if (!customName) return;
    handleLog({
      name: customName,
      calories: parseInt(customCals) || 0,
      protein: parseInt(customProtein) || 0,
      carbs: parseInt(customCarbs) || 0,
      fat: parseInt(customFat) || 0,
      type: 'lunch',
    });
    setCustomName(''); setCustomCals(''); setCustomProtein(''); setCustomCarbs(''); setCustomFat('');
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsListening(false);
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join(' ');
      setVoiceText(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoice = () => {
    recognitionRef.current?.stop?.();
    setIsListening(false);
  };

  const handleVoiceLog = () => {
    const parsed = parseMealFromText(voiceText);
    if (parsed) handleLog(parsed);
  };

  const handlePhotoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    if (!photoMealName) {
      const base = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setPhotoMealName(base);
    }
  };

  const handlePhotoLog = () => {
    const parsed = parseMealFromText(photoMealName || 'Meal from photo');
    if (parsed) handleLog({ ...parsed, photo: photoPreview });
  };

  const handleTabChange = (nextTab) => {
    if (nextTab === 'voice' && !premiumUnlocked) {
      openPremiumModal();
      return;
    }
    setTab(nextTab);
  };

  const TABS = ['search', 'manual', 'voice', 'scan', 'quick'];

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4 pb-4">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-900">Log a Meal</h1>
        <p className="text-sm text-slate-400 mt-0.5">Search, snap, or describe what you ate.</p>
      </motion.div>

      <motion.div variants={item} className="flex rounded-xl p-1 gap-1" style={{ background: "rgba(99,102,241,0.07)" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all relative ${activeTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
            {t === 'quick' ? 'Quick Add' : t === 'scan' ? 'Photo' : t === 'search' ? 'Search' : t.charAt(0).toUpperCase() + t.slice(1)}
            {t === 'voice' && !premiumUnlocked && (
              <span className="absolute -top-1 -right-1 text-[9px] font-black uppercase tracking-[0.2em] text-amber-600">Lock</span>
            )}
          </button>
        ))}
      </motion.div>

      <AnimatePresence>
        {logged && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="text-sm font-semibold text-green-700">Logged: {logged}</span>
          </motion.div>
        )}
      </AnimatePresence>


      {activeTab === 'search' && (
        <motion.div variants={item} className="space-y-4">
          <div className="app-card p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Search real food database</p>
              <p className="text-xs text-slate-400">Powered by USDA FoodData Central — millions of foods with accurate macros</p>
            </div>
            <FoodSearch
              onSelect={(food) => handleLog({
                name: food.name + (food.brand ? ` (${food.brand})` : ''),
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                source: 'usda',
                type: 'lunch',
              })}
              placeholder="Search food (e.g. chicken breast, Greek yogurt)..."
            />
          </div>

          <div className="app-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Logs</p>
            {recentMeals.length > 0 ? (
              <div className="space-y-2">
                {recentMeals.map((m, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleLog(m)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-green-200 transition-colors">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">{m.protein}P · {m.carbs}C · {m.fat}F</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{m.calories} <span className="text-xs font-normal text-slate-400">cal</span></p>
                      <p className="text-xs text-slate-400">{new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No meals logged today yet</p>
            )}
          </div>
        </motion.div>
      )}
      {activeTab === 'manual' && (
        <motion.div variants={item} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food database..."
              className="w-full pl-10 pr-4 premium-input text-sm" />
          </div>

          {searchResults.length > 0 && (
            <div className="app-card space-y-1 p-3">
              {searchResults.map((m, i) => (
                <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleLog({ name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, type: m.type || 'lunch' })}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.protein}P · {m.carbs}C · {m.fat}F</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{m.calories}</span>
                    <span className="text-xs text-slate-400">cal</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {recentMeals.length > 0 && search.length < 2 && (
            <div className="app-card">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent</p>
              <div className="space-y-2">
                {recentMeals.map((m, i) => (
                  <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => handleLog(m)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                      <p className="text-xs text-slate-400">{new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{m.calories} cal</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="app-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Custom Entry</p>
            <div className="space-y-2">
              <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Food name" className="w-full px-3 py-2.5 premium-input text-sm" />
              <div className="grid grid-cols-4 gap-2">
                {[['Cal', customCals, setCustomCals], ['Pro', customProtein, setCustomProtein], ['Carb', customCarbs, setCustomCarbs], ['Fat', customFat, setCustomFat]].map(([label, val, setter]) => (
                  <div key={label}>
                    <p className="text-xs text-slate-400 text-center mb-1">{label}</p>
                    <input value={val} onChange={e => setter(e.target.value)} type="number" placeholder="0" className="w-full px-2 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-center text-slate-900 outline-none focus:border-green-400" />
                  </div>
                ))}
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleCustomLog} className="w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold mt-1">Add Food</motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'voice' && (
        premiumUnlocked ? (
          <motion.div variants={item} className="space-y-4">
            <div className="app-card flex flex-col items-center py-8 gap-5">
              <motion.button whileTap={{ scale: 0.92 }} onClick={isListening ? stopVoice : startVoice} className={`relative w-24 h-24 rounded-full shadow-xl flex items-center justify-center ${isListening ? 'bg-rose-500 shadow-rose-300/60' : 'bg-green-500 shadow-green-300/60'}`}>
                {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
              </motion.button>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-800">{isListening ? 'Listening...' : 'Tap to dictate your meal'}</p>
                <p className="text-sm text-slate-400 mt-1">Example: grilled chicken with rice and broccoli</p>
              </div>
            </div>

            <div className="app-card space-y-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Sparkles className="w-4 h-4 text-green-500" />
                <p className="text-sm font-semibold">Voice transcript</p>
              </div>
              <textarea value={voiceText} onChange={e => setVoiceText(e.target.value)} rows={4} placeholder="Speak or type your meal here..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              <div className="flex gap-2">
                <button onClick={() => setVoiceText('')} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">Clear</button>
                <button onClick={handleVoiceLog} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold">Log Meal</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={item} className="app-card text-center py-10 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Voice logging is Premium</p>
            <p className="text-xs text-slate-500">Start the 48h trial to unlock AI voice logging + restaurant macros.</p>
            <motion.button whileTap={{ scale: 0.96 }} onClick={openPremiumModal}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              Unlock Premium
              <Sparkles className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )
      )}

      {activeTab === 'scan' && (
        <motion.div variants={item} className="space-y-4">
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoPick} />
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => fileRef.current?.click()} className="app-card flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center"><Camera className="w-6 h-6 text-green-600" /></div>
              <div className="text-center"><p className="text-sm font-semibold text-slate-800">Take Photo</p><p className="text-xs text-slate-400 mt-1">Use camera</p></div>
            </button>
            <button onClick={() => fileRef.current?.click()} className="app-card flex flex-col items-center justify-center py-6 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center"><ImagePlus className="w-6 h-6 text-blue-600" /></div>
              <div className="text-center"><p className="text-sm font-semibold text-slate-800">Upload Image</p><p className="text-xs text-slate-400 mt-1">Choose from gallery</p></div>
            </button>
          </div>

          <div className="app-card space-y-3">
            {photoPreview ? (
              <img src={photoPreview} alt="Meal preview" className="w-full h-48 object-cover rounded-2xl border border-slate-100" />
            ) : (
              <div className="w-full h-48 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center px-6">
                <Upload className="w-7 h-7 text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Add a meal photo</p>
                <p className="text-xs text-slate-400 mt-1">Then name it and log it</p>
              </div>
            )}
            <input value={photoMealName} onChange={e => setPhotoMealName(e.target.value)} placeholder="What is in the photo?" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
            <button onClick={handlePhotoLog} className="w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold flex items-center justify-center gap-2">
              <Wand2 className="w-4 h-4" />
              Log from Photo
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === 'quick' && (
        <motion.div variants={item} className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={quickSearch}
              onChange={e => setQuickSearch(e.target.value)}
              placeholder="Filter foods..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>
          {/* Category tabs */}
          {quickSearch.length < 1 && (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {QUICK_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setQuickCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    quickCategory === cat
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
          {/* Food grid */}
          <div className="app-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {quickSearch.length > 0 ? `Results for "${quickSearch}"` : quickCategory === 'All' ? 'All Foods' : quickCategory}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_FOODS
                .filter(food => {
                  const matchSearch = quickSearch.length < 1 || food.name.toLowerCase().includes(quickSearch.toLowerCase());
                  const matchCat = quickSearch.length > 0 || quickCategory === 'All' || food.category === quickCategory;
                  return matchSearch && matchCat;
                })
                .map((food, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleLog(food)}
                    className="flex items-center gap-3 text-left p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-colors active:bg-green-100"
                  >
                    <FoodImage mealName={food.name} mealType={food.type} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{food.name}</p>
                      <p className="text-xs text-green-600 font-bold mt-0.5">{food.calories} cal</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">{food.protein}P · {food.carbs}C · {food.fat}F</p>
                    </div>
                  </motion.button>
                ))
              }
            </div>
            {QUICK_FOODS.filter(food => {
              const matchSearch = quickSearch.length < 1 || food.name.toLowerCase().includes(quickSearch.toLowerCase());
              const matchCat = quickSearch.length > 0 || quickCategory === 'All' || food.category === quickCategory;
              return matchSearch && matchCat;
            }).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No foods match your search.</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
