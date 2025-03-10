import { useState } from "react"
import PersonalDetailsForm from "./components/forms/PersonalDetailsForm"
import DataPrivacyDialog from "./components/prompts/DataPrivacyDialog"
import { UserIcon, CheckSquareIcon, SmileIcon, ClipboardListIcon } from "lucide-react"

export default function CustomerFeedbackForm() {
  const [privacyConsent, setPrivacyConsent] = useState(false)
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  const handleConsent = () => {
    setPrivacyConsent(true)
    setShowPrivacyDialog(false)
  }

  const handleDecline = () => {
    alert("You need to accept the Data Privacy terms to proceed with the survey.")
  }

  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-[url('/diamond-pattern.svg')] bg-repeat">
      {/* Data Privacy Consent Dialog */}
      <DataPrivacyDialog
        open={showPrivacyDialog}
        onOpenChange={setShowPrivacyDialog}
        privacyConsent={privacyConsent}
        setPrivacyConsent={setPrivacyConsent}
        onConsent={handleConsent}
        onDecline={handleDecline}
      />

      {/* Main Form Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          {/* Left Side - Progress Indicator */}
          <div className="md:col-span-2">
            <div className="mb-8 flex items-center">
              <div className="mr-2 h-16 w-16">
                <img src="/dost-logo.png" alt="DOST Logo" className="h-16 w-16" />
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
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${currentStep >= 1 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"}`}
                >
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-medium ${currentStep === 1 ? "text-blue-500" : "text-gray-700"}`}>
                    Personal Details
                  </h3>
                  <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>

              {/* Step 2 - Checkmarks */}
              <div className="relative mb-8 flex">
                <div
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${currentStep >= 2 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"}`}
                >
                  <CheckSquareIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-medium ${currentStep === 2 ? "text-blue-500" : "text-gray-700"}`}>Checkmarks</h3>
                  <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>

              {/* Step 3 - Ratings */}
              <div className="relative mb-8 flex">
                <div
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${currentStep >= 3 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"}`}
                >
                  <SmileIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-medium ${currentStep === 3 ? "text-blue-500" : "text-gray-700"}`}>Ratings</h3>
                  <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>

              {/* Step 4 - Review */}
              <div className="relative flex">
                <div
                  className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${currentStep >= 4 ? "border-blue-500 bg-white text-blue-500" : "border-gray-300 bg-white text-gray-400"}`}
                >
                  <ClipboardListIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className={`font-medium ${currentStep === 4 ? "text-blue-500" : "text-gray-700"}`}>Review</h3>
                  <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form Content */}
          <div className="rounded-lg bg-white p-6 shadow-md md:col-span-3">
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-500">Step {currentStep} of 4</h2>
              <h1 className="text-2xl font-bold">
                {currentStep === 1 && "Personal Details"}
                {currentStep === 2 && "Checkmarks"}
                {currentStep === 3 && "Ratings"}
                {currentStep === 4 && "Review"}
              </h1>
              <p className="text-gray-600">
                {currentStep === 1 && "All these details are needed to accomplish the appointments."}
                {currentStep === 2 && "Please check what applies to your experience."}
                {currentStep === 3 && "Rate your satisfaction with our services."}
                {currentStep === 4 && "Review your answers before submission."}
              </p>
            </div>

            {/* Render the form component based on current step */}
            {currentStep === 1 && <PersonalDetailsForm onNextStep={handleNextStep} />}
            {/* Add other form components for steps 2, 3, and 4 */}
          </div>
        </div>
      </div>
    </div>
  )
}