import React from 'react';
import './Card.css';

/**
 * CARD COMPONENT - Container for content
 * Variants: default, elevated, interactive
 */
export const Card = ({
  children,
  variant = 'default',
  onClick = null,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`card card-${variant} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * MEAL CARD - Specialized card for meal display
 */
export const MealCard = ({
  image,
  name,
  macros,
  time,
  onClick,
  onEdit,
  onDelete,
  className = '',
}) => {
  return (
    <Card variant="elevated" onClick={onClick} className={`meal-card ${className}`}>
      {image && (
        <div className="meal-card-image">
          <img src={image} alt={name} loading="lazy" />
        </div>
      )}
      <div className="meal-card-content">
        <div className="meal-card-header">
          <h3 className="meal-card-title">{name}</h3>
          <div className="meal-card-actions">
            {onEdit && (
              <button
                className="meal-card-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Edit meal"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                className="meal-card-action-btn meal-card-action-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete meal"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
        
        {time && <p className="meal-card-time">{time}</p>}
        
        {macros && (
          <div className="meal-card-macros">
            <div className="macro-badge">
              <span className="macro-label">P</span>
              <span className="macro-value">{macros.protein}g</span>
            </div>
            <div className="macro-badge">
              <span className="macro-label">C</span>
              <span className="macro-value">{macros.carbs}g</span>
            </div>
            <div className="macro-badge">
              <span className="macro-label">F</span>
              <span className="macro-value">{macros.fat}g</span>
            </div>
            <div className="macro-badge macro-total">
              <span className="macro-value">{macros.calories} kcal</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
