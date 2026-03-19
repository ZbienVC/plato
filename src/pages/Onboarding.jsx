import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateMealPlan } from '../services/mealGenerator';

export function Onboarding({ onComplete }) {
  const { dark, setUserProfile, setPlanConfig, setPlan } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', age: 25, gender: 'male', heightFeet: 5, heightInches: 8,
    weight: 180, activity: 'moderate', goal: 'maintain', trainingType: 'strength',
    trainingDays: 4, dietStyle: 'high-protein', mealsPerDay: 3,
    cookTime: 'moderate', cuisines: [], restrictions: '',
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [genStep, setGenStep] = useState(0);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleCuisine = (c) => setForm(p => ({
    ...p, cuisines: p.cuisines.includes(c) ? p.cuisines.filter(x => x !== c) : [...p.cuisines, c],
  }));

  const calculateMacros = () => {
    const { weight, activity, goal, gender, age } = form;
    const bmr = gender === 'male'
      ? 10 * (weight * 0.453592) + 6.25 * ((form.heightFeet * 30.48) + (form.heightInches * 2.54)) - 5 * age + 5
      : 10 * (weight * 0.453592) + 6.25 * ((form.heightFeet * 30.48) + (form.heightInches * 2.54)) - 5 * age - 161;
    const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, elite: 1.9 };
    const tdee = Math.round(bmr * (mult[activity] || 1.55));
    const adj = { 'lose-fat': -500, maintain: 0, 'build-muscle': 300, athletic: 200 };
    const cal = Math.round(tdee + (adj[goal] || 0));
    const pR = goal === 'build-muscle' ? 0.35 : goal === 'lose-fat' ? 0.4 : 0.3;
    const cR = goal === 'build-muscle' ? 0.4 : goal === 'lose-fat' ? 0.3 : 0.4;
    return { calories: cal, protein: Math.round((cal * pR) / 4), carbs: Math.round((cal * cR) / 4), fat: Math.round((cal * (1 - pR - cR)) / 9) };
  };

  const handleGenerate = async () => {
    setStep(4);
    for (let i = 0; i < 5; i++) { setGenStep(i); await new Promise(r => setTimeout(r, 500)); }
    const macros = calculateMacros();
    const meals = generateMealPlan(macros.calories, macros, form.mealsPerDay, form);
    const plan = { ...macros, name: form.name || 'My Plan', meals, mealsPerDay: form.mealsPerDay, createdAt: new Date().toISOString() };
    setUserProfile({ name: form.name, age: form.age, gender: form.gender, height: { feet: form.heightFeet, inches: form.heightInches }, weight: form.weight, activityLevel: form.activity });
    setPlanConfig({ goal: form.goal, trainingType: form.trainingType, trainingDays: form.trainingDays, dietStyle: form.dietStyle, mealsPerDay: form.mealsPerDay, cookTime: form.cookTime, cuisines: form.cuisines, restrictions: form.restrictions, activity: form.activity });
    setPlan(plan); setGeneratedPlan(plan); setStep(5);
  };

  // --- Shared components ---
  const Pill = ({ label, selected, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all press ${
      selected
        ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-glow-emerald'
        : 'glass-card text-slate-400 hover:text-white'
    }`}>{label}</button>
  );

  const Label = ({ children }) => (
    <p className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-2.5 text-slate-500">{children}</p>
  );

  const Field = ({ value, onChange, placeholder, type = 'text' }) => (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-4 py-3.5 rounded-xl text-[15px] outline-none border bg-white/[0.03] border-white/[0.08] text-white placeholder-slate-600 focus:border-emerald-500/50 transition-colors"
    />
  );

  const Section = ({ children, className = '' }) => (
    <div className={`glass-card rounded-2xl p-5 ${className}`}>{children}</div>
  );

  // --- Animated background ---
  const AnimatedBG = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/[0.07] blur-[100px] animate-float-slow" style={{ top: '-10%', right: '-15%' }} />
      <div className="absolute w-[250px] h-[250px] rounded-full bg-blue-500/[0.05] blur-[100px] animate-float-reverse" style={{ bottom: '10%', left: '-15%' }} />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-purple-500/[0.04] blur-[80px] animate-breathe" style={{ top: '40%', right: '10%' }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050810] relative" style={{ maxWidth: '430px', margin: '0 auto' }}>
      <AnimatedBG />

      {/* Progress bar */}
      {step >= 1 && step <= 3 && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full z-20 px-8 pt-5 pb-3" style={{ maxWidth: '430px', background: 'linear-gradient(to bottom, rgba(5,8,16,0.95), transparent)' }}>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-[3px] rounded-full flex-1 transition-all duration-700 ${
                s <= step ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-white/[0.06]'
              }`} />
            ))}
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">Step {step} of 3</p>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen px-7">

        {/* ===== WELCOME ===== */}
        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            {/* Animated logo */}
            <div className="relative mb-10 animate-fadeInScale">
              <div className="absolute inset-0 w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 blur-xl animate-pulse-soft" />
              <div className="relative w-24 h-24 rounded-3xl glass-card flex items-center justify-center animate-pulse-glow">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10d9a0" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke="url(#logoGrad)" strokeWidth="1.5" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="url(#logoGrad)" strokeWidth="1.5" />
                  <line x1="6" y1="1" x2="6" y2="4" stroke="url(#logoGrad)" strokeWidth="1.5" />
                  <line x1="10" y1="1" x2="10" y2="4" stroke="url(#logoGrad)" strokeWidth="1.5" />
                  <line x1="14" y1="1" x2="14" y2="4" stroke="url(#logoGrad)" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            <div className="animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <h1 className="text-5xl font-black tracking-tight mb-3">
                <span className="gradient-text">PLATO</span>
              </h1>
              <p className="text-[16px] font-semibold text-emerald-400/80 mb-4">
                AI-Powered Nutrition
              </p>
              <p className="text-[14px] leading-[1.7] text-slate-400 max-w-[260px] mx-auto mb-12">
                Personalized meal plans, intelligent logging, and insights that help you reach your goals.
              </p>
            </div>

            <div className="w-full max-w-[280px] animate-fadeInUp" style={{ animationDelay: '400ms' }}>
              <button onClick={() => setStep(1)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400 bg-[length:200%_100%] animate-gradient text-white font-bold text-[15px] shadow-glow-emerald press"
              >Get Started</button>
              <p className="text-[12px] text-slate-600 mt-4">Free · No account required</p>
            </div>
          </div>
        )}

        {/* ===== STEP 1: ABOUT YOU ===== */}
        {step === 1 && (
          <div className="flex-1 pt-20 pb-8 animate-fadeIn stagger">
            <h2 className="text-[28px] font-extrabold tracking-tight mb-1 text-white">About you</h2>
            <p className="text-[14px] text-slate-400 mb-7">We'll use this to calculate your targets.</p>

            <Section className="mb-4">
              <div className="space-y-4">
                <div>
                  <Label>Your name</Label>
                  <Field value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Enter your name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Age</Label>
                    <Field type="number" value={form.age} onChange={(e) => update('age', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <div className="flex gap-2">
                      {['Male', 'Female'].map(g => (
                        <Pill key={g} label={g} selected={form.gender === g.toLowerCase()} onClick={() => update('gender', g.toLowerCase())} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Height (ft)</Label>
                    <Field type="number" value={form.heightFeet} onChange={(e) => update('heightFeet', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Height (in)</Label>
                    <Field type="number" value={form.heightInches} onChange={(e) => update('heightInches', parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Weight</Label>
                    <Field type="number" value={form.weight} onChange={(e) => update('weight', parseInt(e.target.value) || 0)} placeholder="lbs" />
                  </div>
                </div>
              </div>
            </Section>

            <Section>
              <Label>Activity Level</Label>
              <div className="space-y-2">
                {[
                  { v: 'sedentary', l: 'Sedentary', d: 'Desk job, minimal exercise' },
                  { v: 'light', l: 'Lightly Active', d: '1–3 days/week' },
                  { v: 'moderate', l: 'Moderately Active', d: '3–5 days/week' },
                  { v: 'very', l: 'Very Active', d: '6–7 days/week' },
                  { v: 'elite', l: 'Elite', d: 'Intense daily training' },
                ].map(a => (
                  <button key={a.v} onClick={() => update('activity', a.v)}
                    className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between ${
                      form.activity === a.v
                        ? 'bg-emerald-500/10 border border-emerald-500/40'
                        : 'bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08]'
                    }`}>
                    <div>
                      <p className={`text-[14px] font-semibold ${form.activity === a.v ? 'text-emerald-400' : 'text-white'}`}>{a.l}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{a.d}</p>
                    </div>
                    {form.activity === a.v && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 ml-3">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Section>

            <div className="mt-6">
              <button onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[15px] shadow-glow-emerald press"
              >Continue</button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: GOALS ===== */}
        {step === 2 && (
          <div className="flex-1 pt-20 pb-8 animate-fadeIn stagger">
            <h2 className="text-[28px] font-extrabold tracking-tight mb-1 text-white">Your goal</h2>
            <p className="text-[14px] text-slate-400 mb-7">We'll optimize everything around this.</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { v: 'lose-fat', l: 'Lose Fat', d: 'Caloric deficit', icon: '↓' },
                { v: 'maintain', l: 'Maintain', d: 'Stay balanced', icon: '→' },
                { v: 'build-muscle', l: 'Build Muscle', d: 'Caloric surplus', icon: '↑' },
                { v: 'athletic', l: 'Athletic', d: 'Performance', icon: '⚡' },
              ].map(g => (
                <button key={g.v} onClick={() => update('goal', g.v)}
                  className={`p-4 rounded-2xl text-left transition-all press ${
                    form.goal === g.v
                      ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/40 shadow-glow-emerald'
                      : 'glass-card hover:border-white/[0.12]'
                  }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 text-[16px] font-bold ${
                    form.goal === g.v ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.04] text-slate-500'
                  }`}>{g.icon}</div>
                  <p className={`text-[14px] font-bold ${form.goal === g.v ? 'text-emerald-400' : 'text-white'}`}>{g.l}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{g.d}</p>
                </button>
              ))}
            </div>

            <Section className="mb-4">
              <div className="space-y-5">
                <div>
                  <Label>Training Style</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Strength', 'Cardio', 'Hybrid', 'Sport'].map(t => (
                      <Pill key={t} label={t} selected={form.trainingType === t.toLowerCase()} onClick={() => update('trainingType', t.toLowerCase())} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Days Per Week</Label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => update('trainingDays', Math.max(0, form.trainingDays - 1))}
                      className="w-12 h-12 rounded-xl glass-card font-bold text-lg text-white flex items-center justify-center press">−</button>
                    <span className="text-[32px] font-black tabular-nums text-white w-8 text-center">{form.trainingDays}</span>
                    <button onClick={() => update('trainingDays', Math.min(7, form.trainingDays + 1))}
                      className="w-12 h-12 rounded-xl glass-card font-bold text-lg text-white flex items-center justify-center press">+</button>
                  </div>
                </div>
              </div>
            </Section>

            <Section>
              <Label>Diet Style</Label>
              <div className="flex flex-wrap gap-2">
                {['High Protein', 'Balanced', 'Low Carb', 'Keto', 'Plant-Based'].map(d => (
                  <Pill key={d} label={d} selected={form.dietStyle === d.toLowerCase().replace(' ', '-')} onClick={() => update('dietStyle', d.toLowerCase().replace(' ', '-'))} />
                ))}
              </div>
            </Section>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl glass-card text-slate-400 font-semibold text-[15px] press">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[15px] shadow-glow-emerald press">Continue</button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: MEALS ===== */}
        {step === 3 && (
          <div className="flex-1 pt-20 pb-8 animate-fadeIn stagger">
            <h2 className="text-[28px] font-extrabold tracking-tight mb-1 text-white">Meal preferences</h2>
            <p className="text-[14px] text-slate-400 mb-7">Last step — how do you like to eat?</p>

            <Section className="mb-4">
              <div className="space-y-5">
                <div>
                  <Label>Meals Per Day</Label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map(n => (
                      <Pill key={n} label={`${n}`} selected={form.mealsPerDay === n} onClick={() => update('mealsPerDay', n)} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Cook Time</Label>
                  <div className="flex flex-wrap gap-2">
                    {[{ l: 'Quick', v: 'quick' }, { l: 'Moderate', v: 'moderate' }, { l: 'Any', v: 'any' }].map(t => (
                      <Pill key={t.v} label={t.l} selected={form.cookTime === t.v} onClick={() => update('cookTime', t.v)} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Cuisines</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian'].map(c => (
                      <Pill key={c} label={c} selected={form.cuisines.includes(c.toLowerCase())} onClick={() => toggleCuisine(c.toLowerCase())} />
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section>
              <Label>Allergies / Restrictions</Label>
              <Field value={form.restrictions} onChange={(e) => update('restrictions', e.target.value)} placeholder="e.g., nuts, shellfish, dairy" />
            </Section>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl glass-card text-slate-400 font-semibold text-[15px] press">Back</button>
              <button onClick={handleGenerate} className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[15px] shadow-glow-emerald press">Build My Plan</button>
            </div>
          </div>
        )}

        {/* ===== GENERATING ===== */}
        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="relative mb-10">
              <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-blue-500/20 blur-xl animate-pulse-soft" />
              <div className="relative w-20 h-20 rounded-2xl glass-card flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="1.5" className="animate-pulse">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <h2 className="text-[22px] font-bold mb-8 text-white">Building your plan</h2>
            <div className="w-full max-w-[240px] space-y-4">
              {['Analyzing goals', 'Calculating macros', 'Selecting recipes', 'Optimizing nutrition', 'Finalizing'].map((l, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    i < genStep ? 'bg-emerald-500' : i === genStep ? 'border-2 border-emerald-500' : 'border border-white/[0.08]'
                  }`}>
                    {i < genStep && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    {i === genStep && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                  </div>
                  <span className={`text-[13px] ${i <= genStep ? 'text-white' : 'text-slate-600'}`}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== PLAN READY ===== */}
        {step === 5 && generatedPlan && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 animate-fadeInScale">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10d9a0" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 className="text-[28px] font-extrabold mb-2 text-white">Plan ready</h2>
            <p className="text-[14px] text-slate-400 mb-8">
              Optimized for {form.goal.replace('-', ' ')}
            </p>
            <div className="w-full glass-card rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { l: 'Cal', v: generatedPlan.calories, c: 'text-emerald-400' },
                  { l: 'Protein', v: `${generatedPlan.protein}g`, c: 'text-blue-400' },
                  { l: 'Carbs', v: `${generatedPlan.carbs}g`, c: 'text-amber-400' },
                  { l: 'Fat', v: `${generatedPlan.fat}g`, c: 'text-purple-400' },
                ].map(m => (
                  <div key={m.l}>
                    <p className={`text-[20px] font-black ${m.c}`}>{m.v}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mt-1">{m.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/[0.06] text-[13px] text-slate-400">
                {generatedPlan.meals.length} meals · 7 days
              </div>
            </div>
            <div className="w-full max-w-[280px]">
              <button onClick={onComplete}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold text-[15px] shadow-glow-emerald press"
              >Start Tracking</button>
            </div>
          </div>
        )}

        {step >= 1 && step <= 3 && (
          <button onClick={onComplete} className="self-center mb-6 text-[12px] text-slate-600 hover:text-slate-400 transition-colors">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
