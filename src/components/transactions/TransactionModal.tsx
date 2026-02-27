'use client';

import { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { createTransaction, updateTransaction, deleteTransaction } from '@/app/actions/transactions';
import { useToast } from '@/contexts/ToastContext';
import { Trash2 } from 'lucide-react';

const DEFAULT_EXPENSE_CATEGORIES = [
    'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer',
    'Moradia', 'Internet', 'Assinaturas', 'Mercado', 'Impostos', 'Outros'
];

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    clients: any[];
    services: any[];
    currentProfileId: number;
    expenseCategories: any[];
    initialDate?: Date;
    initialData?: {
        id: number;
        description: string;
        amount: number;
        type: 'income' | 'expense';
        category: string;
        date: Date;
        dueDate?: Date;
        status: string;
        isRecurring: boolean;
        clientId?: number;
        serviceId?: number;
        quantity?: number;
    };
    onDelete?: (id: number) => void;
}

export default function TransactionModal({
    isOpen,
    onClose,
    clients,
    services = [],
    currentProfileId,
    expenseCategories = [],
    initialDate,
    initialData,
    onDelete
}: TransactionModalProps) {
    const allCategories = expenseCategories.length > 0
        ? expenseCategories
        : DEFAULT_EXPENSE_CATEGORIES.map((name, i) => ({ id: `fallback-${i}`, name }));

    const [isPending, setIsPending] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('completed');
    const [isRecurring, setIsRecurring] = useState(false);
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [isNewService, setIsNewService] = useState(false);
    const [isNewClient, setIsNewClient] = useState(false);
    const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');

    const { addToast } = useToast();

    // Reset or populate form when opened
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setQuantity(initialData.quantity || 1);
                setAmount((initialData.amount / (initialData.quantity || 1)).toFixed(2));
                setDescription(initialData.description);
                setCategory(initialData.category);
                setStatus(initialData.status);
                setIsRecurring(initialData.isRecurring);
                setActiveTab(initialData.type);
                setIsNewCategory(false);
                setIsNewService(false);
                setIsNewClient(false);
            } else {
                setQuantity(1);
                setAmount('');
                setDescription('');
                setCategory('');
                setStatus('completed');
                setIsRecurring(false);
                setIsNewCategory(false);
                setIsNewService(false);
                setIsNewClient(false);
                setActiveTab('income');
            }
        }
    }, [isOpen, initialData]);

    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedName = e.target.value;

        if (selectedName === "NEW_SERVICE") {
            setIsNewService(true);
            setCategory('');
            return;
        }

        setIsNewService(false);
        setCategory(selectedName);

        const service = services.find(s => s.name === selectedName);
        if (service) {
            if (service.defaultPrice) {
                setAmount(service.defaultPrice.toFixed(2));
            }

            // Only overwrite description if it's empty or matches a previous service name
            const previousServiceName = services.find(s => s.name === description);
            if (!description || description.trim() === '' || previousServiceName) {
                setDescription(service.name);
            }
        }
    };

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const unitAmount = parseFloat(formData.get('amount') as string);
            if (isNaN(unitAmount)) throw new Error("Valor inválido");

            const quantity = parseInt(formData.get('quantity') as string) || 1;
            const amount = unitAmount * quantity;

            const description = formData.get('description') as string;
            let category = formData.get('category') as string;

            if (activeTab === 'expense' && isNewCategory) {
                category = formData.get('newCategory') as string;
            }

            let serviceId: number | undefined;
            let newServiceName: string | undefined;

            if (activeTab === 'income') {
                if (isNewService) {
                    newServiceName = formData.get('newServiceName') as string;
                    category = newServiceName;
                } else {
                    const selectedService = services.find(s => s.name === category);
                    serviceId = selectedService?.id;
                }
            }

            const type = activeTab;
            const status = formData.get('status') as string;
            const isRecurring = formData.get('isRecurring') === 'on';

            const rawDate = formData.get('date') as string;
            const rawDueDate = formData.get('dueDate') as string;

            let date: Date;
            let dueDate: Date | undefined;

            const createDate = (dateString: string) => new Date(dateString + 'T12:00:00');

            if (activeTab === 'expense') {
                if (rawDueDate) {
                    date = createDate(rawDueDate);
                    dueDate = createDate(rawDueDate);
                } else {
                    date = initialDate || new Date();
                    dueDate = undefined;
                }
            } else {
                date = rawDate ? createDate(rawDate) : (initialDate || new Date());
                dueDate = undefined;
            }

            const clientIdStr = formData.get('clientId') as string;
            let clientId = clientIdStr ? parseInt(clientIdStr) : undefined;
            let newClientName: string | undefined;

            if (activeTab === 'income' && isNewClient) {
                newClientName = formData.get('newClientName') as string;
                clientId = undefined;
            }

            if (initialData?.id) {
                await updateTransaction(initialData.id, {
                    description,
                    amount,
                    category,
                    type,
                    date,
                    dueDate,
                    clientId,
                    serviceId,
                    quantity,
                    status,
                    isRecurring
                });
                addToast('Transação atualizada com sucesso!', 'success');
            } else {
                await createTransaction({
                    description,
                    amount,
                    category,
                    type,
                    date,
                    dueDate,
                    profileId: currentProfileId,
                    clientId,
                    serviceId,
                    newServiceName,
                    newClientName,
                    quantity,
                    status,
                    isRecurring
                });
                addToast('Transação criada com sucesso!', 'success');
            }
            onClose();
        } catch (error) {
            console.error('Failed to save transaction', error);
            addToast('Erro ao salvar transação. Tente novamente.', 'error');
        } finally {
            setIsPending(false);
        }
    }

    const handleDelete = async () => {
        if (!initialData?.id || !confirm('Deseja realmente excluir esta transação?')) return;

        setIsPending(true);
        try {
            await deleteTransaction(initialData.id);
            addToast('Transação excluída com sucesso!', 'success');
            if (onDelete) onDelete(initialData.id);
            onClose();
        } catch (error) {
            addToast('Erro ao excluir transação.', 'error');
        } finally {
            setIsPending(false);
        }
    }

    if (!isOpen) return null;

    const formattedInitialDate = initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {initialData ? 'Editar Transação' : 'Nova Transação'}
                        </h3>
                        {(initialData?.date || initialDate) && (
                            <span className="text-[10px] text-[#8058FF] font-bold uppercase">
                                {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(initialData?.date || initialDate!))}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('income')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'income'
                            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                            }`}
                    >
                        Receita
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('expense')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'expense'
                            ? 'border-red-500 text-red-600 dark:text-red-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                            }`}
                    >
                        Despesa
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Descrição</label>
                        <input name="description" value={description} onChange={(e) => setDescription(e.target.value)} required type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-zinc-400" placeholder="Ex: Pagamento Cliente X" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Valor Unitário (R$)</label>
                            <div className="relative">
                                <input
                                    name="amount"
                                    required
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-zinc-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="0,00"
                                />
                                <div className="absolute right-1 top-1 bottom-1 flex flex-col border-l border-gray-200 dark:border-zinc-600">
                                    <button
                                        type="button"
                                        onClick={() => setAmount(prev => (parseFloat(prev || '0') + 1).toFixed(2))}
                                        className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-600/50 text-gray-500 dark:text-zinc-400 transition-colors flex items-center justify-center rounded-tr-md"
                                    >
                                        <ChevronUp size={12} strokeWidth={3} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAmount(prev => Math.max(0, parseFloat(prev || '0') - 1).toFixed(2))}
                                        className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-600/50 text-gray-500 dark:text-zinc-400 transition-colors flex items-center justify-center border-t border-gray-200 dark:border-zinc-600 rounded-br-md"
                                    >
                                        <ChevronDown size={12} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Qtd</label>
                                <div className="relative">
                                    <input
                                        name="quantity"
                                        required
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <div className="absolute right-1 top-1 bottom-1 flex flex-col border-l border-gray-200 dark:border-zinc-600">
                                        <button
                                            type="button"
                                            onClick={handleIncrement}
                                            className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-600/50 text-gray-500 dark:text-zinc-400 transition-colors flex items-center justify-center rounded-tr-md"
                                        >
                                            <ChevronUp size={12} strokeWidth={3} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDecrement}
                                            className="flex-1 px-2 hover:bg-gray-100 dark:hover:bg-zinc-600/50 text-gray-500 dark:text-zinc-400 transition-colors flex items-center justify-center border-t border-gray-200 dark:border-zinc-600 rounded-br-md"
                                        >
                                            <ChevronDown size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div>
                                {activeTab === 'income' && (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Data</label>
                                        <input name="date" type="date" required defaultValue={formattedInitialDate} className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" />
                                    </>
                                )}
                                {activeTab === 'expense' && (
                                    <>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Vencimento</label>
                                        <input name="dueDate" type="date" required defaultValue={formattedInitialDate} className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Status</label>
                            <select name="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white">
                                <option value="completed">Pago / Recebido</option>
                                <option value="pending">Pendente</option>
                            </select>
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer select-none">
                                <input
                                    name="isRecurring"
                                    type="checkbox"
                                    checked={isRecurring}
                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 w-4 h-4"
                                />
                                <span>Recorrente?</span>
                            </label>
                        </div>
                    </div>

                    {activeTab === 'income' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Serviço</label>
                                <select
                                    name="category"
                                    value={isNewService ? "NEW_SERVICE" : category}
                                    onChange={handleCategoryChange}
                                    required={!isNewService}
                                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                >
                                    <option value="">Selecione...</option>
                                    {services.map(service => (
                                        <option key={service.id} value={service.name}>{service.name}</option>
                                    ))}
                                    <option value="NEW_SERVICE" className="font-bold text-[#8058FF]">+ Adicionar Novo Serviço...</option>
                                </select>
                            </div>
                            <div>
                                {isNewService && (
                                    <div className="animate-in slide-in-from-top-2 duration-200">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1 italic">Nome do Novo Serviço</label>
                                        <input
                                            name="newServiceName"
                                            required
                                            autoFocus
                                            type="text"
                                            className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                            placeholder="Ex: Consultoria, Design..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'expense' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1">Categoria de Despesa</label>
                                <select
                                    name="category"
                                    value={isNewCategory ? "NEW" : category}
                                    onChange={(e) => {
                                        if (e.target.value === "NEW") {
                                            setIsNewCategory(true);
                                            setCategory('');
                                        } else {
                                            setIsNewCategory(false);
                                            setCategory(e.target.value);
                                        }
                                    }}
                                    required={!isNewCategory}
                                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                >
                                    <option value="">Selecione...</option>
                                    {expenseCategories?.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                    <option value="NEW" className="font-bold text-[#8058FF]">+ Adicionar Nova Categoria...</option>
                                </select>
                            </div>

                            {isNewCategory && (
                                <div className="animate-in slide-in-from-top-2 duration-200">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1 italic">Nome da Nova Categoria</label>
                                    <input
                                        name="newCategory"
                                        required
                                        autoFocus
                                        type="text"
                                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                        placeholder="Ex: Assinaturas, Manutenção..."
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'income' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Cliente (Opcional)</label>
                                <select
                                    name="clientId"
                                    onChange={(e) => {
                                        if (e.target.value === "NEW_CLIENT") {
                                            setIsNewClient(true);
                                        } else {
                                            setIsNewClient(false);
                                        }
                                    }}
                                    className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                >
                                    <option value="">Selecione...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                    <option value="NEW_CLIENT" className="font-bold text-[#8058FF]">+ Adicionar Novo Cliente...</option>
                                </select>
                            </div>

                            {isNewClient && (
                                <div className="animate-in slide-in-from-top-2 duration-200">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-100 mb-1 italic">Nome do Novo Cliente</label>
                                    <input
                                        name="newClientName"
                                        required
                                        autoFocus
                                        type="text"
                                        className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white"
                                        placeholder="Ex: João Silva, Empresa X..."
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-4 flex justify-between gap-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
                        <div className="flex gap-2">
                            {initialData && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-red-100 dark:border-red-900/30"
                                    title="Excluir transação"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent">
                                Cancelar
                            </button>
                        </div>
                        <button type="submit" disabled={isPending} className="px-6 py-2 text-sm font-medium text-white bg-[#8058FF] hover:bg-[#7048E8] rounded-lg disabled:opacity-50 transition-colors shadow-sm shadow-indigo-500/20">
                            {isPending ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Salvar Transação')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
