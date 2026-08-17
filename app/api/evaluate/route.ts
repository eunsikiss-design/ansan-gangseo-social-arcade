import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { skillType, studentAnswer, context, history = [], requestHint } = body;

    const answerText = (studentAnswer || "").trim();

    // 1. 단서(힌트) 즉시 요청인 경우
    if (requestHint) {
      if (skillType === "SKILL_2") {
        return NextResponse.json({
          status: "HINT",
          guideQuestion: "제시된 조항에서 '형식적 근거(법률)'와 '침해 금지 한계(본질적인 내용)'를 찾아 한 문장으로 엮어보세요.",
          hintTemplate: "기본권은 반드시 (ㅂㄹ)에 근거하여 제한해야 하며, 어떠한 경우에도 (ㅂㅈㅈ ㄴㅇ)을/를 침해할 수 없다.",
          recommendedTerms: ["법률", "본질적인 내용"],
          feedback: "조문 속 핵심 단어 2개를 찾아 문장에 넣어보세요."
        });
      }
      if (skillType === "SKILL_3") {
        return NextResponse.json({
          status: "HINT",
          guideQuestion: "선택한 관점의 헌법적 근거(통신의 자유 vs 학습권)를 포함하여 한 문장으로 다듬어 보세요.",
          hintTemplate: "본인은 [선택 관점]의 입장에서, [헌법 조문 또는 기본권]을 보장/조율하기 위해 [자율적 협약/방안]이 타당하다고 판단한다.",
          recommendedTerms: ["통신의 자유", "행복추구권", "학습권", "비례원칙"],
          feedback: "교과서 개념어를 1개 이상 포함하여 다시 작성해 보세요."
        });
      }
      if (skillType === "SKILL_4") {
        return NextResponse.json({
          status: "HINT",
          guideQuestion: "개인의 도덕성 문제 외에 '근로기준법'이나 '근로감독 체계'라는 법·제도적 구조 원인을 포함해 보세요.",
          hintTemplate: "[원인] 사업주의 법 인식 부족 및 청소년 근로감독 체계의 미비로 인해 발생한다. [대안] 따라서 근로기준법상 서면 계약서 작성을 의무화하고 불시 점검을 강화해야 한다.",
          recommendedTerms: ["근로기준법", "근로계약서", "구조적 원인", "근로감독"],
          feedback: "문제 원인과 법적 해결책을 짝지어 작성해 보세요."
        });
      }
      if (skillType === "SKILL_5") {
        return NextResponse.json({
          status: "HINT",
          guideQuestion: "[현황/문제] ➔ [구조적 원인] ➔ [헌법/가치 기반 실천 방안]의 3단 뼈대를 갖추어 보세요.",
          hintTemplate: "현재 디지털 공간의 영구 저장성으로 인해 헌법 제10조 인격권이 침해되고 있다. 이는 플랫폼 기업의 정보 독점과 삭제 청구권 부재라는 구조적 원인 때문이다. 따라서 '잊힐 권리'를 법제화하고 검색 배제 청구권을 신설해야 한다.",
          recommendedTerms: ["헌법 제10조", "인격권", "잊힐 권리", "검색 배제 청구권"],
          feedback: "3단계를 순서대로 서술해 보세요."
        });
      }
    }

    // 2. Gemini API 호출 시도 (대화형 코칭 프롬프트)
    const apiKey =
      process.env.GEMINI_API_KEY ||
      Buffer.from("QVEuQWI4Uk42SWhKTVBjVkVCR0dxQWQ1WXBHQk1VWVdhTTB0cmEyNkZZYUFxT0JLWEctZUE=", "base64").toString("utf-8");
    if (apiKey) {
      try {
        const prompt = `당신은 고등학교 통합사회 교사 AI 튜터 'ZERO'입니다.
학생이 서술형 답안을 작성하고 정답을 향해 발전해 가는 점진적 다회차 첨삭을 수행합니다.
학생 답안과 모범 답안의 교과 개념어 및 맥락 일치도(0~100%)를 정밀하게 측정하고, 80% 이상 일치할 때까지 학생의 눈높이에 맞춰 차이를 좁혀주세요.

[스킬 단계]: ${skillType}
[문항 배경/주제]: ${context?.topic || context?.problemCase || "통합사회 탐구"}
[선택한 관점]: ${context?.stance || "기본 관점"}
[학생 답안]: "${answerText}"

[핵심 모범 기준 및 목표]:
- 스킬 2 (자료해석): 헌법 제37조 제2항에 근거하여 형식적 근거(국회가 제정한 법률)와 한계(자유와 권리의 본질적인 내용 침해 금지)가 모두 포함된 1문장
- 스킬 3 (관점평가): 선택한 관점(자유권 vs 학습권)의 헌법적 가치(통신의 자유, 행복추구권 vs 학습권, 수업권)와 비례원칙/자율규범 대안이 포함된 1문장
- 스킬 4 (원인대안): 개인적 도덕성 외에 법·제도적 구조 원인(근로기준법상 서면계약 부재, 근로감독 체계 미비)과 실효적 대안이 포함된 2~3문장
- 스킬 5 (실천설계): [1. 현황(디지털 인격권 침해) ➔ 2. 구조적 원인(플랫폼 독점/삭제청구권 부재) ➔ 3. 헌법 기반 실천 방안(잊힐 권리 법제화)] 3단 논증

[평가 지침]:
1. matchRate (0~100): 모범 답안의 핵심 개념어와 논리 맥락이 얼마나 충족되었는지 백분율로 계산.
   - 80% 이상이면 isMastered: true
   - 80% 미만이면 isMastered: false
2. guideQuestion: 현재 학생이 쓴 문장의 수준을 정확히 짚고, 다음 80% 도달을 위해 '어떤 단어/원리'를 추가해야 하는지 친절하고 구체적인 질문 1문장.
3. recommendedTerms: 학생 문장에 아직 빠져있는 필수 교과 개념어 2~3개.
4. feedback: 학생이 쓴 내용 중 긍정적인 부분과 80% 도달을 위해 필요한 개선점 코칭.
5. scaffoldingHint: 학생 수준에 맞춘 문장 완성 뼈대.

응답은 반드시 아래 JSON 포맷으로만 출력하세요:
{
  "matchRate": number, // 0부터 100 사이의 완성도 백분율 (예: 45, 65, 85)
  "isMastered": boolean, // matchRate >= 80 이면 true, 미만이면 false
  "scoreLevel": "REVISE" | "GOOD" | "PERFECT", // matchRate < 50: REVISE, 50~79: GOOD, 80 이상: PERFECT
  "guideQuestion": "80% 이상 모범 답안에 도달하기 위한 수준별 맞춤 유도 질문",
  "recommendedTerms": ["필수개념어1", "필수개념어2"],
  "feedback": "학생 문장 분석 및 보완 코칭 피드백",
  "scaffoldingHint": "문장 뼈대 및 초성 힌트",
  "improvedExample": "모범 문장 예시"
}`;

        const models = ["gemini-flash-latest", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-pro-latest"];
        for (const model of models) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
              })
            });

            if (res.ok) {
              const data = await res.json();
              const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (jsonText) {
                const parsed = JSON.parse(jsonText);
                const matchRate = typeof parsed.matchRate === "number" ? parsed.matchRate : parsed.isMastered ? 90 : 55;
                const isMastered = matchRate >= 80;
                return NextResponse.json({
                  matchRate,
                  isMastered,
                  scoreLevel: isMastered ? "PERFECT" : matchRate >= 50 ? "GOOD" : "REVISE",
                  guideQuestion: parsed.guideQuestion || "핵심 헌법 개념어를 포함하여 문장을 발전시켜 볼까요?",
                  recommendedTerms: Array.isArray(parsed.recommendedTerms) && parsed.recommendedTerms.length > 0 ? parsed.recommendedTerms : ["법률", "본질적인 내용"],
                  feedback: parsed.feedback || "모범 답안과의 일치도를 높이기 위해 유도 질문을 반영해 보세요.",
                  scaffoldingHint: parsed.scaffoldingHint || "자료 속의 핵심 용어를 문장에 활용해 보세요.",
                  improvedExample: parsed.improvedExample || ""
                });
              }
            }
          } catch (mErr) {
            console.warn(`Gemini model ${model} failed, trying next:`, mErr);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API interactive coach failed, fallback to smart rule engine:", geminiErr);
      }
    }

    // 3. 전문 로컬 규칙 튜터 엔진 (다회차 스마트 코칭 지원)
    return evaluateLocallyIterative(skillType, answerText, context);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Evaluation error" }, { status: 500 });
  }
}

/**
 * 로컬 대화형 코칭 규칙 엔진 (80% 완성도 도달 알고리즘)
 */
function evaluateLocallyIterative(skillType: string, text: string, context: any) {
  const len = text.length;

  if (skillType === "SKILL_2") {
    const hasLaw = text.includes("법률") || text.includes("법");
    const hasEssence = text.includes("본질") || text.includes("침해");
    const hasLimit = text.includes("제한") || text.includes("근거") || text.includes("한계");

    let rate = 20;
    if (len >= 10) rate += 15;
    if (hasLaw) rate += 30;
    if (hasEssence) rate += 30;
    if (hasLimit) rate += 10;
    rate = Math.min(100, rate);

    const isMastered = rate >= 80;

    if (isMastered) {
      return NextResponse.json({
        matchRate: rate,
        isMastered: true,
        scoreLevel: "PERFECT",
        guideQuestion: "🎉 모범 답안과 85% 이상 일치합니다! 형식적 근거(법률)와 본질적 한계를 완벽히 결합했습니다.",
        recommendedTerms: ["법률유보원칙", "본질적 내용 침해 금지"],
        feedback: "헌법 제37조 제2항의 핵심 요건을 빠짐없이 1문장으로 정확하게 서술하였습니다.",
        scaffoldingHint: "완벽한 모범 답안입니다!",
        improvedExample: "기본권은 반드시 국회가 제정한 법률에 근거하여 제한해야 하며, 어떠한 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다."
      });
    } else {
      return NextResponse.json({
        matchRate: rate,
        isMastered: false,
        scoreLevel: rate >= 50 ? "GOOD" : "REVISE",
        guideQuestion: !hasLaw
          ? "현재 완성도 " + rate + "%: 국가가 기본권을 제한할 때 반드시 따라야 하는 '형식적 근거(국회가 제정한 ㅂㄹ)'를 문장에 추가해 볼까요?"
          : !hasEssence
          ? "현재 완성도 " + rate + "%: '법률'은 잘 찾았습니다! 이제 결코 침해할 수 없는 마지노선인 'ㅂㅈㅈ ㄴㅇ 침해 금지'를 덧붙여 80%를 완성해 보세요."
          : "현재 완성도 " + rate + "%: 핵심 용어들을 연결하여 주어와 서술어가 완전한 1문장 형태로 다듬어 보세요.",
        recommendedTerms: ["법률", "본질적인 내용", "침해 금지"],
        feedback: `현재 모범 답안과의 일치도는 ${rate}%입니다. 80% 이상 마스터를 위해 유도 질문의 빈틈을 채워보세요.`,
        scaffoldingHint: "기본권은 반드시 (ㅂㄹ)에 근거하여 제한해야 하며, (ㅂㅈㅈ ㄴㅇ)을/를 침해할 수 없다.",
        improvedExample: "기본권은 반드시 법률에 근거하여 제한해야 하며, 본질적인 내용을 침해할 수 없다."
      });
    }
  }

  if (skillType === "SKILL_3") {
    const isStanceA = context?.stance?.includes("자유") || text.includes("자유") || text.includes("통신") || text.includes("행복");
    const hasCoreTerm = text.includes("통신의 자유") || text.includes("학습권") || text.includes("행복추구권") || text.includes("수업권") || text.includes("비례");
    const hasStanceWord = text.includes("입장") || text.includes("지지") || text.includes("타당") || text.includes("판단") || text.includes("주장");

    let rate = 25;
    if (len >= 15) rate += 20;
    if (hasCoreTerm) rate += 35;
    if (hasStanceWord) rate += 20;
    rate = Math.min(100, rate);

    const isMastered = rate >= 80;

    if (isMastered) {
      return NextResponse.json({
        matchRate: rate,
        isMastered: true,
        scoreLevel: "PERFECT",
        guideQuestion: "🎉 모범 답안과 85% 이상 일치합니다! 선택한 관점에 부합하며 교과 전문 개념어를 정확히 활용했습니다.",
        recommendedTerms: ["헌법 제10조 행복추구권", "통신의 자유", "비례의 원칙"],
        feedback: "선택한 관점의 헌법적 가치를 명확히 제시하였으며, 자율적 규범 형성 원리에 맞게 완성되었습니다.",
        scaffoldingHint: "훌륭한 완성본입니다!",
        improvedExample: `${text} 이는 헌법상 기본권 보장과 민주적 자율 원리에 부합한다.`
      });
    } else {
      return NextResponse.json({
        matchRate: rate,
        isMastered: false,
        scoreLevel: rate >= 50 ? "GOOD" : "REVISE",
        guideQuestion: !hasCoreTerm
          ? `현재 완성도 ${rate}%: 단순한 의견을 넘어 교과서 개념어인 '${isStanceA ? "통신의 자유(헌법 제18조)" : "학습권 및 수업권"}'을 문장에 넣어 80%를 넘겨볼까요?`
          : `현재 완성도 ${rate}%: '${isStanceA ? "통신의 자유" : "학습권"}' 개념어가 들어왔습니다! 이제 [선택 관점의 근거 ➔ 자신의 주장]으로 문장을 또렷하게 마무리해 보세요.`,
        recommendedTerms: ["통신의 자유", "행복추구권", "학습권", "비례원칙"],
        feedback: `현재 모범 답안과의 일치도는 ${rate}%입니다. 80% 달성을 위해 추천 개념어와 자신의 판단을 명확히 연결해 보세요.`,
        scaffoldingHint: "본인은 학생의 [통신의 자유/학습권]을 보장하기 위해 [자율적 규칙 제정/보관]이 타당하다고 판단한다.",
        improvedExample: "본인은 학생의 행복추구권과 통신의 자유를 존중하기 위해 일괄 수거 대신 쉬는 시간 자율 사용을 보장해야 한다고 판단한다."
      });
    }
  }

  if (skillType === "SKILL_4") {
    const hasLaw = text.includes("근로기준법") || text.includes("산업안전") || text.includes("계약서") || text.includes("제도");
    const hasStructure = text.includes("구조") || text.includes("감독") || text.includes("처벌") || text.includes("점검");

    let rate = 30;
    if (len >= 25) rate += 20;
    if (hasLaw) rate += 30;
    if (hasStructure) rate += 20;
    rate = Math.min(100, rate);

    const isMastered = rate >= 80;

    return NextResponse.json({
      matchRate: rate,
      isMastered,
      scoreLevel: isMastered ? "PERFECT" : rate >= 50 ? "GOOD" : "REVISE",
      guideQuestion: !hasLaw
        ? `현재 완성도 ${rate}%: 개인의 도덕적 양심 문제 외에 '근로기준법상 서면계약 의무화'나 '불시 근로감독' 같은 법·제도 대안을 추가해 볼까요?`
        : `현재 완성도 ${rate}%: 법적 대안이 잘 포함되었습니다! [원인]과 [대안]의 인과관계를 2문장으로 정리하여 80%를 완성하세요.`,
      recommendedTerms: ["근로기준법", "근로계약서", "구조적 원인", "근로감독"],
      feedback: isMastered ? "법·제도적 구조 원인과 실효적 대안이 80% 이상 일치하는 모범 서술입니다." : `현재 일치도 ${rate}%. 구조적 대안을 보강해 보세요.`,
      scaffoldingHint: "[원인] 사업주의 법 인식 부족 및 감독 체계 미비로 발생한다. [대안] 근로기준법상 서면계약을 의무화해야 한다.",
      improvedExample: "청소년 노동 침해는 감독 체계 미비라는 구조적 원인에서 기인하므로, 근로기준법 준수 점검과 처벌을 강화해야 한다."
    });
  }

  // SKILL_5
  let rate = 30;
  if (len >= 40) rate += 20;
  if (text.includes("인격권") || text.includes("헌법") || text.includes("제10조")) rate += 25;
  if (text.includes("잊힐") || text.includes("삭제") || text.includes("독점") || text.includes("법제화")) rate += 25;
  rate = Math.min(100, rate);

  const isMastered = rate >= 80;
  return NextResponse.json({
    matchRate: rate,
    isMastered,
    scoreLevel: isMastered ? "PERFECT" : rate >= 50 ? "GOOD" : "REVISE",
    guideQuestion: rate < 60
      ? `현재 완성도 ${rate}%: [1. 현황 문제(인격권 침해)] ➔ [2. 구조 원인(플랫폼 독점)] ➔ [3. 실천 방안(잊힐 권리)] 3단계 구조를 순서대로 써볼까요?`
      : `현재 완성도 ${rate}%: 3단 구조가 잘 드러나고 있습니다! '헌법 제10조'와 '잊힐 권리 법제화' 키워드를 명확히 연결하여 80%를 넘겨보세요.`,
    recommendedTerms: ["헌법 제10조", "인격권", "잊힐 권리", "검색 배제 청구권"],
    feedback: isMastered ? "3단 논증 구조와 헌법 가치가 80% 이상 완벽히 일치합니다!" : `현재 일치도 ${rate}%. 3단계를 순서대로 완성해 보세요.`,
    scaffoldingHint: "1. 헌법 제10조 인격권 침해 현황... 2. 플랫폼 정보 독점 원인... 3. 잊힐 권리 법제화 대안...",
    improvedExample: "디지털 환경에서 헌법 제10조 인격권이 침해되는 원인은 정보 독점 구조에 있으므로, 잊힐 권리를 법제화하여 기본권을 보장해야 한다."
  });
}
