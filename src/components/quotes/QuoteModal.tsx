'use client';

import { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { createQuote, updateQuote } from '@/app/actions/quotes';
import { useToast } from '@/contexts/ToastContext';

interface QuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    clients: any[];
    services: any[];
    currentProfileId: number;
    initialData?: any;
}

export default function QuoteModal({
    isOpen,
    onClose,
    clients,
    services = [],
    currentProfileId,
    initialData
}: QuoteModalProps) {
    const [isPending, setIsPending] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [serviceId, setServiceId] = useState<string>('');
    const [clientId, setClientId] = useState<string>('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setQuantity(initialData.quantity || 1);
                setAmount(initialData.amount.toString());
                setDescription(initialData.description);
                setServiceId(initialData.serviceId?.toString() || '');
                setClientId(initialData.clientId?.toString() || '');
                setDate(new Date(initialData.date).toISOString().split('T')[0]);
            } else {
                setQuantity(1);
                setAmount('');
                setDescription('');
                setServiceId('');
                setClientId('');
                setDate(new Date().toISOString().split('T')[0]);
            }
        }
    }, [isOpen, initialData]);

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setServiceId(id);
        const service = services.find(s => s.id.toString() === id);
        if (service) {
            setAmount(service.defaultPrice?.toString() || '');
            if (!description || services.some(s => s.name === description)) {
                setDescription(service.name);
            }
        }
    };

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const data = {
                description: formData.get('description') as string,
                amount: parseFloat(formData.get('amount') as string),
                quantity: parseInt(formData.get('quantity') as string) || 1,
                date: new Date(formData.get('date') as string + 'T12:00:00'),
                serviceId: serviceId ? parseInt(serviceId) : undefined,
                clientId: clientId ? parseInt(clientId) : undefined,
            };

            if (initialData?.id) {
                await updateQuote(initialData.id, data);
                addToast('Orçamento atualizado!', 'success');
            } else {
                await createQuote(data);
                addToast('Orçamento criado!', 'success');
            }
            onClose();
        } catch (error) {
            addToast('Erro ao salvar orçamento.', 'error');
        } finally {
            setIsPending(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        {initialData ? 'Editar Orçamento' : 'Novo Orçamento'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Serviço</label>
                        <select
                            value={serviceId}
                            onChange={handleServiceChange}
                            className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                        >
                            <option value="">Selecione um serviço...</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Descrição</label>
                        <input name="description" value={description} onChange={(e) => setDescription(e.target.value)} required type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" placeholder="Ex: Orçamento de Consultoria" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Valor Unitário (R$)</label>
                            <input name="amount" required type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Quantidade</label>
                            <input name="quantity" required type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Cliente (Opcional)</label>
                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                        >
                            <option value="">Selecione um cliente...</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Data</label>
                        <input name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isPending} className="px-6 py-2 text-sm font-medium text-white bg-[#8058FF] hover:bg-[#7048E8] rounded-lg disabled:opacity-50 transition-colors">
                            {isPending ? 'Salvando...' : 'Salvar Orçamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
