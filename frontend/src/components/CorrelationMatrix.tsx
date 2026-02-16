'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface HabitCorrelation {
    habit1: {
        id: string;
        title: string;
    };
    habit2: {
        id: string;
        title: string;
    };
    correlationScore: number;
    strength: 'strong' | 'moderate' | 'weak';
    type: 'positive' | 'negative' | 'neutral';
    insight: string;
}

interface CorrelationAnalysis {
    correlations: HabitCorrelation[];
    insights: string[];
    recommendations: string[];
}

export default function CorrelationMatrix() {
    const { token } = useAuth();
    const [data, setData] = useState<CorrelationAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        if (token) {
            fetchCorrelations();
        }
    }, [token, days]);

    const fetchCorrelations = async () => {
        setLoading(true);
        try {
            const result = await api.get<CorrelationAnalysis>(`/api/correlations?days=${days}`, token!);
            setData(result);
        } catch (err) {
            console.error('Failed to fetch correlations:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="animate-pulse">
                    <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                </div>
            </div>
        );
    }

    if (!data || data.correlations.length === 0) {
        return (
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h3 className="text-xl font-black mb-4">Habit Correlations</h3>
                <p className="text-neutral-600">
                    Not enough data to show correlations. Keep tracking your habits for at least a week!
                </p>
            </div>
        );
    }

    const getCorrelationColor = (score: number, type: string) => {
        if (type === 'positive') {
            return score > 0.7 ? 'bg-emerald-500' : score > 0.4 ? 'bg-emerald-400' : 'bg-emerald-300';
        } else if (type === 'negative') {
            return score < -0.7 ? 'bg-red-500' : score < -0.4 ? 'bg-red-400' : 'bg-red-300';
        }
        return 'bg-neutral-300';
    };

    const getStrengthLabel = (strength: string) => {
        const labels = {
            strong: 'Strong',
            moderate: 'Moderate',
            weak: 'Weak'
        };
        return labels[strength as keyof typeof labels] || strength;
    };

    return (
        <div className="space-y-6">
            {/* Time Period Selector */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black">Habit Correlations</h3>
                    <select
                        value={days}
                        onChange={(e) => setDays(parseInt(e.target.value))}
                        className="px-4 py-2 rounded-xl border border-neutral-200 font-bold text-sm"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                </div>
            </div>

            {/* Insights */}
            {data.insights.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-lg p-5">
                    <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-4">Key Insights</h4>
                    <div className="space-y-2">
                        {data.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600">💡</span>
                                <p className="text-sm text-neutral-700">{insight}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {data.recommendations.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-lg p-5">
                    <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-4">Recommendations</h4>
                    <div className="space-y-2">
                        {data.recommendations.map((rec, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <p className="text-sm text-neutral-700">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Correlation List */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="text-sm font-black uppercase tracking-widest opacity-50 mb-6">Correlations Found</h4>
                <div className="space-y-4">
                    {data.correlations.map((corr, idx) => (
                        <div key={idx} className="border border-neutral-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                    <div className="font-bold text-neutral-900">{corr.habit1.title}</div>
                                    <div className="text-sm text-neutral-500">correlates with</div>
                                    <div className="font-bold text-neutral-900">{corr.habit2.title}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`px-3 py-1 rounded-full text-white text-xs font-bold inline-block ${getCorrelationColor(corr.correlationScore, corr.type)}`}>
                                        {getStrengthLabel(corr.strength)}
                                    </div>
                                    <div className="text-2xl font-black mt-1">
                                        {Math.round(Math.abs(corr.correlationScore) * 100)}%
                                    </div>
                                </div>
                            </div>
                            <div className="bg-neutral-50 rounded-xl p-3 text-sm text-neutral-600">
                                {corr.insight}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
