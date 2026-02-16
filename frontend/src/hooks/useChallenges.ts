'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useChallenges() {
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createChallenge = async (data: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/challenges', data, token!) as any;
            return response.challenge;
        } catch (err: any) {
            setError(err.message || 'Failed to create challenge');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const joinChallenge = async (challengeId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post(`/api/challenges/${challengeId}/join`, {}, token!) as any;
            return response.membership;
        } catch (err: any) {
            setError(err.message || 'Failed to join challenge');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getChallenges = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/challenges', token!) as any;
            return response;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch challenges');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createChallenge,
        joinChallenge,
        getChallenges,
        isLoading,
        error,
    };
}
