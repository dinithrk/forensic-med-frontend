import React, { useEffect, useState } from 'react';
import { reportService, type PendingReportDto } from '../../../services/report.service';
import { exportPendingReportPdf } from '../pdfGenerator';
import { AlertCircle, Clock, Download, Loader2, RefreshCw, Send } from 'lucide-react';

export const PendingCasesReportView: React.FC = () => {
  const [data, setData] = useState<PendingReportDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPendingData = async () => {
    setLoading(true);
    try {
      const res = await reportService.getPendingReport();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch pending cases report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Overdue & Pending Cases Audit</h2>
            <p className="text-xs text-gray-500">Audit of overdue draft reports (&gt; 3 days elapsed) and finalized reports awaiting court dispatch.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPendingData}
            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => data && exportPendingReportPdf(data)}
            disabled={!data}
            className="flex items-center px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Audit PDF
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Overdue Draft Reports (&ge; 3 Days)</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{data?.overdueDraftsCount || 0}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Finalized Reports Pending Dispatch</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{data?.pendingDispatchesCount || 0}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Send className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Overdue Drafts Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-red-50/50">
          <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider flex items-center">
            <Clock className="w-4 h-4 mr-2 text-red-600" />
            Overdue Draft Reports Needing Finalization
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          </div>
        ) : !data || data.overdueDrafts.length === 0 ? (
          <div className="p-6 text-center text-emerald-600 text-sm font-semibold">
            All reports are up to date! No overdue drafts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Reference No</th>
                  <th className="px-6 py-3">Subject Name</th>
                  <th className="px-6 py-3">Days Elapsed</th>
                  <th className="px-6 py-3">Assigned Doctor</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.overdueDrafts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-50/30">
                    <td className="px-6 py-3.5 font-bold text-gray-900">{item.caseType}</td>
                    <td className="px-6 py-3.5 font-semibold text-gray-800">{item.referenceNo}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-900">{item.subjectName}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold rounded-full text-[10px]">
                        {item.daysOverdue} Days Overdue
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-gray-800">{item.assignedDoctor}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-amber-600">DRAFT</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
