import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import { fetchCategories, fetchQuestions } from '../utils/api';
import { shuffleArray } from '../utils/helpers';
import { Link } from 'react-router-dom';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'text-green-400', icon: '😊' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-400', icon: '🤔' },
  { value: 'hard', label: 'Hard', color: 'text-red-400', icon: '🔥' },
];

const QUESTION_COUNTS = [5, 10, 15];

export default function Home() {
  const navigate = useNavigate();
  const {
    playerName, setPlayerName, setSettings, startQuiz,
    setLoading, setError, isLoading, error, isDark,
    category, difficulty, numQuestions,
  } = useQuiz();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [localCategory, setLocalCategory] = useState(category);
  const [localCategoryName, setLocalCategoryName] = useState('Any Category');
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);
  const [localNum, setLocalNum] = useState(numQuestions);

  useEffect(() => {
    fetchCategories()
      .then((cats) => setCategories(cats))
      .catch(() => setCategories([]))
      .finally(() => setCatLoading(false));
  }, []);

  const handleStart = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    setError(null);
    setSettings({
      category: localCategory,
      categoryName: localCategoryName,
      difficulty: localDifficulty,
      numQuestions: localNum,
    });
    try {
      const raw = await fetchQuestions({
        amount: localNum,
        category: localCategory,
        difficulty: localDifficulty,
      });
      // Attach shuffled options to each question
      const processed = raw.map((q) => ({
        ...q,
        options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
      }));
      startQuiz(processed);
      navigate('/quiz');
    } catch (err) {
      setError(err.message || 'Failed to load questions. Please try again.');
    }
  };

  const isValid = playerName.trim().length > 0;

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
        className="max-w-xl mx-auto"
      >
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, repeatDelay: 3, duration: 0.6 }}
            className="text-7xl mb-4"
          >
            🧠
          </motion.div>
          <h1 className={`text-5xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quiz<span className="text-gradient">Master</span>
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Test your knowledge across hundreds of topics
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          variants={itemVariants}
          className={`rounded-2xl p-6 md:p-8 space-y-6 ${isDark ? 'card-glass' : 'card-glass-light'}`}
        >
          {/* Player name */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={30}
              className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:border-violet-500 focus:bg-white/15'
                  : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              }`}
            />
          </div>

          {/* Category */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={localCategory}
              onChange={(e) => {
                setLocalCategory(e.target.value);
                const opt = e.target.options[e.target.selectedIndex];
                setLocalCategoryName(opt.text);
              }}
              disabled={catLoading}
              className={`w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white focus:border-violet-500 focus:bg-white/15'
                  : 'bg-white border border-gray-200 text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              }`}
            >
              <option value="any">{catLoading ? 'Loading categories...' : 'Any Category'}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-gray-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTIES.map((d) => (
                <motion.button
                  key={d.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLocalDifficulty(d.value)}
                  className={`py-3 rounded-xl text-sm font-semibold flex flex-col items-center gap-1 transition-all duration-200 ${
                    localDifficulty === d.value
                      ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30'
                      : isDark
                      ? 'bg-white/10 border border-white/10 text-gray-300 hover:bg-white/15'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                  }`}
                >
                  <span className="text-xl">{d.icon}</span>
                  <span>{d.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Number of questions */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Number of Questions
            </label>
            <div className="grid grid-cols-3 gap-3">
              {QUESTION_COUNTS.map((n) => (
                <motion.button
                  key={n}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLocalNum(n)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    localNum === n
                      ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30'
                      : isDark
                      ? 'bg-white/10 border border-white/10 text-gray-300 hover:bg-white/15'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                  }`}
                >
                  {n} Qs
                </motion.button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Start button */}
          <motion.button
            whileHover={isValid && !isLoading ? { scale: 1.02, y: -2 } : {}}
            whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
            onClick={handleStart}
            disabled={!isValid || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 ${
              isValid && !isLoading
                ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50'
                : isDark
                ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading Questions...
              </span>
            ) : (
              '🚀 Start Quiz'
            )}
          </motion.button>

          {/* AI Quiz button */}
          <div className="relative">
            <div className="absolute -inset-px rounded-xl bg-linear-to-r from-violet-500 via-fuchsia-500 to-blue-500 opacity-70 blur-sm" />
            <Link to="/ai-quiz" className="relative block">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl font-bold text-base text-center transition-all duration-200 flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-gray-900 text-white border border-white/10'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <span>🤖 AI Quiz — Upload Your Notes</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-linear-to-r from-violet-500 to-blue-500 text-white ml-1">
                  NEW
                </span>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.p
          variants={itemVariants}
          className={`text-center text-sm mt-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
        >
          Questions powered by{' '}
          <a
            href="https://opentdb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
          >
            Open Trivia DB
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}
