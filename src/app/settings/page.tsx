
import { getCurrentProfileId } from '@/app/actions/settings';
import prisma from '@/lib/db';
import { SettingsTabs } from '@/components/settings/SettingsTabs';

import { redirect } from "next/navigation";

export default async function SettingsPage() {
    const currentProfileId = await getCurrentProfileId();
    if (!currentProfileId) redirect('/sign-in');

    const profile = await prisma.profile.findUnique({
        where: { id: currentProfileId }
    });

    if (!profile) return <div>Perfil não encontrado.</div>;

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-end justify-between py-6 mb-2">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 mb-1">
                        <span>Finance</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-medium">Configurações</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Configurações</h1>
                </div>
            </div>

            <SettingsTabs profile={profile} />
        </div>
    );
}
