'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { action: 'login', phone, password } : { action: 'register', phone, password, nickname }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/');
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-100 to-stone-200 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐱</div>
          <h1 className="text-2xl font-bold text-stone-800">墨名堂</h1>
          <p className="text-stone-500 text-sm mt-1">灵喵京 · 积分系统</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex mb-6 bg-stone-100 rounded-lg p-1">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'login' ? 'bg-white shadow text-stone-800' : 'text-stone-500'}`}>登录</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'register' ? 'bg-white shadow text-stone-800' : 'text-stone-500'}`}>注册</button>
          </div>
          {mode === 'register' && (
            <input className="w-full mb-3 px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="昵称" value={nickname} onChange={e => setNickname(e.target.value)} />
          )}
          <input className="w-full mb-3 px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="手机号" value={phone} onChange={e => setPhone(e.target.value)} />
          <input className="w-full mb-4 px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" type="password" placeholder="密码（8-20位）" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <button onClick={submit} disabled={loading} className="w-full py-3 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 disabled:opacity-50">
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
          {mode === 'login' && (
            <p className="text-center text-xs text-stone-400 mt-4">Demo 账号：13800000001 / Test1234!</p>
          )}
        </div>
        <p className="text-center text-xs text-stone-400 mt-6">墨名堂 · 真丝汉服  &copy; 2025</p>
      </div>
    </div>
  );
}
