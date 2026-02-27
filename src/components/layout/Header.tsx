'use client';

import { Bell, Plus } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { ProfileSwitcher } from './ProfileSwitcher';
import { usePathname } from 'next/navigation';

export function Header({ title = "Dashboard", subTitle, children, profileId, profiles = [] }: { title?: string, subTitle?: string, children?: React.ReactNode, profileId?: number, profiles?: any[] }) {
    const pathname = usePathname();
    const isReportPage = pathname === '/reports/custom' || pathname.startsWith('/reports/');

    if (isReportPage) return null;

    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between px-8 py-6 mb-2 gap-4 print:hidden">
            <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                    <span>Fynance</span>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-white font-medium">{title}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
                {profileId && <NotificationBell profileId={profileId} />}
                {profileId && <ProfileSwitcher currentProfileId={profileId} profiles={profiles} />}
                {children}
            </div>
        </header>
    );
}
