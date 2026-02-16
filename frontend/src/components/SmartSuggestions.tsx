'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useAI, WeatherSuggestions, HabitStack } from '@/hooks/useAI';

interface SmartSuggestionsProps {
    onAddHabit?: (title: string, description: string) => void;
}

export default function SmartSuggestions({ onAddHabit }: SmartSuggestionsProps) {
    const { getWeatherSuggestions, getHabitRecommendations, getHabitStacks, isLoading, error } = useAI();
    const [data, setData] = useState<WeatherSuggestions | null>(null);
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [stacks, setStacks] = useState<HabitStack[]>([]);

    useEffect(() => {
        getWeatherSuggestions()
            .then(setData)
            .catch(() => { }); // Error handled in hook

        getHabitRecommendations()
            .then(setRecommendations)
            .catch(() => { });

        getHabitStacks()
            .then(setStacks)
            .catch(() => { });
    }, []);

    if (isLoading && !data && recommendations.length === 0 && stacks.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
                <div className="h-4 bg-neutral-100 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-10 bg-neutral-50 rounded"></div>
                    <div className="h-10 bg-neutral-50 rounded"></div>
                </div>
            </div>
        );
    }

    // Always try to show whatever we have
    if (!data && recommendations.length === 0 && stacks.length === 0) {
        if (isLoading) return null; // Still loading everything
        return null; // Truly nothing to show
    }

    // if (!data) return null; // This line is removed as the new structure handles it

    const weatherIcons: Record<string, string> = {
        clear: '☀️',
        cloudy: '☁️',
        rainy: '🌧️',
        snowy: '❄️',
        stormy: '⛈️',
        foggy: '🌫️',
        rain_showers: '🌦️'
    };

    return (
        <div className="space-y-4">
            {data && (
                <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-right">
                            <span className="text-2xl">{weatherIcons[data.weather.condition] || '🌈'}</span>
                            <span className="block text-[10px] font-bold text-neutral-500">{data.weather.temperature}°C</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {data.suggestions.map((suggestion, i) => (
                            <div
                                key={i}
                                onClick={() => onAddHabit?.(suggestion, `Based on current weather: ${data.weather.condition}`)}
                                className="flex items-center justify-between p-3 bg-white border border-primary-100 rounded-lg hover:border-primary-300 transition-all cursor-pointer group"
                            >
                                <span className="text-sm font-medium text-neutral-700">{suggestion}</span>
                                <span className="text-primary-400 group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && recommendations.length > 0 && (
                <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                            <Sparkles size={16} className="text-primary-500" /> Recommended for You
                        </h3>
                        <p className="text-xs text-neutral-600 mt-1">
                            AI-picked habits to help you grow
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {recommendations.map((rec, i) => (
                            <div
                                key={i}
                                onClick={() => onAddHabit?.(rec, 'AI Recommended habit')}
                                className="p-3 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-all cursor-pointer group flex flex-col items-center justify-center text-center"
                            >
                                <span className="text-xs font-bold text-neutral-700">{rec}</span>
                                <span className="text-[10px] text-neutral-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Add Habit +</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && stacks.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                            Habit Stacking
                        </h3>
                        <p className="text-[11px] text-emerald-600 mt-0.5">
                            Pair new habits with your existing routine
                        </p>
                    </div>

                    <div className="space-y-3">
                        {stacks.map((stack, i) => (
                            <div
                                key={i}
                                onClick={() => onAddHabit?.(`I will ${stack.suggestion}`, `After I ${stack.trigger}`)}
                                className="p-3 bg-white border border-emerald-100 rounded-lg hover:border-emerald-300 transition-all cursor-pointer group flex items-center justify-between"
                            >
                                <div className="flex-1">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">After I {stack.trigger}...</span>
                                    <span className="text-sm font-semibold text-neutral-800">I will {stack.suggestion}</span>
                                </div>
                                <span className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Add +</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(data || recommendations.length > 0 || stacks.length > 0) && (
                <p className="text-[9px] text-neutral-400 mt-2 text-center">
                    Suggestions are AI-generated based on optimal conditions and your patterns.
                </p>
            )}
        </div>
    );
}
