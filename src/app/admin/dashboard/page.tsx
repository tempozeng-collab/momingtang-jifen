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
    const res = await fetch(`/api/admin?type=${type}`);
    if (res.status === 403 || res.status === 401) { router.push('/admin'); return; }
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchData(tab); }, [tab]);

  async function doAdjust() {
    setAdjustMsg('');
    const res = await fetch('/api/admin', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: Number(adjust.userId), amount: Number(adjust.amount), reason: adjust.reason }) });
    const d = await res.json();
    if (res.ok) { setAdjustMsg(`✅ 调账成功，新总额：${d.newTotal}`); setAdjust({ userId: '', amount: '', reason: '' }); fetchData(tab); }
    else setAdjustMsg(d.error || '失败');
  }

  async function toggleXuan(userId: number) {
    await fetch('/api/admin', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, tagName: '玄喵' }) });
    fetchData(tab);
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200">
      <header className="bg-stone-800 border-b border-stone-700">
        <div className="max-w-2xl md:max-w-4xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2"><span className="text-base sm:text-xl">🏛️</span><span className="font-bold text-sm sm:text-base">巡查史司</span></div>
          <div className="flex gap-0.5 sm:gap-1">
            {(['overview', 'users', 'orders'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium ${tab === t ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'}`}>
                {t === 'overview' ? '📊 概览' : t === 'users' ? '👤 用户' : '📋 订单'}
              </button>
            ))}
            <button onClick={() => { document.cookie='token=;Path=/;Max-Age=0'; router.push('/admin'); }} className="px-2 py-1 text-[10px] sm:text-xs text-stone-500 hover:text-red-400">退出</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl md:max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {loading && <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" /></div>}

        {tab === 'overview' && data?.stats && !loading && (
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {[['总用户', data.stats.total_users], ['总喵币', data.stats.total_meowcoin?.toLocaleString()], ['已计订单', data.stats.counted_orders], ['排除订单', data.stats.excluded_orders]].map(([label, val]) => (
                <div key={label as string} className="bg-stone-800 rounded-xl p-3 sm:p-4 border border-stone-700">
                  <p className="text-stone-400 text-[10px] sm:text-xs">{label}</p>
                  <p className="text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1">{val as string}</p>
                </div>
              ))}
            </div>

            <div className="bg-stone-800 rounded-xl border border-stone-700 p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-medium mb-2 sm:mb-3">🔧 手动调账</p>
              <div className="flex gap-2 mb-2">
                <input className="flex-1 px-2 sm:px-3 py-2 bg-stone-700 border border-stone-600 rounded-lg text-xs sm:text-sm text-white placeholder-stone-400" placeholder="用户ID" value={adjust.userId} onChange={e => setAdjust({...adjust, userId: e.target.value})} />
                <input className="w-20 sm:w-24 px-2 sm:px-3 py-2 bg-stone-700 border border-stone-600 rounded-lg text-xs sm:text-sm text-white placeholder-stone-400" placeholder="金额" value={adjust.amount} onChange={e => setAdjust({...adjust, amount: e.target.value})} />
              </div>
              <input className="w-full mb-2 px-2 sm:px-3 py-2 bg-stone-700 border border-stone-600 rounded-lg text-xs sm:text-sm text-white placeholder-stone-400" placeholder="理由（必填）" value={adjust.reason} onChange={e => setAdjust({...adjust, reason: e.target.value})} />
              <button onClick={doAdjust} className="px-3 sm:px-4 py-2 bg-amber-500 text-stone-900 rounded-lg text-xs sm:text-sm font-bold">提交调账</button>
              {adjustMsg && <p className="text-[10px] sm:text-xs mt-2 text-amber-400">{adjustMsg}</p>}
            </div>
          </div>
        )}

        {tab === 'users' && data?.users && !loading && (
          <div className="space-y-2">
            {data.users.map((u: any) => (
              <div key={u.id} className="bg-stone-800 rounded-xl border border-stone-700 p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium">{u.nickname} <span className="text-stone-500 text-[10px] sm:text-xs">ID:{u.id}</span></p>
                  <p className="text-[10px] sm:text-xs text-stone-400 truncate">{u.phone} · {u.tier}{u.tags ? ` · ${u.tags}` : ''} · 喵币 {u.total_meowcoin?.toLocaleString()}</p>
                </div>
                <button onClick={() => toggleXuan(u.id)} className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap ${u.tags?.includes('玄喵') ? 'bg-purple-600 text-white' : 'bg-stone-700 text-stone-400'}`}>
                  {u.tags?.includes('玄喵') ? '🌙 已授玄喵' : '授予玄喵'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && data?.orders && !loading && (
          <div className="space-y-2">
            {data.orders.map((o: any) => (
              <div key={o.order_id} className="bg-stone-800 rounded-xl border border-stone-700 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2 flex-wrap gap-1">
                  <div>
                    <span className="text-xs sm:text-sm font-medium">{o.platform} · {o.order_id}</span>
                    <span className="text-[10px] sm:text-xs text-stone-500 ml-1.5 sm:ml-2">{o.user_nickname || '未匹配'}</span>
                  </div>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium ${o.calc_status === 'COUNTED' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {o.calc_status === 'COUNTED' ? `+${o.meowcoin_earned} 喵币` : o.exclude_reason || '未计入'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-stone-400">{o.paid_at?.split('T')[0]} · 原始 ¥{(o.raw_amount / 100).toFixed(2)} · 有效 ¥{(o.valid_amount / 100).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
