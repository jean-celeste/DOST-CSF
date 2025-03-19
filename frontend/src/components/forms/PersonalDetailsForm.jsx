import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Check } from 'lucide-react'

export default function PersonalDetailsForm({ onNextStep, onPrevStep }) {
  const [email, setEmail] = useState('')
  const [contact, setContact] = useState('')
  const [services, setServices] = useState('')
  const [sex, setSex] = useState('male')
  const [ageGroup, setAgeGroup] = useState('18-38')

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />}
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
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
          {contact && <Check className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />}
        </div>
      </div>

      {/* Sex */}
      <div>
        <Label>Sex</Label>
        <div className="mt-2 flex w-1/2 space-x-2">
          <Button
            type="button"
            variant={sex === 'male' ? 'gradient' : 'outline'}
            onClick={() => setSex('male')}
            className="rounded-lg flex-1"
          >
            Male
          </Button>
          <Button
            type="button"
            variant={sex === 'female' ? 'gradient' : 'outline'}
            onClick={() => setSex('female')}
            className="rounded-lg flex-1"
          >
            Female
          </Button>
          <Button
            type="button"
            variant={sex === 'prefer-not' ? 'gradient' : 'outline'}
            onClick={() => setSex('prefer-not')}
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
            variant={ageGroup === 'below-18' ? 'gradient' : 'outline'}
            onClick={() => setAgeGroup('below-18')}
            className="rounded-lg"
          >
            Below 18 years old
          </Button>
          <Button
            type="button"
            variant={ageGroup === '18-38' ? 'gradient' : 'outline'}
            onClick={() => setAgeGroup('18-38')}
            className="rounded-lg"
          >
            18-38 years old
          </Button>
          <Button
            type="button"
            variant={ageGroup === '39-59' ? 'gradient' : 'outline'}
            onClick={() => setAgeGroup('39-59')}
            className="rounded-lg"
          >
            39-59 years old
          </Button>
          <Button
            type="button"
            variant={ageGroup === '60-above' ? 'gradient' : 'outline'}
            onClick={() => setAgeGroup('60-above')}
            className="rounded-lg"
          >
            60 years old and above
          </Button>
        </div>
      </div>

      {/* Services Availed */}
      <div>
        <Label htmlFor="services">Services Availed</Label>
        <Select value={services} onValueChange={setServices}>
          <SelectTrigger id="services" className="mt-1 rounded-lg w-1/2 h-12 px-2">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service1">Service 1</SelectItem>
            <SelectItem value="service2">Service 2</SelectItem>
            <SelectItem value="service3">Service 3</SelectItem>
          </SelectContent>
        </Select>
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
  onPrevStep: PropTypes.func.isRequired
}