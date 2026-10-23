import React from 'react';
import { Sparkles, History, BarChart3, Users, Sliders, Bell, HelpCircle } from 'lucide-react';
import { IS_API_KEY_CONFIGURED } from '../config/aiConfig';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-[#0F131D]/85 backdrop-blur-md sticky top-0 z-50 border-b border-[#1F2937]/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Live Indicator */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={onReset}
            className="flex items-center gap-2.5 group focus:outline-none"
            title="Reload Tone Studio"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 border border-blue-500/40 flex items-center justify-center text-white group-hover:scale-105 transition-all duration-200 shadow-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Tone <span className="text-blue-400">Studio</span>
              </span>
              <span className="font-mono text-[10px] bg-[#1C1F2A] text-slate-400 px-1.5 py-0.5 rounded border border-[#313540]">
                (Instant Persona Transformer)
              </span>
            </div>
          </button>

          {/* Glowing Green Live AI Ready Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] text-emerald-400 tracking-wider uppercase font-semibold">
              Live AI Ready
            </span>
          </div>

          {/* Model Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#171B26] border border-[#262A35] text-[11px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>{IS_API_KEY_CONFIGURED ? 'Gemini 2.5 Flash' : 'Instant Neural Engine'}</span>
          </div>
        </div>

        {/* Center: Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button className="text-indigo-400 font-semibold border-b-2 border-indigo-400 pb-1 px-3 py-1 text-xs flex items-center gap-1.5 bg-indigo-500/10 rounded-t-lg">
            <Sliders className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
          <button className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1.5 hover:bg-[#1C1F2A] rounded-lg px-3 py-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Personas</span>
          </button>
          <button className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1.5 hover:bg-[#1C1F2A] rounded-lg px-3 py-1.5">
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
          <button className="text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1.5 hover:bg-[#1C1F2A] rounded-lg px-3 py-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </nav>

        {/* Right: Workspace & Presets */}
        <div className="flex items-center gap-2.5">
          {/* Preset Tone Pack Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#171B26] border border-[#262A35] text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Enterprise Tone Pack</span>
          </div>

          {/* Workspace Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1F2937] text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Workspace:</span>
            <span className="text-white font-medium">Acme Corp</span>
          </div>

          <div className="flex items-center gap-1 border-l border-[#1F2937] pl-2.5 text-slate-400">
            <button className="p-1.5 rounded-lg hover:text-white hover:bg-[#1C1F2A] transition-colors" title="Notifications">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:text-white hover:bg-[#1C1F2A] transition-colors" title="Documentation">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full ring-2 ring-indigo-500/40 overflow-hidden bg-[#1C1F2A] flex items-center justify-center font-bold text-xs text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            <span>GJ</span>
          </div>
        </div>
      </div>
    </header>
  );
};
