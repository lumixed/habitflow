'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Check, Zap, Users, Globe, Flame, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const PricingPage = () => {
    const { token, user } = useAuth();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleCheckout = async (plan: 'PRO' | 'TEAM') => {
        if (!token) {
            window.location.href = '/auth/login';
            return;
        }

        setIsLoading(plan);
        try {
            const { url } = await api.post<{ url: string }>('/api/billing/checkout', { plan }, token);
            window.location.href = url;
        } catch (err) {
            console.error('Checkout failed:', err);
            alert('Failed to initiate checkout. Please try again.');
        } finally {
            setIsLoading(null);
        }
    };

    const PLANS = [
        {
            name: 'Free',
            price: '$0',
            desc: 'For individuals starting their journey',
            features: [
                'Up to 5 active habits',
                'Basic analytics',
                'Community hub access',
                'Public profile'
            ],
            button: 'Current Plan',
            disabled: true,
            featured: false
        },
        {
            name: 'Pro',
            price: '$9',
            period: '/month',
            desc: 'For high achievers building momentum',
            features: [
                'Unlimited active habits',
                'Advanced AI insights',
                'Detailed analytics & trends',
                'Custom themes & icons',
                'Priority support'
            ],
            button: 'Get Pro',
            disabled: user?.plan === 'PRO' || user?.plan === 'TEAM',
            featured: true,
            plan: 'PRO' as const
        },
        {
            name: 'Team',
            price: '$29',
            period: '/month',
            desc: 'For groups and wellness programs',
            features: [
                'Everything in Pro',
                'Private group challenges',
                'Team analytics dashboard',
                'Organization support',
                'API access'
            ],
            button: 'Get Team',
            disabled: user?.plan === 'TEAM',
            featured: false,
            plan: 'TEAM' as const
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 pb-20">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 py-20">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        Level Up Your <span className="text-primary-500">Momentum</span>
                    </h1>
                    <p className="text-lg opacity-60 font-medium max-w-2xl mx-auto">
                        Choose the plan that fits your ambition. Unlock powerful tools to help you build habits that actually stick.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PLANS.map((p) => (
                        <div
                            key={p.name}
                            className={`p-8 rounded-[2.5rem] flex flex-col transition-all duration-300 ${p.featured
                                    ? 'bg-neutral-900 text-white shadow-2xl scale-105 border-4 border-primary-500 relative ring-8 ring-primary-500/10'
                                    : 'bg-white border border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            {p.featured && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${p.featured ? 'text-primary-400' : 'text-neutral-900'}`}>
                                    {p.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tighter">{p.price}</span>
                                    {p.period && <span className="text-sm border-l border-white/20 pl-2 opacity-60 font-bold uppercase tracking-widest">{p.period}</span>}
                                </div>
                                <p className={`text-xs mt-4 font-bold uppercase tracking-wide leading-relaxed ${p.featured ? 'text-white/60' : 'text-neutral-400'}`}>
                                    {p.desc}
                                </p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p.featured ? 'bg-primary-500/20 text-primary-400' : 'bg-neutral-100 text-neutral-600'}`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${p.featured ? 'text-white/80' : 'text-neutral-600'}`}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => p.plan && handleCheckout(p.plan)}
                                disabled={p.disabled || !!isLoading}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${p.featured
                                        ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20 active:scale-[0.98]'
                                        : p.disabled
                                            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                            : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98]'
                                    }`}
                            >
                                {isLoading === p.plan ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {p.featured && <Zap size={14} fill="currentColor" />}
                                        {p.button}
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    <Benefit icon={<Globe size={24} />} title="Global Community" text="Connect with builders from all over the world." />
                    <Benefit icon={<Flame size={24} />} title="Streak Protection" text="Never lose your momentum with built-in freezing." />
                    <Benefit icon={<Users size={24} />} title="Team Features" text="Built for families, companies, and gym squads." />
                    <Benefit icon={<Lock size={24} />} title="Privacy First" text="Your data is encrypted and stays yours forever." />
                </div>
            </main>
        </div>
    );
};

const Benefit = ({ icon, title, text }: { icon: React.ReactNode; title: string, text: string }) => (
    <div className="text-center group">
        <div className="w-16 h-16 bg-white border border-neutral-100 rounded-3xl flex items-center justify-center text-primary-500 mx-auto mb-6 shadow-sm group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
            {icon}
        </div>
        <h4 className="text-xs font-black uppercase tracking-widest mb-2">{title}</h4>
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.1em] leading-relaxed">{text}</p>
    </div>
);

export default PricingPage;
