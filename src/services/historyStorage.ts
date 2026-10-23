import { SessionTelemetry, TransformationRecord } from '../types';

const STORAGE_KEY = 'vibeshift_history_v1';
const SESSION_KEY = 'vibeshift_session_v1';
const INACTIVITY_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Loads all transformation records from localStorage.
 */
export function loadHistory(): TransformationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('Failed to load history from localStorage:', err);
    return [];
  }
}

/**
 * Saves all records to localStorage.
 */
export function saveHistory(records: TransformationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save history to localStorage:', err);
  }
}

/**
 * Appends a new transformation record to history.
 */
export function addHistoryRecord(
  recordData: Omit<TransformationRecord, 'id'>
): TransformationRecord {
  const current = loadHistory();
  const id = `vibe-rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const record: TransformationRecord = {
    ...recordData,
    id,
  };

  // Prepend so newest is first by default
  const updated = [record, ...current];
  saveHistory(updated);

  // Update session telemetry counters
  incrementSessionTransformations();

  return record;
}

/**
 * Deletes a single history record by ID.
 */
export function deleteHistoryRecord(id: string): boolean {
  const current = loadHistory();
  const filtered = current.filter((r) => r.id !== id);
  if (filtered.length === current.length) return false;
  saveHistory(filtered);
  return true;
}

/**
 * Clears all history records.
 */
export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export interface HistoryFilterOptions {
  query?: string;
  personaId?: string;
  scenarioId?: string;
  status?: string;
  dateRange?: 'all' | 'today' | '7days' | '30days';
  sortOrder?: 'newest' | 'oldest';
}

/**
 * Filters and searches history records with multiple criteria.
 */
export function filterHistoryRecords(
  records: TransformationRecord[],
  options: HistoryFilterOptions
): TransformationRecord[] {
  let result = [...records];

  // 1. Text Query Search across input and outputs
  if (options.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim();
    result = result.filter((r) => {
      if (r.originalDraft.toLowerCase().includes(q)) return true;
      if (r.scenarioLabel?.toLowerCase().includes(q)) return true;
      return Object.values(r.outputs || {}).some(
        (out) =>
          out.rewrittenText.toLowerCase().includes(q) ||
          out.title.toLowerCase().includes(q)
      );
    });
  }

  // 2. Persona filter
  if (options.personaId && options.personaId !== 'all') {
    result = result.filter((r) =>
      r.selectedPersonaIds?.includes(options.personaId!) ||
      Boolean(r.outputs?.[options.personaId!])
    );
  }

  // 3. Scenario filter
  if (options.scenarioId && options.scenarioId !== 'all') {
    result = result.filter((r) => r.scenarioId === options.scenarioId);
  }

  // 4. Status filter
  if (options.status && options.status !== 'all') {
    result = result.filter((r) => r.status === options.status);
  }

  // 5. Date range filter
  if (options.dateRange && options.dateRange !== 'all') {
    const now = Date.now();
    result = result.filter((r) => {
      const recTime = new Date(r.requestTimestamp).getTime();
      if (isNaN(recTime)) return true;
      const diffMs = now - recTime;

      switch (options.dateRange) {
        case 'today':
          return diffMs <= 24 * 60 * 60 * 1000;
        case '7days':
          return diffMs <= 7 * 24 * 60 * 60 * 1000;
        case '30days':
          return diffMs <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });
  }

  // 6. Sorting
  result.sort((a, b) => {
    const timeA = new Date(a.requestTimestamp).getTime() || 0;
    const timeB = new Date(b.requestTimestamp).getTime() || 0;
    return options.sortOrder === 'oldest' ? timeA - timeB : timeB - timeA;
  });

  return result;
}

// -------------------------------------------------------------
// Monitored Local Session Telemetry
// Follows documented 30-minute inactivity threshold
// -------------------------------------------------------------

/**
 * Initializes or refreshes the local browser session.
 */
export function getOrCreateSession(): SessionTelemetry {
  const nowIso = new Date().toISOString();
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw) as SessionTelemetry;
      const lastActive = new Date(session.lastActiveAt).getTime();
      const diffMs = Date.now() - lastActive;

      // If within 30-min inactivity window, continue session
      if (diffMs < INACTIVITY_THRESHOLD_MS) {
        session.lastActiveAt = nowIso;
        session.activeSeconds = Math.round(
          (Date.now() - new Date(session.startedAt).getTime()) / 1000
        );
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
      }
    }

    // New session
    const newSession: SessionTelemetry = {
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      startedAt: nowIso,
      lastActiveAt: nowIso,
      activeSeconds: 0,
      transformationsCount: 0,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    return newSession;
  } catch {
    return {
      sessionId: `sess-${Date.now()}`,
      startedAt: nowIso,
      lastActiveAt: nowIso,
      activeSeconds: 0,
      transformationsCount: 0,
    };
  }
}

/**
 * Increments the transformation counter on the current session.
 */
export function incrementSessionTransformations(): void {
  try {
    const session = getOrCreateSession();
    session.transformationsCount = (session.transformationsCount || 0) + 1;
    session.lastActiveAt = new Date().toISOString();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Session increment error:', err);
  }
}
