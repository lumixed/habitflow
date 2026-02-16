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
            className="relative bg-white dark:bg-neutral-900 p-5
                rounded-xl border border-neutral-200 dark:border-neutral-800 
                shadow-sm 
                hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700
                transition-all duration-200 group
                cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
            style={style}
        >

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="text-lg">
                                {icon}
                            </div>
                        )}
                        <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                            {title}
                        </h3>
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
