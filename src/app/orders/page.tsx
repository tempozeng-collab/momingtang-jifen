'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PLATFORM_NAMES: Record<string, string> = { '淘宝': '🧡', '抖音': '🖤', '小红书': '❤️', '京东': '🔴', '微信小店': '💚', '群接龙': '💜' };

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders').then(r => {
      if (r.status === 401) { router.push('/auth'); return; }
      return r.json();
    }).then(d => { setOrders(d?.orders || []); setLoading(false); });
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-stone-400">←</Link>
          <span className="font-bold text-stone-800">积分订单</span>
          <span className="text-xs text-stone-400">官方店同步</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {orders.length === 0 && <div className="text-center py-12 text-stone-400">暂无同步订单</div>}
        {orders.map((o: any) => (
          <div key={o.order_id} className="bg-white rounded-xl border border-stone-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{PLATFORM_NAMES[o.platform] || '📦'}</span>
                <span className="text-sm font-medium text-stone-700">{o.platform}</span>
                <span className="text-xs text-stone-400">{o.paid_at?.split('T')[0]}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${o.calc_status === 'COUNTED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {o.calc_status === 'COUNTED' ? `+${o.meowcoin_earned} 喵币` : o.exclude_reason || '未计入'}
              </span>
            </div>

            <div className="space-y-1">
              {(o.items_json || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="truncate text-stone-600">{item.title}</span>
                    {item.code && <code className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-400 font-mono">{item.code}</code>}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-stone-500">¥{(item.amount / 100).toFixed(2)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.rule === 'COUNTED_H' ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                      {item.rule === 'COUNTED_H' ? '计入' : item.rule === 'EXCLUDED_X' ? 'X排除' : item.rule === 'EXCLUDED_TITLE' ? '标题词排除' : item.rule === 'SMALL_TRANSFER' ? '打款扣减' : '不计'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-stone-100 flex justify-between text-xs text-stone-400">
              <span>原始金额 ¥{(o.raw_amount / 100).toFixed(2)}</span>
              <span>有效金额 ¥{(o.valid_amount / 100).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
