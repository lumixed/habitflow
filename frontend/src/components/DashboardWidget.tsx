'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DashboardWidgetProps {
    id: string;
    title: string;
    children: React.ReactNode;
    icon?: string;
}

export default function DashboardWidget({ id, title, children, icon }: DashboardWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group relative bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl 
                rounded-[2.5rem] border border-white/20 dark:border-neutral-700/50 
                shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-none 
                transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-1000
                ${isDragging ? 'shadow-2xl opacity-80 scale-[1.02] z-50' : 'hover:shadow-lg hover:-translate-y-1'}
            `}
        >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

            <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        {icon && (
                            <div className="w-10 h-10 rounded-2xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h3 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.25em] leading-none mb-1">
                                {title}
                            </h3>
                            <div className="h-0.5 w-4 bg-primary-500 rounded-full" />
                        </div>
                    </div>
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-3 cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8h16M4 16h16" />
                        </svg>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
