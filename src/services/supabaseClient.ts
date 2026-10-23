import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  CustomPersona, 
  UserLoginRecord, 
  AuditLogEntry, 
  ChatConversation 
} from '../types';

// Supabase credentials
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_AuBcKXupQz3ehp3wfbRiDw_TWC_Dm2J';
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://aubckxupqz3ehp3wfbri.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;

// Check if configured
export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_PUBLISHABLE_KEY && 
  !SUPABASE_URL.includes('your-project-ref')
);

// Create Supabase client instance
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// LocalStorage Keys for resilient offline-first caching
const LS_KEYS = {
  USER_PROFILE: 'vibeshift_user_profile',
  USER_LOGINS: 'vibeshift_user_logins',
  CUSTOM_PERSONAS: 'vibeshift_custom_personas',
  CONVERSATIONS: 'vibeshift_conversations',
  AUDIT_LOGS: 'vibeshift_audit_logs',
};

// -------------------------------------------------------------
// USER PROFILES & LOGINS
// -------------------------------------------------------------

export async function dbGetUserProfile(email: string): Promise<UserProfile | null> {
  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (!error && data) {
      const profile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatar_url,
        plan: data.plan,
        role: data.role,
        totalShifts: data.total_shifts,
        joinedDate: data.joined_date,
        status: data.status,
        lastLoginAt: data.last_login_at ? new Date(data.last_login_at).getTime() : Date.now(),
      };
      localStorage.setItem(LS_KEYS.USER_PROFILE, JSON.stringify(profile));
      return profile;
    }
  } catch (err) {
    console.warn('Supabase profile fetch fallback to local cache:', err);
  }

  // Local fallback
  const cached = localStorage.getItem(LS_KEYS.USER_PROFILE);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }
  return null;
}

export async function dbSaveUserProfile(profile: UserProfile): Promise<void> {
  // Always cache locally
  localStorage.setItem(LS_KEYS.USER_PROFILE, JSON.stringify(profile));

  try {
    const payload = {
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatarUrl,
      plan: profile.plan,
      role: profile.role,
      total_shifts: profile.totalShifts,
      joined_date: profile.joinedDate,
      status: profile.status,
      last_login_at: new Date(profile.lastLoginAt || Date.now()).toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.warn('Supabase upsert user profile note:', error.message);
    }
  } catch (err) {
    console.warn('Supabase user profile sync skipped:', err);
  }
}

export async function dbRecordUserLogin(record: UserLoginRecord): Promise<void> {
  // Cache in local logins list
  try {
    const existing: UserLoginRecord[] = JSON.parse(
      localStorage.getItem(LS_KEYS.USER_LOGINS) || '[]'
    );
    const updated = [record, ...existing].slice(0, 50);
    localStorage.setItem(LS_KEYS.USER_LOGINS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local logins cache write error', e);
  }

  try {
    const payload = {
      user_id: record.userId,
      email: record.email,
      timestamp: new Date(record.timestamp).toISOString(),
      device_info: record.deviceInfo,
      ip_address: record.ipAddress || '127.0.0.1',
      status: record.status,
      provider: record.provider,
    };

    const { error } = await supabase.from('user_logins').insert([payload]);
    if (error) console.warn('Supabase insert user login note:', error.message);
  } catch (err) {
    console.warn('Supabase user login record sync skipped:', err);
  }
}

export async function dbGetUserLogins(email?: string): Promise<UserLoginRecord[]> {
  try {
    let query = supabase.from('user_logins').select('*').order('timestamp', { ascending: false }).limit(25);
    if (email) query = query.eq('email', email);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        email: d.email,
        timestamp: new Date(d.timestamp).getTime(),
        deviceInfo: d.device_info,
        ipAddress: d.ip_address,
        status: d.status,
        provider: d.provider,
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch logins fallback:', err);
  }

  // Fallback
  try {
    const local = localStorage.getItem(LS_KEYS.USER_LOGINS);
    return local ? JSON.parse(local) : [];
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// CUSTOM PERSONAS
// -------------------------------------------------------------

export async function dbGetCustomPersonas(): Promise<CustomPersona[]> {
  try {
    const { data, error } = await supabase
      .from('custom_personas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const personas: CustomPersona[] = data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        title: d.title,
        badgeLabel: d.badge_label,
        badgeColor: d.badge_color,
        icon: d.icon,
        description: d.description,
        systemPrompt: d.system_prompt,
        toneScores: d.tone_scores || { formality: 50, empathy: 50, urgency: 50, clarity: 80 },
        isCustom: true,
        createdAt: new Date(d.created_at).getTime(),
      }));
      localStorage.setItem(LS_KEYS.CUSTOM_PERSONAS, JSON.stringify(personas));
      return personas;
    }
  } catch (err) {
    console.warn('Supabase custom personas fetch fallback:', err);
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(LS_KEYS.CUSTOM_PERSONAS);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export async function dbSaveCustomPersona(persona: CustomPersona): Promise<void> {
  // Update local cache
  try {
    const existing = await dbGetCustomPersonas();
    const filtered = existing.filter((p) => p.id !== persona.id);
    const updated = [persona, ...filtered];
    localStorage.setItem(LS_KEYS.CUSTOM_PERSONAS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local personas cache write error', e);
  }

  // Sync to Supabase
  try {
    const payload = {
      id: persona.id,
      user_id: persona.userId || 'guest',
      title: persona.title,
      badge_label: persona.badgeLabel,
      badge_color: persona.badgeColor,
      icon: persona.icon,
      description: persona.description,
      system_prompt: persona.systemPrompt,
      tone_scores: persona.toneScores,
      created_at: new Date(persona.createdAt || Date.now()).toISOString(),
    };

    const { error } = await supabase
      .from('custom_personas')
      .upsert(payload, { onConflict: 'id' });

    if (error) console.warn('Supabase custom persona upsert note:', error.message);
  } catch (err) {
    console.warn('Supabase custom persona sync skipped:', err);
  }
}

export async function dbDeleteCustomPersona(personaId: string): Promise<void> {
  // Update local cache
  try {
    const existing = await dbGetCustomPersonas();
    const updated = existing.filter((p) => p.id !== personaId);
    localStorage.setItem(LS_KEYS.CUSTOM_PERSONAS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local personas cache delete error', e);
  }

  // Delete from Supabase
  try {
    const { error } = await supabase
      .from('custom_personas')
      .delete()
      .eq('id', personaId);

    if (error) console.warn('Supabase delete custom persona note:', error.message);
  } catch (err) {
    console.warn('Supabase delete custom persona skipped:', err);
  }
}

// -------------------------------------------------------------
// CHATS & CONVERSATIONS
// -------------------------------------------------------------

export async function dbGetConversations(): Promise<ChatConversation[] | null> {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*, chat_messages(*)')
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const convs: ChatConversation[] = data.map((c) => ({
        id: c.id,
        userId: c.user_id,
        title: c.title,
        createdAt: new Date(c.created_at).getTime(),
        updatedAt: new Date(c.updated_at).getTime(),
        category: c.category || 'Today',
        scenarioId: c.scenario_id,
        messages: (c.chat_messages || []).map((m: any) => ({
          id: m.id,
          conversationId: m.chat_id,
          role: m.role,
          timestamp: new Date(m.created_at || m.timestamp).getTime(),
          content: m.content || '',
          sliders: m.sliders,
          scenarioId: m.scenario_id,
          transformationResult: m.transformation_result,
        })),
      }));

      localStorage.setItem(LS_KEYS.CONVERSATIONS, JSON.stringify(convs));
      return convs;
    }
  } catch (err) {
    console.warn('Supabase get conversations fallback:', err);
  }

  // Fallback to local
  try {
    const cached = localStorage.getItem(LS_KEYS.CONVERSATIONS);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export async function dbSaveConversation(conv: ChatConversation): Promise<void> {
  // Always update local cache
  try {
    const cachedStr = localStorage.getItem(LS_KEYS.CONVERSATIONS);
    const existing: ChatConversation[] = cachedStr ? JSON.parse(cachedStr) : [];
    const filtered = existing.filter((c) => c.id !== conv.id);
    const updated = [conv, ...filtered];
    localStorage.setItem(LS_KEYS.CONVERSATIONS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local cache conversation write error', e);
  }

  // Sync to Supabase
  try {
    const chatPayload = {
      id: conv.id,
      user_id: conv.userId || 'guest',
      title: conv.title,
      category: conv.category || 'Today',
      scenario_id: conv.scenarioId,
      created_at: new Date(conv.createdAt).toISOString(),
      updated_at: new Date(conv.updatedAt).toISOString(),
    };

    const { error: chatError } = await supabase
      .from('chats')
      .upsert(chatPayload, { onConflict: 'id' });

    if (chatError) {
      console.warn('Supabase upsert chat note:', chatError.message);
      return;
    }

    // Save messages in chat_messages table
    if (conv.messages.length > 0) {
      const messagesPayload = conv.messages.map((m) => ({
        id: m.id,
        chat_id: conv.id,
        role: m.role,
        content: m.content || '',
        sliders: m.sliders,
        scenario_id: m.scenarioId,
        transformation_result: m.transformationResult,
        created_at: new Date(m.timestamp).toISOString(),
      }));

      const { error: msgError } = await supabase
        .from('chat_messages')
        .upsert(messagesPayload, { onConflict: 'id' });

      if (msgError) console.warn('Supabase upsert chat messages note:', msgError.message);
    }
  } catch (err) {
    console.warn('Supabase chat sync skipped:', err);
  }
}

export async function dbDeleteConversation(convId: string): Promise<void> {
  try {
    const cachedStr = localStorage.getItem(LS_KEYS.CONVERSATIONS);
    if (cachedStr) {
      const existing: ChatConversation[] = JSON.parse(cachedStr);
      const updated = existing.filter((c) => c.id !== convId);
      localStorage.setItem(LS_KEYS.CONVERSATIONS, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Local cache delete error', e);
  }

  try {
    await supabase.from('chat_messages').delete().eq('chat_id', convId);
    await supabase.from('chats').delete().eq('id', convId);
  } catch (err) {
    console.warn('Supabase delete chat skipped:', err);
  }
}

// -------------------------------------------------------------
// AUDIT LOGS & GOVERNANCE
// -------------------------------------------------------------

export async function dbRecordAuditLog(log: AuditLogEntry): Promise<void> {
  // Local cache
  try {
    const existingStr = localStorage.getItem(LS_KEYS.AUDIT_LOGS);
    const existing: AuditLogEntry[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [log, ...existing].slice(0, 100);
    localStorage.setItem(LS_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Local audit log cache write error', e);
  }

  // Supabase
  try {
    const payload = {
      id: log.id,
      timestamp: new Date(log.timestamp).toISOString(),
      user_id: log.userId,
      user_name: log.userName,
      conversation_id: log.conversationId,
      conversation_title: log.conversationTitle,
      source_draft: log.sourceDraft,
      detected_vibe: log.detectedVibe,
      execution_time_ms: log.executionTimeMs,
      fact_parity_percent: log.factParityPercent,
      preserved_facts_count: log.preservedFactsCount,
      personas_generated: log.personasGenerated,
      governance_status: log.governanceStatus,
      compliance_rule: log.complianceRule,
    };

    const { error } = await supabase.from('audit_logs').insert([payload]);
    if (error) console.warn('Supabase audit log insert note:', error.message);
  } catch (err) {
    console.warn('Supabase audit log sync skipped:', err);
  }
}

export async function dbGetAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        timestamp: new Date(d.timestamp).getTime(),
        userId: d.user_id,
        userName: d.user_name,
        conversationId: d.conversation_id,
        conversationTitle: d.conversation_title,
        sourceDraft: d.source_draft,
        detectedVibe: d.detected_vibe,
        executionTimeMs: d.execution_time_ms,
        factParityPercent: d.fact_parity_percent,
        preservedFactsCount: d.preserved_facts_count,
        personasGenerated: d.personas_generated || [],
        governanceStatus: d.governance_status,
        complianceRule: d.compliance_rule,
      }));
    }
  } catch (err) {
    console.warn('Supabase audit logs fetch fallback:', err);
  }

  // Fallback to local
  try {
    const cached = localStorage.getItem(LS_KEYS.AUDIT_LOGS);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}
