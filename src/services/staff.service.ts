import api from './api';

export interface StaffRequestDto {
    username?: string;
    password?: string;
    roles?: string[];
    fullName?: string;
    slmcRegNo?: string;
    designation?: string;
    qualifications?: string;
    departmentId?: number;
    contactNumbers?: string[];
    specialization?: string;
}

export interface StaffResponseDto {
    userId: number;
    username: string;
    roles: string[];
    staffId: number;
    fullName: string;
    slmcRegNo: string;
    designation: string;
    qualifications: string;
    departmentId: number;
    departmentName: string;
    contactNumbers: string[];
    specialization: string;
}

export const staffService = {
    getAllStaff: async () => {
        const response = await api.get<StaffResponseDto[]>('/admin/staff');
        return response.data;
    },

    getStaffById: async (id: number) => {
        const response = await api.get<StaffResponseDto>(`/admin/staff/${id}`);
        return response.data;
    },

    createStaff: async (data: StaffRequestDto) => {
        const response = await api.post<StaffResponseDto>('/admin/staff', data);
        return response.data;
    },

    updateStaffProfile: async (id: number, data: StaffRequestDto) => {
        const response = await api.put<StaffResponseDto>(`/admin/staff/${id}/profile`, data);
        return response.data;
    },

    updateStaffCredentials: async (id: number, data: { username?: string, password?: string }) => {
        const response = await api.put(`/admin/staff/${id}/credentials`, data);
        return response.data;
    },

    deleteStaff: async (id: number) => {
        await api.delete(`/admin/staff/${id}`);
    }
};
