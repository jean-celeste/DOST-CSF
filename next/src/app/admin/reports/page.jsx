"use client";

import { useState, useEffect } from 'react';

const FormType = {
  CSM: 'csm',
  QMS: 'qms'
};

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedFormType, setSelectedFormType] = useState(FormType.CSM);
  const [qmsReport, setQmsReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Question</th>
                    <th className="px-4 py-2 border">Outstanding</th>
                    <th className="px-4 py-2 border">Very Satisfactory</th>
                    <th className="px-4 py-2 border">Satisfactory</th>
                    <th className="px-4 py-2 border">Unsatisfactory</th>
                    <th className="px-4 py-2 border">Poor</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={6} className="text-center py-4 text-red-500">{error}</td></tr>
                  ) : qmsReport ? (
                    <>
                      <tr>
                        <td className="px-4 py-2 border font-medium">Over-All Satisfaction</td>
                        <td className="px-4 py-2 border">{qmsReport.overall_outstanding}</td>
                        <td className="px-4 py-2 border">{qmsReport.overall_very_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.overall_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.overall_unsatisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.overall_poor}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border font-medium">Appropriateness of the service/activity</td>
                        <td className="px-4 py-2 border">{qmsReport.appropriateness_outstanding}</td>
                        <td className="px-4 py-2 border">{qmsReport.appropriateness_very_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.appropriateness_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.appropriateness_unsatisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.appropriateness_poor}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border font-medium">Timeliness of delivery</td>
                        <td className="px-4 py-2 border">{qmsReport.timeliness_outstanding}</td>
                        <td className="px-4 py-2 border">{qmsReport.timeliness_very_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.timeliness_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.timeliness_unsatisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.timeliness_poor}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border font-medium">Attitude of Staff</td>
                        <td className="px-4 py-2 border">{qmsReport.attitude_outstanding}</td>
                        <td className="px-4 py-2 border">{qmsReport.attitude_very_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.attitude_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.attitude_unsatisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.attitude_poor}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border font-medium">Gender fair treatment</td>
                        <td className="px-4 py-2 border">{qmsReport.gender_fair_treatment_outstanding}</td>
                        <td className="px-4 py-2 border">{qmsReport.gender_fair_treatment_very_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.gender_fair_treatment_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.gender_fair_treatment_unsatisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.gender_fair_treatment_poor}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border font-medium">How beneficial is the service/activity</td>
                        <td className="px-4 py-2 border">{qmsReport.beneficial_outstanding}</td>
                        <td className="px-4 py-2 border">{qmsReport.beneficial_very_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.beneficial_satisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.beneficial_unsatisfactory}</td>
                        <td className="px-4 py-2 border">{qmsReport.beneficial_poor}</td>
                      </tr>
                    </>
                  ) : null}
                </tbody>
              </table>
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