import React, { useEffect, useState } from 'react';
import { reportService, type ReportNotificationDto } from '../../services/report.service';
import { AlertTriangle, Calendar, Send, ShieldAlert, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReportNotificationsWidget: React.FC = () => {
  const [data, setData] = useState<ReportNotificationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERDUE' | 'COURT' | 'DISPATCH'>('OVERDUE');
  const navigate = useNavigate();

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      const res = await reportService.getNotificationWidgetData();
      setData(res);
    } catch (err) {
      console.error('Failed to fetch report notification widget data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-sm text-gray-500">Loading forensic court report alerts...</span>
      </div>
    );
  }

  const overdueCount = data?.overdueReports?.length || 0;
  const courtCount = data?.upcomingCourtDates?.length || 0;
  const dispatchCount = data?.pendingDispatches?.length || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base font-bold text-white">Forensic Reports & Court Alerts</h2>
            <p className="text-xs text-slate-300">Live operational tracker for overdue reports, court dates, & dispatches</p>
          </div>
        </div>
        <button
          onClick={fetchNotificationData}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Refresh Alerts"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'OVERDUE'
              ? 'border-red-600 text-red-700 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Unissued Reports ({overdueCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('COURT')}
          className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'COURT'
              ? 'border-blue-600 text-blue-700 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Upcoming Court Dates ({courtCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('DISPATCH')}
          className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'DISPATCH'
              ? 'border-purple-600 text-purple-700 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-4 h-4 text-purple-600" />
          <span>Pending Dispatch ({dispatchCount})</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-72 overflow-y-auto">
        {/* Tab 1: Overdue Reports */}
        {activeTab === 'OVERDUE' && (
          <div className="space-y-3">
            {overdueCount === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No unissued reports currently overdue.</p>
            ) : (
              data?.overdueReports.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(item.caseType === 'POSTMORTEM' ? `/postmortems/${item.caseId}` : `/cases/${item.caseId}`)}
                  className="p-3 bg-red-50/60 border border-red-200 rounded-xl hover:bg-red-100/80 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-900">{item.referenceNo}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                        {item.daysOverdue} Days Overdue
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500">{item.caseType}</span>
                    </div>
                    <p className="text-xs text-gray-800">
                      Subject: <strong>{item.subjectName}</strong> | Doctor: {item.assignedDoctor}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Exam Date: {new Date(item.examinationDate).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Upcoming Court Dates */}
        {activeTab === 'COURT' && (
          <div className="space-y-3">
            {courtCount === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No upcoming court trial dates scheduled.</p>
            ) : (
              data?.upcomingCourtDates.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/reports')}
                  className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl hover:bg-blue-100/80 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-900">{item.courtName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        In {item.daysUntilTrial} Days ({item.dateOfTrial})
                      </span>
                    </div>
                    <p className="text-xs text-gray-800">
                      Case #: <strong>{item.courtCaseNo}</strong> | Subject: {item.subjectName}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Pending Dispatches */}
        {activeTab === 'DISPATCH' && (
          <div className="space-y-3">
            {dispatchCount === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No finalized reports awaiting dispatch.</p>
            ) : (
              data?.pendingDispatches.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/reports')}
                  className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl hover:bg-purple-100/80 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-900">{item.serialNo}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                        Finalized - Ready to Dispatch
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500">{item.reportType}</span>
                    </div>
                    <p className="text-xs text-gray-800">
                      Court: {item.courtName || 'N/A'} | Doctor: {item.doctorName || 'N/A'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Finalized: {new Date(item.finalizedDate).toLocaleString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-purple-400 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
