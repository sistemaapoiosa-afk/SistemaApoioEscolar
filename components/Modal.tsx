
import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ModalType = 'success' | 'error' | 'warning' | 'info';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: ModalType;
    confirmText?: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    confirmText = 'OK',
    onConfirm,
    showCancel = false,
    children
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-12 h-12 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-12 h-12 text-amber-500" />;
            case 'info':
            default:
                return <Info className="w-12 h-12 text-blue-500" />;
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            case 'error':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
            case 'info':
            default:
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center text-center">
                    {!children && (
                        <div className="mb-6 p-4 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
                            {getIcon()}
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {title}
                    </h3>

                    {children ? (
                        <div className="w-full text-left mb-6">
                            {children}
                        </div>
                    ) : (
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            {message}
                        </p>
                    )}

                    {!children && (
                        <div className="flex gap-3 w-full">
                            {showCancel && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    else onClose();
                                }}
                                className={`flex-1 py-3 px-4 text-white font-bold rounded-xl shadow-lg shadow-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${getButtonClass()}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
