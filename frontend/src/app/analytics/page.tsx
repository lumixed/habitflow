'use client';

import { useState, useEffect } from 'react';
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
    TrendingUp
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
    const [data, setData] = useState<AnalyticsData>({
        heatmap: [],
        insights: null,
        trends: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [heatmapRes, insightsRes, trendsRes] = await Promise.all([
                fetch('http://localhost:3001/api/analytics/heatmap', { headers }),
                fetch('http://localhost:3001/api/analytics/insights', { headers }),
                fetch('http://localhost:3001/api/analytics/trends', { headers })
            ]);

            const [heatmap, insights, trends] = await Promise.all([
                heatmapRes.json(),
                insightsRes.json(),
                trendsRes.json()
            ]);

            setData({ heatmap, insights, trends });
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100-64px)] py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress and discover your habits' patterns.</p>
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
                        color="bg-indigo-500"
                    />
                    <StatCard
                        title="Peak Productivity"
                        value={data.insights?.mostProductiveDay || 'N/A'}
                        icon={Calendar}
                        color="bg-blue-500"
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
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Patterns</h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-purple-500 bg-opacity-10 text-purple-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Most Active Time</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{data.insights?.mostProductiveTime}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-amber-500 bg-opacity-10 text-amber-500">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Completion Score</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">High</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-900/30">
                                <p className="text-sm text-primary-700 dark:text-primary-300">
                                    💡 <b>Insight:</b> You're most consistent on {data.insights?.mostProductiveDay}s. Try scheduling your hardest habits then!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
