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

// Constants
const CHART_COLORS = {
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

const CHART_OPTIONS = {
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

const FormType = {
  CSM: 'csm',
  QMS: 'qms'
};

const calculateAverageRating = (answers, formType) => {
  if (!answers) return 0;
  
  // For CSM forms
  if (formType === FormType.CSM && answers.csmARTARatings?.ratings) {
    const ratings = Object.values(answers.csmARTARatings.ratings);
    const totalResponses = ratings.length;
    const naResponses = ratings.filter(r => r === 'na').length;
    const validResponses = totalResponses - naResponses;
    
    if (validResponses === 0) return 0;
    
    const positiveResponses = ratings.filter(r => 
      r === 'strongly-agree' || r === 'agree'
    ).length;
    
    return (positiveResponses / validResponses) * 100;
  }
  
  // For QMS forms
  if (formType === FormType.QMS && answers.qmsRatings?.ratings) {
    const ratings = Object.values(answers.qmsRatings.ratings);
    const ratingValues = {
      'outstanding': 5,
      'very-satisfactory': 4,
      'satisfactory': 3,
      'unsatisfactory': 2,
      'poor': 1
    };
    const sum = ratings.reduce((acc, rating) => acc + (ratingValues[rating] || 0), 0);
    return sum / ratings.length;
  }
  
  return 0;
};

const getRatingInterpretation = (score, formType) => {
  if (formType === FormType.CSM) {
    if (score >= 95) return 'Outstanding';
    if (score >= 90) return 'Very Satisfactory';
    if (score >= 80) return 'Satisfactory';
    if (score >= 60) return 'Fair';
    return 'Poor';
  } else {
    // QMS interpretation (can be adjusted as needed)
    if (score >= 4.5) return 'Outstanding';
    if (score >= 4.0) return 'Very Satisfactory';
    if (score >= 3.0) return 'Satisfactory';
    if (score >= 2.0) return 'Fair';
    return 'Poor';
  }
};

const getFormSpecificMetrics = (responses) => {
  const formTypes = [FormType.CSM, FormType.QMS];
  return formTypes.reduce((acc, type) => {
    const typeResponses = responses.filter(r => r.form_type === type);
    acc[type] = {
      total: typeResponses.length,
      avgRating: typeResponses.reduce((sum, r) => sum + calculateAverageRating(r.answers, type), 0) / (typeResponses.length || 1)
    };
    return acc;
  }, {});
};

const getChartData = (responses) => {
  const serviceData = responses.reduce((acc, curr) => {
    acc[curr.service_name] = (acc[curr.service_name] || 0) + 1;
    return acc;
  }, {});

  const ratingData = responses.reduce((acc, curr) => {
    const avgRating = Math.round(calculateAverageRating(curr.answers, curr.form_type));
    acc[avgRating] = (acc[avgRating] || 0) + 1;
    return acc;
  }, {});

  return {
    serviceData: {
      labels: Object.keys(serviceData),
      datasets: [{
        label: 'Service Distribution',
        data: Object.values(serviceData),
        backgroundColor: CHART_COLORS.primary.slice(0, Object.keys(serviceData).length),
        borderColor: CHART_COLORS.border.slice(0, Object.keys(serviceData).length),
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

export default function AdminDashboard() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedForm, setSelectedForm] = useState(FormType.CSM);

  useEffect(() => {
    fetchData();
  }, []);

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
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const filterResponses = (formType) => {
    if (formType === FormType.CSM) return responses.filter(r => r.form_id === 1);
    if (formType === FormType.QMS) return responses.filter(r => r.form_id === 3);
    return responses;
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const filteredResponses = filterResponses(selectedForm);
  const stats = {
    totalResponses: filteredResponses.length,
    averageRating: filteredResponses.reduce((acc, curr) => 
      acc + calculateAverageRating(curr.answers, selectedForm), 0) / (filteredResponses.length || 1),
    satisfactionRate: selectedForm === FormType.CSM ? 
      (filteredResponses.filter(r => {
        const score = calculateAverageRating(r.answers, selectedForm);
        return score >= 80; // Satisfactory or above
      }).length / (filteredResponses.length || 1)) * 100 : 0
  };
  const chartData = getChartData(filteredResponses);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="flex gap-4 mb-6">
          {[FormType.CSM, FormType.QMS].map(type => (
            <button
              key={type}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedForm === type 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedForm(type)}
            >
              {type.toUpperCase()} Forms
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Responses</p>
              <h3 className="text-2xl font-bold">{stats.totalResponses}</h3>
            </div>
            <FileText className="text-blue-500" size={24} />
          </div>
        </div>

        {selectedForm === FormType.CSM ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">CSM Average Rating</p>
                  <h3 className="text-2xl font-bold">{stats.averageRating.toFixed(2)}%</h3>
                  <p className="text-sm text-gray-500">
                    {getRatingInterpretation(stats.averageRating, selectedForm)}
                  </p>
                </div>
                <Star className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">CSM Satisfaction Rate</p>
                  <h3 className="text-2xl font-bold">{stats.satisfactionRate.toFixed(1)}%</h3>
                </div>
                <ThumbsUp className="text-green-500" size={24} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">QMS Average Rating</p>
                  <h3 className="text-2xl font-bold">{stats.averageRating.toFixed(2)}</h3>
                  <p className="text-sm text-gray-500">
                    {getRatingInterpretation(stats.averageRating, selectedForm)}
                  </p>
                </div>
                <Star className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">QMS Performance</p>
                  <h3 className="text-2xl font-bold">Coming Soon</h3>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {selectedForm === FormType.CSM ? 'CSM Service Distribution' : 'QMS Service Distribution'}
          </h3>
          <div className="h-[300px]">
            <Pie data={chartData.serviceData} options={CHART_OPTIONS} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {selectedForm === FormType.CSM ? 'CSM Rating Distribution' : 'QMS Rating Distribution'}
          </h3>
          <div className="h-[300px]">
            <Bar data={chartData.ratingData} options={CHART_OPTIONS} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {selectedForm === FormType.CSM ? 'CSM Recent Responses' : 'QMS Recent Responses'}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResponses.slice(0, 10).map((response) => (
                <tr key={response.response_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(response.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {response.service_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {response.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {selectedForm === FormType.CSM 
                      ? `${calculateAverageRating(response.answers, selectedForm).toFixed(2)}%`
                      : calculateAverageRating(response.answers, selectedForm).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 