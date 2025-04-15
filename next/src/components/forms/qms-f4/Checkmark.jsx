'use client'

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { fetchQuestions, groupQuestions } from '@/lib/questions/fetchQuestions'
import LoadingSpinner from '@/components/forms-resources/LoadingSpinner'

export default function Checkmark({ 
  onNextStep, 
  onPrevStep,
  formData,
  onFormDataChange,
  isReviewMode = false,
  formId = 3 // Default to QMS form
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('Fetching questions for formId:', formId);
        const fetchedQuestions = await fetchQuestions(formId);
        console.log('Fetched questions:', fetchedQuestions);
        
        const { checkmarkQuestions } = groupQuestions(fetchedQuestions, formId);
        console.log('Grouped checkmark questions:', checkmarkQuestions);
        
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

  const handleOptionChange = (option) => {
    const currentSelections = formData.selections || {}
    onFormDataChange({
      selections: {
        ...currentSelections,
        [option]: !currentSelections[option]
      }
    })
  }

  const handleSubmit = () => {
    if (Object.keys(formData.selections || {}).length > 0) {
      onNextStep()
    }
  }

  const isOptionSelected = (option) => {
    return formData.selections?.[option] === true
  }

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

  console.log('Rendering with questions:', questions);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Please select the criteria/attributes that are important to you.
            </h2>
            <p className="text-gray-500">Click on any attribute to mark it as important.</p>
          </div>
          
          <div className="space-y-4">
            {questions.map((q) => (
              <motion.button
                key={q.question_id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-6 rounded-xl text-left transition-all border-2
                  ${isOptionSelected(q.question_text)
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 shadow-md'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                onClick={() => handleOptionChange(q.question_text)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">{q.question_text}</span>
                  <div className={`p-2 rounded-full transition-colors ${
                    isOptionSelected(q.question_text)
                      ? 'bg-blue-500'
                      : 'bg-gray-100'
                  }`}>
                    <Check className={`h-5 w-5 ${
                      isOptionSelected(q.question_text)
                        ? 'text-white'
                        : 'text-gray-500'
                    }`} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
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
            disabled={Object.keys(formData.selections || {}).length === 0}
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
    selections: PropTypes.objectOf(PropTypes.bool)
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  isReviewMode: PropTypes.bool,
  formId: PropTypes.number
}
