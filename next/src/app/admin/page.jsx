"use client"

import { useState, useEffect } from 'react';
import { 
  Users, Star, ThumbsUp, TrendingUp, 
  FileText, ClipboardCheck, AlertCircle 
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Custom chart colors
const chartColors = {
  primary: [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
  ],
  border: [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
  ]
};

// Common chart options
const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      titleColor: '#111827',
      bodyColor: '#4B5563',
      bodyFont: {
        size: 13,
        family: "'Inter', sans-serif",
      },
      titleFont: {
        size: 14,
        weight: 'bold',
        family: "'Inter', sans-serif",
      },
      padding: 12,
      borderColor: '#E5E7EB',
      borderWidth: 1,
      displayColors: true,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.raw || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    },
  },
};

export default function AdminDashboard() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState('all'); // 'all', 'csm', 'qms'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/responses');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setResponses(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filterResponses = (formType) => {
    if (formType === 'all') return responses;
    return responses.filter(r => r.form_type === formType);
  };

  const calculateStats = (data) => {
    const totalResponses = data.length;
    const averageRating = data.reduce((acc, curr) => {
      const ratings = Object.entries(curr.answers)
        .filter(([key]) => key.startsWith('rating_'))
        .map(([_, value]) => parseInt(value));
      return acc + (ratings.reduce((a, b) => a + b, 0) / ratings.length);
    }, 0) / totalResponses;

    const satisfactionRate = (data.filter(r => {
      const ratings = Object.entries(r.answers)
        .filter(([key]) => key.startsWith('rating_'))
        .map(([_, value]) => parseInt(value));
      return ratings.reduce((a, b) => a + b, 0) / ratings.length >= 4;
    }).length / totalResponses) * 100;

    // Calculate form-specific metrics
    const formSpecificMetrics = {
      csm: {
        total: data.filter(r => r.form_type === 'csm').length,
        avgRating: data.filter(r => r.form_type === 'csm').reduce((acc, curr) => {
          const ratings = Object.entries(curr.answers)
            .filter(([key]) => key.startsWith('rating_'))
            .map(([_, value]) => parseInt(value));
          return acc + (ratings.reduce((a, b) => a + b, 0) / ratings.length);
        }, 0) / (data.filter(r => r.form_type === 'csm').length || 1)
      },
      qms: {
        total: data.filter(r => r.form_type === 'qms').length,
        avgRating: data.filter(r => r.form_type === 'qms').reduce((acc, curr) => {
          const ratings = Object.entries(curr.answers)
            .filter(([key]) => key.startsWith('rating_'))
            .map(([_, value]) => parseInt(value));
          return acc + (ratings.reduce((a, b) => a + b, 0) / ratings.length);
        }, 0) / (data.filter(r => r.form_type === 'qms').length || 1)
      }
    };

    return {
      totalResponses,
      averageRating: averageRating.toFixed(2),
      satisfactionRate: satisfactionRate.toFixed(1),
      formSpecificMetrics
    };
  };

  const getChartData = (data) => {
    // Service distribution
    const serviceData = data.reduce((acc, curr) => {
      acc[curr.service_name] = (acc[curr.service_name] || 0) + 1;
      return acc;
    }, {});

    // Rating distribution
    const ratingData = data.reduce((acc, curr) => {
      Object.entries(curr.answers)
        .filter(([key]) => key.startsWith('rating_'))
        .forEach(([_, value]) => {
          acc[value] = (acc[value] || 0) + 1;
        });
      return acc;
    }, {});

    return {
      serviceData: {
        labels: Object.keys(serviceData),
        datasets: [{
          label: 'Service Distribution',
          data: Object.values(serviceData),
          backgroundColor: chartColors.primary.slice(0, Object.keys(serviceData).length),
          borderColor: chartColors.border.slice(0, Object.keys(serviceData).length),
          borderWidth: 1,
        }]
      },
      ratingData: {
        labels: Object.keys(ratingData).map(rating => `${rating} Stars`),
        datasets: [{
          label: 'Rating Distribution',
          data: Object.values(ratingData),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 5,
        }]
      }
    };
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const filteredResponses = filterResponses(selectedForm);
  const stats = calculateStats(filteredResponses);
  const chartData = getChartData(filteredResponses);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${selectedForm === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedForm('all')}
          >
            All Forms
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedForm === 'csm' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedForm('csm')}
          >
            CSM Forms
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedForm === 'qms' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedForm('qms')}
          >
            QMS Forms
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Responses</p>
              <h3 className="text-2xl font-bold">{stats.totalResponses}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>CSM: {stats.formSpecificMetrics.csm.total}</p>
                <p>QMS: {stats.formSpecificMetrics.qms.total}</p>
              </div>
            </div>
            <FileText className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Average Rating</p>
              <h3 className="text-2xl font-bold">{stats.averageRating}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <p>CSM: {stats.formSpecificMetrics.csm.avgRating.toFixed(2)}</p>
                <p>QMS: {stats.formSpecificMetrics.qms.avgRating.toFixed(2)}</p>
              </div>
            </div>
            <Star className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Satisfaction Rate</p>
              <h3 className="text-2xl font-bold">{stats.satisfactionRate}%</h3>
            </div>
            <ThumbsUp className="text-green-500" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Service Distribution</h3>
          <div className="h-[300px]">
            <Pie data={chartData.serviceData} options={commonChartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
          <div className="h-[300px]">
            <Bar data={chartData.ratingData} options={commonChartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Responses</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResponses.slice(0, 10).map((response) => {
                const ratings = Object.entries(response.answers)
                  .filter(([key]) => key.startsWith('rating_'))
                  .map(([_, value]) => parseInt(value));
                const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

                return (
                  <tr key={response.response_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(response.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {response.form_type.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {response.service_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {response.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {avgRating.toFixed(1)}
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