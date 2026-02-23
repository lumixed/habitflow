'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/hooks/useHabits';

const COLORS = [
    { name: 'Emerald', value: '#10B981' },
    { name: 'Blue', value: '#2563EB' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Sky', value: '#0EA5E9' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Teal', value: '#14B8A6' },
];

const ICONS = [
    { key: 'target', label: '🎯' }, { key: 'run', label: '🏃' }, { key: 'book', label: '📚' }, { key: 'water', label: '💧' }, { key: 'sleep', label: '😴' },
    { key: 'meditate', label: '🧘' }, { key: 'exercise', label: '💪' }, { key: 'write', label: '✍️' }, { key: 'cook', label: '🍳' }, { key: 'learn', label: '🧠' },
    { key: 'guitar', label: '🎸' }, { key: 'music', label: '🎵' }, { key: 'brush', label: '🎨' }, { key: 'camera', label: '📷' }, { key: 'code', label: '💻' },
    { key: 'game', label: '🎮' }, { key: 'gardening', label: '🌱' }, { key: 'pet', label: '🐾' }, { key: 'phone', label: '📵' }, { key: 'money', label: '💰' },
    { key: 'heart', label: '❤️' }, { key: 'star', label: '⭐' }, { key: 'fire', label: '🔥' }, { key: 'moon', label: '🌙' }, { key: 'sun', label: '☀️' },
    { key: 'cloud', label: '☁️' }, { key: 'rain', label: '🌧️' }, { key: 'coffee', label: '☕' }, { key: 'tea', label: '🍵' }, { key: 'apple', label: '🍎' },
    { key: 'pizza', label: '🍕' }, { key: 'bike', label: '🚲' }, { key: 'car', label: '🚗' }, { key: 'plane', label: '✈️' }, { key: 'map', label: '🗺️' },
    { key: 'home', label: '🏠' }, { key: 'work', label: '💼' }, { key: 'school', label: '🏫' }, { key: 'church', label: '⛪' }, { key: 'beach', label: '🏖️' },
    { key: 'mountain', label: '⛰️' }, { key: 'tree', label: '🌳' }, { key: 'flower', label: '🌸' }, { key: 'bird', label: '🐦' }, { key: 'dog', label: '🐶' },
    { key: 'cat', label: '🐱' }, { key: 'fish', label: '🐟' }, { key: 'rocket', label: '🚀' }, { key: 'clock', label: '⏰' }, { key: 'diary', label: '📔' },
];

const FREQUENCIES = [
    { value: 'DAILY', label: 'Every day' },
    { value: 'WEEKDAYS', label: 'Weekdays only' },
    { value: 'WEEKLY', label: 'Once a week' },
];

const DIFFICULTIES = [
    { value: 'EASY', label: 'Easy', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { value: 'HARD', label: 'Hard', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
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
    const [color, setColor] = useState('#2563EB');
    const [icon, setIcon] = useState('target');
    const [backgroundImage, setBackgroundImage] = useState('');
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editHabit) {
            setTitle(editHabit.title);
            setDescription(editHabit.description || '');
            setFrequency(editHabit.frequency);
            setColor(editHabit.color);
            setIcon(editHabit.icon);
            setBackgroundImage((editHabit as any).background_image || '');
            setDifficulty(editHabit.difficulty || 'MEDIUM');
        } else {
            setTitle('');
            setDescription('');
            setFrequency('DAILY');
            setColor('#2563EB');
            setIcon('target');
            setBackgroundImage('');
            setDifficulty('MEDIUM');
        }
        setError('');
    }, [editHabit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isSubmitting) {
            console.log('Already submitting, ignoring click');
            return; // Prevent double submission
        }

        setIsSubmitting(true);

        try {
            console.log('Saving habit...');
            await onSave({
                title,
                description,
                frequency,
                color,
                icon,
                background_image: backgroundImage,
                difficulty
            });
            console.log('Habit saved successfully');
            setIsSubmitting(false);
            onClose(); // Close modal on success
        } catch (err: any) {
            console.error('Failed to save habit:', err);
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
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-0"
                role="dialog"
                aria-modal="true"
                aria-labelledby="habit-modal-title"
            >
                <div className="bg-white rounded-md shadow-xl w-full max-w-md max-h-[85vh] md:max-h-[90vh] overflow-y-auto border border-neutral-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4">
                        <h2 id="habit-modal-title" className="text-sm font-black text-neutral-900 uppercase tracking-widest">
                            {editHabit ? 'Edit habit' : 'New habit'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-3 -mr-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
                            aria-label="Close modal"
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
                                        aria-pressed={frequency === f.value}
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
                                        aria-label={`Select ${c.name} color`}
                                        aria-pressed={color === c.value}
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
                            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1 bg-neutral-50 rounded-md border border-neutral-200">
                                {ICONS.map((i) => (
                                    <button
                                        key={i.key}
                                        type="button"
                                        onClick={() => setIcon(i.key)}
                                        aria-label={`Select ${i.key} icon`}
                                        aria-pressed={icon === i.key}
                                        className={`p-3 text-lg rounded-md border transition-all ${icon === i.key
                                            ? 'border-neutral-900 bg-neutral-900 text-white'
                                            : 'border-white bg-white hover:bg-neutral-50'
                                            }`}
                                        title={i.key}
                                    >
                                        {i.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background Image */}
                        <div>
                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">
                                Background Image URL <span className="text-neutral-300 font-bold">(OPTIONAL)</span>
                            </label>
                            <input
                                type="url"
                                value={backgroundImage}
                                onChange={(e) => setBackgroundImage(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2">Difficulty & Rewards</label>
                            <div className="flex gap-2">
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d.value}
                                        type="button"
                                        onClick={() => setDifficulty(d.value as any)}
                                        aria-pressed={difficulty === d.value}
                                        className={`flex-1 px-2 py-3 rounded-md border transition-all flex flex-col items-center gap-1 ${difficulty === d.value
                                            ? `border-neutral-900 bg-neutral-900 text-white shadow-md scale-[1.02]`
                                            : 'border-neutral-200 bg-white text-neutral-400 hover:bg-neutral-50'
                                            }`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{d.label}</span>
                                        <span className={`text-[8px] font-bold ${difficulty === d.value ? 'text-neutral-300' : 'text-neutral-400'}`}>
                                            {d.value === 'EASY' ? '0.8x XP' : d.value === 'MEDIUM' ? '1.0x XP' : '1.5x XP'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-[9px] text-neutral-400 italic">Harder habits reward significantly more points and coins.</p>
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
