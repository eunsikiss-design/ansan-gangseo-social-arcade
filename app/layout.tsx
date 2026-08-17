import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://new-chat-two-delta.vercel.app";
const title = "통합사회 탐구 아케이드 | 안산강서고";
const description = "인권·정의·시장·세계화·미래사회를 실생활 탐구 미션과 AI 튜터 대화로 배우는 통합사회 학습 플랫폼입니다.";
const ogImage = `${siteUrl}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ko_KR" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:site_name" content="통합사회 탐구 아케이드" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="인권·정의·시장·세계화·미래사회를 탐구하는 통합사회 탐구 아케이드" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </head>
      <body>{children}</body>
    </html>
  );
}
