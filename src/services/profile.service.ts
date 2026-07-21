import api from './api';
import { type StaffResponseDto } from './staff.service';

export interface ProfileUpdateRequest {
    username?: string;
    password?: string;
}

export const profileService = {
    getMyProfile: async () => {
        const response = await api.get<StaffResponseDto>('/profile');
        return response.data;
    },

    updateMyCredentials: async (data: ProfileUpdateRequest) => {
        const response = await api.put<string>('/profile/credentials', data);
        return response.data;
    }
};
