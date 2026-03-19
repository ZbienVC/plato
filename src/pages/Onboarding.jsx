import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { generateMealPlan } from '../services/mealGenerator';

const page = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 } };
const trans = { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] };

export function Onboarding({ onComplete }) {
  const { setUserProfile, setPlanConfig, setPlan } = useApp();
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
    setStep(4);
    for (let i = 0; i < 5; i++) { setGenStep(i); await new Promise(r => setTimeout(r, 450)); }
    const macros = calcMacros();
    const meals = generateMealPlan(macros.calories, macros, form.mealsPerDay, form);
    const plan = { ...macros, name: form.name || 'My Plan', meals, mealsPerDay: form.mealsPerDay, createdAt: new Date().toISOString() };
    setUserProfile({ name: form.name, age: form.age, gender: form.gender, height: { feet: form.heightFeet, inches: form.heightInches }, weight: form.weight, activityLevel: form.activity });
    setPlanConfig({ goal: form.goal, trainingType: form.trainingType, trainingDays: form.trainingDays, dietStyle: form.dietStyle, mealsPerDay: form.mealsPerDay, cookTime: form.cookTime, cuisines: form.cuisines, restrictions: form.restrictions, activity: form.activity });
    setPlan(plan); setGenPlan(plan); setStep(5);
  };

  // ---- Shared UI pieces ----
  const Chip = ({ label, active, onClick }) => (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
        active ? 'bg-gradient-to-r from-teal-500 to-indigo-500 text-white glow-teal' : 'glass text-slate-400'
      }`}>{label}</motion.button>
  );

  const Label = ({ children }) => <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-slate-500 mb-2">{children}</p>;

  const Input = ({ ...props }) => (
    <input {...props} className="w-full px-4 py-3 rounded-xl text-[15px] outline-none bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 focus:border-teal-500/50 transition-colors" />
  );

  const Card = ({ children, className = '' }) => <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div>;

  const PrimaryBtn = ({ children, onClick, className = '' }) => (
    <button onClick={onClick}
      className={`relative z-50 cursor-pointer py-3.5 rounded-xl bg-gradient-to-r from-teal-400 to-indigo-500 text-white font-bold text-[15px] glow-teal active:scale-95 transition-transform touch-manipulation ${className}`}
    >{children}</button>
  );

  const GhostBtn = ({ children, onClick, className = '' }) => (
    <button onClick={onClick}
      className={`relative z-50 cursor-pointer py-3.5 rounded-xl glass text-slate-400 font-semibold text-[15px] active:scale-95 transition-transform touch-manipulation ${className}`}
    >{children}</button>
  );

  return (
    <div className="min-h-screen bg-[#0B0F1A] relative max-w-md mx-auto overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full bg-teal-500/[0.06] blur-[100px] animate-float-slow" style={{ top: '-10%', right: '-20%' }} />
        <div className="absolute w-56 h-56 rounded-full bg-indigo-500/[0.04] blur-[80px] animate-breathe" style={{ bottom: '15%', left: '-15%' }} />
      </div>

      {/* Progress */}
      {step >= 1 && step <= 3 && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-20 px-5 pt-4 pb-2 bg-gradient-to-b from-[#0B0F1A] to-transparent">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <motion.div key={s} className="h-1 rounded-full flex-1"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                style={{ background: s <= step ? 'linear-gradient(to right, #14B8A6, #6366F1)' : 'rgba(255,255,255,0.06)', originX: 0 }}
                transition={{ duration: 0.4, delay: s * 0.1 }}
              />
            ))}
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-2">Step {step} of 3</p>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen px-5">
        <AnimatePresence mode="wait">

          {/* ===== WELCOME ===== */}
          {step === 0 && (
            <motion.div key="welcome" {...page} transition={trans}
              className="flex-1 flex flex-col items-center justify-center text-center py-16">
              {/* Logo */}
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative mb-10">
                <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400/20 to-indigo-500/20 blur-2xl" />
                <div className="relative w-20 h-20 rounded-2xl glass flex items-center justify-center glow-teal">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <defs><linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#14B8A6"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke="url(#lg)" strokeWidth="1.5"/>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke="url(#lg)" strokeWidth="1.5"/>
                    <line x1="6" y1="1" x2="6" y2="4" stroke="url(#lg)" strokeWidth="1.5"/>
                    <line x1="10" y1="1" x2="10" y2="4" stroke="url(#lg)" strokeWidth="1.5"/>
                    <line x1="14" y1="1" x2="14" y2="4" stroke="url(#lg)" strokeWidth="1.5"/>
                  </svg>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <h1 className="text-5xl font-black tracking-tight gradient-text mb-3">PLATO</h1>
                <p className="text-teal-400/80 text-[15px] font-semibold mb-3">AI-Powered Nutrition</p>
                <p className="text-slate-400 text-[14px] leading-relaxed max-w-[260px] mx-auto">
                  Personalized meal plans, intelligent logging, and insights that adapt to you.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-12 w-full max-w-[280px] relative z-50 pointer-events-auto">
                <PrimaryBtn onClick={() => setStep(1)} className="w-full">Let's Go!</PrimaryBtn>
                <p className="text-[12px] text-slate-600 mt-3 relative z-50">Free · No account needed</p>
              </motion.div>
            </motion.div>
          )}

          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <motion.div key="step1" {...page} transition={trans} className="flex-1 flex flex-col justify-center py-10 space-y-6">
              <div className="mb-2">
                <h2 className="text-[26px] font-extrabold tracking-tight text-white">About you</h2>
                <p className="text-[14px] text-slate-400 mt-1">Used to calculate your daily targets.</p>
              </div>

              <Card>
                <div className="space-y-4">
                  <div><Label>Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><Label>Age</Label><Input type="number" value={form.age} onChange={e => set('age', +e.target.value || 0)} /></div>
                    <div><Label>Ft</Label><Input type="number" value={form.heightFeet} onChange={e => set('heightFeet', +e.target.value || 0)} /></div>
                    <div><Label>In</Label><Input type="number" value={form.heightInches} onChange={e => set('heightInches', +e.target.value || 0)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Weight (lbs)</Label><Input type="number" value={form.weight} onChange={e => set('weight', +e.target.value || 0)} /></div>
                    <div><Label>Gender</Label><div className="flex gap-2 pt-0.5">{['Male', 'Female'].map(g => <Chip key={g} label={g} active={form.gender === g.toLowerCase()} onClick={() => set('gender', g.toLowerCase())} />)}</div></div>
                  </div>
                </div>
              </Card>

              <Card>
                <Label>Activity Level</Label>
                <div className="space-y-2 mt-1">
                  {[
                    { v: 'sedentary', l: 'Sedentary', d: 'Desk job, minimal exercise' },
                    { v: 'light', l: 'Light', d: '1–3 days/week' },
                    { v: 'moderate', l: 'Moderate', d: '3–5 days/week' },
                    { v: 'very', l: 'Very Active', d: '6–7 days/week' },
                    { v: 'elite', l: 'Elite', d: 'Intense daily training' },
                  ].map(a => (
                    <motion.button key={a.v} whileTap={{ scale: 0.98 }} onClick={() => set('activity', a.v)}
                      className={`w-full p-3.5 rounded-xl text-left flex items-center justify-between transition-all ${
                        form.activity === a.v
                          ? 'bg-teal-500/10 border border-teal-500/30'
                          : 'bg-white/[0.02] border border-white/[0.04]'
                      }`}>
                      <div>
                        <p className={`text-[13px] font-semibold ${form.activity === a.v ? 'text-teal-400' : 'text-white'}`}>{a.l}</p>
                        <p className="text-[11px] text-slate-500">{a.d}</p>
                      </div>
                      {form.activity === a.v && <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg></div>}
                    </motion.button>
                  ))}
                </div>
              </Card>

              <PrimaryBtn onClick={() => setStep(2)} className="w-full max-w-[280px] mx-auto block">Continue</PrimaryBtn>
              <button onClick={onComplete} className="block mx-auto text-[12px] text-slate-600 mt-1">Skip</button>
            </motion.div>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <motion.div key="step2" {...page} transition={trans} className="flex-1 flex flex-col justify-center py-10 space-y-6">
              <div className="mb-2">
                <h2 className="text-[26px] font-extrabold tracking-tight text-white">Your goal</h2>
                <p className="text-[14px] text-slate-400 mt-1">We'll optimize everything for this.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'lose-fat', l: 'Lose Fat', d: 'Caloric deficit' },
                  { v: 'maintain', l: 'Maintain', d: 'Stay balanced' },
                  { v: 'build-muscle', l: 'Build Muscle', d: 'Surplus for growth' },
                  { v: 'athletic', l: 'Athletic', d: 'Performance focus' },
                ].map(g => (
                  <motion.button key={g.v} whileTap={{ scale: 0.97 }} onClick={() => set('goal', g.v)}
                    className={`p-4 rounded-2xl text-left transition-all ${
                      form.goal === g.v ? 'bg-teal-500/10 border border-teal-500/30 glow-teal' : 'glass'
                    }`}>
                    <p className={`text-[14px] font-bold ${form.goal === g.v ? 'text-teal-400' : 'text-white'}`}>{g.l}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{g.d}</p>
                  </motion.button>
                ))}
              </div>

              <Card>
                <div className="space-y-5">
                  <div><Label>Training</Label><div className="flex flex-wrap gap-2">{['Strength', 'Cardio', 'Hybrid', 'Sport'].map(t => <Chip key={t} label={t} active={form.trainingType === t.toLowerCase()} onClick={() => set('trainingType', t.toLowerCase())} />)}</div></div>
                  <div><Label>Days / Week</Label>
                    <div className="flex items-center gap-4">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => set('trainingDays', Math.max(0, form.trainingDays - 1))} className="w-10 h-10 rounded-xl glass text-white font-bold flex items-center justify-center">−</motion.button>
                      <span className="text-[28px] font-black tabular-nums text-white w-6 text-center">{form.trainingDays}</span>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => set('trainingDays', Math.min(7, form.trainingDays + 1))} className="w-10 h-10 rounded-xl glass text-white font-bold flex items-center justify-center">+</motion.button>
                    </div>
                  </div>
                  <div><Label>Diet Style</Label><div className="flex flex-wrap gap-2">{['High Protein', 'Balanced', 'Low Carb', 'Keto', 'Plant-Based'].map(d => <Chip key={d} label={d} active={form.dietStyle === d.toLowerCase().replace(' ', '-')} onClick={() => set('dietStyle', d.toLowerCase().replace(' ', '-'))} />)}</div></div>
                </div>
              </Card>

              <div className="flex gap-3 max-w-[280px] mx-auto">
                <GhostBtn onClick={() => setStep(1)} className="flex-1">Back</GhostBtn>
                <PrimaryBtn onClick={() => setStep(3)} className="flex-1">Continue</PrimaryBtn>
              </div>
              <button onClick={onComplete} className="block mx-auto text-[12px] text-slate-600 mt-1">Skip</button>
            </motion.div>
          )}

          {/* ===== STEP 3 ===== */}
          {step === 3 && (
            <motion.div key="step3" {...page} transition={trans} className="flex-1 flex flex-col justify-center py-10 space-y-6">
              <div className="mb-2">
                <h2 className="text-[26px] font-extrabold tracking-tight text-white">Preferences</h2>
                <p className="text-[14px] text-slate-400 mt-1">Last step — how do you eat?</p>
              </div>

              <Card>
                <div className="space-y-5">
                  <div><Label>Meals / Day</Label><div className="flex gap-2">{[2,3,4,5,6].map(n => <Chip key={n} label={`${n}`} active={form.mealsPerDay === n} onClick={() => set('mealsPerDay', n)} />)}</div></div>
                  <div><Label>Cook Time</Label><div className="flex flex-wrap gap-2">{[{l:'Quick',v:'quick'},{l:'Moderate',v:'moderate'},{l:'Any',v:'any'}].map(t => <Chip key={t.v} label={t.l} active={form.cookTime === t.v} onClick={() => set('cookTime', t.v)} />)}</div></div>
                  <div><Label>Cuisines</Label><div className="flex flex-wrap gap-2">{['Italian','Asian','Mexican','Mediterranean','American','Indian'].map(c => <Chip key={c} label={c} active={form.cuisines.includes(c.toLowerCase())} onClick={() => togCuisine(c.toLowerCase())} />)}</div></div>
                  <div><Label>Restrictions</Label><Input value={form.restrictions} onChange={e => set('restrictions', e.target.value)} placeholder="e.g., nuts, dairy" /></div>
                </div>
              </Card>

              <div className="flex gap-3 max-w-[280px] mx-auto">
                <GhostBtn onClick={() => setStep(2)} className="flex-1">Back</GhostBtn>
                <PrimaryBtn onClick={generate} className="flex-1">Build Plan</PrimaryBtn>
              </div>
            </motion.div>
          )}

          {/* ===== GENERATING ===== */}
          {step === 4 && (
            <motion.div key="gen" {...page} transition={trans}
              className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: [0.9, 1.05, 1] }} transition={{ duration: 0.6 }}
                className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-8 glow-teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="1.5" className="animate-pulse">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </motion.div>
              <h2 className="text-[20px] font-bold text-white mb-8">Building your plan</h2>
              <div className="w-full max-w-[220px] space-y-4">
                {['Analyzing goals', 'Calculating macros', 'Selecting recipes', 'Optimizing nutrition', 'Finalizing'].map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      i < genStep ? 'bg-teal-500' : i === genStep ? 'border-2 border-teal-500' : 'border border-white/10'
                    }`}>
                      {i < genStep && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      {i === genStep && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-teal-500 rounded-full" />}
                    </div>
                    <span className={`text-[13px] ${i <= genStep ? 'text-white' : 'text-slate-600'}`}>{l}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ===== READY ===== */}
          {step === 5 && genPlan && (
            <motion.div key="ready" {...page} transition={trans}
              className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </motion.div>
              <h2 className="text-[26px] font-extrabold text-white mb-2">Plan ready</h2>
              <p className="text-[14px] text-slate-400 mb-8">Optimized for {form.goal.replace('-', ' ')}</p>
              <Card className="w-full mb-8">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[{l:'Cal',v:genPlan.calories,c:'text-teal-400'},{l:'Protein',v:`${genPlan.protein}g`,c:'text-blue-400'},{l:'Carbs',v:`${genPlan.carbs}g`,c:'text-amber-400'},{l:'Fat',v:`${genPlan.fat}g`,c:'text-purple-400'}].map(m =>
                    <div key={m.l}><p className={`text-[20px] font-black tabular-nums ${m.c}`}>{m.v}</p><p className="text-[9px] text-slate-500 font-semibold uppercase mt-1">{m.l}</p></div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] text-[12px] text-slate-500">{genPlan.meals.length} meals · 7 days</div>
              </Card>
              <PrimaryBtn onClick={onComplete} className="w-full max-w-[280px]">Start Tracking</PrimaryBtn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
