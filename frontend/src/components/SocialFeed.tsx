'use client';

import { useSocial } from '@/hooks/useSocial';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export default function SocialFeed() {
    const { feed, isLoading, error, reactToActivity, addComment } = useSocial();
    const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});

    const handleCommentSubmit = async (activityId: string) => {
        const text = commentTexts[activityId];
        if (!text || text.trim().length === 0) return;

        try {
            await addComment(activityId, text);
            setCommentTexts({ ...commentTexts, [activityId]: '' });
        } catch (err) {
            console.error('Failed to post comment');
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'HABIT_COMPLETED': return '✅';
            case 'LEVEL_UP': return '🆙';
            case 'ACHIEVEMENT_UNLOCKED': return '🏆';
            case 'STREAK_MILESTONE': return '🔥';
            default: return '📍';
        }
    };

    if (isLoading && feed.length === 0) {
        return <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
        </div>;
    }

    if (error) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">{error}</div>;
    }

    if (feed.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500">
                <p>No activity yet. Add some friends to see what they're up to!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {feed.map((activity) => (
                <div key={activity.id} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                            {activity.user.avatar_url ? (
                                <img src={activity.user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                activity.user.display_name[0]
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-neutral-900">{activity.user.display_name}</span>
                                <span className="text-xs text-neutral-400">
                                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </span>
                            </div>

                            <p className="text-neutral-700">
                                <span className="mr-2">{getActivityIcon(activity.type)}</span>
                                {activity.type === 'HABIT_COMPLETED' && (
                                    <>Completed habit <span className="font-semibold">{activity.content_text}</span></>
                                )}
                                {activity.type === 'LEVEL_UP' && (
                                    <span className="font-semibold text-primary-600">{activity.content_text}</span>
                                )}
                                {activity.type === 'ACHIEVEMENT_UNLOCKED' && (
                                    <>Unlocked achievement <span className="font-semibold">"{activity.content_text}"</span></>
                                )}
                            </p>

                            {/* Interactions */}
                            <div className="mt-4 flex items-center gap-6">
                                <button
                                    onClick={() => reactToActivity(activity.id)}
                                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600 transition-colors"
                                >
                                    <span>👏</span>
                                    <span>{activity.reactions?.length || 0}</span>
                                </button>
                                <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                                    <span>💬</span>
                                    <span>{activity._count?.comments || 0}</span>
                                </div>
                            </div>

                            {/* Comment Box */}
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentTexts[activity.id] || ''}
                                    onChange={(e) => setCommentTexts({ ...commentTexts, [activity.id]: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(activity.id)}
                                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => handleCommentSubmit(activity.id)}
                                    className="text-primary-600 font-semibold text-sm hover:text-primary-700"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
