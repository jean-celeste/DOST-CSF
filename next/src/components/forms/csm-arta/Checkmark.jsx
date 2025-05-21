'use client'

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { csmArtaOptions, csmArtaOptionsFilipino } from '@/lib/options/csm-arta-options'
import { fetchQuestions, groupQuestions } from '@/lib/questions/fetchQuestions'
import LoadingSpinner from '@/components/forms-resources/LoadingSpinner'
import { csmArtaCheckmarkFilipino } from '@/lib/constants/csmArtaQuestionsFilipino'

export default function Checkmark({ 
  onNextStep, 
  onPrevStep,
  formData,
  onFormDataChange,
  isReviewMode = false,
  formId = 1, // Default to CSM ARTA form
  language,
  toggleLanguage
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuestions(formId);
        
        const { checkmarkQuestions } = groupQuestions(fetchedQuestions, formId);
        
        setQuestions(checkmarkQuestions);
        setError(null);
      } catch (error) {
        console.error('Error loading questions:', error);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [formId]);

  // Select questions based on language
  const checkmarkQuestions = language === 'en'
    ? questions
    : csmArtaCheckmarkFilipino.map((q, i) => ({
        ...questions[i],
        question_text: q
      }));

  // Select options based on language
  const options = language === 'en' ? csmArtaOptions : csmArtaOptionsFilipino;

  // Use index for selectedOption
  const handleOptionChange = (optionIndex) => {
    // Compute which additional questions should be visible for this option index
    let visibleQuestionIds = [];
    if (optionIndex === 3) { // last option
      visibleQuestionIds = [];
    } else if (optionIndex === 2) { // third option
      visibleQuestionIds = [3]; // Only question 3
    } else {
      visibleQuestionIds = [2, 3]; // Both questions 2 and 3
    }

    // Clean up additionalAnswers: keep only those for visible questions
    const cleanedAdditionalAnswers = Object.fromEntries(
      Object.entries(formData.additionalAnswers || {}).filter(
        ([qid]) => visibleQuestionIds.includes(Number(qid))
      )
    );

    const englishValue = csmArtaOptions.ccAwareness[optionIndex];
    onFormDataChange({
      ...formData,
      selectedOption: englishValue, // store the English value
      selectedOptionIndex: optionIndex, // store the index for UI
      additionalAnswers: cleanedAdditionalAnswers
    });
  };

  const handleAdditionalOptionChange = (questionId, optionIndex) => {
    // Always store the English value
    let englishOption;
    if (questionId === 2) {
      englishOption = csmArtaOptions.ccVisibility[optionIndex];
    } else {
      englishOption = csmArtaOptions.ccHelpfulness[optionIndex];
    }
    onFormDataChange({
      ...formData,
      additionalAnswers: {
        ...formData.additionalAnswers,
        [questionId]: englishOption
      }
    });
  };

  const handleSubmit = () => {
    if (formData.selectedOption !== undefined) {
      onNextStep();
    }
  };

  // Use index for logic
  const shouldShowAdditionalQuestions = formData.selectedOptionIndex !== undefined && formData.selectedOptionIndex !== 3;

  // Filter questions based on selected option index
  const getVisibleQuestions = () => {
    if (!shouldShowAdditionalQuestions) return [];
    if (formData.selectedOptionIndex === 2) { // If third option selected
      return checkmarkQuestions.filter(q => q.question_id === 3); // Only show question 3
    }
    return checkmarkQuestions.filter(q => q.question_id > 1);
  };

  const areAllQuestionsAnswered = () => {
    if (!shouldShowAdditionalQuestions) return true;
    const visibleQuestions = getVisibleQuestions();
    return visibleQuestions.every(q => formData.additionalAnswers[q.question_id]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        {/* Language Toggle Button */}
        <div className="flex justify-end mb-4">
          <Button onClick={toggleLanguage} variant="outline">
            {language === 'en' ? 'Filipino' : 'English'}
          </Button>
        </div>
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              {checkmarkQuestions[0]?.question_text}
            </h2>
            <p className="text-gray-500">Please select the option that best describes your experience.</p>
          </div>
          <div className="space-y-4">
            {options.ccAwareness.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-6 rounded-xl text-left transition-all border-2
                  ${formData.selectedOptionIndex === index 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                onClick={() => handleOptionChange(index)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">{option}</span>
                  {formData.selectedOptionIndex === index && (
                    <div className="bg-blue-500 rounded-full p-2">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {shouldShowAdditionalQuestions && (
            <div className="space-y-8 mt-8 pt-8 border-t border-gray-100">
              {getVisibleQuestions().map((q) => (
                <div key={q.question_id} className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{checkmarkQuestions.find(qq => qq.question_id === q.question_id)?.question_text}</h3>
                    <p className="text-sm text-gray-500">Please select the most appropriate response.</p>
                  </div>
                  <div className="space-y-3">
                    {(q.question_id === 2 ? options.ccVisibility : options.ccHelpfulness).map((option, optionIndex) => (
                      <motion.button
                        key={optionIndex}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-6 rounded-xl text-left transition-all border-2
                          {formData.additionalAnswers[q.question_id] === (q.question_id === 2 ? csmArtaOptions.ccVisibility[optionIndex] : csmArtaOptions.ccHelpfulness[optionIndex])
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        onClick={() => handleAdditionalOptionChange(q.question_id, optionIndex)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium">{option}</span>
                          {formData.additionalAnswers[q.question_id] === (q.question_id === 2 ? csmArtaOptions.ccVisibility[optionIndex] : csmArtaOptions.ccHelpfulness[optionIndex]) && (
                            <div className="bg-blue-500 rounded-full p-2">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-20">
          <Button
            variant="outline"
            className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={onPrevStep}
          >
            Go Back
          </Button>
          <Button
            variant="gradient"
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md"
            onClick={handleSubmit}
            disabled={formData.selectedOption === undefined || !areAllQuestionsAnswered()}
          >
            {isReviewMode ? 'Return to Review' : 'Continue'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

Checkmark.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    selectedOption: PropTypes.string, // now stores English value
    selectedOptionIndex: PropTypes.number, // for UI
    additionalAnswers: PropTypes.object
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  isReviewMode: PropTypes.bool,
  formId: PropTypes.number,
  language: PropTypes.string.isRequired,
  toggleLanguage: PropTypes.func.isRequired
}