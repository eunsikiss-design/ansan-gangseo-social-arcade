import type {
  AchievementLevel,
  CompetencyEvaluation,
  GameMissionData,
  PortfolioEntry,
  ScoreBreakdown,
} from "./types";

/**
 * 100점 만점 기준 채점 계산기
 * - 개념 정확성: 30점
 * - 자료 활용: 25점
 * - 근거의 타당성: 25점
 * - 해결책/표현 완성도: 20점
 * - 힌트 감점: 1단계(0), 2단계(-5), 3단계(-10)
 */
export function calculateMissionScore(
  mission: GameMissionData,
  selectedChoice: number,
  hintLevelUsed: number // 0: 미사용, 1: 1단계, 2: 2단계, 3: 3단계
): ScoreBreakdown {
  const isCorrect = selectedChoice === mission.correctAnswer;
  let hintPenalty = 0;
  if (hintLevelUsed === 2) hintPenalty = 5;
  if (hintLevelUsed === 3) hintPenalty = 10;

  if (isCorrect) {
    const rawTotal =
      mission.rubric.conceptMax +
      mission.rubric.dataMax +
      mission.rubric.logicMax +
      mission.rubric.solutionMax;
    const finalScore = Math.max(0, rawTotal - hintPenalty);

    return {
      conceptAccuracy: mission.rubric.conceptMax,
      dataUsage: mission.rubric.dataMax,
      logicValidity: mission.rubric.logicMax,
      solutionQuality: mission.rubric.solutionMax,
      hintPenalty,
      totalScore: finalScore,
    };
  } else {
    // 부분 점수: 시도 점수 및 기본 30점
    const partialConcept = Math.round(mission.rubric.conceptMax * 0.4);
    const partialData = Math.round(mission.rubric.dataMax * 0.4);
    const rawTotal = partialConcept + partialData;
    const finalScore = Math.max(20, rawTotal - hintPenalty);

    return {
      conceptAccuracy: partialConcept,
      dataUsage: partialData,
      logicValidity: 0,
      solutionQuality: 0,
      hintPenalty,
      totalScore: finalScore,
    };
  }
}

/**
 * 수행평가 초안 포트폴리오 생성기
 */
export function generatePortfolioDraft(
  mission: GameMissionData,
  selectedChoice: number,
  score: ScoreBreakdown
): PortfolioEntry {
  const choiceText = mission.choices[selectedChoice] || "미선택";
  let draftText = `[${mission.levelName}] ${mission.title}\n`;
  draftText += `• 쟁점 상황: ${mission.scenario}\n`;
  draftText += `• 헌법적 판단: ${choiceText}\n`;
  draftText += `• 교과서 근거: ${mission.textbookPage}\n`;
  draftText += `• 성취 점수: ${score.totalScore}점 (개념 ${score.conceptAccuracy} / 자료 ${score.dataUsage} / 논리 ${score.logicValidity} / 표현 ${score.solutionQuality})`;

  return {
    id: `port-${mission.id}-${Date.now()}`,
    unitId: mission.unitId,
    gameModeId: mission.gameModeId,
    level: mission.level,
    missionTitle: mission.title,
    selectedAnswer: choiceText,
    score,
    draftText,
    savedAt: new Date().toLocaleDateString("ko-KR"),
  };
}

/**
 * A~E 종합 성취수준 및 역량 리포트 판정기
 */
export function evaluateCompetencyProfile(
  scores: Record<string, ScoreBreakdown>,
  completedMissionIds: string[]
): CompetencyEvaluation {
  const scoreList = Object.values(scores);
  const total = scoreList.reduce((acc, cur) => acc + cur.totalScore, 0);
  const count = scoreList.length || 1;
  const avg = Math.round(total / count);

  let overallLevel: AchievementLevel = "C";
  if (avg >= 90) overallLevel = "A";
  else if (avg >= 80) overallLevel = "B";
  else if (avg >= 70) overallLevel = "C";
  else if (avg >= 60) overallLevel = "D";
  else overallLevel = "E";

  const integratedThinking = Math.min(
    100,
    Math.round(
      (scoreList.reduce((a, c) => a + c.conceptAccuracy, 0) / (count * 30)) * 100
    ) || 50
  );
  const dataAnalysis = Math.min(
    100,
    Math.round(
      (scoreList.reduce((a, c) => a + c.dataUsage, 0) / (count * 25)) * 100
    ) || 50
  );
  const decisionMaking = Math.min(
    100,
    Math.round(
      (scoreList.reduce((a, c) => a + c.logicValidity, 0) / (count * 25)) * 100
    ) || 50
  );
  const communityAction = Math.min(
    100,
    Math.round(
      (scoreList.reduce((a, c) => a + c.solutionQuality, 0) / (count * 20)) * 100
    ) || 50
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (integratedThinking >= 80) {
    strengths.push("헌법 제10조 및 기본권 핵심 개념의 정확한 파악");
  } else {
    improvements.push("헌법 기본 조문과 기본권 4대 성격 개념 보강 필요");
  }

  if (dataAnalysis >= 80) {
    strengths.push("교과서 판례 및 헌법 통계 자료의 객관적 분석 능력 우수");
  } else {
    improvements.push("판례 요지에서 핵심 위헌 사유를 추출하는 자료 해석 연습 권장");
  }

  if (decisionMaking >= 80) {
    strengths.push("기본권 충돌 시 비례원칙과 법익 균형성을 고려한 합리적 대안 도출");
  } else {
    improvements.push("기본권 제한의 한계(과잉금지원칙) 법리 분석 연습 필요");
  }

  if (communityAction >= 80) {
    strengths.push("시민 참여 수단 연계 및 인권 친화적 캠페인 표현 완성도 탁월");
  } else {
    improvements.push("주장-근거-실천 방안을 갖춘 삼단 논증 표현력 강화 권장");
  }

  const recommendedGames: string[] = [];
  if (integratedThinking < 75) recommendedGames.push("탐구력 향상 랩 — 개념-용어 학습실");
  if (dataAnalysis < 75) recommendedGames.push("1단원: 인권 판례 챌린지");
  if (decisionMaking < 75) recommendedGames.push("1단원: 헌법재판 시뮬레이터");
  if (communityAction < 75) recommendedGames.push("1단원: 인권 캠페인 스튜디오");

  if (recommendedGames.length === 0) {
    recommendedGames.push("1단원: 보스 미션 도전", "탐구기능 연습실 마스터");
  }

  return {
    overallLevel,
    totalScore: total,
    averageScore: avg,
    competencyScores: {
      integratedThinking,
      dataAnalysis,
      decisionMaking,
      communityAction,
    },
    strengths,
    improvements,
    recommendedGames,
    evidenceMissions: completedMissionIds,
  };
}
