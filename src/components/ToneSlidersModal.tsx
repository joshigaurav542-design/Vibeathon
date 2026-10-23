import React from 'react';
import { X, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';

interface ToneSlidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  sliders: {
    formality: number;
    warmth: number;
    urgency: number;
  };
  setSliders: React.Dispatch<
    React.SetStateAction<{
      formality: number;
      warmth: number;
      urgency: number;
    }>
  >;
  onApply?: () => void;
}

export const ToneSlidersModal: React.FC<ToneSlidersModalProps> = ({
  isOpen,
  onClose,
  sliders,
  setSliders,
  onApply,
}) => {
  if (!isOpen) return null;

  const handleSliderChange = (key: 'formality' | 'warmth' | 'urgency', value: number) => {
    setSliders((prev) => ({ ...prev, [key]: value }));
  };

  const presets = [
    { label: 'Executive Brief', formality: 85, warmth: 30, urgency: 70 },
    { label: 'Empathetic Peer', formality: 40, warmth: 90, urgency: 35 },
    { label: 'P0 Incident War Room', formality: 60, warmth: 20, urgency: 95 },
    { label: 'Balanced Default', formality: 50, warmth: 50, urgency: 50 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#0F1422] border border-[#1F2937] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]/80 bg-[#13192B]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Tone Modulation Controls</h2>
              <p className="text-[11px] text-slate-400">Fine-tune weights across the 4 personas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders Content */}
        <div className="p-5 flex flex-col gap-5">
          {/* Formality Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">Formality</span>
              <span className="font-mono text-indigo-400 font-semibold">{sliders.formality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.formality}
              onChange={(e) => handleSliderChange('formality', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Casual / Conversational</span>
              <span>Boardroom Formal</span>
            </div>
          </div>

          {/* Warmth Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">Warmth & Empathy</span>
              <span className="font-mono text-emerald-400 font-semibold">{sliders.warmth}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.warmth}
              onChange={(e) => handleSliderChange('warmth', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Analytical / Detached</span>
              <span>Deeply Empathetic</span>
            </div>
          </div>

          {/* Urgency Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-200">Urgency</span>
              <span className="font-mono text-amber-400 font-semibold">{sliders.urgency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliders.urgency}
              onChange={(e) => handleSliderChange('urgency', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Relaxed / Low Priority</span>
              <span>Immediate P0 Action</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-3 border-t border-[#1F2937]/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Tone Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setSliders({
                      formality: preset.formality,
                      warmth: preset.warmth,
                      urgency: preset.urgency,
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#141A29] hover:bg-[#1C2438] border border-[#1F2937] text-left text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between"
                >
                  <span className="truncate">{preset.label}</span>
                  <Sparkles className="w-3 h-3 text-slate-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0B0F19] border-t border-[#1F2937] flex items-center justify-between">
          <button
            onClick={() => setSliders({ formality: 50, warmth: 50, urgency: 50 })}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Defaults
          </button>
          <button
            onClick={() => {
              if (onApply) onApply();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            Apply Tone Settings
          </button>
        </div>
      </div>
    </div>
  );
};
