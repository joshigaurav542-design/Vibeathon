import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  Trash2,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronRight,
  GitCompare,
  ArrowUpDown,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import { TransformationRecord, PersonaOutput } from '../types';
import {
  clearAllHistory,
  deleteHistoryRecord,
  filterHistoryRecords,
  HistoryFilterOptions,
} from '../services/historyStorage';
import { computeWordDiff } from '../utils/diffAnalyzer';

interface HistoryViewProps {
  historyRecords: TransformationRecord[];
  onHistoryChange: () => void;
  onRestoreToStudio: (record: TransformationRecord) => void;
  triggerToast: (msg: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyRecords,
  onHistoryChange,
  onRestoreToStudio,
  triggerToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersonaFilter, setSelectedPersonaFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Selected Record Modal
  const [activeRecord, setActiveRecord] = useState<TransformationRecord | null>(null);
  const [activePersonaKey, setActivePersonaKey] = useState<string>('');
  const [showDiff, setShowDiff] = useState(true);

  // Restore Confirmation Modal
  const [recordToRestore, setRecordToRestore] = useState<TransformationRecord | null>(null);

  // Clear All Confirmation Modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Copy tracking
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filterOptions: HistoryFilterOptions = {
    query: searchQuery,
    personaId: selectedPersonaFilter,
    dateRange: selectedDateFilter,
    sortOrder,
  };

  const filteredRecords = filterHistoryRecords(historyRecords, filterOptions);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerToast('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryRecord(id);
    triggerToast('Record deleted from history');
    if (activeRecord?.id === id) {
      setActiveRecord(null);
    }
    onHistoryChange();
  };

  const handleClearAll = () => {
    clearAllHistory();
    triggerToast('All history records cleared');
    setIsClearModalOpen(false);
    setActiveRecord(null);
    onHistoryChange();
  };

  const handleConfirmRestore = () => {
    if (!recordToRestore) return;
    onRestoreToStudio(recordToRestore);
    setRecordToRestore(null);
    setActiveRecord(null);
    triggerToast('Restored draft and parameters to Studio workbench');
  };

  const handleExportJson = (record: TransformationRecord) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(record, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tone-studio-record-${record.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported record JSON');
  };

  const handleExportTxt = (record: TransformationRecord) => {
    let txt = `==========================================================\n`;
    txt += `TONE STUDIO TRANSFORMATION RECORD: ${record.id}\n`;
    txt += `Request Time: ${record.requestTimestamp}\n`;
    txt += `Completion Time: ${record.completionTimestamp}\n`;
    txt += `Generation Duration: ${record.durationMs}ms\n`;
    txt += `Scenario: ${record.scenarioLabel || 'Custom Raw Draft'}\n`;
    txt += `Detected Vibe: ${record.detectedVibe}\n`;
    txt += `Settings: Formality ${record.sliderWeights.formality}% | Warmth ${record.sliderWeights.warmth}% | Urgency ${record.sliderWeights.urgency}%\n`;
    txt += `==========================================================\n\n`;
    txt += `--- ORIGINAL DRAFT INPUT ---\n${record.originalDraft}\n\n`;

    Object.values(record.outputs || {}).forEach((out) => {
      txt += `--- [${out.title.toUpperCase()}] ---\n`;
      txt += `${out.rewrittenText}\n\n`;
      txt += `Preserved Facts: ${(out.preservedFacts || []).join('; ')}\n\n`;
    });

    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `tone-studio-record-${record.id}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported record as formatted text');
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#1F2937]/60">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Transformation Audit History</span>
            <span className="font-mono text-xs text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 uppercase font-semibold">
              {historyRecords.length} Stored Logs
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic transformation logs with monotonic generation latency, timestamps, and full diff replay.
          </p>
        </div>

        {historyRecords.length > 0 && (
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#171B26] border border-rose-500/30 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Audit History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111827] p-4 rounded-2xl border border-[#1F2937] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inputs, scenarios, outputs, or preserved facts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Persona Filter */}
          <select
            value={selectedPersonaFilter}
            onChange={(e) => setSelectedPersonaFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="all">All Personas</option>
            <option value="executive">Executive</option>
            <option value="peer">Supportive Peer</option>
            <option value="legal">Legal / Compliance</option>
            <option value="genz">Gen-Z Hype</option>
          </select>

          {/* Date Filter */}
          <select
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="all">All Dates</option>
            <option value="today">Past 24 Hours</option>
            <option value="7days">Past 7 Days</option>
            <option value="30days">Past 30 Days</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-1.5 bg-[#171B26] border border-[#262A35] rounded-xl text-xs text-slate-300 hover:text-white flex items-center gap-1.5 font-mono"
            title="Toggle Sort Order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* History Records List */}
      {filteredRecords.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-[#1F2937] bg-[#111827]/40 flex flex-col items-center gap-3">
          <History className="w-10 h-10 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No Transformation Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {historyRecords.length === 0
              ? 'Execute a transformation in Studio to generate your first audit log.'
              : 'No records match the active search query or date filter.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredRecords.map((record) => {
            const outputCount = Object.keys(record.outputs || {}).length;
            const isCompleted = record.status === 'completed';

            return (
              <div
                key={record.id}
                onClick={() => {
                  setActiveRecord(record);
                  const firstKey = Object.keys(record.outputs || {})[0] || '';
                  setActivePersonaKey(firstKey);
                }}
                className="bg-[#111827] hover:bg-[#151C2C] border border-[#1F2937] hover:border-indigo-500/40 rounded-2xl p-4.5 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 group shadow-lg"
              >
                {/* Left Metadata & Snippet */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Status Badge */}
                    {isCompleted ? (
                      <span className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Completed
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        Failed
                      </span>
                    )}

                    {/* Scenario Tag */}
                    <span className="font-mono text-[11px] bg-[#1C1F2A] text-slate-300 border border-[#2B303C] px-2 py-0.5 rounded-md font-medium">
                      {record.scenarioLabel || 'Custom Draft'}
                    </span>

                    {/* Vibe Tag */}
                    <span className="text-[11px] text-indigo-400 font-mono">
                      {record.detectedVibe}
                    </span>

                    {/* Monotonic Generation Duration */}
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {record.durationMs}ms duration
                    </span>

                    {/* Request Timestamp */}
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatTimestamp(record.requestTimestamp)}
                    </span>
                  </div>

                  {/* Input Snippet */}
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                    "{record.originalDraft}"
                  </p>

                  {/* Personas Generated Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      Generated Personas ({outputCount}):
                    </span>
                    {Object.values(record.outputs || {}).map((out) => (
                      <span
                        key={out.id}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#171B26] text-slate-300 border border-[#262A35]"
                      >
                        {out.title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Quick Actions */}
                <div
                  className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1F2937]/70"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setRecordToRestore(record)}
                    className="px-3 py-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-indigo-300 hover:text-white hover:bg-indigo-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    title="Restore Draft to Studio Workbench"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Restore</span>
                  </button>

                  <button
                    onClick={() => handleExportJson(record)}
                    className="p-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-400 hover:text-white transition-colors"
                    title="Export JSON payload"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteRecord(record.id, e)}
                    className="p-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors"
                    title="Delete record from history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Record Inspection Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 flex flex-col gap-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#1F2937]">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Transformation Audit Detail
                  </h2>
                  <span className="font-mono text-xs text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30">
                    ID: {activeRecord.id}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1.5 flex-wrap">
                  <span>Req: {formatTimestamp(activeRecord.requestTimestamp)}</span>
                  <span>·</span>
                  <span>Comp: {formatTimestamp(activeRecord.completionTimestamp)}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-semibold">{activeRecord.durationMs}ms duration</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportTxt(activeRecord)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5"
                  title="Export formatted text"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>
                <button
                  onClick={() => handleExportJson(activeRecord)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5"
                  title="Export JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => setActiveRecord(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1C1F2A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Original Input Draft Block */}
            <div className="bg-[#171B26] rounded-xl border border-[#262A35] p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Original Input Draft
                  </span>
                  <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                    {activeRecord.originalDraft.split(/\s+/).length} words
                  </span>
                </div>
                <button
                  onClick={() => handleCopyText(activeRecord.originalDraft, 'orig')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  {copiedId === 'orig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === 'orig' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                {activeRecord.originalDraft}
              </p>
            </div>

            {/* Persona Outputs Selector Tabs */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]/70 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(Object.values(activeRecord.outputs || {}) as PersonaOutput[]).map((out) => {
                    const isSelected = activePersonaKey === out.id;
                    return (
                      <button
                        key={out.id}
                        onClick={() => setActivePersonaKey(out.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium font-mono flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.35)]'
                            : 'bg-[#171B26] text-slate-400 hover:text-white border border-[#262A35]'
                        }`}
                      >
                        <span>{out.title}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                      showDiff
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-[#171B26] text-slate-400 border border-[#262A35]'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>{showDiff ? 'Diff View ON' : 'Plain View'}</span>
                  </button>
                </div>
              </div>

              {/* Active Output Render */}
              {activeRecord.outputs?.[activePersonaKey] && (() => {
                const out = activeRecord.outputs[activePersonaKey] as PersonaOutput;
                const diffTokens = computeWordDiff(activeRecord.originalDraft, out.rewrittenText);

                return (
                  <div className="flex flex-col gap-4">
                    {/* Rewritten Text / Diff Box */}
                    <div className="bg-[#171B26] rounded-xl border border-[#262A35] p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-indigo-400 font-semibold">
                          {out.title} Output
                        </span>
                        <button
                          onClick={() => handleCopyText(out.rewrittenText, out.id)}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                        >
                          {copiedId === out.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === out.id ? 'Copied' : 'Copy Output'}</span>
                        </button>
                      </div>

                      {showDiff ? (
                        <div className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                          {diffTokens.map((token, i) => {
                            if (token.type === 'added') {
                              return (
                                <span
                                  key={i}
                                  className="bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded mx-0.5 font-medium border border-emerald-500/30"
                                >
                                  {token.text}{' '}
                                </span>
                              );
                            }
                            if (token.type === 'removed') {
                              return (
                                <span
                                  key={i}
                                  className="bg-rose-500/20 text-rose-300 line-through px-1 py-0.5 rounded mx-0.5 opacity-60 border border-rose-500/30"
                                >
                                  {token.text}{' '}
                                </span>
                              );
                            }
                            return <span key={i}>{token.text} </span>;
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                          {out.rewrittenText}
                        </p>
                      )}
                    </div>

                    {/* Preserved Facts Guarantee */}
                    <div className="bg-[#171B26]/60 rounded-xl border border-[#262A35] p-3 flex flex-col gap-1.5">
                      <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                        Preserved Core Constraints & Facts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(out.preservedFacts || []).map((fact: string, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            {fact}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tone Vector Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="bg-[#171B26] p-2.5 rounded-xl border border-[#262A35]">
                        <span className="text-slate-400 block text-[10px] uppercase">Formality</span>
                        <span className="text-indigo-400 text-sm font-bold">{out.toneScores.formality}%</span>
                      </div>
                      <div className="bg-[#171B26] p-2.5 rounded-xl border border-[#262A35]">
                        <span className="text-slate-400 block text-[10px] uppercase">Empathy</span>
                        <span className="text-emerald-400 text-sm font-bold">{out.toneScores.empathy}%</span>
                      </div>
                      <div className="bg-[#171B26] p-2.5 rounded-xl border border-[#262A35]">
                        <span className="text-slate-400 block text-[10px] uppercase">Urgency</span>
                        <span className="text-amber-400 text-sm font-bold">{out.toneScores.urgency}%</span>
                      </div>
                      <div className="bg-[#171B26] p-2.5 rounded-xl border border-[#262A35]">
                        <span className="text-slate-400 block text-[10px] uppercase">Clarity</span>
                        <span className="text-cyan-400 text-sm font-bold">{out.toneScores.clarity}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1F2937]">
              <button
                onClick={() => setRecordToRestore(activeRecord)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore to Studio Workbench</span>
              </button>

              <button
                onClick={() => setActiveRecord(null)}
                className="px-4 py-2 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 hover:text-white text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      {recordToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Restore Record to Studio?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will overwrite the current draft input and slider settings in the Studio Workbench with the values from record <span className="font-mono text-indigo-300">"{recordToRestore.id}"</span>.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRecordToRestore(null)}
                className="px-4 py-2 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111827] border border-[#1F2937] rounded-2xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear All Transformation History?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will permanently delete all {historyRecords.length} stored transformation logs from local storage. This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
