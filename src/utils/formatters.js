/**
 * Format a number with commas (e.g., 2400 → "2,400")
 */
export const formatNumber = (num) => {
  if (num == null || isNaN(num)) return '0';
  return Math.round(num).toLocaleString();
};

/**
 * Format calories with suffix (e.g., 2400 → "2,400 cal")
 */
export const formatCalories = (cal) => `${formatNumber(cal)} cal`;

/**
 * Format macro with grams (e.g., 180 → "180g")
 */
export const formatMacro = (value, unit = 'g') => `${Math.round(value || 0)}${unit}`;

/**
 * Format a percentage (e.g., 0.77 → "77%")
 */
export const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;

/**
 * Calculate percentage of target hit
 */
export const calcProgress = (current, target) => {
  if (!target || target === 0) return 0;
  return Math.min(1, current / target);
};

/**
 * Calculate age from birthday string (YYYY-MM-DD)
 */
export const calculateAge = (birthday) => {
  if (!birthday) return null;
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = (name) => {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
};

/**
 * Format time as "8:30am"
 */
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m}${ampm}`;
};

/**
 * Format date as "Tue Mar 18"
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Generate a hash number from a string (for consistent colors/seeds)
 */
export const strHash = (s) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};
