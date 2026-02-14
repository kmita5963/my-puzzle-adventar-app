import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Keio ⇄ USA 2026 Journey | 留学パズル",
  description: "慶應から米国へ。仲間たちの想いを繋ぐ365日のパズルプロジェクト。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}