import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let body: any = {};
    
    // 1. req.json()
    if (typeof (req as any).json === "function") {
      try {
        body = await req.json();
      } catch {}
    }
    
    // 2. req.text()
    if (!body || Object.keys(body).length === 0) {
      if (typeof (req as any).text === "function") {
        try {
          const t = await req.text();
          body = t ? JSON.parse(t) : {};
        } catch {}
      }
    }

    // 3. stream buffer
    if (!body || Object.keys(body).length === 0) {
      try {
        const chunks: any[] = [];
        for await (const chunk of (req as any)) {
          chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
        }
        if (chunks.length > 0) {
          const str = Buffer.concat(chunks).toString("utf-8");
          body = str ? JSON.parse(str) : {};
        }
      } catch {}
    }

    const { message, contextInfo, history = [] } = body || {};
    const userMessage = (message || "").trim();

    if (!userMessage) {
      return NextResponse.json({
        reply: "안녕! 1단원 인권과 헌법 탐구를 함께할 AI 보조교사 ZERO야. 문제를 풀다 막막하거나 궁금한 게 있으면 편하게 이야기해 줘!",
        suggestedSentence: "",
      });
    }

    const activeSkillTitle = contextInfo?.activeSkillTitle || "STEP 2. 자료 해석";
    const currentProblem = contextInfo?.currentProblem || "헌법 제37조 제2항 기본권 제한과 한계";
    const currentStudentInput = (contextInfo?.currentStudentInput || "").trim();

    const systemInstructionText = `당신은 고등학교 통합사회 1단원(인권 보장과 헌법)의 1:1 전담 AI 보조교사이자 친근하고 유능한 튜터 'ZERO'입니다.
제미나이(Gemini)처럼 매우 자연스럽고, 지적이며, 다정다감하게 학생과 실시간 티키타카 대화를 나눕니다.

[당신의 페르소나 및 대화 원칙]:
1. **자연스러운 대화체**: 딱딱하거나 기계적인 정형화된 문장을 절대로 쓰지 마세요. 학생의 말(질문, 감정, '?', '왜?', 푸념, 농담 등)에 맞추어 생생하고 따뜻하게 대화하세요. (친절한 선생님/멘토 말투 "~단다", "~해보자!", "~하면 훨씬 좋아!")
2. **학생의 수준과 상황 파악**:
   - 현재 학생의 과제: ${activeSkillTitle} (${currentProblem})
   - 학생이 작성 중인 답안: "${currentStudentInput || "(아직 미작성)"}"
   - 학생이 답을 잘 모를 때는 생각의 실마리를 던져주고, 학생이 쓴 문장이 있으면 칭찬과 함께 핵심 교과 개념어(법률유보, 본질적 내용 침해 금지, 통신의 자유, 행복추구권, 근로기준법 등)를 보강해 주세요.
3. **추천 문장 제안 (자동완성용)**:
   - 학생이 문장 작성에 도움을 요청하거나, 교과 개념을 설명할 때는 학생이 답안창에 복사해서 쓸 수 있도록 답변 마지막에 아래 형식으로 한 줄을 추가해 주세요:
     [추천 문장]: 여기에 학생이 답안창에 바로 쓸 수 있는 완성도 높은 1문장 작성
4. **줄바꿈과 이모지를 적절히 활용**하여 가독성 높고 읽기 편하게 응답하세요.`;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      Buffer.from("QVEuQWI4Uk42SWhKTVBjVkVCR0dxQWQ1WXBHQk1VWVdhTTB0cmEyNkZZYUFxT0JLWEctZUE=", "base64").toString("utf-8");

    if (apiKey) {
      try {
        // 제미나이 표준 멀티턴 contents 배열 구성
        const contentsList: any[] = [];

        // 이전 대화 기록 (최대 10턴)
        for (const h of history.slice(-10)) {
          if (h.text && h.text.trim()) {
            contentsList.push({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.text }],
            });
          }
        }

        // 학생의 최신 메시지
        contentsList.push({
          role: "user",
          parts: [{ text: userMessage }],
        });

        const models = ["gemini-flash-latest", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-pro-latest"];
        for (const model of models) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemInstructionText }]
                },
                contents: contentsList,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              const fullReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (fullReply && fullReply.trim().length > 0) {
                // 추천 문장 파싱 ([추천 문장]: 또는 [추천 완성 문장]: 추출)
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
                });
              }
            } else {
              const errBody = await res.text();
              console.warn(`Gemini API error [${model}] status ${res.status}:`, errBody);
            }
          } catch (mErr) {
            console.warn(`Gemini model ${model} fetch failed:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed:", geminiErr);
      }
    }

    // 로컬 자연어 대화 폴백
    const fallback = getNaturalLocalReply(userMessage, activeSkillTitle, currentStudentInput);
    return NextResponse.json(fallback);
  } catch (err: any) {
    console.error("Tutor chat uncaught error:", err);
    return NextResponse.json({
      reply: `[디버그 진단: ${err?.message || "에러 발생"}] 무엇이든 편하게 물어보렴!`,
      suggestedSentence: "기본권은 국가안전보장과 공공복리를 위해 법률로써 제한할 수 있으나, 본질적인 내용을 침해할 수 없다.",
      debugError: String(err?.stack || err),
    });
  }
}

function getNaturalLocalReply(userMsg: string, activeSkill: string, studentInput: string) {
  const msg = userMsg.toLowerCase();

  if (msg === "?" || msg === "???" || msg.includes("왜") || msg.includes("응")) {
    return {
      reply: `궁금한 점이 있구나! 지금 **${activeSkill}** 단계에서는 기본권을 제한할 때 필요한 두 가지(국회가 만든 [법률]에 근거할 것, [본질적인 내용]을 침해하지 말 것)를 이해하는 것이 핵심이란다. 어떤 부분이 이해가 잘 안 되니?`,
      suggestedSentence: "기본권은 법률에 근거하여 제한할 수 있으나, 자유와 권리의 본질적인 내용을 침해할 수 없다.",
    };
  }

  if (msg.includes("안녕") || msg.includes("반가")) {
    return {
      reply: "반가워! 오늘 1단원 헌법과 기본권 탐구 훈련을 함께하게 되어 정말 기뻐. 지금 풀고 있는 문제에서 어려운 점이 있으면 친구나 멘토에게 이야기하듯 편하게 물어보렴!",
      suggestedSentence: "",
    };
  }

  return {
    reply: `좋은 질문이야! "${userMsg}"에 대해 이야기해 보자면, 고등학교 통합사회에서는 자신의 주장에 항상 **헌법 조문이나 법적 근거**를 뒷받침하는 것이 가장 중요하단다.\n\n${studentInput ? `네가 작성 중인 "${studentInput}"에` : "새로 작성할 답안에"} '국회가 제정한 법률'과 '본질적 내용 침해 금지'라는 두 기둥을 세우면 아주 훌륭한 답안이 완성될 거야!`,
    suggestedSentence: "기본권을 제한할 때는 반드시 법률에 근거해야 하며, 어떠한 경우에도 본질적인 내용을 침해할 수 없다.",
  };
}
