"use client"

import { useState, useEffect } from 'react';
import { Search, Download, X, Eye, CalendarDays, ListFilter, FileText, FileSpreadsheet, Check } from 'lucide-react'; // Updated icons
import { Input } from '@/components/ui/input';
import ResponsesTable from '@/components/admin/ResponsesTable';
import ResponseDetailsModal from '@/components/admin/ResponseDetailsModal';
import { Button } from '@/components/ui/button';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedForm, dateFilter]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const paginatedResponses = filteredResponses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Form Responses</h1>
          <div className="flex gap-2">
            <Button className="h-10 px-4 bg-gray-200 text-gray-400" disabled>
              <Download size={18} />
              Export CSV
            </Button>
            <Button className="h-10 px-4 bg-gray-200 text-gray-400" disabled>
              <Download size={18} />
              Export Excel
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
          <div className="h-10 bg-gray-200 rounded col-span-6" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
        <div className="h-64" />
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  // Always show the filters and search
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Form Responses</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              className="h-10 px-4 border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="h-10 px-4 border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2"
              disabled={downloadingExcel}
            >
              {downloadingExcel ? <Spinner /> : <Download size={18} />}
              Export Excel
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100"> {/* mb-8 for more space */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by name, service, email or phone..."
              className="w-full h-10 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 md:col-span-6 w-full">
            <select
              className="flex-1 h-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
            >
              <option value="all">All Forms</option>
              <option value="csm">CSM Forms</option>
              <option value="qms">QMS Forms</option>
            </select>
            <select
              className="flex-1 h-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {filteredResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <div className="text-4xl mb-2">🙁</div>
              <div className="text-gray-700 font-semibold mb-1">No responses found</div>
              <div className="text-gray-500 text-sm">Try adjusting your search or filters, or check back later.</div>
            </div>
          ) : (
            <ResponsesTable responses={paginatedResponses} onViewDetails={handleViewDetails} />
          )}
        </div>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredResponses.length)} of {filteredResponses.length} results
        </div>
        <div className="flex gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}
              className={`px-3 py-1 text-sm ${
                currentPage === i + 1 
                  ? "bg-blue-500 text-white hover:bg-blue-600" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>
      {/* Response Details Modal */}
      {selectedResponse && (
        <ResponseDetailsModal 
          response={selectedResponse} 
          onClose={() => setSelectedResponse(null)}
          getQuestionText={getQuestionText}
          renderRatingValue={renderRatingValue}
        />
      )}
      {downloadError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Download Blocked</h2>
              <button
                onClick={() => setDownloadError(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-gray-600 leading-relaxed">
              Your browser has blocked multiple downloads. To enable this feature, please allow multiple downloads in your browser settings.
            </p>
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Chrome:</span> Settings → Privacy and security → Site Settings → Additional permissions → Automatic downloads
              </p>
              <p>
                <span className="font-semibold">Edge:</span> Settings → Cookies and site permissions → Automatic downloads
              </p>
            </div>
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setDownloadError(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}