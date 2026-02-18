import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import ScoreCard from '../components/ScoreCard';
import { saveToLeaderboard } from '../utils/helpers';

export default function Results() {
  const navigate = useNavigate();
  const saved = useRef(false);
  const {
    score, questions, correctCount, wrongCount, timeTaken,
    playerName, categoryName, difficulty, isDark,
    resetQuiz, answers,
  } = useQuiz();

  const total = questions.length;

  // Redirect if no quiz data
  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/', { replace: true });
    }
  }, [questions, navigate]);

  // Save to leaderboard once
  useEffect(() => {
    if (saved.current || !playerName || !questions.length) return;
    saved.current = true;
    saveToLeaderboard({
      playerName,
      score,
      total,
      categoryName,
      difficulty,
      timeTaken,
      date: new Date().toISOString(),
    });
  }, []);

  const handlePlayAgain = () => {
    resetQuiz();
    navigate('/');
  };

  if (!questions || questions.length === 0) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 ${isDark ? 'gradient-bg' : 'gradient-bg-light'}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className={`text-4xl font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quiz Complete!
          </h1>
          <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Here's how you did, <span className={isDark ? 'text-violet-300' : 'text-violet-600'}>{playerName}</span>
          </p>
        </motion.div>

        {/* Score card */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl p-6 md:p-8 mb-6 ${isDark ? 'card-glass' : 'card-glass-light'}`}
        >
          <ScoreCard
            score={score}
            total={total}
            correctCount={correctCount}
            wrongCount={wrongCount}
            timeTaken={timeTaken}
          />
        </motion.div>

        {/* Answer review */}
        {answers && answers.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Answer Review
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {answers.map((a, i) => (
                <AnswerReview key={i} answer={a} index={i} isDark={isDark} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="flex gap-3 flex-col sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePlayAgain}
            className="flex-1 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-base shadow-lg shadow-violet-500/30"
          >
            🔄 Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/leaderboard')}
            className={`flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow'
            }`}
          >
            🏆 Leaderboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { resetQuiz(); navigate('/'); }}
            className={`flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow'
            }`}
          >
            🏠 Home
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function AnswerReview({ answer, index, isDark }) {
  const { decodeHTML } = { decodeHTML: (s) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = s;
    return txt.value;
  }};

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl p-4 ${
        answer.isCorrect
          ? isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
          : isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{answer.isCorrect ? '✅' : '❌'}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium mb-2 leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {decodeHTML(answer.question)}
          </p>
          <div className="space-y-1">
            {!answer.isCorrect && answer.selected && (
              <p className="text-xs text-red-400">
                Your answer: <span className="font-semibold">{decodeHTML(answer.selected)}</span>
              </p>
            )}
            {!answer.isCorrect && !answer.selected && (
              <p className="text-xs text-orange-400 font-semibold">⏰ Time ran out</p>
            )}
            <p className="text-xs text-green-400">
              Correct: <span className="font-semibold">{decodeHTML(answer.correct)}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
