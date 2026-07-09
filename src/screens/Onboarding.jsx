import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateMealPlan } from '../services/mealGenerator';
import { updateProfile, auth } from '../lib/api';

/* ── Elevated Verdant · Onboarding ─────────────────────────────────────────
   Coach-style flow: welcome → basics → goal → activity → preferences →
   reveal (building plan) → ready. Unified dark verdant theme, one focused
   step at a time, slim progress rail, lightweight coach line.

   Plan-generation logic (form state, calcMacros — Mifflin-St Jeor,
   generateMealPlan + setUserProfile/setPlanConfig/setPlan, fire-and-forget
   updateProfile) is preserved verbatim from the original screen.
   ────────────────────────────────────────────────────────────────────────── */

const STEPS = ['welcome', 'basics', 'goal', 'activity', 'preferences', 'reveal', 'ready'];
const INTAKE = { basics: 1, goal: 2, activity: 3, preferences: 4 };

const glass = {
  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
};
const microLabel = {
  font: '600 10px/1.2 var(--font-ui)', letterSpacing: '.16em',
  textTransform: 'uppercase', color: 'var(--sage)',
};
const h2Style = {
  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26,
  letterSpacing: '-.02em', color: 'var(--ink)', lineHeight: 1.15,
};
const primaryBtn = {
  width: '100%', height: 54, border: 'none', borderRadius: 'var(--r-control)',
  background: 'linear-gradient(135deg,#43C6AC,#0F9482)', color: 'var(--on-accent)',
  font: '700 16px var(--font-ui)', cursor: 'pointer',
  boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)',
};
const skipBtn = {
  background: 'none', border: 'none', color: 'var(--muted)',
  font: '500 12px var(--font-ui)', cursor: 'pointer',
};

const GOALS = [
  { v: 'lose-fat', l: 'lose fat', d: 'steady, sustainable', delta: '−500 kcal/day', tone: 'var(--macro-fat)' },
  { v: 'maintain', l: 'maintain', d: 'hold steady, dial in habits', delta: '±0 kcal/day', tone: 'var(--macro-cal)' },
  { v: 'build-muscle', l: 'build muscle', d: 'lean surplus for growth', delta: '+300 kcal/day', tone: 'var(--macro-protein)' },
  { v: 'athletic', l: 'athletic', d: 'fuel performance', delta: '+200 kcal/day', tone: 'var(--macro-carbs)' },
];
const GOAL_ICON = {
  'lose-fat': <path d="M22 17 13.5 8.5 8.5 13.5 2 7M16 17h6v-6" />,
  maintain: <><path d="M3 6h18" /><path d="M7 6l-3 7a3 3 0 0 0 6 0z" /><path d="M17 6l-3 7a3 3 0 0 0 6 0z" /><path d="M12 6v14" /><path d="M9 20h6" /></>,
  'build-muscle': <><rect x="1.5" y="9" width="3.5" height="6" rx="1" /><rect x="19" y="9" width="3.5" height="6" rx="1" /><rect x="5" y="10.5" width="14" height="3" rx="1" /></>,
  athletic: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
};

const ACTS = [
  { v: 'sedentary', l: 'sedentary', d: 'desk job, little exercise', m: '×1.20' },
  { v: 'light', l: 'light', d: 'light exercise 1–3 days/week', m: '×1.375' },
  { v: 'moderate', l: 'moderate', d: 'exercise 3–5 days/week', m: '×1.55' },
  { v: 'very', l: 'very active', d: 'hard exercise 6–7 days/week', m: '×1.725' },
  { v: 'elite', l: 'elite', d: 'intense daily training', m: '×1.90' },
];

const DIETS = [
  { v: 'high-protein', l: 'high protein' },
  { v: 'balanced', l: 'balanced' },
  { v: 'low-carb', l: 'low carb' },
  { v: 'keto', l: 'keto' },
  { v: 'plant-based', l: 'plant-based' },
];
const COOK = [{ v: 'quick', l: 'quick' }, { v: 'moderate', l: 'moderate' }, { v: 'any', l: 'any' }];
const CUISINES = ['italian', 'asian', 'mexican', 'mediterranean', 'american', 'indian'];
const REVEAL_LINES = [
  'crunching your numbers…',
  'setting your daily targets…',
  "picking recipes you'll actually want…",
  'almost there…',
];

const goalHuman = (g) => ({ 'lose-fat': 'losing fat', maintain: 'maintaining', 'build-muscle': 'building muscle', athletic: 'performance' }[g] || 'your goal');

export function Onboarding({ onComplete }) {
  const { setUserProfile, setPlanConfig, setPlan, setPlanLoading } = useApp();
  const [step, setStep] = useState('welcome');
  const [form, setForm] = useState({
    name: '', age: 25, gender: 'male', heightFeet: 5, heightInches: 8,
    weight: 180, activity: 'moderate', goal: 'maintain', trainingType: 'strength',
    trainingDays: 4, dietStyle: 'high-protein', mealsPerDay: 3,
    cookTime: 'moderate', cuisines: [], restrictions: '',
  });
  const [expanded, setExpanded] = useState(false);
  const [revealLine, setRevealLine] = useState(0);
  const [genPlan, setGenPlan] = useState(null);
  const revealTimers = useRef([]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const togCuisine = c => set('cuisines', form.cuisines.includes(c) ? form.cuisines.filter(x => x !== c) : [...form.cuisines, c]);

  const go = (s) => setStep(s);
  const next = () => { const i = STEPS.indexOf(step); go(STEPS[Math.min(i + 1, STEPS.length - 1)]); };
  const back = () => { const i = STEPS.indexOf(step); go(STEPS[Math.max(i - 1, 0)]); };

  useEffect(() => () => { revealTimers.current.forEach(clearTimeout); }, []);

  // ── Mifflin-St Jeor (preserved verbatim) ────────────────────────────────
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

  // Live preview of macros for the ready screen (mirrors calcMacros defaults).
  const preview = calcMacros();

  // ── generate() — plan-generation logic preserved verbatim ────────────────
  const generate = async () => {
    setPlanLoading(true);
    go('reveal');
    setRevealLine(0);
    // Advance the coach lines while we build (visual only).
    revealTimers.current.forEach(clearTimeout);
    revealTimers.current = REVEAL_LINES.map((_, i) =>
      setTimeout(() => setRevealLine(Math.min(i, REVEAL_LINES.length - 1)), i * 560)
    );
    try {
      // Preserve the original staged dwell so the reveal animation reads.
      await new Promise(r => setTimeout(r, 2400));
      const macros = calcMacros();
      const meals = generateMealPlan(macros.calories, macros, form.mealsPerDay, form);
      const plan = { ...macros, name: form.name || 'My Plan', meals, mealsPerDay: form.mealsPerDay, createdAt: new Date().toISOString() };
      // Update local state immediately - don't block on backend sync
      setUserProfile({ name: form.name, age: form.age, gender: form.gender, height: { feet: form.heightFeet, inches: form.heightInches }, weight: form.weight, activityLevel: form.activity });
      setPlanConfig({ goal: form.goal, trainingType: form.trainingType, trainingDays: form.trainingDays, dietStyle: form.dietStyle, mealsPerDay: form.mealsPerDay, cookTime: form.cookTime, cuisines: form.cuisines, restrictions: form.restrictions, activity: form.activity });
      setPlan(plan); setGenPlan(plan); go('ready');
      // Fire-and-forget backend sync - never blocks the UI
      if (auth.isLoggedIn()) {
        Promise.race([
          updateProfile({
            name: form.name, age: form.age, gender: form.gender, goal: form.goal,
            activity_level: form.activity, calorie_target: macros.calories,
            protein_target: macros.protein, carb_target: macros.carbs, fat_target: macros.fat,
            weight_kg: Math.round(form.weight * 0.4536),
            height_cm: Math.round(form.heightFeet * 30.48 + form.heightInches * 2.54),
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]).catch(() => { /* non-fatal - local state already saved */ });
      }
    } catch (err) {
      console.error('Plan generation error:', err);
      // On error, still allow user to proceed with defaults
      go('ready');
    } finally {
      setPlanLoading(false);
    }
  };

  // ── coach line ───────────────────────────────────────────────────────────
  const coachText = (() => {
    if (step === 'basics') return form.name ? `nice to meet you, ${form.name.trim().toLowerCase()}. this all stays on your device.` : "hi — i'm your plato coach. a few quick things and i'll size your plan.";
    if (step === 'goal') return {
      'lose-fat': 'good call — a steady 500-calorie deficit, protein kept high.',
      maintain: "maintenance it is. i'll balance your macros so you feel steady.",
      'build-muscle': "let's grow — a slight surplus, protein-forward.",
      athletic: "performance mode. i'll fuel your training without overshooting.",
    }[form.goal];
    if (step === 'activity') return {
      sedentary: "no problem — we'll build around real life, not the gym.",
      light: 'nice — a little movement goes a long way.',
      moderate: 'solid routine — the sweet spot for most people.',
      very: "you move a lot — i'll make sure you eat enough to recover.",
      elite: "serious training load. i'll fuel it.",
    }[form.activity];
    if (step === 'preferences') return {
      'high-protein': 'protein-forward — perfect for holding onto muscle.',
      balanced: "balanced it is — i'll keep your plate varied.",
      'low-carb': "lower-carb — i'll lean into protein and fat.",
      keto: 'keto mode — carb-low, fat-forward.',
      'plant-based': "plant-based — i'll still hit your protein target.",
    }[form.dietStyle];
    return '';
  })();

  const intakeNum = INTAKE[step] || 0;
  const isIntake = intakeNum > 0;

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: 430, margin: '0 auto',
      minHeight: '100dvh', height: '100dvh', background: 'var(--page-bg)',
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-ui)', color: 'var(--ink)',
    }}>
      {/* grain overlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        opacity: 'var(--grain-op)', mixBlendMode: 'overlay',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Ccircle cx='1' cy='1' r='.5' fill='white'/%3E%3C/svg%3E\")",
        backgroundSize: '3px 3px',
      }} />

      {/* progress rail (intake steps only) */}
      {isIntake && (
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px 4px', position: 'relative', zIndex: 2 }}>
          <button onClick={back} aria-label="Back" style={{
            width: 36, height: 36, flex: 'none', borderRadius: 999,
            border: '1px solid var(--glass-border)', background: 'var(--glass-fill)',
            color: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < intakeNum ? 'var(--primary)' : 'var(--divider-strong)', transition: 'background .3s var(--ease-out)' }} />
            ))}
          </div>
          <span style={{ font: '600 11px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            step {intakeNum} of 4
          </span>
        </div>
      )}

      {/* content region */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', margin: '-2px -18px 0', background: 'radial-gradient(80% 48% at 50% 16%, #172b4d 0%, transparent 62%), linear-gradient(180deg,#0c1a30 0%,#081221 55%,#060b16 100%)' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '16px 24px 10px', position: 'relative', overflow: 'hidden' }}>
              {/* ambient floating specks */}
              {[
                { top: '12%', left: '15%', size: 7, bg: '#5FD4C4', op: .6, dur: '3.4s', delay: '0s' },
                { top: '19%', right: '17%', size: 6, bg: '#A78BFA', op: .5, dur: '2.8s', delay: '.5s' },
                { top: '8%', right: '33%', size: 5, bg: '#5AA9FF', op: .5, dur: '3.9s', delay: '.9s' },
                { bottom: '31%', left: '19%', size: 5, bg: '#34D399', op: .45, dur: '3.2s', delay: '.2s' },
              ].map((d, i) => (
                <div key={i} aria-hidden style={{ position: 'absolute', top: d.top, bottom: d.bottom, left: d.left, right: d.right, width: d.size, height: d.size, borderRadius: '50%', background: d.bg, opacity: d.op, animation: `vd-float ${d.dur} ease-in-out infinite ${d.delay}` }} />
              ))}

              {/* logo + radial halo glow */}
              <div style={{ position: 'relative' }}>
                <div aria-hidden style={{ position: 'absolute', inset: -22, borderRadius: '50%', background: 'radial-gradient(circle,rgba(52,211,153,.32),transparent 66%)', filter: 'blur(6px)', animation: 'vd-halo .8s var(--ease-out) .14s both' }} />
                <img src="/plato-logo.png" alt="Plato" width="96" height="96" style={{ position: 'relative', display: 'block', width: 96, height: 96, borderRadius: 26, boxShadow: '0 22px 46px -18px rgba(0,0,0,.7),0 0 34px -6px rgba(52,211,153,.4)', transformOrigin: 'center', animation: 'vd-logo-in .72s var(--ease-out) both,vd-logo-bob 5.5s ease-in-out 1.15s infinite' }} />
              </div>

              <div style={{ marginTop: 26, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, letterSpacing: '-.03em', background: 'linear-gradient(180deg,#6EE7C4,#34D399)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'vd-fade-up .6s var(--ease-out) .05s both' }}>Plato</div>
              <div style={{ marginTop: 8, font: '500 15px var(--font-ui)', color: '#9FB0C4', animation: 'vd-fade-up .6s var(--ease-out) .1s both' }}>Your AI nutrition companion</div>

              {/* feature highlights — separate cards, colored icon tiles */}
              <div style={{ marginTop: 30, width: '100%', display: 'flex', flexDirection: 'column', gap: 12, animation: 'vd-fade-up .6s var(--ease-out) .15s both' }}>
                {[
                  { accent: '#34D399', label: <>Track macros in seconds</>, icon: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" /> },
                  { accent: '#A78BFA', label: <>AI-powered meal plans</>,
                    icon: <><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /></> },
                  { accent: '#5AA9FF', label: <>Real food database <span style={{ color: '#7C90A8', fontWeight: 500 }}>(USDA)</span></>,
                    icon: <><ellipse cx="12" cy="5.5" rx="7.5" ry="3" /><path d="M4.5 5.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6" /><path d="M4.5 11.5v6c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-6" /></> },
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', textAlign: 'left', borderRadius: 16, background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.08)' }}>
                    <div style={{ width: 44, height: 44, flex: 'none', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${f.accent}22`, border: `1px solid ${f.accent}3a` }}>
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={f.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                    </div>
                    <div style={{ font: '600 15px var(--font-ui)', color: '#EAF1F7' }}>{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 'none', padding: '6px 24px 26px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              <button onClick={() => go('basics')} style={{ width: '100%', height: 54, borderRadius: 'var(--r-control)', border: 'none', cursor: 'pointer', color: '#04231C', font: '700 16px var(--font-ui)', background: 'linear-gradient(140deg,#5EEAD4,#34D399)', boxShadow: '0 16px 34px -14px rgba(52,211,153,.6)' }}>Get started free</button>
              <button onClick={onComplete} style={{ width: '100%', height: 52, borderRadius: 'var(--r-control)', border: '1px solid rgba(255,255,255,.10)', background: 'rgba(255,255,255,.04)', color: '#EAF1F7', font: '600 15px var(--font-ui)', cursor: 'pointer' }}>Sign in to your account</button>
              <div style={{ textAlign: 'center', marginTop: 2 }}>
                <button onClick={onComplete} style={{ background: 'none', border: 'none', color: '#7C90A8', font: '600 13px var(--font-ui)', cursor: 'pointer', padding: 6 }}>Continue without an account</button>
              </div>
            </div>
          </div>
        )}

        {/* ── BASICS ── */}
        {step === 'basics' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '8px 24px' }}>
              <div style={h2Style}>let's start with you</div>
              <CoachLine text={coachText} />

              <div style={{ ...glass, marginTop: 18, borderRadius: 'var(--r-card)', padding: '6px 16px' }}>
                {/* name */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
                  <span style={{ font: '600 13px var(--font-ui)', color: 'var(--sage)' }}>name</span>
                  <input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="first name"
                    style={{ textAlign: 'right', border: 'none', outline: 'none', background: 'transparent', color: 'var(--ink)', font: '600 15px var(--font-ui)', width: 150 }}
                  />
                </div>
                {/* sex */}
                <div style={{ padding: '14px 0', borderBottom: '1px solid var(--hairline)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ font: '600 13px var(--font-ui)', color: 'var(--sage)' }}>sex</span>
                    <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 12, padding: 3, width: 170 }}>
                      {[{ v: 'male', l: 'male' }, { v: 'female', l: 'female' }].map(g => (
                        <button key={g.v} onClick={() => set('gender', g.v)} style={segStyle(form.gender === g.v)}>{g.l}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, font: '400 11px var(--font-ui)', color: 'var(--muted)' }}>used only for the calorie formula</div>
                </div>
                {/* age */}
                <Stepper label="age" value={String(form.age)} onDec={() => set('age', Math.max(13, form.age - 1))} onInc={() => set('age', Math.min(100, form.age + 1))} minW={34} border />
                {/* height */}
                <Stepper
                  label="height"
                  value={`${form.heightFeet}′ ${form.heightInches}″`}
                  onDec={() => {
                    const total = Math.max(48, form.heightFeet * 12 + form.heightInches - 1);
                    set('heightFeet', Math.floor(total / 12)); set('heightInches', total % 12);
                  }}
                  onInc={() => {
                    const total = Math.min(90, form.heightFeet * 12 + form.heightInches + 1);
                    set('heightFeet', Math.floor(total / 12)); set('heightInches', total % 12);
                  }}
                  minW={64}
                  border
                />
                {/* weight */}
                <Stepper label="weight" value={`${form.weight} lb`} onDec={() => set('weight', Math.max(60, form.weight - 1))} onInc={() => set('weight', Math.min(600, form.weight + 1))} minW={64} />
              </div>
            </div>
            <div style={{ flex: 'none', padding: '12px 24px 26px' }}>
              <button onClick={next} style={primaryBtn}>continue</button>
              <div style={{ textAlign: 'center', marginTop: 12 }}><button onClick={onComplete} style={skipBtn}>skip setup</button></div>
            </div>
          </div>
        )}

        {/* ── GOAL ── */}
        {step === 'goal' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '8px 24px' }}>
              <div style={h2Style}>what's your goal?</div>
              <CoachLine text={coachText} />
              <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {GOALS.map(g => {
                  const on = form.goal === g.v;
                  return (
                    <button key={g.v} onClick={() => set('goal', g.v)} style={tileStyle(on)}>
                      <span style={{ color: g.tone, display: 'inline-flex' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{GOAL_ICON[g.v]}</svg>
                      </span>
                      <div style={{ marginTop: 10, font: '700 15px var(--font-ui)', color: 'var(--ink)' }}>{g.l}</div>
                      <div style={{ marginTop: 3, font: '400 12px var(--font-ui)', color: 'var(--sage)', lineHeight: 1.35 }}>{g.d}</div>
                      <div style={{ marginTop: 8, font: '600 12px var(--font-ui)', color: g.tone, fontVariantNumeric: 'tabular-nums' }}>{g.delta}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ flex: 'none', padding: '12px 24px 26px' }}>
              <button onClick={next} style={primaryBtn}>continue</button>
              <div style={{ textAlign: 'center', marginTop: 12 }}><button onClick={onComplete} style={skipBtn}>skip setup</button></div>
            </div>
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {step === 'activity' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '8px 24px' }}>
              <div style={h2Style}>how active are you?</div>
              <CoachLine text={coachText} />
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {ACTS.map(a => {
                  const on = form.activity === a.v;
                  return (
                    <button key={a.v} onClick={() => set('activity', a.v)} style={rowStyle(on)}>
                      {on ? (
                        <span style={{ width: 22, height: 22, flex: 'none', borderRadius: 999, background: 'var(--primary)', color: 'var(--on-accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </span>
                      ) : (
                        <span style={{ width: 22, height: 22, flex: 'none', borderRadius: 999, border: '1.5px solid var(--divider-strong)' }} />
                      )}
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ font: '600 15px var(--font-ui)', color: 'var(--ink)' }}>{a.l}</div>
                        <div style={{ marginTop: 1, font: '400 12px var(--font-ui)', color: 'var(--sage)' }}>{a.d}</div>
                      </div>
                      <span style={{ font: '600 13px var(--font-ui)', color: 'var(--sage)', fontVariantNumeric: 'tabular-nums' }}>{a.m}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ flex: 'none', padding: '12px 24px 26px' }}>
              <button onClick={next} style={primaryBtn}>continue</button>
              <div style={{ textAlign: 'center', marginTop: 12 }}><button onClick={onComplete} style={skipBtn}>skip setup</button></div>
            </div>
          </div>
        )}

        {/* ── PREFERENCES ── */}
        {step === 'preferences' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '8px 24px' }}>
              <div style={h2Style}>how do you like to eat?</div>
              <div style={{ marginTop: 6, font: '400 13px var(--font-ui)', color: 'var(--sage)' }}>this shapes your recipes — your macros are already set.</div>
              <CoachLine text={coachText} />

              <div style={{ ...microLabel, marginTop: 20 }}>diet style</div>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DIETS.map(d => (
                  <button key={d.v} onClick={() => set('dietStyle', d.v)} style={chipStyle(form.dietStyle === d.v)}>{d.l}</button>
                ))}
              </div>

              <div style={{ marginTop: 22, ...microLabel }}>meals per day</div>
              <div style={{ marginTop: 10, display: 'flex', background: 'var(--surface-2)', borderRadius: 14, padding: 4, gap: 3 }}>
                {[2, 3, 4, 5, 6].map(m => (
                  <button key={m} onClick={() => set('mealsPerDay', m)} style={pillSegStyle(form.mealsPerDay === m)}>{m}</button>
                ))}
              </div>

              <button onClick={() => setExpanded(v => !v)} style={{ marginTop: 20, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span style={{ font: '600 14px var(--font-ui)', color: 'var(--ink)' }}>more preferences</span>
                <span style={{ color: 'var(--sage)', display: 'inline-flex', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s var(--ease-out)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                </span>
              </button>

              {expanded && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={microLabel}>cook time</div>
                    <div style={{ marginTop: 9, display: 'flex', background: 'var(--surface-2)', borderRadius: 14, padding: 4, gap: 3 }}>
                      {COOK.map(c => (
                        <button key={c.v} onClick={() => set('cookTime', c.v)} style={pillSegStyle(form.cookTime === c.v)}>{c.l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={microLabel}>cuisines you love</div>
                    <div style={{ marginTop: 9, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {CUISINES.map(c => (
                        <button key={c} onClick={() => togCuisine(c)} style={chipStyle(form.cuisines.includes(c))}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={microLabel}>avoid / allergies</div>
                    <input
                      value={form.restrictions}
                      onChange={e => set('restrictions', e.target.value)}
                      placeholder="e.g. peanuts, shellfish, dairy"
                      style={{ marginTop: 9, width: '100%', height: 46, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)', padding: '0 14px', outline: 'none', font: '500 14px var(--font-ui)' }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div style={{ flex: 'none', padding: '12px 24px 26px' }}>
              <button onClick={generate} style={primaryBtn}>build my plan</button>
              <div style={{ textAlign: 'center', marginTop: 12 }}><button onClick={onComplete} style={skipBtn}>skip setup</button></div>
            </div>
          </div>
        )}

        {/* ── REVEAL (building plan) ── */}
        {step === 'reveal' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
            {[
              { top: '24%', left: '18%', size: 8, bg: '#5FD4C4', dur: '3.2s', delay: '0s' },
              { top: '30%', right: '20%', size: 6, bg: '#E7B67C', dur: '2.6s', delay: '.4s' },
              { bottom: '30%', left: '26%', size: 7, bg: '#E1A0AB', dur: '3.6s', delay: '.8s' },
              { bottom: '26%', right: '26%', size: 6, bg: '#43C6AC', dur: '3s', delay: '.2s' },
            ].map((d, i) => (
              <div key={i} style={{ position: 'absolute', top: d.top, bottom: d.bottom, left: d.left, right: d.right, width: d.size, height: d.size, borderRadius: '50%', background: d.bg, animation: `vd-float ${d.dur} ease-in-out infinite ${d.delay}` }} />
            ))}
            <div style={{ position: 'relative', width: 150, height: 150 }}>
              <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="75" cy="75" r="68" fill="none" stroke="var(--hairline)" strokeWidth="5" />
                <circle cx="75" cy="75" r="68" fill="none" stroke="#43C6AC" strokeWidth="5" strokeLinecap="round" strokeDasharray="427" strokeDashoffset="86" style={{ filter: 'drop-shadow(0 0 6px rgba(67,198,172,.55))' }} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 132, height: 132, borderRadius: '50%', overflow: 'hidden', background: 'var(--orb-shell)', boxShadow: '0 0 70px -8px rgba(67,198,172,.6),inset 0 2px 8px rgba(255,255,255,.06)', animation: 'vd-breathe 5s ease-in-out infinite' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '84%', background: 'linear-gradient(180deg, rgba(140,224,206,.95), #43C6AC 45%, #0F9482)', animation: 'vd-orb-fill 2s var(--ease-out) both' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 30% at 32% 32%, rgba(140,224,206,.4), transparent 60%)', mixBlendMode: 'screen', animation: 'vd-caustic 7s ease-in-out infinite' }} />
              </div>
            </div>
            <div style={{ marginTop: 34, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', color: 'var(--ink)' }}>building your plan</div>
            <div style={{ marginTop: 8, font: '500 14px var(--font-ui)', color: 'var(--sage)', minHeight: 20 }}>{REVEAL_LINES[Math.min(revealLine, REVEAL_LINES.length - 1)]}</div>
          </div>
        )}

        {/* ── READY ── */}
        {step === 'ready' && (() => {
          const m = genPlan || preview;
          const mealCount = genPlan?.meals?.length ?? 0;
          const readyTitle = form.name ? `your plan's ready, ${form.name.trim().toLowerCase()}.` : "your plan's ready.";
          const macroCells = [
            { l: 'calories', v: (m.calories || 0).toLocaleString('en-US'), c: 'var(--macro-cal)', unit: '' },
            { l: 'protein', v: String(m.protein || 0), c: 'var(--macro-protein)', unit: 'g' },
            { l: 'carbs', v: String(m.carbs || 0), c: 'var(--macro-carbs)', unit: 'g' },
            { l: 'fat', v: String(m.fat || 0), c: 'var(--macro-fat)', unit: 'g' },
          ];
          return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, padding: '20px 24px 8px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, background: 'rgba(67,198,172,.14)', color: 'var(--primary)', font: '600 11px var(--font-ui)', marginBottom: 12, animation: 'vd-fade-up .5s var(--ease-out)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  plan ready
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-.03em', color: 'var(--ink)', lineHeight: 1.1, animation: 'vd-fade-up .5s var(--ease-out)' }}>{readyTitle}</div>
                <div style={{ marginTop: 8, font: '500 13px var(--font-ui)', color: 'var(--sage)' }}>optimized for {goalHuman(form.goal)} · {form.mealsPerDay} meals a day</div>

                <div style={{ ...glass, marginTop: 20, borderRadius: 'var(--r-card)', padding: '20px 18px', animation: 'vd-fade-up .6s var(--ease-out) .1s both' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 12px' }}>
                    {macroCells.map(cell => (
                      <div key={cell.l}>
                        <div style={microLabel}>{cell.l}</div>
                        <div style={{ marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-.03em', color: cell.c, fontVariantNumeric: 'tabular-nums' }}>
                          {cell.v}{cell.unit && <span style={{ fontSize: 15, color: 'var(--sage)', fontWeight: 600 }}> {cell.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--hairline)', font: '500 12px var(--font-ui)', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {mealCount > 0 ? `${mealCount} recipes · ` : ''}7-day plan · {(m.calories || 0).toLocaleString('en-US')} kcal/day
                  </div>
                </div>

                <div style={{ marginTop: 14, font: '400 13px var(--font-ui)', color: 'var(--sage)', textAlign: 'center' }}>
                  log your first meal and your macro orb comes to life.
                </div>
              </div>
              <div style={{ flex: 'none', padding: '8px 24px 26px' }}>
                <button onClick={onComplete} style={primaryBtn}>start tracking</button>
              </div>
            </div>
          );
        })()}

      </div>

      {/* scoped keyframes (self-contained so onboarding renders before the shell) */}
      <style>{`
        @keyframes vd-fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vd-float { 0%,100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(-12px); opacity: 1; } }
        @keyframes vd-orb-fill { from { height: 6%; } to { height: 84%; } }
        @keyframes vd-halo { 0% { opacity: 0; transform: scale(.55); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes vd-logo-in { 0% { opacity: 0; transform: scale(.72) translateY(10px); } 62% { opacity: 1; transform: scale(1.045) translateY(0); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes vd-logo-bob { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-2px) scale(1.016); } }
        @media (prefers-reduced-motion: reduce) {
          [data-onb] * { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
        }
      `}</style>
    </div>
  );
}

/* ── shared sub-components / style helpers ─────────────────────────────────── */

function CoachLine({ text }) {
  if (!text) return null;
  return (
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'radial-gradient(circle,#8CE0CE,#43C6AC)', boxShadow: '0 0 12px rgba(67,198,172,.5)', flex: 'none' }} />
      <span style={{ font: '500 14px var(--font-ui)', color: 'var(--ink)', lineHeight: 1.4 }}>{text}</span>
    </div>
  );
}

function Stepper({ label, value, onDec, onInc, minW, border }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: border ? '1px solid var(--hairline)' : 'none' }}>
      <span style={{ font: '600 13px var(--font-ui)', color: 'var(--sage)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onDec} style={stepBtnStyle}>−</button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', minWidth: minW, textAlign: 'center' }}>{value}</span>
        <button onClick={onInc} style={stepBtnStyle}>+</button>
      </div>
    </div>
  );
}

const stepBtnStyle = {
  width: 32, height: 32, borderRadius: 999, border: '1px solid var(--glass-border)',
  background: 'var(--surface-2)', color: 'var(--ink)', cursor: 'pointer', fontSize: 18, lineHeight: 1,
};

function segStyle(active) {
  return {
    flex: 1, padding: '10px 0', borderRadius: 11, cursor: 'pointer', border: 'none',
    font: '600 14px var(--font-ui)',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'var(--on-accent)' : 'var(--sage)',
    transition: 'all .16s var(--ease-out)',
  };
}
function pillSegStyle(active) {
  return {
    flex: 1, padding: '10px 0', borderRadius: 11, cursor: 'pointer', border: 'none',
    font: '600 14px var(--font-ui)',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'var(--on-accent)' : 'var(--sage)',
    transition: 'all .16s var(--ease-out)',
  };
}
function chipStyle(active) {
  return {
    padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
    font: '600 13px var(--font-ui)',
    border: `1px solid ${active ? 'transparent' : 'var(--glass-border)'}`,
    background: active ? 'var(--primary)' : 'var(--surface-2)',
    color: active ? 'var(--on-accent)' : 'var(--sage)',
    transition: 'all .16s var(--ease-out)', whiteSpace: 'nowrap',
  };
}
function tileStyle(on) {
  return {
    ...glass, borderRadius: 'var(--r-tile)', padding: '15px 12px', cursor: 'pointer',
    width: '100%', textAlign: 'center', whiteSpace: 'normal', overflowWrap: 'break-word',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    transition: 'all .18s var(--ease-out)',
    boxShadow: on
      ? '0 0 0 1.5px var(--primary),0 10px 30px -14px rgba(67,198,172,.4)'
      : 'inset 0 1px 0 rgba(255,255,255,.05),0 18px 34px -28px rgba(0,0,0,.9)',
  };
}
function rowStyle(on) {
  return {
    ...glass, borderRadius: 'var(--r-control)', padding: '12px 14px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
    transition: 'all .18s var(--ease-out)',
    boxShadow: on ? '0 0 0 1.5px var(--primary)' : '0 4px 12px -8px rgba(0,0,0,.7)',
  };
}
