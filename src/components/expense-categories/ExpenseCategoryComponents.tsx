'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Tag, List } from 'lucide-react';
import { createExpenseCategory, deleteExpenseCategory, updateExpenseCategory } from '@/app/actions/expense-categories';
import { useToast } from '@/contexts/ToastContext';

interface ExpenseCategoryItemProps {
    category: {
        id: number;
        name: string;
    };
}

export function ExpenseCategoryItem({ category }: ExpenseCategoryItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [name, setName] = useState(category.name);
    const { addToast } = useToast();

    const handleSave = async () => {
        setIsPending(true);
        try {
            await updateExpenseCategory(category.id, { name });
            addToast('Categoria atualizada com sucesso!', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update category", error);
            addToast('Erro ao atualizar categoria.', 'error');
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
        try {
            await deleteExpenseCategory(category.id);
            addToast('Categoria removida com sucesso.', 'info');
        } catch (error) {
            console.error("Failed to delete category", error);
            addToast('Erro ao remover categoria.', 'error');
        }
    };

    const handleCancel = () => {
        setName(category.name);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col justify-between group transition-all ring-2 ring-red-500/20">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 bg-red-50 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-300 shrink-0">
                                <Tag size={18} />
                            </div>
                            <div className="w-full mr-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full text-sm font-semibold border-gray-300 dark:border-zinc-600 rounded-md dark:bg-zinc-700 dark:text-white px-2 py-1 mb-1"
                                    placeholder="Nome da Categoria"
                                />
                                <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Editando Categoria</span>
                            </div>
                        </div>
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
                        <div className="w-10 h-10 bg-red-50 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-300">
                            <Tag size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Categoria de Despesa</span>
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
            </div>
        </div>
    );
}

export function ExpenseCategoryList({ categories }: { categories: any[] }) {
    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
                <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                    <List className="text-gray-400 dark:text-zinc-400" size={24} />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Nenhuma categoria cadastrada</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Cadastre categorias para organizar suas despesas.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
                <ExpenseCategoryItem key={category.id} category={category} />
            ))}
        </div>
    );
}

export function CreateExpenseCategoryControl({ currentProfileId }: { currentProfileId: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const name = formData.get('name') as string;

            await createExpenseCategory({
                name,
                profileId: currentProfileId
            });
            addToast('Categoria criada com sucesso!', 'success');
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to create category', error);
            addToast('Erro ao criar categoria.', 'error');
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
                <span>Nova Categoria</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Nova Categoria</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                <X size={20} />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Nome da Categoria</label>
                                <input name="name" required type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="Ex: Escritório, Marketing, Transporte..." />
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
