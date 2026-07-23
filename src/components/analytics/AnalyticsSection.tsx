import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Clock,
  ShieldCheck,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  FileText,
  Activity,
  UserCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getDashboardAnalytics,
  type DashboardAnalyticsData
} from '../../services/analyticsService';

export const AnalyticsSection: React.FC = () => {
  const [preset, setPreset] = useState<string>('this_year');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [showCustomDate, setShowCustomDate] = useState<boolean>(false);

  // Read current user role from localStorage
  const userString = localStorage.getItem('user');
  let isAdmin = false;
  if (userString) {
    try {
      const user = JSON.parse(userString);
      const roles = user.roles || [];
      isAdmin = roles.some((r: any) =>
        (typeof r === 'string' ? r : r.roleName || '').toUpperCase().includes('ADMIN') ||
        (typeof r === 'string' ? r : r.roleName || '').toUpperCase().includes('JMO')
      );
    } catch (e) {
      isAdmin = true; // Fallback to show if parse error
    }
  } else {
    isAdmin = true; // Default fallback for demonstration
  }

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardAnalytics(
        showCustomDate ? 'custom' : preset,
        showCustomDate ? startDate : undefined,
        showCustomDate ? endDate : undefined
      );
      setData(result);
    } catch (err: any) {
      console.error('Failed to load analytics', err);
      setError('Failed to retrieve statistics data. Please verify network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [preset]);

  const handleApplyCustomDate = () => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  };

  const exportPDF = () => {
    if (!data) return;
    setExporting(true);

    try {
      const doc = new jsPDF();
      const nowStr = new Date().toLocaleString();

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FORENSIC MEDICINE DEPARTMENT - STATISTICAL REPORT', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${nowStr} | Filter Preset: ${preset.toUpperCase()}`, 14, 25);

      // Privacy Disclaimer
      doc.setTextColor(220, 38, 38);
      doc.setFontSize(8);
      doc.text('OFFICIAL DEPARTMENT RECORD - AGGREGATED STATISTICAL DATA ONLY (NO PII INCLUDED)', 14, 34);

      // Section 1: KPI Summary Table
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Key Performance Indicators (KPIs)', 14, 43);

      autoTable(doc, {
        startY: 47,
        head: [['Metric', 'Value', 'Description']],
        body: [
          ['Total Forensic Cases Handled', data.kpis.totalCases.toString(), 'Combined Clinical & Postmortem Examinations'],
          ['Clinical Examination Cases', data.kpis.clinicalCasesCount.toString(), 'MLEF & Clinical Medico-Legal Records'],
          ['Postmortem Examination Cases', data.kpis.postmortemCasesCount.toString(), 'PMR Autopsy & Cause of Death Inquests'],
          ['Pending Reports', data.kpis.pendingReportsCount.toString(), 'Reports in Draft or Finalized awaiting dispatch'],
          ['Avg. Turnaround Time', `${data.kpis.avgTurnaroundDays} Days`, 'From Examination Date to Official Dispatch']
        ],
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: 255 }
      });

      // Section 2: Monthly Volume Summary
      const finalY1 = (doc as any).lastAutoTable.finalY || 100;
      doc.text('2. Monthly Case Volume Summary', 14, finalY1 + 10);

      const monthlyRows = data.monthlyVolume.map((item) => [
        item.month,
        item.clinical.toString(),
        item.postmortem.toString(),
        item.total.toString()
      ]);

      autoTable(doc, {
        startY: finalY1 + 14,
        head: [['Month', 'Clinical Cases', 'Postmortem Cases', 'Total Volume']],
        body: monthlyRows,
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85], textColor: 255 }
      });

      // Section 3: Category Breakdown
      const finalY2 = (doc as any).lastAutoTable.finalY || 180;
      doc.text('3. Incident & Examination Category Breakdown', 14, finalY2 + 10);

      const catRows = data.categoryBreakdown.map((cat) => [
        cat.category,
        cat.count.toString(),
        `${cat.percentage}%`
      ]);

      autoTable(doc, {
        startY: finalY2 + 14,
        head: [['Category / Referral Type', 'Case Count', 'Percentage']],
        body: catRows,
        theme: 'striped',
        headStyles: { fillColor: [15, 118, 110], textColor: 255 }
      });

      // Officer Caseload if Admin
      if (data.officerCaseload && data.officerCaseload.length > 0) {
        doc.addPage();
        doc.text('4. Medical Officer Caseload Distribution (Departmental Admin View)', 14, 20);

        const docRows = data.officerCaseload.map((docItem) => [
          docItem.doctorName,
          docItem.clinicalCount.toString(),
          docItem.postmortemCount.toString(),
          docItem.totalCount.toString()
        ]);

        autoTable(doc, {
          startY: 25,
          head: [['Medical Officer', 'Clinical Cases', 'Postmortem Cases', 'Total Caseload']],
          body: docRows,
          theme: 'grid',
          headStyles: { fillColor: [30, 41, 59], textColor: 255 }
        });
      }

      // Footer Note
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Page ${i} of ${pageCount} - Confidential Departmental Document`, 105, 290, { align: 'center' });
      }

      doc.save(`Forensic_Medicine_Statistics_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error('PDF generation error', e);
      alert('Error generating PDF report.');
    } finally {
      setExporting(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    let csv = 'FORENSIC MEDICINE DEPARTMENT - STATISTICAL SUMMARY\n';
    csv += `Export Date,${new Date().toISOString()}\n`;
    csv += `Filter Preset,${preset}\n\n`;

    csv += 'KEY PERFORMANCE INDICATORS\n';
    csv += `Total Cases,${data.kpis.totalCases}\n`;
    csv += `Clinical Cases,${data.kpis.clinicalCasesCount}\n`;
    csv += `Postmortem Cases,${data.kpis.postmortemCasesCount}\n`;
    csv += `Pending Reports,${data.kpis.pendingReportsCount}\n`;
    csv += `Avg Turnaround Days,${data.kpis.avgTurnaroundDays}\n\n`;

    csv += 'MONTHLY CASE VOLUME\n';
    csv += 'Month,Clinical Cases,Postmortem Cases,Total\n';
    data.monthlyVolume.forEach((m) => {
      csv += `"${m.month}",${m.clinical},${m.postmortem},${m.total}\n`;
    });
    csv += '\n';

    csv += 'CATEGORY BREAKDOWN\n';
    csv += 'Category,Count,Percentage\n';
    data.categoryBreakdown.forEach((c) => {
      csv += `"${c.category}",${c.count},${c.percentage}%\n`;
    });
    csv += '\n';

    if (data.officerCaseload && data.officerCaseload.length > 0) {
      csv += 'MEDICAL OFFICER CASELOAD\n';
      csv += 'Doctor Name,Clinical Count,Postmortem Count,Total\n';
      data.officerCaseload.forEach((d) => {
        csv += `"${d.doctorName}",${d.clinicalCount},${d.postmortemCount},${d.totalCount}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Forensic_Medicine_Statistics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxVolume = data ? Math.max(...data.monthlyVolume.map((m) => m.total), 1) : 1;
  const maxOfficerCases = data?.officerCaseload ? Math.max(...data.officerCaseload.map((o) => o.totalCount), 1) : 1;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Department Statistics & Analytics
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> De-Identified Data
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated metrics for case volumes, report turnaround times, and departmental workloads.
          </p>
        </div>

        {/* Action & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Export Buttons */}
          <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-3">
            <button
              onClick={exportPDF}
              disabled={loading || exporting || !data}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              title="Export PDF Summary Report"
            >
              <FileText className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={exportCSV}
              disabled={loading || !data}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Export CSV Dataset"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              CSV
            </button>
          </div>

          {/* Date Filter Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[
              { id: 'this_month', label: 'This Month' },
              { id: 'this_year', label: 'This Year' },
              { id: 'past_6_months', label: 'Past 6 Months' },
              { id: 'custom', label: 'Custom' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'custom') {
                    setShowCustomDate(!showCustomDate);
                  } else {
                    setShowCustomDate(false);
                    setPreset(item.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  (item.id === 'custom' ? showCustomDate : preset === item.id && !showCustomDate)
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Date Selector Drawer */}
      {showCustomDate && (
        <div className="bg-indigo-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-indigo-100 dark:border-slate-700 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            />
          </div>
          <button
            onClick={handleApplyCustomDate}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      ) : data ? (
        <>
          {/* Top KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Total Cases */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Cases Handled</span>
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.kpis.totalCases}</span>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-md">
                    {data.kpis.clinicalCasesCount} Clin
                  </span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-md">
                    {data.kpis.postmortemCasesCount} PM
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Aggregated clinical MLEF and autopsy PM records</p>
            </div>

            {/* KPI 2: Pending Reports */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Reports</span>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {data.kpis.pendingReportsCount}
                </span>
                <span className="text-xs text-slate-500">Drafts / Awaiting Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Requires medical officer finalization</p>
            </div>

            {/* KPI 3: Average Turnaround Time */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg. Report Turnaround</span>
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {data.kpis.avgTurnaroundDays}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Days</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">From examination date to report dispatch date</p>
            </div>

            {/* KPI 4: Clinical / PM Ratio */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Clinical Ratio</span>
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400">
                  <PieChart className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {data.kpis.totalCases > 0
                    ? Math.round((data.kpis.clinicalCasesCount / data.kpis.totalCases) * 100)
                    : 0}%
                </span>
                <span className="text-xs text-slate-500">Clinical Examinations</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden flex">
                <div
                  className="bg-indigo-600 h-full"
                  style={{
                    width: `${
                      data.kpis.totalCases > 0
                        ? (data.kpis.clinicalCasesCount / data.kpis.totalCases) * 100
                        : 50
                    }%`
                  }}
                ></div>
                <div
                  className="bg-amber-500 h-full"
                  style={{
                    width: `${
                      data.kpis.totalCases > 0
                        ? (data.kpis.postmortemCasesCount / data.kpis.totalCases) * 100
                        : 50
                    }%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Main Charts Grid: Volume Chart & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Monthly Case Volume (Bar Chart) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Monthly Case Volume Trend
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comparative monthly volume of Clinical vs Postmortem examinations
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-indigo-600"></span> Clinical
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-amber-500"></span> Postmortem
                  </div>
                </div>
              </div>

              {/* Bar Chart Graphic */}
              <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200 dark:border-slate-800">
                {data.monthlyVolume.map((item, idx) => {
                  const clinHeight = (item.clinical / maxVolume) * 100;
                  const pmHeight = (item.postmortem / maxVolume) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      {/* Hover Tooltip */}
                      <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                        <strong>{item.month}</strong>: {item.clinical} Clinical, {item.postmortem} Postmortem (Total: {item.total})
                      </div>

                      {/* Bars Group */}
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Clinical Bar */}
                        <div
                          className="w-1/2 bg-indigo-600 hover:bg-indigo-500 rounded-t-md transition-all duration-300 relative"
                          style={{ height: `${Math.max(clinHeight, 4)}%` }}
                        ></div>
                        {/* Postmortem Bar */}
                        <div
                          className="w-1/2 bg-amber-500 hover:bg-amber-400 rounded-t-md transition-all duration-300 relative"
                          style={{ height: `${Math.max(pmHeight, 4)}%` }}
                        ></div>
                      </div>

                      {/* Month Label */}
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate w-full text-center">
                        {item.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Category Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                  Incident & Category Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Breakdown by examination referral types
                </p>

                <div className="space-y-3.5">
                  {data.categoryBreakdown.map((cat, idx) => {
                    const color = COLORS[idx % COLORS.length];
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                            {cat.category}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {cat.count} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: color
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Top Referral Category:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {data.categoryBreakdown[0]?.category || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Admin View: Medical Officer Caseload Chart */}
          {isAdmin && data.officerCaseload && data.officerCaseload.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    Medical Officer-Wise Caseload (Administrative View)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Distribution of clinical vs postmortem workloads assigned per doctor
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-lg text-xs font-semibold">
                  Restricted Admin Access
                </span>
              </div>

              <div className="space-y-4">
                {data.officerCaseload.map((officer, idx) => {
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{officer.doctorName}</span>
                        <span className="text-slate-600 dark:text-slate-400">
                          Total: <strong>{officer.totalCount}</strong> ({officer.clinicalCount} Clinical, {officer.postmortemCount} PM)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-lg overflow-hidden flex">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-500"
                          style={{
                            width: `${(officer.clinicalCount / maxOfficerCases) * 100}%`
                          }}
                          title={`Clinical: ${officer.clinicalCount}`}
                        ></div>
                        <div
                          className="bg-amber-500 h-full transition-all duration-500"
                          style={{
                            width: `${(officer.postmortemCount / maxOfficerCases) * 100}%`
                          }}
                          title={`Postmortem: ${officer.postmortemCount}`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Privacy Footnote */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Data Protection Guarantee:</strong> Statistical metrics are strictly aggregated. No patient identifiers, NIC numbers, or names are exposed.
              </span>
            </div>
            <span>ForenSys v1.0 Departmental Analytics</span>
          </div>
        </>
      ) : null}
    </div>
  );
};
