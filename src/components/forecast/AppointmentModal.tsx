'use client'

import { useState } from 'react'
import { X, Calendar, MapPin, AlignLeft, User } from 'lucide-react'
import { createAppointment, updateAppointment, deleteAppointment } from '@/app/actions/appointments'
import { useToast } from '@/contexts/ToastContext'
import { Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface Client {
    id: number;
    name: string;
}

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate?: Date;
    clients: Client[];
    initialData?: {
        id: number;
        title: string;
        description?: string;
        location?: string;
        clientId?: number;
        date: Date;
    };
    onDelete?: (id: number) => void;
}

export function AppointmentModal({ isOpen, onClose, selectedDate, clients, initialData, onDelete }: AppointmentModalProps) {
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        location: initialData?.location || '',
        clientId: initialData?.clientId || '' as string | number,
        date: initialData?.date
            ? new Date(initialData.date).toISOString().split('T')[0]
            : (selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
    });

    // Update formData when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description || '',
                location: initialData.location || '',
                clientId: initialData.clientId || '',
                date: new Date(initialData.date).toISOString().split('T')[0]
            });
        } else if (isOpen) {
            // Reset for new appointment
            setFormData({
                title: '',
                description: '',
                location: '',
                clientId: '',
                date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        }
    }, [initialData, isOpen, selectedDate]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) return;

        setIsSaving(true);
        try {
            const data = {
                title: formData.title,
                description: formData.description || undefined,
                location: formData.location || undefined,
                clientId: formData.clientId ? Number(formData.clientId) : undefined,
                date: new Date(formData.date)
            };

            if (initialData?.id) {
                await updateAppointment(initialData.id, data);
                addToast('Compromisso atualizado com sucesso.', 'success');
            } else {
                await createAppointment(data);
                addToast('Compromisso agendado com sucesso.', 'success');
            }
            onClose();
        } catch (error) {
            addToast('Não foi possível salvar o compromisso.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id || !confirm('Deseja realmente excluir este compromisso?')) return;

        setIsSaving(true);
        try {
            await deleteAppointment(initialData.id);
            addToast('Compromisso excluído com sucesso.', 'success');
            if (onDelete) onDelete(initialData.id);
            onClose();
        } catch (error) {
            addToast('Não foi possível excluir o compromisso.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 dark:border-zinc-800 flex justify-between items-center bg-blue-50/50 dark:bg-blue-500/5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="text-blue-500" size={20} />
                            {initialData ? 'Editar Compromisso' : 'Novo Compromisso'}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                            {initialData ? 'Altere as informações abaixo' : 'Visitante, reunião ou lembrete'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Título do Compromisso</label>
                        <input
                            required
                            placeholder="Ex: Visita ao Cliente Sebem"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Client */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Cliente (Opcional)</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={formData.clientId}
                                    onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Nenhum</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Localização</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                placeholder="Sala de reuniões, endereço, etc."
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Observações</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-4 top-3 text-gray-400" size={16} />
                            <textarea
                                placeholder="Detalhes ou lembretes importantes..."
                                rows={2}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl pl-11 pr-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex gap-3">
                        {initialData && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                title="Excluir compromisso"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-100 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 font-bold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] bg-blue-600 dark:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isSaving ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Confirmar Agendamento')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
