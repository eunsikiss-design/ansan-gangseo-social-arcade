"use client";

import { useState } from "react";
import {
  ArrowRight,
  ChartBar,
  BookOpen,
  Buildings,
  ChartLineUp,
  ClipboardText,
  Compass,
  GlobeHemisphereEast,
  GraduationCap,
  Handshake,
  House,
  LockKey,
  Medal,
  ShieldCheck,
  Boat,
  Plant,
  Star,
  Target,
  Trophy,
  UsersThree,
} from "@phosphor-icons/react";

type Unit = {
  id: number;
  title: string;
  shortTitle: string;
  image: string;
  color: string;
  progress: number;
  levels: string[];
};

const units: Unit[] = [
  { id: 1, title: "인권 보장과 헌법", shortTitle: "인권 보장과\n헌법", image: "/assets/unit-1-rights.jpg", color: "#2e855f", progress: 82, levels: ["기본권 카드 분류", "헌법 재판관의 선택", "인권 침해 사건 파일"] },
  { id: 2, title: "사회 정의와 불평등", shortTitle: "사회 정의와\n불평등", image: "/assets/unit-2-justice.jpg", color: "#b4612f", progress: 68, levels: ["정의의 기준 찾기", "불평등 데이터 수사", "공정 도시 설계"] },
  { id: 3, title: "시장경제와 지속가능발전", shortTitle: "시장경제와\n지속가능발전", image: "/assets/unit-3-economy.jpg", color: "#23877f", progress: 51, levels: ["시장 원리 매칭", "합리적 소비 챌린지", "지속가능 기업 경영"] },
  { id: 4, title: "세계화와 평화", shortTitle: "세계화와\n평화", image: "/assets/unit-4-global.jpg", color: "#24729f", progress: 37, levels: ["세계 무역 루트", "갈등 해결 회의", "평화 협정 만들기"] },
  { id: 5, title: "미래와 지속가능한 삶", shortTitle: "미래와\n지속가능한 삶", image: "/assets/unit-5-future.jpg", color: "#65458a", progress: 24, levels: ["인구 변화 예측", "에너지 전환 작전", "SDGs 미래 도시"] },
];

const themes = [
  { title: "국내외\n인권 문제", Icon: UsersThree, color: "#4f8b5c" },
  { title: "사회·공간\n불평등", Icon: Buildings, color: "#a5632c" },
  { title: "현대 세계\n무역", Icon: Boat, color: "#318b88" },
  { title: "세계화의\n문제점", Icon: GlobeHemisphereEast, color: "#347da5" },
  { title: "국제사회\n갈등과 협력", Icon: Handshake, color: "#694d91" },
];

export default function HomePage() {
  const [mode, setMode] = useState<"units" | "themes">("units");
  const [selected, setSelected] = useState<Unit | null>(null);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [missionStarted, setMissionStarted] = useState(false);

  return (
    <main className="reference-shell">
      <div className="reference-stage">
        <img
          className="reference-home-image"
          src="/assets/arcade-home-reference.png"
          alt="안산강서고 1학년 통합사회 탐구 아케이드 홈 화면"
        />

        <button className="hotspot curriculum" aria-label="교과 연계" onClick={() => setSelected(units[0])} />
        <button className="hotspot statistics" aria-label="학습 통계" onClick={() => setTeacherOpen(true)} />
        <button className="hotspot unit-tab" aria-label="단원별 탐험" onClick={() => window.scrollTo({ top: 390, behavior: "smooth" })} />
        <button className="hotspot theme-tab" aria-label="공통주제 도전" onClick={() => window.scrollTo({ top: 610, behavior: "smooth" })} />
        <button className="hotspot mission" aria-label="오늘의 추천 미션 도전하기" onClick={() => { setMissionStarted(true); setSelected(units[0]); }} />
        <button className="hotspot continue" aria-label="공정 도시 만들기 이어하기" onClick={() => setSelected(units[1])} />

        {units.map((unit, index) => (
          <button
            key={unit.id}
            className={`hotspot unit-hotspot unit-${index + 1}`}
            aria-label={`${unit.id}단원 ${unit.title}`}
            onClick={() => setSelected(unit)}
          />
        ))}

        {themes.map((theme, index) => (
          <button
            key={theme.title}
            className={`hotspot theme-hotspot theme-${index + 1}`}
            aria-label={theme.title.replace("\n", " ")}
            onClick={() => setSelected(units[index])}
          />
        ))}

        <button className="hotspot assignment" aria-label="교사 배정 미션 확인하기" onClick={() => setSelected(units[1])} />
        <button className="hotspot nav-home" aria-label="홈" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        <button className="hotspot nav-challenge" aria-label="도전" onClick={() => window.scrollTo({ top: 390, behavior: "smooth" })} />
        <button className="hotspot nav-record" aria-label="기록" onClick={() => setTeacherOpen(true)} />
        <button className="hotspot nav-growth" aria-label="내 성장" onClick={() => setTeacherOpen(true)} />
      </div>

      {teacherOpen && <div className="reference-overlay"><TeacherPanel onClose={() => setTeacherOpen(false)} /></div>}
      {selected && <UnitModal unit={selected} onClose={() => setSelected(null)} />}
      {missionStarted && <span className="sr-only" aria-live="polite">추천 미션을 시작했습니다.</span>}
    </main>
  );

  /* Legacy component implementation retained below for content reuse. */
  return (
    <main className="arcade-shell">
      <div className="arcade-stage">
        <header className="arcade-header">
          <div className="school-lockup">
            <div className="crest"><GraduationCap size={25} weight="fill" /></div>
            <span>안산강서고 1학년 통합사회 수업 자료</span>
          </div>

          <div className="title-lockup" aria-label="통합사회 탐구 아케이드 통합사회 2">
            <h1><span>통합사회 탐구</span><strong>아케이드</strong></h1>
            <div className="subtitle-rule"><i /> <span>✦</span> 통합사회 2 <span>✦</span> <i /></div>
          </div>

          <nav className="quick-tools" aria-label="빠른 메뉴">
            <button type="button" onClick={() => setTeacherOpen(false)}><BookOpen size={24} /><span>교과 연계</span></button>
            <button type="button" onClick={() => setTeacherOpen(true)}><ChartBar size={24} /><span>학습 통계</span></button>
          </nav>
        </header>

        {teacherOpen ? (
          <TeacherPanel onClose={() => setTeacherOpen(false)} />
        ) : (
          <>
            <div className="mode-tabs" role="tablist" aria-label="탐구 유형">
              <button className={mode === "units" ? "active" : ""} onClick={() => setMode("units")}><Compass size={22} />단원별 탐험</button>
              <button className={mode === "themes" ? "active" : ""} onClick={() => setMode("themes")}><GlobeHemisphereEast size={22} />공통주제 도전</button>
            </div>

            <section className="mission-board" aria-label="오늘의 추천 미션">
              <div className="mission-ribbon"><Star size={17} weight="fill" /></div>
              <img src="/assets/mission-justice.jpg" alt="교정적 정의와 권리 구제를 표현한 교과서 삽화" />
              <div className="mission-copy">
                <span className="mission-kicker">오늘의 추천 미션</span>
                <h2>기본권 침해 사례를 해결하라</h2>
                <div className="mission-tags"><span>1단원 · 인권 보장과 헌법</span><span>예상 5분</span></div>
                <button className="challenge-button" onClick={() => setMissionStarted(true)}>{missionStarted ? "미션 이어하기" : "도전하기"}<ArrowRight size={22} /></button>
              </div>
            </section>

            <section className="continue-board">
              <img src="/assets/unit-2-justice.jpg" alt="공정 도시 만들기 미션 삽화" />
              <div><span>계속하기</span><strong>공정 도시 만들기 · 68%</strong><div className="progress"><i style={{ width: "68%" }} /></div></div>
              <button onClick={() => setSelected(units[1])}>이어하기 <ArrowRight size={18} /></button>
            </section>

            {mode === "units" ? (
              <section className="explore-section">
                <SectionTitle>5개 단원</SectionTitle>
                <div className="unit-row">
                  {units.map((unit) => (
                    <button key={unit.id} className="unit-banner" style={{ "--unit": unit.color } as React.CSSProperties} onClick={() => setSelected(unit)}>
                      <span className="unit-badge">{unit.id}</span>
                      <img src={unit.image} alt="" />
                      <span className="unit-shade" />
                      <strong>{unit.shortTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</strong>
                      <span className="unit-ring"><i style={{ width: `${unit.progress}%` }} /></span>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="explore-section theme-focus">
                <SectionTitle>5개 공통주제</SectionTitle>
                <div className="theme-summary"><GlobeHemisphereEast size={34} /><div><strong>어느 주제든 자유롭게 도전</strong><span>단원 순서와 관계없이 자료 분석·의사 결정·문제 해결 미션을 선택할 수 있어요.</span></div></div>
              </section>
            )}

            <section className="theme-section">
              <SectionTitle>공통주제 자유 도전</SectionTitle>
              <div className="theme-row">
                {themes.map(({ title, Icon, color }, index) => (
                  <button key={title} className="theme-pin" style={{ "--pin": color } as React.CSSProperties} onClick={() => setSelected(units[index])}>
                    <span><Icon size={27} weight="duotone" /></span>
                    <strong>{title.split("\n").map((line) => <i key={line}>{line}</i>)}</strong>
                  </button>
                ))}
              </div>
            </section>

            <button className="assignment-card" onClick={() => setSelected(units[1])}>
              <span><ClipboardText size={28} /></span><div><small>교사 배정 미션</small><strong>이번 주: 자료를 활용한 사회문제 분석</strong></div><b>확인하기 <ArrowRight size={17} /></b>
            </button>

            <section className="player-card">
              <div className="player-level"><span><Star size={26} weight="fill" /></span><div><small>탐구자 레벨</small><strong>Lv. 23</strong><div className="progress"><i style={{ width: "68%" }} /></div><em>2,450 / 3,600 EXP</em></div></div>
              <div className="achievement"><span><Target size={34} /></span><div><small>성취수준 진단</small><strong>보통</strong><em>다음 목표: 우수</em></div></div>
              <div className="badges"><div><small>업적 달성 현황</small><strong>18 / 24</strong></div><span><ShieldCheck /><GlobeHemisphereEast /><UsersThree /><Trophy /><LockKey /></span></div>
            </section>

            <nav className="bottom-nav" aria-label="주 메뉴">
              <button className="active"><House /><span>홈</span></button>
              <button onClick={() => setMode("themes")}><Target /><span>도전</span></button>
              <button onClick={() => setTeacherOpen(true)}><ClipboardText /><span>기록</span></button>
              <button onClick={() => setTeacherOpen(true)}><Plant /><span>내 성장</span></button>
            </nav>
          </>
        )}
      </div>

      {selected && <UnitModal unit={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="section-title"><Star size={15} weight="fill" /><h2>{children}</h2><i /></div>;
}

function UnitModal({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`${unit.title} 게임 선택`}>
      <button className="modal-dismiss" onClick={onClose} aria-label="닫기" />
      <section className="unit-modal" style={{ "--unit": unit.color } as React.CSSProperties}>
        <img src={unit.image} alt="" />
        <button className="close-button" onClick={onClose}>×</button>
        <span>UNIT {unit.id}</span><h2>{unit.title}</h2><p>개념 확인에서 수행평가 준비까지 단계별로 도전하세요.</p>
        <div>{unit.levels.map((level, i) => <button key={level}><b>{i + 1}</b><span><strong>{level}</strong><small>{i === 0 ? "개념 확인" : i === 1 ? "자료 분석" : "문제 해결"}</small></span><ArrowRight /></button>)}</div>
      </section>
    </div>
  );
}

function TeacherPanel({ onClose }: { onClose: () => void }) {
  return (
    <section className="teacher-panel">
      <div className="teacher-heading"><button onClick={onClose}>← 학생 화면</button><span>교사용 학습 통계</span><h2>1학년 탐구 현황</h2><p>게임 결과를 성취수준과 수행평가 비계에 연결해 확인합니다.</p></div>
      <div className="teacher-metrics"><article><UsersThree /><span>참여 학생<strong>124 / 132명</strong></span></article><article><ChartLineUp /><span>이번 주 완료율<strong>76%</strong></span></article><article><Medal /><span>평균 성취수준<strong>B</strong></span></article><article><Target /><span>지원 필요 학생<strong>18명</strong></span></article></div>
      <article className="teacher-assignment"><div><small>이번 주 배정</small><h3>자료를 활용한 사회문제 분석</h3><p>2단원 · 불평등 자료 분석 → 주장과 근거 작성</p></div><div className="class-bars">{[["1반",84],["2반",73],["3반",69],["4반",78]].map(([name,value]) => <span key={name}><b>{name}</b><i><em style={{ width: `${value}%` }} /></i><strong>{value}%</strong></span>)}</div></article>
      <article className="scaffold"><h3>수행평가 비계</h3>{["개념 찾기","자료 읽기","근거 고르기","주장 구성","해결책 제안"].map((x,i)=><span key={x}><b>{i+1}</b>{x}</span>)}</article>
    </section>
  );
}
