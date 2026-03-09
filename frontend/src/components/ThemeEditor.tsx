'use client';

import { useState, useEffect } from 'react';
import { Copy, Download, Upload, RotateCcw } from 'lucide-react';

interface ThemeConfig {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        border: string;
    };
}

const DEFAULT_THEME: ThemeConfig = {
    colors: {
        primary: '#facc15',
        secondary: '#10B981',
        accent: '#facc15',
        background: '#F9FAFB',
        text: '#111827',
        border: '#E5E7EB'
    },
};

export default function ThemeEditor() {
    const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        // Load saved theme from localStorage
        const saved = localStorage.getItem('customTheme');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure primary and accent are yellow even in saved themes
                parsed.colors.primary = '#facc15';
                parsed.colors.accent = '#facc15';
                setTheme(parsed);
                setIsModified(true);
            } catch (e) {
                console.error('Failed to load custom theme');
            }
        }
    }, []);

    useEffect(() => {
        // Apply theme to CSS variables
        const root = document.documentElement;

        // Colors
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-secondary', theme.colors.secondary);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--bg-main', theme.colors.background);
        root.style.setProperty('--text-main', theme.colors.text);
        root.style.setProperty('--border-color', theme.colors.border);
    }, [theme]);

    const handleColorChange = (key: keyof ThemeConfig['colors'], value: string) => {
        if (key === 'primary' || key === 'accent') return; // Prevent changing these
        const newTheme = {
            ...theme,
            colors: { ...theme.colors, [key]: value }
        };
        setTheme(newTheme);
        setIsModified(true);
    };

    const saveTheme = () => {
        localStorage.setItem('customTheme', JSON.stringify(theme));
        alert('Theme saved successfully');
    };

    const exportTheme = () => {
        const json = JSON.stringify(theme, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'habitflow-theme.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importTheme = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target?.result as string);
                    // Ensure primary and accent are yellow
                    imported.colors.primary = '#facc15';
                    imported.colors.accent = '#facc15';
                    setTheme(imported);
                    setIsModified(true);
                    alert('Theme imported successfully');
                } catch (err) {
                    alert('Invalid theme file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const resetTheme = () => {
        if (confirm('Reset to default theme?')) {
            setTheme(DEFAULT_THEME);
            localStorage.removeItem('customTheme');
            setIsModified(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with Actions */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900">Theme Customization</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={exportTheme}
                            className="px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-sm font-medium flex items-center gap-1.5 transition-colors"
                        >
                            <Download size={14} />
                            <span>Export</span>
                        </button>
                        <button
                            onClick={importTheme}
                            className="px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-sm font-medium flex items-center gap-1.5 transition-colors"
                        >
                            <Upload size={14} />
                            <span>Import</span>
                        </button>
                        <button
                            onClick={resetTheme}
                            className="px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
                        >
                            <RotateCcw size={14} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
                {isModified && (
                    <button
                        onClick={saveTheme}
                        className="w-full px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                    >
                        Save Changes
                    </button>
                )}
            </div>

            {/* Color Palette */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-neutral-700 mb-4">Color Palette</h4>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(theme.colors)
                        .filter(([key]) => key !== 'primary' && key !== 'accent')
                        .map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-neutral-600 mb-1.5 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1')}
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={(e) => handleColorChange(key as keyof ThemeConfig['colors'], e.target.value)}
                                        className="w-12 h-10 rounded-md border border-neutral-300 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleColorChange(key as keyof ThemeConfig['colors'], e.target.value)}
                                        className="flex-1 px-2.5 py-1.5 rounded-md border border-neutral-200 font-mono text-xs"
                                    />
                                </div>
                            </div>
                        ))}
                </div>
            </div>

        </div>
    );
}
