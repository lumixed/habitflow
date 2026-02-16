'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

type ThemeName = 'classic' | 'neon' | 'pastel' | 'cyberpunk';
type FontName = 'inter' | 'roboto' | 'outfit' | 'poppins' | 'montserrat';

interface ThemeContextType {
    theme: ThemeName;
    accentColor: string;
    font: FontName;
    setTheme: (theme: ThemeName) => void;
    setAccentColor: (color: string) => void;
    setFont: (font: FontName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user, token } = useAuth();
    const [theme, setThemeState] = useState<ThemeName>('classic');
    const [accentColor, setAccentColorState] = useState('#6366F1');
    const [font, setFontState] = useState<FontName>('inter');

    useEffect(() => {
        if (user) {
            setThemeState((user as any).theme_name || 'classic');
            setAccentColorState((user as any).accent_color || '#6366F1');
            setFontState((user as any).font_family || 'inter');
        }
    }, [user]);

    useEffect(() => {
        // Apply theme to document
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.style.setProperty('--color-primary', accentColor);

        // Apply font
        document.body.style.fontFamily = `var(--font-${font})`;

        // Update body bg based on theme
        if (theme === 'neon' || theme === 'cyberpunk') {
            root.style.setProperty('--bg-main', '#0a0a0a');
            root.style.setProperty('--text-main', '#ffffff');
        } else {
            root.style.setProperty('--bg-main', '#f9fafb');
            root.style.setProperty('--text-main', '#111827');
        }
    }, [theme, accentColor]);

    const setTheme = async (newTheme: ThemeName) => {
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
        setAccentColorState(newColor);
        if (token) {
            try {
                await api.post('/api/auth/profile/update', { accent_color: newColor }, token);
            } catch (err) {
                console.error('Failed to save accent color preference:', err);
            }
        }
    };

    const setFont = async (newFont: FontName) => {
        setFontState(newFont);
        if (token) {
            try {
                await api.post('/api/auth/profile/update', { font_family: newFont }, token);
            } catch (err) {
                console.error('Failed to save font preference:', err);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, accentColor, font, setTheme, setAccentColor, setFont }}>
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
