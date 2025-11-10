import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', title = null, duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type,
      title,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Remover automaticamente após a duração
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Sucesso!') => showToast(message, 'success', title),
    error: (message, title = 'Erro!') => showToast(message, 'error', title),
    warning: (message, title = 'Atenção!') => showToast(message, 'warning', title),
    info: (message, title = 'Informação') => showToast(message, 'info', title),
    show: showToast
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Container de Toasts */}
      <div
        className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none px-4"
        style={{ maxWidth: '420px', width: '100%' }}
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto"
          >
            <Toast
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

