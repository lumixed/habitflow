'use client';

import { useState } from 'react';
import { generateShareGraphic, shareGraphic, downloadShareGraphic, ShareGraphicOptions } from '@/lib/shareGraphics';

interface ShareButtonProps {
    type: 'achievement' | 'streak' | 'levelup' | 'milestone';
    data: ShareGraphicOptions['data'];
    className?: string;
}

export default function ShareButton({ type, data, className = '' }: ShareButtonProps) {
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const graphic = generateShareGraphic({ type, data });
            await shareGraphic(
                graphic,
                `HabitFlow - ${data.title}`,
                `${data.subtitle || 'Check out my progress on HabitFlow!'}`
            );
        } catch (err) {
            console.error('Share failed:', err);
            // Fallback to download
            const graphic = generateShareGraphic({ type, data });
            downloadShareGraphic(graphic, `habitflow-${type}.png`);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <button
            onClick={handleShare}
            disabled={isSharing}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-500 text-white font-bold text-sm hover:bg-primary-600 transition-colors disabled:opacity-50 ${className}`}
        >
            <span>📤</span>
            <span>{isSharing ? 'Sharing...' : 'Share'}</span>
        </button>
    );
}
