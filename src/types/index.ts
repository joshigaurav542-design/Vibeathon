export type PersonaType = 'executive' | 'peer' | 'legal' | 'genz';

export interface ToneScores {
  formality: number;
  empathy: number;
  urgency: number;
  clarity: number;
}

export interface PersonaOutput {
  id: PersonaType;
  title: string;
  badgeLabel: string;
  badgeColor: 'amber' | 'emerald' | 'cyan' | 'purple';
  description: string;
  icon: string;
  rewrittenText: string;
  toneScores: ToneScores;
  deltaStats: {
    wordCountDeltaPercent: number;
    originalWordCount: number;
    rewrittenWordCount: number;
    vocabularyShiftPercent: number;
    readingTimeSeconds: number;
    sentimentSummary: string;
  };
  preservedFacts: string[];
}

export interface TransformationResult {
  sourceDraft: string;
  detectedVibe: string;
  inputTone: ToneScores;
  executionTimeMs: number;
  personas: Record<PersonaType, PersonaOutput>;
}

export interface DiffToken {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
}

export interface PresetScenario {
  id: string;
  label: string;
  vibe: string;
  description: string;
  defaultSliders: {
    formality: number;
    warmth: number;
    urgency: number;
  };
  draftText: string;
}
