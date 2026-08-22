import { NextResponse } from "next/server";
import {
  accountEmail, applySessionCookies, getSupabaseAdmin, getSupabaseAuthClient,
  parseAccountId, publicProfile,
} from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";
const INITIAL_PASSWORD = "123456789!";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userId?: string; password?: string };
    const parsed = parseAccountId(body.userId || "");
    const password = String(body.password || "");
    if (!parsed.valid || !password) {
      return NextResponse.json({ error: "아이디 형식 또는 비밀번호를 확인해 주세요." }, { status: 400 });
    }

    const auth = getSupabaseAuthClient();
    let result = await auth.auth.signInWithPassword({ email: accountEmail(parsed.studentId), password });
    if (result.error && parsed.role === "student" && password === INITIAL_PASSWORD) {
      const admin = getSupabaseAdmin();
      const created = await admin.auth.admin.createUser({
        email: accountEmail(parsed.studentId), password, email_confirm: true,
        user_metadata: { student_id: parsed.studentId, role: parsed.role },
      });
      if (!created.error && created.data.user) {
        await admin.from("profiles").upsert({
          id: created.data.user.id, student_id: parsed.studentId, role: parsed.role,
          display_name: `${parsed.className} ${parsed.studentNumber} 탐구관`, grade: parsed.grade,
          class_name: parsed.className, student_number: parsed.studentNumber,
          school_name: "안산강서고등학교", must_change_password: true,
          last_login_at: new Date().toISOString(),
        }, { onConflict: "id" });
        result = await auth.auth.signInWithPassword({ email: accountEmail(parsed.studentId), password });
      }
    }

    if (result.error || !result.data.session || !result.data.user) {
      const message = parsed.role === "teacher"
        ? "교사 계정이 아직 발급되지 않았거나 비밀번호가 올바르지 않습니다."
        : "아이디 또는 비밀번호가 올바르지 않습니다.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: profile } = await admin.from("profiles").select("*").eq("id", result.data.user.id).single();
    if (!profile) return NextResponse.json({ error: "학급 프로필을 찾을 수 없습니다." }, { status: 403 });
    await admin.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", result.data.user.id);
    const response = NextResponse.json({ profile: publicProfile(profile), mustChangePassword: profile.must_change_password });
    applySessionCookies(response, result.data.session);
    return response;
  } catch (error) {
    return NextResponse.json({ error: `로그인 서버 오류: ${String(error)}` }, { status: 500 });
  }
}

