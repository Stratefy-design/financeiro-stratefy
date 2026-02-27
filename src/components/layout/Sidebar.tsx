'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
    LayoutGrid,
    CheckSquare,
    Calendar,
    Users,
    BarChart3,
    Settings,
    Briefcase,
    Target,
    LogOut,
    ChevronDown,
    Search,
    Command,
    ExternalLink,
    Menu,
    X,
    RefreshCw,
    Tag,
    Sun,
    Moon,
    CreditCard,
    FileText
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { Logo } from '@/components/ui/Logo';



interface SidebarProps {
    currentProfileId?: number; // Made optional
    profiles: any[];
}

export function Sidebar({ currentProfileId, profiles }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { signOut } = useClerk();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hide sidebar if no user is logged in (e.g. on sign-in page)
    if (!currentProfileId) return null;

    const sections = [
        {
            title: 'Principal',
            items: [
                { name: 'Dashboard', icon: LayoutGrid, href: '/' },
                { name: 'Transações', icon: CheckSquare, href: '/transactions' },
                { name: 'Previsão', icon: Calendar, href: '/forecast' },
                { name: 'Dívidas', icon: CreditCard, href: '/debts' },
                { name: 'Metas', icon: Target, href: '/goals' },
            ]
        },
        {
            title: 'Gestão',
            items: [
                { name: 'Clientes', icon: Users, href: '/clients' },
                { name: 'Serviços', icon: Briefcase, href: '/services' },
                { name: 'Despesas', icon: Tag, href: '/expense-categories' },
                { name: 'Relatórios', icon: BarChart3, href: '/reports' },
                { name: 'Orçamentos', icon: FileText, href: '/quotes' },
                { name: 'Emitir Nota Fiscal', icon: ExternalLink, href: '/invoices' },
            ]
        }
    ];

    function checkPath(path: string, href: string) {
        return path === href;
    }

    return (
        <>
            {/* Mobile Toggle Button (Fixed on top-left) */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                >
                    {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`
                fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-[#FBFBFB] dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col transition-transform duration-300
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* App Brand */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center gap-3">
                        {/* App Symbol (Purple Gradient) */}
                        <div className="w-10 h-10 bg-gradient-to-br from-[#8058FF] to-[#4F2BD3] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105">
                            <Logo size={28} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-bold text-xl leading-none text-gray-900 dark:text-white tracking-tight">
                                Fynance
                            </h1>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mt-1">
                                by Stratefy
                            </span>
                        </div>
                    </div>
                </div>



                {/* Theme Toggle (Replaces Search Bar) */}
                <div className="px-4 mb-6">
                    {!mounted ? (
                        <div className="w-20 h-8 bg-gray-100 dark:bg-zinc-800/50 rounded-full animate-pulse border border-transparent" />
                    ) : (
                        <div
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-20 flex items-center justify-between p-1 bg-gray-100 dark:bg-zinc-800/50 rounded-full cursor-pointer border border-gray-200 dark:border-zinc-800 relative h-8 select-none transition-colors"
                            title="Alternar Tema"
                        >
                            {/* Sliding Background Pill */}
                            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-zinc-600 rounded-full shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-[calc(50%+2px)]' : 'left-1'}`} />

                            <div className={`flex-1 flex items-center justify-center relative z-10 transition-colors ${theme !== 'dark' ? 'text-orange-500' : 'text-gray-400'}`}>
                                <Sun size={14} />
                            </div>
                            <div className={`flex-1 flex items-center justify-center relative z-10 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>
                                <Moon size={14} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Sections */}
                <nav className="flex-1 px-4 space-y-8">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 px-2">{section.title}</h4>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    const isExternal = (item as any).external;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            target={isExternal ? '_blank' : undefined}
                                            className={`relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 mb-1 rounded-r-full
                                            ${isActive
                                                    ? 'text-[#8058FF] dark:text-[#8058FF]'
                                                    : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#8058FF] rounded-r-full" />
                                            )}
                                            <Icon size={18} className={isActive ? 'text-[#8058FF] dark:text-[#8058FF]' : 'text-gray-400 dark:text-zinc-500 group-hover:text-gray-500 dark:group-hover:text-zinc-300'} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Support / Bottom Links */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Suporte</h4>
                        <div className="space-y-0.5">
                            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-zinc-200 text-sm font-medium transition-colors">
                                <Settings size={18} className="text-gray-400 dark:text-zinc-500" />
                                Configurações
                            </Link>
                            <div
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-[#8058FF] text-sm font-medium transition-colors cursor-pointer"
                            >
                                <RefreshCw size={18} className="text-gray-400 hover:text-[#8058FF]" />
                                Atualizar App
                            </div>

                            <div
                                onClick={() => signOut()}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-red-600 text-sm font-medium transition-colors cursor-pointer"
                            >
                                <LogOut size={18} className="text-gray-400 hover:text-red-500" />
                                Sair
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}
