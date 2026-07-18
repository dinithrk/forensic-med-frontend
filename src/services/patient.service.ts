import api from './api';

export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface Patient {
  patientId?: number;
  fullName: string;
  address: string;
  dateOfBirth: string; // YYYY-MM-DD
  age?: number;
  sex: Gender;
  nicNo: string;
  passportNo: string;
  consentGiven: boolean;
}

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data;
  },
  getById: async (id: number): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  create: async (data: Patient): Promise<Patient> => {
    const response = await api.post('/patients', data);
    return response.data;
  },
  update: async (id: number, data: Patient): Promise<Patient> => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  }
};
