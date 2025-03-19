// frontend/src/components/forms/Checkmark.jsx

import { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from '../ui/button'

export default function Checkmark({ 
  onNextStep, 
  onPrevStep,
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
  const [formState, setFormState] = useState({
    selectedOption: null,
    additionalAnswers: {}
  })

  const handleOptionChange = (option) => {
    setFormState(prev => {
      const newState = {
        ...prev,
        selectedOption: option,
        additionalAnswers: { ...prev.additionalAnswers }
      }

      // Reset additional answers when changing main option
      if (option === mainOptions[3]) { // If last option selected
        newState.additionalAnswers = {}
      } else if (option === mainOptions[2]) { // If third option selected
        delete newState.additionalAnswers[1] // Reset question1 answer but keep question2
      }

      return newState
    })
  }

  const handleAdditionalOptionChange = (questionId, answer) => {
    setFormState(prev => ({
      ...prev,
      additionalAnswers: {
        ...prev.additionalAnswers,
        [questionId]: answer
      }
    }))
  }

  const handleSubmit = () => {
    if (formState.selectedOption) {
      // Here you can prepare the data to be sent to the database
      const formData = {
        mainAnswer: formState.selectedOption,
        additionalAnswers: formState.additionalAnswers
      }
      console.log('Form data to be saved:', formData)
      onNextStep()
    }
  }

  const shouldShowAdditionalQuestions = formState.selectedOption && formState.selectedOption !== mainOptions[3]

  // Filter questions based on selected option
  const getVisibleQuestions = () => {
    if (!shouldShowAdditionalQuestions) return []
    if (formState.selectedOption === mainOptions[2]) { // If third option selected
      return additionalQuestions.filter(q => q.id !== 1)
    }
    return additionalQuestions
  }

  const areAllQuestionsAnswered = () => {
    if (!shouldShowAdditionalQuestions) return true
    const visibleQuestions = getVisibleQuestions()
    return visibleQuestions.every(q => formState.additionalAnswers[q.id])
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">
        {mainQuestion}
      </h2>
      
      <div className="space-y-4">
        {mainOptions.map((option, index) => (
          <button
            key={index}
            className={`w-full p-4 rounded-xl text-left transition-all
              ${formState.selectedOption === option 
                ? 'bg-blue-100 border border-blue-500' 
                : 'bg-white border border-gray-200'
              } hover:border-blue-400`}
            onClick={() => handleOptionChange(option)}
          >
            <span className="text-base">{option}</span>
          </button>
        ))}
      </div>

      {shouldShowAdditionalQuestions && (
        <div className="space-y-8 mt-8">
          {getVisibleQuestions().map((q) => (
            <div key={q.id} className="space-y-4">
              <h3 className="text-lg font-semibold">{q.question}</h3>
              <div className="space-y-3">
                {q.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    className={`w-full p-4 rounded-xl text-left transition-all
                      ${formState.additionalAnswers[q.id] === option 
                        ? 'bg-blue-100 border border-blue-500' 
                        : 'bg-white border border-gray-200'
                      } hover:border-blue-400`}
                    onClick={() => handleAdditionalOptionChange(q.id, option)}
                  >
                    <span className="text-base">{option}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-20">
        <Button
          variant="outline"
          className="px-6 py-2 bg-gray-100 rounded-lg"
          onClick={onPrevStep}
        >
          Go Back
        </Button>
        <Button
          variant="gradient"
          className="px-6 py-2 rounded-lg"
          onClick={handleSubmit}
          disabled={!formState.selectedOption || !areAllQuestionsAnswered()}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

Checkmark.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  mainQuestion: PropTypes.string,
  mainOptions: PropTypes.arrayOf(PropTypes.string),
  additionalQuestions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired
  }))
}