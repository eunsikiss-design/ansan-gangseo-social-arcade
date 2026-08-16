"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, Brain, Check, CheckCircle, Clock, Compass, FileText,
  Gear, Headphones, Lightbulb, MapTrifold, Medal, Play,
  SpeakerHigh, SpeakerSlash, Sparkle, X,
} from "@phosphor-icons/react";
import { academyRooms, evidenceCatalog, getMissionSteps, missions } from "@/src/data/missions";
import { audioManager, defaultAudioSettings, type AudioSettings } from "@/src/game/audio/AudioManager";
import type { EvidenceCardData, Mission, MissionStep, SaveData, SocialIndicators } from "@/src/game/types";
import {
  AcademyTemplate, BottomNavigation, CaseBriefingTemplate, CharacterPortrait,
  DecisionTemplate, DialogueTemplate, EvidenceTemplate, GameHUD, InvestigationTemplate,
  MainHubTemplate, MissionMapTemplate, PlayerIdentity, PuzzleTemplate, ResultTemplate,
  SourceDetailTemplate, StatusBadge, TemplateHeading, ZeroChallengeTemplate,
} from "@/src/components/GameTemplates";

const SAVE_KEY = "social-arcade-save-v3";
const baseIndicators: SocialIndicators = { humanRights: 52, fairness: 50, economy: 50, peace: 55, sustainability: 48, trust: 50 };
const blankSave = (): SaveData => ({
  currentMission: null, currentScene: 0, level: 1, exp: 0, indicators: baseIndicators,
  evidence: [], completedMissions: [], investigatedSources: [], studentChoices: {},
  decisionHistory: [], mastery: {}, academyDrafts: {}, reviewConcepts: [], skill: [], achievement: [],
  attempts: 0, correctAnswers: 0, answerTimes: [], audio: defaultAudioSettings,
});
type View = "hub" | "map" | "mission" | "academy" | "record";
type ReturnPoint = { missionId: string; scene: number } | null;

export default function HomePage() {
  const [save, setSave] = useState<SaveData>(blankSave);
  const [view, setView] = useState<View>("hub");
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [audio, setAudio] = useState<AudioSettings>(defaultAudioSettings);
  const [returnPoint, setReturnPoint] = useState<ReturnPoint>(null);
  const [actComplete, setActComplete] = useState(false);

  useEffect(() => {
    /* Loading the external localStorage snapshot is the purpose of this mount effect. */
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) setSave({ ...blankSave(), ...JSON.parse(stored) });
    } catch { /* start from a safe blank save */ }
    setAudio(audioManager.load());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }, [hydrated, save]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [view, save.currentMission, save.currentScene]);

  const currentMission = missions.find((item) => item.id === save.currentMission) ?? null;
  const interact = (track = view === "academy" ? "academy" : "main_hub") => { void audioManager.playBgm(track); };
  const startNew = () => { const next = blankSave(); next.currentMission = "m01"; setSave(next); setActComplete(false); setView("map"); interact(); };
  const continueGame = () => { setView(save.currentMission ? "mission" : "map"); interact(); };
  const startMission = (mission: Mission) => { setSave((prev) => ({ ...prev, currentMission: mission.id, currentScene: prev.currentMission === mission.id ? prev.currentScene : 0 })); setView("mission"); void audioManager.playSfx("case_open"); };
  const navigate = (tab: "home" | "challenge" | "record" | "growth") => { setView(tab === "home" ? "hub" : tab === "challenge" ? "map" : tab === "record" ? "record" : "academy"); interact(tab === "growth" ? "academy" : "main_hub"); };
  const updateAudio = (next: Partial<AudioSettings>) => { audioManager.update(next); setAudio({ ...audioManager.settings }); setSave((prev) => ({ ...prev, audio: { ...prev.audio, ...next } })); };

  return (
    <main className="arcade-viewport">
      <div className="arcade-phone" aria-label="안산강서고 1학년 통합사회 탐구 아케이드 홈 화면">
        {view === "hub" && <HubScreen save={save} onNew={startNew} onContinue={continueGame} onMap={() => { setView("map"); interact(); }} onAcademy={() => { setView("academy"); interact("academy"); }} onIntro={() => setIntroOpen(true)} onSettings={() => setSettingsOpen(true)} />}
        {view === "map" && <MissionMap save={save} onStart={startMission} onBack={() => setView("hub")} onSettings={() => setSettingsOpen(true)} />}
        {view === "mission" && currentMission && <MissionPlayer key={`${currentMission.id}-${save.currentScene}`} mission={currentMission} save={save} setSave={setSave} onBack={() => setView("map")} onSettings={() => setSettingsOpen(true)} onAcademy={() => { setReturnPoint({ missionId: currentMission.id, scene: save.currentScene }); setView("academy"); }} onActComplete={() => setActComplete(true)} />}
        {view === "academy" && <AcademyScreen save={save} setSave={setSave} returnPoint={returnPoint} onReturn={() => { if (returnPoint) { setSave((prev) => ({ ...prev, currentMission: returnPoint.missionId, currentScene: returnPoint.scene })); setView("mission"); setReturnPoint(null); } else setView("hub"); }} />}
        {view === "record" && <RecordScreen save={save} onBack={() => setView("hub")} />}
        {(view === "hub" || view === "map" || view === "academy" || view === "record") && <BottomNavigation active={view === "map" ? "challenge" : view === "record" ? "record" : view === "academy" ? "growth" : "home"} onNavigate={navigate} />}
        {settingsOpen && <SettingsPanel audio={audio} onChange={updateAudio} onClose={() => setSettingsOpen(false)} />}
        {introOpen && <GameIntroduction onClose={() => setIntroOpen(false)} />}
        {actComplete && <ActComplete onClose={() => { setActComplete(false); setView("map"); }} />}
      </div>
    </main>
  );
}

function HubScreen({ save, onNew, onContinue, onMap, onAcademy, onIntro, onSettings }: { save: SaveData; onNew: () => void; onContinue: () => void; onMap: () => void; onAcademy: () => void; onIntro: () => void; onSettings: () => void }) {
  const hasSave = save.completedMissions.length > 0 || save.currentScene > 0;
  return <MainHubTemplate>
    <div className="hub-hero">
      <div className="hub-actions-top"><span className="school-badge">안산강서고 1학년 · 통합사회2</span><div className="hub-quick-actions"><button className="icon-button" onClick={onIntro} aria-label="게임 소개와 교과 연계"><BookOpen size={21} /></button><button className="icon-button" onClick={onSettings} aria-label="설정"><Gear size={21} /></button></div></div>
      <div className="title-lockup"><span>ARCA SOCIAL INVESTIGATION</span><h1>통합사회<br /><em>탐구 아케이드</em></h1><p>사건을 읽고, 근거를 모아, 더 나은 사회를 설계하라.</p></div>
      <div className="hub-character-stage"><CharacterPortrait characterId="haeon" expression="guide" position="left" /><CharacterPortrait characterId="ari" expression="smile" position="right" /></div>
    </div>
    <div className="hub-content">
      <PlayerIdentity />
      <section className="story-brief" aria-label="인권수호국 임무 브리핑">
        <span>PERSONNEL ORDER · 001</span><h3>신입 인권수호관, 첫 출동을 명합니다.</h3>
        <p>도시 곳곳의 기본권 침해 신호를 추적해 권리 카드를 회수하세요. 여섯 사건의 기록은 마지막 긴급 판단의 근거가 됩니다.</p>
      </section>
      <article className="featured-mission">
        <div><span className="overline">오늘의 추천 미션 도전하기</span><h2>UNIT 1 · 인권수호국</h2><p>ACT 1 인권판례 챌린지 · MISSION 01~06</p></div>
        <div className="feature-progress"><span style={{ width: `${save.completedMissions.length / 6 * 100}%` }} /></div>
        <div className="button-row"><button className="primary-button" onClick={onNew}><Play size={18} weight="fill" />새 게임</button>{hasSave && <button className="secondary-button" onClick={onContinue}>이어하기<ArrowRight size={18} /></button>}</div>
      </article>
      <div className="hub-grid"><button className="hub-card" onClick={onMap}><MapTrifold size={28} weight="duotone" /><span>미션 지도</span><small>1단원 인권 보장과 헌법</small></button><button className="hub-card" onClick={onAcademy}><BookOpen size={28} weight="duotone" /><span>탐구 아카데미</span><small>ROOM 1~3 개념 훈련</small></button></div>
      <div className="unit-roadmap" aria-label="인권수호관 성장 경로">
        <div className="active"><b>01</b><span>인권판례 챌린지</span><small>권리 카드 수집 중</small></div>
        <div><b>02</b><span>기본권수호대</span><small>COMING SOON</small></div>
        <div><b>03</b><span>헌법소원 시뮬레이터</span><small>COMING SOON</small></div>
        <div><b>04</b><span>시민참여 미션</span><small>COMING SOON</small></div>
        <div><b>05</b><span>인권캠페인 스튜디오</span><small>COMING SOON</small></div>
      </div>
      <div className="coming-strip"><span>FINAL</span><strong>인권수호국 긴급 사건</strong><small>공공의 안전을 위해 시민의 자유를 제한해도 되는가?</small></div>
      <button className="game-intro-entry" onClick={onIntro}><BookOpen size={24} weight="duotone" /><span><strong>게임 소개 · 교과 연계</strong><small>세계관 스토리와 탐구 파트너를 만나보세요.</small></span><ArrowRight size={18} /></button>
    </div>
  </MainHubTemplate>;
}

const introCharacters = [
  { id: "player" as const, name: "탐구관", role: "플레이어 · 신입 탐구관", copy: "사건을 조사하고 자료를 분석해 사회 문제를 해결합니다.", skill: "자료 분석 · 근거 제시 · 의사 결정" },
  { id: "ari" as const, name: "아리 AR-I", role: "AI 탐구 파트너", copy: "질문과 힌트를 건네며 복잡한 개념과 자료의 연결을 돕습니다.", skill: "탐구 질문 · 개념 연결 · 학습 안내" },
  { id: "haeon" as const, name: "해온", role: "1단원 · 인권수호관", copy: "기본권을 지키는 가장 중요한 원칙과 실제 사건의 쟁점을 안내합니다.", skill: "인권 렌즈 · 헌법적 판단" },
  { id: "zero" as const, name: "ZERO", role: "논쟁형 라이벌", copy: "효율과 결과를 앞세운 반론으로 플레이어의 판단 근거를 시험합니다.", skill: "반론 제기 · 논리 검증" },
];

function GameIntroduction({ onClose }: { onClose: () => void }) {
  return <div className="modal-backdrop intro-backdrop"><section className="game-introduction" role="dialog" aria-modal="true" aria-labelledby="intro-title">
    <button className="modal-close" onClick={onClose} aria-label="게임 소개 닫기"><X size={20} /></button>
    <header><span>GAME GUIDE · 우리가 만드는 사회</span><h2 id="intro-title">통합사회 탐구 아케이드</h2><p>사회를 탐구하고, 판단하고, 함께 더 나은 미래를 만듭니다.</p></header>
    <div className="intro-story"><strong>STORY · 신입 탐구관의 첫 임무</strong><p>사회의 균형을 지키는 ‘탐구 아카데미’에 기본권 침해 신호가 도착했습니다. 플레이어는 신입 탐구관으로 임명되어 AI 파트너 아리와 함께 사건 현장을 조사합니다. 교과서 자료와 시민의 목소리에서 Evidence를 모으고, 해온의 조언과 ZERO의 반론을 검토해 자신만의 판단을 완성해야 합니다.</p><ol><li>사건을 조사한다.</li><li>자료와 권리 카드를 모은다.</li><li>개념을 적용해 근거를 만든다.</li><li>ZERO의 반론을 검토한다.</li><li>판단을 제출하고 사회 지표의 변화를 확인한다.</li></ol></div>
    <h3>주요 캐릭터</h3><div className="intro-character-list">{introCharacters.map((character) => <article key={character.id} className={`intro-character intro-${character.id}`}><CharacterPortrait characterId={character.id} expression={character.id === "zero" ? "confident" : "guide"} label={false} /><div><span>{character.role}</span><strong>{character.name}</strong><p>{character.copy}</p><small>{character.skill}</small></div></article>)}</div>
    <div className="intro-curriculum"><strong>교과 연계</strong><p>인권과 헌법 → 정의와 불평등 → 시장경제와 지속가능발전 → 세계화와 평화 → 미래사회 설계의 순서로 탐구관의 역할과 장비가 성장합니다.</p></div>
    <button className="primary-button full-button" onClick={onClose}>탐구 시작 준비 완료</button>
  </section></div>;
}

function MissionMap({ save, onStart, onBack, onSettings }: { save: SaveData; onStart: (mission: Mission) => void; onBack: () => void; onSettings: () => void }) {
  const unlockedIndex = Math.min(save.completedMissions.length, 5);
  return <MissionMapTemplate>
    <GameHUD missionTitle="ACT 1 · 미션 지도" level={save.level} exp={save.exp} onBack={onBack} onSettings={onSettings} />
    <div className="screen-scroll"><TemplateHeading eyebrow="ACT 1" title="인권판례 챌린지" description="사건은 이어집니다. 앞 미션을 해결하면 다음 구역이 열립니다." />
      <div className="mission-route">{missions.map((mission, index) => {
        const complete = save.completedMissions.includes(mission.id); const unlocked = index <= unlockedIndex || complete || save.currentMission === mission.id;
        return <button key={mission.id} className={`mission-node ${complete ? "complete" : unlocked ? "unlocked" : "locked"}`} disabled={!unlocked} onClick={() => onStart(mission)} aria-label={`${mission.title} ${complete ? "완료" : unlocked ? "시작 가능" : "잠김"}`}>
          <span className="mission-number">M{String(mission.number).padStart(2, "0")}</span><div><strong>{mission.title}</strong><small>{mission.subtitle}</small></div><StatusBadge status={complete ? "complete" : unlocked ? "new" : "locked"} />
        </button>;
      })}</div>
      <div className="locked-acts"><span>ACT 2</span><span>ACT 3</span><span>ACT 4</span><span>ACT 5</span><small>MISSION 07~24 COMING SOON</small></div>
    </div>
  </MissionMapTemplate>;
}

function MissionPlayer({ mission, save, setSave, onBack, onSettings, onAcademy, onActComplete }: { mission: Mission; save: SaveData; setSave: React.Dispatch<React.SetStateAction<SaveData>>; onBack: () => void; onSettings: () => void; onAcademy: () => void; onActComplete: () => void }) {
  const steps = useMemo(() => getMissionSteps(mission), [mission]);
  const step = steps[Math.min(save.currentScene, steps.length - 1)];
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [investigated, setInvestigated] = useState<string[]>(() => {
    const stepItems = step.items ?? mission.investigations;
    return stepItems.filter((item) => save.investigatedSources.includes(`${mission.id}:${item}`));
  });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => { const id = window.setInterval(() => setElapsed((value) => value + 1), 1000); return () => window.clearInterval(id); }, [step.id]);
  useEffect(() => { if (step.type === "zero") { void audioManager.playSfx("zero_appear"); audioManager.stopBgm(); void audioManager.playBgm("zero_challenge"); } }, [step.type]);

  const progress = Math.round((save.currentScene / Math.max(1, steps.length - 1)) * 100);
  const advance = () => { void audioManager.playSfx("ui_click"); setSave((prev) => ({ ...prev, currentScene: Math.min(prev.currentScene + 1, steps.length - 1) })); };
  const chooseAnswer = (index: number) => { if (selected !== null) return; setSelected(index); const correct = index === step.answer; void audioManager.playSfx(correct ? "success" : "error"); setSave((prev) => ({ ...prev, attempts: prev.attempts + 1, correctAnswers: prev.correctAnswers + (correct ? 1 : 0), answerTimes: [...prev.answerTimes, elapsed], reviewConcepts: correct ? prev.reviewConcepts : [...new Set([...prev.reviewConcepts, ...mission.relatedConceptIds])] })); };
  const collectEvidence = (id: string) => { setSave((prev) => ({ ...prev, evidence: [...new Set([...prev.evidence, id])] })); void audioManager.playSfx("evidence_found"); };
  const complete = () => {
    const goodChoice = save.studentChoices[mission.id] === mission.decisions.length - 1;
    setSave((prev) => {
      const firstCompletion = !prev.completedMissions.includes(mission.id);
      const nextExp = prev.exp + (firstCompletion ? mission.rewards.exp : 0);
      return { ...prev, completedMissions: [...new Set([...prev.completedMissions, mission.id])], exp: nextExp, level: Math.floor(nextExp / 150) + 1, currentMission: mission.nextMissionId ?? null, currentScene: 0, indicators: firstCompletion ? { ...prev.indicators, humanRights: Math.min(100, prev.indicators.humanRights + (goodChoice ? 12 : 5)), fairness: Math.min(100, prev.indicators.fairness + (goodChoice ? 6 : 2)), trust: Math.min(100, prev.indicators.trust + (goodChoice ? 8 : 3)) } : prev.indicators, skill: mission.rewards.skill ? [...new Set([...prev.skill, mission.rewards.skill])] : prev.skill, achievement: mission.rewards.title ? [...new Set([...prev.achievement, mission.rewards.title])] : prev.achievement };
    });
    void audioManager.playSfx("mission_complete");
    if (mission.nextMissionId) window.setTimeout(() => {}, 0); else onActComplete();
  };

  return <div className={`mission-screen background-${mission.backgrounds[0]}`}>
    <GameHUD missionTitle={`M${String(mission.number).padStart(2, "0")} ${mission.title}`} level={save.level} exp={save.exp} progress={progress} indicators={save.indicators} onBack={onBack} onSettings={onSettings} />
    <div className="mission-stage"><MissionStepView step={step} mission={mission} save={save} selected={selected} setSelected={chooseAnswer} resetSelected={() => setSelected(null)} investigated={investigated} setInvestigated={setInvestigated} selectedEvidence={selectedEvidence} setSelectedEvidence={setSelectedEvidence} collectEvidence={collectEvidence} elapsed={elapsed} advance={advance} complete={complete} setSave={setSave} onAcademy={onAcademy} /></div>
  </div>;
}

function MissionStepView({ step, mission, save, selected, setSelected, resetSelected, investigated, setInvestigated, selectedEvidence, setSelectedEvidence, collectEvidence, elapsed, advance, complete, setSave, onAcademy }: { step: MissionStep; mission: Mission; save: SaveData; selected: number | null; setSelected: (index: number) => void; resetSelected: () => void; investigated: string[]; setInvestigated: React.Dispatch<React.SetStateAction<string[]>>; selectedEvidence: string[]; setSelectedEvidence: React.Dispatch<React.SetStateAction<string[]>>; collectEvidence: (id: string) => void; elapsed: number; advance: () => void; complete: () => void; setSave: React.Dispatch<React.SetStateAction<SaveData>>; onAcademy: () => void }) {
  const evidenceIds = step.evidenceIds ?? mission.evidenceIds;
  const nextButton = (disabled = false, label = "계속") => <button className="primary-button full-button" disabled={disabled} onClick={advance}>{label}<ArrowRight size={18} /></button>;
  if (step.type === "briefing") return <CaseBriefingTemplate><TemplateHeading eyebrow="CASE BRIEFING" title={step.title} description={mission.subtitle} /><div className="case-visual"><Compass size={56} weight="duotone" /><span>M{String(mission.number).padStart(2, "0")}</span></div><p className="story-copy">{step.body}</p><div className="concept-tags">{mission.relatedConceptIds.map((item) => <span key={item}>{item}</span>)}</div><button className="text-button" onClick={onAcademy}><Lightbulb size={17} />30초 개념 확인</button>{nextButton(false, "사건 파일 열기")}</CaseBriefingTemplate>;
  if (step.type === "dialogue" && step.scene) return <DialogueTemplate><div className="scene-label">{step.scene.background.replaceAll("_", " ").toUpperCase()}</div>{step.scene.image && <figure className="textbook-scene"><img src={`/assets/sources/${step.scene.image}`} alt={step.scene.imageAlt ?? "교과서 사례 자료"} /><figcaption>교과서 사례·삽화 자료</figcaption></figure>}<div className={`dialogue-stage ${step.scene.image ? "with-source" : ""}`}><CharacterPortrait key={`${step.scene.character}-${step.scene.expression}`} characterId={step.scene.character} expression={step.scene.expression} position={step.scene.position} /></div><div className="dialogue-box"><strong>{step.scene.speaker}</strong><p>{step.scene.text}</p>{nextButton(false, "다음 대화")}</div></DialogueTemplate>;
  if (step.type === "investigation") { const need = mission.id === "m05" ? 3 : 1; const items = step.items ?? mission.investigations; return <InvestigationTemplate><TemplateHeading eyebrow={`조사 포인트 ${investigated.length}/${need}`} title={step.title} description="자료를 직접 선택해 핵심 사실을 확인하세요." icon="evidence" /><div className="investigation-list">{items.map((item) => <button key={item} className={investigated.includes(item) ? "checked" : ""} onClick={() => { setInvestigated((prev) => [...new Set([...prev, item])]); setSave((prev) => ({ ...prev, investigatedSources: [...new Set([...prev.investigatedSources, `${mission.id}:${item}`])] })); }}><FileText size={22} /><span>{item}</span>{investigated.includes(item) && <CheckCircle size={18} weight="fill" />}</button>)}</div>{nextButton(investigated.length < need, "조사 완료")}</InvestigationTemplate>; }
  if (step.type === "source") return <SourceDetailTemplate><TemplateHeading eyebrow="SOURCE DETAIL" title={step.title} description="출처와 성격을 구분하며 읽어 보세요." /><article className="source-paper"><span className="source-stamp">학습 자료</span><p>{step.body}</p><small>{mission.id === "m05" ? "교과서 내용을 바탕으로 재구성 · 게임용 가상 데이터 포함" : "통합사회2 학습을 위해 재구성한 가상 사례"}</small></article>{nextButton(false, "자료 분석 완료")}</SourceDetailTemplate>;
  if (step.type === "puzzle") { const correct = selected === step.answer; return <PuzzleTemplate><TemplateHeading eyebrow="ACTIVE PUZZLE" title={step.title} description="핵심 개념을 사례에 적용하세요." /><div className="timer-chip"><Clock size={17} /> {elapsed}초</div><h3 className="question-title">{step.question}</h3><div className="choice-grid">{step.choices?.map((choice, index) => <button key={choice} className={selected === index ? correct ? "correct" : "incorrect" : ""} disabled={selected !== null} onClick={() => setSelected(index)}><span>{index + 1}</span>{choice}</button>)}</div>{selected !== null && <div className={correct ? "feedback success" : "feedback warning"}>{correct ? "개념과 사례를 정확히 연결했어요." : "아직 통과하지 못했어요. 개념을 다시 보고 재도전하세요."}</div>}{selected !== null && !correct && <button className="secondary-button full-button" onClick={resetSelected}>다시 도전</button>}{nextButton(!correct, "퍼즐 통과")}</PuzzleTemplate>; }
  if (step.type === "evidence") return <EvidenceTemplate><TemplateHeading eyebrow="RIGHTS CARD VAULT" title={step.title} description="아래 기준을 충족한 뒤 카드를 눌러 수호관 보관함에 등록하세요." icon="evidence" /><div className="card-rule"><strong>권리 카드 획득 기준</strong><span>① 해당 미션의 조사·퍼즐 완료</span><span>② 카드 내용을 직접 확인</span><span>③ 필요한 카드를 모두 등록하면 다음 단계 개방</span></div><div className="evidence-list">{evidenceIds.map((id) => <EvidenceCard key={id} data={evidenceCatalog[id]} collected={save.evidence.includes(id)} selected={false} onClick={() => collectEvidence(id)} />)}</div>{nextButton(!evidenceIds.every((id) => save.evidence.includes(id)), `권리 카드 ${evidenceIds.filter((id) => save.evidence.includes(id)).length}/${evidenceIds.length} · 보관 완료`)}</EvidenceTemplate>;
  if (step.type === "zero") { const correct = selected === step.answer; return <ZeroChallengeTemplate><div className="zero-title"><span>LOGIC CHECK</span><h2>ZERO CHALLENGE</h2></div><div className="versus-stage"><CharacterPortrait characterId="player" expression={selected === null ? "think" : "resolve"} position="left" /><b>VS</b><CharacterPortrait characterId="zero" expression={selected === null ? "challenge" : correct ? "surprise" : "confident"} position="right" /></div><div className="zero-dialogue"><strong>ZERO</strong><p>{step.body}</p></div><div className="choice-grid compact">{step.choices?.map((choice, index) => <button key={choice} className={selected === index ? "selected" : ""} disabled={selected !== null} onClick={() => setSelected(index)}>{choice}</button>)}</div>{selected !== null && <p className="zero-reaction">{correct ? "ZERO: 그 근거까지 고려했다고? 그렇다면 다음 판단을 보지." : "ZERO: 아직 내 반론을 넘을 근거가 부족해 보여."}</p>}{selected !== null && !correct && <button className="secondary-button full-button" onClick={resetSelected}>반론 다시 도전</button>}{nextButton(!correct, "최종 판단으로")}</ZeroChallengeTemplate>; }
  if (step.type === "decision") { const needed = mission.id === "m05" ? 2 : 1; const available = mission.evidenceIds.filter((id) => save.evidence.includes(id)); return <DecisionTemplate><TemplateHeading eyebrow="YOUR DECISION" title={step.title} description={`정책을 선택하고 Evidence ${needed}장을 근거로 제출하세요.`} /><div className="decision-options">{step.choices?.map((choice, index) => <button key={choice} className={selected === index ? "selected" : ""} onClick={() => setSelected(index)}><span>{String.fromCharCode(65 + index)}</span>{choice}</button>)}</div><h3 className="subheading">제출할 Evidence {selectedEvidence.length}/{needed}</h3><div className="evidence-select-row">{available.map((id) => <EvidenceCard key={id} data={evidenceCatalog[id]} collected selected={selectedEvidence.includes(id)} onClick={() => setSelectedEvidence((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])} />)}</div><button className="primary-button full-button" disabled={selected === null || selectedEvidence.length < needed} onClick={() => { setSave((prev) => ({ ...prev, studentChoices: { ...prev.studentChoices, [mission.id]: selected ?? 0 }, decisionHistory: [...prev.decisionHistory, { missionId: mission.id, choice: selected ?? 0, evidenceIds: selectedEvidence }] })); void audioManager.playSfx("decision_submit"); advance(); }}>판단 제출<Check size={18} /></button></DecisionTemplate>; }
  const good = save.studentChoices[mission.id] === mission.decisions.length - 1;
  const projectedExp = save.exp + (save.completedMissions.includes(mission.id) ? 0 : mission.rewards.exp); const rank = projectedExp >= 500 ? "선임 인권수호관" : projectedExp >= 300 ? "사건 담당관" : projectedExp >= 150 ? "정식 인권수호관" : "수습 인권수호관";
  return <ResultTemplate status={good ? "success" : "warning"}><TemplateHeading eyebrow="MISSION RESULT" title={good ? "균형 있는 판단" : "재검토할 수 있는 판단"} description="다음 미션 전에 획득 카드와 현재 수호관 순위를 확인하세요." /><div className="result-reactions"><CharacterPortrait characterId="ari" expression={good ? "success" : "warning"} /><CharacterPortrait characterId="haeon" expression={good ? "smile" : "serious"} /><CharacterPortrait characterId="zero" expression={good ? "think" : "confident"} /></div><div className="rank-panel"><span>CURRENT RANK</span><strong>{rank}</strong><small>{projectedExp} EXP · 권리 카드 {save.evidence.length}장</small></div><div className="earned-card-row">{mission.evidenceIds.filter((id) => save.evidence.includes(id)).map((id) => <span key={id}><Medal size={15} />{evidenceCatalog[id].title.replace("권리 카드 · ", "")}</span>)}</div><div className="indicator-gains"><span>인권 <b>+{good ? 12 : 5}</b></span><span>공정성 <b>+{good ? 6 : 2}</b></span><span>시민신뢰 <b>+{good ? 8 : 3}</b></span></div><div className="rubric"><p><span>자료 활용</span><b>★★★★☆</b></p><p><span>근거 타당성</span><b>{good ? "★★★★★" : "★★★☆☆"}</b></p><p><span>다양한 관점</span><b>{good ? "★★★★☆" : "★★★☆☆"}</b></p><p><span>의사결정</span><b>{good ? "★★★★★" : "★★★☆☆"}</b></p></div><p className="ari-feedback">아리: {good ? "피해와 다른 권리의 영향을 함께 고려했어. 선택한 근거가 판단과 잘 연결돼 있어." : "한 관점은 분명하지만 다른 사람에게 생길 영향도 더 살펴보면 좋아. 언제든 추가 조사 후 다시 판단할 수 있어."}</p><button className="primary-button full-button" onClick={complete}>{mission.nextMissionId ? "카드·순위 확인 완료 · 다음 미션" : "ACT 1 완료"}<ArrowRight size={18} /></button></ResultTemplate>;
}

function EvidenceCard({ data, collected, selected, onClick }: { data: EvidenceCardData; collected: boolean; selected: boolean; onClick: () => void }) {
  return <button className={`evidence-card ${collected ? "collected" : ""} ${selected ? "selected" : ""}`} onClick={onClick} aria-pressed={selected}><span className="evidence-category">{data.category}</span><Medal size={26} weight="duotone" /><strong>{data.title}</strong><p>{data.description}</p><small>{data.sourceLabel} · 신뢰도 {data.reliability}/5</small><i>{selected ? "제출 선택" : collected ? "획득 완료" : "눌러서 획득"}</i></button>;
}

function AcademyScreen({ save, setSave, returnPoint, onReturn }: { save: SaveData; setSave: React.Dispatch<React.SetStateAction<SaveData>>; returnPoint: ReturnPoint; onReturn: () => void }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [choice, setChoice] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<string[]>([]);
  const room = academyRooms.find((item) => item.id === roomId);
  if (!room) return <AcademyTemplate><GameHUD missionTitle="탐구 아카데미" level={save.level} exp={save.exp} onBack={onReturn} /><div className="screen-scroll"><TemplateHeading eyebrow="ACADEMY · ROOM 1~3" title="개념을 훈련하는 연구실" description="카드 뒤집기부터 주장·근거 글쓰기까지 네 단계로 성장합니다." icon="academy" /><div className="academy-guide"><CharacterPortrait characterId="ari" expression="guide" position="right" /><p>각 단계는 서로 다른 문제야. 틀리면 정답을 보여 주지 않고 다시 도전할 수 있어.</p></div><div className="room-list">{academyRooms.map((item) => { const terms = item.concepts.map((concept) => concept.term); return <button key={item.id} onClick={() => { setRoomId(item.id); setLevel(1); setChoice(null); setFlipped([]); }}><BookOpen size={24} /><div><strong>{item.title}</strong><small>{terms.join(" · ")}</small></div><span>{Math.max(0, ...terms.map((term) => save.mastery[term] ?? 0))}/4</span></button>; })}</div>{returnPoint && <button className="primary-button full-button" onClick={onReturn}>원래 Mission으로 돌아가기</button>}</div></AcademyTemplate>;
  const terms = room.concepts.map((concept) => concept.term);
  const levelData = room.levels[level - 1];
  const draft = save.academyDrafts?.[room.id]?.[String(level)] ?? "";
  const correct = level === 1 || choice === levelData.answer;
  const ready = level === 1 ? flipped.length === room.concepts.length && draft.trim().length >= 10 : correct && draft.trim().length >= 10;
  const writeDraft = (targetLevel: number, text: string) => setSave((prev) => ({ ...prev, academyDrafts: { ...(prev.academyDrafts ?? {}), [room.id]: { ...(prev.academyDrafts?.[room.id] ?? {}), [String(targetLevel)]: text } } }));
  const finishLevel = () => {
    setSave((prev) => ({ ...prev, mastery: { ...prev.mastery, ...Object.fromEntries(terms.map((term) => [term, Math.max(prev.mastery[term] ?? 0, level)])) } }));
    if (level < 4) { setLevel((value) => value + 1); setChoice(null); setFlipped([]); } else { setRoomId(null); setChoice(null); setFlipped([]); }
  };
  const labels = ["용어 카드", "개념 연결", "사례 적용", "미니 챌린지"];
  return <AcademyTemplate><GameHUD missionTitle={room.title} level={save.level} exp={save.exp} onBack={() => setRoomId(null)} /><div className="screen-scroll"><div className="academy-levels">{labels.map((label, index) => <button key={label} className={level === index + 1 ? "active" : terms.some((term) => (save.mastery[term] ?? 0) >= index + 1) ? "done" : ""} onClick={() => { if (index + 1 <= Math.max(1, Math.max(...terms.map((term) => save.mastery[term] ?? 0)) + 1)) { setLevel(index + 1); setChoice(null); setFlipped([]); } }}>{index + 1}<small>{label}</small></button>)}</div><div className="academy-guide compact-guide"><CharacterPortrait characterId="ari" expression={correct && (level === 1 ? flipped.length === room.concepts.length : choice !== null) ? "success" : level === 1 ? "guide" : "think"} /><p>{level === 1 ? "카드를 누르면 뒷면에 정의가 나와. 모든 카드를 뒤집어 개념의 뜻을 확인하자." : levelData.question}</p></div>
    {level === 1 ? <div className="concept-card-grid flip-grid">{room.concepts.map((concept) => { const open = flipped.includes(concept.term); return <button key={concept.term} className={open ? "flipped" : ""} aria-pressed={open} onClick={() => setFlipped((prev) => prev.includes(concept.term) ? prev.filter((term) => term !== concept.term) : [...prev, concept.term])}><span className="card-front"><Brain size={22} /><strong>{concept.term}</strong><small>눌러서 정의 확인</small></span><span className="card-back"><strong>{concept.term}</strong><small>{concept.definition}</small></span></button>; })}</div> : <><div className="choice-grid">{levelData.choices.map((item, index) => <button key={item} className={choice === index ? index === levelData.answer ? "correct" : "incorrect" : ""} onClick={() => { setChoice(index); if (index !== levelData.answer) setSave((prev) => ({ ...prev, reviewConcepts: [...new Set([...prev.reviewConcepts, ...terms])] })); }} disabled={choice !== null}>{item}</button>)}</div>{choice !== null && choice !== levelData.answer && <div className="retry-panel"><p>정답은 아직 공개하지 않아요. 카드 정의와 사례를 다시 보고 도전하세요.</p><button className="secondary-button" onClick={() => setChoice(null)}>다시 도전</button></div>}</>}
    <label className="academy-writing"><span>LEVEL {level} · 나의 탐구 글</span><small>{levelData.prompt}</small><textarea value={draft} onChange={(event) => writeDraft(level, event.target.value)} rows={level === 4 ? 5 : 3} placeholder="여기에 자신의 생각을 써 보세요." /><i>{draft.trim().length}/10자 이상 · 자동 저장</i></label>
    {Object.keys(save.academyDrafts?.[room.id] ?? {}).length > 0 && <details className="draft-history"><summary>내가 쓴 글 조회·수정</summary>{[1,2,3,4].filter((target) => save.academyDrafts?.[room.id]?.[String(target)] !== undefined).map((target) => <label key={target}><span>LEVEL {target} · {labels[target - 1]}</span><textarea rows={3} value={save.academyDrafts?.[room.id]?.[String(target)] ?? ""} onChange={(event) => writeDraft(target, event.target.value)} /></label>)}</details>}
    <button className="text-button" onClick={() => setSave((prev) => ({ ...prev, reviewConcepts: [...new Set([...prev.reviewConcepts, ...terms])] }))}>헷갈려요 · 복습 저장</button><button className="primary-button full-button" disabled={!ready} onClick={finishLevel}>{level < 4 ? "글 저장 · 다음 LEVEL" : "글 저장 · ROOM 완료"}</button>{returnPoint && <button className="secondary-button full-button" onClick={onReturn}>Mission의 원래 위치로 복귀</button>}</div></AcademyTemplate>;
}

function RecordScreen({ save, onBack }: { save: SaveData; onBack: () => void }) {
  const accuracy = save.attempts ? Math.round(save.correctAnswers / save.attempts * 100) : 0; const avgTime = save.answerTimes.length ? Math.round(save.answerTimes.reduce((a, b) => a + b, 0) / save.answerTimes.length) : 0; const understanding = Math.min(100, Math.round((Object.values(save.mastery).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(save.mastery).length * 4)) * 100));
  return <AcademyTemplate><GameHUD missionTitle="나의 탐구 기록" level={save.level} exp={save.exp} onBack={onBack} /><div className="screen-scroll"><TemplateHeading eyebrow="LEARNING ANALYTICS" title="이해도와 정확도" description="점수보다 어떤 개념을 더 살펴볼지 확인하세요." /><div className="analytics-cards"><Metric label="개념 이해도" value={understanding} /><Metric label="문항 정확도" value={accuracy} /><div className="time-card"><Clock size={26} /><strong>{avgTime}초</strong><span>평균 풀이 시간</span></div></div><div className="record-block"><h3>완료한 미션</h3><p>{save.completedMissions.length}/6</p><div className="feature-progress"><span style={{ width: `${save.completedMissions.length / 6 * 100}%` }} /></div></div><div className="record-block"><h3>복습할 개념</h3><div className="concept-tags">{save.reviewConcepts.length ? save.reviewConcepts.map((item) => <span key={item}>{item}</span>) : <span>아직 없어요</span>}</div></div><div className="record-block"><h3>획득한 권리 카드</h3><p>{save.evidence.length}장 · 근거를 제출한 판단 {save.decisionHistory.length}건</p></div><div className="record-block"><h3>아카데미 탐구 글</h3><p>{Object.values(save.academyDrafts ?? {}).reduce((count, drafts) => count + Object.keys(drafts).length, 0)}개 저장 · 각 ROOM에서 다시 조회하고 수정할 수 있어요.</p></div><ExpressionLab /></div></AcademyTemplate>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="metric-card"><div className="metric-ring" style={{ "--value": `${value * 3.6}deg` } as React.CSSProperties}><strong>{value}%</strong></div><span>{label}</span></div>; }

function ExpressionLab() {
  const sequences = {
    ari: ["guide", "think", "success"],
    haeon: ["default", "warning", "skill", "success"],
    zero: ["confident", "challenge", "surprise", "think"],
    npc: ["worried", "sad", "relieved"],
  } as const;
  const [actor, setActor] = useState<keyof typeof sequences>("ari");
  const [index, setIndex] = useState(0);
  const [fallback, setFallback] = useState(false);
  const expression = fallback ? "missing-expression" : sequences[actor][index];
  return <details className="expression-lab"><summary>캐릭터 연출 점검</summary><p>대사별 표정 전환과 누락 asset의 안전한 fallback을 확인합니다.</p><div className="expression-tabs">{(Object.keys(sequences) as (keyof typeof sequences)[]).map((id) => <button key={id} className={actor === id ? "active" : ""} onClick={() => { setActor(id); setIndex(0); setFallback(false); }}>{id.toUpperCase()}</button>)}</div><CharacterPortrait characterId={actor} expression={expression} /><output aria-label="현재 표정">{actor} · {expression}</output><div className="button-row"><button className="secondary-button" onClick={() => { setFallback(false); setIndex((value) => (value + 1) % sequences[actor].length); }}>다음 표정</button><button className="text-button" onClick={() => setFallback(true)}>없는 표정 fallback</button></div></details>;
}

function SettingsPanel({ audio, onChange, onClose }: { audio: AudioSettings; onChange: (value: Partial<AudioSettings>) => void; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation"><section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button className="modal-close" onClick={onClose} aria-label="설정 닫기"><X size={20} /></button><h2 id="settings-title"><Gear size={22} />게임 설정</h2><label className="toggle-row"><span>{audio.bgm ? <Headphones size={21} /> : <SpeakerSlash size={21} />}BGM</span><input type="checkbox" checked={audio.bgm} onChange={(event) => onChange({ bgm: event.target.checked })} /></label><label>BGM 음량 <input type="range" min="0" max="1" step="0.05" value={audio.bgmVolume} onChange={(event) => onChange({ bgmVolume: Number(event.target.value) })} /></label><label className="toggle-row"><span>{audio.sfx ? <SpeakerHigh size={21} /> : <SpeakerSlash size={21} />}효과음</span><input type="checkbox" checked={audio.sfx} onChange={(event) => onChange({ sfx: event.target.checked })} /></label><label>효과음 음량 <input type="range" min="0" max="1" step="0.05" value={audio.sfxVolume} onChange={(event) => onChange({ sfxVolume: Number(event.target.value) })} /></label><p>브라우저 정책에 따라 첫 화면 조작 후 소리가 시작됩니다.</p></section></div>;
}

function ActComplete({ onClose }: { onClose: () => void }) { return <div className="modal-backdrop completion-backdrop"><section className="act-complete" role="dialog" aria-modal="true" aria-labelledby="complete-title"><Sparkle size={40} weight="fill" /><span>ACT 1 COMPLETE</span><h2 id="complete-title">신입 인권수호관</h2><CharacterPortrait characterId="haeon" expression="success" /><p>여섯 사건을 해결하고 권리 카드 수집 훈련을 마쳤습니다.</p><div><Medal size={22} />SKILL · 인권 렌즈 Lv.1</div><blockquote>“다음 신고는 학교·직장·온라인에서 동시에 들어왔다. 어떤 기본권이 침해된 것일까?”</blockquote><small>기본권수호대 · COMING SOON</small><button className="primary-button full-button" onClick={onClose}>미션 지도로 돌아가기</button></section></div>; }
