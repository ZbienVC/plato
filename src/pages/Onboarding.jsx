import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Input } from '../components/atoms/Input';
import { generateMealPlan } from '../services/mealGenerator';

export function Onboarding({ onComplete }) {
  const { dark, setUserProfile, setPlanConfig, setPlan } = useApp();
  const [step, setStep] = useState(0);

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

  const calculateMacros = () => {
    const { weight, activity, goal, gender, age } = form;
    const bmr = gender === 'male'
      ? 10 * (weight * 0.453592) + 6.25 * ((form.heightFeet * 30.48) + (form.heightInches * 2.54)) - 5 * age + 5
      : 10 * (weight * 0.453592) + 6.25 * ((form.heightFeet * 30.48) + (form.heightInches * 2.54)) - 5 * age - 161;
    const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, elite: 1.9 };
    const tdee = Math.round(bmr * (mult[activity] || 1.55));
    const adj = { 'lose-fat': -500, maintain: 0, 'build-muscle': 300, athletic: 200 };
    const calories = Math.round(tdee + (adj[goal] || 0));
    const pRatio = goal === 'build-muscle' ? 0.35 : goal === 'lose-fat' ? 0.4 : 0.3;
    const cRatio = goal === 'build-muscle' ? 0.4 : goal === 'lose-fat' ? 0.3 : 0.4;
    const fRatio = 1 - pRatio - cRatio;
    return {
      calories,
      protein: Math.round((calories * pRatio) / 4),
      carbs: Math.round((calories * cRatio) / 4),
      fat: Math.round((calories * fRatio) / 9),
    };
  };

  const handleGenerate = async () => {
    setStep(4);
    for (let i = 0; i < 5; i++) {
      setGenStep(i);
      await new Promise(r => setTimeout(r, 500));
    }
    const macros = calculateMacros();
    const meals = generateMealPlan(macros.calories, macros, form.mealsPerDay, form);
    const plan = {
      name: form.name || 'My Plan',
      calories: macros.calories, protein: macros.protein,
      carbs: macros.carbs, fat: macros.fat,
      meals, mealsPerDay: form.mealsPerDay,
      createdAt: new Date().toISOString(),
    };
    setUserProfile({
      name: form.name, age: form.age, gender: form.gender,
      height: { feet: form.heightFeet, inches: form.heightInches },
      weight: form.weight, activityLevel: form.activity,
    });
    setPlanConfig({
      goal: form.goal, trainingType: form.trainingType,
      trainingDays: form.trainingDays, dietStyle: form.dietStyle,
      mealsPerDay: form.mealsPerDay, cookTime: form.cookTime,
      cuisines: form.cuisines, restrictions: form.restrictions,
      activity: form.activity,
    });
    setPlan(plan);
    setGeneratedPlan(plan);
    setStep(5);
  };

  // --- REUSABLE COMPONENTS ---

  const Pill = ({ label, selected, onClick }) => (
    <button onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 ${
        selected
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
          : dark
            ? 'bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:border-emerald-500/40'
            : 'bg-slate-100 text-slate-500 border border-slate-200'
      }`}
    >{label}</button>
  );

  const SectionLabel = ({ children }) => (
    <p className={`text-[11px] font-semibold uppercase tracking-[1.5px] mb-3 ${
      dark ? 'text-slate-500' : 'text-slate-400'
    }`}>{children}</p>
  );

  const ActivityOption = ({ label, desc, value }) => (
    <button onClick={() => update('activity', value)}
      className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${
        form.activity === value
          ? 'bg-emerald-500/[0.08] border-emerald-500/60'
          : dark
            ? 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]'
            : 'bg-white border-slate-100 hover:border-slate-200'
      }`}
    >
      <span className={`text-[14px] font-semibold ${
        form.activity === value ? 'text-emerald-400' : dark ? 'text-white' : 'text-slate-900'
      }`}>{label}</span>
      <p className={`text-[12px] mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{desc}</p>
    </button>
  );

  const GoalCard = ({ label, desc, value }) => (
    <button onClick={() => update('goal', value)}
      className={`p-5 rounded-2xl text-left transition-all border-2 ${
        form.goal === value
          ? 'bg-emerald-500/[0.08] border-emerald-500/60'
          : dark
            ? 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]'
            : 'bg-white border-slate-100 hover:border-slate-200'
      }`}
    >
      <span className={`text-[14px] font-bold ${
        form.goal === value ? 'text-emerald-400' : dark ? 'text-white' : 'text-slate-900'
      }`}>{label}</span>
      <p className={`text-[11px] mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{desc}</p>
    </button>
  );

  return (
    <div className={`min-h-screen ${dark ? 'bg-[#080d1a]' : 'bg-[#f8f9fb]'} relative overflow-hidden`}
      style={{ maxWidth: '430px', margin: '0 auto' }}
    >
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[120px] opacity-[0.06] pointer-events-none bg-emerald-500"
        style={{ transform: 'translate(40%, -40%)' }}
      />

      {/* Progress bar */}
      {step >= 1 && step <= 3 && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-10 px-8 pt-6"
          style={{ maxWidth: '430px' }}
        >
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                s <= step
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  : dark ? 'bg-white/[0.06]' : 'bg-slate-200'
              }`} />
            ))}
          </div>
        </div>
      )}

      <div className="relative z-[1] flex flex-col min-h-screen px-7">

        {/* === WELCOME === */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            {/* Logo mark */}
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${
              dark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white border border-slate-200 shadow-sm'
            }`}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
              PLATO
            </h1>
            <p className="text-emerald-400 text-[15px] font-semibold mb-3">
              Your AI nutrition companion
            </p>
            <p className={`text-[14px] leading-relaxed mb-12 max-w-[280px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Personalized meal plans, smart logging, and data-driven nutrition — all in your pocket.
            </p>
            <button onClick={() => setStep(1)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[16px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform"
            >
              Get Started
            </button>
          </div>
        )}

        {/* === STEP 1: ABOUT YOU === */}
        {step === 1 && (
          <div className="flex-1 pt-16 pb-8 animate-fadeIn">
            <h2 className={`text-[26px] font-extrabold tracking-tight mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
              About you
            </h2>
            <p className={`text-[14px] mb-8 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              This helps us build your perfect plan.
            </p>

            {/* Personal Info Card */}
            <div className={`p-5 rounded-2xl border mb-5 ${
              dark ? 'bg-white/[0.015] border-white/[0.06]' : 'bg-white border-slate-100'
            }`}>
              <div className="space-y-5">
                <div>
                  <SectionLabel>Name</SectionLabel>
                  <input
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none transition-all border ${
                      dark
                        ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-slate-600 focus:border-emerald-500/50'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SectionLabel>Age</SectionLabel>
                    <input type="number" value={form.age}
                      onChange={(e) => update('age', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border ${
                        dark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-emerald-500/50'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  <div>
                    <SectionLabel>Gender</SectionLabel>
                    <div className="flex gap-2 h-[50px] items-center">
                      {['Male', 'Female'].map(g => (
                        <Pill key={g} label={g} selected={form.gender === g.toLowerCase()} onClick={() => update('gender', g.toLowerCase())} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SectionLabel>Height (ft)</SectionLabel>
                    <input type="number" value={form.heightFeet}
                      onChange={(e) => update('heightFeet', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border ${
                        dark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-emerald-500/50'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                  <div>
                    <SectionLabel>Height (in)</SectionLabel>
                    <input type="number" value={form.heightInches}
                      onChange={(e) => update('heightInches', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border ${
                        dark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-emerald-500/50'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <SectionLabel>Weight (lbs)</SectionLabel>
                  <input type="number" value={form.weight} placeholder="180"
                    onChange={(e) => update('weight', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border ${
                      dark ? 'bg-white/[0.04] border-white/[0.08] text-white focus:border-emerald-500/50'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Activity Level Card */}
            <div className={`p-5 rounded-2xl border ${
              dark ? 'bg-white/[0.015] border-white/[0.06]' : 'bg-white border-slate-100'
            }`}>
              <SectionLabel>Activity Level</SectionLabel>
              <div className="space-y-2.5">
                <ActivityOption label="Sedentary" desc="Desk job, minimal exercise" value="sedentary" />
                <ActivityOption label="Lightly Active" desc="Light exercise 1–3 days/week" value="light" />
                <ActivityOption label="Moderately Active" desc="Exercise 3–5 days/week" value="moderate" />
                <ActivityOption label="Very Active" desc="Hard exercise 6–7 days/week" value="very" />
                <ActivityOption label="Elite Athlete" desc="Intense training, physical job" value="elite" />
              </div>
            </div>

            <div className="mt-8">
              <button onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[15px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform"
              >Continue</button>
            </div>
          </div>
        )}

        {/* === STEP 2: GOALS === */}
        {step === 2 && (
          <div className="flex-1 pt-16 pb-8 animate-fadeIn">
            <h2 className={`text-[26px] font-extrabold tracking-tight mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Your goal
            </h2>
            <p className={`text-[14px] mb-8 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              We'll optimize your plan around this.
            </p>

            {/* Goal selection */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <GoalCard label="Lose Fat" desc="Caloric deficit for fat loss" value="lose-fat" />
              <GoalCard label="Maintain" desc="Stay at current weight" value="maintain" />
              <GoalCard label="Build Muscle" desc="Caloric surplus for growth" value="build-muscle" />
              <GoalCard label="Athletic" desc="Performance focused" value="athletic" />
            </div>

            {/* Training card */}
            <div className={`p-5 rounded-2xl border mb-5 ${
              dark ? 'bg-white/[0.015] border-white/[0.06]' : 'bg-white border-slate-100'
            }`}>
              <div className="space-y-5">
                <div>
                  <SectionLabel>Training Style</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {['Strength', 'Cardio', 'Hybrid', 'Sport'].map(t => (
                      <Pill key={t} label={t} selected={form.trainingType === t.toLowerCase()} onClick={() => update('trainingType', t.toLowerCase())} />
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel>Days Per Week</SectionLabel>
                  <div className="flex items-center gap-5">
                    <button onClick={() => update('trainingDays', Math.max(0, form.trainingDays - 1))}
                      className={`w-12 h-12 rounded-xl font-bold text-lg flex items-center justify-center ${
                        dark ? 'bg-white/[0.06] text-white' : 'bg-slate-100 text-slate-900'
                      }`}>-</button>
                    <span className={`text-3xl font-black tabular-nums w-8 text-center ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {form.trainingDays}
                    </span>
                    <button onClick={() => update('trainingDays', Math.min(7, form.trainingDays + 1))}
                      className={`w-12 h-12 rounded-xl font-bold text-lg flex items-center justify-center ${
                        dark ? 'bg-white/[0.06] text-white' : 'bg-slate-100 text-slate-900'
                      }`}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Diet style card */}
            <div className={`p-5 rounded-2xl border ${
              dark ? 'bg-white/[0.015] border-white/[0.06]' : 'bg-white border-slate-100'
            }`}>
              <SectionLabel>Diet Style</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {[
                  { l: 'High Protein', v: 'high-protein' },
                  { l: 'Balanced', v: 'balanced' },
                  { l: 'Low Carb', v: 'low-carb' },
                  { l: 'Keto', v: 'keto' },
                  { l: 'Plant-Based', v: 'plant-based' },
                ].map(d => (
                  <Pill key={d.v} label={d.l} selected={form.dietStyle === d.v} onClick={() => update('dietStyle', d.v)} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)}
                className={`flex-1 py-4 rounded-2xl font-semibold text-[15px] border ${
                  dark ? 'border-white/[0.08] text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>Back</button>
              <button onClick={() => setStep(3)}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[15px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform"
              >Continue</button>
            </div>
          </div>
        )}

        {/* === STEP 3: MEALS === */}
        {step === 3 && (
          <div className="flex-1 pt-16 pb-8 animate-fadeIn">
            <h2 className={`text-[26px] font-extrabold tracking-tight mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Meal preferences
            </h2>
            <p className={`text-[14px] mb-8 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Last step — tell us how you like to eat.
            </p>

            {/* Meal preferences card */}
            <div className={`p-5 rounded-2xl border mb-5 ${
              dark ? 'bg-white/[0.015] border-white/[0.06]' : 'bg-white border-slate-100'
            }`}>
              <div className="space-y-5">
                <div>
                  <SectionLabel>Meals Per Day</SectionLabel>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map(n => (
                      <Pill key={n} label={`${n}`} selected={form.mealsPerDay === n} onClick={() => update('mealsPerDay', n)} />
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel>Cook Time</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { l: 'Quick (<15 min)', v: 'quick' },
                      { l: 'Moderate (~30 min)', v: 'moderate' },
                      { l: 'Any time', v: 'any' },
                    ].map(t => (
                      <Pill key={t.v} label={t.l} selected={form.cookTime === t.v} onClick={() => update('cookTime', t.v)} />
                    ))}
                  </div>
                </div>

                <div>
                  <SectionLabel>Cuisines You Enjoy</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian'].map(c => (
                      <Pill key={c} label={c} selected={form.cuisines.includes(c.toLowerCase())} onClick={() => toggleCuisine(c.toLowerCase())} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Restrictions card */}
            <div className={`p-5 rounded-2xl border ${
              dark ? 'bg-white/[0.015] border-white/[0.06]' : 'bg-white border-slate-100'
            }`}>
              <SectionLabel>Allergies or Restrictions</SectionLabel>
              <input placeholder="e.g., nuts, shellfish, dairy"
                value={form.restrictions}
                onChange={(e) => update('restrictions', e.target.value)}
                className={`w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border ${
                  dark ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-slate-600 focus:border-emerald-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(2)}
                className={`flex-1 py-4 rounded-2xl font-semibold text-[15px] border ${
                  dark ? 'border-white/[0.08] text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>Back</button>
              <button onClick={handleGenerate}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[15px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform"
              >Build My Plan</button>
            </div>
          </div>
        )}

        {/* === GENERATING === */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${
              dark ? 'bg-white/[0.04]' : 'bg-slate-100'
            }`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5" className="animate-pulse">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className={`text-xl font-bold mb-8 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Building your plan
            </h2>
            <div className="w-full max-w-[260px] space-y-4">
              {['Analyzing your goals', 'Calculating macros', 'Selecting recipes', 'Optimizing nutrition', 'Finalizing plan'].map((label, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    i < genStep
                      ? 'bg-emerald-500 text-white'
                      : i === genStep
                        ? 'border-2 border-emerald-500'
                        : dark ? 'border border-white/[0.08]' : 'border border-slate-200'
                  }`}>
                    {i < genStep && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {i === genStep && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                  </div>
                  <span className={`text-[14px] ${
                    i <= genStep ? (dark ? 'text-white' : 'text-slate-900') : (dark ? 'text-slate-600' : 'text-slate-300')
                  }`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === PLAN READY === */}
        {step === 5 && generatedPlan && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              dark ? 'bg-emerald-500/10' : 'bg-emerald-50'
            }`}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className={`text-[26px] font-extrabold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Your plan is ready
            </h2>
            <p className={`text-[14px] mb-8 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              Optimized for {form.goal.replace('-', ' ')}
            </p>

            <div className={`w-full rounded-2xl p-6 mb-8 border ${
              dark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-slate-200'
            }`}>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Calories', value: generatedPlan.calories, color: 'text-emerald-400' },
                  { label: 'Protein', value: `${generatedPlan.protein}g`, color: 'text-blue-400' },
                  { label: 'Carbs', value: `${generatedPlan.carbs}g`, color: 'text-amber-400' },
                  { label: 'Fat', value: `${generatedPlan.fat}g`, color: 'text-purple-400' },
                ].map(m => (
                  <div key={m.label}>
                    <p className={`text-[22px] font-black ${m.color}`}>{m.value}</p>
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{m.label}</p>
                  </div>
                ))}
              </div>
              <div className={`mt-4 pt-4 border-t text-center ${dark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <p className={`text-[13px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {generatedPlan.meals.length} meals across 7 days
                </p>
              </div>
            </div>

            <button onClick={onComplete}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[16px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-transform"
            >Start Tracking</button>
          </div>
        )}

        {/* Skip link */}
        {step >= 1 && step <= 3 && (
          <button onClick={onComplete}
            className={`self-center mb-8 text-[13px] font-medium ${dark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
          >Skip for now</button>
        )}
      </div>
    </div>
  );
}
