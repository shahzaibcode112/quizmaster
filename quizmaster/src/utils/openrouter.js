export async function generateQuestionsFromText(text) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.'
    );
  }

  // Truncate to avoid exceeding token limits (~8000 chars ≈ ~2000 tokens of context)
  const truncatedText = text.length > 8000 ? text.slice(0, 8000) + '...' : text;

  const prompt = `You are a quiz generator. Based on the following study material, generate exactly 10 multiple choice questions. Each question must have exactly 4 options and one correct answer.

Return ONLY a valid JSON array in this exact format, nothing else:
[
  {
    "question": "Question text here?",
    "correct_answer": "Correct option here",
    "incorrect_answers": ["Wrong 1", "Wrong 2", "Wrong 3"]
  }
]

Study Material:
${truncatedText}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'QuizMaster AI',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = errorData?.error?.message || `API error ${response.status}: ${response.statusText}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error('No response received from Claude. Please try again.');
  }

  // Strip markdown code fences if Claude wrapped the JSON
  const cleaned = rawContent
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let questions;
  try {
    questions = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse Claude's response as JSON. Please try again.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('Claude returned an unexpected format. Please try again.');
  }

  // Validate shape of each question
  const valid = questions.every(
    (q) =>
      typeof q.question === 'string' &&
      typeof q.correct_answer === 'string' &&
      Array.isArray(q.incorrect_answers) &&
      q.incorrect_answers.length === 3
  );

  if (!valid) {
    throw new Error('Some questions have an invalid format. Please try again.');
  }

  return questions;
}
