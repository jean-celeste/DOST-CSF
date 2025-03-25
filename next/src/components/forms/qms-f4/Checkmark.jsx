import PropTypes from 'prop-types'
import { Button } from '@/components/ui/button'
import { Check, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Checkmark({ 
  onNextStep, 
  onPrevStep,
  formData,
  onFormDataChange,
  mainQuestion = "Did you notice the (QMS) in this office?",
  mainOptions = [
    "Yes, I noticed and used the QMS.",
    "Yes, I noticed but did not use the QMS.",
    "No, I did not notice any QMS.",
    "I'm not sure what a QMS is."
  ]
}) {
  const handleOptionChange = (option) => {
    onFormDataChange({
      selectedOption: option
    })
  }

  const handleSubmit = () => {
    if (formData.selectedOption) {
      onNextStep()
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              {mainQuestion}
            </h2>
            <p className="text-gray-500">Please select the option that best describes your experience with the QMS.</p>
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
            disabled={!formData.selectedOption}
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
    selectedOption: PropTypes.string
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  mainQuestion: PropTypes.string,
  mainOptions: PropTypes.arrayOf(PropTypes.string)
}
