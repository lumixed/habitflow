'use client';

import { useState, useEffect } from 'react';
import { useChallenges } from '@/hooks/useChallenges';
import { useAuth } from '@/contexts/AuthContext';
import ChallengeCard from '@/components/ChallengeCard';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';

export default function ChallengesPage() {
    const { user } = useAuth();
    const { getChallenges, joinChallenge, isLoading } = useChallenges();
    const [activeChallenges, setActiveChallenges] = useState([]);
    const [availableChallenges, setAvailableChallenges] = useState([]);
    const [activeTab, setActiveTab] = useState('active');

    const fetchData = async () => {
        try {
            const data = await getChallenges();
            setActiveChallenges(data.active);
            setAvailableChallenges(data.available);
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleJoin = async (id: string) => {
        try {
            await joinChallenge(id);
            fetchData();
        } catch (error) {
            console.error('Failed to join challenge:', error);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-neutral-900 uppercase tracking-tighter mb-2">
                        Challenges
                    </h1>
                    <p className="text-neutral-500 font-medium">
                        Push your limits and earn rewards with your groups.
                    </p>
                </header>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active'
                                ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200'
                                : 'bg-white text-neutral-400 hover:text-neutral-600 border border-neutral-200'
                            }`}
                    >
                        Active ({activeChallenges.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'available'
                                ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200'
                                : 'bg-white text-neutral-400 hover:text-neutral-600 border border-neutral-200'
                            }`}
                    >
                        Available ({availableChallenges.length})
                    </button>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                    </div>
                )}

                {!isLoading && activeTab === 'active' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeChallenges.length > 0 ? (
                            activeChallenges.map((challenge: any) => (
                                <ChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    currentUserId={user?.id || ''}
                                    onJoin={() => Promise.resolve()} // Already joined
                                />
                            ))
                        ) : (
                            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-neutral-200">
                                <span className="text-4xl mb-4 block">🧗</span>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">No Active Challenges</h3>
                                <p className="text-neutral-500 text-sm mb-6">You haven't joined any challenges yet. Check the available tab!</p>
                                <button
                                    onClick={() => setActiveTab('available')}
                                    className="text-primary-600 font-bold text-sm hover:underline"
                                >
                                    Browse Challenges →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && activeTab === 'available' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableChallenges.length > 0 ? (
                            availableChallenges.map((challenge: any) => (
                                <ChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    currentUserId={user?.id || ''}
                                    onJoin={handleJoin}
                                />
                            ))
                        ) : (
                            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-dashed border-neutral-200">
                                <span className="text-4xl mb-4 block">🏜️</span>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">Nothing to Join</h3>
                                <p className="text-neutral-500 text-sm">Join more groups to see more challenges!</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <MobileNav />
        </div>
    );
}
