"use client";

import { useState } from 'react';
import QmsReport from '@/components/admin/QmsReport';
import CsmReport from '@/components/admin/CsmReport';

const FormType = {
  CSM: 'csm',
  QMS: 'qms'
};

export default function ReportsPage() {
  const [selectedFormType, setSelectedFormType] = useState(FormType.CSM);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
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
                  className={`px-4 py-2 rounded-md transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                    selectedFormType === type
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-blue-100'
                  }`}
                  aria-pressed={selectedFormType === type}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow h-64" />
            ))}
          </div>
        ) : (
          <>
            {selectedFormType === FormType.QMS ? (
              <QmsReport />
            ) : (
              <CsmReport />
            )}
            <div className="bg-white border border-gray-100 rounded-xl shadow p-8 flex flex-col items-center justify-center min-h-[300px] mt-8">
              <span className="text-gray-400 text-4xl mb-2">📄</span>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Reports Coming Soon</h2>
              <p className="text-gray-500 text-center">This section will allow you to generate, download, and view detailed reports. Stay tuned!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 