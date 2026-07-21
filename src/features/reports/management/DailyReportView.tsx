import React, { useEffect, useState } from 'react';
import { reportService, type DailyReportDto } from '../../../services/report.service';
import { exportDailyReportPdf } from '../pdfGenerator';
import { Calendar, Download, FileText, Loader2, RefreshCw, Users } from 'lucide-react';

export const DailyReportView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<DailyReportDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDailyData = async (date: string) => {
    setLoading(true);
    try {
      const res = await reportService.getDailyReport(date);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch daily case report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData(selectedDate);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daily Forensic Case Log Report</h2>
            <p className="text-xs text-gray-500">Summary of all clinical examinations & postmortem admissions logged on a selected date.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => fetchDailyData(selectedDate)}
            className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200"
            title="Refresh Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => data && exportDailyReportPdf(data)}
            disabled={!data || data.totalCases === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Daily PDF
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Examinations Logged</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{data?.totalCases || 0}</p>
          </div>
          <div className="p-3 bg-gray-100 text-gray-700 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Clinical Cases (MLEF)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{data?.totalClinicalCases || 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Postmortem Admissions (PMR)</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{data?.totalPostmortemCases || 0}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Daily Case Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Logged Cases for {selectedDate}</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm italic">
            No forensic cases or examinations logged for {selectedDate}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Reference No</th>
                  <th className="px-6 py-3.5">Subject Name</th>
                  <th className="px-6 py-3.5">Police Station / District</th>
                  <th className="px-6 py-3.5">Date & Time Examined</th>
                  <th className="px-6 py-3.5">Examining Doctor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                        item.caseType === 'POSTMORTEM' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.caseType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{item.referenceNo}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{item.subjectName}</td>
                    <td className="px-6 py-4 text-gray-600">{item.policeStation}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.dateTimeExamined ? new Date(item.dateTimeExamined).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.doctorName}</td>
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
