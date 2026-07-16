import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const s = getSupabase();
    const start = Date.now();
    const { count, error } = await s.from('users').select('*', { count: 'exact', head: true });
    const ms = Date.now() - start;
    
    return Response.json({
      ok: !error,
      dbReachable: true,
      latency: `${ms}ms`,
      userCount: count,
      error: error?.message || null,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...',
    });
  } catch (e: any) {
    return Response.json({
      ok: false,
      dbReachable: false,
      error: e.message,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...',
    });
  }
}
