"use client";

import { useState } from "react";
import {
  ArrowRight,
  ChartBar,
  BookOpen,
  Buildings,
  ChartLineUp,
  ClipboardText,
  Compass,
  GlobeHemisphereEast,
  GraduationCap,
  Handshake,
  House,
  LockKey,
  Medal,
  ShieldCheck,
  Boat,
  Plant,
  Star,
  Target,
  Trophy,
  UsersThree,
  CheckCircle,
  XCircle,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";

type Unit = {
  id: number;
  title: string;
  shortTitle: string;
  image: string;
  color: string;
  progress: number;
  levels: string[];
};

type Question = {
  kind?: "choice" | "ox" | "short" | "completion" | "matching" | "combination" | "essay";
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
  source?: string;
  sourceLabel?: string;
  hints?: string[];
  competency?: "개념 이해" | "자료 해석" | "분석·추론" | "문제 해결" | "논증·표현";
  accepted?: string[];
  matchOptions?: string[];
  expectedMatches?: number[];
  correctAnswers?: number[];
  rubricTerms?: string[][];
  minLength?: number;
};

type ActiveGame = { unit: Unit; level: number };

const units: Unit[] = [
  { id: 1, title: "인권 보장과 헌법", shortTitle: "인권 보장과\n헌법", image: "/assets/unit-1-rights.jpg", color: "#2e855f", progress: 82, levels: ["핵심 개념 탐색", "헌법 자료 해독", "인권 판례 챌린지", "기본권 수호대", "시민 참여 캠페인", "보스: 인권 해결 프로젝트"] },
  { id: 2, title: "사회 정의와 불평등", shortTitle: "사회 정의와\n불평등", image: "/assets/unit-2-justice.jpg", color: "#b4612f", progress: 68, levels: ["정의의 기준 찾기", "불평등 데이터 수사", "공정 도시 설계"] },
  { id: 3, title: "시장경제와 지속가능발전", shortTitle: "시장경제와\n지속가능발전", image: "/assets/unit-3-economy.jpg", color: "#23877f", progress: 51, levels: ["시장 원리 매칭", "합리적 소비 챌린지", "지속가능 기업 경영"] },
  { id: 4, title: "세계화와 평화", shortTitle: "세계화와\n평화", image: "/assets/unit-4-global.jpg", color: "#24729f", progress: 37, levels: ["세계 무역 루트", "갈등 해결 회의", "평화 협정 만들기"] },
  { id: 5, title: "미래와 지속가능한 삶", shortTitle: "미래와\n지속가능한 삶", image: "/assets/unit-5-future.jpg", color: "#65458a", progress: 24, levels: ["인구 변화 예측", "에너지 전환 작전", "SDGs 미래 도시"] },
];

const themes = [
  { title: "국내외\n인권 문제", Icon: UsersThree, color: "#4f8b5c" },
  { title: "사회·공간\n불평등", Icon: Buildings, color: "#a5632c" },
  { title: "현대 세계\n무역", Icon: Boat, color: "#318b88" },
  { title: "세계화의\n문제점", Icon: GlobeHemisphereEast, color: "#347da5" },
  { title: "국제사회\n갈등과 협력", Icon: Handshake, color: "#694d91" },
];

const questions: Record<number, Question[]> = {
  1: [
    { prompt: "국가 권력의 간섭을 받지 않고 자유롭게 생활할 권리는?", choices: ["자유권", "사회권", "청구권"], answer: 0, explanation: "자유권은 국가 권력의 부당한 간섭을 배제하도록 요구하는 권리입니다." },
    { prompt: "기본권 침해 여부를 최종적으로 심판하는 기관은?", choices: ["국회", "헌법재판소", "국무회의"], answer: 1, explanation: "헌법재판소는 헌법소원심판 등을 통해 기본권 침해를 구제합니다." },
    { prompt: "기본권 제한이 지켜야 할 원칙으로 가장 적절한 것은?", choices: ["과잉 금지", "다수결 우선", "행정 편의"], answer: 0, explanation: "기본권 제한은 목적과 수단이 적절하고 침해가 최소여야 합니다." },
  ],
  2: [
    { prompt: "능력과 성과에 따라 보상하는 분배 기준은?", choices: ["업적", "필요", "절대적 평등"], answer: 0, explanation: "업적에 따른 분배는 개인이 달성한 성과나 기여를 기준으로 합니다." },
    { prompt: "사회적 약자에게 더 많은 지원을 제공하는 이유는?", choices: ["실질적 평등", "형식적 자유", "시장 확대"], answer: 0, explanation: "출발 조건의 차이를 보완해 실질적인 기회와 결과의 평등을 추구합니다." },
    { prompt: "공정한 절차의 핵심 조건은?", choices: ["결과의 완전 동일", "일관된 기준과 참여 기회", "빠른 결정"], answer: 1, explanation: "공개되고 일관된 기준, 의견을 낼 기회가 절차적 정의의 핵심입니다." },
  ],
  3: [
    { prompt: "가격이 오를 때 일반적으로 나타나는 변화는?", choices: ["수요량 증가", "수요량 감소", "공급량 감소"], answer: 1, explanation: "다른 조건이 같다면 가격 상승은 수요량을 감소시킵니다." },
    { prompt: "소비 결정에서 기회비용이란?", choices: ["포기한 대안 중 가장 큰 가치", "상품의 표시 가격", "미래의 모든 비용"], answer: 0, explanation: "한 선택 때문에 포기한 대안 가운데 가장 가치 있는 것이 기회비용입니다." },
    { prompt: "지속가능한 소비의 사례는?", choices: ["일회용품 늘리기", "지역·친환경 제품 선택", "필요 이상 구매"], answer: 1, explanation: "환경과 공동체에 미치는 영향을 고려하는 소비가 지속가능한 소비입니다." },
  ],
  4: [
    { prompt: "국가 간 상품과 서비스 교환이 늘어나는 현상은?", choices: ["지역화", "세계화", "고립화"], answer: 1, explanation: "세계화로 국가 간 경제·문화·정보의 교류와 상호 의존이 커집니다." },
    { prompt: "국제 갈등을 평화적으로 해결하는 방법은?", choices: ["무력 사용 우선", "협상과 국제기구 활용", "교류 전면 중단"], answer: 1, explanation: "대화와 협상, 국제기구의 조정은 대표적인 평화적 해결 방식입니다." },
    { prompt: "공정 무역이 지향하는 가치는?", choices: ["생산자의 정당한 보상", "최저 가격만 추구", "유통 독점"], answer: 0, explanation: "공정 무역은 생산자의 노동과 삶이 정당하게 보상받도록 합니다." },
  ],
  5: [
    { prompt: "현재 세대와 미래 세대의 필요를 함께 고려하는 발전은?", choices: ["압축 성장", "지속가능발전", "무제한 개발"], answer: 1, explanation: "지속가능발전은 환경·사회·경제의 균형과 세대 간 형평성을 추구합니다." },
    { prompt: "탄소 배출을 줄이는 에너지 전환의 예는?", choices: ["석탄 발전 확대", "재생 에너지 확대", "에너지 낭비 증가"], answer: 1, explanation: "태양광·풍력 같은 재생 에너지 확대는 탄소 배출 감축에 기여합니다." },
    { prompt: "저출생·고령화에 대응하는 태도로 적절한 것은?", choices: ["세대 간 부담 전가", "돌봄과 고용 제도의 개선", "노년층 배제"], answer: 1, explanation: "돌봄, 고용, 사회보장 제도를 함께 개선하는 통합적 접근이 필요합니다." },
  ],
};

const unitOneQuestionSets: Question[][] = [
  [
    { kind: "ox", prompt: "자유권은 국가의 부당한 간섭을 받지 않고 자유롭게 생활할 권리이다.", choices: ["O", "X"], answer: 0, explanation: "자유권은 국가 권력의 간섭이나 침해를 배제하는 방어적 권리입니다.", hints: ["국가가 무엇을 해 달라는 권리보다 간섭하지 말라는 권리입니다.", "신체·거주·직업 선택의 자유를 떠올려 보세요.", "이 진술은 옳습니다."], competency: "개념 이해" },
    { kind: "short", prompt: "국가에 인간다운 생활의 보장을 요구하는 기본권을 한 단어로 쓰세요.", choices: [], answer: 0, accepted: ["사회권"], explanation: "사회권은 교육, 노동, 인간다운 생활처럼 국가의 적극적 역할을 요구하는 권리입니다.", hints: ["산업 혁명 이후 사회적 약자의 요구로 강조되었습니다.", "바이마르 헌법에 처음 규정된 권리입니다.", "정답의 첫 글자는 ‘사’입니다."], competency: "개념 이해" },
    { kind: "completion", prompt: "문장을 완성하세요: 침해된 기본권의 구제를 국가 기관에 요구하는 권리는 (          )이다.", choices: [], answer: 0, accepted: ["청구권"], explanation: "청구권에는 재판 청구권, 국가 배상 청구권 등이 포함됩니다.", hints: ["권리를 침해당한 뒤 구제를 요청하는 성격입니다.", "재판을 받을 권리가 대표 사례입니다.", "정답의 첫 글자는 ‘청’입니다."], competency: "개념 이해" },
  ],
  [
    { sourceLabel: "헌법 제37조 제2항 요약", source: "국민의 자유와 권리는 국가 안전 보장·질서 유지·공공복리를 위해 필요한 경우에만 법률로 제한할 수 있으며, 본질적인 내용은 침해할 수 없다.", prompt: "자료에서 확인할 수 없는 기본권 제한 요건은?", choices: ["법률에 근거할 것", "본질적 내용을 침해하지 않을 것", "행정 기관이 편리하다고 판단할 것"], answer: 2, explanation: "행정 편의는 헌법이 정한 기본권 제한 목적이나 요건이 아닙니다.", hints: ["자료에 직접 제시된 표현을 확인하세요.", "국가 안전·질서·공공복리와 법률이 핵심입니다.", "세 번째 선택지는 자료에 없습니다."], competency: "자료 해석" },
    { kind: "matching", sourceLabel: "권력 분립 자료", source: "국가 기관의 기능을 서로 연결해 권력이 한곳에 집중되지 않는 구조를 확인해 보세요.", prompt: "각 기관과 핵심 기능을 바르게 연결하세요.", choices: ["국회", "정부", "법원", "헌법재판소"], answer: 0, matchOptions: ["법률 제정", "법률 집행", "재판", "위헌 여부 심판"], expectedMatches: [0, 1, 2, 3], explanation: "국회-입법, 정부-행정, 법원-사법, 헌법재판소-위헌 심판의 연결을 통해 권력 분립과 견제가 이루어집니다.", hints: ["입법·행정·사법의 기능을 먼저 떠올리세요.", "헌법재판소는 법률이 헌법에 맞는지 판단합니다.", "위에서부터 1-2-3-4 순서입니다."], competency: "자료 해석" },
    { kind: "short", sourceLabel: "기본권 구제 경로", source: "공권력의 행사 또는 불행사 때문에 기본권을 침해받은 시민이 헌법재판소에 구제를 요청하려 한다.", prompt: "이 권리 구제 제도의 이름을 쓰세요.", choices: [], answer: 0, accepted: ["헌법소원", "헌법소원심판", "헌법 소원 심판"], explanation: "공권력에 의한 기본권 침해를 헌법적으로 구제받기 위해 헌법소원심판을 청구할 수 있습니다.", hints: ["일반 정책 선호를 묻는 절차가 아닙니다.", "헌법재판소의 기본권 구제 절차입니다.", "‘헌법○○심판’입니다."], competency: "자료 해석" },
  ],
  [
    { kind: "combination", sourceLabel: "사건 카드 A", source: "학교가 학생의 동의 없이 개인 상담 기록 전체를 공개 게시판에 올렸다.", prompt: "사례에서 타당한 판단을 모두 고르세요.", choices: ["ㄱ. 사생활의 비밀과 자유가 관련된다", "ㄴ. 공개 범위가 필요 이상으로 넓다", "ㄷ. 참정권 침해가 핵심이다"], answer: 0, correctAnswers: [0, 1], explanation: "민감한 상담 기록의 무단 공개는 사생활의 비밀과 자유를 침해하며, 공개 범위도 필요 이상으로 넓습니다.", hints: ["권리와 판단 근거를 각각 찾아보세요.", "선거 참여와 관련된 사건은 아닙니다.", "ㄱ과 ㄴ을 선택하세요."], competency: "분석·추론" },
    { sourceLabel: "사건 카드 B", source: "평화로운 집회를 전면 금지하면서 구체적인 위험이나 대체 장소를 제시하지 않았다.", prompt: "헌법적 판단으로 가장 타당한 것은?", choices: ["질서 유지를 말했으므로 언제나 정당하다", "표현·집회의 자유를 과도하게 제한했는지 살펴야 한다", "집회는 기본권과 관계없다"], answer: 1, explanation: "기본권 제한은 목적뿐 아니라 필요성, 최소 침해, 본질적 내용 보장도 함께 따져야 합니다.", hints: ["전면 금지와 구체적 위험 부재를 비교하세요.", "과잉 금지 원칙을 적용해 보세요.", "두 번째 선택지입니다."], competency: "분석·추론" },
    { sourceLabel: "사건 카드 C", source: "공공시설이 휠체어 이용자의 출입을 막는 계단만 설치하고 합리적인 개선 요구도 거부했다.", prompt: "이 사례의 핵심 쟁점은?", choices: ["정당한 구별", "평등권과 접근권 침해", "재산권만의 문제"], answer: 1, explanation: "합리적 편의 제공을 거부해 장애인의 동등한 이용 기회를 막는 것은 차별과 접근권 문제입니다.", hints: ["누구에게 이용 장벽이 생겼는지 살펴보세요.", "같은 대우가 실질적으로 같은 기회를 보장하는지 생각하세요.", "두 번째 선택지입니다."], competency: "분석·추론" },
  ],
  [
    { kind: "combination", sourceLabel: "학교 인권 예산 100", source: "상담 기록 보호 시스템 40 / 장애인 경사로 45 / 인권 교육 20 / 홍보 조형물 35. 필요한 사업을 배합하되 예산을 넘을 수 없다.", prompt: "예산 안에서 직접적인 권리 개선 효과가 있는 사업을 모두 고르세요.", choices: ["ㄱ. 상담 기록 보호 시스템", "ㄴ. 장애인 경사로", "ㄷ. 인권 교육", "ㄹ. 홍보 조형물"], answer: 0, correctAnswers: [0, 1], explanation: "보호 시스템과 경사로는 총 85로 예산 안에서 사생활 보호와 접근권을 직접 개선합니다.", hints: ["먼저 합계가 100을 넘지 않는지 계산하세요.", "직접적인 권리 장벽을 제거하는 두 사업을 찾으세요.", "ㄱ과 ㄴ을 선택하세요."], competency: "문제 해결" },
    { sourceLabel: "정책 선택", source: "온라인 괴롭힘을 막기 위해 학교가 모든 학생의 휴대전화를 매일 무기한 검사하려 한다.", prompt: "인권과 공익의 균형을 높이는 수정안은?", choices: ["검사를 그대로 시행한다", "신고·증거가 있는 경우에 한해 절차와 기간을 정해 조사한다", "괴롭힘 문제를 무시한다"], answer: 1, explanation: "목적은 정당하지만 사생활 침해를 최소화하도록 대상·절차·기간을 제한해야 합니다.", hints: ["목적과 수단을 나누어 판단하세요.", "덜 침해적인 대안이 있는지 살펴보세요.", "두 번째 선택지입니다."], competency: "문제 해결" },
    { sourceLabel: "부작용 점검", source: "청소년 노동권 보호를 위해 야간 노동을 전면 금지했더니 생계가 필요한 청소년의 소득이 갑자기 사라졌다.", prompt: "가장 균형 잡힌 보완책은?", choices: ["금지를 즉시 철회한다", "안전 기준·시간 제한과 함께 생계 지원·상담을 제공한다", "청소년의 책임으로 돌린다"], answer: 1, explanation: "안전과 생계라는 두 권리를 함께 고려하는 보완책이 필요합니다.", hints: ["정책의 원래 목적과 새로 생긴 피해를 함께 보세요.", "한쪽 권리만 포기하지 않는 대안을 찾으세요.", "두 번째 선택지입니다."], competency: "문제 해결" },
  ],
  [
    { kind: "essay", sourceLabel: "지역 문제", source: "통학로에 횡단보도와 조명이 부족해 학생과 주민이 위험을 겪고 있다.", prompt: "이 문제를 해결할 시민 참여 방법 두 가지를 제안하고, 현장 자료가 왜 필요한지 2~3문장으로 서술하세요.", choices: [], answer: 0, rubricTerms: [["청원", "민원", "지방 의회"], ["캠페인", "서명", "시민 단체"], ["자료", "근거", "사고"]], minLength: 45, explanation: "좋은 답안은 합법적인 참여 방법 두 가지와 자료를 근거로 활용해야 하는 이유를 연결합니다. 표현은 달라도 이 세 요소가 드러나면 됩니다.", hints: ["참여 방법 두 가지와 자료의 역할을 나누어 적어 보세요.", "청원과 캠페인을 연계할 수 있습니다.", "‘현장 자료를 근거로 지자체에 청원하고 주민 캠페인을 진행한다’는 틀을 활용해 보세요."], competency: "논증·표현" },
    { sourceLabel: "캠페인 구성", source: "좋은 공익 캠페인은 문제 제시 → 근거 자료 → 핵심 주장 → 실천 방법의 흐름을 갖는다.", prompt: "가장 완성도 높은 문구는?", choices: ["모두 나쁘다. 당장 바꿔라!", "통학로 사고 위험 자료를 공개하고, 조명 설치 청원 참여 방법을 안내합니다", "우리 편만 이기면 됩니다"], answer: 1, explanation: "구체적 문제와 근거, 주장, 실천 방법을 포함하고 혐오나 편견을 사용하지 않았습니다.", hints: ["자료와 행동 제안이 모두 있는지 보세요.", "비난보다 근거와 참여 방법이 중요합니다.", "두 번째 선택지입니다."], competency: "논증·표현" },
    { sourceLabel: "표현 윤리", source: "차별 문제를 알리는 카드뉴스 초안에 특정 집단을 무능하다고 단정하는 문장이 포함되었다.", prompt: "가장 적절한 수정 원칙은?", choices: ["자극적이면 그대로 둔다", "고정관념을 삭제하고 출처 있는 피해 자료와 개선 행동을 제시한다", "집단 이름만 다른 이름으로 바꾼다"], answer: 1, explanation: "인권 캠페인 자체가 혐오나 편견을 강화하지 않도록 사실과 구체적 실천을 중심으로 구성해야 합니다.", hints: ["캠페인의 방법도 인권을 존중해야 합니다.", "사실 근거와 행동 제안을 함께 고려하세요.", "두 번째 선택지입니다."], competency: "논증·표현" },
  ],
  [
    { sourceLabel: "보스 사건 1 - 문제 정의", source: "한 지역의 청소년 노동자 40명 중 18명이 근로계약서를 받지 못했고, 12명은 약속한 임금보다 적게 받았다고 응답했다.", prompt: "자료에 근거한 탐구 문제 정의는?", choices: ["모든 사업주는 청소년을 차별한다", "이 지역 청소년 노동자의 계약·임금 권리 보장이 충분한가", "청소년은 일하면 안 된다"], answer: 1, explanation: "자료 범위를 넘겨 단정하지 않고 계약과 임금이라는 확인된 문제를 탐구 질문으로 제시했습니다.", hints: ["사실과 추론을 구분하세요.", "40명의 조사 결과로 모든 사업주를 단정할 수 없습니다.", "두 번째 선택지입니다."], competency: "자료 해석" },
    { sourceLabel: "보스 사건 2 - 원인 분석", source: "면담 결과: 계약 절차를 모르는 학생이 많았고, 소규모 사업장에는 노동법 안내가 거의 전달되지 않았다.", prompt: "표면적 원인과 구조적 원인을 함께 연결한 것은?", choices: ["학생 개인의 부주의만 문제다", "계약 지식 부족 + 사업장 안내·감독 체계 부족", "임금이 적다는 사실만 반복한다"], answer: 1, explanation: "개인 수준의 정보 부족과 제도 수준의 안내·감독 부족을 함께 분석했습니다.", hints: ["수행평가 기준은 서로 다른 두 측면의 원인을 요구합니다.", "개인과 제도 수준을 함께 보세요.", "두 번째 선택지입니다."], competency: "분석·추론" },
    { kind: "essay", sourceLabel: "보스 사건 3 - 해결 설계", source: "목표: 청소년 노동자의 계약·임금 권리를 실질적으로 보장하고, 학생이 직접 참여할 수 있어야 한다.", prompt: "자료에서 확인한 원인과 연결되는 해결 방안 두 가지를 제안하고, 기대 효과 또는 한계를 포함해 3~4문장으로 작성하세요.", choices: [], answer: 0, rubricTerms: [["계약", "임금", "노동권"], ["교육", "상담", "점검", "신고"], ["효과", "한계", "그러나", "기대"]], minLength: 70, explanation: "서술형 답안은 문제·원인과 연결된 복수의 대안, 그리고 기대 효과나 한계를 갖추어야 합니다. 특정 문장 하나만 정답으로 보지 않습니다.", hints: ["문제-원인-대안-효과/한계 순서로 써 보세요.", "학교의 계약 교육과 지역의 상담·점검을 연계할 수 있습니다.", "‘계약 교육은 정보 부족을 줄이지만, 사업장 점검이 함께 이루어져야 한다’는 틀을 활용해 보세요."], competency: "논증·표현" },
  ],
];

type SavedProgress = { bestScores: number[]; attempts: number[] };
const emptyProgress = (): SavedProgress => ({ bestScores: [0, 0, 0, 0, 0, 0], attempts: [0, 0, 0, 0, 0, 0] });
const readUnitOneProgress = () => {
  if (typeof window === "undefined") return emptyProgress();
  try { return { ...emptyProgress(), ...JSON.parse(localStorage.getItem("social-arcade-unit-1") ?? "{}") }; }
  catch { return emptyProgress(); }
};

export default function HomePage() {
  const [mode, setMode] = useState<"units" | "themes">("units");
  const [selected, setSelected] = useState<Unit | null>(null);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [missionStarted, setMissionStarted] = useState(false);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [progressVersion, setProgressVersion] = useState(0);

  const startGame = (unit: Unit, level = 0) => {
    setSelected(null);
    setMissionStarted(true);
    setActiveGame({ unit, level });
  };

  return (
    <main className="reference-shell">
      <div className="reference-stage">
        <img
          className="reference-home-image"
          src="/assets/arcade-home-reference.png"
          alt="안산강서고 1학년 통합사회 탐구 아케이드 홈 화면"
        />

        <button className="hotspot curriculum" aria-label="교과 연계" onClick={() => setSelected(units[0])} />
        <button className="hotspot statistics" aria-label="학습 통계" onClick={() => setTeacherOpen(true)} />
        <button className="hotspot unit-tab" aria-label="단원별 탐험" onClick={() => window.scrollTo({ top: 390, behavior: "smooth" })} />
        <button className="hotspot theme-tab" aria-label="공통주제 도전" onClick={() => window.scrollTo({ top: 610, behavior: "smooth" })} />
        <button className="hotspot mission" aria-label="오늘의 추천 미션 도전하기" onClick={() => startGame(units[0])} />
        <button className="hotspot continue" aria-label="공정 도시 만들기 이어하기" onClick={() => setSelected(units[1])} />

        {units.map((unit, index) => (
          <button
            key={unit.id}
            className={`hotspot unit-hotspot unit-${index + 1}`}
            aria-label={`${unit.id}단원 ${unit.title}`}
            onClick={() => setSelected(unit)}
          />
        ))}

        {themes.map((theme, index) => (
          <button
            key={theme.title}
            className={`hotspot theme-hotspot theme-${index + 1}`}
            aria-label={theme.title.replace("\n", " ")}
            onClick={() => setSelected(units[index])}
          />
        ))}

        <button className="hotspot assignment" aria-label="교사 배정 미션 확인하기" onClick={() => setSelected(units[1])} />
        <button className="hotspot nav-home" aria-label="홈" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        <button className="hotspot nav-challenge" aria-label="도전" onClick={() => window.scrollTo({ top: 390, behavior: "smooth" })} />
        <button className="hotspot nav-record" aria-label="기록" onClick={() => setTeacherOpen(true)} />
        <button className="hotspot nav-growth" aria-label="내 성장" onClick={() => setTeacherOpen(true)} />
      </div>

      {teacherOpen && <div className="reference-overlay"><TeacherPanel onClose={() => setTeacherOpen(false)} /></div>}
      {selected && <UnitModal key={`${selected.id}-${progressVersion}`} unit={selected} onClose={() => setSelected(null)} onStart={(level) => startGame(selected, level)} />}
      {activeGame && <GameModal game={activeGame} onClose={() => setActiveGame(null)} onProgress={() => setProgressVersion((value) => value + 1)} />}
      {missionStarted && <span className="sr-only" aria-live="polite">추천 미션을 시작했습니다.</span>}
    </main>
  );

  /* Legacy component implementation retained below for content reuse. */
  return (
    <main className="arcade-shell">
      <div className="arcade-stage">
        <header className="arcade-header">
          <div className="school-lockup">
            <div className="crest"><GraduationCap size={25} weight="fill" /></div>
            <span>안산강서고 1학년 통합사회 수업 자료</span>
          </div>

          <div className="title-lockup" aria-label="통합사회 탐구 아케이드 통합사회 2">
            <h1><span>통합사회 탐구</span><strong>아케이드</strong></h1>
            <div className="subtitle-rule"><i /> <span>✦</span> 통합사회 2 <span>✦</span> <i /></div>
          </div>

          <nav className="quick-tools" aria-label="빠른 메뉴">
            <button type="button" onClick={() => setTeacherOpen(false)}><BookOpen size={24} /><span>교과 연계</span></button>
            <button type="button" onClick={() => setTeacherOpen(true)}><ChartBar size={24} /><span>학습 통계</span></button>
          </nav>
        </header>

        {teacherOpen ? (
          <TeacherPanel onClose={() => setTeacherOpen(false)} />
        ) : (
          <>
            <div className="mode-tabs" role="tablist" aria-label="탐구 유형">
              <button className={mode === "units" ? "active" : ""} onClick={() => setMode("units")}><Compass size={22} />단원별 탐험</button>
              <button className={mode === "themes" ? "active" : ""} onClick={() => setMode("themes")}><GlobeHemisphereEast size={22} />공통주제 도전</button>
            </div>

            <section className="mission-board" aria-label="오늘의 추천 미션">
              <div className="mission-ribbon"><Star size={17} weight="fill" /></div>
              <img src="/assets/mission-justice.jpg" alt="교정적 정의와 권리 구제를 표현한 교과서 삽화" />
              <div className="mission-copy">
                <span className="mission-kicker">오늘의 추천 미션</span>
                <h2>기본권 침해 사례를 해결하라</h2>
                <div className="mission-tags"><span>1단원 · 인권 보장과 헌법</span><span>예상 5분</span></div>
                <button className="challenge-button" onClick={() => setMissionStarted(true)}>{missionStarted ? "미션 이어하기" : "도전하기"}<ArrowRight size={22} /></button>
              </div>
            </section>

            <section className="continue-board">
              <img src="/assets/unit-2-justice.jpg" alt="공정 도시 만들기 미션 삽화" />
              <div><span>계속하기</span><strong>공정 도시 만들기 · 68%</strong><div className="progress"><i style={{ width: "68%" }} /></div></div>
              <button onClick={() => setSelected(units[1])}>이어하기 <ArrowRight size={18} /></button>
            </section>

            {mode === "units" ? (
              <section className="explore-section">
                <SectionTitle>5개 단원</SectionTitle>
                <div className="unit-row">
                  {units.map((unit) => (
                    <button key={unit.id} className="unit-banner" style={{ "--unit": unit.color } as React.CSSProperties} onClick={() => setSelected(unit)}>
                      <span className="unit-badge">{unit.id}</span>
                      <img src={unit.image} alt="" />
                      <span className="unit-shade" />
                      <strong>{unit.shortTitle.split("\n").map((line) => <span key={line}>{line}</span>)}</strong>
                      <span className="unit-ring"><i style={{ width: `${unit.progress}%` }} /></span>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className="explore-section theme-focus">
                <SectionTitle>5개 공통주제</SectionTitle>
                <div className="theme-summary"><GlobeHemisphereEast size={34} /><div><strong>어느 주제든 자유롭게 도전</strong><span>단원 순서와 관계없이 자료 분석·의사 결정·문제 해결 미션을 선택할 수 있어요.</span></div></div>
              </section>
            )}

            <section className="theme-section">
              <SectionTitle>공통주제 자유 도전</SectionTitle>
              <div className="theme-row">
                {themes.map(({ title, Icon, color }, index) => (
                  <button key={title} className="theme-pin" style={{ "--pin": color } as React.CSSProperties} onClick={() => setSelected(units[index])}>
                    <span><Icon size={27} weight="duotone" /></span>
                    <strong>{title.split("\n").map((line) => <i key={line}>{line}</i>)}</strong>
                  </button>
                ))}
              </div>
            </section>

            <button className="assignment-card" onClick={() => setSelected(units[1])}>
              <span><ClipboardText size={28} /></span><div><small>교사 배정 미션</small><strong>이번 주: 자료를 활용한 사회문제 분석</strong></div><b>확인하기 <ArrowRight size={17} /></b>
            </button>

            <section className="player-card">
              <div className="player-level"><span><Star size={26} weight="fill" /></span><div><small>탐구자 레벨</small><strong>Lv. 23</strong><div className="progress"><i style={{ width: "68%" }} /></div><em>2,450 / 3,600 EXP</em></div></div>
              <div className="achievement"><span><Target size={34} /></span><div><small>성취수준 진단</small><strong>보통</strong><em>다음 목표: 우수</em></div></div>
              <div className="badges"><div><small>업적 달성 현황</small><strong>18 / 24</strong></div><span><ShieldCheck /><GlobeHemisphereEast /><UsersThree /><Trophy /><LockKey /></span></div>
            </section>

            <nav className="bottom-nav" aria-label="주 메뉴">
              <button className="active"><House /><span>홈</span></button>
              <button onClick={() => setMode("themes")}><Target /><span>도전</span></button>
              <button onClick={() => setTeacherOpen(true)}><ClipboardText /><span>기록</span></button>
              <button onClick={() => setTeacherOpen(true)}><Plant /><span>내 성장</span></button>
            </nav>
          </>
        )}
      </div>

      {selected && <UnitModal key={`${selected.id}-${progressVersion}`} unit={selected} onClose={() => setSelected(null)} onStart={(level) => startGame(selected, level)} />}
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="section-title"><Star size={15} weight="fill" /><h2>{children}</h2><i /></div>;
}

function UnitModal({ unit, onClose, onStart }: { unit: Unit; onClose: () => void; onStart: (level: number) => void }) {
  const [saved] = useState<SavedProgress>(() => unit.id === 1 ? readUnitOneProgress() : emptyProgress());

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={`${unit.title} 게임 선택`}>
      <button className="modal-dismiss" onClick={onClose} aria-label="닫기" />
      <section className="unit-modal" style={{ "--unit": unit.color } as React.CSSProperties}>
        <img src={unit.image} alt="" />
        <button className="close-button" onClick={onClose}>×</button>
        <span>UNIT {unit.id}</span><h2>{unit.title}</h2><p>개념 확인에서 수행평가 준비까지 단계별로 도전하세요.</p>
        <div>{unit.levels.map((level, i) => {
          const unlocked = unit.id !== 1 || i === 0 || saved.bestScores[i - 1] >= 70;
          const labels = ["개념 이해", "자료 해석", "분석과 추론", "문제 해결", "논증과 표현", "종합 수행 과제"];
          return <button key={level} onClick={() => onStart(i)} disabled={!unlocked} className={!unlocked ? "locked" : ""}><b>{unlocked ? i + 1 : <LockKey />}</b><span><strong>{level}</strong><small>{unlocked ? `${labels[i] ?? "문제 해결"}${unit.id === 1 && saved.bestScores[i] ? ` · 최고 ${saved.bestScores[i]}점` : ""}` : `이전 레벨 70점 이상 필요`}</small></span>{unlocked && <ArrowRight />}</button>;
        })}</div>
      </section>
    </div>
  );
}

function GameModal({ game, onClose, onProgress }: { game: ActiveGame; onClose: () => void; onProgress: () => void }) {
  const gameQuestions = game.unit.id === 1 ? unitOneQuestionSets[game.level] : questions[game.unit.id];
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedMany, setSelectedMany] = useState<number[]>([]);
  const [matches, setMatches] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [rubricMet, setRubricMet] = useState(0);
  const [score, setScore] = useState(0);
  const [penalty, setPenalty] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = gameQuestions[step];
  const kind = question.kind ?? "choice";
  const typeLabels = { choice: "선택형", ox: "진위형 OX", short: "단답형", completion: "완성형", matching: "연결형", combination: "배합형", essay: "서술형" };
  const finalScore = Math.max(0, Math.round((score / gameQuestions.length) * 100) - penalty);
  const expectedLevel = finalScore >= 90 ? "A" : finalScore >= 80 ? "B" : finalScore >= 70 ? "C" : finalScore >= 50 ? "D" : "E";

  const choose = (index: number) => {
    if (submitted) return;
    setChoice(index);
    const result = index === question.answer;
    setCorrect(result);
    setSubmitted(true);
    if (result) setScore((value) => value + 1); else setPenalty((value) => value + 10);
  };

  const submitResponse = () => {
    let result = false;
    if (kind === "short" || kind === "completion") {
      const normalized = textAnswer.replace(/\s+/g, "").toLowerCase();
      result = (question.accepted ?? []).some((answer) => answer.replace(/\s+/g, "").toLowerCase() === normalized);
    } else if (kind === "combination") {
      result = JSON.stringify([...selectedMany].sort()) === JSON.stringify([...(question.correctAnswers ?? [])].sort());
    } else if (kind === "matching") {
      result = matches.length === question.choices.length && matches.every((answer, index) => answer === question.expectedMatches?.[index]);
    } else if (kind === "essay") {
      const compact = textAnswer.replace(/\s+/g, " ").trim();
      const met = (question.rubricTerms ?? []).filter((group) => group.some((term) => compact.includes(term))).length;
      setRubricMet(met);
      result = compact.length >= (question.minLength ?? 30) && met >= Math.ceil((question.rubricTerms?.length ?? 1) * 2 / 3);
    }
    setCorrect(result);
    setSubmitted(true);
    if (result) setScore((value) => value + 1); else setPenalty((value) => value + 10);
  };

  const resetResponse = () => {
    setChoice(null);
    setTextAnswer("");
    setSelectedMany([]);
    setMatches([]);
    setSubmitted(false);
    setCorrect(false);
    setRubricMet(0);
  };

  const showHint = () => {
    if (!question.hints || hintLevel >= question.hints.length) return;
    const nextLevel = hintLevel + 1;
    setHintLevel(nextLevel);
    if (nextLevel === 2 || nextLevel === 3) setPenalty((value) => value + 5);
  };

  const next = () => {
    if (step === gameQuestions.length - 1) {
      if (game.unit.id === 1) {
        const saved = readUnitOneProgress();
        saved.bestScores[game.level] = Math.max(saved.bestScores[game.level] ?? 0, finalScore);
        saved.attempts[game.level] = (saved.attempts[game.level] ?? 0) + 1;
        localStorage.setItem("social-arcade-unit-1", JSON.stringify(saved));
        onProgress();
      }
      setFinished(true);
      return;
    }
    setStep((value) => value + 1);
    resetResponse();
    setHintLevel(0);
  };

  const retry = () => {
    setStep(0);
    resetResponse();
    setScore(0);
    setPenalty(0);
    setHintLevel(0);
    setFinished(false);
  };

  return (
    <div className="modal-layer game-layer" role="dialog" aria-modal="true" aria-label={`${game.unit.title} 미션`}>
      <section className="game-modal" style={{ "--unit": game.unit.color } as React.CSSProperties}>
        <header>
          <div><span>UNIT {game.unit.id} · LEVEL {game.level + 1}</span><h2>{game.unit.levels[game.level]}</h2></div>
          <button className="game-close" onClick={onClose} aria-label="미션 닫기">×</button>
        </header>

        {finished ? (
          <div className="game-result">
            <Trophy size={64} weight="duotone" />
            <span>미션 완료</span>
            <h3>{finalScore}점 · 예상 {expectedLevel} 수준</h3>
            <p>정답 {score}/{gameQuestions.length} · 감점 {penalty}점 · <strong>{finalScore} XP</strong> 획득</p>
            <div className="competency-grid"><span>개념 정확성 <b>{Math.round(finalScore * .3)}/30</b></span><span>자료 활용 <b>{Math.round(finalScore * .25)}/25</b></span><span>근거 타당성 <b>{Math.round(finalScore * .25)}/25</b></span><span>해결·표현 <b>{Math.round(finalScore * .2)}/20</b></span></div>
            <div className="result-note"><strong>{finalScore >= 70 ? "다음 레벨이 열렸어요!" : "70점 이상이면 다음 레벨이 열려요."}</strong><span>강점: {question.competency ?? "개념 이해"} · 추천: {finalScore >= 70 ? "다음 미션 도전" : "힌트를 활용해 다시 도전"}</span></div>
            <div className="result-actions"><button onClick={retry}><ArrowCounterClockwise /> 다시 도전</button><button onClick={onClose}>홈으로</button></div>
          </div>
        ) : (
          <div className="game-body">
            <div className="game-progress"><span>문제 {step + 1} / {gameQuestions.length}</span><i><b style={{ width: `${((step + 1) / gameQuestions.length) * 100}%` }} /></i><strong>{Math.max(0, Math.round((score / gameQuestions.length) * 100) - penalty)}점</strong></div>
            <p className="game-kicker">{question.competency ?? "핵심 개념 탐구"} <b>{typeLabels[kind]}</b></p>
            {question.source && <article className="source-card"><span>{question.sourceLabel ?? "탐구 자료"}</span><p>{question.source}</p></article>}
            <h3>{question.prompt}</h3>
            {(kind === "choice" || kind === "ox") && <div className={`answer-list ${kind === "ox" ? "ox-list" : ""}`}>
              {question.choices.map((answer, index) => {
                const state = !submitted ? "" : index === question.answer ? "correct" : index === choice ? "wrong" : "muted";
                return <button key={answer} className={state} onClick={() => choose(index)} disabled={submitted}><b>{kind === "ox" ? answer : index + 1}</b><span>{kind === "ox" ? answer === "O" ? "옳다" : "그르다" : answer}</span>{state === "correct" && <CheckCircle weight="fill" />}{state === "wrong" && <XCircle weight="fill" />}</button>;
              })}
            </div>}
            {(kind === "short" || kind === "completion") && <div className="written-response"><label htmlFor="short-answer">{kind === "short" ? "답" : "빈칸에 들어갈 말"}</label><input id="short-answer" value={textAnswer} onChange={(event) => setTextAnswer(event.target.value)} disabled={submitted} placeholder="정답을 입력하세요" onKeyDown={(event) => { if (event.key === "Enter" && textAnswer.trim()) submitResponse(); }} /><button onClick={submitResponse} disabled={!textAnswer.trim() || submitted}>확인</button></div>}
            {kind === "combination" && <div className="combination-list">{question.choices.map((answer, index) => <button key={answer} className={selectedMany.includes(index) ? "selected" : ""} disabled={submitted} onClick={() => setSelectedMany((values) => values.includes(index) ? values.filter((value) => value !== index) : [...values, index])}><span>{selectedMany.includes(index) ? "✓" : ""}</span>{answer}</button>)}<button className="response-submit" onClick={submitResponse} disabled={!selectedMany.length || submitted}>선택 완료</button></div>}
            {kind === "matching" && <div className="matching-list">{question.choices.map((left, index) => <label key={left}><span>{left}</span><select value={matches[index] ?? -1} disabled={submitted} onChange={(event) => setMatches((values) => { const nextValues = [...values]; nextValues[index] = Number(event.target.value); return nextValues; })}><option value={-1}>기능 선택</option>{question.matchOptions?.map((option, optionIndex) => <option key={option} value={optionIndex}>{option}</option>)}</select></label>)}<button className="response-submit" onClick={submitResponse} disabled={matches.filter((value) => value >= 0).length !== question.choices.length || submitted}>연결 완료</button></div>}
            {kind === "essay" && <div className="essay-response"><div className="rubric-preview"><strong>답안 체크 기준</strong>{question.rubricTerms?.map((terms, index) => <span key={terms.join()}>✓ 요소 {index + 1}: {terms.join(" · ")} 중 하나 포함</span>)}<span>✓ {question.minLength}자 이상</span></div><textarea value={textAnswer} onChange={(event) => setTextAnswer(event.target.value)} disabled={submitted} placeholder="자료를 근거로 자신의 생각을 작성하세요." /><div><span>{textAnswer.trim().length} / {question.minLength}자</span><button onClick={submitResponse} disabled={!textAnswer.trim() || submitted}>답안 제출</button></div></div>}
            {!submitted && question.hints && <div className="hint-box"><button onClick={showHint} disabled={hintLevel >= question.hints.length}>힌트 {Math.min(hintLevel + 1, 3)} 보기 {hintLevel === 0 ? "· 감점 없음" : hintLevel === 1 ? "· -5점" : "· -5점"}</button>{hintLevel > 0 && <p>{question.hints[hintLevel - 1]}</p>}</div>}
            {submitted && <div className={`feedback ${correct ? "correct" : "wrong"}`} role="status"><strong>{correct ? kind === "essay" ? "평가 요소를 충족했어요!" : "정답이에요!" : kind === "essay" ? `평가 요소 ${rubricMet}/${question.rubricTerms?.length ?? 0} 충족` : "답을 다시 확인해요."}</strong><p>{question.explanation}</p><button onClick={correct ? next : () => { setSubmitted(false); setChoice(null); }}>{correct ? step === gameQuestions.length - 1 ? "결과 보기" : "다음 문제" : "답안 수정"}<ArrowRight /></button></div>}
          </div>
        )}
      </section>
    </div>
  );
}

function TeacherPanel({ onClose }: { onClose: () => void }) {
  return (
    <section className="teacher-panel">
      <div className="teacher-heading"><button onClick={onClose}>← 학생 화면</button><span>교사용 학습 통계</span><h2>1학년 탐구 현황</h2><p>게임 결과를 성취수준과 수행평가 비계에 연결해 확인합니다.</p></div>
      <div className="teacher-metrics"><article><UsersThree /><span>참여 학생<strong>124 / 132명</strong></span></article><article><ChartLineUp /><span>이번 주 완료율<strong>76%</strong></span></article><article><Medal /><span>평균 성취수준<strong>B</strong></span></article><article><Target /><span>지원 필요 학생<strong>18명</strong></span></article></div>
      <article className="teacher-assignment"><div><small>이번 주 배정</small><h3>자료를 활용한 사회문제 분석</h3><p>2단원 · 불평등 자료 분석 → 주장과 근거 작성</p></div><div className="class-bars">{[["1반",84],["2반",73],["3반",69],["4반",78]].map(([name,value]) => <span key={name}><b>{name}</b><i><em style={{ width: `${value}%` }} /></i><strong>{value}%</strong></span>)}</div></article>
      <article className="scaffold"><h3>수행평가 비계</h3>{["개념 찾기","자료 읽기","근거 고르기","주장 구성","해결책 제안"].map((x,i)=><span key={x}><b>{i+1}</b>{x}</span>)}</article>
    </section>
  );
}
