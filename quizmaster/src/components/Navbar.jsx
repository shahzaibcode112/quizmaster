import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';

export default function Navbar() {
  const { isDark, toggleTheme } = useQuiz();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 ${
        isDark ? 'card-glass' : 'card-glass-light'
      }`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            Q
          </motion.div>
          <span
            className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}
          >
            Quiz<span className="text-gradient">Master</span>
          </span>
        </Link>

        {/* Nav links + theme toggle */}
        <div className="flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                location.pathname === link.to
                  ? 'bg-violet-500/20 text-violet-400'
                  : isDark
                  ? 'text-gray-300 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Theme Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isDark
                ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
