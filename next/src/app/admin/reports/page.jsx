"use client";

import { useState, useEffect } from 'react';

const FormType = {
  CSM: 'csm',
  QMS: 'qms'
};

const QMSReportTabs = {
  OVERALL: 'overall',
  BY_OFFICE: 'byOffice',
  BY_PROCESS: 'byProcess',
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
  const [timeRange, setTimeRange] = useState('month');
  const [selectedFormType, setSelectedFormType] = useState(FormType.CSM);
  const [qmsReport, setQmsReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qmsTab, setQmsTab] = useState(QMSReportTabs.OVERALL);

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
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 mt-1">Generate and view various administrative reports here.</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
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
          <div className="bg-white border border-gray-100 rounded-xl shadow p-8 mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">QMS Ratings Report</h2>
            <div className="mb-4 flex gap-2">
              {Object.values(QMSReportTabs).map(tab => (
                <button
                  key={tab}
                  onClick={() => setQmsTab(tab)}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    qmsTab === tab
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {tab === QMSReportTabs.OVERALL && 'Regionwide'}
                  {tab === QMSReportTabs.BY_OFFICE && 'By Office'}
                  {tab === QMSReportTabs.BY_PROCESS && 'By Process (Regional Office)'}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : qmsReport ? (
                <>
                  {qmsTab === QMSReportTabs.OVERALL && (
                    renderQmsTable(qmsReport.overall)
                  )}
                  {qmsTab === QMSReportTabs.BY_OFFICE && (
                    <>
                      {qmsReport.byOffice && qmsReport.byOffice.length > 0 ? (
                        qmsReport.byOffice.map(office => (
                          <div key={office.office_id} className="mb-8">
                            <h3 className="font-semibold text-gray-700 mb-2">{office.office_name}</h3>
                            {renderQmsTable(office)}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No data by office.</div>
                      )}
                    </>
                  )}
                  {qmsTab === QMSReportTabs.BY_PROCESS && (
                    <>
                      {qmsReport.byProcess && qmsReport.byProcess.length > 0 ? (
                        qmsReport.byProcess.map(unit => (
                          <div key={unit.unit_id} className="mb-8">
                            <h3 className="font-semibold text-gray-700 mb-2">{unit.unit_name}</h3>
                            {renderQmsTable(unit)}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">No data by process.</div>
                      )}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
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