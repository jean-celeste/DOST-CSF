'use client'

import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// List of available services
const SERVICES = [
  {
    id: 'service1',
    name: 'Laboratory Testing Services',
    description: 'Chemical, microbiological, and physical testing of food and non-food products'
  },
  {
    id: 'service2',
    name: 'Calibration Services',
    description: 'Calibration of measuring instruments and equipment'
  },
  {
    id: 'service3',
    name: 'Technical Consultancy',
    description: 'Expert advice and assistance on technical matters'
  },
  {
    id: 'service4',
    name: 'Technology Training',
    description: 'Training programs on various technologies and processes'
  },
  {
    id: 'service5',
    name: 'Research & Development',
    description: 'Support for research and development projects'
  },
  {
    id: 'service6',
    name: 'Technology Transfer',
    description: 'Transfer of technology to businesses and organizations'
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

  const selectedService = SERVICES.find(service => service.id === formData.services)

  return (
    <div className="space-y-6">
      {/* Email Address */}
      <div className="relative">
        <Label htmlFor="email">Email Address (optional)</Label>
        <div className="relative w-1/2">
          <Input
            id="email"
            placeholder="Email"
            className="mt-1 rounded-lg w-full h-12 px-2"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
          {formData.email && <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />}
        </div>
      </div>

      {/* Contact Number */}
      <div className="relative">
        <Label htmlFor="contact">Contact Number</Label>
        <div className="relative w-1/2">
          <Input
            id="contact"
            placeholder="09123456789"
            className="mt-1 rounded-lg w-full h-12 px-2"
            value={formData.contact}
            onChange={(e) => handleInputChange('contact', e.target.value)}
          />
          {formData.contact && <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />}
        </div>
      </div>

      {/* Sex */}
      <div>
        <Label>Sex</Label>
        <div className="mt-2 flex w-1/2 space-x-2">
          <Button
            type="button"
            variant={formData.sex === 'male' ? 'gradient' : 'outline'}
            onClick={() => handleInputChange('sex', 'male')}
            className="rounded-lg flex-1"
          >
            Male
          </Button>
          <Button
            type="button"
            variant={formData.sex === 'female' ? 'gradient' : 'outline'}
            onClick={() => handleInputChange('sex', 'female')}
            className="rounded-lg flex-1"
          >
            Female
          </Button>
          <Button
            type="button"
            variant={formData.sex === 'prefer-not' ? 'gradient' : 'outline'}
            onClick={() => handleInputChange('sex', 'prefer-not')}
            className="rounded-lg flex-2"
          >
            Prefer not to indicate
          </Button>
        </div>
      </div>

      {/* Age Group */}
      <div>
        <Label>Age Group</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 w-1/2">
          <Button
            type="button"
            variant={formData.ageGroup === 'below-18' ? 'gradient' : 'outline'}
            onClick={() => handleInputChange('ageGroup', 'below-18')}
            className="rounded-lg"
          >
            Below 18 years old
          </Button>
          <Button
            type="button"
            variant={formData.ageGroup === '18-38' ? 'gradient' : 'outline'}
            onClick={() => handleInputChange('ageGroup', '18-38')}
            className="rounded-lg"
          >
            18-38 years old
          </Button>
          <Button
            type="button"
            variant={formData.ageGroup === '39-59' ? 'gradient' : 'outline'}
            onClick={() => handleInputChange('ageGroup', '39-59')}
            className="rounded-lg"
          >
            39-59 years old
          </Button>
          <Button
            type="button"
            variant={formData.ageGroup === '60-above' ? 'gradient' : 'outline'}
            onClick={() => handleInputChange('ageGroup', '60-above')}
            className="rounded-lg"
          >
            60 years old and above
          </Button>
        </div>
      </div>

      {/* Services Availed */}
      <div>
        <Label>Services Availed</Label>
        <Dialog open={isServicesDialogOpen} onOpenChange={setIsServicesDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={`mt-2 w-1/2 h-12 justify-between text-left font-normal ${!selectedService ? 'text-gray-500' : ''}`}
            >
              {selectedService ? selectedService.name : 'Select a service'}
              <Check className={`h-5 w-5 ${selectedService ? 'text-blue-500' : 'opacity-0'}`} />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select a Service</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {SERVICES.map((service) => (
                <button
                  key={service.id}
                  className={`p-4 rounded-lg text-left transition-all border ${
                    formData.services === service.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    handleInputChange('services', service.id)
                    setIsServicesDialogOpen(false)
                  }}
                >
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="pt-4 flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevStep}
          className="px-6 py-2 bg-gray-100 text-gray-700"
        >
          Go Back
        </Button>
        <Button 
          type="button" 
          variant="gradient" 
          onClick={onNextStep} 
          className="px-6 py-2"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// Props validation
PersonalDetailsForm.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    email: PropTypes.string,
    contact: PropTypes.string,
    services: PropTypes.string,
    sex: PropTypes.string,
    ageGroup: PropTypes.string
  }).isRequired,
  onFormDataChange: PropTypes.func.isRequired
}