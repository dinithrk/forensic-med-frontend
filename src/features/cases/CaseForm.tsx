import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { caseService, type MlefRecord } from '../../services/case.service';
import { Loader2, ArrowLeft, Save, AlertCircle } from 'lucide-react';

const CaseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'general' | 'injuries' | 'alcohol' | 'hospital'>('general');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<MlefRecord>({
    policeRefNo: '',
    policeDateOfIssue: '',
    reasonForReferral: '',
    dateTimeExamined: '',
    placeExamined: '',
    patientId: 0,
    injuryAbrasion: false,
    injuryContusion: false,
    injuryLaceration: false,
    injuryStab: false,
    injuryCut: false,
    injuryFracture: false,
    injuryFirearm: false,
    injuryBurns: false,
    injuryBite: false,
    injuryDislocation: false,
    injuryExplosive: false,
    injuryNone: false,
    internalInjuries: false,
    othersNatureOfHarm: '',
    breathingSmellIntensity: '',
    alcoholInfluence: 'NEGATIVE',
    drugConsumed: false,
    drugInfluence: 'NEGATIVE',
    sexualAssaultBriefHistory: '',
    signsVaginalHymenPenetration: false,
    signsAnalPenetration: false,
    signsInterLabialPenetration: false,
    otherOpinionsRecommendations: '',
    hospitalName: '',
    hospitalWard: '',
    hospitalBhtNo: '',
    dateAdmitted: '',
    timeAdmitted: '',
    dateDischarged: '',
    remarks: '',
    shortHistoryGivenByPatient: ''
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchCase(parseInt(id, 10));
    }
  }, [id, isEditMode]);

  const fetchCase = async (caseId: number) => {
    try {
      const data = await caseService.getById(caseId);
      // Ensure null strings become empty strings for controlled inputs
      setFormData({
        ...data,
        policeRefNo: data.policeRefNo || '',
        policeDateOfIssue: data.policeDateOfIssue || '',
        reasonForReferral: data.reasonForReferral || '',
        dateTimeExamined: data.dateTimeExamined || '',
        placeExamined: data.placeExamined || '',
        othersNatureOfHarm: data.othersNatureOfHarm || '',
        breathingSmellIntensity: data.breathingSmellIntensity || '',
        sexualAssaultBriefHistory: data.sexualAssaultBriefHistory || '',
        otherOpinionsRecommendations: data.otherOpinionsRecommendations || '',
        hospitalName: data.hospitalName || '',
        hospitalWard: data.hospitalWard || '',
        hospitalBhtNo: data.hospitalBhtNo || '',
        dateAdmitted: data.dateAdmitted || '',
        timeAdmitted: data.timeAdmitted || '',
        dateDischarged: data.dateDischarged || '',
        remarks: data.remarks || '',
        shortHistoryGivenByPatient: data.shortHistoryGivenByPatient || ''
      });
    } catch (err: any) {
      setError('Failed to fetch case details.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'patientId' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const savedCase = await (isEditMode && id ? caseService.update(parseInt(id, 10), formData) : caseService.create(formData));
      navigate(`/cases/${savedCase.mlefSerialNo}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save case record. Please check the inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const TabButton = ({ name, label }: { name: 'general' | 'injuries' | 'alcohol' | 'hospital', label: string }) => (
    <button
      type="button"
      onClick={() => setActiveTab(name)}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        activeTab === name
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/cases')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Case Record' : 'Register New Case'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Medico-Legal Examination Form (MLEF)</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex overflow-x-auto">
          <TabButton name="general" label="General Info" />
          <TabButton name="injuries" label="Bodily Harm" />
          <TabButton name="alcohol" label="Alcohol & Assault" />
          <TabButton name="hospital" label="Hospital Details" />
        </div>

        <div className="p-6">
          {/* GENERAL TAB */}
          <div className={activeTab === 'general' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID *</label>
                <input type="number" name="patientId" required value={formData.patientId || ''} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" placeholder="Enter linked Patient ID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Police Ref No</label>
                <input type="text" name="policeRefNo" value={formData.policeRefNo} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Police Date of Issue</label>
                <input type="date" name="policeDateOfIssue" value={formData.policeDateOfIssue} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time Examined</label>
                <input type="datetime-local" step="1" name="dateTimeExamined" value={formData.dateTimeExamined} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place Examined</label>
                <input type="text" name="placeExamined" value={formData.placeExamined} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral</label>
                <textarea name="reasonForReferral" value={formData.reasonForReferral} onChange={handleChange} rows={3} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Short History Given By Patient</label>
                <textarea name="shortHistoryGivenByPatient" value={formData.shortHistoryGivenByPatient} onChange={handleChange} rows={4} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>
          </div>

          {/* INJURIES TAB */}
          <div className={activeTab === 'injuries' ? 'block' : 'hidden'}>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nature of Bodily Harm</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { name: 'injuryAbrasion', label: 'Abrasion' },
                { name: 'injuryContusion', label: 'Contusion' },
                { name: 'injuryLaceration', label: 'Laceration' },
                { name: 'injuryStab', label: 'Stab' },
                { name: 'injuryCut', label: 'Cut' },
                { name: 'injuryFracture', label: 'Fracture' },
                { name: 'injuryFirearm', label: 'Firearm' },
                { name: 'injuryBurns', label: 'Burns' },
                { name: 'injuryBite', label: 'Bite' },
                { name: 'injuryDislocation', label: 'Dislocation' },
                { name: 'injuryExplosive', label: 'Explosive' },
                { name: 'internalInjuries', label: 'Internal Injuries' },
                { name: 'injuryNone', label: 'None' },
              ].map(injury => (
                <div key={injury.name} className="flex items-center">
                  <input
                    type="checkbox"
                    id={injury.name}
                    name={injury.name}
                    checked={formData[injury.name as keyof MlefRecord] as boolean}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={injury.name} className="ml-2 block text-sm text-gray-900">
                    {injury.label}
                  </label>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Others (Nature of Harm)</label>
              <textarea name="othersNatureOfHarm" value={formData.othersNatureOfHarm} onChange={handleChange} rows={3} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
          </div>

          {/* ALCOHOL & ASSAULT TAB */}
          <div className={activeTab === 'alcohol' ? 'block' : 'hidden'}>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Alcohol & Drug Influence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Influence</label>
                    <select name="alcoholInfluence" value={formData.alcoholInfluence} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500">
                      <option value="NEGATIVE">Negative / Unknown</option>
                      <option value="CONSUMED_SMELLING">Consumed / Smelling</option>
                      <option value="UNDER_INFLUENCE">Under Influence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drug Influence</label>
                    <select name="drugInfluence" value={formData.drugInfluence} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500">
                      <option value="NEGATIVE">Negative / Unknown</option>
                      <option value="CONSUMED_SMELLING">Consumed / Smelling</option>
                      <option value="UNDER_INFLUENCE">Under Influence</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Breathing Smell Intensity</label>
                    <input type="text" name="breathingSmellIntensity" value={formData.breathingSmellIntensity} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="flex items-center mt-6">
                    <input type="checkbox" id="drugConsumed" name="drugConsumed" checked={formData.drugConsumed} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="drugConsumed" className="ml-2 block text-sm font-medium text-gray-700">Drug Consumed (Reported)</label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Sexual Assault Examination</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="flex items-center">
                    <input type="checkbox" id="signsVaginalHymenPenetration" name="signsVaginalHymenPenetration" checked={formData.signsVaginalHymenPenetration} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="signsVaginalHymenPenetration" className="ml-2 block text-sm text-gray-700">Signs of Vaginal/Hymen Penetration</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="signsAnalPenetration" name="signsAnalPenetration" checked={formData.signsAnalPenetration} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="signsAnalPenetration" className="ml-2 block text-sm text-gray-700">Signs of Anal Penetration</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="signsInterLabialPenetration" name="signsInterLabialPenetration" checked={formData.signsInterLabialPenetration} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="signsInterLabialPenetration" className="ml-2 block text-sm text-gray-700">Signs of Inter-Labial Penetration</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sexual Assault Brief History</label>
                  <textarea name="sexualAssaultBriefHistory" value={formData.sexualAssaultBriefHistory} onChange={handleChange} rows={3} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* HOSPITAL TAB */}
          <div className={activeTab === 'hospital' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Ward</label>
                <input type="text" name="hospitalWard" value={formData.hospitalWard} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BHT No</label>
                <input type="text" name="hospitalBhtNo" value={formData.hospitalBhtNo} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Admitted</label>
                <input type="date" name="dateAdmitted" value={formData.dateAdmitted} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Admitted</label>
                <input type="time" step="1" name="timeAdmitted" value={formData.timeAdmitted} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Discharged</label>
                <input type="date" name="dateDischarged" value={formData.dateDischarged} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">General Remarks / Other Opinions</label>
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={4} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Case Record
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseForm;
