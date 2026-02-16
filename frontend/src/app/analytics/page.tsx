'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import StatCard from '@/components/StatCard';
import TrendChart from '@/components/TrendChart';
import HeatmapCalendar from '@/components/HeatmapCalendar';
import {
    Trophy,
    CheckCircle,
    Zap,
    Calendar,
    Clock,
    TrendingUp,
    AlertCircle
} from 'lucide-react';

interface AnalyticsData {
    heatmap: any[];
    insights: {
        totalCompletions: number;
        bestStreak: number;
        averageCompletionsPerWeek: number;
        mostProductiveDay: string;
        mostProductiveTime: string;
    } | null;
    trends: any[];
}

export default function AnalyticsPage() {
    const { token } = useAuth();
    const [data, setData] = useState<AnalyticsData>({
        heatmap: [],
        insights: null,
        trends: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchAnalytics();
        }
    }, [token]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const [heatmap, insights, trends] = await Promise.all([
                api.get<any[]>('/api/analytics/heatmap', token!),
                api.get<any>('/api/analytics/insights', token!),
                api.get<any[]>('/api/analytics/trends', token!)
            ]);

            setData({ heatmap, insights, trends });
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error);
            setError(error.message || 'Failed to load analytics data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <Navbar />
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neutral-900 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <div className="mb-6 inline-flex p-4 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
                        <AlertCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-12">
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Analytics</h1>
                    <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">Track patterns and progress.</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Completions"
                        value={data.insights?.totalCompletions || 0}
                        icon={CheckCircle}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Best Streak"
                        value={`${data.insights?.bestStreak || 0} days`}
                        icon={Zap}
                        color="bg-orange-500"
                    />
                    <StatCard
                        title="Avg. per Week"
                        value={(data.insights?.averageCompletionsPerWeek || 0).toFixed(1)}
                        icon={TrendingUp}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        title="Peak Productivity"
                        value={data.insights?.mostProductiveDay || 'N/A'}
                        icon={Calendar}
                        color="bg-emerald-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Heatmap Section */}
                    <div className="lg:col-span-3">
                        <HeatmapCalendar data={data.heatmap} year={new Date().getFullYear()} />
                    </div>

                    {/* Trend Chart */}
                    <div className="lg:col-span-2">
                        <TrendChart data={data.trends} />
                    </div>

                    {/* Additional Insights */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-neutral-100 dark:border-gray-700">
                            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 mb-6 uppercase tracking-[0.2em]">Patterns</h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-md bg-emerald-500 bg-opacity-10 text-emerald-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Most Active Time</p>
                                        <p className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">{data.insights?.mostProductiveTime}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-md bg-emerald-500 bg-opacity-10 text-emerald-600">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Completion Score</p>
                                        <p className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">High</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-md border border-emerald-100 dark:border-emerald-900/20">
                                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
                                    💡 <b className="font-black uppercase tracking-widest text-[10px] mr-1">Insight:</b>
                                    You're most consistent on {data.insights?.mostProductiveDay}s. Try scheduling your hardest habits then!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
