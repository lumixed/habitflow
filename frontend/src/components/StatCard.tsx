import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    trend?: {
        value: string;
        positive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.positive ? '+' : '-'}{trend.value}
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            </div>
        </div>
    );
};

export default StatCard;
