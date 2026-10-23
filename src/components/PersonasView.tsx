import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Sliders,
  Trash2,
  Copy,
  Edit2,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  Briefcase,
  HeartHandshake,
  Scale,
  X,
} from 'lucide-react';
import { BadgeColor, PersonaDefinition, ToneScores } from '../types';
import {
  createCustomPersona,
  deleteCustomPersona,
  duplicatePersona,
  togglePersonaSelection,
  updateCustomPersona,
} from '../services/personaStorage';

interface PersonasViewProps {
  personas: PersonaDefinition[];
  onPersonasChange: () => void;
  onNavigateToStudio: () => void;
  triggerToast: (msg: string) => void;
}

export const PersonasView: React.FC<PersonasViewProps> = ({
  personas,
  onPersonasChange,
  onNavigateToStudio,
  triggerToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'builtin' | 'custom' | 'active'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBadgeLabel, setFormBadgeLabel] = useState('');
  const [formBadgeColor, setFormBadgeColor] = useState<BadgeColor>('indigo');
  const [formDescription, setFormDescription] = useState('');
  const [formAudience, setFormAudience] = useState('');
  const [formCharacteristics, setFormCharacteristics] = useState('');
  const [formUseCases, setFormUseCases] = useState('');
  const [formTone, setFormTone] = useState<ToneScores>({
    formality: 70,
    empathy: 60,
    urgency: 50,
    clarity: 85,
  });
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered Personas
  const filteredPersonas = personas.filter((p) => {
    // Tab filter
    if (activeFilter === 'builtin' && !p.isBuiltIn) return false;
    if (activeFilter === 'custom' && p.isBuiltIn) return false;
    if (activeFilter === 'active' && !p.selectedForStudio) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchAudience = p.audience.toLowerCase().includes(q);
      const matchUseCases = p.useCases.some((u) => u.toLowerCase().includes(q));
      return matchName || matchDesc || matchAudience || matchUseCases;
    }

    return true;
  });

  const activeCount = personas.filter((p) => p.selectedForStudio).length;

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormName('');
    setFormBadgeLabel('');
    setFormBadgeColor('indigo');
    setFormDescription('');
    setFormAudience('');
    setFormCharacteristics('');
    setFormUseCases('');
    setFormTone({ formality: 70, empathy: 60, urgency: 50, clarity: 85 });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: PersonaDefinition) => {
    if (p.isBuiltIn) {
      triggerToast('Built-in personas are protected from direct edits. You can duplicate them instead.');
      return;
    }
    setModalMode('edit');
    setEditingId(p.id);
    setFormName(p.name);
    setFormBadgeLabel(p.badgeLabel);
    setFormBadgeColor(p.badgeColor);
    setFormDescription(p.description);
    setFormAudience(p.audience);
    setFormCharacteristics(p.toneCharacteristics);
    setFormUseCases(p.useCases.join(', '));
    setFormTone({ ...p.defaultTone });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Persona name is required.');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Description is required.');
      return;
    }

    const useCasesList = formUseCases
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (modalMode === 'create') {
        createCustomPersona({
          name: formName.trim(),
          badgeLabel: formBadgeLabel.trim() || formName.trim(),
          badgeColor: formBadgeColor,
          description: formDescription.trim(),
          audience: formAudience.trim() || 'General Audience',
          toneCharacteristics: formCharacteristics.trim() || 'Tailored communication profile',
          useCases: useCasesList.length > 0 ? useCasesList : ['General communication'],
          defaultTone: formTone,
        });
        triggerToast(`Created custom persona "${formName.trim()}"`);
      } else if (modalMode === 'edit' && editingId) {
        updateCustomPersona(editingId, {
          name: formName.trim(),
          badgeLabel: formBadgeLabel.trim() || formName.trim(),
          badgeColor: formBadgeColor,
          description: formDescription.trim(),
          audience: formAudience.trim() || 'General Audience',
          toneCharacteristics: formCharacteristics.trim() || 'Tailored communication profile',
          useCases: useCasesList.length > 0 ? useCasesList : ['General communication'],
          defaultTone: formTone,
        });
        triggerToast(`Updated persona "${formName.trim()}"`);
      }

      setIsModalOpen(false);
      onPersonasChange();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save persona.');
    }
  };

  const handleDuplicate = (p: PersonaDefinition) => {
    const dup = duplicatePersona(p.id);
    if (dup) {
      triggerToast(`Duplicated into "${dup.name}"`);
      onPersonasChange();
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingId) return;
    try {
      deleteCustomPersona(deletingId);
      triggerToast('Custom persona deleted');
      setDeletingId(null);
      onPersonasChange();
    } catch (err: any) {
      triggerToast(err.message || 'Error deleting persona');
    }
  };

  const handleToggleSelection = (id: string) => {
    togglePersonaSelection(id);
    onPersonasChange();
  };

  const renderIcon = (id: string) => {
    switch (id) {
      case 'executive':
        return <Briefcase className="w-4 h-4" />;
      case 'peer':
        return <HeartHandshake className="w-4 h-4" />;
      case 'legal':
        return <Scale className="w-4 h-4" />;
      case 'genz':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Sliders className="w-4 h-4" />;
    }
  };

  const badgeColorMap: Record<BadgeColor, { bg: string; border: string; text: string; dot: string }> = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-400', dot: 'bg-cyan-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', text: 'text-purple-400', dot: 'bg-purple-400' },
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/40', text: 'text-indigo-400', dot: 'bg-indigo-400' },
    rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400', dot: 'bg-rose-400' },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-2 border-b border-[#1F2937]/60">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Persona Registry & Management</span>
            <span className="font-mono text-xs text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 uppercase font-semibold">
              {activeCount} Active in Studio
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure linguistic archetypes, audience constraints, and target tone vectors.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onNavigateToStudio}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.35)] transition-all"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-3.5 py-1.5 rounded-xl bg-[#171B26] border border-indigo-500/40 text-indigo-300 hover:text-white hover:bg-indigo-500/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Create Custom Persona</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-[#111827] p-3.5 rounded-2xl border border-[#1F2937]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search personas by name, audience, or use case..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                : 'bg-[#171B26] text-slate-400 hover:text-white border border-[#262A35]'
            }`}
          >
            All ({personas.length})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-[#171B26] text-slate-400 hover:text-white border border-[#262A35]'
            }`}
          >
            Active in Studio ({activeCount})
          </button>
          <button
            onClick={() => setActiveFilter('builtin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === 'builtin'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-[#171B26] text-slate-400 hover:text-white border border-[#262A35]'
            }`}
          >
            Built-In ({personas.filter((p) => p.isBuiltIn).length})
          </button>
          <button
            onClick={() => setActiveFilter('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === 'custom'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'bg-[#171B26] text-slate-400 hover:text-white border border-[#262A35]'
            }`}
          >
            Custom ({personas.filter((p) => !p.isBuiltIn).length})
          </button>
        </div>
      </div>

      {/* Persona Cards Grid */}
      {filteredPersonas.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#1F2937] bg-[#111827]/40 flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-300">No personas match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Try adjusting your search query or filter tags, or create a brand-new custom persona.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
          >
            Create Custom Persona
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPersonas.map((persona) => {
            const badge = badgeColorMap[persona.badgeColor] || badgeColorMap.indigo;
            const isSelected = persona.selectedForStudio;

            return (
              <article
                key={persona.id}
                className={`bg-[#111827] rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 relative group ${
                  isSelected
                    ? 'border-indigo-500/40 shadow-[0_0_20px_-4px_rgba(99,102,241,0.25)]'
                    : 'border-[#1F2937] hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1F2937]/70">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${badge.bg} border ${badge.border} flex items-center justify-center ${badge.text}`}>
                        {renderIcon(persona.id)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-tight">{persona.name}</h3>
                          {persona.isBuiltIn ? (
                            <span className="font-mono text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5" title="Protected Built-In Persona">
                              <Lock className="w-2.5 h-2.5" />
                              System
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono ${badge.text}`}>
                          {persona.badgeLabel}
                        </span>
                      </div>
                    </div>

                    {/* Studio Active Toggle */}
                    <button
                      onClick={() => handleToggleSelection(persona.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-[#171B26] text-slate-500 border border-[#262A35] hover:text-slate-300'
                      }`}
                      title={isSelected ? 'Active in Studio. Click to disable.' : 'Inactive in Studio. Click to enable.'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span>{isSelected ? 'Studio Active' : 'Excluded'}</span>
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[38px]">
                    {persona.description}
                  </p>

                  {/* Target Audience & Characteristics */}
                  <div className="bg-[#171B26] p-3 rounded-xl border border-[#262A35] flex flex-col gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                        Target Audience
                      </span>
                      <p className="text-xs text-slate-300 font-medium">{persona.audience}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">
                        Tone Vector
                      </span>
                      <p className="text-xs text-indigo-300 font-medium">{persona.toneCharacteristics}</p>
                    </div>
                  </div>

                  {/* Default Tone Scores */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                      Baseline Tone Profile
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-[#171B26]/80 px-2 py-1 rounded border border-[#262A35] flex justify-between">
                        <span className="text-slate-400">Formality</span>
                        <span className="text-indigo-300 font-bold">{persona.defaultTone.formality}%</span>
                      </div>
                      <div className="bg-[#171B26]/80 px-2 py-1 rounded border border-[#262A35] flex justify-between">
                        <span className="text-slate-400">Empathy</span>
                        <span className="text-emerald-300 font-bold">{persona.defaultTone.empathy}%</span>
                      </div>
                      <div className="bg-[#171B26]/80 px-2 py-1 rounded border border-[#262A35] flex justify-between">
                        <span className="text-slate-400">Urgency</span>
                        <span className="text-amber-300 font-bold">{persona.defaultTone.urgency}%</span>
                      </div>
                      <div className="bg-[#171B26]/80 px-2 py-1 rounded border border-[#262A35] flex justify-between">
                        <span className="text-slate-400">Clarity</span>
                        <span className="text-cyan-300 font-bold">{persona.defaultTone.clarity}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Use Cases Chips */}
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1.5">
                      Recommended Use Cases
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.useCases.map((uc, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#1C1F2A] border border-[#2B303C] text-[10px] text-slate-400 font-medium"
                        >
                          {uc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#1F2937]/70">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(persona)}
                      className="p-1.5 rounded-lg bg-[#171B26] border border-[#262A35] text-slate-400 hover:text-white hover:bg-[#1C1F2A] transition-colors"
                      title="Duplicate persona"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {!persona.isBuiltIn && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(persona)}
                          className="p-1.5 rounded-lg bg-[#171B26] border border-[#262A35] text-slate-400 hover:text-white hover:bg-[#1C1F2A] transition-colors"
                          title="Edit persona details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(persona.id)}
                          className="p-1.5 rounded-lg bg-[#171B26] border border-[#262A35] text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
                          title="Delete custom persona"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (!persona.selectedForStudio) {
                        handleToggleSelection(persona.id);
                      }
                      onNavigateToStudio();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>Use in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit Custom Persona Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  {modalMode === 'create' ? 'Create Custom Persona' : 'Edit Custom Persona'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1C1F2A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Persona Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Empathetic Product Manager"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Product Lead"
                    value={formBadgeLabel}
                    onChange={(e) => setFormBadgeLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Badge Color Accent
                </label>
                <div className="flex items-center gap-3">
                  {(['indigo', 'purple', 'emerald', 'amber', 'cyan', 'rose'] as BadgeColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormBadgeColor(c)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        badgeColorMap[c].bg
                      } ${formBadgeColor === c ? 'border-white scale-110 shadow-lg' : badgeColorMap[c].border}`}
                    >
                      <span className={`w-3 h-3 rounded-full ${badgeColorMap[c].dot}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain the persona's perspective and modulation goals..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cross-Functional Teams, Stakeholders"
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Tone Vector Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High Empathy, Structured Clarity"
                    value={formCharacteristics}
                    onChange={(e) => setFormCharacteristics(e.target.value)}
                    className="w-full px-3 py-2 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Use Cases (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Roadmap trade-offs, Blocker syncs, Feature launch emails"
                  value={formUseCases}
                  onChange={(e) => setFormUseCases(e.target.value)}
                  className="w-full px-3 py-2 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Baseline Tone Sliders */}
              <div className="p-3.5 rounded-xl bg-[#171B26] border border-[#262A35] flex flex-col gap-3">
                <span className="text-[11px] font-mono uppercase text-slate-300 font-semibold block">
                  Baseline Tone Sliders (0 - 100%)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Formality</span>
                      <span className="font-mono text-indigo-400 font-semibold">{formTone.formality}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formTone.formality}
                      onChange={(e) => setFormTone({ ...formTone, formality: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Empathy</span>
                      <span className="font-mono text-emerald-400 font-semibold">{formTone.empathy}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formTone.empathy}
                      onChange={(e) => setFormTone({ ...formTone, empathy: Number(e.target.value) })}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Urgency</span>
                      <span className="font-mono text-amber-400 font-semibold">{formTone.urgency}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formTone.urgency}
                      onChange={(e) => setFormTone({ ...formTone, urgency: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Clarity</span>
                      <span className="font-mono text-cyan-400 font-semibold">{formTone.clarity}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={formTone.clarity}
                      onChange={(e) => setFormTone({ ...formTone, clarity: Number(e.target.value) })}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25"
                >
                  {modalMode === 'create' ? 'Create Persona' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Custom Persona?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This action cannot be undone. Custom outputs associated with this persona will remain in history logs.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                Delete Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
