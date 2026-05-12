export const FORM_STEPS = [
  {
    step: 1,
    title: "Personal Details",
    mobileTitle: "Personal\nDetails",
    description: "All these details are needed to be accomplished.",
    icon: "UserIcon"
  },
  {
    step: 2,
    title: "Citizen's Charter",
    mobileTitle: "CC",
    description: "Please answer questions about the Citizen's Charter.",
    icon: "CheckSquareIcon"
  },
  {
    step: 3,
    title: "Service Ratings",
    mobileTitle: "SQD",
    description: "Rate your satisfaction with our services.",
    icon: "SmileIcon"
  },
  {
    step: 4,
    title: "QMS Ratings",
    mobileTitle: "Checkmark",
    description: "Rate your experience",
    icon: "SmileIcon"
  },
  {
    step: 5,
    title: "QMS Checkmark",
    mobileTitle: "QMS",
    description: "Please provide feedback",
    icon: "QrCodeIcon"
  },
  {
    step: 6,
    title: "Suggestions",
    mobileTitle: "Suggestions",
    description: "Share your suggestions to help us improve.",
    icon: "MessageSquare"
  },
  {
    step: 7,
    title: "Review",
    mobileTitle: "Review",
    description: "Review your answers before submission.",
    icon: "ClipboardListIcon"
  }
]

export const INITIAL_FORM_STATE = {
  showMainForm: false,
  currentStep: 1
}

export const INITIAL_PERSONAL_DETAILS = {
  email: '',
  contact: '',
  service_id: null,
  service_name: '',
  office_name: '',
  unit_name: '',
  service_type_name: '',
  sex: '',
  age: ''
}

export const INITIAL_CSM_ARTA_CHECKMARK = {
  selectedOption: undefined,
  additionalAnswers: {}
}

export const INITIAL_CSM_ARTA_RATINGS = {
  ratings: {},
  currentPage: 0
}

export const INITIAL_QMS_CHECKMARK = {
  selections: {}
}

export const INITIAL_QMS_RATINGS = {
  ratings: {},
  currentPage: 0
}

export const INITIAL_SUGGESTION = {
  reasonForLowScore: '',
  generalComments: ''
}

/**
 * Question type constants matching the question_type table
 */
export const QUESTION_TYPES = {
  RATING: 'rating',
  CHECKMARK: 'checkmark',
  TEXT: 'text',
  RADIO: 'radio',
  TEXTAREA: 'textarea'
}

/**
 * Builds dynamic steps from a form definition fetched from the API.
 * The form definition should contain:
 * - form_id, form_title, description, status_id
 * - questions: [{ question_id, question_text, question_type, options }]
 * - linked_services: [{ service_id, service_name, form_order }]
 *
 * Returns an array of step objects compatible with the ProgressIndicator
 * and the dynamic form renderer.
 *
 * @param {Object} formDef - The form definition from the API
 * @param {string} clientType - The client type (internal/citizen/business/government)
 * @returns {Array} Array of dynamic step objects
 */
export function buildStepsFromFormDefinition(formDef, clientType = 'internal') {
  if (!formDef || !formDef.questions) {
    return [];
  }

  const { questions = [], form_id, form_title } = formDef;
  const steps = [];
  let stepNumber = 1;

  // Step 1: Personal Details (always present)
  steps.push({
    step: stepNumber,
    title: 'Personal Details',
    mobileTitle: 'Personal\nDetails',
    description: 'All these details are needed to be accomplished.',
    icon: 'UserIcon',
    type: 'personal',
    isDynamic: false
  });
  stepNumber++;

  // Step 2: Dynamic Questions from form definition
  // Group questions by their logical section based on question_type
  const ratingQuestions = questions.filter(q => q.question_type === QUESTION_TYPES.RATING);
  const checkmarkQuestions = questions.filter(q => q.question_type === QUESTION_TYPES.CHECKMARK);
  const textQuestions = questions.filter(q => q.question_type === QUESTION_TYPES.TEXT || q.question_type === QUESTION_TYPES.TEXTAREA);
  const radioQuestions = questions.filter(q => q.question_type === QUESTION_TYPES.RADIO);

  // For backward compatibility with form_id 1 (CSM-ARTA) and form_id 2 (QMS-F4):
  // If no question_type is specified, use legacy grouping based on question_id ranges
  if (questions.length > 0 && !questions[0].question_type) {
    // Legacy mode: derive steps from question IDs and formId
    if (form_id === 1) {
      // CSM-ARTA: questions 1-3 are checkmark, 4-12 are ratings
      const legacyCheckmark = questions.filter(q => q.question_id <= 3);
      const legacyRatings = questions.filter(q => q.question_id > 3);

      if (legacyCheckmark.length > 0) {
        steps.push({
          step: stepNumber,
          title: "Citizen's Charter",
          mobileTitle: 'CC',
          description: 'Please answer questions about the Citizen\'s Charter.',
          icon: 'CheckSquareIcon',
          type: 'checkmark',
          isDynamic: false,
          questions: legacyCheckmark,
          component: 'csm-arta-checkmark'
        });
        stepNumber++;
      }

      if (legacyRatings.length > 0) {
        steps.push({
          step: stepNumber,
          title: 'Service Ratings',
          mobileTitle: 'SQD',
          description: 'Rate your satisfaction with our services.',
          icon: 'SmileIcon',
          type: 'ratings',
          isDynamic: false,
          questions: legacyRatings,
          component: 'csm-arta-ratings'
        });
        stepNumber++;
      }
    } else if (form_id === 2) {
      // QMS-F4: questions 13-17 are checkmarks, 18-23 are ratings
      const legacyCheckmark = questions.filter(q => q.question_id >= 13 && q.question_id <= 17);
      const legacyRatings = questions.filter(q => q.question_id >= 18 && q.question_id <= 29);

      if (legacyRatings.length > 0) {
        steps.push({
          step: stepNumber,
          title: 'QMS Ratings',
          mobileTitle: 'Ratings',
          description: 'Rate your experience',
          icon: 'SmileIcon',
          type: 'ratings',
          isDynamic: false,
          questions: legacyRatings,
          component: 'qms-ratings'
        });
        stepNumber++;
      }

      if (legacyCheckmark.length > 0) {
        steps.push({
          step: stepNumber,
          title: 'QMS Checkmark',
          mobileTitle: 'Checkmark',
          description: 'Please provide feedback',
          icon: 'QrCodeIcon',
          type: 'checkmark',
          isDynamic: false,
          questions: legacyCheckmark,
          component: 'qms-checkmark'
        });
        stepNumber++;
      }
    }
  } else if (questions.length > 0 && questions[0].question_type) {
    // New dynamic mode: use question_type to create steps

    // Rating questions step
    if (ratingQuestions.length > 0) {
      steps.push({
        step: stepNumber,
        title: 'Ratings',
        mobileTitle: 'Ratings',
        description: 'Rate your satisfaction with the service.',
        icon: 'SmileIcon',
        type: 'ratings',
        isDynamic: true,
        questions: ratingQuestions,
        component: 'dynamic-rating'
      });
      stepNumber++;
    }

    // Checkmark questions step
    if (checkmarkQuestions.length > 0) {
      steps.push({
        step: stepNumber,
        title: 'Checklist',
        mobileTitle: 'Checklist',
        description: 'Select the options that apply to your experience.',
        icon: 'CheckSquareIcon',
        type: 'checkmark',
        isDynamic: true,
        questions: checkmarkQuestions,
        component: 'dynamic-checkmark'
      });
      stepNumber++;
    }

    // Radio questions step
    if (radioQuestions.length > 0) {
      steps.push({
        step: stepNumber,
        title: 'Selection',
        mobileTitle: 'Selection',
        description: 'Select one option for each question.',
        icon: 'CheckSquareIcon',
        type: 'radio',
        isDynamic: true,
        questions: radioQuestions,
        component: 'dynamic-radio'
      });
      stepNumber++;
    }

    // Text questions step
    if (textQuestions.length > 0) {
      steps.push({
        step: stepNumber,
        title: 'Additional Feedback',
        mobileTitle: 'Feedback',
        description: 'Provide additional comments or feedback.',
        icon: 'MessageSquare',
        type: 'text',
        isDynamic: true,
        questions: textQuestions,
        component: 'dynamic-text'
      });
      stepNumber++;
    }
  }

  // Suggestion step (always present for feedback forms)
  steps.push({
    step: stepNumber,
    title: 'Suggestions',
    mobileTitle: 'Suggestions',
    description: 'Share your suggestions to help us improve.',
    icon: 'MessageSquare',
    type: 'suggestion',
    isDynamic: false
  });
  stepNumber++;

  // Review step (always present)
  steps.push({
    step: stepNumber,
    title: 'Review',
    mobileTitle: 'Review',
    description: 'Review your answers before submission.',
    icon: 'ClipboardListIcon',
    type: 'review',
    isDynamic: false
  });

  return steps;
}

/**
 * Determines which steps should be active based on client type.
 * External clients skip QMS-specific steps; internal clients see all steps.
 *
 * @param {string} clientType - The client type (internal/citizen/business/government)
 * @param {Array} steps - Array of step objects from buildStepsFromFormDefinition
 * @returns {Array} Array of active step numbers
 */
export function getActiveSteps(clientType, steps) {
  const isExternal = ['citizen', 'business', 'government'].includes(clientType);

  return steps
    .filter(step => {
      // Always include personal, suggestion, and review steps
      if (['personal', 'suggestion', 'review'].includes(step.type)) {
        return true;
      }

      // For external clients, only show checkmark and rating steps from CSM form
      if (isExternal) {
        return ['checkmark', 'ratings', 'radio'].includes(step.type);
      }

      // Internal clients see all steps
      return true;
    })
    .map(step => step.step);
}

/**
 * Builds the initial answers object from a list of questions.
 * Each answer is initialized to null/empty.
 *
 * @param {Array} questions - Array of question objects [{ question_id, question_type }]
 * @returns {Object} Initial answers object keyed by question_id
 */
export function buildInitialAnswers(questions) {
  if (!questions || !Array.isArray(questions)) {
    return {};
  }

  return questions.reduce((acc, question) => {
    const { question_id, question_type } = question;

    switch (question_type) {
      case QUESTION_TYPES.RATING:
      case QUESTION_TYPES.RADIO:
        acc[question_id] = null;
        break;
      case QUESTION_TYPES.CHECKMARK:
        acc[question_id] = false;
        break;
      case QUESTION_TYPES.TEXT:
      case QUESTION_TYPES.TEXTAREA:
        acc[question_id] = '';
        break;
      default:
        acc[question_id] = null;
    }

    return acc;
  }, {});
}

/**
 * Determines the form ID to use for submission based on the service's
 * linked forms. Falls back to the provided defaultFormId or infers
 * from client type for backward compatibility.
 *
 * @param {Array} linkedForms - Array of linked form objects [{ form_id, form_order }]
 * @param {string} clientType - The client type (internal/citizen/business/government)
 * @returns {number|null} The form ID to use, or null if undetermined
 */
export function determineFormId(linkedForms = [], clientType = 'internal') {
  if (linkedForms && linkedForms.length > 0) {
    // Sort by form_order and return the first active form
    const sorted = [...linkedForms].sort((a, b) => (a.form_order || 1) - (b.form_order || 1));
    return sorted[0]?.form_id || null;
  }

  // Fallback based on client type for backward compatibility
  const isExternal = ['citizen', 'business', 'government'].includes(clientType);
  return isExternal ? 1 : 2;
} 