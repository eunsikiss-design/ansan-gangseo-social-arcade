import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://new-chat-two-delta.vercel.app";
const description = "인권·정의·시장·세계화·미래사회를 실생활 탐구 미션과 AI 튜터 대화로 배우는 통합사회 학습 플랫폼입니다.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "통합사회 탐구 아케이드 | 안산강서고",
  description,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "통합사회 탐구 아케이드",
    title: "통합사회 탐구 아케이드 | 안산강서고",
    description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "인권·정의·시장·세계화·미래사회를 탐구하는 통합사회 탐구 아케이드",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "통합사회 탐구 아케이드 | 안산강서고",
    description,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
