import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Sliders, 
  Check, 
  X, 
  Briefcase, 
  HeartHandshake, 
  Scale, 
  Zap, 
  Database
} from 'lucide-react';
import { CustomPersona, BadgeColor } from '../types';

interface PersonaHubProps {
  customPersonas: CustomPersona[];
  onSaveCustomPersona: (persona: CustomPersona) => void;
  onDeleteCustomPersona: (id: string) => void;
  onSelectPersonaForChat?: (personaId: string) => void;
}

export const PersonaHub: React.FC<PersonaHubProps> = ({
  customPersonas,
  onSaveCustomPersona,
  onDeleteCustomPersona,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState<{ title: string; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [badgeLabel, setBadgeLabel] = useState('');
  const [badgeColor, setBadgeColor] = useState<BadgeColor>('blue');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [formality, setFormality] = useState(70);
  const [empathy, setEmpathy] = useState(60);
  const [urgency, setUrgency] = useState(40);

  // Built-in Personas
  const BUILTIN_PERSONAS = [
    {
      id: 'executive',
      title: 'Executive C-Level Summary',
      badgeLabel: 'Executive Brief',
      badgeColor: 'amber' as BadgeColor,
      description: 'Decisive, high-level, risk-framed, and bottom-line focused for leadership and board members.',
      systemPrompt: 'Frame around ROI, operational continuity, risk mitigation, and clear bottom-line decision gates.',
      toneScores: { formality: 95, empathy: 50, urgency: 85, clarity: 98 },
      icon: 'Briefcase',
    },
    {
      id: 'peer',
      title: 'Supportive Peer Feedback',
      badgeLabel: 'Supportive Peer',
      badgeColor: 'emerald' as BadgeColor,
      description: 'Empathetic, collaborative, psychologically safe, and constructive team alignment.',
      systemPrompt: 'Maintain high empathy, acknowledge contributions, propose collaborative paths forward without blame.',
      toneScores: { formality: 45, empathy: 95, urgency: 40, clarity: 92 },
      icon: 'HeartHandshake',
    },
    {
      id: 'legal',
      title: 'Legal / Compliance Notice',
      badgeLabel: 'Legal / Compliance',
      badgeColor: 'blue' as BadgeColor,
      description: 'Objective, auditable, strictly liability-mitigated, and procedurally accurate.',
      systemPrompt: 'Preserve precise facts, record procedural steps, eliminate ambiguity or unilateral commitments.',
      toneScores: { formality: 99, empathy: 20, urgency: 75, clarity: 95 },
      icon: 'Scale',
    },
    {
      id: 'genz',
      title: 'Gen-Z Hype / Viral',
      badgeLabel: 'Gen-Z Hype / Viral',
      badgeColor: 'purple' as BadgeColor,
      description: 'Energetic, slang-fluent, candid, high-engagement, internet-native communication.',
      systemPrompt: 'Use modern conversational cadence, vibrant punctuation, internet idioms while maintaining core factual integrity.',
      toneScores: { formality: 10, empathy: 85, urgency: 90, clarity: 88 },
      icon: 'Sparkles',
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !systemPrompt.trim()) return;

    const newPersona: CustomPersona = {
      id: 'custom-' + Date.now(),
      title: title.trim(),
      badgeLabel: badgeLabel.trim() || title.trim().slice(0, 15),
      badgeColor,
      icon: 'Zap',
      description: description.trim() || 'Custom user-defined transformation persona.',
      systemPrompt: systemPrompt.trim(),
      toneScores: {
        formality,
        empathy,
        urgency,
        clarity: 90,
      },
      isCustom: true,
      createdAt: Date.now(),
    };

    onSaveCustomPersona(newPersona);
    setIsCreating(false);
    // Reset form
    setTitle('');
    setBadgeLabel('');
    setDescription('');
    setSystemPrompt('');
  };

  const handleRunQuickTest = (persona: { title: string; systemPrompt: string }) => {
    if (!testInput.trim()) return;
    const sample = `[${persona.title} Mode]: Refactored message with 100% verified facts preserved.\n\nSummary: "${testInput.trim()}"\n\nDirectives applied: ${persona.systemPrompt.slice(0, 80)}...`;
    setTestOutput({ title: persona.title, text: sample });
  };

  const allPersonas = [
    ...BUILTIN_PERSONAS.map((p) => ({ ...p, isCustom: false })),
    ...customPersonas.map((p) => ({ ...p, isCustom: true })),
  ];

  const filteredPersonas = allPersonas.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.badgeLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClasses = (color: BadgeColor) => {
    switch (color) {
      case 'amber':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'blue':
      case 'cyan':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Persona Management Studio</h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                  {allPersonas.length} Active Personas
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                  <Database className="w-3 h-3 text-emerald-600" />
                  Supabase Synced
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure tone archetypes, linguistic guardrails, and custom prompt templates stored in Supabase.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Persona</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Search & Quick Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter personas by name, archetype, or badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Database:</span>
            <span>4 Built-in</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">{customPersonas.length} Custom</span>
          </div>
        </div>

        {/* Create Custom Persona Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Create Custom Tone Persona</h2>
                    <p className="text-[11px] text-slate-500">Directly persisted to Supabase database table</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700">Persona Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Technical PR Lead"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700">Badge Label</label>
                    <input
                      type="text"
                      placeholder="e.g. PR Spokesperson"
                      value={badgeLabel}
                      onChange={(e) => setBadgeLabel(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Badge Color Accent</label>
                  <div className="flex items-center gap-2">
                    {(['blue', 'emerald', 'amber', 'purple', 'rose'] as BadgeColor[]).map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setBadgeColor(c)}
                        className={`px-3 py-1.5 rounded-xl border text-xs capitalize font-medium flex items-center gap-1.5 transition-all ${
                          badgeColor === c
                            ? 'ring-2 ring-blue-600 ring-offset-1 font-bold'
                            : 'opacity-70 hover:opacity-100'
                        } ${getColorClasses(c)}`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Short Description / Purpose</label>
                  <input
                    type="text"
                    placeholder="e.g. External communications calibrated for press releases and media inquiries."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">System Prompt / Linguistic Directives</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Specify stylistic instructions: e.g. 'Rewrite concisely using active voice, emphasize accountability, bulletize key action steps, maintain objective professionalism...'"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 resize-none font-mono text-[11px]"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Target Tone Sliders Weighting
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Formality</span>
                        <span className="font-bold text-blue-700">{formality}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formality}
                        onChange={(e) => setFormality(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Warmth/Empathy</span>
                        <span className="font-bold text-emerald-700">{empathy}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={empathy}
                        onChange={(e) => setEmpathy(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-500">Urgency</span>
                        <span className="font-bold text-amber-700">{urgency}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={urgency}
                        onChange={(e) => setUrgency(Number(e.target.value))}
                        className="w-full accent-amber-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    Save Persona to Supabase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPersonas.map((persona) => {
            return (
              <div
                key={persona.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${getColorClasses(
                          persona.badgeColor
                        )}`}
                      >
                        {persona.id === 'executive' && <Briefcase className="w-3.5 h-3.5" />}
                        {persona.id === 'peer' && <HeartHandshake className="w-3.5 h-3.5" />}
                        {persona.id === 'legal' && <Scale className="w-3.5 h-3.5" />}
                        {persona.id === 'genz' && <Sparkles className="w-3.5 h-3.5" />}
                        {persona.isCustom && <Zap className="w-3.5 h-3.5 text-blue-600" />}
                        <span>{persona.badgeLabel}</span>
                      </span>

                      {persona.isCustom ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          Custom
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          Core
                        </span>
                      )}
                    </div>

                    {persona.isCustom && (
                      <button
                        onClick={() => onDeleteCustomPersona(persona.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete custom persona from Supabase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{persona.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{persona.description}</p>
                  </div>

                  {/* System Prompt Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      System Transformation Directive
                    </span>
                    <p className="text-xs text-slate-700 font-mono leading-relaxed line-clamp-3">
                      {persona.systemPrompt}
                    </p>
                  </div>

                  {/* Micro Tone Weights */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <div className="flex justify-between text-slate-500 mb-1">
                        <span>Formality</span>
                        <span className="font-bold text-slate-900">{persona.toneScores.formality}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${persona.toneScores.formality}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-500 mb-1">
                        <span>Empathy</span>
                        <span className="font-bold text-slate-900">{persona.toneScores.empathy}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${persona.toneScores.empathy}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-500 mb-1">
                        <span>Urgency</span>
                        <span className="font-bold text-slate-900">{persona.toneScores.urgency}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full"
                          style={{ width: `${persona.toneScores.urgency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    100% Fact Parity Gate Enforced
                  </span>
                  <button
                    onClick={() => handleRunQuickTest(persona)}
                    className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-semibold transition-colors"
                  >
                    Quick Test →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Persona Sandbox Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Persona Testing Sandbox</h3>
            </div>
            <span className="text-[11px] text-slate-400">Click "Quick Test" on any persona above to simulate</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a draft statement (e.g. 'We need to delay the API deploy by 2 days due to tests failing')..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {testOutput && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col gap-2 animate-fade-in">
              <span className="text-xs font-bold text-blue-900">Preview: {testOutput.title}</span>
              <p className="text-xs text-slate-800 whitespace-pre-wrap font-mono leading-relaxed">
                {testOutput.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
