import React from 'react';
import { ArrowRight, ShieldAlert, FileCode2, AlertTriangle, Sparkles } from 'lucide-react';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { PresetScenario } from '../types';

interface ChatEmptyStateProps {
  onSelectScenario: (scenario: PresetScenario) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectScenario }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'prod-crash':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'scope-creep':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'code-review':
        return <FileCode2 className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto select-none my-auto animate-fade-in">
      {/* Brand Icon */}
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
        <Sparkles className="w-6 h-6" />
      </div>

      {/* Brand Header */}
      <div className="flex flex-col items-center gap-1 mb-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tone Studio
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-blue-600 tracking-wide uppercase">
          (Instant Persona and Communication Transformer)
        </p>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-8 max-w-lg">
        Type or paste any raw draft, emotional Slack update, or sensitive client message below. Tone Studio simultaneously translates it into Executive, Supportive Peer, Legal, and Gen-Z tones while preserving 100% of the facts.
      </p>

      {/* Preset Scenario Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        {SAMPLE_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario)}
            className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group text-left shadow-xs"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  {getIcon(scenario.id)}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="text-xs font-bold text-slate-900 tracking-tight mt-1">
                {scenario.label}
              </span>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {scenario.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-medium text-slate-600">{scenario.vibe}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
