'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Building2, Users, ChevronRight, ChevronLeft, Filter, Check, User, Briefcase, Landmark, ArrowLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Breadcrumb = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <button
            onClick={() => onStepClick(step.id)}
            className={`hover:text-blue-500 transition-colors ${
              index + 1 <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
            }`}
          >
            {step.label}
          </button>
          {index < steps.length - 1 && (
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  )
}

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-blue-500 hover:bg-blue-600">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function ServiceSelectionModal({ isOpen, onClose, onServiceSelect, selectedService }) {
  const [step, setStep] = useState(1)
  const [clientType, setClientType] = useState(null)
  const [externalClientType, setExternalClientType] = useState(null)
  const [selectedOffice, setSelectedOffice] = useState(null)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [services, setServices] = useState([])
  const [offices, setOffices] = useState([])
  const [units, setUnits] = useState([])

  // Fetch services when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchServices()
    }
  }, [isOpen, clientType])

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      // Add clientType as a query parameter if set
      const url = clientType ? `/api/services?clientType=${clientType}` : '/api/services'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)
      
      // Extract unique offices and units
      const uniqueOffices = [...new Set(data.map(service => service.office_name))]
      const uniqueUnits = [...new Set(data.map(service => service.unit_name).filter(Boolean))]
      
      setOffices(uniqueOffices)
      setUnits(uniqueUnits)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get filtered services based on selected filters
  const getFilteredServices = () => {
    if (!clientType) return []
    
    return services.filter(service => {
      const name = service.service_name || ''
      const desc = service.description || ''
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesOffice = !selectedOffice || service.office_name === selectedOffice
      const matchesUnit = !selectedUnit || service.unit_name === selectedUnit

      return matchesSearch && matchesOffice && matchesUnit
    })
  }

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setClientType(null)
      setExternalClientType(null)
      setSelectedOffice(null)
      setSelectedUnit(null)
      setSearchQuery('')
      setIsLoading(false) // Reset loading state when modal closes
    }
  }, [isOpen])

  // Set initial client type and external type based on selected service
  useEffect(() => {
    if (selectedService?.name) {
      // Find the service in the data structure
      for (const type of ['internal', 'external']) {
        if (type === 'internal') {
          for (const office of SERVICES_DATA.internal.offices) {
            for (const unit of office.units) {
              const service = unit.services.find(s => s.name === selectedService.name);
              if (service) {
                setClientType('internal');
                setSelectedOffice(office);
                setSelectedUnit(unit);
                setStep(2);
                return;
              }
            }
          }
        } else {
          for (const category of Object.keys(SERVICES_DATA.external)) {
            for (const office of SERVICES_DATA.external[category].offices) {
              for (const unit of office.units) {
                const service = unit.services.find(s => s.name === selectedService.name);
                if (service) {
                  setClientType('external');
                  setExternalClientType(category);
                  setSelectedOffice(office);
                  setSelectedUnit(unit);
                  setStep(2);
                  return;
                }
              }
            }
          }
        }
      }
    }
  }, [selectedService]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        if (step > 1) {
          setShowConfirmation(true)
        } else {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, step, onClose])

  const handleClientTypeSelect = async (type) => {
    setIsLoading(true)
    console.log('Client Type Selected:', type)
    setClientType(type)
    await new Promise(resolve => setTimeout(resolve, 150))
    if (type === 'internal') {
      setStep(2)
    } else {
      setExternalClientType(null)
    }
    setIsLoading(false)
  }

  const handleExternalClientTypeSelect = async (type) => {
    setIsLoading(true)
    console.log('External Client Type Selected:', type)
    setExternalClientType(type)
    await new Promise(resolve => setTimeout(resolve, 150))
    setStep(2)
    setIsLoading(false)
  }

  const handleServiceSelect = async (service) => {
    setIsLoading(true)
    try {
      const serviceData = {
        service_id: service.service_id,
        service_name: service.service_name,
        office_name: service.office_name,
        unit_name: service.unit_name,
        service_type_id: service.service_type_id,
        service_type_name: service.service_type_name,
        clientType,
        externalClientType
      };
      
      console.log('Service Selected in Modal:', serviceData);
      await new Promise(resolve => setTimeout(resolve, 150));
      onServiceSelect(serviceData);  
      onClose();
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepClick = (stepId) => {
    if (stepId < step) {
      setStep(stepId)
    }
  }

  const getSteps = () => {
    return [
      { id: 1, label: 'Client Type' },
      { id: 2, label: 'Select Service' }
    ]
  }

  const handleClose = () => {
    if (step > 1) {
      setShowConfirmation(true)
    } else {
      onClose()
    }
  }

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      )
    }

    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Client Type Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <motion.button
                whileHover={{ scale: 1.001 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.1 }}
                className={`group p-6 sm:p-8 rounded-2xl border-2 transition-all bg-white hover:shadow-lg relative
                  ${clientType === 'internal' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-500'
                  }`}
                onClick={() => handleClientTypeSelect('internal')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center">
                  <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors mb-4">
                    <Building2 className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Internal Client</h3>
                  <p className="text-sm text-gray-500 text-center">DOST V Employee</p>
                  {clientType === 'internal' && (
                    <div className="mt-4 text-blue-500">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.001 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.1 }}
                className={`group p-6 sm:p-8 rounded-2xl border-2 transition-all bg-white hover:shadow-lg relative
                  ${clientType === 'external' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-500'
                  }`}
                onClick={() => handleClientTypeSelect('external')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center">
                  <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors mb-4">
                    <Users className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">External Client</h3>
                  <p className="text-sm text-gray-500 text-center">Public/Client</p>
                  {clientType === 'external' && (
                    <div className="mt-4 text-blue-500">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </motion.button>
            </div>

            {/* External Type Selection */}
            <AnimatePresence>
              {clientType === 'external' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 sm:pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-lg">Select External Client Type</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {[
                        { id: 'citizen', icon: User, title: 'Citizen', description: 'Individual member of the public' },
                        { id: 'business', icon: Briefcase, title: 'Business', description: 'Private company or organization' },
                        { id: 'government', icon: Landmark, title: 'Government', description: 'Government agency or institution' }
                      ].map(({ id, icon: Icon, title, description }) => (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.1 }}
                          className={`group p-6 sm:p-8 rounded-xl border-2 transition-all bg-white hover:shadow-lg relative overflow-hidden
                            ${externalClientType === id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-blue-500'
                            }`}
                          onClick={() => handleExternalClientTypeSelect(id)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex flex-col items-center">
                            <div className="p-3 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors mb-3">
                              <Icon className="h-8 w-8 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                            <p className="text-sm text-gray-500 text-center">{description}</p>
                            {externalClientType === id && (
                              <div className="mt-3 text-blue-500">
                                <ChevronRight className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8"
          >
            {/* Left Panel - Filters */}
            <div className="w-full lg:w-1/3 border-r-0 lg:border-r pr-0 lg:pr-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Filter className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg">Filters</h3>
              </div>
              
              {/* Offices */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Offices</h4>
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.1 }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2
                      ${!selectedOffice 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'}`}
                    onClick={() => {
                      setSelectedOffice(null)
                      setSelectedUnit(null)
                    }}
                  >
                    <Building2 className="h-4 w-4" />
                    All Offices
                  </motion.button>
                  {offices.map((office) => (
                    <motion.button
                      key={office}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.1 }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2
                        ${selectedOffice === office 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'hover:bg-gray-50 text-gray-700'}`}
                      onClick={() => {
                        setSelectedOffice(office)
                        setSelectedUnit(null)
                      }}
                    >
                      <Building2 className="h-4 w-4" />
                      {office}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Units */}
              {selectedOffice && (
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Units</h4>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.1 }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2
                        ${!selectedUnit 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'hover:bg-gray-50 text-gray-700'}`}
                      onClick={() => setSelectedUnit(null)}
                    >
                      <Users className="h-4 w-4" />
                      All Units
                    </motion.button>
                    {units.map((unit) => (
                      <motion.button
                        key={unit}
                        whileHover={{ x: 2 }}
                        transition={{ duration: 0.1 }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2
                          ${selectedUnit === unit 
                            ? 'bg-blue-50 text-blue-600 font-medium' 
                            : 'hover:bg-gray-50 text-gray-700'}`}
                        onClick={() => setSelectedUnit(unit)}
                      >
                        <Users className="h-4 w-4" />
                        {unit}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Services */}
            <div className="w-full lg:w-2/3">
              <div className="relative mb-4 sm:mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  className="pl-12 h-12 text-base rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                {getFilteredServices().map((service) => (
                  <motion.button
                    key={service.service_id}
                    whileHover={{ scale: 1.001, y: -1 }}
                    whileTap={{ scale: 0.995 }}
                    transition={{ duration: 0.1 }}
                    className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left group relative
                      ${selectedService?.service_id === service.service_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-500 hover:shadow-md'
                      }`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">{service.service_name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{service.office_name}</span>
                          </span>
                          {service.unit_name && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{service.unit_name}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{service.service_type_name}</span>
                          </span>
                        </div>
                      </div>
                      {selectedService?.service_id === service.service_id && (
                        <div className="p-2 rounded-full bg-blue-100 text-blue-500 flex-shrink-0">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[1000px] p-6 max-h-[90vh] flex flex-col">
          <DialogHeader className="mb-4">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {step === 1 && 'Select Client Type'}
                {step === 2 && 'Select Service'}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <Breadcrumb 
            steps={getSteps()} 
            currentStep={step} 
            onStepClick={handleStepClick}
          />
          
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>
          
          <div className="flex justify-between mt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-2 rounded-xl hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          setShowConfirmation(false)
          onClose()
        }}
        title="Close Selection?"
        message="Are you sure you want to close? Your selections will be lost."
      />
    </>
  )
} 