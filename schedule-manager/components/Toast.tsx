import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useToasts } from '../hooks/useToast';
import { ToastMessage, ToastType } from '../types';
import { CheckIcon, XIcon, InformationCircleIcon } from './icons';

const toastIcons: Record<ToastType, React.FC<{className?: string}>> = {
    success: CheckIcon,
    error: XIcon,
    warning: InformationCircleIcon,
    info: InformationCircleIcon
};

const toastStyles: Record<ToastType, { bg: string, iconColor: string }> = {
    success: { bg: 'bg-lime-green', iconColor: 'text-charcoal-black' },
    error: { bg: 'bg-red-500', iconColor: 'text-white' },
    warning: { bg: 'bg-yellow-500', iconColor: 'text-white' },
    info: { bg: 'bg-blue-500', iconColor: 'text-white' },
};


const Toast: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsExiting(true);
        // Match removal with animation duration
        setTimeout(() => onRemove(toast.id), 300);
    }, 4700);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);
  
  const handleRemove = () => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
  }

  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  return (
    <div
      className={`
        flex items-center w-full max-w-sm p-4 text-white ${styles.bg} rounded-lg shadow-lg
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
      `}
      role="alert"
    >
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-black/20 ${styles.iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="ms-3 text-sm font-medium">{toast.message}</div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 p-1.5 inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-black/20 transition-colors"
        onClick={handleRemove}
        aria-label="Close"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};


export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToasts();
  const el = document.getElementById('toast-root');

  if (!el) return null;

  return ReactDOM.createPortal(
    <div className="fixed top-5 right-5 z-[100] space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    el
  );
};