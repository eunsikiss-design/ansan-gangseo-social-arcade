import type { AudioSettings } from "./audio/AudioManager";

export type UserRole = "student" | "teacher" | "guest";

export interface StudentProfile {
  studentId: string;
  role: UserRole;
  grade: string;
  classNum: string;
  studentNum: string;
  name: string;
  password?: string;
  mustChangePassword?: boolean;
  isLoggedIn: boolean;
  schoolName: string;
}

export type UnitId = 1 | 2 | 3 | 4 | 5;
export type GameModeId =
  | "case_challenge"      // 인권 판례 챌린지
  | "rights_guard"        // 기본권 수호대
  | "court_sim"           // 헌법재판 시뮬레이터
  | "citizen_action"      // 시민 참여 미션
  | "campaign_studio";    // 인권 캠페인 스튜디오

export type MissionLevel = 1 | 2 | 3 | 4 | 5 | "boss";

export interface ScoreBreakdown {
  conceptAccuracy: number;  // 개념 정확성 (최대 30)
  dataUsage: number;        // 자료 활용 (최대 25)
  logicValidity: number;    // 근거의 타당성 (최대 25)
  solutionQuality: number;  // 해결책 또는 표현의 완성도 (최대 20)
  hintPenalty: number;      // 힌트 감점 (2단계: -5, 3단계: -10)
  totalScore: number;       // 최종 점수 (최대 100)
}

export interface HintItem {
  level: 1 | 2 | 3;
  penalty: number;
  text: string;
  highlightText?: string;
  reducedChoices?: number[];
  sentenceTemplate?: string;
}

export interface StepFeedback {
  reason: string;          // 틀린 이유
  relatedConcept: string;  // 관련 개념
  guideText: string;       // 다시 도전 안내
}

export interface GameMissionData {
  id: string;
  unitId: UnitId;
  gameModeId: GameModeId;
  level: MissionLevel;
  levelName: string;        // 예: Lv1 개념 탐색, Lv2 자료 해독 ...
  title: string;
  subtitle: string;
  scenario: string;         // 상황 설명
  textbookPage: string;     // 교과서 출처
  sourceMaterial?: {
    type: "text" | "image" | "quote" | "table";
    title: string;
    content: string;
    quote?: string;
    imageUrl?: string;
  };
  question: string;
  questionType?: "CHOICE" | "SHORT_ANSWER" | "SUBJECTIVE" | "OPEN_OPINION";
  shortAnswerKey?: string;
  initialHint?: string;
  aiPromptGuidance?: string;
  choices: string[];
  correctAnswer: number;
  hints: HintItem[];
  feedback: StepFeedback;
  competencyArea: "통합적 사고" | "자료 활용" | "의사 결정" | "공동체 역량";
  rubric: {
    conceptMax: number;
    dataMax: number;
    logicMax: number;
    solutionMax: number;
  };
  // 특화 위젯 데이터 (헌법재판, 캠페인 등)
  interactiveWidget?: {
    widgetType: "court_procedure" | "rights_slider" | "campaign_builder" | "citizen_matrix";
    options?: Record<string, unknown>;
  };

}

export interface GameModeInfo {
  id: GameModeId;
  unitId: UnitId;
  title: string;
  tagline: string;
  description: string;
  iconEmoji: string;
  estimatedMinutes: number;
  textbookPages?: string;
  missions: GameMissionData[];
}

export interface PortfolioEntry {
  id: string;
  unitId: UnitId;
  gameModeId: GameModeId;
  level: MissionLevel;
  missionTitle: string;
  selectedAnswer: string;
  score: ScoreBreakdown;
  draftText: string;
  savedAt: string;
}

export type AchievementLevel = "A" | "B" | "C" | "D" | "E";

export interface CompetencyEvaluation {
  overallLevel: AchievementLevel;
  totalScore: number;
  averageScore: number;
  competencyScores: {
    integratedThinking: number;  // 통합적 사고 (0~100)
    dataAnalysis: number;        // 자료 활용 (0~100)
    decisionMaking: number;      // 의사 결정 (0~100)
    communityAction: number;     // 공동체 역량 (0~100)
  };
  strengths: string[];
  improvements: string[];
  recommendedGames: string[];
  evidenceMissions: string[];
}

export interface UnitCertificateInfo {
  unitId: UnitId;
  unitTitle: string;
  certName: string;
  certSubtitle: string;
  badgeName: string;
  badgeIcon: string;
  constitutionalBasis: string;
  description: string;
}

export interface SaveData {
  currentUnit: UnitId;
  currentGameMode: GameModeId | null;
  currentLevel: MissionLevel;
  exp: number;
  overallLevel: number;
  completedMissions: string[]; // mission id list
  missionScores: Record<string, ScoreBreakdown>;
  earnedCertificates: UnitId[];
  portfolioDrafts: PortfolioEntry[];
  studentProfile: StudentProfile;
  audio: AudioSettings;
  skillLabScore: {
    vocabLevel: number;
    vocabScore: number;
    skillLevel: number;
    skillScore: number;
  };
  earnedVocabBadges?: number[]; // [1, 2, ...] 단원별 개념 마스터 뱃지
  earnedVocabItems?: string[];  // 획득한 개념 카드 아이템 ID 리스트
  loginCount?: number;
  activeSession?: {
    view: string;
    selectedUnitId: number;
    selectedTopicId?: number;
    currentQIdx?: number;
    activeSkillTab?: number;
    savedAt: string;
  };
}

export interface Scene {
  id: string;
  speaker: string;
  text: string;
  character: "player" | "ari" | "haeon" | "zero" | "narrator" | "citizen";
  expression: string;
  background: string;
  position?: "left" | "right" | "center";
  image?: string;
  imageAlt?: string;
}

export interface MissionStep {
  id: string;
  type: "dialogue" | "investigation" | "quiz" | "widget" | "debate" | "webtoon";
  title: string;
  scenes?: Scene[];
  [key: string]: unknown;
}


export interface Mission {
  id: string;
  actId: string;
  unitId?: UnitId;
  title: string;
  subtitle: string;
  summary?: string;
  badgeId?: string;
  required?: boolean;
  estimatedMinutes?: number;
  backgrounds?: string[];
  openingScenes: Scene[];
  endingScenes?: Scene[];
  steps?: MissionStep[];
}

export interface EvidenceCardData {
  id: string;
  title: string;
  category: string;
  description: string;
  sourceLabel: string;
  relatedConceptIds: string[];
  reliability: number;
  textbookPage: string;
  textbookQuote: string;
  applicationCase: string;
  studyTip: string;
}

export interface WebtoonCut {
  id: string;
  cutIndex: number;
  title: string;
  speaker: string;
  dialogue: string;
  character: "player" | "ari" | "haeon" | "zero" | "narrator";
  expression: "default" | "think" | "success" | "serious" | "challenge" | "shocked";
  bgType: "gangseo_old" | "echocity_new" | "justice_office" | "debate_hall";
  bgLabel: string;
  caption?: string;
  soundEffect?: string;
  image?: string;
}

export interface WebtoonCutscene {
  id: string;
  actId: string;
  title: string;
  subtitle: string;
  cuts: WebtoonCut[];
}

export interface SpeechFeedbackResult {
  summary: string;
  logicAnalysis: string;
  speechTimeAdvice: string;
  toneCoaching: string;
  score: number;
  followUpQuestion?: string;
}


