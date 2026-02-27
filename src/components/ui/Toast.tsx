'use client';

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
    onClose: () => void;
}

const icons = {
    success: <CheckCircle size={20} className="text-emerald-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    warning: <AlertTriangle size={20} className="text-amber-500" />,
    info: <Info size={20} className="text-blue-500" />,
};

const bgColors = {
    success: 'bg-white dark:bg-zinc-800 border-emerald-500/20',
    error: 'bg-white dark:bg-zinc-800 border-red-500/20',
    warning: 'bg-white dark:bg-zinc-800 border-amber-500/20',
    info: 'bg-white dark:bg-zinc-800 border-blue-500/20',
};

export function Toast({ id, message, type, title, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for exit animation
        setTimeout(onClose, 300);
    };

    return (
        <div
            className={`
                relative flex items-start gap-3 p-4 min-w-[300px] max-w-md rounded-lg shadow-lg border border-l-4
                transition-all duration-300 transform 
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}
                ${bgColors[type]}
            `}
            role="alert"
        >
            <div className="flex-shrink-0 pt-0.5">
                {icons[type]}
            </div>
            <div className="flex-1 mr-2">
                {title && <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-0.5">{title}</h4>}
                <p className="text-sm text-gray-600 dark:text-zinc-300 leading-snug">{message}</p>
            </div>
            <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
            >
                <X size={16} />
            </button>
        </div>
    );
}
