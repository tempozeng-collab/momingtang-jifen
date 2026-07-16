import { getAuthFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const auth = await getAuthFromCookie();
  if (!auth) return Response.json({ error: '未登录' }, { status: 401 });

  const user = await db.users.findById(auth.userId);
  if (!user) return Response.json({ error: '用户不存在' }, { status: 404 });

  const [ledger, bindings, isXuan] = await Promise.all([
    db.meowcoinLedger.findByUserId(auth.userId),
    db.platformBindings.findByUserId(auth.userId),
    db.userTagAssignments.hasXuan(auth.userId),
  ]);

  const tiers = [
    { code: 'FUXIAO', name: '拂晓喵', min: 0, color: '#7A8BA3' },
    { code: 'BAIXIAO', name: '白小喵', min: 2000, color: '#C0C0C0' },
    { code: 'NAI_NIU', name: '奶牛喵', min: 3000, color: '#2D2D2D' },
    { code: 'LI_HUA', name: '狸花喵', min: 10000, color: '#8B5E3C' },
    { code: 'SAN_HUA', name: '三花喵', min: 20000, color: '#E8C5A0' },
  ];
  const curIdx = tiers.findIndex(t => t.code === user.tier);
  const next = curIdx >= 0 && curIdx < tiers.length - 1 ? tiers[curIdx + 1] : null;
  const allTiers = [...tiers];
  if (isXuan) allTiers.push({ code: 'XUAN_MEOW', name: '玄喵', min: -1, color: '#1A1A2E' });

  const total = Number(user.total_meowcoin); const used = Number(user.used_meowcoin); const frozen = Number(user.frozen_meowcoin);

  return Response.json({
    user: { ...user, total_meowcoin: total, used_meowcoin: used, frozen_meowcoin: frozen, available_meowcoin: total - used - frozen, isXuan, displayTier: user.public_tier || (isXuan ? 'SAN_HUA' : user.tier) },
    tiers: allTiers, currentTier: user.tier,
    nextTier: next ? { ...next, progress: total - (tiers[curIdx]?.min || 0), total: next.min - (tiers[curIdx]?.min || 0) } : null,
    ledger, bindings,
  });
}
