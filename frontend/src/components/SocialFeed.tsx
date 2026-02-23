'use client';

import { useSocial } from '@/hooks/useSocial';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Check, Flame, Trophy, Heart, MessageCircle } from 'lucide-react';
import LucideIcon from './LucideIcon';

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
            case 'HABIT_COMPLETED': return <Check size={16} className="text-green-600" />;
            case 'FRIEND_JOINED': return <Heart size={16} className="text-blue-600" />;
            case 'ACHIEVEMENT_UNLOCKED': return <Trophy size={16} className="text-yellow-600" />;
            case 'STREAK_MILESTONE': return <Flame size={16} className="text-orange-600" />;
            default: return <MessageCircle size={16} className="text-blue-600" />;
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
                        <Link href={`/profile/${activity.user?.id || '#'}`} className="hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-primary-500 font-black overflow-hidden shadow-sm">
                                {activity.user?.avatar_url ? (
                                    <img src={activity.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    (activity.user?.display_name || '?')[0]
                                )}
                            </div>
                        </Link>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Link href={`/profile/${activity.user?.id || '#'}`} className="text-sm font-black text-neutral-900 hover:text-emerald-600 transition-colors uppercase tracking-tight">
                                    {activity.user?.display_name || 'Anonymous'}
                                </Link>
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
                                    <span className="font-black text-emerald-600 uppercase tracking-widest text-[10px]">{activity.content_text}</span>
                                )}
                                {activity.type === 'ACHIEVEMENT_UNLOCKED' && (
                                    <>Unlocked achievement <span className="font-semibold">"{activity.content_text}"</span></>
                                )}
                            </p>

                            {/* Interactions */}
                            <div className="mt-4 flex items-center gap-6">
                                <button
                                    onClick={() => reactToActivity(activity.id)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 hover:text-emerald-600 uppercase tracking-widest transition-colors"
                                >
                                    <LucideIcon name="Heart" size={14} />
                                    <span>{activity.reactions?.length || 0}</span>
                                </button>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                    <LucideIcon name="MessageSquare" size={14} />
                                    <span>{activity._count?.comments || 0}</span>
                                </div>
                            </div>

                            {/* Comments List */}
                            {activity.comments && activity.comments.length > 0 && (
                                <div className="mt-4 space-y-3 pl-4 border-l-2 border-neutral-50">
                                    {activity.comments.map((comment: any) => (
                                        <div key={comment.id} className="group">
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <Link href={`/profile/${comment.user?.id || '#'}`} className="text-[10px] font-black text-neutral-900 uppercase tracking-tight hover:text-emerald-600 transition-colors">
                                                            {comment.user?.display_name || 'Anonymous'}
                                                        </Link>
                                                        <span className="text-[10px] text-neutral-400 font-medium">
                                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Comment Box */}
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="ADD A COMMENT..."
                                    value={commentTexts[activity.id] || ''}
                                    onChange={(e) => setCommentTexts({ ...commentTexts, [activity.id]: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(activity.id)}
                                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-md px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent"
                                />
                                <button
                                    onClick={() => handleCommentSubmit(activity.id)}
                                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 px-2"
                                >
                                    POST
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
