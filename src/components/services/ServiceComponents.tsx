'use client';

import { useState } from 'react';
import { Plus, Trash2, Tag, Briefcase, X, ChevronUp, ChevronDown } from 'lucide-react';
import { createService, deleteService } from '@/app/actions/services';
import { useToast } from '@/contexts/ToastContext';
import ServiceItem from './ServiceItem';

export function ServiceList({ services }: { services: any[] }) {
    if (services.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
                <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                    <Briefcase className="text-gray-400 dark:text-zinc-400" size={24} />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Nenhum serviço cadastrado</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Cadastre seus serviços e preços padrão.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
                <ServiceItem key={service.id} service={service} />
            ))}
        </div>
    );
}

export function CreateServiceControl() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [defaultPrice, setDefaultPrice] = useState('');
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const name = formData.get('name') as string;
            const defaultPrice = formData.get('defaultPrice') ? parseFloat(formData.get('defaultPrice') as string) : undefined;
            const profileId = 2; // Business Profile

            await createService({
                name,
                defaultPrice,
                profileId
            });
            addToast('Serviço criado com sucesso!', 'success');
            setIsOpen(false);
            setDefaultPrice('');
        } catch (error) {
            console.error('Failed to create service', error);
            addToast('Erro ao criar serviço.', 'error');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
                <Plus size={16} />
                <span>Novo Serviço</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Novo Serviço</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                <X size={20} />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Nome do Serviço</label>
                                <input name="name" required type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="Ex: Consultoria de Marketing" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Preço Padrão (R$)</label>
                                <div className="relative">
                                    <input
                                        name="defaultPrice"
                                        type="number"
                                        step="0.01"
                                        value={defaultPrice}
                                        onChange={(e) => setDefaultPrice(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0,00"
                                    />
                                    <div className="absolute right-1 top-1 bottom-1 flex flex-col border-l border-gray-200 dark:border-zinc-600">
                                        <button
                                            type="button"
                                            onClick={() => setDefaultPrice(prev => (parseFloat(prev || '0') + 1).toFixed(2))}
                                            className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-600/50 text-gray-500 dark:text-zinc-400 transition-colors flex items-center justify-center rounded-tr-md"
                                        >
                                            <ChevronUp size={12} strokeWidth={3} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDefaultPrice(prev => Math.max(0, parseFloat(prev || '0') - 1).toFixed(2))}
                                            className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-600/50 text-gray-500 dark:text-zinc-400 transition-colors flex items-center justify-center border-t border-gray-200 dark:border-zinc-600 rounded-br-md"
                                        >
                                            <ChevronDown size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 rounded-lg disabled:opacity-50 transition-colors">
                                    {isPending ? 'Salvando...' : 'Cadastrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
