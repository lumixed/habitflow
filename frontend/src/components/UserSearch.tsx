'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/hooks/useSocial';

export default function UserSearch() {
    const { token } = useAuth();
    const { sendFriendRequest } = useSocial();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || !token) return;

        setIsSearching(true);
        try {
            const data = await api.get<{ users: any[] }>(`/api/social/search?q=${query}`, token);
            setResults(data.users);
        } catch (err) {
            console.error('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFriend = async (userId: string) => {
        try {
            await sendFriendRequest(userId);
            setSentRequests(prev => new Set(prev).add(userId));
        } catch (err: any) {
            alert(err.message || 'Failed to send friend request');
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    placeholder="FIND PEOPLE..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-md text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent"
                />
                <button
                    type="submit"
                    disabled={isSearching}
                    className="px-8 py-3 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-sm"
                >
                    {isSearching ? 'SEARCHING...' : 'SEARCH'}
                </button>
            </form>

            <div className="space-y-3">
                {results.length > 0 ? (
                    results.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary-200 transition-all shadow-sm bg-white">
                            <Link href={`/profile/${u.id}`} className="flex items-center gap-3 group">
                                <div className="w-12 h-12 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400 font-black overflow-hidden border border-neutral-100 shadow-sm transition-transform group-hover:scale-105">
                                    {u.avatar_url ? (
                                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        (u.display_name || '?')[0]
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-neutral-900 uppercase tracking-tight leading-tight group-hover:text-primary-600 transition-colors">
                                        {u.display_name || 'Anonymous'}
                                    </h4>
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                        Level {u.level || 1}
                                    </span>
                                </div>
                            </Link>

                            {sentRequests.has(u.id) ? (
                                <span className="text-[10px] font-black text-neutral-400 bg-neutral-50 px-4 py-2 rounded-md border border-neutral-100 uppercase tracking-widest">
                                    Requested
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleAddFriend(u.id)}
                                    className="px-4 py-2 bg-white text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-neutral-50 transition-all border border-emerald-200 shadow-sm"
                                >
                                    Add Friend
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    query && !isSearching && (
                        <div className="text-center py-12 text-neutral-500">
                            No users found matching "{query}"
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
