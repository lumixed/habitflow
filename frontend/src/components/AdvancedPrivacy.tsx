'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Download, Trash2, Eye, Users, Lock } from 'lucide-react';

export default function AdvancedPrivacy() {
    const { user, token, updateUser } = useAuth();
    const [activityVisibility, setActivityVisibility] = useState<'public' | 'friends' | 'private'>('friends');
    const [dataRetentionDays, setDataRetentionDays] = useState(365);
    const [scheduledExportEnabled, setScheduledExportEnabled] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [is2FALoading, setIs2FALoading] = useState(false);

    useEffect(() => {
        if (user) {
            setActivityVisibility(user.is_profile_public ? 'public' : 'private');
            if (user.data_retention_days) setDataRetentionDays(user.data_retention_days);
            if (user.scheduled_export_enabled !== undefined) setScheduledExportEnabled(user.scheduled_export_enabled);
        }
    }, [user]);

    const handleExportData = async () => {
        if (!token) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/export-data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `habitflow-data-${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('Data exported successfully. Your ZIP file includes JSON and CSV formats.');
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export data');
        }
    };

    const handleSetup2FA = async () => {
        if (!token) return;
        setIs2FALoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/setup`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setQrCodeUrl(data.qrCodeUrl);
            setTwoFactorSecret(data.secret);
            setShow2FASetup(true);
        } catch (err) {
            console.error('2FA setup failed:', err);
            alert('Failed to initiate 2FA setup');
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (!token || !verificationToken) return;
        setIs2FALoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: verificationToken })
            });
            if (response.ok) {
                alert('2FA enabled successfully');
                setShow2FASetup(false);
                updateUser({ two_factor_enabled: true });
            } else {
                alert('Invalid token');
            }
        } catch (err) {
            console.error('2FA verification failed:', err);
            alert('Failed to verify 2FA');
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!token) return;
        const code = window.prompt('Enter your 2FA code to disable it:');
        if (!code) return;

        setIs2FALoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/2fa/disable`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: code })
            });
            if (response.ok) {
                alert('2FA disabled successfully');
                updateUser({ two_factor_enabled: false });
            } else {
                alert('Invalid token or failed to disable');
            }
        } catch (err) {
            console.error('2FA disable failed:', err);
            alert('Failed to disable 2FA');
        } finally {
            setIs2FALoading(false);
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
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/privacy-settings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_profile_public: activityVisibility === 'public',
                    is_anonymous: false,
                    data_retention_days: dataRetentionDays,
                    scheduled_export_enabled: scheduledExportEnabled
                })
            });
            const data = await response.json();
            if (data.user) {
                updateUser(data.user);
            }
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
                                ? 'bg-white border-2 border-primary-500 shadow-sm'
                                : 'bg-white border border-neutral-200 hover:border-neutral-300'
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
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="mt-2 text-xs text-neutral-500 text-center">
                    Older data will be automatically deleted
                </div>
            </div>

            {/* Scheduled Backups */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Download size={16} className="text-neutral-500" />
                        <h4 className="text-sm font-semibold text-neutral-700">Scheduled Weekly Backups</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={scheduledExportEnabled}
                            onChange={(e) => setScheduledExportEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                    Automatically generate a full export of your data every Sunday. Backups will be securely stored and available for manual retrieval.
                </p>
                {user?.last_export_at && (
                    <div className="mt-3 text-[10px] text-neutral-400 font-medium">
                        Last backup generated: {new Date(user.last_export_at).toLocaleDateString()}
                    </div>
                )}
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Shield size={16} className="text-neutral-500" />
                        <h4 className="text-sm font-semibold text-neutral-700">Two-Factor Authentication (2FA)</h4>
                    </div>
                    {user?.two_factor_enabled ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                            Active
                        </span>
                    ) : (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-bold uppercase tracking-wider">
                            Inactive
                        </span>
                    )}
                </div>

                {!user?.two_factor_enabled ? (
                    <div>
                        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                            Add an extra layer of security to your account. You'll need a code from an authenticator app to log in.
                        </p>
                        {!show2FASetup ? (
                            <button
                                onClick={handleSetup2FA}
                                disabled={is2FALoading}
                                className="w-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {is2FALoading ? 'Setting up...' : 'Setup Authenticator App'}
                            </button>
                        ) : (
                            <div className="space-y-4 pt-4 border-t border-neutral-100">
                                <div className="flex flex-col items-center gap-4">
                                    <p className="text-xs font-medium text-neutral-700 text-center">
                                        Scan this QR code with your authenticator app:
                                    </p>
                                    <div className="p-2 bg-white border border-neutral-200 rounded-xl">
                                        <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                                            Or enter secret manually:
                                        </label>
                                        <code className="block w-full p-2 bg-neutral-50 border border-neutral-100 rounded text-center font-mono text-xs text-neutral-600 break-all select-all">
                                            {twoFactorSecret}
                                        </code>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                                        Enter 6-digit verification code:
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={verificationToken}
                                            onChange={(e) => setVerificationToken(e.target.value)}
                                            placeholder="000000"
                                            className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        />
                                        <button
                                            onClick={handleVerify2FA}
                                            disabled={is2FALoading || verificationToken.length !== 6}
                                            className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShow2FASetup(false)}
                                    className="w-full text-xs text-neutral-500 hover:text-neutral-700 underline"
                                >
                                    Cancel Setup
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                            Two-factor authentication is currently protecting your account.
                        </p>
                        <button
                            onClick={handleDisable2FA}
                            disabled={is2FALoading}
                            className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            Disable Two-Factor Authentication
                        </button>
                    </div>
                )}
            </div>

            {/* Save Button */}
            <button
                onClick={savePrivacySettings}
                className="w-full px-4 py-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-black transition-all active:scale-[0.98]"
            >
                Save Privacy Settings
            </button>

            {/* Data Export */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Download size={16} className="text-neutral-500" />
                    <h4 className="text-sm font-semibold text-neutral-700">Export Your Data</h4>
                </div>
                <p className="text-sm text-neutral-600 mb-4">
                    Download all your data in a machine-readable format. Your export will include your habits, completions, and stats in <b>JSON</b> and <b>CSV</b> formats.
                </p>
                <button
                    onClick={handleExportData}
                    className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Download size={18} />
                    <span>Download Data Archive (.zip)</span>
                </button>
            </div>

            {/* Delete Account */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-5 mt-8">
                <div className="flex items-center gap-2 mb-3">
                    <Trash2 size={16} className="text-red-500" />
                    <h4 className="text-sm font-semibold text-red-700">Danger Zone</h4>
                </div>
                <p className="text-sm text-red-600/80 mb-4">
                    Permanently delete your account and all associated data. This action is irreversible.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Trash2 size={18} />
                    <span>Delete Permanently</span>
                </button>
            </div>
        </div>
    );
}
