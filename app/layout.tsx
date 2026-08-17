import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://new-chat-two-delta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "통합사회 탐구 아케이드 | 안산강서고",
  description: "인권·헌법 개념을 익히고 AI 튜터와 함께 탐구 미션에 도전하세요.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "통합사회 탐구 아케이드",
    title: "통합사회 탐구 아케이드 | 안산강서고",
    description: "인권·헌법 개념을 익히고 AI 튜터와 함께 탐구 미션에 도전하세요.",
    images: [
      {
        url: "/characters/ari_default.jpg",
        width: 1200,
        height: 630,
        alt: "통합사회 탐구 아케이드 대표 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "통합사회 탐구 아케이드 | 안산강서고",
    description: "인권·헌법 개념을 익히고 AI 튜터와 함께 탐구 미션에 도전하세요.",
    images: ["/characters/ari_default.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
