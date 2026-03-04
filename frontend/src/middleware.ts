import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// i18n routing is disabled — the app does not use next-intl translations.
// The previous middleware was redirecting / → /en, causing 404s because
// there is no [locale] folder in the app directory.
export function middleware(_request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    // Don't match anything — middleware is effectively a no-op
    matcher: [],
};
