import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "灵喵京 · 墨名堂",
  description: "墨名堂积分系统",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-800 antialiased">{children}</body>
    </html>
  );
}
