import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-surface-container-high/95 backdrop-blur-xl border border-primary/30 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-[20px]">
          {toast.icon || 'check_circle'}
        </span>
        <span className="font-label-lg text-sm text-on-surface font-medium">
          {toast.text}
        </span>
        <button
          onClick={onClose}
          className="ml-2 text-on-surface-variant hover:text-on-surface p-0.5 rounded-lg"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
