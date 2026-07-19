import api from './api';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

export interface IdentifierDto {
  identifierId?: number;
  identifierName?: string;
  relationship?: string;
  contactNo?: string;
  address?: string;
  nicNo?: string;
}

export interface InquestOrderDto {
  inquestNumber?: number;
  dateOfInquest?: string;
  inquirerFullName?: string;
  inquirerDesignation?: string;
  magistrate?: string;
  policeStationArea?: string;
  policeOfficerIncharge?: string;
  inquirerIntoSuddenDeaths?: boolean;
  court?: string;
  caseNo?: string;
}

export interface DeceasedDto {
  deceasedId?: number;
  fullName: string;
  ageWhenDied?: number;
  sex: Gender;
  lastAddress?: string;
  placeOfDeath?: string;
  hospitalName?: string;
  bhtNo?: string;
  wardNo?: string;
  dateOfDeath?: string;
  timeOfDeath?: string;
  identifiers?: IdentifierDto[];
  inquestOrder?: InquestOrderDto;
}

export interface CauseOfDeathDto {
  causeDescription: string;
  severity?: string;
  aproxTFromOnsetToDeath?: string;
}

export interface PreAutopsyInformationDto {
  recordId?: number;
  recordDetails: string;
  informationCategory: string;
}

export interface MedicalOfficerDto {
  officerId: number;
  fullName: string;
  qualifications?: string;
  slmcRegNo?: string;
  designation?: string;
}

export interface AutopsyExamDto {
  autopsyId?: number;
  autopsyReportPdf?: string;
  health1135aDoc?: string;
  maternalDeathCategory?: string;
  underInvestigation?: boolean;
  causesOfDeath?: CauseOfDeathDto[];
  comments?: string[];
}

export interface PostMortemDto {
  pmSerialNo?: number;
  dateTimeOfPmExam: string; // YYYY-MM-DDTHH:mm:ss
  placeOfExamination?: string;
  district?: string;
  underInvestigation?: boolean;
  specimensRetained?: boolean;
  deceasedId: number;
  medicalOfficerIds?: number[];
  preAutopsyInformation?: PreAutopsyInformationDto[];
  autopsyExam?: AutopsyExamDto;
}

export const medicalOfficerService = {
  getAll: async (): Promise<MedicalOfficerDto[]> => {
    const response = await api.get('/staff/medical-officers');
    return response.data;
  }
};

export const deceasedService = {
  getAll: async (): Promise<DeceasedDto[]> => {
    const response = await api.get('/deceased');
    return response.data;
  },
  getById: async (id: number): Promise<DeceasedDto> => {
    const response = await api.get(`/deceased/${id}`);
    return response.data;
  },
  create: async (data: DeceasedDto): Promise<DeceasedDto> => {
    const response = await api.post('/deceased', data);
    return response.data;
  }
};

export const postMortemService = {
  getAllForDeceased: async (deceasedId: number): Promise<PostMortemDto[]> => {
    const response = await api.get(`/deceased/${deceasedId}/post-mortems`);
    return response.data;
  },
  getById: async (deceasedId: number, pmId: number): Promise<PostMortemDto> => {
    const response = await api.get(`/deceased/${deceasedId}/post-mortems/${pmId}`);
    return response.data;
  },
  create: async (deceasedId: number, data: PostMortemDto): Promise<PostMortemDto> => {
    const response = await api.post(`/deceased/${deceasedId}/post-mortems`, data);
    return response.data;
  },
  finalizeAutopsy: async (deceasedId: number, pmId: number, data: AutopsyExamDto): Promise<PostMortemDto> => {
    const response = await api.put(`/deceased/${deceasedId}/post-mortems/${pmId}/finalize`, data);
    return response.data;
  }
};
