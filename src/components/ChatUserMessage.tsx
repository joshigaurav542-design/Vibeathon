import React, { useState } from 'react';
import { Copy, Check, SlidersHorizontal } from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';

interface ChatUserMessageProps {
  message: ChatMessage;
  user: UserProfile;
}

export const ChatUserMessage: React.FC<ChatUserMessageProps> = ({ message, user }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const userInitials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'VS';

  return (
    <div className="flex gap-3 sm:gap-4 max-w-5xl w-full">
      {/* User Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
          {userInitials}
        </div>
      </div>

      {/* Message Content Container */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">{user.name}</span>
            <span className="text-[10px] text-slate-400">{formattedTime}</span>
            {message.sliders && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] text-blue-700 font-mono font-medium">
                <SlidersHorizontal className="w-2.5 h-2.5 text-blue-600" />
                F:{message.sliders.formality}% W:{message.sliders.warmth}% U:{message.sliders.urgency}%
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Copy original draft"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Text bubble */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-sm text-slate-900 leading-relaxed whitespace-pre-wrap selection:bg-blue-500/20">
          {message.content}
        </div>
      </div>
    </div>
  );
};
