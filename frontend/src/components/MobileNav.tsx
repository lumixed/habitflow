'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, User, Trophy } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
        { name: 'Social', icon: Users, href: '/social' },
        { name: 'Analytics', icon: BarChart3, href: '/analytics' },
        { name: 'Profile', icon: User, href: '/profile' },
    ];

    // Don't show on auth pages
    if (pathname.includes('/auth') || pathname === '/') return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-2 py-2 flex justify-around items-center safe-area-pb md:hidden z-40">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
