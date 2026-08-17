"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle, Clock,
  FileText, Gear, Headphones, Info, LockKey, MapTrifold, Medal, Play,
  Sparkle, SpeakerHigh, SpeakerSlash, Trophy, Warning, X, MagnifyingGlass,
} from "@phosphor-icons/react";
import { academyRooms, evidenceCatalog, getMissionSteps, missionDialogueQuestions, missions } from "@/src/data/missions";
import { audioManager, defaultAudioSettings, type AudioSettings } from "@/src/game/audio/AudioManager";
import type { DialogueOption, EvidenceCardData, Mission, MissionStep, SaveData, SocialIndicators } from "@/src/game/types";
import {
  AcademyTemplate, BottomNavigation, CaseBriefingTemplate, CharacterPortrait,
  DecisionTemplate, DialogueTemplate, EvidenceTemplate, GameHUD, InvestigationTemplate,
  MainHubTemplate, MissionMapTemplate, PuzzleTemplate, ResultTemplate,
  SourceDetailTemplate, StatusBadge, TemplateHeading, ZeroChallengeTemplate,
} from "@/src/components/GameTemplates";

const SAVE_KEY = "social-arcade-save-v4";
const baseIndicators: SocialIndicators = { humanRights: 52, fairness: 50, economy: 50, peace: 55, sustainability: 48, trust: 50 };
const blankSave = (): SaveData => ({
  currentMission: null, currentScene: 0, level: 1, exp: 0, indicators: baseIndicators,
  evidence: ["HUMAN_DIGNITY", "UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY", "FREEDOM_RIGHT", "EQUALITY_RIGHT"],
  completedMissions: ["m01", "m02", "m03"], investigatedSources: [], studentChoices: {},
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
  const [vaultOpen, setVaultOpen] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [audio, setAudio] = useState<AudioSettings>(defaultAudioSettings);
  const [returnPoint, setReturnPoint] = useState<ReturnPoint>(null);
  const [actComplete, setActComplete] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) setSave({ ...blankSave(), ...JSON.parse(stored) });
    } catch { /* use safe blank save */ }
    setAudio(audioManager.load());
    setHydrated(true);
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
  const navigate = (tab: "home" | "challenge" | "record" | "growth") => {
    setView(tab === "home" ? "hub" : tab === "challenge" ? "map" : tab === "record" ? "record" : "academy");
    interact(tab === "growth" ? "academy" : "main_hub");
  };
  const updateAudio = (next: Partial<AudioSettings>) => {
    audioManager.update(next);
    setAudio({ ...audioManager.settings });
    setSave((prev) => ({ ...prev, audio: { ...prev.audio, ...next } }));
  };

  return (
    <main className="arcade-viewport">
      <div className="arcade-phone" aria-label="안산강서고 1학년 통합사회 탐구 아케이드 홈 화면">
        {view === "hub" && (
          <HubScreen
            save={save}
            onNew={startNew}
            onContinue={continueGame}
            onMap={() => { setView("map"); interact(); }}
            onAcademy={() => { setView("academy"); interact("academy"); }}
            onIntro={() => setIntroOpen(true)}
            onSettings={() => setSettingsOpen(true)}
            onOpenVault={() => setVaultOpen(true)}
            onComingSoon={(msg) => setComingSoonMessage(msg)}
            onSelectMission={(mId) => {
              const target = missions.find((m) => m.id === mId);
              if (target) startMission(target);
            }}
          />
        )}

        {view === "map" && (
          <MissionMap
            save={save}
            onStart={startMission}
            onBack={() => setView("hub")}
            onSettings={() => setSettingsOpen(true)}
            onOpenVault={() => setVaultOpen(true)}
            onComingSoon={(msg) => setComingSoonMessage(msg)}
          />
        )}

        {view === "mission" && currentMission && (
          <MissionPlayer
            key={`${currentMission.id}-${save.currentScene}`}
            mission={currentMission}
            save={save}
            setSave={setSave}
            onBack={() => setView("map")}
            onSettings={() => setSettingsOpen(true)}
            onAcademy={() => { setReturnPoint({ missionId: currentMission.id, scene: save.currentScene }); setView("academy"); }}
            onOpenVault={() => setVaultOpen(true)}
            onSelectCard={(cId) => setSelectedCardId(cId)}
            onActComplete={() => setActComplete(true)}
          />
        )}

        {view === "academy" && (
          <AcademyScreen
            save={save}
            setSave={setSave}
            returnPoint={returnPoint}
            onReturn={() => {
              if (returnPoint) {
                setSave((prev) => ({ ...prev, currentMission: returnPoint.missionId, currentScene: returnPoint.scene }));
                setView("mission");
                setReturnPoint(null);
              } else setView("hub");
            }}
          />
        )}

        {view === "record" && (
          <RecordScreen
            save={save}
            onBack={() => setView("hub")}
            onOpenVault={() => setVaultOpen(true)}
          />
        )}

        {(view === "hub" || view === "map" || view === "academy" || view === "record") && (
          <BottomNavigation
            active={view === "map" ? "challenge" : view === "record" ? "record" : view === "academy" ? "growth" : "home"}
            onNavigate={navigate}
          />
        )}

        {settingsOpen && <SettingsPanel audio={audio} onChange={updateAudio} onClose={() => setSettingsOpen(false)} />}
        {introOpen && <GameIntroduction onClose={() => setIntroOpen(false)} />}
        {vaultOpen && (
          <CardVaultModal
            save={save}
            onClose={() => setVaultOpen(false)}
            onSelectCard={(id) => setSelectedCardId(id)}
          />
        )}
        {selectedCardId && (
          <CardDetailModal
            cardId={selectedCardId}
            onClose={() => setSelectedCardId(null)}
          />
        )}
        {comingSoonMessage && (
          <ComingSoonModal
            message={comingSoonMessage}
            onClose={() => setComingSoonMessage(null)}
          />
        )}
        {actComplete && <ActComplete onClose={() => { setActComplete(false); setView("map"); }} />}
      </div>
    </main>
  );
}

// ==========================================
// 01. MAIN HUB SCREEN
// ==========================================
function HubScreen({
  save,
  onNew,
  onContinue,
  onMap,
  onAcademy,
  onIntro,
  onSettings,
  onOpenVault,
  onComingSoon,
  onSelectMission,
}: {
  save: SaveData;
  onNew: () => void;
  onContinue: () => void;
  onMap: () => void;
  onAcademy: () => void;
  onIntro: () => void;
  onSettings: () => void;
  onOpenVault: () => void;
  onComingSoon: (msg: string) => void;
  onSelectMission: (mId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"unit" | "theme">("unit");
  const hasSave = save.completedMissions.length > 0 || save.currentScene > 0;

  const units = [
    { num: 1, title: "인권 보장과 헌법", icon: "unit-human-rights.png", status: "권리 카드 수집 중", available: true },
    { num: 2, title: "사회 정의와 불평등", icon: "unit-justice.png", status: "COMING SOON", available: false },
    { num: 3, title: "시장경제와 지속가능발전", icon: "unit-market.png", status: "COMING SOON", available: false },
    { num: 4, title: "세계화와 평화", icon: "unit-global-peace.png", status: "COMING SOON", available: false },
    { num: 5, title: "미래와 지속가능한 삶", icon: "unit-future.png", status: "COMING SOON", available: false },
  ];

  const themes = [
    { title: "국내외 인권 문제", icon: "theme-human-rights.png" },
    { title: "사회·공간 불평등", icon: "theme-inequality.png" },
    { title: "현대 세계 무역", icon: "theme-trade.png" },
    { title: "세계화의 문제점", icon: "theme-globalization.png" },
    { title: "국제사회 갈등과 협력", icon: "theme-cooperation.png" },
  ];

  return (
    <MainHubTemplate>
      {/* Hero Section */}
      <div className="hub-hero">
        <div className="hub-actions-top">
          <span className="school-badge">
            안산강서고 1학년 · 탐구활동 수업 자료
          </span>
          <div className="hub-quick-actions">
            <button className="icon-button" onClick={onOpenVault} title="권리 카드 보관소" aria-label="권리 카드 보관소">
              <Medal size={21} weight="duotone" />
            </button>
            <button className="icon-button" onClick={onIntro} aria-label="게임 소개와 교과 연계">
              <BookOpen size={21} />
            </button>
            <button className="icon-button" onClick={onSettings} aria-label="설정">
              <Gear size={21} />
            </button>
          </div>
        </div>

        {/* Brand Logo & Title Lockup */}
        <div className="hub-logo-area">
          <div className="logo-badge-row">
            <span className="logo-emblem">✦</span>
            <span className="logo-subtext">ARCA SOCIAL INVESTIGATION</span>
            <span className="subject-tag">통합사회 2</span>
          </div>
          <h1 className="hub-main-title">
            통합사회<br />
            <span className="highlight">탐구 아케이드</span>
          </h1>
          <p className="hub-slogan">사건을 읽고, 근거를 모아, 더 나은 사회를 설계하라.</p>
        </div>

        {/* Duo Character Stage */}
        <div className="hub-character-stage">
          <CharacterPortrait characterId="haeon" expression="default" position="left" size="md" />
          <CharacterPortrait characterId="ari" expression="default" position="right" size="md" />
        </div>
      </div>

      {/* Main Tab Toggle */}
      <div className="hub-mode-tabs">
        <button
          className={`mode-tab-btn ${activeTab === "unit" ? "active" : ""}`}
          onClick={() => setActiveTab("unit")}
        >
          단원별 탐구
        </button>
        <button
          className={`mode-tab-btn ${activeTab === "theme" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("theme");
            onComingSoon("공통주제 도전 모드는 준비 중입니다. 1단원 인권 보장과 헌법 탐구를 먼저 도전해 보세요!");
          }}
        >
          공통주제 도전
        </button>
      </div>

      <div className="hub-content">
        {/* Featured Mission Card (시안 01번 프레임) */}
        <article className="featured-mission-gold">
          <div className="featured-top-tag">
            <span>오늘의 추천 미션</span>
          </div>
          <div className="featured-body">
            <div className="featured-info">
              <h2>기본권 침해 사례를 해결하라</h2>
              <p>1단원 · 인권 판례 챌린지 (M01~M06)</p>
            </div>
            <button className="gold-action-btn" onClick={onMap}>
              도전하기 &gt;
            </button>
          </div>
        </article>

        {/* Project Continuity Card */}
        <article className="project-subcard">
          <div>
            <span className="subcard-tag">제작하기</span>
            <strong>꿈의 도시 만들기 · 68%</strong>
          </div>
          <button className="subcard-btn" onClick={() => onSelectMission("m06")}>
            이어하기 &gt;
          </button>
        </article>

        {/* 5 Units Roadmap */}
        <div className="section-header-row">
          <h2 className="hub-section-title">5개 단원</h2>
          <span className="section-subtext">단원을 터치하여 미션 지도로 이동</span>
        </div>
        <div className="unit-roadmap visual-roadmap" aria-label="5개 단원 경로">
          {units.map((unit) => (
            <div
              key={unit.num}
              className={`unit-item ${unit.available ? "active" : "locked"}`}
              onClick={() => {
                if (unit.available) onMap();
                else onComingSoon(`${unit.title} 단원은 준비 중입니다 (COMING SOON).`);
              }}
            >
              <img src={`/assets/icons/units/${unit.icon}`} alt="" />
              <b>{unit.num}</b>
              <span>{unit.title}</span>
              <small>{unit.status}</small>
            </div>
          ))}
        </div>

        {/* Common Themes Free Challenge */}
        <div className="section-header-row" style={{ marginTop: "18px" }}>
          <h2 className="hub-section-title">공통주제 자유 도전</h2>
          <span className="badge-soon">COMING SOON</span>
        </div>
        <div className="theme-icon-grid">
          {themes.map((item) => (
            <button
              key={item.title}
              onClick={() => onComingSoon(`'${item.title}' 자유 도전은 현재 업데이트 준비 중입니다.`)}
            >
              <img src={`/assets/icons/themes/${item.icon}`} alt="" />
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Quick Access Vault & Academy */}
        <div className="hub-grid" style={{ marginTop: "18px" }}>
          <button className="hub-card" onClick={onOpenVault}>
            <Medal size={28} weight="duotone" />
            <span>권리 카드 보관소</span>
            <small>{save.evidence.length}장 획득 · 교과 개념 열람</small>
          </button>
          <button className="hub-card" onClick={onAcademy}>
            <BookOpen size={28} weight="duotone" />
            <span>탐구 아카데미</span>
            <small>ROOM 1~3 개념 훈련</small>
          </button>
        </div>

        {/* Emergency Final Case Strip */}
        <div className="coming-strip" onClick={() => onComingSoon("긴급 쟁점 토론 배틀은 6개 미션 완료 후 개방됩니다.")}>
          <span>FINAL</span>
          <strong>인권수호국 긴급 사건</strong>
          <small>공공의 안전을 위해 시민의 자유를 제한해도 되는가?</small>
        </div>

        {/* Guide Entry */}
        <button className="game-intro-entry" onClick={onIntro}>
          <BookOpen size={24} weight="duotone" />
          <span>
            <strong>게임 소개 · 교과 연계 안내</strong>
            <small>세계관 스토리와 탐구 파트너를 만나보세요.</small>
          </span>
          <ArrowRight size={18} />
        </button>
      </div>
    </MainHubTemplate>
  );
}

// ==========================================
// 02. MISSION MAP (단원·미션 선택 화면)
// ==========================================
function MissionMap({
  save,
  onStart,
  onBack,
  onSettings,
  onOpenVault,
  onComingSoon,
}: {
  save: SaveData;
  onStart: (mission: Mission) => void;
  onBack: () => void;
  onSettings: () => void;
  onOpenVault: () => void;
  onComingSoon: (msg: string) => void;
}) {
  const completedCount = save.completedMissions.length;

  return (
    <MissionMapTemplate>
      {/* Top Navigation Bar */}
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack} aria-label="홈으로">
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1, padding: "0 8px" }}>
            <span style={{ fontSize: "10px", color: "var(--teal-soft)", display: "block" }}>
              UNIT 1 · 단원 선택
            </span>
            <strong style={{ fontSize: "15px", color: "#ffffff" }}>
              1단원 인권 보장과 헌법
            </strong>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button className="icon-button" onClick={onOpenVault} title="권리 카드 보관소">
              <Medal size={20} weight="duotone" />
            </button>
            <button className="level-chip" onClick={onSettings}>
              진행도 {completedCount}/6
            </button>
          </div>
        </div>
      </header>

      <div className="map-ocean-container">
        <div className="map-header-badge">
          <span>인권 판례 챌린지 · 섬 지도</span>
        </div>

        {/* 6 Interactive Mission Nodes */}
        <div className="map-nodes-layout">
          {missions.map((mission, index) => {
            const isCompleted = save.completedMissions.includes(mission.id);
            const isCurrent = save.currentMission === mission.id;
            const isUnlocked = index === 0 || isCompleted || isCurrent || save.completedMissions.includes(missions[index - 1]?.id);

            return (
              <button
                key={mission.id}
                className={`map-node-card map-pos-${index + 1} ${isCompleted ? "node-completed" : isUnlocked ? "node-unlocked" : "node-locked"}`}
                disabled={!isUnlocked}
                onClick={() => onStart(mission)}
              >
                <div className="node-marker">
                  {isCompleted ? (
                    <CheckCircle size={18} weight="fill" />
                  ) : isUnlocked ? (
                    <span>M0{mission.number}</span>
                  ) : (
                    <LockKey size={16} />
                  )}
                </div>
                <div className="node-info">
                  <div className="node-badge-row">
                    <span className="node-code">M0{mission.number}</span>
                    <span className={`node-status-tag ${isCompleted ? "tag-done" : isUnlocked ? "tag-new" : "tag-lock"}`}>
                      {isCompleted ? "COMPLETE" : isCurrent ? "PROGRESS" : isUnlocked ? "NEW" : "LOCKED"}
                    </span>
                  </div>
                  <strong>{mission.title}</strong>
                  <small>{mission.subtitle}</small>
                </div>
              </button>
            );
          })}

          {/* BOSS Node */}
          <button
            className={`map-boss-node ${completedCount >= 6 ? "boss-ready" : "boss-locked"}`}
            onClick={() => {
              if (completedCount >= 6) onComingSoon("긴급 쟁점 토론 배틀(BOSS)이 곧 시작됩니다!");
              else onComingSoon("1단원의 6개 미션을 모두 완료하면 긴급 쟁점 토론 배틀(BOSS)이 개방됩니다.");
            }}
          >
            <LockKey size={18} />
            <div>
              <strong>긴급 쟁점 토론 배틀</strong>
              <small>FINAL BOSS · 6개 미션 완료 시 개방</small>
            </div>
          </button>
        </div>

        {/* Legend */}
        <div className="map-legend">
          <span><i className="legend-dot dot-done" /> 완료</span>
          <span><i className="legend-dot dot-current" /> 진행 중</span>
          <span><i className="legend-dot dot-locked" /> 미개방</span>
          <span><i className="legend-dot dot-boss" /> BOSS</span>
        </div>
      </div>
    </MissionMapTemplate>
  );
}

// ==========================================
// MISSION PLAYER
// ==========================================
function MissionPlayer({
  mission,
  save,
  setSave,
  onBack,
  onSettings,
  onAcademy,
  onOpenVault,
  onSelectCard,
  onActComplete,
}: {
  mission: Mission;
  save: SaveData;
  setSave: React.Dispatch<React.SetStateAction<SaveData>>;
  onBack: () => void;
  onSettings: () => void;
  onAcademy: () => void;
  onOpenVault: () => void;
  onSelectCard: (id: string) => void;
  onActComplete: () => void;
}) {
  const steps = useMemo(() => getMissionSteps(mission), [mission]);
  const step = steps[Math.min(save.currentScene, steps.length - 1)];
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [investigated, setInvestigated] = useState<string[]>(() => {
    const stepItems = step.items ?? mission.investigations;
    return stepItems.filter((item) => save.investigatedSources.includes(`${mission.id}:${item}`));
  });
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [step.id]);

  useEffect(() => {
    if (step.type === "zero") {
      void audioManager.playSfx("zero_appear");
      audioManager.stopBgm();
      void audioManager.playBgm("zero_challenge");
    }
  }, [step.type]);

  const progress = Math.round((save.currentScene / Math.max(1, steps.length - 1)) * 100);
  const advance = () => {
    void audioManager.playSfx("ui_click");
    setSave((prev) => ({ ...prev, currentScene: Math.min(prev.currentScene + 1, steps.length - 1) }));
  };

  const chooseAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    const correct = index === step.answer;
    void audioManager.playSfx(correct ? "success" : "error");
    setSave((prev) => ({
      ...prev,
      attempts: prev.attempts + 1,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      answerTimes: [...prev.answerTimes, elapsed],
      reviewConcepts: correct ? prev.reviewConcepts : [...new Set([...prev.reviewConcepts, ...mission.relatedConceptIds])],
    }));
  };

  const collectEvidence = (id: string) => {
    setSave((prev) => ({ ...prev, evidence: [...new Set([...prev.evidence, id])] }));
    void audioManager.playSfx("evidence_found");
  };

  const complete = () => {
    const goodChoice = save.studentChoices[mission.id] === mission.decisions.length - 1;
    setSave((prev) => {
      const firstCompletion = !prev.completedMissions.includes(mission.id);
      const nextExp = prev.exp + (firstCompletion ? mission.rewards.exp : 0);
      return {
        ...prev,
        completedMissions: [...new Set([...prev.completedMissions, mission.id])],
        exp: nextExp,
        level: Math.floor(nextExp / 150) + 1,
        currentMission: mission.nextMissionId ?? null,
        currentScene: 0,
        indicators: firstCompletion ? {
          ...prev.indicators,
          humanRights: Math.min(100, prev.indicators.humanRights + (goodChoice ? 12 : 5)),
          fairness: Math.min(100, prev.indicators.fairness + (goodChoice ? 6 : 2)),
          trust: Math.min(100, prev.indicators.trust + (goodChoice ? 8 : 3)),
        } : prev.indicators,
        skill: mission.rewards.skill ? [...new Set([...prev.skill, mission.rewards.skill])] : prev.skill,
        achievement: mission.rewards.title ? [...new Set([...prev.achievement, mission.rewards.title])] : prev.achievement,
      };
    });
    void audioManager.playSfx("mission_complete");
    if (mission.nextMissionId) window.setTimeout(() => {}, 0);
    else onActComplete();
  };

  return (
    <div className={`mission-screen background-${mission.backgrounds[0]}`}>
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack} aria-label="이전 화면"><ArrowLeft size={20} /></button>
          <div>
            <span>UNIT 1 · 인권수호국</span>
            <strong>M0{mission.number} {mission.title}</strong>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="icon-button" onClick={onOpenVault} title="카드 보관소"><Medal size={20} weight="duotone" /></button>
            <button className="level-chip" onClick={onSettings}>LV.{save.level}</button>
          </div>
        </div>
        <div className="mission-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="mission-stage">
        <MissionStepView
          step={step}
          mission={mission}
          save={save}
          selected={selected}
          setSelected={chooseAnswer}
          resetSelected={() => setSelected(null)}
          investigated={investigated}
          setInvestigated={setInvestigated}
          selectedEvidence={selectedEvidence}
          setSelectedEvidence={setSelectedEvidence}
          collectEvidence={collectEvidence}
          elapsed={elapsed}
          advance={advance}
          complete={complete}
          setSave={setSave}
          onAcademy={onAcademy}
          onSelectCard={onSelectCard}
        />
      </div>
    </div>
  );
}

// ==========================================
// MISSION STEP VIEW
// ==========================================
function MissionStepView({
  step,
  mission,
  save,
  selected,
  setSelected,
  resetSelected,
  investigated,
  setInvestigated,
  selectedEvidence,
  setSelectedEvidence,
  collectEvidence,
  elapsed,
  advance,
  complete,
  setSave,
  onAcademy,
  onSelectCard,
}: {
  step: MissionStep;
  mission: Mission;
  save: SaveData;
  selected: number | null;
  setSelected: (index: number) => void;
  resetSelected: () => void;
  investigated: string[];
  setInvestigated: React.Dispatch<React.SetStateAction<string[]>>;
  selectedEvidence: string[];
  setSelectedEvidence: React.Dispatch<React.SetStateAction<string[]>>;
  collectEvidence: (id: string) => void;
  elapsed: number;
  advance: () => void;
  complete: () => void;
  setSave: React.Dispatch<React.SetStateAction<SaveData>>;
  onAcademy: () => void;
  onSelectCard: (id: string) => void;
}) {
  const evidenceIds = step.evidenceIds ?? mission.evidenceIds;
  const nextButton = (disabled = false, label = "계속") => (
    <button className="primary-button full-button" disabled={disabled} onClick={advance}>
      {label}<ArrowRight size={18} />
    </button>
  );

  const [briefingPartner, setBriefingPartner] = useState<"ari" | "player" | "zero">("ari");
  const [selectedQuestion, setSelectedQuestion] = useState<DialogueOption | null>(null);

  // 03. CASE BRIEFING
  if (step.type === "briefing") {
    const isM05 = mission.id === "m05";
    const clientCharacter = isM05 ? "npc" : "haeon";
    const clientName = isM05 ? "지우(가명) / 16세 / 고등학생" : "인권수호국 접수관";
    const requestText = isM05 ? "과거 영상 삭제 및 잊힐 권리 구제" : "기본권 침해 판례 정밀 조사";
    const periodText = isM05 ? "2년 전 게시" : "역사적 발생 사건";
    const issueText = isM05 ? "개인정보보호, 표현의 자유, 잊힐 권리, 알 권리" : mission.relatedConceptIds.join(", ");

    return (
      <CaseBriefingTemplate>
        <div className="briefing-header-card">
          <div>
            <span className="school-badge">CASE 00{mission.number}</span>
            <h2 style={{ fontSize: "20px", margin: "4px 0 6px", color: "#fff2cd" }}>{mission.title}</h2>
            <p style={{ margin: 0, fontSize: "11px", color: "#b8d0d8", lineHeight: 1.5 }}>{step.body}</p>
          </div>
          <CharacterPortrait characterId={clientCharacter} expression="worried" size="bust" label={false} />
        </div>

        <section className="briefing-info-table" aria-label="사건 정보">
          <strong style={{ fontSize: "12px", color: "var(--gold)", marginBottom: "4px" }}>사건 정보</strong>
          <div className="briefing-info-row"><dt>• 의뢰인:</dt><dd>{clientName}</dd></div>
          <div className="briefing-info-row"><dt>• 요청 내용:</dt><dd>{requestText}</dd></div>
          <div className="briefing-info-row"><dt>• 발생 시기:</dt><dd>{periodText}</dd></div>
          <div className="briefing-info-row"><dt>• 관련 쟁점:</dt><dd>{issueText}</dd></div>
        </section>

        <div className="briefing-consult-box">
          <CharacterPortrait characterId={briefingPartner} expression={briefingPartner === "zero" ? "challenge" : "default"} size="avatar" label={false} />
          <p>
            {briefingPartner === "ari" && "탐구관님, 사건의 사실 관계와 헌법적 쟁점부터 차근차근 확인해 볼까요?"}
            {briefingPartner === "player" && "네, 관련 자료를 찾아보고 당사자 진술과 교과서 법적 근거를 조사하겠습니다."}
            {briefingPartner === "zero" && "무조건 삭제하는 게 능사는 아니야. 공익성과 알 권리도 따져봐야지."}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
          <div className="briefing-cast-row">
            <button className={`cast-avatar-button ${briefingPartner === "ari" ? "active" : ""}`} onClick={() => setBriefingPartner("ari")} aria-label="파트너 아리 선택">
              <CharacterPortrait characterId="ari" expression="default" size="avatar" label={false} />
            </button>
            <button className={`cast-avatar-button ${briefingPartner === "player" ? "active" : ""}`} onClick={() => setBriefingPartner("player")} aria-label="탐구관 선택">
              <CharacterPortrait characterId="player" expression="default" size="avatar" label={false} />
            </button>
            <button className={`cast-avatar-button ${briefingPartner === "zero" ? "active" : ""}`} onClick={() => setBriefingPartner("zero")} aria-label="ZERO 선택">
              <CharacterPortrait characterId="zero" expression="challenge" size="avatar" label={false} />
            </button>
          </div>
          <button className="primary-button" style={{ minHeight: "44px", padding: "0 22px" }} onClick={advance}>
            조사 시작 <ArrowRight size={17} />
          </button>
        </div>
      </CaseBriefingTemplate>
    );
  }

  // 04. CHARACTER DIALOGUE (교과서 발췌 질문 3가지 인터랙션)
  if (step.type === "dialogue" && step.scene) {
    const questions = step.dialogueOptions || missionDialogueQuestions[mission.id] || [];
    const speakerChar = step.scene.character;
    const isPlayer = speakerChar === "player";
    const partnerChar: "ari" | "haeon" = speakerChar === "haeon" ? "haeon" : "ari";

    return (
      <DialogueTemplate>
        <div className="scene-label">{step.scene.background.replaceAll("_", " ").toUpperCase()}</div>

        <div className="duo-dialogue-stage">
          {/* Partner Turn (Left) */}
          <div className="dialogue-turn turn-left">
            <CharacterPortrait characterId={partnerChar} expression={isPlayer ? "default" : step.scene.expression} size="avatar" label={false} />
            <div className="dialogue-bubble">
              <span className="dialogue-turn-name">{partnerChar === "ari" ? "AR-I (아리)" : "해온"}</span>
              {selectedQuestion ? selectedQuestion.answerText : (isPlayer ? "먼저 사실 관계를 정리해 보자. 교과서의 어떤 개념이 필요할까?" : step.scene.text)}
              {selectedQuestion?.textbookRef && (
                <span className="dialogue-textbook-pill">
                  📖 {selectedQuestion.textbookRef}
                </span>
              )}
            </div>
          </div>

          {/* Player Turn (Right) */}
          <div className="dialogue-turn turn-right">
            <CharacterPortrait characterId="player" expression={isPlayer ? step.scene.expression : "think"} size="avatar" label={false} />
            <div className="dialogue-bubble">
              <span className="dialogue-turn-name">탐구관 (나)</span>
              {selectedQuestion ? selectedQuestion.question : (isPlayer ? step.scene.text : "네, 교과서 관련 자료를 찾아보고 핵심 쟁점을 확인하겠습니다.")}
            </div>
          </div>
        </div>

        {/* 3 Interactive Questions from Textbook */}
        <div className="dialogue-question-section">
          <span className="dialogue-question-header">
            💡 교과서 핵심 탐구 질문을 선택하세요:
          </span>
          <div className="dialogue-question-list">
            {questions.map((item, idx) => (
              <button
                key={idx}
                className={`dialogue-q-btn ${selectedQuestion?.question === item.question ? "active" : ""}`}
                onClick={() => {
                  setSelectedQuestion(item);
                  void audioManager.playSfx("ui_click");
                }}
              >
                <span>◉ {item.question}</span>
                {item.textbookRef && <small>{item.textbookRef}</small>}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          {nextButton(false, selectedQuestion ? "답변 확인 완료 · 다음으로" : "조사 계속 진행")}
        </div>
      </DialogueTemplate>
    );
  }

  // 05. INVESTIGATION
  if (step.type === "investigation") {
    const need = mission.id === "m05" ? 3 : 1;
    const items = step.items ?? mission.investigations;
    return (
      <InvestigationTemplate>
        <TemplateHeading eyebrow={`조사 포인트 ${investigated.length}/${need}`} title={step.title} description="조사할 항목을 선택하여 교과서 쟁점을 수집하세요." icon="evidence" />
        <div className="investigation-list">
          {items.map((item) => (
            <button
              key={item}
              className={investigated.includes(item) ? "checked" : ""}
              onClick={() => {
                setInvestigated((prev) => [...new Set([...prev, item])]);
                setSave((prev) => ({ ...prev, investigatedSources: [...new Set([...prev.investigatedSources, `${mission.id}:${item}`])] }));
                void audioManager.playSfx("evidence_found");
              }}
            >
              <FileText size={22} />
              <span>{item}</span>
              {investigated.includes(item) && <CheckCircle size={18} weight="fill" />}
            </button>
          ))}
        </div>
        {nextButton(investigated.length < need, `다음 (${investigated.length}/${need})`)}
      </InvestigationTemplate>
    );
  }

  // 06. SOURCE DETAIL (With Audio Interview & Textbook Extra Notes)
  if (step.type === "source") {
    const isM05 = mission.id === "m05";
    const textbook = step.textbookSource;

    return (
      <SourceDetailTemplate>
        <TemplateHeading eyebrow="자료 상세보기" title={step.title} description="출처와 교과서 페이지를 확인하며 법적 쟁점을 분석하세요." />

        {isM05 ? (
          <div className="audio-interview-card">
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <CharacterPortrait characterId="npc" expression="sad" size="avatar" label={false} />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "13px", color: "var(--gold)" }}>당사자 인터뷰 음성 기록</strong>
                <div className="audio-player-bar">
                  <button className="audio-play-btn" onClick={() => void audioManager.playSfx("ui_click")} aria-label="인터뷰 오디오 재생">
                    <Play size={16} weight="fill" />
                  </button>
                  <div className="audio-waveform">
                    {[12, 18, 8, 22, 16, 10, 24, 14, 20, 8, 16, 22, 12, 18].map((h, i) => (
                      <span key={i} style={{ height: `${h}px` }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "10px", color: "#8ab0be" }}>00:45 / 01:20</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "14px", background: "#051622", padding: "12px", borderRadius: "12px", border: "1px solid #ffffff12" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--teal-soft)", display: "block", marginBottom: "4px" }}>
                인터뷰 본문 발췌
              </span>
              <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.65, color: "#d9e8ed" }}>
                &ldquo;초등학교 때 친구들과 장난으로 찍은 영상을 올렸어요. 지금은 많이 후회하고 있어요. 그런데 영상을 삭제해도 다른 사이트나 SNS에 퍼져 삭제되지 않아요. 학교에서도 그 영상 때문에 놀림을 받아서 너무 힘들어요.&rdquo;
              </p>
            </div>

            {/* Textbook Reference Box */}
            <div className="textbook-detail-box">
              <span className="textbook-tag">📖 교과서 114~115쪽 [읽기자료 발췌]</span>
              <p><strong>[디지털 잊힐 권리와 알 권리의 충돌]</strong> 정보통신망법 제44조의2 및 방송통신위원회 '자기게시물 접근배제요청권 가이드라인'에 따라 미성년 시기 게시물의 경우 인격권 보호의 필요성이 높게 인정됨.</p>
            </div>

            <div style={{ marginTop: "8px", background: "#092433", padding: "10px", borderRadius: "10px", border: "1px solid #23d2c333" }}>
              <span style={{ fontSize: "10px", fontWeight: 800, color: "var(--gold)", display: "block", marginBottom: "2px" }}>분석 메모</span>
              <p style={{ margin: 0, fontSize: "11px", color: "#bdd3db", lineHeight: 1.55 }}>
                당사자는 비공익적 사생활 영상의 무단 복제로 인한 인격권 침해를 겪고 있음. 비례 원칙에 따른 검색 결과 배제 조치 검토 필요.
              </p>
            </div>
          </div>
        ) : (
          <article className="source-paper">
            <span className="source-stamp">교과서 판례 및 자료 분석</span>
            <p>{step.body}</p>
            {textbook && (
              <div className="textbook-detail-box" style={{ marginTop: "12px" }}>
                <span className="textbook-tag">📖 {textbook.page} · {textbook.section}</span>
                <p><strong>[핵심 조문]</strong> {textbook.quote}</p>
                <small>💡 <strong>탐구 메모:</strong> {textbook.memo}</small>
              </div>
            )}
          </article>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
          <button className="secondary-button" onClick={advance}>목록으로</button>
          <button className="primary-button" onClick={advance}>Evidence로 저장 <ArrowRight size={17} /></button>
        </div>
      </SourceDetailTemplate>
    );
  }

  // 08. PUZZLE
  if (step.type === "puzzle") {
    const correct = selected === step.answer;
    return (
      <PuzzleTemplate>
        <TemplateHeading eyebrow="ACTIVE PUZZLE" title={step.title} description="개념의 본질을 상황에 적용하여 판독하세요." />
        <div className="timer-chip"><Clock size={17} /> {elapsed}초 경과</div>
        <h3 className="question-title">{step.question}</h3>
        <div className="choice-grid">
          {step.choices?.map((choice, index) => (
            <button key={choice} className={selected === index ? correct ? "correct" : "incorrect" : ""} disabled={selected !== null} onClick={() => setSelected(index)}>
              <span>{index + 1}</span>{choice}
            </button>
          ))}
        </div>
        {selected !== null && (
          <div className={correct ? "feedback success" : "feedback warning"}>
            {correct ? "정확한 판단입니다! 교과서 핵심 개념과 사례를 올바르게 연결했습니다." : "오답입니다. 정답을 외우기보다 개념의 본래 의미를 다시 점검하고 재도전하세요."}
          </div>
        )}
        {selected !== null && !correct && (
          <button className="secondary-button full-button" onClick={resetSelected}>다시 도전</button>
        )}
        {nextButton(!correct, "퍼즐 통과")}
      </PuzzleTemplate>
    );
  }

  // 07. EVIDENCE VAULT (권리 카드 회수 및 상세 열람)
  if (step.type === "evidence") {
    return (
      <EvidenceTemplate>
        <TemplateHeading eyebrow="RIGHTS CARD VAULT" title={step.title} description="카드를 터치하여 보관함에 등록하고 상세 교과 내용을 확인하세요." icon="evidence" />
        <div className="card-rule">
          <strong>권리 카드 획득 기준</strong>
          <span>① 조사 및 퍼즐 판독 통과</span>
          <span>② 카드를 터치하여 보관함 등록 및 교과 개념 열람</span>
          <span>③ 필수 카드가 모두 모이면 최종 판정 개방</span>
        </div>
        <div className="evidence-list">
          {evidenceIds.map((id) => (
            <EvidenceCard
              key={id}
              data={evidenceCatalog[id]}
              collected={save.evidence.includes(id)}
              selected={false}
              onClick={() => {
                collectEvidence(id);
                onSelectCard(id);
              }}
            />
          ))}
        </div>
        {nextButton(!evidenceIds.every((id) => save.evidence.includes(id)), `권리 카드 ${evidenceIds.filter((id) => save.evidence.includes(id)).length}/${evidenceIds.length} · 등록 완료`)}
      </EvidenceTemplate>
    );
  }

  // 09. ZERO CHALLENGE
  if (step.type === "zero") {
    const correct = selected === step.answer;
    return (
      <ZeroChallengeTemplate>
        <div className="zero-title">
          <span>ZERO CHALLENGE</span>
          <h2>논리 비판 및 반론 검증</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "10px", alignItems: "center", margin: "14px 0" }}>
          <div className="zero-dialogue" style={{ margin: 0 }}>
            <strong style={{ color: "#ff8c7a", display: "block", marginBottom: "4px" }}>ZERO의 질문</strong>
            <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.65 }}>
              &ldquo;{step.body}&rdquo;
            </p>
          </div>
          <CharacterPortrait characterId="zero" expression={selected === null ? "challenge" : correct ? "surprise" : "confident"} size="bust" label={false} />
        </div>

        <div style={{ margin: "10px 0 6px", fontSize: "12px", fontWeight: 800, color: "var(--gold)" }}>당신의 생각은?</div>
        <div className="choice-grid compact">
          {step.choices?.map((choice, index) => (
            <button key={choice} className={selected === index ? "selected" : ""} disabled={selected !== null} onClick={() => setSelected(index)}>
              <span>{String.fromCharCode(65 + index)}</span>
              {choice}
            </button>
          ))}
        </div>

        {selected !== null && (
          <p className="zero-reaction">
            {correct ? "ZERO: 흠... 단순한 감정이 아니라 헌법적 근거를 바탕으로 반론했군. 다음 판단을 지켜보지." : "ZERO: 내 반론에 대한 대응 논리가 여전히 빈약해. 다시 논리를 가다듬어 봐."}
          </p>
        )}
        {selected !== null && !correct && (
          <button className="secondary-button full-button" onClick={resetSelected}>반론 논리 다시 구성</button>
        )}
        {nextButton(!correct, "최종 판정으로")}
      </ZeroChallengeTemplate>
    );
  }

  // 10. FINAL DECISION
  if (step.type === "decision") {
    const needed = mission.id === "m05" ? 2 : 1;
    const available = mission.evidenceIds.filter((id) => save.evidence.includes(id));
    return (
      <DecisionTemplate>
        <TemplateHeading eyebrow="YOUR FINAL DECISION" title={step.title} description={`판결을 선택하고 뒷받침할 Evidence ${needed}장을 필수로 지정하세요.`} />
        <div className="decision-options">
          {step.choices?.map((choice, index) => (
            <button key={choice} className={selected === index ? "selected" : ""} onClick={() => setSelected(index)}>
              <span>{String.fromCharCode(65 + index)}</span>
              {choice}
            </button>
          ))}
        </div>
        <div className="evidence-selection-guide">
          <Info size={16} />
          <span>제출할 Evidence 선택 ({selectedEvidence.length}/{needed})</span>
        </div>
        <div className="evidence-select-row">
          {available.map((id) => (
            <EvidenceCard
              key={id}
              data={evidenceCatalog[id]}
              collected
              selected={selectedEvidence.includes(id)}
              onClick={() => setSelectedEvidence((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])}
            />
          ))}
        </div>
        <button
          className="primary-button full-button"
          disabled={selected === null || selectedEvidence.length < needed}
          onClick={() => {
            setSave((prev) => ({
              ...prev,
              studentChoices: { ...prev.studentChoices, [mission.id]: selected ?? 0 },
              decisionHistory: [...prev.decisionHistory, { missionId: mission.id, choice: selected ?? 0, evidenceIds: selectedEvidence }],
            }));
            void audioManager.playSfx("decision_submit");
            advance();
          }}
        >
          판결 및 근거 최종 제출 <Check size={18} />
        </button>
      </DecisionTemplate>
    );
  }

  // 11. RESULT
  const good = save.studentChoices[mission.id] === mission.decisions.length - 1;
  const projectedExp = save.exp + (save.completedMissions.includes(mission.id) ? 0 : mission.rewards.exp);
  const rank = projectedExp >= 500 ? "선임 인권수호관" : projectedExp >= 300 ? "사건 담당관" : projectedExp >= 150 ? "정식 인권수호관" : "수습 인권수호관";

  return (
    <ResultTemplate status={good ? "success" : "warning"}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", margin: "8px 0 14px" }}>
        <CharacterPortrait characterId="ari" expression={good ? "success" : "warning"} size="bust" label={false} />
        <h2 style={{ fontSize: "20px", color: "var(--gold)", margin: "8px 0 2px" }}>탐구 결과 피드백</h2>
        <p style={{ margin: 0, fontSize: "12px", color: "#a8c7d3" }}>{good ? "훌륭해요! 균형 잡힌 판단을 내렸어요." : "재검토가 필요한 판단입니다."}</p>
      </div>

      <div className="rank-panel">
        <span>CURRENT STATUS</span>
        <strong>{rank}</strong>
        <small>{projectedExp} EXP · 권리 카드 {save.evidence.length}장 보유</small>
      </div>

      <div className="indicator-gains">
        <span>인권 <b>+{good ? 12 : 5}</b></span>
        <span>공정성 <b>+{good ? 6 : 2}</b></span>
        <span>시민신뢰 <b>+{good ? 8 : 3}</b></span>
      </div>

      <div className="rubric">
        <p><span>자료 활용도</span><b>★★★★☆</b></p>
        <p><span>근거 타당성</span><b>{good ? "★★★★★" : "★★★☆☆"}</b></p>
        <p><span>다각적 시각</span><b>{good ? "★★★★☆" : "★★★☆☆"}</b></p>
        <p><span>의사결정력</span><b>{good ? "★★★★★" : "★★★☆☆"}</b></p>
      </div>

      <p className="ari-feedback">
        아리: {good ? "피해 당사자의 고통과 사회적 기본권의 영향을 깊이 고려했어. 제출한 Evidence가 판결의 정당성을 완벽히 뒷받침해." : "일면의 효율이나 주장은 담겼지만, 소외된 권리가 발생할 위험이 있어. 아카데미에서 개념을 더 다듬어 언제든 재도전해 봐."}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" }}>
        <button className="secondary-button" onClick={() => setSave((prev) => ({ ...prev, currentScene: 0 }))}>다시 보기</button>
        <button className="primary-button" onClick={complete}>
          {mission.nextMissionId ? "다음 사건 >" : "ACT 1 종합 완료"}
        </button>
      </div>
    </ResultTemplate>
  );
}

// ==========================================
// EVIDENCE CARD COMPONENT
// ==========================================
function EvidenceCard({
  data,
  collected,
  selected,
  onClick,
}: {
  data: EvidenceCardData;
  collected: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`evidence-card ${collected ? "collected" : "uncollected"} ${selected ? "selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <div className="card-top-row">
        <span className="evidence-category">{data.category}</span>
        {data.textbookPage && <span className="card-page-badge">{data.textbookPage}</span>}
      </div>
      <Medal size={26} weight="duotone" />
      <strong>{data.title}</strong>
      <p>{data.description}</p>
      <small>{data.sourceLabel} · 신뢰도 {data.reliability}/5</small>
      <i>{selected ? "✓ 제출 선택됨" : collected ? "보관함 등록됨 (터치하여 상세)" : "터치하여 획득"}</i>
    </button>
  );
}

// ==========================================
// CARD VAULT MODAL (권리 카드 보관소)
// ==========================================
function CardVaultModal({
  save,
  onClose,
  onSelectCard,
}: {
  save: SaveData;
  onClose: () => void;
  onSelectCard: (id: string) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const allCards = Object.values(evidenceCatalog);

  const filteredCards = allCards.filter((card) => {
    if (filter === "all") return true;
    if (filter === "collected") return save.evidence.includes(card.id);
    return card.category === filter;
  });

  return (
    <div className="modal-backdrop vault-backdrop" role="presentation">
      <section className="card-vault-modal" role="dialog" aria-modal="true" aria-labelledby="vault-title">
        <header className="vault-header">
          <button className="modal-close" onClick={onClose} aria-label="보관소 닫기">
            <X size={20} />
          </button>
          <div className="vault-title-row">
            <Medal size={24} weight="fill" color="var(--gold)" />
            <div>
              <h2 id="vault-title">권리 카드 보관소</h2>
              <p>수집한 아이템 카드를 눌러 관련 교과서 내용과 헌법 조문을 열람하세요.</p>
            </div>
          </div>

          <div className="vault-tabs">
            {["all", "collected", "concept", "historical", "law", "testimony"].map((tab) => (
              <button
                key={tab}
                className={filter === tab ? "active" : ""}
                onClick={() => setFilter(tab)}
              >
                {tab === "all" ? "전체" : tab === "collected" ? `보유(${save.evidence.length})` : tab === "concept" ? "개념" : tab === "historical" ? "역사" : tab === "law" ? "법/제도" : "인터뷰"}
              </button>
            ))}
          </div>
        </header>

        <div className="vault-grid">
          {filteredCards.map((card) => {
            const hasIt = save.evidence.includes(card.id);
            return (
              <button
                key={card.id}
                className={`vault-item-card ${hasIt ? "has-card" : "locked-card"}`}
                onClick={() => onSelectCard(card.id)}
              >
                <div className="vault-item-icon">
                  <Medal size={22} weight={hasIt ? "fill" : "regular"} />
                </div>
                <div className="vault-item-info">
                  <span className="vault-category">{card.category}</span>
                  <strong>{card.title}</strong>
                  <small>{card.textbookPage ?? "교과서 연계"}</small>
                </div>
                <span className={`vault-status ${hasIt ? "status-got" : "status-lock"}`}>
                  {hasIt ? "보유" : "미수집"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ==========================================
// CARD DETAIL MODAL (교과서 내용 상세 팝업)
// ==========================================
function CardDetailModal({
  cardId,
  onClose,
}: {
  cardId: string;
  onClose: () => void;
}) {
  const card = evidenceCatalog[cardId];
  if (!card) return null;

  return (
    <div className="modal-backdrop detail-backdrop" role="presentation">
      <section className="card-detail-popup" role="dialog" aria-modal="true" aria-labelledby="card-detail-title">
        <button className="modal-close" onClick={onClose} aria-label="카드 상세 닫기">
          <X size={20} />
        </button>

        <div className="card-popup-header">
          <div className="card-popup-badge-row">
            <span className="card-popup-cat">{card.category.toUpperCase()}</span>
            <span className="card-popup-rel">신뢰도 ★★★★★</span>
          </div>
          <h2 id="card-detail-title">{card.title}</h2>
          <p className="card-popup-summary">{card.description}</p>
        </div>

        <div className="card-popup-body">
          {/* Textbook Reference */}
          {card.textbookPage && (
            <div className="popup-section">
              <span className="popup-section-title">📖 교과서 출처 및 페이지</span>
              <p className="popup-page-highlight">{card.textbookPage}</p>
            </div>
          )}

          {/* Constitutional Quote */}
          {card.textbookQuote && (
            <div className="popup-section">
              <span className="popup-section-title">📜 헌법 및 법률 조문</span>
              <blockquote className="popup-quote">{card.textbookQuote}</blockquote>
            </div>
          )}

          {/* Application Case */}
          {card.applicationCase && (
            <div className="popup-section">
              <span className="popup-section-title">🔍 현실 적용 사례 및 판례</span>
              <p>{card.applicationCase}</p>
            </div>
          )}

          {/* Study Tip */}
          {card.studyTip && (
            <div className="popup-section study-tip-box">
              <span className="popup-section-title">💡 핵심 탐구 팁</span>
              <p>{card.studyTip}</p>
            </div>
          )}
        </div>

        <button className="primary-button full-button" onClick={onClose}>
          확인 완료
        </button>
      </section>
    </div>
  );
}

// ==========================================
// COMING SOON MODAL
// ==========================================
function ComingSoonModal({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="coming-soon-popup" role="dialog" aria-modal="true" aria-labelledby="soon-title">
        <button className="modal-close" onClick={onClose} aria-label="닫기">
          <X size={20} />
        </button>
        <Sparkle size={36} weight="fill" color="var(--gold)" />
        <h2 id="soon-title">COMING SOON</h2>
        <p>{message}</p>
        <button className="primary-button full-button" onClick={onClose}>
          확인
        </button>
      </section>
    </div>
  );
}

// ==========================================
// ACADEMY SCREEN
// ==========================================
function AcademyScreen({
  save,
  setSave,
  returnPoint,
  onReturn,
}: {
  save: SaveData;
  setSave: React.Dispatch<React.SetStateAction<SaveData>>;
  returnPoint: ReturnPoint;
  onReturn: () => void;
}) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [choice, setChoice] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<string[]>([]);
  const room = academyRooms.find((item) => item.id === roomId);

  if (!room) {
    return (
      <AcademyTemplate>
        <GameHUD missionTitle="탐구 아카데미" level={save.level} exp={save.exp} onBack={onReturn} />
        <div className="screen-scroll">
          <TemplateHeading eyebrow="ACADEMY · ROOM 1~3" title="개념을 훈련하는 연구실" description="개념 카드 뒤집기부터 주장·근거 글쓰기까지 4단계로 깊어집니다." icon="academy" />
          <div className="academy-guide">
            <CharacterPortrait characterId="ari" expression="default" position="right" />
            <p>각 단계는 단순 암기가 아닌 적용 훈련이야. 오답 시 힌트를 확인하고 재도전해 봐!</p>
          </div>
          <div className="room-list">
            {academyRooms.map((item) => {
              const terms = item.concepts.map((concept) => concept.term);
              return (
                <button key={item.id} onClick={() => { setRoomId(item.id); setLevel(1); setChoice(null); setFlipped([]); }}>
                  <BookOpen size={24} />
                  <div>
                    <strong>{item.title}</strong>
                    <small>{terms.join(" · ")}</small>
                  </div>
                  <span>{Math.max(0, ...terms.map((term) => save.mastery[term] ?? 0))}/4</span>
                </button>
              );
            })}
          </div>
          {returnPoint && <button className="primary-button full-button" onClick={onReturn}>진행 중이던 Mission으로 복귀</button>}
        </div>
      </AcademyTemplate>
    );
  }

  const terms = room.concepts.map((concept) => concept.term);
  const levelData = room.levels[level - 1];
  const draft = save.academyDrafts?.[room.id]?.[String(level)] ?? "";
  const correct = level === 1 || choice === levelData.answer;
  const isDraftValid = draft.trim().length >= 10;
  const ready = level === 1 ? flipped.length === room.concepts.length && isDraftValid : correct && isDraftValid;
  const writeDraft = (targetLevel: number, text: string) => setSave((prev) => ({ ...prev, academyDrafts: { ...(prev.academyDrafts ?? {}), [room.id]: { ...(prev.academyDrafts?.[room.id] ?? {}), [String(targetLevel)]: text } } }));
  const finishLevel = () => {
    setSave((prev) => ({ ...prev, mastery: { ...prev.mastery, ...Object.fromEntries(terms.map((term) => [term, Math.max(prev.mastery[term] ?? 0, level)])) } }));
    if (level < 4) { setLevel((value) => value + 1); setChoice(null); setFlipped([]); } else { setRoomId(null); setChoice(null); setFlipped([]); }
  };
  const labels = ["개념 카드", "개념 연결", "사례 적용", "주장·근거 글쓰기"];

  return (
    <AcademyTemplate>
      <GameHUD missionTitle={room.title} level={save.level} exp={save.exp} onBack={() => setRoomId(null)} />
      <div className="screen-scroll">
        <div className="academy-levels">
          {labels.map((label, index) => (
            <button
              key={label}
              className={level === index + 1 ? "active" : terms.some((term) => (save.mastery[term] ?? 0) >= index + 1) ? "done" : ""}
              onClick={() => {
                if (index + 1 <= Math.max(1, Math.max(...terms.map((term) => save.mastery[term] ?? 0)) + 1)) {
                  setLevel(index + 1);
                  setChoice(null);
                  setFlipped([]);
                }
              }}
            >
              {index + 1}<small>{label}</small>
            </button>
          ))}
        </div>
        <div className="academy-guide compact-guide">
          <CharacterPortrait characterId="ari" expression={correct && (level === 1 ? flipped.length === room.concepts.length : choice !== null) ? "default" : "think"} />
          <p>{level === 1 ? "카드를 눌러 모든 개념의 정의를 확인하고 탐구 글을 작성하세요." : levelData.question}</p>
        </div>
        {level === 1 ? (
          <div className="concept-card-grid flip-grid">
            {room.concepts.map((concept) => {
              const open = flipped.includes(concept.term);
              return (
                <button
                  key={concept.term}
                  className={open ? "flipped" : ""}
                  aria-pressed={open}
                  onClick={() => setFlipped((prev) => prev.includes(concept.term) ? prev.filter((term) => term !== concept.term) : [...prev, concept.term])}
                >
                  <span className="card-front"><Brain size={22} /><strong>{concept.term}</strong><small>터치하여 정의 확인</small></span>
                  <span className="card-back"><strong>{concept.term}</strong><small>{concept.definition}</small></span>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div className="choice-grid">
              {levelData.choices.map((item, index) => (
                <button
                  key={item}
                  className={choice === index ? index === levelData.answer ? "correct" : "incorrect" : ""}
                  onClick={() => {
                    setChoice(index);
                    if (index !== levelData.answer) setSave((prev) => ({ ...prev, reviewConcepts: [...new Set([...prev.reviewConcepts, ...terms])] }));
                  }}
                  disabled={choice !== null}
                >
                  {item}
                </button>
              ))}
            </div>
            {choice !== null && choice !== levelData.answer && (
              <div className="retry-panel">
                <p>정답을 바로 공개하지 않아요. 개념의 본질과 사례를 다시 비교하고 재도전하세요.</p>
                <button className="secondary-button" onClick={() => setChoice(null)}>다시 도전</button>
              </div>
            )}
          </>
        )}
        <label className="academy-writing">
          <span>LEVEL {level} · 나의 탐구 생각 작성</span>
          <small>{levelData.prompt}</small>
          <textarea value={draft} onChange={(event) => writeDraft(level, event.target.value)} rows={level === 4 ? 5 : 3} placeholder="자신의 생각을 10자 이상 구체적으로 적어 보세요." />
          <i className={isDraftValid ? "valid-count" : ""}>{draft.trim().length}/10자 이상 {isDraftValid ? "✓ 완료" : "· 자동 저장"}</i>
        </label>
        <button className="primary-button full-button" disabled={!ready} onClick={finishLevel}>
          {level < 4 ? "글 저장 · 다음 단계로" : "글 저장 · 연구실 마스터"}
        </button>
      </div>
    </AcademyTemplate>
  );
}

// ==========================================
// RECORD SCREEN
// ==========================================
function RecordScreen({
  save,
  onBack,
  onOpenVault,
}: {
  save: SaveData;
  onBack: () => void;
  onOpenVault: () => void;
}) {
  const accuracy = save.attempts ? Math.round((save.correctAnswers / save.attempts) * 100) : 0;
  const understanding = Math.min(100, Math.round((Object.values(save.mastery).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(save.mastery).length * 4)) * 100));

  return (
    <AcademyTemplate>
      <GameHUD missionTitle="나의 탐구 기록" level={save.level} exp={save.exp} onBack={onBack} />
      <div className="screen-scroll">
        <TemplateHeading eyebrow="LEARNING ANALYTICS" title="이해도와 성장 지표" description="단순 점수보다 어떤 개념을 보강할지 점검하세요." />
        <div className="analytics-cards">
          <div className="metric-card"><strong>{understanding}%</strong><span>개념 이해도</span></div>
          <div className="metric-card"><strong>{accuracy}%</strong><span>문항 정확도</span></div>
          <div className="metric-card"><strong>{save.evidence.length}장</strong><span>권리 카드</span></div>
        </div>

        <div className="record-block" style={{ marginTop: "14px" }}>
          <button className="primary-button full-button" onClick={onOpenVault}>
            <Medal size={20} weight="fill" /> 권리 카드 보관소 열기
          </button>
        </div>
      </div>
    </AcademyTemplate>
  );
}

// ==========================================
// GAME INTRODUCTION
// ==========================================
function GameIntroduction({ onClose }: { onClose: () => void }) {
  const introCharacters = [
    { id: "player" as const, name: "탐구관", role: "플레이어 · 신입 탐구관", copy: "사건을 조사하고 자료를 분석해 사회 문제를 해결합니다.", skill: "자료 분석 · 근거 제시 · 의사 결정" },
    { id: "ari" as const, name: "아리 AR-I", role: "AI 탐구 파트너", copy: "질문과 힌트를 건네며 복잡한 개념과 자료의 연결을 돕습니다.", skill: "탐구 질문 · 개념 연결 · 학습 안내" },
    { id: "haeon" as const, name: "해온", role: "1단원 · 인권수호관", copy: "기본권을 지키는 가장 중요한 원칙과 실제 사건의 쟁점을 안내합니다.", skill: "인권 렌즈 · 헌법적 판단" },
    { id: "zero" as const, name: "ZERO", role: "논쟁형 라이벌", copy: "효율과 결과를 앞세운 반론으로 플레이어의 판단 근거를 시험합니다.", skill: "반론 제기 · 논리 검증" },
  ];

  return (
    <div className="modal-backdrop intro-backdrop">
      <section className="game-introduction" role="dialog" aria-modal="true" aria-labelledby="intro-title">
        <button className="modal-close" onClick={onClose} aria-label="게임 소개 닫기"><X size={20} /></button>
        <header>
          <span>GAME GUIDE · 우리가 만드는 사회</span>
          <h2 id="intro-title">통합사회 탐구 아케이드</h2>
          <p>사회를 탐구하고, 판단하고, 함께 더 나은 미래를 만듭니다.</p>
        </header>
        <div className="intro-story">
          <strong>STORY · 신입 탐구관의 첫 임무</strong>
          <p>사회의 균형을 지키는 ‘탐구 아카데미’에 기본권 침해 신호가 도착했습니다. 플레이어는 신입 탐구관으로 임명되어 AI 파트너 아리와 함께 사건 현장을 조사합니다. 교과서 자료와 시민의 목소리에서 Evidence를 모으고, 해온의 조언과 ZERO의 반론을 검토해 자신만의 판단을 완성해야 합니다.</p>
        </div>
        <h3>주요 캐릭터</h3>
        <div className="intro-character-list">
          {introCharacters.map((character) => (
            <article key={character.id} className={`intro-character intro-${character.id}`}>
              <CharacterPortrait characterId={character.id} expression="default" label={false} />
              <div>
                <span>{character.role}</span>
                <strong>{character.name}</strong>
                <p>{character.copy}</p>
                <small>{character.skill}</small>
              </div>
            </article>
          ))}
        </div>
        <button className="primary-button full-button" onClick={onClose}>탐구 시작 준비 완료</button>
      </section>
    </div>
  );
}

// ==========================================
// SETTINGS PANEL
// ==========================================
function SettingsPanel({
  audio,
  onChange,
  onClose,
}: {
  audio: AudioSettings;
  onChange: (value: Partial<AudioSettings>) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <button className="modal-close" onClick={onClose} aria-label="설정 닫기"><X size={20} /></button>
        <h2 id="settings-title"><Gear size={22} />게임 설정</h2>
        <label className="toggle-row">
          <span>{audio.bgm ? <Headphones size={21} /> : <SpeakerSlash size={21} />}BGM</span>
          <input type="checkbox" checked={audio.bgm} onChange={(event) => onChange({ bgm: event.target.checked })} />
        </label>
        <label>BGM 음량 <input type="range" min="0" max="1" step="0.05" value={audio.bgmVolume} onChange={(event) => onChange({ bgmVolume: Number(event.target.value) })} /></label>
        <label className="toggle-row">
          <span>{audio.sfx ? <SpeakerHigh size={21} /> : <SpeakerSlash size={21} />}효과음</span>
          <input type="checkbox" checked={audio.sfx} onChange={(event) => onChange({ sfx: event.target.checked })} />
        </label>
        <label>효과음 음량 <input type="range" min="0" max="1" step="0.05" value={audio.sfxVolume} onChange={(event) => onChange({ sfxVolume: Number(event.target.value) })} /></label>
      </section>
    </div>
  );
}

// ==========================================
// ACT COMPLETE
// ==========================================
function ActComplete({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop completion-backdrop">
      <section className="act-complete" role="dialog" aria-modal="true" aria-labelledby="complete-title">
        <Sparkle size={40} weight="fill" />
        <span>ACT 1 COMPLETE</span>
        <h2 id="complete-title">정식 인권수호관 임명</h2>
        <CharacterPortrait characterId="haeon" expression="default" />
        <p>여섯 사건을 모두 해결하고 권리 카드 수집 훈련을 훌륭히 완수했습니다.</p>
        <div><Medal size={22} />SKILL · 인권 렌즈 Lv.1 획득</div>
        <blockquote>“수호관의 판단으로 우리 사회의 인권과 공정성 지표가 한 단계 성장했습니다.”</blockquote>
        <button className="primary-button full-button" onClick={onClose}>미션 지도로 돌아가기</button>
      </section>
    </div>
  );
}
