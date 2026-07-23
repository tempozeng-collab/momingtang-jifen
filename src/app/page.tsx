'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TIER_INFO: Record<string, { name: string; color: string; bg: string; icon: string }> = {
  FUXIAO: { name: '拂晓喵', color: '#7A8BA3', bg: 'from-slate-400 to-slate-500', icon: '🐱' },
  BAIXIAO: { name: '白小喵', color: '#C0C0C0', bg: 'from-stone-300 to-stone-400', icon: '😺' },
  NAI_NIU: { name: '奶牛喵', color: '#2D2D2D', bg: 'from-stone-700 to-stone-800', icon: '🐄' },
  LI_HUA: { name: '狸花喵', color: '#8B5E3C', bg: 'from-amber-600 to-amber-700', icon: '🐯' },
  SAN_HUA: { name: '三花喵', color: '#E8C5A0', bg: 'from-amber-300 to-orange-400', icon: '👑' },
  XUAN_MEOW: { name: '玄喵', color: '#1A1A2E', bg: 'from-purple-900 to-indigo-900', icon: '🌙' },
};

const LOCKED_MODULES = [
  { name: '午门', desc: '签到·任务', path: '/locked', icon: '📋' },
  { name: '集珍坊', desc: '积分兑换', path: '/locked', icon: '🏪' },
  { name: '试衣阁', desc: '虚拟试穿', path: '/locked', icon: '👘' },
  { name: '丝物所', desc: 'DIY 工坊', path: '/locked', icon: '✂️' },
  { name: '藏经阁', desc: '汉服百科', path: '/locked', icon: '📚' },
  { name: '节令司', desc: '节气日历', path: '/locked', icon: '📅' },
  { name: '通玄镜', desc: '社交', path: '/locked', icon: '🔮' },
  { name: '出云门', desc: '雾精', path: '/locked', icon: '☁️' },
];

export default function HomePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me').then(r => {
      if (r.status === 401) { router.push('/auth'); return; }
      return r.json();
    }).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return null;

  const { user, tiers, nextTier } = data;
  const ti = TIER_INFO[user.tier] || TIER_INFO.FUXIAO;
  const userTiers = tiers ||[];

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl md:max-w-4xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-xl">🐱</span>
            <span className="font-bold text-sm sm:text-base text-stone-800">墨名堂</span>
            <span className="text-[10px] sm:text-xs text-stone-400">灵喵京</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/manor" className="text-xs sm:text-sm text-stone-500 hover:text-stone-700">🏯<span className="hidden sm:inline ml-0.5">兰室</span></Link>
            <button onClick={() => { document.cookie = 'token=; Path=/; Max-Age=0'; router.push('/auth'); }} className="text-[10px] sm:text-xs text-stone-400 hover:text-red-500">退出</button>
          </div>
        </div>
      </header>
      <main className="max-w-2xl md:max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
        {/* Tier Card */}
        <div className={`rounded-xl sm:rounded-2xl bg-gradient-to-br ${ti.bg} p-4 sm:p-5 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 text-6xl sm:text-8xl opacity-10">{ti.icon}</div>
          <div className="relative">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <span className="text-2xl sm:text-3xl">{ti.icon}</span>
              <div>
                <p className="text-white/70 text-[10px] sm:text-xs">当前阶位</p>
                <p className="text-lg sm:text-xl font-bold">{ti.name}</p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6 text-white/80 text-xs sm:text-sm">
              <div><span className="block text-xl sm:text-2xl font-bold text-white">{user.total_meowcoin.toLocaleString()}</span>总喵币</div>
              <div><span className="block text-xl sm:text-2xl font-bold text-white">{user.available_meowcoin.toLocaleString()}</span>可用</div>
              <div><span className="block text-xl sm:text-2xl font-bold text-white">{user.frozen_meowcoin}</span>冻结</div>
            </div>
            {nextTier && (
              <div className="mt-3 bg-white/20 rounded-full h-1.5 sm:h-2 overflow-hidden">
                <div className="h-full bg-white/60 rounded-full" style={{ width: `${Math.min(100, (nextTier.progress / nextTier.total) * 100)}%` }} />
              </div>
            )}
            {nextTier && <p className="text-white/60 text-[10px] sm:text-xs mt-1">距下一阶「{TIER_INFO[nextTier.code]?.name}」还需 {(nextTier.total - nextTier.progress).toLocaleString()} 喵币</p>}
            {!nextTier && !user.isXuan && <p className="text-white/60 text-[10px] sm:text-xs mt-1">已达最高阶位 🎉</p>}
          </div>
        </div>

        {/* Tier row */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-stone-400 mb-2 sm:mb-3">阶位预览</p>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {userTiers.filter((t: any) => t.code !== 'XUAN_MEOW').map((t: any, i: number) => (
              <div key={t.code} className={`flex-1 text-center py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs transition ${t.code === user.tier ? 'bg-stone-800 text-white font-medium' : 'bg-stone-50 text-stone-400'}`}>
                {t.name?.split('喵')[0]}喵
              </div>
            ))}
          </div>
        </div>

        {/* Quick Module Entry */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-stone-700 mb-2 sm:mb-3">快捷入口</p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { name: '兰室', icon: '🏯', path: '/manor', active: true },
              { name: '积分订单', icon: '📜', path: '/orders', active: true },
              { name: '午门', icon: '📋', path: '/locked', active: false },
              { name: '集珍坊', icon: '🏪', path: '/locked', active: false },
            ].map(m => (
              m.active ? (
                <Link key={m.name} href={m.path} className="bg-white border border-stone-200 rounded-xl p-2 sm:p-3 text-center hover:border-amber-300 transition no-underline">
                  <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">{m.icon}</div>
                  <div className="text-[10px] sm:text-xs text-stone-600">{m.name}</div>
                </Link>
              ) : (
                <div key={m.name} className="bg-stone-50 border border-stone-200 rounded-xl p-2 sm:p-3 text-center opacity-40">
                  <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">{m.icon}</div>
                  <div className="text-[10px] sm:text-xs text-stone-400">{m.name}<br/><span className="text-[8px] sm:text-[10px]">待开放</span></div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Platform Bindings */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-stone-700 mb-2 sm:mb-3">平台绑定</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
            {['淘宝','小红书','抖音','微信小店','群接龙','京东'].map((p, i) => {
              const bound = (data.bindings || []).some((b: any) => b.platform === p);
              return (
                <div key={p} className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs text-center ${bound ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-stone-50 text-stone-400 border border-stone-200'}`}>
                  {bound ? '✅ ' : '⚪ '}{p}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Flow */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-stone-700 mb-2 sm:mb-3">最近流水</p>
          {(data.ledger || []).slice(0, 8).map((tx: any, i: number) => {
            let desc = ''; try { desc = JSON.parse(tx.meta).desc || ''; } catch { }
            return (
              <div key={i} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="text-xs sm:text-sm text-stone-700 truncate">{tx.type === 'ORDER_SYNC' ? '订单同步' : tx.type === 'ADJUST' ? '调账' : tx.type}</p>
                  <p className="text-[10px] sm:text-xs text-stone-400 truncate">{tx.created_at?.split('T')[0]} {desc && '·'} {desc}</p>
                </div>
                <span className={`text-xs sm:text-sm font-mono font-medium whitespace-nowrap ${tx.direction === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.direction === 'IN' ? '+' : '-'}{tx.amount}
                </span>
              </div>
            );
          })}
        </div>

        {/* More locked modules */}
        <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-stone-700 mb-2 sm:mb-3">更多模块 <span className="text-[10px] sm:text-xs text-stone-400 font-normal">即将开放</span></p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {LOCKED_MODULES.map(m => (
              <div key={m.name} className="py-2 sm:py-3 px-1.5 sm:px-2 rounded-lg bg-stone-50 border border-stone-200 text-center opacity-45">
                <div className="text-base sm:text-lg mb-0.5 sm:mb-1">{m.icon}</div>
                <div className="text-[10px] sm:text-xs text-stone-400">{m.name}</div>
                <div className="text-[8px] sm:text-[10px] text-stone-300">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin link */}
        <div className="text-center pb-4">
          <a href="/admin" className="text-[10px] sm:text-xs text-stone-300 hover:text-stone-500 no-underline">🏛️ 后台管理</a>
        </div>
      </main>
    </div>
  );
}
