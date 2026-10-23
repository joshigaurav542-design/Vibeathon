import React, { useState, useRef, useEffect } from 'react';
import { 
  PanelLeft, 
  SlidersHorizontal, 
  Sparkles, 
  Copy, 
  Download, 
  RotateCcw,
  Check,
  ChevronDown,
  MessageSquare,
  Users,
  History,
  BarChart3,
  Database,
  UserCheck
} from 'lucide-react';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { PresetScenario, ActiveNavTab, UserProfile } from '../types';

interface ChatNavbarProps {
  conversationTitle: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSliders: () => void;
  sliders: {
    formality: number;
    warmth: number;
    urgency: number;
  };
  onSelectScenario: (scenario: PresetScenario) => void;
  onCopyAll: () => void;
  onExportJson: () => void;
  onResetChat: () => void;
  hasMessages: boolean;
  activeTab?: ActiveNavTab;
  onTabChange?: (tab: ActiveNavTab) => void;
  user?: UserProfile;
  onOpenLoginModal?: () => void;
}

export const ChatNavbar: React.FC<ChatNavbarProps> = ({
  conversationTitle,
  isSidebarOpen,
  onToggleSidebar,
  onOpenSliders,
  sliders,
  onSelectScenario,
  onCopyAll,
  onExportJson,
  onResetChat,
  hasMessages,
  activeTab = 'chat',
  onTabChange,
  user,
  onOpenLoginModal,
}) => {
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!showPresetsDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setShowPresetsDropdown(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPresetsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showPresetsDropdown]);

  const handleCopyClick = () => {
    onCopyAll();
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const navTabs: { id: ActiveNavTab; label: string; icon: React.ElementType }[] = [
    { id: 'chat', label: 'Studio', icon: MessageSquare },
    { id: 'personas', label: 'Personas', icon: Users },
    { id: 'history', label: 'Audit History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-20 select-none shadow-xs gap-2">
      {/* Left: Sidebar toggle + Active Chat Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate tracking-tight">
            {activeTab === 'chat' ? conversationTitle : activeTab === 'personas' ? 'Persona Studio' : activeTab === 'history' ? 'Audit History' : 'Analytics & Telemetry'}
          </h1>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Tone Studio (Instant Persona Transformer)</span>
          </div>
        </div>
      </div>

      {/* Center: Navigation Tabs */}
      {onTabChange && (
        <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Studio-specific controls */}
        {activeTab === 'chat' && (
          <>
            {/* Scenario Presets Dropdown */}
            <div className="relative" ref={presetsRef}>
              <button
                onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium shadow-xs transition-all"
                title="Load Sample Scenario"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden md:inline">Presets</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showPresetsDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs animate-fade-in"
                  onClick={() => setShowPresetsDropdown(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Preset Scenarios
                  </div>
                  {SAMPLE_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => onSelectScenario(scenario)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-900 transition-colors flex flex-col gap-0.5"
                    >
                      <span className="font-semibold text-slate-900">{scenario.label}</span>
                      <span className="text-[11px] text-slate-500 truncate">{scenario.vibe}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tone Sliders Button */}
            <button
              onClick={onOpenSliders}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium shadow-xs transition-all"
              title="Adjust Tone Sliders"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Tone</span>
              <span className="text-[10px] font-mono text-blue-700 font-bold px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200">
                {sliders.formality}/{sliders.warmth}/{sliders.urgency}
              </span>
            </button>

            {hasMessages && (
              <>
                {/* Copy All */}
                <button
                  onClick={handleCopyClick}
                  className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium shadow-xs transition-all"
                  title="Copy All 4 Personas"
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>

                {/* Export JSON */}
                <button
                  onClick={onExportJson}
                  className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium shadow-xs transition-all"
                  title="Export JSON"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export</span>
                </button>

                {/* Reset Chat */}
                <button
                  onClick={onResetChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Clear Conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </>
        )}

        {/* Database Status indicator */}
        <div 
          className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-50/80 border border-blue-200 text-[10px] text-blue-700 font-medium"
          title="Tone Studio Database Active"
        >
          <Database className="w-3 h-3 text-blue-600" />
          <span>DB Active</span>
        </div>

        {/* Account / User Switch Button */}
        {user && onOpenLoginModal && (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold transition-colors group shadow-2xs"
            title={`Active User: ${user.name} (${user.email}). Click to switch user or register.`}
          >
            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden sm:inline max-w-[85px] truncate">
              {user.name.split(' ')[0]}
            </span>
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          </button>
        )}
      </div>
    </header>
  );
};
