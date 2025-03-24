import PropTypes from 'prop-types'
import { Button } from '@/components/ui/button'

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
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6">
        {mainQuestion}
      </h2>
      
      <div className="space-y-4">
        {mainOptions.map((option, index) => (
          <button
            key={index}
            className={`w-full p-4 rounded-xl text-left transition-all
              ${formData.selectedOption === option 
                ? 'bg-blue-100 border border-blue-500' 
                : 'bg-white border border-gray-200'
              } hover:border-blue-400`}
            onClick={() => handleOptionChange(option)}
          >
            <span className="text-base">{option}</span>
          </button>
        ))}
      </div>

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
          disabled={!formData.selectedOption}
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
  formData: PropTypes.shape({
    selectedOption: PropTypes.string
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  mainQuestion: PropTypes.string,
  mainOptions: PropTypes.arrayOf(PropTypes.string)
}
