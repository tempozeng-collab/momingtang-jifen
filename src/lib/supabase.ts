import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!url || !key) throw new Error(`Supabase env missing: URL=${!!url} KEY=${!!key}`);
    _client = createClient(url, key);
  }
  return _client;
}

export function getAdminClient(): SupabaseClient {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!url || !key) throw new Error(`Supabase admin env missing: URL=${!!url} KEY=${!!key}`);
    _admin = createClient(url, key);
  }
  return _admin;
}
