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
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
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

type Question = {
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
};

type ActiveGame = { unit: Unit; level: number };

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

const questions: Record<number, Question[]> = {
  1: [
    { prompt: "국가 권력의 간섭을 받지 않고 자유롭게 생활할 권리는?", choices: ["자유권", "사회권", "청구권"], answer: 0, explanation: "자유권은 국가 권력의 부당한 간섭을 배제하도록 요구하는 권리입니다." },
    { prompt: "기본권 침해 여부를 최종적으로 심판하는 기관은?", choices: ["국회", "헌법재판소", "국무회의"], answer: 1, explanation: "헌법재판소는 헌법소원심판 등을 통해 기본권 침해를 구제합니다." },
    { prompt: "기본권 제한이 지켜야 할 원칙으로 가장 적절한 것은?", choices: ["과잉 금지", "다수결 우선", "행정 편의"], answer: 0, explanation: "기본권 제한은 목적과 수단이 적절하고 침해가 최소여야 합니다." },
  ],
  2: [
    { prompt: "능력과 성과에 따라 보상하는 분배 기준은?", choices: ["업적", "필요", "절대적 평등"], answer: 0, explanation: "업적에 따른 분배는 개인이 달성한 성과나 기여를 기준으로 합니다." },
    { prompt: "사회적 약자에게 더 많은 지원을 제공하는 이유는?", choices: ["실질적 평등", "형식적 자유", "시장 확대"], answer: 0, explanation: "출발 조건의 차이를 보완해 실질적인 기회와 결과의 평등을 추구합니다." },
    { prompt: "공정한 절차의 핵심 조건은?", choices: ["결과의 완전 동일", "일관된 기준과 참여 기회", "빠른 결정"], answer: 1, explanation: "공개되고 일관된 기준, 의견을 낼 기회가 절차적 정의의 핵심입니다." },
  ],
  3: [
    { prompt: "가격이 오를 때 일반적으로 나타나는 변화는?", choices: ["수요량 증가", "수요량 감소", "공급량 감소"], answer: 1, explanation: "다른 조건이 같다면 가격 상승은 수요량을 감소시킵니다." },
    { prompt: "소비 결정에서 기회비용이란?", choices: ["포기한 대안 중 가장 큰 가치", "상품의 표시 가격", "미래의 모든 비용"], answer: 0, explanation: "한 선택 때문에 포기한 대안 가운데 가장 가치 있는 것이 기회비용입니다." },
    { prompt: "지속가능한 소비의 사례는?", choices: ["일회용품 늘리기", "지역·친환경 제품 선택", "필요 이상 구매"], answer: 1, explanation: "환경과 공동체에 미치는 영향을 고려하는 소비가 지속가능한 소비입니다." },
  ],
  4: [
    { prompt: "국가 간 상품과 서비스 교환이 늘어나는 현상은?", choices: ["지역화", "세계화", "고립화"], answer: 1, explanation: "세계화로 국가 간 경제·문화·정보의 교류와 상호 의존이 커집니다." },
    { prompt: "국제 갈등을 평화적으로 해결하는 방법은?", choices: ["무력 사용 우선", "협상과 국제기구 활용", "교류 전면 중단"], answer: 1, explanation: "대화와 협상, 국제기구의 조정은 대표적인 평화적 해결 방식입니다." },
    { prompt: "공정 무역이 지향하는 가치는?", choices: ["생산자의 정당한 보상", "최저 가격만 추구", "유통 독점"], answer: 0, explanation: "공정 무역은 생산자의 노동과 삶이 정당하게 보상받도록 합니다." },
  ],
  5: [
    { prompt: "현재 세대와 미래 세대의 필요를 함께 고려하는 발전은?", choices: ["압축 성장", "지속가능발전", "무제한 개발"], answer: 1, explanation: "지속가능발전은 환경·사회·경제의 균형과 세대 간 형평성을 추구합니다." },
    { prompt: "탄소 배출을 줄이는 에너지 전환의 예는?", choices: ["석탄 발전 확대", "재생 에너지 확대", "에너지 낭비 증가"], answer: 1, explanation: "태양광·풍력 같은 재생 에너지 확대는 탄소 배출 감축에 기여합니다." },
    { prompt: "저출생·고령화에 대응하는 태도로 적절한 것은?", choices: ["세대 간 부담 전가", "돌봄과 고용 제도의 개선", "노년층 배제"], answer: 1, explanation: "돌봄, 고용, 사회보장 제도를 함께 개선하는 통합적 접근이 필요합니다." },
  ],
};

export default function HomePage() {
  const [mode, setMode] = useState<"units" | "themes">("units");
  const [selected, setSelected] = useState<Unit | null>(null);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [missionStarted, setMissionStarted] = useState(false);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);

  const startGame = (unit: Unit, level = 0) => {
    setSelected(null);
    setMissionStarted(true);
    setActiveGame({ unit, level });
  };

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
        <button className="hotspot mission" aria-label="오늘의 추천 미션 도전하기" onClick={() => startGame(units[0])} />
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
      {selected && <UnitModal unit={selected} onClose={() => setSelected(null)} onStart={(level) => startGame(selected, level)} />}
      {activeGame && <GameModal game={activeGame} onClose={() => setActiveGame(null)} />}
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

      {selected && <UnitModal unit={selected} onClose={() => setSelected(null)} onStart={(level) => startGame(selected, level)} />}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="section-title"><Star size={15} weight="fill" /><h2>{children}</h2><i /></div>;
}

function UnitModal({ unit, onClose, onStart }: { unit: Unit; onClose: () => void; onStart: (level: number) => void }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`${unit.title} 게임 선택`}>
      <button className="modal-dismiss" onClick={onClose} aria-label="닫기" />
      <section className="unit-modal" style={{ "--unit": unit.color } as React.CSSProperties}>
        <img src={unit.image} alt="" />
        <button className="close-button" onClick={onClose}>×</button>
        <span>UNIT {unit.id}</span><h2>{unit.title}</h2><p>개념 확인에서 수행평가 준비까지 단계별로 도전하세요.</p>
        <div>{unit.levels.map((level, i) => <button key={level} onClick={() => onStart(i)}><b>{i + 1}</b><span><strong>{level}</strong><small>{i === 0 ? "개념 확인" : i === 1 ? "자료 분석" : "문제 해결"}</small></span><ArrowRight /></button>)}</div>
      </section>
    </div>
  );
}

function GameModal({ game, onClose }: { game: ActiveGame; onClose: () => void }) {
  const gameQuestions = questions[game.unit.id];
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = gameQuestions[step];
  const isCorrect = choice === question.answer;

  const choose = (index: number) => {
    if (choice !== null) return;
    setChoice(index);
    if (index === question.answer) setScore((value) => value + 1);
  };

  const next = () => {
    if (step === gameQuestions.length - 1) {
      setFinished(true);
      return;
    }
    setStep((value) => value + 1);
    setChoice(null);
  };

  const retry = () => {
    setStep(0);
    setChoice(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="modal-layer game-layer" role="dialog" aria-modal="true" aria-label={`${game.unit.title} 미션`}>
      <section className="game-modal" style={{ "--unit": game.unit.color } as React.CSSProperties}>
        <header>
          <div><span>UNIT {game.unit.id} · LEVEL {game.level + 1}</span><h2>{game.unit.levels[game.level]}</h2></div>
          <button className="game-close" onClick={onClose} aria-label="미션 닫기">×</button>
        </header>

        {finished ? (
          <div className="game-result">
            <Trophy size={64} weight="duotone" />
            <span>미션 완료</span>
            <h3>{score * 100} XP 획득!</h3>
            <p>총 {gameQuestions.length}문제 중 <strong>{score}문제</strong>를 맞혔어요.</p>
            <div className="result-actions"><button onClick={retry}><ArrowCounterClockwise /> 다시 도전</button><button onClick={onClose}>홈으로</button></div>
          </div>
        ) : (
          <div className="game-body">
            <div className="game-progress"><span>문제 {step + 1} / {gameQuestions.length}</span><i><b style={{ width: `${((step + 1) / gameQuestions.length) * 100}%` }} /></i><strong>{score * 100} XP</strong></div>
            <p className="game-kicker">핵심 개념 탐구</p>
            <h3>{question.prompt}</h3>
            <div className="answer-list">
              {question.choices.map((answer, index) => {
                const state = choice === null ? "" : index === question.answer ? "correct" : index === choice ? "wrong" : "muted";
                return <button key={answer} className={state} onClick={() => choose(index)} disabled={choice !== null}><b>{index + 1}</b><span>{answer}</span>{state === "correct" && <CheckCircle weight="fill" />}{state === "wrong" && <XCircle weight="fill" />}</button>;
              })}
            </div>
            {choice !== null && <div className={`feedback ${isCorrect ? "correct" : "wrong"}`} role="status"><strong>{isCorrect ? "정답이에요!" : "한 번 더 개념을 확인해요."}</strong><p>{question.explanation}</p><button onClick={next}>{step === gameQuestions.length - 1 ? "결과 보기" : "다음 문제"}<ArrowRight /></button></div>}
          </div>
        )}
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
