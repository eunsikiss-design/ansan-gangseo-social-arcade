import { NextResponse } from "next/server";
import { applySessionCookies, authenticateRequest, getProfile, getSupabaseAdmin } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";
type ActivityPayload = { score?: number; loginCount?: number; save?: unknown };

function safeSave(input: unknown) {
  if (!input || typeof input !== "object") return {};
  const save = structuredClone(input) as Record<string, unknown>;
  if (save.studentProfile && typeof save.studentProfile === "object") delete (save.studentProfile as Record<string, unknown>).password;
  return save;
}
function leaderboardRow(row: Record<string, unknown>) {
  const profile = row.profiles as Record<string, unknown>;
  return {
    studentId: profile.student_id, displayName: profile.display_name, className: profile.class_name,
    score: row.score, updatedAt: new Date(String(row.updated_at)).getTime(),
  };
}

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    const admin = getSupabaseAdmin();
    const profile = await getProfile(auth.user.id);
    if (!profile) return NextResponse.json({ error: "프로필을 찾을 수 없습니다." }, { status: 403 });
    const [schoolResult, classProfilesResult, ownResult] = await Promise.all([
      admin.from("activity_snapshots").select("score, updated_at, profiles!inner(student_id, display_name, class_name)").order("score", { ascending: false }).order("updated_at", { ascending: true }).limit(5),
      admin.from("profiles").select("id").eq("class_name", profile.class_name),
      admin.from("activity_snapshots").select("score, login_count, save_data, updated_at").eq("user_id", auth.user.id).maybeSingle(),
    ]);
    const classIds = (classProfilesResult.data || []).map((row) => row.id);
    const classResult = classIds.length
      ? await admin.from("activity_snapshots").select("score, updated_at, profiles!inner(student_id, display_name, class_name)").in("user_id", classIds).order("score", { ascending: false }).order("updated_at", { ascending: true }).limit(3)
      : { data: [] };
    const ownScore = ownResult.data?.score ?? -1;
    const rankResult = ownScore >= 0
      ? await admin.from("activity_snapshots").select("user_id", { count: "exact", head: true }).gt("score", ownScore)
      : { count: null };
    const own = ownResult.data;
    const response = NextResponse.json({
      live: !schoolResult.error,
      schoolTop5: (schoolResult.data || []).map((row) => leaderboardRow(row as unknown as Record<string, unknown>)),
      classTop3: (classResult.data || []).map((row) => leaderboardRow(row as unknown as Record<string, unknown>)),
      currentRank: own ? (rankResult.count || 0) + 1 : null,
      savedState: own ? {
        studentId: profile.student_id, displayName: profile.display_name, className: profile.class_name,
        score: own.score, loginCount: own.login_count, save: own.save_data, updatedAt: new Date(own.updated_at).getTime(),
      } : null,
    });
    if (auth.refreshedSession) applySessionCookies(response, auth.refreshedSession);
    return response;
  } catch (error) {
    return NextResponse.json({ live: false, schoolTop5: [], classTop3: [], currentRank: null, savedState: null, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    if (!await getProfile(auth.user.id)) return NextResponse.json({ error: "프로필을 찾을 수 없습니다." }, { status: 403 });
    const body = await request.json() as ActivityPayload;
    const { error } = await getSupabaseAdmin().from("activity_snapshots").upsert({
      user_id: auth.user.id,
      score: Math.max(0, Math.round(Number(body.score) || 0)),
      login_count: Math.max(0, Math.round(Number(body.loginCount) || 0)),
      save_data: safeSave(body.save), updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const response = NextResponse.json({ success: true });
    if (auth.refreshedSession) applySessionCookies(response, auth.refreshedSession);
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
