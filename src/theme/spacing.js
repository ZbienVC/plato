// SPACING SYSTEM (Base unit: 4px)
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',

  // Aliases for common patterns
  gutter: '16px',
  containerPadding: '16px', // Mobile: 16px, Desktop: 24px
  sectionGap: '24px',
  elementGap: '8px',
};

// Border radius system
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px', // Circular
  card: '12px',
  button: '8px',
  input: '8px',
  sheet: '24px', // Bottom sheet
  modal: '16px',
};

// Z-index scale
export const zIndex = {
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  notification: 700,
};

// Transitions & Animation Timings
export const transitions = {
  fast: '150ms',
  base: '300ms',
  slow: '500ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const animations = {
  slideUp: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fadeIn: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  scaleIn: 'scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
