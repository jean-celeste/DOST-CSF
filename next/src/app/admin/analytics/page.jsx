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

const calculateSQDScores = (responses) => {
  if (!responses || responses.length === 0) return {};

  // Initialize scores object for each SQD
  const sqdScores = {};
  
  // Process each response
  responses.forEach((response, index) => {
    if (response.form_type === 'csm' && response.answers?.csmARTARatings?.ratings) {
      const ratings = response.answers.csmARTARatings.ratings;
      
      // Process each SQD rating
      Object.entries(ratings).forEach(([sqdId, rating]) => {
        const numericId = parseInt(sqdId);
        
        if (!sqdScores[numericId]) {
          sqdScores[numericId] = {
            totalResponses: 0,
            naResponses: 0,
            positiveResponses: 0
          };
        }
        
        const sqd = sqdScores[numericId];
        sqd.totalResponses++;
        
        if (rating === 'na') {
          sqd.naResponses++;
        } else if (rating === 'strongly-agree' || rating === 'agree') {
          sqd.positiveResponses++;
        }
      });
    }
  });

  // Calculate final scores
  const finalScores = {};
  Object.entries(sqdScores).forEach(([sqdId, data]) => {
    const validResponses = data.totalResponses - data.naResponses;
    if (validResponses > 0) {
      finalScores[sqdId] = (data.positiveResponses / validResponses) * 100;
    } else {
      finalScores[sqdId] = 0;
    }
  });

  return finalScores;
};

export default function AnalyticsPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedFormType, setSelectedFormType] = useState(FormType.CSM);
  const [questions, setQuestions] = useState({});
  const [sqdStats, setSqdStats] = useState({});

  useEffect(() => {
    fetchData();
    // Fetch SQD stats only for CSM
    if (selectedFormType === FormType.CSM) {
      fetchSQDStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormType]);

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

      // Fetch questions for CSM form
      const csmQuestions = await fetchQuestions(1);
      setQuestions(csmQuestions);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchSQDStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/csm-sqd-positive', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch SQD stats');
      const { success, data } = await response.json();
      if (success) {
        // Convert array to object keyed by question_id for easier access
        const sqdObj = {};
        data.forEach(row => {
          sqdObj[row.question_id] = row.percentage_positive;
        });
        setSqdStats(sqdObj);
      }
    } catch (err) {
      setSqdStats({});
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
    // Calculate QMS stats (keeping existing calculation for now)
    const qmsAverageRating = qmsResponses.reduce((acc, curr) => {
      return acc + calculateAverageRating(curr.answers, FormType.QMS);
    }, 0) / (qmsResponses.length || 1);
    return {
      totalResponses,
      csmStats: {
        averageRating: csmAverageRating.toFixed(2),
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

  const getQuestionText = (questionId) => {
    return questions[questionId] || `Question ${questionId}`;
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const filteredByTime = filterResponsesByTimeRange(responses);
  const filteredResponses = filterResponsesByFormType(filteredByTime);
  const stats = calculateStats(filteredResponses);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor and analyze customer feedback</p>
          </div>
          <div className="flex items-center gap-4">
          <select
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              {[FormType.CSM, FormType.QMS].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFormType(type)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedFormType === type
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedFormType === FormType.CSM ? (
          <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">CSM Average Rating</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.csmStats.averageRating}%</h3>
                    <p className="text-sm text-gray-500 mt-1">{stats.csmStats.interpretation}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full">
                    <Star className="text-blue-500" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">Total Responses</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.totalResponses}</h3>
                    <p className="text-sm text-gray-500 mt-1">All time</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-full">
                    <Calendar className="text-purple-500" size={24} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">QMS Average Rating</p>
                    <h3 className="text-3xl font-bold mt-1">{stats.qmsStats.averageRating}</h3>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-full">
                    <Star className="text-blue-500" size={24} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">QMS Performance</p>
                    <h3 className="text-3xl font-bold mt-1">Coming Soon</h3>
                </div>
                  <div className="bg-green-50 p-3 rounded-full">
                <TrendingUp className="text-green-500" size={24} />
                  </div>
              </div>
            </div>
          </>
        )}
      </div>

        {/* SQD Scores Section */}
        {selectedFormType === FormType.CSM && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Service Quality Dimensions (SQD) Scores</h2>
                <p className="text-gray-500 mt-1">Detailed breakdown of service quality metrics</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-600">Excellent (≥80%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-600">Good (≥60%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm font-medium text-gray-600">Needs Improvement (&lt;60%)</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(sqdStats).map(([questionId, score]) => (
                <div key={questionId} className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      SQD {parseInt(questionId) - 4}
                    </span>
                    <p className="text-base font-medium text-gray-700 leading-relaxed">
                      {getQuestionText(questionId)}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {score === 0 ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <p className="text-gray-500 text-sm">No responses in selected time range</p>
                        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                          <div className="h-3 rounded-full w-0"></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-3 rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${score}%`,
                              backgroundColor: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </div>
                        <span className="ml-4 text-lg font-semibold min-w-[60px] text-right">
                          {Number(score).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedFormType === FormType.CSM ? 'CSM Service Distribution' : 'QMS Service Distribution'}
          </h3>
            <div className="h-[400px]">
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
      </div>
    </div>
  );
} 