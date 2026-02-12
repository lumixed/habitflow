'use client';

import { useSocial } from '@/hooks/useSocial';

export default function FriendList() {
    const { friends, isLoading } = useSocial();

    if (isLoading && friends.length === 0) {
        return <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
        </div>;
    }

    if (friends.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500">
                <p>No friends yet. Use the Find People tab to connect!</p>
            </div>
        );
    }

    return (
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
    );
}
