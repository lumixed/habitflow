'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import SocialFeed from '@/components/SocialFeed';
import FriendList from '@/components/FriendList';
import UserSearch from '@/components/UserSearch';
import ReferralDashboard from '@/components/ReferralDashboard';
import CommunityStats from '@/components/CommunityStats';
import CommunityHighlights from '@/components/CommunityHighlights';
import WidgetGenerator from '@/components/Social/WidgetGenerator';

export default function SocialPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'search' | 'invite' | 'community' | 'widget'>('community');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-neutral-400">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Tabs */}
                    <div className="w-full md:w-64 space-y-1">
                        <button
                            onClick={() => setActiveTab('community')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'community'
                                ? 'bg-white border-2 border-primary-500 text-primary-600 shadow-sm'
                                : 'text-neutral-500 hover:bg-neutral-100'
                                }`}
                        >
                            Community Hub
                        </button>
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'feed'
                                ? 'bg-white border-2 border-primary-500 text-primary-600 shadow-sm'
                                : 'text-neutral-500 hover:bg-neutral-100'
                                }`}
                        >
                            Social Feed
                        </button>
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'friends'
                                ? 'bg-white border-2 border-primary-500 text-primary-600 shadow-sm'
                                : 'text-neutral-500 hover:bg-neutral-100'
                                }`}
                        >
                            Friends
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'search'
                                ? 'bg-white border-2 border-primary-500 text-primary-600 shadow-sm'
                                : 'text-neutral-500 hover:bg-neutral-100'
                                }`}
                        >
                            Find People
                        </button>
                        <button
                            onClick={() => setActiveTab('invite')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'invite'
                                ? 'bg-white border-2 border-primary-500 text-primary-600 shadow-sm'
                                : 'text-neutral-500 hover:bg-neutral-100'
                                }`}
                        >
                            Invite Friends
                        </button>
                        <button
                            onClick={() => setActiveTab('widget')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'widget'
                                ? 'bg-white border-2 border-primary-500 text-primary-600 shadow-sm'
                                : 'text-neutral-500 hover:bg-neutral-100'
                                }`}
                        >
                            Embed Widget
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-white rounded-2xl border border-neutral-200 overflow-hidden min-h-[600px]">
                        {activeTab === 'feed' && (
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6">Activity Feed</h2>
                                <SocialFeed />
                            </div>
                        )}
                        {activeTab === 'friends' && (
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6">Your Friends</h2>
                                <FriendList />
                            </div>
                        )}
                        {activeTab === 'search' && (
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6">Search Users</h2>
                                <UserSearch />
                            </div>
                        )}
                        {activeTab === 'invite' && (
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6">Referral Rewards</h2>
                                <ReferralDashboard />
                            </div>
                        )}
                        {activeTab === 'community' && (
                            <div className="p-6 space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 mb-2 font-black uppercase tracking-tight">Community Hub</h2>
                                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-6">You are part of something bigger.</p>
                                    <CommunityStats />
                                </div>
                                <div className="pt-8 border-t border-neutral-100">
                                    <CommunityHighlights />
                                </div>
                            </div>
                        )}
                        {activeTab === 'widget' && (
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-neutral-900 mb-6 font-black uppercase tracking-tight">Public Widgets</h2>
                                <WidgetGenerator />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
