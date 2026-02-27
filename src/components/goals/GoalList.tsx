'use client';

import { Trash2, TrendingUp, Calendar, Edit2 } from "lucide-react";
import { deleteGoal, updateGoalAmount, updateGoal } from "@/app/actions/goals";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

// Tipos manuais já que @prisma/client pode dar erro de import no client
interface GoalProps {
    id: number;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: Date | null;
}

export default function GoalList({ goals }: { goals: any[] }) {

    // Simulação de adicionar dinheiro (Update rápido)
    const { addToast } = useToast();

    // Simulação de adicionar dinheiro (Update rápido)
    const handleAddMoney = async (id: number, current: number, target: number) => {
        const add = prompt("Quanto deseja adicionar à meta? (Valor numérico)");
        if (add) {
            const val = parseFloat(add);
            if (!isNaN(val)) {
                try {
                    await updateGoalAmount(id, current + val);
                    addToast('Valor adicionado com sucesso!', 'success');
                } catch (error) {
                    console.error("Failed to add money", error);
                    addToast('Erro ao adicionar valor.', 'error');
                }
            }
        }
    }

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
    };

    if (goals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-3">
                    <TrendingUp className="text-gray-400 dark:text-zinc-400" size={24} />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Nenhuma meta criada</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Comece definindo um objetivo financeiro.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal: GoalProps) => (
                <GoalCard key={goal.id} goal={goal} />
            ))}
        </div>
    );
}

function GoalCard({ goal }: { goal: GoalProps }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(goal.title);
    const [targetAmount, setTargetAmount] = useState(goal.targetAmount);
    const [deadline, setDeadline] = useState(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
    const { addToast } = useToast();

    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    const handleSave = async () => {
        try {
            await updateGoal(goal.id, {
                title,
                targetAmount: Number(targetAmount),
                deadline: deadline ? new Date(deadline) : undefined
            });
            addToast('Meta atualizada com sucesso!', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update goal", error);
            addToast('Erro ao atualizar meta.', 'error');
        }
    };

    const handleAddMoney = async () => {
        const add = prompt("Quanto deseja adicionar à meta? (Valor numérico)");
        if (add) {
            const val = parseFloat(add);
            if (!isNaN(val)) {
                try {
                    await updateGoalAmount(goal.id, goal.currentAmount + val);
                    addToast('Valor adicionado com sucesso!', 'success');
                } catch (error) {
                    console.error("Failed to add money", error);
                    addToast('Erro ao adicionar valor.', 'error');
                }
            }
        }
    }

    const handleDelete = async () => {
        if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
        try {
            await deleteGoal(goal.id);
            addToast('Meta removida com sucesso.', 'info');
        } catch (error) {
            console.error("Failed to delete goal", error);
            addToast('Erro ao remover meta.', 'error');
        }
    };

    const toCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date);
    };

    if (isEditing) {
        return (
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-zinc-400">Título</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-white rounded px-2 py-1 text-sm font-semibold"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-zinc-400">Valor Alvo</label>
                        <input
                            type="number"
                            value={targetAmount}
                            onChange={(e) => setTargetAmount(Number(e.target.value))}
                            className="w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-white rounded px-2 py-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-zinc-400">Data Alvo</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full border border-gray-200 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-white rounded px-2 py-1 text-sm text-gray-500 dark:text-zinc-300"
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={handleSave} className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black py-1.5 rounded text-xs font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors">Salvar</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 py-1.5 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors">Cancelar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                        {goal.deadline && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400 mt-1">
                                <Calendar size={12} />
                                <span>{formatDate(new Date(goal.deadline))}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-gray-300 hover:text-blue-500 transition-colors p-1"
                            title="Editar Meta"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            title="Excluir Meta"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div className="mb-2 flex items-end justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{toCurrency(goal.currentAmount)}</span>
                    <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">de {toCurrency(goal.targetAmount)}</span>
                </div>

                <div className="w-full bg-gray-100 dark:bg-zinc-700/50 rounded-full h-2.5 mb-6 overflow-hidden">
                    <div
                        className="bg-gray-900 dark:bg-zinc-100 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <button
                onClick={handleAddMoney}
                className="w-full py-2 bg-gray-50 dark:bg-zinc-700/30 hover:bg-gray-100 dark:hover:bg-zinc-700/50 text-gray-900 dark:text-zinc-100 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700"
            >
                <TrendingUp size={14} />
                Adicionar Valor
            </button>
        </div>
    )
}
