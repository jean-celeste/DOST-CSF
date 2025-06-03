import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  'unsatisfactory',
  'poor',
];

function isQmsSummaryEmpty(summary) {
  if (!summary) return true;
  // Check if all values for all ratings and questions are zero
  return [
    'overall', 'appropriateness', 'timeliness', 'attitude', 'gender_fair_treatment', 'beneficial'
  ].every(q =>
    ['outstanding', 'very_satisfactory', 'satisfactory', 'unsatisfactory', 'poor'].every(rating =>
      Number(summary[`${q}_${rating}`] || 0) === 0
    )
  );
}

function renderQmsTable(reportData, labelPrefix = '') {
  if (!reportData) return null;
  return (
    <table className="min-w-full border text-sm mb-6">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 border">{labelPrefix ? labelPrefix : 'Question'}</th>
          <th className="px-4 py-2 border">Outstanding</th>
          <th className="px-4 py-2 border">Very Satisfactory</th>
          <th className="px-4 py-2 border">Satisfactory</th>
          <th className="px-4 py-2 border">Unsatisfactory</th>
          <th className="px-4 py-2 border">Poor</th>
        </tr>
      </thead>
      <tbody>
        {qmsQuestions.map(q => (
          <tr key={q.key}>
            <td className="px-4 py-2 border font-medium">{q.label}</td>
            {ratingKeys.map(rating => (
              <td className="px-4 py-2 border" key={rating}>
                {reportData[`${q.key}_${rating}`] ?? 0}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function QmsReport() {
  const [qmsReport, setQmsReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOffice, setExpandedOffice] = useState(null);

  // Excel export state
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

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

  const handleAccordion = (officeId) => {
    setExpandedOffice(prev => (prev === officeId ? null : officeId));
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/reports/qms')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQmsReport(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch report');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch report');
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Excel Export Button */}
      <div className="flex justify-end mb-2">
        <Button
          onClick={handleExportExcel}
          variant="outline"
          className="h-10 px-4 border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2"
          disabled={downloadingExcel}
        >
          {downloadingExcel ? (
            <span className="flex items-center"><span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500 mr-2"></span>Exporting...</span>
          ) : (
            <><Download size={18} /> Export Excel</>
          )}
        </Button>
      </div>
      {downloadError && (
        <div className="text-center text-red-500 mb-2">Failed to download Excel report. Please try again.</div>
      )}
      {/* Summary Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">QMS Checkmark Summary</h2>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : qmsReport && !isQmsSummaryEmpty(qmsReport.overall) ? (
          renderQmsTable(qmsReport.overall)
        ) : (
          <div className="text-center py-4 text-gray-500">No data available.</div>
        )}
      </div>
      {/* Breakdown Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Breakdown by Checkmark Question</h2>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : qmsReport && qmsReport.byOffice && qmsReport.byOffice.length > 0 ? (
          qmsReport.byOffice.map(office => (
            <div
              key={office.office_id}
              className="mb-6 rounded-xl shadow border border-gray-200 bg-white overflow-hidden transition-all duration-300"
            >
              <button
                className={`w-full flex items-center justify-between px-6 py-4 cursor-pointer transition-colors duration-200 hover:bg-blue-50 focus:outline-none ${expandedOffice === office.office_id ? 'bg-blue-50' : ''}`}
                onClick={() => handleAccordion(office.office_id)}
                aria-expanded={expandedOffice === office.office_id}
                aria-controls={`office-panel-${office.office_id}`}
              >
                <span className="text-lg font-semibold text-gray-800">{office.office_name}</span>
                <span className="ml-2">
                  {expandedOffice === office.office_id ? (
                    <ChevronDown className="w-5 h-5 text-blue-600 transition-transform duration-300" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                  )}
                </span>
              </button>
              <div
                id={`office-panel-${office.office_id}`}
                style={{
                  maxHeight: expandedOffice === office.office_id ? 2000 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div className="px-6 pb-6 pt-2">
                  {renderQmsTable(office)}
                  {office.services && office.services.length > 0 && (
                    <div className="pl-4 border-l-2 border-blue-100 mt-2">
                      {office.services.map(service => (
                        <div key={service.service_id} className="mb-6">
                          <h4 className="text-lg font-bold text-blue-800 mb-3 pl-1 border-l-4 border-blue-400 bg-blue-50">{service.service_name}</h4>
                          {renderQmsTable(service, 'Question')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No data available.</div>
        )}
      </div>
    </>
  );
} 