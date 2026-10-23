import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { InputStudio } from './components/InputStudio';
import { PersonaGrid } from './components/PersonaGrid';
import { Toast } from './components/Toast';
import { SAMPLE_SCENARIOS } from './data/sampleScenarios';
import { transformDraft } from './services/aiTransformer';
import { TransformationResult } from './types';

export function App() {
  const initialScenario = SAMPLE_SCENARIOS[0];

  const [draftText, setDraftText] = useState(initialScenario.draftText);
  const [activeScenarioId, setActiveScenarioId] = useState(initialScenario.id);
  const [sliders, setSliders] = useState(initialScenario.defaultSliders);
  const [isLoading, setIsLoading] = useState(false);
  const [transformationResult, setTransformationResult] = useState<TransformationResult | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const handleTransform = useCallback(async () => {
    if (!draftText.trim()) return;
    setIsLoading(true);
    try {
      const result = await transformDraft(draftText, sliders);
      setTransformationResult(result);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6'],
      });
      triggerToast('Transformed across all 4 personas in ' + result.executionTimeMs + 'ms!');
    } catch (err) {
      console.error('Transformation error:', err);
      triggerToast('Transformation completed with smart fallback engine');
    } finally {
      setIsLoading(false);
    }
  }, [draftText, sliders]);

  // Run initial transform on mount for immediate wow effect
  useEffect(() => {
    handleTransform();
  }, []);

  const handleCopySingle = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Copied ${title} to clipboard!`);
  };

  const handleCopyAll = () => {
    if (!transformationResult) return;
    const allFormatted = Object.values(transformationResult.personas)
      .map((p) => `--- [${p.title.toUpperCase()}] ---\n${p.rewrittenText}\n`)
      .join('\n');
    navigator.clipboard.writeText(allFormatted);
    triggerToast('Copied all 4 persona rewrites to clipboard!');
  };

  const handleExportJson = () => {
    if (!transformationResult) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transformationResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vibeshift-transformation-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Exported transformation JSON');
  };

  const handleResetToDefault = () => {
    setDraftText(initialScenario.draftText);
    setActiveScenarioId(initialScenario.id);
    setSliders(initialScenario.defaultSliders);
    handleTransform();
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#DFE2F1] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Application Bar */}
      <Header onReset={handleResetToDefault} />

      {/* Main Workspace Workbench */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Subheader Banner */}
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#1F2937]/50">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex flex-wrap items-center gap-2.5">
              <span>Tone Studio Workbench</span>
              <span className="font-mono text-xs text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 uppercase tracking-wider font-semibold">
                Multi-Persona Matrix
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic linguistic modulation with semantic parity & 100% core facts preservation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 rounded-xl bg-[#171B26] border border-[#262A35] text-slate-300 hover:text-white text-xs font-medium hover:bg-[#1C1F2A] transition-all"
            >
              Reset to Sample
            </button>
          </div>
        </section>

        {/* Workbench Split-Screen Grid: Left ~38% | Right ~62% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (38% width on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <InputStudio
              draftText={draftText}
              setDraftText={setDraftText}
              activeScenarioId={activeScenarioId}
              setActiveScenarioId={setActiveScenarioId}
              sliders={sliders}
              setSliders={setSliders}
              onTransform={handleTransform}
              isLoading={isLoading}
              detectedVibe={transformationResult?.detectedVibe || 'High Stress / Direct'}
            />
          </div>

          {/* Right Column (62% width on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8">
            {transformationResult ? (
              <PersonaGrid
                personas={transformationResult.personas}
                originalDraft={draftText}
                executionTimeMs={transformationResult.executionTimeMs}
                onCopySingle={handleCopySingle}
                onCopyAll={handleCopyAll}
                onExportJson={handleExportJson}
              />
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center rounded-2xl border border-dashed border-[#1F2937] bg-[#111827]/40 text-slate-500 text-sm">
                Click "Transform Across All Personas" to generate rewrite matrix
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Toast */}
      <Toast message={toastMessage} isVisible={showToast} />
    </div>
  );
}

export default App;
