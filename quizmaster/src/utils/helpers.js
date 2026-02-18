/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 */
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Decode HTML entities (OpenTDB returns encoded strings).
 */
export function decodeHTML(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

/**
 * Format a date object to a readable string.
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format seconds into mm:ss string.
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Get the leaderboard from localStorage.
 */
export function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem('quizmaster_leaderboard') || '[]');
  } catch {
    return [];
  }
}

/**
 * Save a new entry to the leaderboard (keep top 10).
 */
export function saveToLeaderboard(entry) {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);
  const top10 = board.slice(0, 10);
  localStorage.setItem('quizmaster_leaderboard', JSON.stringify(top10));
  return top10;
}

/**
 * Clear the entire leaderboard.
 */
export function clearLeaderboard() {
  localStorage.removeItem('quizmaster_leaderboard');
}

/**
 * Return a color class based on score percentage.
 */
export function getScoreColor(score, total) {
  const pct = (score / total) * 100;
  if (pct >= 80) return 'text-green-400';
  if (pct >= 50) return 'text-yellow-400';
  return 'text-red-400';
}

/**
 * Return a message based on score percentage.
 */
export function getScoreMessage(score, total) {
  const pct = (score / total) * 100;
  if (pct === 100) return '🏆 Perfect Score! Legendary!';
  if (pct >= 80) return '🎉 Excellent! You crushed it!';
  if (pct >= 60) return '👍 Good Job! Keep it up!';
  if (pct >= 40) return '📚 Not bad! Keep practicing!';
  return '💪 Keep studying! You\'ll get better!';
}
