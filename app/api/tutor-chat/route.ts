import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, contextInfo, history = [] } = body;

    const userMessage = (message || "").trim();
    if (!userMessage) {
      return NextResponse.json({ reply: "질문이나 다듬고 싶은 문장을 입력해 줘!" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const systemInstruction = `당신은 고등학교 1학년 통합사회 교과서 1단원(인권 보장과 헌법)의 1:1 AI 보조교사 튜터 'ZERO'입니다.
학생들이 서술형 탐구 과제를 해결하고, 스스로 생각을 정리하며 교과 개념에 맞는 문장을 다듬을 수 있도록 돕습니다.

[선생님 튜터링 원칙]:
1. 친절하고 지적인 고등학교 사회과 멘토 말투('~단다', '~해 볼까?', '~해보자!')를 사용합니다.
2. 학생이 답을 잘 모를 때는 무조건 정답을 다 주지 않고, 스스로 생각할 수 있도록 '생각의 실마리(소크라테스식 발문)'를 던집니다.
3. 학생이 문장 첨삭/다듬기를 요청하거나 답안 초안을 보여줄 경우, 교과 전문 개념어(예: 헌법 제10조 행복추구권, 헌법 제37조 제2항, 법률유보의 원칙, 비례원칙, 통신의 자유, 학습권, 근로기준법, 잊힐 권리 등)를 활용하여 정제된 모범 문장을 함께 제시해 줍니다.
4. 답변에는 항상 학생이 바로 활용할 수 있는 추천 다듬기 문장('suggestedSentence')을 포함해 주세요.

[현재 학생의 탐구 상황]:
- 현재 단계: ${contextInfo?.activeSkillTitle || "통합사회 탐구 스킬 훈련"}
- 관련 문제/지문: ${contextInfo?.currentProblem || "1단원 인권과 헌법"}
- 학생이 작성 중인 답안: "${contextInfo?.currentStudentInput || "작성 중"}"

반드시 아래 JSON 포맷으로만 응답하세요:
{
  "reply": "학생에게 해줄 친절한 설명, 생각 정리 질문 또는 코칭 피드백",
  "suggestedSentence": "학생이 답안창에 자동완성으로 가져다 쓸 수 있는 완성도 높은 1~2문장 (없으면 빈 문자열)",
  "quickFollowUps": ["다음에 물어볼 만한 추천 질문1", "추천 질문2"]
}`;

        // Build history
        const contents: any[] = [];
        contents.push({ role: "user", parts: [{ text: "시스템 안내: 당신은 통합사회 보조교사 AI 튜터 ZERO입니다." }] });
        contents.push({ role: "model", parts: [{ text: "{\"reply\": \"준비되었습니다.\", \"suggestedSentence\": \"\", \"quickFollowUps\": []}" }] });

        for (const h of history.slice(-4)) {
          contents.push({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.text }] });
        }
        contents.push({ role: "user", parts: [{ text: `${systemInstruction}\n\n[학생의 질문/요청]: "${userMessage}"` }] });

        const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
        for (const model of models) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents,
                generationConfig: { responseMimeType: "application/json" }
              })
            });

            if (res.ok) {
              const data = await res.json();
              const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (jsonText) {
                const parsed = JSON.parse(jsonText);
                return NextResponse.json({
                  reply: parsed.reply || "좋은 질문이야! 헌법 조문과 교과서 핵심 개념을 연결해 보자.",
                  suggestedSentence: parsed.suggestedSentence || "",
                  quickFollowUps: Array.isArray(parsed.quickFollowUps) ? parsed.quickFollowUps : ["문장 더 다듬어줘", "헌법 조문 근거 알려줘"]
                });
              }
            }
          } catch (mErr) {
            console.warn(`Gemini model ${model} failed in tutor-chat:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API tutor-chat fallback:", geminiErr);
      }
    }

    // 로컬 폴백 엔진
    return getLocalTutorReply(userMessage, contextInfo);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Tutor chat error" }, { status: 500 });
  }
}

function getLocalTutorReply(userMsg: string, ctx: any) {
  const msg = userMsg.toLowerCase();

  if (msg.includes("다듬") || msg.includes("어떻게 써") || msg.includes("작성") || msg.includes("힌트")) {
    return NextResponse.json({
      reply: "네 생각의 핵심 방향은 아주 좋아! 여기에 헌법상 근거와 교과 개념어를 보강하면 80% 이상 모범 답안에 도달할 수 있어. 아래 완성 문장을 답안창에 적용해 볼래?",
      suggestedSentence: "기본권은 국가안전보장과 공공복리를 위해 법률로써 제한할 수 있으나, 자유와 권리의 본질적인 내용을 침해할 수 없다.",
      quickFollowUps: ["반대 관점 논리는 뭐야?", "핵심 개념어 목록 알려줘"]
    });
  }

  if (msg.includes("자유") || msg.includes("폰") || msg.includes("휴대폰")) {
    return NextResponse.json({
      reply: "휴대전화 수거 쟁점에서는 학생의 '헌법 제10조 행복추구권'과 '헌법 제18조 통신의 자유'를 핵심 논거로 들 수 있어. 일괄 수거 대신 '자율적 보관 협약'을 대안으로 제시하면 설득력이 높아진단다.",
      suggestedSentence: "본인은 학생의 행복추구권과 통신의 자유를 존중하기 위해 일괄 수거 학칙 대신 쉬는 시간 자율 보관제를 지지한다.",
      quickFollowUps: ["공동체 학습권 입장은 어떻게 써?", "이 문장 내 답안에 넣기"]
    });
  }

  return NextResponse.json({
    reply: `좋은 탐구 질문이야! "${userMsg}"에 대해 교과서 헌법 조문(제10조 인간의 존엄성, 제37조 제2항 기본권 제한 한계)을 중심에 두고 생각을 풀어나가면 완성도 높은 답안이 완성된단다. 더 자세히 문장을 다듬고 싶다면 언제든 말해줘!`,
    suggestedSentence: "헌법 제10조 및 관련 법률에 근거하여 기본권 보장의 본질적 가치를 실현해야 한다.",
    quickFollowUps: ["내 문장 첨삭해줘", "이 조문 쉽게 설명해줘"]
  });
}
