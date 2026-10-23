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
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600/50 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {userInitials}
        </div>
      </div>

      {/* Message Content Container */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{user.name}</span>
            <span className="text-[10px] text-slate-500">{formattedTime}</span>
            {message.sliders && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#161D2E] border border-[#232B40] text-[10px] text-slate-400 font-mono">
                <SlidersHorizontal className="w-2.5 h-2.5 text-indigo-400" />
                F:{message.sliders.formality}% W:{message.sliders.warmth}% U:{message.sliders.urgency}%
              </span>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
            title="Copy original draft"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Text bubble */}
        <div className="p-4 rounded-2xl bg-[#141A29] border border-[#1F2937] text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-indigo-500/30">
          {message.content}
        </div>
      </div>
    </div>
  );
};
