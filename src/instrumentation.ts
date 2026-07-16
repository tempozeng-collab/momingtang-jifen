// Supabase-based app - no local DB init needed
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('✅ 灵喵京 v0.1 ready — Supabase PostgreSQL');
  }
}
