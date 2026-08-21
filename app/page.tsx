import { Suspense } from "react";

import ArcadeClient from "./ArcadeClient";

function ArcadeLoadingShell() {
  return (
    <main className="arcade-viewport">
      <div className="arcade-phone" aria-label="안산강서고 1학년 통합사회 탐구 아케이드">
        <section className="login-screen">
          <p className="eyebrow">안산강서고</p>
          <h1>통합사회 탐구 아케이드</h1>
          <p>학급 아이디로 탐구 임무를 시작합니다.</p>
        </section>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<ArcadeLoadingShell />}>
      <ArcadeClient />
    </Suspense>
  );
}
