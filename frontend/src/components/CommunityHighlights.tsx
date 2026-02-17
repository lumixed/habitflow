'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Highlight {
    id: string;
    type: string;
    content_text: string;
    created_at: string;
    user: {
        display_name: string;
        avatar_url: string | null;
        level: number;
    };
}

const CommunityHighlights = () => {
    const { token } = useAuth();
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                if (!token) return;
                const { highlights } = await api.get<{ highlights: Highlight[] }>('/api/social/highlights', token);
                setHighlights(highlights);
            } catch (err) {
                console.error('Failed to fetch highlights:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHighlights();
    }, [token]);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-neutral-100 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (highlights.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                Community Landmarks
            </h3>
            <div className="space-y-3">
                {highlights.map((item) => (
                    <div key={item.id} className="group bg-white p-4 rounded-xl border border-neutral-100 shadow-sm transition-all hover:border-primary-200">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center font-bold text-neutral-600 uppercase">
                                    {item.user.avatar_url ? (
                                        <img src={item.user.avatar_url} alt="" className="w-full h-full rounded-lg object-cover" />
                                    ) : (
                                        item.user.display_name.charAt(0)
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary-600 text-white text-[8px] font-black flex items-center justify-center rounded-md border-2 border-white">
                                    {item.user.level}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-neutral-900 truncate uppercase tracking-tight">
                                    {item.user.display_name}
                                </p>
                                <p className="text-[10px] text-neutral-500 font-medium line-clamp-1">
                                    {item.content_text || (item.type === 'LEVEL_UP' ? 'Leveled up!' : 'Achieved something great!')}
                                </p>
                            </div>
                            <div className="text-[10px] text-neutral-400 font-bold whitespace-nowrap bg-neutral-50 px-2 py-1 rounded lowercase">
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:text-neutral-900 transition-colors group">
                View Full Feed <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
            </button>
        </div>
    );
};

export default CommunityHighlights;
