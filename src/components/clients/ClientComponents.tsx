'use client';

import { useState } from 'react';
import { Plus, Trash2, Mail, Phone, User, X, Pencil } from 'lucide-react';
import { createClient, deleteClient, updateClient } from '@/app/actions/clients';
import { useToast } from '@/contexts/ToastContext';

export function ClientList({ clients }: { clients: any[] }) {
    const { addToast } = useToast();
    const [editingClient, setEditingClient] = useState<any | null>(null);

    const handleDelete = async (id: number) => {
        try {
            await deleteClient(id);
            addToast('Cliente removido com sucesso.', 'info');
        } catch (error) {
            console.error(error);
            addToast('Erro ao remover cliente.', 'error');
        }
    };

    if (clients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
                <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                    <User className="text-gray-400 dark:text-zinc-400" size={24} />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Nenhum cliente cadastrado</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Adicione clientes para vincular a receitas.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
                <div key={client.id} className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center text-gray-600 dark:text-zinc-300 font-bold text-sm">
                                    {client.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{client.name}</h3>
                                    <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Cliente</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setEditingClient(client)}
                                    className="text-gray-300 dark:text-zinc-600 hover:text-blue-500 transition-colors p-1"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(client.id)}
                                    className="text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 mt-2">
                            {client.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                                    <Mail size={14} />
                                    <span>{client.email}</span>
                                </div>
                            )}
                            {client.phone && (
                                <a
                                    href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors"
                                >
                                    <Phone size={14} />
                                    <span>{client.phone}</span>
                                </a>
                            )}
                            {!client.email && !client.phone && (
                                <p className="text-xs text-gray-400 dark:text-zinc-500 italic">Sem contato cadastrado</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {editingClient && (
                <EditClientModal
                    client={editingClient}
                    onClose={() => setEditingClient(null)}
                />
            )}
        </div>
    );
}

function EditClientModal({ client, onClose }: { client: any, onClose: () => void }) {
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const name = formData.get('name') as string;
            const email = formData.get('email') as string;
            const phone = formData.get('phone') as string;

            await updateClient(client.id, {
                name,
                email,
                phone
            });
            addToast('Cliente atualizado com sucesso!', 'success');
            onClose();
        } catch (error) {
            console.error('Failed to update client', error);
            addToast('Erro ao atualizar cliente.', 'error');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Editar Cliente</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Nome</label>
                        <input name="name" required defaultValue={client.name} type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="Ex: Empresa X" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Email</label>
                        <input name="email" defaultValue={client.email} type="email" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="contato@empresa.com" />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Telefone</label>
                        <input name="phone" defaultValue={client.phone} type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="(00) 00000-0000" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800 mt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 rounded-lg disabled:opacity-50 transition-colors">
                            {isPending ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function CreateClientControl() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const { addToast } = useToast();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const name = formData.get('name') as string;
            const email = formData.get('email') as string;
            const phone = formData.get('phone') as string;
            const profileId = 2; // TODO: Improve profile logic if needed

            await createClient({
                name,
                email,
                phone,
                profileId
            });
            addToast('Cliente cadastrado com sucesso!', 'success');
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to create client', error);
            addToast('Erro ao cadastrar cliente.', 'error');
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
                <span>Novo Cliente</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Novo Cliente</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
                                <X size={20} />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Nome</label>
                                <input name="name" required type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="Ex: Empresa X" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Email</label>
                                <input name="email" type="email" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="contato@empresa.com" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-zinc-100 mb-1">Telefone</label>
                                <input name="phone" type="text" className="w-full rounded-lg border border-gray-200 dark:border-zinc-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-zinc-500 focus:border-gray-900 dark:focus:border-zinc-500 transition-all bg-white dark:bg-zinc-700/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500" placeholder="(00) 00000-0000" />
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
