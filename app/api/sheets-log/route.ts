import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { logType, data } = body || {};

    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    // Webhook URL이 설정되어 있으면 구글 Apps Script로 전달
    if (webhookUrl && webhookUrl.startsWith("http")) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logType, // "GAME_RESULT" | "AI_LOG"
            timestamp: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
            ...data,
          }),
        });
      } catch (fErr) {
        console.warn("Google Sheet webhook delivery failed:", fErr);
      }
    }

    return NextResponse.json({ success: true, logged: true });
  } catch (err: any) {
    console.error("Sheets log API error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to log" }, { status: 500 });
  }
}
