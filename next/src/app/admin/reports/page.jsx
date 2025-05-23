"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const FormType = {
  CSM: 'csm',
  QMS: 'qms'
};

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

export default function ReportsPage() {
  const [qmsReport, setQmsReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOffice, setExpandedOffice] = useState(null);
  const [selectedFormType, setSelectedFormType] = useState(FormType.QMS);

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QMS Ratings Report</h1>
            <p className="text-gray-500 mt-1">View the overall summary and breakdown by office and service.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              {[FormType.CSM, FormType.QMS].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFormType(type)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedFormType === type
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {selectedFormType === FormType.QMS ? (
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
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl shadow p-8 mb-8 min-h-[200px] flex items-center justify-center text-gray-400">
            <span>CSM report coming soon.</span>
          </div>
        )}
        <div className="bg-white border border-gray-100 rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px]">
          <span className="text-gray-400 text-2xl mb-2">📄</span>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Reports Coming Soon</h2>
          <p className="text-gray-500 text-center">This section will allow you to generate, download, and view detailed reports. Stay tuned!</p>
        </div>
      </div>
    </div>
  );
} 