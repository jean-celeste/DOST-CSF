'use client'

import { useState } from 'react'
import PropTypes from 'prop-types'
import { UserIcon, CheckSquareIcon, SmileIcon, ClipboardListIcon, QrCodeIcon } from 'lucide-react'
import PersonalDetailsForm from '@/components/forms/PersonalDetailsForm'
import DataPrivacyConsent from '@/components/prompts/DataPrivacyConsent'
import Review from '@/components/forms/Review'

// CSM-ARTA components
import CSMARTACheckmark from '@/components/forms/csm-arta/Checkmark'
import CSMARTARatings from '@/components/forms/csm-arta/Ratings'

// QMS components
import QMSCheckmark from '@/components/forms/qms-f4/Checkmark'
import QMSRatings from '@/components/forms/qms-f4/Ratings'

export default function CustomerFeedbackForm() {
  const [formState, setFormState] = useState({
    showMainForm: false,
    currentStep: 1
  })

  const [personalDetails, setPersonalDetails] = useState({
    email: '',
    contact: '',
    services: '',
    sex: 'male',
    age: ''
  })

  const [csmARTACheckmark, setCSMARTACheckmark] = useState({
    selectedOption: null,
    additionalAnswers: {}
  })

  const [csmARTARatings, setCSMARTARatings] = useState({
    ratings: {
      question1: "",
      question2: "",
      question3: "",
      question4: "",
      question5: "",
      question6: ""
    },
    currentPage: 0
  })

  const [qmsCheckmark, setQMSCheckmark] = useState({
    selectedOption: null
  })

  const [qmsRatings, setQMSRatings] = useState({
    ratings: {
      question1: "",
      question2: "",
      question3: "",
      question4: "",
      question5: ""
    },
    currentPage: 0
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
    <div className="min-h-screen">
      {/* Main Form Content */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-7">
          {/* Left Side - Progress Indicator */}
          <div className="bg-[url('/diamond-pattern.svg')] bg-repeat bg-gray-50/95 p-8 md:col-span-2 relative shadow-lg z-10 min-h-screen flex flex-col">
            <div className="mb-10 flex items-center">
              <div className="mr-3 h-16 w-16">
                <img src="/DOST_Logo.png" alt="DOST Logo" className="h-16 w-16 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">Department of Science and Technology V</h1>
                <p className="text-base text-gray-600">Customer Feedback Form</p>
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-xl font-bold text-gray-800 mb-2">Stages of Feedback</h1>
              <p className="text-base text-gray-600">Your feedback will help us enhance our services</p>
            </div>

            <div className="relative flex-grow">
              {/* Steps Container with rounded corners */}
              <div className="bg-white/80 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
                {/* Steps Container */}
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-6 top-4 h-[calc(100%-32px)] w-0.5 bg-gray-200"></div>

                  <div className="space-y-8">
                    {/* Step 1 - Personal Details */}
                    <div className="relative flex items-start">
                      <div
                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          formState.currentStep >= 1 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <UserIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 pt-1">
                        <h3 className={`font-medium transition-colors duration-200 ${formState.currentStep === 1 ? "text-blue-500" : "text-gray-700"}`}>
                          Personal Details
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Please provide your basic information</p>
                      </div>
                    </div>

                    {/* Step 2 - Citizen's Charter */}
                    <div className="relative flex items-start">
                      <div
                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          formState.currentStep >= 2 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <CheckSquareIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 pt-1">
                        <h3 className={`font-medium transition-colors duration-200 ${formState.currentStep === 2 ? "text-blue-500" : "text-gray-700"}`}>
                          Citizen's Charter
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Questions about the Citizen's Charter</p>
                      </div>
                    </div>

                    {/* Step 3 - CSM-ARTA Ratings */}
                    <div className="relative flex items-start">
                      <div
                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          formState.currentStep >= 3 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <SmileIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 pt-1">
                        <h3 className={`font-medium transition-colors duration-200 ${formState.currentStep === 3 ? "text-blue-500" : "text-gray-700"}`}>
                          Service Ratings
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Rate your satisfaction with our services</p>
                      </div>
                    </div>

                    {/* Step 4 - QMS */}
                    <div className="relative flex items-start">
                      <div
                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          formState.currentStep >= 4 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <QrCodeIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 pt-1">
                        <h3 className={`font-medium transition-colors duration-200 ${formState.currentStep === 4 ? "text-blue-500" : "text-gray-700"}`}>
                          QMS
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Questions about the QMS</p>
                      </div>
                    </div>

                    {/* Step 5 - QMS Ratings */}
                    <div className="relative flex items-start">
                      <div
                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          formState.currentStep >= 5 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <SmileIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 pt-1">
                        <h3 className={`font-medium transition-colors duration-200 ${formState.currentStep === 5 ? "text-blue-500" : "text-gray-700"}`}>
                          QMS Ratings
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Rate the QMS</p>
                      </div>
                    </div>

                    {/* Step 6 - Review */}
                    <div className="relative flex items-start">
                      <div
                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                          formState.currentStep >= 6 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <ClipboardListIcon className="h-6 w-6" />
                      </div>
                      <div className="ml-4 pt-1">
                        <h3 className={`font-medium transition-colors duration-200 ${formState.currentStep === 6 ? "text-blue-500" : "text-gray-700"}`}>
                          Review
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Review your answers before submission</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logos at the bottom */}
            <div className="mt-auto pt-8 flex justify-center space-x-6">
              <img src="/ARTA_Logo.png" alt="ARTA Logo" className="h-12 w-12 object-contain" />
              <img src="/CC_Logo.png" alt="CC Logo" className="h-12 w-12 object-contain" />
              <img src="/BP_logo.png" alt="BP Logo" className="h-12 w-12 object-contain" />
            </div>
          </div>

          {/* Right Side - Form Content */}
          <div className="bg-white p-20 md:col-span-5">
            <div className="mb-15">
              <h2 className="text-sm font-medium text-gray-500">Step {formState.currentStep} of 6</h2>
              <h1 className="text-2xl font-bold">
                {formState.currentStep === 1 && "Personal Details"}
                {formState.currentStep === 2 && "Citizen's Charter"}
                {formState.currentStep === 3 && "Service Ratings"}
                {formState.currentStep === 4 && "QMS Checkmark"}
                {formState.currentStep === 5 && "QMS Ratings"}
                {formState.currentStep === 6 && "Review"}
              </h1>
              <p className="text-gray-600">
                {formState.currentStep === 1 && "All these details are needed to be accomplished."}
                {formState.currentStep === 2 && "Please answer questions about the Citizen's Charter."}
                {formState.currentStep === 3 && "Rate your satisfaction with our services."}
                {formState.currentStep === 4 && "Please provide feedback"}
                {formState.currentStep === 5 && "Rate your experience"}
                {formState.currentStep === 6 && "Review your answers before submission."}
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