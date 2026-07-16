import Link from 'next/link';

export default function LockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-stone-800 mb-2">即将开放</h1>
        <p className="text-stone-500 text-sm mb-6">该功能正在建设中，敬请期待后续版本</p>
        <Link href="/" className="inline-block px-6 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700">返回觐见殿</Link>
      </div>
    </div>
  );
}
