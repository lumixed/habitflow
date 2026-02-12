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

    const heatmapGrid = useMemo(() => {
        const startDate = startOfYear(new Date(year, 0, 1));
        const grid: (HeatmapData | null)[][] = Array.from({ length: 7 }, () => []);

        // Fill the grid
        const dataMap = new Map(data.map(d => [d.date, d]));

        // We need to handle the offset for the first day of the year
        const startOffset = getDay(startDate);

        // Add empty cells for the offset
        for (let i = 0; i < startOffset; i++) {
            grid[i].push(null);
        }

        data.forEach((d, index) => {
            const dayIndex = (index + startOffset) % 7;
            grid[dayIndex].push(d);
        });

        return grid;
    }, [data, year]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Activity Heatmap</h3>
            <div className="flex gap-4">
                {/* Y-Axis (Days of week) */}
                <div className="flex flex-col justify-between text-[10px] text-gray-400 pt-6 pb-2">
                    {daysOfWeek.map((day, i) => (
                        <span key={day} className={i % 2 === 0 ? 'invisible' : ''}>{day}</span>
                    ))}
                </div>

                <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                    {/* X-Axis (Months) */}
                    <div className="flex mb-2 text-[10px] text-gray-400">
                        {months.map((month) => (
                            <div key={month} className="flex-1 min-w-[50px]">{month}</div>
                        ))}
                    </div>

                    {/* The Grid */}
                    <div className="grid grid-flow-col gap-1 auto-cols-max">
                        {data.map((d) => (
                            <div
                                key={d.date}
                                className={`w-3 h-3 rounded-sm ${intensityColors[d.intensity]} transition-colors group relative`}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                    <div className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap shadow-xl">
                                        {d.count} completions on {format(new Date(d.date), 'MMM d, yyyy')}
                                    </div>
                                    <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                                </div>
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
