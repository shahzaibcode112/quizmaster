import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import TimerBar from '../components/TimerBar';
import QuestionCard from '../components/QuestionCard';
import OptionCard from '../components/OptionCard';

const TIMER_DURATION = 30;
const NEXT_DELAY = 1200; // ms after selecting before auto-advancing

export default function Quiz() {
  const navigate = useNavigate();
  const {
    questions, currentIndex, selectedAnswer,
    score, isDark,
    selectAnswer, nextQuestion, finishQuiz,
  } = useQuiz();

  const autoAdvanceTimer = useRef(null);

  // Redirect if no questions loaded
  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/', { replace: true });
    }
  }, [questions, navigate]);

  const isLastQuestion = currentIndex >= questions.length - 1;

  const advance = useCallback(() => {
    if (isLastQuestion) {
      finishQuiz();
      navigate('/results');
    } else {
      nextQuestion();
    }
  }, [isLastQuestion, finishQuiz, nextQuestion, navigate]);

  // Auto-advance after selecting an answer
  useEffect(() => {
    if (selectedAnswer !== null) {
      autoAdvanceTimer.current = setTimeout(advance, NEXT_DELAY);
    }
    return () => clearTimeout(autoAdvanceTimer.current);
  }, [selectedAnswer, advance]);

  const handleTimerExpire = useCallback(() => {
    if (selectedAnswer === null) {
      // No answer → counts as wrong via NEXT_QUESTION action
      advance();
    }
  }, [selectedAnswer, advance]);

  if (!questions || questions.length === 0) return null;

  const question = questions[currentIndex];
  const progressPct = ((currentIndex) / questions.length) * 100;

  return (
    <div className={`min-h-screen pt-24 pb-12 px-4 ${isDark ? 'gradient-bg' : 'gradient-bg-light'}`}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Top bar: progress + score */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 ${isDark ? 'card-glass' : 'card-glass-light'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Question{' '}
              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                {currentIndex + 1}
              </span>
              <span className="text-gray-500"> / {questions.length}</span>
            </span>
            <motion.div
              key={score}
              initial={{ scale: 1.3, color: '#a78bfa' }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-2 text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}
            >
              <span className="text-yellow-400">⭐</span>
              Score: {score}
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className={`w-full h-2 rounded-full mb-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Timer */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TimerBar
                key={currentIndex}
                duration={TIMER_DURATION}
                onExpire={handleTimerExpire}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <QuestionCard
              question={question}
              questionNumber={currentIndex + 1}
              total={questions.length}
            />
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`options-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {question.options.map((option, idx) => (
              <OptionCard
                key={option}
                option={option}
                index={idx}
                correctAnswer={question.correct_answer}
                selectedAnswer={selectedAnswer}
                onSelect={selectAnswer}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Next button (visible after selecting) */}
        <AnimatePresence>
          {selectedAnswer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={advance}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-violet-500/30"
              >
                {isLastQuestion ? 'See Results →' : 'Next Question →'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
