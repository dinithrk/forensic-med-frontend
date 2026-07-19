import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deceasedService, postMortemService, type DeceasedDto, type PostMortemDto } from '../../services/postmortem.service';
import { Loader2, ArrowLeft, Edit, AlertCircle, FileText, User, MapPin, Plus, FileSearch } from 'lucide-react';

const DeceasedView: React.FC = () => {
  const { deceasedId } = useParams<{ deceasedId: string }>();
  const navigate = useNavigate();
  
  const [deceased, setDeceased] = useState<DeceasedDto | null>(null);
  const [postmortems, setPostmortems] = useState<PostMortemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (deceasedId) {
          const id = parseInt(deceasedId);
          const decData = await deceasedService.getById(id);
          setDeceased(decData);
          
          const pmData = await postMortemService.getAllForDeceased(id);
          setPostmortems(pmData);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load records.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [deceasedId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !deceased) {
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
          <button onClick={() => navigate('/postmortems')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deceased Record</h1>
            <p className="text-sm text-gray-500">DEC-{deceased.deceasedId?.toString().padStart(4, '0')}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/postmortems/${deceased.deceasedId}/edit`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Individual
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
          <User className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Deceased Individual Information</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div>
            <span className="block text-sm font-medium text-gray-500">Full Name</span>
            <span className="mt-1 block text-base text-gray-900">{deceased.fullName}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Age / Sex</span>
            <span className="mt-1 block text-base text-gray-900">
              {deceased.ageWhenDied ? `${deceased.ageWhenDied} yrs` : 'Unknown'} / {deceased.sex}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Date & Time of Death</span>
            <span className="mt-1 block text-base text-gray-900">{deceased.dateOfDeath || 'N/A'} {deceased.timeOfDeath || ''}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Place of Death</span>
            <span className="mt-1 block text-base text-gray-900">{deceased.placeOfDeath || 'N/A'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="block text-sm font-medium text-gray-500">Last Address</span>
            <span className="mt-1 block text-base text-gray-900">{deceased.lastAddress || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Identifiers and Inquest (Optional Additions later, simplified for now) */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">Postmortem Examinations</h2>
          </div>
          <button
            onClick={() => navigate(`/postmortems/${deceased.deceasedId}/exam/new/edit`)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-3 py-1.5 rounded-md"
          >
            <Plus className="w-4 h-4 mr-1" /> Register Exam
          </button>
        </div>
        
        <div className="p-0">
          {postmortems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileSearch className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No postmortem exams registered for this individual.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {postmortems.map((pm, idx) => (
                <li key={pm.pmSerialNo || idx} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-medium text-gray-900">PM-{pm.pmSerialNo}</h4>
                    <p className="text-sm text-gray-500 mt-1">Date: {new Date(pm.dateTimeOfPmExam).toLocaleString()} | Place: {pm.placeOfExamination}</p>
                    <div className="mt-2 flex space-x-2">
                      {pm.underInvestigation && (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                           Police Investigation
                         </span>
                      )}
                      {pm.specimensRetained && (
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                           Specimens Retained
                         </span>
                      )}
                    </div>
                  </div>
                  <Link 
                    to={`/postmortems/${deceased.deceasedId}/exam/${pm.pmSerialNo}`}
                    className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    View Report &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeceasedView;
