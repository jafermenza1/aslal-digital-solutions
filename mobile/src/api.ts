import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "https://aslaldigital.com";
const SESSION_KEY = "aslal.session";
const WORKSPACE_KEY = "aslal.workspace";

async function getSession() {
  return SecureStore.getItemAsync(SESSION_KEY);
}

async function getWorkspace() {
  return SecureStore.getItemAsync(WORKSPACE_KEY);
}

export async function setWorkspace(workspaceId: string) {
  await SecureStore.setItemAsync(WORKSPACE_KEY, workspaceId);
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

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
  client_type: string | null;
  active: number;
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

export async function overview() {
  return request<{
    visitors: number;
    leads: number;
    hotLeads: number;
    events: Array<{ event_name: string; count: number }>;
  }>("/api/admin/overview");
}

export async function refreshSession() {
  const response = await request<{ ok: true; sessionToken?: string }>("/api/auth/heartbeat", {
    method: "POST",
    headers: { "x-aslal-client": "mobile" },
  });
  if (response.sessionToken) await SecureStore.setItemAsync(SESSION_KEY, response.sessionToken);
  return response;
}
