import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deceasedService, postMortemService, medicalOfficerService, type DeceasedDto, type PostMortemDto, type AutopsyExamDto, type CauseOfDeathDto, type MedicalOfficerDto, type PreAutopsyInformationDto } from '../../services/postmortem.service';
import { Loader2, ArrowLeft, Save, AlertCircle, ChevronRight, Check, Plus, Trash2 } from 'lucide-react';

const PostmortemForm: React.FC = () => {
  const { deceasedId, pmId } = useParams<{ deceasedId?: string, pmId?: string }>();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentDeceasedId, setCurrentDeceasedId] = useState<number | null>(deceasedId ? parseInt(deceasedId) : null);
  const [currentPmId, setCurrentPmId] = useState<number | null>(pmId ? parseInt(pmId) : null);
  const [officers, setOfficers] = useState<MedicalOfficerDto[]>([]);

  const [deceasedData, setDeceasedData] = useState<DeceasedDto>({
    fullName: '',
    sex: 'UNKNOWN',
    ageWhenDied: undefined,
    lastAddress: '',
    placeOfDeath: '',
    hospitalName: '',
    bhtNo: '',
    wardNo: '',
    dateOfDeath: '',
    timeOfDeath: ''
  });

  const [pmData, setPmData] = useState<PostMortemDto>({
    dateTimeOfPmExam: '',
    placeOfExamination: '',
    district: '',
    underInvestigation: false,
    specimensRetained: false,
    deceasedId: 0,
    medicalOfficerIds: [],
    preAutopsyInformation: []
  });

  const [examData, setExamData] = useState<AutopsyExamDto>({
    maternalDeathCategory: '',
    underInvestigation: false,
    causesOfDeath: [{ causeDescription: '', severity: '' }]
  });

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const officersData = await medicalOfficerService.getAll();
        setOfficers(officersData);

        if (deceasedId) {
          const dData = await deceasedService.getById(parseInt(deceasedId));
          setDeceasedData({
            ...dData,
            fullName: dData.fullName || '',
            lastAddress: dData.lastAddress || '',
            placeOfDeath: dData.placeOfDeath || '',
            hospitalName: dData.hospitalName || '',
            bhtNo: dData.bhtNo || '',
            wardNo: dData.wardNo || '',
            dateOfDeath: dData.dateOfDeath || '',
            timeOfDeath: dData.timeOfDeath || ''
          });
          
          if (pmId) {
            const pData = await postMortemService.getById(parseInt(deceasedId), parseInt(pmId));
            setPmData({
              ...pData,
              dateTimeOfPmExam: pData.dateTimeOfPmExam || '',
              placeOfExamination: pData.placeOfExamination || '',
              district: pData.district || '',
              medicalOfficerIds: pData.medicalOfficerIds || [],
              preAutopsyInformation: pData.preAutopsyInformation || []
            });
            
            if (pData.autopsyExam) {
              setExamData({
                ...pData.autopsyExam,
                maternalDeathCategory: pData.autopsyExam.maternalDeathCategory || '',
                causesOfDeath: pData.autopsyExam.causesOfDeath?.length ? pData.autopsyExam.causesOfDeath : [{ causeDescription: '', severity: '' }]
              });
            }
          }
        }
      } catch (err) {
        setError("Failed to load existing record data.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingData();
  }, [deceasedId, pmId]);

  const handleDeceasedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeceasedData(prev => ({ ...prev, [name]: name === 'ageWhenDied' ? (value ? parseInt(value) : undefined) : value }));
  };

  const handlePmChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPmData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleOfficerToggle = (officerId: number) => {
    setPmData(prev => {
      const ids = prev.medicalOfficerIds || [];
      if (ids.includes(officerId)) {
        return { ...prev, medicalOfficerIds: ids.filter(id => id !== officerId) };
      }
      return { ...prev, medicalOfficerIds: [...ids, officerId] };
    });
  };

  const addPreAutopsyInfo = () => {
    setPmData(prev => ({
      ...prev,
      preAutopsyInformation: [...(prev.preAutopsyInformation || []), { informationCategory: 'HISTORY', recordDetails: '' }]
    }));
  };

  const updatePreAutopsyInfo = (index: number, field: string, value: string) => {
    const list = [...(pmData.preAutopsyInformation || [])];
    list[index] = { ...list[index], [field]: value };
    setPmData(prev => ({ ...prev, preAutopsyInformation: list }));
  };

  const removePreAutopsyInfo = (index: number) => {
    const list = [...(pmData.preAutopsyInformation || [])];
    list.splice(index, 1);
    setPmData(prev => ({ ...prev, preAutopsyInformation: list }));
  };

  const handleExamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setExamData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const handleCauseChange = (index: number, field: string, value: string) => {
    const updatedCauses = [...(examData.causesOfDeath || [])];
    updatedCauses[index] = { ...updatedCauses[index], [field]: value };
    setExamData(prev => ({ ...prev, causesOfDeath: updatedCauses }));
  };

  const addCause = () => {
    setExamData(prev => ({ ...prev, causesOfDeath: [...(prev.causesOfDeath || []), { causeDescription: '', severity: '' }] }));
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!currentDeceasedId) {
        const result = await deceasedService.create(deceasedData);
        setCurrentDeceasedId(result.deceasedId!);
      }
      setActiveStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save Deceased record.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!currentPmId && currentDeceasedId) {
        const payload = { ...pmData, deceasedId: currentDeceasedId };
        const result = await postMortemService.create(currentDeceasedId, payload);
        setCurrentPmId(result.pmSerialNo!);
      }
      setActiveStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save Postmortem details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (currentDeceasedId && currentPmId) {
        const filteredCauses = (examData.causesOfDeath || []).filter(c => c.causeDescription.trim() !== '');
        const payload = { ...examData, causesOfDeath: filteredCauses };
        await postMortemService.finalizeAutopsy(currentDeceasedId, currentPmId, payload);
        navigate(`/postmortems/${currentDeceasedId}/exam/${currentPmId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to finalize Autopsy Exam.');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(deceasedId ? (pmId ? `/postmortems/${deceasedId}/exam/${pmId}` : `/postmortems/${deceasedId}`) : '/postmortems')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {deceasedId ? 'Edit Postmortem Record' : 'Register New Postmortem'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stepper Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: 'Deceased Info' },
            { step: 2, label: 'Postmortem Details' },
            { step: 3, label: 'Autopsy Findings' }
          ].map((s, index) => (
            <React.Fragment key={s.step}>
              <div className={`flex flex-col items-center ${activeStep >= s.step ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${
                  activeStep > s.step ? 'bg-blue-600 text-white' : 
                  activeStep === s.step ? 'bg-blue-100 border-2 border-blue-600 text-blue-600' : 
                  'bg-gray-100 border-2 border-gray-300 text-gray-400'
                }`}>
                  {activeStep > s.step ? <Check className="w-5 h-5" /> : s.step}
                </div>
                <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-0.5 mx-4 ${activeStep > s.step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        
        {/* STEP 1: Deceased */}
        {activeStep === 1 && (
          <form onSubmit={handleStep1Submit}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Deceased Individual Information</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" name="fullName" required disabled={!!currentDeceasedId} value={deceasedData.fullName} onChange={handleDeceasedChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input type="number" name="ageWhenDied" disabled={!!currentDeceasedId} value={deceasedData.ageWhenDied || ''} onChange={handleDeceasedChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biological Sex *</label>
                <select name="sex" required disabled={!!currentDeceasedId} value={deceasedData.sex} onChange={handleDeceasedChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100">
                  <option value="UNKNOWN">Unknown</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Death</label>
                <input type="text" name="placeOfDeath" disabled={!!currentDeceasedId} value={deceasedData.placeOfDeath} onChange={handleDeceasedChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Death</label>
                <input type="date" name="dateOfDeath" disabled={!!currentDeceasedId} value={deceasedData.dateOfDeath} onChange={handleDeceasedChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time of Death</label>
                <input type="time" name="timeOfDeath" disabled={!!currentDeceasedId} value={deceasedData.timeOfDeath} onChange={handleDeceasedChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Known Address</label>
                <input type="text" name="lastAddress" disabled={!!currentDeceasedId} value={deceasedData.lastAddress} onChange={handleDeceasedChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:bg-blue-400">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save & Continue'}
                {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Postmortem */}
        {activeStep === 2 && (
          <form onSubmit={handleStep2Submit}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Postmortem Examination Details</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time of Exam *</label>
                <input type="datetime-local" step="1" name="dateTimeOfPmExam" required disabled={!!currentPmId} value={pmData.dateTimeOfPmExam} onChange={handlePmChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Examination</label>
                <input type="text" name="placeOfExamination" disabled={!!currentPmId} value={pmData.placeOfExamination} onChange={handlePmChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input type="text" name="district" disabled={!!currentPmId} value={pmData.district} onChange={handlePmChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100" />
              </div>
              
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Medical Officers</label>
                 <div className="flex flex-wrap gap-2">
                   {officers.map(officer => (
                     <button
                       key={officer.officerId}
                       type="button"
                       disabled={!!currentPmId}
                       onClick={() => handleOfficerToggle(officer.officerId)}
                       className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                         (pmData.medicalOfficerIds || []).includes(officer.officerId) 
                         ? 'bg-blue-100 text-blue-800 border-blue-300' 
                         : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                       } ${!!currentPmId && 'opacity-50 cursor-not-allowed'}`}
                     >
                       {officer.fullName}
                     </button>
                   ))}
                   {officers.length === 0 && <span className="text-sm text-gray-500 italic">No medical officers found.</span>}
                 </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Pre-Autopsy Information</label>
                  {!currentPmId && (
                    <button type="button" onClick={addPreAutopsyInfo} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                      <Plus className="w-4 h-4 mr-1" /> Add Info
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {(pmData.preAutopsyInformation || []).map((info, idx) => (
                    <div key={idx} className="flex space-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="w-1/3">
                        <select
                          disabled={!!currentPmId}
                          value={info.informationCategory}
                          onChange={(e) => updatePreAutopsyInfo(idx, 'informationCategory', e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="HISTORY">History</option>
                          <option value="CLINICAL_FINDINGS">Clinical Findings</option>
                          <option value="WITNESS_STATEMENT">Witness Statement</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <div className="flex-1 flex">
                        <input
                          type="text"
                          disabled={!!currentPmId}
                          placeholder="Record Details"
                          value={info.recordDetails}
                          onChange={(e) => updatePreAutopsyInfo(idx, 'recordDetails', e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm focus:ring-blue-500 disabled:bg-gray-100"
                        />
                        {!currentPmId && (
                          <button type="button" onClick={() => removePreAutopsyInfo(idx)} className="ml-2 text-red-500 hover:text-red-700 p-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex space-x-6 mt-2">
                <div className="flex items-center">
                  <input type="checkbox" id="pmInvestigation" name="underInvestigation" disabled={!!currentPmId} checked={pmData.underInvestigation} onChange={handlePmChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50" />
                  <label htmlFor="pmInvestigation" className="ml-2 block text-sm text-gray-900">Under Active Police Investigation</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="specimensRetained" name="specimensRetained" disabled={!!currentPmId} checked={pmData.specimensRetained} onChange={handlePmChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50" />
                  <label htmlFor="specimensRetained" className="ml-2 block text-sm text-gray-900">Specimens Retained for Lab</label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
              <button type="button" onClick={() => setActiveStep(1)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors shadow-sm font-medium">
                Back
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium disabled:bg-blue-400">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Save & Continue'}
                {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Findings */}
        {activeStep === 3 && (
          <form onSubmit={handleStep3Submit}>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Final Autopsy Findings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maternal Death Category (If Applicable)</label>
                  <input type="text" name="maternalDeathCategory" value={examData.maternalDeathCategory} onChange={handleExamChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="flex items-center mt-6">
                  <input type="checkbox" id="examInvestigation" name="underInvestigation" checked={examData.underInvestigation} onChange={handleExamChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="examInvestigation" className="ml-2 block text-sm text-gray-900">Findings Pending Further Investigation</label>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Causes of Death</label>
                  <button type="button" onClick={addCause} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                    <Plus className="w-4 h-4 mr-1" /> Add Cause
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(examData.causesOfDeath || []).map((cause, idx) => (
                    <div key={idx} className="flex space-x-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Cause Description (e.g., Asphyxiation)" 
                          value={cause.causeDescription} 
                          onChange={(e) => handleCauseChange(idx, 'causeDescription', e.target.value)} 
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm focus:ring-blue-500" 
                        />
                      </div>
                      <div className="w-1/3">
                        <input 
                          type="text" 
                          placeholder="Severity / Notes" 
                          value={cause.severity || ''} 
                          onChange={(e) => handleCauseChange(idx, 'severity', e.target.value)} 
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border text-sm focus:ring-blue-500" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
              <button type="button" onClick={() => setActiveStep(2)} className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors shadow-sm font-medium">
                Back
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm font-medium disabled:bg-green-400">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Finalize Autopsy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostmortemForm;
