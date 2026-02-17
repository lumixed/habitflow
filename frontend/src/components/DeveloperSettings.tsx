'use client';

import React, { useState, useEffect } from 'react';
import { Key, Globe, Plus, Trash2, Copy, Check, Shield, Zap } from 'lucide-react';

interface ApiKey {
    id: string;
    name: string;
    scopes: string;
    created_at: string;
    last_used: string | null;
}

interface Webhook {
    id: string;
    url: string;
    events: string;
    is_active: boolean;
}

const DeveloperSettings = () => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState('');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [newWebhookEvents, setNewWebhookEvents] = useState('habit.completed');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchDevInfo();
    }, []);

    const fetchDevInfo = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [keysRes, webhooksRes] = await Promise.all([
                fetch('/api/developer/keys', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/developer/webhooks', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (keysRes.ok && webhooksRes.ok) {
                setApiKeys(await keysRes.json());
                setWebhooks(await webhooksRes.json());
            }
        } catch (err) {
            console.error('Failed to fetch developer info:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const generateKey = async () => {
        if (!newKeyName) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/developer/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newKeyName, scopes: ['read', 'write'] })
            });

            if (res.ok) {
                const data = await res.json();
                setGeneratedKey(data.rawKey);
                setNewKeyName('');
                fetchDevInfo();
            }
        } catch (err) {
            console.error('Failed to generate key:', err);
        }
    };

    const registerWebhook = async () => {
        if (!newWebhookUrl) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/developer/webhooks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: newWebhookUrl, events: newWebhookEvents.split(',') })
            });

            if (res.ok) {
                setNewWebhookUrl('');
                fetchDevInfo();
            }
        } catch (err) {
            console.error('Failed to register webhook:', err);
        }
    };

    const revokeKey = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/developer/keys/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDevInfo();
        } catch (err) {
            console.error('Failed to revoke key:', err);
        }
    };

    const deleteWebhook = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/developer/webhooks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDevInfo();
        } catch (err) {
            console.error('Failed to delete webhook:', err);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) return <div className="p-8 text-center opacity-50 font-medium">Loading developer settings...</div>;

    return (
        <div className="space-y-12">
            {/* API Keys Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Key className="w-4 h-4 text-emerald-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50">API Keys</h2>
                </div>

                {generatedKey && (
                    <div className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-2 mb-3 text-emerald-800">
                            <Shield className="w-5 h-5" />
                            <h3 className="font-bold">New API Key Generated</h3>
                        </div>
                        <p className="text-sm text-emerald-700/80 mb-4 font-medium">
                            Copy this key now. For your security, it will not be shown again.
                        </p>
                        <div className="flex gap-2">
                            <code className="flex-1 p-3 bg-white border border-emerald-200 rounded-xl text-sm font-mono break-all selection:bg-emerald-100">
                                {generatedKey}
                            </code>
                            <button
                                onClick={() => copyToClipboard(generatedKey)}
                                className="px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 font-bold text-sm"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm shadow-black/5">
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder="Key Name (e.g. My Custom Script)"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <button
                                onClick={generateKey}
                                disabled={!newKeyName}
                                className="bg-neutral-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-30 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Generate
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-neutral-100">
                        {apiKeys.length === 0 ? (
                            <div className="p-8 text-center opacity-40 text-sm font-medium">No API keys generated yet.</div>
                        ) : (
                            apiKeys.map((key) => (
                                <div key={key.id} className="p-6 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">{key.name}</h4>
                                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-black opacity-40">
                                            <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>Last used {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => revokeKey(key.id)}
                                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Webhooks Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50">Webhooks</h2>
                </div>

                <div className="bg-white border border-neutral-200 rounded-[2rem] overflow-hidden shadow-sm shadow-black/5">
                    <div className="p-6 border-b border-neutral-100 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Payload URL</label>
                            <input
                                type="url"
                                placeholder="https://your-app.com/webhook"
                                value={newWebhookUrl}
                                onChange={(e) => setNewWebhookUrl(e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="flex gap-3 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Events (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="habit.completed, level.up"
                                    value={newWebhookEvents}
                                    onChange={(e) => setNewWebhookEvents(e.target.value)}
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <button
                                onClick={registerWebhook}
                                disabled={!newWebhookUrl}
                                className="bg-blue-600 text-white px-6 py-2 h-[38px] rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-30 flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Register
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-neutral-100">
                        {webhooks.length === 0 ? (
                            <div className="p-8 text-center opacity-40 text-sm font-medium">No webhooks registered yet.</div>
                        ) : (
                            webhooks.map((webhook) => (
                                <div key={webhook.id} className="p-6 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                                    <div className="min-w-0 pr-4">
                                        <h4 className="font-mono text-[11px] text-blue-600 truncate mb-1">{webhook.url}</h4>
                                        <div className="flex items-center gap-2">
                                            {webhook.events.split(',').map(event => (
                                                <span key={event} className="bg-neutral-100 text-[9px] font-black px-2 py-0.5 rounded-full uppercase opacity-60">
                                                    {event}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteWebhook(webhook.id)}
                                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DeveloperSettings;
