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
  const [editingSection, setEditingSection] = useState(null)

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

  const handleEditSection = (section) => {
    setEditingSection(section)
    if (section === 'personal') {
      setFormState(prev => ({ ...prev, currentStep: 1 }))
    } else if (section === 'csmarta') {
      setFormState(prev => ({ ...prev, currentStep: 2 }))
    } else if (section === 'csmarta-ratings') {
      setFormState(prev => ({ ...prev, currentStep: 3 }))
    } else if (section === 'qms-checkmark') {
      setFormState(prev => ({ ...prev, currentStep: 4 }))
    } else if (section === 'qms-ratings') {
      setFormState(prev => ({ ...prev, currentStep: 5 }))
    }
  }

  const handleReturnToReview = () => {
    setEditingSection(null)
    setFormState(prev => ({ ...prev, currentStep: 6 }))
  }

  // Render the data privacy page if consent hasn't been given
  if (!formState.showMainForm) {
    return <DataPrivacyConsent onConsent={handleConsent} onDecline={handleDecline} />
  }

  // Main form content (only shown after consent)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Form Content */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-7">
          {/* Left Side - Progress Indicator */}
          <div className="bg-[url('/diamond-pattern.svg')] bg-repeat bg-gray-50/95 lg:fixed lg:w-[28.5714%] lg:h-screen p-3 xs:p-4 lg:p-8 relative shadow-lg z-20 flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between mb-3 xs:mb-4 bg-white/80 rounded-xl p-2 xs:p-3 shadow-sm backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="h-6 xs:h-8 w-6 xs:w-8">
                  <img src="/DOST_Logo.png" alt="DOST Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xs xs:text-sm font-bold leading-tight">DOST V</h1>
                  <p className="text-[10px] xs:text-xs text-gray-600">Feedback Form</p>
                </div>
              </div>
              <div className="text-xs xs:text-sm font-medium text-gray-500">Step {formState.currentStep}/6</div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center mb-8">
              <div className="mr-3 h-14 w-14">
                <img src="/DOST_Logo.png" alt="DOST Logo" className="h-14 w-14 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Department of Science and Technology V</h1>
                <p className="text-base text-gray-600">Customer Feedback Form</p>
              </div>
            </div>

            {/* Mobile Progress Steps */}
            <div className="lg:hidden bg-white/80 rounded-xl p-2 xs:p-3 shadow-sm backdrop-blur-sm mb-3 xs:mb-4">
              <ProgressBar currentStep={formState.currentStep} steps={FORM_STEPS} />
            </div>

            {/* Desktop Progress Steps */}
            <div className="hidden lg:block flex-1">
              <div className="bg-white/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                  <div className="space-y-7">
                    {FORM_STEPS.map(({ step, title, description, icon }) => (
                      <div key={step} className="relative flex items-start group">
                        <div
                          className={`shrink-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out ${
                            formState.currentStep >= step 
                              ? "border-blue-500 bg-white text-blue-500 shadow-sm" 
                              : "border-gray-300 bg-white text-gray-400"
                          }`}
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            {icon === "UserIcon" && <UserIcon className="w-full h-full" />}
                            {icon === "CheckSquareIcon" && <CheckSquareIcon className="w-full h-full" />}
                            {icon === "SmileIcon" && <SmileIcon className="w-full h-full" />}
                            {icon === "QrCodeIcon" && <QrCodeIcon className="w-full h-full" />}
                            {icon === "ClipboardListIcon" && <ClipboardListIcon className="w-full h-full" />}
                          </div>
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <h3 className={`text-sm font-medium transition-all duration-300 ${
                            formState.currentStep === step 
                              ? "text-blue-500" 
                              : "text-gray-700 group-hover:text-gray-900"
                          }`}>
                            {title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Logos at the bottom */}
            <div className="hidden lg:flex justify-center space-x-8 mt-auto pt-6">
              <img src="/ARTA_Logo.png" alt="ARTA Logo" className="h-12 w-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/CC_Logo.png" alt="CC Logo" className="h-12 w-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <img src="/BP_logo.png" alt="BP Logo" className="h-12 w-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Right Side - Form Content */}
          <div className="bg-white lg:col-start-3 lg:col-span-5 min-h-screen p-3 xs:p-4 lg:p-8 xl:p-20">
            {/* Hide step indicator on mobile as it's shown in the progress bar */}
            <div className="hidden md:block mb-8 lg:mb-15">
              <h2 className="text-sm font-medium text-gray-500">Step {formState.currentStep} of 6</h2>
              <h1 className="text-xl lg:text-2xl font-bold mt-1">
                {FORM_STEPS.find(step => step.step === formState.currentStep)?.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {FORM_STEPS.find(step => step.step === formState.currentStep)?.description}
              </p>
            </div>

            {/* Render the form component based on current step */}
            {formState.currentStep === 1 && (
              <PersonalDetailsForm 
                onNextStep={editingSection === 'personal' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={personalDetails}
                onFormDataChange={setPersonalDetails}
                isReviewMode={editingSection === 'personal'}
              />
            )}
            
            {formState.currentStep === 2 && (
              <CSMARTACheckmark 
                onNextStep={editingSection === 'csmarta' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={csmARTACheckmark}
                onFormDataChange={setCSMARTACheckmark}
                isReviewMode={editingSection === 'csmarta'}
              />
            )}
            {formState.currentStep === 3 && (
              <CSMARTARatings 
                onNextStep={editingSection === 'csmarta-ratings' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={csmARTARatings}
                onFormDataChange={setCSMARTARatings}
                isReviewMode={editingSection === 'csmarta-ratings'}
              />
            )}
            {formState.currentStep === 4 && (
              <QMSCheckmark 
                onNextStep={editingSection === 'qms-checkmark' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={qmsCheckmark}
                onFormDataChange={setQMSCheckmark}
                isReviewMode={editingSection === 'qms-checkmark'}
              />
            )}
            {formState.currentStep === 5 && (
              <QMSRatings 
                onNextStep={editingSection === 'qms-ratings' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={qmsRatings}
                onFormDataChange={setQMSRatings}
                isReviewMode={editingSection === 'qms-ratings'}
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
                onEditSection={handleEditSection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}