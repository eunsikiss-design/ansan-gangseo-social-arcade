import { NextResponse } from "next/server";
import { accountEmail, applySessionCookies, authenticateRequest, getSupabaseAdmin, getSupabaseAuthClient, publicProfile } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.user) return NextResponse.json({ error: "로그인이 만료되었습니다." }, { status: 401 });
    const body = await request.json() as { password?: string; name?: string };
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    if (password.length < 8 || !name) return NextResponse.json({ error: "이름과 8자 이상의 새 비밀번호를 입력해 주세요." }, { status: 400 });
    const admin = getSupabaseAdmin();
    const updatedUser = await admin.auth.admin.updateUserById(auth.user.id, { password });
    if (updatedUser.error) return NextResponse.json({ error: updatedUser.error.message }, { status: 400 });
    const { data: profile, error } = await admin.from("profiles").update({ display_name: name, must_change_password: false }).eq("id", auth.user.id).select("*").single();
    if (error || !profile) return NextResponse.json({ error: "프로필 수정에 실패했습니다." }, { status: 500 });
    const renewed = await getSupabaseAuthClient().auth.signInWithPassword({ email: accountEmail(profile.student_id), password });
    if (renewed.error || !renewed.data.session) return NextResponse.json({ error: "비밀번호는 변경됐지만 새 로그인 세션을 만들지 못했습니다. 다시 로그인해 주세요." }, { status: 409 });
    const response = NextResponse.json({ success: true, profile: publicProfile(profile) });
    applySessionCookies(response, renewed.data.session);
    return response;
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
