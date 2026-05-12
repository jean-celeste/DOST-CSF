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
  ErrorMessage,
  DynamicSectionRenderer
} from './FormReviewSections';

export default function Review({
  onNextStep,
  onPrevStep,
  formData,
  onEditSection,
  onNewForm,
  formId,
  formType,
  language,
  // New props for dynamic form support
  dynamicQuestions,
  dynamicAnswers,
  onDynamicEdit
}) {
  const [editingSection, setEditingSection] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Extract serviceId from personalDetails for the submission
      const submissionData = {
        ...formData,
        serviceId: formData.personalDetails?.service_id
      };
      await submitForm(submissionData);
      setShowThankYou(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (section) => {
    const clientType = formData?.personalDetails?.clientType;
    const isInternal = clientType === 'internal';
    const isExternal = ['citizen', 'business', 'government'].includes(clientType);

    // Always allow editing personal details and suggestion
    if (section === 'personal' || section === 'suggestion') {
      onEditSection && onEditSection(section);
      return;
    }

    // Internal: all sections are editable
    if (isInternal) {
      onEditSection && onEditSection(section);
      return;
    }

    // External: only CSM sections editable
    if (isExternal) {
      if (section === 'csmarta' || section === 'csmarta-ratings') {
        onEditSection && onEditSection(section);
      }
      return;
    }
  };

  const handleDynamicQuestionEdit = (questionId) => {
    setEditingQuestionId(questionId);
    if (onDynamicEdit) {
      onDynamicEdit(questionId);
    }
  };

  const handleCancelEdit = () => {
    setEditingSection(null);
    setEditingQuestionId(null);
  };

  const handleSaveEdit = (section) => {
    setEditingSection(null);
    setEditingQuestionId(null);
  };

  // Check if we're in dynamic mode
  const isDynamic = dynamicQuestions && dynamicQuestions.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-8">
        {/* Personal Details (always present) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          {formData && (
            <PersonalDetailsSection
              formData={formData}
              onEdit={handleEdit}
              editingSection={editingSection}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
            />
          )}
        </motion.div>

        {/* Dynamic sections or legacy sections */}
        {isDynamic ? (
          // Dynamic form review
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
          >
            <DynamicSectionRenderer
              questions={dynamicQuestions}
              answers={dynamicAnswers || {}}
              onEdit={handleDynamicQuestionEdit}
              editingQuestionId={editingQuestionId}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
            />
          </motion.div>
        ) : formData ? (
          // Legacy form review (for backward compatibility)
          (() => {
            const clientType = formData.personalDetails?.clientType;
            const isInternal = clientType === 'internal';
            const isExternal = ['citizen', 'business', 'government'].includes(clientType);

            return (
              <>
                {(() => {
                  if (isInternal) {
                    return (
                      <>
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
                      </>
                    );
                  } else if (isExternal) {
                    return (
                      <>
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
                      </>
                    );
                  }
                  return null;
                })()}
              </>
            );
          })()
        ) : null}

        {/* Suggestions (always present) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
        >
          <SuggestionSection
            formData={formData || { suggestion: {}}}
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
  }),
  onEditSection: PropTypes.func,
  onNewForm: PropTypes.func.isRequired,
  formId: PropTypes.number,
  formType: PropTypes.string,
  language: PropTypes.string,
  // Dynamic form props
  dynamicQuestions: PropTypes.arrayOf(PropTypes.shape({
    question_id: PropTypes.number.isRequired,
    question_text: PropTypes.string.isRequired,
    question_type: PropTypes.string
  })),
  dynamicAnswers: PropTypes.object,
  onDynamicEdit: PropTypes.func
};

Review.defaultProps = {
  dynamicQuestions: null,
  dynamicAnswers: null,
  onDynamicEdit: null
};