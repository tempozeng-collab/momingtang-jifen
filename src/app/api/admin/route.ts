import { NextRequest } from 'next/server';
import { verifyPassword, signToken } from '@/lib/auth';
import { getAuthFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { action, username, password } = await req.json();
  if (action === 'login') {
    const admin = await db.adminUsers.findByUsername(username);
    if (!admin || !verifyPassword(password, admin.password_hash)) return Response.json({ error: '账号或密码错误' }, { status: 401 });
    const token = signToken(admin.id, 'admin');
    const resp = Response.json({ user: { id: admin.id, username: admin.username, displayName: admin.display_name, role: admin.role } });
    resp.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`);
    return resp;
  }
  return Response.json({ error: '未知操作' }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const auth = await getAuthFromCookie();
  if (!auth || auth.role !== 'admin') return Response.json({ error: '无权限' }, { status: 403 });
  const type = req.nextUrl.searchParams.get('type') || 'overview';
  if (type === 'users') return Response.json({ users: await db.users.findWithTags() });
  if (type === 'orders') return Response.json({ orders: await db.platformOrders.findAllWithUser() });
  return Response.json({ stats: await db.stats() });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthFromCookie();
  if (!auth || auth.role !== 'admin') return Response.json({ error: '无权限' }, { status: 403 });
  const { userId, amount, reason } = await req.json();
  if (!userId || !amount || !reason) return Response.json({ error: '缺少参数' }, { status: 400 });

  const user = await db.users.findById(userId);
  if (!user) return Response.json({ error: '用户不存在' }, { status: 404 });

  const newTotal = Number(user.total_meowcoin) + Number(amount);
  const available = Number(user.total_meowcoin) - Number(user.used_meowcoin) - Number(user.frozen_meowcoin);
  const newAvailable = available + Number(amount);

  await db.users.update(userId, { total_meowcoin: newTotal });
  await db.meowcoinLedger.insert({
    user_id: userId, direction: Number(amount) >= 0 ? 'IN' : 'OUT', type: 'ADJUST',
    amount: Math.abs(Number(amount)), balance_before: Number(user.total_meowcoin), balance_after: newTotal,
    available_before: available, available_after: newAvailable,
    ref_type: 'ADJUST', ref_id: `adj-${Date.now()}`, idempotency_key: `adj-${Date.now()}${Math.random()}`,
    meta: { reason, operator: auth.userId },
  });
  return Response.json({ success: true, newTotal, newAvailable });
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthFromCookie();
  if (!auth || auth.role !== 'admin') return Response.json({ error: '无权限' }, { status: 403 });
  const { userId, tagName } = await req.json();
  const tag = await db.userTags.findByName(tagName);
  if (!tag) return Response.json({ error: '标签不存在' }, { status: 404 });

  const existing = await db.userTagAssignments.findByUserAndTag(userId, tag.id);
  if (existing) {
    await db.userTagAssignments.remove(userId, tag.id);
    const u = await db.users.findById(userId);
    let tier = 'FUXIAO';
    if (Number(u.total_meowcoin) >= 20000) tier = 'SAN_HUA';
    else if (Number(u.total_meowcoin) >= 10000) tier = 'LI_HUA';
    else if (Number(u.total_meowcoin) >= 3000) tier = 'NAI_NIU';
    else if (Number(u.total_meowcoin) >= 2000) tier = 'BAIXIAO';
    await db.users.update(userId, { tier, public_tier: null });
    return Response.json({ success: true, action: 'removed', tier });
  } else {
    await db.userTagAssignments.insert({ user_id: userId, tag_id: tag.id });
    await db.users.update(userId, { tier: 'XUAN_MEOW', public_tier: 'SAN_HUA' });
    return Response.json({ success: true, action: 'added', tier: 'XUAN_MEOW' });
  }
}
