import { motion } from 'framer-motion';
import { decodeHTML } from '../utils/helpers';
import { useQuiz } from '../context/QuizContext';

const LABELS = ['A', 'B', 'C', 'D'];

export default function OptionCard({ option, index, correctAnswer, selectedAnswer, onSelect }) {
  const { isDark } = useQuiz();
  const decoded = decodeHTML(option);
  const isSelected = selectedAnswer === option;
  const isCorrect = option === correctAnswer;
  const hasAnswered = selectedAnswer !== null;

  let stateClass = '';
  let labelClass = '';

  if (hasAnswered) {
    if (isCorrect) {
      stateClass = 'option-card-correct';
      labelClass = 'bg-green-500 text-white';
    } else if (isSelected && !isCorrect) {
      stateClass = 'option-card-wrong';
      labelClass = 'bg-red-500 text-white';
    } else {
      stateClass = isDark
        ? 'opacity-50 cursor-not-allowed'
        : 'opacity-40 cursor-not-allowed';
      labelClass = isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-500';
    }
  } else {
    labelClass = isDark
      ? 'bg-violet-500/30 text-violet-300'
      : 'bg-violet-100 text-violet-700';
  }

  const baseCard = isDark
    ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/50'
    : 'bg-white/60 border border-gray-200 hover:bg-white hover:border-violet-400';

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileHover={!hasAnswered ? { scale: 1.02, x: 4 } : {}}
      whileTap={!hasAnswered ? { scale: 0.98 } : {}}
      onClick={() => !hasAnswered && onSelect(option)}
      disabled={hasAnswered}
      className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 ${baseCard} ${stateClass} ${
        !hasAnswered ? 'cursor-pointer' : ''
      }`}
    >
      {/* Label badge */}
      <span
        className={`w-9 h-9 min-w-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-300 ${labelClass}`}
      >
        {LABELS[index]}
      </span>

      {/* Option text */}
      <span
        className={`flex-1 text-sm md:text-base font-medium ${
          isDark ? 'text-gray-100' : 'text-gray-800'
        } ${hasAnswered && !isCorrect && !isSelected ? 'text-gray-500' : ''}`}
      >
        {decoded}
      </span>

      {/* Result icon */}
      {hasAnswered && isCorrect && (
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-green-400 text-xl"
        >
          ✓
        </motion.span>
      )}
      {hasAnswered && isSelected && !isCorrect && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-red-400 text-xl"
        >
          ✗
        </motion.span>
      )}
    </motion.button>
  );
}
