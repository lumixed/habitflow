'use client';

import { useState, useEffect } from 'react';
import { useGamification, Powerup } from '@/hooks/useGamification';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';

export default function ShopPage() {
    const { stats, getAvailablePowerups, buyPowerup, loading } = useGamification();
    const [powerups, setPowerups] = useState<Powerup[]>([]);
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchPowerups = async () => {
            const data = await getAvailablePowerups();
            setPowerups(data);
        };
        fetchPowerups();
    }, []);

    const handlePurchase = async (key: string) => {
        setIsPurchasing(key);
        setMessage(null);
        try {
            await buyPowerup(key);
            setMessage({ text: 'Purchase successful!', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.message || 'Purchase failed', type: 'error' });
        } finally {
            setIsPurchasing(null);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white pb-20">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 py-12">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter mb-2 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                            The Shop
                        </h1>
                        <p className="text-neutral-400 font-medium">
                            Spend your hard-earned coins on epic powerups.
                        </p>
                    </div>

                    <div className="bg-neutral-800 border border-neutral-700 rounded-3xl p-6 flex items-center gap-4 shadow-2xl">
                        <div className="h-12 w-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-2xl">
                            🪙
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Your Balance</p>
                            <p className="text-2xl font-black text-yellow-500">{stats?.coins || 0}</p>
                        </div>
                    </div>
                </header>

                {message && (
                    <div className={`mb-8 p-4 rounded-2xl font-bold text-center animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-success-500/10 text-success-400 border border-success-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {powerups.map((powerup: any) => (
                        <div
                            key={powerup.id}
                            className="group relative bg-neutral-800 border border-neutral-700 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 flex flex-col"
                        >
                            <div className="absolute top-6 right-8 text-4xl group-hover:scale-110 transition-transform duration-500">
                                {powerup.icon}
                            </div>

                            <h3 className="text-xl font-black mb-2 pr-12">{powerup.name}</h3>
                            <p className="text-neutral-400 text-sm mb-8 flex-1">
                                {powerup.description}
                            </p>

                            <div className="pt-6 border-t border-neutral-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-yellow-500 font-black">🪙 {powerup.cost_coins}</span>
                                </div>
                                <button
                                    onClick={() => handlePurchase(powerup.key)}
                                    disabled={isPurchasing !== null || (stats?.coins || 0) < powerup.cost_coins}
                                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                >
                                    {isPurchasing === powerup.key ? 'Processing...' : 'Purchase'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
