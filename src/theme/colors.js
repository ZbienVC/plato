// PLATO COLOR SYSTEM
export const colors = {
  // Primary Brand Colors
  primary: {
    main: '#6B8F71',      // Brand Green
    light: '#7BA985',     // Lighter variant
    dark: '#4A5F52',      // Darker variant
  },
  
  // Neutral Colors (Dark Theme)
  bg: {
    primary: '#0F0F0F',   // Main background (almost black)
    secondary: '#1A1A1A', // Card background
    tertiary: '#2A2A2A',  // Hover/active background
  },
  
  // Text Colors
  text: {
    primary: '#FFFFFF',   // Main text
    secondary: '#A0A0A0', // Dimmed text
    tertiary: '#707070',  // Even dimmer
  },
  
  // Borders & Dividers
  border: '#2A2A2A',
  divider: '#1F1F1F',
  
  // Semantic Colors
  success: '#4CAF50',
  warning: '#FFA500',
  error: '#FF6B6B',
  info: '#2196F3',
  
  // States
  hover: 'rgba(107, 143, 113, 0.1)',
  active: 'rgba(107, 143, 113, 0.2)',
  disabled: '#4A4A4A',
  disabledText: '#707070',
};

export const gradients = {
  primary: 'linear-gradient(135deg, #6B8F71 0%, #7BA985 100%)',
  dark: 'linear-gradient(135deg, #4A5F52 0%, #6B8F71 100%)',
  overlay: 'linear-gradient(to bottom, rgba(15, 15, 15, 0), rgba(15, 15, 15, 0.8))',
};

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.6)',
  elevation: '0 4px 12px rgba(107, 143, 113, 0.15)',
};
