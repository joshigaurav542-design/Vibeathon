import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#111827]/95 border border-emerald-500/50 text-white shadow-2xl shadow-black/80 backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-medium text-slate-200">{message}</span>
      </div>
    </div>
  );
};
