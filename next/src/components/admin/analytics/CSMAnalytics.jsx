import { Star, Calendar, TrendingUp } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';

export default function CSMAnalytics({
  stats,
  sqdStats,
  questions,
  filteredResponses,
  getQuestionText,
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
      </div>

      {/* SQD Scores Section */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            CSM Service Distribution
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
            CSM Rating Distribution
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