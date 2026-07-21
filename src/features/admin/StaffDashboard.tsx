import React, { useState } from 'react';
import { DepartmentList } from './DepartmentList';
import { StaffList } from './StaffList';

export const StaffDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'staff' | 'departments'>('staff');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Administration</h1>
            </div>

            <div className="bg-white rounded-lg p-1 inline-flex shadow-sm border border-gray-200">
                <button
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'staff'
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('staff')}
                >
                    Staff Management
                </button>
                <button
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'departments'
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('departments')}
                >
                    Departments
                </button>
            </div>

            {activeTab === 'staff' ? <StaffList /> : <DepartmentList />}
        </div>
    );
};
