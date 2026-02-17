'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Share2, Users, Award, TrendingUp } from 'lucide-react';

interface ReferralHistory {
    name: string;
    date: string;
}

interface ReferralStats {
    referralCode: string;
    totalReferrals: number;
    history: ReferralHistory[];
}

const ReferralDashboard = () => {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/referrals/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setStats(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch referral stats:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!stats?.referralCode) return;
        const url = `${window.location.origin}/auth/signup?ref=${stats.referralCode}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnTwitter = () => {
        if (!stats?.referralCode) return;
        const text = `Join me on HabitFlow to build better habits! Use my link for a special starter bonus: `;
        const url = `${window.location.origin}/auth/signup?ref=${stats.referralCode}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    };

    const shareOnWhatsApp = () => {
        if (!stats?.referralCode) return;
        const text = `Join me on HabitFlow to build better habits! Use my link for a special starter bonus: ${window.location.origin}/auth/signup?ref=${stats.referralCode}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (isLoading) return <div className="p-8 text-center opacity-50 font-medium">Loading rewards...</div>;

    return (
        <div className="space-y-6">
            {/* Main Referral Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Gift size={160} />
                </div>

                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                        Share the Love <Gift size={24} />
                    </h2>
                    <p className="opacity-90 text-sm mb-8 max-w-xs">
                        Invite your friends to HabitFlow. You'll both earn 100 XP and 50 Coins when they sign up!
                    </p>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/20 mb-6">
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-widest opacity-60 block mb-1">Your Unique Code</span>
                            <span className="text-xl font-mono font-bold tracking-wider">{stats?.referralCode || '-------'}</span>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={shareOnTwitter}
                            className="bg-sky-400/20 hover:bg-sky-400/40 p-3 rounded-xl transition-colors border border-sky-400/30"
                            title="Share on Twitter"
                        >
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={shareOnWhatsApp}
                            className="bg-emerald-400/20 hover:bg-emerald-400/40 p-3 rounded-xl transition-colors border border-emerald-400/30"
                            title="Share on WhatsApp"
                        >
                            <Users size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-6 border-2 border-neutral-100">
                    <TrendingUp className="text-indigo-500 mb-2" size={24} />
                    <div className="text-2xl font-black">{stats?.totalReferrals || 0}</div>
                    <div className="text-xs opacity-50 font-bold uppercase tracking-wider">Accepted</div>
                </div>
                <div className="bg-white rounded-3xl p-6 border-2 border-neutral-100">
                    <Award className="text-amber-500 mb-2" size={24} />
                    <div className="text-2xl font-black">{(stats?.totalReferrals || 0) * 100}</div>
                    <div className="text-xs opacity-50 font-bold uppercase tracking-wider">XP Earned</div>
                </div>
            </div>

            {/* History */}
            {stats?.history && stats.history.length > 0 && (
                <div className="bg-white rounded-[2rem] p-6 border-2 border-neutral-100">
                    <h3 className="text-sm font-black uppercase tracking-widest opacity-40 mb-4">Recent Referrals</h3>
                    <div className="space-y-4">
                        {stats.history.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-400">
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{item.name}</div>
                                        <div className="text-[10px] opacity-40">{new Date(item.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-xs font-black text-emerald-500">+100 XP</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralDashboard;
