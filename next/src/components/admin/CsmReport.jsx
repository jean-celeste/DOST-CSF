import { useState, useEffect } from 'react';
import { csmArtaOptions } from '@/lib/options/csm-arta-options';

const checkmarkQuestions = [
  {
    id: 1,
    label: "CC1. Awareness of Citizen's Charter (CC)",
    options: csmArtaOptions.ccAwareness
  },
  {
    id: 2,
    label: "CC2. Visibility of Citizen's Charter (CC)",
    options: csmArtaOptions.ccVisibility
  },
  {
    id: 3,
    label: "CC3. Helpfulness of Citizen's Charter (CC)",
    options: csmArtaOptions.ccHelpfulness
  }
];

export default function CsmReport() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/reports/csm')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSummary(data.data);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch CSM report');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch CSM report');
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">CSM Checkmark Summary</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : summary ? (
        <>
          {/* Summary Table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Summary</h3>
            <table className="min-w-full border text-sm mb-6" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '60%' }} />
                <col style={{ width: '40%' }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Citizen's Charter Answers</th>
                  <th className="px-4 py-2 border">Score (%)</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Calculate scores
                  const getTotal = (id) => {
                    if (!summary[id]) return 0;
                    return summary[id].reduce((acc, row) => acc + Number(row.count), 0);
                  };
                  const getCount = (id, optionIndexes) => {
                    if (!summary[id]) return 0;
                    return summary[id]
                      .filter((row, idx) => optionIndexes.includes(
                        checkmarkQuestions.find(q => q.id === id).options.indexOf(row.answer)
                      ))
                      .reduce((acc, row) => acc + Number(row.count), 0);
                  };
                  // Awareness: sum of first 3 options
                  const awarenessTotal = getTotal(1);
                  const awarenessScore = awarenessTotal ? (getCount(1, [0,1,2]) / awarenessTotal) * 100 : 0;
                  // Visibility: sum of first 2 options
                  const visibilityTotal = getTotal(2);
                  const visibilityScore = visibilityTotal ? (getCount(2, [0,1]) / visibilityTotal) * 100 : 0;
                  // Helpfulness: sum of first 2 options
                  const helpfulnessTotal = getTotal(3);
                  const helpfulnessScore = helpfulnessTotal ? (getCount(3, [0,1]) / helpfulnessTotal) * 100 : 0;
                  return (
                    <>
                      <tr>
                        <td className="px-4 py-2 border">CC Awareness</td>
                        <td className="px-4 py-2 border text-center">{awarenessScore.toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border">CC Visibility</td>
                        <td className="px-4 py-2 border text-center">{visibilityScore.toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border">CC Helpfulness</td>
                        <td className="px-4 py-2 border text-center">{helpfulnessScore.toFixed(1)}</td>
                      </tr>
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>
          {/* Breakdown Tables in one card */}
          <div className="bg-white border border-gray-100 rounded-xl shadow p-6 mb-8">
            {checkmarkQuestions.map((q, qIdx) => {
              // Map option to count (0 if not present)
              const counts = {};
              if (summary[q.id]) {
                summary[q.id].forEach(row => {
                  counts[row.answer] = Number(row.count);
                });
              }
              const total = Object.values(counts).reduce((acc, val) => acc + val, 0);
              return (
                <table key={q.id} className={`min-w-full w-full text-[15px] table-fixed ${qIdx < checkmarkQuestions.length - 1 ? 'mb-8' : ''}`}
                  style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '60%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '20%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border font-bold">Citizen's Charter Answers</th>
                      <th className="px-4 py-2 border font-bold text-center">Responses</th>
                      <th className="px-4 py-2 border font-bold text-center">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border font-bold" colSpan={3}>{q.label}</td>
                    </tr>
                    {q.options.map((option, idx) => {
                      const count = counts[option] || 0;
                      const percent = total ? ((count / total) * 100).toFixed(2) : '0.00';
                      return (
                        <tr key={idx}>
                          <td className="px-4 py-2 border">{idx + 1}. {option}</td>
                          <td className="px-4 py-2 border text-center">{count}</td>
                          <td className="px-4 py-2 border text-center">{percent}%</td>
                        </tr>
                      );
                    })}
                    {/* Total row */}
                    <tr>
                      <td className="px-4 py-2 border font-bold">Total</td>
                      <td className="px-4 py-2 border font-bold text-center">{total}</td>
                      <td className="px-4 py-2 border font-bold text-center">{total > 0 ? '100.00%' : '0.00%'}</td>
                    </tr>
                  </tbody>
                </table>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
} 