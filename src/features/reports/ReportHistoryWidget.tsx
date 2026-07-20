import React, { useEffect, useState } from 'react';
import { reportService, type ForensicReportDto } from '../../services/report.service';
import { ReportGeneratorModal } from './ReportGeneratorModal';
import { generateReportPdf, printReportPdf } from './pdfGenerator';
import { FileText, Plus, Download, Printer, Clock, CheckCircle, Send, CheckSquare, History } from 'lucide-react';

interface ReportHistoryWidgetProps {
  caseType: 'CLINICAL' | 'POSTMORTEM';
  caseId: number;
}

export const ReportHistoryWidget: React.FC<ReportHistoryWidgetProps> = ({ caseType, caseId }) => {
  const [reports, setReports] = useState<ForensicReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ForensicReportDto | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getReportsForCase(caseType, caseId);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [caseType, caseId]);

  const handleOpenNewModal = () => {
    setSelectedReport(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (report: ForensicReportDto) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const renderStatusBadge = (status: string) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">Generated Reports & Version History</h2>
            <p className="text-xs text-gray-500">Official court reports, status tracking, and amendments</p>
          </div>
        </div>
        <button
          onClick={handleOpenNewModal}
          className="flex items-center px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Generate Report
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-6 text-sm text-gray-500">Loading reports history...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">No reports generated for this case yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Generate Report" to auto-fill templates and create MLR / PMR PDFs.</p>
            <button
              onClick={handleOpenNewModal}
              className="mt-4 inline-flex items-center px-3.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-xs font-semibold hover:bg-blue-100"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Generate First Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-900 text-sm">{report.serialNo}</span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-xs font-mono font-semibold">
                      v{report.versionNumber || 1}.0
                    </span>
                    {renderStatusBadge(report.status)}
                    <span className="text-xs text-gray-500 uppercase font-semibold">{report.reportType}</span>
                  </div>

                  <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                    <span>Court: <strong>{report.courtName || 'N/A'}</strong></span>
                    <span>Case #: <strong>{report.courtCaseNo || 'N/A'}</strong></span>
                    <span>Doctor: <strong>{report.doctorName || 'N/A'}</strong></span>
                  </div>

                  {/* Timestamps */}
                  <div className="text-[11px] text-gray-400 flex flex-wrap items-center gap-x-3 pt-1">
                    {report.draftDate && <span>Draft: {new Date(report.draftDate).toLocaleDateString()}</span>}
                    {report.finalizedDate && <span>• Finalized: {new Date(report.finalizedDate).toLocaleDateString()}</span>}
                    {report.dispatchedDate && <span>• Dispatched: {new Date(report.dispatchedDate).toLocaleDateString()}</span>}
                    {report.receiptConfirmedDate && <span>• Receipt Confirmed: {new Date(report.receiptConfirmedDate).toLocaleDateString()}</span>}
                  </div>

                  {report.amendmentReason && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                      <strong>Amendment Reason:</strong> {report.amendmentReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEditModal(report)}
                    className="px-3 py-1.5 text-xs bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 shadow-xs"
                  >
                    View / Edit
                  </button>
                  <button
                    onClick={() => printReportPdf(report)}
                    className="flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    Print
                  </button>
                  <button
                    onClick={() => generateReportPdf(report)}
                    className="flex items-center px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportGeneratorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        caseType={caseType}
        caseId={caseId}
        existingReport={selectedReport}
        onReportSaved={fetchReports}
      />
    </div>
  );
};
