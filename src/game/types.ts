export type CharacterId = "player" | "ari" | "haeon" | "zero" | "npc";

export type CharacterExpression =
  | "default" | "smile" | "surprise" | "think" | "confident" | "guide"
  | "research" | "warning" | "skill" | "success" | "sad" | "resolve"
  | "serious" | "worried" | "angry" | "challenge" | "relieved"
  | (string & {});

export type CharacterPosition = "left" | "center" | "right";
export type TemplateStatus = "normal" | "selected" | "completed" | "locked" | "disabled" | "warning" | "success" | "loading";
export type EvidenceCategory = "concept" | "law" | "testimony" | "statistics" | "historical" | "opinion";
export type StepType = "briefing" | "dialogue" | "investigation" | "source" | "evidence" | "puzzle" | "zero" | "decision" | "result";

export interface Scene {
  id: string;
  background: string;
  speaker: string;
  text: string;
  character: CharacterId;
  expression: CharacterExpression;
  position: CharacterPosition;
  bgm?: string;
  sfx?: string;
  next?: string;
  image?: string;
  imageAlt?: string;
}

export interface EvidenceCardData {
  id: string;
  title: string;
  category: EvidenceCategory;
  description: string;
  sourceLabel: string;
  relatedConceptIds: string[];
  reliability: number;
  image?: string;
  textbookPage?: string;
  textbookQuote?: string;
  applicationCase?: string;
  studyTip?: string;
}

export interface DialogueOption {
  question: string;
  answerSpeaker: string;
  answerText: string;
  textbookRef?: string;
}

export interface MissionStep {
  id: string;
  type: StepType;
  title: string;
  body?: string;
  scene?: Scene;
  items?: string[];
  question?: string;
  choices?: string[];
  answer?: number;
  evidenceIds?: string[];
  dialogueOptions?: DialogueOption[];
  textbookSource?: {
    page: string;
    section: string;
    quote: string;
    memo: string;
  };
}

export interface Mission {
  id: string;
  actId: string;
  number: number;
  title: string;
  subtitle: string;
  required: boolean;
  estimatedMinutes: number;
  relatedConceptIds: string[];
  backgrounds: string[];
  openingScenes: Scene[];
  activities: MissionStep[];
  zeroChallenge: MissionStep;
  investigations: string[];
  evidenceIds: string[];
  decisions: string[];
  outcomes: string[];
  rewards: { exp: number; title?: string; skill?: string };
  endingScenes: Scene[];
  nextMissionId?: string;
}

export interface SocialIndicators {
  humanRights: number;
  fairness: number;
  economy: number;
  peace: number;
  sustainability: number;
  trust: number;
}

export interface StudentProfile {
  studentId: string;
  grade: string;
  classNum: string;
  studentNum: string;
  name: string;
  password?: string;
  isLoggedIn: boolean;
  schoolName: string;
}

export interface SaveData {
  currentMission: string | null;
  currentScene: number;
  level: number;
  exp: number;
  indicators: SocialIndicators;
  evidence: string[];
  completedMissions: string[];
  investigatedSources: string[];
  studentChoices: Record<string, number>;
  decisionHistory: { missionId: string; choice: number; evidenceIds: string[] }[];
  mastery: Record<string, number>;
  academyDrafts: Record<string, Record<string, string>>;
  reviewConcepts: string[];
  skill: string[];
  achievement: string[];
  attempts: number;
  correctAnswers: number;
  answerTimes: number[];
  audio: { bgm: boolean; sfx: boolean; bgmVolume: number; sfxVolume: number };
  studentProfile?: StudentProfile;
}

