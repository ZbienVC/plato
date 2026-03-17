import React, { useState } from 'react';
import { MainLayout } from '../components/layout';
import { Card, Button, Badge } from '../components/atoms';
import './MealPlans.css';

/**
 * MEAL PLANS PAGE - AI meal planning with multiple view modes
 */
export const MealPlans = () => {
  const [activeTab, setActiveTab] = useState('meals');
  const [viewMode, setViewMode] = useState('calendar'); // calendar | stack | list
  const [selectedDate, setSelectedDate] = useState('2026-03-16');
  const [currentStackIndex, setCurrentStackIndex] = useState(0);

  // Mock meal plan data
  const mealPlan = {
    '2026-03-16': [
      { id: 1, name: 'Oatmeal with Berries', time: '7:00 AM', macros: { protein: 12, carbs: 45, fat: 5, calories: 280 } },
      { id: 2, name: 'Chicken Salad', time: '12:30 PM', macros: { protein: 35, carbs: 20, fat: 8, calories: 320 } },
      { id: 3, name: 'Salmon & Sweet Potato', time: '6:30 PM', macros: { protein: 40, carbs: 50, fat: 15, calories: 480 } },
      { id: 4, name: 'Greek Yogurt Parfait', time: '8:30 PM', macros: { protein: 18, carbs: 30, fat: 3, calories: 220 } },
    ],
    '2026-03-17': [
      { id: 5, name: 'Eggs & Toast', time: '7:00 AM', macros: { protein: 15, carbs: 30, fat: 8, calories: 280 } },
      { id: 6, name: 'Turkey Sandwich', time: '12:00 PM', macros: { protein: 30, carbs: 35, fat: 10, calories: 380 } },
      { id: 7, name: 'Beef Stir-Fry', time: '6:00 PM', macros: { protein: 42, carbs: 45, fat: 12, calories: 520 } },
    ],
    '2026-03-18': [
      { id: 8, name: 'Protein Smoothie', time: '7:30 AM', macros: { protein: 30, carbs: 40, fat: 5, calories: 320 } },
      { id: 9, name: 'Tuna & Rice', time: '1:00 PM', macros: { protein: 35, carbs: 50, fat: 3, calories: 420 } },
      { id: 10, name: 'Chicken & Veggies', time: '7:00 PM', macros: { protein: 38, carbs: 35, fat: 10, calories: 420 } },
    ],
  };

  const mealsForSelectedDate = mealPlan[selectedDate] || [];
  const daysInMonth = Array.from({ length: 28 }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    day: i + 1,
  }));

  const getTotalMacros = (meals) => {
    return meals.reduce(
      (acc, meal) => ({
        protein: acc.protein + meal.macros.protein,
        carbs: acc.carbs + meal.macros.carbs,
        fat: acc.fat + meal.macros.fat,
        calories: acc.calories + meal.macros.calories,
      }),
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
  };

  const dayTotals = getTotalMacros(mealsForSelectedDate);
  const stackMeal = mealsForSelectedDate[currentStackIndex];

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showFAB={false}
    >
      {/* HEADER */}
      <div className="meal-plans-header">
        <h1 className="page-title">Your AI Meal Plan</h1>
        <p className="page-subtitle">Personalized nutrition for your goals</p>
      </div>

      {/* VIEW MODE SELECTOR */}
      <div className="view-mode-selector">
        <button
          className={`view-mode-btn ${viewMode === 'calendar' ? 'view-mode-active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          📅 Calendar
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'stack' ? 'view-mode-active' : ''}`}
          onClick={() => setViewMode('stack')}
        >
          🃏 Cards
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'list' ? 'view-mode-active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📝 List
        </button>
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="meal-plans-content">
          <Card variant="elevated" className="calendar-card">
            <h2 className="section-title">March 2026</h2>
            <div className="calendar-grid">
              {daysInMonth.map((day) => (
                <button
                  key={day.date}
                  className={`calendar-day ${selectedDate === day.date ? 'calendar-day-selected' : ''} ${mealPlan[day.date] ? 'calendar-day-has-meals' : ''}`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  {day.day}
                </button>
              ))}
            </div>
          </Card>

          {/* SELECTED DATE MEALS */}
          {mealsForSelectedDate.length > 0 && (
            <Card variant="elevated" className="daily-meals-card">
              <div className="daily-meals-header">
                <h2 className="section-title">{selectedDate}</h2>
                <Badge variant="primary" size="sm">{dayTotals.calories} kcal</Badge>
              </div>

              <div className="meals-preview">
                {mealsForSelectedDate.map((meal) => (
                  <div key={meal.id} className="meal-preview-item">
                    <div className="meal-preview-info">
                      <h4 className="meal-preview-name">{meal.name}</h4>
                      <p className="meal-preview-time">{meal.time}</p>
                    </div>
                    <div className="meal-preview-macros">
                      <span className="macro-small">P {meal.macros.protein}g</span>
                      <span className="macro-small">C {meal.macros.carbs}g</span>
                      <span className="macro-small">F {meal.macros.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="daily-totals">
                <h3 className="totals-title">Day Total</h3>
                <div className="totals-grid">
                  <div className="total-item">
                    <span className="total-label">Protein</span>
                    <span className="total-value">{dayTotals.protein}g</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Carbs</span>
                    <span className="total-value">{dayTotals.carbs}g</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Fat</span>
                    <span className="total-value">{dayTotals.fat}g</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">Calories</span>
                    <span className="total-value">{dayTotals.calories}</span>
                  </div>
                </div>
              </div>

              <Button variant="primary" fullWidth>
                Use This Plan
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* CARD STACK VIEW */}
      {viewMode === 'stack' && stackMeal && (
        <div className="meal-plans-content">
          <div className="stack-header">
            <p className="stack-counter">{currentStackIndex + 1} of {mealsForSelectedDate.length}</p>
          </div>

          <Card variant="elevated" className="meal-stack-card">
            <div className="meal-stack-content">
              <h2 className="meal-stack-name">{stackMeal.name}</h2>
              <p className="meal-stack-time">{stackMeal.time}</p>

              <div className="stack-macros">
                <div className="stack-macro">
                  <span className="stack-macro-label">Protein</span>
                  <span className="stack-macro-value">{stackMeal.macros.protein}g</span>
                </div>
                <div className="stack-macro">
                  <span className="stack-macro-label">Carbs</span>
                  <span className="stack-macro-value">{stackMeal.macros.carbs}g</span>
                </div>
                <div className="stack-macro">
                  <span className="stack-macro-label">Fat</span>
                  <span className="stack-macro-value">{stackMeal.macros.fat}g</span>
                </div>
                <div className="stack-macro">
                  <span className="stack-macro-label">Calories</span>
                  <span className="stack-macro-value">{stackMeal.macros.calories}</span>
                </div>
              </div>

              <Button variant="secondary" fullWidth>
                View Recipe
              </Button>
            </div>
          </Card>

          <div className="stack-nav">
            <Button
              variant="secondary"
              onClick={() => setCurrentStackIndex(Math.max(0, currentStackIndex - 1))}
              disabled={currentStackIndex === 0}
            >
              ← Previous
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentStackIndex(Math.min(mealsForSelectedDate.length - 1, currentStackIndex + 1))}
              disabled={currentStackIndex === mealsForSelectedDate.length - 1}
            >
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="meal-plans-content">
          <Card variant="elevated">
            <h2 className="section-title">All Meals</h2>
            <div className="meals-list">
              {mealsForSelectedDate.map((meal) => (
                <div key={meal.id} className="list-meal-item">
                  <div className="list-meal-info">
                    <h4 className="list-meal-name">{meal.name}</h4>
                    <p className="list-meal-time">{meal.time}</p>
                  </div>
                  <div className="list-meal-calories">
                    <span className="cal-badge">{meal.macros.calories} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </MainLayout>
  );
};

export default MealPlans;
