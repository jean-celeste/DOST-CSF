"use client"

import { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForm, setSelectedForm] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/responses');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      // Ensure we have an array of valid responses
      const validResponses = Array.isArray(data) ? data.filter(item => item && typeof item === 'object') : [];
      setResponses(validResponses);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filteredResponses = responses.filter(response => {
    if (!response || typeof response !== 'object') return false;

    const name = response.name || '';
    const serviceName = response.service_name || '';
    const email = response.email || '';
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
      ['Date', 'Form Type', 'Service', 'Customer', 'Email', 'Average Rating', 'Comments'],
      ...filteredResponses.map(response => {
        if (!response || typeof response !== 'object') return [];
        
        const ratings = Object.entries(response.answers || {})
          .filter(([key]) => key.startsWith('rating_'))
          .map(([_, value]) => parseInt(value) || 0);
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
        
        return [
          new Date(response.submitted_at || '').toLocaleDateString(),
          (response.form_type || '').toUpperCase(),
          response.service_name || '',
          response.name || '',
          response.email || '',
          avgRating.toFixed(1),
          (response.answers?.comments || '')
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `responses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResponses.map((response) => {
                if (!response || typeof response !== 'object') return null;

                const ratings = Object.entries(response.answers || {})
                  .filter(([key]) => key.startsWith('rating_'))
                  .map(([_, value]) => parseInt(value) || 0);
                const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

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
                      {response.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {response.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        {avgRating.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate">
                        {response.answers?.comments || '-'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 