import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { formatDate } from '../utils/helpers';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardTable({ entries }) {
  const { isDark } = useQuiz();

  if (!entries || entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-center py-16 rounded-2xl ${isDark ? 'card-glass' : 'card-glass-light'}`}
      >
        <div className="text-6xl mb-4">🏆</div>
        <p className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          No scores yet!
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Complete a quiz to appear on the leaderboard.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className={`text-xs uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {['Rank', 'Player', 'Score', 'Category', 'Difficulty', 'Date'].map((h) => (
              <th
                key={h}
                className={`px-4 py-3 text-left font-semibold border-b ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {entries.map((entry, i) => (
              <motion.tr
                key={`${entry.playerName}-${entry.date}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.06 }}
                className={`transition-colors duration-200 ${
                  isDark
                    ? 'hover:bg-white/5 border-b border-white/5'
                    : 'hover:bg-violet-50/50 border-b border-gray-100'
                } ${i === 0 ? (isDark ? 'bg-yellow-500/5' : 'bg-yellow-50/50') : ''}`}
              >
                {/* Rank */}
                <td className="px-4 py-4">
                  <span className="text-xl">{MEDALS[i] || `#${i + 1}`}</span>
                </td>

                {/* Player */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {entry.playerName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {entry.playerName}
                    </span>
                  </div>
                </td>

                {/* Score */}
                <td className="px-4 py-4">
                  <ScoreBadge score={entry.score} total={entry.total} />
                </td>

                {/* Category */}
                <td className="px-4 py-4">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {entry.categoryName || 'Any'}
                  </span>
                </td>

                {/* Difficulty */}
                <td className="px-4 py-4">
                  <DifficultyChip difficulty={entry.difficulty} />
                </td>

                {/* Date */}
                <td className="px-4 py-4">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDate(entry.date)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

function ScoreBadge({ score, total }) {
  const pct = (score / total) * 100;
  const color = pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400';
  return (
    <span className={`font-black text-lg ${color}`}>
      {score}<span className="text-gray-500 font-normal text-sm">/{total}</span>
    </span>
  );
}

function DifficultyChip({ difficulty }) {
  const map = {
    easy: 'bg-green-500/15 text-green-400',
    medium: 'bg-yellow-500/15 text-yellow-400',
    hard: 'bg-red-500/15 text-red-400',
  };
  return (
    <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${map[difficulty] || map.easy}`}>
      {difficulty}
    </span>
  );
}
