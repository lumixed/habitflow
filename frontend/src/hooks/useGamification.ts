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

export interface Powerup {
    id: string;
    key: string;
    name: string;
    description: string;
    icon: string;
    cost_coins: number;
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

    const getAvailablePowerups = async (): Promise<Powerup[]> => {
        if (!token) return [];
        try {
            return await api.get<Powerup[]>('/api/gamification/powerups', token);
        } catch (err: any) {
            console.error('Failed to fetch powerups:', err);
            return [];
        }
    };

    const buyPowerup = async (powerupKey: string) => {
        if (!token) return;
        try {
            await api.post('/api/gamification/powerups/purchase', { powerupKey }, token);
            await fetchStats(); // Refresh coins
            return true;
        } catch (err: any) {
            console.error('Failed to purchase powerup:', err);
            throw err;
        }
    };

    return {
        stats,
        loading,
        error,
        getAvailablePowerups,
        buyPowerup,
        refetch: fetchStats
    };
}
