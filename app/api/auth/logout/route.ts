import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/src/lib/supabase/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearSessionCookies(response);
  return response;
}

