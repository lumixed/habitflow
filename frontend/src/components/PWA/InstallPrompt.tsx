'use client';

import React, { useEffect, useState } from 'react';
import { Smartphone, X, Download } from 'lucide-react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Show prompt after 5 seconds of browsing
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000);

            return () => clearTimeout(timer);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-neutral-900 border border-neutral-800 text-white p-5 rounded-[24px] shadow-2xl relative overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-600/20 blur-[60px] rounded-full group-hover:bg-primary-500/30 transition-all duration-500" />

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors text-neutral-500 hover:text-white"
                >
                    <X size={16} />
                </button>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-400">
                            <Smartphone size={20} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-tight">Install HabitFlow</h3>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-0.5">Faster access from your home screen</p>
                        </div>
                    </div>

                    <button
                        onClick={handleInstall}
                        className="w-full py-3 bg-white text-neutral-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-100 transition-all active:scale-[0.98]"
                    >
                        <Download size={14} /> Add to Home Screen
                    </button>

                    <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest text-center mt-3">
                        Works Offline • Fast Loading • Push Alerts
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;
