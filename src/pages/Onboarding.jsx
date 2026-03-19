import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Input } from '../components/atoms/Input';
import { generateMealPlan } from '../services/mealGenerator';

/**
 * Onboarding — 3-step flow
 * Step 1: About You (name, age, gender, height, weight, activity)
 * Step 2: Your Goals (goal, training, diet style)
 * Step 3: Your Meals (meals/day, cook time, cuisines, allergies)
 * Then: Plan generation → success → Home
 */
export function Onboarding({ onComplete }) {
  const { dark, setDark, setUserProfile, setPlanConfig, setPlan } = useApp();
  const [step, setStep] = useState(0); // 0=welcome, 1=about, 2=goals, 3=meals, 4=generating, 5=ready

  // Form state
  const [form, setForm] = useState({
    name: '',
    age: 25,
    gender: 'male',
    heightFeet: 5,
    heightInches: 8,
    weight: 180,
    activity: 'moderate',
    goal: 'maintain',
    trainingType: 'strength',
    trainingDays: 4,
    dietStyle: 'high-protein',
    mealsPerDay: 3,
    cookTime: 'moderate',
    cuisines: [],
    restrictions: '',
  });

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [genStep, setGenStep] = useState(0);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleCuisine = (c) => {
    setForm(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(c)
        ? prev.cuisines.filter(x => x !== c)
        : [...prev.cuisines, c],
    }));
  };

  // Calculate macros from profile
  const calculateMacros = () => {
    const { weight, activity, goal, gender, age } = form;
    // Mifflin-St Jeor
    const bmr = gender === 'male'
      ? 10 * (weight * 0.453592) + 6.25 * ((form.heightFeet * 30.48) + (form.heightInches * 2.54)) - 5 * age + 5
      : 10 * (weight * 0.453592) + 6.25 * ((form.heightFeet * 30.48) + (form.heightInches * 2.54)) - 5 * age - 161;

    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, elite: 1.9 };
    const tdee = Math.round(bmr * (activityMultipliers[activity] || 1.55));

    const goalAdjustments = { 'lose-fat': -500, maintain: 0, 'build-muscle': 300, athletic: 200 };
    const calories = Math.round(tdee + (goalAdjustments[goal] || 0));

    const proteinRatio = goal === 'build-muscle' ? 0.35 : goal === 'lose-fat' ? 0.4 : 0.3;
    const carbRatio = goal === 'build-muscle' ? 0.4 : goal === 'lose-fat' ? 0.3 : 0.4;
    const fatRatio = 1 - proteinRatio - carbRatio;

    return {
      calories,
      protein: Math.round((calories * proteinRatio) / 4),
      carbs: Math.round((calories * carbRatio) / 4),
      fat: Math.round((calories * fatRatio) / 9),
    };
  };

  const handleGenerate = async () => {
    setStep(4);

    // Animated generation steps
    const steps = ['Analyzing your goals...', 'Calculating macros...', 'Selecting recipes...', 'Optimizing nutrition...', 'Finalizing plan...'];
    for (let i = 0; i < steps.length; i++) {
      setGenStep(i);
      await new Promise(r => setTimeout(r, 500));
    }

    const macros = calculateMacros();
    const meals = generateMealPlan(macros.calories, macros, form.mealsPerDay, form);

    const plan = {
      name: form.name || 'My Plan',
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      meals,
      mealsPerDay: form.mealsPerDay,
      createdAt: new Date().toISOString(),
    };

    // Save to context
    setUserProfile({
      name: form.name,
      age: form.age,
      gender: form.gender,
      height: { feet: form.heightFeet, inches: form.heightInches },
      weight: form.weight,
      activityLevel: form.activity,
    });

    setPlanConfig({
      goal: form.goal,
      trainingType: form.trainingType,
      trainingDays: form.trainingDays,
      dietStyle: form.dietStyle,
      mealsPerDay: form.mealsPerDay,
      cookTime: form.cookTime,
      cuisines: form.cuisines,
      restrictions: form.restrictions,
      activity: form.activity,
    });

    setPlan(plan);
    setGeneratedPlan(plan);
    setStep(5);
  };

  const handleFinish = () => {
    if (onComplete) onComplete();
  };

  // Pill selector helper
  const Pill = ({ label, selected, onClick }) => (
    <button
      onClick={onClick}
      className={`
        px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95
        ${selected
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
          : dark
            ? 'bg-white/5 text-slate-400 border border-white/10 hover:border-emerald-500/30'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }
      `}
    >
      {label}
    </button>
  );

  // Goal card helper
  const GoalCard = ({ emoji, label, value, selected }) => (
    <button
      onClick={() => update('goal', value)}
      className={`
        p-4 rounded-xl text-center transition-all active:scale-95
        ${selected
          ? 'bg-emerald-500/10 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
          : dark
            ? 'bg-white/5 border-2 border-transparent hover:border-white/10'
            : 'bg-white border-2 border-transparent hover:border-slate-200 shadow-sm'
        }
      `}
    >
      <span className="text-2xl block mb-1">{emoji}</span>
      <span className={`text-xs font-bold ${selected ? 'text-emerald-400' : dark ? 'text-slate-300' : 'text-slate-700'}`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className={`min-h-screen ${dark ? 'app-bg-dark' : 'app-bg-light'} relative overflow-hidden`}>
      {/* Background accent */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 pointer-events-none ${dark ? 'bg-emerald-500' : 'bg-emerald-400'}`}
        style={{ transform: 'translate(30%, -30%)' }}
      />

      {/* Progress bar (steps 1-3) */}
      {step >= 1 && step <= 3 && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s === step
                  ? 'w-8 bg-gradient-to-r from-emerald-400 to-teal-500'
                  : s < step
                    ? 'w-4 bg-emerald-400'
                    : `w-4 ${dark ? 'bg-slate-700' : 'bg-slate-300'}`
              }`}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center min-h-screen px-6 py-20 max-w-[420px] mx-auto">

        {/* === STEP 0: WELCOME === */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="text-6xl mb-6">🍽️</div>
            <h1 className={`text-4xl font-extrabold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
              <span className="gradient-text">PLATO</span>
            </h1>
            <p className={`text-lg mb-2 ${dark ? 'text-emerald-400' : 'text-emerald-600'} font-semibold`}>
              Your AI nutrition companion
            </p>
            <p className={`text-sm mb-12 max-w-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Personalized meal plans, smart logging, and data-driven nutrition — all in your pocket.
            </p>
            <Button variant="primary" size="xl" fullWidth onClick={() => setStep(1)}>
              Get Started →
            </Button>
          </div>
        )}

        {/* === STEP 1: ABOUT YOU === */}
        {step === 1 && (
          <div className="w-full animate-fadeIn pt-8">
            <h2 className={`text-2xl font-extrabold mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Let's get to know you
            </h2>
            <p className={`text-sm mb-8 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              This helps us build your perfect plan.
            </p>

            <div className="space-y-5">
              <Input
                label="What's your name?"
                placeholder="Zach"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                dark={dark}
              />

              <Input
                label="How old are you?"
                type="number"
                placeholder="25"
                value={form.age}
                onChange={(e) => update('age', parseInt(e.target.value) || 0)}
                dark={dark}
              />

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                  Gender
                </p>
                <div className="flex gap-2">
                  {[
                    { label: 'Male', value: 'male' },
                    { label: 'Female', value: 'female' },
                    { label: 'Other', value: 'other' },
                  ].map(g => (
                    <Pill key={g.value} label={g.label} selected={form.gender === g.value} onClick={() => update('gender', g.value)} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Height (ft)"
                  type="number"
                  value={form.heightFeet}
                  onChange={(e) => update('heightFeet', parseInt(e.target.value) || 0)}
                  dark={dark}
                />
                <Input
                  label="Height (in)"
                  type="number"
                  value={form.heightInches}
                  onChange={(e) => update('heightInches', parseInt(e.target.value) || 0)}
                  dark={dark}
                />
              </div>

              <Input
                label="Current weight (lbs)"
                type="number"
                placeholder="180"
                value={form.weight}
                onChange={(e) => update('weight', parseInt(e.target.value) || 0)}
                dark={dark}
              />

              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                  Activity Level
                </p>
                <div className="space-y-2">
                  {[
                    { label: '🪑 Sedentary', value: 'sedentary', desc: 'Desk job, minimal exercise' },
                    { label: '🚶 Lightly Active', value: 'light', desc: 'Light exercise 1-3 days/week' },
                    { label: '🏃 Moderately Active', value: 'moderate', desc: 'Exercise 3-5 days/week' },
                    { label: '💪 Very Active', value: 'very', desc: 'Hard exercise 6-7 days/week' },
                    { label: '🏋️ Elite Athlete', value: 'elite', desc: 'Intense training, physical job' },
                  ].map(a => (
                    <button
                      key={a.value}
                      onClick={() => update('activity', a.value)}
                      className={`
                        w-full p-3 rounded-xl text-left transition-all
                        ${form.activity === a.value
                          ? 'bg-emerald-500/10 border-2 border-emerald-500'
                          : dark
                            ? 'bg-white/5 border-2 border-transparent hover:border-white/10'
                            : 'bg-white border-2 border-transparent hover:border-slate-200'
                        }
                      `}
                    >
                      <span className={`text-sm font-bold ${form.activity === a.value ? 'text-emerald-400' : dark ? 'text-white' : 'text-slate-900'}`}>
                        {a.label}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button variant="primary" size="lg" fullWidth onClick={() => setStep(2)}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* === STEP 2: YOUR GOALS === */}
        {step === 2 && (
          <div className="w-full animate-fadeIn pt-8">
            <h2 className={`text-2xl font-extrabold mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
              What's your primary goal?
            </h2>
            <p className={`text-sm mb-8 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              We'll optimize your plan around this.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <GoalCard emoji="🔥" label="Lose Fat" value="lose-fat" selected={form.goal === 'lose-fat'} />
              <GoalCard emoji="⚖️" label="Maintain" value="maintain" selected={form.goal === 'maintain'} />
              <GoalCard emoji="💪" label="Build Muscle" value="build-muscle" selected={form.goal === 'build-muscle'} />
              <GoalCard emoji="🏃" label="Athletic" value="athletic" selected={form.goal === 'athletic'} />
            </div>

            <div className="mb-6">
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                Training Style
              </p>
              <div className="flex flex-wrap gap-2">
                {['Strength', 'Cardio', 'Hybrid', 'Sport'].map(t => (
                  <Pill key={t} label={t} selected={form.trainingType === t.toLowerCase()} onClick={() => update('trainingType', t.toLowerCase())} />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                Days per week
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => update('trainingDays', Math.max(0, form.trainingDays - 1))}
                  className={`w-10 h-10 rounded-xl font-bold text-lg ${dark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900'}`}
                >−</button>
                <span className={`text-3xl font-black w-8 text-center ${dark ? 'text-white' : 'text-slate-900'}`}>
                  {form.trainingDays}
                </span>
                <button
                  onClick={() => update('trainingDays', Math.min(7, form.trainingDays + 1))}
                  className={`w-10 h-10 rounded-xl font-bold text-lg ${dark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-900'}`}
                >+</button>
              </div>
            </div>

            <div className="mb-6">
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                Diet Style
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'High Protein', value: 'high-protein' },
                  { label: 'Balanced', value: 'balanced' },
                  { label: 'Low Carb', value: 'low-carb' },
                  { label: 'Keto', value: 'keto' },
                  { label: 'Plant-Based', value: 'plant-based' },
                  { label: 'Custom', value: 'custom' },
                ].map(d => (
                  <Pill key={d.value} label={d.label} selected={form.dietStyle === d.value} onClick={() => update('dietStyle', d.value)} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(3)}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* === STEP 3: YOUR MEALS === */}
        {step === 3 && (
          <div className="w-full animate-fadeIn pt-8">
            <h2 className={`text-2xl font-extrabold mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Almost there!
            </h2>
            <p className={`text-sm mb-8 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tell us about your eating preferences.
            </p>

            <div className="mb-6">
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                Meals per day
              </p>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map(n => (
                  <Pill key={n} label={`${n}`} selected={form.mealsPerDay === n} onClick={() => update('mealsPerDay', n)} />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                Cooking time
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '⚡ Quick (<15min)', value: 'quick' },
                  { label: '🍳 Moderate (30min)', value: 'moderate' },
                  { label: '👨‍🍳 Any time', value: 'any' },
                ].map(t => (
                  <Pill key={t.value} label={t.label} selected={form.cookTime === t.value} onClick={() => update('cookTime', t.value)} />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                Cuisines you enjoy
              </p>
              <div className="flex flex-wrap gap-2">
                {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian'].map(c => (
                  <Pill key={c} label={c} selected={form.cuisines.includes(c.toLowerCase())} onClick={() => toggleCuisine(c.toLowerCase())} />
                ))}
              </div>
            </div>

            <Input
              label="Any allergies or restrictions?"
              placeholder="e.g., nuts, shellfish, dairy"
              value={form.restrictions}
              onChange={(e) => update('restrictions', e.target.value)}
              dark={dark}
              className="mb-6"
            />

            <div className="flex gap-3 mt-4">
              <Button variant="ghost" size="lg" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={handleGenerate}>
                Build My Plan 🚀
              </Button>
            </div>
          </div>
        )}

        {/* === STEP 4: GENERATING === */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="text-5xl mb-6">🧠</div>
            <h2 className={`text-xl font-bold mb-8 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Building your plan...
            </h2>
            <div className="w-full max-w-xs space-y-3">
              {[
                'Analyzing your goals',
                'Calculating macros',
                'Selecting recipes',
                'Optimizing nutrition',
                'Finalizing plan',
              ].map((label, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    i < genStep
                      ? 'bg-emerald-500 text-white'
                      : i === genStep
                        ? 'border-2 border-emerald-500 animate-pulse'
                        : dark ? 'border border-slate-700' : 'border border-slate-300'
                  }`}>
                    {i < genStep && '✓'}
                    {i === genStep && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                  </div>
                  <span className={`text-sm ${
                    i <= genStep
                      ? dark ? 'text-white' : 'text-slate-900'
                      : dark ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === STEP 5: PLAN READY === */}
        {step === 5 && generatedPlan && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className={`text-2xl font-extrabold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Your plan is ready!
            </h2>

            <Card variant="glass" padding="lg" dark={dark} className="w-full my-6">
              <div className="grid grid-cols-4 gap-2 text-center mb-4">
                <div>
                  <p className="text-2xl font-black text-emerald-400">{generatedPlan.calories}</p>
                  <p className="text-[10px] text-slate-500">cal/day</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-blue-400">{generatedPlan.protein}g</p>
                  <p className="text-[10px] text-slate-500">protein</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-400">{generatedPlan.carbs}g</p>
                  <p className="text-[10px] text-slate-500">carbs</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-purple-400">{generatedPlan.fat}g</p>
                  <p className="text-[10px] text-slate-500">fat</p>
                </div>
              </div>
              <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                {generatedPlan.meals.length} meals across 7 days
              </p>
              <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-500'} mt-1`}>
                Optimized for {form.goal.replace('-', ' ')}
              </p>
            </Card>

            <Button variant="primary" size="xl" fullWidth onClick={handleFinish}>
              Start Tracking →
            </Button>
          </div>
        )}

        {/* Skip button (steps 0-3) */}
        {step <= 3 && step > 0 && (
          <button
            onClick={handleFinish}
            className={`mt-4 px-4 py-2 text-sm font-medium ${dark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'} transition-all rounded-lg`}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
