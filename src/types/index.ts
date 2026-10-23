export type PersonaType = 'executive' | 'peer' | 'legal' | 'genz' | string;

export type BadgeColor = 'amber' | 'emerald' | 'cyan' | 'purple' | 'indigo' | 'rose';

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
  badgeColor: BadgeColor;
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

export interface PersonaDefinition {
  id: string;
  name: string;
  title: string;
  badgeLabel: string;
  badgeColor: BadgeColor;
  description: string;
  audience: string;
  toneCharacteristics: string;
  useCases: string[];
  defaultTone: ToneScores;
  icon: string;
  isBuiltIn: boolean;
  selectedForStudio: boolean;
  createdAt?: string;
  systemPromptModifier?: string;
}

export interface TransformationResult {
  sourceDraft: string;
  detectedVibe: string;
  inputTone: ToneScores;
  executionTimeMs: number;
  personas: Record<string, PersonaOutput>;
}

export interface TransformationRecord {
  id: string;
  requestTimestamp: string;
  completionTimestamp: string;
  durationMs: number;
  originalDraft: string;
  scenarioId?: string;
  scenarioLabel?: string;
  detectedVibe: string;
  sliderWeights: {
    formality: number;
    warmth: number;
    urgency: number;
  };
  selectedPersonaIds: string[];
  outputs: Record<string, PersonaOutput>;
  status: 'completed' | 'failed' | 'cancelled';
  errorDetails?: string;
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

export type ActiveNavTab = 'chat' | 'personas' | 'history' | 'analytics';

export interface SessionTelemetry {
  sessionId: string;
  startedAt: string;
  lastActiveAt: string;
  activeSeconds: number;
  transformationsCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  timestamp: number;
  content: string;
  sliders?: {
    formality: number;
    warmth: number;
    urgency: number;
  };
  scenarioId?: string;
  transformationResult?: TransformationResult;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  activePersonaTab?: 'all' | PersonaType;
  category?: 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Older';
  scenarioId?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'Pro' | 'Free' | 'Enterprise';
  role: string;
  totalShifts: number;
  joinedDate: string;
  status: 'online' | 'busy' | 'away';
}
