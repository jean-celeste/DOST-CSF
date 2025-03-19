import { useState } from 'react'
import PropTypes from 'prop-types'
import { UserIcon, CheckSquareIcon, SmileIcon, ClipboardListIcon } from 'lucide-react'
import PersonalDetailsForm from './components/forms/PersonalDetailsForm'
import Ratings from './components/forms/Ratings'
import DataPrivacyConsent from './components/prompts/DataPrivacyConsent'
import Checkmark from './components/forms/Checkmark'

export default function CustomerFeedbackForm() {
  const [formState, setFormState] = useState({
    showMainForm: false,
    currentStep: 1
  })

  const handleConsent = () => {
    setFormState(prev => ({ ...prev, showMainForm: true }))
  }

  const handleDecline = () => {
    alert('You need to accept the Data Privacy terms to proceed with the survey.')
  }

  const handleNextStep = () => {
    setFormState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }))
  }

  const handlePrevStep = () => {
    setFormState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }))
  }

  // Render the data privacy page if consent hasn't been given
  if (!formState.showMainForm) {
    return <DataPrivacyConsent onConsent={handleConsent} onDecline={handleDecline} />
  }

  // Main form content (only shown after consent)
  return (
    <div className="min-h-screen bg-[url('/diamond-pattern.svg')] bg-repeat">
      {/* Main Form Content */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-7">
          {/* Left Side - Progress Indicator */}
          <div className="bg-gray-50 p-10 md:col-span-2">
            <div className="mb-8 flex items-center">
              <div className="mr-2 h-16 w-16">
                <img src="/DOST_Logo.png" alt="DOST Logo" className="h-16 w-16" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Department of Science and Technology V</h1>
                <p className="text-base">Customer Satisfaction Feedback</p>
              </div>
            </div>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200"></div>

              {/* Step 1 - Personal Details */}
              <div className="relative mb-8 flex">
                <div
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${formState.currentStep >= 1 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"}`}
                >
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-medium ${formState.currentStep === 1 ? "text-blue-500" : "text-gray-700"}`}>
                    Personal Details
                  </h3>
                  <p className="text-sm text-gray-500">Please provide your basic information</p>
                </div>
              </div>

              {/* Step 2 - Checkmarks */}
              <div className="relative mb-8 flex">
                <div
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${formState.currentStep >= 2 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"}`}
                >
                  <CheckSquareIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-medium ${formState.currentStep === 2 ? "text-blue-500" : "text-gray-700"}`}>Checkmarks</h3>
                  <p className="text-sm text-gray-500">Select all that apply to your experience</p>
                </div>
              </div>

              {/* Step 3 - Ratings */}
              <div className="relative mb-8 flex">
                <div
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${formState.currentStep >= 3 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"}`}
                >
                  <SmileIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-medium ${formState.currentStep === 3 ? "text-blue-500" : "text-gray-700"}`}>Ratings</h3>
                  <p className="text-sm text-gray-500">Rate your satisfaction with our services</p>
                </div>
              </div>

              {/* Step 4 - Review */}
              <div className="relative flex">
                <div
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${formState.currentStep >= 4 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"}`}
                >
                  <ClipboardListIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-medium ${formState.currentStep === 4 ? "text-blue-500" : "text-gray-700"}`}>Review</h3>
                  <p className="text-sm text-gray-500">Review your answers before submission</p>
                </div>
              </div>
            </div>

            {/* Logos at the bottom */}
            <div className="mt-15 flex justify-center space-x-4">
              <img src="/ARTA_Logo.png" alt="ARTA Logo" className="h-12 w-12" />
              <img src="/CC_Logo.png" alt="CC Logo" className="h-12 w-12" />
              <img src="/BP_logo.png" alt="BP Logo" className="h-12 w-12" />
            </div>
          </div>

          {/* Right Side - Form Content */}
          <div className="bg-white p-20 md:col-span-5">
            <div className="mb-15">
              <h2 className="text-sm font-medium text-gray-500">Step {formState.currentStep} of 4</h2>
              <h1 className="text-2xl font-bold">
                {formState.currentStep === 1 && "Personal Details"}
                {formState.currentStep === 2 && "Checkmarks"}
                {formState.currentStep === 3 && "Ratings"}
                {formState.currentStep === 4 && "Review"}
              </h1>
              <p className="text-gray-600">
                {formState.currentStep === 1 && "All these details are needed to be accomplished."}
                {formState.currentStep === 2 && "Please check what applies to your experience."}
                {formState.currentStep === 3 && "Rate your satisfaction with our services."}
                {formState.currentStep === 4 && "Review your answers before submission."}
              </p>
            </div>

            {/* Render the form component based on current step */}
            {formState.currentStep === 1 && <PersonalDetailsForm onNextStep={handleNextStep} onPrevStep={handlePrevStep} />}
            {formState.currentStep === 2 && <Checkmark onNextStep={handleNextStep} onPrevStep={handlePrevStep} />}
            {formState.currentStep === 3 && <Ratings onNextStep={handleNextStep} onPrevStep={handlePrevStep} />}
          </div>
        </div>
      </div>
    </div>
  )
}