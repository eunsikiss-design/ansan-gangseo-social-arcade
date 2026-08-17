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
    description: "인간은 다른 목적을 위한 수단이 아니라 그 자체로 존중받아야 한다.",
    sourceLabel: "헌법 제10조 및 교과서 핵심 개념",
    relatedConceptIds: ["인권", "인간 존엄"],
    reliability: 5,
    textbookPage: "교과서 98~101쪽",
    textbookQuote: "대한민국 헌법 제10조: 모든 국민은 인간으로서의 존엄과 가치를 가지며, 행복을 추구할 권리를 가진다. 국가는 개인이 가지는 불가침의 기본적 인권을 확인하고 이를 보장할 의무를 진다.",
    applicationCase: "노예 매매 및 인간의 도구화 판결을 위헌으로 무효화하고 최고의 헌법적 가치로 확립.",
    studyTip: "인간의 존엄성은 헌법상 모든 기본권의 종국적 목적이자 최고 이념입니다.",
  },
  UNIVERSALITY: {
    id: "UNIVERSALITY",
    title: "권리 카드 · 보편성",
    category: "concept",
    description: "인권은 인종·성별·종교·사회적 신분과 관계없이 모든 사람에게 동등하게 적용된다.",
    sourceLabel: "세계 인권 선언 제1·2조",
    relatedConceptIds: ["보편성"],
    reliability: 5,
    textbookPage: "교과서 102~103쪽 [개념 탐구]",
    textbookQuote: "세계 인권 선언 제2조: 모든 사람은 인종, 피부색, 성, 언어, 종교, 정치적 또는 그 밖의 견해, 민족적 또는 사회적 출신 등에 따른 어떠한 차별도 없이 모든 권리와 자유를 누릴 자격이 있다.",
    applicationCase: "국적이나 체류 자격에 따른 비인도적 차별 금지 및 외국인 근로자 기본권 보장 판례.",
    studyTip: "보편성은 '어디서나, 누구에게나' 예외 없이 적용되는 인권의 핵심 성격입니다.",
  },
  NATURAL_RIGHT: {
    id: "NATURAL_RIGHT",
    title: "권리 카드 · 천부성",
    category: "concept",
    description: "인권은 국가나 법률이 부여해서가 아니라 태어나면서부터 본래 갖는 자연적 권리이다.",
    sourceLabel: "천부인권론 및 근대 헌법 원리",
    relatedConceptIds: ["천부성"],
    reliability: 5,
    textbookPage: "교과서 102~104쪽 [사상사 읽기]",
    textbookQuote: "로크(John Locke) 통치론: 인간은 자연 상태에서 생명, 자유, 재산에 대한 완전한 권리를 태어날 때부터 신(자연)으로부터 부여받았다.",
    applicationCase: "국가의 실정법 이전부터 존재하는 전(前)국가적 권리로서 기본권 침해 법률의 무효 선언.",
    studyTip: "국가가 주는 시혜가 아니라, 태어나면서부터 당연히 가지는 권리입니다.",
  },
  INVIOLABILITY: {
    id: "INVIOLABILITY",
    title: "권리 카드 · 불가침성",
    category: "concept",
    description: "인권은 국가 권력이라도 함부로 침해할 수 없으며 스스로도 양도·포기할 수 없다.",
    sourceLabel: "대한민국 헌법 제10조 후문",
    relatedConceptIds: ["불가침성"],
    reliability: 5,
    textbookPage: "교과서 104~105쪽",
    textbookQuote: "헌법 제37조 제2항: 국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    applicationCase: "생명권이나 신체의 자유에 대한 자발적 포기 각서의 법적 무효 판결.",
    studyTip: "공공복리를 위한 법률상 제한이라도 '본질적 내용'은 절대 침해할 수 없습니다.",
  },
  PERMANENCE: {
    id: "PERMANENCE",
    title: "권리 카드 · 항구성",
    category: "concept",
    description: "인권은 특정 시기나 유효 기간에 국한되지 않고 영구히 보장되어야 한다.",
    sourceLabel: "기본권 보장의 원리",
    relatedConceptIds: ["항구성"],
    reliability: 5,
    textbookPage: "교과서 104~105쪽",
    textbookQuote: "인권은 시간의 경과에 따라 소멸되거나 시효에 의해 박탈되지 않는 항구적(영구적) 권리이다.",
    applicationCase: "고령자, 청소년, 미래 세대에 이르기까지 생애 전 주기에 걸친 기본권 영구 보장.",
    studyTip: "인권은 기한부 계약이나 면허가 아니므로 시효로 소멸하지 않습니다.",
  },
  FREEDOM_RIGHT: {
    id: "FREEDOM_RIGHT",
    title: "권리 카드 · 자유권",
    category: "historical",
    description: "국가 권력의 부당한 간섭과 침해를 배제하고 개인이 자유롭게 생활할 권리이다.",
    sourceLabel: "근대 시민 혁명과 인권 선언",
    relatedConceptIds: ["자유권"],
    reliability: 5,
    textbookPage: "교과서 106~107쪽 [1세대 인권]",
    textbookQuote: "1789년 프랑스 인권선언 제2조: 모든 정치적 결사의 목적은 인간의 소멸할 수 없는 자연권인 자유, 재산, 안전 및 억압에 대한 저항권을 보전함에 있다.",
    applicationCase: "신체의 자유, 사상과 양심의 자유, 종교의 자유, 거주·이전의 자유, 통신의 비밀.",
    studyTip: "국가로부터의 자유(소극적·방어적 권리)를 핵심으로 합니다.",
  },
  EQUALITY_RIGHT: {
    id: "EQUALITY_RIGHT",
    title: "권리 카드 · 평등권",
    category: "historical",
    description: "성별·종교·사회적 신분 등을 이유로 불합리하게 차별받지 않고 동등하게 대우받을 권리이다.",
    sourceLabel: "미국 독립선언 및 프랑스 인권선언",
    relatedConceptIds: ["평등권"],
    reliability: 5,
    textbookPage: "교과서 107~108쪽",
    textbookQuote: "헌법 제11조 제1항: 모든 국민은 법 앞에 평등하다. 누구든지 성별·종교 또는 사회적 신분에 의하여 정치적·경제적·사회적·문화적 생활의 모든 영역에 있어서 차별을 받지 아니한다.",
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
    textbookQuote: "19세기 영국 차티스트 운동의 인민헌장(People's Charter) 및 20세기 보통선거권의 쟁취 역사.",
    applicationCase: "선거권(만 18세 이상), 공무담임권, 국민투표권 보장.",
    studyTip: "국가에의 자유(능동적 권리)로, 보통·평등·직접·비밀 선거의 4대 원칙이 적용됩니다.",
  },
  SOCIAL_RIGHT: {
    id: "SOCIAL_RIGHT",
    title: "권리 카드 · 사회권",
    category: "law",
    description: "국가에 대하여 최소한의 인간다운 생활의 적극적 보장을 요구할 수 있는 권리이다.",
    sourceLabel: "1919년 독일 바이마르 헌법",
    relatedConceptIds: ["사회권"],
    reliability: 5,
    textbookPage: "교과서 110~111쪽 [2세대 인권]",
    textbookQuote: "1919년 바이마르 헌법 제151조 및 대한민국 헌법 제34조 제1항: 모든 국민은 인간다운 생활을 할 권리를 가진다. 국가는 사회보장·사회복지의 증진에 노력할 의무를 진다.",
    applicationCase: "국민기초생활보장법, 최저임금제, 의무교육, 건강보험 제도.",
    studyTip: "국가에 의한 자유(적극적·수익적 권리)로, 실질적 평등을 실현하기 위한 권리입니다.",
  },
  SOLIDARITY_RIGHT: {
    id: "SOLIDARITY_RIGHT",
    title: "권리 카드 · 연대권",
    category: "historical",
    description: "평화, 환경, 발전 등 인류 공동의 문제를 국경을 넘어 함께 해결하고 연대할 권리이다.",
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
    description: "과거 미성년 시기에 게시된 영상이 무단 유포·확산되어 지속적인 인격권 침해를 겪고 있다.",
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
    description: "정보 삭제 요청 시 정보의 공익성, 표현의 자유, 당사자의 피해 중대성을 종합 심사한다.",
    sourceLabel: "온라인 서비스 자율 규제안",
    relatedConceptIds: ["사생활", "표현의 자유"],
    reliability: 4,
    textbookPage: "교과서 115쪽 [탐구활동: 권리 충돌]",
    textbookQuote: "개인정보 보호법 제17조 및 정보통신망법 제44조의2: 타인의 권리를 침해하는 정보에 대한 삭제 또는 임시조치 요청 심사 기준.",
    applicationCase: "공익적 기록과 사생활 침해 영상의 선별적 검색 링크 배제 처리.",
    studyTip: "무조건적인 영구 삭제 대신, 검색 결과 배제 등 비례의 원칙에 따른 조율이 필요합니다.",
  },
  PUBLIC_OPINION: {
    id: "PUBLIC_OPINION",
    title: "시민 공청회 의견 표본",
    category: "opinion",
    description: "피해자 구제의 시급성과 기록의 투명성·알 권리가 상충하므로 구체적 기준이 필요하다는 여론.",
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
    sourceLabel: "주거기본법 및 현대 인권 지표",
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
    sourceLabel: "재난및안전관리기본법",
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
    description: "건강하고 쾌적한 환경에서 생활할 권리이며, 미래 세대를 위해 보전할 책무를 수반한다.",
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
    description: "자유롭게 문화 활동에 참여하고 예술을 향유하며 문화적 정체성을 보장받을 권리이다.",
    sourceLabel: "문화기본법 및 유네스코 협약",
    relatedConceptIds: ["문화권"],
    reliability: 5,
    textbookPage: "교과서 124~125쪽 [새로운 인권]",
    textbookQuote: "문화기본법 제4조: 모든 국민은 성별, 종교, 인종, 세대, 지역, 사회적 신분, 경제적 지위 등에 관계없이 문화 표현과 활동에서 차별을 받지 아니하고 문화활동에 참여하며 문화를 향유할 권리를 가진다.",
    applicationCase: "문화누리카드 지원, 문화 소외 도서산간 지역 예술 프로그램 운영 및 공공도서관 확충.",
    studyTip: "정신적 풍요와 삶의 질을 위해 모든 계층에게 균등한 문화 향유 기회가 보장되어야 합니다.",
  },
};

export const missions: Mission[] = [
  mission({
    id: "m01",
    number: 1,
    title: "인간인가, 재산인가",
    subtitle: "임명 첫날 · 인간 존엄 사건",
    relatedConceptIds: ["인권", "인간 존엄"],
    openingScenes: [
      scene("m01-o1", "아리", "신입 인권수호관 임명을 환영해! 첫 사건은 오래된 재판 기록 한 줄에서 시작됐어.", "ari", "default", "history_archive"),
      scene("m01-o2", "해온", "18세기 어떤 재판부는 사람을 화물과 같은 '물건'으로 취급했어. 당시 법에 있었다는 이유만으로 옳다고 볼 수 있을까?", "haeon", "serious", "history_archive"),
    ],
    activities: [
      activity("m01-b", "briefing", "사건번호 HR-001 · 사라진 이름", {
        body: "노예 무역선 사건 기록에서 사람이 재산과 보험 목적물로 분류된 흔적이 발견되었습니다. 실정법의 형식 논리와 '인간의 존엄성'이라는 근본 기준을 구분해 첫 판정을 내리세요.",
      }),
      activity("m01-s", "source", "기록 보관소 복원 문서 [존 사건 판결록]", {
        body: "과거 일부 판결은 인간을 소유권의 객체로 보았습니다. 그러나 현대 인권 사상은 사람이 결코 다른 목적을 위한 수단이 될 수 없으며, 태어날 때부터 그 자체로 존엄한 주체임을 선언합니다.",
        textbookSource: {
          page: "교과서 98~101쪽",
          section: "1단원 1주제 [인권의 의미와 인간의 존엄성]",
          quote: "헌법 제10조: 모든 국민은 인간으로서의 존엄과 가치를 가지며, 행복을 추구할 권리를 가진다.",
          memo: "인간을 수단이나 거래 대상(재산)으로 취급하는 것은 헌법 최고 가치인 인간 존엄성에 정면 위배됨.",
        },
      }),
      activity("m01-p1", "puzzle", "긴급 판독 · OX 판정", {
        question: "인권은 국가가 법률로 제정하여 부여해 주어야만 비로소 발생하는 권리이다.",
        choices: ["O · 국가의 실정법이 있어야만 생긴다", "X · 인간이라는 이유만으로 태어날 때부터 갖는다"],
        answer: 1,
      }),
      activity("m01-p2", "puzzle", "핵심 가치 탐지 · 초성 힌트 [ㅇㄱ ㅈㅇ]", {
        question: "인간을 거래 가능한 재산이나 도구로 취급하는 것에 맞서, 가장 근본적으로 지켜야 할 최고 가치는?",
        choices: ["재산의 자유", "인간으로서의 존엄과 가치", "계약의 자율성", "행정의 효율성"],
        answer: 1,
      }),
    ],
    zeroChallenge: activity("m01-z", "zero", "ZERO의 첫 반론", {
      body: "그 시대의 법과 관습이 허용했다면, 당시 기준으로는 합법이고 정당했던 것 아닌가? 시대를 뛰어넘는 절대적 권리가 정말 존재하나?",
      choices: [
        "그 시대 법률에 명시되었다면 무조건 정당하다고 봐야 한다.",
        "법의 형식적 존재와 인간 존엄이라는 도덕적·인권적 정당성은 명확히 구분해야 한다.",
      ],
      answer: 1,
    }),
    investigations: ["노예선 재판 기록", "인간의 도구화 반대 논거"],
    evidenceIds: ["HUMAN_DIGNITY"],
    decisions: [
      "당시의 법적 형식을 존중하여 사람을 재산으로 다룬 기록을 그대로 둔다.",
      "인간 존엄과 가치를 최고 기준으로 삼아 반인권적 판결을 재평가하고 권리 카드를 확립한다.",
    ],
    outcomes: ["반인권적 역사 방치", "첫 번째 권리 카드 획득"],
    rewards: { exp: 50 },
    nextMissionId: "m02",
  }),

  mission({
    id: "m02",
    number: 2,
    title: "인권 DNA를 찾아라",
    subtitle: "조작된 4대 특성 데이터 복구",
    relatedConceptIds: ["보편성", "천부성", "불가침성", "항구성"],
    openingScenes: [
      scene("m02-o1", "아리", "긴급 상황이야! 누군가 인권수호국 데이터베이스에서 인권의 4대 핵심 특성 코드를 분리해 왜곡해 버렸어.", "ari", "surprise", "investigation_room"),
      scene("m02-o2", "해온", "인권의 본질을 왜곡하면 취약 계층의 권리가 배제돼. 보편성·천부성·불가침성·항구성의 4대 DNA를 온전히 복구하자.", "haeon", "warning", "investigation_room"),
    ],
    activities: [
      activity("m02-b", "briefing", "사건번호 HR-002 · 인권 DNA 해킹", {
        body: "인권의 4가지 기본 성질(보편성, 천부성, 불가침성, 항구성)을 조작하려는 4개의 왜곡 주장을 논파하고 데이터 블록을 정상화하세요.",
      }),
      activity("m02-s", "source", "인권 특성 검증 데이터베이스 [교과서 개념 발췌]", {
        body: "인권은 인간이라는 이유만으로 동등하게 주어지는 보편성, 태어나면서부터 갖는 천부성, 국가 권력도 침해할 수 없는 불가침성, 영구히 보장되는 항구성을 지닙니다.",
        textbookSource: {
          page: "교과서 102~105쪽",
          section: "1단원 1주제 [인권의 4대 핵심 성격]",
          quote: "보편성(누구에게나) · 천부성(태어날 때부터) · 불가침성(빼앗길 수 없음) · 항구성(영구히 보장)",
          memo: "조건부 인권 부여나 포기 각서는 헌법상 무효이며 모든 법률의 정당성 척도가 됨.",
        },
      }),
      activity("m02-p1", "puzzle", "DNA 조각 1 · 국적 차별 논리 격파", {
        question: "‘국적이나 인종이 다른 외국인에게는 기본적 인권을 인정하지 않아도 된다’는 주장을 논파하는 인권의 특성은?",
        choices: ["보편성 (모든 사람에게 차별 없이 적용)", "천부성 (하늘로부터 타고난 권리)", "불가침성 (침해할 수 없음)", "항구성 (영구히 보장됨)"],
        answer: 0,
      }),
      activity("m02-p2", "puzzle", "DNA 조각 2 · 국가 허가증 논리 격파", {
        question: "‘국가가 승인하고 허가증을 발급해야만 비로소 인권이 부여된다’는 주장에 맞서는 특성은?",
        choices: ["항구성", "불가침성", "천부성 (태어나면서부터 자연적으로 가짐)", "보편성"],
        answer: 2,
      }),
      activity("m02-p3", "puzzle", "DNA 조각 3 · 권리 포기 각서 논리 격파", {
        question: "‘거액의 대가를 받았으므로 자신의 신체와 생명권을 영구 포기하기로 합의했다’는 주장을 무효화하는 특성은?",
        choices: ["항구성", "불가침성 (함부로 빼앗기거나 양도·포기할 수 없음)", "보편성", "천부성"],
        answer: 1,
      }),
      activity("m02-p4", "puzzle", "DNA 조각 4 · 유효기간 설정 논리 격파", {
        question: "‘인권은 청소년기까지만 유효하며 성인 이후에는 소멸한다’는 주장에 맞서는 특성은?",
        choices: ["보편성", "천부성", "불가침성", "항구성 (시간의 경과와 무관하게 영구히 보장)"],
        answer: 3,
      }),
      activity("m02-e", "evidence", "인권 4대 DNA 권리 카드 회수", {
        evidenceIds: ["UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY", "PERMANENCE"],
      }),
    ],
    zeroChallenge: activity("m02-z", "zero", "ZERO의 본질적 의문", {
      body: "현실에서는 여전히 수많은 인권 침해가 일어나고 있잖아. 실제로 완벽히 지켜지지 못하는데, 이것이 본래 주어진 영구한 권리라고 주장할 수 있나?",
      choices: [
        "현실에서 침해당하고 있으니 인권의 보편적 본질은 허상에 불과하다.",
        "인권의 본래적 정당성과 현실에서의 실현·보장 수준은 구분해야 하며, 현실의 미흡함이 인권의 가치를 부정할 수는 없다.",
      ],
      answer: 1,
    }),
    investigations: ["국적 배제 데이터", "인권 양도 각서", "기간 한정 조항"],
    evidenceIds: ["UNIVERSALITY", "NATURAL_RIGHT", "INVIOLABILITY", "PERMANENCE"],
    decisions: [
      "상황과 조건에 따라 인권의 적용 대상을 선별적으로 제한한다.",
      "인권은 모든 인간에게 본래 주어지며 양도할 수 없는 영구한 가치임을 공표한다.",
    ],
    outcomes: ["인권 사각지대 발생", "인권 4대 DNA 완벽 복구"],
    rewards: { exp: 70 },
    nextMissionId: "m03",
  }),

  mission({
    id: "m03",
    number: 3,
    title: "혁명의 문을 열어라",
    subtitle: "시민 혁명과 참정권 확대의 역사",
    relatedConceptIds: ["자유권", "평등권", "참정권"],
    openingScenes: [
      scene("m03-o1", "해온", "1955년 로자 파크스는 버스의 인종 분리 좌석 이동 명령을 단호히 거부했어. 이 작은 용기가 거대한 평등권 운동의 불꽃이 되었지.", "haeon", "guide", "revolution_archive", "rosa-parks.jpg", "인종 분리 좌석을 거부한 로자 파크스 사건"),
      scene("m03-o2", "ZERO", "하지만 근대 시민 혁명 직후에도 여성과 노동자에게는 투표권조차 없었지. 결국 권리는 특권층의 전유물 아니었나?", "zero", "challenge", "revolution_archive"),
    ],
    activities: [
      activity("m03-b", "briefing", "사건번호 HR-003 · 봉인된 권리 확장 연표", {
        body: "영국 명예혁명, 미국 독립 혁명, 프랑스 혁명에서 시작되어 차티스트 운동과 여성 참정권 운동으로 이어진 권리 확장의 역사를 추적하세요.",
      }),
      activity("m03-s", "source", "역사 기록 보관소 [인권 선언 및 차티스트 인민헌장]", {
        body: "근대 시민 혁명은 신분제 타파와 국가로부터의 자유를 선언했습니다. 이후 차티스트 운동과 서프러제트 투쟁을 통해 모든 계층으로 참정권(선거권)이 보편적으로 확장되었습니다.",
        textbookSource: {
          page: "교과서 106~109쪽",
          section: "1단원 2주제 [시민 혁명과 기본권의 확장]",
          quote: "1789 프랑스 인권선언 ➔ 19세기 영국 차티스트 운동 ➔ 1955 미국 민권 운동(로자 파크스)",
          memo: "초기 시민혁명의 한계(재산·성별 제한)를 극복하며 보통·평등 선거권과 실질적 평등으로 발전.",
        },
      }),
      activity("m03-i", "investigation", "역사적 쟁점 조사 (3대 핵심 사건)", {
        items: ["국가 권력의 자의적 체포와 자유권 쟁취", "신분제 폐지와 법 앞의 평등권 요구", "재산·성별 제한 철폐와 보통선거 참정권 투쟁"],
      }),
      activity("m03-p1", "puzzle", "권리 개념 매칭 · 1세대 인권", {
        question: "근대 시민 혁명에서 '국가는 개인의 자유와 재산에 부당하게 간섭하지 말라'고 요구하며 쟁취한 소극적 방어권은?",
        choices: ["사회권", "자유권", "환경권", "연대권"],
        answer: 1,
      }),
      activity("m03-p2", "puzzle", "사례 분석 · 차티스트 & 서프러제트", {
        question: "19세기 영국의 차티스트 운동과 20세기 초 여성 참정권 운동의 역사적 공통 목표는?",
        choices: ["주거 환경 개선", "국가 의사 결정에 참여할 수 있는 선거권의 확대", "노동 시간 단축", "사유재산권의 절대적 보장"],
        answer: 1,
      }),
      activity("m03-p3", "puzzle", "역사 연표 순서 배열", {
        question: "인권 발전의 역사적 전개 흐름으로 가장 올바른 순서는?",
        choices: [
          "시민 혁명(자유·평등) ➔ 산업화 이후(사회권) ➔ 2차 대전 이후(연대권)",
          "산업화 이후(사회권) ➔ 시민 혁명(자유·평등) ➔ 2차 대전 이후(연대권)",
          "2차 대전 이후(연대권) ➔ 시민 혁명(자유·평등) ➔ 산업화 이후(사회권)",
        ],
        answer: 0,
      }),
      activity("m03-e", "evidence", "시민 혁명 권리 카드 회수", {
        evidenceIds: ["FREEDOM_RIGHT", "EQUALITY_RIGHT", "PARTICIPATION_RIGHT"],
      }),
    ],
    zeroChallenge: activity("m03-z", "zero", "ZERO의 역사적 한계 지적", {
      body: "시민 혁명 초기에는 유산자 남성에게만 투표권을 주었잖아. 불완전하고 모순된 혁명인데도 인권의 위대한 성취라고 포장할 수 있나?",
      choices: [
        "처음부터 모두에게 주지 않았으므로 시민 혁명은 위선에 불과하다.",
        "초기의 신분적·성별적 한계가 존재했으나, 만인 평등의 원리를 헌법에 명시함으로써 이후 참정권 확대 투쟁의 결정적 디딤돌이 되었다.",
      ],
      answer: 1,
    }),
    investigations: ["영국 권리장전", "프랑스 인권선언", "차티스트 인민헌장", "로자 파크스 진술"],
    evidenceIds: ["FREEDOM_RIGHT", "EQUALITY_RIGHT", "PARTICIPATION_RIGHT"],
    decisions: [
      "초기의 배제와 한계만을 부각하여 혁명의 의의를 축소한다.",
      "혁명의 역사적 성과와 한계를 객관적으로 평가하고, 참정권 확대의 발전 과정을 명시한다.",
    ],
    outcomes: ["역사적 맥락 단절", "권리 확장 대연표 복원 완료"],
    rewards: { exp: 80 },
    nextMissionId: "m04",
  }),

  mission({
    id: "m04",
    number: 4,
    title: "권리는 왜 늘어났을까",
    subtitle: "산업화의 그늘과 국제 연대의 태동",
    relatedConceptIds: ["사회권", "연대권"],
    openingScenes: [
      scene("m04-o1", "해온", "산업 혁명으로 공장은 거대해졌지만, 노동자들은 하루 16시간씩 일하며 굶주렸어. 국가의 '불간섭'만으로는 인간다운 삶을 지킬 수 없었던 거지.", "haeon", "skill", "industrial_city"),
      scene("m04-o2", "아리", "그리고 두 차례의 세계 대전을 겪으며 인류는 깨달았어. 전쟁, 기아, 환경오염은 한 나라의 힘만으로는 막을 수 없고 전 지구적 '연대'가 필요하다는 것을!", "ari", "research", "postwar_world", "cedaw.jpg", "여성 차별 철폐 협약(CEDAW)과 국제 협력"),
    ],
    activities: [
      activity("m04-b", "briefing", "사건번호 HR-004 · 시대의 구조 신호", {
        body: "19세기 산업화 시기의 빈부격차 및 열악한 노동 환경과 20세기 세계 대전 이후의 지구촌 문제를 비교하여 사회권과 연대권의 등장 배경을 밝혀내세요.",
      }),
      activity("m04-s", "source", "1919년 독일 바이마르 헌법 제151조 및 국제 협약", {
        body: "‘경제생활의 질서는 모든 사람에게 인간다운 생활을 보장하는 정의의 원칙에 합치해야 한다.’ — 세계 최초로 헌법에 사회권을 규정하여 국가의 적극적 복지 의무를 천명하였습니다.",
        textbookSource: {
          page: "교과서 110~113쪽",
          section: "1단원 2주제 [현대적 인권의 확장: 사회권과 연대권]",
          quote: "1919년 바이마르 헌법 제151조(인간다운 생활 보장) & 카렐 바삭 3세대 인권론(연대권)",
          memo: "국가의 소극적 불간섭(자유권) 한계를 극복하고 인간다운 생존권 보장과 국제 평화 연대로 지평 확장.",
        },
      }),
      activity("m04-p1", "puzzle", "문장 완성 퍼즐 · 사회권의 본질", {
        question: "바이마르 헌법이 최초로 명문화한 사회권의 핵심 성격은 ‘국가에 대하여 최소한의 (        ) 생활 보장을 요구할 권리’이다.",
        choices: ["인간다운 (인간의 존엄을 유지할 수 있는 생활)", "호화로운", "방임적인", "경쟁적인"],
        answer: 0,
      }),
      activity("m04-p2", "puzzle", "시대와 권리 매칭", {
        question: "산업 혁명 이후 대두된 권리와 세계 대전 이후 국제 사회에서 강조된 권리의 올바른 짝은?",
        choices: [
          "산업 혁명기 : 사회권 (2세대) / 세계 대전 이후 : 연대권·발전권 (3세대)",
          "산업 혁명기 : 자유권 / 세계 대전 이후 : 참정권",
          "산업 혁명기 : 연대권 / 세계 대전 이후 : 재산권",
        ],
        answer: 0,
      }),
      activity("m04-e", "evidence", "현대적 권리 확장 카드 회수", {
        evidenceIds: ["SOCIAL_RIGHT", "SOLIDARITY_RIGHT"],
      }),
    ],
    zeroChallenge: activity("m04-z", "zero", "ZERO의 국가 개입 비판", {
      body: "국가가 복지나 인간다운 생활을 핑계로 시장과 개인 생활에 깊숙이 개입하면, 결국 자유권이 위축되고 비효율만 생기는 것 아닌가?",
      choices: [
        "국가는 오직 국방과 치안만 맡고 개인의 복지에는 일절 개입하지 말아야 한다.",
        "자유권의 실질적 행사를 위해서는 최소한의 생존과 교육, 주거 등 사회권적 조건이 뒷받침되어야 하며, 두 권리는 상호보완적이다.",
      ],
      answer: 1,
    }),
    investigations: ["산업 혁명 노동 보고서", "바이마르 헌법 원문", "세계 인권 선언 제3세대 권리 조항"],
    evidenceIds: ["SOCIAL_RIGHT", "SOLIDARITY_RIGHT"],
    decisions: [
      "국가의 역할을 소극적 자유 보장에만 한정한다.",
      "실질적 평등을 위한 사회권 보장과 지구촌 연대 의무를 헌법적 가치로 확립한다.",
    ],
    outcomes: ["사회적 양극화 심화", "사회권 및 국제 연대 체계 확립"],
    rewards: { exp: 80 },
    nextMissionId: "m05",
  }),

  mission({
    id: "m05",
    number: 5,
    title: "지워지지 않는 영상",
    subtitle: "첫 시민 접수 · 잊힐 권리와 표현의 자유의 충돌",
    relatedConceptIds: ["새로운 인권", "개인정보", "잊힐 권리", "표현의 자유"],
    openingScenes: [
      scene("m05-o1", "지우", "어릴 때 멋모르고 올렸던 철없는 영상이 무단 복제되어 온라인에 계속 퍼져요... 제 이름을 검색하면 가장 위에 나와서 정상적인 생활이 불가능해요.", "npc", "worried", "digital_case_room", "left"),
      scene("m05-o2", "아리", "교과서의 '잊힐 권리(Right to be forgotten)' 쟁점이야! 개인의 사생활 보호와 검색 엔진·이용자의 알 권리, 표현의 자유가 정면으로 충돌하고 있어.", "ari", "think", "digital_case_room", "forgotten-right.jpg", "온라인 검색 결과 삭제와 잊힐 권리 삽화"),
      scene("m05-o3", "해온", "무조건적인 삭제도 위험하지만, 방치하는 것은 심각한 인격권 침해를 낳아. 객관적인 Evidence를 최소 3건 이상 수집해 공정한 판단을 내려야 해.", "haeon", "warning", "digital_case_room"),
    ],
    activities: [
      activity("m05-b", "briefing", "사건번호 HR-005 · 디지털 흔적 구제 청원", {
        body: "피해 학생의 진술, 플랫폼 삭제 운영 규정, 시민 의견을 면밀히 조사하여 '개인의 사생활 및 잊힐 권리'와 '공익적 정보 접근 및 표현의 자유' 사이의 합리적 조정안을 도출하세요.",
      }),
      activity("m05-i", "investigation", "디지털 사건 증거 조사 (3건 필수)", {
        items: [
          "피해 학생의 지속적 인격권 침해 진술",
          "가상 플랫폼의 삭제 심사 가이드라인",
          "공익성 및 기록 보존에 관한 시민 여론",
        ],
      }),
      activity("m05-s", "source", "검색 서비스 알고리즘 및 확산 분석", {
        body: "해당 영상은 비공익적 사생활 영역에 해당하며, 당사자가 미성년 시기에 게시된 점, 악의적 재배포로 인한 피해가 일상생활을 심각하게 파괴하고 있음이 확인되었습니다.",
        textbookSource: {
          page: "교과서 114~117쪽",
          section: "1단원 3주제 [현대 사회의 인권 쟁점: 잊힐 권리와 알 권리]",
          quote: "교과서 114쪽 읽기자료: '정보 사회에서 개인정보와 사생활의 비밀을 지킬 잊힐 권리는 헌법상 인격권에 기초한다.'",
          memo: "방송통신위원회 자기게시물 접근배제요청권 가이드라인 및 공익성과 사생활 간의 비례 원칙 적용.",
        },
      }),
      activity("m05-p", "puzzle", "권리 충돌 조정 원칙 탐색", {
        question: "사생활의 비밀과 자유(잊힐 권리) vs 표현의 자유 및 알 권리가 충돌할 때 취해야 할 가장 타당한 태도는?",
        choices: [
          "무조건 먼저 접수된 권리만 일방적으로 인정한다.",
          "피해의 중대성, 정보의 공익성, 당사자의 공인 여부, 시간의 경과를 종합적으로 형량하여 조화를 모색한다.",
          "기업의 수익성에 가장 유리한 방향으로 결정한다.",
        ],
        answer: 1,
      }),
      activity("m05-e", "evidence", "사건 심사 근거 카드 등록", {
        evidenceIds: ["YOUTH_TESTIMONY", "PLATFORM_POLICY", "PUBLIC_OPINION"],
      }),
    ],
    zeroChallenge: activity("m05-z", "zero", "ZERO의 날카로운 반론", {
      body: "자신이 스스로 올렸던 기록을 나중에 지워달라고 하는 것까지 국가가 개입해 지워주면, 인터넷의 자유로운 정보 유통과 역사적 기록의 투명성은 어떻게 보장하나?",
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
      "기준 없이 모든 삭제 요구를 무조건 수용하여 공익적 기록까지 훼손한다. (표현의 자유 침해)",
      "정보의 성격(비공익적 사생활·미성년)과 피해 중대성을 심사하여 해당 검색 링크를 배제하고 재확산 방지 조치를 명령한다. (권리 간 균형 구제)",
    ],
    outcomes: ["피해 구제 실패", "공익 기록 훼손 위험", "균형 잡힌 디지털 인권 구제 절차 수립"],
    rewards: { exp: 100 },
    nextMissionId: "m06",
  }),

  mission({
    id: "m06",
    number: 6,
    title: "네 개의 새로운 권리",
    subtitle: "도시 동시 경보 · 주거·안전·환경·문화권 총괄",
    relatedConceptIds: ["주거권", "안전권", "환경권", "문화권"],
    openingScenes: [
      scene("m06-o1", "아리", "도시 관제 센터에 4대 위기 경보가 동시에 떴어! 대기오염은 환경권을, 상습 침수는 주거권을 위협하고 있어.", "ari", "warning", "arca_city_map", "fine-dust.jpg", "초미세 먼지 비상저감 조치와 도로 작업"),
      scene("m06-o2", "해온", "통학로 안전사고 위험은 안전권을, 소외 계층의 문화 격차는 문화권을 침해하지. 현대 사회에서 새롭게 확장된 네 권리를 모두 검증하자!", "haeon", "resolve", "arca_city_map", "safety-report.jpg", "위험 시설 안전신문고 시민 신고 현장"),
    ],
    activities: [
      activity("m06-b", "briefing", "사건번호 HR-006 · 도시 복합 위기 관제", {
        body: "현대 도시에서 발생하는 4대 권리(주거권, 안전권, 환경권, 문화권) 침해 신호를 현장별로 조사하고 시민의 기본권을 지키는 종합 대책을 수립하세요.",
      }),
      activity("m06-s", "source", "현대 도시 헌법 데이터 [새롭게 요구되는 인권]", {
        body: "현대 사회는 환경오염, 주거 불안정, 안전 참사, 문화 격차 등 새로운 위험에 직면하여 주거권·안전권·환경권·문화권의 4대 권리를 헌법적 권리로 확립하고 있습니다.",
        textbookSource: {
          page: "교과서 118~125쪽",
          section: "1단원 3주제 [새롭게 등장하는 현대적 인권]",
          quote: "주거권(주거기본법) · 안전권(헌법 제34조) · 환경권(헌법 제35조) · 문화권(문화기본법)",
          memo: "시민의 삶의 질 향상과 지속 가능한 사회를 위해 국가의 적극적 제도 수립과 시민 참여가 요구됨.",
        },
      }),
      activity("m06-i", "investigation", "도시 4대 위험 구역 현장 조사", {
        items: [
          "ZONE A : 반지하 상습 침수와 열악한 주거 환경",
          "ZONE B : 어린이 통학로 횡단보도 및 시설물 안전 위협",
          "ZONE C : 초미세 먼지 농도 급증과 대기오염 피해",
          "ZONE D : 문화 소외 지역의 예술 향유 기회 격차",
        ],
      }),
      activity("m06-p1", "puzzle", "ZONE A · 주거권 신호 판독", {
        question: "‘단순한 거처를 넘어, 물리적·사회적 위험으로부터 안전하고 쾌적한 주거 생활을 누릴 권리’는?",
        choices: ["주거권", "안전권", "문화권", "자유권"],
        answer: 0,
      }),
      activity("m06-p2", "puzzle", "ZONE B · 안전권 신호 판독", {
        question: "‘국가와 지자체로부터 재해, 재난, 범죄, 사고 등 각종 위험으로부터 생명과 신체를 보호받을 권리’는?",
        choices: ["환경권", "안전권", "평등권", "청구권"],
        answer: 1,
      }),
      activity("m06-p3", "puzzle", "ZONE C · 환경권 성격 판독", {
        question: "헌법 제35조에 규정된 '환경권'에 관한 설명으로 가장 올바른 것은?",
        choices: [
          "국민에게는 깨끗한 환경을 누릴 권리만 있고 의무는 없다.",
          "건강하고 쾌적한 환경을 누릴 권리이자, 국가와 국민 모두가 환경을 보전해야 할 헌법적 의무를 함께 지닌다.",
          "공장 설립의 자유가 환경권보다 항상 우선한다.",
        ],
        answer: 1,
      }),
      activity("m06-p4", "puzzle", "ZONE D · 문화권 범위 판독", {
        question: "현대 사회에서 보장되는 '문화권'의 올바른 범위는?",
        choices: [
          "전문 예술가에게만 특별히 주어지는 특권",
          "모든 시민이 차별 없이 문화 활동에 참여하고 예술을 향유하며 문화적 정체성을 유지할 권리",
          "선거권에만 국한된 권리",
        ],
        answer: 1,
      }),
      activity("m06-e", "evidence", "현대 4대 권리 카드 등록", {
        evidenceIds: ["HOUSING_RIGHT", "SAFETY_RIGHT", "ENVIRONMENT_RIGHT", "CULTURE_RIGHT"],
      }),
    ],
    zeroChallenge: activity("m06-z", "zero", "ZERO의 현실 예산 반론", {
      body: "도시의 예산과 자원은 언제나 한정되어 있어. 주거, 안전, 환경, 문화를 모두 권리라고 선언해 버리면 재정이 파탄 나지 않겠나?",
      choices: [
        "예산이 부족하므로 비용이 가장 적게 드는 사업 하나만 하고 나머지는 포기한다.",
        "인권은 예산의 잔여물이 아니라 시정의 최우선 가치이며, 위험의 긴급성과 인권 영향 평가를 바탕으로 단계적·통합적 안전망을 구축해야 한다.",
      ],
      answer: 1,
    }),
    investigations: ["ZONE A 주거 현장", "ZONE B 통학로 안전 점검", "ZONE C 대기질 관측소", "ZONE D 문화 센터 현황"],
    evidenceIds: ["HOUSING_RIGHT", "SAFETY_RIGHT", "ENVIRONMENT_RIGHT", "CULTURE_RIGHT"],
    decisions: [
      "특정 구역에만 자원을 몰아주고 나머지 세 권리는 후순위로 미룬다.",
      "긴급 위험 해소(안전·주거)를 선행하면서 환경·문화권 보장 계획을 단계적으로 통합 수립한다.",
    ],
    outcomes: ["도시 격차 심화 및 사각지대 잔존", "도시 인권 안전망 종합 완성"],
    rewards: { exp: 120, title: "정식 인권수호관", skill: "인권 렌즈 Lv.1" },
  }),
];

export const missionDialogueQuestions: Record<string, DialogueOption[]> = {
  m01: [
    {
      question: "교과서 98쪽의 '인간 존엄성'이란 구체적으로 무슨 뜻인가요?",
      answerSpeaker: "아리",
      answerText: "인간은 다른 어떤 목적을 위한 도구나 수단이 될 수 없으며, 태어날 때부터 그 자체로 가장 존중받아야 할 헌법의 최고 목적이라는 원리야!",
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
      question: "외국인이나 체류자에게도 인권의 4대 특성이 똑같이 적용되나요?",
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
  return [
    item.activities[0],
    ...item.openingScenes.map((entry, index) =>
      activity(`${item.id}-dialogue-${index}`, "dialogue", "사건 대화", {
        scene: entry,
        dialogueOptions: dialogueQuestions,
      })
    ),
    ...item.activities.slice(1),
    ...(item.activities.some((entry) => entry.type === "evidence")
      ? []
      : [activity(`${item.id}-evidence-final`, "evidence", "권리 카드 회수", { evidenceIds: item.evidenceIds })]),
    item.zeroChallenge,
    activity(`${item.id}-decision`, "decision", "최종 판단", { choices: item.decisions }),
    activity(`${item.id}-result`, "result", "사건 결과"),
  ];
};

export const academyRooms = [
  {
    id: "room1",
    title: "ROOM 1 — 인권의 의미와 특성",
    concepts: [
      { term: "인권", definition: "인간이라는 이유만으로 존엄을 보장받으며 행복하게 살아갈 권리" },
      { term: "인간 존엄", definition: "사람을 다른 목적의 수단이 아니라 그 자체로 존중해야 한다는 가치" },
      { term: "보편성", definition: "인종·성별·종교·사회적 신분과 무관하게 모든 사람에게 차별 없이 적용되는 성질" },
      { term: "천부성", definition: "국가나 법률의 부여가 아니라 태어나면서부터 본래 갖는 자연적 성질" },
      { term: "불가침성", definition: "타인이나 국가가 함부로 침해할 수 없고 스스로도 양도할 수 없는 성질" },
      { term: "항구성", definition: "특정 시기에만 국한되지 않고 시간의 경과에도 영구히 보장되는 성질" },
    ],
    levels: [
      {
        question: "인권의 4대 특성 중 ‘국적·인종·성별에 따른 차별 없이 모든 사람에게 적용됨’을 뜻하는 것은?",
        choices: ["보편성", "천부성", "불가침성"],
        answer: 0,
        prompt: "‘인간 존엄’ 또는 ‘인권’의 정의를 자신의 언어로 1문장 작성해 보세요.",
      },
      {
        question: "‘국가의 법률 제정 이전에도 인간은 당연히 권리를 가진다’는 원리와 가장 밀접한 특성은?",
        choices: ["항구성", "천부성", "보편성"],
        answer: 1,
        prompt: "천부성과 보편성이 왜 함께 작용해야 하는지 1문장으로 연결해 보세요.",
      },
      {
        question: "대가를 받고 자신의 자유나 생명을 영구 양도하는 계약이 법적으로 무효인 까닭은?",
        choices: ["불가침성 (양도 불가능성) 때문", "참정권 때문", "문화권 때문"],
        answer: 0,
        prompt: "위 사례를 바탕으로 '인권의 불가침성'이 필요한 이유를 1문장으로 서술해 보세요.",
      },
      {
        question: "인권의 4가지 성질(보편·천부·불가침·항구)이 갖는 궁극적 지향점은?",
        choices: ["모든 인간의 존엄과 가치 실현", "국가 권력의 일방적 강화", "경제적 이윤의 극대화"],
        answer: 0,
        prompt: "‘우리가 타인의 인권을 존중해야 하는 이유’에 대해 주장과 근거를 갖추어 2문장으로 작성해 보세요.",
      },
    ],
  },
  {
    id: "room2",
    title: "ROOM 2 — 인권의 확장과 역사",
    concepts: [
      { term: "자유권", definition: "국가 권력의 부당한 간섭과 침해에서 벗어나 자유롭게 생활할 소극적 권리" },
      { term: "평등권", definition: "성별·종교·신분 등을 이유로 불합리하게 차별받지 않고 동등 대우를 받을 권리" },
      { term: "참정권", definition: "국가의 의사 결정과 통치 행위에 직접 또는 간접으로 참여할 능동적 권리" },
      { term: "사회권", definition: "국가에 대하여 최소한의 인간다운 생활의 적극적 보장을 요구할 권리" },
      { term: "연대권", definition: "국경을 넘어 평화·환경 등 인류 공동의 과제를 협력하여 해결할 집단적 권리" },
    ],
    levels: [
      {
        question: "근대 시민 혁명이 국가 권력의 부당한 침해에 맞서 쟁취한 가장 대표적인 권리는?",
        choices: ["자유권", "사회권", "연대권"],
        answer: 0,
        prompt: "자유권이 시민 혁명에서 왜 가장 먼저 강조되었는지 1문장으로 설명해 보세요.",
      },
      {
        question: "19세기 산업화 이후 빈부 격차에 대응하여 바이마르 헌법을 통해 확립된 권리는?",
        choices: ["참정권", "사회권 (인간다운 생활 보장)", "자유권"],
        answer: 1,
        prompt: "소극적 권리인 '자유권'과 적극적 권리인 '사회권'의 결정적 차이를 1문장으로 서술해 보세요.",
      },
      {
        question: "로자 파크스의 버스 좌석 거부 사건이 직접적으로 문제 제기한 헌법적 권리는?",
        choices: ["평등권 (인종 차별 철폐)", "환경권", "청구권"],
        answer: 0,
        prompt: "로자 파크스 사례를 통해 평등권이 현실에서 어떻게 확장되는지 1문장으로 적어 보세요.",
      },
      {
        question: "2차 세계 대전 이후 인류 공동의 평화와 환경 보전을 위해 강조된 제3세대 권리는?",
        choices: ["연대권 (집단권·평화권·환경권)", "재산권", "자유권"],
        answer: 0,
        prompt: "지구촌 연대권이 기후위기 시대에 왜 필수적인지 1문장으로 생각을 적어 보세요.",
      },
    ],
  },
  {
    id: "room3",
    title: "ROOM 3 — 현대 사회의 인권과 참여",
    concepts: [
      { term: "잊힐 권리", definition: "자신에 관한 정보를 스스로 통제하고 인터넷상 개인정보의 삭제·배제를 요구할 권리" },
      { term: "주거권", definition: "물리적·사회적 위험으로부터 안전하고 쾌적한 주거 공간에서 생활할 권리" },
      { term: "안전권", definition: "자연재해, 감염병, 사회적 참사 등 각종 위험으로부터 생명과 안전을 보호받을 권리" },
      { term: "환경권", definition: "건강하고 쾌적한 환경을 누릴 권리이자 미래 세대를 위해 보전할 헌법적 책무" },
      { term: "문화권", definition: "차별 없이 문화 활동에 참여하고 예술을 향유하며 문화적 정체성을 유지할 권리" },
    ],
    levels: [
      {
        question: "인터넷상에서 개인정보 및 과거 비공익적 사생활의 검색 결과 삭제를 요구하는 권리는?",
        choices: ["잊힐 권리", "환경권", "주거권"],
        answer: 0,
        prompt: "잊힐 권리와 표현의 자유(알 권리)가 충돌할 때 어떤 기준이 필요한지 1문장으로 작성해 보세요.",
      },
      {
        question: "재해, 재난, 범죄 등 위험으로부터 생명과 신체를 보호받기 위해 요구되는 권리는?",
        choices: ["안전권", "문화권", "참정권"],
        answer: 0,
        prompt: "우리 지역 통학로나 공공시설에서 안전권을 높이기 위한 아이디어를 1문장으로 제안해 보세요.",
      },
      {
        question: "헌법 제35조 환경권에 '국가와 국민의 의무'가 함께 명시된 까닭은?",
        choices: [
          "쾌적한 환경은 권리인 동시에 미래 세대를 위해 함께 지켜야 할 공공의 책임이기 때문",
          "공장 설립만을 우선하기 때문",
          "선거권을 제한하기 위함",
        ],
        answer: 0,
        prompt: "환경권의 권리와 의무를 조화롭게 실천하는 방안을 1문장으로 적어 보세요.",
      },
      {
        question: "사회 구성원 누구나 차별 없이 문화 활동에 참여하고 예술을 향유할 권리는?",
        choices: ["문화권", "자유권", "사회권"],
        answer: 0,
        prompt: "문화 소외 지역을 위한 문화권 보장 정책의 필요성을 2문장으로 주장해 보세요.",
      },
    ],
  },
];
