'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/hooks/useHabits';

const COLORS = [
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Sky', value: '#0EA5E9' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Teal', value: '#14B8A6' },
];

const ICONS = [
    { key: 'target', label: '🎯 Target' },
    { key: 'run', label: '🏃 Run' },
    { key: 'book', label: '📚 Read' },
    { key: 'water', label: '💧 Hydrate' },
    { key: 'sleep', label: '😴 Sleep' },
    { key: 'meditate', label: '🧘 Meditate' },
    { key: 'exercise', label: '💪 Exercise' },
    { key: 'write', label: '✍️ Write' },
    { key: 'cook', label: '🍳 Cook' },
    { key: 'learn', label: '🧠 Learn' },
];

const FREQUENCIES = [
    { value: 'DAILY', label: 'Every day' },
    { value: 'WEEKDAYS', label: 'Weekdays only' },
    { value: 'WEEKLY', label: 'Once a week' },
];

interface HabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    editHabit?: Habit | null; // If provided, we're editing; otherwise creating
}

export default function HabitModal({ isOpen, onClose, onSave, editHabit }: HabitModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('DAILY');
    const [color, setColor] = useState('#6366F1');
    const [icon, setIcon] = useState('target');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editHabit) {
            setTitle(editHabit.title);
            setDescription(editHabit.description || '');
            setFrequency(editHabit.frequency);
            setColor(editHabit.color);
            setIcon(editHabit.icon);
        } else {
            setTitle('');
            setDescription('');
            setFrequency('DAILY');
            setColor('#6366F1');
            setIcon('target');
        }
        setError('');
    }, [editHabit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await onSave({ title, description, frequency, color, icon });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-0">
                <div className="bg-white rounded-md shadow-xl w-full max-w-md max-h-[85vh] md:max-h-[90vh] overflow-y-auto border border-neutral-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 className="text-sm font-black text-neutral-900 uppercase tracking-widest">
                            {editHabit ? 'Edit habit' : 'New habit'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-3 -mr-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                        >
                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="e.g. MORNING RUN"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">
                                Description <span className="text-neutral-300 font-bold">(OPTIONAL)</span>
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A short note..."
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Frequency */}
                        <div>
                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Frequency</label>
                            <div className="flex gap-2">
                                {FREQUENCIES.map((f) => (
                                    <button
                                        key={f.value}
                                        type="button"
                                        onClick={() => setFrequency(f.value)}
                                        className={`flex-1 px-2 py-3 text-[9px] font-black uppercase tracking-widest rounded-md border transition-all ${frequency === f.value
                                            ? 'border-neutral-900 bg-neutral-900 text-white'
                                            : 'border-neutral-200 text-neutral-400 hover:bg-neutral-50'
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Color</label>
                            <div className="flex gap-3 flex-wrap">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setColor(c.value)}
                                        className={`w-8 h-8 md:w-6 md:h-6 rounded-md border-2 transition-all ${color === c.value ? 'border-neutral-900 scale-110 shadow-sm' : 'border-transparent'
                                            }`}
                                        style={{ backgroundColor: c.value }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>


                        {/* Icon */}
                        <div>
                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Icon</label>
                            <div className="grid grid-cols-5 gap-2">
                                {ICONS.map((i) => (
                                    <button
                                        key={i.key}
                                        type="button"
                                        onClick={() => setIcon(i.key)}
                                        className={`p-3 text-lg rounded-md border transition-all ${icon === i.key
                                            ? 'border-neutral-900 bg-neutral-900 text-white'
                                            : 'border-neutral-200 hover:bg-neutral-50'
                                            }`}
                                        title={i.label}
                                    >
                                        {i.label.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>


                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting
                                ? editHabit
                                    ? 'SAVING...'
                                    : 'CREATING...'
                                : editHabit
                                    ? 'SAVE CHANGES'
                                    : 'CREATE HABIT'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
