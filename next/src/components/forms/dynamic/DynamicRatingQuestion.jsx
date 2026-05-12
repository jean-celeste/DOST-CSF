'use client'

import PropTypes from 'prop-types'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Smile, Frown, Meh, Angry, Zap } from 'lucide-react'

export default function DynamicRatingQuestion({
  question,
  questionId,
  selectedRating,
  onRatingSelect,
  options = []
}) {
  const [hoveredRating, setHoveredRating] = useState(null)

  const getRatingIcon = (value) => {
    const iconMap = {
      'outstanding': <Smile className="w-6 h-6" />,
      'very-satisfactory': <Smile className="w-6 h-6" />,
      'satisfactory': <Meh className="w-6 h-6" />,
      'fair': <Frown className="w-6 h-6" />,
      'unsatisfactory': <Angry className="w-6 h-6" />,
      'strongly-agree': <Smile className="w-6 h-6" />,
      'agree': <Smile className="w-6 h-6" />,
      'neutral': <Meh className="w-6 h-6" />,
      'disagree': <Frown className="w-6 h-6" />,
      'strongly-disagree': <Angry className="w-6 h-6" />,
    }
    return iconMap[value] || <Zap className="w-6 h-6" />
  }

  const getRatingColor = (value, isSelected, isHovered) => {
    if (isSelected) {
      if (['outstanding', 'strongly-agree', 'agree'].includes(value)) return 'bg-green-100 border-green-500 text-green-700'
      if (['very-satisfactory', 'satisfactory', 'neutral'].includes(value)) return 'bg-blue-100 border-blue-500 text-blue-700'
      if (['fair'].includes(value)) return 'bg-yellow-100 border-yellow-500 text-yellow-700'
      if (['unsatisfactory', 'disagree', 'strongly-disagree'].includes(value)) return 'bg-red-100 border-red-500 text-red-700'
    }
    if (isHovered) return 'bg-gray-100 border-gray-300'
    return 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
  }

  // Default rating options if none provided
  const defaultOptions = [
    { value: 'outstanding', label: 'Outstanding' },
    { value: 'very-satisfactory', label: 'Very Satisfactory' },
    { value: 'satisfactory', label: 'Satisfactory' },
    { value: 'fair', label: 'Fair' },
    { value: 'unsatisfactory', label: 'Unsatisfactory' }
  ]

  const ratingOptions = options.length > 0 ? options : defaultOptions

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-700 block">
        {question.question_text || question}
      </label>
      <div className="flex flex-wrap gap-2">
        {ratingOptions.map((option) => {
          const isSelected = selectedRating === option.value
          const isHovered = hoveredRating === option.value
          return (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setHoveredRating(option.value)}
              onMouseLeave={() => setHoveredRating(null)}
              onClick={() => onRatingSelect(questionId || question.question_id, option.value)}
              className={`
                px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200
                flex items-center gap-2 min-w-[100px] justify-center
                ${getRatingColor(option.value, isSelected, isHovered)}
              `}
              aria-pressed={isSelected}
            >
              {getRatingIcon(option.value)}
              <span>{option.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

DynamicRatingQuestion.propTypes = {
  question: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
    question_id: PropTypes.number.isRequired,
    question_text: PropTypes.string.isRequired,
    question_type: PropTypes.string,
    options: PropTypes.array
  })]).isRequired,
  questionId: PropTypes.number,
  selectedRating: PropTypes.string,
  onRatingSelect: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  }))
}