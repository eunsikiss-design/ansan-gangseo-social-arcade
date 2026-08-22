import { NextResponse } from "next/server";
import { applySessionCookies, authenticateRequest, getProfile, getSupabaseAdmin } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth.user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const profile = await getProfile(auth.user.id);
  if (!profile || profile.role !== "teacher") return NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 });
  const admin = getSupabaseAdmin();
  const [students, active] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    admin.from("activity_snapshots").select("user_id", { count: "exact", head: true }),
  ]);
  const response = NextResponse.json({ studentCount: students.count || 0, activeStudentCount: active.count || 0, classCount: 12 });
  if (auth.refreshedSession) applySessionCookies(response, auth.refreshedSession);
  return response;
}

