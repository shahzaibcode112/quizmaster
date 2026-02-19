import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';
import FileUpload from './FileUpload';
import { extractTextFromFile } from '../utils/extractText';
import { generateQuestionsFromText } from '../utils/openrouter';
import { shuffleArray } from '../utils/helpers';

const STEPS = [
  { id: 'upload', label: 'File uploaded', icon: '📄' },
  { id: 'extract', label: 'Extracting text…', icon: '🔍' },
  { id: 'generate', label: 'Claude is generating questions…', icon: '🤖' },
  { id: 'ready', label: 'Questions ready!', icon: '✅' },
];

function StepRow({ step, status, isDark }) {
  // status: 'done' | 'active' | 'pending'
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
        status === 'done'
          ? isDark
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-green-50 border-green-200'
          : status === 'active'
          ? isDark
            ? 'bg-violet-500/10 border-violet-500/30'
            : 'bg-violet-50 border-violet-200'
          : isDark
          ? 'bg-white/5 border-white/10'
          : 'bg-gray-50 border-gray-100'
      }`}
    >
      <div className="w-7 h-7 flex items-center justify-center shrink-0">
        {status === 'done' ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">
            ✅
          </motion.span>
        ) : status === 'active' ? (
          <svg
            className="w-5 h-5 animate-spin text-violet-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          <span className="text-lg opacity-35">{step.icon}</span>
        )}
      </div>
      <span
        className={`text-sm font-medium ${
          status === 'done'
            ? isDark
              ? 'text-green-400'
              : 'text-green-700'
            : status === 'active'
            ? isDark
              ? 'text-violet-300'
              : 'text-violet-700'
            : isDark
            ? 'text-gray-500'
            : 'text-gray-400'
        }`}
      >
        {step.label}
      </span>
    </motion.div>
  );
}

function StepIndicator({ currentStep, isDark }) {
  const activeIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-2">
      {STEPS.map((step, i) => {
        const status =
          currentStep === 'ready' || i < activeIndex
            ? 'done'
            : i === activeIndex
            ? 'active'
            : 'pending';
        return (
          <StepRow
            key={step.id}
            step={step}
            status={status}
            isDark={isDark}
          />
        );
      })}
    </div>
  );
}

export default function AIQuizGenerator({ onQuestionsReady }) {
  const { isDark } = useQuiz();
  // phase: 'idle' | 'processing' | 'ready' | 'error'
  const [phase, setPhase] = useState('idle');
  const [currentStep, setCurrentStep] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [questions, setQuestions] = useState(null);

  const handleFileSelect = useCallback(async (file) => {
    setPhase('processing');
    setErrorMsg(null);
    setCurrentStep('upload');

    try {
      setCurrentStep('extract');
      const text = await extractTextFromFile(file);

      if (!text || text.trim().length < 80) {
        throw new Error(
          'Not enough text could be extracted from this file. Make sure the document has readable text content (not just images).'
        );
      }

      setCurrentStep('generate');
      const rawQuestions = await generateQuestionsFromText(text);

      // Mirror the same processing that Home.jsx does
      const processed = rawQuestions.map((q) => ({
        ...q,
        options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
      }));

      setQuestions(processed);
      setCurrentStep('ready');
      setPhase('ready');
    } catch (err) {
      setPhase('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  }, []);

  const handleRetry = () => {
    setPhase('idle');
    setCurrentStep(null);
    setErrorMsg(null);
    setQuestions(null);
  };

  const handleStartQuiz = () => {
    if (questions) onQuestionsReady(questions);
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <FileUpload onFileSelect={handleFileSelect} isLoading={false} disabled={false} />
          </motion.div>
        )}

        {/* ── PROCESSING ── */}
        {phase === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <FileUpload onFileSelect={handleFileSelect} isLoading={true} disabled={true} />
            <StepIndicator currentStep={currentStep} isDark={isDark} />
          </motion.div>
        )}

        {/* ── READY ── */}
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <StepIndicator currentStep="ready" isDark={isDark} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className={`rounded-2xl p-5 text-center ${
                isDark
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              <motion.p
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl mb-2"
              >
                🎉
              </motion.p>
              <p className={`font-bold text-lg ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                {questions?.length ?? 10} questions generated!
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Ready to test your knowledge
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartQuiz}
              className="w-full py-4 rounded-xl font-bold text-base bg-linear-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-shadow duration-200"
            >
              🚀 Start AI Quiz
            </motion.button>

            <button
              onClick={handleRetry}
              className={`w-full py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload a different file
            </button>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <motion.div
              className={`rounded-2xl p-6 text-center ${
                isDark
                  ? 'bg-red-500/10 border border-red-500/30'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <p className="text-4xl mb-3">❌</p>
              <p className={`font-semibold mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                Something went wrong
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {errorMsg}
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="w-full py-3 rounded-xl font-bold text-sm bg-linear-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20"
            >
              🔄 Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
