'use client';

import { useState, useEffect } from 'react';

interface GamificationStats {
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
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/gamification/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch gamification stats');
            }

            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats
    };
}
