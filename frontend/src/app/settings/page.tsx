'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import LanguageSelector from '@/components/LanguageSelector';
import ThemeEditor from '@/components/ThemeEditor';
import AdvancedPrivacy from '@/components/AdvancedPrivacy';
import DeveloperSettings from '@/components/DeveloperSettings';
import IntegrationsList from '@/components/IntegrationsList';

const THEMES = [
    { id: 'classic', name: 'Classic', desc: 'The original clean design', color: '#10B981' },
    { id: 'pastel', name: 'Soft Pastel', desc: 'Calming soft colors', color: '#f472b6' },
    { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon yellow on deep black', color: '#facc15' },
];

const ACCENTS = [
    '#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'
];

export default function SettingsPage() {
    const { user } = useAuth();
    const { theme, accentColor, font, setTheme, setAccentColor, setFont } = useTheme();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-appBg text-appText pb-20">
            <Navbar />

            <main className="max-w-3xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Settings</h1>
                    <p className="opacity-60 font-medium">Customize your HabitFlow experience.</p>
                </header>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Visual Theme</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id as any)}
                                className={`p-6 rounded-[2rem] border-2 transition-all text-left ${theme === t.id
                                    ? 'border-primary-500 bg-primary-500/5'
                                    : 'border-neutral-200 bg-white/50 hover:border-neutral-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-4 w-12 rounded-full" style={{ backgroundColor: t.color }}></div>
                                    {theme === t.id && (
                                        <span className="bg-primary-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Selected</span>
                                    )}
                                </div>
                                <h3 className="font-bold mb-1">{t.name}</h3>
                                <p className="text-xs opacity-60">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Accent Color</h2>
                    <div className="flex flex-wrap gap-4">
                        {ACCENTS.map((color) => (
                            <button
                                key={color}
                                onClick={() => setAccentColor(color)}
                                className={`h-12 w-12 rounded-2xl transition-all ${accentColor === color
                                    ? 'scale-110 ring-4 ring-primary-500/20 shadow-lg shadow-black/5'
                                    : 'hover:scale-105 opacity-80'
                                    }`}
                                style={{ backgroundColor: color }}
                            >
                                {accentColor === color && (
                                    <span className="text-white">✓</span>
                                )}
                            </button>
                        ))}
                        <div className="relative">
                            <input
                                type="color"
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="h-12 w-12 rounded-2xl cursor-pointer opacity-0 absolute inset-0 z-10"
                            />
                            <div
                                className="h-12 w-12 rounded-2xl flex items-center justify-center border-2 border-dashed border-neutral-300 bg-white"
                                style={{ backgroundColor: ACCENTS.includes(accentColor) ? 'transparent' : accentColor }}
                            >
                                <span className="text-xl">+</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Font</h2>
                    <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
                        {(['inter', 'roboto', 'outfit', 'poppins', 'montserrat'] as const).map((fontName) => (
                            <button
                                key={fontName}
                                onClick={() => setFont(fontName)}
                                className={`w-full p-4 rounded-2xl text-left transition-all ${font === fontName
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-white hover:bg-neutral-100'
                                    }`}
                                style={{ fontFamily: `var(--font-${fontName})` }}
                            >
                                <div className="font-bold capitalize">{fontName}</div>
                                <div className="text-sm opacity-60">The quick brown fox jumps over the lazy dog</div>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Privacy</h2>
                    <div className="bg-white border border-neutral-200 rounded-lg p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="font-bold mb-1">Public Profile</h3>
                                <p className="text-sm opacity-60">Allow others to view your profile and stats</p>
                            </div>
                            <button
                                onClick={async () => {
                                    const newValue = !user?.is_profile_public;
                                    try {
                                        await fetch('/api/auth/profile/update', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                                            },
                                            body: JSON.stringify({ is_profile_public: newValue })
                                        });
                                        window.location.reload();
                                    } catch (err) {
                                        console.error('Failed to update privacy:', err);
                                    }
                                }}
                                className={`relative w-14 h-8 rounded-full transition-colors ${user?.is_profile_public ? 'bg-primary-500' : 'bg-neutral-300'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${user?.is_profile_public ? 'translate-x-6' : 'translate-x-0'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Email Reports</h2>
                    <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                            <div className="flex-1">
                                <h3 className="font-bold mb-1">Weekly Reports</h3>
                                <p className="text-sm opacity-60">Receive a summary of your habits every Monday</p>
                            </div>
                            <button
                                onClick={async () => {
                                    // TODO: Connect to email preferences API
                                    alert('Email preferences coming soon! Check your notification settings.');
                                }}
                                className="relative w-14 h-8 rounded-full transition-colors bg-primary-500"
                            >
                                <div className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform translate-x-6" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h3 className="font-bold mb-1">Monthly Wrap-Ups</h3>
                                <p className="text-sm opacity-60">Get your monthly achievements on the 1st</p>
                            </div>
                            <button
                                onClick={async () => {
                                    alert('Email preferences coming soon! Check your notification settings.');
                                }}
                                className="relative w-14 h-8 rounded-full transition-colors bg-primary-500"
                            >
                                <div className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform translate-x-6" />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="bg-white border border-neutral-200 rounded-lg p-5">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Account Info</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-neutral-200 overflow-hidden">
                            {user?.avatar_url && <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />}
                        </div>
                        <div>
                            <p className="font-bold text-lg">{user?.display_name}</p>
                            <p className="text-sm opacity-60">{user?.email}</p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Language</h2>
                    <LanguageSelector />
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Advanced Theme Editor</h2>
                    <ThemeEditor />
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Integrations</h2>
                    <IntegrationsList />
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Advanced Privacy</h2>
                    <AdvancedPrivacy />
                </section>

                <section className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">Developer</h2>
                    <DeveloperSettings />
                </section>
            </main>

            <MobileNav />
        </div>
    );
}
