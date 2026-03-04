'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

type ThemeName = 'classic' | 'pastel' | 'cyberpunk';

interface ThemeContextType {
    theme: ThemeName;
    setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user, token } = useAuth();
    const [theme, setThemeState] = useState<ThemeName>('classic');

    useEffect(() => {
        if (user) {
            setThemeState((user as any).theme_name || 'classic');
        }
    }, [user]);

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);

        // Hardcoded yellow accent color palette
        root.style.setProperty('--color-primary', '#facc15'); // yellow-400
        root.style.setProperty('--color-primary-50', '#fefce8'); // yellow-50
        root.style.setProperty('--color-primary-100', '#fef9c3'); // yellow-100
        root.style.setProperty('--color-primary-600', '#ca8a04'); // yellow-600
        root.style.setProperty('--color-primary-700', '#a16207'); // yellow-700

        // Update body bg based on theme
        if (theme === 'cyberpunk') {
            root.style.setProperty('--bg-main', '#0a0a0a');
            root.style.setProperty('--text-main', '#ffffff');
        } else {
            root.style.setProperty('--bg-main', '#f9fafb');
            root.style.setProperty('--text-main', '#111827');
        }
    }, [theme]);

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

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
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
