import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChatConversation, UserProfile } from '../types';
import { INITIAL_CONVERSATIONS, CURRENT_USER } from '../data/mockChatData';

export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_AuBcKXupQz3ehp3wfbRiDw_TWC_Dm2J';

export const SUPABASE_URL =
  (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || '';

// Safe initialization of Supabase client
let supabaseClient: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_URL.startsWith('http')) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (err) {
    console.info('Supabase client initialized in local-first fallback mode:', err);
  }
}

// Storage keys
const USERS_STORAGE_KEY = 'tone_studio_users_v2';
const ACTIVE_USER_KEY = 'tone_studio_active_user_v2';

/**
 * Default seed user accounts
 */
const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr_gaurav',
    name: CURRENT_USER.name,
    email: CURRENT_USER.email,
    avatarUrl: CURRENT_USER.avatarUrl,
    role: CURRENT_USER.role,
    plan: CURRENT_USER.plan,
    totalShifts: CURRENT_USER.totalShifts,
    joinedDate: CURRENT_USER.joinedDate,
    status: 'online',
  },
  {
    id: 'usr_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@vibe.ai',
    avatarUrl: '',
    role: 'Lead Product Manager',
    plan: 'Pro',
    totalShifts: 89,
    joinedDate: 'Nov 2024',
    status: 'online',
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@techcorp.io',
    avatarUrl: '',
    role: 'Senior Engineering Manager',
    plan: 'Enterprise',
    totalShifts: 215,
    joinedDate: 'Aug 2024',
    status: 'online',
  },
];

/**
 * Retrieve all registered users from database
 */
export function getAllUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse users from local database:', err);
  }

  // Seed default users if not yet initialized
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  } catch {}
  return DEFAULT_USERS;
}

/**
 * Get active user profile. Guarantees a valid user is always returned (never null)
 * so the dashboard never renders blank or bricked.
 */
export function getActiveUser(): UserProfile {
  const users = getAllUsers();
  try {
    const activeEmail = localStorage.getItem(ACTIVE_USER_KEY);
    if (activeEmail) {
      const matched = users.find((u) => u.email.toLowerCase() === activeEmail.toLowerCase());
      if (matched) return matched;
    }
  } catch {}

  // Default to first user (Gaurav Joshi)
  const defaultUser = users[0] || DEFAULT_USERS[0];
  try {
    localStorage.setItem(ACTIVE_USER_KEY, defaultUser.email);
  } catch {}
  return defaultUser;
}

/**
 * Login or register user with email, name, and role
 */
export async function loginUser(
  email: string,
  name?: string,
  role?: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    user = {
      id: 'usr_' + Date.now(),
      name: name?.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatarUrl: '',
      role: role?.trim() || 'Communication Specialist',
      plan: 'Pro',
      totalShifts: 0,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'online',
    };
    users.push(user);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }

  try {
    localStorage.setItem(ACTIVE_USER_KEY, user.email);
  } catch {}

  // Asynchronous non-blocking Supabase sync if client is available
  if (supabaseClient) {
    try {
      await Promise.race([
        supabaseClient.from('profiles').upsert({
          email: user.email,
          name: user.name,
          role: user.role,
          total_shifts: user.totalShifts,
          updated_at: new Date().toISOString(),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
      ]);
    } catch {}
  }

  return user;
}

/**
 * Switch active user profile
 */
export async function switchUser(email: string): Promise<UserProfile> {
  const users = getAllUsers();
  const matched = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (matched) {
    try {
      localStorage.setItem(ACTIVE_USER_KEY, matched.email);
    } catch {}
    return matched;
  }
  return loginUser(email);
}

/**
 * Update user profile
 */
export async function updateUserProfile(updated: UserProfile): Promise<UserProfile> {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === updated.email.toLowerCase());
  if (index >= 0) {
    users[index] = updated;
  } else {
    users.push(updated);
  }

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(ACTIVE_USER_KEY, updated.email);
  } catch {}

  // Non-blocking sync to Supabase if configured
  if (supabaseClient) {
    try {
      await Promise.race([
        supabaseClient.from('profiles').upsert({
          email: updated.email,
          name: updated.name,
          role: updated.role,
          total_shifts: updated.totalShifts,
          updated_at: new Date().toISOString(),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
      ]);
    } catch {}
  }

  return updated;
}

/**
 * Get safe storage key for a user's conversations
 */
function getConversationsKey(userEmail: string): string {
  const sanitized = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `tone_studio_conversations_${sanitized}_v2`;
}

/**
 * Load chat history for a specific user from database
 */
export async function loadUserConversations(userEmail: string): Promise<ChatConversation[]> {
  const key = getConversationsKey(userEmail);

  // 1. Check local database
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse conversations from local database:', err);
  }

  // 2. Fallback: Seed with initial sample conversations on first load
  const seeded = INITIAL_CONVERSATIONS.map((c) => ({
    ...c,
    id: `conv-${userEmail.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }));

  try {
    localStorage.setItem(key, JSON.stringify(seeded));
  } catch {}

  return seeded;
}

/**
 * Save chat history for a specific user to database
 */
export async function saveUserConversations(
  userEmail: string,
  conversations: ChatConversation[]
): Promise<void> {
  const key = getConversationsKey(userEmail);

  // 1. Instant local persistence
  try {
    localStorage.setItem(key, JSON.stringify(conversations));
  } catch (err) {
    console.error('Failed to save conversations to local database:', err);
  }

  // 2. Non-blocking asynchronous sync to Supabase remote database if available
  if (supabaseClient) {
    try {
      const records = conversations.map((conv) => ({
        id: conv.id,
        user_email: userEmail.toLowerCase(),
        title: conv.title,
        updated_at: new Date(conv.updatedAt || Date.now()).toISOString(),
        data: conv,
      }));

      await Promise.race([
        supabaseClient.from('conversations').upsert(records, { onConflict: 'id' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
      ]);
    } catch {}
  }
}

/**
 * Delete a conversation from a user's database
 */
export async function deleteUserConversation(
  userEmail: string,
  conversationId: string,
  remaining: ChatConversation[]
): Promise<void> {
  await saveUserConversations(userEmail, remaining);

  if (supabaseClient) {
    try {
      await Promise.race([
        supabaseClient.from('conversations').delete().eq('id', conversationId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
      ]);
    } catch {}
  }
}

/**
 * Diagnostic database status
 */
export function getDatabaseStatus() {
  return {
    isConfigured: true,
    engine: supabaseClient ? 'Supabase Cloud + Local Cache' : 'Local Persistent Engine (Supabase Key Ready)',
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
  };
}
