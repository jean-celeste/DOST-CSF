'use client'

import PropTypes from 'prop-types'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'

export default function DynamicTextQuestion({
  question,
  questionId,
  value,
  onChange,
  maxLength = 500,
  rows = 3
}) {
  const questionText = typeof question === 'string' ? question : question.question_text
  const qId = questionId || (typeof question === 'object' ? question.question_id : undefined)

  return (
    <motion.div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 block">
        {questionText}
      </label>
      <Textarea
        value={value || ''}
        onChange={(e) => onChange(qId, e.target.value)}
        placeholder="Type your answer here..."
        rows={rows}
        maxLength={maxLength}
        className="resize-none"
      />
      <p className="text-xs text-gray-400 text-right">
        {value?.length || 0}/{maxLength} characters
      </p>
    </motion.div>
  )
}

DynamicTextQuestion.propTypes = {
  question: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
    question_id: PropTypes.number.isRequired,
    question_text: PropTypes.string.isRequired,
    question_type: PropTypes.string
  })]).isRequired,
  questionId: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
  rows: PropTypes.number
}