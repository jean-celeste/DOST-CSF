"use client"

import { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Star } from 'lucide-react';
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
    'rgba(255, 159, 64, 0.8)',
    'rgba(201, 203, 207, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
  ],
  border: [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(201, 203, 207, 1)',
    'rgba(255, 205, 86, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
  ],
  // Rating-specific colors
  rating: {
    'outstanding': 'rgba(75, 192, 192, 0.8)',
    'very-satisfactory': 'rgba(54, 162, 235, 0.8)',
    'satisfactory': 'rgba(255, 206, 86, 0.8)',
    'unsatisfactory': 'rgba(255, 99, 132, 0.8)',
    'poor': 'rgba(153, 102, 255, 0.8)',
  },
  ratingBorder: {
    'outstanding': 'rgba(75, 192, 192, 1)',
    'very-satisfactory': 'rgba(54, 162, 235, 1)',
    'satisfactory': 'rgba(255, 206, 86, 1)',
    'unsatisfactory': 'rgba(255, 99, 132, 1)',
    'poor': 'rgba(153, 102, 255, 1)',
  }
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
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    totalUsers: 0,
    satisfactionRate: 0
  });

  const [recentRatings, setRecentRatings] = useState([]);
  const [responses, setResponses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart data states
  const [customerTypeData, setCustomerTypeData] = useState(null);
  const [ratingDistributionData, setRatingDistributionData] = useState(null);
  const [responsesByServiceData, setResponsesByServiceData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch responses and customers
        const [responsesRes, customersRes] = await Promise.all([
          fetch('/api/admin/responses'),
          fetch('/api/admin/customers')
        ]);
        
        if (!responsesRes.ok || !customersRes.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const responsesData = await responsesRes.json();
        const customersData = await customersRes.json();
        
        setResponses(responsesData.responses);
        setCustomers(customersData.customers);
        
        // Process data for charts and stats
        processData(responsesData.responses, customersData.customers);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const processData = (responsesData, customersData) => {
    // Calculate stats
    const totalRatings = responsesData.length;
    const totalUsers = customersData.length;
    
    // Calculate average rating (assuming ratings are stored in answers.qmsRatings.ratings)
    let totalRatingValue = 0;
    let ratingCount = 0;
    
    responsesData.forEach(response => {
      if (response.answers && response.answers.qmsRatings && response.answers.qmsRatings.ratings) {
        const ratings = response.answers.qmsRatings.ratings;
        Object.values(ratings).forEach(rating => {
          if (rating === 'outstanding') totalRatingValue += 5;
          else if (rating === 'very-satisfactory') totalRatingValue += 4;
          else if (rating === 'satisfactory') totalRatingValue += 3;
          else if (rating === 'unsatisfactory') totalRatingValue += 2;
          else if (rating === 'poor') totalRatingValue += 1;
          ratingCount++;
        });
      }
    });
    
    const averageRating = ratingCount > 0 ? totalRatingValue / ratingCount : 0;
    
    // Calculate satisfaction rate (assuming ratings of 4 or 5 are considered satisfied)
    let satisfiedCount = 0;
    let totalCount = 0;
    
    responsesData.forEach(response => {
      if (response.answers && response.answers.qmsRatings && response.answers.qmsRatings.ratings) {
        const ratings = response.answers.qmsRatings.ratings;
        Object.values(ratings).forEach(rating => {
          if (rating === 'outstanding' || rating === 'very-satisfactory') {
            satisfiedCount++;
          }
          totalCount++;
        });
      }
    });
    
    const satisfactionRate = totalCount > 0 ? Math.round((satisfiedCount / totalCount) * 100) : 0;
    
    // Update stats
    setStats({
      totalRatings,
      averageRating,
      totalUsers,
      satisfactionRate
    });
    
    // Prepare recent ratings for display
    const recentRatingsData = responsesData
      .slice(0, 5)
      .map(response => {
        // Extract a sample rating from the response
        let ratingText = 'N/A';
        if (response.answers && response.answers.qmsRatings && response.answers.qmsRatings.ratings) {
          const ratings = response.answers.qmsRatings.ratings;
          const firstRating = Object.values(ratings)[0];
          if (firstRating) {
            ratingText = firstRating;
          }
        }
        
        return {
          id: response.response_id,
          question: response.form_title || 'Feedback Form',
          rating: ratingText,
          date: new Date(response.submitted_at).toLocaleDateString()
        };
      });
    
    setRecentRatings(recentRatingsData);
    
    // Prepare customer type chart data
    const customerTypeCounts = {};
    customersData.forEach(customer => {
      const type = customer.cust_type_name || 'Unknown';
      customerTypeCounts[type] = (customerTypeCounts[type] || 0) + 1;
    });
    
    setCustomerTypeData({
      labels: Object.keys(customerTypeCounts),
      datasets: [
        {
          label: 'Customer Types',
          data: Object.values(customerTypeCounts),
          backgroundColor: chartColors.primary.slice(0, Object.keys(customerTypeCounts).length),
          borderColor: chartColors.border.slice(0, Object.keys(customerTypeCounts).length),
          borderWidth: 1,
          hoverOffset: 10,
        },
      ],
    });
    
    // Prepare rating distribution chart data
    const ratingCounts = {
      'outstanding': 0,
      'very-satisfactory': 0,
      'satisfactory': 0,
      'unsatisfactory': 0,
      'poor': 0
    };
    
    responsesData.forEach(response => {
      if (response.answers && response.answers.qmsRatings && response.answers.qmsRatings.ratings) {
        const ratings = response.answers.qmsRatings.ratings;
        Object.values(ratings).forEach(rating => {
          if (ratingCounts.hasOwnProperty(rating)) {
            ratingCounts[rating]++;
          }
        });
      }
    });
    
    // Create arrays for background and border colors based on rating keys
    const ratingKeys = Object.keys(ratingCounts);
    const ratingBgColors = ratingKeys.map(key => chartColors.rating[key] || 'rgba(201, 203, 207, 0.8)');
    const ratingBorderColors = ratingKeys.map(key => chartColors.ratingBorder[key] || 'rgba(201, 203, 207, 1)');
    
    setRatingDistributionData({
      labels: ratingKeys.map(key => key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ')),
      datasets: [
        {
          label: 'Rating Distribution',
          data: Object.values(ratingCounts),
          backgroundColor: ratingBgColors,
          borderColor: ratingBorderColors,
          borderWidth: 1,
          borderRadius: 5,
          barThickness: 30,
        },
      ],
    });
    
    // Prepare responses by service chart data
    const serviceCounts = {};
    responsesData.forEach(response => {
      const service = response.service_name || 'Unknown Service';
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });
    
    // Sort services by count (descending) and take top 5
    const sortedServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    setResponsesByServiceData({
      labels: sortedServices.map(([service]) => service),
      datasets: [
        {
          label: 'Responses by Service',
          data: sortedServices.map(([, count]) => count),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 5,
          barThickness: 20,
        },
      ],
    });
  };

  const statCards = [
    {
      title: "Total Ratings",
      value: stats.totalRatings,
      icon: BarChart3,
      color: "bg-blue-500"
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "bg-yellow-500"
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Satisfaction Rate",
      value: `${stats.satisfactionRate}%`,
      icon: TrendingUp,
      color: "bg-purple-500"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your admin dashboard. Here's an overview of your ratings and feedback.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Type Distribution</h2>
          {customerTypeData && (
            <div className="h-64">
              <Pie 
                data={customerTypeData} 
                options={{
                  ...commonChartOptions,
                  plugins: {
                    ...commonChartOptions.plugins,
                    legend: {
                      ...commonChartOptions.plugins.legend,
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h2>
          {ratingDistributionData && (
            <div className="h-64">
              <Bar 
                data={ratingDistributionData} 
                options={{
                  ...commonChartOptions,
                  plugins: {
                    ...commonChartOptions.plugins,
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        font: {
                          size: 12,
                          family: "'Inter', sans-serif",
                        },
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 12,
                          family: "'Inter', sans-serif",
                        },
                      },
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Responses by Service */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Services by Response Count</h2>
          {responsesByServiceData && (
            <div className="h-64">
              <Bar 
                data={responsesByServiceData} 
                options={{
                  ...commonChartOptions,
                  indexAxis: 'y',
                  plugins: {
                    ...commonChartOptions.plugins,
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        font: {
                          size: 12,
                          family: "'Inter', sans-serif",
                        },
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    y: {
                      ticks: {
                        font: {
                          size: 12,
                          family: "'Inter', sans-serif",
                        },
                      },
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Ratings</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRatings.map((rating) => (
                  <tr key={rating.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rating.question}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rating.rating === 'outstanding' ? 'bg-teal-100 text-teal-800' :
                        rating.rating === 'very-satisfactory' ? 'bg-blue-100 text-blue-800' :
                        rating.rating === 'satisfactory' ? 'bg-yellow-100 text-yellow-800' :
                        rating.rating === 'unsatisfactory' ? 'bg-red-100 text-red-800' :
                        rating.rating === 'poor' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rating.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rating.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 