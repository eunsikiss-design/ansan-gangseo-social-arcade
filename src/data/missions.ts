import type { EvidenceCardData, Mission, MissionStep, Scene } from "@/src/game/types";

const scene = (
  id: string,
  speaker: string,
  text: string,
  character: Scene["character"],
  expression: string,
  background = "hq_lobby",
  position: Scene["position"] = "right",
  image?: string,
  imageAlt?: string
): Scene => ({ id, speaker, text, character, expression, background, position, image, imageAlt });

const activity = (id: string, type: MissionStep["type"], title: string, extras: Partial<MissionStep> = {}): MissionStep => ({ id, type, title, ...extras });

const mission = (data: Omit<Mission, "actId" | "required" | "estimatedMinutes" | "backgrounds" | "endingScenes">): Mission => ({
  actId: "act-1",
  required: true,
  estimatedMinutes: 9,
  backgrounds: [data.openingScenes[0]?.background ?? "hq_lobby"],
  endingScenes: [],
  ...data,
});

export const evidenceCatalog: Record<string, EvidenceCardData> = {
  HUMAN_DIGNITY: {
    id: "HUMAN_DIGNITY",
    title: "권리 카드 · 인간 존엄",
    category: "concept",
    description: "인간은 다른 목적을 위한 수단이나 거래 대상이 아니라, 그 자체로 존중받아야 할 절대적 최고 가치이다.",
    sourceLabel: "대한민국 헌법 제10조 및 칸트의 인간관",
    relatedConceptIds: ["인권", "인간 존엄"],
    reliability: 5,
    textbookPage: "교과서 98~101쪽 [1단원 1주제]",
    textbookQuote: "대한민국 헌법 제10조: 모든 국민은 인간으로서의 존엄과 가치를 가지며, 행복을 추구할 권리를 가진다. 국가는 개인이 가지는 불가침의 기본적 인권을 확인하고 이를 보장할 의무를 진다.",
    applicationCase: "노예 매매 및 인간을 도구화하는 모든 행위를 헌법상 무효로 판단하고 최고의 지도 원리로 선언.",
    studyTip: "인간의 존엄성은 헌법상 모든 기본권의 종국적 목적이자 국가 권력 행사의 한계입니다.",
  },
  UNIVERSALITY: {
    id: "UNIVERSALITY",
    title: "권리 카드 · 보편성",
    category: "concept",
    description: "인권은 인종, 국적, 성별, 종교, 사회적 신분 등 어떠한 조건과도 관계없이 모든 사람에게 동등하게 적용된다.",
    sourceLabel: "세계 인권 선언 제1·2조",
    relatedConceptIds: ["보편성"],
    reliability: 5,
    textbookPage: "교과서 102~103쪽 [개념 탐구]",
    textbookQuote: "세계 인권 선언 제2조: 모든 사람은 인종, 피부색, 성, 언어, 종교, 출신 등에 따른 어떠한 차별도 없이 모든 권리와 자유를 누릴 자격이 있다.",
    applicationCase: "국적이나 체류 자격에 따른 비인도적 차별 금지 및 외국인 근로자 기본권 보장 판례.",
    studyTip: "보편성은 '어디서나, 누구에게나' 예외 없이 적용되는 인권의 핵심 성격입니다.",
  },
  NATURAL_RIGHT: {
    id: "NATURAL_RIGHT",
    title: "권리 카드 · 천부성",
    category: "concept",
    description: "인권은 국가나 법률이 만들어 준 것이 아니라, 인간이라면 태어나면서부터 본래 갖는 자연적 권리이다.",
    sourceLabel: "천부인권론 및 로크의 통치론",
    relatedConceptIds: ["천부성"],
    reliability: 5,
    textbookPage: "교과서 102~104쪽 [사상사 읽기]",
    textbookQuote: "로크(John Locke) 통치론: 인간은 자연 상태에서 생명, 자유, 재산에 대한 완전한 권리를 태어날 때부터 신(자연)으로부터 부여받았다.",
    applicationCase: "국가의 실정법 이전부터 존재하는 전(前)국가적 권리로서 기본권 침해 법률의 위헌 선언.",
    studyTip: "국가가 주는 시혜가 아니라, 태어나면서부터 당연히 가지는 권리입니다.",
  },
  INVIOLABILITY: {
    id: "INVIOLABILITY",
    title: "권리 카드 · 불가침성",
    category: "concept",
    description: "인권은 국가 권력이라도 함부로 침해할 수 없으며, 개인 스스로도 타인에게 양도하거나 포기할 수 없다.",
    sourceLabel: "대한민국 헌법 제10조 및 제37조 제2항",
    relatedConceptIds: ["불가침성"],
    reliability: 5,
    textbookPage: "교과서 104~105쪽",
    textbookQuote: "헌법 제37조 제2항: 국민의 모든 자유와 권리는 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 본질적인 내용을 침해할 수 없다.",
    applicationCase: "생명권이나 신체의 자유에 대한 자발적 포기 각서 및 신체 매매 계약의 법적 무효 판결.",
    studyTip: "공공복리를 위한 법률상 제한이라도 '본질적 내용'은 절대 침해할 수 없습니다.",
  },
  PERMANENCE: {
    id: "PERMANENCE",
    title: "권리 카드 · 항구성",
    category: "concept",
    description: "인권은 특정 시기나 유효 기간에 국한되지 않고, 시간의 경과에도 소멸하지 않으며 영구히 보장되어야 한다.",
    sourceLabel: "기본권 보장의 원리",
    relatedConceptIds: ["항구성"],
    reliability: 5,
    textbookPage: "교과서 104~105쪽",
    textbookQuote: "인권은 시간의 경과에 따라 소멸되거나 시효에 의해 박탈되지 않는 항구적(영구적) 권리이다.",
    applicationCase: "아동·청소년기부터 노년기에 이르기까지 생애 전 주기에 걸친 기본권 영구 보장 원칙.",
    studyTip: "인권은 기한부 계약이나 면허가 아니므로 시효로 소멸하지 않습니다.",
  },
  FREEDOM_RIGHT: {
    id: "FREEDOM_RIGHT",
    title: "권리 카드 · 자유권",
    category: "historical",
    description: "국가 권력의 부당한 간섭과 침해를 배제하고 개인이 자유롭게 생활할 수 있는 소극적·방어적 권리이다.",
    sourceLabel: "근대 시민 혁명과 프랑스 인권 선언",
    relatedConceptIds: ["자유권"],
    reliability: 5,
    textbookPage: "교과서 106~107쪽 [1세대 인권]",
    textbookQuote: "1789년 프랑스 인권선언 제2조: 모든 정치적 결사의 목적은 인간의 소멸할 수 없는 자연권인 자유, 재산, 안전 및 저항권을 보전함에 있다.",
    applicationCase: "신체의 자유, 사상과 양심의 자유, 종교의 자유, 거주·이전의 자유, 통신의 비밀.",
    studyTip: "국가로부터의 자유(소극적·방어적 권리)를 핵심으로 합니다.",
  },
  EQUALITY_RIGHT: {
    id: "EQUALITY_RIGHT",
    title: "권리 카드 · 평등권",
    category: "historical",
    description: "성별, 종교, 인종, 사회적 신분 등을 이유로 불합리하게 차별받지 않고 동등하게 대우받을 권리이다.",
    sourceLabel: "헌법 제11조 및 로자 파크스 판결",
    relatedConceptIds: ["평등권"],
    reliability: 5,
    textbookPage: "교과서 107~108쪽",
    textbookQuote: "헌법 제11조 제1항: 모든 국민은 법 앞에 평등하다. 누구든지 성별·종교 또는 사회적 신분에 의하여 모든 영역에서 차별을 받지 아니한다.",
    applicationCase: "1955년 로자 파크스 버스 승차 거부 사건 및 인종·성차별 철폐 헌법 소원.",
    studyTip: "절대적·기계적 평등이 아닌 합리적 이유 없는 차별을 금지하는 '상대적 평등'입니다.",
  },
  PARTICIPATION_RIGHT: {
    id: "PARTICIPATION_RIGHT",
    title: "권리 카드 · 참정권",
    category: "historical",
    description: "국가의 의사 결정 과정과 공무에 능동적으로 참여할 수 있는 권리이다.",
    sourceLabel: "차티스트 운동 및 여성 참정권사",
    relatedConceptIds: ["참정권"],
    reliability: 5,
    textbookPage: "교과서 108~109쪽 [역사 탐구]",
    textbookQuote: "19세기 영국 차티스트 운동의 인민헌장(People's Charter) 및 보통·평등 선거권의 쟁취 역사.",
    applicationCase: "선거권(만 18세 이상), 공무담임권, 국민투표권 보장.",
    studyTip: "국가에의 자유(능동적 권리)로, 보통·평등·직접·비밀 선거의 4대 원칙이 적용됩니다.",
  },
  SOCIAL_RIGHT: {
    id: "SOCIAL_RIGHT",
    title: "권리 카드 · 사회권",
    category: "law",
    description: "국가에 대하여 최소한의 인간다운 생활의 적극적 보장을 요구할 수 있는 실질적 권리이다.",
    sourceLabel: "1919년 독일 바이마르 헌법",
    relatedConceptIds: ["사회권"],
    reliability: 5,
    textbookPage: "교과서 110~111쪽 [2세대 인권]",
    textbookQuote: "1919년 바이마르 헌법 제151조 및 대한민국 헌법 제34조 제1항: 모든 국민은 인간다운 생활을 할 권리를 가진다. 국가는 사회보장·사회복지의 증진에 노력할 의무를 진다.",
    applicationCase: "국민기초생활보장법, 최저임금제, 무상 의무교육, 건강보험 제도.",
    studyTip: "국가에 의한 자유(적극적·수익적 권리)로, 실질적 평등을 실현하기 위한 권리입니다.",
  },
  SOLIDARITY_RIGHT: {
    id: "SOLIDARITY_RIGHT",
    title: "권리 카드 · 연대권",
    category: "historical",
    description: "평화, 환경, 발전 등 인류 공동의 문제를 국경을 넘어 함께 해결하고 연대할 집단적 권리이다.",
    sourceLabel: "현대 국제 인권 규약 및 협약",
    relatedConceptIds: ["연대권"],
    reliability: 5,
    textbookPage: "교과서 112~113쪽 [3세대 인권]",
    textbookQuote: "바삭(Karel Vasak)의 3세대 인권론: 1세대 자유권, 2세대 사회권을 넘어 전 지구적 협력과 연대를 강조하는 집단권·발전권·평화권·환경권의 탄생.",
    applicationCase: "국제기후변화협약, 유니세프 구호 활동, 난민 보호 및 국제 평화 유지 협약.",
    studyTip: "개인을 넘어 국가와 집단 간의 연대와 협력을 요구하는 권리입니다.",
  },
  YOUTH_TESTIMONY: {
    id: "YOUTH_TESTIMONY",
    title: "피해 학생 진술서",
    category: "testimony",
    description: "과거 미성년 시기에 게시된 비공익적 영상이 무단 유포되어 지속적인 인격권 침해를 겪고 있다는 진술.",
    sourceLabel: "인권수호국 사건 접수 기록",
    relatedConceptIds: ["개인정보", "잊힐 권리"],
    reliability: 4,
    textbookPage: "교과서 114~115쪽 [읽기자료 발췌]",
    textbookQuote: "‘초등학교 시절 장난삼아 올린 영상이 SNS에 복제되어 중·고등학교에 진학한 후에도 놀림과 따돌림의 빌미가 되고 있어요.’",
    applicationCase: "방송통신위원회 '자기게시물 접근배제요청권 가이드라인' 적용 사례.",
    studyTip: "미성년 시기 게시물의 경우 인격권 보호의 필요성이 한층 높게 인정됩니다.",
  },
  PLATFORM_POLICY: {
    id: "PLATFORM_POLICY",
    title: "가상 플랫폼 심사 규정",
    category: "law",
    description: "정보 삭제 요청 시 정보의 공익성, 표현의 자유, 당사자의 피해 중대성을 종합 심사하는 운영 기준.",
    sourceLabel: "온라인 서비스 자율 규제안",
    relatedConceptIds: ["사생활", "표현의 자유"],
    reliability: 4,
    textbookPage: "교과서 115쪽 [탐구활동: 권리 충돌]",
    textbookQuote: "개인정보 보호법 및 정보통신망법: 타인의 권리를 침해하는 정보에 대한 삭제 또는 임시조치 요청 심사 기준.",
    applicationCase: "공익적 기록과 사생활 침해 영상의 선별적 검색 링크 배제 처리.",
    studyTip: "무조건적인 영구 삭제 대신, 검색 결과 배제 등 비례의 원칙에 따른 조율이 필요합니다.",
  },
  PUBLIC_OPINION: {
    id: "PUBLIC_OPINION",
    title: "시민 공청회 의견 표본",
    category: "opinion",
    description: "피해자 구제의 시급성과 알 권리(역사적 기록 보존)의 상충에 따른 합리적 가이드라인 요구.",
    sourceLabel: "ARCA 시민위원회 보고서",
    relatedConceptIds: ["권리 충돌"],
    reliability: 3,
    textbookPage: "교과서 116쪽 [토론 마당]",
    textbookQuote: "‘피해자의 고통을 방치하는 것은 인격권 침해이지만, 정치인이나 공인의 범죄 기록까지 잊힐 권리로 삭제해선 안 된다.’",
    applicationCase: "공인 vs 일반인, 공익성 정보 vs 순수 사생활 정보의 엄격한 분리 기준 마련.",
    studyTip: "알 권리(공익)와 잊힐 권리(사생활)의 충돌 시 법익의 균형성이 요구됩니다.",
  },
  HOUSING_RIGHT: {
    id: "HOUSING_RIGHT",
    title: "권리 카드 · 주거권",
    category: "concept",
    description: "물리적·사회적 위험으로부터 안전하고 쾌적한 주거 공간에서 생활할 권리이다.",
    sourceLabel: "주거기본법 제2조",
    relatedConceptIds: ["주거권"],
    reliability: 5,
    textbookPage: "교과서 118~119쪽 [새로운 인권]",
    textbookQuote: "주거기본법 제2조: 국민은 쾌적하고 살기 좋은 주거환경에서 인간다운 주거생활을 할 권리를 가진다.",
    applicationCase: "반지하·쪽방 등 취약 주거지 침수 방지 및 공공임대주택 최저주거기준 보장.",
    studyTip: "단순히 지붕이 있는 거처를 넘어, 안전과 위생이 보장되는 쾌적한 주거를 요구할 권리입니다.",
  },
  SAFETY_RIGHT: {
    id: "SAFETY_RIGHT",
    title: "권리 카드 · 안전권",
    category: "concept",
    description: "자연재해, 감염병, 사회적 참사 등 각종 위험으로부터 생명과 안전을 보호받을 권리이다.",
    sourceLabel: "헌법 제34조 제6항 및 재난안전법",
    relatedConceptIds: ["안전권"],
    reliability: 5,
    textbookPage: "교과서 120~121쪽 [새로운 인권]",
    textbookQuote: "헌법 제34조 제6항: 국가는 재해를 예방하고 그 위험으로부터 국민을 보호하기 위하여 노력하여야 한다.",
    applicationCase: "어린이 보호구역 옐로카펫 설치, 시설물 안전진단 의무화, 국가 재난대응 체계 강화.",
    studyTip: "국가의 가장 근본적인 책무인 국민의 생명과 신체 보호를 위한 현대적 권리입니다.",
  },
  ENVIRONMENT_RIGHT: {
    id: "ENVIRONMENT_RIGHT",
    title: "권리 카드 · 환경권",
    category: "concept",
    description: "건강하고 쾌적한 환경에서 생활할 권리이며, 미래 세대를 위해 보전할 헌법적 책무를 수반한다.",
    sourceLabel: "대한민국 헌법 제35조",
    relatedConceptIds: ["환경권"],
    reliability: 5,
    textbookPage: "교과서 122~123쪽 [새로운 인권]",
    textbookQuote: "헌법 제35조 제1항: 모든 국민은 건강하고 쾌적한 환경에서 생활할 권리를 가지며, 국가와 국민은 환경보전을 위하여 노력하여야 한다.",
    applicationCase: "초미세먼지 비상저감 조치, 일조권 및 소음 침해에 대한 손해배상 및 환경영향평가제.",
    studyTip: "권리인 동시에 국가와 국민 모두에게 환경을 보전해야 할 헌법적 의무가 부여됩니다.",
  },
  CULTURE_RIGHT: {
    id: "CULTURE_RIGHT",
    title: "권리 카드 · 문화권",
    category: "concept",
    description: "차별 없이 자유롭게 문화 활동에 참여하고 예술을 향유하며 문화적 정체성을 보장받을 권리이다.",
    sourceLabel: "문화기본법 제4조",
    relatedConceptIds: ["문화권"],
    reliability: 5,
    textbookPage: "교과서 124~125쪽 [새로운 인권]",
    textbookQuote: "문화기본법 제4조: 모든 국민은 성별, 종교, 인종, 경제적 지위 등에 관계없이 문화 표현과 활동에서 차별을 받지 아니하고 문화를 향유할 권리를 가진다.",
    applicationCase: "문화누리카드 지원, 문화 소외 도서산간 지역 예술 프로그램 운영 및 공공도서관 확충.",
    studyTip: "정신적 풍요와 삶의 질을 위해 모든 계층에게 균등한 문화 향유 기회가 보장되어야 합니다.",
  },
};

export const missions: Mission[] = [
  // =========================================================================
  // CASE 001 : 인간인가, 재산인가
  // =========================================================================
  mission({
    id: "m01",
    number: 1,
    title: "인간인가, 재산인가",
    subtitle: "임명 첫날 · 인간 존엄 사건",
    relatedConceptIds: ["인권", "인간 존엄"],
    openingScenes: [
      scene("m01-o1", "해온", "신입 인권수호관, 첫 사건을 맡게 되었어. 18세기 영국 노예무역선 '종(Zong)호' 사건 기록을 보관소에서 복원했지. 당시 법원은 사람을 화물과 같은 '재산'으로 보아 보험금을 지급하라는 판결을 내렸어. 법에 그렇게 적혀 있었다는 이유만으로 인간을 물건으로 취급하는 것이 정당할까?", "haeon", "serious", "history_archive"),
    ],
    activities: [
      activity("m01-b", "briefing", "사건번호 HR-001 · 사라진 이름", {
        body: "과거 노예선 재판에서 인간이 재산과 보험 목적물로 분류된 사건입니다. 당시 실정법의 형식 논리와 헌법 최고 규범인 '인간의 존엄성'을 구별하고, 인간이 거래 대상이 될 수 없는 이유를 밝혀내세요.",
      }),
      activity("m01-i", "investigation", "현장 단서 및 판례 조사 (2건)", {
        items: [
          "18세기 노예무역선 종(Zong)호 재판 기록 (인간을 화물로 등재)",
          "칸트의 인간관: '인간은 다른 목적을 위한 수단이 아닌 목적으로 대우하라'",
        ],
      }),
      activity("m01-s", "source", "대한민국 헌법 제10조 및 교과서 조문", {
        body: "‘모든 국민은 인간으로서의 존엄과 가치를 가지며, 행복을 추구할 권리를 가진다. 국가는 개인이 가지는 불가침의 기본적 인권을 확인하고 이를 보장할 의무를 진다.’",
        textbookSource: {
          page: "교과서 98~101쪽",
          section: "1단원 1주제 [인권의 의미와 인간의 존엄성]",
          quote: "헌법 제10조: 인간의 존엄성은 모든 기본권의 출발점이자 최고의 헌법적 가치이다.",
          memo: "법률의 형식만 갖추었더라도 인간을 도구화·재산화하는 것은 자연법과 헌법 최고 이념에 정면 위배됨.",
        },
      }),
      activity("m01-p", "puzzle", "법리 추론 · 인간 존엄성의 헌법적 위상", {
        title: "올바른 헌법적 해석은?",
        question: "과거 노예선 사건처럼 실정법에 따라 사람을 거래 가능한 '재산이나 수단'으로 취급한 판결을 현대 헌법의 관점에서 가장 올바르게 비판한 것은?",
        choices: [
          "당시 법률의 절차를 따랐으므로 그 시대에는 헌법적으로 흠결이 없었다고 보아야 한다.",
          "인간은 결코 다른 목적을 위한 도구나 수단이 될 수 없으며, 그 자체로 존엄한 목적이므로 실정법이라도 무효이다.",
          "재산권의 보장 범위가 인간의 존엄성보다 헌법상 상위의 기본권이다.",
          "피해자에게 금전적 보상만 충분히 지급된다면 인간을 물건으로 취급해도 무방하다.",
        ],
        answer: 1,
      }),
      activity("m01-e", "evidence", "인간 존엄 권리 카드 회수", {
        evidenceIds: ["HUMAN_DIGNITY"],
      }),
    ],
    zeroChallenge: activity("m01-z", "zero", "ZERO의 첫 반론", {
      body: "그 시대의 법과 관습이 허용했다면, 당시 기준으로는 합법이고 정당했던 것 아닌가? 시대를 뛰어넘는 절대적 권리가 과연 존재하나?",
      choices: [
        "그 시대 법률에 명시되어 제정되었다면 무조건 정당하다고 보아야 한다.",
        "법의 형식적 존재(실정법)와 인간 존엄이라는 도덕적·인권적 정당성(자연법)은 명확히 구분해야 하며, 반인권적 법은 정당성이 없다.",
      ],
      answer: 1,
    }),
    investigations: ["노예선 재판 기록", "인간의 도구화 반대 논거"],
    evidenceIds: ["HUMAN_DIGNITY"],
    decisions: [
      "당시의 법적 형식을 존중하여 사람을 재산으로 다룬 기록을 그대로 둔다. (반인권적 역사 방치)",
      "인간 존엄과 가치를 최고 기준으로 삼아 반인권적 판결을 재평가하고 '인간 존엄' 권리 카드를 확립한다. (정의 실현)",
    ],
    outcomes: ["반인권적 역사 방치", "첫 번째 권리 카드 획득"],
    rewards: { exp: 50 },
    nextMissionId: "m02",
  }),

  // =========================================================================
  // CASE 002 : 인권 DNA를 찾아라
  // =========================================================================
  mission({
    id: "m02",
    number: 2,
    title: "인권 DNA를 찾아라",
    subtitle: "조작된 4대 특성 데이터 복구",
    relatedConceptIds: ["보편성", "천부성", "불가침성", "항구성"],
    openingScenes: [
      scene("m02-o1", "아리", "인권수호국 데이터베이스에 4대 핵심 인권 DNA를 왜곡하는 악성 주장이 침투했어! '외국인 배제', '국가 허가제', '권리 포기 각서', '유효기간 설정'이라는 왜곡된 논리를 교과서 4대 특성으로 완벽히 논파해야 해.", "ari", "surprise", "investigation_room"),
    ],
    activities: [
      activity("m02-b", "briefing", "사건번호 HR-002 · 인권 DNA 해킹", {
        body: "인권의 4가지 본질적 성질인 보편성(누구에게나), 천부성(태어날 때부터), 불가침성(빼앗길 수 없음), 항구성(영구히 보장)을 침해하는 왜곡된 주장들을 종합적으로 격파하세요.",
      }),
      activity("m02-i", "investigation", "4대 왜곡 논리 데이터 수집 (4건)", {
        items: [
          "왜곡 1 : 국적이 다른 외국인에게는 기본권을 주지 않아도 된다.",
          "왜곡 2 : 국가가 허가증을 발급해 줄 때만 비로소 인권이 생긴다.",
          "왜곡 3 : 돈을 많이 받는 대가로 자신의 자유를 영구 포기하기로 합의했다.",
          "왜곡 4 : 인권은 청소년기까지만 유효하며 성인이 되면 자동 소멸한다.",
        ],
      }),
      activity("m02-s", "source", "인권 4대 핵심 성격 총람 [교과서 102~105쪽]", {
        body: "‘인권은 인종·성별에 관계없이 모든 사람에게 적용되는 [보편성], 국가 이전부터 자연적으로 갖는 [천부성], 타인이 침해할 수 없고 스스로도 양도할 수 없는 [불가침성], 영구히 보장되는 [항구성]을 갖는다.’",
        textbookSource: {
          page: "교과서 102~105쪽",
          section: "1단원 1주제 [인권의 4대 핵심 성격]",
          quote: "보편성 · 천부성 · 불가침성 · 항구성",
          memo: "인권 포기 각서는 헌법상 무효이며, 국가가 시혜적으로 베푸는 면허가 아님을 입증.",
        },
      }),
      activity("m02-p", "puzzle", "법리 추론 · 인권 4대 특성 종합 판별", {
        title: "올바른 인권 특성 매칭은?",
        question: "다음 (가)~(라)의 주장을 논파할 수 있는 인권의 4대 특성을 올바르게 짝지은 것은?\n(가) 거액을 받고 자신의 신체 자유를 영구 포기하겠다는 계약\n(나) 국적이나 인종이 다른 이주민에게는 기본권을 인정할 수 없다는 주장",
        choices: [
          "(가) 불가침성 (양도·포기 불가) — (나) 보편성 (누구에게나 차별 없이 적용)",
          "(가) 천부성 — (나) 항구성",
          "(가) 보편성 — (나) 불가침성",
          "(가) 항구성 — (나) 천부성",
        ],
        answer: 0,
      }),
      activity("m02-e", "evidence", "인권 4대 DNA 카드 등록", {
        evidenceIds: ["UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY", "PERMANENCE"],
      }),
    ],
    zeroChallenge: activity("m02-z", "zero", "ZERO의 본질적 의문", {
      body: "현실에서는 여전히 수많은 인권 침해와 차별이 일어나고 있잖아. 실제로 완벽히 지켜지지 못하는데, 이것이 본래 주어진 영구한 권리라고 단정할 수 있나?",
      choices: [
        "현실에서 침해당하고 있으니 인권의 보편적 본질은 허상에 불과하다.",
        "인권의 본래적 정당성(이상)과 현실에서의 보장 수준은 구분해야 하며, 현실의 미흡함이 인권의 보편적 가치를 부정할 수는 없다.",
      ],
      answer: 1,
    }),
    investigations: ["국적 배제 데이터", "인권 양도 각서", "기간 한정 조항"],
    evidenceIds: ["UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY", "PERMANENCE"],
    decisions: [
      "상황과 국적에 따라 인권의 적용 대상을 선별적으로 제한한다. (사각지대 방치)",
      "인권은 모든 인간에게 본래 주어지며 양도할 수 없는 영구한 가치임을 선언한다. (4대 DNA 복구)",
    ],
    outcomes: ["인권 사각지대 발생", "인권 4대 DNA 완벽 복구"],
    rewards: { exp: 70 },
    nextMissionId: "m03",
  }),

  // =========================================================================
  // CASE 003 : 혁명의 문을 열어라
  // =========================================================================
  mission({
    id: "m03",
    number: 3,
    title: "혁명의 문을 열어라",
    subtitle: "시민 혁명과 참정권 확대의 역사",
    relatedConceptIds: ["자유권", "평등권", "참정권"],
    openingScenes: [
      scene("m03-o1", "해온", "근대 시민 혁명으로 자유와 평등의 문이 열렸지만, 초기에는 재산이 많은 남성에게만 선거권이 주어졌어. 이후 19세기 영국의 차티스트 운동, 여성 참정권 투쟁, 1955년 로자 파크스의 버스 승차 거부 사건을 거치며 권리는 만인의 것으로 확장되었지.", "haeon", "guide", "revolution_archive", "rosa-parks.jpg", "인종 분리 좌석을 거부한 로자 파크스 사건"),
    ],
    activities: [
      activity("m03-b", "briefing", "사건번호 HR-003 · 봉인된 권리 확장 연표", {
        body: "영국 명예혁명, 미국 독립선언, 프랑스 인권선언에서 시작된 1세대 인권(자유권·평등권)이 노동자와 여성의 보통선거권(참정권)으로 확장된 역사를 추적하세요.",
      }),
      activity("m03-i", "investigation", "역사적 쟁점 조사 (3대 핵심 사건)", {
        items: [
          "1789 프랑스 인권선언: 국가 권력의 간섭을 배제하는 자유권 쟁취",
          "19세기 영국 차티스트 운동: 노동자 계층의 보통선거권 요구(인민헌장)",
          "1955년 미국 로자 파크스 사건: 버스 인종 분리에 맞선 실질적 평등권 투쟁",
        ],
      }),
      activity("m03-s", "source", "프랑스 인권선언 & 차티스트 인민헌장", {
        body: "‘자유란 타인을 해치지 않는 모든 것을 할 수 있는 능력이다.’ ➔ ‘성인 남성의 보통선거권과 비밀투표를 보장하라.’ — 권리는 배제된 자들의 끊임없는 투쟁을 통해 보편화되었습니다.",
        textbookSource: {
          page: "교과서 106~109쪽",
          section: "1단원 2주제 [시민 혁명과 기본권의 확장]",
          quote: "1세대 자유권·평등권 ➔ 차티스트 운동 ➔ 20세기 보통선거제도 확립",
          memo: "초기 시민혁명의 재산·성별 제한 한계를 극복하며 현대 민주주의의 기틀 마련.",
        },
      }),
      activity("m03-p", "puzzle", "법리 추론 · 참정권 확대의 역사적 의의", {
        title: "권리 발전의 역사적 흐름은?",
        question: "근대 시민 혁명에서 현대 보통선거제도에 이르기까지 인권 발전 과정에 대한 설명으로 가장 적절한 것은?",
        choices: [
          "근대 시민 혁명 직후부터 모든 계층과 여성에게 즉시 동등한 선거권이 주어졌다.",
          "초기 시민 혁명은 국가의 부당한 간섭을 배제하는 '자유권'을 확립하였고, 이후 차티스트 운동 등을 거쳐 '참정권'이 모든 계층으로 확대되었다.",
          "참정권은 국가가 국민에게 일방적으로 부여한 것이며 시민들의 투쟁과는 무관하다.",
          "자유권은 적극적으로 국가에 복지를 요구하는 권리이고, 사회권은 국가의 간섭을 배제하는 권리이다.",
        ],
        answer: 1,
      }),
      activity("m03-e", "evidence", "시민 혁명 권리 카드 회수", {
        evidenceIds: ["FREEDOM_RIGHT", "EQUALITY_RIGHT", "PARTICIPATION_RIGHT"],
      }),
    ],
    zeroChallenge: activity("m03-z", "zero", "ZERO의 역사적 한계 지적", {
      body: "시민 혁명 초기에는 유산자 남성에게만 투표권을 주었잖아. 결국 기득권의 권리만 챙긴 불완전한 혁명인데, 이를 인권의 위대한 성취라고 볼 수 있나?",
      choices: [
        "처음부터 모두에게 주지 않았으므로 시민 혁명은 위선에 불과하다.",
        "초기의 신분적·성별적 한계가 존재했으나, '인간은 자유롭고 평등하게 태어났다'는 보편적 원리를 명시함으로써 이후 모든 약자의 참정권 쟁취 투쟁의 결정적 디딤돌이 되었다.",
      ],
      answer: 1,
    }),
    investigations: ["영국 권리장전", "프랑스 인권선언", "차티스트 인민헌장", "로자 파크스 진술"],
    evidenceIds: ["FREEDOM_RIGHT", "EQUALITY_RIGHT", "PARTICIPATION_RIGHT"],
    decisions: [
      "초기의 배제와 한계만을 부각하여 혁명의 의의를 폄하한다. (역사적 단절)",
      "혁명의 성과와 한계를 객관적으로 평가하고, 참정권 확대의 발전 과정을 역사적 헌법 가치로 확립한다. (정의 실현)",
    ],
    outcomes: ["역사적 맥락 단절", "권리 확장 대연표 복원 완료"],
    rewards: { exp: 80 },
    nextMissionId: "m04",
  }),

  // =========================================================================
  // CASE 004 : 권리는 왜 늘어났을까
  // =========================================================================
  mission({
    id: "m04",
    number: 4,
    title: "권리는 왜 늘어났을까",
    subtitle: "산업화의 그늘과 국제 연대의 태동",
    relatedConceptIds: ["사회권", "연대권"],
    openingScenes: [
      scene("m04-o1", "해온", "산업 혁명 이후 공장은 번영했지만 노동자들은 하루 16시간씩 일하며 빈곤에 시달렸어. 국가가 간섭하지 않는 '자유'만으로는 굶주림을 해결할 수 없었지. 그래서 1919년 독일 바이마르 헌법을 통해 국가에 인간다운 생활을 요구할 수 있는 '사회권'이 탄생했어.", "haeon", "skill", "industrial_city"),
    ],
    activities: [
      activity("m04-b", "briefing", "사건번호 HR-004 · 시대의 구조 신호", {
        body: "19세기 산업화 시기의 빈부격차를 극복하기 위한 '사회권(2세대)'과 두 차례 세계 대전 이후 국제 협력을 위한 '연대권(3세대)'의 탄생 배경과 성격을 규명하세요.",
      }),
      activity("m04-i", "investigation", "사회권 및 연대권 역사 문서 조사", {
        items: [
          "1919 바이마르 헌법 제151조: 경제 질서는 인간다운 생활을 보장해야 한다.",
          "카렐 바삭의 3세대 인권론: 자유권(1세대) ➔ 사회권(2세대) ➔ 연대권·발전권(3세대)",
          "국제 연대 사례: 난민 구호, 기후변화 협약, 여성 차별 철폐 협약(CEDAW)",
        ],
      }),
      activity("m04-s", "source", "바이마르 헌법 및 대한민국 헌법 제34조", {
        body: "‘모든 국민은 인간다운 생활을 할 권리를 가진다. 국가는 사회보장·사회복지의 증진에 노력할 의무를 진다.’ — 자유권을 넘어 실질적 평등을 실현하기 위한 현대 복지국가의 헌법적 기반입니다.",
        textbookSource: {
          page: "교과서 110~113쪽",
          section: "1단원 2주제 [현대적 인권의 확장: 사회권과 연대권]",
          quote: "사회권(국가에 의한 자유) & 연대권(전 지구적 협력과 평화)",
          memo: "최저임금, 의무교육, 건강보험 등 실질적 생존 조건 보장의 헌법적 근거.",
        },
      }),
      activity("m04-p", "puzzle", "법리 추론 · 자유권과 사회권의 비교", {
        title: "기본권 유형의 본질적 차이는?",
        question: "다음 중 '자유권'과 '사회권'의 성격을 가장 정확하게 비교한 것은?",
        choices: [
          "자유권은 국가의 적극적 개입을 요구하는 권리이고, 사회권은 국가의 간섭을 배제하는 권리이다.",
          "자유권은 '국가로부터의 자유(소극적·방어적)'이며, 사회권은 인간다운 생활을 국가에 요구하는 '국가에 의한 자유(적극적·수익적)'이다.",
          "사회권은 바이마르 헌법 이전부터 근대 시민 혁명에서 가장 먼저 확립되었다.",
          "연대권은 개인의 사유재산권을 절대적으로 보장받기 위한 1세대 인권이다.",
        ],
        answer: 1,
      }),
      activity("m04-e", "evidence", "현대적 권리 확장 카드 회수", {
        evidenceIds: ["SOCIAL_RIGHT", "SOLIDARITY_RIGHT"],
      }),
    ],
    zeroChallenge: activity("m04-z", "zero", "ZERO의 국가 개입 비판", {
      body: "국가가 복지나 인간다운 생활을 핑계로 시장과 개인 생활에 깊숙이 개입하면, 결국 개인의 자유권이 위축되고 비효율만 생기는 것 아닌가?",
      choices: [
        "국가는 오직 국방과 치안만 맡고 개인의 복지에는 일절 개입하지 말아야 한다.",
        "기아와 질병에 방치된 상태에서는 진정한 자유를 누릴 수 없으므로, 자유권의 실질적 행사를 위해서는 최소한의 생존을 보장하는 사회권이 상호보완적으로 필수적이다.",
      ],
      answer: 1,
    }),
    investigations: ["산업 혁명 노동 보고서", "바이마르 헌법 원문", "세계 인권 선언 제3세대 권리 조항"],
    evidenceIds: ["SOCIAL_RIGHT", "SOLIDARITY_RIGHT"],
    decisions: [
      "국가의 역할을 소극적 자유 보장에만 한정하고 복지 책무를 축소한다. (양극화 방치)",
      "실질적 평등을 위한 사회권 보장과 전 지구적 연대 의무를 헌법적 가치로 확립한다. (정의 실현)",
    ],
    outcomes: ["사회적 양극화 심화", "사회권 및 국제 연대 체계 확립"],
    rewards: { exp: 80 },
    nextMissionId: "m05",
  }),

  // =========================================================================
  // CASE 005 : 지워지지 않는 영상
  // =========================================================================
  mission({
    id: "m05",
    number: 5,
    title: "지워지지 않는 영상",
    subtitle: "첫 시민 접수 · 잊힐 권리와 표현의 자유의 충돌",
    relatedConceptIds: ["새로운 인권", "개인정보", "잊힐 권리", "표현의 자유"],
    openingScenes: [
      scene("m05-o1", "지우", "어릴 때 멋모르고 올렸던 철없는 영상이 무단 복제되어 온라인에 계속 퍼지고 있어요... 제 이름을 검색하면 가장 위에 나와서 정상적인 학교생활이 불가능해요. 제발 삭제해 주세요!", "npc", "worried", "digital_case_room", "left"),
      scene("m05-o2", "해온", "교과서에서 다루는 대표적 권리 충돌 쟁점이야! 개인의 사생활의 비밀과 인격권(잊힐 권리)과, 플랫폼 및 시민들의 표현의 자유 및 알 권리가 부딪치고 있어. 객관적 기준을 세워야 해.", "haeon", "warning", "digital_case_room"),
    ],
    activities: [
      activity("m05-b", "briefing", "사건번호 HR-005 · 디지털 흔적 구제 청원", {
        body: "피해 학생의 진술과 플랫폼의 운영 지침을 검토하여, 미성년 시절 비공익적 사생활 영상에 대해 '잊힐 권리(인격권)'와 '알 권리(표현의 자유)'의 비례적 조화 기준을 도출하세요.",
      }),
      activity("m05-i", "investigation", "디지털 사건 증거 조사 (3건)", {
        items: [
          "피해 학생 진술: 미성년 시기 게시물이며 일상생활에 심각한 피해 발생",
          "플랫폼 운영 지침: 공익성 있는 기록과 순수 사생활 정보의 구분 기준",
          "시민 의견: 공인의 비리 기록 삭제와 일반인의 사생활 침해는 엄격히 구분해야 함",
        ],
      }),
      activity("m05-s", "source", "헌법 제17조 및 방통위 자기게시물 가이드라인", {
        body: "‘모든 국민은 사생활의 비밀과 자유를 침해받지 아니한다.’ — 정보통신망법 및 가이드라인에 따라, 미성년 시절 작성한 비공익적 게시물에 대해 검색 목록 배제를 요청할 권리가 인정됩니다.",
        textbookSource: {
          page: "교과서 114~117쪽",
          section: "1단원 3주제 [현대 사회의 인권 쟁점: 잊힐 권리와 알 권리]",
          quote: "개인정보 자기결정권과 인격권(헌법 제10·17조) vs 표현의 자유 및 알 권리(헌법 제21조)",
          memo: "공인 여부, 정보의 공익성, 시간의 경과, 피해의 중대성을 종합 비교·형량함.",
        },
      }),
      activity("m05-p", "puzzle", "법리 추론 · 기본권 충돌 해결 원칙", {
        title: "권리 충돌의 합리적 해결 기준은?",
        question: "‘잊힐 권리(사생활·인격권)’와 ‘알 권리(표현의 자유)’가 충돌할 때, 헌법상 기본권 충돌 해결 원칙으로 가장 타당한 것은?",
        choices: [
          "표현의 자유가 항상 절대적이므로 어떠한 개인정보도 삭제할 수 없다.",
          "미성년 시절의 비공익적 사생활 정보는 인격권 보호를 위해 검색 배제를 인정하되, 공인의 공익적 행적은 알 권리를 위해 보존하는 등 법익 균형성을 유지한다.",
          "포털 사이트 기업의 광고 수익을 최우선 기준으로 판정한다.",
          "무조건 먼저 접수된 권리만을 일방적으로 100% 인정한다.",
        ],
        answer: 1,
      }),
      activity("m05-e", "evidence", "사건 심사 근거 카드 등록", {
        evidenceIds: ["YOUTH_TESTIMONY", "PLATFORM_POLICY", "PUBLIC_OPINION"],
      }),
    ],
    zeroChallenge: activity("m05-z", "zero", "ZERO의 날카로운 반론", {
      body: "자신이 스스로 올렸던 기록을 나중에 지워달라고 하는 것까지 국가가 개입해 지워주면, 인터넷의 자유로운 정보 유통과 역사적 기록의 투명성은 훼손되는 것 아닌가?",
      choices: [
        "한 번 공개된 정보는 어떠한 경우에도 삭제할 수 없게 해야 한다.",
        "미성년 시기의 비공익적 사생활 정보는 회복할 수 없는 인격권 침해를 낳으므로, 공익적 사안과 엄격히 구분하여 삭제 및 검색 배제 청구권을 인정해야 한다.",
      ],
      answer: 1,
    }),
    investigations: ["피해 학생 심층 면담", "플랫폼 운영 정책", "시민 공청회 의견"],
    evidenceIds: ["YOUTH_TESTIMONY", "PLATFORM_POLICY", "PUBLIC_OPINION"],
    decisions: [
      "어떤 정보도 삭제하지 않고 플랫폼의 방치를 묵인한다. (인격권 침해 방치)",
      "정보의 성격(비공익적 사생활·미성년)과 피해 중대성을 심사하여 해당 검색 링크를 배제하고 재확산 방지 조치를 명령한다. (권리 간 균형 구제)",
    ],
    outcomes: ["피해 구제 실패", "균형 잡힌 디지털 인권 구제 절차 수립"],
    rewards: { exp: 100 },
    nextMissionId: "m06",
  }),

  // =========================================================================
  // CASE 006 : 네 개의 새로운 권리
  // =========================================================================
  mission({
    id: "m06",
    number: 6,
    title: "네 개의 새로운 권리",
    subtitle: "도시 동시 경보 · 주거·안전·환경·문화권 총괄",
    relatedConceptIds: ["주거권", "안전권", "환경권", "문화권"],
    openingScenes: [
      scene("m06-o1", "아리", "도시 관제 센터에 4대 위기 경보가 동시에 발생했어! 반지하 침수 위기는 주거권을, 어린이 통학로 위험은 안전권을, 초미세먼지는 환경권을, 소외 계층의 문화 격차는 문화권을 위협하고 있어. 현대 사회에서 새롭게 확장된 4대 권리를 모두 해결하자!", "ari", "warning", "arca_city_map", "fine-dust.jpg", "초미세 먼지 비상저감 조치와 도로 작업"),
    ],
    activities: [
      activity("m06-b", "briefing", "사건번호 HR-006 · 도시 복합 위기 관제", {
        body: "현대 도시에서 발생하는 4대 권리(주거권, 안전권, 환경권, 문화권) 침해 신호를 현장별로 조사하고 시민의 기본권을 지키는 종합 대책을 수립하세요.",
      }),
      activity("m06-i", "investigation", "도시 4대 위험 구역 현장 조사", {
        items: [
          "ZONE A (주거권): 반지하 상습 침수 방지 및 최저주거기준 보장",
          "ZONE B (안전권): 어린이 보호구역 옐로카펫 및 재난 예방 체계",
          "ZONE C (환경권): 초미세먼지 비상저감 및 미래 세대를 위한 환경 보전",
          "ZONE D (문화권): 문화누리카드 및 도서관 등 문화 향유 인프라 확충",
        ],
      }),
      activity("m06-s", "source", "현대 헌법상의 4대 신종 인권 조문", {
        body: "‘국민은 쾌적한 주거생활을 할 권리(주거권), 재해로부터 보호받을 권리(안전권), 건강하고 쾌적한 환경을 누릴 권리(환경권), 차별 없이 문화를 향유할 권리(문화권)를 가진다.’",
        textbookSource: {
          page: "교과서 118~125쪽",
          section: "1단원 3주제 [새롭게 등장하는 현대적 인권]",
          quote: "주거권(주거기본법) · 안전권(헌법 제34조) · 환경권(헌법 제35조) · 문화권(문화기본법)",
          memo: "시민의 삶의 질 향상과 지속 가능한 사회를 위해 국가의 적극적 제도 수립과 시민 참여가 요구됨.",
        },
      }),
      activity("m06-p", "puzzle", "법리 추론 · 현대적 신종 인권 종합 분석", {
        title: "현대적 인권의 성격으로 옳은 것은?",
        question: "다음 중 교과서에서 다루는 현대 사회의 '새로운 인권(주거·안전·환경·문화권)'에 대한 설명으로 가장 적절한 것은?",
        choices: [
          "환경권은 국민에게 깨끗한 환경을 누릴 권리만 부여하며 보전할 의무는 없다.",
          "현대적 인권은 환경오염, 주거 불안정, 대형 재난 등 새로운 사회적 위험으로부터 인간다운 삶의 질을 보장하기 위해 헌법적 권리로 구체화된 것이다.",
          "문화권은 오직 전문 예술가에게만 특별히 인정되는 경제적 특권이다.",
          "주거권은 국가가 개인의 주택 구입 자금을 전액 무상 지원해야만 성립하는 권리이다.",
        ],
        answer: 1,
      }),
      activity("m06-e", "evidence", "현대 4대 권리 카드 등록", {
        evidenceIds: ["HOUSING_RIGHT", "SAFETY_RIGHT", "ENVIRONMENT_RIGHT", "CULTURE_RIGHT"],
      }),
    ],
    zeroChallenge: activity("m06-z", "zero", "ZERO의 현실 예산 반론", {
      body: "도시의 예산과 자원은 한정되어 있어. 주거, 안전, 환경, 문화를 모두 권리라고 선언해 버리면 재정이 파탄 나지 않겠나?",
      choices: [
        "예산이 부족하므로 비용이 가장 적게 드는 사업 하나만 하고 나머지는 포기한다.",
        "인권은 예산 집행 후 남는 돈으로 하는 것이 아니라 시정의 최우선 가치이며, 생명·안전의 긴급성을 바탕으로 단계적·통합적 안전망을 구축해야 한다.",
      ],
      answer: 1,
    }),
    investigations: ["ZONE A 주거 현장", "ZONE B 통학로 안전 점검", "ZONE C 대기질 관측소", "ZONE D 문화 센터 현황"],
    evidenceIds: ["HOUSING_RIGHT", "SAFETY_RIGHT", "ENVIRONMENT_RIGHT", "CULTURE_RIGHT"],
    decisions: [
      "특정 구역에만 자원을 몰아주고 나머지 세 권리는 후순위로 미룬다. (사각지대 잔존)",
      "긴급 위험 해소(안전·주거)를 선행하면서 환경·문화권 보장 계획을 단계적으로 통합 수립한다. (종합 안전망 완성)",
    ],
    outcomes: ["도시 격차 심화 및 사각지대 잔존", "도시 인권 안전망 종합 완성"],
    rewards: { exp: 120, title: "정식 인권수호관", skill: "인권 렌즈 Lv.1" },
    nextMissionId: undefined,
  }),
];

export const missionDialogueQuestions: Record<string, DialogueOption[]> = {
  m01: [
    {
      question: "교과서에서 정의하는 '인간 존엄성'의 가장 핵심적인 의미는?",
      answerSpeaker: "아리",
      answerText: "인간은 다른 어떤 목적을 위한 '수단이나 도구'가 아니라, 존재 그 자체로 존중받아야 할 '목적'이라는 점이야!",
      textbookRef: "교과서 98~101쪽",
    },
    {
      question: "과거 노예 매매 판결은 왜 오늘날 명백한 위헌인가요?",
      answerSpeaker: "해온",
      answerText: "당시 실정법에 규정되어 있었다 하더라도, 인간의 천부적 존엄과 생명권을 박탈하는 법은 자연법적 정당성이 없기 때문에 무효야.",
      textbookRef: "교과서 100쪽 [판례 탐구]",
    },
    {
      question: "현대 사회에서 인간 존엄이 위협받는 대표적인 사례는?",
      answerSpeaker: "아리",
      answerText: "사회적 약자에 대한 혐오와 차별, 노동 착취, 인간을 수단화하는 비인도적 대우 등이 여전히 해결해야 할 과제란다.",
      textbookRef: "교과서 101쪽",
    },
  ],
  m02: [
    {
      question: "외국인이나 이주민에게도 인권의 4대 특성이 똑같이 적용되나요?",
      answerSpeaker: "아리",
      answerText: "물론이야! 인권의 '보편성'에 따라 인종, 국적, 성별, 신분과 관계없이 지구상의 모든 사람에게 차별 없이 적용돼.",
      textbookRef: "교과서 102~103쪽",
    },
    {
      question: "자신의 신체나 자유를 포기하겠다는 각서를 쓰면 유효한가요?",
      answerSpeaker: "해온",
      answerText: "무효야! '불가침성'에 따라 인권은 타인이 침해할 수 없을 뿐만 아니라 본인 스스로도 영구히 양도하거나 포기할 수 없어.",
      textbookRef: "교과서 104쪽",
    },
    {
      question: "인권에 유효기간이 없다는 '항구성'은 왜 중요한가요?",
      answerSpeaker: "아리",
      answerText: "나이가 들거나 상황이 변해도 인권은 소멸하지 않고 영구히 보장되어야 한다는 헌법적 안전망이기 때문이야.",
      textbookRef: "교과서 105쪽",
    },
  ],
  m03: [
    {
      question: "근대 시민 혁명에서 쟁취한 1세대 인권의 핵심은?",
      answerSpeaker: "아리",
      answerText: "국가의 부당한 간섭과 억압을 배제하는 '자유권'과 법 앞의 차별을 없애는 '평등권'이야!",
      textbookRef: "교과서 106~107쪽",
    },
    {
      question: "영국 차티스트 운동과 여성 참정권 운동의 역사적 의의는?",
      answerSpeaker: "해온",
      answerText: "초기 시민혁명에서 배제되었던 노동자와 여성들이 투쟁을 통해 모든 시민의 보통선거권(참정권)을 쟁취해낸 위대한 발자취야.",
      textbookRef: "교과서 108~109쪽",
    },
    {
      question: "1955년 로자 파크스 사건이 인권사에 미친 영향은?",
      answerSpeaker: "해온",
      answerText: "인종 분리라는 불합리한 법에 비폭력으로 저항하여 실질적 평등권을 실현시킨 미국 민권 운동의 기폭제가 되었어.",
      textbookRef: "교과서 109쪽 [역사 읽기]",
    },
  ],
  m04: [
    {
      question: "1919년 바이마르 헌법이 최초로 명문화한 '사회권'이란?",
      answerSpeaker: "해온",
      answerText: "국가에 대하여 최소한의 인간다운 생활 보장(복지, 교육, 노동조건)을 적극적으로 요구할 수 있는 현대적 권리야.",
      textbookRef: "교과서 110~111쪽",
    },
    {
      question: "자유권과 사회권의 가장 결정적인 차이는 무엇인가요?",
      answerSpeaker: "아리",
      answerText: "자유권은 '국가로부터의 자유(소극적)', 사회권은 실질적 복지를 요구하는 '국가에 의한 자유(적극적)'라는 점이야!",
      textbookRef: "교과서 111쪽 [개념 비교]",
    },
    {
      question: "3세대 인권인 '연대권'이 등장하게 된 시대적 배경은?",
      answerSpeaker: "아리",
      answerText: "두 차례 세계 대전과 기후위기 등을 겪으며, 평화·환경 문제는 국경을 초월한 국제적 협력과 연대가 필수적임을 깨달았기 때문이야.",
      textbookRef: "교과서 112~113쪽",
    },
  ],
  m05: [
    {
      question: "교과서에서 설명하는 '잊힐 권리'의 헌법적 근거는?",
      answerSpeaker: "아리",
      answerText: "자신에 관한 정보의 삭제·처리를 요구할 수 있는 개인정보 자기결정권과 헌법 제17조 사생활의 비밀과 자유(인격권)에 기초해!",
      textbookRef: "교과서 114~115쪽",
    },
    {
      question: "잊힐 권리와 표현의 자유(알 권리)가 충돌할 때 기준은?",
      answerSpeaker: "해온",
      answerText: "정보 주체가 공인인지 여부, 정보의 공익성과 역사적 보존 가치, 피해의 중대성과 시간의 경과를 종합적으로 비교·형량해야 해.",
      textbookRef: "교과서 115쪽 [탐구활동]",
    },
    {
      question: "현재 청소년을 위한 '자기게시물 접근배제' 제도는 어떻게 운영되나요?",
      answerSpeaker: "아리",
      answerText: "미성년 시절 작성했으나 삭제 권한을 잃은 게시물에 대해 포털·SNS에 타인의 접근(검색) 배제를 요청할 수 있도록 지원하고 있어.",
      textbookRef: "교과서 116쪽 [읽기자료]",
    },
  ],
  m06: [
    {
      question: "현대 사회에서 '주거권'과 '안전권'이 강조되는 이유는?",
      answerSpeaker: "해온",
      answerText: "단순한 거처를 넘어 침수·화재 등 재난으로부터 안전하고 쾌적한 환경에서 인간다운 삶을 누릴 권리가 생존의 기본이기 때문이야.",
      textbookRef: "교과서 118~121쪽",
    },
    {
      question: "헌법 제35조 환경권에 국가와 국민의 '의무'가 함께 있는 까닭은?",
      answerSpeaker: "아리",
      answerText: "깨끗한 환경은 미래 세대까지 영구히 누려야 할 공공재이므로, 권리 향유와 동시에 보전 의무를 함께 부여한 것이란다.",
      textbookRef: "교과서 122~123쪽",
    },
    {
      question: "문화 격차 해소를 위한 '문화권' 보장의 실천 사례는?",
      answerSpeaker: "해온",
      answerText: "문화 소외 계층을 위한 문화누리카드 지원, 지역 공공도서관 및 문화예술 향유 인프라 확충 등이 대표적이야.",
      textbookRef: "교과서 124~125쪽",
    },
  ],
};

export const getMissionSteps = (item: Mission): MissionStep[] => {
  const dialogueQuestions = missionDialogueQuestions[item.id] || [];
  const primaryOpeningScene = item.openingScenes[0] || scene(`${item.id}-o1`, "해온", "사건 조사를 시작하자.", "haeon", "serious");

  return [
    // 1. Briefing
    item.activities.find((a) => a.type === "briefing") || item.activities[0],
    // 2. Dialogue with 3 textbook Q&As
    activity(`${item.id}-dialogue`, "dialogue", "사건 조사 및 교과서 탐구 대화", {
      scene: primaryOpeningScene,
      speaker: primaryOpeningScene.speaker,
      body: primaryOpeningScene.text,
      dialogueOptions: dialogueQuestions,
    }),
    // 3. Investigation
    item.activities.find((a) => a.type === "investigation") || activity(`${item.id}-inspect`, "investigation", "현장 단서 조사", { items: item.investigations }),
    // 4. Source Detail
    item.activities.find((a) => a.type === "source") || activity(`${item.id}-source`, "source", "교과서 핵심 헌법 조문"),
    // 5. Legal Reasoning Puzzle
    item.activities.find((a) => a.type === "puzzle") || activity(`${item.id}-quiz`, "puzzle", "법리 추론 퀴즈"),
    // 6. Evidence Acquisition
    item.activities.find((a) => a.type === "evidence") || activity(`${item.id}-evidence`, "evidence", "권리 카드 획득", { evidenceIds: item.evidenceIds }),
    // 7. ZERO Challenge
    item.zeroChallenge,
    // 8. Final Decision
    activity(`${item.id}-decision`, "decision", "최종 판단", { choices: item.decisions }),
    // 9. Result Report
    activity(`${item.id}-result`, "result", "사건 종결 보고서"),
  ];
};

export const academyRooms = [
  {
    id: "room1",
    title: "ROOM 1 — 인권의 의미와 4대 특성",
    description: "헌법 제10조 인간 존엄성과 보편성·천부성·불가침성·항구성을 체계적으로 탐구합니다.",
    concepts: [
      { id: "c1", name: "인권 (Human Rights)", summary: "인간이라는 이유만으로 존엄을 보장받으며 행복하게 살아갈 당연한 권리", quote: "헌법 제10조 전단" },
      { id: "c2", name: "인간 존엄성", summary: "사람을 다른 목적을 위한 수단이나 도구가 아닌 그 자체로 최고 목적으로 대우하는 가치", quote: "칸트의 정언명령 & 헌법 제10조" },
      { id: "c3", name: "보편성 (Universality)", summary: "인종·성별·종교·국적·사회적 신분에 따른 차별 없이 모든 사람에게 동등하게 적용됨", quote: "세계 인권 선언 제2조" },
      { id: "c4", name: "천부성 (Inherent Nature)", summary: "국가의 법률이 부여한 시혜가 아니라 태어나면서부터 자연적으로 갖는 자연권", quote: "로크 통치론 & 독립선언문" },
      { id: "c5", name: "불가침성 (Inviolability)", summary: "국가 권력도 침해할 수 없고, 개인 스스로도 타인에게 양도하거나 포기할 수 없음", quote: "헌법 제37조 제2항 후문" },
      { id: "c6", name: "항구성 (Permanence)", summary: "시간의 경과나 연령과 무관하게 영구히 소멸하지 않고 보장되어야 할 권리", quote: "기본권 항구성의 원리" },
    ],
  },
  {
    id: "room2",
    title: "ROOM 2 — 인권의 확장 역사 (1~3세대)",
    description: "시민 혁명의 자유권·평등권부터 차티스트 참정권, 바이마르 사회권, 전 지구적 연대권의 발전사를 분석합니다.",
    concepts: [
      { id: "c7", name: "1세대 인권 (자유권·평등권)", summary: "국가 권력의 간섭을 배제하는 소극적·방어적 권리 및 법 앞의 평등", quote: "1789 프랑스 인권선언" },
      { id: "c8", name: "참정권의 확장", summary: "차티스트 운동과 여성 참정권 투쟁을 통해 모든 시민에게 보통선거권을 쟁취한 역사", quote: "영국 인민헌장 & 보통선거제" },
      { id: "c9", name: "2세대 인권 (사회권)", summary: "국가에 대하여 최소한의 인간다운 생활 보장을 적극적으로 요구할 수 있는 복지 권리", quote: "1919 바이마르 헌법 제151조" },
      { id: "c10", name: "3세대 인권 (연대권·집단권)", summary: "평화, 환경, 발전 등 전 지구적 문제를 국경을 초월하여 협력하고 해결할 권리", quote: "카렐 바삭의 3세대 인권론" },
    ],
  },
  {
    id: "room3",
    title: "ROOM 3 — 현대 사회의 새로운 인권",
    description: "잊힐 권리, 주거권, 안전권, 환경권, 문화권 등 현대 사회의 신종 인권 쟁점을 다룹니다.",
    concepts: [
      { id: "c11", name: "잊힐 권리 (Right to be Forgotten)", summary: "자신에 관한 개인정보의 삭제·검색 배제를 요구할 수 있는 인격권적 권리", quote: "개인정보보호법 & 헌법 제17조" },
      { id: "c12", name: "주거권 (Housing Right)", summary: "위험으로부터 안전하고 쾌적한 환경에서 인간다운 주거 생활을 누릴 권리", quote: "주거기본법 제2조" },
      { id: "c13", name: "안전권 (Right to Safety)", summary: "재해, 재난, 범죄 등 각종 위험으로부터 생명과 신체를 보호받을 헌법적 권리", quote: "헌법 제34조 제6항" },
      { id: "c14", name: "환경권 (Environmental Right)", summary: "건강하고 쾌적한 환경에서 생활할 권리이자 보전할 헌법적 의무", quote: "헌법 제35조 제1항" },
      { id: "c15", name: "문화권 (Cultural Right)", summary: "차별 없이 자유롭게 문화 활동에 참여하고 예술을 향유할 권리", quote: "문화기본법 제4조" },
    ],
  },
];
