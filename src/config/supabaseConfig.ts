/**
 * Supabase Configuration for DE60 Habit Tracker
 * 
 * Replace the placeholder values below with your Supabase project credentials,
 * or configure them dynamically inside the app's Settings screen.
 * 
 * Get your URL and Anon Key at: https://supabase.com/dashboard/project/_/settings/api
 */

export const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://uxbmfsbqpqlrsftmdyfl.supabase.co',
  anonKey: 'sb_publishable_r5UaMPSlVgOC37a7L5wotA_WWz7l9wB',
  syncEnabled: true,
};

export function isConfigured(url?: string, anonKey?: string): boolean {
  const u = url || DEFAULT_SUPABASE_CONFIG.url;
  const k = anonKey || DEFAULT_SUPABASE_CONFIG.anonKey;
  return Boolean(u && k && u.startsWith('https://') && k.length > 20);
}
