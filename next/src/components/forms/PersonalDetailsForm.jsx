'use client'

import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, ChevronDown, Mail, Phone, Calendar, User, ChevronLeft, ChevronRight, Building2, Users, UserCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import ServiceSelectionModal from './ServiceSelectionModal'

export default function PersonalDetailsForm({ onNextStep, onPrevStep, formData, onFormDataChange, isReviewMode }) {
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false)
  const [missingFields, setMissingFields] = useState([])

  const handleInputChange = (field, value) => {
    const updatedData = {
      ...formData,
      [field]: value
    }
    onFormDataChange(updatedData)
    
    // Remove field from missing fields if it's now populated
    if (value) {
      setMissingFields(prev => prev.filter(f => f !== field))
    }
  }

  const handleServiceSelect = (serviceData) => {
    const updatedFormData = {
      ...formData,
      service_id: serviceData.service_id,
      service_name: serviceData.service_name,
      office_name: serviceData.office_name,
      unit_name: serviceData.unit_name,
      service_type_id: serviceData.service_type_id,
      service_type_name: serviceData.service_type_name,
      clientType: serviceData.clientType
    };

    onFormDataChange(updatedFormData);
    setIsServicesDialogOpen(false);
  }

  const handleNextClick = () => {
    // Check if all required fields are populated
    const requiredFields = ['contact', 'age', 'sex', 'service_id'];
    const emptyFields = requiredFields.filter(field => !formData[field]);

    // Validation for contact number (must be exactly 11 digits)
    const isContactInvalid = !formData.contact || formData.contact.length !== 11;
    // Validation for email (if present, must be valid)
    const isEmailInvalid = formData.email && !/^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9\-.]+)\.([a-zA-Z]{2,})$/.test(formData.email);
    // Validation for age (must be between 5 and 100)
    const isAgeInvalid = !formData.age || Number(formData.age) < 5 || Number(formData.age) > 100;

    let invalidFields = [...emptyFields];
    if (isContactInvalid && !invalidFields.includes('contact')) invalidFields.push('contact');
    if (isEmailInvalid && !invalidFields.includes('email')) invalidFields.push('email');
    if (isAgeInvalid && !invalidFields.includes('age')) invalidFields.push('age');

    if (invalidFields.length > 0) {
      setMissingFields(invalidFields);
      return;
    }

    onNextStep();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Form Section - Left side */}
      <div className="md:col-span-8 p-6 sm:p-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Name Field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="name" className="text-sm sm:text-base font-medium flex items-center gap-2 mb-2 sm:mb-3">
              <UserCircle className="h-4 w-4 text-blue-500" />
              Name <span className="text-gray-400 text-xs sm:text-sm">(optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="w-full h-9 pl-8 pr-8 text-xs sm:text-sm rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.name && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
          </motion.div>

          {/* Email Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="email" className="text-sm sm:text-base font-medium flex items-center gap-2 mb-2 sm:mb-3">
              <Mail className="h-4 w-4 text-blue-500" />
              Email Address <span className="text-gray-400 text-xs sm:text-sm">(optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={`w-full h-9 pl-8 pr-8 text-xs sm:text-sm rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  formData.email && !/^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9\-.]+)\.([a-zA-Z]{2,})$/.test(formData.email) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.email && /^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9\-.]+)\.([a-zA-Z]{2,})$/.test(formData.email) && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
            {formData.email && !/^([a-zA-Z0-9_\-.+]+)@([a-zA-Z0-9\-.]+)\.([a-zA-Z]{2,})$/.test(formData.email) && (
              <div className="text-xs text-red-500 mt-1">Please enter a valid email address.</div>
            )}
          </motion.div>

          {/* Contact Number */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Label htmlFor="contact" className="text-sm sm:text-base font-medium flex items-center gap-2 mb-2 sm:mb-3">
              <Phone className="h-4 w-4 text-blue-500" />
              Contact Number
            </Label>
            <div className="relative">
              <Input
                id="contact"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                placeholder="09123456789"
                className={`w-full h-9 pl-8 pr-8 text-xs sm:text-sm rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  missingFields.includes('contact') || (formData.contact && formData.contact.length !== 11) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                value={formData.contact}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange('contact', value);
                }}
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.contact && formData.contact.length === 11 && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
            {formData.contact && formData.contact.length !== 11 && (
              <div className="text-xs text-red-500 mt-1">Contact number must be exactly 11 digits.</div>
            )}
          </motion.div>

          {/* Age */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Label htmlFor="age" className="text-sm sm:text-base font-medium flex items-center gap-2 mb-2 sm:mb-3">
              <Calendar className="h-4 w-4 text-blue-500" />
              Age
            </Label>
            <div className="relative">
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                min="5"
                max="100"
                className={`w-full h-9 pl-8 pr-8 text-xs sm:text-sm rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                  missingFields.includes('age') || (formData.age && (Number(formData.age) < 5 || Number(formData.age) > 100)) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                value={formData.age}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange('age', value);
                }}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {formData.age && Number(formData.age) >= 5 && Number(formData.age) <= 100 && <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />}
            </div>
            {formData.age && (Number(formData.age) < 5 || Number(formData.age) > 100) && (
              <div className="text-xs text-red-500 mt-1">Age must be between 5 and 100.</div>
            )}
          </motion.div>

          {/* Sex */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Label className="text-sm sm:text-base font-medium flex items-center gap-2 mb-2 sm:mb-3">
              <User className="h-4 w-4 text-blue-500" />
              Sex
            </Label>
            <div className={`grid grid-cols-3 gap-2 sm:gap-4 ${missingFields.includes('sex') ? 'ring-2 ring-red-500 rounded-xl p-1' : ''}`}>
              {['male', 'female', 'prefer-not'].map((option) => (
                <motion.button
                  key={option}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-2 sm:p-4 rounded-xl text-center transition-all border
                    ${formData.sex === option 
                      ? 'bg-blue-100 border-blue-500 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
                    }`}
                  onClick={() => handleInputChange('sex', option)}
                >
                  <span className="text-xs sm:text-base capitalize">{option === 'prefer-not' ? 'Prefer not to say' : option}</span>
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
            <Label className="text-sm sm:text-base font-medium flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-blue-500">🛠️</span>
              Services Availed
            </Label>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full p-3 text-xs sm:text-sm rounded-xl text-left transition-all border ${
                formData.service_id 
                  ? 'bg-blue-100 border-blue-500 shadow-md' 
                  : `bg-white ${missingFields.includes('service_id') ? 'border-red-500' : 'border-gray-200'} hover:border-blue-400 hover:shadow-sm`
              }`}
              onClick={() => setIsServicesDialogOpen(true)}
            >
              <div className="flex items-center justify-between">
                {formData.service_name ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium text-xs sm:text-sm">{formData.service_name}</span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {formData.clientType === 'internal' ? 'Internal Client' :
                          formData.clientType === 'citizen' ? 'Citizen' :
                          formData.clientType === 'business' ? 'Business' :
                          formData.clientType === 'government' ? 'Government' : 'External Client'}
                      </span>
                    </div>
                    {formData.office_name && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
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
                  <span className="text-gray-500 text-xs sm:text-sm">Select a service</span>
                )}
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12 sm:mt-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="outline"
              className="px-8 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300"
              onClick={onPrevStep}
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              variant="gradient"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg"
              onClick={handleNextClick} 
            >
              {isReviewMode ? 'Return to Review' : 'Continue'}
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
          <p className="text-gray-600">Client Feedback Form</p>
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
    name: PropTypes.string,
    email: PropTypes.string,
    contact: PropTypes.string,
    service_id: PropTypes.number,
    service_name: PropTypes.string,
    office_name: PropTypes.string,
    unit_name: PropTypes.string,
    service_type_name: PropTypes.string,
    sex: PropTypes.string,
    age: PropTypes.string,
    clientType: PropTypes.string
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired,
  isReviewMode: PropTypes.bool
}
