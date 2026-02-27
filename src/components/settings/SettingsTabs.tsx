'use client';

import { useState } from 'react';
import { User, Building2 } from 'lucide-react';
import { UserProfile } from '@clerk/nextjs';
import { SettingsForm } from './SettingsForm';

interface SettingsTabsProps {
    profile: any;
}

export function SettingsTabs({ profile }: SettingsTabsProps) {
    const [activeTab, setActiveTab] = useState<'company' | 'account'>('company');

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="flex p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'company'
                        ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                        }`}
                >
                    <Building2 size={16} />
                    <span>Dados da Empresa</span>
                </button>
                <button
                    onClick={() => setActiveTab('account')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'account'
                        ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                        }`}
                >
                    <User size={16} />
                    <span>Minha Conta</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                {activeTab === 'company' ? (
                    <>
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/30">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Dados do Perfil</h2>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Atualize as informações visíveis nos relatórios e faturas.</p>
                        </div>
                        <SettingsForm profile={profile} />
                    </>
                ) : (
                    <div className="p-6 flex justify-center w-full">
                        <UserProfile
                            appearance={{
                                elements: {
                                    rootBox: "w-full max-w-4xl shadow-none",
                                    card: "shadow-none border-none dark:bg-zinc-800",
                                    navbar: "hidden", // Hide left sidebar of UserProfile to fit better
                                    headerTitle: "text-gray-900 dark:text-white",
                                    headerSubtitle: "text-gray-500 dark:text-zinc-400",
                                    profilePage: "p-0",
                                }
                            }}
                            routing="hash"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
