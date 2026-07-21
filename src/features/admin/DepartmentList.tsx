import React, { useEffect, useState } from 'react';
import { type Department, departmentService } from '../../services/department.service';
import { Plus, Trash2 } from 'lucide-react';
import { parseApiError } from '../../utils/errorHandler';

export const DepartmentList: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDeptName, setNewDeptName] = useState('');

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        try {
            const data = await departmentService.getAllDepartments();
            setDepartments(data);
        } catch (error) {
            console.error("Failed to load departments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newDeptName.trim()) {
            alert("Please enter a department name.");
            return;
        }
        try {
            await departmentService.createDepartment({ deptName: newDeptName });
            setNewDeptName('');
            loadDepartments();
        } catch (error: unknown) {
            console.error("Failed to create department", error);
            alert(parseApiError(error, "Failed to create department."));
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await departmentService.deleteDepartment(id);
            loadDepartments();
        } catch (error) {
            console.error("Failed to delete department", error);
        }
    };

    if (loading) return <div>Loading departments...</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Departments</h2>
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="New Department Name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                    onClick={handleCreate}
                    disabled={!newDeptName.trim() || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    <Plus size={18} /> Add
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 font-medium text-gray-600">ID</th>
                            <th className="py-3 px-4 font-medium text-gray-600">Department Name</th>
                            <th className="py-3 px-4 font-medium text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((dept) => (
                            <tr key={dept.deptId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-gray-600">{dept.deptId}</td>
                                <td className="py-3 px-4 text-gray-800 font-medium">{dept.deptName}</td>
                                <td className="py-3 px-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(dept.deptId)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {departments.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-500">
                                    No departments found. Create one above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
