import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['en', 'es', 'fr', 'de', 'ja'],
    defaultLocale: 'en'
});

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(de|en|es|fr|ja)/:path*']
};
