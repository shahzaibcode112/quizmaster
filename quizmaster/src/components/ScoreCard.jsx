import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { getScoreColor, getScoreMessage, formatTime } from '../utils/helpers';

export default function ScoreCard({ score, total, correctCount, wrongCount, timeTaken }) {
  const { isDark } = useQuiz();
  const pct = Math.round((score / total) * 100);
  const scoreColor = getScoreColor(score, total);
  const message = getScoreMessage(score, total);

  const stats = [
    { label: 'Correct', value: correctCount, color: 'text-green-400', bg: isDark ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200' },
    { label: 'Wrong', value: wrongCount, color: 'text-red-400', bg: isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200' },
    { label: 'Time', value: formatTime(timeTaken), color: 'text-blue-400', bg: isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200' },
    { label: 'Accuracy', value: `${pct}%`, color: 'text-violet-400', bg: isDark ? 'bg-violet-500/10 border-violet-500/20' : 'bg-violet-50 border-violet-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Big score circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} strokeWidth="10" />
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - pct / 100) }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black ${scoreColor}`}>{score}</span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>/ {total}</span>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`mt-4 text-lg font-semibold text-center ${isDark ? 'text-white' : 'text-gray-800'}`}
        >
          {message}
        </motion.p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`rounded-xl p-4 border ${stat.bg}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {stat.label}
            </p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
