'use client';

import { SmartInsight } from '@/app/actions/insights';
import { Lightbulb, AlertTriangle, CheckCircle2, Info, Sparkles } from 'lucide-react';

interface SmartInsightsWidgetProps {
    insights: SmartInsight[];
}

export function SmartInsightsWidget({ insights }: SmartInsightsWidgetProps) {
    if (!insights || insights.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertTriangle className="text-red-500" size={18} />;
            case 'warning': return <AlertTriangle className="text-orange-500" size={18} />;
            case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
            default: return <Info className="text-[#8058FF]" size={18} />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'alert': return 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20';
            case 'warning': return 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20';
            case 'success': return 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20';
            default: return 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20';
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800/40 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-zinc-700/50 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700/50 flex items-center justify-between bg-gradient-to-r from-transparent to-indigo-50/30 dark:to-indigo-900/10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#8058FF]/10 rounded-lg text-[#8058FF]">
                        <Sparkles size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Smart Insights</h3>
                </div>
                <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">AI Powered</span>
            </div>

            <div className="p-4 space-y-3">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-xl border flex gap-3 transition-all hover:scale-[1.01] ${getBgColor(insight.type)}`}
                    >
                        <div className="mt-0.5 shrink-0">
                            {getIcon(insight.type)}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                                {insight.title}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
                                {insight.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
