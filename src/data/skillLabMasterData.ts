export interface VocabQuestionItem {
  id: string;
  topicId: number;
  topicTitle: string;
  type: "OX" | "CONCEPT" | "CHOICE" | "MATCH";
  question: string;
  options?: string[];
  answer: string | boolean;
  matchPairs?: { left: string; right: string }[];
  hint?: string;
  explanation?: string;
}

// 25개 전 주제 개념-용어 마스터 데이터셋
export const masterVocabTopics = [
  { id: 1, title: "주제 1: 인권의 의미와 변화 양상" },
  { id: 2, title: "주제 2: 현대 사회의 인권" },
  { id: 3, title: "주제 3: 인권 보장을 위한 헌법의 역할" },
  { id: 4, title: "주제 4: 시민의 권익 보호를 위한 시민 참여" },
  { id: 5, title: "주제 5: 국내 인권 문제의 양상과 해결 방안" },
  { id: 6, title: "주제 6: 세계 인권 문제의 양상과 해결 방안" },
  { id: 7, title: "주제 7: 정의의 의미와 필요성" },
  { id: 8, title: "주제 8: 분배적 정의와 교정적 정의" },
  { id: 9, title: "주제 9: 다양한 정의관의 특징과 적용" },
  { id: 10, title: "주제 10: 다양한 불평등 현상" },
  { id: 11, title: "주제 11: 정의로운 사회 실현을 위한 노력" },
  { id: 12, title: "주제 12: 자본주의의 발달과 시장경제" },
  { id: 13, title: "주제 13: 합리적 선택의 의미와 한계" },
  { id: 14, title: "주제 14: 지속가능발전을 위한 시장 참여자의 역할과 책임" },
  { id: 15, title: "주제 15: 자산 관리와 금융 생활 설계" },
  { id: 16, title: "주제 16: 국제 분업과 무역" },
  { id: 17, title: "주제 17: 세계화의 다양한 양상" },
  { id: 18, title: "주제 18: 세계화의 문제점과 해결 방안" },
  { id: 19, title: "주제 19: 평화 실현을 위한 국제 사회 행위 주체의 역할" },
  { id: 20, title: "주제 20: 세계 평화 실현을 위한 우리의 노력" },
  { id: 21, title: "주제 21: 세계의 인구 현황" },
  { id: 22, title: "주제 22: 인구 문제와 해결 방안" },
  { id: 23, title: "주제 23: 자원의 분포와 소비 실태" },
  { id: 24, title: "주제 24: 기후변화에 대한 대응과 지속가능한 발전" },
  { id: 25, title: "주제 25: 미래 사회와 세계시민으로서의 삶의 방향" },
];

export const allVocabQuestions: VocabQuestionItem[] = [
  // ================= 주제 1 =================
  {
    id: "t1_q1", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "OX", question: "인권은 사회적 약자만이 가지는 권리이다.",
    answer: "X", explanation: "인권은 모든 인간이 인간답게 살아가기 위해 누려야 할 보편적 권리입니다."
  },
  {
    id: "t1_q2", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "OX", question: "근대 시민 혁명 시기에 강조된 인권은 자유권, 평등권이다.",
    answer: "O", explanation: "근대 시민 혁명을 통해 국가 권력의 간섭을 배제하는 자유권과 법 앞의 평등권이 확립되었습니다."
  },
  {
    id: "t1_q3", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "OX", question: "국제 연합(UN)에서 채택한 세계 인권 선언은 인권의 국제적 기준을 제시한 것이다.",
    answer: "O", explanation: "1948년 UN 총회에서 채택된 세계 인권 선언은 전 세계 인권 보장의 보편적 기준입니다."
  },
  {
    id: "t1_q4", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "CONCEPT", question: "인권은 일정 기간에만 한정되는 것이 아니라 영구히 보장되는 성질을 무엇이라 하는가?",
    options: ["항구성", "보편성", "불가침성", "천부성"], answer: "항구성", hint: "초성: ㅎㄱㅅ"
  },
  {
    id: "t1_q5", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "CONCEPT", question: "인권은 남에게 양도할 수 없고 남의 권리를 빼앗을 수도 없는 성질을 무엇이라 하는가?",
    options: ["불가침성", "보편성", "항구성", "상대성"], answer: "불가침성", hint: "초성: ㅂㄱㅊㅅ"
  },
  {
    id: "t1_q6", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "CONCEPT", question: "인권은 인종·성별·종교·사회적 신분 등과 관계없이 인류 구성원 모두가 가지는 성질은?",
    options: ["보편성", "불가침성", "항구성", "수단성"], answer: "보편성", hint: "초성: ㅂㅍㅅ"
  },
  {
    id: "t1_q7", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "CHOICE", question: "왕의 독재에 의회가 맞서 싸운 결과 시민의 자유와 권리를 보장하는 권리 장전이 발표된 사건은?",
    options: ["영국 명예혁명", "미국 독립 혁명", "프랑스 대혁명", "러시아 혁명"], answer: "영국 명예혁명"
  },
  {
    id: "t1_q8", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "CHOICE", question: "누구나 최소한의 인간다운 생활을 누려야 한다는 사회권을 세계 최초로 헌법에 규정한 것은?",
    options: ["바이마르 헌법", "세계 인권 선언", "영국 권리장전", "미국 독립선언서"], answer: "바이마르 헌법"
  },
  {
    id: "t1_q9", topicId: 1, topicTitle: "주제 1: 인권의 의미와 변화 양상",
    type: "MATCH", question: "인권의 역사적 발전 단계와 강조된 인권 유형을 바르게 연결하시오.",
    matchPairs: [
      { left: "근대 시민 혁명 이후", right: "자유권, 평등권" },
      { left: "산업 혁명 이후", right: "사회권" },
      { left: "세계 대전 이후", right: "연대권" }
    ], answer: "MATCHED"
  },

  // ================= 주제 2 =================
  {
    id: "t2_q1", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "OX", question: "주거 기본법에서는 최고 주거 기준을 정하여 주거 약자를 지원하기 위해 노력한다.",
    answer: "X", explanation: "최고 주거 기준이 아니라 인간다운 주거 생활을 위한 '최저 주거 기준'을 정합니다."
  },
  {
    id: "t2_q2", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "OX", question: "오늘날 인구가 도시로 집중함에 따라 자유권과 평등권이 현대 사회의 신종 인권으로 강조되고 있다.",
    answer: "X", explanation: "현대 도시화에 따라 강조된 새로운 인권은 주거권, 환경권, 안전권, 문화권 등입니다."
  },
  {
    id: "t2_q3", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "OX", question: "우리 헌법에서는 환경권을 국민의 권리로 보장함과 동시에 환경 보전을 위해 노력해야 할 국민의 의무로 규정하고 있다.",
    answer: "O", explanation: "헌법 제35조는 환경권을 국민의 권리이자 동시에 보전을 위한 국가와 국민의 의무로 명시합니다."
  },
  {
    id: "t2_q4", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "CONCEPT", question: "오늘날 인구가 도시로 집중하면서 불안정한 주거 생활을 하는 사람이 많아지며 강조된 인권은?",
    options: ["주거권", "환경권", "안전권", "문화권"], answer: "주거권"
  },
  {
    id: "t2_q5", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "CONCEPT", question: "산업화와 도시화로 대기·수질 오염, 쓰레기 문제가 심화되며 강조된 인권은?",
    options: ["환경권", "주거권", "안전권", "재산권"], answer: "환경권"
  },
  {
    id: "t2_q6", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "CONCEPT", question: "자연재해뿐만 아니라 각종 안전사고, 감염병 등 인위적 위험으로부터 보호받기 위해 강조된 인권은?",
    options: ["안전권", "문화권", "자유권", "평등권"], answer: "안전권"
  },
  {
    id: "t2_q7", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "CHOICE", question: "국민의 주거권을 보장하고 주거 안정과 주거 수준 향상을 위해 제정된 법률은?",
    options: ["주거 기본법", "산업 안전 보건법", "건축법", "도시개발법"], answer: "주거 기본법"
  },
  {
    id: "t2_q8", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "CHOICE", question: "문화적 정체성 유지와 다양한 문화에 관한 이해를 증진하기 위한 법률은?",
    options: ["문화 다양성의 보호와 증진에 관한 법률", "문화 예술 진흥법", "저작권법", "국민체육진흥법"], answer: "문화 다양성의 보호와 증진에 관한 법률"
  },
  {
    id: "t2_q9", topicId: 2, topicTitle: "주제 2: 현대 사회의 인권",
    type: "MATCH", question: "현대 인권과 관련 제도 및 정책을 바르게 연결하시오.",
    matchPairs: [
      { left: "주거권 관련 제도", right: "최저 주거 기준" },
      { left: "환경권 관련 제도", right: "환경 분쟁 조정 제도" },
      { left: "안전권 관련 제도", right: "안전 신문고 제도" }
    ], answer: "MATCHED"
  },

  // ================= 주제 3 =================
  {
    id: "t3_q1", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "OX", question: "인간으로서의 존엄과 가치는 헌법이 추구하는 궁극의 최고 가치이다.",
    answer: "O", explanation: "헌법 제10조는 인간 존엄성을 모든 기본권의 출발점이자 최고의 헌법적 가치로 규정합니다."
  },
  {
    id: "t3_q2", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "OX", question: "우리 헌법에서는 어떠한 경우에도 기본권을 제한할 수 없도록 절대적으로 금지하고 있다.",
    answer: "X", explanation: "헌법 제37조 제2항에 따라 국가안전보장, 질서유지, 공공복리를 위해 필요한 경우 법률로써 제한할 수 있습니다."
  },
  {
    id: "t3_q3", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "OX", question: "기본권을 침해받은 국민은 법원의 재판이나 헌법재판소의 헌법 소원 심판 등을 통해 침해된 권리를 구제받을 수 있다.",
    answer: "O", explanation: "헌법은 청구권과 헌법재판 제도를 통해 국민의 기본권 구제 수단을 튼튼하게 보장합니다."
  },
  {
    id: "t3_q4", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "CONCEPT", question: "국가의 의사 결정과 정치 과정에 직접 또는 간접적으로 참여할 수 있는 권리는?",
    options: ["참정권", "자유권", "사회권", "청구권"], answer: "참정권"
  },
  {
    id: "t3_q5", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "CONCEPT", question: "국가 권력의 간섭을 받지 않고 자유롭게 생활할 수 있는 소극적·방어적 기본권은?",
    options: ["자유권", "사회권", "참정권", "청구권"], answer: "자유권"
  },
  {
    id: "t3_q6", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "CONCEPT", question: "다른 기본권이 침해되었을 때 법원에 재판을 청구하는 등 이의 구제를 요구할 수 있는 수단적 기본권은?",
    options: ["청구권", "평등권", "사회권", "자유권"], answer: "청구권"
  },
  {
    id: "t3_q7", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "CHOICE", question: "국가 권력을 각각 다른 기관(입법·행정·사법)이 나누어 맡으며 상호 견제와 균형을 이루도록 하는 제도는?",
    options: ["권력 분립 제도", "민주적 선거 제도", "복수 정당제", "지방 자치제"], answer: "권력 분립 제도"
  },
  {
    id: "t3_q8", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "CHOICE", question: "우리 헌법에서 다양한 정당 활동의 자유를 보장하여 인권 보장을 실현할 수 있도록 규정한 제도는?",
    options: ["복수 정당제", "단일 정당제", "비밀 선거제", "책임 내각제"], answer: "복수 정당제"
  },
  {
    id: "t3_q9", topicId: 3, topicTitle: "주제 3: 인권 보장을 위한 헌법의 역할",
    type: "MATCH", question: "기본권 유형과 그에 해당하는 구체적 권리 예시를 바르게 연결하시오.",
    matchPairs: [
      { left: "자유권의 예시", right: "직업 선택의 자유" },
      { left: "사회권의 예시", right: "교육받을 권리" },
      { left: "청구권의 예시", right: "국가 배상 청구권" }
    ], answer: "MATCHED"
  },

  // ================= 주제 4 =================
  {
    id: "t4_q1", topicId: 4, topicTitle: "주제 4: 시민의 권익 보호를 위한 시민 참여",
    type: "OX", question: "시민 참여는 시민 권익을 보호하여 공동체 이익을 증진하는 역할을 한다.",
    answer: "O", explanation: "시민 참여는 공공정책에 시민의 의사를 반영하고 권익을 지키는 핵심 통로입니다."
  },
  {
    id: "t4_q2", topicId: 4, topicTitle: "주제 4: 시민의 권익 보호를 위한 시민 참여",
    type: "OX", question: "시민은 정치적 견해를 같이하는 사람들이 결성한 이익 집단에 참여하여 정책 수립에 영향을 미친다.",
    answer: "X", explanation: "정치적 견해를 같이하여 정권 획득을 목표로 하는 단체는 '정당'이며, 이익집단은 특정한 사적 이해관계를 같이하는 집단입니다."
  },
  {
    id: "t4_q3", topicId: 4, topicTitle: "주제 4: 시민의 권익 보호를 위한 시민 참여",
    type: "OX", question: "부정의한 법이나 정책을 바로잡기 위해 비폭력적인 수단을 활용하여 의도적으로 법을 위반하는 행위를 시민불복종이라고 한다.",
    answer: "O", explanation: "롤스 등이 정립한 시민불복종은 최후의 비폭력적 저항 수단입니다."
  },
  {
    id: "t4_q4", topicId: 4, topicTitle: "주제 4: 시민의 권익 보호를 위한 시민 참여",
    type: "CONCEPT", question: "특정 문제에 관한 법률 마련이나 개선을 국회에 공식적으로 요구하는 시민 참여 방법은?",
    options: ["입법 청원", "주민투표", "시민단체 가입", "선거 참여"], answer: "입법 청원"
  },
  {
    id: "t4_q5", topicId: 4, topicTitle: "주제 4: 시민의 권익 보호를 위한 시민 참여",
    type: "CONCEPT", question: "대표자를 선출하여 시민 의사가 국가 정책에 반영되도록 하는 가장 기본적인 시민 참여 방법은?",
    options: ["선거와 투표 참여", "입법 청원", "언론 기고", "집회 참여"], answer: "선거와 투표 참여"
  },
  {
    id: "t4_q6", topicId: 4, topicTitle: "주제 4: 시민의 권익 보호를 위한 시민 참여",
    type: "CHOICE", question: "사회적 다수에 의해 공유된 정의관이 시민불복종의 정당성 기준이 되어야 한다고 주장한 사상가는?",
    options: ["롤스", "싱어", "벤담", "노직"], answer: "롤스"
  },
  {
    id: "t4_q7", topicId: 4, topicTitle: "주제 4: 시민의 권익 보호를 위한 시민 참여",
    type: "MATCH", question: "정치 및 시민 참여 집단의 성격을 바르게 연결하시오.",
    matchPairs: [
      { left: "정당", right: "정치적 견해를 같이하는 사람들이 조직한 단체" },
      { left: "이익 집단", right: "특정한 이해관계를 같이하는 사람들이 결성한 집단" },
      { left: "시민 단체", right: "공익 추구를 위해 시민이 자발적으로 결성한 단체" }
    ], answer: "MATCHED"
  },

  // ================= 주제 5 =================
  {
    id: "t5_q1", topicId: 5, topicTitle: "주제 5: 국내 인권 문제의 양상과 해결 방안",
    type: "OX", question: "사회적 소수자는 한 사회 내에서 인원이 수적으로 소수인 사람만을 말한다.",
    answer: "X", explanation: "사회적 소수자는 단순 인원수가 아니라 권력 관계에서 불평등한 차별 대우를 받는 집단입니다."
  },
  {
    id: "t5_q2", topicId: 5, topicTitle: "주제 5: 국내 인권 문제의 양상과 해결 방안",
    type: "OX", question: "18세 미만의 청소년이 근로할 때는 보호자가 대리하여 사용자와 근로 계약을 체결해야 한다.",
    answer: "X", explanation: "청소년 근로계약은 친권자의 동의서를 첨부하여 청소년 본인이 직접 체결해야 합니다."
  },
  {
    id: "t5_q3", topicId: 5, topicTitle: "주제 5: 국내 인권 문제의 양상과 해결 방안",
    type: "CHOICE", question: "청소년의 근로 조건과 권리를 특별히 보호하는 기본 법률은?",
    options: ["근로 기준법", "노동조합법", "상법", "민법"], answer: "근로 기준법"
  },
  {
    id: "t5_q4", topicId: 5, topicTitle: "주제 5: 국내 인권 문제의 양상과 해결 방안",
    type: "MATCH", question: "18세 미만 청소년 근로 규정을 바르게 연결하시오.",
    matchPairs: [
      { left: "법정 근로 시간 한도", right: "1일 7시간, 1주일 35시간 이내" },
      { left: "근로 계약 체결 방식", right: "친권자의 동의를 얻어 본인이 직접 체결" },
      { left: "법정 휴게 시간", right: "4시간 근로에 30분 이상" }
    ], answer: "MATCHED"
  },

  // ================= 주제 6 =================
  {
    id: "t6_q1", topicId: 6, topicTitle: "주제 6: 세계 인권 문제의 양상과 해결 방안",
    type: "OX", question: "기아 위험도가 높은 국가들은 자연재해나 무력 분쟁 등으로 식량 생산과 보급이 어려운 경우가 많다.",
    answer: "O", explanation: "기아는 기후변화, 내전, 사회 인프라 붕괴 등이 복합적으로 작용하여 발생합니다."
  },
  {
    id: "t6_q2", topicId: 6, topicTitle: "주제 6: 세계 인권 문제의 양상과 해결 방안",
    type: "CHOICE", question: "영국 《이코노미스트》가 각국 여성의 고위직 진출을 가로막는 보이지 않는 장벽을 수치화한 지수는?",
    options: ["유리 천장 지수", "성 격차 지수", "인간 개발 지수", "세계 자유 지수"], answer: "유리 천장 지수"
  },
  {
    id: "t6_q3", topicId: 6, topicTitle: "주제 6: 세계 인권 문제의 양상과 해결 방안",
    type: "MATCH", question: "국제 인권 지표와 측정 대상을 바르게 연결하시오.",
    matchPairs: [
      { left: "성 격차 지수", right: "남녀의 경제 참여와 기회, 교육적 성취 등의 차이" },
      { left: "세계 기아 지수", right: "영양 결핍 인구, 발육 부진 아동, 영유아 사망률 등" },
      { left: "국제 아동 권리 지표", right: "아동의 생존권, 건강할 권리, 교육받을 권리 등" }
    ], answer: "MATCHED"
  },
];

// =========================================================================
// 5단계 탐구 스킬 훈련 모듈 데이터셋 (unit1_data.json 완벽 매핑)
// =========================================================================

export interface Skill1Question {
  id: string;
  type: "OX" | "CHOICE" | "INITIAL" | "MATCH";
  question: string;
  options?: string[];
  answer: string;
  initial?: string;
  pairs?: { left: string; right: string }[];
  hint1: string;
  hint2: string;
}

export interface Skill2Question {
  id: string;
  material: string;
  guide: string;
  question: string;
  keywords: string[];
  blankPrompt: string;
  modelAnswer: string;
}

export interface Skill3Question {
  id: string;
  topic: string;
  caseDescription: string;
  stances: { id: string; name: string; desc: string }[];
  questionPrompt: string;
  hintTemplate: string;
}

export interface Skill4Question {
  id: string;
  title: string;
  caseDescription: string;
  questionPrompt: string;
  relevantLaws: string[];
  hintTemplate: string;
}

export interface Skill5Question {
  id: string;
  title: string;
  contextData: string;
  prompt: string;
  structureGuide: string;
  modelAnswer: string;
}

export interface SkillLabTrainingDataset {
  unitId: string;
  unitTitle: string;
  skill1: {
    defaultSet: Skill1Question[];
    extraSets: {
      setA: Skill1Question[];
      setB: Skill1Question[];
    };
  };
  skill2: Skill2Question[];
  skill3: Skill3Question[];
  skill4: Skill4Question[];
  skill5: Skill5Question[];
}

export const unit1SkillLabMaster: SkillLabTrainingDataset = {
  unitId: "UNIT_01",
  unitTitle: "인권 보장과 헌법",
  skill1: {
    defaultSet: [
      {
        id: "s1_d1",
        type: "OX",
        question: "인권은 일정 기간에만 한정되어 보장되는 것이 아니라 영구히 보장되는 항구성을 지닌다.",
        answer: "O",
        hint1: "인권은 시간이 지나도 소멸하지 않는 권리입니다.",
        hint2: "영구히 보장되는 성격을 나타내는 용어의 초성은 ㅎㄱㅅ입니다.",
      },
      {
        id: "s1_d2",
        type: "CHOICE",
        question: "다음 중 국가 권력의 간섭을 배제하고 자유롭게 생활할 수 있는 권리에 해당하는 것은?",
        options: ["직업 선택의 자유", "교육받을 권리", "재판 청구권", "선거권"],
        answer: "직업 선택의 자유",
        hint1: "국가에 무엇을 요구하기보다 개입을 막는 소극적·방어적 기본권입니다.",
        hint2: "헌법상 기본권 중 '자유권'에 속하는 항목을 고르세요.",
      },
      {
        id: "s1_d3",
        type: "INITIAL",
        question: "다른 기본권이 침해되었을 때 법원에 재판을 청구하는 등 그 구제를 요구할 수 있는 수단적 기본권은?",
        answer: "청구권",
        initial: "ㅊㄱㄱ",
        hint1: "기본권을 침해받은 국민이 국가에 정당한 구제 절차를 요구하는 권리입니다.",
        hint2: "청〇권 (재판 청구권, 국가 배상 청구권 포함)",
      },
      {
        id: "s1_d4",
        type: "MATCH",
        question: "인권의 역사적 발전 단계와 강조된 인권 유형을 바르게 짝지으시오.",
        pairs: [
          { left: "근대 시민 혁명 이후", right: "자유권 및 평등권" },
          { left: "산업 혁명 이후", right: "사회권" },
          { left: "세계 대전 이후", right: "연대권" },
        ],
        hint1: "바이마르 헌법은 사회권, 세계인권선언은 연대권과 관련됩니다.",
        hint2: "1세대(자유·평등) -> 2세대(사회권) -> 3세대(연대권) 순서입니다.",
        answer: "MATCHED",
      },
      {
        id: "s1_d5",
        type: "MATCH",
        question: "현대 사회에서 확장된 인권과 관련 제도를 바르게 짝지으시오.",
        pairs: [
          { left: "주거권", right: "최저 주거 기준" },
          { left: "안전권", right: "안전 신문고 제도" },
          { left: "환경권", right: "환경 분쟁 조정 제도" },
        ],
        hint1: "쾌적한 삶은 환경, 안정적 주거는 최저 기준과 연결됩니다.",
        hint2: "위험 예방은 안전신문고, 주거 지표는 최저 주거 기준입니다.",
        answer: "MATCHED",
      },
    ],
    extraSets: {
      setA: [
        {
          id: "s1_a1",
          type: "OX",
          question: "18세 미만 청소년이 아르바이트를 할 때 근로계약은 법정대리인(부모)이 대리하여 체결해야 한다.",
          answer: "X",
          hint1: "청소년이라도 노동의 주체로서 스스로 계약을 맺어야 합니다.",
          hint2: "부모님은 동의서만 작성하고 서명은 본인이 직접 합니다.",
        },
        {
          id: "s1_a2",
          type: "CHOICE",
          question: "공권력의 행사 또는 불행사로 기본권을 침해당한 국민이 헌법재판소에 직접 구제를 요청하는 심판은?",
          options: ["위헌 법률 심판", "헌법 소원 심판", "탄핵 심판", "정당 해산 심판"],
          answer: "헌법 소원 심판",
          hint1: "법원이 아닌 개인이 직접 헌법재판소에 청구합니다.",
          hint2: "헌법 〇〇 심판",
        },
        {
          id: "s1_a3",
          type: "INITIAL",
          question: "국회가 행정부를 견제하기 위해 매년 정기적으로 국정 전반을 감사하는 권한은?",
          answer: "국정 감사권",
          initial: "ㄱㅈ ㄱㅅㄱ",
          hint1: "국회가 국정 운영 실태를 파악하기 위해 감사를 진행합니다.",
          hint2: "국정 〇〇권",
        },
        {
          id: "s1_a4",
          type: "MATCH",
          question: "국가 기관 간의 견제 수단을 바르게 연결하시오.",
          pairs: [
            { left: "정부 -> 국회", right: "법률안 거부권" },
            { left: "국회 -> 정부", right: "국정 감사권" },
            { left: "법원 -> 정부", right: "명령·규칙 심사권" },
          ],
          hint1: "대통령의 이의 제기는 법률안 거부권, 법원의 심사는 명령규칙 심사권입니다.",
          hint2: "정부 견제는 국정감사권입니다.",
          answer: "MATCHED",
        },
        {
          id: "s1_a5",
          type: "INITIAL",
          question: "남녀 임금 격차 등 여성이 겪는 보이지 않는 차별을 수치화한 지수는?",
          answer: "유리 천장 지수",
          initial: "ㅇㄹ ㅊㅈ ㅈㅅ",
          hint1: "영국 이코노미스트가 발표하는 지수입니다.",
          hint2: "깨지지 않는 투명한 장벽을 의미합니다.",
        },
      ],
      setB: [
        {
          id: "s1_b1",
          type: "OX",
          question: "인권은 인종, 성별, 종교에 상관없이 모든 인간에게 평등하게 보장되는 보편성을 갖는다.",
          answer: "O",
          hint1: "인권은 특정 계층만의 권리가 아닙니다.",
          hint2: "누구나 예외 없이 적용되는 성질입니다.",
        },
        {
          id: "s1_b2",
          type: "CHOICE",
          question: "근로기준법상 18세 미만 청소년 근로자의 1일/1주일 법정 근로시간 한도는?",
          options: [
            "1일 7시간, 1주일 35시간",
            "1일 8시간, 1주일 40시간",
            "1일 6시간, 1주일 30시간",
            "1일 5시간, 1주일 25시간",
          ],
          answer: "1일 7시간, 1주일 35시간",
          hint1: "성인 법정 근로시간(일 8h, 주 40h)보다 짧습니다.",
          hint2: "하루 최대 7시간입니다.",
        },
        {
          id: "s1_b3",
          type: "INITIAL",
          question: "부당한 법이나 정책을 바로잡기 위해 의도적·비폭력적으로 법을 위반하는 행위는?",
          answer: "시민 불복종",
          initial: "ㅅㅁ ㅂㅂㅈ",
          hint1: "롤스와 싱어가 강조한 최후의 저항 수단입니다.",
          hint2: "시민 〇〇〇",
        },
        {
          id: "s1_b4",
          type: "MATCH",
          question: "역사적 인권 문서와 주요 핵심 내용을 바르게 연결하시오.",
          pairs: [
            { left: "영국 권리 장전", right: "의회 중심의 입헌주의 확립" },
            { left: "독일 바이마르 헌법", right: "최초의 사회권 명시" },
            { left: "세계 인권 선언", right: "국제적 인권 기준 제시" },
          ],
          hint1: "1919년 독일 헌법은 사회권, 1948년 UN은 인권 기준입니다.",
          hint2: "권리장전은 의회 과세 승인권을 다룹니다.",
          answer: "MATCHED",
        },
        {
          id: "s1_b5",
          type: "INITIAL",
          question: "자신과 관련된 인터넷 정보의 삭제를 요구할 수 있는 현대 인권은?",
          answer: "잊힐 권리",
          initial: "ㅇㅎ ㄱㄹ",
          hint1: "정보 자기 결정권 및 사생활 보호와 관련된 권리입니다.",
          hint2: "잊〇 〇리",
        },
      ],
    },
  },
  skill2: [
    {
      id: "s2_1",
      material:
        "헌법 제37조 제2항: 국민의 모든 자유와 권리는 국가안전보장, 질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
      guide:
        "국가가 기본권을 제한할 때 따라야 하는 '형식적 근거'와 아무리 급해도 넘지 말아야 할 '마지노선(한계)'을 조항에서 찾아 1문장으로 적는 문제입니다.",
      question:
        "기본권을 제한할 때 따라야 하는 형식적 근거와 침해할 수 없는 한계를 1문장으로 서술하시오.",
      keywords: ["법률", "본질적인 내용"],
      blankPrompt:
        "기본권은 반드시 (ㅂㄹ)에 근거하여 제한해야 하며, 어떠한 경우에도 (ㅂㅈㅈ ㄴㅇ)을/를 침해할 수 없다.",
      modelAnswer:
        "기본권은 반드시 국회가 제정한 법률에 근거하여 제한해야 하며, 어떠한 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    },
    {
      id: "s2_2",
      material:
        "국회는 법률을 제정하고(입법권), 정부는 법률을 집행하며(행정권), 법원은 법을 적용하여 재판한다(사법권). 대통령은 국회에 법률안 거부권을 행사할 수 있고, 법원은 위헌 법률 심판 제청권을 통해 국회를 견제한다.",
      guide:
        "국가 권력을 셋으로 나누고 상호 견제 장치를 마련한 궁극적인 목적이 '누구의 무엇을 지키기 위한 것인지' 작성하는 문제입니다.",
      question:
        "국가 기관 간에 견제와 균형 장치를 두는 궁극적인 목적을 1문장으로 서술하시오.",
      keywords: ["남용", "기본권"],
      blankPrompt:
        "국가 권력의 (ㄴㅇ)을 방지하여 국민의 (ㄱㅂㄱ)과 자유를 보장하기 위함이다.",
      modelAnswer:
        "국가 권력의 남용을 방지하여 국민의 기본권과 자유를 보장하기 위함이다.",
    },
    {
      id: "s2_3",
      material:
        "세계 자유 지수는 정치적 자유를, 세계 기아 지수는 영양 결핍 상태를 측정한다. 두 지수가 모두 심각한 위험 단계로 나타나는 국가들은 대부분 내전, 장기 독재, 사회 인프라 붕괴를 겪고 있다.",
      guide:
        "자유도 없고 굶주림이 심한 국가들의 공통적인 '정치적·경제적 배경'을 찾아 1문장으로 엮는 문제입니다.",
      question:
        "인권 지수가 취약한 국가들이 공통적으로 겪고 있는 사회적 배경을 1문장으로 서술하시오.",
      keywords: ["내전", "빈곤"],
      blankPrompt:
        "지속적인 (ㄴㅈ)과 분쟁, 극심한 (ㅂㄱ), 정치적 억압으로 인해 인권 보장의 기반이 취약하다.",
      modelAnswer:
        "지속적인 내전과 분쟁, 극심한 빈곤, 정치적 억압으로 인해 인권 보장의 기반이 취약하다.",
    },
  ],
  skill3: [
    {
      id: "s3_1",
      topic: "교내 휴대전화 일괄 수거 학칙 찬반 쟁점",
      caseDescription: "수업 집중권(학습권) 보장을 위해 일괄 수거하자는 입장 vs 학생의 행복추구권 및 통신의 자유를 침해한다는 입장이 대립합니다.",
      stances: [
        { id: "A", name: "자유권/사생활 보호 입장", desc: "통신의 자유와 일반적 행동자유권 보장 강조" },
        { id: "B", name: "공동체 학습권/공익 입장", desc: "면학 분위기 조성과 교육권·학습권 보호 강조" }
      ],
      questionPrompt: "선택한 관점의 핵심 헌법 조문과 원리를 바탕으로 찬성 또는 반대 주장을 1문장으로 서술하시오.",
      hintTemplate: "본인은 [관점]에 따라, [기본권 명칭]을 보장/조율하기 위해 [핵심 대안]이 필요하다고 판단한다."
    }
  ],
  skill4: [
    {
      id: "s4_1",
      title: "청소년 노동인권 침해(최저임금 미지급 및 계약서 미작성) 사례",
      caseDescription: "편의점에서 근무한 고등학생이 근로계약서를 작성하지 않고 수습이라는 이유로 최저임금에 미달하는 임금을 받았습니다.",
      relevantLaws: ["근로기준법 제17조(근로조건 명시)", "최저임금법 제6조"],
      questionPrompt: "이 문제의 원인을 분석하고(개인적 차원 vs 법·구조적 차원), 실효성 있는 법·제도적 대안을 포함하여 2~3문장으로 서술하시오.",
      hintTemplate: "[원인] 사업주의 법 인식 부족 및 [구조적 원인]으로 인해 발생하며, [대안]으로 근로기준법상 [근로계약서 의무화 및 불시 점검 강화]가 요구된다."
    }
  ],
  skill5: [
    {
      id: "s5_1",
      title: "디지털 잊힐 권리(Right to be forgotten) 헌법적 보장 방안",
      contextData: "미성년 시절 무분별하게 업로드된 개인정보 및 영상으로 인해 성인이 된 후에도 진학 및 취업에서 지속적인 불이익과 인격권 침해를 겪고 있는 사례가 급증하고 있습니다.",
      prompt: "[현황/문제 -> 구조적 원인 -> 헌법/가치 기반 실천 방안]의 3단 구조를 갖추어 서술하시오.",
      structureGuide: "1. 헌법 제10조 인격권 및 제17조 사생활 침해 현황 ➔ 2. 인터넷 정보의 영구 저장성과 검색 종속성 ➔ 3. 잊힐 권리 법제화 및 검색 배제 청구권 도입",
      modelAnswer: "현재 디지털 공간의 영구적 정보 보존으로 인해 미성년 시절의 사생활이 무차별 노출되어 헌법 제10조 인격권과 제17조 사생활의 비밀이 심각하게 침해되고 있다. 이는 플랫폼 기업의 데이터 독점과 법적 삭제 청구권 부재라는 구조적 원인에 기인한다. 따라서 헌법적 가치에 기반하여 미성년자 대상 '잊힐 권리'를 법제화하고 공익과 조화되는 검색 배제 청구권을 신설해야 한다."
    }
  ]
};
