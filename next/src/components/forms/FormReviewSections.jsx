'use client'

import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Star, Pencil, X, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

//Animated emojis
const heartEyesFace = "/assets/emojis/smiling_face_with_heart-eyes_animated.png";
const smilingFace = "/assets/emojis/smiling_face_with_smiling_eyes_animated.png";
const neutralFace = "/assets/emojis/face_without_mouth_animated.png";
const happyFace = "/assets/emojis/slightly_smiling_face_animated.png";
const frowningFace = "/assets/emojis/frowning_face_animated.png";
const poutingFace = "/assets/emojis/pouting_face_animated.png";

export const getEmojiImage = (rating, type) => {
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

export const renderEmoji = (rating, type) => {
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

export const renderSectionHeader = (title, icon, section, onEdit, editingSection, onCancelEdit, onSaveEdit) => (
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
        onClick={() => onEdit(section)}
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
          onClick={onCancelEdit}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          className="bg-blue-500 hover:bg-blue-600"
          onClick={() => onSaveEdit(section)}
        >
          Save Changes
        </Button>
      </div>
    ) : (
      <Button
        variant="outline"
        size="sm"
        className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
        onClick={() => onEdit(section)}
      >
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>
    )}
  </div>
);

export const PersonalDetailsSection = ({ formData, onEdit, editingSection, onCancelEdit, onSaveEdit }) => (
  <div className="space-y-4">
    {renderSectionHeader('Personal Details', <CheckCircle2 className="h-5 w-5 text-blue-500" />, 'personal', onEdit, editingSection, onCancelEdit, onSaveEdit)}
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
        <p className="text-sm font-medium text-gray-500 mb-1">Client Type</p>
        <p className="text-base text-gray-900">
          {formData.personalDetails.clientType === 'internal' ? 'Internal Client' :
            formData.personalDetails.clientType === 'citizen' ? 'Citizen' :
            formData.personalDetails.clientType === 'business' ? 'Business' :
            formData.personalDetails.clientType === 'government' ? 'Government' : 'External Client'}
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

export const CSMARTACheckmarkSection = ({ formData, onEdit, editingSection, onCancelEdit, onSaveEdit }) => (
  <div className="space-y-4">
    {renderSectionHeader('Citizen\'s Charter', <CheckCircle2 className="h-5 w-5 text-blue-500" />, 'csmarta', onEdit, editingSection, onCancelEdit, onSaveEdit)}
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

export const CSMARTARatingsSection = ({ formData, onEdit, editingSection, onCancelEdit, onSaveEdit }) => (
  <div className="space-y-4">
    {renderSectionHeader('Service Ratings', <Star className="h-5 w-5 text-yellow-400" />, 'csmarta-ratings', onEdit, editingSection, onCancelEdit, onSaveEdit)}
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

export const QMSCheckmarkSection = ({ formData, onEdit, editingSection, onCancelEdit, onSaveEdit }) => (
  <div className="space-y-4">
    {renderSectionHeader('QMS Checkmark', <CheckCircle2 className="h-5 w-5 text-blue-500" />, 'qms-checkmark', onEdit, editingSection, onCancelEdit, onSaveEdit)}
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

export const QMSRatingsSection = ({ formData, onEdit, editingSection, onCancelEdit, onSaveEdit }) => (
  <div className="space-y-4">
    {renderSectionHeader('QMS Ratings', <Star className="h-5 w-5 text-yellow-400" />, 'qms-ratings', onEdit, editingSection, onCancelEdit, onSaveEdit)}
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

export const SuggestionSection = ({ formData, onEdit, editingSection, onCancelEdit, onSaveEdit }) => (
  <div className="space-y-4">
    {renderSectionHeader('Your Feedback and Suggestions', <MessageSquare className="h-5 w-5 text-blue-500" />, 'suggestion', onEdit, editingSection, onCancelEdit, onSaveEdit)}
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

export const NavigationButtons = ({ onPrevStep, onNextStep, isSubmitting }) => (
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
      onClick={onNextStep}
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
);

export const ErrorMessage = ({ error }) => (
  error && (
    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
      {error}
    </div>
  )
);

PersonalDetailsSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  editingSection: PropTypes.string,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired
};

CSMARTACheckmarkSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  editingSection: PropTypes.string,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired
};

CSMARTARatingsSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  editingSection: PropTypes.string,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired
};

QMSCheckmarkSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  editingSection: PropTypes.string,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired
};

QMSRatingsSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  editingSection: PropTypes.string,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired
};

SuggestionSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  editingSection: PropTypes.string,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired
};

NavigationButtons.propTypes = {
  onPrevStep: PropTypes.func.isRequired,
  onNextStep: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};

ErrorMessage.propTypes = {
  error: PropTypes.string
}; 