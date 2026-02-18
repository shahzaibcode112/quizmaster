import { createContext, useContext, useReducer, useCallback } from 'react';

const QuizContext = createContext(null);

const initialState = {
  // Settings
  playerName: '',
  category: 'any',
  categoryName: 'Any Category',
  difficulty: 'easy',
  numQuestions: 10,

  // Quiz runtime
  questions: [],
  currentIndex: 0,
  selectedAnswer: null,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  answers: [],          // { question, correct, selected, isCorrect }
  startTime: null,
  timeTaken: 0,
  isLoading: false,
  error: null,

  // Theme
  isDark: true,
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.payload };

    case 'SET_SETTINGS':
      return { ...state, ...action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'START_QUIZ':
      return {
        ...state,
        questions: action.payload,
        currentIndex: 0,
        selectedAnswer: null,
        score: 0,
        correctCount: 0,
        wrongCount: 0,
        answers: [],
        startTime: Date.now(),
        timeTaken: 0,
        isLoading: false,
        error: null,
      };

    case 'SELECT_ANSWER': {
      const question = state.questions[state.currentIndex];
      const isCorrect = action.payload === question.correct_answer;
      const answerRecord = {
        question: question.question,
        correct: question.correct_answer,
        selected: action.payload,
        isCorrect,
      };
      return {
        ...state,
        selectedAnswer: action.payload,
        score: isCorrect ? state.score + 1 : state.score,
        correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
        wrongCount: isCorrect ? state.wrongCount : state.wrongCount + 1,
        answers: [...state.answers, answerRecord],
      };
    }

    case 'NEXT_QUESTION': {
      // If timer ran out (no answer selected), record a wrong answer
      if (state.selectedAnswer === null) {
        const question = state.questions[state.currentIndex];
        const answerRecord = {
          question: question.question,
          correct: question.correct_answer,
          selected: null,
          isCorrect: false,
        };
        return {
          ...state,
          currentIndex: state.currentIndex + 1,
          selectedAnswer: null,
          wrongCount: state.wrongCount + 1,
          answers: [...state.answers, answerRecord],
        };
      }
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        selectedAnswer: null,
      };
    }

    case 'FINISH_QUIZ':
      return {
        ...state,
        timeTaken: Math.floor((Date.now() - state.startTime) / 1000),
      };

    case 'RESET_QUIZ':
      return {
        ...initialState,
        playerName: state.playerName,
        isDark: state.isDark,
      };

    case 'TOGGLE_THEME':
      return { ...state, isDark: !state.isDark };

    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const setPlayerName = useCallback((name) => {
    dispatch({ type: 'SET_PLAYER_NAME', payload: name });
  }, []);

  const setSettings = useCallback((settings) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  }, []);

  const startQuiz = useCallback((questions) => {
    dispatch({ type: 'START_QUIZ', payload: questions });
  }, []);

  const selectAnswer = useCallback((answer) => {
    dispatch({ type: 'SELECT_ANSWER', payload: answer });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const finishQuiz = useCallback(() => {
    dispatch({ type: 'FINISH_QUIZ' });
  }, []);

  const resetQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME' });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const value = {
    ...state,
    setPlayerName,
    setSettings,
    startQuiz,
    selectAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
    toggleTheme,
    setLoading,
    setError,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside QuizProvider');
  return ctx;
}
