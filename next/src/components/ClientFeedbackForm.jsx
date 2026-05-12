'use client'

import { useEffect, useState, useCallback } from 'react'
import { UserIcon, CheckSquareIcon, SmileIcon, ClipboardListIcon, QrCodeIcon, MessageSquare } from 'lucide-react'
import PersonalDetailsForm from '@/components/forms/PersonalDetailsForm'
import DataPrivacyConsent from '@/components/prompts/DataPrivacyConsent'
import Review from '@/components/forms/Review'
import ProgressIndicator from '@/components/forms/ProgressIndicator'
import Suggestion from '@/components/forms/Suggestion'
import DynamicFormEngine from '@/components/forms/dynamic/DynamicFormEngine'

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
  INITIAL_SUGGESTION,
  buildStepsFromFormDefinition,
  getActiveSteps,
  determineFormId
} from '@/constants/formSteps'

// Services
import { fetchQuestions, groupQuestions } from '@/lib/questions/fetchQuestions'

/**
 * Fetches the form definition for a given service.
 * Returns the form definition including questions and linked services.
 */
async function fetchFormDefinition(serviceId) {
  try {
    // First, find which forms are linked to this service
    const serviceRes = await fetch(`/api/services/${serviceId}`)
    if (!serviceRes.ok) return null
    const serviceData = await serviceRes.json()
    const linkedForms = serviceData.data?.linked_forms || []

    if (linkedForms.length === 0) return null

    // Sort by form_order and get the first (primary) form
    const sorted = [...linkedForms].sort((a, b) => (a.form_order || 1) - (b.form_order || 1))
    const primaryForm = sorted[0]

    // Fetch the form details with questions
    const formRes = await fetch(`/api/forms/${primaryForm.form_id}`)
    if (!formRes.ok) return null
    const formData = await formRes.json()

    if (!formData.success || !formData.data) return null

    return {
      ...formData.data,
      linked_forms: linkedForms,
      _formId: primaryForm.form_id,
      _formOrder: primaryForm.form_order
    }
  } catch (error) {
    console.error('Error fetching form definition:', error)
    return null
  }
}

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
  const [dynamicFormDef, setDynamicFormDef] = useState(null)
  const [dynamicSteps, setDynamicSteps] = useState(null)
  const [activeSteps, setActiveSteps] = useState(null)
  const [dynamicAnswers, setDynamicAnswers] = useState({})
  const [dynamicFormLoading, setDynamicFormLoading] = useState(false)
  const [showDynamicForm, setShowDynamicForm] = useState(false)
  const [dynamicCurrentStepIndex, setDynamicCurrentStepIndex] = useState(0)

  const toggleLanguage = () => setLanguage(l => l === 'en' ? 'fil' : 'en')

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }, [formState.currentStep])

  /**
   * When a service is selected, attempt to load a dynamic form definition.
   * If a dynamic form is found and is active, use the dynamic engine.
   * Otherwise, fall back to the legacy hard-coded form system.
   */
  useEffect(() => {
    const loadDynamicForm = async () => {
      if (!personalDetails.service_id) {
        setShowDynamicForm(false)
        setDynamicFormDef(null)
        setDynamicSteps(null)
        setActiveSteps(null)
        setDynamicAnswers({})
        return
      }

      setDynamicFormLoading(true)
      const formDef = await fetchFormDefinition(personalDetails.service_id)

      if (formDef && formDef.form_id && formDef.questions && formDef.questions.length > 0) {
        // Check if form is active (status_id = 1)
        if (formDef.status_id === 1) {
          // Build dynamic steps
          const steps = buildStepsFromFormDefinition(formDef, personalDetails.clientType)
          const active = getActiveSteps(personalDetails.clientType, steps)

          setDynamicFormDef(formDef)
          setDynamicSteps(steps)
          setActiveSteps(active)
          setDynamicAnswers(prev => ({
            ...prev,
            ...buildDynamicAnswers(formDef.questions)
          }))
          setShowDynamicForm(true)
          setDynamicFormLoading(false)
          return
        }
      }

      // Fall back to legacy form system
      setShowDynamicForm(false)
      setDynamicFormDef(null)
      setDynamicSteps(null)
      setActiveSteps(null)
      setDynamicAnswers({})
      setDynamicCurrentStepIndex(0)
      setDynamicFormLoading(false)

      // Determine legacy form type based on client type
      const isExternal = ['citizen', 'business', 'government'].includes(personalDetails.clientType)
      setFormState(prev => ({
        ...prev,
        currentFormId: isExternal ? 1 : 2,
        formType: isExternal ? 'csm-arta' : 'qms',
        currentStep: 1,
        showMainForm: true
      }))
    }

    loadDynamicForm()
  }, [personalDetails.service_id, personalDetails.clientType])

  /**
   * Build initial answers object for dynamic form questions
   */
  const buildDynamicAnswers = (questions) => {
    if (!questions || !Array.isArray(questions)) return {}
    return questions.reduce((acc, q) => {
      switch (q.question_type) {
        case 'rating':
        case 'radio':
          acc[q.question_id] = null
          break
        case 'checkmark':
          acc[q.question_id] = false
          break
        case 'text':
        case 'textarea':
          acc[q.question_id] = ''
          break
        default:
          acc[q.question_id] = null
      }
      return acc
    }, {})
  }

  const handleConsent = () => {
    setFormState(prev => ({ ...prev, showMainForm: true }))
  }

  const handleDecline = () => {
    alert('You need to accept the Data Privacy terms to proceed with the survey.')
  }

  const handleNextStep = () => {
    setFormState(prev => {
      if (prev.currentStep >= 7) return prev

      const isExternal = ['citizen', 'business', 'government'].includes(personalDetails.clientType)

      if (prev.currentStep === 1) {
        if (isExternal) return { ...prev, currentStep: 2 }
      }

      if (isExternal && prev.currentStep === 3) {
        return { ...prev, currentStep: 6 }
      }

      return { ...prev, currentStep: prev.currentStep + 1 }
    })
  }

  const handlePrevStep = () => {
    setFormState(prev => {
      if (prev.currentStep === 1) return { ...prev, showMainForm: false }

      const isExternal = ['citizen', 'business', 'government'].includes(personalDetails.clientType)

      if (prev.currentStep === 6) {
        if (isExternal) return { ...prev, currentStep: 3 }
      }

      if (isExternal && prev.currentStep === 3) {
        return { ...prev, currentStep: 2 }
      }

      return { ...prev, currentStep: prev.currentStep - 1 }
    })
  }

  const handleEditSection = (section) => {
    setEditingSection(section)
    const sectionStepMap = {
      personal: 1,
      csmarta: 2,
      'csmarta-ratings': 3,
      'qms-ratings': 4,
      'qms-checkmark': 5,
      suggestion: 6
    }
    if (sectionStepMap[section] !== undefined) {
      setFormState(prev => ({ ...prev, currentStep: sectionStepMap[section] }))
    }
  }

  const handleReturnToReview = () => {
    setEditingSection(null)
    setFormState(prev => ({ ...prev, currentStep: 7 }))
  }

  const handleNewForm = () => {
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
    setShowDynamicForm(false)
    setDynamicFormDef(null)
    setDynamicSteps(null)
    setActiveSteps(null)
    setDynamicAnswers({})
    setDynamicCurrentStepIndex(0)
  }

  /**
   * Handle form submission from the dynamic form engine
   */
  const handleDynamicSubmit = async (payload) => {
    try {
      console.log('[ClientFeedbackForm] handleDynamicSubmit received payload:', payload)
      // Ensure serviceId fallback from personalDetails
      if (!payload.serviceId && payload.personalDetails?.service_id) {
        payload.serviceId = payload.personalDetails.service_id
        console.log('[ClientFeedbackForm] Applied fallback serviceId from personalDetails:', payload.serviceId)
      }
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: payload.formId,
          serviceId: payload.serviceId,
          personalDetails: payload.personalDetails,
          answers: payload.answers,
          clientType: payload.clientType
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to submit form')
      return result
    } catch (error) {
      console.error('Dynamic form submission error:', error)
      throw error
    }
  }

  /**
   * Go back from dynamic form to service selection
   */
  const handleDynamicBack = () => {
    setShowDynamicForm(false)
    setDynamicFormDef(null)
    setDynamicSteps(null)
    setActiveSteps(null)
    setDynamicAnswers({})
    setDynamicCurrentStepIndex(0)
    setPersonalDetails(INITIAL_PERSONAL_DETAILS)
  }

  // Render data privacy consent if form hasn't been shown yet
  if (!formState.showMainForm && !showDynamicForm) {
    return <DataPrivacyConsent onConsent={handleConsent} onDecline={handleDecline} />
  }

  // Render dynamic form engine when active
  if (showDynamicForm && dynamicFormDef && dynamicSteps && activeSteps) {
    return (
      <div className="min-h-screen bg-gray-50">
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
                <div className="text-xs xs:text-sm font-medium text-gray-500">
                  Step {dynamicCurrentStepIndex + 1}/{activeSteps?.length || 0}
                </div>
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

              {/* Progress Indicator */}
              <ProgressIndicator
                currentStep={activeSteps?.[dynamicCurrentStepIndex]?.step}
                steps={dynamicSteps}
                activeSteps={activeSteps}
                serviceType={personalDetails.service_type_id}
                clientType={personalDetails.clientType}
                isDynamic={true}
              />

              {/* Logos at the bottom */}
              <div className="hidden lg:flex justify-center space-x-8 mt-auto pt-6">
                <img src="/ARTA_Logo.png" alt="ARTA Logo" className="h-12 w-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
                <img src="/CC_Logo.png" alt="CC Logo" className="h-12 w-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
                <img src="/BP_logo.png" alt="BP Logo" className="h-12 w-12 object-contain opacity-90 hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Right Side - Dynamic Form Content */}
            <div className="bg-white lg:col-start-3 lg:col-span-5 min-h-screen p-3 xs:p-4 lg:p-8 xl:p-20">
              <DynamicFormEngine
                formDefinition={dynamicFormDef}
                clientType={personalDetails.clientType}
                serviceId={personalDetails.service_id}
                onSubmit={handleDynamicSubmit}
                onBack={handleDynamicBack}
                onStepChange={setDynamicCurrentStepIndex}
                initialAnswers={{
                  ...dynamicAnswers,
                  personalDetails,
                  suggestions: suggestion
                }}
                language={language}
                onLanguageToggle={toggleLanguage}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state while checking for dynamic forms
  if (dynamicFormLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading form...</p>
        </div>
      </div>
    )
  }

  // Fallback: Render legacy hard-coded form system
  const isExternal = ['citizen', 'business', 'government'].includes(personalDetails.clientType)
  const isInternal = personalDetails.clientType === 'internal'
  const currentDynamicStep = dynamicSteps?.find(s => s.step === formState.currentStep)

  return (
    <div className="min-h-screen bg-gray-50">
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

            {/* Progress Indicator */}
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