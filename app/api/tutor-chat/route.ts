import { NextResponse } from "next/server";

// 1단원 5단계 스킬별 정밀 교과서 지식 및 채점 루브릭 마스터베이스
const SKILL_PROBLEM_RUBRICS: Record<string, {
  title: string;
  problemText: string;
  passageText: string;
  modelAnswer: string;
  requiredKeywords: string[];
  detailedExplanation: string;
}> = {
  STEP_2: {
    title: "STEP 2. 자료 해석 (헌법 제37조 제2항)",
    problemText: "위 [헌법 제37조 제2항] 자료를 근거로, 기본권을 제한할 때 반드시 지켜야 할 '형식적 요건'과 '실질적 한계'를 1문장으로 서술하세요.",
    passageText: "[헌법 제37조 제2항] 국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    modelAnswer: "기본권을 제한할 때는 반드시 국회가 제정한 법률에 근거해야 하며, 어떠한 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    requiredKeywords: ["법률", "제한", "본질적", "침해"],
    detailedExplanation: "헌법 제37조 제2항은 국가 권력이 국민의 자유와 권리를 함부로 빼앗지 못하도록 만든 '안전장치'란다. 국가안전보장이나 공공복리처럼 중요한 공익이 있을 때만 기본권을 제한할 수 있는데, 이때 반드시 국민의 대표 기관인 '국회'가 만든 [법률]에 근거해야 한다는 형식적 원칙(법률유보의 원칙)이 있어. 그리고 법률로 제한하더라도 그 권리가 아예 사라져 버리거나 쓸모없어지는 [본질적인 내용]까지 침해해서는 결코 안 된다는 실질적 한계가 존재한단다."
  },
  STEP_3: {
    title: "STEP 3. 관점 평가 (휴대전화 수거 쟁점)",
    problemText: "선택한 관점(자유권/사생활 보호 vs 공동체 학습권)에서 자신의 주장을 헌법적 가치를 근거로 1문장으로 제시하세요.",
    passageText: "[교내 휴대전화 일괄 수거 쟁점] A관점: 헌법 제10조 행복추구권, 제18조 통신의 자유, 비례의 원칙. B관점: 수업권 및 학습권 보장, 교내 면학 분위기 조성.",
    modelAnswer: "본인은 학생의 행복추구권과 통신의 자유를 존중하기 위해 일괄 수거 학칙 대신 쉬는 시간 자율 보관제를 지지한다.",
    requiredKeywords: ["행복추구권", "통신의 자유", "학습권", "자율", "비례원칙"],
    detailedExplanation: "학교에서 휴대전화를 걷는 문제는 두 가지 헌법적 기본권이 정면으로 부딪치는 대표적인 딜레마란다. 학생 입장에서는 헌법 제10조의 행복추구권과 헌법 제18조의 통신의 자유, 사생활의 비밀과 자유를 침해받는다고 느낄 수 있어. 반면 교사와 학교 공동체 입장에서는 수업에 집중할 권리(학습권)와 면학 분위기를 지키는 공익이 중요하지. 따라서 현대 사회에서는 일방적인 강제 수거 대신, 쉬는 시간에는 자율적으로 쓰되 수업 시간에는 스스로 보관하는 '자율적 학칙 협약'을 만드는 것이 비례원칙에 부합하는 해결책이란다."
  },
  STEP_4: {
    title: "STEP 4. 원인 분석 및 법·제도 대안",
    problemText: "청소년 배달 노동 인권 침해의 구조적 원인을 분석하고, 근로기준법에 기반한 실효성 있는 법·제도적 해결 방안을 서술하세요.",
    passageText: "[청소년 배달 노동 실태] 서면 근로계약서 미작성, 불시 근로감독 부족, 배달 대행 플랫폼의 위험 외주화 및 안전 교육 부재.",
    modelAnswer: "청소년 노동인권 침해는 행정 감독 미비라는 구조적 원인에서 기인하므로, 근로기준법상 서면계약 체결을 의무화하고 불시 점검을 강화해야 한다.",
    requiredKeywords: ["구조적", "근로기준법", "근로계약서", "감독", "제도"],
    detailedExplanation: "청소년이 아르바이트나 배달을 하다가 사고를 당하거나 부당 대우를 받을 때, '청소년이 조심하지 않아서'라는 개인의 탓으로만 돌리면 문제가 영원히 해결되지 않아. 사업주가 근로계약서를 쓰지 않거나, 플랫폼 기업이 안전 장비 없이 무리한 배달을 시키고, 국가의 노동청이 이를 제대로 단속하지 않는 [법·제도적 구조 원인]을 정확히 파악해야 해. 따라서 근로기준법을 엄격히 적용해 표준계약서 작성을 의무화하고 불시 단속을 늘려야 한단다."
  },
  STEP_5: {
    title: "STEP 5. 실천 설계 (3단 논증)",
    problemText: "[현황 ➔ 구조적 원인 ➔ 헌법 기반 실천 방안]의 3단 논증 구조를 갖추어 디지털 잊힐 권리 보장 방안을 서술하세요.",
    passageText: "[디지털 잊힐 권리] 1단계 현황: 과거 게시물의 영구 저장과 유포로 인한 인격권 침해. 2단계 구조 원인: 플랫폼 기업의 상업적 데이터 독점 및 검색 알고리즘. 3단계 실천 대안: 헌법 제10조 인격권에 기반한 잊힐 권리 법제화 및 검색 배제 청구권 도입.",
    modelAnswer: "디지털 정보의 영구 저장으로 헌법 제10조 인격권이 침해되는 원인은 플랫폼 기업의 데이터 독점에 있으므로, 잊힐 권리를 법제화하여 검색 배제 청구권을 보장해야 한다.",
    requiredKeywords: ["인격권", "구조적", "플랫폼", "잊힐 권리", "법제화"],
    detailedExplanation: "인터넷에 한 번 올라간 글이나 사진은 영원히 지워지지 않고 퍼져서 개인의 삶을 파괴하곤 해. 이것은 헌법 제10조가 보장하는 '인간으로서의 존엄과 가치 및 인격권'에 대한 심각한 침해야. 원인은 플랫폼 기업들이 트래픽과 광고 수익을 위해 데이터를 지우지 않고 검색되도록 알고리즘을 짜기 때문이지. 따라서 개인이 원할 때 과거의 흔적을 지우거나 검색되지 않게 요구할 수 있는 '잊힐 권리(검색 배제 청구권)'를 법률로 만드는 실천 대안이 꼭 필요하단다."
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, contextInfo, history = [] } = body;

    const userMessage = (message || "").trim();
    const activeSkillTitle = contextInfo?.activeSkillTitle || "STEP 2. 자료 해석";
    const studentInput = (contextInfo?.currentStudentInput || "").trim();

    // 1. 현재 문제 루브릭 매핑
    let rubricKey = "STEP_2";
    if (activeSkillTitle.includes("STEP 3") || activeSkillTitle.includes("관점")) rubricKey = "STEP_3";
    else if (activeSkillTitle.includes("STEP 4") || activeSkillTitle.includes("원인")) rubricKey = "STEP_4";
    else if (activeSkillTitle.includes("STEP 5") || activeSkillTitle.includes("실천")) rubricKey = "STEP_5";

    const currentRubric = SKILL_PROBLEM_RUBRICS[rubricKey] || SKILL_PROBLEM_RUBRICS.STEP_2;

    // 2. 학생의 작성 답안 수준 분석 (Level 1, Level 2, Level 3)
    const combinedText = `${studentInput} ${userMessage}`;
    const matchedCount = currentRubric.requiredKeywords.filter((kw) => combinedText.includes(kw)).length;

    let studentLevel: "LEVEL_1_BASIC" | "LEVEL_2_DEVELOPING" | "LEVEL_3_ADVANCED" = "LEVEL_1_BASIC";
    let levelName = "기초 탐구 단계 (뼈대 세우기)";

    if (matchedCount >= 3 || (studentInput.length >= 30 && matchedCount >= 2)) {
      studentLevel = "LEVEL_3_ADVANCED";
      levelName = "심화 완성 단계 (80% 마스터 도전)";
    } else if (matchedCount >= 1 || studentInput.length >= 12) {
      studentLevel = "LEVEL_2_DEVELOPING";
      levelName = "발전 도약 단계 (핵심 개념 보완)";
    }

    // 3. 이전 대화 기록(history) 문자열화
    const historyText = history.length > 0
      ? history.slice(-6).map((h: any) => `${h.role === "user" ? "[학생]" : "[AI 튜터 ZERO]"}: ${h.text}`).join("\n")
      : "(이전 대화 없음)";

    // 4. Gemini API 호출 시도
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const fullPrompt = `당신은 고등학교 통합사회 1단원(인권 보장과 헌법)의 다정하고 지적인 1:1 보조교사 AI 튜터 'ZERO'입니다.
학생과 실시간 대화를 나누고 있습니다. 학생의 질문, 감정, 요청을 정확히 이해하고 대화의 맥락(Context)에 맞추어 매우 친절하고 풍부하게 답변해 주세요.

[현재 학생이 풀고 있는 문제 정보]:
- 단계: ${currentRubric.title}
- 문제 발문: ${currentRubric.problemText}
- 교과서 자료/지문: ${currentRubric.passageText}
- 모범 답안: ${currentRubric.modelAnswer}
- 핵심 개념어: ${currentRubric.requiredKeywords.join(", ")}
- 교과서 심층 배경: ${currentRubric.detailedExplanation}

[학생의 현재 탐구 상태]:
- 학생이 답안창에 쓴 글: "${studentInput || "(아직 미작성)"}"
- AI 진단 수준: ${studentLevel} (${levelName})

[이전 대화 기록]:
${historyText}

[학생의 최신 메시지]: "${userMessage}"

[튜터링 행동 지침]:
1. 학생의 질문이나 말에 100% 맥락을 맞춰서 대화하세요!
   - 학생이 "왜 이렇게 간단히 응답하니?", "자세히 알려줘"라고 하면: 사과하며 다정하게 교과서의 깊이 있는 원리와 배경을 3~5문장 이상으로 상세하게 설명하세요.
   - 학생이 "이 문제 핵심 개념 알려줘"라고 하면: 헌법 조항의 취지와 핵심 키워드를 친절하게 풀어서 설명하세요.
   - 학생이 "어떻게 써?", "문장 다듬어줘"라고 하면: 학생 수준에 맞는 생각의 뼈대와 문장 구조를 짚어주세요.
2. 기계적이거나 똑같은 고정 문장을 절대로 반복하지 마세요. 학생의 말투에 공감하고 상호작용하세요.
3. 'scaffoldingGuide'에는 학생이 현재 수준에서 다음 80% 모범 답안으로 도약하기 위한 구체적인 유도 질문 1문장을 작성하세요.
4. 'suggestedSentence'에는 학생이 답안창에 [자동완성]으로 적용할 수 있는 완성도 높은 추천 문장을 작성하세요.
5. 'quickFollowUps'에는 학생이 바로 누를 수 있는 2~3개의 후속 질문 버튼을 제공하세요.

반드시 아래 JSON 포맷으로만 응답하세요:
{
  "studentLevel": "${studentLevel}",
  "levelDiagnosis": "${levelName}",
  "reply": "학생의 말에 정확히 맞춘 상세하고 다정한 튜터 설명 (최소 2~4문장 이상)",
  "scaffoldingGuide": "정답을 향한 수준별 1단계 비계 유도 질문",
  "suggestedSentence": "답안창에 자동완성할 수준 맞춤형 추천 완성 문장",
  "quickFollowUps": ["후속 질문1", "후속 질문2"]
}`;

        const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
        for (const model of models) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
              })
            });

            if (res.ok) {
              const data = await res.json();
              const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (jsonText) {
                const parsed = JSON.parse(jsonText);
                if (parsed.reply && parsed.reply.length > 5) {
                  return NextResponse.json({
                    studentLevel: parsed.studentLevel || studentLevel,
                    levelDiagnosis: parsed.levelDiagnosis || levelName,
                    reply: parsed.reply,
                    scaffoldingGuide: parsed.scaffoldingGuide || "조문 속 형식적 요건과 실질적 한계를 연결해 볼까?",
                    suggestedSentence: parsed.suggestedSentence || currentRubric.modelAnswer,
                    quickFollowUps: Array.isArray(parsed.quickFollowUps) && parsed.quickFollowUps.length > 0
                      ? parsed.quickFollowUps
                      : ["✍️ 이 문장 내 답안에 적용하기", "💡 80% 달성을 위해 뭘 더 써야 해?"]
                  });
                }
              }
            }
          } catch (mErr) {
            console.warn(`Gemini model ${model} error:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini call fallback:", geminiErr);
      }
    }

    // 5. 로컬 맥락 인식 지능형 룰베이스 엔진 (Gemini 불가 시)
    return getContextualLocalReply(userMessage, currentRubric, studentLevel, levelName, studentInput);
  } catch (err: any) {
    return NextResponse.json({
      studentLevel: "LEVEL_2_DEVELOPING",
      levelDiagnosis: "발전 도약 단계",
      reply: "좋은 질문이야! 헌법 제37조 제2항에 따르면 국민의 기본권은 국가안전보장과 공공복리를 위해 법률로써 제한할 수 있으나, 어떠한 경우에도 자유와 권리의 본질적인 내용은 침해할 수 없단다.",
      scaffoldingGuide: "형식적 요건(법률유보)과 실질적 한계(본질적 내용 침해 금지)를 1문장으로 연결해 볼까?",
      suggestedSentence: "기본권을 제한할 때는 반드시 국회가 제정한 법률에 근거해야 하며, 어떠한 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
      quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "📖 자세히 더 설명해줘"]
    });
  }
}

/**
 * 대화 의도 및 맥락을 파악하는 풍부한 로컬 튜터 엔진
 */
function getContextualLocalReply(userMsg: string, rubric: any, studentLevel: string, levelName: string, studentInput: string) {
  const msg = userMsg.toLowerCase();

  // 1. 학생의 불만/피드백 ("왜 이렇게 간단히", "자세히", "더 길게", "불친절")
  if (msg.includes("간단") || msg.includes("자세") || msg.includes("길게") || msg.includes("왜 이") || msg.includes("불친절") || msg.includes("설명해")) {
    return NextResponse.json({
      studentLevel,
      levelDiagnosis: levelName,
      reply: `앗, 내가 너무 요약해서 설명했구나! 미안해. 지금 풀고 있는 **${rubric.title}**에 대해 아주 자세하게 풀어서 설명해 줄게!\n\n${rubric.detailedExplanation}\n\n이 배경을 이해하고 나면 답안을 훨씬 설득력 있게 쓸 수 있단다!`,
      scaffoldingGuide: `위 설명에서 [${rubric.requiredKeywords.slice(0, 2).join(", ")}] 개념을 골라 1문장으로 뼈대를 세워볼까?`,
      suggestedSentence: rubric.modelAnswer,
      quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "💡 80% 달성을 위해 뭘 더 써야 해?"]
    });
  }

  // 2. 개념 질문 ("개념 알려줘", "무슨 뜻이야?", "핵심이 뭐야?")
  if (msg.includes("개념") || msg.includes("핵심") || msg.includes("알려줘") || msg.includes("무엇") || msg.includes("조문")) {
    return NextResponse.json({
      studentLevel,
      levelDiagnosis: levelName,
      reply: `지금 문제의 핵심은 **${rubric.requiredKeywords.join(", ")}**이란다!\n${rubric.detailedExplanation}`,
      scaffoldingGuide: `이 문제에서 요구하는 필수 개념어 [${rubric.requiredKeywords.slice(0, 2).join(", ")}]를 활용하여 문장을 구성해 볼까?`,
      suggestedSentence: rubric.modelAnswer,
      quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "📖 반대 관점도 알려줘"]
    });
  }

  // 3. 작성법/첨삭/다듬기 질문 ("어떻게 써?", "다듬어줘", "제한해야?")
  if (msg.includes("어떻게") || msg.includes("써") || msg.includes("작성") || msg.includes("다듬") || msg.includes("맞아") || msg.includes("제한")) {
    return NextResponse.json({
      studentLevel,
      levelDiagnosis: levelName,
      reply: `아주 좋은 생각이야! 학생이 지금 쓴 생각에 교과서 전문 용어([${rubric.requiredKeywords.join(", ")}])를 1~2개만 더 보강하면 80% 이상 모범 답안에 완벽히 도달할 수 있어. 아래 추천 문장을 바탕으로 답안을 다듬어 볼까?`,
      scaffoldingGuide: `[${rubric.requiredKeywords[0]}]와/과 [${rubric.requiredKeywords[1] || rubric.requiredKeywords[0]}]를 인과관계(~하므로, ~해야 한다)로 연결해 보자!`,
      suggestedSentence: rubric.modelAnswer,
      quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "💡 다른 표현 방식도 있어?"]
    });
  }

  // 4. 일반 대화/되묻기 ("응?", "도와줘", "막막해")
  return NextResponse.json({
    studentLevel,
    levelDiagnosis: levelName,
    reply: `현재 **${rubric.title}** 과제를 해결하는 중이구나! ${studentInput ? `지금 작성 중인 "${studentInput}" 문장을 바탕으로` : "아직 답안을 작성하기 전이라면"} 헌법 조문의 핵심 취지를 담아 문장을 시작해 볼 수 있단다. 어떤 부분이 가장 궁금하니?`,
    scaffoldingGuide: `발문: "${rubric.problemText}"에 맞추어 첫 문장의 주어와 서술어를 잡아볼까?`,
    suggestedSentence: rubric.modelAnswer,
    quickFollowUps: ["📖 이 문제 핵심 개념 알려줘", "✍️ 내 문장 다듬어줘", "🎯 80% 달성 힌트 줘"]
  });
}
