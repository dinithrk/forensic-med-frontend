import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseService, type MlefRecord } from '../../services/case.service';
import { Loader2, ArrowLeft, Edit, AlertCircle, FileText, Crosshair, Shield, Activity, Droplets } from 'lucide-react';
import { MediaGalleryView } from '../media/MediaGalleryView';

const CaseView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<MlefRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        if (id) {
          const data = await caseService.getById(parseInt(id));
          setRecord(data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load case details');
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start max-w-4xl mx-auto">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <p className="text-sm text-red-700">{error || 'Case not found'}</p>
      </div>
    );
  }

  // Helper to render boolean badges
  const renderBoolBadge = (val?: boolean, labelYes = "Yes", labelNo = "No") => {
    if (val === undefined) return <span className="text-gray-500">N/A</span>;
    return val ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">{labelYes}</span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{labelNo}</span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MLEF Record Details</h1>
            <p className="text-sm text-gray-500">MLEF: {record.mlefId?.toString().padStart(4, '0')}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/cases/${id}/edit`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Record
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">General Information</h2>
          </div>
          <Link to={`/patients/${record.patientId}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
            View Patient Profile &rarr;
          </Link>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="block text-sm font-medium text-gray-500">Patient ID</span>
            <span className="mt-1 block text-base text-gray-900">PT-{record.patientId}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Date & Time Examined</span>
            <span className="mt-1 block text-base text-gray-900">{record.dateTimeExamined ? new Date(record.dateTimeExamined).toLocaleString() : 'N/A'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="block text-sm font-medium text-gray-500">Place Examined</span>
            <span className="mt-1 block text-base text-gray-900">{record.placeExamined || 'N/A'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="block text-sm font-medium text-gray-500">Short History (Patient's Words)</span>
            <p className="mt-1 text-base text-gray-900 bg-gray-50 p-3 rounded-md">{record.shortHistoryGivenByPatient || 'No history provided.'}</p>
          </div>
          <div className="md:col-span-2">
            <span className="block text-sm font-medium text-gray-500">Remarks</span>
            <p className="mt-1 text-base text-gray-900">{record.remarks || 'None'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">Police Request Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-500">Police Ref No</span>
              <span className="mt-1 block text-base text-gray-900">{record.policeRefNo || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Police Form Issue Date</span>
              <span className="mt-1 block text-base text-gray-900">{record.policeDateOfIssue || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Reason for Referral</span>
              <span className="mt-1 block text-base text-gray-900">{record.reasonForReferral || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Brought By Officer ID</span>
              <span className="mt-1 block text-base text-gray-900">{record.broughtByOfficerId ? `Officer #${record.broughtByOfficerId}` : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">Hospital Admission</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-500">Hospital Name</span>
              <span className="mt-1 block text-base text-gray-900">{record.hospitalName || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">Ward</span>
                <span className="mt-1 block text-base text-gray-900">{record.hospitalWard || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">BHT No</span>
                <span className="mt-1 block text-base text-gray-900">{record.hospitalBhtNo || 'N/A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">Admitted</span>
                <span className="mt-1 block text-base text-gray-900">{record.dateAdmitted} {record.timeAdmitted}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-500">Discharged</span>
                <span className="mt-1 block text-base text-gray-900">{record.dateDischarged || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
          <Droplets className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Substances & Sexual Assault</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Substance Influence</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Alcohol Influence:</span>
                <span className="text-sm font-medium">{record.alcoholInfluence || 'UNKNOWN'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Smell Intensity:</span>
                <span className="text-sm font-medium">{record.breathingSmellIntensity || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Drugs Consumed:</span>
                <span className="text-sm font-medium">{renderBoolBadge(record.drugConsumed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Drug Influence:</span>
                <span className="text-sm font-medium">{record.drugInfluence || 'UNKNOWN'}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Sexual Assault Examination</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Vaginal/Hymen Penetration:</span>
                <span className="text-sm font-medium">{renderBoolBadge(record.signsVaginalHymenPenetration)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Anal Penetration:</span>
                <span className="text-sm font-medium">{renderBoolBadge(record.signsAnalPenetration)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-sm text-gray-600">Inter-labial Penetration:</span>
                <span className="text-sm font-medium">{renderBoolBadge(record.signsInterLabialPenetration)}</span>
              </div>
            </div>
            {record.sexualAssaultBriefHistory && (
              <div className="mt-3">
                <span className="text-xs text-gray-500 uppercase">Brief History:</span>
                <p className="text-sm mt-1">{record.sexualAssaultBriefHistory}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
          <Crosshair className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Nature of Bodily Harm & Injuries</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {record.injuryAbrasion && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Abrasion</span>}
            {record.injuryContusion && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Contusion</span>}
            {record.injuryLaceration && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Laceration</span>}
            {record.injuryStab && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Stab</span>}
            {record.injuryCut && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Cut</span>}
            {record.injuryFracture && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Fracture</span>}
            {record.injuryFirearm && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Firearm</span>}
            {record.injuryBurns && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Burns</span>}
            {record.injuryBite && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Bite</span>}
            {record.injuryDislocation && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Dislocation</span>}
            {record.injuryExplosive && <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Explosive</span>}
            {record.internalInjuries && <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Internal Injuries</span>}
            {record.injuryNone && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">No Injuries Identified</span>}
            {record.othersNatureOfHarm && <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">Other: {record.othersNatureOfHarm}</span>}
          </div>

          {record.injuries && record.injuries.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Detailed Injury Records</h3>
              {record.injuries.map((injury, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Type</span>
                      <span className="block text-sm font-medium text-gray-900">{injury.typeOfInjury || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Size</span>
                      <span className="block text-sm font-medium text-gray-900">{injury.sizeOfInjury || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Weapon</span>
                      <span className="block text-sm font-medium text-gray-900">{injury.weaponType || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase">Location</span>
                      <span className="block text-sm font-medium text-gray-900">{injury.placementOfInjury || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No individual injury details recorded.</p>
          )}
        </div>
      </div>
      
      <MediaGalleryView linkType="CASE" linkId={Number(id)} />

    </div>
  );
};

export default CaseView;
