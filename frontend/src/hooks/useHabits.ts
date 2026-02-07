import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Habit {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    frequency: 'DAILY' | 'WEEKLY' | 'WEEKDAYS';
    color: string;
    icon: string;
    is_active: boolean;
    created_at: string;
}

interface CreateHabitInput {
    title: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'WEEKDAYS';
    color?: string;
    icon?: string;
}

interface UpdateHabitInput {
    title?: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'WEEKDAYS';
    color?: string;
    icon?: string;
    is_active?: boolean;
}


export function useHabits() {
    const { token } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        if (!token) return;

        const fetchHabits = async () => {
        try {
            const data = await api.get<{ habits: Habit[] }>('/api/habits', token);
            setHabits(data.habits);
        } catch (err: any) {
            setError(err.message || 'Failed to load habits');
        } finally {
            setIsLoading(false);
        }
        };

        fetchHabits();
    }, [token]);

    const createHabit = async (input: CreateHabitInput) => {
        const data = await api.post<{ habit: Habit }>('/api/habits', input, token!);
        setHabits((prev) => [data.habit, ...prev]);
        return data.habit;
    };

    const updateHabit = async (id: string, updates: UpdateHabitInput) => {
        const data = await api.put<{ habit: Habit }>(`/api/habits/${id}`, updates, token!);
        setHabits((prev) => prev.map((h) => (h.id === id ? data.habit : h)));
        return data.habit;
    };

    const deleteHabit = async (id: string) => {
        await api.delete(`/api/habits/${id}`, token!);
        setHabits((prev) => prev.filter((h) => h.id !== id));
    };

    return {
        habits,
        isLoading,
        error,
        createHabit,
        updateHabit,
        deleteHabit,
    };
}
