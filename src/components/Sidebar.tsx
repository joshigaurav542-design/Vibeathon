import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Sparkles, 
  Search, 
  Settings, 
  PanelLeftClose
} from 'lucide-react';
import { ChatConversation, UserProfile } from '../types';

interface SidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  user,
  onOpenProfile,
  isOpen,
  onToggleSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by category
  const categories: ('Today' | 'Yesterday' | 'Previous 7 Days' | 'Older')[] = [
    'Today',
    'Yesterday',
    'Previous 7 Days',
    'Older',
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-[280px] bg-[#0B0F19] border-r border-[#1F2937] flex flex-col transition-transform duration-300 ease-in-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!isOpen ? 'lg:hidden' : 'lg:flex'}`}
      >
        {/* Brand & New Chat */}
        <div className="p-3.5 flex flex-col gap-3 border-b border-[#1F2937]/70">
          {/* Logo & Collapse */}
          <div className="flex items-center justify-between px-1.5 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-white">VibeShift</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-mono font-semibold">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Multi-Persona Studio</span>
              </div>
            </div>

            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141A29] transition-colors"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#141A29] hover:bg-[#1C2438] border border-[#232B40] hover:border-indigo-500/40 text-slate-200 hover:text-white text-xs font-semibold shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>New Vibe Shift</span>
            </div>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-[#0B0F19] border border-[#1F2937]">
              ⌘N
            </kbd>
          </button>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-4">
          {categories.map((category) => {
            const items = filteredConversations.filter(
              (c) => (c.category || 'Today') === category
            );
            if (items.length === 0) return null;

            return (
              <div key={category} className="flex flex-col gap-1">
                <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {category}
                </span>

                <div className="flex flex-col gap-0.5">
                  {items.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => onSelectConversation(conv.id)}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isActive
                            ? 'bg-[#171E30] text-white font-medium shadow-sm border border-indigo-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]/70'
                        }`}
                      >
                        {/* Active vertical glow indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-indigo-500" />
                        )}

                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <MessageSquare
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isActive ? 'text-indigo-400' : 'text-slate-500'
                            }`}
                          />
                          <span className="truncate">{conv.title}</span>
                        </div>

                        {/* Actions (delete) */}
                        <button
                          onClick={(e) => onDeleteConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all flex-shrink-0"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">
              No conversations found.
            </div>
          )}
        </div>

        {/* User Profile Section (Fixed at Bottom of Sidebar) */}
        <div className="p-3 border-t border-[#1F2937]/80 bg-[#0E1321]">
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#161D2E] transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  AR
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0E1321]" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">
                    {user.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[9px] font-bold uppercase tracking-wider">
                    {user.plan}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <Settings className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors flex-shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
