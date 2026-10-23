import React, { useState } from 'react';
import { 
  PanelLeft, 
  SlidersHorizontal, 
  Sparkles, 
  Copy, 
  Download, 
  RotateCcw,
  Check,
  ChevronDown
} from 'lucide-react';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { PresetScenario } from '../types';

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
}) => {
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyClick = () => {
    onCopyAll();
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <header className="h-14 border-b border-[#1F2937] bg-[#0B0F19]/90 backdrop-blur-md px-4 flex items-center justify-between z-20 select-none">
      {/* Left: Sidebar toggle + Active Chat Title */}
      <div className="flex items-center gap-3 min-w-0">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141A29] transition-colors"
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold text-white truncate tracking-tight">
            {conversationTitle}
          </h1>

          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Scenario Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141A29] hover:bg-[#1B2336] border border-[#232B40] text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Load Sample Scenario"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Presets</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showPresetsDropdown && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-[#0F1422] border border-[#1F2937] rounded-xl shadow-xl py-1.5 z-50 text-xs"
              onClick={() => setShowPresetsDropdown(false)}
            >
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Preset Scenarios
              </div>
              {SAMPLE_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => onSelectScenario(scenario)}
                  className="w-full text-left px-3 py-2 hover:bg-[#171E30] transition-colors flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-slate-200">{scenario.label}</span>
                  <span className="text-[11px] text-slate-400 truncate">{scenario.vibe}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tone Sliders Button */}
        <button
          onClick={onOpenSliders}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141A29] hover:bg-[#1B2336] border border-[#232B40] text-slate-300 hover:text-white text-xs font-medium transition-all"
          title="Adjust Tone Sliders"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Tone Sliders</span>
          <span className="text-[10px] font-mono text-indigo-400 font-semibold px-1 rounded bg-indigo-500/10">
            {sliders.formality}/{sliders.warmth}/{sliders.urgency}
          </span>
        </button>

        {hasMessages && (
          <>
            {/* Copy All */}
            <button
              onClick={handleCopyClick}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#141A29] hover:bg-[#1B2336] border border-[#232B40] text-slate-300 hover:text-white text-xs font-medium transition-all"
              title="Copy All 4 Personas"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy All</span>
                </>
              )}
            </button>

            {/* Export JSON */}
            <button
              onClick={onExportJson}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#141A29] hover:bg-[#1B2336] border border-[#232B40] text-slate-300 hover:text-white text-xs font-medium transition-all"
              title="Export JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export</span>
            </button>

            {/* Reset Chat */}
            <button
              onClick={onResetChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
