import { StudentProfile, UserRole } from "./types";

export const DEFAULT_INITIAL_PASSWORD = "123456789!";
export const ACCOUNTS_STORAGE_KEY = "social-arcade-accounts-v2";

export interface AccountRecord {
  id: string;
  role: UserRole;
  passwordHash: string;
  name: string;
  grade: string;
  classNum: string;
  studentNum: string;
  schoolName: string;
  mustChangePassword: boolean;
  createdAt: number;
  lastLoginAt: number;
}

// Check ID format
export function parseUserId(rawId: string): { valid: boolean; role: UserRole; classNum?: string; studentNum?: string; label?: string } {
  const clean = rawId.trim().toUpperCase();
  
  // Teacher ID: SCT01 ~ SCT10
  const teacherMatch = clean.match(/^SCT(0[1-9]|10)$/);
  if (teacherMatch) {
    const tNum = parseInt(teacherMatch[1], 10);
    return {
      valid: true,
      role: "teacher",
      label: `통합사회 지도교사 (${tNum}호)`,
    };
  }

  // Student ID: SC + Class(01~12) + Num(01~26)
  const studentMatch = clean.match(/^SC(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-6])$/);
  if (studentMatch) {
    const cNum = parseInt(studentMatch[1], 10);
    const sNum = parseInt(studentMatch[2], 10);
    return {
      valid: true,
      role: "student",
      classNum: `${cNum}반`,
      studentNum: `${sNum}번`,
      label: `1학년 ${cNum}반 ${sNum}번`,
    };
  }

  return { valid: false, role: "guest" };
}

// Load all saved accounts from localStorage
export function loadAccounts(): Record<string, AccountRecord> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Save accounts map to localStorage
export function saveAccounts(accounts: Record<string, AccountRecord>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Failed to save accounts:", err);
  }
}

// Get or initialize account record
export function getOrCreateAccount(id: string, defaultName?: string): AccountRecord | null {
  const parsed = parseUserId(id);
  if (!parsed.valid) return null;

  const cleanId = id.trim().toUpperCase();
  const accounts = loadAccounts();

  if (accounts[cleanId]) {
    return accounts[cleanId];
  }

  // Create new default account
  const isTeacher = parsed.role === "teacher";
  const newAccount: AccountRecord = {
    id: cleanId,
    role: parsed.role,
    passwordHash: DEFAULT_INITIAL_PASSWORD,
    name: defaultName || (isTeacher ? `지도교사 (${cleanId})` : `${parsed.classNum} ${parsed.studentNum} 탐구관`),
    grade: "1학년",
    classNum: parsed.classNum || "교무실",
    studentNum: parsed.studentNum || "지도",
    schoolName: "안산강서고등학교",
    mustChangePassword: true, // Must change password on first login
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  accounts[cleanId] = newAccount;
  saveAccounts(accounts);
  return newAccount;
}

// Authenticate user
export function authenticateUser(
  rawId: string,
  rawPw: string
): { success: boolean; profile?: StudentProfile; mustChangePassword?: boolean; error?: string } {
  const parsed = parseUserId(rawId);
  if (!parsed.valid) {
    return {
      success: false,
      error: "아이디 형식이 올바르지 않습니다.\n• 학생 ID: SC0101~SC1226 (예: 1반 8번 -> SC0108)\n• 교사 ID: SCT01~SCT10",
    };
  }

  const cleanId = rawId.trim().toUpperCase();
  const account = getOrCreateAccount(cleanId);
  if (!account) {
    return { success: false, error: "계정 생성 또는 조회에 실패했습니다." };
  }

  if (account.passwordHash !== rawPw.trim()) {
    return { success: false, error: "비밀번호가 일치하지 않습니다. (최초 비밀번호: 123456789!)" };
  }

  // Update last login
  const accounts = loadAccounts();
  accounts[cleanId] = { ...account, lastLoginAt: Date.now() };
  saveAccounts(accounts);

  const profile: StudentProfile = {
    studentId: account.id,
    role: account.role,
    grade: account.grade,
    classNum: account.classNum,
    studentNum: account.studentNum,
    name: account.name,
    password: account.passwordHash,
    mustChangePassword: account.mustChangePassword,
    isLoggedIn: true,
    schoolName: account.schoolName,
  };

  return {
    success: true,
    profile,
    mustChangePassword: account.mustChangePassword,
  };
}

// Change Password
export function changeUserPassword(id: string, newPw: string, newName?: string): boolean {
  const cleanId = id.trim().toUpperCase();
  const accounts = loadAccounts();
  const account = accounts[cleanId];
  if (!account) return false;

  accounts[cleanId] = {
    ...account,
    passwordHash: newPw.trim(),
    name: newName ? newName.trim() : account.name,
    mustChangePassword: false, // successfully changed
  };
  saveAccounts(accounts);
  return true;
}

// Update profile name
export function updateProfileName(id: string, newName: string): boolean {
  const cleanId = id.trim().toUpperCase();
  const accounts = loadAccounts();
  const account = accounts[cleanId];
  if (!account) return false;

  accounts[cleanId] = {
    ...account,
    name: newName.trim(),
  };
  saveAccounts(accounts);
  return true;
}
