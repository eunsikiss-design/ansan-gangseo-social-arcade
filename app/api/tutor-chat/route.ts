import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 고등학교 1학년 통합사회 1단원(인권 보장과 헌법) 문항 및 모범 채점 루브릭 마스터
const UNIT1_RUBRICS: Record<string, {
  title: string;
  problemText: string;
  passageText: string;
  modelAnswer: string;
  requiredConcepts: string[];
}> = {
  STEP_2: {
    title: "STEP 2. 자료 해석 (헌법 제37조 제2항 분석)",
    problemText: "위 [헌법 제37조 제2항] 자료를 근거로, 기본권을 제한할 때 반드시 지켜야 할 '형식적 요건'과 '실질적 한계'를 1문장으로 서술하세요.",
    passageText: "[헌법 제37조 제2항] 국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    modelAnswer: "기본권을 제한할 때는 반드시 국회가 제정한 법률에 근거해야 하며, 어떠한 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    requiredConcepts: ["국회가 제정한 법률(법률유보)", "목적의 정당성(국가안전보장·질서유지·공공복리)", "본질적인 내용 침해 금지(실질적 한계)"],
  },
  STEP_3: {
    title: "STEP 3. 관점 평가 (휴대전화 수거 쟁점)",
    problemText: "선택한 관점(자유권/사생활 보호 vs 공동체 학습권)에서 자신의 주장을 헌법적 가치를 근거로 1문장으로 제시하세요.",
    passageText: "[교내 휴대전화 일괄 수거 쟁점] A관점: 헌법 제10조 행복추구권, 제18조 통신의 자유, 비례의 원칙. B관점: 수업권 및 학습권 보장, 교내 면학 분위기 조성.",
    modelAnswer: "본인은 학생의 행복추구권과 통신의 자유를 존중하기 위해 일괄 수거 학칙 대신 쉬는 시간 자율 보관제를 지지한다.",
    requiredConcepts: ["헌법상 기본권(통신의 자유, 행복추구권 또는 학습권)", "비례의 원칙", "자율적 협약/규범"],
  },
  STEP_4: {
    title: "STEP 4. 원인 분석 및 법·제도 대안",
    problemText: "청소년 배달 노동 인권 침해의 구조적 원인을 분석하고, 근로기준법에 기반한 실효성 있는 법·제도적 해결 방안을 서술하세요.",
    passageText: "[청소년 배달 노동 실태] 서면 근로계약서 미작성, 불시 근로감독 부족, 배달 대행 플랫폼의 위험 외주화 및 안전 교육 부재.",
    modelAnswer: "청소년 노동인권 침해는 행정 감독 미비라는 구조적 원인에서 기인하므로, 근로기준법상 서면계약 체결을 의무화하고 불시 점검을 강화해야 한다.",
    requiredConcepts: ["개인 부주의가 아닌 구조적 원인(관리감독 미비, 플랫폼 위험 외주화)", "근로기준법상 표준근로계약서 작성 의무화", "상시 근로감독 강화"],
  },
  STEP_5: {
    title: "STEP 5. 실천 설계 (3단 논증)",
    problemText: "[현황 ➔ 구조적 원인 ➔ 헌법 기반 실천 방안]의 3단 논증 구조를 갖추어 디지털 잊힐 권리 보장 방안을 서술하세요.",
    passageText: "[디지털 잊힐 권리] 1단계 현황: 과거 게시물의 영구 저장과 유포로 인한 인격권 침해. 2단계 구조 원인: 플랫폼 기업의 상업적 데이터 독점 및 검색 알고리즘. 3단계 실천 대안: 헌법 제10조 인격권에 기반한 잊힐 권리 법제화 및 검색 배제 청구권 도입.",
    modelAnswer: "디지털 정보의 영구 저장으로 헌법 제10조 인격권이 침해되는 원인은 플랫폼 기업의 데이터 독점에 있으므로, 잊힐 권리를 법제화하여 검색 배제 청구권을 보장해야 한다.",
    requiredConcepts: ["1단계 현황: 헌법 제10조 인격권 침해", "2단계 원인: 플랫폼 기업의 데이터 독점", "3단계 대안: 잊힐 권리 법제화 및 검색 배제 청구권"],
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, contextInfo, history = [], actionType } = body || {};

    const userMessage = (message || "").trim();
    const activeSkillTitle = contextInfo?.activeSkillTitle || "STEP 2. 자료 해석";
    const currentStudentInput = (contextInfo?.currentStudentInput || "").trim();

    // 루브릭 매핑
    let rubricKey = "STEP_2";
    if (activeSkillTitle.includes("STEP 3") || activeSkillTitle.includes("관점")) rubricKey = "STEP_3";
    else if (activeSkillTitle.includes("STEP 4") || activeSkillTitle.includes("원인")) rubricKey = "STEP_4";
    else if (activeSkillTitle.includes("STEP 5") || activeSkillTitle.includes("실천")) rubricKey = "STEP_5";

    const rubric = UNIT1_RUBRICS[rubricKey] || UNIT1_RUBRICS.STEP_2;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply: `지금 **${rubric.title}**에서는 [${rubric.requiredConcepts[0]}] 개념을 중심으로 문장을 세우는 것이 중요하단다. 어떤 점이 가장 궁금하니?`,
        suggestedSentence: rubric.modelAnswer,
      });
    }

    // 시스템 프롬프트: 유연하고 지적이며 자연스러운 페르소나
    const systemInstruction = `당신은 고등학교 1학년 통합사회 1단원(인권 보장과 헌법)의 1:1 보조교사 AI 튜터 'ZERO'입니다.
학생과 진짜 사람처럼 유쾌하고 깊이 있게 티키타카 대화를 나눕니다.

[대화 원칙]:
1. 학생의 질문과 맥락에 맞추어 생생하고 구체적인 실생활 예시를 들어 알기 쉽게 설명하세요.
2. 이미 대화가 진행 중일 때 정형화된 인사말이나 문제 소개("반가워요", "두 가지만 찾아보자")를 절대로 되풀이하지 마세요.
3. 학생이 쓴 문장이 있으면 칭찬과 함께 핵심 개념어를 다듬어주세요.
4. 필요할 경우 답변 맨 마지막에 학생이 답안창에 복사/적용할 수 있는 1문장을 아래 형식으로 제안해 주세요:
   [추천 문장]: 여기에 완성도 높은 모범 문장 작성
5. '80%' 같은 기계적인 수치는 직접 말하지 마세요.`;

    // 멀티턴 대화 히스토리 구성
    const contentsList: any[] = [];

    // 유효한 히스토리 추가
    let lastRole: string | null = null;
    for (const h of history.slice(-8)) {
      if (h.text && typeof h.text === "string" && h.text.trim()) {
        const role = h.role === "user" ? "user" : "model";
        if (contentsList.length === 0 && role === "model") {
          contentsList.push({ role: "user", parts: [{ text: `[탐구 과제: ${rubric.title}]\n선생님, 안녕하세요!` }] });
        }
        if (role !== lastRole) {
          contentsList.push({ role, parts: [{ text: h.text.trim() }] });
          lastRole = role;
        }
      }
    }

    // 최신 학생 질문 구성
    let latestUserText = userMessage;
    if (actionType === "HINT") {
      latestUserText = `[과제: ${rubric.title}]\n선생님, 이 문제를 어떻게 시작해야 할지 막막해요. 생각의 물꼬를 터줄 수 있는 핵심 힌트 질문을 주세요.`;
    } else if (actionType === "SCAFFOLD") {
      latestUserText = `[과제: ${rubric.title}]\n선생님, 이 문제의 문장 구조 뼈대와 초성 힌트를 알려주세요.`;
    } else if (actionType === "EVALUATE") {
      latestUserText = `[과제: ${rubric.title}]\n선생님, 제가 작성 중인 답안("${currentStudentInput}")을 모범 답안("${rubric.modelAnswer}")에 맞추어 정밀 첨삭해 주시고, 더 완성도 높은 문장으로 다듬어 주세요.`;
    } else if (contentsList.length === 0) {
      latestUserText = `[현재 풀고 있는 과제: ${rubric.title} / 문제: ${rubric.problemText} / 모범 답안: ${rubric.modelAnswer}]\n${userMessage || "선생님, 도움이 필요해요!"}`;
    }

    if (!latestUserText) {
      latestUserText = "선생님, 문제 해결에 도움이 필요해요!";
    }

    if (contentsList.length > 0 && lastRole === "user") {
      contentsList.pop();
    }
    contentsList.push({ role: "user", parts: [{ text: latestUserText }] });

    const models = ["gemini-flash-latest", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-pro-latest"];
    for (const model of models) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: contentsList,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const fullReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (fullReply && fullReply.trim().length > 0) {
            let replyText = fullReply;
            let suggested = "";

            const match = fullReply.match(/\[추천\s*(?:완성\s*)?문장\]\s*:\s*([^\n\r]+)/i);
            if (match && match[1]) {
              suggested = match[1].replace(/["']/g, "").trim();
              replyText = fullReply.replace(/\[추천\s*(?:완성\s*)?문장\]\s*:\s*[^\n\r]+/i, "").trim();
            }

            return NextResponse.json({
              reply: replyText,
              suggestedSentence: suggested,
              rubricTitle: rubric.title,
            });
          }
        }
      } catch (mErr) {
        console.warn(`Gemini model ${model} failed in tutor:`, mErr);
      }
    }

    return NextResponse.json({
      reply: `네 질문("${userMessage}")에 대해 이어서 이야기해 보자면, **${rubric.title}**에서는 [${rubric.requiredConcepts[0]}] 개념을 명확히 명시하는 것이 가장 중요하단다. 지금 생각나는 단어를 한 번 써볼까?`,
      suggestedSentence: rubric.modelAnswer,
      rubricTitle: rubric.title,
    });
  } catch (err: any) {
    return NextResponse.json({
      reply: "좋은 질문이야! 헌법 조문과 교과서 핵심 개념을 바탕으로 차근차근 생각을 정리해 나가보자.",
      suggestedSentence: "기본권은 국가안전보장과 공공복리를 위해 법률로써 제한할 수 있으나, 본질적인 내용을 침해할 수 없다.",
    });
  }
}
