'use client'

import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Review({ onNextStep, onPrevStep, formData }) {
  const handleSubmit = () => {
    // TODO: Implement form submission logic
    onNextStep();
  };

  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{formData.personalDetails.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Contact</p>
          <p className="font-medium">{formData.personalDetails.contact}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Services</p>
          <p className="font-medium">{formData.personalDetails.services}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Sex</p>
          <p className="font-medium">{formData.personalDetails.sex}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Age</p>
          <p className="font-medium">{formData.personalDetails.age}</p>
        </div>
      </div>
    </div>
  );

  const renderCSMARTACheckmark = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Citizen's Charter</h3>
      <div className="space-y-4">
        {/* Main Selection */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Main Selection</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="font-medium">{formData.csmARTACheckmark.selectedOption}</p>
          </div>
        </div>

        {/* Additional Answers */}
        {Object.entries(formData.csmARTACheckmark.additionalAnswers || {}).map(([questionId, answer]) => (
          <div key={questionId} className="space-y-2">
            <p className="text-sm text-gray-500">Additional Question {questionId}</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="font-medium">{answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCSMARTARatings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Service Ratings</h3>
      <div className="space-y-2">
        {Object.entries(formData.csmARTARatings.ratings).map(([key, value]) => (
          <div key={key}>
            <p className="text-sm text-gray-500">Question {key.slice(-1)}</p>
            <p className="font-medium">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQMSCheckmark = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">QMS Checkmark</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-500">Selected Options</p>
        {Object.entries(formData.qmsCheckmark.selections || {}).map(([option, isSelected]) => (
          isSelected && (
            <div key={option} className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="font-medium">{option}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );

  const renderQMSRatings = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">QMS Ratings</h3>
      <div className="space-y-2">
        {Object.entries(formData.qmsRatings.ratings).map(([key, value]) => (
          <div key={key}>
            <p className="text-sm text-gray-500">Question {key.slice(-1)}</p>
            <p className="font-medium">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          {renderPersonalDetails()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          {renderCSMARTACheckmark()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          {renderCSMARTARatings()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          {renderQMSCheckmark()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
        >
          {renderQMSRatings()}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-20">
        <Button
          variant="outline"
          className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          onClick={onPrevStep}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
        <Button
          variant="gradient"
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md"
          onClick={handleSubmit}
        >
          Submit Feedback
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

Review.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    personalDetails: PropTypes.shape({
      email: PropTypes.string,
      contact: PropTypes.string,
      services: PropTypes.string,
      sex: PropTypes.string,
      age: PropTypes.string
    }),
    csmARTACheckmark: PropTypes.shape({
      selectedOption: PropTypes.string,
      additionalAnswers: PropTypes.object
    }),
    csmARTARatings: PropTypes.shape({
      ratings: PropTypes.object
    }),
    qmsCheckmark: PropTypes.shape({
      selections: PropTypes.objectOf(PropTypes.bool)
    }),
    qmsRatings: PropTypes.shape({
      ratings: PropTypes.object
    })
  }).isRequired
}; 