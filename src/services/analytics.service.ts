import api from './api';

export interface DashboardSummary {
  totalCases: number;
  totalClinicalCases: number;
  totalPostmortemCases: number;
  pendingReports: number;
  completedReports: number;
  averageReportTurnaroundTime: number;
  averageCasesPerDay: number;
  activeMedicalOfficers: number;
}

export interface MonthlyVolumeItem {
  month: string;
  clinical: number;
  postmortem: number;
  total: number;
}

export interface CategoryBreakdownItem {
  category: string;
  count: number;
  percentage: number;
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
  percentage: number;
}

export interface TurnaroundMonthlyItem {
  month: string;
  averageDays: number;
}

export interface TurnaroundMetrics {
  averageDays: number;
  medianDays: number;
  minimum: number;
  maximum: number;
  monthlyAverages: TurnaroundMonthlyItem[];
}

export interface OfficerWorkload {
  officerId: number;
  officerName: string;
  totalCases: number;
  pendingReports: number;
  completedReports: number;
  averageTurnaroundDays: number;
}

export interface ExaminationTrends {
  month: string;
  examinationsPerformed: number;
  reportsIssued: number;
  caseCompletions: number;
}

export interface TimeDistribution {
  weekdayDistribution: Record<string, number>;
  monthDistribution: Record<string, number>;
  yearDistribution: Record<string, number>;
}

export interface AllAnalyticsData {
  summary: DashboardSummary;
  monthlyVolume: MonthlyVolumeItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  statusBreakdown: StatusBreakdownItem[];
  turnaroundMetrics: TurnaroundMetrics;
  officerWorkload: OfficerWorkload[];
  examinationTrends: ExaminationTrends[];
  timeDistribution: TimeDistribution;
}

export const analyticsService = {
  getAllAnalytics: async (startDate?: string, endDate?: string): Promise<AllAnalyticsData> => {
    const params = { startDate, endDate };
    const response = await api.get('/analytics/all', { params });
    return response.data;
  },

  exportPdf: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const response = await api.get('/analytics/export/pdf', {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    return response.data;
  },

  exportCsv: async (startDate?: string, endDate?: string): Promise<Blob> => {
    const response = await api.get('/analytics/export/csv', {
      params: { startDate, endDate },
      responseType: 'blob'
    });
    return response.data;
  }
};
