import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientService, type Patient, type Gender } from '../../services/patient.service';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

const PatientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Patient>({
    fullName: '',
    address: '',
    dateOfBirth: '',
    sex: 'UNKNOWN',
    nicNo: '',
    passportNo: '',
    consentGiven: false,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      fetchPatient(parseInt(id, 10));
    }
  }, [id, isEditMode]);

  const fetchPatient = async (patientId: number) => {
    try {
      const data = await patientService.getById(patientId);
      setFormData({
        ...data,
        // Ensure nulls from backend are mapped to empty strings for controlled inputs
        nicNo: data.nicNo || '',
        passportNo: data.passportNo || '',
        address: data.address || '',
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load patient data.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditMode && id) {
        await patientService.update(parseInt(id, 10), formData);
      } else {
        await patientService.create(formData);
      }
      navigate('/patients');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save patient. Please check the inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/patients')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Back to List"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Patient' : 'Register New Patient'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode ? `Updating details for patient ID #${id}` : 'Enter the demographic details for the new patient.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="nicNo" className="block text-sm font-medium text-gray-700">National ID (NIC)</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="nicNo"
                  id="nicNo"
                  value={formData.nicNo}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="passportNo" className="block text-sm font-medium text-gray-700">Passport Number</label>
              <div className="mt-1">
                <input
                  type="text"
                  name="passportNo"
                  id="passportNo"
                  value={formData.passportNo}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth *</label>
              <div className="mt-1">
                <input
                  type="date"
                  name="dateOfBirth"
                  id="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Gender *</label>
              <div className="mt-1">
                <select
                  id="sex"
                  name="sex"
                  required
                  value={formData.sex}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                >
                  <option value="UNKNOWN">Unknown</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <div className="mt-1">
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md border p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm outline-none"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="consentGiven"
                    name="consentGiven"
                    type="checkbox"
                    checked={formData.consentGiven}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="consentGiven" className="font-medium text-gray-700">Medical Consent Given</label>
                  <p className="text-gray-500">Check this box if the patient or legal guardian has provided explicit medical consent.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Patient
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
