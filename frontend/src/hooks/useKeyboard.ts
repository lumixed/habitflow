/**
 * Keyboard Navigation Hook
 * Provides keyboard shortcuts for common actions
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    action: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const matchingShortcut = shortcuts.find((shortcut) => {
                return (
                    shortcut.key.toLowerCase() === event.key.toLowerCase() &&
                    !!shortcut.ctrl === event.ctrlKey &&
                    !!shortcut.alt === event.altKey &&
                    !!shortcut.shift === event.shiftKey &&
                    !!shortcut.meta === event.metaKey
                );
            });

            if (matchingShortcut) {
                event.preventDefault();
                matchingShortcut.action();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

export function useGlobalKeyboardShortcuts() {
    const router = useRouter();

    const shortcuts: KeyboardShortcut[] = [
        {
            key: 'd',
            alt: true,
            action: () => router.push('/dashboard'),
            description: 'Go to Dashboard',
        },
        {
            key: 'h',
            alt: true,
            action: () => router.push('/habits'),
            description: 'Go to Habits',
        },
        {
            key: 'a',
            alt: true,
            action: () => router.push('/analytics'),
            description: 'Go to Analytics',
        },
        {
            key: 's',
            alt: true,
            action: () => router.push('/settings'),
            description: 'Go to Settings',
        },
        {
            key: 'g',
            alt: true,
            action: () => router.push('/groups'),
            description: 'Go to Groups',
        },
        {
            key: 'l',
            alt: true,
            action: () => router.push('/leaderboard'),
            description: 'Go to Leaderboard',
        },
        {
            key: '?',
            shift: true,
            action: () => {
                // Show keyboard shortcuts help modal
                alert(
                    `Keyboard Shortcuts:\n\n` +
                    `Alt + D - Dashboard\n` +
                    `Alt + H - Habits\n` +
                    `Alt + A - Analytics\n` +
                    `Alt + S - Settings\n` +
                    `Alt + G - Groups\n` +
                    `Alt + L - Leaderboard\n` +
                    `Shift + ? - Show this help`
                );
            },
            description: 'Show keyboard shortcuts',
        },
    ];

    useKeyboardShortcuts(shortcuts);
}

/**
 * Focus management utilities
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        container.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => {
            container.removeEventListener('keydown', handleTab);
        };
    }, [containerRef, isActive]);
}
