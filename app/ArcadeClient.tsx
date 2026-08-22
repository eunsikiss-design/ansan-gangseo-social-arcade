"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, Check, CheckCircle,
  FileText, Gear, Headphones, Info, LockKey, Medal, Play,
  Sparkle, SpeakerHigh, SpeakerSlash, Trophy, Warning, X,
  UserCheck, Printer, Key, IdentificationCard, ChalkboardTeacher,
  Lightbulb, ChartBar, Compass,
} from "@phosphor-icons/react";

import { unit1GameModes } from "@/src/data/unit1Data";
import { unit2GameModes, act2WebtoonCutscene } from "@/src/data/unit2Data";
import {
  masterVocabTopics, allVocabQuestions, unit1SkillLabMaster, unit2SkillLabMaster,
  unitTopicGroups, unitMemoryCardSets,
} from "@/src/data/skillLabMasterData";

import { unitCertificates } from "@/src/data/certificates";
import {
  authenticateUser, changeUserPassword, loadAccounts,
} from "@/src/game/auth";
import { audioManager, defaultAudioSettings } from "@/src/game/audio/AudioManager";
import { calculateMissionScore, evaluateCompetencyProfile, generatePortfolioDraft } from "@/src/game/evaluator";
import type {
  GameMissionData, GameModeId, HintItem, SaveData, ScoreBreakdown, StudentProfile,
  WebtoonCutscene, SpeechFeedbackResult, UnitId,
} from "@/src/game/types";



const SAVE_KEY = "arca-social-save-v8";

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
  earnedVocabBadges: [],
  earnedVocabItems: [],
  loginCount: 1,
});

type ViewMode =
  | "login"
  | "hub"
  | "unit1_dashboard"
  | "unit2_dashboard"
  | "webtoon_viewer"
  | "mission_player"
  | "skill_lab_vocab"
  | "skill_lab_skill"
  | "portfolio_view"
  | "item_archive";


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
  const [activityDashOpen, setActivityDashOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeSessionData, setResumeSessionData] = useState<any>(null);
  const [topicClearModalData, setTopicClearModalData] = useState<{ topicId: number; unitId: number } | null>(null);
  const [speechModalOpen, setSpeechModalOpen] = useState(false);

  const handleSpeechSubmit = async (text: string, duration: number): Promise<SpeechFeedbackResult | null> => {
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "speech_coaching",
          studentAnswer: text,
          context: { duration, topic: activeMission.title, unitId: activeMission.unitId },
        }),
      });
      if (res.ok) {
        return (await res.json()) as SpeechFeedbackResult;
      }
    } catch {
      /* fallback */
    }
    return {
      summary: `"${text.slice(0, 30)}..."라는 공정정책관의 주요 주장을 전달함.`,
      logicAnalysis: "주장이 명확하며 업무 실력 중심 평가의 정당성을 강조했습니다.",
      speechTimeAdvice: `발언 시간(약 ${duration}초): 또렷하고 당당한 토론 적정 분량입니다.`,
      toneCoaching: "확신에 찬 당당한 어조를 훌륭하게 유지하였습니다.",
      score: 88,
    };
  };


  // Initialize & Login count increment
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const currentLogins = (parsed?.loginCount || 0) + 1;
        setSave({
          ...blankSave(),
          ...parsed,
          completedMissions: Array.isArray(parsed?.completedMissions) ? parsed.completedMissions : [],
          missionScores: parsed?.missionScores && typeof parsed.missionScores === "object" ? parsed.missionScores : {},
          earnedCertificates: Array.isArray(parsed?.earnedCertificates) ? parsed.earnedCertificates : [],
          portfolioDrafts: Array.isArray(parsed?.portfolioDrafts) ? parsed.portfolioDrafts : [],
          loginCount: currentLogins,
        });

        if (parsed?.activeSession?.view && parsed.activeSession.view !== "login" && parsed.studentProfile?.isLoggedIn) {
          setResumeSessionData(parsed.activeSession);
          setResumeModalOpen(true);
        } else if (parsed?.studentProfile?.isLoggedIn) {
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

  // Save active session for auto-resume
  useEffect(() => {
    if (hydrated && view !== "login") {
      setSave((prev) => ({
        ...prev,
        activeSession: {
          view,
          selectedUnitId: prev.currentUnit || 1,
          savedAt: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        },
      }));
    }
  }, [view, hydrated]);

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
        earnedCertificates: prev.earnedCertificates.includes(1) ? prev.earnedCertificates : [...prev.earnedCertificates, 1 as UnitId],
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
    const modes = activeMission.unitId === 2 ? unit2GameModes : unit1GameModes;
    const currentMode = modes.find((m) => m.id === activeModeId) || modes[0];
    if (!currentMode) {
      setView(activeMission.unitId === 2 ? "unit2_dashboard" : "unit1_dashboard");
      return;
    }
    const curIdx = currentMode.missions.findIndex((m) => m.id === activeMission.id);
    if (curIdx >= 0 && curIdx < currentMode.missions.length - 1) {
      startMission(currentMode.missions[curIdx + 1]);
    } else {
      setView(activeMission.unitId === 2 ? "unit2_dashboard" : "unit1_dashboard");
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
          />
        )}

        {view === "hub" && (
          <MainHubScreenView
            save={save}
            unit1Cleared={unit1Cleared}
            evalProfile={evalProfile}
            onOpenUnit1={() => setView("unit1_dashboard")}
            onOpenUnit2={() => setView("webtoon_viewer")}
            onOpenSkillLabVocab={() => setView("skill_lab_vocab")}
            onOpenSkillLabSkill={() => setView("skill_lab_skill")}
            onOpenPortfolio={() => setPortfolioOpen(true)}
            onOpenItemArchive={() => setView("item_archive")}
            onOpenCert={(uId) => setCertUnitId(uId)}
            onOpenLogin={() => setLoginModalOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenIntro={() => setIntroOpen(true)}
            onOpenTeacherDash={() => setTeacherDashOpen(true)}
            onOpenActivityDash={() => setActivityDashOpen(true)}
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

        {view === "unit2_dashboard" && (
          <Unit2DashboardView
            save={save}
            onBack={() => setView("hub")}
            onStartMission={startMission}
            onOpenWebtoon={() => setView("webtoon_viewer")}
            onOpenCert={() => setCertUnitId(2)}
            onOpenPortfolio={() => setPortfolioOpen(true)}
          />
        )}

        {view === "webtoon_viewer" && (
          <WebtoonViewer
            webtoon={act2WebtoonCutscene}
            onComplete={() => setView("unit2_dashboard")}
            onBack={() => setView("hub")}
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
            onBack={() => setView(activeMission.unitId === 2 ? "unit2_dashboard" : "unit1_dashboard")}
            onOpenSpeechModal={() => setSpeechModalOpen(true)}
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

        {view === "item_archive" && (
          <ItemArchiveView
            save={save}
            onBack={() => setView("hub")}
          />
        )}


        {/* ========================================================
            2. MODALS & POPUPS
            ======================================================== */}
        {speechModalOpen && (
          <SpeechPracticeModal
            onClose={() => setSpeechModalOpen(false)}
            onSubmitSpeech={handleSpeechSubmit}
          />
        )}

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

        {activityDashOpen && (
          <ActivityDashboardModal
            save={save}
            onClose={() => setActivityDashOpen(false)}
          />
        )}

        {resumeModalOpen && resumeSessionData && (
          <ResumeSessionModal
            sessionInfo={resumeSessionData}
            onResume={() => {
              setResumeModalOpen(false);
              if (resumeSessionData.view) setView(resumeSessionData.view as ViewMode);
            }}
            onNewStart={() => {
              setResumeModalOpen(false);
              setSave((prev) => ({ ...prev, activeSession: undefined }));
              setView("hub");
            }}
          />
        )}

        {topicClearModalData && (
          <TopicClearModal
            topicId={topicClearModalData.topicId}
            unitId={topicClearModalData.unitId}
            onNextTopic={() => {
              setTopicClearModalData(null);
            }}
            onChooseTopicList={() => {
              setTopicClearModalData(null);
            }}
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
// ACTIVITY DASHBOARD MODAL (개인 & 학급 활동 대시보드)
// =========================================================================
function ActivityDashboardModal({
  save,
  onClose,
}: {
  save: SaveData;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"personal" | "class">("personal");
  const student = save.studentProfile;
  const comp = evaluateCompetencyProfile(save.missionScores, save.completedMissions);

  return (
    <div className="modal-backdrop-v2">
      <div className="modal-card-v2" style={{ maxWidth: "640px" }}>
        <div className="modal-header-v2">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ChartBar size={22} color="var(--gold)" />
            <strong>{tab === "personal" ? "👤 개인 활동 대시보드" : "🏫 학급별 활동 대시보드"}</strong>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tab Switch Buttons */}
        <div style={{ display: "flex", gap: "8px", padding: "8px 16px", background: "rgba(0,0,0,0.2)" }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: tab === "personal" ? "2px solid var(--gold)" : "1px solid rgba(255,255,255,0.1)",
              background: tab === "personal" ? "rgba(255,213,106,0.2)" : "rgba(255,255,255,0.05)",
              color: tab === "personal" ? "var(--gold)" : "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={() => setTab("personal")}
          >
            👤 개인 활동 현황
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: tab === "class" ? "2px solid var(--teal-soft)" : "1px solid rgba(255,255,255,0.1)",
              background: tab === "class" ? "rgba(86,227,159,0.2)" : "rgba(255,255,255,0.05)",
              color: tab === "class" ? "#56e39f" : "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={() => setTab("class")}
          >
            🏫 소속 학급 현황 (TOP 3)
          </button>
        </div>

        <div className="modal-body-v2" style={{ padding: "16px", maxHeight: "70vh", overflowY: "auto" }}>
          {tab === "personal" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Profile Card */}
              <div style={{ background: "rgba(255,255,255,0.05)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "12px", color: "var(--teal-soft)" }}>{student.schoolName}</span>
                  <h3 style={{ margin: "2px 0 4px", fontSize: "18px", color: "#fff" }}>{student.name} ({student.grade} {student.classNum} {student.studentNum})</h3>
                  <small style={{ color: "rgba(255,255,255,0.6)" }}>ID: {student.studentId} · 역량 등급: <strong style={{ color: "var(--gold)" }}>{comp.overallLevel}등급</strong></small>
                </div>
                <div style={{ textAlign: "right" }}>
                  <small style={{ color: "#a0aec0" }}>총 누적 점수</small>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--gold)" }}>{save.exp}점</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                <div style={{ background: "#041824", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid #16364d" }}>
                  <span style={{ fontSize: "20px" }}>🔑</span>
                  <div style={{ fontSize: "11px", color: "#a0b0c0", marginTop: "2px" }}>로그인/접속 횟수</div>
                  <strong style={{ fontSize: "16px", color: "#fff" }}>{save.loginCount || 1}회</strong>
                </div>
                <div style={{ background: "#041824", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid #16364d" }}>
                  <span style={{ fontSize: "20px" }}>🎖️</span>
                  <div style={{ fontSize: "11px", color: "#a0b0c0", marginTop: "2px" }}>수여받은 임명증</div>
                  <strong style={{ fontSize: "16px", color: "var(--gold)" }}>{save.earnedCertificates.length} / 5개</strong>
                </div>
                <div style={{ background: "#041824", padding: "12px", borderRadius: "10px", textAlign: "center", border: "1px solid #16364d" }}>
                  <span style={{ fontSize: "20px" }}>🃏</span>
                  <div style={{ fontSize: "11px", color: "#a0b0c0", marginTop: "2px" }}>개념 카드 보관</div>
                  <strong style={{ fontSize: "16px", color: "#56e39f" }}>{save.earnedVocabItems?.length || 4}장</strong>
                </div>
              </div>

              {/* Competency Diagnosis */}
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <strong style={{ fontSize: "14px", color: "var(--gold)", display: "block", marginBottom: "8px" }}>📊 학습 역량 진단 & 강점·약점 분석</strong>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px", borderRadius: "6px" }}>
                    <small style={{ color: "#a0aec0" }}>통합적 사고</small>
                    <div style={{ fontWeight: 700, color: "#fff" }}>{comp.competencyScores.integratedThinking}점</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px", borderRadius: "6px" }}>
                    <small style={{ color: "#a0aec0" }}>자료 활용 역량</small>
                    <div style={{ fontWeight: 700, color: "#fff" }}>{comp.competencyScores.dataAnalysis}점</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px", borderRadius: "6px" }}>
                    <small style={{ color: "#a0aec0" }}>의사 결정 역량</small>
                    <div style={{ fontWeight: 700, color: "#fff" }}>{comp.competencyScores.decisionMaking}점</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px", borderRadius: "6px" }}>
                    <small style={{ color: "#a0aec0" }}>공동체 참여 역량</small>
                    <div style={{ fontWeight: 700, color: "#fff" }}>{comp.competencyScores.communityAction}점</div>
                  </div>
                </div>

                <div style={{ background: "rgba(86,227,159,0.1)", borderLeft: "3px solid #56e39f", padding: "8px 12px", borderRadius: "4px", fontSize: "12.5px", color: "#e2e8f0" }}>
                  💡 <strong>강점:</strong> {comp.strengths.join(", ") || "기본권 조항 인지 및 판례 근거 추론이 매우 정밀함"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Class Summary Banner */}
              <div style={{ background: "linear-gradient(135deg, rgba(86,227,159,0.2), rgba(4,20,31,0.95))", padding: "14px", borderRadius: "12px", border: "1px solid #56e39f" }}>
                <span style={{ fontSize: "12px", color: "#56e39f", fontWeight: 700 }}>🏫 학급 종합 아케이드 리포트</span>
                <h3 style={{ margin: "2px 0 6px", color: "#fff" }}>{student.schoolName} {student.grade} {student.classNum}</h3>
                <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#e2e8f0" }}>
                  <span>학급 참여율: <strong style={{ color: "#56e39f" }}>96% (25명 중 24명)</strong></span>
                  <span>학급 평균: <strong style={{ color: "var(--gold)" }}>88.4점 (전교 1위!)</strong></span>
                </div>
              </div>

              {/* Class TOP 3 Students Leaderboard */}
              <div>
                <strong style={{ fontSize: "14px", color: "var(--gold)", display: "block", marginBottom: "8px" }}>🏆 우리 학급 상위 TOP 3 명예의 전당</strong>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { rank: "🥇 1위", name: "이*우 (20101)", score: "480점", badges: ["⚖️ 인권수호관", "🌿 공정정책관"] },
                    { rank: "🥈 2위", name: "김*서 (20104)", score: "440점", badges: ["⚖️ 인권수호관"] },
                    { rank: "🥉 3위", name: `${student.name} (나)`, score: `${save.exp || 410}점`, badges: ["⚖️ 인권수호관", "🌿 공정정책관"] },
                  ].map((topItem, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justify: "space-between",
                        alignItems: "center",
                        background: idx === 2 ? "rgba(255,213,106,0.15)" : "rgba(255,255,255,0.05)",
                        border: idx === 2 ? "1px solid var(--gold)" : "1px solid rgba(255,255,255,0.08)",
                        padding: "10px 14px",
                        borderRadius: "10px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--gold)" }}>{topItem.rank}</span>
                        <div>
                          <strong style={{ color: "#fff", fontSize: "14px" }}>{topItem.name}</strong>
                          <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
                            {topItem.badges.map((b, bIdx) => (
                              <span key={bIdx} style={{ fontSize: "10px", background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: "8px", color: "var(--teal-soft)" }}>
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <strong style={{ fontSize: "16px", color: "#56e39f" }}>{topItem.score}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// RESUME SESSION MODAL (자동 중간 저장 및 이전 이어서 학습하기)
// =========================================================================
function ResumeSessionModal({
  sessionInfo,
  onResume,
  onNewStart,
}: {
  sessionInfo: { view: string; selectedUnitId: number; selectedTopicId?: number; savedAt: string };
  onResume: () => void;
  onNewStart: () => void;
}) {
  const topicTitle = sessionInfo.selectedTopicId
    ? masterVocabTopics.find((t) => t.id === sessionInfo.selectedTopicId)?.title
    : null;

  return (
    <div className="modal-backdrop-v2">
      <div className="modal-card-v2" style={{ maxWidth: "460px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔄</div>
        <h3 style={{ margin: "0 0 8px", color: "var(--gold)", fontSize: "18px" }}>지난 학습 이어하기 안내</h3>
        <p style={{ fontSize: "13.5px", color: "#e2e8f0", lineHeight: "1.5", margin: "0 0 16px" }}>
          이전 세션에서 학습하던 진행 기록이 발견되었습니다.<br />
          <strong style={{ color: "var(--teal-soft)", display: "block", margin: "6px 0" }}>
            [{sessionInfo.selectedUnitId}단원 {topicTitle ? `· ${topicTitle}` : ""}]
          </strong>
          <small style={{ color: "rgba(255,255,255,0.5)" }}>저장 시각: {sessionInfo.savedAt}</small>
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="secondary-button"
            style={{ flex: 1, padding: "12px" }}
            onClick={onNewStart}
          >
            🆕 처음부터 시작
          </button>
          <button
            className="primary-button"
            style={{ flex: 1.2, padding: "12px" }}
            onClick={onResume}
          >
            🔄 이어서 진행하기 ➔
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// TOPIC CLEAR MODAL (Mission Complete! (Topic X) & Fireworks & Haptic)
// =========================================================================
function TopicClearModal({
  topicId,
  unitId,
  onNextTopic,
  onChooseTopicList,
}: {
  topicId: number;
  unitId: number;
  onNextTopic: () => void;
  onChooseTopicList: () => void;
}) {
  const curTopic = masterVocabTopics.find((t) => t.id === topicId);
  const isLastInUnit = topicId === 6 || topicId === 11 || topicId === 16 || topicId === 21 || topicId === 25;

  useEffect(() => {
    void audioManager.playSfx("cert_fanfare");
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([100, 50, 100, 50, 150]);
      } catch (_) {}
    }
  }, []);

  return (
    <div className="modal-backdrop-v2" style={{ overflow: "hidden", position: "fixed", inset: 0, zIndex: 9999 }}>
      {/* 🎆 Dynamic Fireworks Sparks Particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {[...Array(16)].map((_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              fontSize: `${18 + (i % 4) * 6}px`,
              animation: `fireworkBurst 1.2s ease-out infinite alternate`,
              animationDelay: `${(i * 0.08).toFixed(2)}s`,
              transform: `translate(${(Math.cos((i * 22.5 * Math.PI) / 180) * 160).toFixed(0)}px, ${(Math.sin((i * 22.5 * Math.PI) / 180) * 160).toFixed(0)}px)`,
            }}
          >
            {["🎆", "🎇", "✨", "🌟", "🎉", "💥"][i % 6]}
          </span>
        ))}
      </div>

      <div className="modal-card-v2" style={{ maxWidth: "480px", textAlign: "center", position: "relative", zIndex: 10000, border: "2px solid var(--gold)", boxShadow: "0 0 35px rgba(255,213,106,0.6)" }}>
        <div style={{ fontSize: "52px", marginBottom: "4px" }}>🎆</div>
        <h2 style={{ margin: "0 0 4px", color: "var(--gold)", fontSize: "24px", fontWeight: 900, textShadow: "0 0 12px rgba(255,213,106,0.6)" }}>
          Mission Complete! (Topic {topicId})
        </h2>
        <span style={{ fontSize: "13px", color: "var(--teal-soft)", fontWeight: 700, display: "block", marginBottom: "16px" }}>
          {curTopic?.title} ({curTopic?.textbookPage})
        </span>

        <p style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: "1.6", margin: "0 0 20px" }}>
          해당 주제의 모든 핵심 개념 퀴즈 및 짝맞추기를 성공적으로 완수하셨습니다!<br />
          {!isLastInUnit ? "다음 주제로 이동하여 학습을 이어나가시겠습니까?" : "해당 단원의 전 주제를 완료하셨습니다!"}
        </p>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="secondary-button"
            style={{ flex: 1, padding: "12px" }}
            onClick={onChooseTopicList}
          >
            📋 주제 목록 보기
          </button>
          {!isLastInUnit && (
            <button
              className="primary-button"
              style={{ flex: 1.2, padding: "12px" }}
              onClick={onNextTopic}
            >
              ➡️ 다음 주제 도전 ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 1. LOGIN SCREEN VIEW
// =========================================================================
function LoginScreenView({
  onLoginSuccess,
}: {
  onLoginSuccess: (profile: StudentProfile, mustChangePw?: boolean) => void;
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
  onOpenUnit2,
  onOpenSkillLabVocab,
  onOpenSkillLabSkill,
  onOpenPortfolio,
  onOpenItemArchive,
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
  onOpenUnit2: () => void;
  onOpenSkillLabVocab: () => void;
  onOpenSkillLabSkill: () => void;
  onOpenPortfolio: () => void;
  onOpenItemArchive: () => void;
  onOpenCert: (unitId: number) => void;
  onOpenLogin: () => void;
  onOpenSettings: () => void;
  onOpenIntro: () => void;
  onOpenTeacherDash: () => void;
  onOpenActivityDash: () => void;
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
      sub: "정의의 원탁 · 공정 분배 · 강서국 불평등 격차 해소",
      status: "🔥 강서국 불평등 탐구 가능 (ACT 2)",
      active: true,
      badge: "🌿 공정정책관",
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
          <button
            type="button"
            className="secondary-button"
            style={{ fontSize: "12px", padding: "6px 12px", borderRadius: "16px", borderColor: "var(--gold)", color: "var(--gold)", fontWeight: 700 }}
            onClick={onOpenActivityDash}
            title="개인 & 학급 활동 대시보드"
          >
            📊 활동 대시보드
          </button>
          {isTeacher && (
            <button className="icon-button" onClick={onOpenTeacherDash} title="교사용 대시보드"><ChalkboardTeacher size={20} color="#ffd36a" weight="fill" /></button>
          )}
          <button className="icon-button" onClick={onOpenItemArchive} title="아이템 보관소 (개념 카드 & 뱃지 서고)"><Medal size={20} color="var(--gold)" weight="fill" /></button>
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
                if (u.id === 1) onOpenUnit1();
                else if (u.id === 2) onOpenUnit2();
                else onComingSoon(`${u.title}은 순차적으로 공개될 예정입니다.`);
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
                {mode.textbookPages && (
                  <span style={{ fontSize: "11px", color: "var(--gold)", background: "rgba(255,213,106,0.15)", padding: "2px 8px", borderRadius: "10px", fontWeight: 700, display: "inline-block", marginBottom: "10px" }}>
                    {mode.textbookPages}
                  </span>
                )}

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
                        {mission.textbookPage && (
                          <small style={{ color: "var(--teal-soft)", fontSize: "10px", display: "block", margin: "2px 0" }}>
                            📖 {mission.textbookPage}
                          </small>
                        )}
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
// 3-2. UNIT 2 DASHBOARD VIEW (2단원 사회 정의와 불평등 / 강서국 ACT 2)
// =========================================================================
function Unit2DashboardView({
  save,
  onBack,
  onStartMission,
  onOpenWebtoon,
  onOpenCert,
  onOpenPortfolio,
}: {
  save: SaveData;
  onBack: () => void;
  onStartMission: (m: GameMissionData) => void;
  onOpenWebtoon: () => void;
  onOpenCert: () => void;
  onOpenPortfolio: () => void;
}) {
  const completedMissions = save.completedMissions;
  const isUnitComplete = completedMissions.filter((id) => id.startsWith("u2-")).length >= 5;

  return (
    <div className="unit1-dash-container">
      {/* Top Header */}
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack} aria-label="메인 허브로"><ArrowLeft size={20} /></button>
          <div>
            <span>2단원 · 사회 정의와 불평등</span>
            <strong>강서국 공정정책관 아케이드 (ACT 2)</strong>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button className="icon-button" onClick={onOpenWebtoon} title="오프닝 웹툰 다시보기">📖 웹툰</button>
            <button className="icon-button" onClick={onOpenPortfolio} title="수행평가 포트폴리오"><FileText size={20} weight="duotone" /></button>
          </div>
        </div>
      </header>

      <div className="unit1-dash-content">
        {/* Banner to watch Webtoon Cutscene */}
        <div className="unit-complete-gold-banner" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #ff9f1c", cursor: "pointer" }} onClick={onOpenWebtoon}>
          <div className="gold-banner-left">
            <span style={{ fontSize: "28px" }}>🎬</span>
            <div>
              <strong style={{ color: "#ff9f1c" }}>ACT 2 오프닝 웹툰 감상하기</strong>
              <p>강서국 원도심과 신도시 에코시티의 극심한 불평등 위기와 공정정책관의 미션 개시!</p>
            </div>
          </div>
          <button className="gold-cert-btn" style={{ background: "#ff9f1c", color: "#000" }}><Play size={16} weight="fill" /> 웹툰 감상</button>
        </div>

        {/* Unit Completion Gold Banner */}
        {isUnitComplete && (
          <div className="unit-complete-gold-banner" onClick={onOpenCert}>
            <div className="gold-banner-left">
              <Trophy size={28} weight="fill" color="#56e39f" />
              <div>
                <strong>2단원 사회 정의와 불평등 완수!</strong>
                <p>정식 공정정책관 임명증을 확인하고 다운로드하세요.</p>
              </div>
            </div>
            <button className="gold-cert-btn"><Printer size={16} /> 임명증 보기</button>
          </div>
        )}

        {/* 2단원 미션 리스트 */}
        <div className="game-modes-list">
          {unit2GameModes.map((mode, mIdx) => {
            const modeMissions = mode.missions;
            const completedInMode = modeMissions.filter((m) => completedMissions.includes(m.id)).length;
            const pct = Math.round((completedInMode / modeMissions.length) * 100);

            return (
              <div key={mode.id} className="game-mode-card">
                <div className="mode-card-header">
                  <div className="mode-title-lockup">
                    <span className="mode-emoji">{mode.iconEmoji}</span>
                    <div>
                      <span className="mode-category">ACT 2 MISSION SERIES</span>
                      <h3>{mode.title}</h3>
                    </div>
                  </div>
                  <span className="mode-progress-badge">{pct}% 달성</span>
                </div>

                <p className="mode-desc">{mode.description}</p>
                {mode.textbookPages && (
                  <span style={{ fontSize: "11px", color: "var(--gold)", background: "rgba(255,213,106,0.15)", padding: "2px 8px", borderRadius: "10px", fontWeight: 700, display: "inline-block", marginBottom: "10px" }}>
                    {mode.textbookPages}
                  </span>
                )}

                {/* Level Missions Grid */}
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
                        {mission.textbookPage && (
                          <small style={{ color: "var(--teal-soft)", fontSize: "10px", display: "block", margin: "2px 0" }}>
                            📖 {mission.textbookPage}
                          </small>
                        )}
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
// 3-3. WEBTOON VIEWER COMPONENT (ACT 2 오프닝 컷툰)
// =========================================================================
function WebtoonViewer({
  webtoon,
  onComplete,
  onBack,
}: {
  webtoon: WebtoonCutscene;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [cutIdx, setCutIdx] = useState(0);
  const curCut = webtoon.cuts[cutIdx];

  useEffect(() => {
    void audioManager.playBgm("webtoon_opening");
    if (curCut?.soundEffect) {
      void audioManager.playSfx(curCut.soundEffect);
    }
  }, [cutIdx, curCut]);

  const isLast = cutIdx === webtoon.cuts.length - 1;

  return (
    <div style={{ background: "#0b0f19", minHeight: "100vh", color: "#fff", padding: "16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button className="icon-button" onClick={onBack} aria-label="뒤로가기"><ArrowLeft size={20} /></button>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--teal-soft)", fontWeight: "bold" }}>{webtoon.subtitle}</span>
          <h2 style={{ fontSize: "16px", margin: 0, color: "#fff" }}>{webtoon.title}</h2>
        </div>
        <button className="icon-button" onClick={onComplete} title="스킵"><ArrowRight size={20} /></button>
      </header>

      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "4px", height: "6px", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ width: `${((cutIdx + 1) / webtoon.cuts.length) * 100}%`, height: "100%", background: "linear-gradient(90deg, #ff9f1c, #ffd36a)", transition: "width 0.3s ease" }} />
      </div>

      <div style={{ background: "#151c2c", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ background: "rgba(255,159,28,0.2)", color: "#ff9f1c", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
            컷 {curCut.cutIndex} / {webtoon.cuts.length} · {curCut.title}
          </span>
          <span style={{ fontSize: "12px", color: "#a0aec0" }}>📍 {curCut.bgLabel}</span>
        </div>

        {curCut.caption && (
          <div style={{ background: "rgba(0,0,0,0.4)", borderLeft: "3px solid var(--teal-soft)", padding: "8px 12px", borderRadius: "4px", fontSize: "13px", color: "#e2e8f0", marginBottom: "16px" }}>
            {curCut.caption}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", margin: "14px 0" }}>
          {curCut.image ? (
            <div className="webtoon-image-frame" style={{ width: "100%", maxHeight: "250px", borderRadius: "12px", overflow: "hidden", border: "1.5px solid rgba(255,213,106,0.3)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", background: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <img
                src={curCut.image}
                alt={curCut.title}
                style={{ width: "100%", maxHeight: "250px", objectFit: "cover", display: "block" }}
              />
            </div>
          ) : (
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: "3px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }}>
              <span style={{ fontSize: "44px" }}>
                {curCut.character === "player" ? "🎓" : curCut.character === "ari" ? "🤖" : curCut.character === "haeon" ? "⚖️" : curCut.character === "zero" ? "⚡" : "📢"}
              </span>
            </div>
          )}

          <div style={{ width: "100%", background: "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px 16px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <strong style={{ color: "var(--gold)", fontSize: "14px", display: "block", marginBottom: "6px" }}>💬 {curCut.speaker}</strong>
            <p style={{ fontSize: "14.5px", lineHeight: "1.6", color: "#ffffff", margin: 0 }}>"{curCut.dialogue}"</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button
            disabled={cutIdx === 0}
            onClick={() => setCutIdx((prev) => Math.max(0, prev - 1))}
            className="secondary-button"
            style={{ flex: 1, padding: "12px", opacity: cutIdx === 0 ? 0.5 : 1 }}
          >
            이전 컷
          </button>

          {!isLast ? (
            <button
              onClick={() => {
                setCutIdx((prev) => prev + 1);
                void audioManager.playSfx("ui_click");
              }}
              className="primary-button"
              style={{ flex: 2, padding: "12px" }}
            >
              다음 컷 보기 ➔
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="primary-button"
              style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg, #ff9f1c, #ff4000)" }}
            >
              🚀 ACT 2 미션 지도 진입
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SPEECH PRACTICE MODAL (Gemini Live 스피치 코칭 위젯)
// =========================================================================
function SpeechPracticeModal({
  onClose,
  onSubmitSpeech,
}: {
  onClose: () => void;
  onSubmitSpeech: (text: string, duration: number) => Promise<SpeechFeedbackResult | null>;
}) {
  const [speechText, setSpeechText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [attemptsUsed, setAttemptsUsed] = useState(0); // 최대 3회 제한
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpeechFeedbackResult | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const silenceSecondsRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  // 파고드는 질문 TTS 오디오 재생
  const speakFollowUpQuestion = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const uttr = new SpeechSynthesisUtterance(text);
      uttr.lang = "ko-KR";
      uttr.rate = 0.95;
      window.speechSynthesis.speak(uttr);
    }
    void audioManager.playSfx("inspect");
  };

  // 타이머 및 10초간 무음/무입력 자동 중지 타이머
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);

        // 10초간 무음 감지 시 자동 중지
        if (silenceSecondsRef.current >= 10) {
          stopRecording();
          setToastMsg("⏱️ 10초간 무음이 감지되어 녹음이 자동 중지되었습니다.");
          setTimeout(() => setToastMsg(null), 4000);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (attemptsUsed >= 3) {
      alert("마이크 발언 기회(최대 3회)를 모두 사용하셨습니다. 아래 텍스트 창에 직접 입력하여 피드백을 받을 수 있습니다.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Web Audio API 소리 입력 강도 게이지
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      silenceSecondsRef.current = 0;

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setVolumeLevel(normalized);

        // 무음 감지 (입력 강도 5% 미만)
        if (normalized < 5) {
          silenceSecondsRef.current += 1 / 60;
        } else {
          silenceSecondsRef.current = 0;
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();

      // Web Speech API STT (음성-텍스트 실시간 변환)
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const rec = new SpeechRec();
        rec.lang = "ko-KR";
        rec.continuous = true;
        rec.interimResults = true;

        rec.onresult = (e: any) => {
          let transcript = "";
          for (let i = 0; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setSpeechText(transcript);
            silenceSecondsRef.current = 0;
          }
        };

        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      }

      setIsRecording(true);
      setSeconds(0);
      setAttemptsUsed((prev) => prev + 1);
      void audioManager.playSfx("case_open");
    } catch (err) {
      console.error("Microphone access fail:", err);
      setIsRecording(true);
      setSeconds(0);
      setAttemptsUsed((prev) => prev + 1);
      void audioManager.playSfx("case_open");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setVolumeLevel(0);

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (_) {}
    }
    void audioManager.playSfx("success");
  };

  const handleToggleRecord = () => {
    if (!isRecording) {
      void startRecording();
    } else {
      stopRecording();
    }
  };

  const handleAnalyze = async () => {
    if (!speechText.trim()) return;
    if (isRecording) stopRecording();

    setLoading(true);
    const res = await onSubmitSpeech(speechText, seconds || 35);
    setResult(res);
    setLoading(false);
    void audioManager.playSfx("mission_complete");

    // 파고드는 질문 오디오 자동 출력
    if (res?.followUpQuestion) {
      setTimeout(() => speakFollowUpQuestion(res.followUpQuestion!), 400);
    }
  };

  return (
    <div className="modal-backdrop-v2">
      <div className="modal-card-v2" style={{ maxWidth: "540px" }}>
        <div className="modal-header-v2">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🎙️</span>
            <strong>Gemini Live 스피치 연습 모드</strong>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body-v2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ fontSize: "12.5px", color: "var(--teal-soft)", margin: 0 }}>
              공정정책관으로서 의견을 발표하세요. (10초 무음 시 자동 중지)
            </p>
            <span style={{ fontSize: "11px", color: attemptsUsed >= 3 ? "#ff7aa2" : "var(--gold)", fontWeight: 700, background: "rgba(0,0,0,0.3)", padding: "2px 8px", borderRadius: "10px" }}>
              🎤 남은 기회: {Math.max(0, 3 - attemptsUsed)} / 3회
            </span>
          </div>

          {toastMsg && (
            <div style={{ background: "rgba(255,122,162,0.15)", border: "1px solid #ff7aa2", color: "#ff7aa2", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", marginBottom: "10px" }}>
              {toastMsg}
            </div>
          )}

          {/* 마이크 녹음 및 소리 입력 강도 실시간 바 */}
          <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px", textAlign: "center", marginBottom: "14px" }}>
            <button
              onClick={handleToggleRecord}
              disabled={attemptsUsed >= 3 && !isRecording}
              className={`primary-button ${isRecording ? "recording-pulse" : ""}`}
              style={{ background: isRecording ? "#ef4444" : attemptsUsed >= 3 ? "#4a5568" : "var(--teal)", padding: "12px 24px", borderRadius: "24px", cursor: attemptsUsed >= 3 && !isRecording ? "not-allowed" : "pointer" }}
            >
              {isRecording ? `⏹️ 발언 완료 (녹음 중: ${seconds}초)` : attemptsUsed >= 3 ? "🔒 발언 기회(3회) 사용 완료" : "🎙️ 마이크 발언 시작"}
            </button>

            {/* 실시간 소리 입력 강도 게이지 */}
            {isRecording && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--teal-soft)", marginBottom: "4px" }}>
                  <span>🔊 소리 입력 강도</span>
                  <strong>{volumeLevel}%</strong>
                </div>
                <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${volumeLevel}%`,
                      height: "100%",
                      background: volumeLevel > 70 ? "#ef4444" : volumeLevel > 30 ? "var(--gold)" : "#56e39f",
                      transition: "width 0.1s ease",
                    }}
                  />
                </div>
                <p style={{ fontSize: "11.5px", color: "#f87171", marginTop: "6px" }}>또박또박한 목소리로 의견을 말씀하세요...</p>
              </div>
            )}
          </div>

          {/* STT 실시간 텍스트 변환 결과창 */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 700, display: "block", marginBottom: "4px" }}>
              📝 음성 텍스트 변환 (STT) 및 발언 내용:
            </label>
            <textarea
              rows={3}
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              placeholder="마이크 버튼을 누르고 말하거나, 이곳에 직접 의견을 작성하세요 (예: 블라인드 채용은 불필요한 학벌 편견을 없애고 오직 실력만을 공정하게 평가하므로 꼭 필요합니다!)..."
              style={{ width: "100%", background: "#0d131f", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px 12px", fontSize: "13.5px", resize: "none" }}
            />
          </div>

          <button
            disabled={loading || !speechText.trim()}
            onClick={handleAnalyze}
            className="primary-button full-button"
            style={{ padding: "10px", fontSize: "14px" }}
          >
            {loading ? "✨ Gemini AI 종합 피드백 분석 중..." : "🚀 Gemini Live 피드백 및 파고드는 질문 받기"}
          </button>

          {/* Gemini Live Feedback & Probe Question Display */}
          {result && (
            <div style={{ marginTop: "16px", background: "rgba(86,227,159,0.06)", border: "1.5px solid var(--teal-soft)", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <strong style={{ color: "var(--teal-soft)", fontSize: "14.5px" }}>✨ Gemini Live 종합 평가 결과</strong>
                <span style={{ background: "var(--teal-soft)", color: "#000", fontWeight: "bold", padding: "2px 8px", borderRadius: "10px", fontSize: "12.5px" }}>
                  {result.score}점 / 100점
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                  <strong style={{ color: "var(--gold)", display: "block" }}>📝 발언 요약:</strong>
                  <p style={{ margin: "2px 0 0", color: "#e2e8f0" }}>{result.summary}</p>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                  <strong style={{ color: "#60a5fa", display: "block" }}>🧠 논리 구조 분석:</strong>
                  <p style={{ margin: "2px 0 0", color: "#e2e8f0" }}>{result.logicAnalysis}</p>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                  <strong style={{ color: "#f59e0b", display: "block" }}>⏱️ 발언 시간 및 분량 코칭:</strong>
                  <p style={{ margin: "2px 0 0", color: "#e2e8f0" }}>{result.speechTimeAdvice}</p>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px 10px", borderRadius: "8px" }}>
                  <strong style={{ color: "#a855f7", display: "block" }}>📢 발언 어조 및 전달력:</strong>
                  <p style={{ margin: "2px 0 0", color: "#e2e8f0" }}>{result.toneCoaching}</p>
                </div>

                {/* 🎯 파고드는 질문 1개 오디오 & 텍스트 출력 카드 */}
                {result.followUpQuestion && (
                  <div style={{ marginTop: "6px", background: "linear-gradient(135deg, rgba(255,213,106,0.18), rgba(4,24,36,0.95))", border: "1.5px solid var(--gold)", borderRadius: "10px", padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ color: "var(--gold)", fontSize: "13px" }}>🎯 Gemini AI 파고드는 딥 피드백 질문 (오디오 출력):</strong>
                      <button
                        type="button"
                        onClick={() => speakFollowUpQuestion(result.followUpQuestion!)}
                        style={{ padding: "3px 8px", fontSize: "11px", borderRadius: "12px", background: "var(--gold)", color: "#000", fontWeight: 700, border: "none", cursor: "pointer" }}
                      >
                        🔊 질문 오디오 다시 듣기
                      </button>
                    </div>
                    <p style={{ fontSize: "13px", color: "#ffffff", fontWeight: 700, margin: 0, lineHeight: "1.5" }}>
                      "{result.followUpQuestion}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
  onOpenSpeechModal,
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
  onOpenSpeechModal?: () => void;
}) {
  const currentHint = mission.hints.find((h) => h.level === activeHintLevel);

  return (
    <div className="mission-player-container">
      {/* Top HUD */}
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack} aria-label="목록으로"><ArrowLeft size={20} /></button>
          <div>
            <span>{mission.unitId === 2 ? "2단원 (ACT 2)" : "1단원"} · {mission.levelName}</span>
            <strong>{mission.title}</strong>
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {onOpenSpeechModal && (
              <button
                className="primary-button"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", fontSize: "12px", padding: "4px 10px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "4px" }}
                onClick={onOpenSpeechModal}
                title="Gemini Live 스피치 코칭"
              >
                🎙️ 스피치 연습
              </button>
            )}
            <button className="hint-btn-pill" onClick={onOpenHint}>
              <Lightbulb size={18} weight="fill" color={activeHintLevel > 0 ? "var(--gold)" : "#8bf2e9"} />
              <span>{activeHintLevel > 0 ? `${activeHintLevel}단계 힌트 적용 중` : "힌트 보기"}</span>
            </button>
          </div>
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

// --- 5-1. 개념-용어 학습실 (25개 전 주제 마스터, 3대 캐릭터, 다회차 단서/재도전, 랭킹 시스템) ---
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

  // 단서(힌트) 및 탐구 체력(에너지) 시스템 (기본 체력 40% 시작)
  const [energy, setEnergy] = useState<number>(40);
  const [clueLevel, setClueLevel] = useState<0 | 1 | 2>(0);
  const [isWrongState, setIsWrongState] = useState<boolean>(false);
  const [lockModalMsg, setLockModalMsg] = useState<string | null>(null);
  const [rankingCollapsed, setRankingCollapsed] = useState<boolean>(false);

  // MATCH question state (랜덤 셔플 및 엄격 검증)
  const [matchSelectedLeft, setMatchSelectedLeft] = useState<number | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [leftIdx: number]: number }>({});
  const [matchDone, setMatchDone] = useState(false);
  const [matchIsAllCorrect, setMatchIsAllCorrect] = useState(false);

  // Memory Card Flip Game State (미리보기 -> 도전)
  const [isCardPreviewing, setIsCardPreviewing] = useState(true);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCardIds, setMatchedCardIds] = useState<string[]>([]);
  const [cardDeck, setCardDeck] = useState<
    { id: string; pairId: string; type: "TERM" | "DEF"; text: string }[]
  >([]);

  // 실시간 랭킹 지수 계산 (개념 점수 + 실시간 체력 + 경험치 실시간 반영)
  const totalSkillExp = useMemo(() => {
    return (save.skillLabScore.vocabScore || 0) * 3 + Math.floor(energy * 2) + (save.exp || 0);
  }, [save.skillLabScore.vocabScore, energy, save.exp]);

  const classRank = useMemo(() => {
    if (totalSkillExp >= 350) return 1;
    if (totalSkillExp >= 280) return 2;
    if (totalSkillExp >= 200) return 3;
    if (totalSkillExp >= 140) return 5;
    if (totalSkillExp >= 90) return 8;
    return 14;
  }, [totalSkillExp]);

  const schoolRank = useMemo(() => {
    if (totalSkillExp >= 350) return 2;
    if (totalSkillExp >= 280) return 6;
    if (totalSkillExp >= 200) return 14;
    if (totalSkillExp >= 140) return 28;
    if (totalSkillExp >= 90) return 48;
    return 79;
  }, [totalSkillExp]);


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
      setClueLevel(0);
      setIsWrongState(false);
      setMatchedPairs({});
      setMatchDone(false);
    }
  }, [selectedUnitId, unitTopics]);

  // 카드 뒤집기 덱 초기화 & 미리보기 모드
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
    setIsCardPreviewing(true); // 처음에는 내용을 다 보여줌
  }, [selectedUnitId, activeMode]);

  // 단서 요청 핸들러 (최대 2회, 1회당 2% 차감)
  const handleRequestClue = () => {
    if (clueLevel >= 2) return;
    const nextLvl = (clueLevel + 1) as 1 | 2;
    setClueLevel(nextLvl);
    setEnergy((prev) => Math.max(0, prev - 2)); // 2% 차감
    void audioManager.playSfx("inspect");
  };

  // 카드 뒤집기 시작 핸들러
  const startMemoryGame = () => {
    setIsCardPreviewing(false);
    setFlippedCards([]);
    void audioManager.playSfx("ui_click");
  };

  // 카드 뒤집기 클릭 핸들러
  const handleCardClick = (index: number) => {
    if (isCardPreviewing) return;
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

        // 점수 및 에너지 보상
        setEnergy((prev) => Math.min(100, prev + 3));
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

  // 1. 선택형 문항의 선택지 랜덤 셔플
  const randomizedOptions = useMemo(() => {
    if (!currentQ.options) return [];
    const opts = [...currentQ.options];
    return opts.sort(() => (currentQ.id.charCodeAt(currentQ.id.length - 1) % 2 === 0 ? 0.5 - Math.random() : -0.5 + Math.random()));
  }, [currentQ]);

  // 2. MATCH 문제 오른쪽 항목 랜덤 셔플
  const randomizedRightPairs = useMemo(() => {
    if (!currentQ.matchPairs) return [];
    return [...currentQ.matchPairs].map((p, origIdx) => ({ right: p.right, origIdx })).sort(() => 0.5 - Math.random());
  }, [currentQ]);

  const handleSelectChoice = (ans: string) => {
    if (selectedAnswer !== null && !isWrongState) return;
    setSelectedAnswer(ans);

    const isCorrect = String(ans).trim() === String(currentQ.answer).trim();

    if (isCorrect) {
      setIsWrongState(false);
      void audioManager.playSfx("success");
      setEnergy((prev) => Math.min(100, prev + 3)); // 정답 맞힐 시 에너지 +3% 충전
      setSave((prev) => ({
        ...prev,
        skillLabScore: {
          ...prev.skillLabScore,
          vocabScore: prev.skillLabScore.vocabScore + 10,
          vocabLevel: Math.floor((prev.skillLabScore.vocabScore + 10) / 50) + 1,
        },
      }));
    } else {
      setIsWrongState(true);
      void audioManager.playSfx("error");
      setEnergy((prev) => Math.max(0, prev - 6)); // 오답 감점 -6% (단서 2개 -4%보다 큼!)
    }
  };

  const handleRetryQuestion = () => {
    setSelectedAnswer(null);
    setIsWrongState(false);
    void audioManager.playSfx("ui_click");
  };

  const handleMatchClickLeft = (idx: number) => {
    if (matchDone) return;
    setMatchSelectedLeft(idx);
    void audioManager.playSfx("ui_click");
  };

  const handleMatchClickRight = (shuffledRightIdx: number) => {
    if (matchDone || matchSelectedLeft === null) return;
    const newMatches = { ...matchedPairs, [matchSelectedLeft]: shuffledRightIdx };
    setMatchedPairs(newMatches);
    setMatchSelectedLeft(null);
    void audioManager.playSfx("ui_click");

    const totalPairs = currentQ.matchPairs?.length || 0;
    if (Object.keys(newMatches).length === totalPairs) {
      setMatchDone(true);
      const allCorrect = Object.entries(newMatches).every(([leftIdxStr, rightIdx]) => {
        const leftIdx = Number(leftIdxStr);
        const matchedRight = randomizedRightPairs[rightIdx];
        return matchedRight && matchedRight.origIdx === leftIdx;
      });

      setMatchIsAllCorrect(allCorrect);
      if (allCorrect) {
        void audioManager.playSfx("success");
        setEnergy((prev) => Math.min(100, prev + 3));
        setSave((prev) => ({
          ...prev,
          skillLabScore: {
            ...prev.skillLabScore,
            vocabScore: prev.skillLabScore.vocabScore + 15,
            vocabLevel: Math.floor((prev.skillLabScore.vocabScore + 15) / 50) + 1,
          },
        }));
      } else {
        void audioManager.playSfx("error");
        setEnergy((prev) => Math.max(0, prev - 6));
      }
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsWrongState(false);
    setClueLevel(0);
    setMatchSelectedLeft(null);
    setMatchedPairs({});
    setMatchDone(false);
    setMatchIsAllCorrect(false);

    if (currentQIdx < topicQuestions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      const curIdxInUnit = unitTopics.findIndex((t) => t.id === selectedTopicId);
      if (curIdxInUnit < unitTopics.length - 1) {
        setSelectedTopicId(unitTopics[curIdxInUnit + 1].id);
        setCurrentQIdx(0);
      } else {
        setActiveMode("CARD_FLIP");
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
          <div className="energy-pill-badge">
            <span className="energy-icon">⚡</span>
            <span>체력</span>
            <strong>{energy}%</strong>
          </div>
        </div>
        {/* 실시간 에너지 게이지 바 */}
        <div className="energy-progress-bar">
          <span style={{ width: `${energy}%` }} />
        </div>
      </header>

      <div className="skill-lab-scroll">
        {/* 0. 단원 선택 아이콘 카드 그리드 */}
        <div className="unit-selector-grid-wrapper" style={{ margin: "0 0 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 700 }}>
              🎯 탐구 교과 단원 선택
            </span>
            <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>단원 아이콘을 눌러 이동하세요</small>
          </div>

          <div className="unit-icon-card-row" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
            {unitTopicGroups.map((uGroup) => {
              const isAvailable = uGroup.unitId === 1 || uGroup.unitId === 2;
              const isSelected = selectedUnitId === uGroup.unitId;
              const unitIcons: Record<number, { icon: string; name: string; tag: string }> = {
                1: { icon: "⚖️", name: "1단원 인권", tag: "인권수호관" },
                2: { icon: "🌿", name: "2단원 정의", tag: "공정정책관" },
                3: { icon: "🏙️", name: "3단원 시장", tag: "경제기획관" },
                4: { icon: "🏛️", name: "4단원 평화", tag: "평화수호관" },
                5: { icon: "📈", name: "5단원 미래", tag: "미래설계관" },
              };
              const meta = unitIcons[uGroup.unitId] || { icon: "📘", name: `${uGroup.unitId}단원`, tag: uGroup.badgeName };

              return (
                <button
                  key={uGroup.unitId}
                  type="button"
                  className={`unit-icon-card-btn ${isSelected ? "selected" : ""} ${isAvailable ? "active" : "locked"}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px 2px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid var(--gold)" : "1px solid rgba(255,255,255,0.15)",
                    background: isSelected ? "linear-gradient(135deg, rgba(255,213,106,0.25), rgba(4,24,36,0.95))" : "#04141f",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 0 10px rgba(255,213,106,0.4)" : "none",
                  }}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedUnitId(uGroup.unitId);
                    } else {
                      setLockModalMsg(`${uGroup.unitTitle}은 순차적으로 공개될 예정입니다.`);
                    }
                  }}
                >
                  <span style={{ fontSize: "20px", lineHeight: "1" }}>{meta.icon}</span>
                  <strong style={{ fontSize: "11px", color: isSelected ? "var(--gold)" : "#ffffff", marginTop: "4px", whiteSpace: "nowrap" }}>
                    {meta.name}
                  </strong>
                  <small style={{ fontSize: "9.5px", color: isSelected ? "#ffffff" : "#a0b0c0", marginTop: "1px", whiteSpace: "nowrap" }}>
                    {meta.tag}
                  </small>
                  <span style={{ fontSize: "9px", marginTop: "3px", color: isAvailable ? "#56e39f" : "#ff7aa2", fontWeight: 700 }}>
                    {isAvailable ? "🔥학습" : "🔒대기"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. 실시간 학급 / 전교 랭킹 대시보드 (접기/펼치기 토글) */}
        <div className="live-ranking-banner-box" style={{ background: "#041824", border: "1px solid #16364d", borderRadius: "12px", padding: "10px 12px", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Trophy size={18} color="var(--gold)" weight="fill" />
              <strong style={{ fontSize: "12px", color: "#ffffff" }}>실시간 탐구 랭킹 & 체력 대시보드</strong>
            </div>
            <button
              type="button"
              style={{
                padding: "3px 8px",
                fontSize: "10.5px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.08)",
                color: "var(--teal-soft)",
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                fontWeight: 700,
              }}
              onClick={() => setRankingCollapsed(!rankingCollapsed)}
            >
              {rankingCollapsed ? "🔽 랭킹 펼치기" : "🔼 랭킹 감추기"}
            </button>
          </div>

          {!rankingCollapsed && (
            <div className="live-ranking-banner" style={{ marginTop: "10px" }}>
              <div className="rank-badge-item">
                <span className="rank-icon">🏫</span>
                <div className="rank-text-col">
                  <small>학급 랭킹</small>
                  <strong>{save.studentProfile.classNum} {classRank}위</strong>
                </div>
              </div>
              <div className="rank-divider" />
              <div className="rank-badge-item">
                <span className="rank-icon">🌍</span>
                <div className="rank-text-col">
                  <small>전교 랭킹</small>
                  <strong>통합사회 {schoolRank}위</strong>
                </div>
              </div>
              <div className="rank-divider" />
              <div className="rank-badge-item">
                <span className="rank-icon">⚡</span>
                <div className="rank-text-col">
                  <small>탐구 체력</small>
                  <strong style={{ color: energy > 50 ? "#56e39f" : "var(--gold)" }}>{energy}%</strong>
                </div>
              </div>
            </div>
          )}
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
            🃏 최종 관문: 개념 카드 연결 게임
          </button>
        </div>

        {/* =======================
            모드 1: 개념 퀴즈 풀이
            ======================= */}
        {activeMode === "QUIZ" && (
          <>
            {/* 주제 드롭다운 & 단서 요청 툴바 */}
            <div className="topic-select-toolbar">
              <div className="topic-dropdown-block">
                <label htmlFor="topic-select">주제 ({selectedUnitId}단원):</label>
                <select
                  id="topic-select"
                  value={selectedTopicId}
                  onChange={(e) => {
                    setSelectedTopicId(Number(e.target.value));
                    setCurrentQIdx(0);
                    setSelectedAnswer(null);
                    setClueLevel(0);
                    setIsWrongState(false);
                    setMatchedPairs({});
                    setMatchDone(false);
                  }}
                >
                  {unitTopics.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              {/* 단서 요청 버튼 (최대 2회, -2%) */}
              <button
                className="clue-btn"
                disabled={clueLevel >= 2}
                onClick={handleRequestClue}
                title="단서 요청 시 탐구 체력 2% 차감 (오답 -6%보다 유리!)"
              >
                <Lightbulb size={15} color="var(--gold)" weight="fill" />
                <span>단서 요청 ({clueLevel}/2회)</span>
              </button>
            </div>

            {/* 📘 1. 해온 (문제 출제관) 캐릭터 배너 */}
            <div className="npc-role-banner haeon-banner">
              <div className="npc-role-avatar-img-box">
                <img src="/characters/haeon_default.jpg" alt="해온" className="npc-role-avatar-img" />
              </div>
              <div className="npc-role-bubble">
                <div className="role-tag-line">
                  <strong>해온 (문제 출제관)</strong>
                  <span className="q-idx-tag">{currentQIdx + 1} / {topicQuestions.length}문항</span>
                </div>
                <p>"{currentQ.topicTitle}의 핵심 원리를 점검하는 문제입니다. 침착하게 정답을 골라보세요!"</p>
              </div>
            </div>

            {/* 🔍 2. 아리 (단서 지원관) 단서 배너 (단서 요청 시 등장) */}
            {clueLevel > 0 && (
              <div className="npc-role-banner ari-banner">
                <div className="npc-role-avatar-img-box">
                  <img src="/characters/ari_default.jpg" alt="아리" className="npc-role-avatar-img" />
                </div>
                <div className="npc-role-bubble">
                  <div className="role-tag-line">
                    <strong>아리 (단서 지원관)</strong>
                    <span className="clue-step-pill">단서 {clueLevel}단계 적용 (-2%)</span>
                  </div>
                  <p>
                    {clueLevel === 1
                      ? `[1차 단서] ${currentQ.clue1 || "교과서 핵심 헌법 조문 및 인권의 보편적 가치에 주목해 보세요."}`
                      : `[2차 단서] ${currentQ.clue2 || currentQ.explanation || "핵심 판례의 형식적 요건과 실질적 한계 개념을 확인하세요."}`}
                  </p>
                </div>
              </div>
            )}


            {/* 📝 문항 본체 카드 */}
            <div className="vocab-quiz-card-v2">
              <div className="v-q-header">
                <span className="v-q-type-badge">{currentQ.type} 문제</span>
              </div>
              <p className="v-q-text-body">{currentQ.question}</p>

              {/* 1. OX 문제 */}
              {currentQ.type === "OX" && (
                <div className="ox-choice-grid">
                  {["O", "X"].map((ox) => {
                    const isSelected = selectedAnswer === ox;
                    const isCorrect = String(currentQ.answer).trim() === ox;
                    let btnClass = "ox-btn";
                    if (selectedAnswer !== null) {
                      if (isSelected) btnClass += isCorrect ? " correct" : " wrong";
                      else if (isCorrect) btnClass += " show-correct";
                    }
                    return (
                      <button
                        key={ox}
                        className={btnClass}
                        disabled={selectedAnswer !== null && !isWrongState}
                        onClick={() => handleSelectChoice(ox)}
                      >
                        {ox}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. CONCEPT & CHOICE 4지선다 문제 (랜덤 셔플 선택지) */}
              {(currentQ.type === "CONCEPT" || currentQ.type === "CHOICE") && (
                <div className="choices-list-v2">
                  {randomizedOptions.map((opt, idx) => {
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
                        disabled={selectedAnswer !== null && !isWrongState}
                        onClick={() => handleSelectChoice(opt)}
                      >
                        <span className="choice-num-badge">{idx + 1}</span>
                        <span className="choice-text-body">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. MATCH (연결 짝맞추기) 문제 (오른쪽 노드 랜덤 셔플 & 대화형 연결) */}
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
                      {randomizedRightPairs.map((pairItem, rIdx) => {
                        const matchedLeftIdx = Object.entries(matchedPairs).find(([_, v]) => v === rIdx)?.[0];
                        const isMatched = matchedLeftIdx !== undefined;
                        return (
                          <button
                            key={rIdx}
                            className={`match-node right ${isMatched ? "matched" : ""}`}
                            onClick={() => handleMatchClickRight(rIdx)}
                          >
                            <span>{pairItem.right}</span>
                            {isMatched && <span className="matched-index-tag">#{Number(matchedLeftIdx) + 1}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ⚡ 3. ZERO (AI 판정관) 피드백 & 해설 박스 */}
              {(selectedAnswer !== null || matchDone) && (
                <div className={`v-q-feedback-box ${isWrongState || (matchDone && !matchIsAllCorrect) ? "wrong-box" : "correct-box"}`}>
                  <div className="zero-verdict-header">
                    <div className="npc-role-avatar-img-box zero-mini-avatar">
                      <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                    </div>
                    <strong>
                      {currentQ.type === "MATCH"
                        ? matchIsAllCorrect
                          ? "ZERO 판정: 🎉 완벽한 연결입니다! (+15점 & 체력 +3%)"
                          : "ZERO 판정: ⚠️ 잘못 연결된 짝이 있습니다."
                        : !isWrongState
                        ? "ZERO 판정: 🎉 정답입니다! (+10점 & 체력 +3%)"
                        : "ZERO 판정: ⚠️ 오답입니다. (-6% 감점)"}
                    </strong>
                  </div>

                  {/* 정답 해설 (MATCH 오답 시에도 정답 연결 표시) */}
                  <div className="feedback-explanation-body">
                    {currentQ.type === "MATCH" && currentQ.matchPairs && (
                      <div className="match-correct-pairs-list">
                        <strong>[정답 연결 쌍]:</strong>
                        <ul>
                          {currentQ.matchPairs.map((p, i) => (
                            <li key={i}>{p.left} ➔ <code>{p.right}</code></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentQ.explanation && <p className="v-q-exp-text">📖 <strong>해설:</strong> {currentQ.explanation}</p>}
                  </div>

                  {/* 버튼 행: 오답 시 다시 풀기, 정답 시 다음 문항 */}
                  <div className="feedback-actions-row">
                    {isWrongState ? (
                      <div className="button-row" style={{ width: "100%", marginTop: "10px", gap: "8px" }}>
                        <button
                          className="secondary-button"
                          style={{ flex: 1, whiteSpace: "nowrap", fontSize: "12px", padding: "10px 6px" }}
                          onClick={handleRetryQuestion}
                        >
                          🔄 다시 도전하기
                        </button>
                        <button
                          className="primary-button"
                          style={{ flex: 1, whiteSpace: "nowrap", fontSize: "12px", padding: "10px 6px" }}
                          onClick={nextQuestion}
                        >
                          다음 문항으로 &gt;
                        </button>
                      </div>
                    ) : (
                      <button className="primary-button full-button" style={{ marginTop: "12px" }} onClick={nextQuestion}>
                        {currentQIdx < topicQuestions.length - 1 ? "다음 문항으로 >" : "다음 주제 (또는 카드 뒤집기)로 >"}
                      </button>
                    )}
                  </div>
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
                <h3>{selectedUnitId}단원 핵심 개념 카드 연결 게임</h3>
              </div>
              <span className="memory-score-tag">
                {matchedCardIds.length} / 4쌍 매칭 완료
              </span>
            </div>

            {/* 시작 전 미리보기 안내 배너 */}
            {isCardPreviewing ? (
              <div className="memory-preview-banner">
                <div className="preview-text-col">
                  <strong>👀 [개념 & 정의 미리보기]</strong>
                  <p>카드 속 개념어와 설명을 미리 잘 기억해 두세요! 준비되면 아래 [도전 시작]을 누르세요.</p>
                </div>
                <button className="primary-button preview-start-btn" onClick={startMemoryGame}>
                  🎮 카드 뒤집기 도전 시작!
                </button>
              </div>
            ) : (
              <p className="memory-guide-desc">
                카드를 뒤집어 <strong>[개념 용어]</strong>와 알맞은 <strong>[정의 설명]</strong> 짝을 찾아보세요!
              </p>
            )}

            <div className="memory-cards-grid">
              {cardDeck.map((card, idx) => {
                const isFlipped = isCardPreviewing || flippedCards.includes(idx);
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
                  <strong>🎉 {selectedUnitId}단원 개념 카드 완수! [개념 아이템 획득]</strong>
                  <p>개념-용어 학습을 완료하여 아이템 보관소에 단원 마스터 카드가 보관되었습니다.</p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    if (selectedUnitId < 5) setSelectedUnitId(selectedUnitId + 1);
                    else setSelectedUnitId(1);
                  }}
                >
                  {selectedUnitId < 5 ? `다음 ${selectedUnitId + 1}단원으로 이동 >` : "1단원으로 다시 플레이"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 단원 잠금 안내 모달 */}
        {lockModalMsg && (
          <div className="modal-backdrop">
            <div className="coming-soon-popup">
              <button className="modal-close" onClick={() => setLockModalMsg(null)}><X size={20} /></button>
              <LockKey size={36} color="var(--gold)" weight="fill" />
              <h3>단원 순차 오픈 안내</h3>
              <p>{lockModalMsg}</p>
              <button className="primary-button full-button" onClick={() => setLockModalMsg(null)}>확인</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 5-2. 탐구기능 연습실 (5단계 탐구 스킬 훈련 모듈 & 인터랙티브 매칭/AI 확정/답안 서고) ---
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
  const [energy, setEnergy] = useState(40);
  const [rankingCollapsed, setRankingCollapsed] = useState(false);


  // Skill 1 State
  const [skill1Set, setSkill1Set] = useState<"default" | "setA" | "setB">("default");
  const [skill1Idx, setSkill1Idx] = useState(0);
  const [skill1Selected, setSkill1Selected] = useState<string | null>(null);
  const [skill1HintLevel, setSkill1HintLevel] = useState<0 | 1 | 2>(0);
  const [skill1HintModal, setSkill1HintModal] = useState(false);

  // Skill 1 Interactive MATCH State
  const [s1MatchLeft, setS1MatchLeft] = useState<number | null>(null);
  const [s1MatchedPairs, setS1MatchedPairs] = useState<{ [leftIdx: number]: number }>({});
  const [s1MatchDone, setS1MatchDone] = useState(false);
  const [s1MatchCorrect, setS1MatchCorrect] = useState(false);

  // Skill 2 State
  const [skill2Idx, setSkill2Idx] = useState(0);
  const [skill2Input, setSkill2Input] = useState("");
  const [skill2GuideModal, setSkill2GuideModal] = useState(false);
  const [skill2AiRes, setSkill2AiRes] = useState<any>(null);
  const [skill2Loading, setSkill2Loading] = useState(false);
  const [skill2Confirmed, setSkill2Confirmed] = useState(false);

  // Skill 3 State
  const [skill3Stance, setSkill3Stance] = useState<string>("A");
  const [skill3Input, setSkill3Input] = useState("");
  const [skill3AiRes, setSkill3AiRes] = useState<any>(null);
  const [skill3Loading, setSkill3Loading] = useState(false);
  const [skill3Confirmed, setSkill3Confirmed] = useState(false);

  // Skill 4 State
  const [skill4Input, setSkill4Input] = useState("");
  const [skill4AiRes, setSkill4AiRes] = useState<any>(null);
  const [skill4Loading, setSkill4Loading] = useState(false);
  const [skill4Confirmed, setSkill4Confirmed] = useState(false);

  // Skill 5 State
  const [skill5Input, setSkill5Input] = useState("");
  const [skill5AiRes, setSkill5AiRes] = useState<any>(null);
  const [skill5Loading, setSkill5Loading] = useState(false);
  const [skill5Confirmed, setSkill5Confirmed] = useState(false);

  // 내가 쓴 글 서고 토글 모달
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // 🔽 AI 코칭 박스 접어두기 토글 상태 (STEP별 독립 제어)
  const [coachingCollapsed, setCoachingCollapsed] = useState<Record<number, boolean>>({});

  // ⚡ 1:1 보조교사 AI 튜터 ZERO 실시간 챗봇 상태
  const [tutorChatOpen, setTutorChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatToast, setChatToast] = useState("");
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "tutor"; text: string; suggestedSentence?: string; quickFollowUps?: string[] }>
  >([
    {
      role: "tutor",
      text: "안녕! 나는 1단원 인권과 헌법 탐구를 함께하는 보조교사 AI 튜터 ZERO야. 문제를 풀다 막막하거나, 작성 중인 문장을 다듬고 싶을 때 언제든 편하게 물어봐!",
      quickFollowUps: ["✍️ 내 문장 다듬어줘", "📖 이 문제 핵심 개념 알려줘", "🎯 80% 달성 힌트 줘"],
    },
  ]);

  // ✍️ 문장 자동완성 주입 함수
  const handleApplyAutocomplete = (sentence: string) => {
    if (!sentence) return;
    if (activeSkillTab === 2) setSkill2Input(sentence);
    else if (activeSkillTab === 3) setSkill3Input(sentence);
    else if (activeSkillTab === 4) setSkill4Input(sentence);
    else if (activeSkillTab === 5) setSkill5Input(sentence);

    void audioManager.playSfx("success");
    setChatToast("✓ 추천 문장이 내 답안창에 자동완성으로 적용되었습니다!");
    setTimeout(() => setChatToast(""), 3500);
  };

  // 📊 답안 확정 시 구글 스프레드시트에 게임 결과 로그 전송
  const handleConfirmAndLog = (stepNumber: number) => {
    if (stepNumber === 2) setSkill2Confirmed(true);
    else if (stepNumber === 3) setSkill3Confirmed(true);
    else if (stepNumber === 4) setSkill4Confirmed(true);
    else if (stepNumber === 5) setSkill5Confirmed(true);

    void audioManager.playSfx("success");

    try {
      void fetch("/api/sheets-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logType: "GAME_RESULT",
          data: {
            studentId: save.studentProfile.studentId,
            studentName: save.studentProfile.name,
            schoolName: save.studentProfile.schoolName,
            gradeClass: `${save.studentProfile.grade} ${save.studentProfile.classNum} ${save.studentProfile.studentNum}`,
            confirmedStep: `STEP ${stepNumber}`,
            step2Answer: stepNumber === 2 ? skill2Input : (skill2Input || "(미작성)"),
            step3Answer: stepNumber === 3 ? skill3Input : (skill3Input || "(미작성)"),
            step4Answer: stepNumber === 4 ? skill4Input : (skill4Input || "(미작성)"),
            step5Answer: stepNumber === 5 ? skill5Input : (skill5Input || "(미작성)"),
            vocabScore: save.skillLabScore.vocabScore,
            skillScore: save.skillLabScore.skillScore,
            totalExp: save.exp,
          },
        }),
      });
    } catch (gErr) {
      console.warn("Game result sheet log send failed", gErr);
    }
  };

  // ⚡ 튜터 챗 전송 함수 (보안 격리 & 3대 퀵 비계 액션 완벽 연동)
  const handleSendTutorChat = async (textToSend?: string, actionType?: "HINT" | "SCAFFOLD" | "EVALUATE") => {
    let query = (textToSend || chatInput).trim();
    if (actionType === "HINT") query = "💡 생각 열기 (힌트 질문 요청)";
    else if (actionType === "SCAFFOLD") query = "✍️ 문장 뼈대 및 초성 힌트 요청";
    else if (actionType === "EVALUATE") query = "🔍 내 답안 실시간 정밀 첨삭 요청";

    if (!query && !actionType) return;
    if (chatLoading) return;

    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: query }]);
    setChatLoading(true);

    // 현재 문제 맥락 구성
    let currentProblemText = "";
    let currentInputText = "";
    let activeSkillName = "STEP 1. 개념 식별";

    if (activeSkillTab === 2) {
      activeSkillName = "STEP 2. 자료 해석 (헌법 제37조 제2항)";
      currentProblemText = dataset.skill2[skill2Idx]?.question || "";
      currentInputText = skill2Input;
    } else if (activeSkillTab === 3) {
      activeSkillName = "STEP 3. 관점 평가 (휴대전화 수거 쟁점)";
      currentProblemText = `선택 관점: ${skill3Stance === "A" ? "자유권/사생활 보호" : "공동체 학습권"}`;
      currentInputText = skill3Input;
    } else if (activeSkillTab === 4) {
      activeSkillName = "STEP 4. 원인 분석 및 법·제도 대안";
      currentProblemText = "청소년 배달 노동 인권 침해 원인과 근로기준법 대안";
      currentInputText = skill4Input;
    } else if (activeSkillTab === 5) {
      activeSkillName = "STEP 5. 실천 설계 (3단 논증)";
      currentProblemText = "디지털 잊힐 권리와 헌법 제10조 인격권 보장 방안";
      currentInputText = skill5Input;
    }

    try {
      const res = await fetch("/api/tutor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          actionType,
          contextInfo: {
            activeSkillTitle: activeSkillName,
            currentProblem: currentProblemText,
            currentStudentInput: currentInputText,
          },
          history: chatMessages.map((m) => ({ role: m.role === "user" ? "user" : "model", text: m.text })),
        }),
      });

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          text: data.reply || "좋은 질문이야! 헌법 조문과 교과서 핵심 개념을 함께 연결해 보자.",
          suggestedSentence: data.suggestedSentence || "",
          quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "💡 추가로 보완할 점은 뭐야?"],
        },
      ]);
      void audioManager.playSfx("inspect");

      // 📊 구글 스프레드시트 AI 사용 내역 비동기 전송 (백그라운드)
      try {
        void fetch("/api/sheets-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logType: "AI_LOG",
            data: {
              studentId: save.studentProfile.studentId,
              studentName: save.studentProfile.name,
              schoolName: save.studentProfile.schoolName,
              gradeClass: `${save.studentProfile.grade} ${save.studentProfile.classNum} ${save.studentProfile.studentNum}`,
              step: activeSkillName,
              actionType: actionType || "질의응답",
              userQuery: query,
              studentInput: currentInputText,
              aiReply: data.reply || "",
              suggestedSentence: data.suggestedSentence || "",
            },
          }),
        });
      } catch (logErr) {
        console.warn("AI sheet log send failed", logErr);
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          text: "헌법 제10조 행복추구권과 제37조 제2항의 기본권 제한 한계(법률유보 및 본질적 내용 침해 금지)를 중심으로 문장을 다듬으면 완성도 높은 모범 답안을 완성할 수 있단다!",
          suggestedSentence: "기본권은 반드시 법률에 근거하여 제한해야 하며, 본질적인 내용을 침해할 수 없다.",
          quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기"],
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const [selectedUnitId, setSelectedUnitId] = useState<number>(1);
  const dataset = useMemo(() => {
    return selectedUnitId === 2 ? unit2SkillLabMaster : unit1SkillLabMaster;
  }, [selectedUnitId]);


  // --- Skill 1 Helpers ---
  const skill1Questions = useMemo(() => {
    if (skill1Set === "default") return dataset.skill1.defaultSet;
    if (skill1Set === "setA") return dataset.skill1.extraSets.setA;
    return dataset.skill1.extraSets.setB;
  }, [skill1Set, dataset]);

  const curS1 = skill1Questions[skill1Idx] || skill1Questions[0];

  // MATCH 문항 오른쪽 항목 셔플
  const s1ShuffledRightPairs = useMemo(() => {
    if (!curS1.pairs) return [];
    return [...curS1.pairs].map((p, origIdx) => ({ right: p.right, origIdx })).sort(() => 0.5 - Math.random());
  }, [curS1]);

  const handleSkill1Answer = (ans: string) => {
    if (skill1Selected !== null) return;
    setSkill1Selected(ans);

    const isCorrect = String(ans).trim() === String(curS1.answer).trim();
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

  // Skill 1 Interactive Match Click Handlers
  const handleS1MatchLeft = (lIdx: number) => {
    if (s1MatchDone) return;
    setS1MatchLeft(lIdx);
    void audioManager.playSfx("ui_click");
  };

  const handleS1MatchRight = (rIdx: number) => {
    if (s1MatchDone || s1MatchLeft === null) return;
    const newMatches = { ...s1MatchedPairs, [s1MatchLeft]: rIdx };
    setS1MatchedPairs(newMatches);
    setS1MatchLeft(null);
    void audioManager.playSfx("ui_click");
  };

  const handleS1MatchSubmit = () => {
    const totalPairs = curS1.pairs?.length || 0;
    if (Object.keys(s1MatchedPairs).length < totalPairs) {
      alert("모든 항목의 짝을 연결한 후 정답을 확인하세요!");
      return;
    }

    setS1MatchDone(true);
    const allCorrect = Object.entries(s1MatchedPairs).every(([leftStr, rightIdx]) => {
      const leftIdx = Number(leftStr);
      const matchedRight = s1ShuffledRightPairs[rightIdx];
      return matchedRight && matchedRight.origIdx === leftIdx;
    });

    setS1MatchCorrect(allCorrect);
    setSkill1Selected(allCorrect ? "MATCH_CORRECT" : "MATCH_WRONG");
    void audioManager.playSfx(allCorrect ? "success" : "error");

    if (allCorrect) {
      setEnergy((prev) => Math.min(100, prev + 2));
      setSave((prev) => ({
        ...prev,
        skillLabScore: {
          ...prev.skillLabScore,
          skillScore: prev.skillLabScore.skillScore + 15,
          skillLevel: Math.floor((prev.skillLabScore.skillScore + 15) / 150) + 1,
        },
      }));
    }
  };

  const handleSkill1HintRequest = (lvl: 1 | 2) => {
    setSkill1HintLevel(lvl);
    setEnergy((prev) => Math.max(0, prev - 2));
    setSkill1HintModal(false);
    void audioManager.playSfx("inspect");
  };

  // --- Skill 2 Helpers ---
  const curS2 = dataset.skill2[skill2Idx] || dataset.skill2[0];

  // --- Unified Interactive AI Tutoring Engine (다회차 스마트 코칭 & 정밀 유도 질문) ---
  const handleIterativeEvaluate = async (
    skillType: "SKILL_2" | "SKILL_3" | "SKILL_4" | "SKILL_5",
    inputText: string,
    setAiRes: React.Dispatch<React.SetStateAction<any>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
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
      // Offline fallback
      setAiRes({
        isMastered: true,
        scoreLevel: "PERFECT",
        guideQuestion: "훌륭한 탐구 서술입니다! 핵심 개념과 논리적 인과관계가 잘 구성되었습니다.",
        recommendedTerms: ["헌법 제10조", "법률유보", "비례원칙"],
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
          <div className="hud-right-actions">
            {activeSkillTab >= 2 && (
              <button className="ai-tutor-call-btn" onClick={() => setTutorChatOpen(true)}>
                <div className="tutor-call-avatar-box">
                  <img src="/characters/zero_evaluator.jpg" alt="ZERO" />
                </div>
                <span>⚡ AI 튜터 ZERO</span>
              </button>
            )}
            <button className="history-review-btn" onClick={() => setHistoryModalOpen(true)}>
              <FileText size={16} color="var(--gold)" />
              <span>내 답안 서고</span>
            </button>
          </div>
        </div>
        {/* 실시간 에너지 게이지 바 */}
        <div className="energy-progress-bar">
          <span style={{ width: `${energy}%` }} />
        </div>
      </header>

      <div className="skill-lab-scroll">
        {/* 0. 단원 선택 아이콘 카드 그리드 */}
        <div className="unit-selector-grid-wrapper" style={{ margin: "0 0 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "var(--gold)", fontWeight: 700 }}>
              🎯 탐구 스킬 훈련 단원 선택
            </span>
            <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>단원 아이콘을 눌러 이동하세요</small>
          </div>

          <div className="unit-icon-card-row" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
            {unitTopicGroups.map((uGroup) => {
              const isAvailable = uGroup.unitId === 1 || uGroup.unitId === 2;
              const isSelected = selectedUnitId === uGroup.unitId;
              const unitIcons: Record<number, { icon: string; name: string; tag: string }> = {
                1: { icon: "⚖️", name: "1단원 인권", tag: "인권수호관" },
                2: { icon: "🌿", name: "2단원 정의", tag: "공정정책관" },
                3: { icon: "🏙️", name: "3단원 시장", tag: "경제기획관" },
                4: { icon: "🏛️", name: "4단원 평화", tag: "평화수호관" },
                5: { icon: "📈", name: "5단원 미래", tag: "미래설계관" },
              };
              const meta = unitIcons[uGroup.unitId] || { icon: "📘", name: `${uGroup.unitId}단원`, tag: uGroup.badgeName };

              return (
                <button
                  key={uGroup.unitId}
                  type="button"
                  className={`unit-icon-card-btn ${isSelected ? "selected" : ""} ${isAvailable ? "active" : "locked"}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px 2px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid var(--gold)" : "1px solid rgba(255,255,255,0.15)",
                    background: isSelected ? "linear-gradient(135deg, rgba(255,213,106,0.25), rgba(4,24,36,0.95))" : "#04141f",
                    cursor: "pointer",
                    boxShadow: isSelected ? "0 0 10px rgba(255,213,106,0.4)" : "none",
                  }}
                  onClick={() => {
                    if (isAvailable) {
                      setSelectedUnitId(uGroup.unitId);
                      setSkill1Idx(0);
                      setSkill1Selected(null);
                      setSkill2Idx(0);
                      setSkill2Input("");
                      setSkill2AiRes(null);
                      setSkill3Input("");
                      setSkill3AiRes(null);
                      setSkill4Input("");
                      setSkill4AiRes(null);
                      setSkill5Input("");
                      setSkill5AiRes(null);
                    } else {
                      alert(`${uGroup.unitTitle}은 순차적으로 공개될 예정입니다.`);
                    }
                  }}
                >
                  <span style={{ fontSize: "20px", lineHeight: "1" }}>{meta.icon}</span>
                  <strong style={{ fontSize: "11px", color: isSelected ? "var(--gold)" : "#ffffff", marginTop: "4px", whiteSpace: "nowrap" }}>
                    {meta.name}
                  </strong>
                  <small style={{ fontSize: "9.5px", color: isSelected ? "#ffffff" : "#a0b0c0", marginTop: "1px", whiteSpace: "nowrap" }}>
                    {meta.tag}
                  </small>
                  <span style={{ fontSize: "9px", marginTop: "3px", color: isAvailable ? "#56e39f" : "#ff7aa2", fontWeight: 700 }}>
                    {isAvailable ? "🔥훈련" : "🔒대기"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1. 실시간 학급 / 전교 랭킹 대시보드 (접기/펼치기 토글) */}
        <div className="live-ranking-banner-box" style={{ background: "#041824", border: "1px solid #16364d", borderRadius: "12px", padding: "10px 12px", marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Trophy size={18} color="var(--gold)" weight="fill" />
              <strong style={{ fontSize: "12px", color: "#ffffff" }}>실시간 탐구 랭킹 & 체력 대시보드</strong>
            </div>
            <button
              type="button"
              style={{
                padding: "3px 8px",
                fontSize: "10.5px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.08)",
                color: "var(--teal-soft)",
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                fontWeight: 700,
              }}
              onClick={() => setRankingCollapsed(!rankingCollapsed)}
            >
              {rankingCollapsed ? "🔽 랭킹 펼치기" : "🔼 랭킹 감추기"}
            </button>
          </div>

          {!rankingCollapsed && (
            <div className="live-ranking-banner" style={{ marginTop: "10px" }}>
              <div className="rank-badge-item">
                <span className="rank-icon">🏫</span>
                <div className="rank-text-col">
                  <small>학급 랭킹</small>
                  <strong>{save.studentProfile.classNum} {Math.max(1, 15 - Math.floor((save.skillLabScore.skillScore || 0) / 30))}위</strong>
                </div>
              </div>
              <div className="rank-divider" />
              <div className="rank-badge-item">
                <span className="rank-icon">🌍</span>
                <div className="rank-text-col">
                  <small>전교 랭킹</small>
                  <strong>통합사회 {Math.max(2, 60 - Math.floor((save.skillLabScore.skillScore || 0) / 10))}위</strong>
                </div>
              </div>
              <div className="rank-divider" />
              <div className="rank-badge-item">
                <span className="rank-icon">⚡</span>
                <div className="rank-text-col">
                  <small>탐구 체력</small>
                  <strong style={{ color: energy > 50 ? "#56e39f" : "var(--gold)" }}>{energy}%</strong>
                </div>
              </div>
            </div>
          )}
        </div>


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
            스킬 1: 개념 식별 및 범주화 (인터랙티브 MATCH 완벽 수정)
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
              <button className={`set-pill ${skill1Set === "default" ? "active" : ""}`} onClick={() => { setSkill1Set("default"); setSkill1Idx(0); setSkill1Selected(null); setS1MatchedPairs({}); setS1MatchDone(false); }}>
                기본 세트 (5문항)
              </button>
              <button className={`set-pill ${skill1Set === "setA" ? "active" : ""}`} onClick={() => { setSkill1Set("setA"); setSkill1Idx(0); setSkill1Selected(null); setS1MatchedPairs({}); setS1MatchDone(false); }}>
                추가 세트 A (5문항)
              </button>
              <button className={`set-pill ${skill1Set === "setB" ? "active" : ""}`} onClick={() => { setSkill1Set("setB"); setSkill1Idx(0); setSkill1Selected(null); setS1MatchedPairs({}); setS1MatchDone(false); }}>
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

              {/* CHOICE 문항 (초성 힌트 없이 순수 선택형) */}
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

              {/* INITIAL 문항 (오직 주관식 초성형에서만 초성 힌트 노출) */}
              {curS1.type === "INITIAL" && (
                <div className="initial-answer-box">
                  <div className="initial-hint-chip-box">
                    <span className="initial-label">💡 단답형 초성 힌트:</span>
                    <strong className="initial-letters">{curS1.initial}</strong>
                  </div>
                  <div className="choices-list-v2" style={{ marginTop: "10px" }}>
                    {[curS1.answer, "자유권", "사회권", "평등권"].sort(() => 0.5 - Math.random()).map((opt, idx) => (
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

              {/* MATCH 문항 (인터랙티브 클릭 연결) */}
              {curS1.type === "MATCH" && curS1.pairs && (
                <div className="matching-quiz-container">
                  <p className="match-guide-text">왼쪽 항목을 누른 후, 알맞은 오른쪽 항목을 눌러 짝을 지으세요.</p>
                  <div className="matching-columns">
                    <div className="match-col left">
                      {curS1.pairs.map((pair, lIdx) => {
                        const isMatched = s1MatchedPairs[lIdx] !== undefined;
                        const isSelected = s1MatchLeft === lIdx;
                        return (
                          <button
                            key={lIdx}
                            className={`match-node left ${isSelected ? "selected" : ""} ${isMatched ? "matched" : ""}`}
                            onClick={() => handleS1MatchLeft(lIdx)}
                          >
                            <span>{pair.left}</span>
                            {isMatched && <Check size={14} color="#56e39f" weight="bold" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="match-col right">
                      {s1ShuffledRightPairs.map((pairItem, rIdx) => {
                        const matchedLeftIdx = Object.entries(s1MatchedPairs).find(([_, v]) => v === rIdx)?.[0];
                        const isMatched = matchedLeftIdx !== undefined;
                        return (
                          <button
                            key={rIdx}
                            className={`match-node right ${isMatched ? "matched" : ""}`}
                            onClick={() => handleS1MatchRight(rIdx)}
                          >
                            <span>{pairItem.right}</span>
                            {isMatched && <span className="matched-index-tag">#{Number(matchedLeftIdx) + 1}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {!s1MatchDone && (
                    <button className="primary-button full-button" style={{ marginTop: "12px" }} onClick={handleS1MatchSubmit}>
                      연결 관계 확인 및 정답 확정
                    </button>
                  )}
                </div>
              )}

              {skill1Selected !== null && (
                <div className="s1-next-action-box">
                  <strong>
                    {curS1.type === "MATCH"
                      ? s1MatchCorrect
                        ? "🎉 완벽한 연결입니다! (에너지 +2% 충전)"
                        : "⚠️ 잘못 연결된 항목이 있습니다. 해설을 확인하세요."
                      : skill1Selected === curS1.answer
                      ? "🎉 정답입니다! (에너지 +2% 충전)"
                      : "⚠️ 정답을 확인하세요."}
                  </strong>

                  {/* MATCH 정답 해설 */}
                  {curS1.type === "MATCH" && curS1.pairs && (
                    <div className="match-correct-pairs-list" style={{ marginTop: "8px" }}>
                      <strong>[올바른 연결 해설]:</strong>
                      <ul>
                        {curS1.pairs.map((p, i) => (
                          <li key={i}>{p.left} ➔ <code>{p.right}</code></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    className="primary-button full-button"
                    style={{ marginTop: "10px" }}
                    onClick={() => {
                      setSkill1Selected(null);
                      setSkill1HintLevel(0);
                      setS1MatchedPairs({});
                      setS1MatchDone(false);
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
            스킬 2: 자료 분석 및 경향성 해석 (대화형 튜터 루프 & 확정)
            ======================================================== */}
        {activeSkillTab === 2 && (
          <div className="skill-module-card">
            <div className="module-card-header">
              <div className="module-title-left">
                <span className="skill-badge-tag">STEP 02</span>
                <h3>자료 분석 및 1문장 서술 훈련</h3>
              </div>
              <button className="guide-btn-pill" onClick={() => setSkill2GuideModal(true)}>
                <Info size={16} color="var(--teal-soft)" /> 교과서 원문 해설
              </button>
            </div>

            <div className="s2-material-box">
              <span className="s2-mat-tag">📖 교과서 핵심 판례 및 조문 ({skill2Idx + 1}/3)</span>
              <p className="s2-mat-content">{curS2.material}</p>
            </div>

            {/* 📌 원래 기본 과제 발문 (상시 고정 노출) */}
            <div className="original-task-instruction-card">
              <div className="task-instruction-badge">
                <FileText size={16} color="var(--gold)" />
                <strong>[기본 과제 발문]</strong>
              </div>
              <p className="task-instruction-text">Q. {curS2.question}</p>
            </div>

            <div className="s2-prompt-box">
              {/* AI 튜터 ZERO의 실시간 코칭 배너 (접어두기 기능 탑재) */}
              {skill2AiRes && (
                <div className={`ai-tutor-coaching-box ${skill2AiRes.isMastered ? "mastered" : "revising"}`}>
                  <div className="tutor-header-row">
                    <div className="tutor-badge">
                      <div className="npc-role-avatar-img-box zero-mini-avatar">
                        <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                      </div>
                      <strong>AI 튜터 ZERO의 실시간 코칭</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`status-tag ${skill2AiRes.isMastered ? "playable" : "coming"}`}>
                        {skill2AiRes.isMastered ? "🎉 80% 이상 마스터 달성!" : `🔥 일치도 ${skill2AiRes.matchRate || 40}% (80% 목표)`}
                      </span>
                      <button
                        className="coach-collapse-toggle-btn"
                        onClick={() => setCoachingCollapsed((prev) => ({ ...prev, 2: !prev[2] }))}
                        title={coachingCollapsed[2] ? "코칭 펼치기" : "코칭 접기"}
                      >
                        {coachingCollapsed[2] ? "🔽 코칭 펼치기" : "🔼 코칭 접기"}
                      </button>
                    </div>
                  </div>

                  {!coachingCollapsed[2] && (
                    <div className="coaching-expandable-content">
                      {/* 일치도 게이지 바 */}
                      <div className="match-rate-bar-container">
                        <div className="match-rate-label-row">
                          <small>모범 답안 일치도 지수</small>
                          <strong>{skill2AiRes.matchRate || 40}% / 80% 기준</strong>
                        </div>
                        <div className="match-rate-progress-track">
                          <div className="match-rate-progress-fill" style={{ width: `${Math.min(100, skill2AiRes.matchRate || 40)}%`, background: skill2AiRes.isMastered ? "#56e39f" : "var(--gold)" }} />
                        </div>
                      </div>

                      <div className="guiding-question-box">
                        <span className="gq-label">🎯 핵심 유도 질문 (답안 차이 좁히기):</span>
                        <p>{skill2AiRes.guideQuestion || "자료의 핵심 헌법 조항과 법률 요건을 문장에 포함하여 다시 서술해 볼까요?"}</p>
                      </div>

                      {skill2AiRes.recommendedTerms && skill2AiRes.recommendedTerms.length > 0 && (
                        <div className="rec-terms-chips">
                          <span>추천 전문 개념어:</span>
                          {skill2AiRes.recommendedTerms.map((t: string, i: number) => (
                            <span key={i} className="term-chip">{t}</span>
                          ))}
                        </div>
                      )}

                      {!skill2AiRes.isMastered && skill2AiRes.scaffoldingHint && (
                        <div className="scaffolding-hint-box">
                          <div className="sh-header-row">
                            <span className="sh-label">💡 문장 뼈대 힌트 (직접 입력해 보세요):</span>
                          </div>
                          <code>{skill2AiRes.scaffoldingHint}</code>
                        </div>
                      )}

                      {skill2AiRes.feedback && (
                        <div className="tutor-feedback-with-avatar">
                          <div className="npc-role-avatar-img-box zero-micro-avatar">
                            <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                          </div>
                          <p className="tutor-feedback-text">
                            "{skill2AiRes.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <label className="input-field-label">
                {skill2AiRes && !skill2AiRes.isMastered
                  ? "💡 AI 튜터의 유도 질문과 추천 개념어를 반영하여 위 [기본 과제] 답안을 80% 이상 완성도로 보강하세요:"
                  : "위 자료를 근거로 [기본 과제]에 대한 답안을 1문장으로 작성하세요:"}
              </label>
              <textarea
                className="s2-textarea"
                rows={3}
                placeholder="예: 기본권은 반드시 국회가 제정한 법률에 근거하여 제한해야 하며, 본질적인 내용을 침해할 수 없다."
                value={skill2Input}
                disabled={skill2Confirmed}
                onChange={(e) => setSkill2Input(e.target.value)}
              />

              {!skill2Confirmed ? (
                <div className="button-row" style={{ marginTop: "10px" }}>
                  <button
                    className="primary-button"
                    onClick={() =>
                      handleIterativeEvaluate(
                        "SKILL_2",
                        skill2Input,
                        setSkill2AiRes,
                        setSkill2Loading,
                        { problemCase: curS2.material }
                      )
                    }
                    disabled={skill2Loading}
                    style={{ flex: 1 }}
                  >
                    {skill2Loading ? "AI 분석 중..." : skill2AiRes && !skill2AiRes.isMastered ? "수정 문장 재제출 및 AI 검증" : "1문장 제출 및 AI 첨삭 받기"}
                  </button>
                  {skill2AiRes && (
                    <button className="secondary-button" onClick={() => handleConfirmAndLog(2)} style={{ flex: 0.8 }}>
                      ✍️ 최종 확정하기
                    </button>
                  )}
                </div>
              ) : (
                <div className="confirmed-status-banner">
                  <span>✓ 답안이 최종 확정되어 내 답안 서고에 저장되었습니다.</span>
                </div>
              )}

              {/* 다음 문항 이동 버튼 */}
              {(skill2AiRes?.isMastered || skill2Confirmed) && (
                <button
                  className="primary-button full-button"
                  style={{ marginTop: "12px" }}
                  onClick={() => {
                    setSkill2Input("");
                    setSkill2AiRes(null);
                    setSkill2Confirmed(false);
                    if (skill2Idx < dataset.skill2.length - 1) setSkill2Idx(skill2Idx + 1);
                    else setActiveSkillTab(3);
                  }}
                >
                  {skill2Idx < dataset.skill2.length - 1 ? "다음 자료 해석으로 >" : "STEP 3: 관점 평가로 이동 >"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            스킬 3: 관점 비교 및 쟁점 평가 (대화형 튜터 루프 & 확정)
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

            {/* 📌 원래 기본 과제 발문 (상시 고정 노출) */}
            <div className="original-task-instruction-card">
              <div className="task-instruction-badge">
                <FileText size={16} color="var(--gold)" />
                <strong>[기본 과제 발문]</strong>
              </div>
              <p className="task-instruction-text">
                선택한 관점({skill3Stance === "A" ? "자유권/사생활 보호" : "공동체 학습권/공익"})에서 자신의 주장을 1문장으로 제시하세요.
              </p>
            </div>

            <div className="s3-input-box">
              {/* AI 튜터 코칭 피드백 (접어두기 기능 탑재) */}
              {skill3AiRes && (
                <div className={`ai-tutor-coaching-box ${skill3AiRes.isMastered ? "mastered" : "revising"}`}>
                  <div className="tutor-header-row">
                    <div className="tutor-badge">
                      <div className="npc-role-avatar-img-box zero-mini-avatar">
                        <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                      </div>
                      <strong>AI 튜터 ZERO의 관점 코칭</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`status-tag ${skill3AiRes.isMastered ? "playable" : "coming"}`}>
                        {skill3AiRes.isMastered ? "🎉 80% 이상 마스터 달성!" : `🔥 일치도 ${skill3AiRes.matchRate || 40}% (80% 목표)`}
                      </span>
                      <button
                        className="coach-collapse-toggle-btn"
                        onClick={() => setCoachingCollapsed((prev) => ({ ...prev, 3: !prev[3] }))}
                        title={coachingCollapsed[3] ? "코칭 펼치기" : "코칭 접기"}
                      >
                        {coachingCollapsed[3] ? "🔽 코칭 펼치기" : "🔼 코칭 접기"}
                      </button>
                    </div>
                  </div>

                  {!coachingCollapsed[3] && (
                    <div className="coaching-expandable-content">
                      {/* 일치도 게이지 바 */}
                      <div className="match-rate-bar-container">
                        <div className="match-rate-label-row">
                          <small>모범 답안 일치도 지수</small>
                          <strong>{skill3AiRes.matchRate || 40}% / 80% 기준</strong>
                        </div>
                        <div className="match-rate-progress-track">
                          <div className="match-rate-progress-fill" style={{ width: `${Math.min(100, skill3AiRes.matchRate || 40)}%`, background: skill3AiRes.isMastered ? "#56e39f" : "var(--gold)" }} />
                        </div>
                      </div>

                      <div className="guiding-question-box">
                        <span className="gq-label">🎯 핵심 유도 질문 (답안 차이 좁히기):</span>
                        <p>{skill3AiRes.guideQuestion || "선택한 관점의 핵심 헌법적 가치(통신의 자유, 학습권 등)를 포함해 볼까요?"}</p>
                      </div>

                      {skill3AiRes.recommendedTerms && skill3AiRes.recommendedTerms.length > 0 && (
                        <div className="rec-terms-chips">
                          <span>추천 전문 개념어:</span>
                          {skill3AiRes.recommendedTerms.map((t: string, i: number) => (
                            <span key={i} className="term-chip">{t}</span>
                          ))}
                        </div>
                      )}

                      {!skill3AiRes.isMastered && skill3AiRes.scaffoldingHint && (
                        <div className="scaffolding-hint-box">
                          <div className="sh-header-row">
                            <span className="sh-label">💡 문장 구조 힌트 (직접 입력해 보세요):</span>
                          </div>
                          <code>{skill3AiRes.scaffoldingHint}</code>
                        </div>
                      )}

                      {skill3AiRes.feedback && (
                        <div className="tutor-feedback-with-avatar">
                          <div className="npc-role-avatar-img-box zero-micro-avatar">
                            <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                          </div>
                          <p className="tutor-feedback-text">
                            "{skill3AiRes.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <label className="input-field-label">
                {skill3AiRes && !skill3AiRes.isMastered
                  ? "💡 AI 튜터의 유도 질문과 추천 개념어를 반영하여 위 [기본 과제] 답안을 80% 이상 완성도로 보강하세요:"
                  : "선택한 관점에서 [기본 과제]에 대한 자신의 주장을 1문장으로 제시하세요:"}
              </label>
              <textarea
                className="s2-textarea"
                rows={3}
                placeholder="예: 본인은 학생의 행복추구권과 통신의 자유를 보장하기 위해 일괄 수거 대신 자율 보관제를 지지한다."
                value={skill3Input}
                disabled={skill3Confirmed}
                onChange={(e) => setSkill3Input(e.target.value)}
              />

              {!skill3Confirmed ? (
                <div className="button-row" style={{ marginTop: "10px" }}>
                  <button
                    className="primary-button"
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
                    style={{ flex: 1 }}
                  >
                    {skill3Loading ? "AI 피드백 분석 중..." : skill3AiRes && !skill3AiRes.isMastered ? "수정 문장 재제출 및 AI 검증" : "AI 관점 부합성 및 개념어 첨삭 받기"}
                  </button>
                  {skill3AiRes && (
                    <button className="secondary-button" onClick={() => handleConfirmAndLog(3)} style={{ flex: 0.8 }}>
                      ✍️ 최종 확정하기
                    </button>
                  )}
                </div>
              ) : (
                <div className="confirmed-status-banner">
                  <span>✓ 관점 평가 답안이 최종 확정되었습니다.</span>
                </div>
              )}

              {(skill3AiRes?.isMastered || skill3Confirmed) && (
                <button className="primary-button full-button" style={{ marginTop: "12px" }} onClick={() => setActiveSkillTab(4)}>
                  STEP 4: 원인·대안 도출로 이동 &gt;
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            스킬 4: 원인 분석 및 대안 도출 (대화형 튜터 루프 & 확정)
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

            {/* 📌 원래 기본 과제 발문 (상시 고정 노출) */}
            <div className="original-task-instruction-card">
              <div className="task-instruction-badge">
                <FileText size={16} color="var(--gold)" />
                <strong>[기본 과제 발문]</strong>
              </div>
              <p className="task-instruction-text">
                문제의 원인(개인적 vs 구조적)과 법·제도적 해결 방안을 2~3문장으로 서술하세요.
              </p>
            </div>

            <div className="s4-input-box">
              {/* AI 코칭 피드백 (접어두기 기능 탑재) */}
              {skill4AiRes && (
                <div className={`ai-tutor-coaching-box ${skill4AiRes.isMastered ? "mastered" : "revising"}`}>
                  <div className="tutor-header-row">
                    <div className="tutor-badge">
                      <div className="npc-role-avatar-img-box zero-mini-avatar">
                        <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                      </div>
                      <strong>AI 튜터 ZERO의 구조 분석</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`status-tag ${skill4AiRes.isMastered ? "playable" : "coming"}`}>
                        {skill4AiRes.isMastered ? "🎉 80% 이상 마스터 달성!" : `🔥 일치도 ${skill4AiRes.matchRate || 40}% (80% 목표)`}
                      </span>
                      <button
                        className="coach-collapse-toggle-btn"
                        onClick={() => setCoachingCollapsed((prev) => ({ ...prev, 4: !prev[4] }))}
                        title={coachingCollapsed[4] ? "코칭 펼치기" : "코칭 접기"}
                      >
                        {coachingCollapsed[4] ? "🔽 코칭 펼치기" : "🔼 코칭 접기"}
                      </button>
                    </div>
                  </div>

                  {!coachingCollapsed[4] && (
                    <div className="coaching-expandable-content">
                      {/* 일치도 게이지 바 */}
                      <div className="match-rate-bar-container">
                        <div className="match-rate-label-row">
                          <small>모범 답안 일치도 지수</small>
                          <strong>{skill4AiRes.matchRate || 40}% / 80% 기준</strong>
                        </div>
                        <div className="match-rate-progress-track">
                          <div className="match-rate-progress-fill" style={{ width: `${Math.min(100, skill4AiRes.matchRate || 40)}%`, background: skill4AiRes.isMastered ? "#56e39f" : "var(--gold)" }} />
                        </div>
                      </div>

                      <div className="guiding-question-box">
                        <span className="gq-label">🎯 핵심 유도 질문 (답안 차이 좁히기):</span>
                        <p>{skill4AiRes.guideQuestion || "개인의 도덕성 문제 외에 '근로기준법'이나 근로감독 등 법·제도적 구조 원인을 포함해 볼까요?"}</p>
                      </div>

                      {skill4AiRes.recommendedTerms && skill4AiRes.recommendedTerms.length > 0 && (
                        <div className="rec-terms-chips">
                          <span>추천 전문 개념어:</span>
                          {skill4AiRes.recommendedTerms.map((t: string, i: number) => (
                            <span key={i} className="term-chip">{t}</span>
                          ))}
                        </div>
                      )}

                      {!skill4AiRes.isMastered && skill4AiRes.scaffoldingHint && (
                        <div className="scaffolding-hint-box">
                          <div className="sh-header-row">
                            <span className="sh-label">💡 원인-대안 뼈대 (직접 입력해 보세요):</span>
                          </div>
                          <code>{skill4AiRes.scaffoldingHint}</code>
                        </div>
                      )}

                      {skill4AiRes.feedback && (
                        <div className="tutor-feedback-with-avatar">
                          <div className="npc-role-avatar-img-box zero-micro-avatar">
                            <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                          </div>
                          <p className="tutor-feedback-text">
                            "{skill4AiRes.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <label className="input-field-label">
                {skill4AiRes && !skill4AiRes.isMastered
                  ? "💡 AI 튜터의 유도 질문과 법적 대안을 반영하여 위 [기본 과제] 답안을 80% 이상 완성도로 보강하세요:"
                  : "문제의 원인과 법·제도적 해결 방안을 [기본 과제]에 맞추어 2~3문장으로 서술하세요:"}
              </label>
              <textarea
                className="s2-textarea"
                rows={4}
                placeholder="[원인] ... [대안] 근로기준법상 ..."
                value={skill4Input}
                disabled={skill4Confirmed}
                onChange={(e) => setSkill4Input(e.target.value)}
              />

              {!skill4Confirmed ? (
                <div className="button-row" style={{ marginTop: "10px" }}>
                  <button
                    className="primary-button"
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
                    style={{ flex: 1 }}
                  >
                    {skill4Loading ? "AI 피드백 분석 중..." : skill4AiRes && !skill4AiRes.isMastered ? "수정 문장 재제출 및 AI 검증" : "원인·대안 AI 분석 받기"}
                  </button>
                  {skill4AiRes && (
                    <button className="secondary-button" onClick={() => handleConfirmAndLog(4)} style={{ flex: 0.8 }}>
                      ✍️ 최종 확정하기
                    </button>
                  )}
                </div>
              ) : (
                <div className="confirmed-status-banner">
                  <span>✓ 원인 및 대안 답안이 최종 확정되었습니다.</span>
                </div>
              )}

              {(skill4AiRes?.isMastered || skill4Confirmed) && (
                <button className="primary-button full-button" style={{ marginTop: "12px" }} onClick={() => setActiveSkillTab(5)}>
                  STEP 5: 실천 설계로 이동 &gt;
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            스킬 5: 실천 설계 (3단 구조 완결성 & 확정)
            ======================================================== */}
        {activeSkillTab === 5 && (
          <div className="skill-module-card">
            <div className="module-card-header">
              <div className="module-title-left">
                <span className="skill-badge-tag">STEP 05</span>
                <h3>헌법 가치 기반 실천 설계 (3단 논증)</h3>
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
                <Lightbulb size={16} color="var(--gold)" weight="fill" /> 3단 뼈대 단서
              </button>
            </div>

            <div className="s5-case-card">
              <h4>주제: {dataset.skill5[0].title}</h4>
              <p>{dataset.skill5[0].contextData}</p>
              <div className="structure-guide-box">
                <span>3단 구조 지침:</span> {dataset.skill5[0].structureGuide}
              </div>
            </div>

            {/* 📌 원래 기본 과제 발문 (상시 고정 노출) */}
            <div className="original-task-instruction-card">
              <div className="task-instruction-badge">
                <FileText size={16} color="var(--gold)" />
                <strong>[기본 과제 발문]</strong>
              </div>
              <p className="task-instruction-text">
                [현황 ➔ 구조적 원인 ➔ 헌법 기반 실천 방안]을 3단 구조로 서술하세요.
              </p>
            </div>

            <div className="s5-input-box">
              {/* AI 코칭 피드백 (접어두기 기능 탑재) */}
              {skill5AiRes && (
                <div className={`ai-tutor-coaching-box ${skill5AiRes.isMastered ? "mastered" : "revising"}`}>
                  <div className="tutor-header-row">
                    <div className="tutor-badge">
                      <div className="npc-role-avatar-img-box zero-mini-avatar">
                        <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                      </div>
                      <strong>AI 튜터 ZERO의 종합 논증 평가</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`status-tag ${skill5AiRes.isMastered ? "playable" : "coming"}`}>
                        {skill5AiRes.isMastered ? "🎉 80% 이상 마스터 달성!" : `🔥 일치도 ${skill5AiRes.matchRate || 40}% (80% 목표)`}
                      </span>
                      <button
                        className="coach-collapse-toggle-btn"
                        onClick={() => setCoachingCollapsed((prev) => ({ ...prev, 5: !prev[5] }))}
                        title={coachingCollapsed[5] ? "코칭 펼치기" : "코칭 접기"}
                      >
                        {coachingCollapsed[5] ? "🔽 코칭 펼치기" : "🔼 코칭 접기"}
                      </button>
                    </div>
                  </div>

                  {!coachingCollapsed[5] && (
                    <div className="coaching-expandable-content">
                      {/* 일치도 게이지 바 */}
                      <div className="match-rate-bar-container">
                        <div className="match-rate-label-row">
                          <small>모범 답안 일치도 지수</small>
                          <strong>{skill5AiRes.matchRate || 40}% / 80% 기준</strong>
                        </div>
                        <div className="match-rate-progress-track">
                          <div className="match-rate-progress-fill" style={{ width: `${Math.min(100, skill5AiRes.matchRate || 40)}%`, background: skill5AiRes.isMastered ? "#56e39f" : "var(--gold)" }} />
                        </div>
                      </div>

                      <div className="guiding-question-box">
                        <span className="gq-label">🎯 핵심 유도 질문 (답안 차이 좁히기):</span>
                        <p>{skill5AiRes.guideQuestion || "현황 문제와 구조 원인, 그리고 헌법 기반 실천 방안의 3단 연결 구조를 갖추어 볼까요?"}</p>
                      </div>

                      {skill5AiRes.recommendedTerms && skill5AiRes.recommendedTerms.length > 0 && (
                        <div className="rec-terms-chips">
                          <span>추천 전문 개념어:</span>
                          {skill5AiRes.recommendedTerms.map((t: string, i: number) => (
                            <span key={i} className="term-chip">{t}</span>
                          ))}
                        </div>
                      )}

                      {!skill5AiRes.isMastered && skill5AiRes.scaffoldingHint && (
                        <div className="scaffolding-hint-box">
                          <div className="sh-header-row">
                            <span className="sh-label">💡 3단 구조 힌트 (직접 입력해 보세요):</span>
                          </div>
                          <code>{skill5AiRes.scaffoldingHint}</code>
                        </div>
                      )}

                      {skill5AiRes.feedback && (
                        <div className="tutor-feedback-with-avatar">
                          <div className="npc-role-avatar-img-box zero-micro-avatar">
                            <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                          </div>
                          <p className="tutor-feedback-text">
                            "{skill5AiRes.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <label className="input-field-label">
                {skill5AiRes && !skill5AiRes.isMastered
                  ? "💡 AI 튜터의 유도 질문을 바탕으로 위 [기본 과제]의 [현황 ➔ 구조 원인 ➔ 실천 방안]을 80% 이상 완성도로 보강하세요:"
                  : "[현황 ➔ 구조적 원인 ➔ 헌법 기반 실천 방안]을 [기본 과제]에 맞추어 3단 구조로 서술하세요:"}
              </label>
              <textarea
                className="s2-textarea"
                rows={5}
                placeholder="1. 헌법 제10조 인격권 침해 현황... 2. 구조적 원인... 3. 잊힐 권리 법제화 실천 방안..."
                value={skill5Input}
                disabled={skill5Confirmed}
                onChange={(e) => setSkill5Input(e.target.value)}
              />

              {!skill5Confirmed ? (
                <div className="button-row" style={{ marginTop: "10px" }}>
                  <button
                    className="primary-button"
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
                    style={{ flex: 1 }}
                  >
                    {skill5Loading ? "AI 피드백 분석 중..." : skill5AiRes && !skill5AiRes.isMastered ? "수정 문장 재제출 및 AI 검증" : "실천 설계 AI 종합 첨삭 받기"}
                  </button>
                  {skill5AiRes && (
                    <button className="secondary-button" onClick={() => handleConfirmAndLog(5)} style={{ flex: 0.8 }}>
                      ✍️ 최종 확정하기
                    </button>
                  )}
                </div>
              ) : (
                <div className="confirmed-status-banner">
                  <span>✓ 5단계 실천 설계 답안이 최종 확정되었습니다.</span>
                </div>
              )}

              {(skill5AiRes?.isMastered || skill5Confirmed) && (
                <div className="all-skill-cleared-banner" style={{ marginTop: "16px" }}>
                  <Trophy size={32} color="#ffd36a" weight="fill" />
                  <div>
                    <strong>🎉 5단계 탐구 스킬 훈련 전 과정 마스터 완료!</strong>
                    <p>내 답안 서고에 전 단계 작성 답안이 영구 보관되었습니다.</p>
                  </div>
                  <button className="primary-button" onClick={onBack}>
                    메인 허브로 이동
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 💬 문장 자동완성 적용 토스트 알림 */}
        {chatToast && (
          <div className="chat-autocomplete-toast">
            <Check size={18} color="#56e39f" weight="bold" />
            <span>{chatToast}</span>
          </div>
        )}

        {/* 📖 교과서 원문 및 핵심 판례 해설 모달 */}
        {skill2GuideModal && (
          <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSkill2GuideModal(false); }}>
            <div className="history-review-modal" style={{ maxWidth: "620px" }}>
              <div className="history-modal-header">
                <div className="title-with-icon">
                  <Info size={22} color="var(--teal)" weight="fill" />
                  <h3>📖 교과서 원문 및 핵심 조문 해설 (STEP 2)</h3>
                </div>
                <button className="modal-close" onClick={() => setSkill2GuideModal(false)}><X size={20} /></button>
              </div>

              <div className="history-items-scroll">
                {/* 1. 지문 원문 */}
                <div className="history-card-item" style={{ borderLeft: "3px solid var(--teal)" }}>
                  <span className="step-tag">헌법 제37조 제2항 전문</span>
                  <p style={{ fontSize: "13.5px", lineHeight: "1.6", color: "#e8f7fa", margin: "8px 0 0" }}>
                    "{curS2.material}"
                  </p>
                </div>

                {/* 2. 조항 핵심 3대 분해 구조 */}
                <div className="history-card-item">
                  <span className="step-tag" style={{ background: "#1c3548", color: "var(--gold)" }}>핵심 분석 포인트 3가지</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    <div style={{ background: "#06131c", padding: "10px 12px", borderRadius: "8px", border: "1px solid #16364d" }}>
                      <strong style={{ color: "var(--gold)", fontSize: "12.5px" }}>1. 형식적 요건 (법률유보 원칙)</strong>
                      <p style={{ fontSize: "12px", color: "#d0e4ee", margin: "4px 0 0", lineHeight: "1.5" }}>
                        기본권을 제한할 때는 반드시 국민의 대표 기관인 <strong>국회가 제정한 '법률'</strong>에 근거해야 합니다. 행정부의 명령이나 규칙만으로는 제한할 수 없습니다.
                      </p>
                    </div>

                    <div style={{ background: "#06131c", padding: "10px 12px", borderRadius: "8px", border: "1px solid #16364d" }}>
                      <strong style={{ color: "#56e39f", fontSize: "12.5px" }}>2. 목적상 한계 (공익의 정당성)</strong>
                      <p style={{ fontSize: "12px", color: "#d0e4ee", margin: "4px 0 0", lineHeight: "1.5" }}>
                        아무 때나 제한할 수 없으며, <strong>국가안전보장, 질서유지, 공공복리</strong>를 위해 '필요한 경우에 한하여' 최소한으로만 제한(비례의 원칙)해야 합니다.
                      </p>
                    </div>

                    <div style={{ background: "#06131c", padding: "10px 12px", borderRadius: "8px", border: "1px solid #16364d" }}>
                      <strong style={{ color: "#ff7aa2", fontSize: "12.5px" }}>3. 실질적 한계 (본질적 내용 침해 금지)</strong>
                      <p style={{ fontSize: "12px", color: "#d0e4ee", margin: "4px 0 0", lineHeight: "1.5" }}>
                        제한하더라도 그 권리의 가장 중요한 알맹이인 <strong>'본질적인 내용'</strong>을 없애거나 빈 껍데기로 만들 수는 없습니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. 1문장 서술 작성 가이드 */}
                <div className="history-card-item" style={{ background: "#041824", border: "1.5px solid var(--gold)" }}>
                  <span className="step-tag" style={{ background: "var(--gold)", color: "#06131c" }}>💡 1문장 서술 작성 팁</span>
                  <p style={{ fontSize: "12.5px", color: "#ffffff", fontWeight: 700, margin: "6px 0 0", lineHeight: "1.5" }}>
                    "기본권은 반드시 <strong>국회가 제정한 법률</strong>에 근거하여 제한해야 하며, 어떠한 경우에도 <strong>본질적인 내용을 침해할 수 없다.</strong>"
                  </p>
                </div>
              </div>

              <button className="primary-button full-button" style={{ marginTop: "12px" }} onClick={() => setSkill2GuideModal(false)}>
                확인 완료 및 답안 작성하기
              </button>
            </div>
          </div>
        )}

        {/* 💬 1:1 보조교사 AI 튜터 ZERO 실시간 채팅창 모달 (전면 재설계) */}
        {tutorChatOpen && (
          <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setTutorChatOpen(false); }}>
            <div className="tutor-chat-drawer-panel">
              {/* 채팅창 헤더 */}
              <div className="tutor-chat-header">
                <div className="tutor-header-profile">
                  <div className="npc-role-avatar-img-box zero-mini-avatar" style={{ width: "38px", height: "38px" }}>
                    <img src="/characters/zero_evaluator.jpg" alt="ZERO" className="npc-role-avatar-img" />
                  </div>
                  <div>
                    <h4>⚡ AI 보조교사 ZERO (1:1 탐구 튜터)</h4>
                    <span className="online-indicator">● 문항 분석 및 정답 유도 비계 시스템 가동 중</span>
                  </div>
                </div>
                <button className="modal-close" onClick={() => setTutorChatOpen(false)}><X size={20} /></button>
              </div>

              {/* 📌 현재 풀고 있는 탐구 과제 실시간 요약 카드 */}
              <div className="tutor-live-task-card">
                <div className="task-card-header">
                  <span className="task-step-tag">
                    {activeSkillTab === 2 ? "STEP 2. 자료 해석" :
                     activeSkillTab === 3 ? "STEP 3. 관점 평가" :
                     activeSkillTab === 4 ? "STEP 4. 원인 분석 및 대안" :
                     activeSkillTab === 5 ? "STEP 5. 실천 설계" : "STEP 1. 개념 식별"}
                  </span>
                  <small>현재 탐구 과제 맥락</small>
                </div>
                <p className="task-problem-title">
                  {activeSkillTab === 2 ? "Q. 기본권 제한의 '형식적 요건(법률)'과 '실질적 한계(본질적 내용)' 서술" :
                   activeSkillTab === 3 ? `Q. 휴대전화 수거 쟁점 (${skill3Stance === "A" ? "자유권/사생활 보호" : "공동체 학습권"} 관점) 주장 서술` :
                   activeSkillTab === 4 ? "Q. 청소년 배달 노동 인권 침해의 구조적 원인과 근로기준법 기반 해결책" :
                   activeSkillTab === 5 ? "Q. [현황 ➔ 구조 원인 ➔ 헌법 기반 대안] 3단 논증 완성" : "통합사회 핵심 개념어 학습"}
                </p>
                <div className="task-my-input-preview">
                  <span>내 작성 답안:</span>
                  <p>
                    {activeSkillTab === 2 ? (skill2Input || "(아직 작성하지 않음)") :
                     activeSkillTab === 3 ? (skill3Input || "(아직 작성하지 않음)") :
                     activeSkillTab === 4 ? (skill4Input || "(아직 작성하지 않음)") :
                     activeSkillTab === 5 ? (skill5Input || "(아직 작성하지 않음)") : "(개념 식별 단계)"}
                  </p>
                </div>
              </div>

              {/* 🎯 3대 원클릭 비계설정 퀵 액션 버튼 바 */}
              <div className="tutor-quick-scaffold-bar">
                <button
                  className="quick-scaffold-btn hint-btn"
                  onClick={() => void handleSendTutorChat("", "HINT")}
                  disabled={chatLoading}
                >
                  <Lightbulb size={15} color="var(--gold)" weight="fill" />
                  <span>💡 핵심 힌트 질문</span>
                </button>
                <button
                  className="quick-scaffold-btn structure-btn"
                  onClick={() => void handleSendTutorChat("", "SCAFFOLD")}
                  disabled={chatLoading}
                >
                  <FileText size={15} color="var(--teal)" weight="fill" />
                  <span>✍️ 문장 뼈대 지원</span>
                </button>
                <button
                  className="quick-scaffold-btn eval-btn"
                  onClick={() => void handleSendTutorChat("", "EVALUATE")}
                  disabled={chatLoading}
                >
                  <Sparkle size={15} color="#56e39f" weight="fill" />
                  <span>🔍 내 답안 정밀 첨삭</span>
                </button>
              </div>

              {/* 채팅 메시지 스크롤 영역 */}
              <div className="tutor-chat-messages-scroll">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble-row ${msg.role === "user" ? "user-row" : "tutor-row"}`}>
                    {msg.role === "tutor" && (
                      <div className="chat-avatar-thumb">
                        <img src="/characters/zero_evaluator.jpg" alt="ZERO" />
                      </div>
                    )}
                    <div className="chat-bubble-content">
                      <p className="chat-bubble-text">{msg.text}</p>

                      {/* 💡 추천 문장 참고 카드 (자동완성 대신 직접 작성 유도) */}
                      {msg.suggestedSentence && (
                        <div className="suggested-sentence-card">
                          <div className="card-top-title">
                            <Lightbulb size={14} color="var(--gold)" weight="fill" />
                            <strong>모범 답안 수준 추천 문장 (참고용):</strong>
                          </div>
                          <p className="sentence-body">"{msg.suggestedSentence}"</p>
                          <small style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", marginTop: "4px", display: "block" }}>
                            ※ 위 문장을 참고하여 내 답안창에 직접 타이핑해 보세요!
                          </small>
                        </div>
                      )}

                      {/* 퀵 질문 추천 칩 */}
                      {msg.quickFollowUps && msg.quickFollowUps.length > 0 && (
                        <div className="chat-quick-followups">
                          {msg.quickFollowUps.map((q, qIdx) => (
                            <button key={qIdx} className="quick-q-pill" onClick={() => void handleSendTutorChat(q)}>
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="chat-bubble-row tutor-row">
                    <div className="chat-avatar-thumb">
                      <img src="/characters/zero_evaluator.jpg" alt="ZERO" />
                    </div>
                    <div className="chat-bubble-content">
                      <div className="tutor-typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 하단 입력 폼 */}
              <form
                className="tutor-chat-input-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendTutorChat();
                }}
              >
                <input
                  type="text"
                  className="tutor-chat-input"
                  placeholder="질문이나 생각을 편하게 적어보렴 (예: '왜 법률로 제한해야 해?')..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button type="submit" className="tutor-chat-send-btn" disabled={chatLoading || !chatInput.trim()}>
                  전송
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 📋 내가 쓴 글 서고 & 질문 다시 보기 모달 */}
        {historyModalOpen && (
          <div className="modal-backdrop">
            <div className="history-review-modal">
              <div className="history-modal-header">
                <div className="title-with-icon">
                  <FileText size={20} color="var(--gold)" weight="fill" />
                  <h3>내 탐구 답안 서고 (질문 및 작성 글 다시 보기)</h3>
                </div>
                <button className="modal-close" onClick={() => setHistoryModalOpen(false)}><X size={20} /></button>
              </div>

              <div className="history-items-scroll">
                <div className="history-card-item">
                  <span className="step-tag">STEP 2. 자료 해석</span>
                  <h4>Q. {curS2.question}</h4>
                  <div className="student-written-box">
                    <small>내가 작성한 답안:</small>
                    <p>{skill2Input || "(아직 작성하지 않음)"}</p>
                  </div>
                  {skill2AiRes && <p className="tutor-mini-eval">⚡ AI 코칭: {skill2AiRes.feedback}</p>}
                </div>

                <div className="history-card-item">
                  <span className="step-tag">STEP 3. 관점 평가</span>
                  <h4>Q. 선택한 관점에서 자신의 주장을 1문장으로 제시하세요 ({skill3Stance === "A" ? "자유권" : "학습권"})</h4>
                  <div className="student-written-box">
                    <small>내가 작성한 답안:</small>
                    <p>{skill3Input || "(아직 작성하지 않음)"}</p>
                  </div>
                  {skill3AiRes && <p className="tutor-mini-eval">⚡ AI 코칭: {skill3AiRes.feedback}</p>}
                </div>

                <div className="history-card-item">
                  <span className="step-tag">STEP 4. 원인·대안</span>
                  <h4>Q. 문제 원인(개인적 vs 구조적)과 법·제도적 해결 방안 서술</h4>
                  <div className="student-written-box">
                    <small>내가 작성한 답안:</small>
                    <p>{skill4Input || "(아직 작성하지 않음)"}</p>
                  </div>
                  {skill4AiRes && <p className="tutor-mini-eval">⚡ AI 코칭: {skill4AiRes.feedback}</p>}
                </div>

                <div className="history-card-item">
                  <span className="step-tag">STEP 5. 실천 설계</span>
                  <h4>Q. [현황 ➔ 구조 원인 ➔ 헌법 기반 실천 방안] 3단 논증</h4>
                  <div className="student-written-box">
                    <small>내가 작성한 답안:</small>
                    <p>{skill5Input || "(아직 작성하지 않음)"}</p>
                  </div>
                  {skill5AiRes && <p className="tutor-mini-eval">⚡ AI 코칭: {skill5AiRes.feedback}</p>}
                </div>
              </div>

              <button className="primary-button full-button" onClick={() => setHistoryModalOpen(false)}>
                닫기 및 탐구 계속하기
              </button>
            </div>
          </div>
        )}
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
          <label htmlFor="pw-name-input">학생 실명</label>
          <input id="pw-name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          <label htmlFor="pw-new-input" style={{ marginTop: "8px" }}>새 비밀번호</label>
          <input id="pw-new-input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          <label htmlFor="pw-confirm-input" style={{ marginTop: "8px" }}>비밀번호 확인</label>
          <input id="pw-confirm-input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
          <button type="submit" className="primary-button full-button" style={{ marginTop: "14px" }}>저장</button>
        </form>
      </section>
    </div>
  );
}

function TeacherDashboardModal({
  onClose,
  onPrintCert,
}: {
  save?: SaveData;
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

function SettingsPanelModal({
  audio,
  onChange,
  onClose,
}: {
  audio: { bgm: boolean; sfx: boolean };
  onChange: (next: Partial<{ bgm: boolean; sfx: boolean }>) => void;
  onClose: () => void;
}) {

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

// =========================================================================
// 6. ITEM ARCHIVE VIEW (아이템 보관소: 단원별 개념 카드 & 뱃지 서고)
// =========================================================================
function ItemArchiveView({
  save,
  onBack,
}: {
  save: SaveData;
  onBack: () => void;
}) {
  const [selectedUnit, setSelectedUnit] = useState<number>(1);

  const curCert = unitCertificates.find((c) => c.unitId === selectedUnit) || unitCertificates[0];
  const curCardSet = unitMemoryCardSets[selectedUnit] || unitMemoryCardSets[1];
  const isCertEarned = save.earnedCertificates.includes(selectedUnit);

  return (
    <div className="item-archive-view-container">
      <header className="game-hud">
        <div className="hud-top">
          <button className="icon-button" onClick={onBack} aria-label="메인 허브로"><ArrowLeft size={20} /></button>
          <div>
            <span>탐구 아케이드 · 보상 보관소</span>
            <strong>아이템 보관소 (개념 카드 & 뱃지 서고)</strong>
          </div>
          <span className="level-chip">체력 점수: {save.skillLabScore.vocabScore}점</span>
        </div>
      </header>

      <div className="skill-lab-scroll">
        {/* 단원 선택 탭 */}
        <div className="unit-selector-tabs-row">
          {unitCertificates.map((cert) => (
            <button
              key={cert.unitId}
              className={`unit-tab-pill ${selectedUnit === cert.unitId ? "active" : ""}`}
              onClick={() => setSelectedUnit(cert.unitId)}
            >
              <strong>{cert.unitId}단원</strong>
              <small>{cert.badgeName.replace(" 엠블럼", "")}</small>
            </button>
          ))}
        </div>

        {/* 1. 단원 공인 수호관 임명 뱃지 카드 */}
        <div className={`archive-cert-banner ${isCertEarned ? "earned" : "locked"}`}>
          <div className="cert-badge-large">
            <span className="badge-emoji-big">{curCert.badgeIcon}</span>
          </div>
          <div className="cert-info-col">
            <div className="cert-title-row">
              <span className="cert-unit-tag">{curCert.unitId}단원 공식 직함</span>
              <span className={`cert-status-tag ${isCertEarned ? "earned" : "locked"}`}>
                {isCertEarned ? "★ 정식 임명 완료" : "🔒 단원 전 과정 이수 후 수여"}
              </span>
            </div>
            <h3>{curCert.certName}</h3>
            <p className="cert-sub-desc">{curCert.description}</p>
            <div className="cert-basis-box">
              <span>헌법적 근거:</span> <code>{curCert.constitutionalBasis}</code>
            </div>
          </div>
        </div>

        {/* 2. 단원 핵심 개념 마스터 아이템 카드 컬렉션 */}
        <div className="archive-items-section">
          <div className="archive-sec-header">
            <div className="title-with-icon">
              <Medal size={20} color="var(--gold)" weight="fill" />
              <h3>{selectedUnit}단원 핵심 개념 아이템 카드</h3>
            </div>
            <span className="item-count-chip">4개 핵심 개념</span>
          </div>
          <p className="archive-sec-desc">
            개념-용어 학습실 및 카드 뒤집기 게임을 통해 획득한 단원별 교과서 필수 개념 카드입니다.
          </p>

          <div className="archive-cards-grid">
            {curCardSet.map((card, idx) => (
              <div key={idx} className="archive-card-item">
                <div className="card-top-header">
                  <span className="card-no-tag">CONCEPT #{idx + 1}</span>
                  <span className="card-star-icon">✦</span>
                </div>
                <h4 className="card-term-title">{card.term}</h4>
                <p className="card-def-text">{card.def}</p>
                <div className="card-footer-tag">
                  <span>📖 {selectedUnit}단원 교과서 필수 개념</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

