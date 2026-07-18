import api from './api';

export type SubstanceInfluence = 'NEGATIVE' | 'CONSUMED_SMELLING' | 'UNDER_INFLUENCE';

export interface IndividualInjury {
  injuryId?: number;
  typeOfInjury?: string;
  sizeOfInjury?: string;
  placementOfInjury?: string;
  estimatedAgeOfInjury?: string;
  weaponType?: string;
  otherObservations?: string;
}

export interface Referral {
  referralId?: number;
  referredTo?: string;
  reasonForReferral?: string;
  referralDate?: string; // YYYY-MM-DD
  reportReceived?: boolean;
}

export interface MlefRecord {
  mlefId?: number;
  policeRefNo: string;
  policeDateOfIssue: string; // YYYY-MM-DD
  reasonForReferral: string;
  dateTimeExamined: string; // YYYY-MM-DDTHH:mm:ss
  placeExamined: string;

  // Nature of bodily harm booleans
  injuryAbrasion: boolean;
  injuryContusion: boolean;
  injuryLaceration: boolean;
  injuryStab: boolean;
  injuryCut: boolean;
  injuryFracture: boolean;
  injuryFirearm: boolean;
  injuryBurns: boolean;
  injuryBite: boolean;
  injuryDislocation: boolean;
  injuryExplosive: boolean;
  injuryNone: boolean;
  internalInjuries: boolean;
  othersNatureOfHarm?: string;

  // Alcohol and Drug
  breathingSmellIntensity?: string;
  alcoholInfluence?: SubstanceInfluence;
  drugConsumed?: boolean;
  drugInfluence?: SubstanceInfluence;

  // Sexual Assault
  sexualAssaultBriefHistory?: string;
  signsVaginalHymenPenetration?: boolean;
  signsAnalPenetration?: boolean;
  signsInterLabialPenetration?: boolean;
  otherOpinionsRecommendations?: string;

  // Hospital
  hospitalName?: string;
  hospitalWard?: string;
  hospitalBhtNo?: string;
  dateAdmitted?: string; // YYYY-MM-DD
  timeAdmitted?: string; // HH:mm:ss
  dateDischarged?: string; // YYYY-MM-DD

  remarks?: string;
  shortHistoryGivenByPatient?: string;

  // Patient ID Reference
  patientId: number;
  broughtByOfficerId?: number;
  assignedMedicalOfficerId?: number;

  // Nested children
  injuries?: IndividualInjury[];
  referrals?: Referral[];
}

export const caseService = {
  getAll: async (): Promise<MlefRecord[]> => {
    const response = await api.get('/clinical/mlef');
    return response.data;
  },
  getById: async (id: number): Promise<MlefRecord> => {
    const response = await api.get(`/clinical/mlef/${id}`);
    return response.data;
  },
  create: async (data: MlefRecord): Promise<MlefRecord> => {
    const response = await api.post('/clinical/mlef', data);
    return response.data;
  },
  update: async (id: number, data: MlefRecord): Promise<MlefRecord> => {
    const response = await api.put(`/clinical/mlef/${id}`, data);
    return response.data;
  }
};
