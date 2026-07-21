import React, { useEffect, useState } from 'react';
import { type StaffResponseDto } from '../../services/staff.service';
import { profileService, type ProfileUpdateRequest } from '../../services/profile.service';
import { User, Shield, Briefcase, Hash } from 'lucide-react';

export const ProfileView: React.FC = () => {
    const [profile, setProfile] = useState<StaffResponseDto | null>(null);
    const [formData, setFormData] = useState<ProfileUpdateRequest>({ username: '', password: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await profileService.getMyProfile();
            setProfile(data);
            setFormData({ username: data.username, password: '' });
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const msg = await profileService.updateMyCredentials(formData);
            setMessage(msg);
            setFormData({ ...formData, password: '' }); // Clear password field
            loadProfile();
        } catch (error) {
            console.error("Failed to update credentials", error);
            setMessage('Failed to update credentials.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading profile...</div>;
    if (!profile) return <div>Error loading profile.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Credentials Edit Form */}
                <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4">Login Credentials</h3>
                    
                    {message && (
                        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Username</label>
                            <input 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">New Password (leave blank to keep current)</label>
                            <input 
                                type="password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={saving}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Updating...' : 'Update Credentials'}
                        </button>
                    </form>
                </div>

                {/* Read-Only Profile Details */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-6">Profile Information (Read-Only)</h3>
                    
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><User size={14}/> Full Name</span>
                            <span className="font-medium text-gray-900 mt-1">{profile.fullName || 'N/A'}</span>
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><Shield size={14}/> System Roles</span>
                            <div className="flex gap-1 flex-wrap mt-1">
                                {profile.roles.map(r => (
                                    <span key={r} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                                        {r.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><Briefcase size={14}/> Department</span>
                            <span className="font-medium text-gray-900 mt-1">{profile.departmentName || 'Not Assigned'}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><Briefcase size={14}/> Designation</span>
                            <span className="font-medium text-gray-900 mt-1">{profile.designation || 'N/A'}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><Hash size={14}/> SLMC Reg No</span>
                            <span className="font-medium text-gray-900 mt-1">{profile.slmcRegNo || 'N/A'}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><User size={14}/> Qualifications</span>
                            <span className="font-medium text-gray-900 mt-1">{profile.qualifications || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
