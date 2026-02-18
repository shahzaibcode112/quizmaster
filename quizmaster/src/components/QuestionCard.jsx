import { motion } from 'framer-motion';
import { decodeHTML } from '../utils/helpers';
import { useQuiz } from '../context/QuizContext';

export default function QuestionCard({ question, questionNumber, total }) {
  const { isDark } = useQuiz();
  const decoded = decodeHTML(question.question);

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`rounded-2xl p-6 md:p-8 ${
        isDark ? 'card-glass' : 'card-glass-light'
      }`}
    >
      {/* Category + Difficulty badge row */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${
            isDark
              ? 'bg-violet-500/20 text-violet-300'
              : 'bg-violet-100 text-violet-700'
          }`}
        >
          {decodeHTML(question.category)}
        </span>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Question text */}
      <p
        className={`text-lg md:text-xl font-semibold leading-relaxed ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}
      >
        {decoded}
      </p>
    </motion.div>
  );
}

function DifficultyBadge({ difficulty }) {
  const map = {
    easy: 'bg-green-500/20 text-green-400 border border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };
  return (
    <span
      className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full ${
        map[difficulty] || map.easy
      }`}
    >
      {difficulty}
    </span>
  );
}
