"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle, Clock,
  FileText, Gear, Headphones, Info, LockKey, MapTrifold, Medal, Play,
  Sparkle, SpeakerHigh, SpeakerSlash, Trophy, Warning, X, MagnifyingGlass,
  User, UserCheck, SignOut, Printer, DownloadSimple, Certificate, ShieldCheck,
} from "@phosphor-icons/react";
import { academyRooms, evidenceCatalog, getMissionSteps, missionDialogueQuestions, missions } from "@/src/data/missions";
import { audioManager, defaultAudioSettings, type AudioSettings } from "@/src/game/audio/AudioManager";
import type { DialogueOption, EvidenceCardData, Mission, MissionStep, SaveData, SocialIndicators, StudentProfile } from "@/src/game/types";
import {
  AcademyTemplate, BottomNavigation, CaseBriefingTemplate, CharacterPortrait,
  DecisionTemplate, DialogueTemplate, EvidenceTemplate, GameHUD, InvestigationTemplate,
  MainHubTemplate, MissionMapTemplate, PuzzleTemplate, ResultTemplate,
  SourceDetailTemplate, StatusBadge, TemplateHeading, ZeroChallengeTemplate,
} from "@/src/components/GameTemplates";

const SAVE_KEY = "social-arcade-save-v4";
const baseIndicators: SocialIndicators = { humanRights: 52, fairness: 50, economy: 50, peace: 55, sustainability: 48, trust: 50 };
const defaultStudent: StudentProfile = {
  studentId: "10101",
  grade: "1학년",
  classNum: "1반",
  studentNum: "1번",
  name: "강서탐구관",
  isLoggedIn: false,
  schoolName: "안산강서고등학교",
};

const blankSave = (): SaveData => ({
  currentMission: null, currentScene: 0, level: 1, exp: 0, indicators: baseIndicators,
  evidence: ["HUMAN_DIGNITY", "UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY", "FREEDOM_RIGHT", "EQUALITY_RIGHT"],
  completedMissions: ["m01", "m02", "m03"], investigatedSources: [], studentChoices: {},
  decisionHistory: [], mastery: {}, academyDrafts: {}, reviewConcepts: [], skill: [], achievement: [],
  attempts: 0, correctAnswers: 0, answerTimes: [], audio: defaultAudioSettings,
  studentProfile: defaultStudent,
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
  const [loginOpen, setLoginOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);
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

  // Stage-specific dynamic BGM Router
  useEffect(() => {
    if (!hydrated) return;
    if (certOpen) {
      void audioManager.playBgm("certificate");
      void audioManager.playSfx("cert_fanfare");
      return;
    }
    if (view === "hub") {
      void audioManager.playBgm("main_hub");
    } else if (view === "map") {
      void audioManager.playBgm("mission_map");
    } else if (view === "academy") {
      void audioManager.playBgm("academy");
    } else if (view === "mission" && currentMission) {
      const steps = getMissionSteps(currentMission);
      const step = steps[save.currentScene] ?? steps[0];
      if (step?.type === "zero") {
        void audioManager.playBgm("zero_challenge");
      } else if (step?.type === "result") {
        void audioManager.playBgm("certificate");
      } else {
        void audioManager.playBgm("investigation");
      }
    }
  }, [view, save.currentMission, save.currentScene, certOpen, hydrated, currentMission]);

  const startNew = () => {
    const next = blankSave();
    next.currentMission = "m01";
    if (save.studentProfile) next.studentProfile = save.studentProfile;
    setSave(next);
    setActComplete(false);
    setView("map");
  };

  const continueGame = () => {
    setView(save.currentMission ? "mission" : "map");
  };

  const startMission = (mission: Mission) => {
    setSave((prev) => ({
      ...prev,
      currentMission: mission.id,
      currentScene: prev.currentMission === mission.id ? prev.currentScene : 0,
    }));
    setView("mission");
    void audioManager.playSfx("case_open");
  };

  const navigate = (tab: "home" | "challenge" | "record" | "growth") => {
    setView(tab === "home" ? "hub" : tab === "challenge" ? "map" : tab === "record" ? "record" : "academy");
  };

  const updateAudio = (next: Partial<AudioSettings>) => {
    audioManager.update(next);
    setAudio({ ...audioManager.settings });
    setSave((prev) => ({ ...prev, audio: { ...prev.audio, ...next } }));
  };

  const saveStudentProfile = (profile: StudentProfile) => {
    setSave((prev) => ({ ...prev, studentProfile: profile }));
    void audioManager.playSfx("success");
  };

  return (
    <main className="arcade-viewport">
      <div className="arcade-phone" aria-label="안산강서고 1학년 통합사회 탐구 아케이드 홈 화면">
        {view === "hub" && (
          <HubScreen
            save={save}
            onNew={startNew}
            onContinue={continueGame}
            onMap={() => setView("map")}
            onAcademy={() => setView("academy")}
            onIntro={() => setIntroOpen(true)}
            onSettings={() => setSettingsOpen(true)}
            onOpenVault={() => setVaultOpen(true)}
            onOpenLogin={() => setLoginOpen(true)}
            onOpenCertificate={() => setCertOpen(true)}
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
            onOpenLogin={() => setLoginOpen(true)}
            onOpenCertificate={() => setCertOpen(true)}
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
            onAcademy={() => {
              setReturnPoint({ missionId: currentMission.id, scene: save.currentScene });
              setView("academy");
            }}
            onOpenVault={() => setVaultOpen(true)}
            onOpenLogin={() => setLoginOpen(true)}
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
            onOpenCertificate={() => setCertOpen(true)}
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
        {loginOpen && (
          <LoginModal
            currentProfile={save.studentProfile}
            onSave={saveStudentProfile}
            onClose={() => setLoginOpen(false)}
          />
        )}
        {certOpen && (
          <CertificateModal
            save={save}
            onClose={() => setCertOpen(false)}
          />
        )}
        {comingSoonMessage && (
          <ComingSoonModal
            message={comingSoonMessage}
            onClose={() => setComingSoonMessage(null)}
          />
        )}
        {actComplete && (
          <ActComplete
            onClose={() => { setActComplete(false); setView("map"); }}
            onOpenCertificate={() => { setActComplete(false); setCertOpen(true); }}
          />
        )}
      </div>
    </main>
  );
}

function HubScreen({
  save,
  onNew,
  onContinue,
  onMap,
  onAcademy,
  onIntro,
  onSettings,
  onOpenVault,
  onOpenLogin,
  onOpenCertificate,
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
  onOpenLogin: () => void;
  onOpenCertificate: () => void;
  onComingSoon: (msg: string) => void;
  onSelectMission: (mId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"unit" | "theme">("unit");
  const student = save.studentProfile || defaultStudent;
  const isAllComplete = save.completedMissions.length >= 6;

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
            <button className="icon-button student-login-btn" onClick={onOpenLogin} title="학생 로그인 / 프로필" aria-label="학생 로그인">
              {student.isLoggedIn ? <UserCheck size={21} weight="fill" color="#56e39f" /> : <User size={21} />}
            </button>
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

        {/* Student Profile Quick Badge */}
        <div className="student-profile-bar" onClick={onOpenLogin}>
          <div className="student-bar-left">
            <span className="student-status-dot" />
            <strong>{student.schoolName} {student.grade} {student.classNum} {student.studentNum}</strong>
            <span className="student-name-tag">{student.name} 수호관</span>
          </div>
          <span className="student-login-edit">
            {student.isLoggedIn ? "계정 정보 >" : "로그인 >"}
          </span>
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
        {/* Certificate Banner (발급 가능 또는 열람) */}
        <article className="certificate-banner-card" onClick={onOpenCertificate}>
          <div className="cert-banner-left">
            <Certificate size={32} weight="duotone" color="#ffd36a" />
            <div>
              <div className="cert-banner-tag">
                <span>정식 인권수호관 임명장</span>
                {isAllComplete && <span className="cert-ready-badge">발급 완료</span>}
              </div>
              <strong>{student.name} 수호관 임명증 PDF 발급</strong>
              <small>교과 이수 확인서 및 인권수호관 정식 임명증 열람/인쇄</small>
            </div>
          </div>
          <button className="cert-banner-btn">임명증 열람 &gt;</button>
        </article>

        {/* Featured Mission Card */}
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

        {/* Quick Utilities */}
        <div className="hub-grid" style={{ marginTop: "18px" }}>
          <button className="hub-card" onClick={onOpenVault}>
            <Medal size={28} />
            <span>권리 카드 보관소</span>
            <small>{save.evidence.length}장 획득 · 교과 개념 열람</small>
          </button>
          <button className="hub-card" onClick={onAcademy}>
            <Brain size={28} />
            <span>탐구 아카데미</span>
            <small>ROOM 1~3 개념 훈련</small>
          </button>
        </div>

        <div className="coming-strip">
          <span>FINAL</span>
          <strong>인권수호국 긴급 사건</strong>
          <small>공공의 안전을 위해 시민의 자유를 제한해도 되는가?</small>
        </div>

        <button className="game-intro-entry" onClick={onIntro}>
          <BookOpen size={24} />
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
// RECORD SCREEN
// ==========================================
function RecordScreen({
  save,
  onBack,
  onOpenVault,
  onOpenCertificate,
}: {
  save: SaveData;
  onBack: () => void;
  onOpenVault: () => void;
  onOpenCertificate: () => void;
}) {
  const accuracy = save.attempts ? Math.round((save.correctAnswers / save.attempts) * 100) : 0;
  const understanding = Math.min(100, Math.round((Object.values(save.mastery).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(save.mastery).length * 4)) * 100));
  const student = save.studentProfile || defaultStudent;

  return (
    <AcademyTemplate>
      <GameHUD missionTitle="나의 탐구 기록" level={save.level} exp={save.exp} onBack={onBack} />
      <div className="screen-scroll">
        <TemplateHeading eyebrow="LEARNING ANALYTICS" title="이해도와 성장 지표" description="단순 점수보다 어떤 개념을 보강할지 점검하세요." />

        {/* Student Profile Overview */}
        <div className="record-student-card">
          <div>
            <span>소속 및 탐구관</span>
            <strong>{student.schoolName} {student.grade} {student.classNum} {student.studentNum} {student.name}</strong>
          </div>
          <button className="secondary-button" onClick={onOpenCertificate}>
            <Certificate size={18} weight="duotone" /> 임명증 보기
          </button>
        </div>

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
// STUDENT LOGIN MODAL
// ==========================================
function LoginModal({
  currentProfile,
  onSave,
  onClose,
}: {
  currentProfile?: StudentProfile;
  onSave: (profile: StudentProfile) => void;
  onClose: () => void;
}) {
  const [grade, setGrade] = useState(currentProfile?.grade || "1학년");
  const [classNum, setClassNum] = useState(currentProfile?.classNum || "1반");
  const [studentNum, setStudentNum] = useState(currentProfile?.studentNum || "1번");
  const [name, setName] = useState(currentProfile?.name || "");
  const [password, setPassword] = useState(currentProfile?.password || "1234");
  const [schoolName] = useState("안산강서고등학교");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("학생 성명을 입력해 주세요.");
      return;
    }
    const classDigits = classNum.replace(/[^0-9]/g, "").padStart(2, "0");
    const numDigits = studentNum.replace(/[^0-9]/g, "").padStart(2, "0");
    const autoId = `1${classDigits}${numDigits}`;

    onSave({
      studentId: autoId,
      grade,
      classNum,
      studentNum,
      name: name.trim(),
      password,
      isLoggedIn: true,
      schoolName,
    });
    onClose();
  };

  const handleLogout = () => {
    onSave({
      ...defaultStudent,
      isLoggedIn: false,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop login-backdrop">
      <section className="login-modal-panel" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        <div className="login-header">
          <UserCheck size={28} color="#ffd36a" weight="duotone" />
          <div>
            <span className="login-subtitle">안산강서고 1학년 탐구 아케이드</span>
            <h2 id="login-title">학생 로그인 / 프로필 설정</h2>
          </div>
        </div>

        <p className="login-description">
          학번과 성명을 입력하면 모든 사건 해결 기록과 <strong>정식 인권수호관 임명증</strong>에 학생의 실명이 반영됩니다.
        </p>

        {error && <p className="login-error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form-grid">
          <div className="form-group">
            <label>학교</label>
            <input type="text" value={schoolName} disabled className="disabled-input" />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>학년</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="1학년">1학년</option>
              </select>
            </div>
            <div className="form-group">
              <label>반</label>
              <select value={classNum} onChange={(e) => setClassNum(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => `${i + 1}반`).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>번호</label>
              <select value={studentNum} onChange={(e) => setStudentNum(e.target.value)}>
                {Array.from({ length: 35 }, (_, i) => `${i + 1}번`).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>학생 성명 <span className="req-star">*</span></label>
            <input
              type="text"
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              maxLength={20}
              required
            />
          </div>

          <div className="form-group">
            <label>간편 비밀번호 (4자리)</label>
            <input
              type="password"
              placeholder="1234"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={8}
            />
            <small>개인 저장 데이터 보호용 간편 비밀번호입니다 (기본: 1234).</small>
          </div>

          <div className="login-btn-row">
            <button type="submit" className="primary-button full-button">
              <UserCheck size={18} /> 학생 로그인 및 정보 저장
            </button>
            {currentProfile?.isLoggedIn && (
              <button type="button" className="text-button" onClick={handleLogout}>
                <SignOut size={16} /> 로그아웃 (기본값 전환)
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

// ==========================================
// CERTIFICATE OF APPOINTMENT MODAL (임명증 & PDF)
// ==========================================
function CertificateModal({
  save,
  onClose,
}: {
  save: SaveData;
  onClose: () => void;
}) {
  const student = save.studentProfile || defaultStudent;
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop cert-backdrop">
      <div className="cert-modal-container">
        <div className="cert-toolbar no-print">
          <button className="primary-button print-action-btn" onClick={handlePrint}>
            <Printer size={18} weight="bold" /> PDF 임명증 인쇄 / 다운로드
          </button>
          <button className="secondary-button" onClick={onClose}>
            <X size={18} /> 닫기
          </button>
        </div>

        {/* Print Document Paper */}
        <section className="certificate-document" id="printable-certificate" role="region" aria-label="정식 인권수호관 임명증">
          <div className="cert-inner-frame">
            {/* Corner Ornaments */}
            <div className="corner-ornament corner-tl">✦</div>
            <div className="corner-ornament corner-tr">✦</div>
            <div className="corner-ornament corner-bl">✦</div>
            <div className="corner-ornament corner-br">✦</div>

            <div className="cert-top-meta">
              <span className="cert-number">제 2026-ARCA-HR{student.studentId}호</span>
              <span className="cert-badge-school">{student.schoolName}</span>
            </div>

            <div className="cert-emblem-wrapper">
              <span className="cert-gold-crest">⚖</span>
            </div>

            <h1 className="cert-main-title">정 식 인 권 수 호 관  임 명 증</h1>
            <p className="cert-sub-title">CERTIFICATE OF HUMAN RIGHTS GUARDIAN APPOINTMENT</p>

            <div className="cert-recipient-box">
              <div className="recipient-row">
                <span className="rec-label">소 속 :</span>
                <span className="rec-value">{student.schoolName} {student.grade} {student.classNum} {student.studentNum}</span>
              </div>
              <div className="recipient-row">
                <span className="rec-label">성 명 :</span>
                <span className="rec-value rec-name">{student.name}</span>
              </div>
            </div>

            <div className="cert-body-text">
              <p>
                위 학생은 2026학년도 안산강서고등학교 1학년 통합사회 교과 연계
                <strong> [인권 보장과 헌법] 탐구 아케이드</strong> 전 과정을 성실히 이수하고,
                인간 존엄과 4대 핵심 인권 DNA를 온전히 규명하여 사회적 약자의 기본권 수호와
                정의로운 공동체 설계에 탁월한 역량을 발휘하였으므로
                이에 <strong>‘정식 인권수호관’</strong>으로 임명합니다.
              </p>
            </div>

            {/* Collected Rights Cards Seal Box */}
            <div className="cert-rights-summary">
              <span className="summary-title">✦ 헌법적 기본권 수호 이수 인증 ✦</span>
              <div className="summary-tags">
                <span>인간 존엄</span>
                <span>보편성</span>
                <span>천부성</span>
                <span>불가침성</span>
                <span>항구성</span>
                <span>자유권</span>
                <span>평등권</span>
                <span>참정권</span>
                <span>사회권</span>
                <span>연대권</span>
                <span>환경·안전·주거·문화권</span>
              </div>
            </div>

            <div className="cert-footer">
              <p className="cert-date">{todayStr}</p>
              <div className="cert-issuer-row">
                <strong className="issuer-title">안산강서고등학교 통합사회과 탐구아케이드 인권수호국장</strong>
                <div className="red-seal-stamp">
                  <span>인권<br />수호</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
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
function ActComplete({
  onClose,
  onOpenCertificate,
}: {
  onClose: () => void;
  onOpenCertificate: () => void;
}) {
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
