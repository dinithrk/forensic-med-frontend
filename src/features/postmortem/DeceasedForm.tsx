import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { deceasedService, type DeceasedDto, type Gender } from '../../services/postmortem.service';
import { Loader2, ArrowLeft, Save, Plus, Trash2, AlertCircle } from 'lucide-react';

const DeceasedForm: React.FC = () => {
  const { deceasedId } = useParams<{ deceasedId: string }>();
  const isEditMode = !!deceasedId;
  const navigate = useNavigate();

  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'general' | 'hospital' | 'inquest' | 'identifiers'>('general');

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DeceasedDto>({
    defaultValues: {
      fullName: '',
      sex: 'UNKNOWN',
      identifiers: [],
      inquestOrder: {
        inquirerIntoSuddenDeaths: false
      }
    }
  });

  const { fields: identifierFields, append: appendIdentifier, remove: removeIdentifier } = useFieldArray({
    control,
    name: 'identifiers'
  });

  useEffect(() => {
    if (isEditMode && deceasedId) {
      fetchDeceased(parseInt(deceasedId, 10));
    }
  }, [deceasedId, isEditMode]);

  const fetchDeceased = async (deceasedId: number) => {
    try {
      const data = await deceasedService.getById(deceasedId);
      
      const formattedData = {
        ...data,
        fullName: data.fullName || '',
        placeOfDeath: data.placeOfDeath || '',
        lastAddress: data.lastAddress || '',
        hospitalName: data.hospitalName || '',
        wardNo: data.wardNo || '',
        bhtNo: data.bhtNo || '',
        dateOfDeath: data.dateOfDeath ? String(data.dateOfDeath).split('T')[0] : '',
        timeOfDeath: data.timeOfDeath ? String(data.timeOfDeath).slice(0, 5) : '',
        inquestOrder: data.inquestOrder ? {
          ...data.inquestOrder,
          dateOfInquest: data.inquestOrder.dateOfInquest ? String(data.inquestOrder.dateOfInquest).split('T')[0] : '',
          inquestNumber: data.inquestOrder.inquestNumber || '',
          inquirerFullName: data.inquestOrder.inquirerFullName || '',
          inquirerDesignation: data.inquestOrder.inquirerDesignation || '',
          magistrate: data.inquestOrder.magistrate || '',
          court: data.inquestOrder.court || '',
          caseNo: data.inquestOrder.caseNo || '',
          policeStationArea: data.inquestOrder.policeStationArea || '',
          policeOfficerIncharge: data.inquestOrder.policeOfficerIncharge || '',
          inquirerIntoSuddenDeaths: data.inquestOrder.inquirerIntoSuddenDeaths || false
        } : { inquirerIntoSuddenDeaths: false },
        identifiers: data.identifiers || []
      };
      
      reset(formattedData);
    } catch (err: any) {
      setSubmitError('Failed to fetch deceased details.');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: DeceasedDto) => {
    setSubmitError(null);
    try {
      const savedDeceased = isEditMode && deceasedId
        ? await deceasedService.update(parseInt(deceasedId, 10), data)
        : await deceasedService.create(data);
      navigate(`/postmortems/${savedDeceased.deceasedId}`);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to save Deceased record. Please check the inputs.');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const TabButton = ({ name, label }: { name: 'general' | 'hospital' | 'inquest' | 'identifiers', label: string }) => (
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
          onClick={() => navigate('/postmortems')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Deceased Record' : 'Register Admitted Body'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Morgue Admission & Registration</p>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex overflow-x-auto">
          <TabButton name="general" label="General Info" />
          <TabButton name="hospital" label="Hospital Details" />
          <TabButton name="inquest" label="Inquest Order" />
          <TabButton name="identifiers" label={`Identifiers (${identifierFields.length})`} />
        </div>

        <div className="p-6">
          {/* GENERAL TAB */}
          <div className={activeTab === 'general' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  {...register('fullName', { required: 'Full name is required' })} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input 
                    type="number" 
                    {...register('ageWhenDied', { valueAsNumber: true })} 
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biological Sex *</label>
                  <select 
                    {...register('sex', { required: true })} 
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500"
                  >
                    <option value="UNKNOWN">Unknown</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Death</label>
                <input 
                  type="date" 
                  {...register('dateOfDeath')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time of Death</label>
                <input 
                  type="time" 
                  {...register('timeOfDeath')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Death</label>
                <input 
                  type="text" 
                  {...register('placeOfDeath')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Known Address</label>
                <textarea 
                  {...register('lastAddress')} 
                  rows={2} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* HOSPITAL TAB */}
          <div className={activeTab === 'hospital' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Hospital Admission (If applicable)</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                <input 
                  type="text" 
                  {...register('hospitalName')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward Number</label>
                <input 
                  type="text" 
                  {...register('wardNo')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BHT Number</label>
                <input 
                  type="text" 
                  {...register('bhtNo')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>

          {/* INQUEST ORDER TAB */}
          <div className={activeTab === 'inquest' ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-900 border-b pb-2">Magisterial / Inquest Information</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inquest Number</label>
                <input 
                  type="number" 
                  {...register('inquestOrder.inquestNumber', { valueAsNumber: true })} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Inquest</label>
                <input 
                  type="date" 
                  {...register('inquestOrder.dateOfInquest')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inquirer Full Name</label>
                <input 
                  type="text" 
                  {...register('inquestOrder.inquirerFullName')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inquirer Designation</label>
                <input 
                  type="text" 
                  {...register('inquestOrder.inquirerDesignation')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Magistrate</label>
                <input 
                  type="text" 
                  {...register('inquestOrder.magistrate')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
                <input 
                  type="text" 
                  {...register('inquestOrder.court')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Court Case No</label>
                <input 
                  type="text" 
                  {...register('inquestOrder.caseNo')} 
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Police Station Area</label>
                  <input 
                    type="text" 
                    {...register('inquestOrder.policeStationArea')} 
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Police Officer In-Charge</label>
                  <input 
                    type="text" 
                    {...register('inquestOrder.policeOfficerIncharge')} 
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center pt-2">
                <input 
                  type="checkbox" 
                  id="inquirerIntoSuddenDeaths" 
                  {...register('inquestOrder.inquirerIntoSuddenDeaths')} 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <label htmlFor="inquirerIntoSuddenDeaths" className="ml-2 block text-sm text-gray-900">
                  Conducted by Inquirer into Sudden Deaths (ISD)
                </label>
              </div>
            </div>
          </div>

          {/* IDENTIFIERS TAB */}
          <div className={activeTab === 'identifiers' ? 'block' : 'hidden'}>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-sm font-medium text-gray-900">People who identified the body</h3>
              <button 
                type="button" 
                onClick={() => appendIdentifier({ fullName: '', relationship: '', contactNo: '', nicNumber: '', residingAddress: '' } as any)} 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Identifier
              </button>
            </div>
            
            {identifierFields.length === 0 ? (
              <p className="text-sm text-gray-500 italic py-4 text-center">No identifiers added. Click "Add Identifier" if applicable.</p>
            ) : (
              <div className="space-y-4">
                {identifierFields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                    <button 
                      type="button" 
                      onClick={() => removeIdentifier(index)} 
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                      title="Remove Identifier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                          type="text" 
                          {...register(`identifiers.${index}.fullName` as const)} 
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 text-sm" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Relationship</label>
                        <input 
                          type="text" 
                          {...register(`identifiers.${index}.relationship` as const)} 
                          placeholder="e.g. Spouse, Police Officer"
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 text-sm" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">NIC No</label>
                        <input 
                          type="text" 
                          {...register(`identifiers.${index}.nicNumber` as const)} 
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 text-sm" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Contact No</label>
                        <input 
                          type="text" 
                          {...register(`identifiers.${index}.contactNo` as const)} 
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 text-sm" 
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                        <input 
                          type="text" 
                          {...register(`identifiers.${index}.residingAddress` as const)} 
                          className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/postmortems')}
            className="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Register Body
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeceasedForm;
