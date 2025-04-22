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

const calculateAverageRating = (answers) => {
  if (!answers) return 0;
  
  // For CSM forms
  if (answers.csmARTARatings?.ratings) {
    const ratings = Object.values(answers.csmARTARatings.ratings);
    const ratingValues = {
      'strongly-agree': 5,
      'agree': 4,
      'neutral': 3,
      'disagree': 2,
      'strongly-disagree': 1
    };
    const sum = ratings.reduce((acc, rating) => acc + (ratingValues[rating] || 0), 0);
    return sum / ratings.length;
  }
  
  // For QMS forms
  if (answers.qmsRatings?.ratings) {
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

export default function AnalyticsPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

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
    
    const averageRating = filteredData.reduce((acc, curr) => {
      return acc + calculateAverageRating(curr.answers);
    }, 0) / totalResponses;

    const satisfactionRate = (filteredData.filter(r => {
      const avgRating = calculateAverageRating(r.answers);
      return avgRating >= 4;
    }).length / totalResponses) * 100;

    return {
      totalResponses,
      averageRating: averageRating.toFixed(2),
      satisfactionRate: satisfactionRate.toFixed(1)
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
      const avgRating = Math.round(calculateAverageRating(curr.answers));
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

  const stats = calculateStats(responses);
  const serviceData = getServiceDistribution(responses);
  const ratingData = getRatingDistribution(responses);
  const trendData = getTrendData(responses);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
        
        <div className="flex items-center gap-4 mb-6">
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
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Average Rating</p>
              <h3 className="text-2xl font-bold">{stats.averageRating}</h3>
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
            <Pie data={serviceData} options={{
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
          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
          <div className="h-[300px]">
            <Bar data={ratingData} options={{
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

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Response Trends</h3>
        <div className="h-[300px]">
          <Line data={trendData} options={{
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