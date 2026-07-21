import React, { useEffect, useState } from 'react';
import { reportService, type StatisticalReportDto } from '../../../services/report.service';
import { exportStatisticalReportPdf } from '../pdfGenerator';
import { BarChart3, Download, Loader2, PieChart, RefreshCw, Users } from 'lucide-react';

export const StatisticalReportView: React.FC = () => {
  const [data, setData] = useState<StatisticalReportDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await reportService.getStatisticalReport();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch statistical report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Departmental Statistical & Analytical Summary</h2>
            <p className="text-xs text-gray-500">Epidemiological breakdown of demographics, bodily harm categories, substance involvement, and caseload types.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => data && exportStatisticalReportPdf(data)}
            disabled={!data}
            className="flex items-center px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 disabled:opacity-50 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Statistics PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
        </div>
      ) : !data ? (
        <div className="text-center py-12 text-gray-400 text-sm">Failed to load statistical datasets.</div>
      ) : (
        <div className="space-y-6">
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Case Type Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                Case Category Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(data.caseTypeBreakdown || {}).map(([type, count]) => {
                  const pct = data.totalCases > 0 ? Math.round((count / data.totalCases) * 100) : 0;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{type}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${type.includes('Clinical') ? 'bg-blue-600' : 'bg-purple-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                <Users className="w-4 h-4 mr-2 text-emerald-600" />
                Gender Demographics
              </h3>
              <div className="space-y-3">
                {Object.entries(data.genderDistribution || {}).map(([g, count]) => {
                  const pct = data.totalCases > 0 ? Math.round((count / data.totalCases) * 100) : 0;
                  return (
                    <div key={g} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{g}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center">
                <PieChart className="w-4 h-4 mr-2 text-indigo-600" />
                Age Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(data.ageDistribution || {}).map(([ageGroup, count]) => {
                  const pct = data.totalCases > 0 ? Math.round((count / data.totalCases) * 100) : 0;
                  return (
                    <div key={ageGroup} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-gray-700">
                        <span>{ageGroup}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bodily Harm Frequencies Grid */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-3">
              Nature of Bodily Harm Incidence Frequencies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(data.bodilyHarmFrequencies || {}).map(([harm, count]) => (
                <div key={harm} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-800">{harm}</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    {count} Cases
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Substance / Sobriety Stats */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-3">
              Alcohol & Substance Influence Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {Object.entries(data.substanceStats || {}).map(([sub, count]) => (
                <div key={sub} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-800">{sub}</span>
                  <span className="px-3 py-1 bg-slate-200 text-slate-900 text-xs font-bold rounded-full">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
