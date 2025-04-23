"use client"

import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Calendar, TrendingUp, Star, ThumbsUp } from 'lucide-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

// Constants
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

const getRatingInterpretation = (score) => {
  if (score >= 95) return 'Outstanding';
  if (score >= 90) return 'Very Satisfactory';
  if (score >= 80) return 'Satisfactory';
  if (score >= 60) return 'Fair';
  return 'Poor';
};

export default function AnalyticsPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedFormType, setSelectedFormType] = useState(FormType.CSM);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/responses');
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

  const filterResponsesByFormType = (data) => {
    return data.filter(response => {
      if (selectedFormType === FormType.CSM) return response.form_id === 1;
      if (selectedFormType === FormType.QMS) return response.form_id === 3;
      return true;
    });
  };

  const filterResponsesByTimeRange = (data) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(response => new Date(response.submitted_at) >= startDate);
  };

  const calculateStats = (data) => {
    const filteredData = filterResponsesByTimeRange(data);
    const totalResponses = filteredData.length;
    
    // Separate CSM and QMS responses
    const csmResponses = filteredData.filter(r => r.form_id === 1);
    const qmsResponses = filteredData.filter(r => r.form_id === 3);

    // Calculate CSM stats
    const csmAverageRating = csmResponses.reduce((acc, curr) => {
      return acc + calculateAverageRating(curr.answers, FormType.CSM);
    }, 0) / (csmResponses.length || 1);

    const csmSatisfactionRate = (csmResponses.filter(r => {
      const score = calculateAverageRating(r.answers, FormType.CSM);
      return score >= 80; // Satisfactory or above
    }).length / (csmResponses.length || 1)) * 100;

    // Calculate QMS stats (keeping existing calculation for now)
    const qmsAverageRating = qmsResponses.reduce((acc, curr) => {
      return acc + calculateAverageRating(curr.answers, FormType.QMS);
    }, 0) / (qmsResponses.length || 1);

    return {
      totalResponses,
      csmStats: {
        averageRating: csmAverageRating.toFixed(2),
        satisfactionRate: csmSatisfactionRate.toFixed(1),
        interpretation: getRatingInterpretation(csmAverageRating)
      },
      qmsStats: {
        averageRating: qmsAverageRating.toFixed(2)
      }
    };
  };

  const getServiceDistribution = (data) => {
    const filteredData = filterResponsesByTimeRange(data);
    const serviceCounts = filteredData.reduce((acc, curr) => {
      acc[curr.service_name] = (acc[curr.service_name] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(serviceCounts),
      datasets: [{
        data: Object.values(serviceCounts),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }]
    };
  };

  const getRatingDistribution = (data) => {
    const filteredData = filterResponsesByTimeRange(data);
    const ratingCounts = filteredData.reduce((acc, curr) => {
      const avgRating = Math.round(calculateAverageRating(curr.answers, curr.form_id === 1 ? FormType.CSM : FormType.QMS));
      acc[avgRating] = (acc[avgRating] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(ratingCounts).map(r => `${r} Stars`),
      datasets: [{
        label: 'Number of Responses',
        data: Object.values(ratingCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }]
    };
  };

  const getTrendData = (data) => {
    const filteredData = filterResponsesByTimeRange(data);
    const dailyData = filteredData.reduce((acc, curr) => {
      const date = new Date(curr.submitted_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(dailyData),
      datasets: [{
        label: 'Responses per Day',
        data: Object.values(dailyData),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      }]
    };
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const filteredByTime = filterResponsesByTimeRange(responses);
  const filteredResponses = filterResponsesByFormType(filteredByTime);
  const stats = calculateStats(filteredResponses);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Form Type Selection */}
          <div className="flex gap-4 mr-8">
            {[FormType.CSM, FormType.QMS].map(type => (
              <button
                key={type}
                onClick={() => setSelectedFormType(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedFormType === type 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {type.toUpperCase()} Forms
              </button>
            ))}
          </div>

          {/* Time Range Selection */}
          <select
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Responses</p>
              <h3 className="text-2xl font-bold">{stats.totalResponses}</h3>
            </div>
            <Calendar className="text-blue-500" size={24} />
          </div>
        </div>

        {selectedFormType === FormType.CSM ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">CSM Average Rating</p>
                  <h3 className="text-2xl font-bold">{stats.csmStats.averageRating}%</h3>
                  <p className="text-sm text-gray-500">{stats.csmStats.interpretation}</p>
                </div>
                <Star className="text-yellow-500" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">CSM Satisfaction Rate</p>
                  <h3 className="text-2xl font-bold">{stats.csmStats.satisfactionRate}%</h3>
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
                  <h3 className="text-2xl font-bold">{stats.qmsStats.averageRating}</h3>
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

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {selectedFormType === FormType.CSM ? 'CSM Service Distribution' : 'QMS Service Distribution'}
          </h3>
          <div className="h-[300px]">
            <Pie data={getServiceDistribution(filteredResponses)} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            {selectedFormType === FormType.CSM ? 'CSM Rating Distribution' : 'QMS Rating Distribution'}
          </h3>
          <div className="h-[300px]">
            <Bar data={getRatingDistribution(filteredResponses)} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Response Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {selectedFormType === FormType.CSM ? 'CSM Response Trends' : 'QMS Response Trends'}
        </h3>
        <div className="h-[300px]">
          <Line data={getTrendData(filteredResponses)} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
          }} />
        </div>
      </div>
    </div>
  );
} 