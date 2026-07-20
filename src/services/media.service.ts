import api from './api';

export interface MediaAsset {
  mediaId?: number;
  filePath: string;
  fileName?: string;
  type: string;
  pmSerialNo?: number;
  mlefId?: number;
  description?: string;
  captureDate?: string;
}

export interface Photograph extends MediaAsset {
  captureDate?: string;
  description?: string;
  caption?: string;
}

export const mediaService = {
  uploadMedia: async (file: File, data: Partial<MediaAsset>): Promise<MediaAsset> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  uploadPhotograph: async (file: File, data: Partial<Photograph>): Promise<Photograph> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    const response = await api.post('/media/upload/photograph', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getMediaForPostMortem: async (pmSerialNo: number): Promise<MediaAsset[]> => {
    const response = await api.get(`/media/postmortems/${pmSerialNo}`);
    return response.data;
  },

  getMediaForCase: async (mlefId: number): Promise<MediaAsset[]> => {
    const response = await api.get(`/media/cases/${mlefId}`);
    return response.data;
  }
};
