'use client';

import { useState, useCallback } from 'react';

interface CelebrationData {
    type: 'achievement' | 'levelUp' | 'milestone';
    data: {
        title: string;
        description?: string;
        icon?: string;
        xp?: number;
        coins?: number;
        level?: number;
    };
}

export function useCelebration() {
    const [celebration, setCelebration] = useState<CelebrationData | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const celebrate = useCallback((celebrationData: CelebrationData) => {
        setCelebration(celebrationData);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => setCelebration(null), 300); // Wait for animation
    }, []);

    return {
        celebration,
        isOpen,
        celebrate,
        close
    };
}
