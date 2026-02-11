'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface GamificationStats {
    userId: string;
    displayName: string;
    level: number;
    xp: number;
    coins: number;
    xpProgress: {
        currentLevelXP: number;
        nextLevelXP: number;
        progress: number;
    };
    achievementCount: number;
    longestStreak: number;
}

export function useGamification() {
    const { token } = useAuth();
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await api.get<GamificationStats>('/api/gamification/stats', token);
            setStats(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch gamification stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats
    };
}
