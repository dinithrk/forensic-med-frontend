import React, { useEffect, useState } from 'react';
import { reportService, type CourtReportDto } from '../../../services/report.service';
import { exportCourtReportPdf } from '../pdfGenerator';
import { Calendar, CheckSquare, Download, Loader2, RefreshCw, Scale, Send } from 'lucide-react';

export const CourtReportView: React.FC = () => {
  const [data, setData] = useState<CourtReportDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourtData = async () => {
    setLoading(true);
    try {
      const res = await reportService.getCourtReport();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch court report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourtData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Court Proceedings & Trial Schedule Report</h2>
            <p className="text-xs text-gray-500">Track upcoming court dates, trial summons, report dispatches, and receipt confirmations.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCourtData}
            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => data && exportCourtReportPdf(data)}
            disabled={!data}
            className="flex items-center px-4 py-2 bg-purple-700 text-white text-xs font-bold rounded-lg hover:bg-purple-800 disabled:opacity-50 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Court Schedule PDF
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Upcoming Trial Dates</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{data?.upcomingTrialsCount || 0}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Pending Court Dispatches</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{data?.pendingDispatchesCount || 0}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Send className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Court Receipt Confirmed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{data?.receiptConfirmedCount || 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Upcoming Trials Log */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-purple-50/40">
          <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-purple-700" />
            Upcoming Court Trial Dates & Summons
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : !data || data.upcomingTrials.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm italic">
            No upcoming court trial dates found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 uppercase text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Court Name</th>
                  <th className="px-6 py-3.5">Case Number</th>
                  <th className="px-6 py-3.5">Subject Name</th>
                  <th className="px-6 py-3.5">Trial Date</th>
                  <th className="px-6 py-3.5 text-right">Countdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.upcomingTrials.map((item, idx) => (
                  <tr key={idx} className="hover:bg-purple-50/20">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.courtName}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.courtCaseNo}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.subjectName}</td>
                    <td className="px-6 py-4 font-bold text-purple-700">{item.dateOfTrial}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 font-bold rounded-full text-[10px]">
                        In {item.daysUntilTrial} Days
                      </span>
                    </td>
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
