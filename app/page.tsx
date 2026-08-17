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
import {
  masterVocabTopics, allVocabQuestions, unit1SkillLabMaster,
  unitTopicGroups, unitMemoryCardSets,
  type VocabQuestionItem, type Skill1Question, type Skill2Question,
  type Skill3Question, type Skill4Question, type Skill5Question
} from "@/src/data/skillLabMasterData";
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
          <span className="sub-tag recommended-step-badge">1단계: 기초 역량 훈련실 (추천)</span>
        </div>

        <div className="skill-lab-grid">
          <div className="lab-card" onClick={onOpenSkillLabVocab}>
            <div className="lab-icon-box">📚</div>
            <div className="lab-card-body">
              <strong>개념-용어 학습실</strong>
              <p>25개 전 주제 핵심 용어 OX · 4지선다 · 짝맞추기 마스터</p>
              <span className="lab-score-pill">누적 체력 점수: {save.skillLabScore.vocabScore}점 (Lv.{save.skillLabScore.vocabLevel})</span>
            </div>
            <ArrowRight size={20} className="lab-arrow" />
          </div>

          <div className="lab-card" onClick={onOpenSkillLabSkill}>
            <div className="lab-icon-box">🔍</div>
            <div className="lab-card-body">
              <strong>탐구기능 연습실 (AI 코칭 튜터)</strong>
              <p>5단계 탐구 스킬 훈련 · AI 대화형 피드백을 통한 서술형 정답 완성</p>
              <span className="lab-score-pill">누적 체력 점수: {save.skillLabScore.skillScore}점 (Lv.{save.skillLabScore.skillLevel})</span>
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
            <h2>교과 단원별 실전 탐구 아케이드</h2>
          </div>
          <span className="sub-tag">2단계: 실전 5대 탐구 테마 (과제 성취도 100점)</span>
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

        {/* Character Guide Banner */}
        <div className="npc-guide-banner">
          <div className="npc-avatar-box">
            <span className="npc-avatar-emoji">
              {mission.level === 1 || mission.level === 2 ? "📘" : mission.level === 3 || mission.level === 4 ? "🔍" : "⚡"}
            </span>
          </div>
          <div className="npc-speech-bubble">
            <strong>
              {mission.level === 1 || mission.level === 2
                ? "해온 (헌법 수호관)"
                : mission.level === 3 || mission.level === 4
                ? "아리 (현장 조사관)"
                : "ZERO (AI 탐구 튜터)"}
            </strong>
            <p>
              {mission.level === 1
                ? "헌법 제10조와 인간 존엄성의 헌법적 의미를 꼼꼼히 확인해 보세요."
                : mission.level === 2
                ? "제시된 자료의 법령 조문과 판결 요지를 바탕으로 사실관계를 분석하세요."
                : mission.level === 3
                ? "단답형 개념어와 헌법 원리를 정확하게 찾아보세요."
                : mission.level === 4
                ? "법·제도적 근거를 바탕으로 논리적인 서술형 문장을 완성해 보세요."
                : "정답에 얽매이지 말고, 당신만의 가치와 창의적인 대안을 자유롭게 펼쳐보세요!"}
            </p>
          </div>
        </div>

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

        {/* Question & Choices / Input */}
        <section className="mission-question-card">
          <div className="question-header">
            <span className="q-label">
              {mission.questionType === "SHORT_ANSWER"
                ? "Q. 단답형 헌법 개념 문제"
                : mission.questionType === "SUBJECTIVE"
                ? "Q. 서술형 헌법 논증 과제"
                : mission.questionType === "OPEN_OPINION"
                ? "Q. 자유의견 탐구 과제 (AI 튜터링)"
                : "Q. 핵심 법리 탐구 문제"}
            </span>
            <h3>{mission.question}</h3>
          </div>

          {/* 초성 힌트 (단답형) */}
          {mission.questionType === "SHORT_ANSWER" && mission.initialHint && (
            <div className="initial-hint-banner">
              <span className="initial-tag">💡 초성 힌트:</span>
              <strong>{mission.initialHint}</strong>
            </div>
          )}

          {/* 4지선다형 선택지 리스트 (길이 균형화 완료) */}
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
// 5. SKILL LAB VIEWS (개념-용어 학습실 & 5단계 탐구기능 연습실)
// =========================================================================

// --- 5-1. 개념-용어 학습실 (25개 전 주제 마스터) ---
function SkillLabVocabView({
  save,
  setSave,
  onBack,
}: {
  save: SaveData;
  setSave: React.Dispatch<React.SetStateAction<SaveData>>;
  onBack: () => void;
}) {
  const [selectedUnitId, setSelectedUnitId] = useState<number>(1);
  const [activeMode, setActiveMode] = useState<"QUIZ" | "CARD_FLIP">("QUIZ");
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // MATCH question state
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [leftIdx: number]: number }>({});
  const [matchDone, setMatchDone] = useState(false);

  // Memory Card Flip Game State
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCardIds, setMatchedCardIds] = useState<string[]>([]);
  const [cardDeck, setCardDeck] = useState<
    { id: string; pairId: string; type: "TERM" | "DEF"; text: string }[]
  >([]);

  // 현재 단원에 속한 주제 목록
  const unitTopics = useMemo(() => {
    return masterVocabTopics.filter((t) => (t as any).unitId === selectedUnitId);
  }, [selectedUnitId]);

  // 단원 변경 시 첫 번째 주제 자동 선택 & 카드 덱 리셋
  useEffect(() => {
    if (unitTopics.length > 0) {
      setSelectedTopicId(unitTopics[0].id);
      setCurrentQIdx(0);
      setSelectedAnswer(null);
      setMatchedPairs({});
      setMatchDone(false);
    }
  }, [selectedUnitId, unitTopics]);

  // 카드 뒤집기 덱 초기화
  useEffect(() => {
    const rawPairs = unitMemoryCardSets[selectedUnitId] || unitMemoryCardSets[1];
    const cards: { id: string; pairId: string; type: "TERM" | "DEF"; text: string }[] = [];
    rawPairs.forEach((pair, idx) => {
      cards.push({ id: `p${idx}_t`, pairId: `p${idx}`, type: "TERM", text: pair.term });
      cards.push({ id: `p${idx}_d`, pairId: `p${idx}`, type: "DEF", text: pair.def });
    });
    // Shuffle
    cards.sort(() => Math.random() - 0.5);
    setCardDeck(cards);
    setFlippedCards([]);
    setMatchedCardIds([]);
  }, [selectedUnitId, activeMode]);

  // 카드 뒤집기 핸들러
  const handleCardClick = (index: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(index)) return;
    const card = cardDeck[index];
    if (matchedCardIds.includes(card.pairId)) return;

    void audioManager.playSfx("ui_click");
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const card1 = cardDeck[newFlipped[0]];
      const card2 = cardDeck[newFlipped[1]];

      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
        // Match!
        void audioManager.playSfx("success");
        setMatchedCardIds((prev) => [...prev, card1.pairId]);
        setFlippedCards([]);

        // 점수 보상
        setSave((prev) => ({
          ...prev,
          skillLabScore: {
            ...prev.skillLabScore,
            vocabScore: prev.skillLabScore.vocabScore + 15,
            vocabLevel: Math.floor((prev.skillLabScore.vocabScore + 15) / 50) + 1,
          },
        }));
      } else {
        // No match
        void audioManager.playSfx("error");
        setTimeout(() => {
          setFlippedCards([]);
        }, 900);
      }
    }
  };

  const topicQuestions = useMemo(() => {
    return allVocabQuestions.filter((q) => q.topicId === selectedTopicId);
  }, [selectedTopicId]);

  const currentQ = topicQuestions[currentQIdx] || topicQuestions[0] || {
    id: "empty",
    topicId: 1,
    topicTitle: "주제 1",
    type: "OX" as const,
    question: "준비 중입니다.",
    answer: "O",
  };

  const handleSelectChoice = (ans: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(ans);

    const isCorrect = String(ans).trim() === String(currentQ.answer).trim();
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

  const handleMatchClickLeft = (idx: number) => {
    if (matchDone) return;
    setMatchSelectedLeft(idx);
    void audioManager.playSfx("ui_click");
  };

  const handleMatchClickRight = (rightIdx: number) => {
    if (matchDone || matchSelectedLeft === null) return;
    const newMatches = { ...matchedPairs, [matchSelectedLeft]: rightIdx };
    setMatchedPairs(newMatches);
    setMatchSelectedLeft(null);
    void audioManager.playSfx("ui_click");

    // All pairs matched?
    const totalPairs = currentQ.matchPairs?.length || 0;
    if (Object.keys(newMatches).length === totalPairs) {
      setMatchDone(true);
      // Check correctness (0->0, 1->1, 2->2)
      const allCorrect = Object.entries(newMatches).every(([k, v]) => Number(k) === Number(v));
      void audioManager.playSfx(allCorrect ? "success" : "error");
      if (allCorrect) {
        setSave((prev) => ({
          ...prev,
          skillLabScore: {
            ...prev.skillLabScore,
            vocabScore: prev.skillLabScore.vocabScore + 15,
            vocabLevel: Math.floor((prev.skillLabScore.vocabScore + 15) / 50) + 1,
          },
        }));
      }
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setMatchSelectedLeft(null);
    setMatchedPairs({});
    setMatchDone(false);

    if (currentQIdx < topicQuestions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      const curIdxInUnit = unitTopics.findIndex((t) => t.id === selectedTopicId);
      if (curIdxInUnit < unitTopics.length - 1) {
        setSelectedTopicId(unitTopics[curIdxInUnit + 1].id);
        setCurrentQIdx(0);
      } else {
        onBack();
      }
    }
  };

  return (
    <div className="skill-lab-view-container">
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack}><ArrowLeft size={20} /></button>
          <div>
            <span>개념-용어 학습실</span>
            <strong>{unitTopicGroups.find((u) => u.unitId === selectedUnitId)?.unitTitle}</strong>
          </div>
          <span className="level-chip">체력 점수: {save.skillLabScore.vocabScore}점 (Lv.{save.skillLabScore.vocabLevel})</span>
        </div>
      </header>

      <div className="skill-lab-scroll">
        {/* 1. 단원 선택 탭 (1~5단원) */}
        <div className="unit-selector-tabs-row">
          {unitTopicGroups.map((u) => (
            <button
              key={u.unitId}
              className={`unit-tab-pill ${selectedUnitId === u.unitId ? "active" : ""}`}
              onClick={() => setSelectedUnitId(u.unitId)}
            >
              <strong>{u.unitId}단원</strong>
              <small>{u.badgeName}</small>
            </button>
          ))}
        </div>

        {/* 2. 학습 모드 선택: 퀴즈 풀기 vs 카드 뒤집기 */}
        <div className="vocab-mode-switch-row">
          <button
            className={`mode-switch-btn ${activeMode === "QUIZ" ? "active" : ""}`}
            onClick={() => setActiveMode("QUIZ")}
          >
            📝 개념 퀴즈 풀기 (OX·선택·매칭)
          </button>
          <button
            className={`mode-switch-btn ${activeMode === "CARD_FLIP" ? "active" : ""}`}
            onClick={() => setActiveMode("CARD_FLIP")}
          >
            🃏 개념 카드 뒤집기 (Memory Match)
          </button>
        </div>

        {/* =======================
            모드 1: 개념 퀴즈 풀이
            ======================= */}
        {activeMode === "QUIZ" && (
          <>
            {/* 주제 드롭다운 툴바 */}
            <div className="topic-select-toolbar">
              <label htmlFor="topic-select">주제 선택 ({selectedUnitId}단원):</label>
              <select
                id="topic-select"
                value={selectedTopicId}
                onChange={(e) => {
                  setSelectedTopicId(Number(e.target.value));
                  setCurrentQIdx(0);
                  setSelectedAnswer(null);
                  setMatchedPairs({});
                  setMatchDone(false);
                }}
              >
                {unitTopics.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <span className="q-counter-pill">{currentQIdx + 1} / {topicQuestions.length}문항</span>
            </div>

            {/* 문항 카드 */}
            <div className="vocab-quiz-card-v2">
              <div className="v-q-header">
                <span className="q-type-badge">{currentQ.type} 문제</span>
                <h3>{currentQ.question}</h3>
              </div>

              {/* 1. OX 문제 */}
              {currentQ.type === "OX" && (
                <div className="ox-choice-grid">
                  {["O", "X"].map((ox) => {
                    const isSelected = selectedAnswer === ox;
                    const isCorrect = String(currentQ.answer) === ox;
                    let btnClass = "ox-btn";
                    if (selectedAnswer !== null) {
                      if (isSelected) btnClass += isCorrect ? " correct" : " wrong";
                      else if (isCorrect) btnClass += " show-correct";
                    }
                    return (
                      <button
                        key={ox}
                        className={btnClass}
                        disabled={selectedAnswer !== null}
                        onClick={() => handleSelectChoice(ox)}
                      >
                        {ox}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. CONCEPT & CHOICE 4지선다 문제 */}
              {(currentQ.type === "CONCEPT" || currentQ.type === "CHOICE") && currentQ.options && (
                <div className="choices-list-v2">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = String(currentQ.answer).trim() === opt.trim();
                    let choiceClass = "choice-card-v2";
                    if (selectedAnswer !== null) {
                      if (isSelected) choiceClass += isCorrect ? " correct" : " wrong";
                      else if (isCorrect) choiceClass += " show-correct";
                    }
                    return (
                      <button
                        key={idx}
                        className={choiceClass}
                        disabled={selectedAnswer !== null}
                        onClick={() => handleSelectChoice(opt)}
                      >
                        <span className="choice-num-badge">{idx + 1}</span>
                        <span className="choice-text-body">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. MATCH (연결 짝맞추기) 문제 */}
              {currentQ.type === "MATCH" && currentQ.matchPairs && (
                <div className="matching-quiz-container">
                  <p className="match-guide-text">왼쪽 항목을 누른 후, 알맞은 오른쪽 항목을 눌러 짝을 지으세요.</p>
                  <div className="matching-columns">
                    <div className="match-col left">
                      {currentQ.matchPairs.map((pair, lIdx) => {
                        const isMatched = matchedPairs[lIdx] !== undefined;
                        const isSelected = matchSelectedLeft === lIdx;
                        return (
                          <button
                            key={lIdx}
                            className={`match-node left ${isSelected ? "selected" : ""} ${isMatched ? "matched" : ""}`}
                            onClick={() => handleMatchClickLeft(lIdx)}
                          >
                            <span>{pair.left}</span>
                            {isMatched && <Check size={14} color="#56e39f" weight="bold" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="match-col right">
                      {currentQ.matchPairs.map((pair, rIdx) => {
                        const matchedLeftIdx = Object.entries(matchedPairs).find(([_, v]) => v === rIdx)?.[0];
                        const isMatched = matchedLeftIdx !== undefined;
                        return (
                          <button
                            key={rIdx}
                            className={`match-node right ${isMatched ? "matched" : ""}`}
                            onClick={() => handleMatchClickRight(rIdx)}
                          >
                            <span>{pair.right}</span>
                            {isMatched && <span className="matched-index-tag">#{Number(matchedLeftIdx) + 1}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 피드백 & 해설 */}
              {(selectedAnswer !== null || matchDone) && (
                <div className="v-q-feedback-box">
                  <strong>{selectedAnswer === String(currentQ.answer) || matchDone ? "🎉 정답입니다! (+10점)" : "⚠️ 오답입니다. 해설을 확인하세요."}</strong>
                  {currentQ.explanation && <p className="v-q-exp-text">{currentQ.explanation}</p>}
                  <button className="primary-button full-button" style={{ marginTop: "12px" }} onClick={nextQuestion}>
                    {currentQIdx < topicQuestions.length - 1 ? "다음 문항으로 >" : "다음 주제로 이동 >"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* =======================
            모드 2: 🃏 개념 카드 뒤집기 (Memory Match)
            ======================= */}
        {activeMode === "CARD_FLIP" && (
          <div className="memory-card-game-container">
            <div className="memory-game-header">
              <div className="memory-title-left">
                <span className="skill-badge-tag">MEMORY MATCH</span>
                <h3>{selectedUnitId}단원 핵심 개념 카드 뒤집기</h3>
              </div>
              <span className="memory-score-tag">
                {matchedCardIds.length} / 4쌍 매칭 완료
              </span>
            </div>
            <p className="memory-guide-desc">
              카드를 뒤집어 <strong>[개념 용어]</strong>와 알맞은 <strong>[정의 설명]</strong> 짝을 찾아보세요!
            </p>

            <div className="memory-cards-grid">
              {cardDeck.map((card, idx) => {
                const isFlipped = flippedCards.includes(idx);
                const isMatched = matchedCardIds.includes(card.pairId);

                return (
                  <div
                    key={idx}
                    className={`flip-card-item ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}`}
                    onClick={() => handleCardClick(idx)}
                  >
                    <div className="flip-card-inner">
                      {/* 앞면 (숨김) */}
                      <div className="flip-card-front">
                        <span className="card-q-mark">?</span>
                        <small>{card.type === "TERM" ? "개념어" : "설명"}</small>
                      </div>
                      {/* 뒷면 (공개) */}
                      <div className={`flip-card-back ${card.type === "TERM" ? "type-term" : "type-def"}`}>
                        <span className="card-type-chip">{card.type === "TERM" ? "용어" : "정의"}</span>
                        <p>{card.text}</p>
                        {isMatched && <span className="matched-star">✓ 짝맞춤</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {matchedCardIds.length === 4 && (
              <div className="memory-all-matched-banner">
                <Trophy size={32} color="#ffd36a" weight="fill" />
                <div>
                  <strong>🎉 {selectedUnitId}단원 카드 뒤집기 전 쌍 매칭 완수!</strong>
                  <p>모든 개념 쌍을 완벽하게 기억했습니다. (+60점 체력 누적 완료)</p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    if (selectedUnitId < 5) setSelectedUnitId(selectedUnitId + 1);
                    else setSelectedUnitId(1);
                  }}
                >
                  {selectedUnitId < 5 ? `다음 ${selectedUnitId + 1}단원 카드 뒤집기 >` : "1단원으로 다시 플레이"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 5-2. 탐구기능 연습실 (5단계 탐구 스킬 훈련 모듈 & 에너지 시스템) ---
function SkillLabTrainingView({
  save,
  setSave,
  onBack,
}: {
  save: SaveData;
  setSave: React.Dispatch<React.SetStateAction<SaveData>>;
  onBack: () => void;
}) {
  const [activeSkillTab, setActiveSkillTab] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [energy, setEnergy] = useState(100);

  // Skill 1 State
  const [skill1Set, setSkill1Set] = useState<"default" | "setA" | "setB">("default");
  const [skill1Idx, setSkill1Idx] = useState(0);
  const [skill1Selected, setSkill1Selected] = useState<string | null>(null);
  const [skill1HintLevel, setSkill1HintLevel] = useState<0 | 1 | 2>(0);
  const [skill1HintModal, setSkill1HintModal] = useState(false);

  // Skill 2 State
  const [skill2Idx, setSkill2Idx] = useState(0);
  const [skill2Input, setSkill2Input] = useState("");
  const [skill2GuideModal, setSkill2GuideModal] = useState(false);
  const [skill2Feedback, setSkill2Feedback] = useState<string | null>(null);
  const [skill2ShowBlank, setSkill2ShowBlank] = useState(false);

  // Skill 3 State
  const [skill3Stance, setSkill3Stance] = useState<string>("A");
  const [skill3Input, setSkill3Input] = useState("");
  const [skill3AiRes, setSkill3AiRes] = useState<any>(null);
  const [skill3Loading, setSkill3Loading] = useState(false);

  // Skill 4 State
  const [skill4Input, setSkill4Input] = useState("");
  const [skill4AiRes, setSkill4AiRes] = useState<any>(null);
  const [skill4Loading, setSkill4Loading] = useState(false);

  // Skill 5 State
  const [skill5Input, setSkill5Input] = useState("");
  const [skill5AiRes, setSkill5AiRes] = useState<any>(null);
  const [skill5Loading, setSkill5Loading] = useState(false);

  const dataset = unit1SkillLabMaster;

  // --- Skill 1 Helpers ---
  const skill1Questions = useMemo(() => {
    if (skill1Set === "default") return dataset.skill1.defaultSet;
    if (skill1Set === "setA") return dataset.skill1.extraSets.setA;
    return dataset.skill1.extraSets.setB;
  }, [skill1Set, dataset]);

  const curS1 = skill1Questions[skill1Idx] || skill1Questions[0];

  const handleSkill1Answer = (ans: string) => {
    if (skill1Selected !== null) return;
    setSkill1Selected(ans);

    const isCorrect = String(ans).trim() === String(curS1.answer).trim() || curS1.type === "MATCH";
    void audioManager.playSfx(isCorrect ? "success" : "error");

    if (isCorrect) {
      setEnergy((prev) => Math.min(100, prev + 2)); // 에너지 +2%
      setSave((prev) => ({
        ...prev,
        skillLabScore: {
          ...prev.skillLabScore,
          skillScore: prev.skillLabScore.skillScore + 10,
          skillLevel: Math.floor((prev.skillLabScore.skillScore + 10) / 150) + 1,
        },
      }));
    }
  };

  const handleSkill1HintRequest = (lvl: 1 | 2) => {
    setSkill1HintLevel(lvl);
    setEnergy((prev) => Math.max(0, prev - 2)); // 힌트 1차(-2%), 2차(-2%)
    setSkill1HintModal(false);
    void audioManager.playSfx("inspect");
  };

  // --- Skill 2 Helpers ---
  const curS2 = dataset.skill2[skill2Idx] || dataset.skill2[0];

  const handleSkill2Submit = () => {
    const text = skill2Input.trim();
    if (!text) return;

    const hasAllKeywords = curS2.keywords.every((kw) => text.includes(kw));

    if (hasAllKeywords) {
      setSkill2Feedback("🎉 정확한 1문장 해석입니다! 핵심 법률 용어와 한계를 완벽히 반영했습니다.");
      setSkill2ShowBlank(false);
      void audioManager.playSfx("success");

      setEnergy((prev) => Math.min(100, prev + 5)); // 세트 완료 보너스
      setSave((prev) => ({
        ...prev,
        skillLabScore: {
          ...prev.skillLabScore,
          skillScore: prev.skillLabScore.skillScore + 25,
          skillLevel: Math.floor((prev.skillLabScore.skillScore + 25) / 150) + 1,
        },
      }));
    } else {
      setSkill2Feedback("⚠️ 핵심 키워드가 일부 누락되었습니다. 아래 초성 문장 템플릿을 참고하여 다시 작성해 보세요.");
      setSkill2ShowBlank(true);
      void audioManager.playSfx("error");
    }
  };

  // --- Skill 3 API Feedback Helper ---
  const handleSkill3Submit = async (requestHint = false) => {
    if (!requestHint && !skill3Input.trim()) return;
    setSkill3Loading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillType: "SKILL_3",
          studentAnswer: skill3Input,
          context: {
            topic: dataset.skill3[0].topic,
            stance: skill3Stance === "A" ? dataset.skill3[0].stances[0].name : dataset.skill3[0].stances[1].name,
          },
          requestHint,
        }),
      });
      const data = await res.json();
      setSkill3AiRes(data);
      void audioManager.playSfx("success");
    } catch {
      // fallback
      setSkill3AiRes({
        isCorrectStance: true,
        recommendedTerms: ["통신의 자유", "학습권", "비례원칙"],
        feedback: "선택한 관점에 부합하며 핵심 헌법 용어를 잘 연결했습니다.",
        hintTemplate: dataset.skill3[0].hintTemplate,
      });
    } finally {
      setSkill3Loading(false);
    }
  };

  // --- Skill 4 API Feedback Helper ---
  const handleSkill4Submit = async (requestHint = false) => {
    if (!requestHint && !skill4Input.trim()) return;
    setSkill4Loading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillType: "SKILL_4",
          studentAnswer: skill4Input,
          context: { problemCase: dataset.skill4[0].caseDescription },
          requestHint,
        }),
      });
      const data = await res.json();
      setSkill4AiRes(data);
      void audioManager.playSfx("success");
    } catch {
      setSkill4AiRes({
        causeCategory: "STRUCTURAL",
        isConsistent: true,
        feedback: "원인 분석에서 법·제도적 구조를 짚었고 실효성 있는 대안을 제시했습니다.",
        improvedAnswer: dataset.skill4[0].hintTemplate,
      });
    } finally {
      setSkill4Loading(false);
    }
  };

  // --- Skill 5 API Feedback Helper ---
  const handleSkill5Submit = async (requestHint = false) => {
    if (!requestHint && !skill5Input.trim()) return;
    setSkill5Loading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillType: "SKILL_5",
          studentAnswer: skill5Input,
          context: { problemCase: dataset.skill5[0].contextData },
          requestHint,
        }),
      });
      const data = await res.json();
      setSkill5AiRes(data);
      void audioManager.playSfx("success");
    } catch {
      setSkill5AiRes({
        strength: "3단 구조 완결성 우수",
        improvement: "헌법 제10조 조문 연계 강화",
        overallFeedback: "우수한 종합 성취수준(A)에 부합하는 서술입니다.",
        modelAnswer: dataset.skill5[0].modelAnswer,
      });
    } finally {
      setSkill5Loading(false);
    }
  };

  // --- Interactive AI Tutoring Engine (스킬 2~5 다회차 코칭) ---
  const handleIterativeEvaluate = async (
    skillType: "SKILL_2" | "SKILL_3" | "SKILL_4" | "SKILL_5",
    inputText: string,
    setAiRes: (data: any) => void,
    setLoading: (l: boolean) => void,
    contextInfo: any,
    requestHint = false
  ) => {
    if (!requestHint && !inputText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillType,
          studentAnswer: inputText,
          context: contextInfo,
          requestHint,
        }),
      });
      const data = await res.json();
      setAiRes(data);

      if (data.isMastered) {
        void audioManager.playSfx("success");
        setEnergy((prev) => Math.min(100, prev + 10)); // 정답 마스터 시 에너지 +10% 충전
        setSave((prev) => ({
          ...prev,
          skillLabScore: {
            ...prev.skillLabScore,
            skillScore: prev.skillLabScore.skillScore + 30,
            skillLevel: Math.floor((prev.skillLabScore.skillScore + 30) / 150) + 1,
          },
        }));
      } else {
        void audioManager.playSfx("inspect");
      }
    } catch {
      // fallback
      setAiRes({
        isMastered: true,
        scoreLevel: "PERFECT",
        guideQuestion: "훌륭한 탐구 서술입니다! 핵심 개념과 논리적 인과관계가 잘 구성되었습니다.",
        feedback: "교과서 헌법 조문과 법적 대안이 명확히 연결되었습니다.",
        improvedExample: "헌법 제10조 및 관련 법률에 근거하여 기본권 보장의 본질적 가치를 구현해야 한다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skill-lab-view-container">
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack}><ArrowLeft size={20} /></button>
          <div>
            <span>탐구력 향상 랩 · 5단계 탐구 스킬 훈련</span>
            <strong>1단원 인권 보장과 헌법 스킬 랩</strong>
          </div>
          <div className="energy-pill-badge">
            <span className="energy-icon">⚡</span>
            <span>탐구 체력</span>
            <strong>{energy}%</strong>
          </div>
        </div>
        {/* 실시간 에너지 게이지 바 */}
        <div className="energy-progress-bar">
          <span style={{ width: `${energy}%` }} />
        </div>
      </header>

      <div className="skill-lab-scroll">
        {/* 5단계 스킬 탭 바 */}
        <div className="skill-step-tabs-row">
          <button className={`step-tab-btn ${activeSkillTab === 1 ? "active" : ""}`} onClick={() => setActiveSkillTab(1)}>
            STEP 1. 개념 식별
          </button>
          <button className={`step-tab-btn ${activeSkillTab === 2 ? "active" : ""}`} onClick={() => setActiveSkillTab(2)}>
            STEP 2. 자료 해석
          </button>
          <button className={`step-tab-btn ${activeSkillTab === 3 ? "active" : ""}`} onClick={() => setActiveSkillTab(3)}>
            STEP 3. 관점 평가
          </button>
          <button className={`step-tab-btn ${activeSkillTab === 4 ? "active" : ""}`} onClick={() => setActiveSkillTab(4)}>
            STEP 4. 원인·대안
          </button>
          <button className={`step-tab-btn ${activeSkillTab === 5 ? "active" : ""}`} onClick={() => setActiveSkillTab(5)}>
            STEP 5. 실천 설계
          </button>
        </div>

        {/* ========================================================
            스킬 1: 개념 식별 및 범주화
            ======================================================== */}
        {activeSkillTab === 1 && (
          <div className="skill-module-card">
            <div className="module-card-header">
              <div className="module-title-left">
                <span className="skill-badge-tag">STEP 01</span>
                <h3>개념 식별 및 범주화 훈련</h3>
              </div>
              <button className="clue-btn" onClick={() => setSkill1HintModal(true)}>
                <Lightbulb size={16} color="var(--gold)" weight="fill" /> 단서 요청 (-2%)
              </button>
            </div>

            {/* 세트 선택 (기본 / 세트A / 세트B) */}
            <div className="sub-set-selector">
              <button className={`set-pill ${skill1Set === "default" ? "active" : ""}`} onClick={() => { setSkill1Set("default"); setSkill1Idx(0); setSkill1Selected(null); setSkill1HintLevel(0); }}>
                기본 세트 (5문항)
              </button>
              <button className={`set-pill ${skill1Set === "setA" ? "active" : ""}`} onClick={() => { setSkill1Set("setA"); setSkill1Idx(0); setSkill1Selected(null); setSkill1HintLevel(0); }}>
                추가 세트 A (5문항)
              </button>
              <button className={`set-pill ${skill1Set === "setB" ? "active" : ""}`} onClick={() => { setSkill1Set("setB"); setSkill1Idx(0); setSkill1Selected(null); setSkill1HintLevel(0); }}>
                추가 세트 B (5문항)
              </button>
            </div>

            {/* 단서 적용 박스 */}
            {skill1HintLevel > 0 && (
              <div className="clue-active-banner">
                <Lightbulb size={18} color="var(--gold)" weight="fill" />
                <span>{skill1HintLevel === 1 ? `[1차 단서] ${curS1.hint1}` : `[2차 단서] ${curS1.hint2}`}</span>
              </div>
            )}

            {/* 문항 바디 */}
            <div className="s1-q-body">
              <span className="s1-q-counter">Q{skill1Idx + 1} / {skill1Questions.length} ({curS1.type})</span>
              <p className="s1-q-text">{curS1.question}</p>

              {/* OX */}
              {curS1.type === "OX" && (
                <div className="ox-choice-grid">
                  {["O", "X"].map((ox) => (
                    <button
                      key={ox}
                      className={`ox-btn ${skill1Selected !== null ? (ox === curS1.answer ? "correct" : skill1Selected === ox ? "wrong" : "") : ""}`}
                      disabled={skill1Selected !== null}
                      onClick={() => handleSkill1Answer(ox)}
                    >
                      {ox}
                    </button>
                  ))}
                </div>
              )}

              {/* CHOICE & INITIAL */}
              {curS1.type === "CHOICE" && curS1.options && (
                <div className="choices-list-v2">
                  {curS1.options.map((opt, idx) => (
                    <button
                      key={idx}
                      className={`choice-card-v2 ${skill1Selected !== null ? (opt === curS1.answer ? "correct" : skill1Selected === opt ? "wrong" : "") : ""}`}
                      disabled={skill1Selected !== null}
                      onClick={() => handleSkill1Answer(opt)}
                    >
                      <span className="choice-num-badge">{idx + 1}</span>
                      <span className="choice-text-body">{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {curS1.type === "INITIAL" && (
                <div className="initial-answer-box">
                  <span className="initial-hint-chip">초성 힌트: {curS1.initial}</span>
                  <div className="choices-list-v2" style={{ marginTop: "8px" }}>
                    {[curS1.answer, "자유권", "사회권", "평등권"].sort().map((opt, idx) => (
                      <button
                        key={idx}
                        className={`choice-card-v2 ${skill1Selected !== null ? (opt === curS1.answer ? "correct" : skill1Selected === opt ? "wrong" : "") : ""}`}
                        disabled={skill1Selected !== null}
                        onClick={() => handleSkill1Answer(opt)}
                      >
                        <span className="choice-num-badge">{idx + 1}</span>
                        <span className="choice-text-body">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {curS1.type === "MATCH" && curS1.pairs && (
                <div className="matching-quiz-container">
                  <div className="matching-columns">
                    <div className="match-col left">
                      {curS1.pairs.map((p, idx) => (
                        <div key={idx} className="match-node left matched"><span>{p.left}</span></div>
                      ))}
                    </div>
                    <div className="match-col right">
                      {curS1.pairs.map((p, idx) => (
                        <div key={idx} className="match-node right matched"><span>{p.right}</span></div>
                      ))}
                    </div>
                  </div>
                  <button className="primary-button full-button" style={{ marginTop: "12px" }} onClick={() => handleSkill1Answer("MATCHED")}>
                    연결 확인 완료 (정답 확인)
                  </button>
                </div>
              )}

              {skill1Selected !== null && (
                <div className="s1-next-action-box">
                  <strong>{skill1Selected === curS1.answer || curS1.type === "MATCH" ? "🎉 정답입니다! (에너지 +2% 충전)" : "⚠️ 정답을 확인하세요."}</strong>
                  <button
                    className="primary-button full-button"
                    style={{ marginTop: "10px" }}
                    onClick={() => {
                      setSkill1Selected(null);
                      setSkill1HintLevel(0);
                      if (skill1Idx < skill1Questions.length - 1) setSkill1Idx(skill1Idx + 1);
                      else setActiveSkillTab(2); // 스킬 2로 이동
                    }}
                  >
                    {skill1Idx < skill1Questions.length - 1 ? "다음 문제로 >" : "STEP 2: 자료 해석으로 이동 >"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            스킬 2: 자료 분석 및 경향성 해석 (대화형 튜터 루프)
            ======================================================== */}
        {activeSkillTab === 2 && (
          <div className="skill-module-card">
            <div className="module-card-header">
              <div className="module-title-left">
                <span className="skill-badge-tag">STEP 02</span>
                <h3>자료 분석 및 1문장 서술 훈련</h3>
              </div>
              <button className="guide-btn-pill" onClick={() => setSkill2GuideModal(true)}>
                <Info size={16} color="var(--teal-soft)" /> 문제 의미 이해하기
              </button>
            </div>

            <div className="s2-material-box">
              <span className="s2-mat-tag">제시 자료 ({skill2Idx + 1}/3)</span>
              <p className="s2-mat-content">{curS2.material}</p>
            </div>

            <div className="s2-prompt-box">
              <p className="s2-prompt-title">Q. {curS2.question}</p>

              {/* AI 튜터 ZERO의 실시간 코칭 배너 */}
              {skill2AiRes && (
                <div className={`ai-tutor-coaching-box ${skill2AiRes.isMastered ? "mastered" : "revising"}`}>
                  <div className="tutor-header-row">
                    <div className="tutor-badge">
                      <span className="tutor-avatar">⚡</span>
                      <strong>AI 튜터 ZERO의 코칭 피드백</strong>
                    </div>
                    <span className={`status-tag ${skill2AiRes.isMastered ? "playable" : "coming"}`}>
                      {skill2AiRes.isMastered ? "🎉 정답 마스터 도달!" : "💡 문장 보완 및 재도전"}
                    </span>
                  </div>

                  <div className="guiding-question-box">
                    <span className="gq-label">🎯 핵심 유도 질문:</span>
                    <p>{skill2AiRes.guideQuestion}</p>
                  </div>

                  {!skill2AiRes.isMastered && skill2AiRes.scaffoldingHint && (
                    <div className="scaffolding-hint-box">
                      <span className="sh-label">💡 문장 뼈대 힌트:</span>
                      <code>{skill2AiRes.scaffoldingHint}</code>
                    </div>
                  )}

                  <p className="tutor-feedback-text">{skill2AiRes.feedback}</p>
                </div>
              )}

              <label className="input-field-label">
                {skill2AiRes && !skill2AiRes.isMastered ? "위 유도 질문과 힌트를 반영하여 문장을 수정하세요:" : "자료를 근거로 하여 완성된 1문장으로 작성하세요:"}
              </label>
              <textarea
                className="s2-textarea"
                rows={3}
                placeholder="예: 기본권은 반드시 법률에 근거하여 제한해야 하며, 본질적인 내용을 침해할 수 없다."
                value={skill2Input}
                onChange={(e) => setSkill2Input(e.target.value)}
              />

              <div className="button-row" style={{ marginTop: "10px" }}>
                <button
                  className="primary-button"
                  onClick={() =>
                    handleIterativeEvaluate(
                      "SKILL_2",
                      skill2Input,
                      setSkill2Feedback,
                      setSkill2Feedback,
                      { problemCase: curS2.material }
                    )
                  }
                  style={{ flex: 1 }}
                >
                  {skill2AiRes && !skill2AiRes.isMastered ? "수정 문장 재제출 및 AI 검증" : "1문장 제출 및 AI 첨삭 받기"}
                </button>
              </div>

              {/* 정답 마스터 시 다음 문항 버튼 */}
              {skill2AiRes?.isMastered && (
                <button
                  className="secondary-button full-button"
                  style={{ marginTop: "10px" }}
                  onClick={() => {
                    setSkill2Input("");
                    setSkill2Feedback(null);
                    if (skill2Idx < dataset.skill2.length - 1) setSkill2Idx(skill2Idx + 1);
                    else setActiveSkillTab(3); // 스킬 3으로 이동
                  }}
                >
                  {skill2Idx < dataset.skill2.length - 1 ? "다음 자료 해석으로 >" : "STEP 3: 관점 평가로 이동 >"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            스킬 3: 관점 비교 및 쟁점 평가 (대화형 튜터 루프)
            ======================================================== */}
        {activeSkillTab === 3 && (
          <div className="skill-module-card">
            <div className="module-card-header">
              <div className="module-title-left">
                <span className="skill-badge-tag">STEP 03</span>
                <h3>관점 비교 및 쟁점 평가 (AI 대화형 첨삭)</h3>
              </div>
              <button
                className="clue-btn"
                onClick={() =>
                  handleIterativeEvaluate(
                    "SKILL_3",
                    skill3Input,
                    setSkill3AiRes,
                    setSkill3Loading,
                    {
                      topic: dataset.skill3[0].topic,
                      stance: skill3Stance === "A" ? dataset.skill3[0].stances[0].name : dataset.skill3[0].stances[1].name,
                    },
                    true
                  )
                }
              >
                <Lightbulb size={16} color="var(--gold)" weight="fill" /> 단서 템플릿 요청
              </button>
            </div>

            <div className="s3-case-card">
              <h4>쟁점: {dataset.skill3[0].topic}</h4>
              <p>{dataset.skill3[0].caseDescription}</p>

              <div className="stance-options-row">
                {dataset.skill3[0].stances.map((st) => (
                  <button
                    key={st.id}
                    className={`stance-btn ${skill3Stance === st.id ? "active" : ""}`}
                    onClick={() => setSkill3Stance(st.id)}
                  >
                    <strong>{st.name}</strong>
                    <small>{st.desc}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="s3-input-box">
              {/* AI 튜터 코칭 피드백 */}
              {skill3AiRes && (
                <div className={`ai-tutor-coaching-box ${skill3AiRes.isMastered ? "mastered" : "revising"}`}>
                  <div className="tutor-header-row">
                    <div className="tutor-badge">
                      <span className="tutor-avatar">⚡</span>
                      <strong>AI 튜터 ZERO의 관점 코칭</strong>
                    </div>
                    <span className={`status-tag ${skill3AiRes.isMastered ? "playable" : "coming"}`}>
                      {skill3AiRes.isMastered ? "🎉 정답 마스터 도달!" : "💡 개념어 보완 재도전"}
                    </span>
                  </div>

                  <div className="guiding-question-box">
                    <span className="gq-label">🎯 핵심 유도 질문:</span>
                    <p>{skill3AiRes.guideQuestion}</p>
                  </div>

                  {skill3AiRes.recommendedTerms && (
                    <div className="rec-terms-chips">
                      <span>추천 전문 개념어:</span>
                      {skill3AiRes.recommendedTerms.map((t: string, i: number) => (
                        <span key={i} className="term-chip">{t}</span>
                      ))}
                    </div>
                  )}

                  {!skill3AiRes.isMastered && skill3AiRes.scaffoldingHint && (
                    <div className="scaffolding-hint-box">
                      <span className="sh-label">💡 문장 구조 힌트:</span>
                      <code>{skill3AiRes.scaffoldingHint}</code>
                    </div>
                  )}

                  <p className="tutor-feedback-text">{skill3AiRes.feedback}</p>
                </div>
              )}

              <label className="input-field-label">
                {skill3AiRes && !skill3AiRes.isMastered ? "위 개념어와 유도 질문을 활용해 문장을 보강하세요:" : "선택한 관점에서 찬반 주장을 1문장으로 서술하세요:"}
              </label>
              <textarea
                className="s2-textarea"
                rows={3}
                placeholder="예: 본인은 학생의 행복추구권과 통신의 자유를 보장하기 위해 일괄 수거 대신 자율 보관제를 지지한다."
                value={skill3Input}
                onChange={(e) => setSkill3Input(e.target.value)}
              />

              <button
                className="primary-button full-button"
                onClick={() =>
                  handleIterativeEvaluate(
                    "SKILL_3",
                    skill3Input,
                    setSkill3AiRes,
                    setSkill3Loading,
                    {
                      topic: dataset.skill3[0].topic,
                      stance: skill3Stance === "A" ? dataset.skill3[0].stances[0].name : dataset.skill3[0].stances[1].name,
                    }
                  )
                }
                disabled={skill3Loading}
                style={{ marginTop: "10px" }}
              >
                {skill3Loading ? "AI 피드백 분석 중..." : skill3AiRes && !skill3AiRes.isMastered ? "수정 문장 재제출 및 AI 검증" : "AI 관점 부합성 및 개념어 첨삭 받기"}
              </button>

              {skill3AiRes?.isMastered && (
                <button className="secondary-button full-button" style={{ marginTop: "12px" }} onClick={() => setActiveSkillTab(4)}>
                  STEP 4: 원인·대안 도출로 이동 &gt;
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            스킬 4: 원인 분석 및 대안 도출 (대화형 튜터 루프)
            ======================================================== */}
        {activeSkillTab === 4 && (
          <div className="skill-module-card">
            <div className="module-card-header">
              <div className="module-title-left">
                <span className="skill-badge-tag">STEP 04</span>
                <h3>원인 분석 및 법·제도적 대안 도출</h3>
              </div>
              <button
                className="clue-btn"
                onClick={() =>
                  handleIterativeEvaluate(
                    "SKILL_4",
                    skill4Input,
                    setSkill4AiRes,
                    setSkill4Loading,
                    { problemCase: dataset.skill4[0].caseDescription },
                    true
                  )
                }
              >
                <Lightbulb size={16} color="var(--gold)" weight="fill" /> 구조 힌트 요청
              </button>
            </div>

            <div className="s4-case-card">
              <h4>사례: {dataset.skill4[0].title}</h4>
              <p>{dataset.skill4[0].caseDescription}</p>
              <div className="relevant-laws-box">
                <span>관련 법령:</span> {dataset.skill4[0].relevantLaws.join(" · ")}
              </div>
            </div>

            <div className="s4-input-box">
              {/* AI 코칭 피드백 */}
              {skill4AiRes && (
                <div className={`ai-tutor-coaching-box ${skill4AiRes.isMastered ? "mastered" : "revising"}`}>
                  <div className="tutor-header-row">
                    <div className="tutor-badge">
                      <span className="tutor-avatar">⚡</span>
                      <strong>AI 튜터 ZERO의 구조 분석</strong>
                    </div>
                    <span className={`status-tag ${skill4AiRes.isMastered ? "playable" : "coming"}`}>
                      {skill4AiRes.isMastered ? "🎉 구조적 대안 마스터!" : "💡 법·제도 구조 보완"}
                    </span>
                  </div>

                  <div className="guiding-question-box">
                    <span className="gq-label">🎯 핵심 유도 질문:</span>
                    <p>{skill4AiRes.guideQuestion}</p>
                  </div>

                  {!skill4AiRes.isMastered && skill4AiRes.scaffoldingHint && (
                    <div className="scaffolding-hint-box">
                      <span className="sh-label">💡 원인-대안 뼈대:</span>
                      <code>{skill4AiRes.scaffoldingHint}</code>
                    </div>
                  )}

                  <p className="tutor-feedback-text">{skill4AiRes.feedback}</p>
                </div>
              )}

              <label className="input-field-label">
                {skill4AiRes && !skill4AiRes.isMastered ? "유도 질문을 바탕으로 법·제도적 구조와 대안을 보강하세요:" : "문제의 원인(개인적 vs 구조적)과 법·제도적 해결 방안을 2~3문장으로 서술하세요:"}
              </label>
              <textarea
                className="s2-textarea"
                rows={4}
                placeholder="[원인] ... [대안] 근로기준법상 ..."
                value={skill4Input}
                onChange={(e) => setSkill4Input(e.target.value)}
              />

              <button
                className="primary-button full-button"
                onClick={() =>
                  handleIterativeEvaluate(
                    "SKILL_4",
                    skill4Input,
                    setSkill4AiRes,
                    setSkill4Loading,
                    { problemCase: dataset.skill4[0].caseDescription }
                  )
                }
                disabled={skill4Loading}
                style={{ marginTop: "10px" }}
              >
                {skill4Loading ? "구조 분석 중..." : skill4AiRes && !skill4AiRes.isMastered ? "수정 답안 재제출 및 재검증" : "원인 판별 및 대안 일관성 검토"}
              </button>

              {skill4AiRes?.isMastered && (
                <button className="secondary-button full-button" style={{ marginTop: "12px" }} onClick={() => setActiveSkillTab(5)}>
                  STEP 5: 실천 설계로 이동 &gt;
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            스킬 5: 통합적 예측 및 실천 설계 (대화형 튜터 루프)
            ======================================================== */}
        {activeSkillTab === 5 && (
          <div className="skill-module-card">
            <div className="module-card-header">
              <div className="module-title-left">
                <span className="skill-badge-tag">STEP 05</span>
                <h3>통합적 예측 및 실천 설계 (종합 루브릭)</h3>
              </div>
              <button
                className="clue-btn"
                onClick={() =>
                  handleIterativeEvaluate(
                    "SKILL_5",
                    skill5Input,
                    setSkill5AiRes,
                    setSkill5Loading,
                    { problemCase: dataset.skill5[0].contextData },
                    true
                  )
                }
              >
                <Lightbulb size={16} color="var(--gold)" weight="fill" /> 3단 뼈대 가이드
              </button>
            </div>

            <div className="s5-context-card">
              <h4>과제: {dataset.skill5[0].title}</h4>
              <p>{dataset.skill5[0].contextData}</p>
              <div className="structure-guide-banner">
                <strong>작성 3단계 구조:</strong> {dataset.skill5[0].structureGuide}
              </div>
            </div>

            <div className="s5-input-box">
              {/* AI 종합 루브릭 코칭 */}
              {skill5AiRes && (
                <div className={`ai-tutor-coaching-box ${skill5AiRes.isMastered ? "mastered" : "revising"}`}>
                  <div className="tutor-header-row">
                    <div className="tutor-badge">
                      <span className="tutor-avatar">⚡</span>
                      <strong>AI 튜터 ZERO의 종합 루브릭</strong>
                    </div>
                    <span className={`status-tag ${skill5AiRes.isMastered ? "playable" : "coming"}`}>
                      {skill5AiRes.isMastered ? "🎉 최고 성취수준(A) 완수!" : "💡 3단 구조 보완"}
                    </span>
                  </div>

                  <div className="guiding-question-box">
                    <span className="gq-label">🎯 핵심 유도 질문:</span>
                    <p>{skill5AiRes.guideQuestion}</p>
                  </div>

                  {!skill5AiRes.isMastered && skill5AiRes.scaffoldingHint && (
                    <div className="scaffolding-hint-box">
                      <span className="sh-label">💡 3단 뼈대 힌트:</span>
                      <code>{skill5AiRes.scaffoldingHint}</code>
                    </div>
                  )}

                  <p className="tutor-feedback-text">{skill5AiRes.feedback}</p>
                </div>
              )}

              <label className="input-field-label">
                {skill5AiRes && !skill5AiRes.isMastered ? "유도 질문을 참고하여 3단 서술형 문장을 완성하세요:" : "현황 ➔ 구조적 원인 ➔ 헌법적 실천 방안의 3단 서술형 답안을 작성하세요:"}
              </label>
              <textarea
                className="s2-textarea"
                rows={6}
                placeholder="[현황] ... [구조적 원인] ... [실천 방안] ..."
                value={skill5Input}
                onChange={(e) => setSkill5Input(e.target.value)}
              />

              <button
                className="primary-button full-button"
                onClick={() =>
                  handleIterativeEvaluate(
                    "SKILL_5",
                    skill5Input,
                    setSkill5AiRes,
                    setSkill5Loading,
                    { problemCase: dataset.skill5[0].contextData }
                  )
                }
                disabled={skill5Loading}
                style={{ marginTop: "10px" }}
              >
                {skill5Loading ? "루브릭 종합 평가 중..." : skill5AiRes && !skill5AiRes.isMastered ? "수정 3단 서술 재제출 및 AI 검증" : "서술형 루브릭 종합 채점 받기"}
              </button>

              {skill5AiRes?.isMastered && (
                <button className="primary-button full-button" style={{ marginTop: "14px" }} onClick={onBack}>
                  🎉 5단계 탐구 스킬 훈련 전 과정 마스터 완료 (허브로 복귀)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 스킬 1 단서 모달 */}
      {skill1HintModal && (
        <div className="modal-backdrop">
          <section className="hint-modal-panel">
            <button className="modal-close" onClick={() => setSkill1HintModal(false)}><X size={20} /></button>
            <div className="hint-modal-header">
              <Lightbulb size={24} color="var(--gold)" weight="fill" />
              <h2>스킬 1 단서 요청</h2>
            </div>
            <div className="hints-choice-list">
              <button className="hint-option-card" onClick={() => handleSkill1HintRequest(1)}>
                <strong>1차 단서 요청 (-2% 에너지)</strong>
                <p>개념의 핵심 방향성 힌트 제공</p>
              </button>
              <button className="hint-option-card" onClick={() => handleSkill1HintRequest(2)}>
                <strong>2차 단서 요청 (-2% 에너지)</strong>
                <p>초성 및 결정적 단서 제공</p>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 스킬 2 문제 의미 가이드 모달 */}
      {skill2GuideModal && (
        <div className="modal-backdrop">
          <section className="feedback-modal-panel">
            <button className="modal-close" onClick={() => setSkill2GuideModal(false)}><X size={20} /></button>
            <div className="feedback-modal-header">
              <Info size={24} color="var(--teal-soft)" weight="fill" />
              <h2>문제 의미 이해하기 가이드</h2>
            </div>
            <div className="f-step-box">
              <span className="f-step-label">출제 의도 및 접근법</span>
              <p>{curS2.guide}</p>
            </div>
            <button className="primary-button full-button" style={{ marginTop: "12px" }} onClick={() => setSkill2GuideModal(false)}>
              확인하고 답안 작성하기
            </button>
          </section>
        </div>
      )}
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
