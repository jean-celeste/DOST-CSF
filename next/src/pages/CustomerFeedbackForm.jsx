'use client'

import { useState } from 'react'
import { UserIcon, CheckSquareIcon, SmileIcon, ClipboardListIcon, QrCodeIcon } from 'lucide-react'
import PersonalDetailsForm from '@/components/forms/PersonalDetailsForm'
import DataPrivacyConsent from '@/components/prompts/DataPrivacyConsent'
import Review from '@/components/forms/Review'
import ProgressBar from '@/components/forms/ProgressBar'

// CSM-ARTA components
import CSMARTACheckmark from '@/components/forms/csm-arta/Checkmark'
import CSMARTARatings from '@/components/forms/csm-arta/Ratings'

// QMS components
import QMSCheckmark from '@/components/forms/qms-f4/Checkmark'
import QMSRatings from '@/components/forms/qms-f4/Ratings'

// Constants
import {
  FORM_STEPS,
  INITIAL_FORM_STATE,
  INITIAL_PERSONAL_DETAILS,
  INITIAL_CSM_ARTA_CHECKMARK,
  INITIAL_CSM_ARTA_RATINGS,
  INITIAL_QMS_CHECKMARK,
  INITIAL_QMS_RATINGS
} from '@/constants/formSteps'

export default function CustomerFeedbackForm() {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE)
  const [personalDetails, setPersonalDetails] = useState(INITIAL_PERSONAL_DETAILS)
  const [csmARTACheckmark, setCSMARTACheckmark] = useState(INITIAL_CSM_ARTA_CHECKMARK)
  const [csmARTARatings, setCSMARTARatings] = useState(INITIAL_CSM_ARTA_RATINGS)
  const [qmsCheckmark, setQMSCheckmark] = useState(INITIAL_QMS_CHECKMARK)
  const [qmsRatings, setQMSRatings] = useState(INITIAL_QMS_RATINGS)

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
    <div className="min-h-screen">
      {/* Main Form Content */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-7">
          {/* Left Side - Progress Indicator */}
          <div className="bg-[url('/diamond-pattern.svg')] bg-repeat bg-gray-50/95 p-4 md:p-8 md:col-span-2 relative shadow-lg z-10 md:h-screen md:sticky md:top-0 flex flex-col">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="mr-2 h-8 w-8">
                  <img src="/DOST_Logo.png" alt="DOST Logo" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <h1 className="text-sm font-bold leading-tight">DOST V</h1>
                  <p className="text-xs text-gray-600">Feedback Form</p>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-500">Step {formState.currentStep}/6</div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center mb-10">
              <div className="mr-3 h-16 w-16">
                <img src="/DOST_Logo.png" alt="DOST Logo" className="h-16 w-16 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Department of Science and Technology V</h1>
                <p className="text-base text-gray-600">Customer Feedback Form</p>
              </div>
            </div>

            {/* Mobile Progress Steps */}
            <div className="md:hidden bg-white/80 rounded-xl p-4 shadow-sm backdrop-blur-sm mb-4">
              <ProgressBar currentStep={formState.currentStep} steps={FORM_STEPS} />
            </div>

            {/* Desktop Progress Steps */}
            <div className="hidden md:block relative flex-grow">
              <div className="bg-white/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute left-6 top-4 h-[calc(100%-32px)] w-0.5 bg-gray-200"></div>
                  <div className="space-y-8">
                    {FORM_STEPS.map(({ step, title, description, icon }) => (
                      <div key={step} className="relative flex items-start">
                        <div
                          className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                            formState.currentStep >= step ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"
                          }`}
                        >
                          {icon === "UserIcon" && <UserIcon className="h-6 w-6" />}
                          {icon === "CheckSquareIcon" && <CheckSquareIcon className="h-6 w-6" />}
                          {icon === "SmileIcon" && <SmileIcon className="h-6 w-6" />}
                          {icon === "QrCodeIcon" && <QrCodeIcon className="h-6 w-6" />}
                          {icon === "ClipboardListIcon" && <ClipboardListIcon className="h-6 w-6" />}
                        </div>
                        <div className="ml-4 pt-1">
                          <h3 className={`font-medium transition-colors duration-200 ${formState.currentStep === step ? "text-blue-500" : "text-gray-700"}`}>
                            {title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Logos at the bottom - Hidden on mobile */}
            <div className="hidden md:flex mt-auto pt-8 justify-center space-x-6">
              <img src="/ARTA_Logo.png" alt="ARTA Logo" className="h-12 w-12 object-contain" />
              <img src="/CC_Logo.png" alt="CC Logo" className="h-12 w-12 object-contain" />
              <img src="/BP_logo.png" alt="BP Logo" className="h-12 w-12 object-contain" />
            </div>
          </div>

          {/* Right Side - Form Content */}
          <div className="bg-white p-4 md:p-20 md:col-span-5 overflow-y-auto">
            {/* Hide step indicator on mobile as it's shown in the progress bar */}
            <div className="hidden md:block mb-15">
              <h2 className="text-sm font-medium text-gray-500">Step {formState.currentStep} of 6</h2>
              <h1 className="text-2xl font-bold">
                {FORM_STEPS.find(step => step.step === formState.currentStep)?.title}
              </h1>
              <p className="text-gray-600">
                {FORM_STEPS.find(step => step.step === formState.currentStep)?.description}
              </p>
            </div>

            {/* Render the form component based on current step */}
            {formState.currentStep === 1 && (
              <PersonalDetailsForm 
                onNextStep={handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={personalDetails}
                onFormDataChange={setPersonalDetails}
              />
            )}
            
            {formState.currentStep === 2 && (
              <CSMARTACheckmark 
                onNextStep={handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={csmARTACheckmark}
                onFormDataChange={setCSMARTACheckmark}
              />
            )}
            {formState.currentStep === 3 && (
              <CSMARTARatings 
                onNextStep={handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={csmARTARatings}
                onFormDataChange={setCSMARTARatings}
              />
            )}
            {formState.currentStep === 4 && (
              <QMSCheckmark 
                onNextStep={handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={qmsCheckmark}
                onFormDataChange={setQMSCheckmark}
              />
            )}
            {formState.currentStep === 5 && (
              <QMSRatings 
                onNextStep={handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={qmsRatings}
                onFormDataChange={setQMSRatings}
              />
            )}
            {formState.currentStep === 6 && (
              <Review 
                onNextStep={handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={{
                  personalDetails,
                  csmARTACheckmark,
                  csmARTARatings,
                  qmsCheckmark,
                  qmsRatings
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}