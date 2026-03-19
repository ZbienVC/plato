import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useMacros } from '../hooks/useMacros';
import { MacroDashboard } from '../components/organisms/MacroDashboard';
import { MealCard } from '../components/molecules/MealCard';
import { Button } from '../components/atoms/Button';

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const item = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

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
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex flex-col gap-6 pb-6">
      
      {/* Header */}
      <motion.div variants={item} className="text-center pt-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {greeting}{userProfile?.name ? `, ${userProfile.name}` : ''}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {hasPlan ? (remaining.calories > 0 ? `${remaining.calories} cal left today` : 'Daily goals met!') : 'Ready to crush it?'}
        </p>
      </motion.div>

      {/* Streak (if applicable) */}
      {streak > 0 && (
        <motion.div variants={item} className="glass p-4 flex items-center gap-4 justify-center mx-auto max-w-[280px] w-full">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <span className="text-xl">🔥</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">{streak} Day Streak</p>
            <p className="text-xs text-slate-400">Keep it going!</p>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      {!hasPlan ? (
        <motion.div variants={item} className="glass p-8 text-center mt-4">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 bg-white/5 border border-white/10 flex items-center justify-center glow-teal">
             <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">No active plan</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-[240px] mx-auto">
            Let's generate a personalized meal plan to hit your goals.
          </p>
          <Button variant="primary" onClick={() => setActiveTab('meals')} className="mb-4">
            Generate Plan
          </Button>
          <Button variant="ghost" onClick={() => setShowVoiceLog(true)}>
            Log Manually
          </Button>
        </motion.div>
      ) : (
        <>
          <motion.div variants={item}>
            <MacroDashboard targets={targets} current={current} />
          </motion.div>

          {/* Quick Action */}
          {todayMeals.length === 0 && (
            <motion.div variants={item} className="flex justify-center mt-2">
               <Button onClick={() => setShowVoiceLog(true)} icon={<span className="text-lg leading-none">🎙️</span>}>
                  Log First Meal
               </Button>
            </motion.div>
          )}

          {/* Today's Meals */}
          <motion.div variants={item} className="mt-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-base font-bold text-white">Today's Meals</h2>
              <button onClick={() => setActiveTab('meals')} className="text-teal-400 text-sm font-medium hover:text-teal-300 transition-colors">
                View Plan
              </button>
            </div>
            
            <div className="grid gap-4">
              {todaysPlanned.map((meal, i) => (
                <MealCard 
                  key={i} 
                  meal={meal} 
                  mealSlot={slots[i] || `Meal ${i+1}`}
                  logged={todayMeals.some(m => m.name?.toLowerCase() === meal.name?.toLowerCase())}
                  showImage={false}
                  onLog={m => logMeal({ name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat })}
                  onSwap={() => {}}
                />
              ))}
            </div>
          </motion.div>

          {/* Logged Items */}
          {todayMeals.length > 0 && (
            <motion.div variants={item} className="mt-4">
              <h2 className="text-base font-bold text-white mb-4 px-1">Logged Today</h2>
              <div className="grid gap-3">
                {todayMeals.map((m, i) => (
                  <div key={i} className="glass px-5 py-4 flex items-center justify-between hover:border-white/20 transition-colors">
                    <div className="min-w-0 pr-4">
                      <p className="text-sm font-bold text-white truncate">{m.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(m.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-teal-400">{m.calories} <span className="text-xs font-normal text-slate-500">cal</span></p>
                      <p className="text-[11px] text-slate-400 mt-1">{m.protein}P · {m.carbs}C · {m.fat}F</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
