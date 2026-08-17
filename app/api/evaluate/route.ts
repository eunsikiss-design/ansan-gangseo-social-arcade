import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { skillType, studentAnswer, context, requestHint } = body;

    // 1. 단서(힌트) 요청 처리
    if (requestHint) {
      if (skillType === "SKILL_3") {
        return NextResponse.json({
          isCorrectStance: true,
          recommendedTerms: ["통신의 자유", "행복추구권", "학습권", "비례원칙"],
          feedback: "교과서 핵심 용어를 활용하여 문장을 구성해 보세요.",
          hintTemplate: "본인은 [선택 관점]의 입장에서, [헌법 조문 또는 기본권 명칭]을 근거로 하여 [구체적 조율 방안]이 타당하다고 생각한다."
        });
      }
      if (skillType === "SKILL_4") {
        return NextResponse.json({
          causeCategory: "STRUCTURAL",
          isConsistent: true,
          feedback: "개인의 도덕적 문제뿐만 아니라 근로기준법 및 근로감독 체계라는 '법·제도적 구조'를 포함해 보세요.",
          hintTemplate: "[원인] 청소년 노동인권에 대한 사업주의 인식 부족뿐만 아니라 법적 근로감독 체계의 미비로 인해 발생한다. [대안] 따라서 근로기준법상 서면 계약서 작성을 의무화하고 불시 점검 및 위반 사업주 제재를 강화해야 한다.",
          improvedAnswer: "근로계약서 미작성과 최저임금 미지급은 사업주의 준법 의식 결여뿐만 아니라 청소년 근로에 대한 행정 감독의 사각지대라는 구조적 원인에서 비롯된다. 이를 해결하기 위해 표준근로계약서 작성을 전면 의무화하고 학교와 연계한 노동인권 교육 및 지자체 불시 점검을 제도화해야 한다."
        });
      }
      if (skillType === "SKILL_5") {
        return NextResponse.json({
          strength: "3단 구조 기획",
          improvement: "헌법 제10조 및 제도적 실천 방안 구체화",
          overallFeedback: "[현황/문제] -> [구조적 원인] -> [헌법/가치 기반 실천 방안]의 3단 뼈대를 갖추어 보세요.",
          modelAnswer: "현재 디지털 환경에서 미성년 시절의 정보가 무차별 확산되어 헌법 제10조 인격권이 침해되고 있다. 이는 플랫폼 기업의 정보 독점과 법적 삭제 청구권 부재라는 구조적 원인 때문이다. 따라서 헌법적 가치에 따라 '잊힐 권리'를 법제화하고 검색 배제 청구권을 신설해야 한다."
        });
      }
    }

    // 2. Gemini API 호출 시도 (환경 변수 확인)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        let systemPrompt = "";
        if (skillType === "SKILL_3") {
          systemPrompt = `당신은 고등학교 통합사회2 교사입니다. 학생이 쟁점에 대해 자신의 관점을 1문장으로 서술했습니다.
학생 답안: "${studentAnswer}"
선택한 관점: "${context?.stance || "자유권/공익"}"
쟁점: "${context?.topic || "기본권 충돌"}"
응답은 반드시 아래 JSON 형식으로만 반환하세요:
{"isCorrectStance": true, "recommendedTerms": ["용어1", "용어2"], "feedback": "피드백 문장", "hintTemplate": "개선 예시 문장"}`;
        } else if (skillType === "SKILL_4") {
          systemPrompt = `당신은 통합사회2 교사입니다. 학생이 제시된 사례의 문제 원인과 해결 방안(2~3문장)을 서술했습니다.
학생 답안: "${studentAnswer}"
사례: "${context?.problemCase || "청소년 노동인권 침해"}"
원인이 개인의 부주의인지(SURFACE) 법·제도/구조적 문제인지(STRUCTURAL) 판별하고 인과 일관성을 평가하세요.
응답은 반드시 아래 JSON 형식으로만 반환하세요:
{"causeCategory": "STRUCTURAL", "isConsistent": true, "feedback": "피드백 문장", "hintTemplate": "개선 힌트", "improvedAnswer": "개선된 2~3문장 예시"}`;
        } else {
          systemPrompt = `당신은 통합사회2 교사입니다. 서술형 응답을 첨삭합니다.
학생 답안: "${studentAnswer}"
평가 기준: 1. 표현의 적절성 (교과 개념 사용 여부) / 2. 논리적 타당성 (인과관계 연결)
응답은 반드시 아래 JSON 형식으로만 반환하세요:
{"strength": "잘된 점", "improvement": "보완할 점", "overallFeedback": "종합 총평", "modelAnswer": "모범 답안"}`;
        }

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
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
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to expert rule engine:", geminiErr);
      }
    }

    // 3. 전문 로컬 규칙 엔진 (오프라인 / 안전 폴백)
    const text = studentAnswer.trim();

    if (skillType === "SKILL_3") {
      const hasConstitutionalTerm = text.includes("자유") || text.includes("권리") || text.includes("헌법") || text.includes("보장") || text.includes("학습");
      return NextResponse.json({
        isCorrectStance: true,
        recommendedTerms: ["헌법 제10조 행복추구권", "비례의 원칙(과잉금지원칙)"],
        feedback: hasConstitutionalTerm
          ? "선택한 관점에 부합하며 핵심 기본권 개념을 타당하게 제시했습니다."
          : "주장은 명확하나 '헌법 제10조' 또는 '통신의 자유/학습권'과 같은 교과 전문 용어를 보강하면 더욱 설득력이 높아집니다.",
        hintTemplate: `${text} 이에 더하여 헌법상 비례원칙에 따른 자율적 규범 형성이 요구된다.`
      });
    }

    if (skillType === "SKILL_4") {
      const hasLawTerm = text.includes("법") || text.includes("제도") || text.includes("근로기준법") || text.includes("감독") || text.includes("의무화") || text.includes("정책");
      const category = hasLawTerm ? "STRUCTURAL" : "SURFACE";

      return NextResponse.json({
        causeCategory: category,
        isConsistent: true,
        feedback: hasLawTerm
          ? "원인 분석에서 법·제도적 구조를 정확히 짚었고, 근로기준법에 부합하는 실효성 있는 대안을 제시했습니다."
          : "개인의 도덕성뿐만 아니라 '근로기준법 준수 및 행정 감독 강화'와 같은 법·제도적 구조 원인을 함께 서술해 보세요.",
        hintTemplate: "[원인] 사업주의 준법 의식 부족 및 청소년 근로감독의 사각지대 [대안] 근로계약서 의무화 및 불시 점검 강화",
        improvedAnswer: "청소년 노동인권 침해는 개별 사업주의 준법 의식 결여뿐 아니라 행정적 근로감독의 한계라는 구조적 요인에서 기인한다. 따라서 표준근로계약서 작성을 강력히 의무화하고 위반 시 처벌을 강화하는 제도적 개선이 필수적이다."
      });
    }

    // SKILL_5
    const hasStructure = text.length >= 40 && (text.includes("침해") || text.includes("문제")) && (text.includes("원인") || text.includes("때문") || text.includes("인해")) && (text.includes("대안") || text.includes("제도") || text.includes("방안") || text.includes("필요"));

    return NextResponse.json({
      strength: hasStructure ? "현황, 구조적 원인, 헌법적 실천 대안의 3단 논증 완결성이 매우 높습니다." : "문제의식과 인권 보장 의도가 분명합니다.",
      improvement: hasStructure ? "헌법 제10조 인격권 및 제17조 사생활 보호 조문과의 연계를 더욱 선명히 하세요." : "[현황 ➔ 구조적 원인 ➔ 실천 방안]의 3단 구성을 갖추어 문장을 보강하세요.",
      overallFeedback: hasStructure ? "우수한 종합 성취수준(A)에 부합하는 모범적 서술입니다." : "핵심 교과 개념어를 추가하여 논리적 인과관계를 강화해 보세요.",
      modelAnswer: "현재 디지털 공간의 영구적 정보 보존으로 인해 미성년 시절의 사생활이 무차별 노출되어 헌법 제10조 인격권과 제17조 사생활의 비밀이 심각하게 침해되고 있다. 이는 플랫폼 기업의 데이터 독점과 법적 삭제 청구권 부재라는 구조적 원인에 기인한다. 따라서 헌법적 가치에 기반하여 미성년자 대상 '잊힐 권리'를 법제화하고 공익과 조화되는 검색 배제 청구권을 신설해야 한다."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Evaluation error" }, { status: 500 });
  }
}
