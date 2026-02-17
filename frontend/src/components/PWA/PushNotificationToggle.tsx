'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const VAPID_PUBLIC_KEY = 'BC3j9sjjuAySp1vVoU6CQU4GGbu7t2jg_zxS8S8PYcEYFx1BO2X-FlssF7Y62iNMWgXYqll9fFfO4n99p7r4k60';

const PushNotificationToggle = () => {
    const { token } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        checkSubscription();
    }, []);

    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator)) {
            setIsLoading(false);
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        setIsLoading(false);
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribe = async () => {
        setIsProcessing(true);
        try {
            const registration = await navigator.serviceWorker.ready;

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Permission not granted');
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            // Send to backend
            if (token) {
                await api.post('/api/notifications/subscribe', subscription, token);
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error('Failed to subscribe to push notifications:', err);
            alert('Could not enable notifications. Please check your browser settings.');
        } finally {
            setIsProcessing(false);
        }
    };

    const unsubscribe = async () => {
        setIsProcessing(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                // Optionally notify backend to remove subscription
            }
            setIsSubscribed(false);
        } catch (err) {
            console.error('Failed to unsubscribe:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return null;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return (
            <div className="p-4 bg-neutral-100 rounded-2xl flex items-center gap-3 opacity-50">
                <BellOff size={18} className="text-neutral-400" />
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Push notifications not supported</span>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSubscribed ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-50 text-neutral-400'}`}>
                        {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-tight">Real-time Push Alerts</h3>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Stay motivated with habit reminders</p>
                    </div>
                </div>
                <button
                    onClick={isSubscribed ? unsubscribe : subscribe}
                    disabled={isProcessing}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSubscribed
                        ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                        }`}
                >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : (isSubscribed ? 'Disable' : 'Enable')}
                </button>
            </div>
            {isSubscribed && (
                <div className="mt-4 flex items-center gap-2 text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    You are ready to receive momentum alerts.
                </div>
            )}
        </div>
    );
};

export default PushNotificationToggle;
