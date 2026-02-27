'use client';

import { useState } from 'react';
import { Trash2, Edit2, Check, X, Tag } from 'lucide-react';
import { updateService, deleteService } from '@/app/actions/services';
import { useToast } from '@/contexts/ToastContext';

interface ServiceItemProps {
    service: {
        id: number;
        name: string;
        defaultPrice?: number | null;
    };
}

export default function ServiceItem({ service }: ServiceItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();

    const [name, setName] = useState(service.name);
    const [defaultPrice, setDefaultPrice] = useState(service.defaultPrice?.toString() || '');

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateService(service.id, {
                name,
                defaultPrice: defaultPrice ? parseFloat(defaultPrice) : undefined
            });
            addToast('Serviço atualizado com sucesso!', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update service", error);
            addToast('Erro ao atualizar serviço.', 'error');
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
        try {
            await deleteService(service.id);
            addToast('Serviço removido com sucesso.', 'info');
        } catch (error) {
            console.error("Failed to delete service", error);
            addToast('Erro ao remover serviço.', 'error');
        }
    };

    const handleCancel = () => {
        setName(service.name);
        setDefaultPrice(service.defaultPrice?.toString() || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col justify-between group transition-all ring-2 ring-indigo-500/20">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 shrink-0">
                                <Tag size={18} />
                            </div>
                            <div className="w-full mr-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full text-sm font-semibold border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-2 py-1 mb-1"
                                    placeholder="Nome do Serviço"
                                />
                                <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Editando Serviço</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-zinc-400">R$</span>
                            <input
                                type="number"
                                step="0.01"
                                value={defaultPrice}
                                onChange={(e) => setDefaultPrice(e.target.value)}
                                className="w-full text-xl font-bold border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-2 py-1"
                                placeholder="0,00"
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Preço Padrão</p>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                    <button
                        onClick={handleCancel}
                        className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                        title="Cancelar"
                    >
                        <X size={18} />
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="p-2 text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        title="Salvar"
                    >
                        <Check size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                            <Tag size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Serviço</span>
                        </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray-300 dark:text-zinc-600 hover:text-blue-500 transition-colors p-1"
                            title="Editar"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-colors p-1"
                            title="Excluir"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="mt-2">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {service.defaultPrice ? toCurrency(service.defaultPrice) : <span className="text-gray-400 text-lg">Sob Consulta</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Preço Padrão</p>
                </div>
            </div>
        </div>
    );
}
