import PropTypes from 'prop-types'

const ProgressBar = ({ currentStep, steps }) => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Progress Line with Segments */}
      <div className="flex absolute top-3 xs:top-4 left-2 right-2 xs:left-4 xs:right-4 h-[1px] -z-10">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={`segment-${step}`}
            className={`flex-1 h-full transition-all duration-300 ease-in-out ${
              currentStep > step ? 'bg-[#3B82F6]' : 'bg-gray-200'
            }`}
          ></div>
        ))}
      </div>
      <div className="flex justify-between items-start px-0.5 xs:px-1 relative z-10">
        {steps.map(({ step, mobileTitle }) => (
          <div key={step} className="flex flex-col items-center min-w-[2.5rem] xs:min-w-[3rem] sm:min-w-[3.5rem]">
            <div
              className={`h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ease-in-out leading-none mb-1 ${
                currentStep >= step 
                  ? "border-[#3B82F6] bg-white text-[#3B82F6] shadow-sm" 
                  : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              <span className="text-[10px] xs:text-xs sm:text-sm">{step}</span>
            </div>
            <span 
              className={`text-[7px] xs:text-[8px] sm:text-[9px] text-center whitespace-pre-line leading-tight transition-colors duration-300 ${
                currentStep >= step 
                  ? "text-[#3B82F6] font-medium" 
                  : "text-gray-500"
              }`}
            >
              {mobileTitle.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
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