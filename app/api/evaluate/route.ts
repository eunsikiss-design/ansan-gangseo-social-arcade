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
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `당신은 고등학교 통합사회 교사 AI 튜터 'ZERO'입니다.
학생이 서술형 답안을 작성하고 정답을 향해 발전해 가는 대화형 첨삭을 수행합니다.

[스킬 단계]: ${skillType}
[문항 배경/주제]: ${context?.topic || context?.problemCase || "통합사회 탐구"}
[선택한 관점]: ${context?.stance || "기본 관점"}
[학생 답안]: "${answerText}"

[평가 기준 및 목표]:
- 스킬 2: 자료 속 핵심 키워드(예: 법률, 본질적 내용 등)를 포함한 완결된 1문장 작성
- 스킬 3: 선택 관점에 부합하며 교과 개념어(통신의 자유, 학습권, 비례원칙 등)를 사용한 1문장 작성
- 스킬 4: 단순 개인 탓이 아닌 법·제도적 구조 원인(근로기준법 등)을 포함한 2~3문장 대안 작성
- 스킬 5: [현황] -> [구조적 원인] -> [실천 방안] 3단 논증 완성

응답은 반드시 아래 JSON 포맷으로만 출력하세요:
{
  "isMastered": boolean, // 완벽히 정답에 도달했는지 여부 (true면 마스터 통과, false면 추가 수정 유도)
  "scoreLevel": "REVISE" | "GOOD" | "PERFECT", // REVISE(보완필요), GOOD(거의도달), PERFECT(완벽)
  "guideQuestion": "학생이 답을 더 발전시킬 수 있도록 던지는 친절하고 구체적인 유도 질문 1문장",
  "recommendedTerms": ["추천개념어1", "추천개념어2"],
  "feedback": "학생 답안에서 잘한 점과 부족한 점에 대한 따뜻한 코칭 피드백",
  "scaffoldingHint": "학생이 활용할 수 있는 문장 틀 또는 초성 힌트",
  "improvedExample": "학생 답안을 바탕으로 교과 개념을 살려 완성한 모범 문장 예시"
}`;

        // 1순위 gemini-2.0-flash, 2순위 gemini-1.5-flash 지원
        const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
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
                return NextResponse.json(parsed);
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
 * 로컬 대화형 코칭 규칙 엔진 (오프라인/안전 모드에서도 실시간 문장 진단 및 점진적 정답 유도)
 */
function evaluateLocallyIterative(skillType: string, text: string, context: any) {
  if (skillType === "SKILL_2") {
    const hasLaw = text.includes("법률") || text.includes("법");
    const hasEssence = text.includes("본질") || text.includes("내용");
    const isMastered = hasLaw && hasEssence;

    if (isMastered) {
      return NextResponse.json({
        isMastered: true,
        scoreLevel: "PERFECT",
        guideQuestion: "축하합니다! 핵심 법률 형식과 본질적 한계를 완벽하게 엮어냈습니다.",
        recommendedTerms: ["법률유보원칙", "본질적 내용 침해 금지"],
        feedback: "자료의 출제 의도와 헌법 제37조 제2항의 핵심 요건을 완벽하게 1문장으로 서술하였습니다.",
        scaffoldingHint: "완벽한 답안입니다!",
        improvedExample: "기본권은 반드시 국회가 제정한 법률에 근거하여 제한해야 하며, 어떠한 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다."
      });
    } else {
      return NextResponse.json({
        isMastered: false,
        scoreLevel: "REVISE",
        guideQuestion: !hasLaw
          ? "좋은 시도입니다! 국가가 기본권을 제한할 때 반드시 따라야 하는 '형식적 근거(ㅂㄹ)'를 문장에 추가해 볼까요?"
          : "거의 다 왔습니다! 아무리 국가안전보장이 급해도 결코 침해할 수 없는 '마지노선(ㅂㅈㅈ ㄴㅇ)'을 문장에 넣어 완성해 볼까요?",
        recommendedTerms: ["법률", "본질적인 내용"],
        feedback: "자료 속의 핵심 헌법 용어가 1개 이상 누락되었습니다. 유도 질문을 보고 문장을 보강해 보세요.",
        scaffoldingHint: "기본권은 반드시 (ㅂㄹ)에 근거하여 제한해야 하며, (ㅂㅈㅈ ㄴㅇ)을/를 침해할 수 없다.",
        improvedExample: "기본권은 반드시 법률에 근거하여 제한해야 하며, 본질적인 내용을 침해할 수 없다."
      });
    }
  }

  if (skillType === "SKILL_3") {
    const hasTerms = text.includes("자유") || text.includes("행복") || text.includes("학습") || text.includes("교육") || text.includes("헌법") || text.includes("비례");
    const isLengthGood = text.length >= 15;
    const isMastered = hasTerms && isLengthGood;

    if (isMastered) {
      return NextResponse.json({
        isMastered: true,
        scoreLevel: "PERFECT",
        guideQuestion: "완벽합니다! 선택한 관점에 부합하며 교과 전문 개념어를 정확히 활용했습니다.",
        recommendedTerms: ["헌법 제10조 행복추구권", "비례의 원칙"],
        feedback: "선택한 관점의 헌법적 가치를 명확히 제시하였으며, 균형 있는 대안 의식이 잘 드러나 있습니다.",
        scaffoldingHint: "훌륭한 완성본입니다!",
        improvedExample: `${text} 이는 헌법상 기본권 보장과 자율적 규범 형성 원리에 부합한다.`
      });
    } else {
      return NextResponse.json({
        isMastered: false,
        scoreLevel: "REVISE",
        guideQuestion: "단순 찬반 의견을 넘어, '통신의 자유(헌법 제18조)' 또는 '학습권/수업권'이라는 교과 용어를 넣어 한 문장으로 다시 써볼까요?",
        recommendedTerms: ["통신의 자유", "행복추구권", "학습권", "비례원칙"],
        feedback: "주장은 분명하나 교과서 전문 헌법 용어를 추가하면 설득력이 훨씬 높아집니다.",
        scaffoldingHint: "본인은 학생의 [통신의 자유/학습권]을 보장하기 위해 [자율적 규칙 제정]이 타당하다고 판단한다.",
        improvedExample: "본인은 학생의 행복추구권과 통신의 자유를 존중하기 위해 일괄 수거 대신 쉬는 시간 자율 사용을 보장해야 한다고 판단한다."
      });
    }
  }

  if (skillType === "SKILL_4") {
    const hasStructural = text.includes("근로기준법") || text.includes("제도") || text.includes("감독") || text.includes("법") || text.includes("구조");
    const hasSolution = text.includes("대안") || text.includes("강화") || text.includes("의무") || text.includes("점검") || text.includes("교육");
    const isMastered = hasStructural && hasSolution && text.length >= 30;

    if (isMastered) {
      return NextResponse.json({
        isMastered: true,
        scoreLevel: "PERFECT",
        guideQuestion: "정답 마스터! 개인의 부주의를 넘어 법·제도적 구조와 실효성 있는 대안을 정확히 도출했습니다.",
        recommendedTerms: ["근로기준법 제17조", "행정 근로감독"],
        feedback: "원인을 법·제도적 사각지대에서 포착하고, 계약서 의무화 및 점검이라는 구체적 대안을 논리적으로 연결했습니다.",
        scaffoldingHint: "완벽한 원인·대안 구조입니다!",
        improvedExample: "청소년 노동인권 침해는 사업주의 준법의식 결여뿐 아니라 행정적 근로감독의 사각지대라는 구조적 원인에서 비롯된다. 따라서 표준근로계약서 작성을 전면 의무화하고 불시 점검 제재를 강화해야 한다."
      });
    } else {
      return NextResponse.json({
        isMastered: false,
        scoreLevel: "REVISE",
        guideQuestion: !hasStructural
          ? "원인이 단순히 '사장이 나빠서'가 아니라, '근로기준법 준수 미흡이나 행정 감독 부족'이라는 제도적 구조를 넣어볼까요?"
          : "원인 분석이 좋습니다! 이제 이를 해결하기 위한 '구체적인 법·제도적 대안(예: 근로계약서 의무화 및 점검)'을 덧붙여 보세요.",
        recommendedTerms: ["근로기준법", "근로계약서 의무화", "근로감독"],
        feedback: "사회 문제는 개인의 도덕성뿐만 아니라 법과 제도의 구조적 측면을 함께 다루어야 높은 평가를 받습니다.",
        scaffoldingHint: "[원인] 사업주의 법 인식 부족 및 제도적 감독 미비 ➔ [대안] 근로계약서 의무화 및 불시 점검 강화",
        improvedExample: "청소년 노동 침해는 근로감독 체계의 미비에서 기인하므로, 근로기준법상 계약서 작성을 의무화하고 불시 점검을 강화해야 한다."
      });
    }
  }

  // SKILL_5
  const has3Steps = text.length >= 45 && (text.includes("침해") || text.includes("문제")) && (text.includes("원인") || text.includes("때문") || text.includes("구조")) && (text.includes("대안") || text.includes("법") || text.includes("방안") || text.includes("청구"));

  if (has3Steps) {
    return NextResponse.json({
      isMastered: true,
      scoreLevel: "PERFECT",
      guideQuestion: "최고 성취수준(A등급) 달성! 3단 논증과 헌법적 실천 가치를 완벽하게 통합했습니다.",
      recommendedTerms: ["헌법 제10조 인격권", "잊힐 권리", "검색 배제 청구권"],
      feedback: "현황 ➔ 구조적 원인 ➔ 헌법적 실천 대안이 완벽한 인과관계로 연결된 모범 답안입니다.",
      scaffoldingHint: "종합 서술형 마스터!",
      improvedExample: "디지털 정보의 영구 저장으로 헌법 제10조 인격권 침해가 심각하다. 이는 플랫폼 기업의 독점과 법적 삭제 권한 부재라는 구조적 원인 때문이다. 따라서 미성년자 대상 잊힐 권리를 법제화하고 검색 배제 청구권을 신설해야 한다."
    });
  } else {
    return NextResponse.json({
      isMastered: false,
      scoreLevel: "REVISE",
      guideQuestion: "3단 구조([1. 헌법 인격권 침해 현황] ➔ [2. 플랫폼 정보 독점의 구조적 원인] ➔ [3. 잊힐 권리 법제화 실천 방안]) 중 부족한 단계를 보강해 볼까요?",
      recommendedTerms: ["헌법 제10조 인격권", "사생활의 비밀", "잊힐 권리", "검색 배제 청구권"],
      feedback: "문제의식은 훌륭합니다. [현황 ➔ 구조적 원인 ➔ 실천 방안]의 3단 흐름이 모두 들어가도록 문장을 발전시켜 보세요.",
      scaffoldingHint: "[현황] 헌법 제10조 인격권 침해 심화 ➔ [원인] 플랫폼 정보 독점 및 법 부재 ➔ [실천] 잊힐 권리 법제화",
      improvedExample: "디지털 공간의 영구 저장으로 헌법상 인격권이 침해되고 있다. 이는 플랫폼 독점이라는 구조적 문제이므로 잊힐 권리를 법제화해야 한다."
    });
  }
}
