import React, { useState } from 'react';
import { MainLayout } from '../components/layout';
import { Card, Button, Badge, StatusBadge } from '../components/atoms';
import './Profile.css';

/**
 * PROFILE PAGE - User stats, settings, subscription
 */
export const Profile = ({ activeTab = 'profile', onTabChange = () => {} }) => {

  // Mock user data
  const user = {
    name: 'Zachary Bienstock',
    email: 'zbienstock@gmail.com',
    avatar: null,
    tier: 'free',
    joinDate: 'January 2026',
    stats: {
      mealsLogged: 342,
      daysTracked: 45,
      currentStreak: 12,
      longestStreak: 28,
      avgCaloriesPerDay: 1950,
    },
    goals: {
      dailyCalories: 2000,
      protein: 130,
      carbs: 200,
      fat: 65,
    },
    preferences: {
      notificationsEnabled: true,
      darkMode: true,
      units: 'metric',
    },
  };

  return (
    <>
      {/* PROFILE HEADER */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <div className="avatar-placeholder">{user.name.charAt(0)}</div>
          )}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-joined">Member since {user.joinDate}</p>
        </div>
        <StatusBadge status="active">{user.tier}</StatusBadge>
      </div>

      {/* SUBSCRIPTION STATUS */}
      <Card variant="elevated" className="subscription-card">
        <div className="subscription-content">
          <div>
            <h3 className="subscription-title">Free Plan</h3>
            <p className="subscription-desc">Limited meal plans & features</p>
          </div>
          <Button variant="primary" size="sm">Upgrade</Button>
        </div>
        <div className="subscription-features">
          <li>3 AI meal plans per week</li>
          <li>Unlimited meal logging</li>
          <li>Basic analytics</li>
        </div>
      </Card>

      {/* STATS OVERVIEW */}
      <Card variant="elevated" className="stats-card">
        <h2 className="section-title">Your Progress</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-icon">📊</span>
            <div className="stat-content">
              <span className="stat-value">{user.stats.mealsLogged}</span>
              <span className="stat-label">Meals Logged</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🔥</span>
            <div className="stat-content">
              <span className="stat-value">{user.stats.currentStreak}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📈</span>
            <div className="stat-content">
              <span className="stat-value">{user.stats.daysTracked}</span>
              <span className="stat-label">Days Tracked</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭐</span>
            <div className="stat-content">
              <span className="stat-value">{user.stats.longestStreak}</span>
              <span className="stat-label">Best Streak</span>
            </div>
          </div>
        </div>
      </Card>

      {/* GOALS */}
      <Card variant="elevated" className="goals-card">
        <h2 className="section-title">Your Daily Goals</h2>
        <div className="goals-grid">
          <div className="goal-item">
            <div className="goal-header">
              <span>Calories</span>
              <span className="goal-target">{user.goals.dailyCalories} kcal</span>
            </div>
            <div className="progress-bar-small">
              <div className="progress-fill" style={{ width: '75%' }}></div>
            </div>
            <p className="goal-current">{Math.round(user.stats.avgCaloriesPerDay)} avg</p>
          </div>
          <div className="goal-item">
            <div className="goal-header">
              <span>Protein</span>
              <span className="goal-target">{user.goals.protein}g</span>
            </div>
            <div className="progress-bar-small">
              <div className="progress-fill" style={{ width: '85%' }}></div>
            </div>
            <p className="goal-current">~{Math.round(user.goals.protein * 0.85)}g avg</p>
          </div>
          <div className="goal-item">
            <div className="goal-header">
              <span>Carbs</span>
              <span className="goal-target">{user.goals.carbs}g</span>
            </div>
            <div className="progress-bar-small">
              <div className="progress-fill" style={{ width: '70%' }}></div>
            </div>
            <p className="goal-current">~{Math.round(user.goals.carbs * 0.70)}g avg</p>
          </div>
          <div className="goal-item">
            <div className="goal-header">
              <span>Fat</span>
              <span className="goal-target">{user.goals.fat}g</span>
            </div>
            <div className="progress-bar-small">
              <div className="progress-fill" style={{ width: '60%' }}></div>
            </div>
            <p className="goal-current">~{Math.round(user.goals.fat * 0.60)}g avg</p>
          </div>
        </div>
        <Button variant="secondary" fullWidth>Edit Goals</Button>
      </Card>

      {/* SETTINGS */}
      <Card variant="elevated" className="settings-card">
        <h2 className="section-title">Settings</h2>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-name">Notifications</h4>
              <p className="setting-desc">Meal reminders & achievements</p>
            </div>
            <div className="toggle">
              <input type="checkbox" id="notifications" defaultChecked={user.preferences.notificationsEnabled} />
              <label htmlFor="notifications"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-name">Dark Mode</h4>
              <p className="setting-desc">Always-on dark theme</p>
            </div>
            <div className="toggle">
              <input type="checkbox" id="darkmode" defaultChecked={user.preferences.darkMode} />
              <label htmlFor="darkmode"></label>
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h4 className="setting-name">Units</h4>
              <p className="setting-desc">Metric (kg, g) / Imperial (lb, oz)</p>
            </div>
            <select className="setting-select">
              <option>Metric</option>
              <option>Imperial</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ACTIONS */}
      <div className="profile-actions">
        <Button variant="secondary" fullWidth>Edit Profile</Button>
        <Button variant="tertiary" fullWidth>Sign Out</Button>
      </div>
    </>
  );
};

export default Profile;
