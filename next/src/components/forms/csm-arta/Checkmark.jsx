'use client'

import { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Checkmark({ 
  onNextStep, 
  onPrevStep,
  formData,
  onFormDataChange,
  mainQuestion = "Which of the following best describes your awareness of a CC?",
  mainOptions = [
    "I know what a CC is and I saw this office's CC.",
    "I know what a CC is but I did NOT see this office's CC.",
    "I learned of the CC only when I saw this office's CC.",
    "I do not know what a CC is and I did not see one in this office."
  ],
  additionalQuestions = [
    {
      id: 1,
      question: "Would you say that the CC of this office was..?",
      options: ["Easy to See", "Somewhat easy to see", "Difficult to see", "Not visible at all"]
    },
    {
      id: 2,
      question: "How much did the CC help you in your transaction?",
      options: ["Helped very much", "Somewhat helped", "Did not help"]
    }
  ]
}) {
  const handleOptionChange = (option) => {
    const newState = {
      ...formData,
      selectedOption: option,
      additionalAnswers: { ...formData.additionalAnswers }
    }

    // Reset additional answers when changing main option
    if (option === mainOptions[3]) { // If last option selected
      newState.additionalAnswers = {}
    } else if (option === mainOptions[2]) { // If third option selected
      delete newState.additionalAnswers[1] // Reset question1 answer but keep question2
    }

    onFormDataChange(newState)
  }

  const handleAdditionalOptionChange = (questionId, answer) => {
    onFormDataChange({
      ...formData,
      additionalAnswers: {
        ...formData.additionalAnswers,
        [questionId]: answer
      }
    })
  }

  const handleSubmit = () => {
    if (formData.selectedOption) {
      onNextStep()
    }
  }

  const shouldShowAdditionalQuestions = formData.selectedOption && formData.selectedOption !== mainOptions[3]

  // Filter questions based on selected option
  const getVisibleQuestions = () => {
    if (!shouldShowAdditionalQuestions) return []
    if (formData.selectedOption === mainOptions[2]) { // If third option selected
      return additionalQuestions.filter(q => q.id !== 1)
    }
    return additionalQuestions
  }

  const areAllQuestionsAnswered = () => {
    if (!shouldShowAdditionalQuestions) return true
    const visibleQuestions = getVisibleQuestions()
    return visibleQuestions.every(q => formData.additionalAnswers[q.id])
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              {mainQuestion}
            </h2>
            <p className="text-gray-500">Please select the option that best describes your experience.</p>
          </div>
          
          <div className="space-y-4">
            {mainOptions.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-6 rounded-xl text-left transition-all border-2
                  ${formData.selectedOption === option 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                onClick={() => handleOptionChange(option)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">{option}</span>
                  {formData.selectedOption === option && (
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
                <div key={q.id} className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{q.question}</h3>
                    <p className="text-sm text-gray-500">Please select the most appropriate response.</p>
                  </div>
                  <div className="space-y-3">
                    {q.options.map((option, optionIndex) => (
                      <motion.button
                        key={optionIndex}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-6 rounded-xl text-left transition-all border-2
                          ${formData.additionalAnswers[q.id] === option 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 shadow-md' 
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        onClick={() => handleAdditionalOptionChange(q.id, option)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-base font-medium">{option}</span>
                          {formData.additionalAnswers[q.id] === option && (
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
            disabled={!formData.selectedOption || !areAllQuestionsAnswered()}
          >
            Continue
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
    selectedOption: PropTypes.string,
    additionalAnswers: PropTypes.object
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  mainQuestion: PropTypes.string,
  mainOptions: PropTypes.arrayOf(PropTypes.string),
  additionalQuestions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired
  }))
}