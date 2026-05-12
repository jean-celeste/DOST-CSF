export const QUESTION_TYPES = {
  RATING: 'rating',
  CHECKMARK: 'checkmark',
  TEXT: 'text',
  RADIO: 'radio',
  TEXTAREA: 'textarea'
};

/**
 * Infers the question type for legacy forms based on formId and questionId
 * CSM-ARTA (formId=1): Questions 1-3 are checkmark, 4-12 are rating
 * QMS-F4 (formId=2): Questions 13-17 are checkmark, 18-29 are rating
 * Other forms default to TEXT type
 */
export function inferLegacyQuestionType(formId, questionId) {
  // Validate inputs
  const numFormId = Number(formId);
  const numQuestionId = Number(questionId);
  
  if (!Number.isFinite(numFormId) || !Number.isFinite(numQuestionId)) {
    console.warn(`Invalid inputs to inferLegacyQuestionType: formId=${formId}, questionId=${questionId}`);
    return QUESTION_TYPES.TEXT;
  }

  if (numFormId === 1) {
    return numQuestionId <= 3 ? QUESTION_TYPES.CHECKMARK : QUESTION_TYPES.RATING;
  }

  if (numFormId === 2) {
    return numQuestionId >= 13 && numQuestionId <= 17 ? QUESTION_TYPES.CHECKMARK : QUESTION_TYPES.RATING;
  }

  return QUESTION_TYPES.TEXT;
}

export function normalizeQuestionRow(question, formId) {
  if (!question || typeof question !== 'object' || !question.question_id) {
    throw new Error('Invalid question object: must have question_id property');
  }

  const questionType = question.question_type || inferLegacyQuestionType(formId, question.question_id);

  return {
    ...question,
    question_type: questionType,
    question_order: question.question_order ?? question.question_id
  };
}