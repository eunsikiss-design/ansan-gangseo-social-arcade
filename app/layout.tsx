import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "통합사회 탐구 아케이드 | 안산강서고",
  description: "안산강서고 1학년 통합사회 교과서 기반 학습 게임",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
