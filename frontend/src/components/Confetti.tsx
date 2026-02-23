'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
    trigger: boolean;
    duration?: number;
}

export default function Confetti({ trigger, duration = 3000 }: ConfettiProps) {
    const hasTriggered = useRef(false);

    useEffect(() => {
        if (trigger && !hasTriggered.current) {
            hasTriggered.current = true;

            const end = Date.now() + duration;

            const colors = ['#2563EB', '#10B981', '#F59E0B', '#3B82F6'];

            (function frame() {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

            // Reset after animation
            setTimeout(() => {
                hasTriggered.current = false;
            }, duration + 100);
        }
    }, [trigger, duration]);

    return null;
}
