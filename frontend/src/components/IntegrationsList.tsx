'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Trash2, ExternalLink, RefreshCw } from 'lucide-react';

interface Integration {
    provider: string;
    created_at: string;
}

const IntegrationsList = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/integrations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setIntegrations(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch integrations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnect = async (provider: 'google' | 'strava') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/integrations/${provider}/auth`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const { url } = await res.json();
                window.location.href = url;
            }
        } catch (err) {
            console.error(`Failed to start ${provider} auth:`, err);
        }
    };

    const handleDisconnect = async (provider: string) => {
        if (!confirm(`Are you sure you want to disconnect ${provider === 'google_calendar' ? 'Google Calendar' : 'Strava'}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const route = provider === 'google_calendar' ? 'google' : 'strava';
            await fetch(`/api/integrations/${route}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchIntegrations();
        } catch (err) {
            console.error(`Failed to disconnect ${provider}:`, err);
        }
    };

    const handleStravaSync = async () => {
        setIsSyncing(true);
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/integrations/strava/sync', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Strava sync initiated. Your activities will appear shortly!');
        } catch (err) {
            console.error('Strava sync failed:', err);
        } finally {
            setIsSyncing(false);
        }
    };

    const isGoogleConnected = integrations.some(i => i.provider === 'google_calendar');
    const isStravaConnected = integrations.some(i => i.provider === 'strava');

    if (isLoading) return <div className="p-8 text-center opacity-50 font-medium">Loading integrations...</div>;

    return (
        <div className="space-y-4">
            {/* Google Calendar */}
            <div className={`p-6 rounded-[2rem] border-2 transition-all ${isGoogleConnected
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-neutral-200 bg-white/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl ${isGoogleConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                Google Calendar
                                {isGoogleConnected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            </h3>
                            <p className="text-xs opacity-60">Sync your completed habits to your calendar</p>
                        </div>
                    </div>

                    {isGoogleConnected ? (
                        <button
                            onClick={() => handleDisconnect('google_calendar')}
                            className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleConnect('google')}
                            className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2"
                        >
                            Connect
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Strava */}
            <div className={`p-6 rounded-[2rem] border-2 transition-all ${isStravaConnected
                ? 'border-orange-500 bg-orange-50/30'
                : 'border-neutral-200 bg-white/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl ${isStravaConnected ? 'bg-orange-100 text-orange-600' : 'bg-neutral-100 text-neutral-400'}`}>
                            <img src="https://api.iconify.design/logos:strava-icon.svg" className={`w-6 h-6 ${isStravaConnected ? '' : 'grayscale'}`} alt="Strava" />
                        </div>
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                Strava
                                {isStravaConnected && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                            </h3>
                            <p className="text-xs opacity-60">Sync runs, rides, and swims to gym habits</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isStravaConnected && (
                            <button
                                onClick={handleStravaSync}
                                disabled={isSyncing}
                                className="p-3 text-orange-600 hover:bg-orange-100 rounded-xl transition-all disabled:opacity-50"
                                title="Sync Now"
                            >
                                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                        {isStravaConnected ? (
                            <button
                                onClick={() => handleDisconnect('strava')}
                                className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={() => handleConnect('strava')}
                                className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2"
                            >
                                Connect
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsList;
