import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { UserIcon, CheckSquareIcon, SmileIcon, ClipboardListIcon, QrCodeIcon, MessageSquare } from 'lucide-react'

const ProgressIndicator = ({ currentStep, steps, serviceType }) => {
  // Determine if a step is active based on service type
  const isStepActive = (step) => {
    if (!serviceType) return true; // All steps are active if no service type selected
    
    // If service is on-site (service_type_id = 1), steps 2 and 3 are active
    if (serviceType === 1) {
      return step === 1 || // Personal details
             step === 2 || // CSM Checkmark
             step === 3 || // CSM Ratings
             step === 6 || // Suggestion
             step === 7;   // Review
    }
    
    // If service is off-site (service_type_id = 2), steps 4 and 5 are active
    if (serviceType === 2) {
      return step === 1 || // Personal details
             step === 4 || // QMS Ratings
             step === 5 || // QMS Checkmark
             step === 6 || // Suggestion
             step === 7;   // Review
    }
    
    return true; // All steps are active if service type is not 1 or 2
  };

  // Desktop view (sidebar)
  const DesktopProgress = () => (
    <div className="bg-white/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
      <div className="relative">
        {/* Vertical line - ensure it's behind with lower z-index */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100 -z-1"></div>
        <div className="space-y-7">
          {steps.map(({ step, title, description, icon }) => {
            const active = isStepActive(step);
            const isCompleted = currentStep >= step;
            const shouldShowBlue = active && isCompleted;

            return (
              <div key={step} className="relative flex items-start group">
                {/* Icon container - always solid */}
                <div
                  className={`relative shrink-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out bg-white ${
                    shouldShowBlue
                      ? "border-blue-500 text-blue-500 shadow-sm" 
                      : active
                        ? "border-gray-300 text-gray-400"
                        : "border-gray-200 text-gray-300"
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {icon === "UserIcon" && <UserIcon className="w-full h-full" />}
                    {icon === "CheckSquareIcon" && <CheckSquareIcon className="w-full h-full" />}
                    {icon === "SmileIcon" && <SmileIcon className="w-full h-full" />}
                    {icon === "QrCodeIcon" && <QrCodeIcon className="w-full h-full" />}
                    {icon === "ClipboardListIcon" && <ClipboardListIcon className="w-full h-full" />}
                    {icon === "MessageSquare" && <MessageSquare className="w-full h-full" />}
                  </div>
                </div>
                {/* Text content - apply opacity only when inactive */}
                <div className={`ml-4 min-w-0 flex-1`}>
                  <h3 className={`text-sm font-medium transition-all duration-300 ${
                    shouldShowBlue
                      ? "text-blue-500" 
                      : active
                        ? "text-gray-700"
                        : "text-gray-400"
                  }`}>
                    {title}
                    {!active && <span className="ml-2 text-xs text-gray-300 italic">(Not applicable)</span>}
                  </h3>
                  <p className={`text-xs mt-1 ${active ? 'text-gray-500' : 'text-gray-300'}`}>
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Mobile view (horizontal progress bar)
  const MobileProgress = () => (
    <div className="relative w-full overflow-hidden">
      {/* Progress Line with Segments */}
      <div className="flex absolute top-3 xs:top-4 left-2 right-2 xs:left-4 xs:right-4 h-[1px] -z-10">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={`segment-${step}`}
            className={`flex-1 h-full transition-all duration-300 ease-in-out ${
              currentStep > step && isStepActive(step) ? 'bg-[#3B82F6]' : 'bg-gray-100'
            }`}
          ></div>
        ))}
      </div>
      <div className="flex justify-between items-start px-0.5 xs:px-1 relative z-10">
        {steps.map(({ step, mobileTitle }) => {
          const active = isStepActive(step);
          const isCompleted = currentStep >= step;
          const shouldShowBlue = active && isCompleted;

          return (
            <div key={step} className="flex flex-col items-center min-w-[2.5rem] xs:min-w-[3rem] sm:min-w-[3.5rem]">
              <div
                className={`h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-300 ease-in-out leading-none mb-1 bg-white ${
                  shouldShowBlue
                    ? "border-[#3B82F6] text-[#3B82F6] shadow-sm" 
                    : active
                      ? "border-gray-300 text-gray-400"
                      : "border-gray-200 text-gray-300"
                }`}
              >
                <span className="text-[10px] xs:text-xs sm:text-sm">{step}</span>
              </div>
              <span 
                className={`text-[7px] xs:text-[8px] sm:text-[9px] text-center whitespace-pre-line leading-tight transition-colors duration-300 ${
                  shouldShowBlue
                    ? "text-[#3B82F6] font-medium"
                    : active
                      ? "text-gray-500"
                      : "text-gray-300"
                }`}
              >
                {mobileTitle.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile view */}
      <div className="lg:hidden">
        <MobileProgress />
      </div>
      
      {/* Desktop view */}
      <div className="hidden lg:block flex-1">
        <DesktopProgress />
      </div>
    </>
  );
};

ProgressIndicator.propTypes = {
  currentStep: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      step: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      mobileTitle: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired
    })
  ).isRequired,
  serviceType: PropTypes.number
};

export default ProgressIndicator; 