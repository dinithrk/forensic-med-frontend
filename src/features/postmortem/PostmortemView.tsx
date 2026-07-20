import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postMortemService, type PostMortemDto } from '../../services/postmortem.service';
import { Loader2, ArrowLeft, Edit, AlertCircle, FileText, ClipboardList, Crosshair } from 'lucide-react';
import { MediaGalleryView } from '../media/MediaGalleryView';
import { ReportHistoryWidget } from '../reports/ReportHistoryWidget';

const PostmortemView: React.FC = () => {
  const { deceasedId, pmId } = useParams<{ deceasedId: string, pmId: string }>();
  const navigate = useNavigate();
  
  const [pmData, setPmData] = useState<PostMortemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        if (deceasedId && pmId) {
          const data = await postMortemService.getById(parseInt(deceasedId), parseInt(pmId));
          setPmData(data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load autopsy details');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [deceasedId, pmId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !pmData) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-4xl mx-auto flex">
        <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
        <p className="text-sm text-red-700">{error || 'Record not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(`/postmortems/${deceasedId}`)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Autopsy Exam Details</h1>
            <p className="text-sm text-gray-500">Exam: PM-{pmData.pmSerialNo} | Deceased: DEC-{deceasedId}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/postmortems/${deceasedId}/exam/${pmId}/edit`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Exam
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
          <ClipboardList className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Examination Metadata</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <span className="block text-sm font-medium text-gray-500">Date & Time</span>
            <span className="mt-1 block text-base text-gray-900">{new Date(pmData.dateTimeOfPmExam).toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Place of Examination</span>
            <span className="mt-1 block text-base text-gray-900">{pmData.placeOfExamination || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">District</span>
            <span className="mt-1 block text-base text-gray-900">{pmData.district || 'N/A'}</span>
          </div>
          <div>
             <span className="block text-sm font-medium text-gray-500">Medical Officer IDs</span>
             <span className="mt-1 block text-base text-gray-900">
               {pmData.medicalOfficerIds?.length ? pmData.medicalOfficerIds.join(', ') : 'None'}
             </span>
          </div>
        </div>
      </div>

      {pmData.preAutopsyInformation && pmData.preAutopsyInformation.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">Pre-Autopsy Information</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              {pmData.preAutopsyInformation.map((info, idx) => (
                <li key={idx} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded mb-2 uppercase tracking-wider">
                    {info.informationCategory}
                  </span>
                  <p className="text-gray-900 text-sm">{info.recordDetails}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {pmData.autopsyExam && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crosshair className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-medium text-gray-900">Final Autopsy Findings</h2>
            </div>
          </div>
          
          <div className="p-6">
             {pmData.autopsyExam.maternalDeathCategory && (
                <div className="mb-6">
                  <span className="block text-sm font-medium text-gray-500">Maternal Death Category</span>
                  <span className="mt-1 block text-base text-gray-900">{pmData.autopsyExam.maternalDeathCategory}</span>
                </div>
             )}
             
             <h3 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wider border-b pb-2">Causes of Death</h3>
             {pmData.autopsyExam.causesOfDeath && pmData.autopsyExam.causesOfDeath.length > 0 ? (
                <div className="space-y-3">
                  {pmData.autopsyExam.causesOfDeath.map((cause, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-md border border-gray-200 flex justify-between">
                      <div>
                        <span className="block font-medium text-gray-900">{cause.causeDescription}</span>
                        {cause.aproxTFromOnsetToDeath && (
                           <span className="block text-sm text-gray-500 mt-1">Onset to death: {cause.aproxTFromOnsetToDeath}</span>
                        )}
                      </div>
                      {cause.severity && (
                        <span className="text-sm text-gray-600 bg-gray-200 px-2.5 py-1 rounded-md self-start">{cause.severity}</span>
                      )}
                    </div>
                  ))}
                </div>
             ) : (
                <p className="text-sm text-gray-500 italic">No causes of death recorded.</p>
             )}
          </div>
        </div>
      )}

      <ReportHistoryWidget caseType="POSTMORTEM" caseId={Number(pmId)} />

      <MediaGalleryView linkType="POSTMORTEM" linkId={Number(pmId)} />
      
    </div>
  );
};

export default PostmortemView;
