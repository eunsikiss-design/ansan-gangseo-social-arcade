import type { StudentProfile } from "./types";

type AuthResult = { success: boolean; profile?: StudentProfile; mustChangePassword?: boolean; error?: string };

export async function authenticateUserServer(userId: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.profile) return { success: false, error: data.error || "로그인에 실패했습니다." };
    return { success: true, profile: data.profile, mustChangePassword: Boolean(data.mustChangePassword) };
  } catch {
    return { success: false, error: "로그인 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." };
  }
}

export async function changeUserPasswordServer(password: string, name: string): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, name }),
    });
    const data = await response.json();
    if (!response.ok || !data.profile) return { success: false, error: data.error || "정보 변경에 실패했습니다." };
    return { success: true, profile: data.profile, mustChangePassword: false };
  } catch {
    return { success: false, error: "서버에 연결할 수 없습니다." };
  }
}

export async function logoutUserServer() {
  try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* local logout continues */ }
}

