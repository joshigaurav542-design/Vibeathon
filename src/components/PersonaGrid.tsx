import React from 'react';
import { Layers, Copy, Download, Zap } from 'lucide-react';
import { PersonaOutput, PersonaType } from '../types';
import { PersonaCard } from './PersonaCard';

interface PersonaGridProps {
  personas: Record<PersonaType, PersonaOutput>;
  originalDraft: string;
  executionTimeMs: number;
  onCopySingle: (text: string, title: string) => void;
  onCopyAll: () => void;
  onExportJson: () => void;
}

export const PersonaGrid: React.FC<PersonaGridProps> = ({
  personas,
  originalDraft,
  executionTimeMs,
  onCopySingle,
  onCopyAll,
  onExportJson,
}) => {
  const personaKeys: PersonaType[] = ['executive', 'peer', 'legal', 'genz'];

  return (
    <section className="flex flex-col gap-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-[#111827] px-5 py-3.5 rounded-2xl border border-[#1F2937] shadow-xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Persona Transformed Outputs</h2>
              <span className="font-mono text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                Live Matrix
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400">
              4/4 Transformed in {executionTimeMs}ms · Matrix Engine v2.4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 hover:text-white text-xs font-semibold hover:bg-[#1C1F2A] transition-all"
            title="Copy All 4 Personas to Clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span>Copy All Outputs</span>
          </button>
          <button
            onClick={onExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 hover:text-white text-xs font-semibold hover:bg-[#1C1F2A] transition-all"
            title="Export full JSON payload"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* 2x2 Grid of Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {personaKeys.map((key) => {
          const persona = personas[key];
          if (!persona) return null;
          return (
            <PersonaCard
              key={key}
              persona={persona}
              originalDraft={originalDraft}
              onCopy={onCopySingle}
            />
          );
        })}
      </div>
    </section>
  );
};
