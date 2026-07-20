import api from './api';

export interface SearchResult {
  id: number;
  label: string;
  type: 'CASE' | 'POSTMORTEM';
}

export const searchService = {
  searchCases: async (query: string): Promise<SearchResult[]> => {
    const response = await api.get(`/search/cases`, { params: { query } });
    return response.data;
  },
  
  searchPostmortems: async (query: string): Promise<SearchResult[]> => {
    const response = await api.get(`/search/postmortems`, { params: { query } });
    return response.data;
  }
};
