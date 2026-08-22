import { NextResponse } from "next/server";
import { applySessionCookies, authenticateRequest, getProfile, publicProfile } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (!auth.user) return NextResponse.json({ authenticated: false }, { status: 401 });
  const profile = await getProfile(auth.user.id);
  if (!profile) return NextResponse.json({ authenticated: false }, { status: 403 });
  const response = NextResponse.json({ authenticated: true, profile: publicProfile(profile) });
  if (auth.refreshedSession) applySessionCookies(response, auth.refreshedSession);
  return response;
}

