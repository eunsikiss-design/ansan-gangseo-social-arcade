import type { EvidenceCardData, Mission, MissionStep, Scene } from "@/src/game/types";

const scene = (id: string, speaker: string, text: string, character: Scene["character"], expression: string, background = "hq_lobby", position: Scene["position"] = "right"): Scene => ({
  id, speaker, text, character, expression, background, position,
});

export const evidenceCatalog: Record<string, EvidenceCardData> = {
  HUMAN_DIGNITY: { id: "HUMAN_DIGNITY", title: "인간의 존엄", category: "concept", description: "인간은 인간이라는 이유만으로 존중받아야 한다.", sourceLabel: "통합사회2 핵심 개념", relatedConceptIds: ["human-rights", "dignity"], reliability: 5 },
  UNIVERSALITY: { id: "UNIVERSALITY", title: "인권의 보편성", category: "concept", description: "인권은 국적·성별·인종 등에 관계없이 모든 인간에게 적용된다.", sourceLabel: "인권 DNA 분석", relatedConceptIds: ["universality"], reliability: 5 },
  NATURAL_RIGHT: { id: "NATURAL_RIGHT", title: "인권의 천부성", category: "concept", description: "인권은 국가가 허락해서가 아니라 인간으로 태어날 때부터 갖는다.", sourceLabel: "인권 DNA 분석", relatedConceptIds: ["natural"], reliability: 5 },
  FREEDOM_RIGHT: { id: "FREEDOM_RIGHT", title: "자유권 확대 기록", category: "historical", description: "시민 혁명은 국가 권력의 간섭에서 벗어날 자유를 확대했다.", sourceLabel: "혁명 아카이브", relatedConceptIds: ["freedom"], reliability: 4 },
  EQUALITY_RIGHT: { id: "EQUALITY_RIGHT", title: "평등권 확대 기록", category: "historical", description: "신분과 성별에 따른 차별을 줄이려는 요구가 권리의 범위를 넓혔다.", sourceLabel: "혁명 아카이브", relatedConceptIds: ["equality"], reliability: 4 },
  SOCIAL_RIGHT: { id: "SOCIAL_RIGHT", title: "사회권의 등장", category: "historical", description: "인간다운 생활을 위해 국가의 적극적 역할이 요구되었다.", sourceLabel: "산업화 도시 조사", relatedConceptIds: ["social"], reliability: 4 },
  SOLIDARITY_RIGHT: { id: "SOLIDARITY_RIGHT", title: "연대권", category: "concept", description: "평화와 환경처럼 공동의 협력이 필요한 권리이다.", sourceLabel: "전후 세계 기록", relatedConceptIds: ["solidarity"], reliability: 4 },
  YOUTH_TESTIMONY: { id: "YOUTH_TESTIMONY", title: "당사자 인터뷰", category: "testimony", description: "오래전 공개한 영상이 계속 확산되어 일상생활에서 피해를 겪고 있다.", sourceLabel: "학습용 가상 사례 인터뷰", relatedConceptIds: ["forgotten-right"], reliability: 4 },
  PLATFORM_POLICY: { id: "PLATFORM_POLICY", title: "플랫폼 운영 원칙", category: "law", description: "삭제 요청과 표현·기록의 필요성을 함께 검토하는 절차가 필요하다.", sourceLabel: "교과서 내용을 바탕으로 재구성", relatedConceptIds: ["privacy"], reliability: 4 },
  PUBLIC_OPINION: { id: "PUBLIC_OPINION", title: "시민 의견 표본", category: "opinion", description: "피해 구제와 공익적 기록 보존을 함께 고려해야 한다는 의견이 있다.", sourceLabel: "게임용 가상 데이터", relatedConceptIds: ["privacy", "expression"], reliability: 3 },
  HOUSING_RIGHT: { id: "HOUSING_RIGHT", title: "주거권", category: "concept", description: "안전하고 쾌적한 주거 환경에서 살아갈 권리이다.", sourceLabel: "ARCA 도시 조사", relatedConceptIds: ["housing"], reliability: 5 },
  SAFETY_RIGHT: { id: "SAFETY_RIGHT", title: "안전권", category: "concept", description: "위험으로부터 보호받으며 안전하게 생활할 권리이다.", sourceLabel: "ARCA 도시 조사", relatedConceptIds: ["safety"], reliability: 5 },
  ENVIRONMENT_RIGHT: { id: "ENVIRONMENT_RIGHT", title: "환경권", category: "concept", description: "건강하고 쾌적한 환경에서 생활할 권리이다.", sourceLabel: "ARCA 도시 조사", relatedConceptIds: ["environment"], reliability: 5 },
  CULTURE_RIGHT: { id: "CULTURE_RIGHT", title: "문화권", category: "concept", description: "문화생활에 참여하고 향유할 기회를 누릴 권리이다.", sourceLabel: "ARCA 도시 조사", relatedConceptIds: ["culture"], reliability: 5 },
};

const activity = (id: string, type: MissionStep["type"], title: string, extras: Partial<MissionStep> = {}): MissionStep => ({ id, type, title, ...extras });

const mission = (data: Omit<Mission, "actId" | "required" | "estimatedMinutes" | "backgrounds" | "endingScenes">): Mission => ({
  actId: "act-1", required: true, estimatedMinutes: 6, backgrounds: [data.openingScenes[0]?.background ?? "hq_lobby"], endingScenes: [], ...data,
});

export const missions: Mission[] = [
  mission({ id: "m01", number: 1, title: "인간인가, 재산인가", subtitle: "인권의 의미와 인간의 존엄", relatedConceptIds: ["인권", "인간 존엄"],
    openingScenes: [scene("m01-o1", "아리", "탐구관, 역사자료실에서 오래된 사건 기록이 발견됐어.", "ari", "guide", "history_archive"), scene("m01-o2", "해온", "법이 존재한다고 해서 언제나 인간의 존엄을 보장했던 것은 아니야.", "haeon", "serious", "history_archive")],
    activities: [activity("m01-b", "briefing", "오래된 기록의 가치", { body: "학습을 위해 재구성한 가상 사례입니다. 한 사람이 재산처럼 거래된 기록에서 가장 근본적으로 침해된 가치를 찾으세요." }), activity("m01-s", "source", "역사자료실 사건 기록", { body: "기록은 당시 규정에 따른 거래라고 설명하지만, 당사자의 의사와 존엄은 고려하지 않았습니다." }), activity("m01-p", "puzzle", "핵심 가치 판별", { question: "이 사건에서 가장 근본적으로 침해된 가치는 무엇일까?", choices: ["재산권", "인간의 존엄", "참정권", "문화권"], answer: 1 })],
    zeroChallenge: activity("m01-z", "zero", "ZERO의 반론", { body: "당시 법이 그렇게 규정했다면 그 시대에는 정당했다고 볼 수도 있지 않을까?", choices: ["법이면 언제나 정당하다.", "법의 존재와 인간 존엄의 보장은 구분해야 한다."], answer: 1 }), investigations: ["사건 기록", "당사자 관점"], evidenceIds: ["HUMAN_DIGNITY"], decisions: ["당시 규정을 그대로 인정한다.", "인간의 존엄을 우선해 재평가한다."], outcomes: ["기록만 유지됨", "인권 관점이 회복됨"], rewards: { exp: 50 }, nextMissionId: "m02" }),
  mission({ id: "m02", number: 2, title: "인권 DNA를 찾아라", subtitle: "보편성·천부성·불가침성·항구성", relatedConceptIds: ["보편성", "천부성", "불가침성", "항구성"],
    openingScenes: [scene("m02-o1", "아리", "흩어진 인권 DNA 네 조각을 사례와 연결해 복구하자.", "ari", "research", "investigation_room")],
    activities: [activity("m02-b", "briefing", "DNA 복구 작전", { body: "카드의 잘못된 주장에 대응하는 인권의 특성을 찾으세요." }), activity("m02-p", "puzzle", "DNA 카드 매칭", { question: "‘국적이 다르면 인권이 없다’는 주장과 반대되는 특성은?", choices: ["보편성", "천부성", "불가침성", "항구성"], answer: 0 }), activity("m02-e", "evidence", "DNA 조각 복구", { evidenceIds: ["UNIVERSALITY", "NATURAL_RIGHT"] })],
    zeroChallenge: activity("m02-z", "zero", "ZERO의 검증", { body: "국가가 보장하지 못하는 권리도 정말 인권이라고 할 수 있을까?", choices: ["국가가 허락해야만 인권이다.", "보장의 현실과 권리의 근원은 구분해야 한다."], answer: 1 }), investigations: ["국적 사례", "국가 보장 사례"], evidenceIds: ["UNIVERSALITY", "NATURAL_RIGHT"], decisions: ["인권은 조건에 따라 생긴다.", "인권은 모든 인간에게 본래 주어진다."], outcomes: ["DNA 불안정", "HUMAN RIGHTS DNA COMPLETE"], rewards: { exp: 60 }, nextMissionId: "m03" }),
  mission({ id: "m03", number: 3, title: "혁명의 문을 열어라", subtitle: "시민 혁명과 권리의 확대", relatedConceptIds: ["자유권", "평등권", "참정권"],
    openingScenes: [scene("m03-o1", "해온", "연도를 외우기보다 사람들이 어떤 문제를 바꾸려 했는지 살펴보자.", "haeon", "guide", "revolution_archive")],
    activities: [activity("m03-b", "briefing", "혁명 아카이브", { body: "문제 → 요구 → 확대된 권리의 흐름을 복원하세요." }), activity("m03-i", "investigation", "시민의 요구 조사", { items: ["자의적 권력에 맞선 자유 요구", "신분 차별에 맞선 평등 요구", "대표를 뽑을 참정 요구"] }), activity("m03-p", "puzzle", "타임라인 의미 연결", { question: "차티스트 운동과 여성 참정권 운동이 공통으로 확대한 권리는?", choices: ["재산권", "참정권", "환경권", "문화권"], answer: 1 })],
    zeroChallenge: activity("m03-z", "zero", "ZERO의 질문", { body: "권리를 한꺼번에 모두에게 확대하면 사회가 혼란스러워지지 않을까?", choices: ["질서를 위해 요구를 금지한다.", "질서와 권리 확대의 근거를 함께 검토한다."], answer: 1 }), investigations: ["명예혁명", "미국 독립 혁명", "프랑스 혁명", "참정권 운동"], evidenceIds: ["FREEDOM_RIGHT", "EQUALITY_RIGHT"], decisions: ["기존 질서를 유지한다.", "권리 확대 요구를 제도에 반영한다."], outcomes: ["변화 지연", "시민의 권리 확대"], rewards: { exp: 60 }, nextMissionId: "m04" }),
  mission({ id: "m04", number: 4, title: "권리는 왜 늘어났을까", subtitle: "사회권과 연대권의 등장", relatedConceptIds: ["사회권", "연대권"],
    openingScenes: [scene("m04-o1", "해온", "산업화가 만든 성장 뒤에 어떤 삶이 가려졌는지 인권 렌즈로 보자.", "haeon", "skill", "industrial_city")],
    activities: [activity("m04-b", "briefing", "시대 이동 시뮬레이션", { body: "산업화 도시와 세계대전 이후의 문제를 차례로 조사하세요." }), activity("m04-s", "source", "산업화 도시 생활 기록", { body: "경제는 성장했지만 긴 노동시간과 열악한 주거 환경 때문에 인간다운 생활이 어려웠습니다." }), activity("m04-p", "puzzle", "시대·문제·권리 연결", { question: "인간다운 생활을 위해 국가의 적극적 역할을 요구한 권리는?", choices: ["자유권", "사회권", "참정권", "재산권"], answer: 1 }), activity("m04-e", "evidence", "새 권리 발견", { evidenceIds: ["SOCIAL_RIGHT", "SOLIDARITY_RIGHT"] })],
    zeroChallenge: activity("m04-z", "zero", "ZERO의 반론", { body: "국가가 개인의 자유만 침해하지 않으면 되는 것 아닌가?", choices: ["자유만 보장하면 충분하다.", "실질적인 인간다운 생활 조건도 필요하다."], answer: 1 }), investigations: ["산업화 도시", "전후 세계"], evidenceIds: ["SOCIAL_RIGHT", "SOLIDARITY_RIGHT"], decisions: ["소극적 자유만 보장한다.", "사회권과 국제적 연대를 함께 강화한다."], outcomes: ["생활 격차 지속", "새로운 인권 확대"], rewards: { exp: 70 }, nextMissionId: "m05" }),
  mission({ id: "m05", number: 5, title: "지워지지 않는 영상", subtitle: "개인정보·잊힐 권리·권리 충돌", relatedConceptIds: ["새로운 인권", "잊힐 권리"],
    openingScenes: [scene("m05-o1", "NPC 지우", "어릴 때 올린 영상이 계속 퍼져서 학교생활이 너무 힘들어요.", "npc", "worried", "digital_case_room", "left"), scene("m05-o2", "아리", "먼저 피해와 공익, 기록의 필요성을 함께 확인해 보자.", "ari", "think", "digital_case_room")],
    activities: [activity("m05-b", "briefing", "디지털 흔적 사건", { body: "교과서 내용을 바탕으로 재구성한 학습용 가상 사례입니다." }), activity("m05-i", "investigation", "자료 3개 조사", { items: ["당사자 인터뷰", "플랫폼 운영정책", "개인정보 관련 설명", "게시물 확산 상황", "시민 의견"] }), activity("m05-s", "source", "게시물 확산 상황", { body: "게임용 가상 데이터: 최초 게시물 외에 7개의 재게시물이 확인되었습니다. 수치는 개념 학습을 위한 가상 값입니다." }), activity("m05-e", "evidence", "근거 보관함", { evidenceIds: ["YOUTH_TESTIMONY", "PLATFORM_POLICY", "PUBLIC_OPINION"] })],
    zeroChallenge: activity("m05-z", "zero", "ZERO CHALLENGE", { body: "자기가 공개한 정보까지 모두 삭제하면 공적인 기록과 표현의 자유는 어떻게 지키지?", choices: ["언제나 전부 삭제한다.", "피해·공익·표현과 기록을 기준에 따라 함께 검토한다."], answer: 1 }), investigations: ["당사자 인터뷰", "플랫폼 운영정책", "개인정보 설명", "확산 상황", "시민 의견"], evidenceIds: ["YOUTH_TESTIMONY", "PLATFORM_POLICY", "PUBLIC_OPINION"], decisions: ["요청하면 모든 정보를 항상 삭제한다.", "공개된 정보는 어떤 경우에도 삭제하지 않는다.", "피해·공익·표현·기록을 검토하는 절차를 마련한다."], outcomes: ["기록 접근 급감", "피해 구제 실패", "권리 간 균형 절차 마련"], rewards: { exp: 90 }, nextMissionId: "m06" }),
  mission({ id: "m06", number: 6, title: "네 개의 새로운 권리", subtitle: "주거권·안전권·환경권·문화권", relatedConceptIds: ["주거권", "안전권", "환경권", "문화권"],
    openingScenes: [scene("m06-o1", "아리", "ARCA 네 구역에서 동시에 인권 경보가 발생했어.", "ari", "warning", "arca_city_map")],
    activities: [activity("m06-b", "briefing", "ARCA 도시 긴급 조사", { body: "각 지역의 생활 문제를 현대적 인권과 연결하세요." }), activity("m06-i", "investigation", "네 구역 현장 확인", { items: ["ZONE A 반지하 침수와 열악한 주거", "ZONE B 위험한 통학 환경", "ZONE C 대기오염", "ZONE D 문화시설 접근 격차"] }), activity("m06-p", "puzzle", "권리 신호 연결", { question: "지역 간 문화시설 접근 격차와 가장 관련 깊은 권리는?", choices: ["안전권", "환경권", "문화권", "재산권"], answer: 2 }), activity("m06-e", "evidence", "현대적 인권 지도", { evidenceIds: ["HOUSING_RIGHT", "SAFETY_RIGHT", "ENVIRONMENT_RIGHT", "CULTURE_RIGHT"] })],
    zeroChallenge: activity("m06-z", "zero", "최종 관점 검증", { body: "예산이 제한되어 있는데 네 권리를 모두 고려하는 게 현실적일까?", choices: ["가장 싼 정책 하나만 시행한다.", "위험의 긴급성과 권리 영향을 비교해 단계적으로 시행한다."], answer: 1 }), investigations: ["주거 구역", "통학 구역", "환경 구역", "문화 구역"], evidenceIds: ["HOUSING_RIGHT", "SAFETY_RIGHT", "ENVIRONMENT_RIGHT", "CULTURE_RIGHT"], decisions: ["한 지역만 지원한다.", "긴급성과 영향에 따라 네 구역 개선안을 단계적으로 실행한다."], outcomes: ["지역 격차 확대", "도시 인권 안전망 강화"], rewards: { exp: 100, title: "인권 탐지자", skill: "인권 렌즈 Lv.1" } }),
];

export const getMissionSteps = (mission: Mission): MissionStep[] => [
  mission.activities[0],
  ...mission.openingScenes.map((item, index) => activity(`${mission.id}-dialogue-${index}`, "dialogue", "사건 대화", { scene: item })),
  ...mission.activities.slice(1),
  ...(mission.activities.some((item) => item.type === "evidence") ? [] : [activity(`${mission.id}-evidence-final`, "evidence", "Evidence 확보", { evidenceIds: mission.evidenceIds })]),
  mission.zeroChallenge,
  activity(`${mission.id}-decision`, "decision", "최종 판단", { choices: mission.decisions }),
  activity(`${mission.id}-result`, "result", "사건 결과"),
];

export const academyRooms = [
  { id: "room1", title: "ROOM 1 — 인권의 의미", concepts: ["인권", "인간 존엄", "보편성", "천부성", "불가침성", "항구성"], question: "모든 인간에게 차별 없이 적용되는 인권의 특성은?", choices: ["보편성", "항구성", "참정권"], answer: 0 },
  { id: "room2", title: "ROOM 2 — 인권의 확장", concepts: ["자유권", "평등권", "참정권", "사회권", "연대권"], question: "인간다운 생활을 위한 국가의 적극적 역할과 관련된 권리는?", choices: ["자유권", "사회권", "재산권"], answer: 1 },
  { id: "room3", title: "ROOM 3 — 현대적 인권", concepts: ["주거권", "안전권", "환경권", "문화권", "잊힐 권리"], question: "온라인 개인정보 피해와 가장 관련 깊은 새로운 권리는?", choices: ["잊힐 권리", "참정권", "재산권"], answer: 0 },
];
