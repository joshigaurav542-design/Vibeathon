import React, { useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  SlidersHorizontal, 
  Sparkles 
} from 'lucide-react';
import { PresetScenario } from '../types';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

interface ChatInputProps {
  draftText: string;
  setDraftText: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onOpenSliders: () => void;
  sliders: {
    formality: number;
    warmth: number;
    urgency: number;
  };
  onSelectScenario: (scenario: PresetScenario) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  draftText,
  setDraftText,
  onSend,
  isLoading,
  onOpenSliders,
  sliders,
  onSelectScenario,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [draftText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (draftText.trim() && !isLoading) {
        onSend();
      }
    }
  };

  const wordCount = draftText.trim() ? draftText.trim().split(/\s+/).length : 0;
  const charCount = draftText.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2 select-none">
      {/* Container Box */}
      <div className="relative rounded-2xl bg-white border border-slate-300 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-md transition-all flex flex-col p-3 gap-2">
        {/* Quick Tone Indicator Pill */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 border-b border-slate-100 pb-2">
          <button
            onClick={onOpenSliders}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors py-0.5"
            title="Click to adjust tone sliders"
          >
            <SlidersHorizontal className="w-3 h-3 text-blue-600" />
            <span className="font-medium">Tone Weights:</span>
            <span className="font-mono text-blue-700 font-bold">
              Formality {sliders.formality}%
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-emerald-700 font-bold">
              Warmth {sliders.warmth}%
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-amber-700 font-bold">
              Urgency {sliders.urgency}%
            </span>
          </button>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste or type raw draft (e.g., an outage update, frank PR review, or scope pushback)..."
          rows={2}
          className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 resize-none focus:outline-none leading-relaxed px-1 min-h-[50px] max-h-[180px]"
        />

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pr-2 scrollbar-none">
            {SAMPLE_SCENARIOS.slice(0, 2).map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onSelectScenario(scenario)}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>{scenario.label}</span>
              </button>
            ))}
          </div>

          {/* Right Action: Send Button */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="hidden md:inline text-[10px] text-slate-400 flex items-center gap-1">
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[9px] text-slate-600">
                Enter ↵
              </kbd>
            </span>

            <button
              onClick={onSend}
              disabled={!draftText.trim() || isLoading}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                draftText.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 cursor-pointer hover:scale-105'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }`}
              title="Transform draft"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center mt-2 text-[11px] text-slate-400">
        Deterministic linguistic modulation • 100% core facts preserved • Multi-Persona Matrix
      </div>
    </div>
  );
};
