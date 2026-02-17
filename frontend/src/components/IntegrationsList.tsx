'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Trash2, ExternalLink } from 'lucide-react';

interface Integration {
    provider: string;
    created_at: string;
}

const IntegrationsList = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const connectGoogle = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/integrations/google/auth', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const { url } = await res.json();
                window.location.href = url;
            }
        } catch (err) {
            console.error('Failed to start Google auth:', err);
        }
    };

    const disconnectGoogle = async () => {
        if (!confirm('Are you sure you want to disconnect Google Calendar?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch('/api/integrations/google', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchIntegrations();
        } catch (err) {
            console.error('Failed to disconnect Google:', err);
        }
    };

    const isGoogleConnected = integrations.some(i => i.provider === 'google_calendar');

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
                            onClick={disconnectGoogle}
                            className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={connectGoogle}
                            className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2"
                        >
                            Connect
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Placeholder for Strava */}
            <div className="p-6 rounded-[2rem] border-2 border-dashed border-neutral-200 opacity-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                            <img src="https://api.iconify.design/logos:strava-icon.svg" className="w-6 h-6 grayscale" alt="Strava" />
                        </div>
                        <div>
                            <h3 className="font-bold">Strava</h3>
                            <p className="text-xs">Fitness sync coming soon</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationsList;
