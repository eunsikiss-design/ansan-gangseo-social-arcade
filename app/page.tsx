"use client";

import { useEffect, useState } from "react";
import ArcadeClient from "./ArcadeClient";

function ArcadeLoadingShell() {
  return (
    <main className="arcade-viewport">
      <div className="arcade-phone" aria-label="안산강서고 1학년 통합사회 탐구 아케이드">
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff", textAlign: "center", padding: "20px" }}>
          <span style={{ fontSize: "42px", marginBottom: "12px" }}>🏛️</span>
          <h1 style={{ fontSize: "22px", color: "var(--gold)", margin: "0 0 6px", fontWeight: 800 }}>통합사회 탐구 아케이드</h1>
          <p style={{ fontSize: "13.5px", color: "var(--teal-soft)", margin: 0 }}>안산강서고등학교 탐구 아케이드 로딩 중...</p>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ArcadeLoadingShell />;
  }

  return <ArcadeClient />;
}
