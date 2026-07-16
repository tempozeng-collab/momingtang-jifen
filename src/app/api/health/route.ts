import { db } from '@/lib/db';

export async function GET() {
  const stats = await db.stats();
  return Response.json({ ok: true, mode: 'in-memory', ...stats });
}
