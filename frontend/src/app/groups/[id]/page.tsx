'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGroupDetails } from '@/hooks/useGroups';
import { useAuth } from '@/contexts/AuthContext';
import { useChallenges } from '@/hooks/useChallenges';
import ChallengeCard from '@/components/ChallengeCard';
import CreateChallengeModal from '@/components/CreateChallengeModal';

const ICON_MAP: Record<string, string> = {
    target: '🎯',
    run: '🏃',
    book: '📚',
    water: '💧',
    sleep: '😴',
    meditate: '🧘',
    exercise: '💪',
    write: '✍️',
    cook: '🍳',
    learn: '🧠',
};

export default function GroupDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const { group, isLoading, mutate } = useGroupDetails(params.id) as any;
    const { joinChallenge } = useChallenges();
    const [showInviteCode, setShowInviteCode] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleJoinChallenge = async (challengeId: string) => {
        try {
            await joinChallenge(challengeId);
            mutate(); // Refresh group data
        } catch (error) {
            console.error('Failed to join challenge:', error);
        }
    };

    const copyInviteCode = () => {
        if (group) {
            navigator.clipboard.writeText(group.invite_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-neutral-400">Loading...</div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-neutral-400">Group not found</div>
            </div>
        );
    }

    // Get last 7 days for the activity grid
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d);
        }
        return days;
    };

    const last7Days = getLast7Days();

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <Link
                        href="/groups"
                        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-3 transition-colors group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to groups
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900">{group.name}</h1>
                            {group.description && (
                                <p className="text-neutral-600 mt-1">{group.description}</p>
                            )}
                            <p className="text-sm text-neutral-400 mt-2">
                                {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowInviteCode(!showInviteCode)}
                            className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                            Invite
                        </button>
                    </div>

                    {showInviteCode && (
                        <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                            <p className="text-sm text-primary-900 font-medium mb-2">Invite code:</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-white border border-primary-300 rounded font-mono text-lg tracking-wider text-primary-700">
                                    {group.invite_code}
                                </code>
                                <button
                                    onClick={copyInviteCode}
                                    className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Challenges Section */}
            <div className="max-w-3xl mx-auto px-4 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-neutral-900">Active Challenges</h2>
                    {group.role === 'OWNER' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                        >
                            + New Challenge
                        </button>
                    )}
                </div>

                {group.challenges && group.challenges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {group.challenges.map((challenge: any) => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                currentUserId={user?.id || ''}
                                onJoin={(id: string) => handleJoinChallenge(id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-400 text-sm">
                        No active challenges. Group leaders can start one anytime!
                    </div>
                )}
            </div>

            {/* Members activity */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Member Activity</h2>
                <div className="space-y-6">
                    {group.members.map((member: any) => {
                        const weekCompletions = member.user?.completions?.filter((c: any) => {
                            const date = new Date(c.completed_at);
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                            return date >= sevenDaysAgo;
                        }).length || 0;

                        return (
                            <div key={member.user.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                            {member.user.display_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900">{member.user.display_name}</h3>
                                            <p className="text-xs text-neutral-500">
                                                {member.role} • {weekCompletions} completions this week
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xs font-bold text-primary-600">Level {member.user.level}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {member.user.habits && member.user.habits.length > 0 ? (
                                        member.user.habits.map((habit: any) => (
                                            <div key={habit.id} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className="text-lg flex-shrink-0">{ICON_MAP[habit.icon] || '✨'}</span>
                                                    <span className="text-sm font-medium text-neutral-700 truncate">{habit.title}</span>
                                                    <span className="text-[10px] font-bold text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded ml-1">
                                                        {habit.streak_days}d
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 flex-shrink-0">
                                                    {last7Days.map((day) => {
                                                        const dateStr = day.toISOString().split('T')[0];
                                                        const isCompleted = habit.completions?.some((c: any) =>
                                                            new Date(c.completed_at).toISOString().split('T')[0] === dateStr
                                                        );

                                                        return (
                                                            <div
                                                                key={dateStr}
                                                                className={`w-6 h-6 rounded border transition-colors ${isCompleted ? 'bg-primary-500 border-primary-600' : 'bg-white border-neutral-200'
                                                                    }`}
                                                                title={`${day.toLocaleDateString()}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-neutral-400 text-center py-2">No active habits</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {showCreateModal && (
                <CreateChallengeModal
                    groupId={params.id}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => mutate()}
                />
            )}
        </div>
    );
}
