"use client"

import { useState, useEffect } from 'react';
import { Search, Download, X, Eye, CalendarDays, ListFilter, FileText, FileSpreadsheet, Check } from 'lucide-react'; // Updated icons
import ResponsesTable from '@/components/admin/ResponsesTable';
import ResponseDetailsModal from '@/components/admin/ResponseDetailsModal';

// Constants
const FormType = {
  CSM: 'csm',
  QMS: 'qms'
};

function Spinner() {
  return (
    <div className="flex justify-center items-center h-16">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [questions, setQuestions] = useState({});
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchQuestions = async (formId) => {
    try {
      const response = await fetch(`/api/questions?formId=${formId}`);
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
      const response = await fetch('/api/admin/responses');
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
    const phone = response.client_phone || ''; 
    const formType = response.form_type || '';
    const submittedAt = response.submitted_at || '';

    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (phone && phone.toLowerCase().includes(searchTerm.toLowerCase())); 

    const matchesForm = selectedForm === 'all' || formType === selectedForm;

    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(submittedAt).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(submittedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(submittedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesForm && matchesDate;
  });

  const handleViewDetails = (response) => {
    setSelectedResponse(response);
  };

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

  const handleExportExcel = async () => {
    setDownloadingExcel(true);
    setDownloadError(false);
    try {
      const res = await fetch('/api/admin/reports/responses');
      
      if (!res.ok) {
        let errorMsg = 'Failed to download Excel report';
        try {
          const errorData = await res.json();
          if (errorData && errorData.error) {
            errorMsg = `Failed to download Excel report: ${errorData.error}`;
          }
        } catch (parseError) {
          console.warn('Could not parse error response from backend for Excel download:', parseError);
        }
        throw new Error(errorMsg);
      }
      
      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = 'responses_report.xlsx';

      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=(?:(['"])(.*?)\1|([^;\n]*))/i;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null) {
          filename = matches[2] || matches[3] || filename;
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadError(true);
    } finally {
      setDownloadingExcel(false);
    }
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

  if (loading) return <Spinner />;
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
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={downloadingExcel}
            >
              {downloadingExcel ? <Spinner /> : <Download size={20} />}
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Use ResponsesTable component */}
      <ResponsesTable responses={filteredResponses} onViewDetails={handleViewDetails} />

      {/* Response Details Modal */}
      {selectedResponse && (
        <ResponseDetailsModal 
          response={selectedResponse} 
          onClose={() => setSelectedResponse(null)}
          getQuestionText={getQuestionText} // Pass necessary props
          renderRatingValue={renderRatingValue} // Pass necessary props
        />
      )}

      {downloadError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">Download Blocked</h2>
            <p className="mb-4 text-gray-700">
              Your browser has blocked multiple downloads. To enable this feature, please allow multiple downloads in your browser settings.<br /><br />
              <span className="font-semibold">Chrome:</span> Settings &rarr; Privacy and security &rarr; Site Settings &rarr; Additional permissions &rarr; Automatic downloads.<br />
              <span className="font-semibold">Edge:</span> Settings &rarr; Cookies and site permissions &rarr; Automatic downloads.
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setDownloadError(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}