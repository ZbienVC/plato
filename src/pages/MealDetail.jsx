import React, { useState } from 'react';
import { MainLayout } from '../components/layout';
import { Card, Button, Input, Badge, StatusBadge } from '../components/atoms';
import { Modal } from '../components/organisms';
import './MealDetail.css';

/**
 * MEAL DETAIL PAGE - Full meal breakdown with edit/delete
 */
export const MealDetail = ({ mealId = '1' }) => {
  const [activeTab, setActiveTab] = useState('meals');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedMeal, setEditedMeal] = useState(null);

  // Mock meal data
  const meal = {
    id: mealId,
    name: 'Grilled Chicken & Broccoli Bowl',
    time: '12:45 PM',
    date: 'March 16, 2026',
    image: null,
    status: 'logged',
    notes: 'From Whole Foods deli counter, olive oil drizzle',
    foods: [
      { id: 1, name: 'Grilled Chicken Breast', portion: '150g', protein: 35, carbs: 0, fat: 5, calories: 180 },
      { id: 2, name: 'Broccoli', portion: '200g', protein: 8, carbs: 12, fat: 1, calories: 70 },
      { id: 3, name: 'Brown Rice', portion: '150g', protein: 5, carbs: 40, fat: 2, calories: 200 },
      { id: 4, name: 'Olive Oil', portion: '1 tbsp', protein: 0, carbs: 0, fat: 14, calories: 120 },
    ],
    totals: {
      protein: 48,
      carbs: 52,
      fat: 22,
      calories: 570,
    },
  };

  const handleEdit = () => {
    setEditedMeal({ ...meal });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // Save changes to API
    console.log('Saving meal:', editedMeal);
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Delete meal from API
    console.log('Deleting meal:', mealId);
    setShowDeleteConfirm(false);
    // Navigate back to home
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showFAB={false}
    >
      {/* HEADER */}
      <div className="meal-detail-header">
        <div>
          <h1 className="meal-detail-title">{meal.name}</h1>
          <p className="meal-detail-meta">{meal.time} • {meal.date}</p>
        </div>
        <div className="meal-detail-actions">
          <Button variant="secondary" size="sm" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="tertiary" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </Button>
        </div>
      </div>

      {/* STATUS */}
      <div className="meal-detail-status">
        <StatusBadge status="success">Logged</StatusBadge>
      </div>

      {/* MACRO BREAKDOWN */}
      <Card variant="elevated" className="meal-detail-macros">
        <h2 className="section-title">Nutritional Breakdown</h2>
        <div className="macro-details-grid">
          <div className="macro-detail-item">
            <div className="macro-detail-icon">🥚</div>
            <div className="macro-detail-content">
              <span className="macro-detail-label">Protein</span>
              <span className="macro-detail-value">{meal.totals.protein}g</span>
            </div>
          </div>
          <div className="macro-detail-item">
            <div className="macro-detail-icon">🍞</div>
            <div className="macro-detail-content">
              <span className="macro-detail-label">Carbs</span>
              <span className="macro-detail-value">{meal.totals.carbs}g</span>
            </div>
          </div>
          <div className="macro-detail-item">
            <div className="macro-detail-icon">🥑</div>
            <div className="macro-detail-content">
              <span className="macro-detail-label">Fat</span>
              <span className="macro-detail-value">{meal.totals.fat}g</span>
            </div>
          </div>
          <div className="macro-detail-item macro-detail-total">
            <div className="macro-detail-content">
              <span className="macro-detail-label">Total Calories</span>
              <span className="macro-detail-value">{meal.totals.calories}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* FOODS BREAKDOWN */}
      <Card variant="elevated" className="meal-detail-foods">
        <h2 className="section-title">Foods Included</h2>
        <div className="foods-list">
          {meal.foods.map((food) => (
            <div key={food.id} className="food-item">
              <div className="food-header">
                <div>
                  <h3 className="food-name">{food.name}</h3>
                  <p className="food-portion">{food.portion}</p>
                </div>
                <Badge variant="default" size="sm">{food.calories} kcal</Badge>
              </div>
              <div className="food-macros">
                <span className="food-macro">P: {food.protein}g</span>
                <span className="food-macro">C: {food.carbs}g</span>
                <span className="food-macro">F: {food.fat}g</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* NOTES */}
      {meal.notes && (
        <Card variant="elevated" className="meal-detail-notes">
          <h2 className="section-title">Notes</h2>
          <p className="notes-text">{meal.notes}</p>
        </Card>
      )}

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditing}
        title="Edit Meal"
        onClose={() => setIsEditing(false)}
        footer={
          <div className="modal-footer-buttons">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        }
      >
        {editedMeal && (
          <div className="edit-form">
            <Input
              label="Meal Name"
              value={editedMeal.name}
              onChange={(e) => setEditedMeal({ ...editedMeal, name: e.target.value })}
            />
            <Input
              label="Time"
              type="time"
              value={editedMeal.time}
              onChange={(e) => setEditedMeal({ ...editedMeal, time: e.target.value })}
            />
            <Input
              label="Notes"
              placeholder="Add any notes about this meal..."
              value={editedMeal.notes}
              onChange={(e) => setEditedMeal({ ...editedMeal, notes: e.target.value })}
            />
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={showDeleteConfirm}
        title="Delete Meal?"
        onClose={() => setShowDeleteConfirm(false)}
        footer={
          <div className="modal-footer-buttons">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="delete-confirm-text">
          Are you sure you want to delete "{meal.name}"? This action cannot be undone.
        </p>
      </Modal>
    </MainLayout>
  );
};

export default MealDetail;
