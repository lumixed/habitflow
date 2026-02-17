'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import PartnerForm from '@/components/Partners/PartnerForm';
import { Building2, Dumbbell, GraduationCap, Users2, Zap, Trophy, Shield } from 'lucide-react';

const PartnersPage = () => {
    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            {/* Hero Section */}
            <header className="relative py-24 px-4 overflow-hidden bg-neutral-900 text-white">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6 leading-tight">
                        Power Your Team with <br />
                        <span className="text-primary-400">HabitFlow Momentum</span>
                    </h1>
                    <p className="text-sm md:text-lg text-neutral-400 font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto mb-12">
                        The world's most engaging habit-building platform, designed for organizations that thrive on consistency.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                            <Shield size={14} className="text-emerald-400" /> Enterprise-Grade Security
                        </div>
                        <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                            <Zap size={14} className="text-amber-400" /> Deep Social Integration
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 -mt-12 relative z-20 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Value Props */}
                    <div className="space-y-12 py-12">
                        <div className="space-y-8">
                            <h2 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Why HabitFlow?</h2>

                            <div className="grid gap-8">
                                <div className="flex gap-6 items-start">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 text-primary-600">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Corporate Wellness</h3>
                                        <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                            Boost productivity and reduce burnout by helping your employees build sustainable daily routines.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 text-emerald-600">
                                        <Dumbbell size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Gyms & Studios</h3>
                                        <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                            Increase member retention by 40% with automated habit tracking and community challenges.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 text-amber-600">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Academic Success</h3>
                                        <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                                            Empower students with the organizational habits needed for high-performance academic results.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">The HabitFlow Impact</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-neutral-900">84%</p>
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-1">Daily Engagement</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-neutral-900">12M+</p>
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-1">Habits Tracked</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-neutral-900">4.9/5</p>
                                    <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-1">User Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inquiry Form */}
                    <div id="inquiry" className="py-12">
                        <div className="mb-8 pl-4 lg:pl-0">
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Partner with us</h2>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Start your organization's journey today.</p>
                        </div>
                        <PartnerForm />
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="mt-24 text-center border-t border-neutral-200 pt-24">
                    <Users2 size={40} className="mx-auto text-neutral-300 mb-8" />
                    <blockquote className="max-w-3xl mx-auto">
                        <p className="text-xl md:text-2xl font-black uppercase tracking-tight mb-6">
                            "HabitFlow transformed our gym's community culture. Our members aren't just working out; they're building lives together."
                        </p>
                        <cite className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] not-italic">
                            — Marcus Aurelius, Fitness Center Owner
                        </cite>
                    </blockquote>
                </div>
            </main>
        </div>
    );
};

export default PartnersPage;
