'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MANOR_DATA: Record<string, { name: string; grid: string; desc: string; bg: string; scene: string; emoji: string }> = {
  FUXIAO: { name: '茅檐·雅舍', grid: '3×3', desc: '青砖黛瓦、竹篱茅舍、一榻一几、窗外修竹、案头香炉', bg: 'from-emerald-700 via-teal-600 to-cyan-700', scene: '🌿🎋🏠🍵', emoji: '🐱' },
  BAIXIAO: { name: '小筑·听雨', grid: '5×5', desc: '回廊连接正厢侧厢、月亮门框景、池塘睡莲、桂花树下石桌', bg: 'from-teal-600 via-cyan-500 to-blue-600', scene: '🏡🌧️🌙🪷', emoji: '😺' },
  NAI_NIU: { name: '庭院·藏锋', grid: '7×7', desc: '花厅挂画、书斋藏书、假山流水、猫爬架、秋千', bg: 'from-slate-700 via-zinc-600 to-stone-700', scene: '🏛️📚⛲🎠', emoji: '🐄' },
  LI_HUA: { name: '府邸·织锦', grid: '9×9', desc: '画舫泊湖、温室奇葩、藏经楼、纹样展示墙', bg: 'from-amber-700 via-yellow-600 to-orange-700', scene: '🏰🛶🌺📜', emoji: '🐯' },
  SAN_HUA: { name: '王府·御赐', grid: '12×12', desc: '琉璃瓦、御赐匾额、灵猫御座、王府大街、御花园、九重门', bg: 'from-amber-400 via-yellow-300 to-orange-400', scene: '👑🏯🌸🎇', emoji: '👑' },
  XUAN_MEOW: { name: '玄境·归墟', grid: '—', desc: '星辰大海、虚空之境、玄喵独享', bg: 'from-indigo-900 via-purple-900 to-slate-900', scene: '🌙✨💫🌌', emoji: '🌙' },
};

const TIERS = [
  { code:'FUXIAO', name:'拂晓喵', min:0, color:'#7A8BA3', bg:'from-slate-400 to-slate-500', emoji:'🐱' },
  { code:'BAIXIAO', name:'白小喵', min:2000, color:'#C0C0C0', bg:'from-stone-300 to-stone-400', emoji:'😺' },
  { code:'NAI_NIU', name:'奶牛喵', min:3000, color:'#2D2D2D', bg:'from-stone-700 to-stone-800', emoji:'🐄' },
  { code:'LI_HUA', name:'狸花喵', min:10000, color:'#8B5E3C', bg:'from-amber-600 to-amber-700', emoji:'🐯' },
  { code:'SAN_HUA', name:'三花喵', min:20000, color:'#E8C5A0', bg:'from-amber-300 to-orange-400', emoji:'👑' },
];

export default function ManorPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/me').then(r => { if (r.status === 401) { router.push('/auth'); return; } return r.json(); }).then(setData);
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" /></div>;

  const { user } = data;
  const manor = MANOR_DATA[user.tier] || MANOR_DATA.FUXIAO;

  return (
    <div className="min-h-screen bg-stone-900">
      <div className={`min-h-[50vh] sm:min-h-[60vh] bg-gradient-to-br ${manor.bg} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 text-[12rem] sm:text-[20rem] flex items-center justify-center select-none">{manor.emoji}</div>
        <div className="relative text-center text-white px-4 py-8">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">{manor.emoji}</div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{manor.name}</h1>
          <p className="text-white/70 text-xs sm:text-sm mb-0.5 sm:mb-1">{manor.scene}</p>
          <p className="text-white/50 text-[10px] sm:text-xs max-w-[280px] sm:max-w-sm mx-auto">{manor.desc}</p>
          <div className="mt-4 sm:mt-6 inline-block bg-white/20 backdrop-blur rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">网格 {manor.grid} · 静态展示</div>
          <p className="mt-2 sm:mt-3 text-white/40 text-[10px] sm:text-xs">装饰功能即将开放，敬请期待</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">全阶位预览</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {TIERS.map(t => {
            const m = MANOR_DATA[t.code]; if (!m) return null;
            const isCurrent = t.code === user.tier;
            return (
              <div key={t.code} className={`rounded-xl overflow-hidden border ${isCurrent ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white/10'}`}>
                <div className={`h-20 sm:h-24 bg-gradient-to-br ${m.bg} flex items-center justify-center relative`}>
                  <span className="text-3xl sm:text-4xl opacity-50">{m.emoji}</span>
                  {isCurrent && <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-amber-400 text-stone-900 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium">当前</span>}
                </div>
                <div className="bg-stone-800 p-2 sm:p-3">
                  <p className={`text-xs sm:text-sm font-medium ${isCurrent ? 'text-white' : 'text-white/60'}`}>{m.name}</p>
                  <p className="text-[10px] sm:text-xs text-white/30 mt-0.5 sm:mt-1">网格 {m.grid}</p>
                </div>
              </div>
            );
          })}
        </div>
        <Link href="/" className="block text-center text-white/40 text-xs sm:text-sm mt-4 sm:mt-6 hover:text-white/70 no-underline">← 返回聚贤堂</Link>
      </div>
    </div>
  );
}
