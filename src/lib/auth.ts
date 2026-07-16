import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = 'moming-tang-demo-secret-key-2024';
const JWT_REFRESH_SECRET = 'moming-tang-refresh-secret-2024';

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function signToken(userId: number, role: 'user' | 'admin' = 'user') {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(userId: number, role: 'user' | 'admin' = 'user') {
  return jwt.sign({ userId, role, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch { return null; }
}

export function verifyRefreshToken(token: string): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as any;
  } catch { return null; }
}

export async function getAuthFromCookie(): Promise<{ userId: number; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<{ userId: number; role: string }> {
  const auth = await getAuthFromCookie();
  if (!auth) throw new Error('UNAUTHORIZED');
  return auth;
}

export async function requireAdmin() {
  const auth = await requireAuth();
  if (auth.role !== 'admin') throw new Error('FORBIDDEN');
  return auth;
}

export function setTokenCookie(token: string) {
  return {
    'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=900; SameSite=Lax`
  };
}

export function setRefreshCookie(token: string) {
  return {
    'Set-Cookie': `refresh=${token}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`
  };
}
