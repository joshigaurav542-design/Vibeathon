import React from 'react';
import { Edit3, RotateCcw, Sliders, Sparkles, ShieldCheck, Activity, Terminal } from 'lucide-react';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';
import { PresetScenario } from '../types';

interface InputStudioProps {
  draftText: string;
  setDraftText: (text: string) => void;
  activeScenarioId: string;
  setActiveScenarioId: (id: string) => void;
  sliders: {
    formality: number;
    warmth: number;
    urgency: number;
  };
  setSliders: React.Dispatch<React.SetStateAction<{
    formality: number;
    warmth: number;
    urgency: number;
  }>>;
  onTransform: () => void;
  isLoading: boolean;
  detectedVibe: string;
}

export const InputStudio: React.FC<InputStudioProps> = ({
  draftText,
  setDraftText,
  activeScenarioId,
  setActiveScenarioId,
  sliders,
  setSliders,
  onTransform,
  isLoading,
  detectedVibe,
}) => {
  const words = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  const chars = draftText.length;

  const handleSelectScenario = (scenario: PresetScenario) => {
    setActiveScenarioId(scenario.id);
    setDraftText(scenario.draftText);
    setSliders(scenario.defaultSliders);
  };

  const handleClear = () => {
    setDraftText('');
    setActiveScenarioId('');
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="bg-[#111827] rounded-2xl border border-[#1F2937] p-5 lg:p-6 flex flex-col gap-5 shadow-2xl shadow-black/50 relative">
        {/* Studio Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Edit3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Raw Draft Input Studio</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Paste unvarnished thoughts or select a high-stakes scenario
            </p>
          </div>
          <button
            onClick={handleClear}
            className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-[#1C1F2A] transition-colors"
            title="Clear Draft"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Preset Scenario Chips */}
        <div>
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-medium">
            Preset Scenarios
          </label>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SCENARIOS.map((scenario) => {
              const isSelected = activeScenarioId === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                      : 'bg-[#171B26] border border-[#262A35] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span>{scenario.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Multi-line Textarea */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Source Message</span>
            <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
              <Terminal className="w-3 h-3 text-indigo-400" />
              Raw Input Buffer
            </span>
          </div>
          <div className="relative rounded-xl border border-[#262A35] bg-[#0B0F19] focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <textarea
              value={draftText}
              onChange={(e) => {
                setDraftText(e.target.value);
                if (activeScenarioId) setActiveScenarioId('');
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  onTransform();
                }
              }}
              className="w-full bg-transparent p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed min-h-[170px]"
              placeholder="Paste unvarnished, blunt, or raw communication here..."
              rows={7}
            />
            {/* Subtle bottom decorative accent */}
            <div className="h-0.5 bg-gradient-to-r from-indigo-500/50 via-indigo-500/10 to-transparent w-full"></div>
          </div>
        </div>

        {/* Real-time Metadata Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#171B26] border border-[#262A35] font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-indigo-400 font-semibold">{words} words</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{chars} characters</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 font-medium">
            <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="text-[11px]">{detectedVibe}</span>
          </div>
        </div>

        {/* Fine-Tuning Tone Sliders */}
        <div className="p-4 rounded-xl bg-[#171B26]/80 border border-[#262A35] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Global Tone Modulators
            </span>
            <span className="font-mono text-[10px] text-slate-400">Real-time weights</span>
          </div>

          {/* Slider 1: Formality */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Formality Index</span>
              <span className="font-mono font-semibold text-indigo-400">{sliders.formality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.formality}
              onChange={(e) => setSliders((s) => ({ ...s, formality: Number(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              <span>Casual</span>
              <span>Balanced</span>
              <span>Strictly Diplomatic</span>
            </div>
          </div>

          {/* Slider 2: Warmth */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Warmth & Empathy</span>
              <span className="font-mono font-semibold text-emerald-400">{sliders.warmth}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.warmth}
              onChange={(e) => setSliders((s) => ({ ...s, warmth: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              <span>Direct / Objective</span>
              <span>Encouraging & Constructive</span>
            </div>
          </div>

          {/* Slider 3: Urgency */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Urgency Framing</span>
              <span className="font-mono font-semibold text-amber-400">{sliders.urgency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.urgency}
              onChange={(e) => setSliders((s) => ({ ...s, urgency: Number(e.target.value) }))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between font-mono text-[10px] text-slate-400">
              <span>Informational</span>
              <span>Immediate Priority</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button: Transform Across All Personas */}
        <button
          onClick={onTransform}
          disabled={isLoading || !draftText.trim()}
          className="w-full group relative inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm tracking-wide shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition-transform" />
          )}
          <span>{isLoading ? 'Modulating Across Personas...' : 'Transform Across All Personas ✨'}</span>
          <span className="ml-2 font-mono text-[10px] px-2 py-0.5 rounded bg-black/30 text-indigo-200 border border-indigo-400/30">
            ⌘ + Enter
          </span>
        </button>

        {/* Guardrail Guarantee Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero hallucination constraint active · 100% Core facts preserved</span>
        </div>
      </div>
    </section>
  );
};
