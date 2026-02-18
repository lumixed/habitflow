'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────

interface User {
    id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
    xp: number;
    level: number;
    coins: number;
    theme_name: string;
    accent_color: string;
    widget_order: string;
    is_profile_public?: boolean;
    is_anonymous?: boolean;
    two_factor_enabled?: boolean;
    data_retention_days?: number;
    scheduled_export_enabled?: boolean;
    last_export_at?: string;

    // Subscription fields
    plan: 'FREE' | 'PRO' | 'TEAM';
    stripe_customer_id?: string;
    subscription_id?: string;
    subscription_status?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ two_factor_required?: boolean; userId?: string } | void>;
    verify2FA: (userId: string, token: string) => Promise<void>;
    signup: (email: string, password: string, display_name: string, referred_by?: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

// ─── Provider ─────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount, check if there's a token in localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('habitflow_token');
        if (storedToken) {
            // Verify token is still valid by fetching current user
            api
                .get<{ user: User }>('/api/auth/me', storedToken)
                .then((data) => {
                    setToken(storedToken);
                    setUser(data.user);
                })
                .catch(() => {
                    // Token is invalid/expired, clear it
                    localStorage.removeItem('habitflow_token');
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await api.post<{ token?: string; user?: User; two_factor_required?: boolean; userId?: string }>('/api/auth/login', {
            email,
            password,
        });

        if (data.two_factor_required) {
            return { two_factor_required: true, userId: data.userId };
        }

        if (data.token && data.user) {
            localStorage.setItem('habitflow_token', data.token);
            setToken(data.token);
            setUser(data.user);
        }
    };

    const verify2FA = async (userId: string, token: string) => {
        const data = await api.post<{ token: string; user: User }>('/api/auth/login/2fa', {
            userId,
            token,
        });
        localStorage.setItem('habitflow_token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const signup = async (email: string, password: string, display_name: string, referred_by?: string) => {
        const data = await api.post<{ token: string; user: User }>('/api/auth/signup', {
            email,
            password,
            display_name,
            referred_by,
        });
        localStorage.setItem('habitflow_token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('habitflow_token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (data: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, verify2FA, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
