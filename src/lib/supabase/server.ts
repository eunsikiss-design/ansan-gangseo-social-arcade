import { createClient, type Session, type User } from "@supabase/supabase-js";

const ACCESS_COOKIE = "arca_access_token";
const REFRESH_COOKIE = "arca_refresh_token";

export type ServerProfile = {
  id: string;
  student_id: string;
  role: "student" | "teacher";
  display_name: string;
  grade: string;
  class_name: string;
  student_number: string;
  school_name: string;
  must_change_password: boolean;
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function getSupabaseAdmin() {
  return createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabaseAuthClient() {
  return createClient(required("SUPABASE_URL"), required("SUPABASE_ANON_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function accountEmail(studentId: string) {
  return `${studentId.trim().toLowerCase()}@social-arcade.local`;
}

export function parseAccountId(rawId: string) {
  const studentId = rawId.trim().toUpperCase();
  const teacher = studentId.match(/^SCT(0[1-9]|10)$/);
  if (teacher) {
    return { valid: true as const, studentId, role: "teacher" as const, grade: "1학년", className: "교무실", studentNumber: "지도" };
  }
  const student = studentId.match(/^SC(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-6])$/);
  if (student) {
    return {
      valid: true as const,
      studentId,
      role: "student" as const,
      grade: "1학년",
      className: `${Number(student[1])}반`,
      studentNumber: `${Number(student[2])}번`,
    };
  }
  return { valid: false as const, studentId };
}

function cookieMap(request: Request) {
  return Object.fromEntries((request.headers.get("cookie") || "").split(";").map((part) => {
    const separator = part.indexOf("=");
    if (separator < 0) return [part.trim(), ""];
    return [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1))];
  }).filter(([key]) => key));
}

export async function authenticateRequest(request: Request): Promise<{ user: User | null; refreshedSession?: Session }> {
  const cookies = cookieMap(request);
  const accessToken = cookies[ACCESS_COOKIE];
  if (accessToken) {
    const { data } = await getSupabaseAdmin().auth.getUser(accessToken);
    if (data.user) return { user: data.user };
  }
  const refreshToken = cookies[REFRESH_COOKIE];
  if (!refreshToken) return { user: null };
  const { data, error } = await getSupabaseAuthClient().auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session || !data.user) return { user: null };
  return { user: data.user, refreshedSession: data.session };
}

function cookieValue(name: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function applySessionCookies(response: Response, session: Session) {
  response.headers.append("Set-Cookie", cookieValue(ACCESS_COOKIE, session.access_token, Math.max(60, session.expires_in || 3600)));
  response.headers.append("Set-Cookie", cookieValue(REFRESH_COOKIE, session.refresh_token, 60 * 60 * 24 * 30));
}

export function clearSessionCookies(response: Response) {
  response.headers.append("Set-Cookie", cookieValue(ACCESS_COOKIE, "", 0));
  response.headers.append("Set-Cookie", cookieValue(REFRESH_COOKIE, "", 0));
}

export async function getProfile(userId: string) {
  const { data, error } = await getSupabaseAdmin().from("profiles").select("*").eq("id", userId).single();
  if (error) return null;
  return data as ServerProfile;
}

export function publicProfile(profile: ServerProfile) {
  return {
    studentId: profile.student_id,
    role: profile.role,
    grade: profile.grade,
    classNum: profile.class_name,
    studentNum: profile.student_number,
    name: profile.display_name,
    mustChangePassword: profile.must_change_password,
    isLoggedIn: true,
    schoolName: profile.school_name,
  };
}

