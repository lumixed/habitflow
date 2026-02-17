'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

const PartnerForm = () => {
    const [formData, setFormData] = useState({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        type: 'CORPORATE',
        size: '',
        message: ''
    });
    const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('SUBMITTING');
        try {
            await api.post('/api/partners/inquiry', formData);
            setStatus('SUCCESS');
        } catch (err) {
            console.error(err);
            setStatus('ERROR');
        }
    };

    if (status === 'SUCCESS') {
        return (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">✓</div>
                <h3 className="text-xl font-black text-emerald-900 uppercase tracking-tight mb-2">Inquiry Received!</h3>
                <p className="text-sm text-emerald-700 font-medium">Our partnership team will reach out to you within 24 hours.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-200/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Company Name</label>
                    <input
                        required
                        type="text"
                        value={formData.company_name}
                        onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder-neutral-300"
                        placeholder="E.G. ACME CORP"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Contact Name</label>
                    <input
                        required
                        type="text"
                        value={formData.contact_name}
                        onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder-neutral-300"
                        placeholder="ALEX SMITH"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Work Email</label>
                    <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder-neutral-300"
                        placeholder="YOU@COMPANY.COM"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder-neutral-300"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Organization Type</label>
                    <div className="relative">
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
                        >
                            <option value="CORPORATE">Corporate Wellness</option>
                            <option value="GYM">Gym / Fitness Center</option>
                            <option value="UNIVERSITY">University / School</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                            ▼
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Organization Size</label>
                    <input
                        type="text"
                        value={formData.size}
                        onChange={e => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder-neutral-300"
                        placeholder="E.G. 100-500 MEMBERS"
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Tell us more</label>
                <textarea
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm h-32 resize-none placeholder-neutral-300"
                    placeholder="HOW CAN WE HELP YOUR TEAM?"
                />
            </div>

            <button
                type="submit"
                disabled={status === 'SUBMITTING'}
                className="w-full py-4 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-neutral-800 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
                {status === 'SUBMITTING' ? 'SENDING...' : 'GET IN TOUCH'}
            </button>

            {status === 'ERROR' && (
                <p className="text-center text-[10px] font-black text-red-500 uppercase tracking-widest">
                    Something went wrong. Please try again.
                </p>
            )}
        </form>
    );
};

export default PartnerForm;
