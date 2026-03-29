import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, Scale, Dumbbell, Zap, Flame, BarChart3, ChefHat, Clock, Beef, Leaf, Globe, Ban, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateMealPlan } from '../services/mealGenerator';

const GOAL_OPTIONS = [
  { v: 'lose-fat', l: 'Lose Fat', d: 'Caloric deficit', Icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  { v: 'maintain', l: 'Maintain', d: 'Stay balanced', Icon: Scale, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { v: 'build-muscle', l: 'Build Muscle', d: 'Surplus for growth', Icon: Dumbbell, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { v: 'athletic', l: 'Athletic', d: 'Performance focus', Icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
];

const page = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };
const trans = { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] };

const Chip = ({ label, active, onClick }) => (
  <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
      active ? 'bg-green-500 text-white border-green-500 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-green-300'
    }`}>{label}</motion.button>
);

const Label = ({ children }) => <p className="text-xs font-semibold uppercase tracking-[1.5px] text-slate-400 mb-2">{children}</p>;

const Field = ({ label, ...props }) => (
  <div>
    {label && <Label>{label}</Label>}
    <input {...props}
      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
  </div>
);

export function Onboarding({ onComplete }) {
  const { setUserProfile, setPlanConfig, setPlan, setPlanLoading } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', age: 25, gender: 'male', heightFeet: 5, heightInches: 8,
    weight: 180, activity: 'moderate', goal: 'maintain', trainingType: 'strength',
    trainingDays: 4, dietStyle: 'high-protein', mealsPerDay: 3,
    cookTime: 'moderate', cuisines: [], restrictions: '',
  });
  const [genPlan, setGenPlan] = useState(null);
  const [genStep, setGenStep] = useState(0);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const togCuisine = c => set('cuisines', form.cuisines.includes(c) ? form.cuisines.filter(x => x !== c) : [...form.cuisines, c]);

  const calcMacros = () => {
    const { weight, activity, goal, gender, age } = form;
    const h = form.heightFeet * 30.48 + form.heightInches * 2.54;
    const bmr = gender === 'male' ? 10 * weight * 0.4536 + 6.25 * h - 5 * age + 5 : 10 * weight * 0.4536 + 6.25 * h - 5 * age - 161;
    const m = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, elite: 1.9 };
    const cal = Math.round(bmr * (m[activity] || 1.55) + ({ 'lose-fat': -500, maintain: 0, 'build-muscle': 300, athletic: 200 }[goal] || 0));
    const pR = goal === 'build-muscle' ? .35 : goal === 'lose-fat' ? .4 : .3;
    const cR = goal === 'build-muscle' ? .4 : goal === 'lose-fat' ? .3 : .4;
    return { calories: cal, protein: Math.round(cal * pR / 4), carbs: Math.round(cal * cR / 4), fat: Math.round(cal * (1 - pR - cR) / 9) };
  };

  const generate = async () => {
    setPlanLoading(true);
    setStep(4);
    try {
      for (let i = 0; i < 5; i++) { setGenStep(i); await new Promise(r => setTimeout(r, 450)); }
      const macros = calcMacros();
      const meals = generateMealPlan(macros.calories, macros, form.mealsPerDay, form);
      const plan = { ...macros, name: form.name || 'My Plan', meals, mealsPerDay: form.mealsPerDay, createdAt: new Date().toISOString() };
      setUserProfile({ name: form.name, age: form.age, gender: form.gender, height: { feet: form.heightFeet, inches: form.heightInches }, weight: form.weight, activityLevel: form.activity });
      setPlanConfig({ goal: form.goal, trainingType: form.trainingType, trainingDays: form.trainingDays, dietStyle: form.dietStyle, mealsPerDay: form.mealsPerDay, cookTime: form.cookTime, cuisines: form.cuisines, restrictions: form.restrictions, activity: form.activity });
      setPlan(plan); setGenPlan(plan); setStep(5);
    } finally {
      setPlanLoading(false);
    }
  };

  const TOTAL_STEPS = 3;

  return (
    <div className="min-h-screen bg-slate-50 relative max-w-[430px] mx-auto overflow-hidden">
      {/* Progress bar */}
      {step >= 1 && step <= TOTAL_STEPS && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 px-5 pt-4 bg-slate-50">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, s) => (
              <div key={s} className="h-1 rounded-full flex-1 overflow-hidden bg-slate-200">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: s < step ? '100%' : s === step - 1 ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">Step {step} of {TOTAL_STEPS}</p>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen px-5">
        <AnimatePresence mode="wait">

          {/* WELCOME */}
          {step === 0 && (
            <motion.div key="welcome" {...page} transition={trans}
              className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 rounded-2xl bg-green-500 flex items-center justify-center mb-8 shadow-xl shadow-green-200">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke="white" strokeWidth="1.5"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="white" strokeWidth="1.5"/>
                  <line x1="6" y1="1" x2="6" y2="4" stroke="white" strokeWidth="1.5"/>
                  <line x1="10" y1="1" x2="10" y2="4" stroke="white" strokeWidth="1.5"/>
                  <line x1="14" y1="1" x2="14" y2="4" stroke="white" strokeWidth="1.5"/>
                </svg>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">PLATO</h1>
                <p className="text-green-500 text-base font-semibold mb-3">AI-Powered Nutrition</p>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[260px] mx-auto">
                  Personalized meal plans, intelligent logging, and insights that adapt to you.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="mt-12 w-full max-w-[280px]">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                  className="w-full py-3.5 rounded-xl bg-green-500 text-white font-bold text-base shadow-lg shadow-green-200">
                  Let's Go!
                </motion.button>
                <p className="text-xs text-slate-400 mt-3">Free · No account needed</p>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 1 — About you */}
          {step === 1 && (
            <motion.div key="step1" {...page} transition={trans} className="flex-1 flex flex-col justify-center pt-20 pb-10 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">About you</h2>
                <p className="text-sm text-slate-400 mt-1">Used to calculate your daily targets.</p>
              </div>

              <div className="app-card space-y-4">
                <Field label="Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Age" type="number" value={form.age} onChange={e => set('age', +e.target.value || 0)} />
                  <Field label="Ft" type="number" value={form.heightFeet} onChange={e => set('heightFeet', +e.target.value || 0)} />
                  <Field label="In" type="number" value={form.heightInches} onChange={e => set('heightInches', +e.target.value || 0)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Weight (lbs)" type="number" value={form.weight} onChange={e => set('weight', +e.target.value || 0)} />
                  <div>
                    <Label>Gender</Label>
                    <div className="flex gap-2">
                      {['Male', 'Female'].map(g => <Chip key={g} label={g} active={form.gender === g.toLowerCase()} onClick={() => set('gender', g.toLowerCase())} />)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="app-card">
                <Label>Activity Level</Label>
                <div className="space-y-2">
                  {[
                    { v: 'sedentary', l: 'Sedentary', d: 'Desk job, minimal exercise' },
                    { v: 'light', l: 'Light', d: '1–3 days/week' },
                    { v: 'moderate', l: 'Moderate', d: '3–5 days/week' },
                    { v: 'very', l: 'Very Active', d: '6–7 days/week' },
                    { v: 'elite', l: 'Elite', d: 'Intense daily training' },
                  ].map(a => (
                    <motion.button key={a.v} whileTap={{ scale: 0.98 }} onClick={() => set('activity', a.v)}
                      className={`w-full p-3 rounded-xl text-left flex items-center justify-between border transition-all ${
                        form.activity === a.v ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'
                      }`}>
                      <div>
                        <p className={`text-sm font-semibold ${form.activity === a.v ? 'text-green-700' : 'text-slate-800'}`}>{a.l}</p>
                        <p className="text-xs text-slate-400">{a.d}</p>
                      </div>
                      {form.activity === a.v && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-xl bg-green-500 text-white font-bold text-base">
                Continue
              </motion.button>
              <button onClick={onComplete} className="block mx-auto text-sm text-slate-400">Skip for now</button>
            </motion.div>
          )}

          {/* STEP 2 — Goal */}
          {step === 2 && (
            <motion.div key="step2" {...page} transition={trans} className="flex-1 flex flex-col justify-center pt-20 pb-10 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Your goal</h2>
                <p className="text-sm text-slate-400 mt-1">We'll optimize everything for this.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOAL_OPTIONS.map(g => (
                  <motion.button key={g.v} whileTap={{ scale: 0.97 }} onClick={() => set('goal', g.v)}
                    className={`p-4 rounded-2xl text-left border-2 transition-all ${
                      form.goal === g.v ? 'bg-green-50 border-green-400 shadow-sm' : 'bg-white border-slate-200'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${g.bg}`}>
                      <g.Icon className={`w-5 h-5 ${form.goal === g.v ? 'text-green-600' : g.color}`} />
                    </div>
                    <p className={`text-sm font-bold ${form.goal === g.v ? 'text-green-700' : 'text-slate-800'}`}>{g.l}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{g.d}</p>
                  </motion.button>
                ))}
              </div>

              <div className="app-card space-y-5">
                <div>
                  <Label>Training</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Strength', 'Cardio', 'Hybrid', 'Sport'].map(t => <Chip key={t} label={t} active={form.trainingType === t.toLowerCase()} onClick={() => set('trainingType', t.toLowerCase())} />)}
                  </div>
                </div>
                <div>
                  <Label>Days / Week</Label>
                  <div className="flex items-center gap-4">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => set('trainingDays', Math.max(0, form.trainingDays - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-lg flex items-center justify-center">−</motion.button>
                    <span className="text-3xl font-black text-slate-900 w-8 text-center tabular-nums">{form.trainingDays}</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => set('trainingDays', Math.min(7, form.trainingDays + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-lg flex items-center justify-center">+</motion.button>
                  </div>
                </div>
                <div>
                  <Label>Diet Style</Label>
                  <div className="flex flex-wrap gap-2">
                    {['High Protein', 'Balanced', 'Low Carb', 'Keto', 'Plant-Based'].map(d => <Chip key={d} label={d} active={form.dietStyle === d.toLowerCase().replace(' ', '-')} onClick={() => set('dietStyle', d.toLowerCase().replace(' ', '-'))} />)}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Back</motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold text-sm">Continue</motion.button>
              </div>
              <button onClick={onComplete} className="block mx-auto text-sm text-slate-400">Skip for now</button>
            </motion.div>
          )}

          {/* STEP 3 — Preferences */}
          {step === 3 && (
            <motion.div key="step3" {...page} transition={trans} className="flex-1 flex flex-col justify-center pt-20 pb-10 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Preferences</h2>
                <p className="text-sm text-slate-400 mt-1">Last step — how do you eat?</p>
              </div>

              <div className="app-card space-y-5">
                <div>
                  <Label>Meals / Day</Label>
                  <div className="flex gap-2">
                    {[2,3,4,5,6].map(n => <Chip key={n} label={`${n}`} active={form.mealsPerDay === n} onClick={() => set('mealsPerDay', n)} />)}
                  </div>
                </div>
                <div>
                  <Label>Cook Time</Label>
                  <div className="flex gap-2">
                    {[{l:'Quick',v:'quick'},{l:'Moderate',v:'moderate'},{l:'Any',v:'any'}].map(t => <Chip key={t.v} label={t.l} active={form.cookTime === t.v} onClick={() => set('cookTime', t.v)} />)}
                  </div>
                </div>
                <div>
                  <Label>Cuisines</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Italian','Asian','Mexican','Mediterranean','American','Indian'].map(c => <Chip key={c} label={c} active={form.cuisines.includes(c.toLowerCase())} onClick={() => togCuisine(c.toLowerCase())} />)}
                  </div>
                </div>
                <Field label="Restrictions" value={form.restrictions} onChange={e => set('restrictions', e.target.value)} placeholder="e.g., nuts, dairy" />
              </div>

              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">Back</motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={generate}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold text-sm">Build Plan ✨</motion.button>
              </div>
            </motion.div>
          )}

          {/* GENERATING */}
          {step === 4 && (
            <motion.div key="gen" {...page} transition={trans}
              className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mb-8 shadow-xl shadow-green-200">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" className="animate-pulse">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-8">Building your plan</h2>
              <div className="w-full max-w-[220px] space-y-4">
                {['Analyzing goals', 'Calculating macros', 'Selecting recipes', 'Optimizing nutrition', 'Finalizing'].map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      i < genStep ? 'bg-green-500' : i === genStep ? 'border-2 border-green-500' : 'border border-slate-200'
                    }`}>
                      {i < genStep && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      {i === genStep && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                    </div>
                    <span className={`text-sm ${i <= genStep ? 'text-slate-900' : 'text-slate-300'}`}>{l}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* READY */}
          {step === 5 && genPlan && (
            <motion.div key="ready" {...page} transition={trans}
              className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-2xl bg-green-50 border-2 border-green-300 flex items-center justify-center mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Plan ready! 🎉</h2>
              <p className="text-sm text-slate-400 mb-8">Optimized for {form.goal.replace('-', ' ')}</p>

              <div className="w-full app-card mb-8">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[{l:'Cal',v:genPlan.calories,c:'#22C55E'},{l:'Protein',v:`${genPlan.protein}g`,c:'#3B82F6'},{l:'Carbs',v:`${genPlan.carbs}g`,c:'#F59E0B'},{l:'Fat',v:`${genPlan.fat}g`,c:'#F43F5E'}].map(m =>
                    <div key={m.l}>
                      <p className="text-xl font-black tabular-nums" style={{ color: m.c }}>{m.v}</p>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase mt-1">{m.l}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">{genPlan.meals.length} meals · 7 days</div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={onComplete}
                className="w-full max-w-[280px] py-3.5 rounded-xl bg-green-500 text-white font-bold text-base shadow-lg shadow-green-200">
                Start Tracking 🚀
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


