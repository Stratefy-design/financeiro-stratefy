'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/settings';
import { useToast } from '@/contexts/ToastContext';

interface SettingsFormProps {
    profile: any;
}

export function SettingsForm({ profile }: SettingsFormProps) {
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            await updateProfile(formData);
            addToast('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            console.error('Failed to update profile', error);
            addToast('Erro ao atualizar perfil.', 'error');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form action={handleSubmit} className="p-6 space-y-6">
            <input type="hidden" name="profileId" value={profile.id} />

            <div className="grid gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Nome de Exibição (Perfil)</label>
                    <input
                        name="name"
                        defaultValue={profile.name}
                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Moeda Principal</label>
                    <select
                        name="currency"
                        defaultValue={profile.currency}
                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                    >
                        <option value="BRL">Real Brasileiro (BRL)</option>
                        <option value="USD">Dólar Americano (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Cálculo de Dias Úteis (Salário)</label>
                    <select
                        name="businessDaysConfig"
                        defaultValue={profile.businessDaysConfig || 'mon-sat'}
                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                    >
                        <option value="mon-sat">Segunda a Sábado (6 dias)</option>
                        <option value="mon-fri">Segunda a Sexta (5 dias)</option>
                    </select>
                    <p className="text-[10px] text-gray-500 dark:text-zinc-400">Define como o 5º dia útil é calculado para projeções de salário.</p>
                </div>
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-700 pt-6">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Dados da Empresa (Para Relatórios)</h3>
                <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Nome da Empresa</label>
                            <input
                                name="companyName"
                                defaultValue={profile.companyName || ''}
                                placeholder="Ex: Minha Empresa Ltda"
                                className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Email de Contato</label>
                            <input
                                name="companyEmail"
                                defaultValue={profile.companyEmail || ''}
                                placeholder="contato@empresa.com"
                                className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Telefone</label>
                            <input
                                name="companyPhone"
                                defaultValue={profile.companyPhone || ''}
                                placeholder="(00) 0000-0000"
                                className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Website</label>
                            <input
                                name="companyWebsite"
                                defaultValue={profile.companyWebsite || ''}
                                placeholder="www.suaempresa.com.br"
                                className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Endereço Completo</label>
                        <textarea
                            name="companyAddress"
                            defaultValue={profile.companyAddress || ''}
                            placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF"
                            rows={2}
                            className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isPending} className="bg-gray-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50">
                    {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </form>
    );
}
