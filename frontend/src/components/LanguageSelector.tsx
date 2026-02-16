'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }
];

export default function LanguageSelector() {
    const router = useRouter();
    const pathname = usePathname();

    // Extract current locale from pathname
    const getCurrentLocale = () => {
        const localeMatch = pathname.match(/^\/(en|es|fr|de|ja)/);
        return localeMatch ? localeMatch[1] : 'en';
    };

    const currentLocale = getCurrentLocale();

    const handleLanguageChange = (newLocale: string) => {
        // Replace current locale in path or add it if not present
        let newPath;
        if (pathname.match(/^\/(en|es|fr|de|ja)/)) {
            newPath = pathname.replace(/^\/(en|es|fr|de|ja)/, `/${newLocale}`);
        } else {
            newPath = `/${newLocale}${pathname}`;
        }

        router.push(newPath);
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
                <Globe size={18} className="text-neutral-500" />
                <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                    Language
                </h3>
            </div>

            <div className="space-y-2">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-colors flex items-center justify-between ${currentLocale === lang.code
                            ? 'bg-white border-2 border-primary-500 text-primary-900'
                            : 'bg-neutral-50 border border-neutral-200 hover:border-neutral-300 text-neutral-700'
                            }`}
                    >
                        <span className="font-medium">{lang.name}</span>
                        {currentLocale === lang.code && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
