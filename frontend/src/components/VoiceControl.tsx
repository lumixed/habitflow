'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

export default function VoiceControl() {
    const [isListening, setIsListening] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const { habits } = useHabits();
    const { token } = useAuth();

    // We need a way to trigger toggleCompletion from here.
    // For simplicity, we'll use a direct API call or a helper if available.
    // However, useCompletions is per-habit. We might need a global completion helper.

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    const provideFeedback = (text: string) => {
        setFeedback(text);
        speak(text);
        setTimeout(() => setFeedback(null), 3000);
    };

    const toggleHabitByName = useCallback(async (name: string) => {
        if (!token) return;

        const habit = habits.find(h =>
            h.title.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(h.title.toLowerCase())
        );

        if (!habit) {
            provideFeedback(`I couldn't find a habit named ${name}`);
            return;
        }

        try {
            const today = new Date().toISOString().split('T')[0];
            await api.post('/api/completions', { habit_id: habit.id, completed_date: today }, token);
            provideFeedback(`Great job! ${habit.title} marked as done.`);
        } catch (err: any) {
            if (err.response?.data?.message?.includes('already completed')) {
                provideFeedback(`${habit.title} is already done for today.`);
            } else {
                provideFeedback('Sorry, I had trouble logging that.');
            }
        }
    }, [habits, token]);

    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            provideFeedback('Voice recognition not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const speechToText = event.results[0][0].transcript;
            parseVoiceCommand(speechToText);
        };

        recognition.start();
    };

    const parseVoiceCommand = (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes('finished') || lower.includes('done') || lower.includes('completed') || lower.includes('log')) {
            // Try to extract habit name
            const habitName = lower.replace(/finished|done|completed|log|my|i|just/g, '').trim();
            if (habitName) {
                toggleHabitByName(habitName);
            } else {
                setFeedback("I heard you, but couldn't identify the habit.");
            }
        } else if (lower.includes('help') || lower.includes('what can i say')) {
            setFeedback('Try saying "I just finished running" or "Log my meditation"');
        } else {
            setFeedback("I'm not sure what you mean. Try 'Log [habit name]'.");
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {feedback && (
                <div className="absolute bottom-16 right-0 bg-neutral-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-xl uppercase tracking-widest whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                    {feedback}
                </div>
            )}

            <button
                onClick={startListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-neutral-900 hover:bg-neutral-800'
                    }`}
                title="Voice Control"
            >
                {isListening ? (
                    <div className="flex gap-1">
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
                    </div>
                ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
