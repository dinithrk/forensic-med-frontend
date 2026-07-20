import React, { useEffect, useState } from 'react';
import { reportService, type ForensicReportDto, type ReportStatus } from '../../services/report.service';
import { generateReportPdf, printReportPdf } from './pdfGenerator';
import { ReportGeneratorModal } from './ReportGeneratorModal';
import { ReportNotificationsWidget } from './ReportNotificationsWidget';
import { FileText, Search, Download, Printer, CheckCircle, Send, CheckSquare, Clock, RefreshCw, Loader2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ForensicReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ForensicReportDto | null>(null);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAll();
      setReports(data);
    } catch (err) {
      console.error('Failed to fetch forensic reports list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  const handleOpenEditModal = (report: ForensicReportDto) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      (r.serialNo && r.serialNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.subjectName && r.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.courtName && r.courtName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.courtCaseNo && r.courtCaseNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.doctorName && r.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || r.reportType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const renderStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'FINALIZED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1"/> Finalized</span>;
      case 'DISPATCHED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><Send className="w-3 h-3 mr-1"/> Dispatched</span>;
      case 'RECEIPT_CONFIRMED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckSquare className="w-3 h-3 mr-1"/> Receipt Confirmed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1"/> Draft</span>;
    }
  };

  const draftCount = reports.filter(r => r.status === 'DRAFT').length;
  const finalizedCount = reports.filter(r => r.status === 'FINALIZED').length;
  const dispatchedCount = reports.filter(r => r.status === 'DISPATCHED').length;
  const confirmedCount = reports.filter(r => r.status === 'RECEIPT_CONFIRMED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Court Report Management</h1>
          <p className="text-sm text-gray-500">
            Generate, track, and dispatch Medico-Legal & Postmortem Reports for Court Proceedings.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Total Drafts</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{draftCount}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Finalized (Pending Dispatch)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{finalizedCount}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Dispatched Reports</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{dispatchedCount}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Send className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Receipt Confirmed</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{confirmedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Notifications Widget Component */}
      <ReportNotificationsWidget />

      {/* Reports Table & Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              All Forensic Court Reports
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search serial, court, subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded-lg w-56 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="FINALIZED">Finalized</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="RECEIPT_CONFIRMED">Receipt Confirmed</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white focus:ring-blue-500"
              >
                <option value="ALL">All Report Types</option>
                <option value="MLR">MLR Report</option>
                <option value="PMR">Postmortem (PMR)</option>
                <option value="CERTIFICATE_OF_RECEIPT">Certificate of Receipt</option>
              </select>

              <button
                onClick={fetchAllReports}
                className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                title="Refresh Table"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No forensic reports found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Serial / Ver</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Subject Name</th>
                  <th className="px-6 py-3.5">Court & Case #</th>
                  <th className="px-6 py-3.5">Status & Dates</th>
                  <th className="px-6 py-3.5">Doctor</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <div>{report.serialNo}</div>
                      <div className="text-[10px] text-gray-400 font-mono">v{report.versionNumber || 1}.0</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-800 font-semibold rounded text-[10px]">
                        {report.reportType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {report.subjectName || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{report.courtName || 'N/A'}</div>
                      <div className="text-[11px] text-gray-500">Case: {report.courtCaseNo || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {renderStatusBadge(report.status)}
                      <div className="text-[10px] text-gray-400">
                        {report.finalizedDate ? `Finalized: ${new Date(report.finalizedDate).toLocaleDateString()}` : `Draft: ${report.draftDate ? new Date(report.draftDate).toLocaleDateString() : 'N/A'}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{report.doctorName || 'N/A'}</div>
                      <div className="text-[10px] text-gray-400">{report.doctorDesignation || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(report)}
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-100 shadow-2xs"
                      >
                        Manage
                      </button>
                      <button
                        onClick={() => printReportPdf(report)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 shadow-2xs"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" />
                        Print
                      </button>
                      <button
                        onClick={() => generateReportPdf(report)}
                        className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportGeneratorModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          caseType={selectedReport.caseType as 'CLINICAL' | 'POSTMORTEM'}
          caseId={selectedReport.mlefRecordId || selectedReport.pmSerialNo || 0}
          existingReport={selectedReport}
          onReportSaved={fetchAllReports}
        />
      )}
    </div>
  );
};
