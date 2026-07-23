import api from './api';

export interface KpiSummary {
  totalCases: number;
  clinicalCasesCount: number;
  postmortemCasesCount: number;
  pendingReportsCount: number;
  avgTurnaroundDays: number;
}

export interface MonthlyVolumeItem {
  month: string;
  yearMonth: string;
  clinical: number;
  postmortem: number;
  total: number;
}

export interface CategoryCountItem {
  category: string;
  count: number;
  percentage?: number;
}

export interface OfficerCaseloadItem {
  doctorName: string;
  clinicalCount: number;
  postmortemCount: number;
  totalCount: number;
}

export interface DashboardAnalyticsData {
  kpis: KpiSummary;
  monthlyVolume: MonthlyVolumeItem[];
  categoryBreakdown: CategoryCountItem[];
  mannerOfDeathBreakdown: CategoryCountItem[];
  officerCaseload: OfficerCaseloadItem[];
  reportStatusDistribution: CategoryCountItem[];
}

export const getDashboardAnalytics = async (
  preset: string = 'this_year',
  startDate?: string,
  endDate?: string
): Promise<DashboardAnalyticsData> => {
  const params: Record<string, string> = { preset };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await api.get<DashboardAnalyticsData>('/analytics/dashboard', { params });
  return response.data;
};
