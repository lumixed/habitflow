'use client';

import { useSocial } from '@/hooks/useSocial';

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
                    <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                        Pending Requests ({requests.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {requests.map((request) => (
                            <div key={request.id} className="flex items-center justify-between p-4 rounded-xl bg-primary-50 border border-primary-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary-600 font-bold overflow-hidden border border-primary-200">
                                        {request.sender.avatar_url ? (
                                            <img src={request.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            request.sender.display_name[0]
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-neutral-900 leading-tight">{request.sender.display_name}</h4>
                                        <p className="text-xs text-neutral-500">wants to be your friend</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRequest(request.id, 'ACCEPT')}
                                        className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRequest(request.id, 'DECLINE')}
                                        className="px-3 py-1.5 bg-white text-neutral-600 text-xs font-bold rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
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
                    <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                        Your Friends ({friends.length})
                    </h3>
                )}
                <div className="grid grid-cols-1 gap-3">
                    {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold overflow-hidden border-2 border-white shadow-sm">
                                    {friend.avatar_url ? (
                                        <img src={friend.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        friend.display_name[0]
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900">{friend.display_name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-primary-50 text-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                                            Lvl {friend.level}
                                        </span>
                                        <span className="text-xs text-neutral-400">{friend.xp} XP</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-xs font-semibold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors">
                                View Profile
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
