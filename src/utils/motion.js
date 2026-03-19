/**
 * Shared Framer Motion variants and transitions
 */

// Page transition
export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const pageTransition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

// Card entrance (staggered)
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

// Scale tap
export const tapScale = {
  whileTap: { scale: 0.97 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

// Fade in
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
};

// Slide up
export const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
};

// Progress bar spring
export const progressSpring = {
  type: 'spring',
  stiffness: 80,
  damping: 15,
};
