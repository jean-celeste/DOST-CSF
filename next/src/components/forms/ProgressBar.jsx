import PropTypes from 'prop-types'

const ProgressBar = ({ currentStep, steps }) => {
  return (
    <div className="relative">
      {/* Progress Line with Segments */}
      <div className="flex absolute top-4 left-8 right-8 h-[1px] -z-10">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={`segment-${step}`}
            className={`flex-1 h-full transition-colors duration-300 ${
              currentStep > step ? 'bg-[#3B82F6]' : 'bg-gray-200'
            }`}
          ></div>
        ))}
      </div>
      <div className="flex justify-between items-start px-4 relative z-10">
        {steps.map(({ step, mobileTitle }) => (
          <div key={step} className="flex flex-col items-center w-10">
            <div
              className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors duration-200 leading-none mb-1.5 ${
                currentStep >= step 
                  ? "border-[#3B82F6] bg-white text-[#3B82F6]" 
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              {step}
            </div>
            <span 
              className={`text-[10px] text-center whitespace-pre-line leading-tight ${
                currentStep >= step 
                  ? "text-[#3B82F6] font-medium" 
                  : "text-gray-500"
              }`}
            >
              {mobileTitle}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

ProgressBar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      step: PropTypes.number.isRequired,
      mobileTitle: PropTypes.string.isRequired
    })
  ).isRequired
}

export default ProgressBar 