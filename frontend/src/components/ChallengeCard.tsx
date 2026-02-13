'use client';

import { useState } from 'react';

interface Participant {
    id: string;
    display_name: string;
    avatar_url?: string;
}

interface Challenge {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    target_habit_type?: string;
    goal_count: number;
    participants: {
        id: string;
        progress_count: number;
        user: Participant;
    }[];
    _count?: {
        participants: number;
    };
}

interface ChallengeCardProps {
    challenge: Challenge;
    currentUserId: string;
    onJoin: (id: string) => Promise<void>;
}

export default function ChallengeCard({ challenge, currentUserId, onJoin }: ChallengeCardProps) {
    const [isJoining, setIsJoining] = useState(false);
    const isParticipating = challenge.participants.some(p => p.user.id === currentUserId);

    const userProgress = challenge.participants.find(p => p.user.id === currentUserId)?.progress_count || 0;
    const progressPercent = Math.min(100, (userProgress / challenge.goal_count) * 100);

    const handleJoin = async () => {
        setIsJoining(true);
        try {
            await onJoin(challenge.id);
        } catch (error) {
            console.error('Failed to join challenge:', error);
        } finally {
            setIsJoining(false);
        }
    };

    const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-primary-300 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-neutral-900">{challenge.title}</h3>
                    {challenge.description && (
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{challenge.description}</p>
                    )}
                </div>
                {!isParticipating && (
                    <button
                        onClick={handleJoin}
                        disabled={isJoining}
                        className="text-xs font-semibold px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                        {isJoining ? 'Joining...' : 'Join'}
                    </button>
                )}
                {isParticipating && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-success-600 bg-success-50 px-2 py-1 rounded">
                        Joined
                    </span>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-medium text-neutral-400">
                    <div className="flex items-center gap-1">
                        <span>👥 {challenge.participants.length} participants</span>
                    </div>
                    <span>⌛ {daysLeft} days left</span>
                </div>

                {isParticipating && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                            <span className="text-neutral-600">Your Progress</span>
                            <span className="text-primary-600">{userProgress} / {challenge.goal_count}</span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex -space-x-2 overflow-hidden py-1">
                    {challenge.participants.slice(0, 5).map((p) => (
                        <div
                            key={p.user.id}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700"
                            title={p.user.display_name}
                        >
                            {p.user.display_name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                    {challenge.participants.length > 5 && (
                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                            +{challenge.participants.length - 5}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
