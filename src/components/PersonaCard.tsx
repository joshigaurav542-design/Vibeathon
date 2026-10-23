import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Eye, 
  GitCompare, 
  Briefcase, 
  HeartHandshake, 
  Scale, 
  Sparkles,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PersonaOutput, BadgeColor } from '../types';
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

  // Color mappings based on light theme design
  const getBadgeStyle = (color: BadgeColor) => {
    switch (color) {
      case 'amber':
        return {
          border: 'border-amber-200',
          badgeBg: 'bg-amber-50',
          badgeBorder: 'border-amber-200',
          badgeText: 'text-amber-800',
          accent: '#D97706',
        };
      case 'emerald':
        return {
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-50',
          badgeBorder: 'border-emerald-200',
          badgeText: 'text-emerald-800',
          accent: '#059669',
        };
      case 'cyan':
      case 'blue':
        return {
          border: 'border-blue-200',
          badgeBg: 'bg-blue-50',
          badgeBorder: 'border-blue-200',
          badgeText: 'text-blue-800',
          accent: '#2563EB',
        };
      case 'purple':
        return {
          border: 'border-purple-200',
          badgeBg: 'bg-purple-50',
          badgeBorder: 'border-purple-200',
          badgeText: 'text-purple-800',
          accent: '#7C3AED',
        };
      case 'rose':
        return {
          border: 'border-rose-200',
          badgeBg: 'bg-rose-50',
          badgeBorder: 'border-rose-200',
          badgeText: 'text-rose-800',
          accent: '#E11D48',
        };
    }
  };

  const style = getBadgeStyle(persona.badgeColor);

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
      default:
        return <UserCheck className="w-3.5 h-3.5" />;
    }
  };

  const wordDeltaSign = persona.deltaStats.wordCountDeltaPercent > 0 ? '+' : '';

  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all duration-200 relative group">
      <div className="flex flex-col gap-4">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          {/* Jewel Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${style.badgeBg} border ${style.badgeBorder} ${style.badgeText} text-xs font-semibold tracking-wide`}
          >
            {renderIcon()}
            <span>{persona.badgeLabel}</span>
          </div>

          {/* Controls: Diff Toggle Switch & Copy Button */}
          <div className="flex items-center gap-2">
            {/* Diff View / Clean View Toggle */}
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                showDiff
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title={showDiff ? 'Switch to Clean View' : 'Switch to Word Diff View'}
            >
              {showDiff ? (
                <>
                  <GitCompare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Diff View</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clean View</span>
                </>
              )}
            </button>

            {/* Quick Copy Button */}
            <button
              onClick={handleCopy}
              className={`p-1.5 rounded-lg border transition-all ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Persona Title & Description */}
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{persona.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{persona.description}</p>
        </div>

        {/* Main Text Content: Clean View vs Word Diff View */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-800 min-h-[130px] flex flex-col justify-center">
          {showDiff ? (
            <div className="flex flex-wrap gap-y-1 items-baseline">
              {diffTokens.map((token, index) => {
                if (token.type === 'removed') {
                  return (
                    <del
                      key={index}
                      className="bg-rose-100 text-rose-800 line-through px-1.5 py-0.5 rounded font-mono text-xs mr-1.5 my-0.5"
                    >
                      {token.text}
                    </del>
                  );
                }
                if (token.type === 'added') {
                  return (
                    <ins
                      key={index}
                      className="bg-emerald-100 text-emerald-800 font-medium px-1.5 py-0.5 rounded no-underline mr-1.5 my-0.5"
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
            <p className="text-slate-900 whitespace-pre-wrap">{persona.rewrittenText}</p>
          )}
        </div>
      </div>

      {/* Bottom Rewrite Delta Analytics Bar */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col gap-3">
        {/* Metric Badges */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded border font-semibold ${
                persona.deltaStats.wordCountDeltaPercent < 0 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {wordDeltaSign}{persona.deltaStats.wordCountDeltaPercent}% Word Count
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700 font-semibold">
              +{persona.deltaStats.vocabularyShiftPercent}% Lexical Shift
            </span>
          </div>

          <span className="text-slate-500 text-[11px]">
            ~{persona.deltaStats.readingTimeSeconds}s read
          </span>
        </div>

        {/* Tone Shift Comparison Micro-Bars */}
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Formality</span>
              <span className="text-slate-900 font-semibold">{persona.toneScores.formality}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${persona.toneScores.formality}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Empathy</span>
              <span className="text-slate-900 font-semibold">{persona.toneScores.empathy}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${persona.toneScores.empathy}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-500 mb-1">
              <span>Urgency</span>
              <span className="text-slate-900 font-semibold">{persona.toneScores.urgency}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${persona.toneScores.urgency}%` }}
              />
            </div>
          </div>
        </div>

        {/* Preserved Core Invariants Dropdown */}
        <div className="pt-1">
          <button
            onClick={() => setShowFacts(!showFacts)}
            className="flex items-center justify-between w-full text-[11px] text-slate-500 hover:text-slate-900 transition-colors py-1"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Audited Core Invariants ({persona.preservedFacts.length})
            </span>
            {showFacts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showFacts && (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5 text-xs text-slate-700 animate-fade-in">
              {persona.preservedFacts.map((fact, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
