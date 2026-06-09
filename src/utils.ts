import { Session } from './types';

/**
 * Calculates the current consecutive daily streak of focus sessions.
 * Handled safely with local date strings.
 */
export function calculateStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  
  // Extract distinct dates and sort descending (newest first)
  const uniqueDates = Array.from(new Set(sessions.map(s => s.date))).sort().reverse();
  if (uniqueDates.length === 0) return 0;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // If the newest session is older than yesterday, the streak is currently 0
  const newestDate = uniqueDates[0];
  if (newestDate !== todayStr && newestDate !== yesterdayStr) {
    return 0;
  }
  
  let currentStreak = 0;
  let expectedDateStr = newestDate;
  
  for (let i = 0; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === expectedDateStr) {
      currentStreak++;
      // Determine expected date for previous day
      const d = new Date(expectedDateStr + 'T12:00:00'); // set mid-day to avoid TZ shifting
      d.setDate(d.getDate() - 1);
      expectedDateStr = d.toISOString().split('T')[0];
    } else {
      break;
    }
  }
  
  return currentStreak;
}
