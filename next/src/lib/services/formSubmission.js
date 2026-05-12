/**
 * Generic form submission handler.
 * Supports both legacy forms (CSM-ARTA, QMS-F4) and the new dynamic form system.
 *
 * Submission payload structure:
 * {
 *   formId: number,
 *   serviceId: number,
 *   clientType: string,
 *   personalDetails: { ... },
 *   answers: {
 *     [questionId]: value,  // Dynamic answers keyed by question_id
 *     suggestions: {
 *       reasonForLowScore: string,
 *       generalComments: string
 *     },
 *     // Legacy support - preserved for backward compatibility
 *     csmARTACheckmark: { ... },
 *     csmARTARatings: { ... },
 *     qmsCheckmark: { ... },
 *     qmsRatings: { ... }
 *   }
 * }
 */
export async function submitForm(formData) {
  try {
    const {
      formId,
      serviceId,
      clientType,
      personalDetails,
      answers = {}
    } = formData;

    // Validate required fields
    if (!serviceId) {
      throw new Error('Service ID is required');
    }

    // Determine form ID from service if not explicitly provided
    let resolvedFormId = formId;
    if (!resolvedFormId) {
      const isExternal = ['citizen', 'business', 'government'].includes(clientType);
      resolvedFormId = isExternal ? 1 : 2; // Legacy fallback
    }

    // Build the generic answer payload
    // Combine dynamic answers with any legacy-formatted data for backward compatibility
    const submissionAnswers = {
      ...answers,
      // Preserve legacy keys for backward compatibility with existing response analysis
      ...(answers.personalDetails || personalDetails ? {
        personalDetails: personalDetails || answers.personalDetails
      } : {}),
      ...(answers.suggestions ? { suggestions: answers.suggestions } : {}),
      // Legacy support: if using old-style form data, include it
      ...(formData.csmARTACheckmark ? { csmARTACheckmark: formData.csmARTACheckmark } : {}),
      ...(formData.csmARTARatings ? { csmARTARatings: formData.csmARTARatings } : {}),
      ...(formData.qmsCheckmark ? { qmsCheckmark: formData.qmsCheckmark } : {}),
      ...(formData.qmsRatings ? { qmsRatings: formData.qmsRatings } : {})
    };

    // Make the API call
    const response = await fetch('/api/forms/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: resolvedFormId,
        serviceId: serviceId,
        clientType: clientType,
        personalDetails: personalDetails,
        answers: submissionAnswers
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `Failed to submit form (status: ${response.status})`);
    }
    return result;
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

/**
 * Submits feedback using the new dynamic answer format.
 * This is the preferred method for the dynamic form engine.
 *
 * @param {Object} params - Submission parameters
 * @param {number} params.formId - The form ID to submit
 * @param {number} params.serviceId - The service ID
 * @param {string} params.clientType - Client type (internal/citizen/business/government)
 * @param {Object} params.personalDetails - Personal details from step 1
 * @param {Object} params.dynamicAnswers - Answers keyed by question_id
 * @param {Object} params.suggestions - Suggestion feedback { reasonForLowScore, generalComments }
 * @returns {Promise<Object>} Submission result
 */
export async function submitDynamicForm({
  formId,
  serviceId,
  clientType,
  personalDetails,
  dynamicAnswers = {},
  suggestions = {}
}) {
  try {
    // Validate required fields
    if (!serviceId) {
      throw new Error('Service ID is required');
    }
    if (!formId) {
      throw new Error('Form ID is required for dynamic submission');
    }

    const response = await fetch('/api/forms/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId,
        serviceId,
        clientType,
        personalDetails,
        answers: {
          ...dynamicAnswers,
          suggestions
        }
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit form');
    }
    return result;
  } catch (error) {
    console.error('Dynamic form submission error:', error);
    throw error;
  }
}