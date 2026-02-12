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
        <div className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-neutral-100 dark:border-gray-700 transition-all hover:bg-neutral-50/50">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-md ${color} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend.positive ? '+' : '-'}{trend.value}
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 mb-1 uppercase tracking-widest">{title}</p>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">{value}</h3>
            </div>
        </div>
    );
};

export default StatCard;
