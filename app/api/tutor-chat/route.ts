import { NextResponse } from "next/server";

// 1단원 5단계 스킬별 정밀 교과서 지식 및 채점 루브릭 마스터베이스
const SKILL_PROBLEM_RUBRICS: Record<string, {
  title: string;
  problemText: string;
  passageText: string;
  modelAnswer: string;
  requiredKeywords: string[];
  level1Scaffold: { hint: string; sentence: string };
  level2Scaffold: { hint: string; sentence: string };
  level3Scaffold: { hint: string; sentence: string };
}> = {
  STEP_2: {
    title: "STEP 2. 자료 해석 (헌법 제37조 제2항 분석)",
    problemText: "위 [헌법 제37조 제2항] 자료를 근거로, 기본권을 제한할 때 반드시 지켜야 할 '형식적 요건'과 '실질적 한계'를 1문장으로 서술하세요.",
    passageText: "[헌법 제37조 제2항] 국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    modelAnswer: "기본권을 제한할 때는 반드시 국회가 제정한 법률에 근거해야 하며, 어떠한 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    requiredKeywords: ["법률", "제한", "본질적", "침해"],
    level1Scaffold: {
      hint: "기본권을 제한할 때 필요한 두 가지(국회가 만든 [ ㅂ ㄹ ]에 근거할 것, 그리고 가장 중요한 [ ㅂ ㅈ ㅈ ] 내용을 침해하지 말 것)를 떠올려 볼까?",
      sentence: "기본권은 반드시 [법률]에 근거하여 제한해야 하며, [본질적인 내용]을 침해할 수 없다."
    },
    level2Scaffold: {
      hint: "'법률로 제한한다'는 형식적 요건을 아주 잘 짚었어! 그렇다면 아무리 법률이라도 절대 침해해서는 안 되는 '실질적 한계(ㅂㅈㅈ ㄴㅇ)'는 무엇일까?",
      sentence: "기본권은 국가안전보장과 공공복리를 위해 법률로써 제한할 수 있으나, 자유와 권리의 본질적인 내용을 침해할 수 없다."
    },
    level3Scaffold: {
      hint: "필수 개념인 법률유보와 본질적 내용 침해 금지가 완벽히 들어갔어! 이제 자연스러운 접속사로 연결해 완결된 1문장으로 다듬어보자.",
      sentence: "국민의 기본권은 공공복리를 위해 법률로써 제한할 수 있으나, 자유와 권리의 본질적인 내용을 침해할 수 없다."
    }
  },
  STEP_3: {
    title: "STEP 3. 관점 평가 (휴대전화 수거 쟁점)",
    problemText: "선택한 관점(자유권/사생활 보호 vs 공동체 학습권)에서 자신의 주장을 헌법적 가치를 근거로 1문장으로 제시하세요.",
    passageText: "[교내 휴대전화 일괄 수거 쟁점] A관점: 헌법 제10조 행복추구권, 제18조 통신의 자유, 비례의 원칙. B관점: 수업권 및 학습권 보장, 교내 면학 분위기 조성.",
    modelAnswer: "본인은 학생의 행복추구권과 통신의 자유를 존중하기 위해 일괄 수거 학칙 대신 쉬는 시간 자율 보관제를 지지한다.",
    requiredKeywords: ["행복추구권", "통신의 자유", "학습권", "자율", "비례원칙"],
    level1Scaffold: {
      hint: "자유권 입장이라면 '통신의 자유'나 '행복추구권'을, 학습권 입장이라면 '면학 분위기'나 '수업권' 중 어떤 가치를 지지하는지 먼저 정해볼까?",
      sentence: "본인은 학생의 [통신의 자유]를 보장하기 위해 자율적인 휴대전화 보관 협약을 지지한다."
    },
    level2Scaffold: {
      hint: "자신의 입장을 잘 선택했어! 여기에 단순 찬반을 넘어 '헌법 제18조 통신의 자유'나 '비례의 원칙에 따른 자율 협약' 같은 구체적 대안을 보강해 볼까?",
      sentence: "본인은 학생의 행복추구권과 통신의 자유를 존중하기 위해 일괄 수거 학칙 대신 쉬는 시간 자율 보관제를 지지한다."
    },
    level3Scaffold: {
      hint: "헌법적 가치와 대안이 훌륭하게 연결되었어! 문장을 더욱 명확하고 설득력 있는 단일 문장으로 확정해 보자.",
      sentence: "본인은 학생의 통신의 자유와 자율성을 존중하면서도 학습권을 조화롭게 실현하는 자율 보관 규정을 지지한다."
    }
  },
  STEP_4: {
    title: "STEP 4. 원인 분석 및 법·제도 대안",
    problemText: "청소년 배달 노동 인권 침해의 구조적 원인을 분석하고, 근로기준법에 기반한 실효성 있는 법·제도적 해결 방안을 서술하세요.",
    passageText: "[청소년 배달 노동 실태] 서면 근로계약서 미작성, 불시 근로감독 부족, 배달 대행 플랫폼의 위험 외주화 및 안전 교육 부재.",
    modelAnswer: "청소년 노동인권 침해는 행정 감독 미비라는 구조적 원인에서 기인하므로, 근로기준법상 서면계약 체결을 의무화하고 불시 점검을 강화해야 한다.",
    requiredKeywords: ["구조적", "근로기준법", "근로계약서", "감독", "제도"],
    level1Scaffold: {
      hint: "개인의 부주의 문제보다 '계약서를 안 써주는 사업주'와 '정부의 단속 부족'이라는 [구조적 원인]에 주목해 볼까?",
      sentence: "청소년 노동 침해는 [근로감독 미비]라는 구조적 원인 때문이므로, [근로계약서 작성 의무화]가 필요하다."
    },
    level2Scaffold: {
      hint: "구조적 원인을 아주 정확히 짚었어! 이제 '근로기준법' 조항에 근거한 구체적 대안(표준근로계약서, 불시 근로감독)을 덧붙여 볼까?",
      sentence: "청소년 노동인권 침해는 행정 감독 미비라는 구조적 원인에서 기인하므로, 근로기준법상 서면계약 체결을 의무화하고 불시 점검을 강화해야 한다."
    },
    level3Scaffold: {
      hint: "원인과 근로기준법 대안의 논리적 연결이 탁월해! 인과관계('~에서 기인하므로, ~해야 한다')를 매끄럽게 정제해 보자.",
      sentence: "청소년 노동인권 침해는 제도적 감독 미비에서 비롯되므로, 근로기준법 준수 의무화와 상시적 근로감독 체계를 구축해야 한다."
    }
  },
  STEP_5: {
    title: "STEP 5. 실천 설계 (3단 논증)",
    problemText: "[현황 ➔ 구조적 원인 ➔ 헌법 기반 실천 방안]의 3단 논증 구조를 갖추어 디지털 잊힐 권리 보장 방안을 서술하세요.",
    passageText: "[디지털 잊힐 권리] 1단계 현황: 과거 게시물의 영구 저장과 유포로 인한 인격권 침해. 2단계 구조 원인: 플랫폼 기업의 상업적 데이터 독점 및 검색 알고리즘. 3단계 실천 대안: 헌법 제10조 인격권에 기반한 잊힐 권리 법제화 및 검색 배제 청구권 도입.",
    modelAnswer: "디지털 정보의 영구 저장으로 헌법 제10조 인격권이 침해되는 원인은 플랫폼 기업의 데이터 독점에 있으므로, 잊힐 권리를 법제화하여 검색 배제 청구권을 보장해야 한다.",
    requiredKeywords: ["인격권", "구조적", "플랫폼", "잊힐 권리", "법제화"],
    level1Scaffold: {
      hint: "3단 구조([1. 헌법 제10조 인격권 침해 현황] ➔ [2. 플랫폼 기업의 데이터 독점 원인] ➔ [3. 잊힐 권리 법제화])의 뼈대부터 하나씩 세워볼까?",
      sentence: "1. 헌법 제10조 인격권 침해 현황 ➔ 2. 플랫폼 독점 구조 원인 ➔ 3. 잊힐 권리 법제화 대안으로 구성한다."
    },
    level2Scaffold: {
      hint: "3단 구조의 틀을 잘 잡았어! 이제 각 단계마다 '헌법 제10조 인격권'과 '검색 배제 청구권' 같은 교과 전문 용어를 연결해 볼까?",
      sentence: "디지털 정보 영구 저장으로 인한 인격권 침해는 플랫폼의 정보 독점에서 기인하므로, 잊힐 권리를 법제화하여 기본권을 보장해야 한다."
    },
    level3Scaffold: {
      hint: "3단계 인과관계와 헌법 개념어가 완벽히 갖추어졌어! 80% 이상 마스터를 위해 한 편의 완성된 논증 문장으로 다듬어보자.",
      sentence: "디지털 정보의 영구 저장으로 헌법 제10조 인격권이 침해되는 원인은 플랫폼 기업의 데이터 독점에 있으므로, 잊힐 권리를 법제화하여 검색 배제 청구권을 보장해야 한다."
    }
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, contextInfo, history = [] } = body;

    const userMessage = (message || "").trim();
    const activeSkillTitle = contextInfo?.activeSkillTitle || "STEP 2. 자료 해석";
    const studentInput = (contextInfo?.currentStudentInput || "").trim();

    // 1. 현재 문제의 루브릭 매핑
    let rubricKey = "STEP_2";
    if (activeSkillTitle.includes("STEP 3") || activeSkillTitle.includes("관점")) rubricKey = "STEP_3";
    else if (activeSkillTitle.includes("STEP 4") || activeSkillTitle.includes("원인")) rubricKey = "STEP_4";
    else if (activeSkillTitle.includes("STEP 5") || activeSkillTitle.includes("실천")) rubricKey = "STEP_5";

    const currentRubric = SKILL_PROBLEM_RUBRICS[rubricKey] || SKILL_PROBLEM_RUBRICS.STEP_2;

    // 2. 학생의 작성 답안 및 질문 기반 정밀 수준 분석 (Level 1, Level 2, Level 3)
    const combinedText = `${studentInput} ${userMessage}`;
    const matchedCount = currentRubric.requiredKeywords.filter((kw) => combinedText.includes(kw)).length;

    let studentLevel: "LEVEL_1_BASIC" | "LEVEL_2_DEVELOPING" | "LEVEL_3_ADVANCED" = "LEVEL_1_BASIC";
    let levelName = "기초 탐구 단계 (뼈대 세우기)";
    let scaffoldData = currentRubric.level1Scaffold;

    if (matchedCount >= 3 || (studentInput.length >= 30 && matchedCount >= 2)) {
      studentLevel = "LEVEL_3_ADVANCED";
      levelName = "심화 완성 단계 (80% 마스터 도전)";
      scaffoldData = currentRubric.level3Scaffold;
    } else if (matchedCount >= 1 || studentInput.length >= 12) {
      studentLevel = "LEVEL_2_DEVELOPING";
      levelName = "발전 도약 단계 (핵심 개념 보완)";
      scaffoldData = currentRubric.level2Scaffold;
    }

    // 3. Gemini 2.5를 통한 맞춤형 비계설정 프롬프트
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const systemInstruction = `당신은 고등학교 통합사회 1단원(인권 보장과 헌법)의 전문 교육 멘토 AI 보조교사 'ZERO'입니다.
학생의 질문과 현재 작성 중인 답안의 수준을 정확히 진단하고, 교육학적 비계설정(Scaffolding) 기법을 통해 학생이 모범 답안(80% 이상 일치도)에 도달할 수 있도록 단계별로 유도합니다.

[현재 문제 정보]:
- 단계: ${currentRubric.title}
- 문제 발문: ${currentRubric.problemText}
- 교과서 지문/자료: ${currentRubric.passageText}
- 모범 답안: ${currentRubric.modelAnswer}
- 필수 핵심 개념어: ${currentRubric.requiredKeywords.join(", ")}

[학생의 상태 분석 결과]:
- 학생이 작성 중인 답안: "${studentInput || "(아직 작성하지 않음)"}"
- 학생의 질문/요청: "${userMessage}"
- AI 진단 수준: ${studentLevel} (${levelName})
- 일치된 핵심어 수: ${matchedCount}개 / ${currentRubric.requiredKeywords.length}개

[비계설정(Scaffolding) 코칭 지침]:
1. 학생의 현재 수준(${levelName})을 인정하고 격려하면서, 정답을 그대로 떠먹여 주지 않고 생각의 다리를 놓아주는 친절한 발문(Scaffolding Question)을 제공하세요.
2. 학생이 Level 1이면 기초 문장 뼈대와 초성 힌트 위주로 안내하고, Level 2이면 빠진 핵심 개념어 1개를 채우도록 유도하며, Level 3이면 완결된 문장 정제를 지도하세요.
3. 'suggestedSentence'에는 학생이 답안창에 [자동완성]으로 적용해 바로 활용할 수 있는 완성도 높은 추천 문장을 작성하세요.
4. 다정하고 학업적 효능감을 높여주는 고등학교 선생님 말투('~단다', '~해 볼까?', '~하면 완벽해!')를 사용하세요.

반드시 아래 JSON 포맷으로만 응답하세요:
{
  "studentLevel": "${studentLevel}",
  "levelDiagnosis": "${levelName}",
  "reply": "학생의 현재 수준을 진단하고 다음 단계로 도약하도록 이끄는 친절하고 구체적인 비계설정 코칭 설명",
  "scaffoldingGuide": "현재 수준에서 정답을 향해 채워야 할 구체적인 1단계 힌트 질문",
  "suggestedSentence": "학생이 답안창에 자동완성으로 적용할 수 있는 수준 맞춤형 추천 완성 문장",
  "quickFollowUps": ["다음에 누를 만한 맞춤형 질문1", "맞춤형 질문2"]
}`;

        const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
        for (const model of models) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemInstruction }] }],
                generationConfig: { responseMimeType: "application/json" }
              })
            });

            if (res.ok) {
              const data = await res.json();
              const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (jsonText) {
                const parsed = JSON.parse(jsonText);
                return NextResponse.json({
                  studentLevel: parsed.studentLevel || studentLevel,
                  levelDiagnosis: parsed.levelDiagnosis || levelName,
                  reply: parsed.reply,
                  scaffoldingGuide: parsed.scaffoldingGuide || scaffoldData.hint,
                  suggestedSentence: parsed.suggestedSentence || scaffoldData.sentence,
                  quickFollowUps: Array.isArray(parsed.quickFollowUps) && parsed.quickFollowUps.length > 0
                    ? parsed.quickFollowUps
                    : ["✍️ 이 문장 내 답안에 적용하기", "💡 80% 달성을 위해 뭘 더 써야 해?"]
                });
              }
            }
          } catch (mErr) {
            console.warn(`Gemini tutor-chat model error:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API fallback to local scaffolding engine:", geminiErr);
      }
    }

    // 로컬 고도화 비계설정 엔진
    let localReply = "";
    if (studentLevel === "LEVEL_1_BASIC") {
      localReply = `안녕! 지금 풀고 있는 **${currentRubric.title}**에서는 [${currentRubric.requiredKeywords.slice(0, 2).join(", ")}] 개념을 문장의 중심에 세우는 것이 첫걸음이란다! 아래 비계설정 힌트와 추천 문장 뼈대를 확인해 볼까?`;
    } else if (studentLevel === "LEVEL_2_DEVELOPING") {
      localReply = `아주 좋아! 답안의 기본 방향을 훌륭하게 잡았구나. 여기에 아직 빠진 핵심 개념인 **[${currentRubric.requiredKeywords.filter((k) => !combinedText.includes(k)).join(", ") || "본질적 내용 침해 금지"}]**를 덧붙이면 80% 이상 마스터 점수를 얻을 수 있어!`;
    } else {
      localReply = `완벽에 가까운 훌륭한 탐구 서술이야! 필수 교과 개념어들이 잘 갖추어졌단다. 이제 접속사와 문장 끝맺음을 매끄럽게 다듬어 최종 확정해 보자!`;
    }

    return NextResponse.json({
      studentLevel,
      levelDiagnosis: levelName,
      reply: localReply,
      scaffoldingGuide: scaffoldData.hint,
      suggestedSentence: scaffoldData.sentence,
      quickFollowUps: [
        "✍️ 이 문장 내 답안에 적용하기",
        "💡 80% 달성을 위해 뭘 더 써야 해?",
        "📖 다른 관점 논거도 알려줘"
      ]
    });
  } catch (err: any) {
    return NextResponse.json({
      studentLevel: "LEVEL_1_BASIC",
      levelDiagnosis: "기초 탐구 단계",
      reply: "기본권을 제한할 때는 반드시 법률에 근거해야 하며 본질적 내용을 침해할 수 없단다.",
      scaffoldingGuide: "헌법 제37조 제2항의 두 가지 요건을 확인해 보자.",
      suggestedSentence: "기본권은 법률로써 제한할 수 있으나 본질적인 내용을 침해할 수 없다.",
      quickFollowUps: ["✍️ 내 답안에 적용하기"]
    });
  }
}
