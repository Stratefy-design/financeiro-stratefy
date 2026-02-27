'use client';

import { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { createGoal } from '@/app/actions/goals';
import { useToast } from '@/contexts/ToastContext';

export default function CreateGoalControl({ currentProfileId }: { currentProfileId: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [targetAmount, setTargetAmount] = useState('');

    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const title = formData.get('title') as string;
            const targetVal = parseFloat(targetAmount || '0');
            const deadline = formData.get('deadline') ? new Date(formData.get('deadline') as string) : undefined;
            const profileId = currentProfileId;

            await createGoal({
                title,
                targetAmount: targetVal,
                deadline,
                profileId
            });

            addToast('Meta criada com sucesso!', 'success');
            setIsOpen(false);
            setTargetAmount('');
        } catch (error) {
            console.error('Failed to create goal', error);
            addToast('Erro ao criar meta.', 'error');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
                <Plus size={16} />
                <span>Nova Meta</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Nova Meta</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                <X size={20} />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Título</label>
                                <input name="title" required type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="Ex: Novo Macbook" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Valor Alvo (R$)</label>
                                <div className="relative">
                                    <input
                                        name="targetAmount"
                                        required
                                        type="number"
                                        step="0.01"
                                        value={targetAmount}
                                        onChange={(e) => setTargetAmount(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0,00"
                                    />
                                    <div className="absolute right-1 top-1 bottom-1 flex flex-col border-l border-gray-200 dark:border-zinc-600">
                                        <button
                                            type="button"
                                            onClick={() => setTargetAmount(prev => (parseFloat(prev || '0') + 100).toFixed(2))}
                                            className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-600/50 text-gray-500 dark:text-zinc-400 transition-colors flex items-center justify-center rounded-tr-md"
                                            title="+100"
                                        >
                                            <ChevronUp size={12} strokeWidth={3} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTargetAmount(prev => Math.max(0, parseFloat(prev || '0') - 100).toFixed(2))}
                                            className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-600/50 text-gray-500 dark:text-zinc-400 transition-colors flex items-center justify-center border-t border-gray-200 dark:border-zinc-600 rounded-br-md"
                                            title="-100"
                                        >
                                            <ChevronDown size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Prazo (Opcional)</label>
                                <input name="deadline" type="date" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200 rounded-lg disabled:opacity-50 transition-colors">
                                    {isPending ? 'Salvando...' : 'Criar Meta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
