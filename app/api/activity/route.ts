import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ActivityPayload = {
  studentId: string;
  displayName: string;
  className: string;
  score: number;
  loginCount: number;
  save: unknown;
};

async function ensureTable() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS activity_snapshots (
    student_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    login_count INTEGER NOT NULL DEFAULT 0,
    save_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS activity_score_idx ON activity_snapshots(score DESC)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS activity_class_idx ON activity_snapshots(class_name, score DESC)").run();
}

export async function GET(request: Request) {
  try {
    await ensureTable();
    const url = new URL(request.url);
    const studentId = url.searchParams.get("studentId") || "";
    const className = url.searchParams.get("className") || "";
    const [school, classBoard, own] = await Promise.all([
      env.DB.prepare("SELECT student_id AS studentId, display_name AS displayName, class_name AS className, score, updated_at AS updatedAt FROM activity_snapshots ORDER BY score DESC, updated_at ASC LIMIT 5").all(),
      className
        ? env.DB.prepare("SELECT student_id AS studentId, display_name AS displayName, class_name AS className, score, updated_at AS updatedAt FROM activity_snapshots WHERE class_name = ? ORDER BY score DESC, updated_at ASC LIMIT 3").bind(className).all()
        : Promise.resolve({ results: [] }),
      studentId
        ? env.DB.prepare("SELECT student_id AS studentId, display_name AS displayName, class_name AS className, score, login_count AS loginCount, save_json AS saveJson, updated_at AS updatedAt FROM activity_snapshots WHERE student_id = ?").bind(studentId).first()
        : Promise.resolve(null),
    ]);
    const count = studentId
      ? await env.DB.prepare("SELECT COUNT(*) + 1 AS rank FROM activity_snapshots WHERE score > COALESCE((SELECT score FROM activity_snapshots WHERE student_id = ?), -1)").bind(studentId).first<{ rank: number }>()
      : null;
    return NextResponse.json({
      live: true,
      schoolTop5: school.results,
      classTop3: classBoard.results,
      currentRank: count?.rank ?? null,
      savedState: own ? { ...own, save: JSON.parse(String((own as Record<string, unknown>).saveJson || "{}")) } : null,
    });
  } catch (error) {
    return NextResponse.json({ live: false, schoolTop5: [], classTop3: [], currentRank: null, savedState: null, error: String(error) });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json() as ActivityPayload;
    if (!body.studentId || !body.className) return NextResponse.json({ error: "studentId and className are required" }, { status: 400 });
    await env.DB.prepare(`INSERT INTO activity_snapshots
      (student_id, display_name, class_name, score, login_count, save_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET
        display_name = excluded.display_name,
        class_name = excluded.class_name,
        score = excluded.score,
        login_count = excluded.login_count,
        save_json = excluded.save_json,
        updated_at = excluded.updated_at`)
      .bind(body.studentId, body.displayName, body.className, Math.max(0, Math.round(body.score || 0)), Math.max(0, Math.round(body.loginCount || 0)), JSON.stringify(body.save ?? {}), Date.now())
      .run();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
