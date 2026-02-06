import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface Group {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    created_by: string;
    member_count: number;
    role: 'OWNER' | 'MEMBER';
    joined_at: string;
}

export interface GroupMember {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: 'OWNER' | 'MEMBER';
    joined_at: string;
    habits: Array<{
        id: string;
        title: string;
        color: string;
        icon: string;
    }>;
    recent_completions: Array<{
        habit_id: string;
        completed_date: string;
    }>;
}

export interface GroupDetails {
    id: string;
    name: string;
    description: string | null;
    invite_code: string;
    created_by: string;
    created_at: string;
    members: GroupMember[];
}


export function useGroups() {
    const { token } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;

        const fetchGroups = async () => {
        try {
            const data = await api.get<{ groups: Group[] }>('/api/groups', token);
            setGroups(data.groups);
        } catch (err: any) {
            setError(err.message || 'Failed to load groups');
        } finally {
            setIsLoading(false);
        }
        };

        fetchGroups();
    }, [token]);

    const createGroup = async (name: string, description?: string) => {
        const data = await api.post<{ group: Group }>(
        '/api/groups',
        { name, description },
        token!
        );
        setGroups((prev) => [data.group, ...prev]);
        return data.group;
    };

    const joinGroup = async (invite_code: string) => {
        const data = await api.post<{ group: any }>(
        '/api/groups/join',
        { invite_code },
        token!
        );

        const refreshed = await api.get<{ groups: Group[] }>('/api/groups', token!);
        setGroups(refreshed.groups);
        return data.group;
    };
    const leaveGroup = async (group_id: string) => {
        await api.delete(`/api/groups/${group_id}/leave`, undefined, token!);
        setGroups((prev) => prev.filter((g) => g.id !== group_id));
    };

    return {
        groups,
        isLoading,
        error,
        createGroup,
        joinGroup,
        leaveGroup,
    };
}

export function useGroupDetails(group_id: string) {
    const { token } = useAuth();
    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!token || !group_id) return;

        const fetchGroup = async () => {
        try {
            const data = await api.get<{ group: GroupDetails }>(
            `/api/groups/${group_id}`,
            token
            );
            setGroup(data.group);
        } catch (err) {
            console.error('Failed to load group details:', err);
        } finally {
            setIsLoading(false);
        }
        };

        fetchGroup();
    }, [token, group_id]);

    return { group, isLoading };
}
