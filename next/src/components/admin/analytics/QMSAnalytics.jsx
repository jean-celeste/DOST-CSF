import { useState, useEffect } from 'react';
import { Star, Calendar, Download } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import { Button } from '@/components/ui/button';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Spinner component for loading states
function Spinner() {
  return (
    <div className="flex justify-center items-center h-6">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

const qmsQuestions = [
  { key: 'overall', label: 'Over-All Satisfaction' },
  { key: 'appropriateness', label: 'Appropriateness of the service/activity' },
  { key: 'timeliness', label: 'Timeliness of delivery' },
  { key: 'attitude', label: 'Attitude of Staff' },
  { key: 'gender_fair_treatment', label: 'Gender fair treatment' },
  { key: 'beneficial', label: 'How beneficial is the service/activity' },
];

const ratingKeys = [
  'outstanding',
  'very_satisfactory',
  'satisfactory',
  'fair',
  'unsatisfactory',
];

const ratingLabels = {
  'outstanding': 'Outstanding',
  'very_satisfactory': 'Very Satisfactory',
  'satisfactory': 'Satisfactory',
  'fair': 'Fair',
  'unsatisfactory': 'Unsatisfactory'
};

const ratingColors = {
  outstanding: 'rgba(16, 185, 129, 0.9)',      // Green with opacity
  'very_satisfactory': 'rgba(59, 130, 246, 0.9)', // Changed to blue with opacity
  satisfactory: 'rgba(251, 191, 36, 0.9)',     // Yellow with opacity
  fair: 'rgba(249, 115, 22, 0.9)',            // Orange with opacity
  unsatisfactory: 'rgba(239, 68, 68, 0.9)'     // Red with opacity
};

const ratingHoverColors = {
  outstanding: 'rgba(16, 185, 129, 1)',      // Full opacity on hover
  'very_satisfactory': 'rgba(59, 130, 246, 1)', // Changed to blue with full opacity
  satisfactory: 'rgba(251, 191, 36, 1)',
  fair: 'rgba(249, 115, 22, 1)',
  unsatisfactory: 'rgba(239, 68, 68, 1)'
};

function isQmsSummaryEmpty(summary) {
  if (!summary) return true;
  return [
    'overall', 'appropriateness', 'timeliness', 'attitude', 'gender_fair_treatment', 'beneficial'
  ].every(q =>
    ['outstanding', 'very_satisfactory', 'satisfactory', 'fair', 'unsatisfactory'].every(rating =>
      Number(summary[`${q}_${rating}`] || 0) === 0
    )
  );
}

function calculateQmsStats(data) {
  if (!data?.overall) return { averageRating: 0, totalResponses: 0 };

  let totalScore = 0;
  let totalRatings = 0;

  // Count total ratings and calculate score
  qmsQuestions.forEach(q => {
    ratingKeys.forEach(rating => {
      const count = Number(data.overall[`${q.key}_${rating}`] || 0);
      totalRatings += count;
      
      // Calculate score based on rating
      switch(rating) {
        case 'outstanding':
          totalScore += count * 5;
          break;
        case 'very_satisfactory':
          totalScore += count * 4;
          break;
        case 'satisfactory':
          totalScore += count * 3;
          break;
        case 'fair':
          totalScore += count * 2;
          break;
        case 'unsatisfactory':
          totalScore += count * 1;
          break;
      }
    });
  });

  // Calculate total unique responses by looking at 'overall' ratings only
  const totalResponses = ratingKeys.reduce((sum, rating) => 
    sum + Number(data.overall[`overall_${rating}`] || 0), 0
  );

  // Calculate average rating as a percentage (0-100)
  const averageRating = totalRatings > 0 
    ? ((totalScore / (totalRatings * 5)) * 100).toFixed(1)
    : 0;

  return {
    averageRating: Number(averageRating),
    totalResponses: totalResponses
  };
}

export default function QMSAnalytics() {
  const [qmsReport, setQmsReport] = useState(null);
  const [qmsStats, setQmsStats] = useState({ averageRating: 0, totalResponses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    console.log('Fetching QMS report...');
    setLoading(true);
    fetch('/api/admin/reports/qms')
      .then(res => {
        console.log('QMS API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('QMS API response data:', data);
        if (data.success && data.data) {
          setQmsReport(data.data);
          const stats = calculateQmsStats(data.data);
          console.log('Setting QMS stats:', stats);
          setQmsStats(stats);
          setError(null);
        } else {
          console.error('API returned error:', data.error || 'No data available');
          setError(data.error || 'No data available');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch QMS report:', err);
        setError(err.message || 'Failed to fetch report');
        setLoading(false);
      });
  }, []);

  const handleExportExcel = async () => {
    setDownloadingExcel(true);
    setDownloadError(false);
    try {
      const res = await fetch('/api/admin/reports/qms/excel');
      if (!res.ok) throw new Error('Failed to download Excel report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qms_report_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  // Calculate checkmark summary data for the stacked bar chart
  const getCheckmarkSummaryData = (data) => {
    if (!data?.overall) return null;

    // Calculate totals for each question to get percentages
    const questionTotals = qmsQuestions.reduce((acc, q) => {
      acc[q.key] = ratingKeys.reduce((sum, rating) => 
        sum + (Number(data.overall[`${q.key}_${rating}`]) || 0), 0
      );
      return acc;
    }, {});

    return {
      labels: qmsQuestions.map(q => q.label),
      datasets: ratingKeys.map(rating => ({
        label: ratingLabels[rating],
        data: qmsQuestions.map(q => {
          const value = data.overall[`${q.key}_${rating}`] || 0;
          const total = questionTotals[q.key];
          return value;
        }),
        backgroundColor: ratingColors[rating],
        hoverBackgroundColor: ratingHoverColors[rating],
        borderWidth: 1,
        borderColor: 'white',
      }))
    };
  };

  // Calculate service distribution data
  const getServiceDistribution = (data) => {
    if (!data?.byOffice) return null;
    
    const serviceData = {};
    data.byOffice.forEach(office => {
      if (office.services) {
        office.services.forEach(service => {
          if (!serviceData[service.service_name]) {
            serviceData[service.service_name] = 0;
          }
          // Sum up all responses for this service
          ratingKeys.forEach(rating => {
            qmsQuestions.forEach(q => {
              serviceData[service.service_name] += Number(service[`${q.key}_${rating}`] || 0);
            });
          });
        });
      }
    });

    return {
      labels: Object.keys(serviceData),
      datasets: [{
        data: Object.values(serviceData),
        backgroundColor: [
          '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
        ],
        borderWidth: 2,
        borderColor: 'white',
      }]
    };
  };

  // Calculate rating distribution data
  const getRatingDistribution = (data) => {
    if (!data?.overall) return null;
    
    const ratingCounts = {
      'Outstanding': 0,
      'Very Satisfactory': 0,
      'Satisfactory': 0,
      'Fair': 0,
      'Unsatisfactory': 0
    };

    qmsQuestions.forEach(q => {
      ratingCounts['Outstanding'] += Number(data.overall[`${q.key}_outstanding`] || 0);
      ratingCounts['Very Satisfactory'] += Number(data.overall[`${q.key}_very_satisfactory`] || 0);
      ratingCounts['Satisfactory'] += Number(data.overall[`${q.key}_satisfactory`] || 0);
      ratingCounts['Fair'] += Number(data.overall[`${q.key}_fair`] || 0);
      ratingCounts['Unsatisfactory'] += Number(data.overall[`${q.key}_unsatisfactory`] || 0);
    });

    return {
      labels: Object.keys(ratingCounts),
      datasets: [{
        data: Object.values(ratingCounts),
        backgroundColor: [
          ratingColors.outstanding,
          ratingColors['very_satisfactory'],
          ratingColors.satisfactory,
          ratingColors.fair,
          ratingColors.unsatisfactory,
        ],
        hoverBackgroundColor: [
          ratingHoverColors.outstanding,
          ratingHoverColors['very_satisfactory'],
          ratingHoverColors.satisfactory,
          ratingHoverColors.fair,
          ratingHoverColors.unsatisfactory,
        ],
        borderRadius: 8,
        maxBarThickness: 80,
      }]
    };
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
              <p className="text-gray-500 text-sm font-medium">QMS Average Rating</p>
              <h3 className="text-3xl font-bold mt-1">{qmsStats.averageRating}%</h3>
              <p className="text-sm text-gray-500 mt-1">Overall satisfaction rate</p>
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
              <h3 className="text-3xl font-bold mt-1">{qmsStats.totalResponses}</h3>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-full">
              <Calendar className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* QMS Checkmark Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">QMS Checkmark Summary</h2>
            <p className="text-gray-500 mt-1">Detailed breakdown of QMS ratings by question</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ratingColors.outstanding }}></div>
              <span className="text-sm font-medium text-gray-600 ml-2">Outstanding</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ratingColors['very_satisfactory'] }}></div>
              <span className="text-sm font-medium text-gray-600 ml-2">Very Satisfactory</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: ratingColors.satisfactory }}></div>
              <span className="text-sm font-medium text-gray-600 ml-2">Satisfactory</span>
            </div>
          </div>
        </div>

        {qmsReport && !isQmsSummaryEmpty(qmsReport.overall) ? (
          <div className="h-[600px]">
            <Bar
              data={getCheckmarkSummaryData(qmsReport)}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      font: {
                        size: 12,
                        weight: '600'
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label || '';
                        const value = context.parsed.x;
                        const datasetIndex = context.datasetIndex;
                        const dataIndex = context.dataIndex;
                        
                        const total = context.chart.data.datasets.reduce((sum, dataset) => 
                          sum + (dataset.data[dataIndex] || 0), 0
                        );
                        
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                      size: 14,
                      weight: 'bold'
                    },
                    bodyFont: {
                      size: 13
                    },
                    bodySpacing: 8,
                    usePointStyle: true
                  }
                },
                scales: {
                  x: {
                    stacked: true,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)',
                      drawBorder: false
                    },
                    ticks: {
                      stepSize: 1,
                      font: {
                        size: 12
                      }
                    }
                  },
                  y: {
                    stacked: true,
                    grid: {
                      display: false
                    },
                    ticks: {
                      font: {
                        size: 12,
                        weight: '500'
                      },
                      callback: function(value) {
                        const label = this.getLabelForValue(value);
                        const words = label.split(' ');
                        const lines = [];
                        let line = '';
                        
                        words.forEach(word => {
                          if (line.length + word.length > 25) {
                            lines.push(line);
                            line = word;
                          } else {
                            line = line ? `${line} ${word}` : word;
                          }
                        });
                        if (line) {
                          lines.push(line);
                        }
                        return lines;
                      }
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
        ) : (
          <div className="text-center py-4 text-gray-500">No data available.</div>
        )}
      </div>

      {/* Service Distribution Chart */}
      {qmsReport && getServiceDistribution(qmsReport) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            QMS Service Distribution
          </h3>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-h-[500px]">
              <Pie 
                data={getServiceDistribution(qmsReport)}
                options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                      position: 'right',
                      align: 'start',
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
      )}

      {/* Rating Distribution Chart */}
      {qmsReport && getRatingDistribution(qmsReport) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            QMS Rating Distribution
          </h3>
          <div className="h-[400px]">
            <Bar 
              data={getRatingDistribution(qmsReport)}
              options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                    display: false
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
      )}
      </div>
  );
} 