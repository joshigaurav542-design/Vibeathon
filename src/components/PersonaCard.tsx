import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Eye, 
  GitCompare, 
  ShieldCheck, 
  Briefcase, 
  HeartHandshake, 
  Scale, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PersonaOutput } from '../types';
import { computeWordDiff } from '../utils/diffAnalyzer';

interface PersonaCardProps {
  persona: PersonaOutput;
  originalDraft: string;
  onCopy: (text: string, title: string) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  originalDraft,
  onCopy,
}) => {
  const [showDiff, setShowDiff] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFacts, setShowFacts] = useState(false);

  const diffTokens = computeWordDiff(originalDraft, persona.rewrittenText);

  const handleCopy = () => {
    onCopy(persona.rewrittenText, persona.title);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color mappings based on Stitch design specs
  const COLOR_MAP: Record<string, {
    border: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    glow: string;
    accent: string;
  }> = {
    amber: {
      border: 'hover:border-amber-500/60',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/40',
      badgeText: 'text-amber-400',
      glow: 'shadow-[0_0_20px_-4px_rgba(245,158,11,0.2)]',
      accent: '#F59E0B',
    },
    emerald: {
      border: 'hover:border-emerald-500/60',
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/40',
      badgeText: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_-4px_rgba(16,185,129,0.2)]',
      accent: '#10B981',
    },
    cyan: {
      border: 'hover:border-cyan-500/60',
      badgeBg: 'bg-cyan-500/10',
      badgeBorder: 'border-cyan-500/40',
      badgeText: 'text-cyan-400',
      glow: 'shadow-[0_0_20px_-4px_rgba(6,182,212,0.2)]',
      accent: '#06B6D4',
    },
    purple: {
      border: 'hover:border-purple-500/60',
      badgeBg: 'bg-purple-500/10',
      badgeBorder: 'border-purple-500/40',
      badgeText: 'text-purple-400',
      glow: 'shadow-[0_0_20px_-4px_rgba(139,92,246,0.2)]',
      accent: '#8B5CF6',
    },
    indigo: {
      border: 'hover:border-indigo-500/60',
      badgeBg: 'bg-indigo-500/10',
      badgeBorder: 'border-indigo-500/40',
      badgeText: 'text-indigo-400',
      glow: 'shadow-[0_0_20px_-4px_rgba(99,102,241,0.2)]',
      accent: '#6366F1',
    },
    rose: {
      border: 'hover:border-rose-500/60',
      badgeBg: 'bg-rose-500/10',
      badgeBorder: 'border-rose-500/40',
      badgeText: 'text-rose-400',
      glow: 'shadow-[0_0_20px_-4px_rgba(244,63,94,0.2)]',
      accent: '#F43F5E',
    },
  };
  const colorStyles = COLOR_MAP[persona.badgeColor] ?? COLOR_MAP.amber;

  const renderIcon = () => {
    switch (persona.id) {
      case 'executive':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'peer':
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'legal':
        return <Scale className="w-3.5 h-3.5" />;
      case 'genz':
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  const wordDeltaSign = persona.deltaStats.wordCountDeltaPercent > 0 ? '+' : '';

  return (
    <article
      className={`bg-[#111827] rounded-2xl border border-[#1F2937] p-5 flex flex-col justify-between transition-all duration-200 ${colorStyles.border} ${colorStyles.glow} relative group`}
    >
      <div className="flex flex-col gap-4">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]/70">
          {/* Jewel Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${colorStyles.badgeBg} border ${colorStyles.badgeBorder} ${colorStyles.badgeText} text-xs font-semibold tracking-wide`}
          >
            {renderIcon()}
            <span>{persona.badgeLabel}</span>
          </div>

          {/* Controls: Diff Toggle Switch & Copy Button */}
          <div className="flex items-center gap-3">
            {/* Diff View / Clean View Toggle */}
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                showDiff
                  ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-300'
                  : 'bg-[#171B26] border border-[#262A35] text-slate-400 hover:text-slate-200'
              }`}
              title={showDiff ? 'Switch to Clean Copy View' : 'Switch to Word Diff View'}
            >
              {showDiff ? (
                <>
                  <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Diff View</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Clean View</span>
                </>
              )}
            </button>

            {/* Quick Copy Button */}
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg border transition-all ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#171B26] border-[#262A35] text-slate-400 hover:text-white hover:bg-[#1C1F2A]'
              }`}
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Persona Title & Description */}
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">{persona.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{persona.description}</p>
        </div>

        {/* Main Text Content: Clean View vs Word Diff View */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F2937]/80 text-sm leading-relaxed text-slate-200 min-h-[140px] flex flex-col justify-center">
          {showDiff ? (
            <div className="flex flex-wrap gap-y-1 items-baseline">
              {diffTokens.map((token, index) => {
                if (token.type === 'removed') {
                  return (
                    <del
                      key={index}
                      className="bg-rose-500/20 text-rose-300 line-through px-1.5 py-0.5 rounded font-mono text-xs mr-1.5 my-0.5"
                    >
                      {token.text}
                    </del>
                  );
                }
                if (token.type === 'added') {
                  return (
                    <ins
                      key={index}
                      className="bg-emerald-500/20 text-emerald-300 font-medium px-1.5 py-0.5 rounded no-underline mr-1.5 my-0.5"
                    >
                      {token.text}
                    </ins>
                  );
                }
                return (
                  <span key={index} className="mr-1.5">
                    {token.text}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-100 whitespace-pre-wrap">{persona.rewrittenText}</p>
          )}
        </div>
      </div>

      {/* Bottom Rewrite Delta Analytics Bar */}
      <div className="mt-4 pt-3.5 border-t border-[#1F2937]/70 flex flex-col gap-3">
        {/* Metric Badges */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded bg-[#171B26] border border-[#262A35] font-semibold ${
                persona.deltaStats.wordCountDeltaPercent < 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {wordDeltaSign}{persona.deltaStats.wordCountDeltaPercent}% Word Count
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-indigo-400 font-semibold">
              +{persona.deltaStats.vocabularyShiftPercent}% Lexical Shift
            </span>
          </div>

          <span className="text-slate-400 text-[11px]">
            ~{persona.deltaStats.readingTimeSeconds}s read
          </span>
        </div>

        {/* Tone Shift Comparison Micro-Bars */}
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-[#0B0F19]/60 p-2.5 rounded-xl border border-[#1F2937]/50">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Formality</span>
              <span className="text-slate-200">{persona.toneScores.formality}%</span>
            </div>
            <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${persona.toneScores.formality}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Empathy</span>
              <span className="text-slate-200">{persona.toneScores.empathy}%</span>
            </div>
            <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${persona.toneScores.empathy}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Clarity</span>
              <span className="text-slate-200">{persona.toneScores.clarity}%</span>
            </div>
            <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${persona.toneScores.clarity}%` }}
              />
            </div>
          </div>
        </div>

        {/* Preserved Facts Accordion / Badge */}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setShowFacts(!showFacts)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/15 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Core Facts Preserved</span>
            </div>
            {showFacts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showFacts && (
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-emerald-500/20 flex flex-col gap-1.5 animate-in fade-in duration-150">
              <span className="text-[10px] font-mono uppercase text-emerald-400/80 tracking-wider">
                Audited Core Invariants:
              </span>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                {persona.preservedFacts.map((fact, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-slate-200">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
