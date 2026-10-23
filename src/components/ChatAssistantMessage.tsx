import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  HeartHandshake, 
  Scale, 
  LayoutGrid, 
  Copy, 
  Check, 
  GitCompare, 
  Eye, 
  ShieldCheck, 
  ChevronDown,
  ChevronUp,
  Volume2
} from 'lucide-react';
import { PersonaOutput, PersonaType, TransformationResult } from '../types';
import { computeWordDiff } from '../utils/diffAnalyzer';

interface ChatAssistantMessageProps {
  result: TransformationResult;
  originalDraft: string;
  onCopySingle: (text: string, title: string) => void;
  activeTab?: 'all' | PersonaType;
}

export const ChatAssistantMessage: React.FC<ChatAssistantMessageProps> = ({
  result,
  originalDraft,
  onCopySingle,
  activeTab = 'all',
}) => {
  const [selectedPersonaTab, setSelectedPersonaTab] = useState<'all' | PersonaType>(activeTab);
  const [showDiff, setShowDiff] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showFactsMap, setShowFactsMap] = useState<Record<string, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  // Cancel speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = (text: string, title: string, key: string) => {
    onCopySingle(text, title);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateTTS = (text: string, key: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio === key) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.onend = () => setIsPlayingAudio(null);
      utterance.onerror = () => setIsPlayingAudio(null);
      setIsPlayingAudio(key);
      window.speechSynthesis.speak(utterance);
    } else {
      if (isPlayingAudio === key) {
        setIsPlayingAudio(null);
        return;
      }
      setIsPlayingAudio(key);
      setTimeout(() => setIsPlayingAudio(null), 1500);
    }
  };

  const toggleFacts = (personaId: string) => {
    setShowFactsMap((prev) => ({ ...prev, [personaId]: !prev[personaId] }));
  };

  const personasList = Object.values(result.personas);

  const getBadgeStyle = (color: 'amber' | 'emerald' | 'cyan' | 'purple') => {
    switch (color) {
      case 'amber':
        return {
          tab: 'border-amber-500/50 text-amber-400 bg-amber-500/10',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          accent: '#F59E0B',
        };
      case 'emerald':
        return {
          tab: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          accent: '#10B981',
        };
      case 'cyan':
        return {
          tab: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          accent: '#06B6D4',
        };
      case 'purple':
        return {
          tab: 'border-purple-500/50 text-purple-400 bg-purple-500/10',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          accent: '#8B5CF6',
        };
    }
  };

  const getPersonaIcon = (id: PersonaType) => {
    switch (id) {
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

  const renderPersonaContent = (persona: PersonaOutput) => {
    const diffTokens = computeWordDiff(originalDraft, persona.rewrittenText);
    const styles = getBadgeStyle(persona.badgeColor);
    const isCopied = copiedKey === persona.id;
    const isShowingFacts = !!showFactsMap[persona.id];
    const isAudioActive = isPlayingAudio === persona.id;

    return (
      <div 
        key={persona.id}
        className="p-5 rounded-2xl bg-[#111827] border border-[#1F2937] flex flex-col gap-4 transition-all hover:border-[#374151]"
      >
        {/* Persona Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]/70">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.badge}`}>
              {getPersonaIcon(persona.id)}
              <span>{persona.badgeLabel}</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-400 hidden sm:inline">{persona.description}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Speech */}
            <button
              onClick={() => handleSimulateTTS(persona.rewrittenText, persona.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                isAudioActive
                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 animate-pulse'
                  : 'bg-[#161D2E] border-[#222C42] text-slate-400 hover:text-white'
              }`}
              title="Read aloud"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Quick Copy */}
            <button
              onClick={() => handleCopy(persona.rewrittenText, persona.title, persona.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isCopied
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#161D2E] border-[#222C42] text-slate-300 hover:text-white hover:bg-[#1D273D]'
              }`}
              title="Copy rewrite"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rewritten Text / Diff View */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-[#1F2937]/80 text-sm leading-relaxed text-slate-200">
          {showDiff ? (
            <div className="flex flex-wrap gap-y-1 items-baseline">
              {diffTokens.map((token, index) => {
                if (token.type === 'removed') {
                  return (
                    <del
                      key={index}
                      className="px-1.5 py-0.5 rounded text-rose-300 bg-rose-500/20 line-through mr-1 text-xs select-none"
                    >
                      {token.text}
                    </del>
                  );
                }
                if (token.type === 'added') {
                  return (
                    <ins
                      key={index}
                      className="px-1.5 py-0.5 rounded text-emerald-300 bg-emerald-500/20 no-underline font-medium mr-1 shadow-sm"
                    >
                      {token.text}
                    </ins>
                  );
                }
                return (
                  <span key={index} className="mr-1">
                    {token.text}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{persona.rewrittenText}</p>
          )}
        </div>

        {/* Tone Scores & Delta Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-400">
          {/* Tone Mini Bars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Formality</span>
              <span className="font-mono text-xs text-indigo-400 font-semibold">
                {persona.toneScores.formality}%
              </span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Empathy</span>
              <span className="font-mono text-xs text-emerald-400 font-semibold">
                {persona.toneScores.empathy}%
              </span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Urgency</span>
              <span className="font-mono text-xs text-amber-400 font-semibold">
                {persona.toneScores.urgency}%
              </span>
            </div>
          </div>

          {/* Facts Preserved Toggle */}
          <button
            onClick={() => toggleFacts(persona.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141A29] hover:bg-[#1B2336] border border-[#232B40] text-[11px] text-slate-300 hover:text-white transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{persona.preservedFacts.length} Facts Preserved</span>
            {isShowingFacts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Collapsible Preserved Facts List */}
        {isShowingFacts && (
          <div className="p-3 rounded-xl bg-[#0E1321] border border-[#1F2937] flex flex-col gap-1.5 animate-fade-in text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Verified 100% Core Facts:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {persona.preservedFacts.map((fact, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]"
                >
                  ✓ {fact}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-3 sm:gap-4 max-w-5xl w-full">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Main Message Body */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Metadata Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">VibeShift AI</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#171E30] border border-[#252E44] text-slate-300 font-medium">
              Vibe: {result.detectedVibe}
            </span>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              ({result.executionTimeMs}ms)
            </span>
          </div>

          {/* Global View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                showDiff
                  ? 'bg-indigo-500/15 border border-indigo-500/40 text-indigo-300'
                  : 'bg-[#141A29] border border-[#232B40] text-slate-400 hover:text-slate-200'
              }`}
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
          </div>
        </div>

        {/* Persona Tabs / Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedPersonaTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedPersonaTab === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-[#141A29] hover:bg-[#1C2438] text-slate-400 hover:text-slate-200 border border-[#232B40]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Personas (Grid)</span>
          </button>

          {personasList.map((p) => {
            const isTabActive = selectedPersonaTab === p.id;
            const styles = getBadgeStyle(p.badgeColor);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPersonaTab(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                  isTabActive
                    ? styles.tab
                    : 'bg-[#141A29] hover:bg-[#1C2438] text-slate-400 hover:text-slate-200 border-[#232B40]'
                }`}
              >
                {getPersonaIcon(p.id)}
                <span>{p.badgeLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Output Area: Grid or Single Tab */}
        {selectedPersonaTab === 'all' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
            {personasList.map((p) => renderPersonaContent(p))}
          </div>
        ) : (
          <div className="mt-1">
            {renderPersonaContent(result.personas[selectedPersonaTab])}
          </div>
        )}
      </div>
    </div>
  );
};
