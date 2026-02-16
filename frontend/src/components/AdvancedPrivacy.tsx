'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Shield, Download, Trash2, Eye, Users, Lock } from 'lucide-react';

export default function AdvancedPrivacy() {
    const { user, token } = useAuth();
    const [activityVisibility, setActivityVisibility] = useState<'public' | 'friends' | 'private'>('friends');
    const [dataRetentionDays, setDataRetentionDays] = useState(365);

    const handleExportData = async () => {
        if (!token) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/export-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `habitflow-data-${new Date().toISOString().split('T')[0]}.zip`;
            a.click();
            URL.revokeObjectURL(url);

            alert('Data exported successfully');
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export data');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.prompt(
            'This will permanently delete your account and all data. Type "DELETE" to confirm:'
        );

        if (confirmed !== 'DELETE') {
            return;
        }

        if (!token) return;

        try {
            await api.delete('/api/auth/account', token);
            localStorage.clear();
            window.location.href = '/auth/login';
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete account');
        }
    };

    const savePrivacySettings = async () => {
        if (!token) return;

        try {
            await api.post('/api/auth/privacy-settings', {
                activity_visibility: activityVisibility,
                data_retention_days: dataRetentionDays
            }, token);
            alert('Privacy settings saved');
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save settings');
        }
    };

    return (
        <div className="space-y-4">
            {/* Activity Visibility */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Eye size={16} className="text-neutral-500" />
                    <h4 className="text-sm font-semibold text-neutral-700">Activity Visibility</h4>
                </div>
                <div className="space-y-2">
                    {[
                        { id: 'public', name: 'Public', desc: 'Anyone can see your activity', icon: Eye },
                        { id: 'friends', name: 'Friends Only', desc: 'Only friends can see your activity', icon: Users },
                        { id: 'private', name: 'Private', desc: 'Only you can see your activity', icon: Lock }
                    ].map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setActivityVisibility(option.id as any)}
                            className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center gap-3 ${activityVisibility === option.id
                                    ? 'bg-primary-50 border-2 border-primary-500'
                                    : 'bg-neutral-50 border border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            <option.icon size={18} className={activityVisibility === option.id ? 'text-primary-600' : 'text-neutral-400'} />
                            <div className="flex-1">
                                <div className="font-medium text-sm">{option.name}</div>
                                <div className="text-xs text-neutral-500">
                                    {option.desc}
                                </div>
                            </div>
                            {activityVisibility === option.id && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Retention */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Data Retention</h4>
                <label className="block text-xs font-medium text-neutral-600 mb-2">
                    Keep data for: <span className="font-semibold">{dataRetentionDays} days</span>
                </label>
                <input
                    type="range"
                    min="30"
                    max="3650"
                    step="30"
                    value={dataRetentionDays}
                    onChange={(e) => setDataRetentionDays(parseInt(e.target.value))}
                    className="w-full"
                />
                <div className="mt-2 text-xs text-neutral-500">
                    Older data will be automatically deleted
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={savePrivacySettings}
                className="w-full px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            >
                Save Privacy Settings
            </button>

            {/* Data Export */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Download size={16} className="text-blue-700" />
                    <h4 className="text-sm font-semibold text-blue-900">Export Your Data</h4>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                    Download all your data in a machine-readable format
                </p>
                <button
                    onClick={handleExportData}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Download size={16} />
                    <span>Export All Data</span>
                </button>
            </div>

            {/* Delete Account */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Trash2 size={16} className="text-red-700" />
                    <h4 className="text-sm font-semibold text-red-900">Danger Zone</h4>
                </div>
                <p className="text-sm text-red-800 mb-3">
                    Permanently delete your account and all data. This cannot be undone.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <Trash2 size={16} />
                    <span>Delete Account</span>
                </button>
            </div>
        </div>
    );
}
