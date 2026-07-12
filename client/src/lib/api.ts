const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:3001/api";

type Tokens = {
  accessToken: string;
  refreshToken?: string;
};

const TOKENS_KEY = "transitops_tokens";

export const getStoredTokens = (): Tokens | null => {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeTokens = (tokens: Tokens | null) => {
  if (!tokens) {
    localStorage.removeItem(TOKENS_KEY);
    return;
  }
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
};

async function request<T>(path: string, opts: RequestInit = {}) {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (res.status === 401) {
    // Clear tokens on unauthorized
    storeTokens(null);
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (await res.json()) as T;
}

export async function login(email: string, password: string) {
  return request<{ accessToken: string; refreshToken?: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  ).then((data) => {
    storeTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data;
  });
}

export async function getDashboardOrganization() {
  return request<any>("/dashboard/organization");
}

export async function getDashboardGlobal() {
  return request<any>("/dashboard/global");
}

export async function logout() {
  const tokens = getStoredTokens();
  if (!tokens?.refreshToken) {
    storeTokens(null);
    return;
  }
  try {
    await request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
  } finally {
    storeTokens(null);
  }
}

export default {
  API_BASE,
  getStoredTokens,
  storeTokens,
  login,
  getDashboardOrganization,
  getDashboardGlobal,
  logout,
};
