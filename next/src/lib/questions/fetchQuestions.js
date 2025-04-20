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

export function groupQuestions(questions, formId) {
  console.log('Grouping questions for formId:', formId);
  console.log('All questions:', questions);
  
  if (formId === 1) { // CSM ARTA form
    const checkmarkQuestions = questions.filter(q => q.question_id <= 3);
    const ratingQuestions = questions.filter(q => q.question_id > 3);
    console.log('CSM ARTA checkmark questions:', checkmarkQuestions);
    console.log('CSM ARTA rating questions:', ratingQuestions);
    return { checkmarkQuestions, ratingQuestions };
  } else if (formId === 3) { // QMS form
    // Questions 31-35 are for checkmarks
    const checkmarkQuestions = questions.filter(q => q.question_id >= 31 && q.question_id <= 35);
    // Questions 25-30 are for ratings (including question_id=25)
    const ratingQuestions = questions.filter(q => q.question_id >= 25 && q.question_id <= 30);
    return { checkmarkQuestions, ratingQuestions };
  }
  return { checkmarkQuestions: [], ratingQuestions: [] };
} 