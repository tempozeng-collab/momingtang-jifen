'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'users' | 'orders'>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adjust, setAdjust] = useState({ userId: '', amount: '', reason: '' });
  const [adjustMsg, setAdjustMsg] = useState('');

  async function fetchData(type = 'overview') {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?type=${type}`);
      if (res.status === 403 || res.status === 401) { router.push('/admin'); return; }
      setData(await res.json());
    } catch { }
    setLoading(false);
  }

  useEffect(() => { fetchData(tab); }, [tab]);

  async function doAdjust() {
    setAdjustMsg('');
    const res = await fetch('/api/admin', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(adjust.userId), amount: Number(adjust.amount), reason: adjust.reason }),
    });
    const d = await res.json();
    if (res.ok) { setAdjustMsg(`调账成功！新总额：${d.newTotal}`); setAdjust({ userId: '', amount: '', reason: '' }); fetchData(tab); }
    else { setAdjustMsg(d.error || '失败'); }
  }

  async function toggleXuan(userId: number) {
    await fetch('/api/admin', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tagName: '玄喵' }),
    });
    fetchData(tab);
  }

  if (loading) return <div className="min-h-screen bg-stone-900 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200">
      <header className="bg-stone-800 border-b border-stone-700">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2"><span className="text-xl">🏛️</span><span className="font-bold">巡查史司</span></div>
          <div className="flex gap-1">
            {(['overview', 'users', 'orders'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === t ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'}`}>
                {t === 'overview' ? '📊 概览' : t === 'users' ? '👤 用户' : '📋 订单'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === 'overview' && data?.stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[['总用户', data.stats.total_users], ['总喵币', data.stats.total_meowcoin?.toLocaleString()], ['已计订单', data.stats.counted_orders], ['排除订单', data.stats.excluded_orders]].map(([label, val]) => (
                <div key={label as string} className="bg-stone-800 rounded-xl p-4 border border-stone-700">
                  <p className="text-stone-400 text-xs">{label}</p>
                  <p className="text-2xl font-bold mt-1">{val as string}</p>
                </div>
              ))}
            </div>

            {/* Adjust */}
            <div className="bg-stone-800 rounded-xl border border-stone-700 p-4">
              <p className="text-sm font-medium mb-3">🔧 手动调账（Demo）</p>
              <div className="flex gap-2 mb-2">
                <input className="flex-1 px-3 py-2 bg-stone-700 border border-stone-600 rounded-lg text-sm text-white placeholder-stone-400" placeholder="用户ID" value={adjust.userId} onChange={e => setAdjust({...adjust, userId: e.target.value})} />
                <input className="w-24 px-3 py-2 bg-stone-700 border border-stone-600 rounded-lg text-sm text-white placeholder-stone-400" placeholder="金额" value={adjust.amount} onChange={e => setAdjust({...adjust, amount: e.target.value})} />
              </div>
              <input className="w-full mb-2 px-3 py-2 bg-stone-700 border border-stone-600 rounded-lg text-sm text-white placeholder-stone-400" placeholder="理由（必填）" value={adjust.reason} onChange={e => setAdjust({...adjust, reason: e.target.value})} />
              <button onClick={doAdjust} className="px-4 py-2 bg-amber-500 text-stone-900 rounded-lg text-sm font-bold">提交调账</button>
              {adjustMsg && <p className="text-xs mt-2 text-amber-400">{adjustMsg}</p>}
            </div>
          </div>
        )}

        {tab === 'users' && data?.users && (
          <div className="space-y-2">
            {data.users.map((u: any) => (
              <div key={u.id} className="bg-stone-800 rounded-xl border border-stone-700 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{u.nickname} <span className="text-stone-500 text-xs">ID:{u.id}</span></p>
                  <p className="text-xs text-stone-400">{u.phone} · {u.tier}{u.tags ? ` · ${u.tags}` : ''} · 喵币 {u.total_meowcoin?.toLocaleString()}</p>
                </div>
                <button onClick={() => toggleXuan(u.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${u.tags?.includes('玄喵') ? 'bg-purple-600 text-white' : 'bg-stone-700 text-stone-400'}`}>
                  {u.tags?.includes('玄喵') ? '🌙 已授玄喵' : '授予玄喵'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && data?.orders && (
          <div className="space-y-2">
            {data.orders.map((o: any) => (
              <div key={o.order_id} className="bg-stone-800 rounded-xl border border-stone-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-medium">{o.platform} · {o.order_id}</span>
                    <span className="text-xs text-stone-500 ml-2">{o.user_nickname || '未匹配'}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${o.calc_status === 'COUNTED' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {o.calc_status === 'COUNTED' ? `+${o.meowcoin_earned} 喵币` : o.exclude_reason || '未计入'}
                  </span>
                </div>
                <p className="text-xs text-stone-400">{o.paid_at?.split('T')[0]} · 原始 ¥{(o.raw_amount / 100).toFixed(2)} · 有效 ¥{(o.valid_amount / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
