'use client';

import { useState } from 'react';
import { useChallenges } from '@/hooks/useChallenges';

interface CreateChallengeModalProps {
    groupId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateChallengeModal({ groupId, onClose, onSuccess }: CreateChallengeModalProps) {
    const { createChallenge, isLoading } = useChallenges();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [goalCount, setGoalCount] = useState(10);
    const [durationDays, setDurationDays] = useState(7);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + durationDays);

        try {
            await createChallenge({
                group_id: groupId,
                title,
                description,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                goal_count: goalCount,
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to create challenge:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral-900">Create New Challenge</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1.5">
                            Challenge Title
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., 7-Day Fitness Blitz"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1.5">
                            Description (Optional)
                        </label>
                        <textarea
                            placeholder="What's this challenge about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none h-24"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1.5">
                                Goal Count
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={goalCount}
                                onChange={(e) => setGoalCount(parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-1.5">
                                Duration (Days)
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={durationDays}
                                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl font-bold text-neutral-600 hover:bg-neutral-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-primary-600 rounded-xl font-bold text-white hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : 'Launch Challenge'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
