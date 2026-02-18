const BASE_URL = 'https://opentdb.com';

export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/api_category.php`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data.trivia_categories;
}

export async function fetchQuestions({ amount = 10, category, difficulty, type = 'multiple' }) {
  const params = new URLSearchParams({ amount, type });
  if (category && category !== 'any') params.append('category', category);
  if (difficulty && difficulty !== 'any') params.append('difficulty', difficulty);

  const res = await fetch(`${BASE_URL}/api.php?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  const data = await res.json();

  if (data.response_code !== 0) {
    const messages = {
      1: 'Not enough questions available for your selection. Try different options.',
      2: 'Invalid parameters. Please try again.',
      3: 'Token not found.',
      4: 'Token empty. Please reset and try again.',
    };
    throw new Error(messages[data.response_code] || 'Unknown API error');
  }

  return data.results;
}
