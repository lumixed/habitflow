'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

type ThemeName = 'classic' | 'pastel' | 'cyberpunk';

interface ThemeContextType {
    theme: ThemeName;
    accentColor: string;
    setTheme: (theme: ThemeName) => void;
    setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user, token } = useAuth();
    const [theme, setThemeState] = useState<ThemeName>('classic');
    const [accentColor, setAccentColorState] = useState('#2563EB');

    useEffect(() => {
        if (user) {
            setThemeState((user as any).theme_name || 'classic');
            setAccentColorState((user as any).accent_color || '#2563EB');
        }
    }, [user]);

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.setProperty('--color-primary', accentColor);

        // Update body bg based on theme
        if (theme === 'cyberpunk') {
            root.style.setProperty('--bg-main', '#0a0a0a');
            root.style.setProperty('--text-main', '#ffffff');
        } else {
            root.style.setProperty('--bg-main', '#f9fafb');
            root.style.setProperty('--text-main', '#111827');
        }
    }, [theme, accentColor]);

    const setTheme = async (newTheme: ThemeName) => {
        if (user && (user as any).plan === 'FREE' && newTheme !== 'classic') {
            alert('Custom themes are a Pro feature! Upgrade to unlock.');
            return;
        }
        setThemeState(newTheme);
        if (token) {
            try {
                await api.post('/api/auth/profile/update', { theme_name: newTheme }, token);
            } catch (err) {
                console.error('Failed to save theme preference:', err);
            }
        }
    };

    const setAccentColor = async (newColor: string) => {
        if (user && (user as any).plan === 'FREE' && newColor !== '#2563EB') {
            // Allow basic colors or just block custom picker?
            // For simplicity, let's just block it for now
            alert('Custom accent colors are a Pro feature!');
            return;
        }
        setAccentColorState(newColor);
        if (token) {
            try {
                await api.post('/api/auth/profile/update', { accent_color: newColor }, token);
            } catch (err) {
                console.error('Failed to save accent color preference:', err);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
