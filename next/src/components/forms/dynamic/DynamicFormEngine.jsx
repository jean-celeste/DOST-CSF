'use client'

import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PersonalDetailsForm from '../PersonalDetailsForm'
import Suggestion from '../Suggestion'
import {
  buildStepsFromFormDefinition,
  getActiveSteps,
  buildInitialAnswers,
  determineFormId
} from '@/constants/formSteps'
import DynamicRatingQuestion from './DynamicRatingQuestion'
import DynamicCheckmarkQuestion from './DynamicCheckmarkQuestion'
import DynamicTextQuestion from './DynamicTextQuestion'
import LoadingSpinner from '../../forms-resources/LoadingSpinner'
import { cn } from '@/lib/utils'

/**
 * DynamicFormEngine
 *
 * A generic, data-driven form renderer that:
 * - Accepts a form definition (questions, types, validation rules)
 * - Renders appropriate UI per question type (rating, checkmark, text)
 * - Manages step progression dynamically
 * - Builds the answers JSON structure generically
 */
export default function DynamicFormEngine({
  formDefinition,
  clientType = 'internal',
  serviceId,
  onSubmit,
  onBack,
  onStepChange,
  initialAnswers = {},
  isReviewMode = false,
  language = 'en',
  onLanguageToggle
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [personalDetails, setPersonalDetails] = useState(initialAnswers.personalDetails || {})
  const [suggestions, setSuggestions] = useState(initialAnswers.suggestions || {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Build dynamic steps from form definition
  const dynamicSteps = buildStepsFromFormDefinition(formDefinition, clientType)
  const activeStepNumbers = getActiveSteps(clientType, dynamicSteps)
  const activeSteps = dynamicSteps.filter(s => activeStepNumbers.includes(s.step))

  // Initialize answers when form definition changes
  useEffect(() => {
    if (formDefinition?.questions) {
      setAnswers(prev => ({
        ...prev,
        ...buildInitialAnswers(formDefinition.questions)
      }))
    }
  }, [formDefinition])

  // Sync incoming initial answers
  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      setAnswers(prev => ({
        ...prev,
        ...initialAnswers
      }))
    }
  }, [initialAnswers])

  // Sync personalDetails when initialAnswers.personalDetails changes
  useEffect(() => {
    if (initialAnswers && initialAnswers.personalDetails) {
      setPersonalDetails(initialAnswers.personalDetails)
    }
  }, [initialAnswers?.personalDetails])

  // Ensure personalDetails contains service_id when serviceId prop changes
  useEffect(() => {
    if (serviceId && (!personalDetails || !personalDetails.service_id)) {
      setPersonalDetails(prev => ({ ...(prev || {}), service_id: serviceId }))
    }
  }, [serviceId])

  // Notify parent when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex)
    }
  }, [currentStepIndex, onStepChange])

  if (!formDefinition || !activeSteps.length) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    )
  }

  const currentStep = activeSteps[currentStepIndex]
  const totalSteps = activeSteps.length

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    } else if (currentStepIndex === 0) {
      // If on first dynamic step, go back to personal details or exit
      if (onBack) {
        onBack()
      }
    }
  }

  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    setError(null)
  }, [])

  const handlePersonalDetailsChange = useCallback((data) => {
    setPersonalDetails(data)
  }, [])

  const handleSuggestionChange = useCallback((field, value) => {
    setSuggestions(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  /**
   * Validate that all questions in the current step have required answers
   * Based on question types:
   * - rating: must have a numeric answer
   * - checkmark: optional (user can skip)
   * - text/textarea: optional (user can skip)
   * - radio: must have a selection
   */
  const validateCurrentStep = () => {
    if (!currentStep) return true

    // For review step, check all questions across the entire form
    if (currentStep.type === 'review') {
      if (!formDefinition?.questions) return true
      
      return formDefinition.questions.every(q => {
        const questionType = q.question_type || 'text'
        const answer = answers[q.question_id]
        
        // Rating and radio questions are required
        if (questionType === 'rating' || questionType === 'radio') {
          return answer !== null && answer !== undefined && answer !== ''
        }
        
        // Checkmark, text, and textarea are optional
        return true
      })
    }

    // For rating questions, check all have answers
    if (currentStep.type === 'ratings' && currentStep.questions) {
      return currentStep.questions.every(q => {
        const answer = answers[q.question_id]
        return answer !== null && answer !== undefined && answer !== ''
      })
    }

    // For checkmark questions, optional - no validation required
    if (currentStep.type === 'checkmark') {
      return true
    }

    // For text/suggestion questions, optional
    if (currentStep.type === 'text' || currentStep.type === 'suggestion') {
      return true
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      setError('Please answer all questions before proceeding.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Determine formId from form definition or linked forms
      const formId = formDefinition.form_id ||
        (formDefinition.linked_forms?.[0]?.form_id) ||
        null

      // Resolve serviceId - prefer prop, then personalDetails
      const resolvedServiceId = serviceId || personalDetails?.service_id || null

      // Build the submission payload
      const submissionPayload = {
        personalDetails,
        formId,
        serviceId: resolvedServiceId,
        clientType,
        answers: {
          ...answers,
          suggestions: suggestions
        }
      }

      console.log('[DynamicFormEngine] Resolved serviceId for submission:', resolvedServiceId)

      // Debug: log payload to help trace missing service_id issues
      try {
        const safePayload = JSON.parse(JSON.stringify({
          formId: submissionPayload.formId,
          serviceId: submissionPayload.serviceId,
          clientType: submissionPayload.clientType,
          personalDetails: submissionPayload.personalDetails ? {
            service_id: submissionPayload.personalDetails.service_id,
            service_name: submissionPayload.personalDetails.service_name
          } : null,
          answersCount: Object.keys(submissionPayload.answers || {}).length
        }))
        console.log('[DynamicFormEngine] Submission payload:', safePayload)
      } catch (logErr) {
        console.log('[DynamicFormEngine] Failed to log submission payload', logErr)
      }

      if (onSubmit) {
        await onSubmit(submissionPayload)
      }
    } catch (err) {
      setError(err.message || 'Failed to submit form')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSection = (section) => {
    if (section === 'personal' && onBack) {
      onBack()
    }
  }

  /**
   * Render a single dynamic question based on its type
   */
  const renderQuestion = (question) => {
    const qId = question.question_id
    const questionType = question.question_type || 'text'

    switch (questionType) {
      case 'rating':
        return (
          <DynamicRatingQuestion
            key={qId}
            question={question}
            questionId={qId}
            selectedRating={answers[qId]}
            onRatingSelect={handleAnswerChange}
            options={question.options || []}
          />
        )

      case 'checkmark':
        return (
          <DynamicCheckmarkQuestion
            key={qId}
            question={question}
            questionId={qId}
            selected={answers[qId] === true || answers[qId] === 'yes' ? 'yes' : answers[qId]}
            onToggle={(id, value) => handleAnswerChange(id, value)}
            options={question.options || []}
          />
        )

      case 'text':
      case 'textarea':
        return (
          <DynamicTextQuestion
            key={qId}
            question={question}
            questionId={qId}
            value={answers[qId]}
            onChange={handleAnswerChange}
          />
        )

      case 'radio':
        return (
          <DynamicRatingQuestion
            key={qId}
            question={question}
            questionId={qId}
            selectedRating={answers[qId]}
            onRatingSelect={handleAnswerChange}
            options={question.options || []}
          />
        )

      default:
        return (
          <DynamicTextQuestion
            key={qId}
            question={question}
            questionId={qId}
            value={answers[qId]}
            onChange={handleAnswerChange}
          />
        )
    }
  }

  const isLastStep = currentStepIndex === totalSteps - 1
  const isFirstStep = currentStepIndex === 0

  // Calculate the global step number for the progress indicator
  // Map activeSteps to their indices for the ProgressIndicator
  const getCurrentStepNumber = () => {
    if (!currentStep) return 1
    return activeStepNumbers.indexOf(currentStep.step) + 1
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            Step {getCurrentStepNumber()} of {activeSteps.length}
          </span>
          <span className="text-xs text-gray-400">
            {currentStep.title}
          </span>
        </div>
        <div className="flex gap-1">
          {activeSteps.map((step, index) => (
            <div
              key={step.step}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                index < currentStepIndex
                  ? 'bg-blue-600'
                  : index === currentStepIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">{currentStep.title}</h2>
        {currentStep.description && (
          <p className="text-gray-500 mt-1">{currentStep.description}</p>
        )}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Personal Details Step */}
          {currentStep.type === 'personal' && (
            <PersonalDetailsForm
              formData={personalDetails}
              onFormDataChange={handlePersonalDetailsChange}
              onNextStep={handleNext}
              onPrevStep={handlePrevious}
              isReviewMode={isReviewMode}
              showNavigation={false}
            />
          )}

          {/* Dynamic Questions Step */}
          {currentStep.questions && currentStep.questions.length > 0 && (
            <div className="space-y-6">
              {currentStep.questions.map(renderQuestion)}
            </div>
          )}

          {/* Suggestion Step */}
          {currentStep.type === 'suggestion' && (
            <Suggestion
              formData={{ ...suggestions, ratings: answers }}
              onFormDataChange={(field, value) => {
                if (field === 'reasonForLowScore') {
                  handleSuggestionChange('reasonForLowScore', value)
                } else if (field === 'generalComments') {
                  handleSuggestionChange('generalComments', value)
                }
              }}
              isReviewMode={isReviewMode}
            />
          )}

          {/* Review Step */}
          {currentStep.type === 'review' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Answers</h3>
              
              {/* Required fields missing warning */}
              {(() => {
                if (!formDefinition?.questions) return null
                const missingRequired = formDefinition.questions.filter(q => {
                  const questionType = q.question_type || 'text'
                  const answer = answers[q.question_id]
                  
                  // Check if rating or radio questions have answers
                  if (questionType === 'rating' || questionType === 'radio') {
                    return answer === null || answer === undefined || answer === ''
                  }
                  return false
                })
                
                if (missingRequired.length === 0) return null
                
                return (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-900">
                      <strong>⚠️ Missing required answers:</strong> Please complete all required questions before submitting.
                    </p>
                    {missingRequired.length <= 3 && (
                      <ul className="mt-2 text-xs text-amber-800 list-disc list-inside">
                        {missingRequired.map(q => (
                          <li key={q.question_id}>{q.question_text}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })()}
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Personal Details Summary */}
                {personalDetails.service_name && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Service</p>
                    <p className="text-sm font-medium">{personalDetails.service_name}</p>
                    {personalDetails.office_name && (
                      <p className="text-xs text-gray-500">{personalDetails.office_name}</p>
                    )}
                  </div>
                )}

                {/* Dynamic Questions Summary */}
                {formDefinition.questions && formDefinition.questions.map((q) => {
                  const answer = answers[q.question_id]
                  const questionType = q.question_type || 'text'
                  const isRequired = questionType === 'rating' || questionType === 'radio'
                  let displayValue = answer

                  if (answer === null || answer === undefined) {
                    displayValue = isRequired ? '❌ Not answered (required)' : '(optional, not answered)'
                  } else if (typeof answer === 'boolean') {
                    displayValue = answer ? 'Yes' : 'No'
                  }

                  const isAnswered = answer !== null && answer !== undefined && answer !== ''
                  const borderColor = isRequired && !isAnswered ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'

                  return (
                    <div key={q.question_id} className={`bg-gray-50 p-3 rounded-lg ${borderColor}`}>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Q: {q.question_text}</span>
                        {isRequired && (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">Required</span>
                        )}
                      </p>
                      <p className={`text-sm ${!isAnswered && isRequired ? 'text-red-600 font-medium' : ''}`}>
                        {displayValue}
                      </p>
                    </div>
                  )
                })}

                {/* Suggestions Summary */}
                {(suggestions.reasonForLowScore || suggestions.generalComments) && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Suggestions</p>
                    {suggestions.reasonForLowScore && (
                      <p className="text-sm mt-1">
                        <span className="text-gray-500">Reason for low score:</span> {suggestions.reasonForLowScore}
                      </p>
                    )}
                    {suggestions.generalComments && (
                      <p className="text-sm mt-1">
                        <span className="text-gray-500">General comments:</span> {suggestions.generalComments}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep && !onBack}
          className="px-6 py-2"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {isFirstStep ? 'Back to Service' : 'Previous'}
        </Button>

        {isLastStep ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !validateCurrentStep()}
            className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!validateCurrentStep()}
            className="px-6 py-2 bg-blue-600 text-white"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

DynamicFormEngine.propTypes = {
  formDefinition: PropTypes.shape({
    form_id: PropTypes.number,
    form_title: PropTypes.string,
    description: PropTypes.string,
    status_id: PropTypes.number,
    questions: PropTypes.arrayOf(PropTypes.shape({
      question_id: PropTypes.number.isRequired,
      question_text: PropTypes.string.isRequired,
      question_type: PropTypes.oneOf(['rating', 'checkmark', 'text', 'radio', 'textarea']),
      options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired
      }))
    })),
    linked_services: PropTypes.array,
    linked_forms: PropTypes.array
  }),
  clientType: PropTypes.string,
  serviceId: PropTypes.number,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func,
  onStepChange: PropTypes.func,
  initialAnswers: PropTypes.object,
  isReviewMode: PropTypes.bool,
  language: PropTypes.string,
  onLanguageToggle: PropTypes.func
}

DynamicFormEngine.defaultProps = {
  clientType: 'internal',
  language: 'en',
  initialAnswers: {}
}