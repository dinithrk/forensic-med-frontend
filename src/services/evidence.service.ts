import api from './api';

export interface ChainOfCustody {
  custodyId?: number;
  deliveredByName: string;
  deliveredByNic?: string;
  deliveredByOccupation?: string;
  deliveryDate: string;
  deliveryTime?: string;
  jmoSignatureStatus: boolean;
  acceptedByName: string;
  acceptedDate: string;
}

export interface ForensicSample {
  sampleId?: number;
  specimenType: string;
  organSource?: string;
  numberOfTissues?: number;
  productionNumber?: string;
  referredInstitution?: string;
  collectionDate?: string;
  collectedBy?: string;

  caseId?: number;
  pmSerialNo?: number;
  
  chainOfCustody?: ChainOfCustody[];
}

export const evidenceService = {
  getAllSamples: async (): Promise<ForensicSample[]> => {
    const response = await api.get('/evidence/samples');
    return response.data;
  },
  
  getSampleById: async (id: number): Promise<ForensicSample> => {
    const response = await api.get(`/evidence/samples/${id}`);
    return response.data;
  },

  registerSample: async (data: ForensicSample): Promise<ForensicSample> => {
    const response = await api.post('/evidence/samples', data);
    return response.data;
  },

  updateSample: async (id: number, data: ForensicSample): Promise<ForensicSample> => {
    const response = await api.put(`/evidence/samples/${id}`, data);
    return response.data;
  },

  logCustodyTransfer: async (sampleId: number, data: ChainOfCustody): Promise<ChainOfCustody> => {
    const response = await api.post(`/evidence/samples/${sampleId}/chain-of-custody`, data);
    return response.data;
  }
};
