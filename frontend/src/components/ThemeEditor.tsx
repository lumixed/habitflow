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
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    spacing: {
        scale: number; // 0.8 to 1.5
    };
}

const DEFAULT_THEME: ThemeConfig = {
    colors: {
        primary: '#6366F1',
        secondary: '#10B981',
        accent: '#F43F5E',
        background: '#F9FAFB',
        text: '#111827',
        border: '#E5E7EB'
    },
    borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '1rem',
        xl: '2.5rem'
    },
    spacing: {
        scale: 1.0
    }
};

export default function ThemeEditor() {
    const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        // Load saved theme from localStorage
        const saved = localStorage.getItem('customTheme');
        if (saved) {
            try {
                setTheme(JSON.parse(saved));
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

        // Border radius
        root.style.setProperty('--radius-sm', theme.borderRadius.sm);
        root.style.setProperty('--radius-md', theme.borderRadius.md);
        root.style.setProperty('--radius-lg', theme.borderRadius.lg);
        root.style.setProperty('--radius-xl', theme.borderRadius.xl);

        // Spacing
        root.style.setProperty('--spacing-scale', theme.spacing.scale.toString());
    }, [theme]);

    const handleColorChange = (key: keyof ThemeConfig['colors'], value: string) => {
        const newTheme = {
            ...theme,
            colors: { ...theme.colors, [key]: value }
        };
        setTheme(newTheme);
        setIsModified(true);
    };

    const handleBorderRadiusChange = (key: keyof ThemeConfig['borderRadius'], value: string) => {
        const newTheme = {
            ...theme,
            borderRadius: { ...theme.borderRadius, [key]: value }
        };
        setTheme(newTheme);
        setIsModified(true);
    };

    const handleSpacingChange = (scale: number) => {
        const newTheme = {
            ...theme,
            spacing: { scale }
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
                    {Object.entries(theme.colors).map(([key, value]) => (
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

            {/* Border Radius */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-neutral-700 mb-4">Border Radius</h4>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(theme.borderRadius).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-xs font-medium text-neutral-600 mb-1.5 uppercase">
                                {key} <span className="text-neutral-400">({value})</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="40"
                                step="2"
                                value={parseFloat(value) * 16} // rem to px
                                onChange={(e) => handleBorderRadiusChange(key as keyof ThemeConfig['borderRadius'], `${parseFloat(e.target.value) / 16}rem`)}
                                className="w-full"
                            />
                            <div className="mt-2 h-10 rounded border border-neutral-300 bg-neutral-50" style={{ borderRadius: value }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Spacing Scale */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="text-sm font-semibold text-neutral-700 mb-3">Spacing Scale</h4>
                <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-2">
                        Global Multiplier: <span className="font-semibold">{theme.spacing.scale}x</span>
                    </label>
                    <input
                        type="range"
                        min="0.8"
                        max="1.5"
                        step="0.1"
                        value={theme.spacing.scale}
                        onChange={(e) => handleSpacingChange(parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="mt-2 text-xs text-neutral-500">
                        Affects padding, margins, and gaps throughout the app
                    </div>
                </div>
            </div>
        </div>
    );
}
