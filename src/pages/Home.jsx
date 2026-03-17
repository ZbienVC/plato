import React, { useState } from 'react';
import { MainLayout } from '../components/layout';
import { Card, MealCard, Button } from '../components/atoms';
import { BottomSheet } from '../components/organisms';
import './Home.css';

/**
 * HOME PAGE - Dashboard with macros overview and meal summary
 */
export const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [voice, setVoice] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Mock data
  const dailyMacros = {
    protein: { current: 45, target: 130, unit: 'g' },
    carbs: { current: 125, target: 200, unit: 'g' },
    fat: { current: 35, target: 65, unit: 'g' },
    calories: { current: 1250, target: 2000, unit: 'kcal' },
  };

  const todaysMeals = [
    {
      id: 1,
      name: 'Scrambled Eggs & Toast',
      time: '7:30 AM',
      image: null,
      macros: { protein: 15, carbs: 30, fat: 8, calories: 280 },
    },
    {
      id: 2,
      name: 'Grilled Chicken & Broccoli',
      time: '12:45 PM',
      image: null,
      macros: { protein: 35, carbs: 25, fat: 8, calories: 320 },
    },
    {
      id: 3,
      name: 'Greek Yogurt & Berries',
      time: '3:15 PM',
      image: null,
      macros: { protein: 12, carbs: 35, fat: 2, calories: 200 },
    },
  ];

  const handleVoiceInput = async () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate voice recording
      setTimeout(() => {
        setVoice('Ate 2 eggs scrambled with toast and butter');
        setIsRecording(false);
      }, 3000);
    }
  };

  const handleQuickLogSubmit = () => {
    // Submit voice input to API
    console.log('Submitting:', voice);
    setShowQuickLog(false);
    setVoice('');
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onQuickLog={() => setShowQuickLog(true)}
    >
      {/* GREETING HEADER */}
      <div className="home-header">
        <h1 className="home-greeting">Good morning, Zach 👋</h1>
        <p className="home-subtitle">Let's crush your nutrition goals today</p>
      </div>

      {/* DAILY MACROS PROGRESS */}
      <Card variant="elevated" className="home-macros-card">
        <div className="macros-header">
          <h2 className="macros-title">Today's Progress</h2>
          <span className="macros-percentage">{Math.round((dailyMacros.calories.current / dailyMacros.calories.target) * 100)}%</span>
        </div>

        {/* Calorie Progress Bar */}
        <div className="progress-item">
          <div className="progress-info">
            <span className="progress-label">Calories</span>
            <span className="progress-value">{dailyMacros.calories.current} / {dailyMacros.calories.target} kcal</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill progress-fill-calories"
              style={{
                width: `${(dailyMacros.calories.current / dailyMacros.calories.target) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Macro Breakdown */}
        <div className="macros-grid">
          <div className="macro-item">
            <div className="macro-circle macro-circle-protein">
              <span className="macro-icon">🥚</span>
            </div>
            <div className="macro-info">
              <span className="macro-name">Protein</span>
              <span className="macro-stat">{dailyMacros.protein.current}g / {dailyMacros.protein.target}g</span>
            </div>
          </div>

          <div className="macro-item">
            <div className="macro-circle macro-circle-carbs">
              <span className="macro-icon">🍞</span>
            </div>
            <div className="macro-info">
              <span className="macro-name">Carbs</span>
              <span className="macro-stat">{dailyMacros.carbs.current}g / {dailyMacros.carbs.target}g</span>
            </div>
          </div>

          <div className="macro-item">
            <div className="macro-circle macro-circle-fat">
              <span className="macro-icon">🥑</span>
            </div>
            <div className="macro-info">
              <span className="macro-name">Fat</span>
              <span className="macro-stat">{dailyMacros.fat.current}g / {dailyMacros.fat.target}g</span>
            </div>
          </div>
        </div>
      </Card>

      {/* TODAY'S MEALS SECTION */}
      <div className="home-section">
        <div className="section-header">
          <h2 className="section-title">Today's Meals</h2>
          <Button variant="tertiary" size="sm">View all</Button>
        </div>

        <div className="meals-list">
          {todaysMeals.map((meal) => (
            <MealCard
              key={meal.id}
              name={meal.name}
              time={meal.time}
              image={meal.image}
              macros={meal.macros}
              onClick={() => console.log('View meal:', meal.id)}
              onEdit={() => console.log('Edit meal:', meal.id)}
              onDelete={() => console.log('Delete meal:', meal.id)}
            />
          ))}
        </div>
      </div>

      {/* AI SUGGESTION CARD */}
      <Card variant="elevated" className="home-suggestion-card">
        <div className="suggestion-header">
          <span className="suggestion-icon">✨</span>
          <h3 className="suggestion-title">AI Suggestion</h3>
        </div>
        <p className="suggestion-text">
          You're 30g short on protein today. Try adding Greek yogurt or a protein shake to hit your target.
        </p>
        <Button variant="secondary" fullWidth>View Meal Ideas</Button>
      </Card>

      {/* QUICK LOG MODAL */}
      <BottomSheet
        isOpen={showQuickLog}
        title="Quick Log"
        onClose={() => setShowQuickLog(false)}
        footer={
          <div className="quick-log-footer">
            <Button
              variant="secondary"
              onClick={() => setShowQuickLog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleQuickLogSubmit}
              disabled={!voice}
            >
              Log Meal
            </Button>
          </div>
        }
      >
        <div className="quick-log-content">
          <div className="voice-input-section">
            <button
              className={`voice-button ${isRecording ? 'voice-button-recording' : ''}`}
              onClick={handleVoiceInput}
              disabled={isRecording}
            >
              <span className="voice-icon">🎤</span>
              <span className="voice-status">
                {isRecording ? 'Recording...' : 'Tap to speak'}
              </span>
            </button>
          </div>

          {voice && (
            <div className="voice-transcript">
              <p className="transcript-label">Detected:</p>
              <p className="transcript-text">"{voice}"</p>
              <Button
                variant="tertiary"
                onClick={() => setVoice('')}
                size="sm"
              >
                Clear & try again
              </Button>
            </div>
          )}

          <div className="quick-log-tips">
            <p className="tips-title">💡 Pro tips:</p>
            <ul className="tips-list">
              <li>Say the food name and amount (e.g., "2 eggs, toast with butter")</li>
              <li>Mention serving sizes when possible</li>
              <li>You can edit portions after logging</li>
            </ul>
          </div>
        </div>
      </BottomSheet>
    </MainLayout>
  );
};

export default Home;
