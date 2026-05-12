"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formatDisplayValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export default function ResponseDetailsModal({ response, onClose, getQuestionText, renderRatingValue }) {
  if (!response) return null;

  const { answers } = response;
  // Extract form type from personalDetails, fallback to response.form_type for backward compatibility
  const formType = answers?.personalDetails?.clientType || response.form_type || 'N/A';
  const isCSM = formType === 'csm' || answers?.csmARTARatings?.ratings !== undefined;
  const ratings = isCSM ? answers.csmARTARatings?.ratings : answers.qmsRatings?.ratings;
  const comments = isCSM ? answers.csmARTARatings?.comments : answers.qmsRatings?.comments;
  const checkmarkSelections = isCSM ? answers.csmARTACheckmark : answers.qmsCheckmark?.selections;

  return (
    <Dialog open={Boolean(response)} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 p-0 shadow-xl">
        <DialogHeader className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
          <DialogTitle className="text-2xl font-semibold text-gray-900">Response Details</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5">
          {!answers ? <p className="p-6 text-gray-600">No answer details available.</p> : (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Response Details</h3>
                    <p className="text-sm text-gray-500">
                      Submitted on {new Date(response.submitted_at).toLocaleDateString()} at {new Date(response.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formType?.toUpperCase() || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Client and Service Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Client Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formatDisplayValue(response.client_name) || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formatDisplayValue(response.client_email) || formatDisplayValue(answers?.personalDetails?.email) || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formatDisplayValue(response.client_phone) || '-'}</span>
                    </div>
                  </div>
                </div>

<div className="bg-white p-4 rounded-lg border border-gray-200">
                   <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <span className="text-gray-600">Service:</span>
                       <span className="font-medium">{formatDisplayValue(response.service_name) || formatDisplayValue(answers?.personalDetails?.service_name) || 'Not provided'}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Office:</span>
                       <span className="font-medium">{formatDisplayValue(response.office_name) || formatDisplayValue(answers?.personalDetails?.office_name) || '-'}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600">Unit:</span>
                       <span className="font-medium">{formatDisplayValue(response.unit_name) || formatDisplayValue(answers?.personalDetails?.unit_name) || '-'}</span>
                     </div>
                     {response.is_process_owner !== undefined && (
                       <div className="flex justify-between">
                         <span className="text-gray-600">Process Owner:</span>
                         <span className={`font-medium ${response.is_process_owner ? 'text-green-600' : 'text-gray-500'}`}>
                           {response.is_process_owner ? 'Yes' : 'No'}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
              </div>

              {/* Checkmark Selections */}
              {checkmarkSelections && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {isCSM ? 'Client Feedback' : 'Selected Criteria'}
                  </h3>
                  <div className="space-y-4">
                    {isCSM ? (
                      // CSM ARTA Checkmark Format
                      Object.entries(checkmarkSelections).map(([key, value]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-start">
                            <div className="bg-blue-100 text-blue-800 rounded-full p-1 mr-3 mt-1">
                              <Check size={16} />
                            </div>
                            <div>
                              <p className="text-gray-700 font-medium mb-1">
                                {getQuestionText(response.form_id, key)}
                              </p>
                              <p className="text-gray-600">{formatDisplayValue(value) || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // QMS Checkmark Format
                      Object.entries(checkmarkSelections).map(([criteria, isSelected]) => (
                        isSelected && (
                          <div key={criteria} className="flex items-center p-3 bg-gray-50 rounded">
                            <div className="bg-green-100 text-green-800 rounded-full p-1 mr-3">
                              <Check size={16} />
                            </div>
                            <span className="text-gray-700">{formatDisplayValue(getQuestionText(response.form_id, criteria)) || 'N/A'}</span>
                          </div>
                        )
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Ratings Section */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ratings</h3>
                <div className="space-y-3">
                  {ratings && Object.entries(ratings).map(([questionId, rating]) => (
                    <div key={questionId} className="flex justify-between items-center p-2 bg-gray-50 rounded gap-4">
                      <span className="text-gray-700 flex-1">{getQuestionText(response.form_id, questionId)}</span>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap min-w-[140px] text-center ${
                        rating === 'strongly-agree' || rating === 'outstanding' ? 'bg-green-100 text-green-800' :
                        rating === 'agree' || rating === 'very-satisfactory' ? 'bg-blue-100 text-blue-800' :
                        rating === 'neutral' || rating === 'satisfactory' ? 'bg-yellow-100 text-yellow-800' :
                        rating === 'disagree' || rating === 'unsatisfactory' ? 'bg-orange-100 text-orange-800' :
                        rating === 'strongly-disagree' || rating === 'poor' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formatDisplayValue(renderRatingValue(rating)) || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Comments</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {formatDisplayValue(comments) || 'No comments provided'}
                  </p>
                </div>
              </div>

              {/* Suggestions Section */}
              {answers.suggestion && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Suggestions</h3>
                  <div className="space-y-4">
                    {answers.suggestion.generalComments && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">General Comments</h4>
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {formatDisplayValue(answers.suggestion.generalComments) || 'No general comments provided'}
                          </p>
                        </div>
                      </div>
                    )}
                    {answers.suggestion.reasonForLowScore && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Reason for Low Score</h4>
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {formatDisplayValue(answers.suggestion.reasonForLowScore) || 'No reason provided'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
