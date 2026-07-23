import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, type AllAnalyticsData } from '../../services/analytics.service';
import { SvgBarChart, SvgLineChart, SvgPieChart } from './SvgCharts';
import {
  TrendingUp,
  FileText,
  Clock,
  Briefcase,
  Download,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Users,
  ShieldAlert
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [data, setData] = useState<AllAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'LAST_YEAR' | 'CUSTOM'>('THIS_MONTH');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Setup default date ranges based on filter type selection
  const setDatesFromPreset = (preset: typeof filterType) => {
    const today = new Date();
    let start = '';
    let end = '';

    if (preset === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    } else if (preset === 'LAST_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    } else if (preset === 'THIS_YEAR') {
      start = `${today.getFullYear()}-01-01`;
      end = `${today.getFullYear()}-12-31`;
    } else if (preset === 'LAST_YEAR') {
      start = `${today.getFullYear() - 1}-01-01`;
      end = `${today.getFullYear() - 1}-12-31`;
    }

    if (start && end) {
      setStartDate(start);
      setEndDate(end);
    }
  };

  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const loadData = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await analyticsService.getAllAnalytics(start, end);
      setData(response);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load statistical datasets.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize dates
  useEffect(() => {
    if (filterType !== 'CUSTOM') {
      setDatesFromPreset(filterType);
    }
  }, [filterType]);

  // Load analytics when dates are set
  useEffect(() => {
    if (startDate && endDate) {
      loadData(startDate, endDate);
    }
  }, [startDate, endDate]);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const blob = await analyticsService.exportPdf(startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `forensys_analytics_report_${startDate}_to_${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export PDF report.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const blob = await analyticsService.exportCsv(startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `forensys_analytics_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Statistical Analysis & Diagnostics</h1>
            <p className="text-xs text-gray-500">Comprehensive dashboard of caseloads, turnaround logs, and department workloads.</p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData(startDate, endDate)}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-250 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportPdf}
            disabled={loading || isExporting || !data}
            className="flex items-center px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>

          <button
            onClick={handleExportCsv}
            disabled={loading || isExporting || !data}
            className="flex items-center px-3.5 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 disabled:opacity-50 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filter Options Control Panel */}
      <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {(['THIS_MONTH', 'LAST_MONTH', 'THIS_YEAR', 'LAST_YEAR', 'CUSTOM'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setFilterType(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === preset
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {preset.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setFilterType('CUSTOM');
                setStartDate(e.target.value);
              }}
              className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-700 focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setFilterType('CUSTOM');
                setEndDate(e.target.value);
              }}
              className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-700 focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm flex items-center rounded-r-xl">
          <AlertTriangle className="w-5 h-5 mr-3 text-rose-500 flex-shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            onClick={() => loadData(startDate, endDate)}
            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 rounded-md text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-150">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
          <p className="text-xs text-gray-500 font-medium">Aggregating departmental databases...</p>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-150 text-gray-400 text-sm font-medium">
          No statistical charts to display.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Cases */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Registered Cases</span>
                <span className="block text-xl font-bold text-gray-900 mt-0.5">{data.summary.totalCases}</span>
                <span className="text-[10px] text-gray-400">
                  {data.summary.totalClinicalCases} Clin | {data.summary.totalPostmortemCases} PM
                </span>
              </div>
            </div>

            {/* Turnaround Time */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mr-4">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Average Turnaround</span>
                <span className="block text-xl font-bold text-gray-900 mt-0.5">
                  {data.summary.averageReportTurnaroundTime > 0
                    ? `${data.summary.averageReportTurnaroundTime.toFixed(1)} Days`
                    : 'N/A'}
                </span>
                <span className="text-[10px] text-gray-400">
                  Exam to report publication
                </span>
              </div>
            </div>

            {/* Pending Reports */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mr-4">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Pending Draft Reports</span>
                <span className="block text-xl font-bold text-gray-900 mt-0.5">{data.summary.pendingReports}</span>
                <span className="text-[10px] text-gray-400">
                  Active drafts under edit
                </span>
              </div>
            </div>

            {/* Active Officers */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs flex items-center">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mr-4">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Active JMOs / Pathologists</span>
                <span className="block text-xl font-bold text-gray-900 mt-0.5">{data.summary.activeMedicalOfficers}</span>
                <span className="text-[10px] text-gray-400">
                  Assigned in filtered period
                </span>
              </div>
            </div>
          </div>

          {/* Charts Row 1: Volume and Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Volume */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Monthly Case Registration Volume</h3>
                <p className="text-[10px] text-gray-400">Total case admissions grouped by Month and Case Category</p>
              </div>
              <div className="h-56 flex items-end">
                <SvgBarChart
                  data={data.monthlyVolume}
                  xKey="month"
                  yKeys={['clinical', 'postmortem']}
                  colors={['#3b82f6', '#8b5cf6']}
                  stacked={true}
                />
              </div>
              <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                  <span>Clinical (MLEF)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-sm" />
                  <span>Postmortem (PMR)</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Case Category Distribution</h3>
                <p className="text-[10px] text-gray-400">Share of report template classifications generated</p>
              </div>
              <div className="py-4">
                <SvgPieChart
                  data={data.categoryBreakdown}
                  colors={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']}
                />
              </div>
            </div>
          </div>

          {/* Charts Row 2: Statuses and Turnaround Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Turnaround Time Trend */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Turnaround Time Trends</h3>
                <p className="text-[10px] text-gray-400">Monthly averages (days from exam to report signature)</p>
              </div>
              <div className="h-56 flex items-end">
                <SvgLineChart
                  data={data.turnaroundMetrics.monthlyAverages}
                  xKey="month"
                  yKeys={['averageDays']}
                  colors={['#10b981']}
                  area={true}
                />
              </div>
            </div>

            {/* Report Status Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Report Lifecycle Status Distribution</h3>
                <p className="text-[10px] text-gray-400">Volume status share of forensic report records</p>
              </div>
              <div className="h-56 flex items-end">
                <SvgBarChart
                  data={data.statusBreakdown.map((item) => ({
                    ...item,
                    displayStatus: item.status.replace('_', ' ')
                  }))}
                  xKey="displayStatus"
                  yKeys={['count']}
                  colors={['#3b82f6']}
                />
              </div>
            </div>
          </div>

          {/* Medical Officer Workload Section (ADMIN ONLY) */}
          {isAdmin ? (
            <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Medical Officer Performance & Caseload</h3>
                  <p className="text-[10px] text-gray-400">Administrative workloads and average report turnaround benchmarks per JMO/Pathologist</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Admin Confidential
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Medical Officer</th>
                      <th className="px-6 py-4 text-center">Assigned Cases</th>
                      <th className="px-6 py-4 text-center">Draft/Pending</th>
                      <th className="px-6 py-4 text-center">Completed Reports</th>
                      <th className="px-6 py-4 text-center">Avg Turnaround Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.officerWorkload.map((officer) => (
                      <tr key={officer.officerId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{officer.officerName}</td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-700">{officer.totalCases}</td>
                        <td className="px-6 py-4 text-center font-semibold text-amber-600">{officer.pendingReports}</td>
                        <td className="px-6 py-4 text-center font-semibold text-emerald-600">{officer.completedReports}</td>
                        <td className="px-6 py-4 text-center font-bold text-gray-900">
                          {officer.averageTurnaroundDays > 0
                            ? `${officer.averageTurnaroundDays.toFixed(1)} Days`
                            : '0.0 Days'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center text-slate-600 text-xs">
              <ShieldAlert className="w-4 h-4 mr-2 text-slate-500" />
              <span>Some clinical workload metrics are hidden according to role-based access rules. Contact an administrator for full department reviews.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
