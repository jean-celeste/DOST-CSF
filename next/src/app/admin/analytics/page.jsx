"use client"

import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Calendar, TrendingUp, Star, ThumbsUp } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import CSMAnalytics from '../../../components/admin/analytics/CSMAnalytics';
import QMSAnalytics from '../../../components/admin/analytics/QMSAnalytics';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedFormType, setSelectedFormType] = useState(FormType.CSM);
  const [questions, setQuestions] = useState({});
  const [sqdStats, setSqdStats] = useState({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

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
      const response = await fetch('/api/admin/csm-sqd-positive');
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
      if (selectedFormType === FormType.QMS) return response.form_id === 2;
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
    const qmsResponses = filteredData.filter(r => r.form_id === 2);
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

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;
  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow h-32 flex items-center justify-center">
            <div className="w-16 h-6 bg-gray-200 rounded mb-2" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow h-[300px]" />
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow h-64 animate-pulse" />
    </div>
  );
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  const filteredByTime = filterResponsesByTimeRange(responses);
  const filteredResponses = filterResponsesByFormType(filteredByTime);
  const stats = calculateStats(filteredResponses);

  // Always show the toggles and filters
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor and analyze client feedback</p>
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
                  className={`px-4 py-2 rounded-md transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                    selectedFormType === type
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-blue-100'
                  }`}
                  aria-pressed={selectedFormType === type}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* If no data, show message and skip the rest */}
        {filteredResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="bg-white border border-blue-100 p-10 rounded-xl shadow flex flex-col items-center max-w-xl w-full">
              <TrendingUp className="text-blue-400 mb-4" size={48} />
              <p className="text-lg text-gray-700 mb-2 font-semibold">No analytics data found for your assignment.</p>
              <p className="text-gray-500 mb-4 text-center">There are currently no analytics data available for your division or office in this time range.</p>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded text-sm text-center">
                If you believe there should be data here, please check your filters or contact your system administrator.
              </div>
            </div>
          </div>
        ) : (
          <>
              {selectedFormType === FormType.CSM ? (
              <CSMAnalytics
                stats={stats}
                sqdStats={sqdStats}
                questions={questions}
                filteredResponses={filteredResponses}
                getQuestionText={getQuestionText}
                getServiceDistribution={getServiceDistribution}
                getRatingDistribution={getRatingDistribution}
              />
            ) : (
              <QMSAnalytics
                stats={stats}
                filteredResponses={filteredResponses}
                getServiceDistribution={getServiceDistribution}
                getRatingDistribution={getRatingDistribution}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
} 