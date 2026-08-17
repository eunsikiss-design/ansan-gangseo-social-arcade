import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, contextInfo, history = [] } = body;

    const userMessage = (message || "").trim();
    if (!userMessage) {
      return NextResponse.json({
        reply: "안녕! 탐구 중 궁금한 헌법 조문이나 다듬고 싶은 답안 문장을 편하게 물어봐!",
        suggestedSentence: "",
        quickFollowUps: ["📖 이 문제 핵심 개념 알려줘", "✍️ 내 문장 다듬어줘", "🎯 80% 달성 힌트 줘"],
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const fullPrompt = `당신은 고등학교 통합사회 1단원(인권 보장과 헌법)의 다정하고 지적인 1:1 보조교사 AI 튜터 'ZERO'입니다.
학생이 탐구 과제를 해결할 때 질문을 하면, 아주 친절하고 구체적으로 설명해 주며, 학생이 답안에 활용할 수 있는 완성도 높은 추천 문장을 함께 제시해 줍니다.

[학생의 현재 탐구 단계]: ${contextInfo?.activeSkillTitle || "자료 분석 및 서술 훈련"}
[현재 문제 내용]: ${contextInfo?.currentProblem || "헌법과 기본권 보장"}
[학생이 현재 쓴 답안]: "${contextInfo?.currentStudentInput || "(아직 미작성)"}"

[학생의 질문/대화]: "${userMessage}"

[답변 원칙]:
1. 말투: 고등학생을 다정하게 격려하는 선생님 말투 ("~단다", "~해보자!", "~하면 아주 훌륭한 문장이 돼!")
2. 불친절하거나 단답형으로 끝내지 말고, 질문한 교과서 개념의 배경(헌법 조문, 원리)을 2~3문장으로 알기 쉽게 풀어서 설명해 주세요.
3. 'suggestedSentence'에는 학생이 현재 문제의 답안창에 바로 자동완성으로 붙여넣어 80% 이상 점수를 받을 수 있는 훌륭한 모범 문장 1~2문장을 반드시 작성해 주세요.
4. 'quickFollowUps'에는 학생이 이어서 누르기 좋은 2~3개의 후속 질문 칩을 제공해 주세요.

반드시 아래 순수 JSON 포맷으로만 응답하세요 (마크다운 코드블록 없이):
{
  "reply": "질문에 대한 상세하고 친절한 설명과 격려 피드백",
  "suggestedSentence": "학생이 답안창에 자동완성으로 가져다 쓸 수 있는 완성도 높은 모범 문장",
  "quickFollowUps": ["후속질문1", "후속질문2"]
}`;

        const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
        for (const model of models) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: { responseMimeType: "application/json" },
              }),
            });

            if (res.ok) {
              const data = await res.json();
              const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (jsonText) {
                const parsed = JSON.parse(jsonText);
                if (parsed.reply && parsed.reply.length > 5) {
                  return NextResponse.json({
                    reply: parsed.reply,
                    suggestedSentence: parsed.suggestedSentence || "",
                    quickFollowUps: Array.isArray(parsed.quickFollowUps) && parsed.quickFollowUps.length > 0 ? parsed.quickFollowUps : ["✍️ 이 문장 내 답안에 적용하기", "📖 다른 헌법 조문도 알려줘"],
                  });
                }
              }
            }
          } catch (mErr) {
            console.warn(`Model ${model} error in tutor chat:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to rich rule tutor:", geminiErr);
      }
    }

    // 고도화된 다정다감 로컬 룰베이스 튜터 엔진
    return getRichTutorReply(userMessage, contextInfo);
  } catch (err: any) {
    return NextResponse.json({
      reply: "좋은 질문이야! 헌법 제37조 제2항에 따르면 기본권은 국가안전보장과 공공복리를 위해 법률로써 제한할 수 있지만, 결코 본질적인 내용을 침해할 수는 없단다.",
      suggestedSentence: "기본권은 반드시 국회가 제정한 법률에 근거하여 제한해야 하며, 어떠한 경우에도 본질적인 내용을 침해할 수 없다.",
      quickFollowUps: ["✍️ 내 답안에 자동완성 적용", "📖 비례원칙이 뭐야?"],
    });
  }
}

/**
 * 풍부하고 다정한 지능형 튜터 응답 생성기
 */
function getRichTutorReply(userMsg: string, ctx: any) {
  const msg = userMsg.toLowerCase();
  const currentTab = ctx?.activeSkillTitle || "";

  // 1. 핵심 개념 질문 ("개념 알려줘", "어떤 개념이야?", "뭐가 핵심이야?")
  if (msg.includes("개념") || msg.includes("핵심") || msg.includes("무엇") || msg.includes("설명") || msg.includes("알려줘")) {
    if (currentTab.includes("STEP 2") || msg.includes("자료") || msg.includes("37조") || msg.includes("법률")) {
      return NextResponse.json({
        reply: "이 문제의 핵심은 '헌법 제37조 제2항'이란다! 국가가 기본권을 제한할 때는 반드시 두 가지 원칙을 지켜야 해. 첫째는 '국회가 제정한 법률에 근거해야 한다(법률유보)'는 형식적 요건이고, 둘째는 '아무리 공공복리가 중요해도 자유와 권리의 본질적인 내용은 침해할 수 없다'는 실질적 한계란다.",
        suggestedSentence: "기본권을 제한할 때는 반드시 국회가 제정한 법률에 근거해야 하며, 어떠한 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.",
        quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "💡 80% 달성하려면 뭘 더 써야 해?"],
      });
    }

    if (currentTab.includes("STEP 3") || msg.includes("자유") || msg.includes("폰") || msg.includes("학습권") || msg.includes("관점")) {
      return NextResponse.json({
        reply: "이 쟁점의 핵심 교과 개념은 '헌법 제10조 행복추구권과 제18조 통신의 자유' vs '학습권과 교내 면학 분위기 조성'의 대립이란다! 단순히 '폰을 걷자/말자'가 아니라, '비례의 원칙'에 맞게 학생의 자율성을 존중하는 보관 규칙을 세우는 것이 핵심이란다.",
        suggestedSentence: "본인은 학생의 행복추구권과 통신의 자유를 존중하기 위해 일괄 수거 학칙 대신 쉬는 시간 자율 보관제를 지지한다.",
        quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "📖 반대 입장(학습권) 논리는 뭐야?"],
      });
    }

    if (currentTab.includes("STEP 4") || msg.includes("원인") || msg.includes("노동") || msg.includes("알바") || msg.includes("대안")) {
      return NextResponse.json({
        reply: "이 문제의 핵심은 '개인의 부주의 탓'으로 돌리지 않고 '근로기준법 준수 미흡과 감독 체계의 미비'라는 법·제도적 구조 원인을 짚어내는 것이란다! 대안으로는 '표준근로계약서 작성 의무화'와 '불시 근로감독 강화'를 제시하면 최고 점수를 받을 수 있어!",
        suggestedSentence: "청소년 노동인권 침해는 행정 감독 미비라는 구조적 원인에서 기인하므로, 근로기준법상 서면계약 체결을 의무화하고 불시 점검을 강화해야 한다.",
        quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "💡 근로기준법 주요 조항 알려줘"],
      });
    }

    if (currentTab.includes("STEP 5") || msg.includes("실천") || msg.includes("잊힐") || msg.includes("디지털")) {
      return NextResponse.json({
        reply: "이 단계의 핵심은 [1. 헌법 제10조 인격권 침해 현황] ➔ [2. 플랫폼 기업의 정보 독점이라는 구조적 원인] ➔ [3. 잊힐 권리 법제화 및 검색 배제 청구권 신설]이라는 3단 논증을 빈틈없이 연결하는 것이란다!",
        suggestedSentence: "디지털 정보의 영구 저장으로 헌법상 인격권이 침해되는 원인은 정보 독점 구조에 있으므로, 잊힐 권리를 법제화하여 기본권을 보장해야 한다.",
        quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "🎯 3단 논증 뼈대 힌트 줘"],
      });
    }
  }

  // 2. 작성법 및 문장 다듬기 ("어떻게 써?", "다듬어줘", "문장 알려줘")
  if (msg.includes("어떻게") || msg.includes("써") || msg.includes("작성") || msg.includes("다듬") || msg.includes("제한해야")) {
    return NextResponse.json({
      reply: "아주 좋은 방향으로 생각하고 있구나! '법률로써 제한해야 한다'는 생각에 '자유와 권리의 본질적인 내용을 침해할 수 없다'는 마지노선까지 함께 1문장으로 엮으면 완벽한 100점 답안이 완성된단다. 아래 추천 문장을 한번 볼래?",
      suggestedSentence: "기본권은 국가안전보장과 공공복리를 위해 법률로써 제한할 수 있으나, 자유와 권리의 본질적인 내용을 침해할 수 없다.",
      quickFollowUps: ["✍️ 이 문장 내 답안에 적용하기", "💡 다른 표현 방식도 있어?"],
    });
  }

  // 3. 짧은 반응이나 되묻기 ("응?", "왜?", "도와줘", "글쎄")
  return NextResponse.json({
    reply: "어려운 부분이 있으면 무엇이든 물어보렴! 지금 풀고 있는 문제에서 '어떤 헌법 조항을 써야 할지' 막히거나, '내가 쓴 문장이 맞는지' 궁금하다면 내가 1:1로 꼼꼼히 첨삭해 줄게!",
    suggestedSentence: "헌법 제37조 제2항에 따라 기본권은 법률에 근거해서만 제한될 수 있으며 본질적 내용은 보호된다.",
    quickFollowUps: ["📖 이 문제 핵심 개념 알려줘", "✍️ 내 문장 다듬어줘", "🎯 80% 달성 힌트 줘"],
  });
}
