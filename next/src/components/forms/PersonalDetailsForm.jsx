'use client'

import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ChevronDown, Mail, Phone, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import ServiceSelectionModal from './ServiceSelectionModal'

// List of available services
const SERVICES = [
  {
    id: 'service1',
    name: 'Laboratory Testing Services',
    description: 'Chemical, microbiological, and physical testing of food and non-food products',
    icon: '🧪'
  },
  {
    id: 'service2',
    name: 'Calibration Services',
    description: 'Calibration of measuring instruments and equipment',
    icon: '📏'
  },
  {
    id: 'service3',
    name: 'Technical Consultancy',
    description: 'Expert advice and assistance on technical matters',
    icon: '💼'
  },
  {
    id: 'service4',
    name: 'Technology Training',
    description: 'Training programs on various technologies and processes',
    icon: '🎓'
  },
  {
    id: 'service5',
    name: 'Research & Development',
    description: 'Support for research and development projects',
    icon: '🔬'
  },
  {
    id: 'service6',
    name: 'Technology Transfer',
    description: 'Transfer of technology to businesses and organizations',
    icon: '🔄'
  }
]

export default function PersonalDetailsForm({ onNextStep, onPrevStep, formData, onFormDataChange }) {
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false)

  const handleInputChange = (field, value) => {
    onFormDataChange({
      ...formData,
      [field]: value
    })
  }

  const handleServiceSelect = (service) => {
    handleInputChange('services', service.id)
    setIsServicesDialogOpen(false)
  }

  const selectedService = SERVICES.find(service => service.id === formData.services)

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Form Section - Left side */}
        <div className="md:col-span-8 p-8">
          <div className="space-y-6">
            {/* Email Address */}
          <div>
            <Label htmlFor="email" className="text-base font-medium flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Email Address <span className="text-gray-400 text-sm">(optional)</span>
              </Label>
            <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                className="w-full h-12 pl-10 pr-10"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.email && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
            </div>

            {/* Contact Number */}
          <div>
            <Label htmlFor="contact" className="text-base font-medium flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-blue-500" />
                Contact Number
              </Label>
            <div className="relative">
                <Input
                  id="contact"
                  placeholder="09123456789"
                className="w-full h-12 pl-10 pr-10"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.contact && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
            </div>

            {/* Age */}
          <div>
            <Label htmlFor="age" className="text-base font-medium flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Age
              </Label>
            <div className="relative">
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                className="w-full h-12 pl-10 pr-10"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  min="1"
                  max="120"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.age && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
            </div>

            {/* Sex */}
            <div>
            <Label className="text-base font-medium flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-500" />
                Sex
              </Label>
            <div className="grid grid-cols-3 gap-3">
              {['male', 'female', 'prefer-not'].map((option) => (
                <button
                  key={option}
                  className={`p-4 rounded-xl text-center transition-all border
                    ${formData.sex === option 
                      ? 'bg-blue-100 border-blue-500' 
                      : 'bg-white border-gray-200 hover:border-blue-400'
                    }`}
                  onClick={() => handleInputChange('sex', option)}
                >
                  <span className="text-base capitalize">{option === 'prefer-not' ? 'Prefer not to say' : option}</span>
                </button>
              ))}
            </div>
            </div>

            {/* Services Availed */}
            <div>
              <Label className="text-base font-medium flex items-center gap-2 mb-2">
                <span className="text-blue-500">🛠️</span>
                Services Availed
              </Label>
              <button
                className={`w-full p-4 rounded-xl text-left transition-all border
                  ${formData.services 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'bg-white border-gray-200 hover:border-blue-400'
                  }`}
                onClick={() => setIsServicesDialogOpen(true)}
              >
                <div className="flex items-center justify-between">
                  {formData.services ? (
                    <span className="flex items-center">
                      <span className="mr-2">🛠️</span>
                      {formData.services}
                    </span>
                  ) : (
                    <span className="text-gray-500">Select a service</span>
                  )}
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
        <div className="flex justify-end mt-20">
            <Button 
              variant="gradient"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md"
              onClick={onNextStep} 
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
      </div>

      {/* Logo Section - Right side */}
      <div className="md:col-span-4 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-8 flex flex-col items-center justify-center min-h-full">
        <div className="mb-6">
          <img src="/DOST_Logo.png" alt="DOST Logo" className="h-32 w-32 object-contain" />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">Department of Science and Technology V</h2>
          <p className="text-gray-600">Customer Feedback Form</p>
        </div>
      </div>

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={isServicesDialogOpen}
        onClose={() => setIsServicesDialogOpen(false)}
        onServiceSelect={handleServiceSelect}
        selectedService={formData.services}
      />
    </div>
  )
}

PersonalDetailsForm.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    email: PropTypes.string,
    contact: PropTypes.string,
    services: PropTypes.string,
    sex: PropTypes.string,
    age: PropTypes.string
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired
}
