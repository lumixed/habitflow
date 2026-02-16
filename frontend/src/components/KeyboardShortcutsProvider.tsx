'use client';

import { useGlobalKeyboardShortcuts } from '@/hooks/useKeyboard';

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
    useGlobalKeyboardShortcuts();
    return <>{children}</>;
}
