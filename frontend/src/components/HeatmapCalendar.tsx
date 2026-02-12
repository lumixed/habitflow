import React, { useMemo } from 'react';
import { format, startOfYear, eachDayOfInterval, getDay, isAfter } from 'date-fns';

interface HeatmapData {
    date: string;
    count: number;
    intensity: number;
}

interface HeatmapCalendarProps {
    data: HeatmapData[];
    year: number;
}

const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ data, year }) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const intensityColors = [
        'bg-gray-100 dark:bg-gray-800',
        'bg-indigo-200 dark:bg-indigo-900/40',
        'bg-indigo-400 dark:bg-indigo-700/60',
        'bg-indigo-600 dark:bg-indigo-500/80',
        'bg-indigo-800 dark:bg-indigo-400',
    ];

    const heatmapCells = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        const startDate = startOfYear(new Date(year, 0, 1));
        const startOffset = getDay(startDate);

        // Create an array with nulls for the initial offset
        const cells: (HeatmapData | null)[] = Array(startOffset).fill(null);
        return [...cells, ...data];
    }, [data, year]);

    if (!data || !Array.isArray(data)) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-gray-500 text-center py-10">No activity data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Activity Heatmap</h3>
            <div className="flex gap-4">
                {/* Y-Axis (Days of week) */}
                <div className="flex flex-col justify-between text-[10px] text-gray-400 pt-10 pb-6">
                    {daysOfWeek.map((day, i) => (
                        <span key={day} className={i % 2 === 0 ? 'invisible' : ''}>{day}</span>
                    ))}
                </div>

                <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                    {/* X-Axis (Months) */}
                    <div className="flex mb-2 text-[10px] text-gray-400 ml-1">
                        {months.map((month) => (
                            <div key={month} className="flex-1 min-w-[40px]">{month}</div>
                        ))}
                    </div>

                    {/* The Grid */}
                    <div
                        className="grid grid-flow-col gap-1 auto-cols-max"
                        style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}
                    >
                        {heatmapCells.map((d, i) => (
                            <div
                                key={d ? d.date : `empty-${i}`}
                                className={`w-3.5 h-3.5 rounded-sm ${d ? intensityColors[d.intensity] || intensityColors[0] : 'bg-transparent'} transition-colors group relative`}
                            >
                                {/* Tooltip */}
                                {d && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                        <div className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
                                            {d.count} completions on {format(new Date(d.date), 'MMM d, yyyy')}
                                        </div>
                                        <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-gray-400">
                <span>Less</span>
                {intensityColors.map((color, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${color}`}></div>
                ))}
                <span>More</span>
            </div>
        </div>
    );
};

export default HeatmapCalendar;
