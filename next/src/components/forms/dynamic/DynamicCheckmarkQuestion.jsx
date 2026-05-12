'use client'

import PropTypes from 'prop-types'
import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DynamicCheckmarkQuestion({
  question,
  questionId,
  selected,
  onToggle,
  options = []
}) {
  const questionText = typeof question === 'string' ? question : question.question_text
  const qId = questionId || (typeof question === 'object' ? question.question_id : undefined)

  // Default options for checkmark questions
  const defaultOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'na', label: 'N/A' }
  ]

  const checkOptions = options.length > 0 ? options : defaultOptions

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 block">
        {questionText}
      </label>
      <div className="flex flex-wrap gap-3">
        {checkOptions.map((option) => {
          const isSelected = selected === option.value
          return (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(qId, option.value)}
              className={`
                px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200
                flex items-center gap-2
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-pressed={isSelected}
            >
              {isSelected
                ? <Check className="w-4 h-4" />
                : <X className="w-4 h-4 text-gray-300" />
              }
              <span>{option.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

DynamicCheckmarkQuestion.propTypes = {
  question: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
    question_id: PropTypes.number.isRequired,
    question_text: PropTypes.string.isRequired,
    question_type: PropTypes.string,
    options: PropTypes.array
  })]).isRequired,
  questionId: PropTypes.number,
  selected: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  }))
}