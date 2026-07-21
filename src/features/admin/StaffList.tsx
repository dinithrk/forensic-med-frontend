import React, { useEffect, useState } from 'react';
import { type StaffResponseDto, staffService } from '../../services/staff.service';
import { StaffFormModal } from './StaffFormModal';
import { Plus, Trash2 } from 'lucide-react';

export const StaffList: React.FC = () => {
    const [staff, setStaff] = useState<StaffResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffResponseDto | null>(null);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            const data = await staffService.getAllStaff();
            setStaff(data);
        } catch (error) {
            console.error("Failed to load staff", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;
        try {
            await staffService.deleteStaff(id);
            loadStaff();
        } catch (error) {
            console.error("Failed to delete staff", error);
        }
    };

    if (loading) return <div>Loading staff...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Staff Members</h2>
                <button
                    onClick={() => {
                        setEditingStaff(null);
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> New Staff
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 font-medium text-gray-600">Username</th>
                            <th className="py-3 px-4 font-medium text-gray-600">Name</th>
                            <th className="py-3 px-4 font-medium text-gray-600">Roles</th>
                            <th className="py-3 px-4 font-medium text-gray-600">Department</th>
                            <th className="py-3 px-4 font-medium text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.map((s) => (
                            <tr key={s.userId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-gray-800">{s.username}</td>
                                <td className="py-3 px-4 text-gray-600">{s.fullName || '-'}</td>
                                <td className="py-3 px-4 text-gray-600">
                                    <div className="flex gap-1 flex-wrap">
                                        {s.roles.map(r => (
                                            <span key={r} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">{r}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-600">{s.departmentName || '-'}</td>
                                <td className="py-3 px-4 text-right">
                                    <button 
                                        onClick={() => {
                                            setEditingStaff(s);
                                            setIsModalOpen(true);
                                        }}
                                        className="text-blue-500 hover:text-blue-700 p-1"
                                        title="Edit"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(s.userId)}
                                        className="text-red-500 hover:text-red-700 p-1 ml-2"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {staff.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    No staff members found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <StaffFormModal 
                isOpen={isModalOpen} 
                editingStaff={editingStaff}
                onClose={() => setIsModalOpen(false)} 
                onSuccess={() => {
                    setIsModalOpen(false);
                    loadStaff();
                }} 
            />
        </div>
    );
};
