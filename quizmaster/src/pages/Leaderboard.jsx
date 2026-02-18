import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import LeaderboardTable from '../components/LeaderboardTable';
import { getLeaderboard, clearLeaderboard } from '../utils/helpers';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { isDark, resetQuiz } = useQuiz();
  const [entries, setEntries] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  const handleClear = () => {
    clearLeaderboard();
    setEntries([]);
    setShowConfirm(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 ${isDark ? 'gradient-bg' : 'gradient-bg-light'}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
              🏆 Leaderboard
            </h1>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Top {Math.min(entries.length, 10)} players — sorted by score
            </p>
          </div>

          <div className="flex gap-3">
            {entries.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirm(true)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isDark
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                }`}
              >
                🗑️ Clear
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { resetQuiz(); navigate('/'); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/20"
            >
              🚀 New Quiz
            </motion.button>
          </div>
        </motion.div>

        {/* Stats summary */}
        {entries.length > 0 && (
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Games', value: entries.length, icon: '🎮' },
              { label: 'Best Score', value: `${entries[0]?.score}/${entries[0]?.total}`, icon: '🥇' },
              { label: 'Top Player', value: entries[0]?.playerName || '—', icon: '👑' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl p-4 text-center ${isDark ? 'card-glass' : 'card-glass-light'}`}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl overflow-hidden ${isDark ? 'card-glass' : 'card-glass-light'}`}
        >
          <LeaderboardTable entries={entries} />
        </motion.div>

        {/* Confirm modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`max-w-sm w-full rounded-2xl p-6 text-center ${
                  isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="text-5xl mb-4">🗑️</div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Clear Leaderboard?
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This will permanently delete all {entries.length} score{entries.length !== 1 ? 's' : ''}. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${
                      isDark
                        ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-red-600 text-white hover:bg-red-700"
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
