'use client';

import React from 'react';
import SmartSuggestions from '../SmartSuggestions';

interface SuggestionsWidgetProps {
    onAddHabit: (title: string, description: string) => void;
}

export default function SuggestionsWidget({ onAddHabit }: SuggestionsWidgetProps) {
    return (
        <div className="bg-neutral-50 dark:bg-neutral-900 -m-6 p-6 rounded-b-[2.5rem]">
            <SmartSuggestions onAddHabit={onAddHabit} />
        </div>
    );
}
