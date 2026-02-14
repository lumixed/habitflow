import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface WeatherData {
    temperature: number;
    condition: string;
    description: string;
}

export interface WeatherSuggestions {
    weather: WeatherData;
    suggestions: string[];
}

export interface HabitInsight {
    habit_id: string;
    success_probability: number;
    peak_completion_hour: number | null;
    consistency_score: number;
    insight_text: string;
}

export interface HabitStack {
    trigger: string;
    suggestion: string;
}

export function useAI() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getWeatherSuggestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (typeof window === 'undefined' || !navigator.geolocation) {
                setError('Geolocation is not supported by your browser');
                return null;
            }

            return new Promise<WeatherSuggestions>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            const response = await api.get<WeatherSuggestions>(
                                `/api/ai/weather-suggestions?lat=${latitude}&lon=${longitude}`,
                                token ?? undefined
                            );
                            resolve(response);
                        } catch (err: any) {
                            setError(err.message || 'Failed to fetch suggestions');
                            reject(err);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                    (geoErr) => {
                        setError('Location access required for smart features');
                        setIsLoading(false);
                        reject(geoErr);
                    },
                    { timeout: 10000 }
                );
            });
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setIsLoading(false);
            throw err;
        }
    };

    const getHabitInsights = async (): Promise<HabitInsight[]> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ insights: HabitInsight[] }>('/api/ai/insights', token ?? undefined);
            return response.insights;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch insights');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getHabitInsight = async (habitId: string): Promise<HabitInsight> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ insight: HabitInsight }>(`/api/ai/insights/${habitId}`, token ?? undefined);
            return response.insight;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch insight');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getHabitRecommendations = async (): Promise<string[]> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ recommendations: string[] }>('/api/ai/recommendations', token ?? undefined);
            return response.recommendations;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch recommendations');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getHabitStacks = async (): Promise<HabitStack[]> => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<{ stacks: HabitStack[] }>('/api/ai/stacks', token ?? undefined);
            return response.stacks;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch habit stacks');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        getWeatherSuggestions,
        getHabitInsights,
        getHabitInsight,
        getHabitRecommendations,
        getHabitStacks,
        isLoading,
        error
    };
}
