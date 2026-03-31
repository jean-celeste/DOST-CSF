'use client'

import PropTypes from 'prop-types';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ThankYouModal from './ThankYouModal';
import { submitForm } from '@/lib/services/formSubmission';
import {
  PersonalDetailsSection,
  CSMARTACheckmarkSection,
  CSMARTARatingsSection,
  QMSCheckmarkSection,
  QMSRatingsSection,
  SuggestionSection,
  NavigationButtons,
  ErrorMessage
} from './FormReviewSections';

export default function Review({ 
  onNextStep, 
  onPrevStep, 
  formData, 
  onEditSection, 
  onNewForm,
  formId,
  formType,
  language
}) {
  const [editingSection, setEditingSection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await submitForm(formData);
      setShowThankYou(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (section) => {
    const clientType = formData.personalDetails.clientType;
    const isInternal = clientType === 'internal';
    const isExternal = ['citizen', 'business', 'government'].includes(clientType);

    // Always allow editing personal details and suggestion
    if (section === 'personal' || section === 'suggestion') {
      onEditSection(section);
      return;
    }

    // Internal: only QMS sections editable
    if (isInternal) {
      if (section === 'qms-ratings' || section === 'qms-checkmark') {
        onEditSection(section);
      }
      return;
    }

    // External: only CSM sections editable
    if (isExternal) {
      if (section === 'csmarta' || section === 'csmarta-ratings') {
        onEditSection(section);
      }
      return;
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
  };

  const handleSaveEdit = (section) => {
    // TODO: Implement save logic
    setEditingSection(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          <PersonalDetailsSection 
            formData={formData}
            onEdit={handleEdit}
            editingSection={editingSection}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
          />
        </motion.div>

        {/* Render only the relevant sections based on clientType and service_type_id */}
        {(() => {
          const clientType = formData.personalDetails.clientType;
          const isInternal = clientType === 'internal';
          const isExternal = ['citizen', 'business', 'government'].includes(clientType);

          if (isInternal) {
            // QMS only
            return <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <QMSRatingsSection 
                  formData={formData}
                  onEdit={handleEdit}
                  editingSection={editingSection}
                  onCancelEdit={handleCancelEdit}
                  onSaveEdit={handleSaveEdit}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <QMSCheckmarkSection 
                  formData={formData}
                  onEdit={handleEdit}
                  editingSection={editingSection}
                  onCancelEdit={handleCancelEdit}
                  onSaveEdit={handleSaveEdit}
                />
              </motion.div>
            </>;
          } else if (isExternal) {
            // CSM only
            return <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <CSMARTACheckmarkSection 
                  formData={formData}
                  onEdit={handleEdit}
                  editingSection={editingSection}
                  onCancelEdit={handleCancelEdit}
                  onSaveEdit={handleSaveEdit}
                  language={language}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <CSMARTARatingsSection 
                  formData={formData}
                  onEdit={handleEdit}
                  editingSection={editingSection}
                  onCancelEdit={handleCancelEdit}
                  onSaveEdit={handleSaveEdit}
                  language={language}
                />
              </motion.div>
            </>;
          }
          return null;
        })()}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          <SuggestionSection 
            formData={formData}
            onEdit={handleEdit}
            editingSection={editingSection}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
          />
        </motion.div>
      </div>

      <NavigationButtons 
        onPrevStep={onPrevStep}
        onNextStep={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ErrorMessage error={error} />

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
      clientType: PropTypes.string,
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
  formType: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired
}; 