import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const icons = {
    success: <FaCheckCircle className="text-green-600" />,
    error: <FaTimesCircle className="text-red-600" />,
    warning: <FaExclamationCircle className="text-yellow-600" />,
    info: <FaInfoCircle className="text-blue-600" />
  };

  const bgColors = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300',
    error: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300',
    warning: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300',
    info: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  const iconBgColors = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100'
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border-2 min-w-[320px] max-w-md transition-all duration-300 ${
        bgColors[toast.type]
      } ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
      style={{
        backdropFilter: 'blur(10px)',
        animation: 'slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}
    >
      <div className={`flex-shrink-0 text-2xl p-2 rounded-full ${iconBgColors[toast.type]}`}>
        {icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className={`font-bold mb-1 text-base ${textColors[toast.type]}`}>
            {toast.title}
          </h4>
        )}
        <p className={`text-sm leading-relaxed ${textColors[toast.type]}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${textColors[toast.type]} hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-white hover:bg-opacity-50`}
        aria-label="Fechar"
      >
        <FaTimes className="text-lg" />
      </button>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;

