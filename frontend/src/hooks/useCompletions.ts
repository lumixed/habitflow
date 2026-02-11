import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Completion {
    id: string;
    habit_id: string;
    user_id: string;
    completed_date: string;
    created_at: string;
}

export function useCompletions(habit_id: string) {
    const { token } = useAuth();
    const [completions, setCompletions] = useState<Completion[]>([]);
    const [streak, setStreak] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token || !habit_id) return;

        const fetchData = async () => {
            try {
                const [completionsData, streakData] = await Promise.all([
                    api.get<{ completions: Completion[] }>(`/api/completions/${habit_id}`, token),
                    api.get<{ streak: number }>(`/api/streak/${habit_id}`, token),
                ]);

                setCompletions(completionsData.completions);
                setStreak(streakData.streak);
            } catch (err) {
                console.error('Failed to fetch completions:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, habit_id]);

    const toggleCompletion = async (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const isCompleted = completions.some(
            (c) => c.completed_date.split('T')[0] === dateStr
        );

        try {
            if (isCompleted) {
                await api.delete('/api/completions', { habit_id, completed_date: dateStr }, token!);
                setCompletions((prev) => prev.filter((c) => c.completed_date.split('T')[0] !== dateStr));

                const streakData = await api.get<{ streak: number }>(`/api/streak/${habit_id}`, token!);
                setStreak(streakData.streak);
                return null;
            } else {
                const data = await api.post<{ completion: Completion; rewards?: any }>(
                    '/api/completions',
                    { habit_id, completed_date: dateStr },
                    token!
                );
                setCompletions((prev) => [data.completion, ...prev]);

                const streakData = await api.get<{ streak: number }>(`/api/streak/${habit_id}`, token!);
                setStreak(streakData.streak);

                return data.rewards;
            }
        } catch (err: any) {
            console.error('Failed to toggle completion:', err);
            throw err;
        }
    };

    const isDateCompleted = (date: Date): boolean => {
        const dateStr = date.toISOString().split('T')[0];
        return completions.some((c) => c.completed_date.split('T')[0] === dateStr);
    };

    return {
        completions,
        streak,
        isLoading,
        toggleCompletion,
        isDateCompleted,
    };
}
