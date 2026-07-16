import { NextRequest } from 'next/server';
import { hashPassword, verifyPassword, signToken, signRefreshToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { action, phone, password, nickname } = await req.json();

    if (action === 'register') {
      if (!phone || !password || !nickname) return Response.json({ error: '缺少参数' }, { status: 400 });
      if (password.length < 8) return Response.json({ error: '密码至少8位' }, { status: 400 });
      const existing = await db.users.findByPhone(phone);
      if (existing) return Response.json({ error: '手机号已注册' }, { status: 409 });

      const hash = hashPassword(password);
      const user = await db.users.create({ phone, password_hash: hash, nickname, tier: 'FUXIAO', total_meowcoin: 0, used_meowcoin: 0, frozen_meowcoin: 0, wu_jing: 0 });
      const token = signToken(user.id); const refresh = signRefreshToken(user.id);
      const resp = Response.json({ user: { id: user.id, phone, nickname, tier: 'FUXIAO', totalMeowcoin: 0 } });
      resp.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax`);
      resp.headers.append('Set-Cookie', `refresh=${refresh}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`);
      return resp;
    }

    if (action === 'login') {
      if (!phone || !password) return Response.json({ error: '缺少参数' }, { status: 400 });
      const user = await db.users.findByPhone(phone);
      if (!user || !verifyPassword(password, user.password_hash)) return Response.json({ error: '手机号或密码错误' }, { status: 401 });

      await db.users.update(user.id, { last_login_at: new Date().toISOString() });
      const token = signToken(user.id); const refresh = signRefreshToken(user.id);
      const resp = Response.json({ user: { id: user.id, phone: user.phone, nickname: user.nickname, tier: user.tier, totalMeowcoin: Number(user.total_meowcoin), usedMeowcoin: Number(user.used_meowcoin) } });
      resp.headers.set('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax`);
      resp.headers.append('Set-Cookie', `refresh=${refresh}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`);
      return resp;
    }

    return Response.json({ error: '未知操作' }, { status: 400 });
  } catch (e: any) { return Response.json({ error: `服务器错误: ${e.message || e}`, stack: process.env.NODE_ENV === 'development' ? e.stack : undefined }, { status: 500 }); }
}
