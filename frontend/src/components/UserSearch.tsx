'use client';

import { useState } from 'react';
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
                    placeholder="Search by name or email..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    disabled={isSearching}
                    className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="space-y-3">
                {results.length > 0 ? (
                    results.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold overflow-hidden">
                                    {u.avatar_url ? (
                                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        u.display_name[0]
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900">{u.display_name}</h4>
                                    <span className="text-xs text-neutral-400">Level {u.level}</span>
                                </div>
                            </div>

                            {sentRequests.has(u.id) ? (
                                <span className="text-xs font-semibold text-neutral-400 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                                    Request Sent
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleAddFriend(u.id)}
                                    className="px-4 py-2 bg-primary-50 text-primary-600 text-sm font-bold rounded-lg hover:bg-primary-100 transition-colors"
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
