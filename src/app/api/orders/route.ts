import { getAuthFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const auth = await getAuthFromCookie();
  if (!auth) return Response.json({ error: '未登录' }, { status: 401 });
  const orders = await db.platformOrders.findByUserId(auth.userId);
  return Response.json({ orders: orders.map((o: any) => ({ ...o, items_json: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : o.items_json })) });
}
