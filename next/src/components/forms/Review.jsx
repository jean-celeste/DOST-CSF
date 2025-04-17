'use client'

import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Star, Pencil, X, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';
import ThankYouModal from './ThankYouModal';

//Animated emojis
const heartEyesFace = "/assets/emojis/smiling_face_with_heart-eyes_animated.png";
const smilingFace = "/assets/emojis/smiling_face_with_smiling_eyes_animated.png";
const neutralFace = "/assets/emojis/face_without_mouth_animated.png";
const happyFace = "/assets/emojis/slightly_smiling_face_animated.png";
const frowningFace = "/assets/emojis/frowning_face_animated.png";
const poutingFace = "/assets/emojis/pouting_face_animated.png";

export default function Review({ 
  onNextStep, 
  onPrevStep, 
  formData, 
  onEditSection, 
  onNewForm,
  formId,
  formType 
}) {
  const [editingSection, setEditingSection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Determine which form to submit based on service type
      if (formData.personalDetails.service_type_id === 1) {
        // Submit CSM ARTA form for on-site services
        const response = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId: 1, // CSM ARTA form ID
            serviceId: formData.personalDetails.service_id,
            personalDetails: formData.personalDetails,
            csmARTACheckmark: formData.csmARTACheckmark,
            csmARTARatings: formData.csmARTARatings,
            suggestion: formData.suggestion
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit CSM ARTA form');
        }
        console.log('CSM ARTA form submitted successfully:', result);
      } else if (formData.personalDetails.service_type_id === 2) {
        // Submit QMS form for off-site services
        const response = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId: 3, // QMS form ID
            serviceId: formData.personalDetails.service_id,
            personalDetails: formData.personalDetails,
            qmsCheckmark: formData.qmsCheckmark,
            qmsRatings: formData.qmsRatings,
            suggestion: formData.suggestion
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to submit QMS form');
        }
        console.log('QMS form submitted successfully:', result);
      } else {
        throw new Error('Invalid service type');
      }

      setShowThankYou(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (section) => {
    // Prevent editing QMS sections for on-site services
    if (formData.personalDetails.service_type_id === 1 && 
        (section === 'qms-ratings' || section === 'qms-checkmark')) {
      return;
    }
    
    // Prevent editing CSM ARTA sections for off-site services
    if (formData.personalDetails.service_type_id === 2 && 
        (section === 'csmarta' || section === 'csmarta-ratings')) {
      return;
    }

    if (section === 'personal') {
      // Navigate back to PersonalDetailsForm
      onEditSection('personal');
    } else if (section === 'csmarta') {
      // Navigate back to CSMARTACheckmark
      onEditSection('csmarta');
    } else if (section === 'csmarta-ratings') {
      // Navigate back to CSMARTARatings
      onEditSection('csmarta-ratings');
    } else if (section === 'qms-ratings') {
      // Navigate back to QMSRatings
      onEditSection('qms-ratings');
    } else if (section === 'qms-checkmark') {
      // Navigate back to QMSCheckmark
      onEditSection('qms-checkmark');
    } else {
      setEditingSection(section);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSaveEdit = (section) => {
    // TODO: Implement save logic
    setEditingSection(null);
  };

  const getEmojiImage = (rating, type) => {
    if (type === 'qms') {
      switch (rating) {
        case 'outstanding': return heartEyesFace;
        case 'very-satisfactory': return smilingFace;
        case 'satisfactory': return happyFace;
        case 'fair': return neutralFace;
        case 'unsatisfactory': return poutingFace;
        default: return null;
      }
    } else {
      switch (rating) {
        case 'strongly-agree': return heartEyesFace;
        case 'agree': return smilingFace;
        case 'disagree': return frowningFace;
        case 'neutral': return neutralFace;
        case 'strongly-disagree': return poutingFace;
        case 'na': return null;
        default: return null;
      }
    }
  };

  const renderEmoji = (rating, type) => {
    const emojiImage = getEmojiImage(rating, type);
    if (emojiImage) {
      return (
        <div className="relative w-12 h-12">
          <Image
            src={emojiImage}
            alt={rating}
            fill
            className="object-contain"
            sizes="48px"
          />
        </div>
      );
    }
    return <span className="text-4xl">❌</span>;
  };

  const renderSectionHeader = (title, icon, section) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {icon}
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      {section === 'personal' || section === 'csmarta' || section === 'qms-checkmark' ? (
        <Button
          variant="outline"
          size="sm"
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => handleEdit(section)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      ) : editingSection === section ? (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleCancelEdit}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
            onClick={() => handleSaveEdit(section)}
          >
            Save Changes
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => handleEdit(section)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-4">
      {renderSectionHeader('Personal Details', <CheckCircle2 className="h-5 w-5 text-blue-500" />, 'personal')}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formData.personalDetails.name && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
            <p className="text-base text-gray-900">{formData.personalDetails.name}</p>
          </div>
        )}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
          <p className="text-base text-gray-900 break-words">{formData.personalDetails.email}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Contact</p>
          <p className="text-base text-gray-900">{formData.personalDetails.contact}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
          <p className="text-sm font-medium text-gray-500 mb-1">Customer Type</p>
          <p className="text-base text-gray-900">
            {formData.personalDetails.customerType === 'internal' ? 'Internal Customer' : 
             formData.personalDetails.customerType === 'external' ? 
             `External Customer (${formData.personalDetails.externalType === 'citizen' ? 'Citizen' :
              formData.personalDetails.externalType === 'business' ? 'Business' :
              formData.personalDetails.externalType === 'government' ? 'Government' : 'External'})` : 
             'External Customer'}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
          <p className="text-sm font-medium text-gray-500 mb-1">Service</p>
          <div className="space-y-2">
            <p className="text-base text-gray-900 font-medium">{formData.personalDetails.service_name}</p>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-gray-600">
                {formData.personalDetails.office_name}
                {formData.personalDetails.unit_name && ` - ${formData.personalDetails.unit_name}`}
              </p>
              <p className="text-sm text-gray-600">{formData.personalDetails.service_type_name}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Sex</p>
          <p className="text-base text-gray-900">{formData.personalDetails.sex}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-1">Age</p>
          <p className="text-base text-gray-900">{formData.personalDetails.age}</p>
        </div>
      </div>
    </div>
  );

  const renderCSMARTACheckmark = () => (
    <div className="space-y-4">
      {renderSectionHeader('Citizen\'s Charter', <CheckCircle2 className="h-5 w-5 text-blue-500" />, 'csmarta')}
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-2">Main Selection</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-base text-gray-900">{formData.csmARTACheckmark.selectedOption}</p>
          </div>
        </div>

        {Object.entries(formData.csmARTACheckmark.additionalAnswers || {}).map(([questionId, answer]) => (
          <div key={questionId} className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-2">Additional Question {questionId}</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-base text-gray-900">{answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCSMARTARatings = () => (
    <div className="space-y-4">
      {renderSectionHeader('Service Ratings', <Star className="h-5 w-5 text-yellow-400" />, 'csmarta-ratings')}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formData.csmARTARatings.ratings).map(([key, value], index) => (
          <div key={key} className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-2">SQD {index}</p>
            <div className="flex items-center space-x-2">
              {renderEmoji(value, 'csm')}
              <p className="text-base text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderQMSCheckmark = () => (
    <div className="space-y-4">
      {renderSectionHeader('QMS Checkmark', <CheckCircle2 className="h-5 w-5 text-blue-500" />, 'qms-checkmark')}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formData.qmsCheckmark.selections || {}).map(([option, isSelected]) => (
          isSelected && (
            <div key={option} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-base text-gray-900">{option}</p>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );

  const renderQMSRatings = () => (
    <div className="space-y-4">
      {renderSectionHeader('QMS Ratings', <Star className="h-5 w-5 text-yellow-400" />, 'qms-ratings')}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(formData.qmsRatings.ratings).map(([key, value]) => (
          <div key={key} className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-500 mb-2">Question {key.slice(-1)}</p>
            <div className="flex items-center space-x-2">
              {renderEmoji(value, 'qms')}
              <p className="text-base text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSuggestion = () => (
    <div className="space-y-4">
      {renderSectionHeader('Your Feedback and Suggestions', <MessageSquare className="h-5 w-5 text-blue-500" />, 'suggestion')}
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-2">Reason for Scores (3, 2, 1)</p>
          <p className="text-base text-gray-900 whitespace-pre-wrap">{formData.suggestion?.reasonForLowScore || 'No reason provided'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-500 mb-2">General Comments/Suggestions</p>
          <p className="text-base text-gray-900 whitespace-pre-wrap">{formData.suggestion?.generalComments || 'No comments provided'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          {renderPersonalDetails()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          {renderCSMARTACheckmark()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          {renderCSMARTARatings()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          {renderQMSRatings()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          {renderQMSCheckmark()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          {renderSuggestion()}
        </motion.div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-12">
        <Button
          variant="outline"
          className="px-8 py-3 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          onClick={onPrevStep}
        >
          <ChevronLeft className="mr-2 h-5 w-5" />
          Go Back
        </Button>
        <Button
          variant="gradient"
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Feedback'
          )}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <ThankYouModal 
        isOpen={showThankYou} 
        onClose={() => {
          setShowThankYou(false);
          onNextStep();
        }}
        onNewForm={() => {
          setShowThankYou(false);
          onNewForm();
        }}
      />
    </div>
  );
}

Review.propTypes = {
  onNextStep: PropTypes.func.isRequired,
  onPrevStep: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    personalDetails: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      contact: PropTypes.string,
      service_id: PropTypes.number,
      service_name: PropTypes.string,
      office_name: PropTypes.string,
      unit_name: PropTypes.string,
      service_type_id: PropTypes.number,
      service_type_name: PropTypes.string,
      customerType: PropTypes.string,
      externalType: PropTypes.string,
      sex: PropTypes.string,
      age: PropTypes.string
    }),
    csmARTACheckmark: PropTypes.object,
    csmARTARatings: PropTypes.object,
    qmsCheckmark: PropTypes.object,
    qmsRatings: PropTypes.object,
    suggestion: PropTypes.object
  }).isRequired,
  onEditSection: PropTypes.func.isRequired,
  onNewForm: PropTypes.func.isRequired,
  formId: PropTypes.number.isRequired,
  formType: PropTypes.string.isRequired
}; 