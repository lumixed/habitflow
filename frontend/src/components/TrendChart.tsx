import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface TrendChartProps {
    data: Array<{
        label: string;
        count: number;
    }>;
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
    if (!data || !Array.isArray(data)) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-neutral-100 dark:border-gray-700 h-[350px]">
                <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 mb-6 uppercase tracking-[0.2em]">Completion Trends</h3>
                <p className="text-[10px] font-bold text-neutral-400 text-center py-24 uppercase tracking-widest">No trend data available.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-neutral-100 dark:border-gray-700 h-[350px]">
            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 mb-6 uppercase tracking-[0.2em]">Completion Trends</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            interval={6}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '4px',
                                border: '1px solid #F1F5F9',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                backgroundColor: '#fff',
                                textTransform: 'uppercase',
                                fontSize: '10px',
                                fontWeight: '900',
                                letterSpacing: '0.1em'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#059669"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCount)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;
