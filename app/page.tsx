"use client";

import { useState } from "react";

type Unit = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  progress: number;
  games: string[];
};

const units: Unit[] = [
  { id: 1, title: "인권 보장과 헌법", subtitle: "권리 탐정단", icon: "⚖️", color: "#7257d8", progress: 68, games: ["기본권 사건 파일", "헌법 수호 퍼즐", "인권 뉴스룸"] },
  { id: 2, title: "사회 정의와 불평등", subtitle: "공정 도시 연구소", icon: "🏙️", color: "#e06678", progress: 42, games: ["정의의 저울", "불평등 데이터랩", "분배 원탁회의"] },
  { id: 3, title: "시장경제와 지속가능발전", subtitle: "경제 전략가", icon: "📈", color: "#159d8c", progress: 26, games: ["시장 밸런스", "착한 소비 챌린지", "재무 설계 퀘스트"] },
  { id: 4, title: "세계화와 평화", subtitle: "글로벌 피스메이커", icon: "🌍", color: "#3586d6", progress: 14, games: ["세계 무역 루트", "분쟁 해결 회의", "문화 다양성 카드"] },
  { id: 5, title: "미래와 지속가능한 삶", subtitle: "지구 2050", icon: "🌱", color: "#75a63d", progress: 8, games: ["인구 미래 시뮬", "에너지 전환 작전", "SDGs 도시 설계"] },
];

const themes = [
  ["🧑‍⚖️", "국내외 인권 문제", "사례 판단 · 권리 구제"],
  ["🏘️", "사회·공간 불평등", "자료 분석 · 정책 설계"],
  ["🚢", "현대 세계 무역", "가치 사슬 · 공정 무역"],
  ["🌐", "세계화의 문제점", "문화 · 경제 쟁점"],
  ["🕊️", "국제사회 갈등과 협력", "분쟁 · 평화 구축"],
];

export default function Home() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [tab, setTab] = useState<"units" | "themes">("units");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [missionStarted, setMissionStarted] = useState(false);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">강서</div>
          <div>
            <p className="school-label">안산강서고 1학년 통합사회 수업 자료</p>
            <h1>통합사회 탐구 아케이드</h1>
          </div>
        </div>
        <div className="role-switch" aria-label="화면 역할 선택">
          <button className={role === "student" ? "active" : ""} onClick={() => setRole("student")}>학생</button>
          <button className={role === "teacher" ? "active" : ""} onClick={() => setRole("teacher")}>교사</button>
        </div>
      </header>

      {role === "student" ? (
        <>
          <section className="hero">
            <div>
              <span className="eyebrow">오늘의 추천 미션 · 1단원</span>
              <h2>기본권 침해 사례를<br />해결하라!</h2>
              <p>사례 속 쟁점을 찾고 알맞은 권리 구제 방법을 선택해 보세요.</p>
              <div className="hero-meta"><span>⏱ 5분</span><span>⭐ 120 XP</span><span>난이도 보통</span></div>
              <button className="primary-button" onClick={() => setMissionStarted(true)}>
                {missionStarted ? "미션 진행 중 · 이어하기" : "오늘의 미션 시작"} <span>→</span>
              </button>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="case-card back">헌법</div>
              <div className="case-card front"><span>사건<br />FILE 01</span><b>?</b></div>
              <div className="magnifier">⌕</div>
            </div>
          </section>

          <section className="continue-card">
            <div className="continue-icon">🏙️</div>
            <div className="continue-copy">
              <span>이어서 도전하기</span>
              <strong>공정 도시 만들기</strong>
              <div className="progress-track"><i style={{ width: "68%" }} /></div>
            </div>
            <b>68%</b>
            <button aria-label="이어하기">▶</button>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <div><span className="eyebrow">원하는 길부터 자유롭게</span><h2>탐구 모드 선택</h2></div>
              <div className="tab-switch">
                <button className={tab === "units" ? "active" : ""} onClick={() => setTab("units")}>단원별 탐험</button>
                <button className={tab === "themes" ? "active" : ""} onClick={() => setTab("themes")}>공통주제 도전</button>
              </div>
            </div>

            {tab === "units" ? (
              <div className="unit-grid">
                {units.map((unit) => (
                  <button className="unit-card" key={unit.id} onClick={() => setSelectedUnit(unit)} style={{ "--accent": unit.color } as React.CSSProperties}>
                    <span className="unit-number">0{unit.id}</span><span className="unit-icon">{unit.icon}</span>
                    <small>{unit.subtitle}</small><strong>{unit.title}</strong>
                    <div className="unit-progress"><i style={{ width: `${unit.progress}%` }} /></div>
                    <span className="unit-foot">진행률 {unit.progress}% <b>도전 →</b></span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="theme-grid">
                {themes.map(([icon, title, detail], index) => (
                  <button className="theme-card" key={title} onClick={() => setSelectedUnit(units[index])}>
                    <span>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div><b>→</b>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="growth-section">
            <div className="section-heading"><div><span className="eyebrow">게임 결과가 학습의 증거로</span><h2>나의 성장 리포트</h2></div><button className="text-button">전체 기록 보기 →</button></div>
            <div className="stat-grid">
              <article><span className="stat-icon violet">✦</span><div><small>탐구자 레벨</small><strong>Lv. 7 사회 탐험가</strong><p>다음 레벨까지 280 XP</p></div></article>
              <article><span className="stat-icon coral">A</span><div><small>성취수준 진단</small><strong>B 수준 · 성장 중</strong><p>자료 해석 역량이 상승했어요</p></div></article>
              <article><span className="stat-icon green">✓</span><div><small>수행평가 비계</small><strong>3단계 · 근거 제시</strong><p>주장-근거 연결을 연습 중이에요</p></div></article>
            </div>
          </section>
        </>
      ) : (
        <TeacherDashboard />
      )}

      <footer><span>안산강서고등학교 · 2026학년도 1학년 통합사회</span><span>교과서 기반 학습 게임 MVP</span></footer>

      {selectedUnit && (
        <div className="modal-backdrop">
          <button className="backdrop-dismiss" aria-label="단원 선택 창 닫기" onClick={() => setSelectedUnit(null)} />
          <section className="mission-modal" style={{ "--accent": selectedUnit.color } as React.CSSProperties}>
            <button className="modal-close" onClick={() => setSelectedUnit(null)}>×</button>
            <span className="modal-icon">{selectedUnit.icon}</span><small>0{selectedUnit.id} UNIT · {selectedUnit.subtitle}</small><h2>{selectedUnit.title}</h2>
            <p>짧은 개념 확인부터 수행평가형 탐구까지 단계적으로 도전합니다.</p>
            <div className="game-list">{selectedUnit.games.map((game, i) => <button key={game}><i>{i + 1}</i><span><strong>{game}</strong><small>{i === 0 ? "개념 확인" : i === 1 ? "자료 해석" : "수행평가 비계"}</small></span><b>→</b></button>)}</div>
            <button className="primary-button full" onClick={() => { setMissionStarted(true); setSelectedUnit(null); }}>첫 게임 시작</button>
          </section>
        </div>
      )}
    </main>
  );
}

function TeacherDashboard() {
  return (
    <section className="teacher-dashboard">
      <div className="teacher-hero"><span className="eyebrow">교사용 대시보드</span><h2>1학년 학습 현황을 한눈에</h2><p>게임 결과를 성취수준과 수행평가 준비 단계로 연결합니다.</p><button className="primary-button">새 미션 배정 +</button></div>
      <div className="teacher-stats"><article><small>참여 학생</small><strong>124<em>/132명</em></strong></article><article><small>이번 주 완료율</small><strong>76%</strong></article><article><small>평균 성취수준</small><strong>B</strong></article><article><small>도움이 필요한 학생</small><strong>18명</strong></article></div>
      <div className="teacher-grid">
        <article className="assignment-panel"><div className="panel-title"><div><small>이번 주 배정</small><h3>자료를 활용한 사회문제 분석</h3></div><span>진행 중</span></div><p>2단원 · 불평등 자료 해석 → 주장과 근거 작성</p><div className="class-progress"><span>1반 <i><b style={{ width: "84%" }} /></i>84%</span><span>2반 <i><b style={{ width: "73%" }} /></i>73%</span><span>3반 <i><b style={{ width: "69%" }} /></i>69%</span><span>4반 <i><b style={{ width: "78%" }} /></i>78%</span></div></article>
        <article className="achievement-panel"><div className="panel-title"><div><small>성취수준 분포</small><h3>최근 7일 진단</h3></div></div><div className="bars"><span><i style={{ height: "34%" }} />A<small>22명</small></span><span><i style={{ height: "72%" }} />B<small>61명</small></span><span><i style={{ height: "48%" }} />C<small>32명</small></span><span><i style={{ height: "18%" }} />D<small>9명</small></span></div></article>
      </div>
      <div className="scaffold-panel"><div><span className="eyebrow">수행평가 연계 비계</span><h2>게임 레벨이 올라갈수록</h2></div>{["개념 찾기", "자료 읽기", "근거 고르기", "주장 구성", "해결안 제안"].map((step, i) => <span key={step}><b>{i + 1}</b>{step}</span>)}</div>
    </section>
  );
}
