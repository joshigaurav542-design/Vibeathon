import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, FileCode2, AlertTriangle } from 'lucide-react';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { PresetScenario } from '../types';

interface ChatEmptyStateProps {
  onSelectScenario: (scenario: PresetScenario) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectScenario }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'prod-crash':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'scope-creep':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'code-review':
        return <FileCode2 className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto select-none my-auto">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 mb-4 animate-bounce-subtle">
        <Sparkles className="w-7 h-7" />
      </div>

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        What vibe would you like to shift?
      </h2>

      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8 max-w-md">
        Paste any raw draft, emotional Slack message, or difficult client update. VibeShift maps it simultaneously into Executive, Supportive Peer, Legal, and Gen-Z tones while preserving 100% of the facts.
      </p>

      {/* Preset Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        {SAMPLE_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className="p-3.5 rounded-2xl bg-[#0F1422] hover:bg-[#161D2E] border border-[#1F2937] hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-sm text-left"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-[#141A29] border border-[#232B40]">
                  {getIcon(scenario.id)}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight mt-1">
                {scenario.label}
              </span>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {scenario.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#1F2937]/60 flex items-center justify-between text-[10px] text-slate-500">
              <span>{scenario.vibe}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
