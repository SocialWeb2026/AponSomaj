import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL) as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || (import.meta.env as any).NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  missing: string[];
}

/**
 * Diagnostics function to inspect Supabase configuration state.
 */
export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const hasUrl = Boolean(supabaseUrl && supabaseUrl.trim().length > 0);
  const hasAnonKey = Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 0);
  const missing: string[] = [];
  if (!hasUrl) missing.push('VITE_SUPABASE_URL');
  if (!hasAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  return {
    isConfigured: hasUrl && hasAnonKey,
    hasUrl,
    hasAnonKey,
    missing,
  };
}

/**
 * Boolean flag indicating whether Supabase is configured with real credentials.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.trim().length > 0 &&
  supabaseAnonKey &&
  supabaseAnonKey.trim().length > 0
);

/**
 * Supabase client instance.
 * Returns null if credentials are not configured in the environment.
 * NEVER creates fake fallback connections.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!.trim(), supabaseAnonKey!.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Returns the Supabase client or throws a clear error if not configured.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const status = getSupabaseConfigStatus();
    throw new Error(
      `Supabase is not configured. Missing environment variables: ${status.missing.join(', ')}. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.`
    );
  }
  return supabase;
}

/**
 * Performs a harmless read-only test if credentials are configured.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: 'Supabase credentials are not configured in environment variables.',
    };
  }

  try {
    // Harmless, read-only auth session probe
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase successfully.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}
