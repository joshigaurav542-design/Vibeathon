import React, { useState, useEffect } from 'react';
import { 
  Bot, 
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
  Volume2,
  Sparkles
} from 'lucide-react';
import { PersonaOutput, PersonaType, TransformationResult } from '../types';
import { computeWordDiff } from '../utils/diffAnalyzer';

interface ChatAssistantMessageProps {
  result: TransformationResult;
  originalDraft: string;
  onCopySingle: (text: string, title: string) => void;
  activeTab?: 'all' | PersonaType | string;
}

export const ChatAssistantMessage: React.FC<ChatAssistantMessageProps> = ({
  result,
  originalDraft,
  onCopySingle,
  activeTab = 'all',
}) => {
  const [selectedPersonaTab, setSelectedPersonaTab] = useState<'all' | PersonaType | string>(activeTab);
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

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'amber':
        return {
          tab: 'border-amber-500 text-amber-800 bg-amber-50 font-semibold',
          badge: 'bg-amber-50 text-amber-800 border-amber-300',
          accent: '#D97706',
        };
      case 'emerald':
        return {
          tab: 'border-emerald-500 text-emerald-800 bg-emerald-50 font-semibold',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          accent: '#059669',
        };
      case 'purple':
        return {
          tab: 'border-purple-500 text-purple-800 bg-purple-50 font-semibold',
          badge: 'bg-purple-50 text-purple-800 border-purple-300',
          accent: '#7C3AED',
        };
      case 'rose':
        return {
          tab: 'border-rose-500 text-rose-800 bg-rose-50 font-semibold',
          badge: 'bg-rose-50 text-rose-800 border-rose-300',
          accent: '#E11D48',
        };
      case 'cyan':
      case 'blue':
      default:
        return {
          tab: 'border-blue-500 text-blue-800 bg-blue-50 font-semibold',
          badge: 'bg-blue-50 text-blue-800 border-blue-300',
          accent: '#2563EB',
        };
    }
  };

  const getPersonaIcon = (id: string) => {
    switch (id) {
      case 'executive':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'peer':
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'legal':
        return <Scale className="w-3.5 h-3.5" />;
      case 'genz':
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
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
        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4 transition-all hover:border-slate-300"
      >
        {/* Persona Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.badge}`}>
              {getPersonaIcon(persona.id)}
              <span>{persona.badgeLabel}</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 hidden sm:inline">{persona.description}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Speech */}
            <button
              onClick={() => handleSimulateTTS(persona.rewrittenText, persona.id)}
              className={`p-1.5 rounded-lg border transition-all ${
                isAudioActive
                  ? 'bg-blue-50 border-blue-300 text-blue-700 animate-pulse'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
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
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-900">
          {showDiff ? (
            <div className="flex flex-wrap gap-y-1 items-baseline">
              {diffTokens.map((token, index) => {
                if (token.type === 'removed') {
                  return (
                    <del
                      key={index}
                      className="px-1.5 py-0.5 rounded text-rose-800 bg-rose-100/90 line-through mr-1 text-xs border border-rose-300 select-none"
                    >
                      {token.text}
                    </del>
                  );
                }
                if (token.type === 'added') {
                  return (
                    <ins
                      key={index}
                      className="px-1.5 py-0.5 rounded text-emerald-800 bg-emerald-100/90 no-underline font-medium mr-1 border border-emerald-300 shadow-xs"
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-500">
          {/* Tone Mini Bars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Formality</span>
              <span className="font-mono text-xs text-blue-700 font-bold">
                {persona.toneScores.formality}%
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Empathy</span>
              <span className="font-mono text-xs text-emerald-700 font-bold">
                {persona.toneScores.empathy}%
              </span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500">Urgency</span>
              <span className="font-mono text-xs text-amber-700 font-bold">
                {persona.toneScores.urgency}%
              </span>
            </div>
          </div>

          {/* Facts Preserved Toggle */}
          <button
            onClick={() => toggleFacts(persona.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{persona.preservedFacts.length} Facts Preserved</span>
            {isShowingFacts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Collapsible Preserved Facts List */}
        {isShowingFacts && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5 animate-fade-in text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Verified 100% Core Facts:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {persona.preservedFacts.map((fact, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium"
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
      {/* Bot Avatar (Minimal Blue & Clean, No VibeShift Logo) */}
      <div className="flex-shrink-0 pt-0.5">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
          <Bot className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Main Message Body */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Metadata Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight">AI Assistant</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
              Vibe: {result.detectedVibe}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              ({result.executionTimeMs}ms)
            </span>
          </div>

          {/* Global View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                showDiff
                  ? 'bg-blue-50 border border-blue-300 text-blue-700 font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
              }`}
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
          </div>
        </div>

        {/* Persona Tabs / Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedPersonaTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedPersonaTab === 'all'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs'
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border shadow-xs ${
                  isTabActive
                    ? styles.tab
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200'
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
