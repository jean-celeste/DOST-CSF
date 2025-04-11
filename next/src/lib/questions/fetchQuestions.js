export async function fetchQuestions(formId) {
  try {
    const response = await fetch(`/api/questions?formId=${formId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

export function groupQuestions(questions) {
  // Group questions into checkmark and rating questions
  const checkmarkQuestions = questions.filter(q => q.question_id <= 3);
  const ratingQuestions = questions.filter(q => q.question_id > 3);

  return {
    checkmarkQuestions,
    ratingQuestions
  };
} 