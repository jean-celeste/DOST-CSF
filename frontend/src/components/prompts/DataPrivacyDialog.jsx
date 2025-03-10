import PropTypes from 'prop-types'
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

export default function DataPrivacyDialog({ 
  open, 
  onOpenChange, 
  privacyConsent, 
  setPrivacyConsent, 
  onConsent, 
  onDecline 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-3 pt-4">
          <DialogTitle className="text-2xl font-bold text-blue-600">Data Privacy Consent</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm py-2">
          <p className="leading-relaxed">
            This Client Satisfaction Measurement (CSM) tracks the customer experience of government offices. Your feedback on your recently concluded transaction will help this office provide a better service.
          </p>
          <p className="leading-relaxed">
            Personal information shared will be kept confidential and you always
            have the option to not answer this form.
          </p>
          <p className="leading-relaxed">
            By filling out this form, you authorize the Department of Science and Technology - V to collect and process the data provided for products and services improvement.
          </p>
          <p className="leading-relaxed">
            All personal information is protected under Republic Act No. 10173, the Data Privacy Act of 2012.
          </p>

          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 mt-6">
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
        
        <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:space-x-2 pt-4 mt-2">
          <Button type="button" variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button 
            type="button" 
            variant="gradient" 
            onClick={onConsent} 
            disabled={!privacyConsent} 
            className="font-bold"
          >
            Accept and Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

DataPrivacyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  privacyConsent: PropTypes.bool.isRequired,
  setPrivacyConsent: PropTypes.func.isRequired,
  onConsent: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired
}