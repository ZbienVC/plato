import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { MacroDashboard } from '../components/organisms/MacroDashboard';
import { MealCard } from '../components/molecules/MealCard';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export function Home() {
  const { plan, dailyLog, logMeal, userProfile, setActiveTab, setShowVoiceLog, streak } = useApp();
  const { targets, current, remaining } = useMacros();
  const hasPlan = plan?.meals?.length > 0;
  const todayMeals = dailyLog?.meals || [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dayIndex = Math.floor((Date.now() - new Date(plan?.createdAt || Date.now()).getTime()) / 86400000) % 7;
  const todaysPlanned = hasPlan ? plan.meals.slice(dayIndex * (plan.mealsPerDay || 3), (dayIndex + 1) * (plan.mealsPerDay || 3)) : [];
  const slots = ['Breakfast', 'Lunch', 'Dinner', 'Snack 1', 'Snack 2'];

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6 pb-4">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-[22px] font-extrabold tracking-tight text-white">
          {greeting}{userProfile?.name ? `, ${userProfile.name}` : ''}
        </h1>
        <p className="text-[13px] text-slate-500 mt-1">
          {hasPlan ? `Day ${dayIndex + 1} · ${remaining.calories > 0 ? `${remaining.calories} cal remaining` : 'Daily goal reached'}` : 'Start your nutrition journey'}
        </p>
      </motion.div>

      {/* Streak */}
      {streak > 0 && (
        <motion.div variants={item} className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(249,115,22,0.12)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round">
              <path d="M12 12c-2-2.67-4-4-4-6a4 4 0 0 1 8 0c0 2-2 3.33-4 6z"/>
              <path d="M12 21a9 9 0 0 0 9-9c0-3-1-5.5-3-8l-3 3-3-3c-2 2.5-3 5-3 8a9 9 0 0 0 9 9z"/>
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-orange-400">{streak} day streak</p>
            <p className="text-[11px] text-orange-400/50">Keep logging!</p>
          </div>
        </motion.div>
      )}

      {/* === EMPTY STATE === */}
      {!hasPlan && (
        <>
          <motion.div variants={item} className="rounded-2xl p-7 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(99,102,241,0.1))' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <h2 className="text-[18px] font-extrabold text-white mb-2">No plan yet</h2>
            <p className="text-[13px] text-slate-400 mb-6 max-w-[240px] mx-auto leading-relaxed">
              Generate a personalized meal plan or start logging meals.
            </p>
            <div className="flex gap-3 max-w-[280px] mx-auto">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setActiveTab('meals')}
                className="flex-1 py-3 rounded-xl text-white font-bold text-[13px]"
                style={{ background: 'linear-gradient(135deg, #14B8A6, #6366F1)', boxShadow: '0 4px 15px rgba(20,184,166,0.2)' }}>
                Generate Plan
              </motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowVoiceLog(true)}
                className="flex-1 py-3 rounded-xl text-slate-300 font-semibold text-[13px]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Log Meal
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { t: 'Voice Log', d: 'Speak to log', ic: '#14B8A6', icBg: 'rgba(20,184,166,0.12)',
                p: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2', a: () => setShowVoiceLog(true) },
              { t: 'Meal Plans', d: '7-day plans', ic: '#6366F1', icBg: 'rgba(99,102,241,0.12)',
                p: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2', a: () => setActiveTab('meals') },
              { t: 'Restaurants', d: 'Best macros', ic: '#F59E0B', icBg: 'rgba(245,158,11,0.12)',
                p: 'M3 3h18v18H3zM3 9h18M9 21V9', a: () => setActiveTab('meals') },
              { t: 'Profile', d: 'Your targets', ic: '#A855F7', icBg: 'rgba(168,85,247,0.12)',
                p: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', a: () => setActiveTab('you') },
            ].map((x, i) => (
              <motion.button key={i} variants={item} whileTap={{ scale: 0.97 }} onClick={x.a}
                className="rounded-2xl p-4 text-left transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: x.icBg }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={x.ic} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={x.p}/></svg>
                </div>
                <p className="text-[13px] font-bold text-white">{x.t}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{x.d}</p>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {/* === ACTIVE STATE === */}
      {hasPlan && (
        <>
          <motion.div variants={item}>
            <MacroDashboard targets={targets} current={current} />
          </motion.div>

          {todayMeals.length === 0 && (
            <motion.button variants={item} whileTap={{ scale: 0.98 }} onClick={() => setShowVoiceLog(true)}
              className="w-full rounded-xl px-4 py-3.5 flex items-center gap-3 transition-colors"
              style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(20,184,166,0.12)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-semibold text-teal-400">Log your first meal</p>
                <p className="text-[11px] text-teal-400/40">Tap or use the mic button</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(20,184,166,0.4)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </motion.button>
          )}

          {/* Today's Plan */}
          <motion.div variants={item}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-white">Today's Plan</h2>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('meals')}
                className="text-[12px] font-semibold text-teal-400/80">View All</motion.button>
            </div>
            <div className="space-y-3">
              {todaysPlanned.map((meal, i) => (
                <MealCard key={i} meal={meal} mealSlot={slots[i] || `Meal ${i+1}`}
                  logged={todayMeals.some(m => m.name?.toLowerCase() === meal.name?.toLowerCase())}
                  onLog={m => logMeal({ name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat })}
                  onSwap={() => {}}
                />
              ))}
            </div>
          </motion.div>

          {/* Logged Today */}
          {todayMeals.length > 0 && (
            <motion.div variants={item}>
              <h2 className="text-[15px] font-bold text-white mb-3">Logged Today</h2>
              <div className="space-y-2">
                {todayMeals.map((m, i) => (
                  <div key={i} className="rounded-xl px-4 py-3 flex items-center justify-between"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(20,184,166,0.12)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate">{m.name}</p>
                        <p className="text-[11px] text-slate-600">{new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[13px] font-bold text-teal-400 tabular-nums">{m.calories}</p>
                      <p className="text-[10px] text-slate-600 tabular-nums">{m.protein}P · {m.carbs}C · {m.fat}F</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick stats */}
          <motion.div variants={item} className="grid grid-cols-3 gap-3">
            {[
              { l: 'Meals', v: todayMeals.length, c: '#14B8A6', bg: 'rgba(20,184,166,0.08)' },
              { l: 'Protein', v: `${current.protein}g`, c: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
              { l: 'Progress', v: `${targets.calories > 0 ? Math.round(current.calories / targets.calories * 100) : 0}%`, c: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
            ].map(s => (
              <div key={s.l} className="text-center py-4 rounded-xl"
                style={{ background: s.bg, border: `1px solid ${s.c}15` }}>
                <p className="text-[20px] font-black tabular-nums" style={{ color: s.c }}>{s.v}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
