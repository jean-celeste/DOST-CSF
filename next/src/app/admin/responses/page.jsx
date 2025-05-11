"use client"

import { useState, useEffect } from 'react';
import { Search, Filter, Download, X, Check } from 'lucide-react';

// Constants
const FormType = {
  CSM: 'csm',
  QMS: 'qms'
};

// const calculateAverageRating = (answers) => {
//   if (!answers) return 0;
  
//   // For CSM forms
//   if (answers.csmARTARatings?.ratings) {
//     const ratings = Object.values(answers.csmARTARatings.ratings);
//     const ratingValues = {
//       'strongly-agree': 5,
//       'agree': 4,
//       'neutral': 3,
//       'disagree': 2,
//       'strongly-disagree': 1
//     };
//     const sum = ratings.reduce((acc, rating) => acc + (ratingValues[rating] || 0), 0);
//     return sum / ratings.length;
//   }
  
//   // For QMS forms
//   if (answers.qmsRatings?.ratings) {
//     const ratings = Object.values(answers.qmsRatings.ratings);
//     const ratingValues = {
//       'outstanding': 5,
//       'very-satisfactory': 4,
//       'satisfactory': 3,
//       'unsatisfactory': 2,
//       'poor': 1
//     };
//     const sum = ratings.reduce((acc, rating) => acc + (ratingValues[rating] || 0), 0);
//     return sum / ratings.length;
//   }
  
//   return 0;
// };

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [questions, setQuestions] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchQuestions = async (formId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/questions?formId=${formId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      const { success, data, error: apiError } = await response.json();
      
      if (!success) throw new Error(apiError);
      return data;
    } catch (err) {
      console.error('Error fetching questions:', err);
      return {};
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/responses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const { success, data, error: apiError } = await response.json();
      
      if (!success) throw new Error(apiError);
      setResponses(data);

      // Fetch questions for each unique form type
      const formIds = [...new Set(data.map(r => r.form_id))];
      const questionsData = {};
      for (const formId of formIds) {
        questionsData[formId] = await fetchQuestions(formId);
      }
      setQuestions(questionsData);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getQuestionText = (formId, questionId) => {
    const formQuestions = questions[formId] || {};
    return formQuestions[questionId] || questionId;
  };

  const filteredResponses = responses.filter(response => {
    if (!response || typeof response !== 'object') return false;

    const name = response.client_name || '';
    const serviceName = response.service_name || '';
    const email = response.client_email || '';
    const formType = response.form_type || '';
    const submittedAt = response.submitted_at || '';

    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesForm = selectedForm === 'all' || formType === selectedForm;

    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(submittedAt).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(submittedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesForm && matchesDate;
  });

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Form Type', 'Service', 'Client', 'Email', 'Average Rating', 'Comments'],
      ...filteredResponses.map(response => {
        if (!response || typeof response !== 'object') return [];
        
        const avgRating = calculateAverageRating(response.answers);
        const comments = response.answers?.csmARTARatings?.comments || 
                        response.answers?.qmsRatings?.comments || '';
        
        return [
          new Date(response.submitted_at || '').toLocaleDateString(),
          (response.form_type || '').toUpperCase(),
          response.service_name || '',
          response.client_name || '',
          response.client_email || '',
          avgRating.toFixed(1),
          comments
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `responses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderRatingValue = (rating) => {
    const ratingMap = {
      'strongly-agree': 'Strongly Agree',
      'agree': 'Agree',
      'neutral': 'Neutral',
      'disagree': 'Disagree',
      'strongly-disagree': 'Strongly Disagree',
      'outstanding': 'Outstanding',
      'very-satisfactory': 'Very Satisfactory',
      'satisfactory': 'Satisfactory',
      'unsatisfactory': 'Unsatisfactory',
      'poor': 'Poor'
    };
    return ratingMap[rating] || rating;
  };

  const renderResponseDetails = (response) => {
    if (!response || !response.answers) return null;

    const { answers } = response;
    const isCSM = response.form_type === 'csm';
    const ratings = isCSM ? answers.csmARTARatings?.ratings : answers.qmsRatings?.ratings;
    const comments = isCSM ? answers.csmARTARatings?.comments : answers.qmsRatings?.comments;
    const checkmarkSelections = isCSM ? answers.csmARTACheckmark : answers.qmsCheckmark?.selections;

    return (
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
    );
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Form Responses</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search responses..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              <option value="all">All Forms</option>
              <option value="csm">CSM Forms</option>
              <option value="qms">QMS Forms</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResponses.map((response) => {
                if (!response || typeof response !== 'object') return null;

                return (
                  <tr key={response.response_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(response.submitted_at || '').toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(response.form_type || '').toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {response.service_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {response.client_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {response.client_email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedResponse(response)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Response Details Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Response Details</h2>
              <button
                onClick={() => setSelectedResponse(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {renderResponseDetails(selectedResponse)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 