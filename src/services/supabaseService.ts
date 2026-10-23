import { supabase, SUPABASE_PUBLISHABLE_KEY } from '../config/supabaseConfig';
import { ChatConversation, UserProfile } from '../types';
import { INITIAL_CONVERSATIONS } from '../data/mockChatData';

const CURRENT_USER_KEY = 'tone_studio_active_user_email';
const ALL_USERS_KEY = 'tone_studio_registered_users';

/**
 * Get all registered user profiles on this client
 */
export function getAllRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(ALL_USERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse registered users:', e);
  }

  // Default seed accounts for instant testing
  const defaults: UserProfile[] = [
    {
      id: 'usr_gaurav',
      name: 'Gaurav Joshi',
      email: 'joshigaurav542@gmail.com',
      avatarUrl: '',
      role: 'Staff Product Engineer',
      plan: 'Pro',
      totalShifts: 142,
      joinedDate: 'Oct 2024',
      status: 'online',
    },
    {
      id: 'usr_alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@vibe.ai',
      avatarUrl: '',
      role: 'Product Operations Lead',
      plan: 'Pro',
      totalShifts: 87,
      joinedDate: 'Nov 2024',
      status: 'online',
    },
  ];

  try {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(defaults));
  } catch {}
  return defaults;
}

/**
 * Get the currently logged-in user profile
 */
export function getActiveUser(): UserProfile | null {
  const activeEmail = localStorage.getItem(CURRENT_USER_KEY);
  if (!activeEmail) return null;

  const users = getAllRegisteredUsers();
  return users.find((u) => u.email.toLowerCase() === activeEmail.toLowerCase()) || null;
}

/**
 * Sign in or switch user profile
 */
export async function authenticateUser(
  email: string,
  name?: string,
  role?: string
): Promise<UserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllRegisteredUsers();
  let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!existing) {
    existing = {
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
    users.push(existing);
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
  }

  // Set active user session
  localStorage.setItem(CURRENT_USER_KEY, existing.email);

  // Attempt Supabase cloud auth/profile sync in the background
  try {
    const { data: remoteProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (remoteProfile) {
      existing = {
        ...existing,
        name: remoteProfile.name || existing.name,
        role: remoteProfile.role || existing.role,
        totalShifts: remoteProfile.total_shifts ?? existing.totalShifts,
      };
    } else {
      // Upsert profile into Supabase
      await supabase.from('profiles').upsert({
        email: cleanEmail,
        name: existing.name,
        role: existing.role,
        total_shifts: existing.totalShifts,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    // Non-blocking fallback to local storage
    console.info('Supabase profile sync operating in local-resilient mode:', err);
  }

  return existing;
}

/**
 * Sign out user
 */
export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch {}
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Update an existing user's profile
 */
export async function updateUserProfile(updated: UserProfile): Promise<UserProfile> {
  const users = getAllRegisteredUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === updated.email.toLowerCase());

  if (index >= 0) {
    users[index] = updated;
  } else {
    users.push(updated);
  }
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));

  // Sync to Supabase
  try {
    await supabase.from('profiles').upsert({
      email: updated.email.toLowerCase(),
      name: updated.name,
      role: updated.role,
      total_shifts: updated.totalShifts,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.info('Supabase profile update synced locally:', e);
  }

  return updated;
}

/**
 * Load conversations for a specific user
 */
export async function loadUserConversations(userEmail: string): Promise<ChatConversation[]> {
  const storageKey = `tone_studio_conversations_${userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  // 1. Check if Supabase has remote conversations
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('data')
      .eq('user_email', userEmail.toLowerCase())
      .order('updated_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const parsed = data.map((d) => d.data as ChatConversation);
      localStorage.setItem(storageKey, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.info('Using locally cached conversations for user:', userEmail);
  }

  // 2. Load from local cache
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Error reading cached conversations:', e);
  }

  // 3. New user fallback: initialize with seed conversations
  const seeded = INITIAL_CONVERSATIONS.map((c) => ({
    ...c,
    id: `conv-${userEmail.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  }));

  try {
    localStorage.setItem(storageKey, JSON.stringify(seeded));
  } catch {}

  return seeded;
}

/**
 * Save conversations for a user to both localStorage and Supabase
 */
export async function saveUserConversations(
  userEmail: string,
  conversations: ChatConversation[]
): Promise<void> {
  const storageKey = `tone_studio_conversations_${userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  // 1. Immediately write to client localStorage
  try {
    localStorage.setItem(storageKey, JSON.stringify(conversations));
  } catch (e) {
    console.error('LocalStorage save failed:', e);
  }

  // 2. Persist to Supabase database in the background
  try {
    const records = conversations.map((conv) => ({
      id: conv.id,
      user_email: userEmail.toLowerCase(),
      title: conv.title,
      updated_at: new Date(conv.updatedAt || Date.now()).toISOString(),
      data: conv,
    }));

    await supabase.from('conversations').upsert(records, { onConflict: 'id' });
  } catch (err) {
    // Non-blocking for offline or restricted RLS
    console.info('Saved locally; Supabase remote sync pending:', err);
  }
}

/**
 * Delete a conversation
 */
export async function deleteUserConversation(
  userEmail: string,
  conversationId: string,
  remaining: ChatConversation[]
): Promise<void> {
  await saveUserConversations(userEmail, remaining);

  try {
    await supabase.from('conversations').delete().eq('id', conversationId);
  } catch {}
}

export { SUPABASE_PUBLISHABLE_KEY };
