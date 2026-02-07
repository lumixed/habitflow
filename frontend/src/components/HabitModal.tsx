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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-lg font-bold text-neutral-900">
                {editHabit ? 'Edit habit' : 'New habit'}
                </h2>
                <button
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                {/* Title */}
                <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Morning run"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                />
                </div>

                {/* Description */}
                <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Description <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short note about this habit"
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                />
                </div>

                {/* Frequency */}
                <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Frequency</label>
                <div className="flex gap-2">
                    {FREQUENCIES.map((f) => (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => setFrequency(f.value)}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                        frequency === f.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                            : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                        {f.label}
                    </button>
                    ))}
                </div>
                </div>

                {/* Color */}
                <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                    <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        color === c.value ? 'border-neutral-800 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                    />
                    ))}
                </div>
                </div>

                {/* Icon */}
                <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                    {ICONS.map((i) => (
                    <button
                        key={i.key}
                        type="button"
                        onClick={() => setIcon(i.key)}
                        className={`p-2 text-lg rounded-lg border transition-colors ${
                        icon === i.key
                            ? 'border-primary-500 bg-primary-50'
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
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                {isSubmitting
                    ? editHabit
                    ? 'Saving...'
                    : 'Creating...'
                    : editHabit
                    ? 'Save changes'
                    : 'Create habit'}
                </button>
            </form>
            </div>
        </div>
        </>
    );
}
