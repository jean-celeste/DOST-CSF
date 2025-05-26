import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
      <div className="bg-white border border-gray-100 rounded-xl shadow p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Regionwide Summary</h2>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : qmsReport ? (
            renderQmsTable(qmsReport.overall)
          ) : null}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Breakdown by Office and Service</h2>
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
                          <h4 className="font-medium text-blue-700 mb-1">{service.service_name}</h4>
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
          <div className="text-gray-500">No data by office.</div>
        )}
      </div>
    </>
  );
} 