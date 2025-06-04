import { useState } from 'react';
import { Star, Calendar, TrendingUp, Download, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  RadialLinearScale
} from 'chart.js';
import { Pie, Bar, Radar } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  LineElement,
  PointElement,
  RadialLinearScale
);

// Spinner component for loading states
function Spinner() {
  return (
    <div className="flex justify-center items-center h-6">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function CSMAnalytics({
  stats,
  sqdStats,
  questions,
  filteredResponses,
  getQuestionText,
  getServiceDistribution,
  getRatingDistribution,
  loading = false,
  error = null
}) {
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [expandedOffice, setExpandedOffice] = useState(null);

  const handleExportExcel = async () => {
    setDownloadingExcel(true);
    setDownloadError(false);
    try {
      const res = await fetch('/api/admin/reports/csm/excel');
      if (!res.ok) throw new Error('Failed to download Excel report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `csm_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(true);
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Prepare data for radar chart
  const radarData = {
    labels: Object.entries(sqdStats).map(([questionId]) => `SQD ${parseInt(questionId) - 4}`),
    datasets: [
      {
        label: 'SQD Performance',
        data: Object.values(sqdStats),
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        borderColor: 'rgb(66, 153, 225)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(66, 153, 225)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(66, 153, 225)',
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          callback: (value) => `${value}%`
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Score: ${context.parsed.r.toFixed(1)}%`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Excel Export Button */}
      <div className="flex justify-end mb-2">
        <Button
          onClick={handleExportExcel}
          variant="outline"
          className="h-10 px-4 border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2"
          disabled={downloadingExcel}
        >
          {downloadingExcel ? <Spinner /> : <Download size={18} />}
          Export Excel
        </Button>
      </div>
      {downloadError && (
        <div className="text-center text-red-500 mb-2">Failed to download Excel report. Please try again.</div>
      )}

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
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Quality Dimensions (SQD)</h2>
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

        {/* SQD Radar Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">SQD Performance Overview</h3>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div className="h-[400px]">
              <Radar data={radarData} options={radarOptions} />
            </div>
          </div>
        </div>

        {/* SQD Dimension Breakdown */}
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
      <div className="grid grid-cols-1 gap-8">
        {/* Service Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Service Distribution
          </h3>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-h-[500px]">
              <Pie 
                data={getServiceDistribution(filteredResponses)} 
                options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    align: 'start',
                    display: true,
                    labels: {
                      padding: 15,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      font: {
                        size: 11,
                        weight: '500'
                      },
                      generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                          return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const total = data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return {
                              text: `${label} (${percentage}%)`,
                              fillStyle: data.datasets[0].backgroundColor[i],
                              strokeStyle: data.datasets[0].borderColor[i],
                              lineWidth: 2,
                              hidden: false,
                              index: i
                            };
                          });
                        }
                        return [];
                      }
                    },
                    overflow: 'scroll',
                    maxHeight: 460
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [
                          `${label}`,
                          `Responses: ${value}`,
                          `Percentage: ${percentage}%`
                        ];
                      }
                    },
                    padding: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                      size: 14,
                      weight: 'bold'
                    },
                    bodyFont: {
                      size: 13
                    },
                    bodySpacing: 8,
                    multiKeyBackground: 'transparent',
                    displayColors: true,
                    boxPadding: 6
                  }
                },
                layout: {
                  padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                  }
                },
                elements: {
                  arc: {
                    borderWidth: 2,
                    borderColor: 'white',
                    hoverBorderColor: 'white',
                    hoverBorderWidth: 3,
                    hoverOffset: 15
                  }
                },
                animation: {
                  animateRotate: true,
                  animateScale: true,
                  duration: 1000,
                  easing: 'easeInOutQuart'
                }
              }} 
              />
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <div className="h-[400px]">
            <Bar 
              data={{
                ...getRatingDistribution(filteredResponses),
                datasets: [
                  {
                    ...getRatingDistribution(filteredResponses).datasets[0],
                    backgroundColor: [
                      '#EF4444', // Red for Strongly Disagree
                      '#F97316', // Orange for Disagree
                      '#FBBF24', // Yellow for Neutral
                      '#34D399', // Light green for Agree
                      '#10B981', // Green for Strongly Agree
                    ],
                    borderRadius: 8,
                    maxBarThickness: 80,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed.y;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [
                          `Responses: ${value}`,
                          `Percentage: ${percentage}%`
                        ];
                      },
                      title: (context) => {
                        return context[0].label;
                      }
                    },
                    padding: 12,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                      size: 14,
                      weight: 'bold'
                    },
                    bodyFont: {
                      size: 13
                    },
                    usePointStyle: true,
                    boxPadding: 6
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.1)',
                      drawBorder: false
                    },
                    ticks: {
                      stepSize: 1,
                      padding: 10,
                      font: {
                        size: 12
                      }
                    },
                    title: {
                      display: true,
                      text: 'Number of Responses',
                      font: {
                        size: 13,
                        weight: 'bold'
                      },
                      padding: { bottom: 10 }
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 12
                      }
                    },
                    title: {
                      display: true,
                      text: 'Rating',
                      font: {
                        size: 13,
                        weight: 'bold'
                      },
                      padding: { top: 10 }
                    }
                  }
                },
                layout: {
                  padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                  }
                },
                animation: {
                  duration: 2000,
                  easing: 'easeInOutQuart'
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
} 