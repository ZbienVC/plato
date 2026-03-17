// TYPOGRAPHY SYSTEM
export const typography = {
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'Menlo', 'Monaco', 'Courier New', monospace",
  },

  // Heading Styles
  h1: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },

  h2: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '1.2',
    letterSpacing: '-0.02em',
  },

  h3: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
  },

  // Body Styles
  bodyLarge: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '1.5',
    letterSpacing: '0',
  },

  body: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.5',
    letterSpacing: '0',
  },

  bodySmall: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '1.4',
    letterSpacing: '0',
  },

  // Button Style
  button: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '1.4',
    letterSpacing: '0.5px',
    textTransform: 'none',
  },

  // Caption & Label
  caption: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: '1.4',
    letterSpacing: '0.4px',
  },

  label: {
    fontSize: '13px',
    fontWeight: 500,
    lineHeight: '1.4',
    letterSpacing: '0.2px',
  },

  // Overline (small uppercase text)
  overline: {
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: '1.6',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
};

// CSS-in-JS helper function
export const getTypographyStyle = (variant) => {
  const styles = {
    h1: typography.h1,
    h2: typography.h2,
    h3: typography.h3,
    bodyLarge: typography.bodyLarge,
    body: typography.body,
    bodySmall: typography.bodySmall,
    button: typography.button,
    caption: typography.caption,
    label: typography.label,
    overline: typography.overline,
  };

  return {
    ...styles[variant],
    fontFamily: typography.fonts.primary,
  };
};
