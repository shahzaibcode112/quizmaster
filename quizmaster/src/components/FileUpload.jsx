import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../context/QuizContext';

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file) {
  if (!file) return '📄';
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return '📕';
  if (ext === 'docx' || ext === 'doc') return '📘';
  return '📄';
}

export default function FileUpload({ onFileSelect, isLoading, disabled }) {
  const { isDark } = useQuiz();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return 'Only PDF and Word (.docx) files are supported.';
    }
    if (file.size > 20 * 1024 * 1024) {
      return 'File size must be under 20 MB.';
    }
    return null;
  };

  const handleFile = useCallback(
    (file) => {
      const err = validateFile(file);
      if (err) {
        setError(err);
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled || isLoading) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile, disabled, isLoading]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !isLoading) setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const isInteractive = !disabled && !isLoading;

  return (
    <div className="space-y-3">
      <motion.div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => isInteractive && inputRef.current?.click()}
        animate={{
          scale: isDragOver ? 1.02 : 1,
        }}
        transition={{ duration: 0.15 }}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isInteractive ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
        } ${
          isDragOver
            ? isDark
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-violet-400 bg-violet-50'
            : selectedFile
            ? isDark
              ? 'border-violet-600/60 bg-white/5'
              : 'border-violet-400/60 bg-white/60'
            : isDark
            ? 'border-white/15 bg-white/5 hover:border-white/25 hover:bg-white/8'
            : 'border-gray-200 bg-white/60 hover:border-violet-300 hover:bg-white/80'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={onInputChange}
          className="hidden"
          disabled={!isInteractive}
        />

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <svg
                className="w-10 h-10 animate-spin text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Processing file…
              </p>
            </motion.div>
          ) : selectedFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-4xl">{getFileIcon(selectedFile)}</span>
              <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {selectedFile.name}
              </p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatBytes(selectedFile.size)}
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                Click to change file
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                className="text-5xl"
              >
                📂
              </motion.div>
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Drop your file here
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  or{' '}
                  <span className="text-violet-400 font-medium">click to browse</span>
                </p>
              </div>
              <div className="flex gap-2 mt-1">
                {['PDF', 'DOCX'].map((type) => (
                  <span
                    key={type}
                    className={`text-xs px-2 py-1 rounded-md font-mono font-bold ${
                      isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-red-400 flex items-center gap-1.5 px-1"
          >
            <span>⚠️</span> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
