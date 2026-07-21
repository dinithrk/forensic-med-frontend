import React, { useState, useEffect } from 'react';
import { staffService, type StaffRequestDto } from '../../services/staff.service';
import { type Department, departmentService } from '../../services/department.service';
import { X } from 'lucide-react';
import { parseApiError } from '../../utils/errorHandler';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingStaff?: import('../../services/staff.service').StaffResponseDto | null;
}

export const StaffFormModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, editingStaff }) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [formData, setFormData] = useState<StaffRequestDto>({
        username: '',
        password: '',
        roles: ['CLERICAL_OFFICER'],
        fullName: '',
        slmcRegNo: '',
        designation: '',
        qualifications: '',
        specialization: ''
    });
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            departmentService.getAllDepartments().then(setDepartments).catch(console.error);
            if (editingStaff) {
                setFormData({
                    username: editingStaff.username,
                    password: '',
                    roles: editingStaff.roles,
                    fullName: editingStaff.fullName || '',
                    slmcRegNo: editingStaff.slmcRegNo || '',
                    designation: editingStaff.designation || '',
                    qualifications: editingStaff.qualifications || '',
                    specialization: editingStaff.specialization || '',
                    departmentId: editingStaff.departmentId
                });
            } else {
                setFormData({
                    username: '',
                    password: '',
                    roles: ['CLERICAL_OFFICER'],
                    fullName: '',
                    slmcRegNo: '',
                    designation: '',
                    qualifications: '',
                    specialization: ''
                });
            }
        }
    }, [isOpen, editingStaff]);

    if (!isOpen) return null;

    const availableRoles = ['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER', 'POLICE_OFFICER', 'LABORATORY_STAFF'];

    const handleRoleToggle = (role: string) => {
        const current = formData.roles || [];
        if (current.includes(role)) {
            setFormData({ ...formData, roles: current.filter(r => r !== role) });
        } else {
            setFormData({ ...formData, roles: [...current, role] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingStaff) {
                await staffService.updateStaffProfile(editingStaff.userId, formData);
                if (formData.username || formData.password) {
                    await staffService.updateStaffCredentials(editingStaff.userId, { 
                        username: formData.username, 
                        password: formData.password 
                    });
                }
            } else {
                await staffService.createStaff(formData);
            }
            onSuccess();
        } catch (error: unknown) {
            console.error("Failed to save staff", error);
            alert(parseApiError(error, "Failed to save staff member."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Account Details */}
                        <div className="col-span-2 md:col-span-1 space-y-4">
                            <h4 className="font-medium text-gray-700 pb-2 border-b">Account Details</h4>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Username *</label>
                                <input 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Password {editingStaff ? '(Leave blank to keep current)' : '*'}</label>
                                <input 
                                    required={!editingStaff}
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Roles */}
                        <div className="col-span-2 md:col-span-1 space-y-4">
                            <h4 className="font-medium text-gray-700 pb-2 border-b">System Roles</h4>
                            <div className="space-y-2">
                                {availableRoles.map(role => (
                                    <label key={role} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={(formData.roles || []).includes(role)}
                                            onChange={() => handleRoleToggle(role)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        {role.replace('_', ' ')}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Personal/Professional Details */}
                        <div className="col-span-2 space-y-4 mt-2">
                            <h4 className="font-medium text-gray-700 pb-2 border-b">Professional Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                                    <input 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Department</label>
                                    <select 
                                        disabled={!!editingStaff}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                                        value={formData.departmentId || ''}
                                        onChange={e => setFormData({...formData, departmentId: e.target.value ? Number(e.target.value) : undefined})}
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(d => (
                                            <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Designation</label>
                                    <input 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.designation}
                                        onChange={e => setFormData({...formData, designation: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">SLMC Reg No (Doctors only)</label>
                                    <input 
                                        disabled={!!editingStaff}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                                        value={formData.slmcRegNo || ''}
                                        onChange={e => setFormData({...formData, slmcRegNo: e.target.value})}
                                    />
                                </div>
                                
                                {/* Qualifications taking up full width in grid */}
                                <div className="col-span-2">
                                    <label className="block text-sm text-gray-600 mb-1">Qualifications</label>
                                    <input 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={formData.qualifications}
                                        placeholder="e.g. MBBS, MD (Forensic Medicine)"
                                        onChange={e => setFormData({...formData, qualifications: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : editingStaff ? 'Save Changes' : 'Create Staff Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
