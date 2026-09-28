import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "https://aslaldigital.com";
const SESSION_KEY = "aslal.session";
const WORKSPACE_KEY = "aslal.workspace";
const DEVICE_KEY = "aslal.device";

async function getSession() {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function setWorkspace(workspaceId: string) {
  await SecureStore.setItemAsync(WORKSPACE_KEY, workspaceId);
}

async function getWorkspace() {
  return SecureStore.getItemAsync(WORKSPACE_KEY);
}

export async function getDeviceId() {
  const existing = await SecureStore.getItemAsync(DEVICE_KEY);
  if (existing) return existing;
  const deviceId = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await SecureStore.setItemAsync(DEVICE_KEY, deviceId);
  return deviceId;
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
  await SecureStore.deleteItemAsync(WORKSPACE_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = await getSession();
  const workspace = await getWorkspace();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");

  const cookies: string[] = [];
  if (session) cookies.push(`aslal_session=${session}`);
  if (workspace) cookies.push(`aslal_workspace_id=${workspace}`);
  if (cookies.length) headers.set("Cookie", cookies.join("; "));

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.error === "string" ? body.error : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  clientType: string | null;
  active: boolean;
};

export type Bootstrap = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
  workspaces: Workspace[];
};

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-aslal-client": "mobile",
    },
    body: JSON.stringify({ email, password }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || typeof body.sessionToken !== "string") {
    throw new Error(typeof body?.error === "string" ? body.error : "Unable to sign in.");
  }

  await SecureStore.setItemAsync(SESSION_KEY, body.sessionToken);
  return body as { ok: true; sessionToken: string };
}

export async function bootstrap() {
  return request<Bootstrap>("/api/mobile/bootstrap");
}

export async function refreshSession() {
  const response = await request<{ ok: true; sessionToken?: string }>("/api/auth/heartbeat", {
    method: "POST",
    headers: { "x-aslal-client": "mobile" },
  });
  if (response.sessionToken) await SecureStore.setItemAsync(SESSION_KEY, response.sessionToken);
  return response;
}

export async function ping() {
  return request<{ ok: boolean }>("/api/auth/heartbeat", {
    method: "POST",
    headers: { "x-aslal-client": "mobile" },
  });
}

export type MobileLead = {
  id: string; name: string; email: string | null; phone: string | null; company: string | null;
  businessType: string | null; status: string; score: number; source: string | null; campaign: string | null;
  referralCode: string | null; ownerEmail: string | null; nextAction: string | null; nextActionDueAt: string | null;
  dealValue: string | number | null; captureMode: string; createdAt: string; updatedAt: string;
  tasks: Array<{ id: string; title: string; status: string; priority: string; dueAt: string | null; assignedTo: string | null }>;
};

export async function getLeads(options: { status?: string; q?: string; page?: number } = {}) {
  const workspace = await getWorkspace();
  if (!workspace) throw new Error("Choose a workspace first.");
  const params = new URLSearchParams({ workspaceId: workspace });
  if (options.status) params.set("status", options.status);
  if (options.q) params.set("q", options.q);
  if (options.page) params.set("page", String(options.page));
  return request<{ workspaceId: string; page: number; pageSize: number; total: number; leads: MobileLead[] }>(`/api/mobile/leads?${params.toString()}`);
}

export async function getLead(id: string) {
  const workspace = await getWorkspace();
  if (!workspace) throw new Error("Choose a workspace first.");
  return request<{ lead: MobileLead & {
    message: string | null; telegramUsername: string | null; medium: string | null; leadCategory: string | null; wonAt: string | null;
    stageHistory: Array<{ fromStage: string | null; toStage: string; changedBy: string | null; note: string | null; createdAt: string }>;
    productInterests: Array<{ id: string; interestScore: number; product: { id: string; slug: string; name: string; kind: string } }>;
    conversations: Array<{ id: string; channel: string; status: string; assignedTo: string | null; lastMessageAt: string | null; updatedAt: string }>;
  }> }>(`/api/mobile/leads/${encodeURIComponent(id)}?workspaceId=${encodeURIComponent(workspace)}`);
}