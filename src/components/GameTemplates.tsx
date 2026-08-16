"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowLeft, BookOpen, ChartBar, CheckCircle, Compass, House, LockKey,
  Medal, ShieldCheck, Sparkle, Target, Trophy, UserCircle, Warning,
} from "@phosphor-icons/react";
import type { CharacterExpression, CharacterId, CharacterPosition, SocialIndicators, TemplateStatus } from "@/src/game/types";

const characterNames: Record<CharacterId, string> = { player: "탐구관", ari: "AR-I 아리", haeon: "해온", zero: "ZERO", npc: "NPC 지우" };
const characterMarks: Record<CharacterId, string> = { player: "탐", ari: "AI", haeon: "해", zero: "0", npc: "지" };
const expressionMarks: Record<string, string> = { smile: "✦", surprise: "!", think: "?", confident: "◆", guide: "→", research: "⌕", warning: "!", skill: "✧", success: "★", sad: "…", resolve: "▲", serious: "—", worried: "?", angry: "!", challenge: "VS", relieved: "◡", default: "•" };
const availablePngExpressions = new Set(["player:think", "ari:success", "haeon:serious", "zero:challenge"]);

export function CharacterPortrait({ characterId, expression = "default", position = "center", pose = "standing", label = true }: { characterId: CharacterId; expression?: CharacterExpression; position?: CharacterPosition; pose?: string; label?: boolean }) {
  return <CharacterPortraitAsset key={`${characterId}-${expression}`} characterId={characterId} expression={expression} position={position} pose={pose} label={label} />;
}

function CharacterPortraitAsset({ characterId, expression, position, pose, label }: { characterId: CharacterId; expression: CharacterExpression; position: CharacterPosition; pose: string; label: boolean }) {
  const [assetStep, setAssetStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Character art is intentionally independent from dialogue/UI text. Each actor can
  // gain expression-specific PNGs later while the transparent default remains safe.
  const pngSources = availablePngExpressions.has(`${characterId}:${expression}`)
    ? [`/assets/characters/${characterId}/${characterId}_${expression}.png`, `/assets/characters/${characterId}/${characterId}_default.png`]
    : [`/assets/characters/${characterId}/${characterId}_default.png`];
  const sources = [
    ...pngSources,
    `/assets/characters/${characterId}/${characterId}_${expression}.webp`,
    `/assets/characters/${characterId}/${characterId}_default.webp`,
    "/assets/characters/common/silhouette.webp",
  ];
  const hasAsset = assetStep < sources.length;

  return (
    <figure className={`character character-${characterId} character-${position} expression-${expression}`} data-character={characterId} data-expression={expression} data-pose={pose} aria-label={`${characterNames[characterId]} ${expression} 표정`}>
      {/* Dynamic fallback candidates are intentionally handled by a native image element. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {hasAsset && <img src={sources[assetStep]} alt="" aria-hidden="true" className={loaded ? "character-image loaded" : "character-image"} onLoad={() => setLoaded(true)} onError={() => { setLoaded(false); setAssetStep((step) => step + 1); }} />}
      {!loaded && <div className="character-fallback" aria-hidden="true"><span className="character-halo" /><span className="character-head"><i>{expressionMarks[expression] ?? expressionMarks.default}</i></span><span className="character-body"><b>{characterMarks[characterId]}</b></span></div>}
      {label && <figcaption>{characterNames[characterId]}</figcaption>}
    </figure>
  );
}

export function GameHUD({ missionTitle, level, exp, progress, indicators, onBack, onSettings }: { missionTitle: string; level: number; exp: number; progress?: number; indicators?: SocialIndicators; onBack?: () => void; onSettings?: () => void }) {
  return <header className="game-hud">
    <div className="hud-top">
      {onBack ? <button className="icon-button" onClick={onBack} aria-label="이전 화면"><ArrowLeft size={20} /></button> : <ShieldCheck size={22} weight="fill" />}
      <div><span>UNIT 1 · 인권수호국</span><strong>{missionTitle}</strong></div>
      <button className="level-chip" onClick={onSettings} aria-label="레벨과 오디오 설정">LV.{level} · {exp} EXP</button>
    </div>
    {typeof progress === "number" && <div className="mission-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>}
    {indicators && <div className="mini-indicators" aria-label="사회 지표"><span>인권 {indicators.humanRights}</span><span>공정 {indicators.fairness}</span><span>신뢰 {indicators.trust}</span></div>}
  </header>;
}

export function BottomNavigation({ active, onNavigate }: { active: "home" | "challenge" | "record" | "growth"; onNavigate: (tab: "home" | "challenge" | "record" | "growth") => void }) {
  const entries = [{ id: "home" as const, label: "홈", icon: House }, { id: "challenge" as const, label: "도전", icon: Target }, { id: "record" as const, label: "기록", icon: ChartBar }, { id: "growth" as const, label: "내 성장", icon: Trophy }];
  return <nav className="bottom-navigation" aria-label="주요 메뉴">{entries.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? "active" : ""} onClick={() => onNavigate(id)} aria-current={active === id ? "page" : undefined}><Icon size={22} weight={active === id ? "fill" : "regular"} /><span>{label}</span></button>)}</nav>;
}

type TemplateProps = { children: ReactNode; status?: TemplateStatus; className?: string; ariaLabel?: string };
function TemplateFrame({ children, status = "normal", className = "", ariaLabel = "게임 화면" }: TemplateProps) {
  return <section className={`template-frame ${className} status-${status}`} data-status={status} aria-label={ariaLabel}>{children}</section>;
}

export function MainHubTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`main-hub-template ${props.className ?? ""}`} ariaLabel="메인 허브" />; }
export function MissionMapTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`mission-map-template ${props.className ?? ""}`} ariaLabel="미션 지도" />; }
export function CaseBriefingTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`case-briefing-template ${props.className ?? ""}`} ariaLabel="사건 브리핑" />; }
export function DialogueTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`dialogue-template ${props.className ?? ""}`} ariaLabel="캐릭터 대화" />; }
export function InvestigationTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`investigation-template ${props.className ?? ""}`} ariaLabel="자료 조사" />; }
export function SourceDetailTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`source-detail-template ${props.className ?? ""}`} ariaLabel="자료 상세" />; }
export function EvidenceTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`evidence-template ${props.className ?? ""}`} ariaLabel="Evidence" />; }
export function PuzzleTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`puzzle-template ${props.className ?? ""}`} ariaLabel="개념 퍼즐" />; }
export function ZeroChallengeTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`zero-challenge-template ${props.className ?? ""}`} ariaLabel="ZERO Challenge" />; }
export function DecisionTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`decision-template ${props.className ?? ""}`} ariaLabel="최종 판단" />; }
export function ResultTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`result-template ${props.className ?? ""}`} ariaLabel="미션 결과" />; }
export function AcademyTemplate(props: TemplateProps) { return <TemplateFrame {...props} className={`academy-template ${props.className ?? ""}`} ariaLabel="탐구 아카데미" />; }

export function TemplateHeading({ eyebrow, title, description, icon = "case" }: { eyebrow: string; title: string; description?: string; icon?: "case" | "evidence" | "academy" | "warning" }) {
  const Icon = icon === "evidence" ? Medal : icon === "academy" ? BookOpen : icon === "warning" ? Warning : Compass;
  return <div className="template-heading"><span><Icon size={18} weight="fill" /> {eyebrow}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>;
}

export function StatusBadge({ status }: { status: "new" | "complete" | "locked" | "selected" | "warning" }) {
  const labels = { new: "NEW", complete: "완료", locked: "잠김", selected: "선택", warning: "주의" };
  return <span className={`status-badge badge-${status}`}>{status === "locked" ? <LockKey size={12} /> : status === "complete" ? <CheckCircle size={12} /> : <Sparkle size={12} />}{labels[status]}</span>;
}

export function PlayerIdentity() {
  return <div className="player-identity"><UserCircle size={32} weight="fill" /><div><strong>신입 인권수호관</strong><span>국가인권수호국 · 판례조사과</span></div></div>;
}
