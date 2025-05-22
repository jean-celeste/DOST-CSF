import { Star, TrendingUp } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';

export default function QMSAnalytics({
  stats,
  filteredResponses,
  getServiceDistribution,
  getRatingDistribution
}) {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            QMS Service Distribution
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
            QMS Rating Distribution
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
    </>
  );
} 