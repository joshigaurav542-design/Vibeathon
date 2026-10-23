import { PersonaDefinition, ToneScores } from '../types';

export const BUILTIN_PERSONAS: PersonaDefinition[] = [
  {
    id: 'executive',
    name: 'Executive C-Level Summary',
    title: 'Executive C-Level Summary',
    badgeLabel: 'Executive Brief',
    badgeColor: 'amber',
    description: 'Decisive, high-level, risk-framed, and bottom-line focused for leadership and investors.',
    audience: 'Board Members, Founders, Investors, C-Suite Leaders',
    toneCharacteristics: 'High Formality, Low Verbosity, Decisive, Bottom-Line Focused',
    useCases: ['Incident escalations', 'Board syncs', 'Milestone risk summaries', 'Budget appeals'],
    defaultTone: { formality: 92, empathy: 35, urgency: 85, clarity: 95 },
    icon: 'Briefcase',
    isBuiltIn: true,
    selectedForStudio: true,
    systemPromptModifier: 'Rewrite with Board-level brevity, proactive incident mitigation, business impact, clear timelines, zero panicking.',
  },
  {
    id: 'peer',
    name: 'Supportive Peer Feedback',
    title: 'Supportive Peer Feedback',
    badgeLabel: 'Supportive Peer',
    badgeColor: 'emerald',
    description: 'Empathetic, collaborative, psychologically safe, and constructive team alignment.',
    audience: 'Direct Teammates, Cross-Functional Peers, Sprint Squads',
    toneCharacteristics: 'High Empathy, Warmth, Constructive Next Steps, Blameless Culture',
    useCases: ['Code review comments', 'Sprint retrospective', 'Constructive blocker sync', 'Pair-programming feedback'],
    defaultTone: { formality: 45, empathy: 95, urgency: 40, clarity: 88 },
    icon: 'HeartHandshake',
    isBuiltIn: true,
    selectedForStudio: true,
    systemPromptModifier: 'Rewrite with empathy, blameless psychological safety, shared learning, collaborative next steps.',
  },
  {
    id: 'legal',
    name: 'Legal / Compliance Notice',
    title: 'Legal / Compliance Notice',
    badgeLabel: 'Legal / Compliance',
    badgeColor: 'cyan',
    description: 'Objective, auditable, strictly liability-mitigated, and procedurally accurate.',
    audience: 'General Counsel, Auditors, Compliance Officers, HR, Regulators',
    toneCharacteristics: 'Maximum Formality, Objective, Risk-Mitigated, Explicit Disclaimers',
    useCases: ['Policy breaches', 'Vendor contract pushback', 'Audit trail documentation', 'Terms enforcement'],
    defaultTone: { formality: 98, empathy: 20, urgency: 75, clarity: 92 },
    icon: 'Scale',
    isBuiltIn: true,
    selectedForStudio: true,
    systemPromptModifier: 'Rewrite with formal, rigorous, auditable, risk-controlled, procedural terminology and liability mitigation.',
  },
  {
    id: 'genz',
    name: 'Gen-Z Hype / Viral',
    title: 'Gen-Z Hype / Viral',
    badgeLabel: 'Gen-Z Hype / Viral',
    badgeColor: 'purple',
    description: 'Energetic, slang-fluent, candid, high-engagement, internet-native communication.',
    audience: 'Social Media Audience, Discord/Slack Communities, Web3 & Tech Natives',
    toneCharacteristics: 'Low Formality, High Energy/Hype, Internet Slang Fluency, Candid Punchiness',
    useCases: ['Community Discord announcements', 'Changelog hype drops', 'Social launch teasers', 'Casual sprint celebrations'],
    defaultTone: { formality: 15, empathy: 80, urgency: 90, clarity: 75 },
    icon: 'Sparkles',
    isBuiltIn: true,
    selectedForStudio: true,
    systemPromptModifier: 'Rewrite with energetic internet slang (no cap, fr fr, cooking, locked in, lowkey), high energy, candid tone.',
  },
];

const STORAGE_KEY = 'vibeshift_personas_v1';

/**
 * Loads all personas from localStorage, merging custom additions with built-in protections.
 */
export function loadPersonas(): PersonaDefinition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return BUILTIN_PERSONAS;
    }
    const saved = JSON.parse(raw) as PersonaDefinition[];
    if (!Array.isArray(saved) || saved.length === 0) {
      return BUILTIN_PERSONAS;
    }

    // Merge: Ensure all built-in personas always exist, preserving their selected state if saved
    const savedMap = new Map(saved.map((p) => [p.id, p]));
    const mergedBuiltIns = BUILTIN_PERSONAS.map((b) => {
      const existing = savedMap.get(b.id);
      return existing
        ? {
            ...b,
            selectedForStudio: existing.selectedForStudio ?? true,
          }
        : b;
    });

    const customPersonas = saved.filter((p) => !p.isBuiltIn);
    return [...mergedBuiltIns, ...customPersonas];
  } catch (err) {
    console.warn('Failed to parse personas from localStorage, using defaults:', err);
    return BUILTIN_PERSONAS;
  }
}

/**
 * Persists personas list to localStorage.
 */
export function savePersonas(personas: PersonaDefinition[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  } catch (err) {
    console.error('Failed to save personas to localStorage:', err);
  }
}

/**
 * Creates a new custom persona and saves it.
 */
export function createCustomPersona(data: {
  name: string;
  badgeLabel: string;
  badgeColor: PersonaDefinition['badgeColor'];
  description: string;
  audience: string;
  toneCharacteristics: string;
  useCases: string[];
  defaultTone: ToneScores;
  systemPromptModifier?: string;
  icon?: string;
}): PersonaDefinition {
  const current = loadPersonas();
  const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newPersona: PersonaDefinition = {
    id,
    name: data.name.trim(),
    title: data.name.trim(),
    badgeLabel: data.badgeLabel.trim() || data.name.trim(),
    badgeColor: data.badgeColor || 'indigo',
    description: data.description.trim(),
    audience: data.audience.trim() || 'General Professional',
    toneCharacteristics: data.toneCharacteristics.trim() || 'Tailored custom tone modulation',
    useCases: data.useCases.length > 0 ? data.useCases : ['Custom workflow', 'Team communication'],
    defaultTone: data.defaultTone,
    icon: data.icon || 'Sliders',
    isBuiltIn: false,
    selectedForStudio: true,
    createdAt: new Date().toISOString(),
    systemPromptModifier: data.systemPromptModifier || `Modulate tone according to ${data.name}: ${data.description}`,
  };

  const updated = [...current, newPersona];
  savePersonas(updated);
  return newPersona;
}

/**
 * Updates an existing custom persona. Built-in personas cannot be modified.
 */
export function updateCustomPersona(
  id: string,
  updates: Partial<Omit<PersonaDefinition, 'id' | 'isBuiltIn' | 'createdAt'>>
): PersonaDefinition | null {
  const current = loadPersonas();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const target = current[index];
  if (target.isBuiltIn) {
    throw new Error('Built-in personas are protected and cannot be edited.');
  }

  const updatedPersona: PersonaDefinition = {
    ...target,
    ...updates,
    title: updates.name ? updates.name.trim() : target.title,
    badgeLabel: updates.badgeLabel ? updates.badgeLabel.trim() : target.badgeLabel,
  };

  current[index] = updatedPersona;
  savePersonas(current);
  return updatedPersona;
}

/**
 * Duplicates a persona into a new custom persona with '(Copy)' suffix.
 */
export function duplicatePersona(id: string): PersonaDefinition | null {
  const current = loadPersonas();
  const source = current.find((p) => p.id === id);
  if (!source) return null;

  return createCustomPersona({
    name: `${source.name} (Copy)`,
    badgeLabel: `${source.badgeLabel} (Copy)`,
    badgeColor: source.badgeColor,
    description: source.description,
    audience: source.audience,
    toneCharacteristics: source.toneCharacteristics,
    useCases: [...source.useCases],
    defaultTone: { ...source.defaultTone },
    systemPromptModifier: source.systemPromptModifier,
    icon: source.icon,
  });
}

/**
 * Deletes a custom persona. Built-in personas are protected from deletion.
 */
export function deleteCustomPersona(id: string): boolean {
  const current = loadPersonas();
  const target = current.find((p) => p.id === id);
  if (!target) return false;
  if (target.isBuiltIn) {
    throw new Error('Built-in personas are protected and cannot be deleted.');
  }

  const filtered = current.filter((p) => p.id !== id);
  savePersonas(filtered);
  return true;
}

/**
 * Toggles a persona's selection for use in Studio.
 * Guarantees that at least one persona remains selected.
 */
export function togglePersonaSelection(id: string): PersonaDefinition[] {
  const current = loadPersonas();
  const target = current.find((p) => p.id === id);
  if (!target) return current;

  const currentlySelected = current.filter((p) => p.selectedForStudio);
  if (target.selectedForStudio && currentlySelected.length <= 1) {
    // Prevent unselecting all personas
    return current;
  }

  const updated = current.map((p) =>
    p.id === id ? { ...p, selectedForStudio: !p.selectedForStudio } : p
  );
  savePersonas(updated);
  return updated;
}

/**
 * Selects or deselects all personas for Studio.
 */
export function selectAllPersonas(select: boolean): PersonaDefinition[] {
  const current = loadPersonas();
  const updated = current.map((p, idx) => ({
    ...p,
    // If deselecting all, keep the first one active so Studio always has an active target
    selectedForStudio: select ? true : idx === 0,
  }));
  savePersonas(updated);
  return updated;
}
