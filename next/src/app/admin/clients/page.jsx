"use client"

import { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, Calendar, 
  BarChart3, PieChart, TrendingUp, Filter
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CHART_COLORS = {
  primary: [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
  ],
  border: [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
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
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    },
  },
};

const getAgeGroup = (age) => {
  if (age < 18) return 'Youth (Under 18)';
  if (age < 35) return 'Young Adult (18-34)';
  if (age < 55) return 'Adult (35-54)';
  return 'Senior (55+)';
};

export default function ClientDemographics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    clientType: 'all',
    gender: 'all',
    ageGroup: 'all'
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients?stats=true');
      if (!response.ok) throw new Error('Failed to fetch data');
      const { success, data, error: apiError, statistics } = await response.json();
      
      if (!success) throw new Error(apiError);
      
      setClients(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;

  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow h-32 flex items-center justify-center">
            <div className="w-16 h-6 bg-gray-200 rounded mb-2" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow h-[300px]" />
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg shadow h-64 animate-pulse" />
    </div>
  );
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesType = filter.clientType === 'all' || client.client_type.toLowerCase() === filter.clientType;
    const matchesGender = filter.gender === 'all' || 
      (filter.gender === 'prefer-not' ? 
        !['male', 'female'].includes(client.sex.toLowerCase()) : 
        client.sex.toLowerCase() === filter.gender);
    const matchesAgeGroup = filter.ageGroup === 'all' || getAgeGroup(client.age) === filter.ageGroup;
    return matchesType && matchesGender && matchesAgeGroup;
  });

  // Calculate statistics
  const stats = {
    totalClients: filteredClients.length,
    maleCount: filteredClients.filter(c => c.sex.toLowerCase() === 'male').length,
    femaleCount: filteredClients.filter(c => c.sex.toLowerCase() === 'female').length,
    averageAge: filteredClients.length > 0 ? 
      filteredClients.reduce((sum, c) => sum + (c.age || 0), 0) / filteredClients.length : 0,
    activeClients: filteredClients.filter(c => c.response_count > 1).length
  };

  // Prepare chart data
  const genderData = {
    labels: ['Male', 'Female', 'Prefer not to say'],
    datasets: [{
      label: 'Gender Distribution',
      data: [
        stats.maleCount,
        stats.femaleCount,
        filteredClients.filter(c => !['male', 'female'].includes(c.sex.toLowerCase())).length
      ],
      backgroundColor: CHART_COLORS.primary.slice(0, 3),
      borderColor: CHART_COLORS.border.slice(0, 3),
      borderWidth: 1,
    }]
  };

  const ageGroupData = filteredClients.reduce((acc, client) => {
    const group = getAgeGroup(client.age);
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});

  const ageGroupChart = {
    labels: Object.keys(ageGroupData),
    datasets: [{
      label: 'Age Group Distribution',
      data: Object.values(ageGroupData),
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      borderRadius: 5,
    }]
  };

  const clientTypeData = filteredClients.reduce((acc, client) => {
    const type = client.client_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const clientTypeChart = {
    labels: Object.keys(clientTypeData),
    datasets: [{
      label: 'Client Type Distribution',
      data: Object.values(clientTypeData),
      backgroundColor: CHART_COLORS.primary.slice(0, Object.keys(clientTypeData).length),
      borderColor: CHART_COLORS.border.slice(0, Object.keys(clientTypeData).length),
      borderWidth: 1,
    }]
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Client Demographics</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select
              aria-label="Client Type Filter"
              value={filter.clientType}
              onChange={(e) => setFilter({...filter, clientType: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Client Types</option>
              <option value="internal">Internal</option>
              <option value="citizen">Citizen</option>
              <option value="business">Business</option>
              <option value="government">Government</option>
            </select>
            <select
              aria-label="Gender Filter"
              value={filter.gender}
              onChange={(e) => setFilter({...filter, gender: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
            <select
              aria-label="Age Group Filter"
              value={filter.ageGroup}
              onChange={(e) => setFilter({...filter, ageGroup: e.target.value})}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">All Age Groups</option>
              <option value="Youth (Under 18)">Youth (Under 18)</option>
              <option value="Young Adult (18-34)">Young Adult (18-34)</option>
              <option value="Adult (35-54)">Adult (35-54)</option>
              <option value="Senior (55+)">Senior (55+)</option>
            </select>
            <button
              onClick={() => setFilter({clientType: 'all', gender: 'all', ageGroup: 'all'})}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Clear Filters"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Clients</p>
              <h3 className="text-2xl font-bold">{stats.totalClients}</h3>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Active Clients</p>
              <h3 className="text-2xl font-bold">{stats.activeClients}</h3>
              <p className="text-sm text-gray-500">Multiple responses</p>
            </div>
            <UserCheck className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Average Age</p>
              <h3 className="text-2xl font-bold">{stats.averageAge.toFixed(1)}</h3>
              <p className="text-sm text-gray-500">years</p>
            </div>
            <Calendar className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Gender Ratio</p>
              <div className="space-y-1">
                {stats.totalClients > 0 ? (
                  <>
                    <h3 className="text-2xl font-bold">
                      {Math.round((stats.maleCount / stats.totalClients) * 100)}% M
                    </h3>
                    <p className="text-sm text-gray-500">
                      {Math.round((stats.femaleCount / stats.totalClients) * 100)}% F
                    </p>
                    <p className="text-sm text-gray-500">
                      {Math.round(((stats.totalClients - stats.maleCount - stats.femaleCount) / stats.totalClients) * 100)}% Prefer not to say
                    </p>
                  </>
                ) : (
                  <h3 className="text-2xl font-bold">N/A</h3>
                )}
              </div>
            </div>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
          <div className="h-[300px]">
            <Pie data={genderData} options={CHART_OPTIONS} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Age Groups</h3>
          <div className="h-[300px]">
            <Bar data={ageGroupChart} options={CHART_OPTIONS} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Client Types</h3>
          <div className="h-[300px]">
            <Pie data={clientTypeChart} options={CHART_OPTIONS} />
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Client List</h3>
        <div className="overflow-x-auto">
          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <div className="text-4xl mb-2">🙁</div>
              <div className="text-gray-700 font-semibold mb-1">No clients found</div>
              <div className="text-gray-500 text-sm">Try adjusting your filters or check back later.</div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.slice(0, 20).map((client, index) => (
                  <tr key={client.client_id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.name || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${client.sex?.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-800' : client.sex?.toLowerCase() === 'female' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-600'}`}> 
                        {client.sex || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.age || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {client.client_type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.response_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.last_updated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {filteredClients.length > 20 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing 20 of {filteredClients.length} clients
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 