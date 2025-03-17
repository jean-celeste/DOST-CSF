import PropTypes from 'prop-types'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

export default function PersonalDetailsForm({ onNextStep }) {
  return (
    <div className="space-y-6">
      {/* Email Address */}
      <div>
        <Label htmlFor="email">Email Address (optional)</Label>
        <Input id="email" placeholder="Email" className="mt-1 rounded-none w-full" />
      </div>

      {/* Customer Type */}
      <div>
        <Label htmlFor="customer-type">Customer Type</Label>
        <Select>
          <SelectTrigger id="customer-type" className="mt-1 rounded-none w-full">
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

      {/* Contact Number */}
      <div>
        <Label htmlFor="contact">Contact Number</Label>
        <Input id="contact" placeholder="+639 -XXXX-XXXX" className="mt-1 rounded-none w-full" />
      </div>

      {/* Region/Province */}
      <div>
        <Label htmlFor="region">Region/Province</Label>
        <Select>
          <SelectTrigger id="region" className="mt-1 rounded-none w-full">
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
        <Button type="button" variant="gradient" onClick={onNextStep} className="rounded-none">Next</Button>
      </div>
    </div>
  )
}

// Props validation
PersonalDetailsForm.propTypes = {
  onNextStep: PropTypes.func.isRequired
}