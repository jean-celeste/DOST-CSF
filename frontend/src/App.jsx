import { useState } from "react"
import { Button } from "./components/ui/button"
import { Checkbox } from "./components/ui/checkbox"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { RadioGroup, RadioGroupItem } from "./components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog"
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

  return (
    <div className="min-h-screen bg-[url('/diamond-pattern.svg')] bg-repeat">
      {/* Data Privacy Consent Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Data Privacy Consent</DialogTitle>
            <DialogDescription className="pt-4">
              <div className="space-y-4 text-sm">
                <p>
                  This Client Satisfaction Measurement (CSM) tracks the customer experience of government offices. Your feedback on your recently concluded transaction will help this office provide a better service.
                </p>
                <p>
                  Personal information shared will be kept confidential and you always
                  have the option to not answer this form.
                </p>
                <p>
                  By filling out this form, you authorize the Department of Science and Technology - V to collect and process the data provided for products and services improvement.
                </p>
                <p>
                  All personal information is protected under Republic Act No. 10173, the Data Privacy Act of 2012.
                </p>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="privacy-consent"
                    checked={privacyConsent}
                    onCheckedChange={(checked) => setPrivacyConsent(checked === true)}
                  />
                  <Label htmlFor="privacy-consent" className="text-sm font-medium">
                    I have read and agree to the Data Privacy terms
                  </Label>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button type="button" variant="outline" onClick={handleDecline}>
              Decline
            </Button>
            <Button type="button" onClick={handleConsent} disabled={!privacyConsent}>
              Accept and Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <h2 className="text-sm font-medium text-gray-500">Step 1 of 4</h2>
              <h1 className="text-2xl font-bold">Personal Details</h1>
              <p className="text-gray-600">All these details are needed to accomplish the appointments.</p>
            </div>

            <div className="space-y-6">
              {/* Email Address */}
              <div>
                <Label htmlFor="email">Email Address(optional)</Label>
                <Input id="email" placeholder="jamilcervano@gmail.com" className="mt-1" />
              </div>

              {/* Customer Type */}
              <div>
                <Label htmlFor="customer-type">Customer Type</Label>
                <Select>
                  <SelectTrigger id="customer-type" className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Services Availed */}
              <div>
                <Label htmlFor="services">Services Availed</Label>
                <Select>
                  <SelectTrigger id="services" className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service1">Service 1</SelectItem>
                    <SelectItem value="service2">Service 2</SelectItem>
                    <SelectItem value="service3">Service 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Number */}
              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" placeholder="+639 -XXXX-XXXX" className="mt-1" />
              </div>

              {/* Region/Province */}
              <div>
                <Label htmlFor="region">Region/Province</Label>
                <Select>
                  <SelectTrigger id="region" className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ncr">NCR</SelectItem>
                    <SelectItem value="region1">Region I</SelectItem>
                    <SelectItem value="region2">Region II</SelectItem>
                    <SelectItem value="region3">Region III</SelectItem>
                    <SelectItem value="region4a">Region IV-A</SelectItem>
                    <SelectItem value="region4b">Region IV-B</SelectItem>
                    <SelectItem value="region5">Region V</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sex */}
              <div>
                <Label>Sex</Label>
                <RadioGroup defaultValue="male" className="mt-2 flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not" id="prefer-not" />
                    <Label htmlFor="prefer-not">Prefer not to indicate</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Age Group */}
              <div>
                <Label>Age Group</Label>
                <RadioGroup defaultValue="18-38" className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="below-18" id="below-18" />
                    <Label htmlFor="below-18">Below 18 years old</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="18-38" id="18-38" />
                    <Label htmlFor="18-38">18-38 years old</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="39-59" id="39-59" />
                    <Label htmlFor="39-59">39-59 years old</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="pt-4 text-right">
                <Button>Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}