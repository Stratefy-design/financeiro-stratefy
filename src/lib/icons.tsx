import React from 'react';
import {
    Utensils, ShoppingCart, Home, Car, Heart, Plane,
    GraduationCap, Briefcase, CircleDollarSign, Zap,
    Smartphone, Dumbbell, Gift, FileText, CreditCard,
    TrendingDown, TrendingUp
} from 'lucide-react';

export const getCategoryIcon = (category: string, size = 16) => {
    const normalized = category.toLowerCase();

    if (normalized.includes('aliment') || normalized.includes('restaurante') || normalized.includes('fome') || normalized.includes('lanche'))
        return <Utensils size={size} />;

    if (normalized.includes('mercado') || normalized.includes('compra') || normalized.includes('supermercado'))
        return <ShoppingCart size={size} />;

    if (normalized.includes('casa') || normalized.includes('aluguel') || normalized.includes('luz') || normalized.includes('agua') || normalized.includes('moradia') || normalized.includes('internet'))
        return <Home size={size} />;

    if (normalized.includes('transporte') || normalized.includes('uber') || normalized.includes('combustivel') || normalized.includes('carro') || normalized.includes('moto'))
        return <Car size={size} />;

    if (normalized.includes('saude') || normalized.includes('medico') || normalized.includes('farmacia') || normalized.includes('hospital'))
        return <Heart size={size} />;

    if (normalized.includes('lazer') || normalized.includes('viagem') || normalized.includes('ferias') || normalized.includes('aviao'))
        return <Plane size={size} />;

    if (normalized.includes('educacao') || normalized.includes('curso') || normalized.includes('faculdade') || normalized.includes('escola'))
        return <GraduationCap size={size} />;

    if (normalized.includes('trabalho') || normalized.includes('salario') || normalized.includes('venda') || normalized.includes('cliente') || normalized.includes('servico'))
        return <Briefcase size={size} />;

    if (normalized.includes('imposto') || normalized.includes('taxa') || normalized.includes('governo'))
        return <Zap size={size} />;

    return <CircleDollarSign size={size} />;
};

export const getCategoryColor = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes('aliment')) return 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400';
    if (normalized.includes('saude')) return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
    if (normalized.includes('transporte')) return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
    if (normalized.includes('trabalho') || normalized.includes('venda')) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
    if (normalized.includes('casa') || normalized.includes('moradia')) return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
    return 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400';
};
