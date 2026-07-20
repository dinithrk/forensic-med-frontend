import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { evidenceService, type ForensicSample } from '../../services/evidence.service';
import { SearchableAutocomplete } from '../../components/SearchableAutocomplete';

export const EvidenceForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<ForensicSample>>({
    specimenType: 'BLOOD',
    collectionDate: new Date().toISOString().split('T')[0]
  });
  
  const [linkType, setLinkType] = useState<'CASE' | 'POSTMORTEM'>('CASE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.caseId) delete payload.caseId;
      if (!payload.pmSerialNo) delete payload.pmSerialNo;
      
      console.log('Submitting payload:', payload);
      await evidenceService.registerSample(payload as ForensicSample);
      navigate('/evidence');
    } catch (error: any) {
      console.error('Failed to submit form', error.response?.data || error);
      alert(`Failed to register evidence: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
    }
  };

  return (
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Log New Evidence</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            
            {/* Link to Case/Postmortem */}
            <div className="pt-8 space-y-6 sm:pt-10 sm:space-y-5">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Link to Record</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Associate this evidence with a clinical case or postmortem exam.</p>
              </div>
              
              <div className="space-y-6 sm:space-y-5">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Link Type</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <select
                      value={linkType}
                      onChange={(e) => {
                        setLinkType(e.target.value as 'CASE' | 'POSTMORTEM');
                        setFormData({ ...formData, caseId: undefined, pmSerialNo: undefined });
                      }}
                      className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="CASE">Clinical Forensic Case</option>
                      <option value="POSTMORTEM">Postmortem Exam</option>
                    </select>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Search Record</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2 max-w-lg">
                    <SearchableAutocomplete 
                      type={linkType} 
                      value={linkType === 'CASE' ? formData.caseId : formData.pmSerialNo} 
                      onChange={(id) => {
                        if (linkType === 'CASE') {
                          setFormData({ ...formData, caseId: id, pmSerialNo: undefined });
                        } else {
                          setFormData({ ...formData, pmSerialNo: id, caseId: undefined });
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Details */}
            <div className="pt-8 space-y-6 sm:pt-10 sm:space-y-5">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Sample Information</h3>
              </div>
              <div className="space-y-6 sm:space-y-5">
                
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Specimen Type</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <select
                      value={formData.specimenType}
                      onChange={(e) => setFormData({ ...formData, specimenType: e.target.value })}
                      className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="BLOOD">Blood</option>
                      <option value="LIVER">Liver</option>
                      <option value="URINE">Urine</option>
                      <option value="BILE">Bile</option>
                      <option value="KIDNEY">Kidney</option>
                      <option value="SUSPECTED_POISON">Suspected Poison</option>
                      <option value="TABLETS_MEDICINES">Tablets / Medicines</option>
                      <option value="LUNGS">Lungs</option>
                      <option value="STOMACH_CONTENTS">Stomach Contents</option>
                      <option value="VITREOUS_HUMOR">Vitreous Humor</option>
                      <option value="INTESTINAL_CONTENTS">Intestinal Contents</option>
                      <option value="BRAIN">Brain</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Collection Date</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                      type="date"
                      required
                      value={formData.collectionDate || ''}
                      onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
                      className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Collected By</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={formData.collectedBy || ''}
                      onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
                      className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Organ Source (Optional)</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                      type="text"
                      value={formData.organSource || ''}
                      onChange={(e) => setFormData({ ...formData, organSource: e.target.value })}
                      className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Number of Tissues (Optional)</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                      type="number"
                      value={formData.numberOfTissues || ''}
                      onChange={(e) => setFormData({ ...formData, numberOfTissues: Number(e.target.value) })}
                      className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Production Number (Optional)</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                      type="text"
                      value={formData.productionNumber || ''}
                      onChange={(e) => setFormData({ ...formData, productionNumber: e.target.value })}
                      className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                  <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">Referred Institution (Optional)</label>
                  <div className="mt-1 sm:mt-0 sm:col-span-2">
                    <input
                      type="text"
                      value={formData.referredInstitution || ''}
                      onChange={(e) => setFormData({ ...formData, referredInstitution: e.target.value })}
                      className="max-w-lg block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/evidence')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Evidence
              </button>
            </div>
          </div>
        </form>
      </div>
  );
};
