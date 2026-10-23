export type PersonaType = 'executive' | 'peer' | 'legal' | 'genz';
export type BadgeColor = 'amber' | 'emerald' | 'cyan' | 'purple' | 'blue' | 'rose';

export interface ToneScores {
  formality: number;
  empathy: number;
  urgency: number;
  clarity: number;
}

export interface PersonaOutput {
  id: PersonaType | string;
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

export interface TransformationResult {
  sourceDraft: string;
  detectedVibe: string;
  inputTone: ToneScores;
  executionTimeMs: number;
  personas: Record<string, PersonaOutput>;
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

export interface ChatMessage {
  id: string;
  conversationId?: string;
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
  userId?: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  activePersonaTab?: 'all' | PersonaType | string;
  category?: 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Older';
  scenarioId?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'Pro' | 'Free' | 'Enterprise';
  role: string;
  totalShifts: number;
  joinedDate: string;
  status: 'online' | 'busy' | 'away';
  lastLoginAt?: number;
}

export interface CustomPersona {
  id: string;
  userId?: string;
  title: string;
  badgeLabel: string;
  badgeColor: BadgeColor;
  icon: string;
  description: string;
  systemPrompt: string;
  toneScores: ToneScores;
  isCustom: boolean;
  createdAt: number;
}

export interface UserLoginRecord {
  id: string;
  userId: string;
  email: string;
  timestamp: number;
  deviceInfo: string;
  ipAddress?: string;
  status: 'success' | 'failed';
  provider: 'email' | 'guest' | 'oauth';
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  conversationId: string;
  conversationTitle: string;
  sourceDraft: string;
  detectedVibe: string;
  executionTimeMs: number;
  factParityPercent: number;
  preservedFactsCount: number;
  personasGenerated: string[];
  governanceStatus: 'compliant' | 'warning' | 'flagged';
  complianceRule: string;
}

export type ActiveView = 'studio' | 'personas' | 'audit' | 'analytics';
