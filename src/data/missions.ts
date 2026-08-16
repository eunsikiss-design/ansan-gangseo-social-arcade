import type { EvidenceCardData, Mission, MissionStep, Scene } from "@/src/game/types";

const scene = (id: string, speaker: string, text: string, character: Scene["character"], expression: string, background = "hq_lobby", position: Scene["position"] = "right"): Scene => ({ id, speaker, text, character, expression, background, position });
const activity = (id: string, type: MissionStep["type"], title: string, extras: Partial<MissionStep> = {}): MissionStep => ({ id, type, title, ...extras });
const mission = (data: Omit<Mission, "actId" | "required" | "estimatedMinutes" | "backgrounds" | "endingScenes">): Mission => ({
  actId: "act-1", required: true, estimatedMinutes: 9, backgrounds: [data.openingScenes[0]?.background ?? "hq_lobby"], endingScenes: [], ...data,
});

export const evidenceCatalog: Record<string, EvidenceCardData> = {
  HUMAN_DIGNITY: { id: "HUMAN_DIGNITY", title: "권리 카드 · 인간 존엄", category: "concept", description: "인간은 다른 목적을 위한 수단이 아니라 그 자체로 존중받아야 한다.", sourceLabel: "교과서 핵심 개념 재구성", relatedConceptIds: ["인권", "인간 존엄"], reliability: 5 },
  UNIVERSALITY: { id: "UNIVERSALITY", title: "권리 카드 · 보편성", category: "concept", description: "인권은 인종·성별·종교·사회적 신분과 관계없이 모든 사람에게 적용된다.", sourceLabel: "인권 DNA 분석", relatedConceptIds: ["보편성"], reliability: 5 },
  NATURAL_RIGHT: { id: "NATURAL_RIGHT", title: "권리 카드 · 천부성", category: "concept", description: "인권은 국가가 허락해서가 아니라 인간으로 태어날 때부터 갖는다.", sourceLabel: "인권 DNA 분석", relatedConceptIds: ["천부성"], reliability: 5 },
  INVIOLABILITY: { id: "INVIOLABILITY", title: "권리 카드 · 불가침성", category: "concept", description: "인권은 함부로 빼앗거나 양도할 수 없는 권리이다.", sourceLabel: "인권 DNA 분석", relatedConceptIds: ["불가침성"], reliability: 5 },
  PERMANENCE: { id: "PERMANENCE", title: "권리 카드 · 항구성", category: "concept", description: "인권은 일정 기간에만 한정되지 않고 영구히 보장되어야 한다.", sourceLabel: "인권 DNA 분석", relatedConceptIds: ["항구성"], reliability: 5 },
  FREEDOM_RIGHT: { id: "FREEDOM_RIGHT", title: "권리 카드 · 자유권", category: "historical", description: "시민 혁명은 국가 권력의 부당한 간섭에서 벗어날 자유를 제도화했다.", sourceLabel: "시민 혁명 기록실", relatedConceptIds: ["자유권"], reliability: 5 },
  EQUALITY_RIGHT: { id: "EQUALITY_RIGHT", title: "권리 카드 · 평등권", category: "historical", description: "시민은 성별·신분 등을 이유로 부당하게 차별받지 않을 권리를 요구했다.", sourceLabel: "시민 혁명 기록실", relatedConceptIds: ["평등권"], reliability: 5 },
  PARTICIPATION_RIGHT: { id: "PARTICIPATION_RIGHT", title: "권리 카드 · 참정권", category: "historical", description: "차티스트 운동과 여성 참정권 운동은 정치 참여의 범위를 넓혔다.", sourceLabel: "참정권 확대 연표", relatedConceptIds: ["참정권"], reliability: 5 },
  SOCIAL_RIGHT: { id: "SOCIAL_RIGHT", title: "권리 카드 · 사회권", category: "law", description: "국가는 모든 사람이 최소한의 인간다운 생활을 누릴 수 있도록 적극적으로 보장해야 한다.", sourceLabel: "바이마르 헌법 기록", relatedConceptIds: ["사회권"], reliability: 5 },
  SOLIDARITY_RIGHT: { id: "SOLIDARITY_RIGHT", title: "권리 카드 · 연대권", category: "historical", description: "평화·환경과 같은 문제는 국경을 넘어 공동의 노력으로 해결해야 한다.", sourceLabel: "세계 인권 선언 기록", relatedConceptIds: ["연대권"], reliability: 5 },
  YOUTH_TESTIMONY: { id: "YOUTH_TESTIMONY", title: "피해 학생 진술", category: "testimony", description: "오래된 공개 영상이 계속 확산되어 학교생활과 일상에 피해가 생겼다.", sourceLabel: "신고인 면담", relatedConceptIds: ["개인정보", "잊힐 권리"], reliability: 4 },
  PLATFORM_POLICY: { id: "PLATFORM_POLICY", title: "플랫폼 심사 기준", category: "law", description: "삭제 요청은 피해, 공익, 표현의 자유, 기록의 필요성을 함께 살피도록 되어 있다.", sourceLabel: "가상 플랫폼 정책", relatedConceptIds: ["사생활", "표현의 자유"], reliability: 4 },
  PUBLIC_OPINION: { id: "PUBLIC_OPINION", title: "시민 의견 표본", category: "opinion", description: "피해 구제와 공익적 기록 보존을 함께 고려해야 한다는 상반된 의견이 확인된다.", sourceLabel: "ARCA 시민 패널", relatedConceptIds: ["권리 충돌"], reliability: 3 },
  HOUSING_RIGHT: { id: "HOUSING_RIGHT", title: "권리 카드 · 주거권", category: "concept", description: "쾌적하고 안정적인 주거 환경에서 인간다운 주거 생활을 할 권리이다.", sourceLabel: "도시 현장 조사", relatedConceptIds: ["주거권"], reliability: 5 },
  SAFETY_RIGHT: { id: "SAFETY_RIGHT", title: "권리 카드 · 안전권", category: "concept", description: "자연재해·안전사고·감염병 등 각종 위험으로부터 보호받을 권리이다.", sourceLabel: "도시 현장 조사", relatedConceptIds: ["안전권"], reliability: 5 },
  ENVIRONMENT_RIGHT: { id: "ENVIRONMENT_RIGHT", title: "권리 카드 · 환경권", category: "concept", description: "건강하고 쾌적한 생활에 필요한 환경을 누릴 권리이자 보전할 책임이다.", sourceLabel: "도시 현장 조사", relatedConceptIds: ["환경권"], reliability: 5 },
  CULTURE_RIGHT: { id: "CULTURE_RIGHT", title: "권리 카드 · 문화권", category: "concept", description: "문화생활에 참여하고 예술을 향유하며 자신의 문화적 정체성을 유지할 권리이다.", sourceLabel: "도시 현장 조사", relatedConceptIds: ["문화권"], reliability: 5 },
};

export const missions: Mission[] = [
  mission({ id: "m01", number: 1, title: "인간인가, 재산인가", subtitle: "임명 첫날 · 인간 존엄 사건", relatedConceptIds: ["인권", "인간 존엄"],
    openingScenes: [
      scene("m01-o1", "아리", "신입 인권수호관 임명을 환영해. 첫 사건은 오래된 기록 한 줄에서 시작됐어.", "ari", "guide", "history_archive"),
      scene("m01-o2", "해온", "당시 법원이 한 인간을 화물처럼 취급했어. 법에 적혀 있었다는 이유만으로 정당화할 수 있을까?", "haeon", "serious", "history_archive"),
    ],
    activities: [
      activity("m01-b", "briefing", "사건번호 HR-001 · 사라진 이름", { body: "노예 무역 기록에서 사람이 재산으로 분류된 흔적이 발견되었습니다. 기록의 법적 형식과 인간의 존엄이라는 기준을 구분해 첫 판정을 내리세요." }),
      activity("m01-s", "source", "기록 보관소 복원 문서", { body: "당시 판결은 사람을 화물과 같은 재산으로 보았습니다. 그러나 인권은 인간이라는 이유만으로 존엄을 보장받으며 행복하게 살아갈 권리입니다." }),
      activity("m01-p1", "puzzle", "긴급 판독 · OX", { question: "인권은 법률이 만들어 준 사람에게만 인정되는 권리이다.", choices: ["O · 법률이 있어야만 생긴다", "X · 인간이라는 이유만으로 갖는다"], answer: 1 }),
      activity("m01-p2", "puzzle", "핵심 가치 탐지", { question: "사람을 거래 가능한 물건으로 다룬 사건에서 가장 근본적으로 침해된 가치는?", choices: ["재산권", "인간으로서의 존엄과 가치", "참정권", "문화권"], answer: 1 }),
    ],
    zeroChallenge: activity("m01-z", "zero", "ZERO의 첫 반론", { body: "당시 법이 허용했다면 그 시대에는 정당했다고 봐야 하지 않을까?", choices: ["법이면 언제나 정당하다.", "법의 존재와 인간 존엄의 보장은 구분해야 한다."], answer: 1 }),
    investigations: ["판결 기록", "당사자의 인간적 지위"], evidenceIds: ["HUMAN_DIGNITY"], decisions: ["당시 규정을 그대로 인정한다.", "인간 존엄을 기준으로 판결 기록을 재평가한다."], outcomes: ["침해 기록 방치", "첫 권리 카드 확보"], rewards: { exp: 50 }, nextMissionId: "m02" }),

  mission({ id: "m02", number: 2, title: "인권 DNA를 찾아라", subtitle: "조작된 권리 데이터 복구", relatedConceptIds: ["보편성", "천부성", "불가침성", "항구성"],
    openingScenes: [
      scene("m02-o1", "아리", "누군가 인권수호국 데이터베이스에서 인권의 네 가지 특성을 분리해 버렸어.", "ari", "surprise", "investigation_room"),
      scene("m02-o2", "해온", "잘못 연결하면 특정 집단의 권리가 시스템에서 사라져. 네 개의 DNA를 모두 복구하자.", "haeon", "warning", "investigation_room"),
    ],
    activities: [
      activity("m02-b", "briefing", "사건번호 HR-002 · DNA 해킹", { body: "보편성·천부성·불가침성·항구성을 각각의 왜곡된 주장과 정확히 연결하세요." }),
      activity("m02-p1", "puzzle", "DNA 1 · 보편성", { question: "‘국적이 다르면 인권을 인정하지 않아도 된다’는 주장에 맞서는 특성은?", choices: ["보편성", "천부성", "불가침성", "항구성"], answer: 0 }),
      activity("m02-p2", "puzzle", "DNA 2 · 천부성", { question: "‘국가가 허가증을 발급해야 인권이 생긴다’는 주장에 맞서는 특성은?", choices: ["항구성", "불가침성", "천부성", "보편성"], answer: 2 }),
      activity("m02-p3", "puzzle", "DNA 3 · 불가침성", { question: "‘돈을 받았으니 자신의 인권을 모두 넘길 수 있다’는 주장에 맞서는 특성은?", choices: ["항구성", "불가침성", "보편성", "천부성"], answer: 1 }),
      activity("m02-p4", "puzzle", "DNA 4 · 항구성", { question: "‘성인이 된 뒤에는 인권 보장이 끝난다’는 주장에 맞서는 특성은?", choices: ["보편성", "천부성", "불가침성", "항구성"], answer: 3 }),
      activity("m02-e", "evidence", "인권 DNA 권리 카드", { evidenceIds: ["UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY", "PERMANENCE"] }),
    ],
    zeroChallenge: activity("m02-z", "zero", "ZERO의 검증", { body: "현실에서 보장되지 않는 권리도 정말 인권이라고 부를 수 있을까?", choices: ["국가가 실제로 보장해야만 인권이다.", "권리의 근원과 현실의 보장 수준은 구분해야 한다."], answer: 1 }),
    investigations: ["국적 차별 데이터", "권리 양도 계약", "연령 제한 규정"], evidenceIds: ["UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY", "PERMANENCE"], decisions: ["인권은 조건에 따라 생기고 사라진다.", "인권은 모든 인간에게 본래 주어지며 영구히 보장되어야 한다."], outcomes: ["DNA 복구 실패", "HUMAN RIGHTS DNA COMPLETE"], rewards: { exp: 70 }, nextMissionId: "m03" }),

  mission({ id: "m03", number: 3, title: "혁명의 문을 열어라", subtitle: "시민 혁명과 권리 확장 추적", relatedConceptIds: ["자유권", "평등권", "참정권"],
    openingScenes: [
      scene("m03-o1", "해온", "기록실의 세 문이 잠겼다. 사건의 이름이 아니라 사람들이 요구한 권리로 열어야 해.", "haeon", "guide", "revolution_archive"),
      scene("m03-o2", "ZERO", "연표를 외웠다고 권리의 의미까지 이해한 건 아니겠지?", "zero", "confident", "revolution_archive"),
    ],
    activities: [
      activity("m03-b", "briefing", "사건번호 HR-003 · 봉인된 혁명 기록", { body: "영국 명예혁명, 미국 독립 혁명, 프랑스 혁명 이후 권리가 어떻게 확장되었는지 ‘문제→요구→권리’로 복원하세요." }),
      activity("m03-i", "investigation", "혁명 기록 세 장 조사", { items: ["왕의 자의적 권력과 자유 요구", "신분 차별과 평등 요구", "정치 참여 배제와 선거권 요구"] }),
      activity("m03-p1", "puzzle", "연결 1 · 시민 혁명", { question: "근대 시민 혁명에서 국가 권력의 부당한 간섭을 줄이려는 요구와 연결되는 권리는?", choices: ["사회권", "자유권", "문화권", "청구권"], answer: 1 }),
      activity("m03-p2", "puzzle", "연결 2 · 참정권 확대", { question: "차티스트 운동과 여성 참정권 운동의 공통 요구는?", choices: ["주거 안정", "환경 보전", "정치 참여 기회의 확대", "재판 받을 권리"], answer: 2 }),
      activity("m03-p3", "puzzle", "순서 복원", { question: "권리 확장의 흐름으로 가장 적절한 것은?", choices: ["세계 대전→시민 혁명→산업 혁명", "시민 혁명→산업 혁명→세계 대전", "산업 혁명→세계 대전→시민 혁명"], answer: 1 }),
      activity("m03-e", "evidence", "혁명의 권리 카드", { evidenceIds: ["FREEDOM_RIGHT", "EQUALITY_RIGHT", "PARTICIPATION_RIGHT"] }),
    ],
    zeroChallenge: activity("m03-z", "zero", "ZERO의 역사 반론", { body: "처음부터 모든 사람에게 참정권이 주어지지 않았다면 시민 혁명은 실패한 것 아닐까?", choices: ["완전하지 않았으니 의미가 없다.", "한계가 있었지만 이후 권리 확대의 출발점이 되었다."], answer: 1 }),
    investigations: ["명예혁명", "미국 독립 혁명", "프랑스 혁명", "참정권 운동"], evidenceIds: ["FREEDOM_RIGHT", "EQUALITY_RIGHT", "PARTICIPATION_RIGHT"], decisions: ["초기의 한계만 기록한다.", "성과와 한계를 함께 기록하고 이후 확대 과정을 연결한다."], outcomes: ["역사 단절", "권리 확장 연표 복원"], rewards: { exp: 80 }, nextMissionId: "m04" }),

  mission({ id: "m04", number: 4, title: "권리는 왜 늘어났을까", subtitle: "산업화·세계 대전과 새로운 권리", relatedConceptIds: ["사회권", "연대권"],
    openingScenes: [
      scene("m04-o1", "해온", "공장 도시는 성장했지만 노동자들의 삶은 무너지고 있어. 자유만으로 충분한지 확인하자.", "haeon", "skill", "industrial_city"),
      scene("m04-o2", "아리", "그리고 전쟁 뒤에는 어느 한 국가만으로 해결할 수 없는 문제가 남았어.", "ari", "research", "postwar_world"),
    ],
    activities: [
      activity("m04-b", "briefing", "사건번호 HR-004 · 두 시대의 구조 신호", { body: "산업 혁명 이후의 열악한 생활 조건과 세계 대전 이후의 공동 문제를 비교해 사회권과 연대권의 등장 이유를 찾으세요." }),
      activity("m04-s", "source", "산업 도시 생활 보고서", { body: "경제는 성장했지만 많은 노동자가 장시간 노동, 열악한 주거, 교육과 생존의 불안에 놓였습니다. 시민은 국가가 인간다운 생활을 적극 보장할 것을 요구했습니다." }),
      activity("m04-p1", "puzzle", "완성형 · 사회권", { question: "바이마르 헌법이 처음 규정한 핵심 권리는 ‘모든 사람이 최소한의 (   ) 생활을 누릴 권리’이다.", choices: ["인간다운", "경쟁적인", "사적인", "정치적인"], answer: 0 }),
      activity("m04-p2", "puzzle", "시대-권리 배합", { question: "산업 혁명 이후와 세계 대전 이후에 강조된 권리를 바르게 연결한 것은?", choices: ["산업 혁명-사회권 / 세계 대전-연대권", "산업 혁명-연대권 / 세계 대전-자유권", "산업 혁명-참정권 / 세계 대전-재산권"], answer: 0 }),
      activity("m04-e", "evidence", "시대 확장 권리 카드", { evidenceIds: ["SOCIAL_RIGHT", "SOLIDARITY_RIGHT"] }),
    ],
    zeroChallenge: activity("m04-z", "zero", "ZERO의 국가 역할 반론", { body: "국가가 개인의 자유만 침해하지 않으면 인권 보장은 끝난 것 아닌가?", choices: ["자유만 보장하면 충분하다.", "실질적인 인간다운 생활 조건도 적극적으로 보장해야 한다."], answer: 1 }),
    investigations: ["산업 혁명 도시", "바이마르 헌법", "세계 대전 이후 국제 협력"], evidenceIds: ["SOCIAL_RIGHT", "SOLIDARITY_RIGHT"], decisions: ["소극적 자유만 보장한다.", "사회권 보장과 국제적 연대를 함께 강화한다."], outcomes: ["생활 격차 지속", "새로운 인권 확장"], rewards: { exp: 80 }, nextMissionId: "m05" }),

  mission({ id: "m05", number: 5, title: "지워지지 않는 영상", subtitle: "첫 시민 신고 · 새로운 인권과 권리 충돌", relatedConceptIds: ["새로운 인권", "개인정보", "잊힐 권리", "표현의 자유"],
    openingScenes: [
      scene("m05-o1", "NPC 지민", "어릴 때 공개된 영상이 계속 퍼져요. 이름을 검색하면 가장 먼저 나와서 학교생활도 너무 힘들어요.", "npc", "worried", "digital_case_room", "left"),
      scene("m05-o2", "아리", "이제 훈련 기록이 아니라 실제 신고야. 피해와 공익, 표현의 자유를 모두 확인해야 해.", "ari", "think", "digital_case_room"),
      scene("m05-o3", "해온", "서두른 삭제도, 무조건적인 보존도 위험해. 근거를 세 장 이상 확보하자.", "haeon", "warning", "digital_case_room"),
    ],
    activities: [
      activity("m05-b", "briefing", "사건번호 HR-005 · 디지털 흔적 신고", { body: "피해 학생의 진술, 플랫폼 정책, 확산 상황, 시민 의견을 조사한 뒤 권리 충돌을 조정하는 절차를 설계하세요." }),
      activity("m05-i", "investigation", "디지털 사건 자료 조사", { items: ["피해 학생 인터뷰", "플랫폼 운영 정책", "개인정보 관련 설명", "게시물 확산 상황", "시민 의견"] }),
      activity("m05-s", "source", "확산 분석 보고", { body: "최초 게시물 외에 여러 재게시물이 발견되었습니다. 단순 삭제 한 번으로 피해가 끝나지 않으며, 공개 목적과 현재의 공익성도 함께 검토해야 합니다." }),
      activity("m05-p", "puzzle", "자료 해석 · 1문장 판단", { question: "이 사건을 판단할 때 가장 적절한 조사 원칙은?", choices: ["피해자의 요구만 확인한다.", "조회 수가 많으면 무조건 보존한다.", "피해 정도·공익성·표현의 자유·기록 필요성을 함께 비교한다."], answer: 2 }),
      activity("m05-e", "evidence", "사건 근거 보관함", { evidenceIds: ["YOUTH_TESTIMONY", "PLATFORM_POLICY", "PUBLIC_OPINION"] }),
    ],
    zeroChallenge: activity("m05-z", "zero", "ZERO CHALLENGE", { body: "본인이 공개했던 정보까지 모두 지우면 공익적 기록과 표현의 자유는 어떻게 지키지?", choices: ["본인 요청이면 전부 즉시 삭제한다.", "피해·공익·표현·기록의 기준에 따라 사안별로 심사한다."], answer: 1 }),
    investigations: ["피해 학생 인터뷰", "플랫폼 운영 정책", "개인정보 설명", "확산 상황", "시민 의견"], evidenceIds: ["YOUTH_TESTIMONY", "PLATFORM_POLICY", "PUBLIC_OPINION"], decisions: ["요청된 정보를 모두 즉시 삭제한다.", "공개된 정보는 어떤 경우에도 삭제하지 않는다.", "피해·공익·표현·기록을 심사하고 재확산 방지까지 포함한 구제 절차를 마련한다."], outcomes: ["공익 기록 훼손 위험", "피해 구제 실패", "권리 간 균형 절차 마련"], rewards: { exp: 100 }, nextMissionId: "m06" }),

  mission({ id: "m06", number: 6, title: "네 개의 새로운 권리", subtitle: "도시 동시 경보 · 주거·안전·환경·문화", relatedConceptIds: ["주거권", "안전권", "환경권", "문화권"],
    openingScenes: [
      scene("m06-o1", "아리", "긴급 상황! ARCA 네 구역에서 동시에 인권 경보가 발생했어.", "ari", "warning", "arca_city_map"),
      scene("m06-o2", "해온", "모든 신고를 같은 방식으로 처리할 수는 없어. 현장 원인과 해당 권리를 먼저 연결하자.", "haeon", "resolve", "arca_city_map"),
    ],
    activities: [
      activity("m06-b", "briefing", "사건번호 HR-006 · 도시 복합 위기", { body: "도시 집중, 안전사고, 환경오염, 문화 격차가 만든 네 사건을 조사하고 현대 사회에서 확장된 권리와 연결하세요." }),
      activity("m06-i", "investigation", "네 구역 현장 확인", { items: ["ZONE A 반지하 침수와 불안정한 주거", "ZONE B 위험한 통학로와 반복 사고", "ZONE C 대기오염과 생활 환경 악화", "ZONE D 문화시설 접근과 문화 정체성 격차"] }),
      activity("m06-p1", "puzzle", "ZONE A · 주거 신호", { question: "쾌적하고 안정적인 환경에서 인간다운 주거 생활을 할 권리는?", choices: ["주거권", "안전권", "문화권", "참정권"], answer: 0 }),
      activity("m06-p2", "puzzle", "ZONE B · 안전 신호", { question: "재해와 각종 사고의 위험으로부터 보호받을 권리는?", choices: ["환경권", "안전권", "평등권", "청구권"], answer: 1 }),
      activity("m06-p3", "puzzle", "ZONE C · 환경 신호", { question: "환경권에 대한 설명으로 가장 적절한 것은?", choices: ["쾌적한 환경을 누릴 권리만 있고 의무는 없다.", "쾌적한 환경을 누릴 권리이며 국민에게도 보전 노력이 요구된다.", "문화시설을 이용할 권리이다."], answer: 1 }),
      activity("m06-p4", "puzzle", "ZONE D · 문화 신호", { question: "문화권의 내용으로 가장 적절한 것은?", choices: ["예술가에게만 인정되는 권리", "문화생활 참여와 예술 향유, 문화적 정체성 유지의 권리", "선거에 참여할 권리"], answer: 1 }),
      activity("m06-e", "evidence", "현대적 인권 도시 지도", { evidenceIds: ["HOUSING_RIGHT", "SAFETY_RIGHT", "ENVIRONMENT_RIGHT", "CULTURE_RIGHT"] }),
    ],
    zeroChallenge: activity("m06-z", "zero", "최종 관점 검증", { body: "예산이 제한되어 있는데 네 권리를 모두 고려하는 게 현실적일까?", choices: ["가장 싼 정책 하나만 시행한다.", "위험의 긴급성·피해 규모·권리 영향을 비교해 단계적으로 시행한다."], answer: 1 }),
    investigations: ["주거 구역", "통학 구역", "환경 구역", "문화 구역"], evidenceIds: ["HOUSING_RIGHT", "SAFETY_RIGHT", "ENVIRONMENT_RIGHT", "CULTURE_RIGHT"], decisions: ["한 지역만 지원하고 나머지는 보류한다.", "긴급성과 권리 영향을 기준으로 네 구역 개선안을 단계적으로 실행한다."], outcomes: ["도시 격차 확대", "도시 인권 안전망 강화"], rewards: { exp: 120, title: "신입 인권수호관", skill: "인권 렌즈 Lv.1" } }),
];

export const getMissionSteps = (item: Mission): MissionStep[] => [
  item.activities[0],
  ...item.openingScenes.map((entry, index) => activity(`${item.id}-dialogue-${index}`, "dialogue", "사건 대화", { scene: entry })),
  ...item.activities.slice(1),
  ...(item.activities.some((entry) => entry.type === "evidence") ? [] : [activity(`${item.id}-evidence-final`, "evidence", "권리 카드 회수", { evidenceIds: item.evidenceIds })]),
  item.zeroChallenge,
  activity(`${item.id}-decision`, "decision", "최종 판단", { choices: item.decisions }),
  activity(`${item.id}-result`, "result", "사건 결과"),
];

export const academyRooms = [
  { id: "room1", title: "ROOM 1 — 인권의 의미", concepts: ["인권", "인간 존엄", "보편성", "천부성", "불가침성", "항구성"], question: "모든 인간에게 차별 없이 적용되는 인권의 특성은?", choices: ["보편성", "항구성", "참정권"], answer: 0 },
  { id: "room2", title: "ROOM 2 — 인권의 확장", concepts: ["자유권", "평등권", "참정권", "사회권", "연대권"], question: "인간다운 생활을 위한 국가의 적극적 역할과 관련된 권리는?", choices: ["자유권", "사회권", "재산권"], answer: 1 },
  { id: "room3", title: "ROOM 3 — 현대적 인권", concepts: ["주거권", "안전권", "환경권", "문화권", "잊힐 권리"], question: "공동체 문화생활에 참여하고 문화적 정체성을 유지할 권리는?", choices: ["문화권", "참정권", "재산권"], answer: 0 },
];
