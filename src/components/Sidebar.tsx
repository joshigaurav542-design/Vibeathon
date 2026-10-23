import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Search, 
  Settings, 
  PanelLeftClose,
  Database,
  Users,
  History,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { ChatConversation, UserProfile, ActiveNavTab } from '../types';

interface SidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  user: UserProfile;
  onOpenProfile: () => void;
  onOpenLoginModal?: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  activeTab?: ActiveNavTab;
  onTabChange?: (tab: ActiveNavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  user,
  onOpenProfile,
  onOpenLoginModal,
  isOpen,
  onToggleSidebar,
  activeTab = 'chat',
  onTabChange,
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

  const userInitials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'TS';

  const navItems: { id: ActiveNavTab; label: string; icon: React.ElementType }[] = [
    { id: 'chat', label: 'Studio (Chat)', icon: MessageSquare },
    { id: 'personas', label: 'Personas', icon: Users },
    { id: 'history', label: 'Audit History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleSelectConv = (id: string) => {
    onSelectConversation(id);
    if (onTabChange && activeTab !== 'chat') {
      onTabChange('chat');
    }
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (onTabChange && activeTab !== 'chat') {
      onTabChange('chat');
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-[280px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out select-none shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!isOpen ? 'lg:hidden' : 'lg:flex'}`}
      >
        {/* Top Header & New Chat */}
        <div className="p-3.5 flex flex-col gap-3 border-b border-slate-100">
          {/* Header Title: Tone Studio */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                TS
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">
                  Tone Studio
                </span>
                <span className="text-[10px] text-blue-600 font-medium truncate mt-0.5">
                  Instant Persona and Communication Transformer
                </span>
              </div>
            </div>

            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChatClick}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span>New Chat</span>
            </div>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-blue-100 px-1.5 py-0.5 rounded bg-blue-700/60 border border-blue-500/40">
              ⌘N
            </kbd>
          </button>

          {/* Quick Nav Tabs */}
          {onTabChange && (
            <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-500/20 transition-all"
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
                <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {category}
                </span>

                <div className="flex flex-col gap-0.5">
                  {items.map((conv) => {
                    const isActive = conv.id === activeConversationId && activeTab === 'chat';
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConv(conv.id)}
                        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-900 font-semibold shadow-xs border border-blue-200'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-600" />
                        )}

                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <MessageSquare
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isActive ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{conv.title}</span>
                        </div>

                        {/* Actions (delete) */}
                        <button
                          onClick={(e) => onDeleteConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all flex-shrink-0"
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
            <div className="p-4 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          )}
        </div>

        {/* Database Status indicator */}
        <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5 text-blue-600">
            <Database className="w-3 h-3" />
            <span className="font-sans font-semibold">Tone Studio Database</span>
          </div>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>

        {/* User Profile Section (Fixed at Bottom of Sidebar) */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-1">
          <button
            onClick={onOpenProfile}
            className="flex-1 flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200 transition-all text-left min-w-0 group"
            title="Edit User Profile"
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {userInitials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {user.name}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-blue-100 border border-blue-200 text-blue-700 text-[9px] font-bold uppercase tracking-wider">
                  {user.plan}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 truncate">
                {user.email}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-0.5">
            {onOpenLoginModal && (
              <button
                onClick={onOpenLoginModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white transition-colors"
                title="Switch Account / Register Profile"
              >
                <UserCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onOpenProfile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
              title="Settings & Profile"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
