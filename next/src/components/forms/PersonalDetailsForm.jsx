'use client'

import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ChevronDown, Mail, Phone, Calendar, User, ChevronLeft, ChevronRight, Building2, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import ServiceSelectionModal from './ServiceSelectionModal'

export default function PersonalDetailsForm({ onNextStep, onPrevStep, formData, onFormDataChange }) {
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false)

  const handleInputChange = (field, value) => {
    const updatedData = {
      ...formData,
      [field]: value
    }
    console.log('Form Data Updated:', updatedData)
    onFormDataChange(updatedData)
  }

  const handleServiceSelect = (serviceData) => {
    console.log('Received service data in form:', serviceData);
    const updatedFormData = {
      ...formData,
      service_id: serviceData.service_id,
      service_name: serviceData.service_name,
      office_name: serviceData.office_name,
      unit_name: serviceData.unit_name,
      service_type_name: serviceData.service_type_name
    };
    console.log('Updating form data to:', updatedFormData);
    onFormDataChange(updatedFormData);
    setIsServicesDialogOpen(false);
  }

  const handleNextClick = () => {
    console.log('Form Data Before Next:', formData)
    onNextStep()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Form Section - Left side */}
      <div className="md:col-span-8 p-10">
        <div className="space-y-8">
          {/* Email Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="email" className="text-base font-medium flex items-center gap-2 mb-3">
              <Mail className="h-4 w-4 text-blue-500" />
              Email Address <span className="text-gray-400 text-sm">(optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="w-full h-12 pl-10 pr-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.email && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
          </motion.div>

          {/* Contact Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Label htmlFor="contact" className="text-base font-medium flex items-center gap-2 mb-3">
              <Phone className="h-4 w-4 text-blue-500" />
              Contact Number
            </Label>
            <div className="relative">
              <Input
                id="contact"
                placeholder="09123456789"
                className="w-full h-12 pl-10 pr-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.contact && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
          </motion.div>

          {/* Age */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Label htmlFor="age" className="text-base font-medium flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-500" />
              Age
            </Label>
            <div className="relative">
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                className="w-full h-12 pl-10 pr-10 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                min="1"
                max="120"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.age && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
          </motion.div>

          {/* Sex */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Label className="text-base font-medium flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-blue-500" />
              Sex
            </Label>
            <div className="grid grid-cols-3 gap-4">
              {['male', 'female', 'prefer-not'].map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl text-center transition-all border
                    ${formData.sex === option 
                      ? 'bg-blue-100 border-blue-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
                    }`}
                  onClick={() => handleInputChange('sex', option)}
                >
                  <span className="text-base capitalize">{option === 'prefer-not' ? 'Prefer not to say' : option}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Services Availed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Label className="text-base font-medium flex items-center gap-2 mb-3">
              <span className="text-blue-500">🛠️</span>
              Services Availed
            </Label>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full p-4 rounded-xl text-left transition-all border
                ${formData.service_id 
                  ? 'bg-blue-100 border-blue-500 shadow-md' 
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
                }`}
              onClick={() => setIsServicesDialogOpen(true)}
            >
              <div className="flex items-center justify-between">
                {formData.service_name ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">{formData.service_name}</span>
                      <span className="text-sm text-gray-500">
                        ({formData.customerType === 'internal' ? 'Internal Customer' : 
                          formData.externalType === 'citizen' ? 'Citizen' :
                          formData.externalType === 'business' ? 'Business' :
                          formData.externalType === 'government' ? 'Government' : 'External Customer'})
                      </span>
                    </div>
                    {formData.office_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {formData.office_name}
                        </span>
                        {formData.unit_name && (
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {formData.unit_name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">Select a service</span>
                )}
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end mt-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="gradient"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg"
              onClick={handleNextClick} 
            >
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Logo Section - Right side */}
      <div className="md:col-span-4 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-10 flex flex-col items-center justify-center min-h-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <img src="/DOST_Logo.png" alt="DOST Logo" className="h-32 w-32 object-contain" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h2 className="text-2xl font-bold text-gray-900">Department of Science and Technology V</h2>
          <p className="text-gray-600">Customer Feedback Form</p>
        </motion.div>
      </div>

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={isServicesDialogOpen}
        onClose={() => setIsServicesDialogOpen(false)}
        onServiceSelect={handleServiceSelect}
        selectedService={formData.service_id ? {
          service_id: formData.service_id,
          service_name: formData.service_name
        } : null}
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
    service_id: PropTypes.number,
    service_name: PropTypes.string,
    office_name: PropTypes.string,
    unit_name: PropTypes.string,
    service_type_name: PropTypes.string,
    sex: PropTypes.string,
    age: PropTypes.string
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired
}
