import { useState, useEffect } from 'react';
import { csmArtaOptions } from '@/lib/options/csm-arta-options';
import sqdLabels from '@/lib/constants/sqdLabels';

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
  const [sqdData, setSqdData] = useState([]);
  const [sqdLoading, setSqdLoading] = useState(true);
  const [sqdError, setSqdError] = useState(null);
  const [sqdPositive, setSqdPositive] = useState([]);
  const [sqdPositiveLoading, setSqdPositiveLoading] = useState(true);
  const [sqdPositiveError, setSqdPositiveError] = useState(null);
  const [byService, setByService] = useState([]);
  const [byServiceLoading, setByServiceLoading] = useState(true);
  const [byServiceError, setByServiceError] = useState(null);

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

  useEffect(() => {
    setSqdLoading(true);
    fetch('/api/admin/csm-sqd-breakdown')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSqdData(data.data);
          setSqdError(null);
        } else {
          setSqdError(data.error || 'Failed to fetch SQD breakdown');
        }
        setSqdLoading(false);
      })
      .catch(() => {
        setSqdError('Failed to fetch SQD breakdown');
        setSqdLoading(false);
      });
  }, []);

  useEffect(() => {
    setSqdPositiveLoading(true);
    fetch('/api/admin/csm-sqd-positive')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSqdPositive(data.data);
          setSqdPositiveError(null);
        } else {
          setSqdPositiveError(data.error || 'Failed to fetch SQD positive percentages');
        }
        setSqdPositiveLoading(false);
      })
      .catch(() => {
        setSqdPositiveError('Failed to fetch SQD positive percentages');
        setSqdPositiveLoading(false);
      });
  }, []);

  useEffect(() => {
    setByServiceLoading(true);
    fetch('/api/admin/reports/csm/by-service')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setByService(data.data);
          setByServiceError(null);
        } else {
          setByServiceError(data.error || 'Failed to fetch CSM ratings by service');
        }
        setByServiceLoading(false);
      })
      .catch(() => {
        setByServiceError('Failed to fetch CSM ratings by service');
        setByServiceLoading(false);
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
          {/* SQD Tables in one card */}
          <div className="bg-white border border-gray-100 rounded-xl shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Service Quality Dimensions (SQD)</h3>
            {/* SQD Overall Table (SQD0) */}
            <h4 className="text-base font-semibold mb-2 text-gray-700">SQD Overall</h4>
            {sqdLoading || sqdPositiveLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : sqdError || sqdPositiveError ? (
              <div className="text-center py-4 text-red-500">{sqdError || sqdPositiveError}</div>
            ) : (
              <>
                <table className="min-w-full w-full text-[15px] table-fixed mb-4" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border font-bold">Service Quality Dimensions</th>
                      <th className="px-4 py-2 border font-bold text-center">SA</th>
                      <th className="px-4 py-2 border font-bold text-center">A</th>
                      <th className="px-4 py-2 border font-bold text-center">N</th>
                      <th className="px-4 py-2 border font-bold text-center">D</th>
                      <th className="px-4 py-2 border font-bold text-center">SD</th>
                      <th className="px-4 py-2 border font-bold text-center">NR</th>
                      <th className="px-4 py-2 border font-bold text-center">Total</th>
                      <th className="px-4 py-2 border font-bold text-center">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sqdData.length > 0 && sqdPositive.length > 0 && (
                      <tr className="font-bold">
                        <td className="px-4 py-2 border">{sqdLabels[0]}</td>
                        <td className="px-4 py-2 border text-center">{sqdData[0]?.strongly_agree || 0}</td>
                        <td className="px-4 py-2 border text-center">{sqdData[0]?.agree || 0}</td>
                        <td className="px-4 py-2 border text-center">{sqdData[0]?.neutral || 0}</td>
                        <td className="px-4 py-2 border text-center">{sqdData[0]?.disagree || 0}</td>
                        <td className="px-4 py-2 border text-center">{sqdData[0]?.strongly_disagree || 0}</td>
                        <td className="px-4 py-2 border text-center">{sqdData[0]?.na || 0}</td>
                        <td className="px-4 py-2 border text-center">{sqdData[0]?.total_responses || 0}</td>
                        <td className="px-4 py-2 border text-center">{sqdPositive[0]?.percentage_positive ? Number(sqdPositive[0].percentage_positive).toFixed(2) + '%' : '0.00%'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* SQD1-8 Table */}
                <h4 className="text-base font-semibold mb-2 text-gray-700 mt-6">SQD By Dimension</h4>
                <table className="min-w-full w-full text-[15px] table-fixed" style={{ tableLayout: 'fixed' }}>
                  <colgroup>
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '10%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border font-bold">Service Quality Dimensions</th>
                      <th className="px-4 py-2 border font-bold text-center">SA</th>
                      <th className="px-4 py-2 border font-bold text-center">A</th>
                      <th className="px-4 py-2 border font-bold text-center">N</th>
                      <th className="px-4 py-2 border font-bold text-center">D</th>
                      <th className="px-4 py-2 border font-bold text-center">SD</th>
                      <th className="px-4 py-2 border font-bold text-center">NR</th>
                      <th className="px-4 py-2 border font-bold text-center">Total</th>
                      <th className="px-4 py-2 border font-bold text-center">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sqdData.slice(1, 9).map((row, idx) => {
                      const positiveRow = sqdPositive.find(p => Number(p.question_id) === Number(row.sqd_id));
                      return (
                        <tr key={row.sqd_id}>
                          <td className="px-4 py-2 border">{sqdLabels[idx + 1]}</td>
                          <td className="px-4 py-2 border text-center">{row.strongly_agree}</td>
                          <td className="px-4 py-2 border text-center">{row.agree}</td>
                          <td className="px-4 py-2 border text-center">{row.neutral}</td>
                          <td className="px-4 py-2 border text-center">{row.disagree}</td>
                          <td className="px-4 py-2 border text-center">{row.strongly_disagree}</td>
                          <td className="px-4 py-2 border text-center">{row.na}</td>
                          <td className="px-4 py-2 border text-center">{row.total_responses}</td>
                          <td className="px-4 py-2 border text-center">{positiveRow ? Number(positiveRow.percentage_positive).toFixed(2) + '%' : '0.00%'}</td>
                        </tr>
                      );
                    })}
                    {/* Overall row */}
                    {sqdData.length > 8 && sqdPositive.length > 8 && (() => {
                      // Sum each column for SQD1-8
                      const sum = (key) => sqdData.slice(1, 9).reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
                      const overallPositive = sqdPositive.slice(1, 9).reduce((acc, row) => acc + (Number(row.positive_count) || 0), 0);
                      const overallValid = sqdPositive.slice(1, 9).reduce((acc, row) => acc + (Number(row.valid_count) || 0), 0);
                      const overallPercent = overallValid > 0 ? (overallPositive / overallValid * 100).toFixed(2) + '%' : '0.00%';
                      return (
                        <tr className="font-bold">
                          <td className="px-4 py-2 border">Overall</td>
                          <td className="px-4 py-2 border text-center">{sum('strongly_agree')}</td>
                          <td className="px-4 py-2 border text-center">{sum('agree')}</td>
                          <td className="px-4 py-2 border text-center">{sum('neutral')}</td>
                          <td className="px-4 py-2 border text-center">{sum('disagree')}</td>
                          <td className="px-4 py-2 border text-center">{sum('strongly_disagree')}</td>
                          <td className="px-4 py-2 border text-center">{sum('na')}</td>
                          <td className="px-4 py-2 border text-center">{sum('total_responses')}</td>
                          <td className="px-4 py-2 border text-center">{overallPercent}</td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </>
            )}
          </div>
          {/* CSM Ratings by Service */}
          <div className="bg-white border border-gray-100 rounded-xl shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">CSM Ratings by Service</h3>
            {byServiceLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : byServiceError ? (
              <div className="text-center py-4 text-red-500">{byServiceError}</div>
            ) : (
              (() => {
                // Group services by office
                const offices = {};
                byService.forEach(svc => {
                  if (!offices[svc.office_id]) {
                    offices[svc.office_id] = {
                      office_name: svc.office_name,
                      services: []
                    };
                  }
                  offices[svc.office_id].services.push(svc);
                });
                return Object.values(offices).map((office, oIdx) => (
                  <div key={oIdx} className="mb-8">
                    <h4 className="text-base font-semibold mb-2 text-blue-700">{office.office_name}</h4>
                    {office.services.map((svc, sIdx) => (
                      <div key={svc.service_id} className="mb-6">
                        <div className="font-medium text-gray-800 mb-1">{svc.service_name}</div>
                        <table className="min-w-full w-full text-[15px] table-fixed mb-2" style={{ tableLayout: 'fixed' }}>
                          <colgroup>
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '10%' }} />
                          </colgroup>
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 border font-bold">Service Quality Dimension</th>
                              <th className="px-4 py-2 border font-bold text-center">SA</th>
                              <th className="px-4 py-2 border font-bold text-center">A</th>
                              <th className="px-4 py-2 border font-bold text-center">N</th>
                              <th className="px-4 py-2 border font-bold text-center">D</th>
                              <th className="px-4 py-2 border font-bold text-center">SD</th>
                              <th className="px-4 py-2 border font-bold text-center">NR</th>
                              <th className="px-4 py-2 border font-bold text-center">Total</th>
                              <th className="px-4 py-2 border font-bold text-center">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sqdLabels.slice(1, 9).map((label, idx) => {
                              const qid = idx + 4;
                              const r = svc.ratings[qid] || {};
                              const valid = (r.total_responses || 0) - (r.na || 0);
                              const positive = (r.strongly_agree || 0) + (r.agree || 0);
                              const overall = valid > 0 ? ((positive / valid) * 100).toFixed(2) + '%' : '0.00%';
                              return (
                                <tr key={qid}>
                                  <td className="px-4 py-2 border">{label}</td>
                                  <td className="px-4 py-2 border text-center">{r.strongly_agree || 0}</td>
                                  <td className="px-4 py-2 border text-center">{r.agree || 0}</td>
                                  <td className="px-4 py-2 border text-center">{r.neutral || 0}</td>
                                  <td className="px-4 py-2 border text-center">{r.disagree || 0}</td>
                                  <td className="px-4 py-2 border text-center">{r.strongly_disagree || 0}</td>
                                  <td className="px-4 py-2 border text-center">{r.na || 0}</td>
                                  <td className="px-4 py-2 border text-center">{r.total_responses || 0}</td>
                                  <td className="px-4 py-2 border text-center">{overall}</td>
                                </tr>
                              );
                            })}
                            {/* Summary row for the service */}
                            {(() => {
                              const sum = key => sqdLabels.slice(1, 9).reduce((acc, _, idx) => {
                                const qid = idx + 4;
                                return acc + (svc.ratings[qid]?.[key] || 0);
                              }, 0);
                              const totalSA = sum('strongly_agree');
                              const totalA = sum('agree');
                              const totalN = sum('neutral');
                              const totalD = sum('disagree');
                              const totalSD = sum('strongly_disagree');
                              const totalNR = sum('na');
                              const totalTotal = sum('total_responses');
                              const valid = totalTotal - totalNR;
                              const positive = totalSA + totalA;
                              const overall = valid > 0 ? ((positive / valid) * 100).toFixed(2) + '%' : '0.00%';
                              return (
                                <tr className="font-bold">
                                  <td className="px-4 py-2 border">Overall</td>
                                  <td className="px-4 py-2 border text-center">{totalSA}</td>
                                  <td className="px-4 py-2 border text-center">{totalA}</td>
                                  <td className="px-4 py-2 border text-center">{totalN}</td>
                                  <td className="px-4 py-2 border text-center">{totalD}</td>
                                  <td className="px-4 py-2 border text-center">{totalSD}</td>
                                  <td className="px-4 py-2 border text-center">{totalNR}</td>
                                  <td className="px-4 py-2 border text-center">{totalTotal}</td>
                                  <td className="px-4 py-2 border text-center">{overall}</td>
                                </tr>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                ));
              })()
            )}
          </div>
        </>
      ) : null}
    </div>
  );
} 