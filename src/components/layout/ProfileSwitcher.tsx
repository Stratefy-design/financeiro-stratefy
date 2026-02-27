'use client';

import { ChevronDown, Check, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { switchProfile } from '@/app/actions/settings';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface Profile {
    id: number;
    name: string;
    type: string;
    companyAvatar?: string | null;
}

export function ProfileSwitcher({ currentProfileId, profiles }: { currentProfileId: number, profiles: Profile[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileType, setNewProfileType] = useState<'personal' | 'business'>('personal');
    const router = useRouter();

    // Get Clerk User context
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();

    // Import dynamically to avoid circle dependency if needed, but safe here
    const { createProfile } = require('@/app/actions/settings');

    const activeProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

    async function handleSwitch(profileId: number) {
        await switchProfile(profileId);
        setIsOpen(false);
    }

    async function handleCreateProfile() {
        if (!newProfileName.trim()) return;
        await createProfile({ name: newProfileName, type: newProfileType });
        setNewProfileName('');
        setIsCreateModalOpen(false);
        setIsOpen(false);
    }

    async function handleSignOut() {
        await signOut(() => router.push('/sign-in'));
    }

    // Helper to determine avatar source
    const getAvatarSrc = (profile?: Profile) => {
        if (!profile) return null;
        // 1. Custom Company Logo (Highest Priority)
        if (profile.companyAvatar) return profile.companyAvatar;

        // 2. Clerk User Image (Fallback for both Personal and Business)
        // User requested this because they typically use the company email/account for Clerk
        if (user?.imageUrl) return user.imageUrl;

        // 3. Initials (Final Fallback)
        return null;
    };

    const activeAvatarSrc = getAvatarSrc(activeProfile);

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors group select-none"
            >
                <div className="w-10 h-10 bg-gray-900 dark:bg-zinc-800 rounded-full flex items-center justify-center text-white dark:text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-all uppercase overflow-hidden shrink-0">
                    {activeAvatarSrc ? (
                        <img
                            src={activeAvatarSrc}
                            alt={activeProfile?.name || 'Perfil'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        (activeProfile?.name || 'FI').substring(0, 2)
                    )}
                </div>
                <div className="hidden md:block flex-1 min-w-0 text-left">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activeProfile?.name || 'Carregando...'}</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 capitalize">{activeProfile?.type === 'business' ? 'Empresa' : 'Pessoal'}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 dark:text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[100] md:z-10 bg-black/20 md:bg-transparent backdrop-blur-[2px] md:backdrop-blur-none" onClick={() => setIsOpen(false)} />
                    <div className="fixed md:absolute top-1/2 left-1/2 md:top-full md:left-auto md:right-0 -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 mt-0 md:mt-2 w-[calc(100%-32px)] md:w-64 bg-white dark:bg-zinc-800 rounded-2xl md:rounded-xl shadow-2xl md:shadow-lg border border-gray-100 dark:border-zinc-700 p-2 md:p-1 z-[110] md:z-20 animate-in fade-in zoom-in-95 duration-200 md:duration-100">

                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Alternar Perfil
                        </div>

                        {profiles.map(profile => {
                            const avatarSrc = getAvatarSrc(profile);
                            return (
                                <button
                                    key={profile.id}
                                    onClick={() => handleSwitch(profile.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-left"
                                >
                                    <div className="w-6 h-6 bg-gray-200 dark:bg-zinc-600 rounded-full flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
                                        {avatarSrc ? (
                                            <img src={avatarSrc} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            (profile.name || 'P').substring(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <span className={`font-medium flex-1 truncate ${profile.id === currentProfileId ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-400'}`}>
                                        {profile.name}
                                    </span>
                                    {profile.id === currentProfileId && <Check size={14} className="text-gray-900 dark:text-white" />}
                                </button>
                            );
                        })}

                        <div className="h-px bg-gray-100 dark:bg-zinc-700 my-1" />

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#8058FF] hover:bg-[#8058FF]/10 dark:text-[#8058FF] dark:hover:bg-[#8058FF]/20 transition-colors text-left font-medium"
                        >
                            <span className="text-lg">+</span> Criar Novo Perfil
                        </button>

                        <div className="h-px bg-gray-100 dark:bg-zinc-700 my-1" />

                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                            Minha Conta
                        </div>

                        <button
                            onClick={() => openUserProfile()}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors text-left"
                        >
                            <User size={16} />
                            Gerenciar Conta
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                        >
                            <LogOut size={16} />
                            Sair
                        </button>
                    </div>
                </>
            )}

            {/* Simple Modal for Creation */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Novo Perfil</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400">Nome do Perfil</label>
                                <input
                                    value={newProfileName}
                                    onChange={e => setNewProfileName(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                    placeholder="Ex: Minha Empresa"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400">Tipo</label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        onClick={() => setNewProfileType('personal')}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${newProfileType === 'personal' ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black' : 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400'}`}
                                    >
                                        Pessoal
                                    </button>
                                    <button
                                        onClick={() => setNewProfileType('business')}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${newProfileType === 'business' ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black' : 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400'}`}
                                    >
                                        Empresarial
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateProfile}
                                disabled={!newProfileName.trim()}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                            >
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
