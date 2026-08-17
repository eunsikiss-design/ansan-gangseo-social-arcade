"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle, Clock,
  FileText, Gear, Headphones, Info, LockKey, MapTrifold, Medal, Play,
  Sparkle, SpeakerHigh, SpeakerSlash, Trophy, Warning, X, MagnifyingGlass,
  User, UserCheck, SignOut, Printer, DownloadSimple, Certificate, ShieldCheck,
  Key, IdentificationCard, Eye, Student, ChalkboardTeacher, Sparkle as StarIcon,
  Lightbulb, ChartBar, CheckSquare, Compass, HandPalm, Scales, ShareNetwork,
} from "@phosphor-icons/react";

import { unit1GameModes } from "@/src/data/unit1Data";
import { unit1VocabCards, unit1SkillTrainings, type VocabCard, type SkillTrainingCard } from "@/src/data/skillLabData";
import { unitCertificates } from "@/src/data/certificates";
import {
  authenticateUser, changeUserPassword, DEFAULT_INITIAL_PASSWORD,
  getOrCreateAccount, loadAccounts, parseUserId, updateProfileName,
} from "@/src/game/auth";
import { audioManager, defaultAudioSettings, type AudioSettings } from "@/src/game/audio/AudioManager";
import { calculateMissionScore, evaluateCompetencyProfile, generatePortfolioDraft } from "@/src/game/evaluator";
import type {
  GameMissionData, GameModeId, GameModeInfo, HintItem, MissionLevel,
  PortfolioEntry, SaveData, ScoreBreakdown, StudentProfile, UnitCertificateInfo, UnitId,
} from "@/src/game/types";

const SAVE_KEY = "arca-social-save-v7";

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
  currentUnit: 1,
  currentGameMode: null,
  currentLevel: 1,
  exp: 0,
  overallLevel: 1,
  completedMissions: [],
  missionScores: {},
  earnedCertificates: [],
  portfolioDrafts: [],
  studentProfile: defaultStudent,
  audio: defaultAudioSettings,
  skillLabScore: {
    vocabLevel: 1,
    vocabScore: 0,
    skillLevel: 1,
    skillScore: 0,
  },
});

type ViewMode =
  | "login"
  | "hub"
  | "unit1_dashboard"
  | "mission_player"
  | "skill_lab_vocab"
  | "skill_lab_skill"
  | "portfolio_view";

export default function HomePage() {
  const [save, setSave] = useState<SaveData>(blankSave);
  const [view, setView] = useState<ViewMode>("login");
  const [hydrated, setHydrated] = useState(false);

  // Selected Active Mission State
  const [activeModeId, setActiveModeId] = useState<GameModeId>("case_challenge");
  const [activeMission, setActiveMission] = useState<GameMissionData>(unit1GameModes[0].missions[0]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [activeHintLevel, setActiveHintLevel] = useState<number>(0);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreBreakdown | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // General Modals
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [introOpen, setIntroOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [teacherDashOpen, setTeacherDashOpen] = useState(false);
  const [certUnitId, setCertUnitId] = useState<number | null>(null);
  const [comingSoonMsg, setComingSoonMsg] = useState<string | null>(null);
  const [portfolioOpen, setPortfolioOpen] = useState(false);

  // Initialize
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSave({ ...blankSave(), ...parsed });
        if (parsed.studentProfile?.isLoggedIn) {
          setView("hub");
        }
      }
    } catch { /* fallback to blank save */ }
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
  }, [view, activeMission]);

  // Unit 1 Completion Check (모든 5개 모드의 레벨 5 완료 확인)
  const unit1Cleared = useMemo(() => {
    const totalUnit1Missions = unit1GameModes.flatMap((m) => m.missions).length;
    const completedCount = save.completedMissions.filter((id) => id.startsWith("u1-")).length;
    return completedCount >= 5; // 5대 모드 클리어 기준
  }, [save.completedMissions]);

  // Update earned certificate when unit1 is cleared
  useEffect(() => {
    if (unit1Cleared && !save.earnedCertificates.includes(1)) {
      setSave((prev) => ({
        ...prev,
        earnedCertificates: [...new Set([...prev.earnedCertificates, 1])],
      }));
    }
  }, [unit1Cleared, save.earnedCertificates]);

  // Audio Playback based on view
  useEffect(() => {
    if (!hydrated) return;
    if (certUnitId !== null) {
      void audioManager.playBgm("certificate");
      void audioManager.playSfx("cert_fanfare");
      return;
    }
    if (view === "login" || view === "hub") {
      void audioManager.playBgm("main_hub");
    } else if (view === "unit1_dashboard") {
      void audioManager.playBgm("mission_map");
    } else if (view === "mission_player") {
      void audioManager.playBgm("investigation");
    } else if (view === "skill_lab_vocab" || view === "skill_lab_skill") {
      void audioManager.playBgm("academy");
    }
  }, [view, certUnitId, hydrated]);

  const handleLoginSuccess = (profile: StudentProfile, mustChangePw?: boolean) => {
    setSave((prev) => ({ ...prev, studentProfile: profile }));
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
    setView("login");
    void audioManager.playSfx("ui_click");
  };

  const startMission = (missionData: GameMissionData) => {
    setActiveMission(missionData);
    setActiveModeId(missionData.gameModeId);
    setSelectedChoice(null);
    setActiveHintLevel(0);
    setScoreResult(null);
    setShowFeedbackModal(false);
    setView("mission_player");
    void audioManager.playSfx("case_open");
  };

  const handleChoiceSubmit = (choiceIdx: number) => {
    if (scoreResult) return;
    setSelectedChoice(choiceIdx);
    const score = calculateMissionScore(activeMission, choiceIdx, activeHintLevel);
    setScoreResult(score);

    const isCorrect = choiceIdx === activeMission.correctAnswer;
    void audioManager.playSfx(isCorrect ? "success" : "error");

    // Generate Portfolio Entry
    const draft = generatePortfolioDraft(activeMission, choiceIdx, score);

    setSave((prev) => {
      const nextCompleted = isCorrect ? [...new Set([...prev.completedMissions, activeMission.id])] : prev.completedMissions;
      const nextExp = prev.exp + score.totalScore;
      return {
        ...prev,
        completedMissions: nextCompleted,
        exp: nextExp,
        overallLevel: Math.floor(nextExp / 200) + 1,
        missionScores: {
          ...prev.missionScores,
          [activeMission.id]: score,
        },
        portfolioDrafts: [draft, ...prev.portfolioDrafts.filter((p) => p.missionTitle !== activeMission.title)],
      };
    });

    if (!isCorrect) {
      setShowFeedbackModal(true);
    }
  };

  const handleNextMission = () => {
    const currentMode = unit1GameModes.find((m) => m.id === activeModeId);
    if (!currentMode) {
      setView("unit1_dashboard");
      return;
    }
    const curIdx = currentMode.missions.findIndex((m) => m.id === activeMission.id);
    if (curIdx < currentMode.missions.length - 1) {
      startMission(currentMode.missions[curIdx + 1]);
    } else {
      setView("unit1_dashboard");
      void audioManager.playSfx("mission_complete");
    }
  };

  const evalProfile = useMemo(() => {
    return evaluateCompetencyProfile(save.missionScores, save.completedMissions);
  }, [save.missionScores, save.completedMissions]);

  return (
    <main className="arcade-viewport">
      <div className="arcade-phone" aria-label="안산강서고 1학년 통합사회 탐구 아케이드">
        {/* ========================================================
            1. VIEW ROUTER
            ======================================================== */}
        {view === "login" && (
          <LoginScreenView
            onLoginSuccess={handleLoginSuccess}
            onGuest={() => setView("hub")}
          />
        )}

        {view === "hub" && (
          <MainHubScreenView
            save={save}
            unit1Cleared={unit1Cleared}
            evalProfile={evalProfile}
            onOpenUnit1={() => setView("unit1_dashboard")}
            onOpenSkillLabVocab={() => setView("skill_lab_vocab")}
            onOpenSkillLabSkill={() => setView("skill_lab_skill")}
            onOpenPortfolio={() => setPortfolioOpen(true)}
            onOpenCert={(uId) => setCertUnitId(uId)}
            onOpenLogin={() => setLoginModalOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenIntro={() => setIntroOpen(true)}
            onOpenTeacherDash={() => setTeacherDashOpen(true)}
            onComingSoon={(msg) => setComingSoonMsg(msg)}
          />
        )}

        {view === "unit1_dashboard" && (
          <Unit1DashboardView
            save={save}
            onBack={() => setView("hub")}
            onStartMission={startMission}
            onOpenCert={() => setCertUnitId(1)}
            onOpenPortfolio={() => setPortfolioOpen(true)}
          />
        )}

        {view === "mission_player" && (
          <MissionPlayerView
            mission={activeMission}
            selectedChoice={selectedChoice}
            scoreResult={scoreResult}
            activeHintLevel={activeHintLevel}
            onSelectChoice={handleChoiceSubmit}
            onOpenHint={() => setHintModalOpen(true)}
            onNext={handleNextMission}
            onRetry={() => {
              setSelectedChoice(null);
              setScoreResult(null);
              setShowFeedbackModal(false);
            }}
            onBack={() => setView("unit1_dashboard")}
          />
        )}

        {view === "skill_lab_vocab" && (
          <SkillLabVocabView
            save={save}
            setSave={setSave}
            onBack={() => setView("hub")}
          />
        )}

        {view === "skill_lab_skill" && (
          <SkillLabTrainingView
            save={save}
            setSave={setSave}
            onBack={() => setView("hub")}
          />
        )}

        {/* ========================================================
            2. MODALS & POPUPS
            ======================================================== */}
        {hintModalOpen && (
          <HintModal
            hints={activeMission.hints}
            currentHintLevel={activeHintLevel}
            onSelectHint={(hLevel) => {
              setActiveHintLevel(hLevel);
              setHintModalOpen(false);
              void audioManager.playSfx("inspect");
            }}
            onClose={() => setHintModalOpen(false)}
          />
        )}

        {showFeedbackModal && (
          <FeedbackModal
            feedback={activeMission.feedback}
            onRetry={() => {
              setSelectedChoice(null);
              setScoreResult(null);
              setShowFeedbackModal(false);
              void audioManager.playSfx("ui_click");
            }}
            onClose={() => setShowFeedbackModal(false)}
          />
        )}

        {portfolioOpen && (
          <PortfolioReportModal
            save={save}
            evalProfile={evalProfile}
            onClose={() => setPortfolioOpen(false)}
          />
        )}

        {loginModalOpen && (
          <LoginModal
            currentProfile={save.studentProfile}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onOpenPasswordModal={() => {
              setLoginModalOpen(false);
              setPasswordModalOpen(true);
            }}
            onClose={() => setLoginModalOpen(false)}
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

        {comingSoonMsg && (
          <ComingSoonModal
            message={comingSoonMsg}
            onClose={() => setComingSoonMsg(null)}
          />
        )}

        {settingsOpen && (
          <SettingsPanelModal
            audio={save.audio}
            onChange={(next) => {
              audioManager.update(next);
              setSave((prev) => ({ ...prev, audio: { ...prev.audio, ...next } }));
            }}
            onClose={() => setSettingsOpen(false)}
          />
        )}

        {introOpen && (
          <GameIntroductionModal onClose={() => setIntroOpen(false)} />
        )}
      </div>
    </main>
  );
}

// =========================================================================
// 1. LOGIN SCREEN VIEW
// =========================================================================
function LoginScreenView({
  onLoginSuccess,
  onGuest,
}: {
  onLoginSuccess: (profile: StudentProfile, mustChangePw?: boolean) => void;
  onGuest: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError("학급 아이디를 입력해 주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    const res = authenticateUser(userId, password);
    if (!res.success || !res.profile) {
      setError(res.error || "아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    onLoginSuccess(res.profile, res.mustChangePassword);
  };

  return (
    <div className="login-screen-view">
      <div className="login-screen-card">
        <div className="login-logo-lockup">
          <div className="logo-school-badge">안산강서고등학교 1학년 통합사회</div>
          <h1 className="login-main-title">
            통합사회<br />
            <span>탐구 아케이드</span>
          </h1>
          <p className="login-hero-sub">사건을 읽고, 헌법을 탐구하며, 수행평가 역량을 완성하라.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form-box">
          <div className="form-input-block">
            <label htmlFor="login-id">
              <IdentificationCard size={18} />
              <span>학급 아이디 (학생: SC학급번호 / 교사: SCT01~10)</span>
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
              ※ 초기 비밀번호는 <code>123456789!</code> 이며 최초 로그인 시 변경합니다.
            </small>
          </div>

          {error && <div className="login-error-alert">{error}</div>}

          <button type="submit" className="primary-button full-button login-submit-btn">
            <UserCheck size={20} weight="bold" />
            탐구관 로그인 및 시작
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

// =========================================================================
// 2. MAIN HUB SCREEN VIEW (단원 선택, 탐구력 향상 랩, 공통주제)
// =========================================================================
function MainHubScreenView({
  save,
  unit1Cleared,
  evalProfile,
  onOpenUnit1,
  onOpenSkillLabVocab,
  onOpenSkillLabSkill,
  onOpenPortfolio,
  onOpenCert,
  onOpenLogin,
  onOpenSettings,
  onOpenIntro,
  onOpenTeacherDash,
  onComingSoon,
}: {
  save: SaveData;
  unit1Cleared: boolean;
  evalProfile: any;
  onOpenUnit1: () => void;
  onOpenSkillLabVocab: () => void;
  onOpenSkillLabSkill: () => void;
  onOpenPortfolio: () => void;
  onOpenCert: (unitId: number) => void;
  onOpenLogin: () => void;
  onOpenSettings: () => void;
  onOpenIntro: () => void;
  onOpenTeacherDash: () => void;
  onComingSoon: (msg: string) => void;
}) {
  const student = save.studentProfile;
  const isTeacher = student.role === "teacher";

  const units = [
    {
      id: 1,
      title: "1단원: 인권 보장과 헌법",
      sub: "인권 판례 챌린지 · 기본권 수호대 · 헌법재판",
      status: unit1Cleared ? "★ 100% 이수 완수" : "🔥 지금 탐구 도전 가능",
      active: true,
      badge: "⚖️ 인권수호관",
    },
    {
      id: 2,
      title: "2단원: 사회 정의와 불평등",
      sub: "정의의 원탁 · 공정 분배 · 공정 도시",
      status: "1단원 완료 후 순차 오픈 예정",
      active: false,
      badge: "🌿 생태·정의수호관",
    },
    {
      id: 3,
      title: "3단원: 시장경제와 지속가능발전",
      sub: "시장 밸런스 · 금융 생존 · 무역 타이쿤",
      status: "순차 오픈 예정",
      active: false,
      badge: "🏙️ 경제기획관",
    },
    {
      id: 4,
      title: "4단원: 세계화와 평화",
      sub: "세계도시 · 문화 다양성 · 평화 협상",
      status: "순차 오픈 예정",
      active: false,
      badge: "🏛️ 평화수호관",
    },
    {
      id: 5,
      title: "5단원: 미래와 지속가능한 삶",
      sub: "인구 피라미드 · 기후위기 · 미래 도시 2050",
      status: "순차 오픈 예정",
      active: false,
      badge: "📈 미래설계관",
    },
  ];

  const crossThemes = [
    { title: "국내외 인권 문제", icon: "🌍", tag: "인권·세계화 크로스" },
    { title: "사회·공간 불평등", icon: "🏙️", tag: "정의·도시 크로스" },
    { title: "현대 세계 무역", icon: "🚢", tag: "시장·국제무역 크로스" },
    { title: "세계화의 문제점", icon: "⚠️", tag: "문화·환경 크로스" },
    { title: "국제사회 갈등과 협력", icon: "🕊️", tag: "평화·지속가능 크로스" },
  ];

  return (
    <div className="hub-container-v2">
      {/* Top Header Bar */}
      <header className="hub-top-v2">
        <div className="hub-user-pill" onClick={onOpenLogin}>
          <span className="user-dot" />
          <div className="user-info">
            <strong>{student.isLoggedIn ? `${student.grade} ${student.classNum} ${student.studentNum} ${student.name}` : "게스트 모드"}</strong>
            <small>{student.studentId} · {student.schoolName}</small>
          </div>
        </div>

        <div className="hub-top-buttons">
          {isTeacher && (
            <button className="icon-button" onClick={onOpenTeacherDash} title="교사용 대시보드"><ChalkboardTeacher size={20} color="#ffd36a" weight="fill" /></button>
          )}
          <button className="icon-button" onClick={onOpenPortfolio} title="수행평가 역량 리포트"><ChartBar size={20} color="var(--teal-soft)" /></button>
          <button className="icon-button" onClick={onOpenIntro} title="게임 가이드"><BookOpen size={20} /></button>
          <button className="icon-button" onClick={onOpenSettings} title="설정"><Gear size={20} /></button>
        </div>
      </header>

      {/* Hero Brand Title */}
      <div className="hub-hero-brand">
        <span className="hero-emblem">✦ 2026 ARCA SOCIAL INVESTIGATION ✦</span>
        <h1>통합사회 <span>탐구 아케이드</span></h1>
        <p>5개 단원과 탐구력 향상 랩을 통해 수행평가 역량을 완성하세요.</p>
      </div>

      {/* 단원별 공인 수호관 뱃지 전시대 */}
      <div className="hub-badge-dashboard">
        <div className="badge-dash-header">
          <div className="badge-dash-title">
            <Trophy size={18} weight="duotone" color="var(--gold)" />
            <span>단원별 공인 수호관 임명 뱃지</span>
          </div>
          <span className="badge-count-pill">
            {save.earnedCertificates.length} / 5개 획득
          </span>
        </div>

        <div className="badge-slots-row">
          {unitCertificates.map((cert) => {
            const isEarned = save.earnedCertificates.includes(cert.unitId);
            return (
              <button
                key={cert.unitId}
                className={`badge-slot-item ${isEarned ? "earned" : "locked"}`}
                onClick={() => {
                  if (isEarned) onOpenCert(cert.unitId);
                  else onComingSoon(`${cert.unitTitle} 전 과정을 완수하면 [${cert.certName}]과 뱃지가 수여됩니다.`);
                }}
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

      {/* 🚀 탐구력 향상 랩 (홈 화면 최상단 연계) */}
      <section className="skill-lab-section">
        <div className="section-title-row">
          <div className="title-with-icon">
            <Brain size={20} color="var(--gold)" weight="duotone" />
            <h2>탐구력 향상 랩 (Skill Lab)</h2>
          </div>
          <span className="sub-tag">기초 탐구 역량 훈련실</span>
        </div>

        <div className="skill-lab-grid">
          <div className="lab-card" onClick={onOpenSkillLabVocab}>
            <div className="lab-icon-box">📚</div>
            <div className="lab-card-body">
              <strong>개념-용어 학습실</strong>
              <p>헌법 제10조, 인권 4대 특성, 기본권 유형 10대 핵심 용어 마스터</p>
              <span className="lab-score-pill">누적 점수: {save.skillLabScore.vocabScore}점 (Lv.{save.skillLabScore.vocabLevel})</span>
            </div>
            <ArrowRight size={20} className="lab-arrow" />
          </div>

          <div className="lab-card" onClick={onOpenSkillLabSkill}>
            <div className="lab-icon-box">🔍</div>
            <div className="lab-card-body">
              <strong>탐구기능 연습실</strong>
              <p>판례 자료 분석, 인과 추론, 비교 대조, 삼단 논증 설계 트레이닝</p>
              <span className="lab-score-pill">누적 점수: {save.skillLabScore.skillScore}점 (Lv.{save.skillLabScore.skillLevel})</span>
            </div>
            <ArrowRight size={20} className="lab-arrow" />
          </div>
        </div>
      </section>

      {/* 📚 5개 단원 선택 그리드 */}
      <section className="curriculum-units-section">
        <div className="section-title-row">
          <div className="title-with-icon">
            <BookOpen size={20} color="var(--teal-soft)" weight="duotone" />
            <h2>교과 단원별 탐구 아케이드</h2>
          </div>
          <span className="sub-tag">5개 단원</span>
        </div>

        <div className="unit-cards-container">
          {units.map((u) => (
            <div
              key={u.id}
              className={`unit-action-card ${u.active ? "active" : "locked"}`}
              onClick={() => {
                if (u.active) onOpenUnit1();
                else onComingSoon(`${u.title}은 1단원 마무리 후 순차적으로 공개될 예정입니다.`);
              }}
            >
              <div className="unit-number-circle">0{u.id}</div>
              <div className="unit-info-col">
                <div className="unit-title-row">
                  <h3>{u.title}</h3>
                  <span className={`status-tag ${u.active ? "playable" : "coming"}`}>
                    {u.status}
                  </span>
                </div>
                <p>{u.sub}</p>
                <div className="unit-badge-row">
                  <span className="badge-preview">{u.badge}</span>
                </div>
              </div>
              <ArrowRight size={22} className="unit-card-arrow" />
            </div>
          ))}
        </div>
      </section>

      {/* 🌐 5대 공통주제 크로스 미션 */}
      <section className="cross-theme-section">
        <div className="section-title-row">
          <div className="title-with-icon">
            <Compass size={20} color="var(--purple)" weight="duotone" />
            <h2>공통주제 크로스 미션</h2>
          </div>
          <span className="sub-tag">단원 융합 탐구</span>
        </div>

        <div className="cross-theme-scroll">
          {crossThemes.map((ct, idx) => (
            <div
              key={idx}
              className="theme-card-mini"
              onClick={() => onComingSoon(`[${ct.title}] 공통주제 크로스 미션은 순차 오픈 준비 중입니다.`)}
            >
              <span className="theme-icon">{ct.icon}</span>
              <strong>{ct.title}</strong>
              <small>{ct.tag}</small>
              <span className="theme-badge-award">4대 역량 배지 수여</span>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 수행평가 포트폴리오 바로가기 */}
      <div className="portfolio-banner-card" onClick={onOpenPortfolio}>
        <div className="p-banner-left">
          <FileText size={28} color="var(--gold)" weight="fill" />
          <div>
            <strong>나의 수행평가 포트폴리오 & 역량 리포트</strong>
            <p>예상 성취수준: <span className="rank-highlight">{evalProfile.overallLevel}등급 ({evalProfile.averageScore}점)</span> · {save.portfolioDrafts.length}개 초안 저장됨</p>
          </div>
        </div>
        <button className="primary-button p-banner-btn">리포트 열람 &gt;</button>
      </div>
    </div>
  );
}

// =========================================================================
// 3. UNIT 1 DASHBOARD VIEW (1단원 5대 게임 모드 선택기)
// =========================================================================
function Unit1DashboardView({
  save,
  onBack,
  onStartMission,
  onOpenCert,
  onOpenPortfolio,
}: {
  save: SaveData;
  onBack: () => void;
  onStartMission: (m: GameMissionData) => void;
  onOpenCert: () => void;
  onOpenPortfolio: () => void;
}) {
  const completedMissions = save.completedMissions;
  const isUnitComplete = completedMissions.filter((id) => id.startsWith("u1-")).length >= 5;

  return (
    <div className="unit1-dash-container">
      {/* Top Header */}
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack} aria-label="메인 허브로"><ArrowLeft size={20} /></button>
          <div>
            <span>1단원 · 인권 보장과 헌법</span>
            <strong>5대 시그니처 게임 아케이드</strong>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="icon-button" onClick={onOpenPortfolio} title="수행평가 포트폴리오"><FileText size={20} weight="duotone" /></button>
          </div>
        </div>
      </header>

      <div className="unit1-dash-content">
        {/* Unit Completion Gold Banner */}
        {isUnitComplete && (
          <div className="unit-complete-gold-banner" onClick={onOpenCert}>
            <div className="gold-banner-left">
              <Trophy size={28} weight="fill" color="#ffd36a" />
              <div>
                <strong>1단원 인권 보장과 헌법 완수!</strong>
                <p>정식 인권수호관 임명증을 확인하고 PDF로 다운로드하세요.</p>
              </div>
            </div>
            <button className="gold-cert-btn"><Printer size={16} /> 임명증 보기</button>
          </div>
        )}

        {/* 5대 게임 모드 카드 리스트 */}
        <div className="game-modes-list">
          {unit1GameModes.map((mode, mIdx) => {
            const modeMissions = mode.missions;
            const completedInMode = modeMissions.filter((m) => completedMissions.includes(m.id)).length;
            const pct = Math.round((completedInMode / modeMissions.length) * 100);

            return (
              <div key={mode.id} className="game-mode-card">
                <div className="mode-card-header">
                  <div className="mode-title-lockup">
                    <span className="mode-emoji">{mode.iconEmoji}</span>
                    <div>
                      <span className="mode-category">GAME MODE 0{mIdx + 1}</span>
                      <h3>{mode.title}</h3>
                    </div>
                  </div>
                  <span className="mode-progress-badge">{pct}% 달성</span>
                </div>

                <p className="mode-desc">{mode.description}</p>

                {/* Level Missions Row (Lv1 ~ Lv5) */}
                <div className="mode-levels-grid">
                  {modeMissions.map((mission) => {
                    const isDone = completedMissions.includes(mission.id);
                    const missionScore = save.missionScores[mission.id]?.totalScore;

                    return (
                      <button
                        key={mission.id}
                        className={`level-step-btn ${isDone ? "done" : "ready"}`}
                        onClick={() => onStartMission(mission)}
                      >
                        <div className="level-btn-top">
                          <span className="level-tag">{mission.levelName}</span>
                          {isDone && <CheckCircle size={14} weight="fill" color="#56e39f" />}
                        </div>
                        <strong>{mission.title}</strong>
                        <small>{isDone ? `점수: ${missionScore}점` : "도전하기 >"}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. MISSION PLAYER VIEW (100점 채점, 3단계 힌트, 오답 피드백)
// =========================================================================
function MissionPlayerView({
  mission,
  selectedChoice,
  scoreResult,
  activeHintLevel,
  onSelectChoice,
  onOpenHint,
  onNext,
  onRetry,
  onBack,
}: {
  mission: GameMissionData;
  selectedChoice: number | null;
  scoreResult: ScoreBreakdown | null;
  activeHintLevel: number;
  onSelectChoice: (idx: number) => void;
  onOpenHint: () => void;
  onNext: () => void;
  onRetry: () => void;
  onBack: () => void;
}) {
  const currentHint = mission.hints.find((h) => h.level === activeHintLevel);

  return (
    <div className="mission-player-container">
      {/* Top HUD */}
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack} aria-label="목록으로"><ArrowLeft size={20} /></button>
          <div>
            <span>1단원 · {mission.levelName}</span>
            <strong>{mission.title}</strong>
          </div>
          <button className="hint-btn-pill" onClick={onOpenHint}>
            <Lightbulb size={18} weight="fill" color={activeHintLevel > 0 ? "var(--gold)" : "#8bf2e9"} />
            <span>{activeHintLevel > 0 ? `${activeHintLevel}단계 힌트 적용 중` : "힌트 보기"}</span>
          </button>
        </div>
      </header>

      <div className="mission-player-scroll">
        {/* Scenario & Source Material Card */}
        <section className="mission-scenario-card">
          <div className="scenario-meta-row">
            <span className="competency-chip">{mission.competencyArea}</span>
            <span className="textbook-ref-chip">📖 {mission.textbookPage}</span>
          </div>

          <h2 className="scenario-title">{mission.title}</h2>
          <p className="scenario-body">{mission.scenario}</p>

          {mission.sourceMaterial && (
            <div className="source-box-v2">
              <span className="source-box-tag">🔍 교과서 판례 및 조문 자료</span>
              <h4>{mission.sourceMaterial.title}</h4>
              <p>{mission.sourceMaterial.content}</p>
              {mission.sourceMaterial.quote && (
                <blockquote className="source-quote-v2">{mission.sourceMaterial.quote}</blockquote>
              )}
            </div>
          )}
        </section>

        {/* 힌트 적용 표시 박스 */}
        {currentHint && (
          <div className="active-hint-banner">
            <Lightbulb size={20} weight="fill" color="var(--gold)" />
            <div>
              <strong>{currentHint.level}단계 힌트 ({currentHint.penalty === 0 ? "감점 없음" : `-${currentHint.penalty}점`})</strong>
              <p>{currentHint.text}</p>
            </div>
          </div>
        )}

        {/* Question & Choices */}
        <section className="mission-question-card">
          <div className="question-header">
            <span className="q-label">Q. 핵심 법리 탐구 문제</span>
            <h3>{mission.question}</h3>
          </div>

          <div className="choices-list-v2">
            {mission.choices.map((choiceText, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrect = idx === mission.correctAnswer;
              let choiceClass = "choice-card-v2";

              if (scoreResult) {
                if (isSelected) {
                  choiceClass += isCorrect ? " correct" : " wrong";
                } else if (isCorrect) {
                  choiceClass += " show-correct";
                }
              }

              return (
                <button
                  key={idx}
                  className={choiceClass}
                  disabled={scoreResult !== null}
                  onClick={() => onSelectChoice(idx)}
                >
                  <span className="choice-num-badge">{idx + 1}</span>
                  <p className="choice-text-body">{choiceText}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 100점 채점 결과 바 & 피드백 */}
        {scoreResult && (
          <section className="score-evaluation-card">
            <div className="score-card-header">
              <div className="score-title-row">
                <Trophy size={24} color={scoreResult.totalScore >= 70 ? "var(--gold)" : "#ff5757"} weight="fill" />
                <div>
                  <strong>{scoreResult.totalScore >= 70 ? "🎉 탐구 과제 완수!" : "⚠️ 다시 검토가 필요합니다"}</strong>
                  <span>취득 점수: {scoreResult.totalScore}점 / 100점</span>
                </div>
              </div>
            </div>

            {/* 4대 채점 기준 분해 */}
            <div className="score-breakdown-grid">
              <div className="score-item">
                <span>개념 정확성</span>
                <strong>{scoreResult.conceptAccuracy} / 30점</strong>
              </div>
              <div className="score-item">
                <span>자료 활용</span>
                <strong>{scoreResult.dataUsage} / 25점</strong>
              </div>
              <div className="score-item">
                <span>근거 타당성</span>
                <strong>{scoreResult.logicValidity} / 25점</strong>
              </div>
              <div className="score-item">
                <span>표현 완성도</span>
                <strong>{scoreResult.solutionQuality} / 20점</strong>
              </div>
            </div>

            {scoreResult.hintPenalty > 0 && (
              <small className="hint-penalty-notice">※ 힌트 사용 감점: -{scoreResult.hintPenalty}점 반영됨</small>
            )}

            <div className="score-card-actions">
              {scoreResult.totalScore >= 70 ? (
                <button className="primary-button full-button" onClick={onNext}>
                  다음 단계 미션으로 이동 &gt;
                </button>
              ) : (
                <div className="button-row">
                  <button className="secondary-button" onClick={onRetry}>다시 풀기</button>
                  <button className="primary-button" onClick={onNext}>계속 진행 &gt;</button>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 5. SKILL LAB VIEWS (개념-용어 학습실 & 탐구기능 연습실)
// =========================================================================
function SkillLabVocabView({
  save,
  setSave,
  onBack,
}: {
  save: SaveData;
  setSave: React.Dispatch<React.SetStateAction<SaveData>>;
  onBack: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const card = unit1VocabCards[currentIdx];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === card.correctAnswer;
    void audioManager.playSfx(isCorrect ? "success" : "error");

    if (isCorrect) {
      setSave((prev) => ({
        ...prev,
        skillLabScore: {
          ...prev.skillLabScore,
          vocabScore: prev.skillLabScore.vocabScore + 10,
          vocabLevel: Math.floor((prev.skillLabScore.vocabScore + 10) / 50) + 1,
        },
      }));
    }
  };

  return (
    <div className="skill-lab-view-container">
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack}><ArrowLeft size={20} /></button>
          <div>
            <span>탐구력 향상 랩 · 개념-용어 학습실</span>
            <strong>{card.term} ({currentIdx + 1}/{unit1VocabCards.length})</strong>
          </div>
          <span className="level-chip">Lv.{save.skillLabScore.vocabLevel}</span>
        </div>
      </header>

      <div className="skill-lab-scroll">
        <div className="vocab-flashcard">
          <span className="vocab-cat-tag">{card.category}</span>
          <h2 className="vocab-term">{card.term} {card.hanja && <small>({card.hanja})</small>}</h2>
          <p className="vocab-def">{card.definition}</p>
          <blockquote className="vocab-quote">{card.textbookQuote}</blockquote>
        </div>

        <div className="vocab-quiz-box">
          <span className="q-tag">용어 확인 문제</span>
          <p className="vocab-q-text">{card.question}</p>

          <div className="vocab-choices">
            {card.choices.map((c, idx) => (
              <button
                key={idx}
                className={`choice-card-v2 ${selected !== null ? (idx === card.correctAnswer ? "correct" : selected === idx ? "wrong" : "") : ""}`}
                disabled={selected !== null}
                onClick={() => handleAnswer(idx)}
              >
                <span className="choice-num-badge">{idx + 1}</span>
                <span className="choice-text-body">{c}</span>
              </button>
            ))}
          </div>

          {selected !== null && (
            <button
              className="primary-button full-button"
              style={{ marginTop: "14px" }}
              onClick={() => {
                setSelected(null);
                if (currentIdx < unit1VocabCards.length - 1) setCurrentIdx(currentIdx + 1);
                else onBack();
              }}
            >
              {currentIdx < unit1VocabCards.length - 1 ? "다음 용어로 >" : "학습실 완료"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillLabTrainingView({
  save,
  setSave,
  onBack,
}: {
  save: SaveData;
  setSave: React.Dispatch<React.SetStateAction<SaveData>>;
  onBack: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const card = unit1SkillTrainings[currentIdx];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const score = card.options[idx].score;
    void audioManager.playSfx(score === 100 ? "success" : "ui_click");

    setSave((prev) => ({
      ...prev,
      skillLabScore: {
        ...prev.skillLabScore,
        skillScore: prev.skillLabScore.skillScore + score,
        skillLevel: Math.floor((prev.skillLabScore.skillScore + score) / 150) + 1,
      },
    }));
  };

  return (
    <div className="skill-lab-view-container">
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack}><ArrowLeft size={20} /></button>
          <div>
            <span>탐구력 향상 랩 · 탐구기능 연습실</span>
            <strong>{card.skillType}: {card.title} ({currentIdx + 1}/{unit1SkillTrainings.length})</strong>
          </div>
          <span className="level-chip">Lv.{save.skillLabScore.skillLevel}</span>
        </div>
      </header>

      <div className="skill-lab-scroll">
        <div className="skill-material-box">
          <span className="skill-type-tag">기능 훈련 · {card.skillType}</span>
          <p className="material-text">{card.material}</p>
        </div>

        <div className="task-prompt-box">
          <h3>{card.taskPrompt}</h3>
          <div className="task-options-list">
            {card.options.map((opt, idx) => (
              <button
                key={idx}
                className={`task-option-card ${selected === idx ? "selected" : ""}`}
                disabled={selected !== null}
                onClick={() => handleSelect(idx)}
              >
                <p>{opt.text}</p>
                {selected !== null && (
                  <div className="opt-feedback">
                    <strong>획득 점수: +{opt.score}점</strong>
                    <p>{opt.feedback}</p>
                  </div>
                )}
              </button>
            ))}
          </div>

          {selected !== null && (
            <button
              className="primary-button full-button"
              style={{ marginTop: "14px" }}
              onClick={() => {
                setSelected(null);
                if (currentIdx < unit1SkillTrainings.length - 1) setCurrentIdx(currentIdx + 1);
                else onBack();
              }}
            >
              {currentIdx < unit1SkillTrainings.length - 1 ? "다음 훈련으로 >" : "연습실 완료"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. HINT & FEEDBACK MODALS
// =========================================================================
function HintModal({
  hints,
  currentHintLevel,
  onSelectHint,
  onClose,
}: {
  hints: HintItem[];
  currentHintLevel: number;
  onSelectHint: (lvl: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <section className="hint-modal-panel" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <div className="hint-modal-header">
          <Lightbulb size={28} color="var(--gold)" weight="fill" />
          <div>
            <span>3단계 학습 힌트 시스템</span>
            <h2>문제 해결 힌트 선택</h2>
          </div>
        </div>

        <div className="hints-choice-list">
          {hints.map((h) => (
            <button
              key={h.level}
              className={`hint-option-card ${currentHintLevel >= h.level ? "active" : ""}`}
              onClick={() => onSelectHint(h.level)}
            >
              <div className="hint-card-top">
                <strong>{h.level}단계 힌트</strong>
                <span className="penalty-tag">{h.penalty === 0 ? "감점 없음 (무료)" : `-${h.penalty}점 감점`}</span>
              </div>
              <p>{h.text}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeedbackModal({
  feedback,
  onRetry,
  onClose,
}: {
  feedback: { reason: string; relatedConcept: string; guideText: string };
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <section className="feedback-modal-panel" role="dialog" aria-modal="true">
        <div className="feedback-modal-header">
          <Warning size={28} color="#ff5757" weight="fill" />
          <h2>오답 분석 및 피드백</h2>
        </div>

        <div className="feedback-content-steps">
          <div className="f-step-box">
            <span className="f-step-label">1. 틀린 이유 분석</span>
            <p>{feedback.reason}</p>
          </div>
          <div className="f-step-box">
            <span className="f-step-label">2. 관련 교과서 개념</span>
            <p className="highlight-concept">{feedback.relatedConcept}</p>
          </div>
          <div className="f-step-box">
            <span className="f-step-label">3. 다시 도전 가이드</span>
            <p>{feedback.guideText}</p>
          </div>
        </div>

        <button className="primary-button full-button" onClick={onRetry}>
          개념 확인하고 다시 풀기
        </button>
      </section>
    </div>
  );
}

// =========================================================================
// 7. PORTFOLIO & EVALUATION REPORT MODAL
// =========================================================================
function PortfolioReportModal({
  save,
  evalProfile,
  onClose,
}: {
  save: SaveData;
  evalProfile: any;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <section className="portfolio-modal-panel" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <div className="port-header">
          <ChartBar size={28} color="var(--teal)" weight="duotone" />
          <div>
            <span>수행평가 비계 & 학습 진단</span>
            <h2>통합사회 역량 성취도 리포트</h2>
          </div>
        </div>

        {/* 성취수준 등급 카드 */}
        <div className="rank-summary-card">
          <div className="rank-circle">{evalProfile.overallLevel}</div>
          <div className="rank-info">
            <strong>예상 종합 성취수준: {evalProfile.overallLevel}수준 ({evalProfile.averageScore}점)</strong>
            <p>다양한 판례 자료와 헌법 원리를 분석하여 근거 있는 해결책을 설계함</p>
          </div>
        </div>

        {/* 4대 역량 점수 바 */}
        <div className="competency-bars-grid">
          <div className="c-bar-item">
            <div className="c-bar-top"><span>통합적 사고</span><strong>{evalProfile.competencyScores.integratedThinking}%</strong></div>
            <div className="c-track"><span style={{ width: `${evalProfile.competencyScores.integratedThinking}%` }} /></div>
          </div>
          <div className="c-bar-item">
            <div className="c-bar-top"><span>자료 활용</span><strong>{evalProfile.competencyScores.dataAnalysis}%</strong></div>
            <div className="c-track"><span style={{ width: `${evalProfile.competencyScores.dataAnalysis}%` }} /></div>
          </div>
          <div className="c-bar-item">
            <div className="c-bar-top"><span>의사 결정</span><strong>{evalProfile.competencyScores.decisionMaking}%</strong></div>
            <div className="c-track"><span style={{ width: `${evalProfile.competencyScores.decisionMaking}%` }} /></div>
          </div>
          <div className="c-bar-item">
            <div className="c-bar-top"><span>공동체 역량</span><strong>{evalProfile.competencyScores.communityAction}%</strong></div>
            <div className="c-track"><span style={{ width: `${evalProfile.competencyScores.communityAction}%` }} /></div>
          </div>
        </div>

        {/* 강점 & 보완점 */}
        <div className="strengths-weakness-box">
          <div className="sw-column">
            <span className="sw-tag strength">강점 역량</span>
            <ul>{evalProfile.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
          </div>
          <div className="sw-column">
            <span className="sw-tag weakness">보완할 역량</span>
            <ul>{evalProfile.improvements.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul>
          </div>
        </div>

        {/* 누적된 수행평가 초안 리스트 */}
        <div className="saved-drafts-section">
          <h3>📄 누적된 수행평가 과제 초안 ({save.portfolioDrafts.length}건)</h3>
          <div className="drafts-scroll-list">
            {save.portfolioDrafts.map((d) => (
              <div key={d.id} className="draft-entry-card">
                <strong>{d.missionTitle}</strong>
                <pre>{d.draftText}</pre>
                <small>저장일: {d.savedAt}</small>
              </div>
            ))}
          </div>
        </div>

        <button className="secondary-button full-button" onClick={() => window.print()} style={{ marginTop: "12px" }}>
          <Printer size={16} /> 리포트 인쇄 / PDF 저장
        </button>
      </section>
    </div>
  );
}

// =========================================================================
// 8. OTHER AUXILIARY MODALS
// =========================================================================
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
    const res = authenticateUser(userId, password);
    if (!res.success || !res.profile) {
      setError(res.error || "로그인 실패");
      return;
    }
    onLoginSuccess(res.profile, res.mustChangePassword);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <section className="login-modal-panel" role="dialog">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2>{currentProfile?.isLoggedIn ? "계정 정보" : "로그인"}</h2>
        {currentProfile?.isLoggedIn ? (
          <div className="logged-in-profile-box">
            <p><strong>{currentProfile.name}</strong> ({currentProfile.studentId})</p>
            <p>{currentProfile.schoolName} {currentProfile.grade} {currentProfile.classNum} {currentProfile.studentNum}</p>
            <div className="button-row" style={{ marginTop: "14px" }}>
              <button className="secondary-button" onClick={onOpenPasswordModal}>비밀번호 변경</button>
              <button className="text-button" onClick={() => { onLogout(); onClose(); }}>로그아웃</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            {error && <p className="login-error-alert">{error}</p>}
            <input type="text" placeholder="SC학급번호" value={userId} onChange={(e) => setUserId(e.target.value.toUpperCase())} required />
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginTop: "8px" }} />
            <button type="submit" className="primary-button full-button" style={{ marginTop: "12px" }}>로그인</button>
          </form>
        )}
      </section>
    </div>
  );
}

function PasswordChangeModal({
  profile,
  onSuccess,
  onClose,
}: {
  profile: StudentProfile;
  onSuccess: (p: StudentProfile) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) { setErr("비밀번호 불일치"); return; }
    const ok = changeUserPassword(profile.studentId, pw, name.trim());
    if (ok) onSuccess({ ...profile, name: name.trim(), password: pw, mustChangePassword: false });
  };

  return (
    <div className="modal-backdrop">
      <section className="password-modal-panel">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2>비밀번호 및 실명 설정</h2>
        {err && <p className="login-error-alert">{err}</p>}
        <form onSubmit={handleSubmit}>
          <label>학생 실명</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          <label style={{ marginTop: "8px" }}>새 비밀번호</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          <label style={{ marginTop: "8px" }}>비밀번호 확인</label>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          <button type="submit" className="primary-button full-button" style={{ marginTop: "14px" }}>저장</button>
        </form>
      </section>
    </div>
  );
}

function TeacherDashboardModal({
  save,
  onClose,
  onPrintCert,
}: {
  save: SaveData;
  onClose: () => void;
  onPrintCert: (uId: number) => void;
}) {
  const accounts = useMemo(() => loadAccounts(), []);
  return (
    <div className="modal-backdrop">
      <section className="teacher-dash-panel">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2>교과 지도교사 전용 대시보드</h2>
        <p>안산강서고 1학년 학생 계정 관리 및 1단원 임명증 서식 인쇄</p>
        <div className="teacher-quick-stats">
          <div className="t-stat-card"><strong>12개 반</strong><span>편성 학급</span></div>
          <div className="t-stat-card"><strong>{Object.keys(accounts).length}개</strong><span>계정</span></div>
        </div>
        <button className="primary-button full-button" onClick={() => onPrintCert(1)} style={{ marginTop: "14px" }}>
          1단원 정식 인권수호관 임명증 서식 인쇄
        </button>
      </section>
    </div>
  );
}

function CertificateModal({
  save,
  unitId,
  onClose,
}: {
  save: SaveData;
  unitId: number;
  onClose: () => void;
}) {
  const student = save.studentProfile;
  const cert = unitCertificates.find((c) => c.unitId === unitId) || unitCertificates[0];
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }, []);

  return (
    <div className="modal-backdrop cert-backdrop">
      <div className="cert-modal-container">
        <div className="cert-toolbar no-print">
          <button className="primary-button" onClick={() => window.print()}><Printer size={18} /> PDF 인쇄 / 다운로드</button>
          <button className="secondary-button" onClick={onClose}><X size={18} /> 닫기</button>
        </div>
        <section className="certificate-document">
          <div className="cert-inner-frame">
            <span className="cert-number">제 2026-ARCA-U{unitId}-{student.studentId}호</span>
            <div className="cert-emblem-wrapper"><span className="cert-gold-crest">{cert.badgeIcon}</span></div>
            <h1 className="cert-main-title">{cert.certName}</h1>
            <p className="cert-sub-title">{cert.certSubtitle}</p>
            <div className="cert-recipient-box">
              <p>소 속: {student.schoolName} {student.grade} {student.classNum} {student.studentNum} ({student.studentId})</p>
              <p>성 명: <strong>{student.name}</strong></p>
            </div>
            <p className="cert-body-text">{cert.description}</p>
            <div className="cert-footer">
              <p className="cert-date">{todayStr}</p>
              <strong>안산강서고등학교 통합사회과 탐구아케이드 인권수호국장</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ComingSoonModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="coming-soon-popup">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <Sparkle size={36} color="var(--gold)" weight="fill" />
        <h2>COMING SOON</h2>
        <p>{message}</p>
        <button className="primary-button full-button" onClick={onClose}>확인</button>
      </section>
    </div>
  );
}

function SettingsPanelModal({ audio, onChange, onClose }: any) {
  return (
    <div className="modal-backdrop">
      <section className="settings-panel">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2><Gear size={22} /> 게임 설정</h2>
        <label className="toggle-row">
          <span>{audio.bgm ? <Headphones size={21} /> : <SpeakerSlash size={21} />} BGM</span>
          <input type="checkbox" checked={audio.bgm} onChange={(e) => onChange({ bgm: e.target.checked })} />
        </label>
        <label className="toggle-row">
          <span>{audio.sfx ? <SpeakerHigh size={21} /> : <SpeakerSlash size={21} />} 효과음</span>
          <input type="checkbox" checked={audio.sfx} onChange={(e) => onChange({ sfx: e.target.checked })} />
        </label>
      </section>
    </div>
  );
}

function GameIntroductionModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="game-introduction">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        <h2>통합사회 탐구 아케이드 가이드</h2>
        <p>1단원 인권 보장과 헌법의 5대 게임 모드와 탐구력 향상 랩을 플레이하며 수행평가 역량을 완성하는 교육용 플랫폼입니다.</p>
        <button className="primary-button full-button" onClick={onClose}>탐구 시작하기</button>
      </section>
    </div>
  );
}
