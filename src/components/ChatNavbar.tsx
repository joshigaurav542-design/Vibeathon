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
  Database,
  Users,
  ShieldCheck,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { PresetScenario, ActiveView } from '../types';

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
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
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
  activeView,
  onSelectView,
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

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none shadow-xs">
      {/* Left: Sidebar toggle + Active Chat Title / View */}
      <div className="flex items-center gap-3 min-w-0">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-bold text-slate-900 truncate tracking-tight">
            {activeView === 'studio' && conversationTitle}
            {activeView === 'personas' && 'Personas Management Hub'}
            {activeView === 'audit' && 'AI Governance & Parity Audit'}
            {activeView === 'analytics' && 'Tone Dynamics & Telemetry'}
          </h1>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Gemini 2.5 Flash</span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
            <Database className="w-3 h-3 text-emerald-600" />
            <span>Supabase Connected</span>
          </div>
        </div>
      </div>

      {/* Center: Navigation Tabs (Matched Clean Modern Light Styling) */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
        <button
          onClick={() => onSelectView('studio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'studio'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Studio</span>
        </button>

        <button
          onClick={() => onSelectView('personas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'personas'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Personas</span>
        </button>

        <button
          onClick={() => onSelectView('audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'audit'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Audit History</span>
        </button>

        <button
          onClick={() => onSelectView('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'analytics'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </button>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {activeView === 'studio' && (
          <>
            {/* Scenario Presets Dropdown */}
            <div className="relative" ref={presetsRef}>
              <button
                onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium shadow-xs transition-all"
                title="Load Sample Scenario"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden lg:inline">Presets</span>
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
              <span className="hidden sm:inline">Sliders</span>
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
      </div>
    </header>
  );
};
