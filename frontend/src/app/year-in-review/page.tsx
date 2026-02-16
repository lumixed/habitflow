'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import ShareButton from '@/components/ShareButton';
import { Download, Trophy } from 'lucide-react';

interface YearInReviewData {
    year: number;
    totalCompletions: number;
    totalDaysActive: number;
    longestStreak: number;
    totalXPGained: number;
    levelsGained: number;
    achievementsUnlocked: number;
    coinsEarned: number;
    topHabits: Array<{
        title: string;
        completions: number;
        consistency: number;
    }>;
    monthlyBreakdown: Array<{
        month: string;
        completions: number;
    }>;
    insights: string[];
}

export default function YearInReviewPage() {
    const { token } = useAuth();
    const [data, setData] = useState<YearInReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        if (token) {
            fetchYearInReview();
        }
    }, [token]);

    const fetchYearInReview = async () => {
        try {
            const result = await api.get<YearInReviewData>(`/api/year-in-review/${currentYear}`, token!);
            setData(result);
        } catch (err) {
            console.error('Failed to fetch year in review:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">Loading your {currentYear} wrapped...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-appBg text-appText">
                <Navbar />
                <div className="max-w-2xl mx-auto p-6 text-center">
                    <h1 className="text-3xl font-bold mb-4">Year in Review</h1>
                    <p>No data available for {currentYear}. Start tracking your habits to see your wrap-up next year!</p>
                </div>
                <MobileNav />
            </div>
        );
    }

    const slides = [
        // Slide 1: Welcome
        <div key="welcome" className="h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-blue-600">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-4 animate-fadeIn">{currentYear}</h1>
            <p className="text-3xl md:text-4xl font-bold text-white/90">Your Year in HabitFlow</p>
        </div>,

        // Slide 2: Total Completions
        <div key="completions" className="h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-emerald-600 to-teal-600">
            <div className="text-8xl md:text-9xl font-black text-white mb-4 animate-scaleIn">{data.totalCompletions}</div>
            <p className="text-2xl md:text-3xl font-bold text-white/90">Total Completions</p>
            <p className="text-lg text-white/70 mt-4">You showed up and crushed it!</p>
        </div>,

        // Slide 3: Days Active
        <div key="days" className="h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-600 to-red-600">
            <div className="text-8xl md:text-9xl font-black text-white mb-4 animate-scaleIn">{data.totalDaysActive}</div>
            <p className="text-2xl md:text-3xl font-bold text-white/90">Days Active</p>
            <p className="text-lg text-white/70 mt-4">{Math.round((data.totalDaysActive / 365) * 100)}% of the year!</p>
        </div>,

        // Slide 4: Longest Streak
        <div key="streak" className="h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-pink-600 to-purple-600">
            <div className="text-8xl md:text-9xl font-black text-white mb-4 animate-scaleIn">{data.longestStreak}</div>
            <p className="text-2xl md:text-3xl font-bold text-white/90">Day Streak</p>
            <p className="text-lg text-white/70 mt-4">Unstoppable!</p>
        </div>,

        // Slide 5: Top Habits
        <div key="top-habits" className="h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-pink-600">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Your Top Habits</h2>
            <div className="w-full max-w-md space-y-4">
                {data.topHabits.slice(0, 3).map((habit, idx) => (
                    <div key={idx} className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl font-black text-white/50">#{idx + 1}</div>
                            <div className="flex-1">
                                <div className="font-bold text-white text-xl">{habit.title}</div>
                                <div className="text-white/70">{habit.completions} completions</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>,

        // Slide 6: Achievements
        <div key="achievements" className="h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-yellow-600 to-orange-600">
            <div className="mb-4">
                <Trophy size={80} className="text-white" />
            </div>
            <div className="text-7xl md:text-8xl font-black text-white mb-4">{data.achievementsUnlocked}</div>
            <p className="text-2xl md:text-3xl font-bold text-white/90">Achievements Unlocked</p>
            <p className="text-lg text-white/70 mt-4">You're a legend!</p>
        </div>,

        // Slide 7: Insights
        <div key="insights" className="h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-cyan-600 to-blue-600">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Your Year's Insights</h2>
            <div className="w-full max-w-2xl space-y-4">
                {data.insights.map((insight, idx) => (
                    <div key={idx} className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                        <p className="text-white text-lg">{insight}</p>
                    </div>
                ))}
            </div>
        </div>,

        // Slide 8: Share
        <div key="share" className="h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-600 to-pink-600">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Share Your Year</h2>
            <p className="text-xl text-white/90 mb-8">Show off your amazing progress!</p>
            <ShareButton
                type="milestone"
                data={{
                    title: `${currentYear} Wrapped`,
                    subtitle: `${data.totalCompletions} completions • ${data.totalDaysActive} days active`,
                    icon: '🎊',
                    value: data.totalCompletions
                }}
                className="mb-4"
            />
        </div>
    ];

    return (
        <div className="min-h-screen bg-black overflow-hidden">
            {/* Slides */}
            <div
                className="transition-transform duration-500 ease-out flex"
                style={{ transform: `translateX(-${currentSlide * 100}vw)` }}
            >
                {slides.map((slide, idx) => (
                    <div key={idx} className="min-w-screen">
                        {slide}
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
                {currentSlide > 0 && (
                    <button
                        onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                        className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Previous
                    </button>
                )}
                {currentSlide < slides.length - 1 && (
                    <button
                        onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                        className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Next
                    </button>
                )}
            </div>

            {/* Progress Dots */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
