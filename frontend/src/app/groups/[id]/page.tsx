'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGroupDetails } from '@/hooks/useGroups';

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
    const { group, isLoading } = useGroupDetails(params.id);
    const [showInviteCode, setShowInviteCode] = useState(false);
    const [copied, setCopied] = useState(false);

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
        <div className="min-h-screen bg-neutral-50">
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

        {/* Members activity */}
        <main className="max-w-3xl mx-auto px-4 py-6">
            <div className="space-y-4">
            {group.members.map((member) => {
                // Count completions in last 7 days
                const completionCount = member.recent_completions.length;

                return (
                <div key={member.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                    {/* Member header */}
                    <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary-700">
                            {member.display_name.charAt(0).toUpperCase()}
                        </span>
                        </div>
                        <div>
                        <h3 className="font-semibold text-neutral-900">{member.display_name}</h3>
                        <p className="text-xs text-neutral-400">
                            {completionCount} {completionCount === 1 ? 'completion' : 'completions'} this week
                        </p>
                        </div>
                    </div>
                    {member.role === 'OWNER' && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                        Owner
                        </span>
                    )}
                    </div>

                    {/* Habits + activity grid */}
                    {member.habits.length > 0 ? (
                    <div className="space-y-2">
                        {member.habits.map((habit) => {
                        const emoji = ICON_MAP[habit.icon] || '🎯';
                        
                        return (
                            <div key={habit.id} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-lg">{emoji}</span>
                                <span className="text-sm text-neutral-700 truncate">{habit.title}</span>
                            </div>
                            <div className="flex gap-1">
                                {last7Days.map((day) => {
                                const dateStr = day.toISOString().split('T')[0];
                                const isCompleted = member.recent_completions.some(
                                    (c) =>
                                    c.habit_id === habit.id &&
                                    c.completed_date.split('T')[0] === dateStr
                                );
                                
                                return (
                                    <div
                                    key={dateStr}
                                    className={`w-6 h-6 rounded border ${
                                        isCompleted
                                        ? 'bg-success-500 border-success-600'
                                        : 'border-neutral-200'
                                    }`}
                                    style={{ backgroundColor: isCompleted ? habit.color : undefined }}
                                    title={day.toLocaleDateString()}
                                    />
                                );
                                })}
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    ) : (
                    <p className="text-sm text-neutral-400">No active habits</p>
                    )}
                </div>
                );
            })}
            </div>
        </main>
        </div>
    );
}
