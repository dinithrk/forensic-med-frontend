import api from './api';

export interface Department {
    deptId: number;
    deptName: string;
}

export const departmentService = {
    getAllDepartments: async () => {
        const response = await api.get<Department[]>('/admin/departments');
        return response.data;
    },
    
    getDepartmentById: async (id: number) => {
        const response = await api.get<Department>(`/admin/departments/${id}`);
        return response.data;
    },

    createDepartment: async (data: Omit<Department, 'deptId'>) => {
        const response = await api.post<Department>('/admin/departments', data);
        return response.data;
    },

    updateDepartment: async (id: number, data: Department) => {
        const response = await api.put<Department>(`/admin/departments/${id}`, data);
        return response.data;
    },

    deleteDepartment: async (id: number) => {
        await api.delete(`/admin/departments/${id}`);
    }
};
