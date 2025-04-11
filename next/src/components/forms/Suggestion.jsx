'use client'

import PropTypes from 'prop-types'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Suggestion({ onNextStep, onPrevStep, formData, onFormDataChange, isReviewMode }) {
  const handleInputChange = (field, value) => {
    onFormDataChange({
      ...formData,
      [field]: value
    })
  }

  const handleContinue = () => {
    if (isReviewMode) {
      onNextStep() // This will be handleReturnToReview from the parent
    } else {
      onNextStep()
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          Your Feedback and Suggestions
        </h2>
        <p className="text-gray-500">
          Please help us improve our services by providing your feedback.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* First Question - For scores of 3, 2, 1 */}
        {formData.ratings && Object.values(formData.ratings).some(rating => 
          ['satisfactory', 'fair', 'unsatisfactory'].includes(rating)
        ) && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                For scores of 3, 2, 1, please give reason to further enhance our service
              </h3>
              <p className="text-sm text-gray-500 italic">
                (Para sa marka na 3, 2, 1, maaari po lamang na ibigay ang kadahilanan para mas mapahusay ang aming serbisyo)
              </p>
            </div>
            <Textarea
              placeholder="Type your reason here..."
              className="min-h-[150px] resize-none"
              value={formData.reasonForLowScore || ''}
              onChange={(e) => handleInputChange('reasonForLowScore', e.target.value)}
            />
          </div>
        )}

        {/* Second Question - General Comments/Suggestions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Please write your comments/suggestions below
            </h3>
            <p className="text-sm text-gray-500 italic">
              (Maaaring isulat sa ibaba nito ang iyong komentaryo / mungkahi)
            </p>
          </div>
          <Textarea
            placeholder="Type your comments/suggestions here..."
            className="min-h-[150px] resize-none"
            value={formData.generalComments || ''}
            onChange={(e) => handleInputChange('generalComments', e.target.value)}
          />
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-20">
        <Button
          variant="outline"
          className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          onClick={onPrevStep}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button
          variant="gradient"
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md"
          onClick={handleContinue}
        >
          {isReviewMode ? "Return to Review" : "Continue"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

Suggestion.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    reasonForLowScore: PropTypes.string,
    generalComments: PropTypes.string,
    ratings: PropTypes.object
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  isReviewMode: PropTypes.bool
} 