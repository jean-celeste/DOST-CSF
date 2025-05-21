"use client";

import React from 'react';
import { X, Check } from 'lucide-react';

export default function ResponseDetailsModal({ response, onClose, getQuestionText, renderRatingValue }) {
  if (!response) return null;

  const { answers } = response;
  const isCSM = response.form_type === 'csm';
  const ratings = isCSM ? answers.csmARTARatings?.ratings : answers.qmsRatings?.ratings;
  const comments = isCSM ? answers.csmARTARatings?.comments : answers.qmsRatings?.comments;
  const checkmarkSelections = isCSM ? answers.csmARTACheckmark : answers.qmsCheckmark?.selections;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Response Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {!answers ? <p className="text-gray-600 p-6">No answer details available.</p> : (
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
                    {response.form_type.toUpperCase()}
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
                      <span className="font-medium">{response.client_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{response.client_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{response.client_phone || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="font-medium">{response.service_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Office:</span>
                      <span className="font-medium">{response.office_name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit:</span>
                      <span className="font-medium">{response.unit_name || '-'}</span>
                    </div>
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
                              <p className="text-gray-600">{value}</p>
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
                            <span className="text-gray-700">{criteria}</span>
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
                        {renderRatingValue(rating)}
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
                    {comments || 'No comments provided'}
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
                            {answers.suggestion.generalComments || 'No general comments provided'}
                          </p>
                        </div>
                      </div>
                    )}
                    {answers.suggestion.reasonForLowScore && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Reason for Low Score</h4>
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {answers.suggestion.reasonForLowScore || 'No reason provided'}
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
      </div>
    </div>
  );
}
