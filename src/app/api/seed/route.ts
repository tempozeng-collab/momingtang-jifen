import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    // Check if already seeded
    const existing = await db.users.findByPhone('13800000001');
    if (existing) return Response.json({ message: '已初始化，无需重复', user: existing.phone });

    const hash = hashPassword('Test1234!');
    const user = await db.users.create({ phone: '13800000001', password_hash: hash, nickname: '墨名堂·花间喵', tier: 'BAIXIAO', total_meowcoin: 2500, used_meowcoin: 300 });

    const adminHash = hashPassword('Admin123!');
    await db.users.create({ phone: 'admin', password_hash: adminHash, nickname: '__admin__' }); // placeholder for admin lookup
    // Actually let's just directly insert into admin_users
    const { getAdminClient } = await import('@/lib/supabase');
    await getAdminClient().from('admin_users').insert({ username: 'admin', password_hash: adminHash, display_name: '掌事大人', role: 'SUPER_ADMIN' });

    const { data: tag } = await getAdminClient().from('user_tags').insert({ name: '玄喵', color: '#1A1A2E', description: '隐藏阶位·邀请制' }).select().single();

    // Seed ledger
    const entries = [
      [1200, 0, 1200, 0, 1200, 'T20231001', 'seed-001', '{"platform":"淘宝","desc":"宋制旋裙"}'],
      [800, 1200, 2000, 1200, 2000, 'T20231115', 'seed-002', '{"platform":"淘宝","desc":"唐制齐胸"}'],
      [500, 2000, 2500, 2000, 2500, 'T20240320', 'seed-003', '{"platform":"抖音","desc":"明制披风"}'],
    ];
    for (const [amt, bb, ba, ab, aa, rid, key, meta] of entries) {
      await db.meowcoinLedger.insert({ user_id: user.id, direction: 'IN', type: 'ORDER_SYNC', amount: amt, balance_before: bb, balance_after: ba, available_before: ab, available_after: aa, ref_type: 'ORDER', ref_id: rid, idempotency_key: key, meta });
    }

    // Seed orders
    const orders = [
      ['淘宝', 'T20231001', '2023-01-15', 120000, 120000, 1200, 'COUNTED', null, '[{"title":"宋制旋裙 真丝汉服","code":"H10001","amount":120000,"rule":"COUNTED_H"}]'],
      ['淘宝', 'T20231115', '2023-11-15', 80000, 80000, 800, 'COUNTED', null, '[{"title":"唐制齐胸 真丝","code":"H10002","amount":80000,"rule":"COUNTED_H"}]'],
      ['抖音', 'DY20240320', '2024-03-20', 50000, 50000, 500, 'COUNTED', null, '[{"title":"明制披风 真丝","code":"H20001","amount":50000,"rule":"COUNTED_H"}]'],
      ['淘宝', 'T20240501', '2024-05-01', 9900, 0, 0, 'EXCLUDED', 'EXCLUDED_TITLE', '[{"title":"特价款 汉服体验","code":"H30001","amount":9900,"rule":"EXCLUDED_TITLE"}]'],
    ];
    for (const [platform, oid, paid, raw, valid, mc, status, reason, items] of orders) {
      await getAdminClient().from('platform_orders').insert({
        platform, order_id: oid, user_id: user.id, paid_at: paid, status: 'TRADE_FINISHED',
        raw_amount: raw, valid_amount: valid, meowcoin_earned: mc, calc_status: status,
        exclude_reason: reason, items_json: JSON.parse(items as string),
      });
    }

    return Response.json({ message: '✅ 初始化成功！', demoPhone: '13800000001', demoPassword: 'Test1234!', adminUser: 'admin', adminPassword: 'Admin123!' });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
