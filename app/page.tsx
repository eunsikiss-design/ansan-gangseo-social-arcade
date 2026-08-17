"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle, Clock,
  FileText, Gear, Headphones, Info, LockKey, MapTrifold, Medal, Play,
  Sparkle, SpeakerHigh, SpeakerSlash, Trophy, Warning, X, MagnifyingGlass,
  User, UserCheck, SignOut, Printer, DownloadSimple, Certificate, ShieldCheck,
  Key, IdentificationCard, Eye, Student, ChalkboardTeacher, Sparkle as StarIcon,
} from "@phosphor-icons/react";
import { academyRooms, evidenceCatalog, getMissionSteps, missionDialogueQuestions, missions } from "@/src/data/missions";
import { unitCertificates } from "@/src/data/certificates";
import {
  authenticateUser, changeUserPassword, DEFAULT_INITIAL_PASSWORD,
  getOrCreateAccount, loadAccounts, parseUserId, updateProfileName,
  type AccountRecord
} from "@/src/game/auth";
import { audioManager, defaultAudioSettings, type AudioSettings } from "@/src/game/audio/AudioManager";
import type {
  DialogueOption, EvidenceCardData, Mission, MissionStep, SaveData,
  SocialIndicators, StudentProfile, UnitCertificateInfo
} from "@/src/game/types";
import {
  AcademyTemplate, BottomNavigation, CaseBriefingTemplate, CharacterPortrait,
  DecisionTemplate, DialogueTemplate, EvidenceTemplate, GameHUD, InvestigationTemplate,
  MainHubTemplate, MissionMapTemplate, PuzzleTemplate, ResultTemplate,
  SourceDetailTemplate, StatusBadge, TemplateHeading, ZeroChallengeTemplate,
} from "@/src/components/GameTemplates";

const SAVE_KEY = "social-arcade-save-v6";
const baseIndicators: SocialIndicators = { humanRights: 52, fairness: 50, economy: 50, peace: 55, sustainability: 48, trust: 50 };

const defaultStudent: StudentProfile = {
  studentId: "SC0101",
  role: "guest",
  grade: "1학년",
  classNum: "1반",
  studentNum: "1번",
  name: "신입 탐구관",
  isLoggedIn: false,
  schoolName: "안산강서고등학교",
};

const blankSave = (): SaveData => ({
  currentMission: null,
  currentScene: 0,
  level: 1,
  exp: 0,
  indicators: baseIndicators,
  evidence: ["HUMAN_DIGNITY", "UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY"],
  completedMissions: ["m01", "m02"],
  investigatedSources: [],
  studentChoices: {},
  decisionHistory: [],
  mastery: {},
  academyDrafts: {},
  reviewConcepts: [],
  skill: [],
  achievement: [],
  attempts: 0,
  correctAnswers: 0,
  answerTimes: [],
  audio: defaultAudioSettings,
  studentProfile: defaultStudent,
  earnedCertificates: [],
});

type View = "login" | "hub" | "map" | "mission" | "academy" | "record";
type ReturnPoint = { missionId: string; scene: number } | null;

export default function HomePage() {
  const [save, setSave] = useState<SaveData>(blankSave);
  const [view, setView] = useState<View>("hub");
  const [hydrated, setHydrated] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [teacherDashOpen, setTeacherDashOpen] = useState(false);
  const [certUnitId, setCertUnitId] = useState<number | null>(null);
  const [comingSoonMessage, setComingSoonMessage] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [audio, setAudio] = useState<AudioSettings>(defaultAudioSettings);
  const [returnPoint, setReturnPoint] = useState<ReturnPoint>(null);
  const [actComplete, setActComplete] = useState(false);

  // Initialize
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSave({ ...blankSave(), ...parsed });
      }
    } catch { /* fallback to blank save */ }
    setAudio(audioManager.load());
    setHydrated(true);
  }, []);

  // Save changes
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    }
  }, [hydrated, save]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [view, save.currentMission, save.currentScene]);

  const currentMission = missions.find((item) => item.id === save.currentMission) ?? null;

  // Check earned certificates
  useEffect(() => {
    if (!hydrated) return;
    const unit1Complete = missions.every((m) => save.completedMissions.includes(m.id));
    if (unit1Complete && !save.earnedCertificates?.includes(1)) {
      setSave((prev) => ({
        ...prev,
        earnedCertificates: [...new Set([...(prev.earnedCertificates || []), 1])],
      }));
    }
  }, [save.completedMissions, hydrated]);

  // Stage-specific dynamic BGM Router
  useEffect(() => {
    if (!hydrated) return;
    if (certUnitId !== null) {
      void audioManager.playBgm("certificate");
      void audioManager.playSfx("cert_fanfare");
      return;
    }
    if (view === "login") {
      void audioManager.playBgm("main_hub");
    } else if (view === "hub") {
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
  }, [view, save.currentMission, save.currentScene, certUnitId, hydrated, currentMission]);

  const startNew = () => {
    const next = blankSave();
    next.currentMission = "m01";
    if (save.studentProfile) next.studentProfile = save.studentProfile;
    setSave(next);
    setActComplete(false);
    setView("map");
  };

  const continueGame = () => {
    if (save.currentMission) {
      setView("mission");
    } else {
      setView("map");
    }
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

  const handleLoginSuccess = (profile: StudentProfile, mustChangePw?: boolean) => {
    setSave((prev) => ({
      ...prev,
      studentProfile: profile,
    }));
    void audioManager.playSfx("success");
    if (mustChangePw) {
      setPasswordModalOpen(true);
    }
    setView("hub");
  };

  const handleLogout = () => {
    setSave((prev) => ({
      ...prev,
      studentProfile: { ...defaultStudent, isLoggedIn: false },
    }));
    void audioManager.playSfx("ui_click");
  };

  return (
    <main className="arcade-viewport">
      <div className="arcade-phone" aria-label="안산강서고 1학년 통합사회 탐구 아케이드 홈 화면">
        {/* VIEW ROUTER */}
        {view === "login" && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGuest={() => setView("hub")}
          />
        )}

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
            onOpenCert={(unitId) => setCertUnitId(unitId)}
            onOpenPasswordModal={() => setPasswordModalOpen(true)}
            onOpenTeacherDash={() => setTeacherDashOpen(true)}
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
            onOpenCert={(unitId) => setCertUnitId(unitId)}
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
            onSelectCard={(cId) => setSelectedCardId(cId)}
            onActComplete={() => {
              setActComplete(true);
              setSave((prev) => ({
                ...prev,
                earnedCertificates: [...new Set([...(prev.earnedCertificates || []), 1])],
              }));
            }}
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
            onOpenCert={(unitId) => setCertUnitId(unitId)}
          />
        )}

        {/* BOTTOM NAVIGATION */}
        {(view === "hub" || view === "map" || view === "academy" || view === "record") && (
          <BottomNavigation
            active={view === "map" ? "challenge" : view === "record" ? "record" : view === "academy" ? "growth" : "home"}
            onNavigate={navigate}
          />
        )}

        {/* MODALS */}
        {settingsOpen && (
          <SettingsPanel
            audio={audio}
            onChange={updateAudio}
            onClose={() => setSettingsOpen(false)}
          />
        )}
        {introOpen && (
          <GameIntroduction
            onClose={() => setIntroOpen(false)}
          />
        )}
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
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onOpenPasswordModal={() => {
              setLoginOpen(false);
              setPasswordModalOpen(true);
            }}
            onClose={() => setLoginOpen(false)}
          />
        )}
        {passwordModalOpen && save.studentProfile && (
          <PasswordChangeModal
            profile={save.studentProfile}
            onSuccess={(updatedProfile) => {
              setSave((prev) => ({ ...prev, studentProfile: updatedProfile }));
              setPasswordModalOpen(false);
              void audioManager.playSfx("success");
            }}
            onClose={() => setPasswordModalOpen(false)}
          />
        )}
        {teacherDashOpen && (
          <TeacherDashboardModal
            save={save}
            onClose={() => setTeacherDashOpen(false)}
            onPrintCert={(unitId) => {
              setTeacherDashOpen(false);
              setCertUnitId(unitId);
            }}
          />
        )}
        {certUnitId !== null && (
          <CertificateModal
            save={save}
            unitId={certUnitId}
            onClose={() => setCertUnitId(null)}
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
            onOpenCertificate={() => { setActComplete(false); setCertUnitId(1); }}
          />
        )}
      </div>
    </main>
  );
}

// ==========================================
// 1. LOGIN SCREEN (전용 로그인 뷰)
// ==========================================
function LoginScreen({
  onLoginSuccess,
  onGuest,
}: {
  onLoginSuccess: (profile: StudentProfile, mustChangePw?: boolean) => void;
  onGuest: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError("아이디를 입력해 주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    const res = authenticateUser(userId, password);
    if (!res.success || !res.profile) {
      setError(res.error || "로그인에 실패했습니다.");
      return;
    }

    onLoginSuccess(res.profile, res.mustChangePassword);
  };

  return (
    <div className="login-screen-view">
      <div className="login-screen-card">
        <div className="login-logo-lockup">
          <div className="logo-school-badge">안산강서고등학교 통합사회 2</div>
          <h1 className="login-main-title">
            통합사회<br />
            <span>탐구 아케이드</span>
          </h1>
          <p className="login-hero-sub">사건을 읽고, 헌법을 탐구하며, 더 나은 사회를 설계하라.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form-box">
          <div className="form-input-block">
            <label htmlFor="login-id">
              <IdentificationCard size={18} />
              <span>학급 아이디 (SC학급번호 / 교사: SCT01~10)</span>
            </label>
            <input
              id="login-id"
              type="text"
              placeholder="예: 1반 8번 -> SC0108 / 교사: SCT01"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value.toUpperCase());
                setError("");
              }}
              maxLength={10}
              required
            />
            <small className="id-helper-text">
              ※ 학생: SC + 반(01~12) + 번호(01~26) | 교사: SCT01~SCT10
            </small>
          </div>

          <div className="form-input-block">
            <label htmlFor="login-pw">
              <Key size={18} />
              <span>비밀번호</span>
            </label>
            <input
              id="login-pw"
              type="password"
              placeholder="초기 비밀번호: 123456789!"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />
            <small className="id-helper-text">
              ※ 초기 비밀번호는 <code>123456789!</code> 이며, 최초 로그인 시 변경합니다.
            </small>
          </div>

          {error && <div className="login-error-alert">{error}</div>}

          <button type="submit" className="primary-button full-button login-submit-btn">
            <UserCheck size={20} weight="bold" />
            탐구관 로그인
          </button>

          <div className="login-footer-actions">
            <button type="button" className="text-button" onClick={onGuest}>
              로그인 없이 게스트로 둘러보기 &gt;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 2. MAIN HUB SCREEN
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
  onOpenLogin,
  onOpenCert,
  onOpenPasswordModal,
  onOpenTeacherDash,
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
  onOpenCert: (unitId: number) => void;
  onOpenPasswordModal: () => void;
  onOpenTeacherDash: () => void;
  onComingSoon: (msg: string) => void;
  onSelectMission: (mId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"unit" | "theme">("unit");
  const student = save.studentProfile || defaultStudent;
  const isTeacher = student.role === "teacher";
  const unit1Complete = missions.every((m) => save.completedMissions.includes(m.id));

  // Dynamic Recent Progress Calculation
  const recentProgress = useMemo(() => {
    if (unit1Complete) {
      return {
        stageName: "1단원 인권 보장과 헌법 탐구 전 과정 완수",
        subText: "정식 인권수호관 임명장 발급 가능",
        percent: 100,
        buttonText: "임명장 열람하기",
        action: () => onOpenCert(1),
      };
    }

    if (save.currentMission) {
      const mission = missions.find((m) => m.id === save.currentMission);
      if (mission) {
        const steps = getMissionSteps(mission);
        const stepNum = save.currentScene + 1;
        const totalSteps = steps.length;
        const pct = Math.min(95, Math.round((stepNum / totalSteps) * 100));
        const currentStep = steps[save.currentScene];
        const stepLabel = currentStep?.title || "현장 단서 및 교과 쟁점 조사";

        return {
          stageName: `M0${mission.number} ${mission.title}`,
          subText: `${stepLabel} (${stepNum}/${totalSteps}단계)`,
          percent: pct,
          buttonText: "이어서 탐구하기",
          action: onContinue,
        };
      }
    }

    const completedCount = save.completedMissions.length;
    const nextMission = missions.find((m) => !save.completedMissions.includes(m.id)) || missions[0];
    const pct = Math.round((completedCount / missions.length) * 100);

    return {
      stageName: `1단원 M0${nextMission.number} ${nextMission.title}`,
      subText: `총 ${missions.length}개 사건 중 ${completedCount}개 완수`,
      percent: pct,
      buttonText: "사건 착수하기",
      action: () => onSelectMission(nextMission.id),
    };
  }, [save, unit1Complete, onContinue, onOpenCert, onSelectMission]);

  const units = [
    { num: 1, title: "인권 보장과 헌법", status: unit1Complete ? "100% 이수 완료 (임명증 발급)" : `${save.completedMissions.length}/6 사건 해결 중`, available: true },
    { num: 2, title: "자연환경과 인간", status: "COMING SOON", available: false },
    { num: 3, title: "생활공간과 사회", status: "COMING SOON", available: false },
    { num: 4, title: "인권 보장과 헌법 심화", status: "COMING SOON", available: false },
    { num: 5, title: "시장 경제와 금융", status: "COMING SOON", available: false },
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
            {isTeacher && (
              <button className="icon-button teacher-dash-btn" onClick={onOpenTeacherDash} title="교사용 관리 대시보드" aria-label="교사용 대시보드">
                <ChalkboardTeacher size={22} color="#ffd36a" weight="fill" />
              </button>
            )}
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
            <strong>
              {student.isLoggedIn ? (
                isTeacher ? `[지도교사] ${student.name} (${student.studentId})` : `${student.schoolName} ${student.grade} ${student.classNum} ${student.studentNum}`
              ) : "게스트 모드"}
            </strong>
            <span className="student-name-tag">
              {student.isLoggedIn ? (isTeacher ? "교과 지도교사" : `${student.name} 수호관`) : "로그인 필요"}
            </span>
          </div>
          <span className="student-login-edit">
            {student.isLoggedIn ? "계정 설정 >" : "로그인 >"}
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

      {/* DASHBOARD: 단원별 임명 뱃지(Badge) 전시대 */}
      <div className="hub-badge-dashboard">
        <div className="badge-dash-header">
          <div className="badge-dash-title">
            <Trophy size={18} weight="duotone" color="var(--gold)" />
            <span>단원별 공인 수호관 임명 뱃지</span>
          </div>
          <span className="badge-count-pill">
            {save.earnedCertificates?.length || (unit1Complete ? 1 : 0)} / 5개 획득
          </span>
        </div>

        <div className="badge-slots-row">
          {unitCertificates.map((cert) => {
            const isEarned = (save.earnedCertificates?.includes(cert.unitId)) || (cert.unitId === 1 && unit1Complete);
            return (
              <button
                key={cert.unitId}
                className={`badge-slot-item ${isEarned ? "earned" : "locked"}`}
                onClick={() => {
                  if (isEarned) {
                    onOpenCert(cert.unitId);
                  } else {
                    onComingSoon(`${cert.unitTitle}의 6개 전 과정을 모두 완수하면 [${cert.certName}]과 뱃지가 수여됩니다.`);
                  }
                }}
                title={isEarned ? `${cert.badgeName} (임명증 보기)` : `${cert.badgeName} (잠김)`}
              >
                <div className="badge-icon-box">
                  <span className="badge-icon-emoji">{cert.badgeIcon}</span>
                  {isEarned && <span className="badge-sparkle-glow" />}
                </div>
                <span className="badge-unit-label">{cert.unitId}단원</span>
                <span className="badge-name-text">{cert.badgeName.replace(" 엠블럼", "")}</span>
              </button>
            );
          })}
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
        {/* Dynamic Recent Progress Card (사용자가 가장 최근에 참여한 마지막 단계 동적 표시) */}
        <section className="recent-progress-card" aria-label="최근 탐구 진행 현황">
          <div className="progress-card-top">
            <span className="progress-tag">RECENT STEP · 최근 탐구 단계</span>
            <span className="progress-pct-badge">{recentProgress.percent}% 완료</span>
          </div>

          <h3 className="progress-stage-title">{recentProgress.stageName}</h3>
          <p className="progress-subtext">{recentProgress.subText}</p>

          <div className="progress-track-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={recentProgress.percent}>
            <div className="progress-fill-glow" style={{ width: `${recentProgress.percent}%` }} />
          </div>

          <div className="progress-card-actions">
            <button className="primary-button full-button" onClick={recentProgress.action}>
              <Play size={17} weight="fill" /> {recentProgress.buttonText} &gt;
            </button>
          </div>
        </section>

        {/* 1단원 바로가기 배너 */}
        <div className="hub-unit-banner" onClick={onMap}>
          <div className="unit-banner-left">
            <span className="unit-badge">UNIT 01</span>
            <h3>1단원 · 인권 보장과 헌법</h3>
            <p>기본권 침해 사건을 해결하고 4대 핵심 인권 DNA를 규명하라</p>
            <span className="unit-status-tag">
              {unit1Complete ? "★ 1단원 전 과정 이수 완료" : `사건 해결 (${save.completedMissions.length}/6)`}
            </span>
          </div>
          <ArrowRight size={24} className="unit-banner-arrow" />
        </div>

        {/* Units Grid */}
        <div className="unit-list-grid">
          {units.map((unit) => (
            <button
              key={unit.num}
              className={`unit-card-button ${unit.available ? "active" : "disabled"}`}
              onClick={() => {
                if (unit.available) onMap();
                else onComingSoon(`${unit.title} 단원은 준비 중입니다.`);
              }}
            >
              <div className="unit-num-circle">{unit.num}</div>
              <div className="unit-info-col">
                <strong>{unit.title}</strong>
                <small>{unit.status}</small>
              </div>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>

        {/* Game Introduction Entry */}
        <button className="game-intro-entry" onClick={onIntro}>
          <BookOpen size={24} />
          <div>
            <strong>게임 가이드 · 교과 연계 안내</strong>
            <small>세계관 스토리와 탐구 파트너, 평가 루브릭을 확인하세요.</small>
          </div>
          <ArrowRight size={18} />
        </button>
      </div>
    </MainHubTemplate>
  );
}

// ==========================================
// 3. MISSION MAP SCREEN (1단원 사건 선택)
// ==========================================
function MissionMap({
  save,
  onStart,
  onBack,
  onSettings,
  onOpenVault,
  onOpenLogin,
  onOpenCert,
  onComingSoon,
}: {
  save: SaveData;
  onStart: (mission: Mission) => void;
  onBack: () => void;
  onSettings: () => void;
  onOpenVault: () => void;
  onOpenLogin: () => void;
  onOpenCert: (unitId: number) => void;
  onComingSoon: (msg: string) => void;
}) {
  const student = save.studentProfile || defaultStudent;
  const unit1Complete = missions.every((m) => save.completedMissions.includes(m.id));

  return (
    <MissionMapTemplate>
      <GameHUD
        missionTitle="1단원 사건 선택 지도"
        level={save.level}
        exp={save.exp}
        onBack={onBack}
      />

      <div className="map-scroll-container">
        {/* Student Bar */}
        <div className="map-student-header">
          <div>
            <span className="map-badge-role">인권수호국 현장 조사관</span>
            <strong>{student.name} ({student.studentId})</strong>
          </div>
          <button className="icon-button" onClick={onOpenVault} title="권리 카드 보관소">
            <Medal size={20} weight="duotone" />
          </button>
        </div>

        {/* 1단원 전체 완수 시 임명증 발급 골드 배너 */}
        {unit1Complete && (
          <div className="unit-complete-gold-banner" onClick={() => onOpenCert(1)}>
            <div className="gold-banner-left">
              <Trophy size={28} weight="fill" color="#ffd36a" />
              <div>
                <strong>1단원 전 과정 이수 완수!</strong>
                <p>정식 인권수호관 임명증을 발급받고 PDF로 저장하세요.</p>
              </div>
            </div>
            <button className="gold-cert-btn">
              <Printer size={16} /> 임명증 보기
            </button>
          </div>
        )}

        <div className="map-missions-list">
          {missions.map((mission, idx) => {
            const isCompleted = save.completedMissions.includes(mission.id);
            const isCurrent = save.currentMission === mission.id;
            const isLocked = idx > 0 && !save.completedMissions.includes(missions[idx - 1].id) && !isCompleted;

            return (
              <article
                key={mission.id}
                className={`mission-item-card ${isCompleted ? "completed" : isCurrent ? "current" : isLocked ? "locked" : "available"}`}
              >
                <div className="mission-card-header">
                  <span className="mission-code">CASE 00{mission.number}</span>
                  {isCompleted ? (
                    <span className="status-pill done"><CheckCircle size={14} weight="fill" /> 해결 완료</span>
                  ) : isCurrent ? (
                    <span className="status-pill playing">조사 진행 중</span>
                  ) : isLocked ? (
                    <span className="status-pill lock"><LockKey size={14} /> 이전 사건 해결 필요</span>
                  ) : (
                    <span className="status-pill ready">착수 가능</span>
                  )}
                </div>

                <h3 className="mission-card-title">{mission.title}</h3>
                <p className="mission-card-sub">{mission.subtitle}</p>

                <div className="mission-card-footer">
                  <div className="mission-rewards-preview">
                    <span>+{mission.rewards.exp} EXP</span>
                    {mission.rewards.skill && <span>스킬: {mission.rewards.skill}</span>}
                  </div>

                  <button
                    className="primary-button mission-start-btn"
                    disabled={isLocked}
                    onClick={() => onStart(mission)}
                  >
                    {isCompleted ? "다시 탐구하기" : isCurrent ? "이어서 조사" : "사건 착수 >"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </MissionMapTemplate>
  );
}

// ==========================================
// 4. MISSION PLAYER (사건 단계별 플레이어)
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
  const steps = getMissionSteps(mission);
  const step = steps[save.currentScene] ?? steps[0];
  const [selected, setSelected] = useState<number | null>(null);
  const [investigated, setInvestigated] = useState<string[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const progress = Math.round(((save.currentScene + 1) / steps.length) * 100);

  useEffect(() => {
    setSelected(null);
  }, [save.currentScene]);

  const advance = () => {
    void audioManager.playSfx("ui_click");
    setSave((prev) => ({
      ...prev,
      currentScene: Math.min(prev.currentScene + 1, steps.length - 1),
    }));
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
    setSave((prev) => ({
      ...prev,
      evidence: [...new Set([...prev.evidence, id])],
    }));
    void audioManager.playSfx("evidence_found");
  };

  const completeMission = () => {
    const goodChoice = save.studentChoices[mission.id] === mission.decisions.length - 1;
    setSave((prev) => {
      const firstCompletion = !prev.completedMissions.includes(mission.id);
      const nextExp = prev.exp + (firstCompletion ? mission.rewards.exp : 0);
      const newCompleted = [...new Set([...prev.completedMissions, mission.id])];
      return {
        ...prev,
        completedMissions: newCompleted,
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
    if (mission.nextMissionId) {
      onBack();
    } else {
      onActComplete();
    }
  };

  return (
    <div className={`mission-screen background-${mission.backgrounds[0] || "court"}`}>
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
        {/* 1. Case Briefing */}
        {step.type === "briefing" && (
          <CaseBriefingTemplate>
            <TemplateHeading
              eyebrow={`CASE BRIEFING · 사건 브리핑 (M0${mission.number})`}
              title={mission.title}
              description={step.body || mission.subtitle}
              icon="briefing"
            />
            <div className="briefing-info-grid">
              <div className="briefing-info-item"><span>사건 번호</span><strong>CASE 00{mission.number}</strong></div>
              <div className="briefing-info-item"><span>담당 부서</span><strong>헌법인권수호국</strong></div>
              <div className="briefing-info-item"><span>핵심 쟁점</span><strong className="text-gold">{mission.relatedConceptIds.join(", ")}</strong></div>
            </div>
            <button className="primary-button full-button" onClick={advance} style={{ marginTop: "16px" }}>
              현장 조사 및 증언 청취 착수 &gt;
            </button>
          </CaseBriefingTemplate>
        )}

        {/* 2. Dialogue */}
        {step.type === "dialogue" && (
          <DialogueTemplate>
            <TemplateHeading
              eyebrow="INVESTIGATION DIALOGUE · 진술 청취"
              title={step.speaker || "사건 관계자 진술"}
              description="진술을 확인하고 아래 교과서 핵심 탐구 질문을 선택해 보세요."
              icon="dialogue"
            />
            <div className="dialogue-speech-box">
              <CharacterPortrait characterId={step.scene?.character || "haeon"} expression={step.scene?.expression || "default"} size="md" />
              <div className="speech-bubble-text">
                <strong>{step.speaker || "해온 수호관"}</strong>
                <p>{step.body || step.scene?.text}</p>
              </div>
            </div>

            {/* 교과서 핵심 탐구 질문 3가지 */}
            {step.dialogueOptions && step.dialogueOptions.length > 0 && (
              <div className="textbook-questions-panel">
                <span className="questions-title">💡 교과서 연계 핵심 질문을 선택하세요:</span>
                <div className="questions-list">
                  {step.dialogueOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      className={`question-opt-card ${selected === idx ? "active" : ""}`}
                      onClick={() => {
                        setSelected(idx);
                        void audioManager.playSfx("ui_click");
                      }}
                    >
                      <span className="q-badge">Q{idx + 1}</span>
                      <div className="q-content">
                        <strong>{opt.question}</strong>
                        {selected === idx && (
                          <div className="q-reply-box">
                            <span>{opt.answerSpeaker}:</span>
                            <p>{opt.answerText}</p>
                            {opt.textbookRef && <small className="q-textbook-ref">📖 {opt.textbookRef}</small>}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button className="primary-button full-button" onClick={advance} style={{ marginTop: "14px" }}>
              다음 단계로 &gt;
            </button>
          </DialogueTemplate>
        )}

        {/* 3. Investigation */}
        {step.type === "investigation" && (
          <InvestigationTemplate>
            <TemplateHeading
              eyebrow="FIELD INVESTIGATION · 현장 단서 조사"
              title="현장 단서 확인"
              description="단서를 터치하여 면밀히 조사하세요."
              icon="inspect"
            />
            <div className="investigation-grid">
              {(step.items || mission.investigations || []).map((item) => {
                const isDone = investigated.includes(item);
                return (
                  <button
                    key={item}
                    className={`investigation-card ${isDone ? "is-investigated" : ""}`}
                    onClick={() => {
                      setInvestigated((prev) => [...new Set([...prev, item])]);
                      void audioManager.playSfx("inspect");
                    }}
                  >
                    <div className="card-status-icon">
                      {isDone ? <CheckCircle size={24} weight="fill" /> : <Eye size={24} />}
                    </div>
                    <div className="card-text">
                      <strong>{item}</strong>
                      <small>{isDone ? "조사 완료" : "터치하여 단서 확인"}</small>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              className="primary-button full-button"
              disabled={investigated.length === 0}
              onClick={advance}
              style={{ marginTop: "16px" }}
            >
              단서 분석 완료 · 다음으로 &gt;
            </button>
          </InvestigationTemplate>
        )}

        {/* 4. Source Detail */}
        {step.type === "source" && (
          <SourceDetailTemplate>
            <TemplateHeading
              eyebrow="TEXTBOOK EVIDENCE · 교과서 자료 심층 분석"
              title={step.title || "교과 연계 심층 자료"}
              description="자료의 핵심 조문과 교과서 페이지를 꼼꼼히 읽어보세요."
              icon="source"
            />
            <div className="source-card">
              <div className="source-meta">
                <span className="source-type-tag">교과서 발췌</span>
                {step.textbookSource?.page && (
                  <span className="textbook-page-tag">{step.textbookSource.page}</span>
                )}
              </div>
              <div className="source-body-box">
                <p>{step.body}</p>
                {step.textbookSource?.quote && (
                  <blockquote className="source-quote">{step.textbookSource.quote}</blockquote>
                )}
              </div>
              {step.textbookSource?.memo && (
                <div className="source-explanation-section">
                  <span className="section-title">💡 교과서 읽기자료 및 추가 해설</span>
                  <p>{step.textbookSource.memo}</p>
                </div>
              )}
            </div>
            <button className="primary-button full-button" onClick={advance} style={{ marginTop: "16px" }}>
              자료 분석 완료 &gt;
            </button>
          </SourceDetailTemplate>
        )}

        {/* 5. Puzzle */}
        {step.type === "puzzle" && (
          <PuzzleTemplate>
            <TemplateHeading
              eyebrow="LEGAL REASONING QUIZ · 법리 추론 퀴즈"
              title={step.title || "올바른 헌법적 해석은?"}
              description="교과서 핵심 원리와 헌법 조문을 바탕으로 가장 타당한 판단을 선택하세요."
              icon="quiz"
            />
            {step.question && (
              <div className="quiz-question-box">
                <span className="quiz-question-tag">Q. 핵심 법리 탐구 문제</span>
                <p className="quiz-question-text">{step.question}</p>
              </div>
            )}
            <div className="puzzle-choices-grid">
              {(step.choices || []).map((choice, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === step.answer;
                let btnClass = "puzzle-choice-btn";
                if (selected !== null) {
                  if (isSelected) btnClass += isCorrect ? " correct" : " wrong";
                  else if (isCorrect) btnClass += " show-correct";
                }
                return (
                  <button
                    key={idx}
                    className={btnClass}
                    disabled={selected !== null}
                    onClick={() => chooseAnswer(idx)}
                  >
                    <span className="choice-number">{idx + 1}</span>
                    <span className="choice-text">{choice}</span>
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="puzzle-feedback-card">
                <strong>{selected === step.answer ? "🎉 정확한 헌법적 판단입니다!" : "⚠️ 다시 검토해 보세요"}</strong>
                <p>{selected === step.answer ? "헌법 제10조 및 기본권 보장의 본질적 내용을 정확히 짚었습니다." : "공익과 사익의 조화 및 과잉금지원칙, 교과서 개념을 다시 점검해 보세요."}</p>
                <button className="primary-button full-button" onClick={advance} style={{ marginTop: "10px" }}>
                  다음 단계로 &gt;
                </button>
              </div>
            )}
          </PuzzleTemplate>
        )}


        {/* 6. Evidence Collection */}
        {step.type === "evidence" && (
          <EvidenceTemplate>
            <TemplateHeading
              eyebrow="RIGHTS CARD ITEM ACQUISITION · 권리 카드 획득"
              title="새로운 권리 카드 발견!"
              description="카드를 터치하여 보관함에 등록하고 상세 교과 내용을 확인하세요."
              icon="evidence"
            />
            <div className="evidence-cards-container">
              {(step.evidenceIds || mission.evidenceIds || []).map((id) => {
                const card = evidenceCatalog[id];
                if (!card) return null;
                const isCollected = save.evidence.includes(id);
                return (
                  <EvidenceCard
                    key={card.id}
                    data={card}
                    collected={isCollected}
                    selected={false}
                    onClick={() => {
                      collectEvidence(card.id);
                      onSelectCard(card.id);
                    }}
                  />
                );
              })}
            </div>
            <button className="primary-button full-button" onClick={advance} style={{ marginTop: "16px" }}>
              카드 수집 완료 · 사건 해결로 &gt;
            </button>
          </EvidenceTemplate>
        )}

        {/* 7. Zero Challenge */}
        {step.type === "zero" && (
          <ZeroChallengeTemplate>
            <div className="zero-warning-banner">
              <Warning size={20} weight="fill" color="#ff4d4d" />
              <span>RIVAL ENCOUNTER · ZERO의 반론 제기</span>
            </div>
            <div className="zero-speech-layout">
              <CharacterPortrait characterId="zero" expression="angry" size="lg" />
              <div className="zero-speech-box">
                <span className="zero-name">ZERO</span>
                <p>{step.body || step.question}</p>
              </div>
            </div>
            <div className="zero-choices-list">
              {(step.choices || []).map((c, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === step.answer;
                let btnClass = "zero-choice-btn";
                if (selected !== null) {
                  if (isSelected) btnClass += isCorrect ? " correct" : " wrong";
                  else if (isCorrect) btnClass += " show-correct";
                }
                return (
                  <button
                    key={idx}
                    className={btnClass}
                    disabled={selected !== null}
                    onClick={() => chooseAnswer(idx)}
                  >
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className="zero-result-panel">
                <p>{selected === step.answer ? "ZERO: “흠... 논리적인 반박이군. 이번 판단은 인정하지.”" : "ZERO: “그런 얕은 논리로는 인권과 공익을 지킬 수 없다!”"}</p>
                <button className="primary-button full-button" onClick={advance} style={{ marginTop: "10px" }}>
                  최종 판결로 이동 &gt;
                </button>
              </div>
            )}
          </ZeroChallengeTemplate>
        )}

        {/* 8. Decision */}
        {step.type === "decision" && (
          <DecisionTemplate>
            <TemplateHeading
              eyebrow="FINAL JUDICIAL DECISION · 최종 헌법적 판단"
              title="당신의 결정을 내려주세요"
              description="수집한 Evidence와 헌법 원칙에 따라 최선의 판결을 선택하세요."
              icon="decision"
            />
            <div className="decision-cards-list">
              {mission.decisions.map((dTitle, idx) => {
                const isSelected = save.studentChoices[mission.id] === idx;
                return (
                  <button
                    key={idx}
                    className={`decision-option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setSave((prev) => ({ ...prev, studentChoices: { ...prev.studentChoices, [mission.id]: idx } }));
                      void audioManager.playSfx("decision_submit");
                    }}
                  >
                    <div className="decision-title-row">
                      <span className="decision-badge">판결안 {idx + 1}</span>
                      <strong>{dTitle}</strong>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              className="primary-button full-button"
              disabled={save.studentChoices[mission.id] === undefined}
              onClick={advance}
              style={{ marginTop: "16px" }}
            >
              {save.studentChoices[mission.id] !== undefined ? "판결 확정 및 결과 발표 >" : "판결안을 선택해 주세요"}
            </button>
          </DecisionTemplate>
        )}

        {/* 9. Result */}
        {step.type === "result" && (
          <ResultTemplate>
            <TemplateHeading
              eyebrow="CASE RESOLUTION · 사건 종결 보고서"
              title={`${mission.title} 해결`}
              description="사건이 성공적으로 해결되어 인권 지표가 갱신되었습니다."
              icon="result"
            />
            <div className="resolution-card">
              <div className="resolution-header">
                <Medal size={24} weight="fill" color="var(--gold)" />
                <strong>최종 판결: {mission.decisions[save.studentChoices[mission.id] ?? 0]}</strong>
              </div>
            </div>
            <div className="rewards-summary-box">
              <span>획득 보상</span>
              <div className="reward-tags">
                <span className="reward-pill">+ {mission.rewards.exp} EXP</span>
                {mission.rewards.skill && <span className="reward-pill">스킬: {mission.rewards.skill}</span>}
                {mission.rewards.title && <span className="reward-pill">칭호: {mission.rewards.title}</span>}
              </div>
            </div>
            <button className="primary-button full-button" onClick={completeMission} style={{ marginTop: "16px" }}>
              {mission.nextMissionId ? "다음 사건으로 이동 >" : "1단원 완수 · 수호관 임명식 보기 >"}
            </button>
          </ResultTemplate>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. ACADEMY SCREEN (탐구 아카데미)
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
  const [selectedRoom, setSelectedRoom] = useState<string>("room-rights");

  return (
    <AcademyTemplate>
      <GameHUD missionTitle="탐구 아카데미" level={save.level} exp={save.exp} onBack={onReturn} />
      <div className="screen-scroll">
        <TemplateHeading
          eyebrow="CONCEPT ACADEMY"
          title="개념 분석 연구실"
          description="교과서 핵심 헌법 조문과 기본권 원리를 심화 학습하세요."
        />

        <div className="academy-room-tabs">
          {academyRooms.map((room) => (
            <button
              key={room.id}
              className={`room-tab-btn ${selectedRoom === room.id ? "active" : ""}`}
              onClick={() => setSelectedRoom(room.id)}
            >
              {room.title}
            </button>
          ))}
        </div>

        {academyRooms
          .filter((r) => r.id === selectedRoom)
          .map((room) => (
            <div key={room.id} className="academy-room-detail-card">
              <h3 className="room-title">{room.title}</h3>
              <p className="room-desc">{room.description}</p>
              <div className="room-concepts-list">
                {room.concepts.map((c) => (
                  <div key={c.id} className="concept-item-card">
                    <strong>{c.name}</strong>
                    <p>{c.summary}</p>
                    <small className="concept-quote">📜 {c.quote}</small>
                  </div>
                ))}
              </div>
            </div>
          ))}

        <button className="primary-button full-button" onClick={onReturn} style={{ marginTop: "16px" }}>
          {returnPoint ? "진행 중인 사건으로 복귀 >" : "메인으로 돌아가기"}
        </button>
      </div>
    </AcademyTemplate>
  );
}

// ==========================================
// 6. RECORD SCREEN (학습 기록 및 이해도)
// ==========================================
function RecordScreen({
  save,
  onBack,
  onOpenVault,
  onOpenCert,
}: {
  save: SaveData;
  onBack: () => void;
  onOpenVault: () => void;
  onOpenCert: (unitId: number) => void;
}) {
  const accuracy = save.attempts ? Math.round((save.correctAnswers / save.attempts) * 100) : 0;
  const student = save.studentProfile || defaultStudent;
  const unit1Complete = missions.every((m) => save.completedMissions.includes(m.id));

  return (
    <AcademyTemplate>
      <GameHUD missionTitle="나의 탐구 기록" level={save.level} exp={save.exp} onBack={onBack} />
      <div className="screen-scroll">
        <TemplateHeading eyebrow="LEARNING ANALYTICS" title="탐구 성장 지표" description="사건 해결 기록과 획득한 임명장을 확인하세요." />

        {/* Student Profile Overview */}
        <div className="record-student-card">
          <div>
            <span>소속 및 탐구관</span>
            <strong>{student.schoolName} {student.grade} {student.classNum} {student.studentNum} {student.name} ({student.studentId})</strong>
          </div>
          {unit1Complete && (
            <button className="primary-button print-cert-quick-btn" onClick={() => onOpenCert(1)}>
              <Certificate size={18} weight="duotone" /> 임명증 보기
            </button>
          )}
        </div>

        <div className="analytics-cards">
          <div className="metric-card"><strong>{save.completedMissions.length} / {missions.length}</strong><span>해결 사건</span></div>
          <div className="metric-card"><strong>{accuracy}%</strong><span>문항 정확도</span></div>
          <div className="metric-card"><strong>{save.evidence.length}장</strong><span>보유 권리 카드</span></div>
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
// 7. LOGIN MODAL (학생 프로필 및 로그인 관리 모달)
// ==========================================
function LoginModal({
  currentProfile,
  onLoginSuccess,
  onLogout,
  onOpenPasswordModal,
  onClose,
}: {
  currentProfile?: StudentProfile;
  onLoginSuccess: (profile: StudentProfile, mustChangePw?: boolean) => void;
  onLogout: () => void;
  onOpenPasswordModal: () => void;
  onClose: () => void;
}) {
  const [userId, setUserId] = useState(currentProfile?.isLoggedIn ? currentProfile.studentId : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError("아이디를 입력해 주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    const res = authenticateUser(userId, password);
    if (!res.success || !res.profile) {
      setError(res.error || "로그인에 실패했습니다.");
      return;
    }

    onLoginSuccess(res.profile, res.mustChangePassword);
    onClose();
  };

  return (
    <div className="modal-backdrop login-backdrop">
      <section className="login-modal-panel" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        
        <div className="login-header">
          <UserCheck size={28} color="#ffd36a" weight="duotone" />
          <div>
            <span className="login-subtitle">안산강서고 통합사회 탐구 아케이드</span>
            <h2 id="login-title">
              {currentProfile?.isLoggedIn ? "탐구관 계정 정보" : "학생 / 교사 로그인"}
            </h2>
          </div>
        </div>

        {currentProfile?.isLoggedIn ? (
          <div className="logged-in-profile-box">
            <div className="profile-detail-row"><dt>아이디:</dt><dd>{currentProfile.studentId}</dd></div>
            <div className="profile-detail-row"><dt>소속:</dt><dd>{currentProfile.schoolName} {currentProfile.grade} {currentProfile.classNum} {currentProfile.studentNum}</dd></div>
            <div className="profile-detail-row"><dt>성명:</dt><dd><strong>{currentProfile.name}</strong></dd></div>
            <div className="profile-detail-row"><dt>구분:</dt><dd>{currentProfile.role === "teacher" ? "통합사회 지도교사" : "학생 탐구관"}</dd></div>

            <div className="profile-actions-grid" style={{ marginTop: "18px" }}>
              <button className="secondary-button" onClick={onOpenPasswordModal}>
                <Key size={16} /> 비밀번호 / 실명 변경
              </button>
              <button className="text-button" onClick={() => { onLogout(); onClose(); }}>
                <SignOut size={16} /> 로그아웃 (게스트 전환)
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="login-modal-form">
            <p className="login-description">
              학급 아이디(예: 1반 8번은 <strong>SC0108</strong>)와 비밀번호(초기: <strong>123456789!</strong>)를 입력하세요.
            </p>

            {error && <div className="login-error-msg">{error}</div>}

            <div className="form-group">
              <label>아이디 (SC학급번호 / 교사: SCT01~10)</label>
              <input
                type="text"
                placeholder="예: SC0108"
                value={userId}
                onChange={(e) => { setUserId(e.target.value.toUpperCase()); setError(""); }}
                required
              />
            </div>

            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                placeholder="초기: 123456789!"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
              />
            </div>

            <button type="submit" className="primary-button full-button" style={{ marginTop: "10px" }}>
              <UserCheck size={18} /> 로그인
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

// ==========================================
// 8. PASSWORD CHANGE MODAL (비밀번호 및 실명 변경)
// ==========================================
function PasswordChangeModal({
  profile,
  onSuccess,
  onClose,
}: {
  profile: StudentProfile;
  onSuccess: (updated: StudentProfile) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("학생 실명을 입력해 주세요.");
      return;
    }
    if (newPassword.length < 4) {
      setError("비밀번호는 최소 4자리 이상으로 설정해 주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    const ok = changeUserPassword(profile.studentId, newPassword, name.trim());
    if (!ok) {
      setError("비밀번호 변경 중 오류가 발생했습니다.");
      return;
    }

    const updated: StudentProfile = {
      ...profile,
      name: name.trim(),
      password: newPassword,
      mustChangePassword: false,
    };
    onSuccess(updated);
  };

  return (
    <div className="modal-backdrop password-backdrop">
      <section className="password-modal-panel" role="dialog" aria-modal="true" aria-labelledby="pw-title">
        <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        <div className="login-header">
          <Key size={28} color="#ffd36a" weight="duotone" />
          <div>
            <span className="login-subtitle">{profile.studentId} 계정 보안</span>
            <h2 id="pw-title">비밀번호 및 실명 설정</h2>
          </div>
        </div>

        <p className="login-description">
          초기 비밀번호를 개인 비밀번호로 변경하고, 임명장에 기재될 학생의 <strong>실명</strong>을 입력해 주세요.
        </p>

        {error && <div className="login-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="password-form-grid">
          <div className="form-group">
            <label>학생 실명 <span className="req-star">*</span></label>
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
            <label>새 비밀번호 (4자리 이상) <span className="req-star">*</span></label>
            <input
              type="password"
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
              required
            />
          </div>

          <div className="form-group">
            <label>새 비밀번호 확인 <span className="req-star">*</span></label>
            <input
              type="password"
              placeholder="새 비밀번호 재입력"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              required
            />
          </div>

          <button type="submit" className="primary-button full-button" style={{ marginTop: "12px" }}>
            <Check size={18} /> 변경 완료 및 정보 저장
          </button>
        </form>
      </section>
    </div>
  );
}

// ==========================================
// 9. TEACHER DASHBOARD MODAL (교사용 모드)
// ==========================================
function TeacherDashboardModal({
  save,
  onClose,
  onPrintCert,
}: {
  save: SaveData;
  onClose: () => void;
  onPrintCert: (unitId: number) => void;
}) {
  const accounts = useMemo(() => loadAccounts(), []);
  const studentList = useMemo(() => {
    return Object.values(accounts).filter((acc) => acc.role === "student");
  }, [accounts]);

  return (
    <div className="modal-backdrop teacher-backdrop">
      <section className="teacher-dash-panel" role="dialog" aria-modal="true" aria-labelledby="teacher-title">
        <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        <div className="login-header">
          <ChalkboardTeacher size={28} color="#ffd36a" weight="fill" />
          <div>
            <span className="login-subtitle">교과 지도교사 전용 모드</span>
            <h2 id="teacher-title">안산강서고 1학년 통합사회 현황</h2>
          </div>
        </div>

        <p className="login-description">
          학급별 학생 계정(SC0101~SC1226)의 접속 및 비밀번호 변경 상태를 점검하고, 단원별 임명증을 일괄 검토합니다.
        </p>

        <div className="teacher-quick-stats">
          <div className="t-stat-card"><strong>12개 반</strong><span>편성 학급 (1~12반)</span></div>
          <div className="t-stat-card"><strong>26명 / 반</strong><span>학급당 최대 인원</span></div>
          <div className="t-stat-card"><strong>{studentList.length}명</strong><span>생성된 학생 계정</span></div>
        </div>

        <div className="teacher-cert-actions" style={{ marginTop: "16px" }}>
          <span className="actions-title">단원별 임명증 서식 인쇄 / 검토:</span>
          <div className="cert-btn-group">
            {unitCertificates.map((c) => (
              <button key={c.unitId} className="secondary-button" onClick={() => onPrintCert(c.unitId)}>
                <Printer size={16} /> {c.unitId}단원: {c.certName}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ==========================================
// 10. CERTIFICATE OF APPOINTMENT MODAL (단원별 임명증 & PDF)
// ==========================================
function CertificateModal({
  save,
  unitId,
  onClose,
}: {
  save: SaveData;
  unitId: number;
  onClose: () => void;
}) {
  const student = save.studentProfile || defaultStudent;
  const certInfo = unitCertificates.find((c) => c.unitId === unitId) || unitCertificates[0];

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
        <section className="certificate-document" id="printable-certificate" role="region" aria-label={certInfo.certName}>
          <div className="cert-inner-frame">
            {/* Corner Ornaments */}
            <div className="corner-ornament corner-tl">✦</div>
            <div className="corner-ornament corner-tr">✦</div>
            <div className="corner-ornament corner-bl">✦</div>
            <div className="corner-ornament corner-br">✦</div>

            <div className="cert-top-meta">
              <span className="cert-number">제 2026-ARCA-U{unitId}-{student.studentId}호</span>
              <span className="cert-badge-school">{student.schoolName}</span>
            </div>

            <div className="cert-emblem-wrapper">
              <span className="cert-gold-crest">{certInfo.badgeIcon}</span>
            </div>

            <h1 className="cert-main-title">{certInfo.certName}</h1>
            <p className="cert-sub-title">{certInfo.certSubtitle}</p>

            <div className="cert-recipient-box">
              <div className="recipient-row">
                <span className="rec-label">소 속 :</span>
                <span className="rec-value">{student.schoolName} {student.grade} {student.classNum} {student.studentNum} (학번: {student.studentId})</span>
              </div>
              <div className="recipient-row">
                <span className="rec-label">성 명 :</span>
                <span className="rec-value rec-name">{student.name}</span>
              </div>
            </div>

            <div className="cert-body-text">
              <p>{certInfo.description}</p>
            </div>

            {/* Collected Rights Cards Seal Box */}
            <div className="cert-rights-summary">
              <span className="summary-title">✦ {certInfo.constitutionalBasis} ✦</span>
              <div className="summary-tags">
                <span>인간 존엄</span>
                <span>보편성</span>
                <span>천부성</span>
                <span>불가침성</span>
                <span>자유권</span>
                <span>평등권</span>
                <span>참정권</span>
                <span>사회권</span>
                <span>연대권</span>
                <span>공간정의</span>
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
// 11. CARD VAULT & DETAIL MODALS
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
  const allCards = Object.values(evidenceCatalog);
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="card-vault-modal" role="dialog" aria-modal="true" aria-labelledby="vault-title">
        <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        <div className="vault-header">
          <Medal size={28} color="#ffd36a" weight="duotone" />
          <div>
            <span className="vault-sub">아이템 인벤토리</span>
            <h2 id="vault-title">권리 카드 보관소</h2>
          </div>
        </div>
        <p className="vault-desc">사건을 해결하며 획득한 헌법적 기본권 카드를 확인하세요. 터치하면 상세 교과서 내용이 열립니다.</p>

        <div className="vault-cards-grid">
          {allCards.map((card) => {
            const isOwned = save.evidence.includes(card.id);
            return (
              <EvidenceCard
                key={card.id}
                data={card}
                collected={isOwned}
                selected={false}
                onClick={() => {
                  if (isOwned) {
                    onClose();
                    onSelectCard(card.id);
                  }
                }}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

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
    <div className="modal-backdrop card-detail-backdrop">
      <section className="card-detail-popup" role="dialog" aria-modal="true" aria-labelledby="card-title">
        <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        <div className="card-popup-header">
          <span className="card-popup-cat">{card.category.toUpperCase()}</span>
          <h2 id="card-title">{card.title}</h2>
          <p className="card-popup-desc">{card.description}</p>
        </div>

        <div className="card-popup-body">
          {card.textbookPage && (
            <div className="card-detail-section">
              <span className="section-label">📖 교과서 출처</span>
              <p className="textbook-highlight">{card.textbookPage}</p>
            </div>
          )}
          {card.textbookQuote && (
            <div className="card-detail-section">
              <span className="section-label">📜 헌법 및 법률 조문</span>
              <blockquote className="quote-box">{card.textbookQuote}</blockquote>
            </div>
          )}
          {card.applicationCase && (
            <div className="card-detail-section">
              <span className="section-label">🔍 현실 적용 사례</span>
              <p>{card.applicationCase}</p>
            </div>
          )}
          {card.studyTip && (
            <div className="card-detail-section tip-box">
              <span className="section-label">💡 핵심 탐구 팁</span>
              <p>{card.studyTip}</p>
            </div>
          )}
        </div>

        <button className="primary-button full-button" onClick={onClose} style={{ marginTop: "14px" }}>
          확인 완료
        </button>
      </section>
    </div>
  );
}

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
      className={`evidence-card-item ${collected ? "collected" : "locked"} ${selected ? "selected" : ""}`}
      onClick={onClick}
      disabled={!collected && !selected}
    >
      <div className="card-inner">
        <span className="card-category-tag">{data.category.toUpperCase()}</span>
        <strong className="card-title">{data.title}</strong>
        <p className="card-desc">{collected ? data.description : "사건 조사를 통해 카드를 획득하세요."}</p>
        <span className="card-status-label">{collected ? "보관됨 (열람 가능)" : "미획득 (잠김)"}</span>
      </div>
    </button>
  );
}

// ==========================================
// 12. AUXILIARY MODALS & HELPERS
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
        <button className="modal-close" onClick={onClose} aria-label="닫기"><X size={20} /></button>
        <Sparkle size={36} weight="fill" color="var(--gold)" />
        <h2 id="soon-title">COMING SOON</h2>
        <p>{message}</p>
        <button className="primary-button full-button" onClick={onClose}>확인</button>
      </section>
    </div>
  );
}

function GameIntroduction({ onClose }: { onClose: () => void }) {
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
        <button className="primary-button full-button" onClick={onClose} style={{ marginTop: "14px" }}>탐구 시작 준비 완료</button>
      </section>
    </div>
  );
}

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
        <p>1단원 6개 사건을 모두 해결하고 권리 카드 수집 훈련을 훌륭히 완수했습니다.</p>
        <button className="primary-button full-button" onClick={onOpenCertificate}>
          <Certificate size={20} /> 정식 인권수호관 임명증 보기
        </button>
        <button className="secondary-button full-button" onClick={onClose} style={{ marginTop: "8px" }}>
          미션 지도로 돌아가기
        </button>
      </section>
    </div>
  );
}
