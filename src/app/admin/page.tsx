'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function login() {
    setError('');
    const res = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'login', username, password }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    router.push('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🏛️</div>
          <h1 className="text-xl font-bold text-white">巡查史司</h1>
          <p className="text-stone-400 text-sm mt-1">墨名堂 · 后台管理</p>
        </div>
        <div className="bg-stone-800 rounded-xl border border-stone-700 p-6">
          <input className="w-full mb-3 px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="管理员账号" value={username} onChange={e => setUsername(e.target.value)} />
          <input className="w-full mb-4 px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500" type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button onClick={login} className="w-full py-3 bg-amber-500 text-stone-900 rounded-lg text-sm font-bold hover:bg-amber-400">登录后台</button>
          <p className="text-center text-xs text-stone-500 mt-4">Demo：admin / Admin123!</p>
        </div>
      </div>
    </div>
  );
}
