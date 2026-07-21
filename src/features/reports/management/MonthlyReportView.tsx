import React, { useEffect, useState } from 'react';
import { reportService, type MonthlyReportDto } from '../../../services/report.service';
import { exportMonthlyReportPdf } from '../pdfGenerator';
import { Calendar, Download, FileText, Loader2, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react';

export const MonthlyReportView: React.FC = () => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [data, setData] = useState<MonthlyReportDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyData = async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await reportService.getMonthlyReport(y, m);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch monthly report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Monthly Performance & Caseload Audit</h2>
            <p className="text-xs text-gray-500">Monthly breakdown of clinical & postmortem reports, officer workloads, and station statistics.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg bg-gray-50"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.name}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg bg-gray-50"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          <button
            onClick={() => fetchMonthlyData(selectedYear, selectedMonth)}
            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => data && exportMonthlyReportPdf(data)}
            disabled={!data}
            className="flex items-center px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Monthly PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Clinical MLEF Reports</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{data?.totalClinical || 0}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Postmortem PMR Reports</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{data?.totalPostmortem || 0}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Finalized Reports</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{data?.totalFinalized || 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Dispatched to Court</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{data?.totalDispatched || 0}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Workload & Station Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doctor Workload Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Medical Officer Workload Audit</h3>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : !data || data.doctorWorkload.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm italic">No doctor workload records for this month.</div>
          ) : (
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Doctor / Pathologist</th>
                  <th className="px-5 py-3">Clinical</th>
                  <th className="px-5 py-3">PM</th>
                  <th className="px-5 py-3 text-right">Total Workload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.doctorWorkload.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-900">{doc.doctorName}</td>
                    <td className="px-5 py-3 text-emerald-700 font-medium">{doc.clinicalCount}</td>
                    <td className="px-5 py-3 text-purple-700 font-medium">{doc.postmortemCount}</td>
                    <td className="px-5 py-3 text-right font-bold text-gray-900">{doc.totalCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Police Station Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Police Station Division Breakdown</h3>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : !data || data.stationDistribution.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm italic">No police station records for this month.</div>
          ) : (
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">Police Station</th>
                  <th className="px-5 py-3 text-right">Report Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.stationDistribution.map((st, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{st.policeStation}</td>
                    <td className="px-5 py-3 text-right font-bold text-blue-600">{st.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
