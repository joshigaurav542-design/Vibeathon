import { createClient } from '@supabase/supabase-js';

// Pre-configured with the project's Supabase publishable credentials
export const SUPABASE_PUBLISHABLE_KEY = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'sb_publishable_AuBcKXupQz3ehp3wfbRiDw_TWC_Dm2J';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://aubckxupqz3ehp3wfbri.supabase.co';

// Create Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
