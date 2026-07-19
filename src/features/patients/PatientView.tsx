import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientService, type Patient } from '../../services/patient.service';
import { Loader2, ArrowLeft, Edit, AlertCircle, User, FileText, Calendar } from 'lucide-react';

const PatientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (id) {
          const data = await patientService.getById(parseInt(id));
          setPatient(data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start max-w-4xl mx-auto">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <p className="text-sm text-red-700">{error || 'Patient not found'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
            <p className="text-sm text-gray-500">ID: PT-{patient.patientId?.toString().padStart(4, '0')}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/patients/${id}/edit`)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Patient
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:col-span-2">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
            <User className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <span className="block text-sm font-medium text-gray-500">Full Name</span>
              <span className="mt-1 block text-base text-gray-900">{patient.fullName}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Age / Sex</span>
              <span className="mt-1 block text-base text-gray-900">
                {patient.age ? `${patient.age} yrs` : 'Unknown'} / {patient.sex || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Date of Birth</span>
              <span className="mt-1 block text-base text-gray-900">{patient.dateOfBirth || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Address</span>
              <span className="mt-1 block text-base text-gray-900">{patient.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">Identification</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-500">NIC Number</span>
              <span className="mt-1 block text-base text-gray-900">{patient.nicNo || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">Passport Number</span>
              <span className="mt-1 block text-base text-gray-900">{patient.passportNo || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">Consent & Status</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <span className="block text-sm font-medium text-gray-500">Medical Consent</span>
              <span className="mt-1 block text-base text-gray-900">
                {patient.consentGiven ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Consent Given
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    No Consent
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientView;
