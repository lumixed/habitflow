import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useSocial() {
    const { token } = useAuth();
    const [friends, setFriends] = useState<any[]>([]);
    const [feed, setFeed] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchFriends = async () => {
        if (!token) return;
        try {
            const data = await api.get<{ friends: any[] }>('/api/social/friends', token);
            setFriends(data.friends);
        } catch (err: any) {
            console.error('Failed to fetch friends:', err);
        }
    };

    const fetchFeed = async (limit = 20, offset = 0) => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await api.get<{ feed: any[] }>(`/api/social/feed?limit=${limit}&offset=${offset}`, token);
            setFeed(data.feed);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch feed');
        } finally {
            setIsLoading(false);
        }
    };

    const sendFriendRequest = async (receiverId: string) => {
        if (!token) return;
        try {
            await api.post('/api/social/request', { receiver_id: receiverId }, token);
            return true;
        } catch (err: any) {
            throw err;
        }
    };

    const handleRequest = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
        if (!token) return;
        try {
            await api.put(`/api/social/request/${requestId}`, { action }, token);
            if (action === 'ACCEPT') fetchFriends();
            // Refresh requests list if we had one
            return true;
        } catch (err: any) {
            throw err;
        }
    };

    const reactToActivity = async (activityId: string, type = 'LIKE') => {
        if (!token) return;
        try {
            await api.post('/api/interactions/react', { activity_id: activityId, type }, token);
            // Refresh feed locally or refetch
            setFeed(prev => prev.map(item => {
                if (item.id === activityId) {
                    // This is a naive local update, better to refetch or use a more robust state
                    return { ...item }; // In a real app, we'd handle the reaction list update here
                }
                return item;
            }));
            fetchFeed(); // Simpler for now
        } catch (err: any) {
            console.error('Failed to react:', err);
        }
    };

    const addComment = async (activityId: string, content: string) => {
        if (!token) return;
        try {
            await api.post('/api/interactions/comment', { activity_id: activityId, content }, token);
            fetchFeed();
        } catch (err: any) {
            throw err;
        }
    };

    useEffect(() => {
        if (token) {
            fetchFriends();
            fetchFeed();
        }
    }, [token]);

    return {
        friends,
        feed,
        requests,
        isLoading,
        error,
        fetchFriends,
        fetchFeed,
        sendFriendRequest,
        handleRequest,
        reactToActivity,
        addComment
    };
}
