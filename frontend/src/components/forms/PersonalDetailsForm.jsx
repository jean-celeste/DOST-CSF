import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Check } from 'lucide-react'

export default function PersonalDetailsForm({ onNextStep }) {
  const [email, setEmail] = useState('')
  const [contact, setContact] = useState('')
  // const [customerType, setCustomerType] = useState('')
  const [services, setServices] = useState('')
  // const [region, setRegion] = useState('')
  const [sex, setSex] = useState('male')
  const [ageGroup, setAgeGroup] = useState('18-38')

  return (
    <div className="space-y-6">
      {/* Email Address */}
      <div className="relative">
        <Label htmlFor="email">Email Address (optional)</Label>
        <Input
          id="email"
          placeholder="Email"
          className="mt-1 rounded-none w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {email && <Check className="absolute right-2 top-8 h-5 w-5 text-blue-500" />}
      </div>

      {/* Contact Number */}
      <div className="relative">
        <Label htmlFor="contact">Contact Number</Label>
        <Input
          id="contact"
          placeholder="09123456789"
          className="mt-1 rounded-none w-full"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        {contact && <Check className="absolute right-2 top-8 h-5 w-5 text-blue-500" />}
      </div>

      {/* Sex */}
      <div>
        <Label>Sex</Label>
        <RadioGroup value={sex} onValueChange={setSex} className="mt-2 flex space-x-6">
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
        <RadioGroup value={ageGroup} onValueChange={setAgeGroup} className="mt-2 space-y-2">
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
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="60-above" id="60-above" />
            <Label htmlFor="60-above">60 years old and above</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Services Availed */}
      <div>
        <Label htmlFor="services">Services Availed</Label>
        <Select value={services} onValueChange={setServices}>
          <SelectTrigger id="services" className="mt-1 rounded-none w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service1">Service 1</SelectItem>
            <SelectItem value="service2">Service 2</SelectItem>
            <SelectItem value="service3">Service 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 text-right">
        <Button type="button" variant="gradient" onClick={onNextStep} className="rounded-none">Next</Button>
      </div>
    </div>
  )
}

// Props validation
PersonalDetailsForm.propTypes = {
  onNextStep: PropTypes.func.isRequired
}