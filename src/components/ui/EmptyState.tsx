'use client';

import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ElementType;
    action?: React.ReactNode;
}

export function EmptyState({ title, description, icon: Icon = FolderOpen, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-105">
                <Icon className="text-gray-400 dark:text-zinc-500" size={32} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-xs mb-6 leading-relaxed">
                {description}
            </p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
