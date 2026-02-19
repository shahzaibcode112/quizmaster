# Project Memory

## Working Directory
- Primary path: `d:\website` (Node CWD), access via `node -e "..."` or `cd quizmaster && ...`
- Shell is bash but on Windows — use `cd quizmaster && npm ...` pattern for npm commands
- Never use `ls`, `cat`, `pwd` directly — they fail. Use Node.js or dedicated tools.

## QuizMaster Project (`d:\website\quizmaster`)
- Stack: React 19 + Vite 7 + Tailwind CSS v4 (@tailwindcss/vite plugin) + Framer Motion + React Router DOM
- Tailwind v4 config: `@import "tailwindcss"` in index.css, `tailwindcss()` plugin in vite.config.js — NO tailwind.config.js needed
- State: useReducer in QuizContext.jsx, wrapped in BrowserRouter + QuizProvider in main.jsx
- API: OpenTDB (opentdb.com) — no key required; categories from /api_category.php, questions from /api.php
- localStorage key: `quizmaster_leaderboard`

## Tailwind v4 Key Differences
- No `tailwind.config.js` — configuration is CSS-first
- Plugin: `@tailwindcss/vite` (not postcss)
- Import: `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Custom utilities go in `@layer utilities {}`
