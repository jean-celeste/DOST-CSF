"use client"

import { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    totalUsers: 0,
    satisfactionRate: 0
  });

  const [recentRatings, setRecentRatings] = useState([]);

  useEffect(() => {
    // TODO: Fetch real data from your API
    // For now, we'll use mock data
    setStats({
      totalRatings: 150,
      averageRating: 4.5,
      totalUsers: 120,
      satisfactionRate: 85
    });

    setRecentRatings([
      {
        id: 1,
        question: "Appropriateness of the Service/Activity",
        rating: "outstanding",
        date: "2024-03-25"
      },
      {
        id: 2,
        question: "How beneficial is the Service/Activity",
        rating: "very-satisfactory",
        date: "2024-03-24"
      },
      // Add more mock data as needed
    ]);
  }, []);

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

  return (
    <div className="space-y-8">
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
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
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

      {/* Recent Ratings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                  <tr key={rating.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rating.question}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rating.rating}
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