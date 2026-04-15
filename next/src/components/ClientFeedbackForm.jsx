'use client'

import { useEffect, useState } from 'react'
import { UserIcon, CheckSquareIcon, SmileIcon, ClipboardListIcon, QrCodeIcon, MessageSquare } from 'lucide-react'
import PersonalDetailsForm from '@/components/forms/PersonalDetailsForm'
import DataPrivacyConsent from '@/components/prompts/DataPrivacyConsent'
import Review from '@/components/forms/Review'
import ProgressIndicator from '@/components/forms/ProgressIndicator'
import Suggestion from '@/components/forms/Suggestion'

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
  INITIAL_QMS_RATINGS,
  INITIAL_SUGGESTION
} from '@/constants/formSteps'

export default function ClientFeedbackForm() {
  const [formState, setFormState] = useState({
    ...INITIAL_FORM_STATE,
    currentFormId: 1,
    formType: 'csm-arta'
  })
  const [personalDetails, setPersonalDetails] = useState(INITIAL_PERSONAL_DETAILS)
  const [csmARTACheckmark, setCSMARTACheckmark] = useState(INITIAL_CSM_ARTA_CHECKMARK)
  const [csmARTARatings, setCSMARTARatings] = useState(INITIAL_CSM_ARTA_RATINGS)
  const [qmsCheckmark, setQMSCheckmark] = useState(INITIAL_QMS_CHECKMARK)
  const [qmsRatings, setQMSRatings] = useState(INITIAL_QMS_RATINGS)
  const [suggestion, setSuggestion] = useState(INITIAL_SUGGESTION)
  const [editingSection, setEditingSection] = useState(null)
  const [language, setLanguage] = useState('en')
  const toggleLanguage = () => setLanguage(l => l === 'en' ? 'fil' : 'en')

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [formState.currentStep])

  const handleConsent = () => {
    setFormState(prev => ({ ...prev, showMainForm: true }))
  }

  const handleDecline = () => {
    alert('You need to accept the Data Privacy terms to proceed with the survey.')
  }

  const handleNextStep = () => {
    console.log('Current Step:', formState.currentStep);
    console.log('Service Type ID:', personalDetails.service_type_id);
    console.log('Client Type:', personalDetails.clientType);
    
    setFormState(prev => {
      // Don't increment if we're already at the last step
      if (prev.currentStep >= 7) {
        return prev;
      }

      const isExternal = ['citizen', 'business', 'government'].includes(personalDetails.clientType);

      // Step 1: Decide which form to show next
      if (prev.currentStep === 1) {
        if (isExternal) {
          // External clients always use CSM path (step 2)
          return { ...prev, currentStep: 2 };
        }
      }

      // For CSM (all external clients), skip QMS steps
      if (isExternal) {
        if (prev.currentStep === 3) {
          // After CSM ratings, go to suggestion
          return { ...prev, currentStep: 6 };
        }
      }

      return { ...prev, currentStep: prev.currentStep + 1 };
    });
  }

  const handlePrevStep = () => {
    setFormState(prev => {
      // If we're at step 1, go back to data privacy consent
      if (prev.currentStep === 1) {
        return { ...prev, showMainForm: false };
      }

      const isExternal = ['citizen', 'business', 'government'].includes(personalDetails.clientType);

      // If we're at step 6 (suggestion), go back to the appropriate previous step based on service type
      if (prev.currentStep === 6) {
        if (isExternal) {
          // For external clients, go back to CSM ratings (step 3)
          return { ...prev, currentStep: 3 };
        }
      }

      // For external clients, skip steps 4 and 5
      if (isExternal) {
        if (prev.currentStep === 3) {
          // Go back to CSM checkmark (step 2)
          return { ...prev, currentStep: 2 };
        }
      }

      return { ...prev, currentStep: prev.currentStep - 1 };
    });
  }

  const handleEditSection = (section) => {
    setEditingSection(section)
    if (section === 'personal') {
      setFormState(prev => ({ ...prev, currentStep: 1 }))
    } else if (section === 'csmarta') {
      setFormState(prev => ({ ...prev, currentStep: 2 }))
    } else if (section === 'csmarta-ratings') {
      setFormState(prev => ({ ...prev, currentStep: 3 }))
    } else if (section === 'qms-ratings') {
      setFormState(prev => ({ ...prev, currentStep: 4 }))
    } else if (section === 'qms-checkmark') {
      setFormState(prev => ({ ...prev, currentStep: 5 }))
    } else if (section === 'suggestion') {
      setFormState(prev => ({ ...prev, currentStep: 6 }))
    }
  }

  const handleReturnToReview = () => {
    setEditingSection(null)
    setFormState(prev => ({ ...prev, currentStep: 7 }))
  }

  const handleNewForm = () => {
    // Reset all form states
    setFormState({
      ...INITIAL_FORM_STATE,
      currentFormId: 1,
      formType: 'csm-arta'
    })
    setPersonalDetails(INITIAL_PERSONAL_DETAILS)
    setCSMARTACheckmark(INITIAL_CSM_ARTA_CHECKMARK)
    setCSMARTARatings(INITIAL_CSM_ARTA_RATINGS)
    setQMSCheckmark(INITIAL_QMS_CHECKMARK)
    setQMSRatings(INITIAL_QMS_RATINGS)
    setSuggestion(INITIAL_SUGGESTION)
    setEditingSection(null)
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
              <div className="text-xs xs:text-sm font-medium text-gray-500">Step {formState.currentStep}/7</div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center mb-8">
              <div className="mr-3 h-14 w-14">
                <img src="/DOST_Logo.png" alt="DOST Logo" className="h-14 w-14 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Department of Science and Technology V</h1>
                <p className="text-base text-gray-600">Client Feedback Form</p>
              </div>
            </div>

            {/* Progress Indicator (both mobile and desktop) */}
            <ProgressIndicator 
              currentStep={formState.currentStep} 
              steps={FORM_STEPS} 
              serviceType={personalDetails.service_type_id}
              clientType={personalDetails.clientType}
            />

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
              <h2 className="text-sm font-medium text-gray-500">Step {formState.currentStep} of 7</h2>
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
            {/* CSM: external clients */}
            {formState.currentStep === 2 && ['internal','citizen','business','government'].includes(personalDetails.clientType) && (
              <CSMARTACheckmark 
                onNextStep={editingSection === 'csmarta' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={csmARTACheckmark}
                onFormDataChange={setCSMARTACheckmark}
                isReviewMode={editingSection === 'csmarta'}
                language={language}
                toggleLanguage={toggleLanguage}
              />
            )}
            {formState.currentStep === 3 && ['internal','citizen','business','government'].includes(personalDetails.clientType) && (
              <CSMARTARatings 
                onNextStep={editingSection === 'csmarta-ratings' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={csmARTARatings}
                onFormDataChange={setCSMARTARatings}
                isReviewMode={editingSection === 'csmarta-ratings'}
                language={language}
                toggleLanguage={toggleLanguage}
              />
            )}
            {/* QMS: internal clients */}
            {formState.currentStep === 4 && personalDetails.clientType === 'internal' && (
              <QMSRatings 
                onNextStep={editingSection === 'qms-ratings' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={qmsRatings}
                onFormDataChange={setQMSRatings}
                isReviewMode={editingSection === 'qms-ratings'}
              />
            )}
            {formState.currentStep === 5 && personalDetails.clientType === 'internal' && (
              <QMSCheckmark 
                onNextStep={editingSection === 'qms-checkmark' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={qmsCheckmark}
                onFormDataChange={setQMSCheckmark}
                isReviewMode={editingSection === 'qms-checkmark'}
              />
            )}
            {formState.currentStep === 6 && (
              <Suggestion 
                onNextStep={editingSection === 'suggestion' ? handleReturnToReview : handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={{
                  ...suggestion,
                  ratings: personalDetails.clientType === 'internal' ? qmsRatings.ratings : csmARTARatings.ratings
                }}
                onFormDataChange={setSuggestion}
                isReviewMode={editingSection === 'suggestion'}
              />
            )}
            {formState.currentStep === 7 && (
              <Review 
                onNextStep={handleNextStep} 
                onPrevStep={handlePrevStep}
                formData={{
                  personalDetails,
                  csmARTACheckmark,
                  csmARTARatings,
                  qmsCheckmark,
                  qmsRatings,
                  suggestion
                }}
                onEditSection={handleEditSection}
                onNewForm={handleNewForm}
                formId={formState.currentFormId}
                formType={formState.formType}
                language={language}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}