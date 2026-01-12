import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastMessage, ToastType } from '../types';

interface ToastContextType {
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000); // Auto dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const styles = {
    success: "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
    error: "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/50 dark:text-red-100",
    info: "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100",
    warning: "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100"
  };

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 bg-white dark:bg-slate-800 transition-all duration-300 animate-in slide-in-from-right-full ${styles[toast.type]} min-w-[300px] max-w-md`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1">
        {toast.title && <h4 className="font-semibold text-sm mb-1">{toast.title}</h4>}
        <p className="text-sm opacity-90">{toast.message}</p>
      </div>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};