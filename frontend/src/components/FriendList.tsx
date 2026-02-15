'use client';

import { useSocial } from '@/hooks/useSocial';
import Link from 'next/link';

export default function FriendList() {
    const { friends, requests, handleRequest, isLoading } = useSocial();

    if (isLoading && friends.length === 0 && requests.length === 0) {
        return <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
        </div>;
    }

    if (friends.length === 0 && requests.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500">
                <p>No activity yet. Use the Find People tab to connect!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Pending Requests Section */}
            {requests.length > 0 && (
                <div>
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-6">
                        Pending Requests ({requests.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {requests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-4 rounded-xl bg-primary-50 border border-primary-100 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-emerald-600 font-black overflow-hidden border border-emerald-100">
                                        {request.sender?.avatar_url ? (
                                            <img src={request.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            (request.sender?.display_name || '?')[0]
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 leading-tight">{request.sender?.display_name || 'Anonymous'}</h4>
                                        <p className="text-xs text-neutral-500">wants to be your friend</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRequest(request.id, 'ACCEPT')}
                                        className="px-4 py-2 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-neutral-800 transition-all"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRequest(request.id, 'DECLINE')}
                                        className="px-4 py-2 bg-white text-neutral-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-neutral-100 hover:bg-neutral-50 transition-all"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friend List Section */}
            <div>
                {friends.length > 0 && (
                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-6">
                        Your Friends ({friends.length})
                    </h3>
                )}
                <div className="grid grid-cols-1 gap-3">
                    {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary-200 transition-colors bg-white">
                            <Link href={`/profile/${friend.id}`} className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400 font-black overflow-hidden border border-neutral-100 shadow-sm transition-transform group-hover:scale-105">
                                    {friend?.avatar_url ? (
                                        <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (friend?.display_name || '?')[0]
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-black text-neutral-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                                        {friend?.display_name || 'Anonymous'}
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-widest leading-none">
                                            Lvl {friend.level}
                                        </span>
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{friend.xp} XP</span>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href={`/profile/${friend.id}`}
                                className="text-[10px] font-black text-neutral-900 uppercase tracking-widest hover:underline px-4 py-2 border border-neutral-200 rounded-md hover:bg-neutral-50"
                            >
                                PROFILE
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
