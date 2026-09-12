// src/lib/api/fetchWithAuth.ts
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../auth/tokens";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type FetchWithAuthOptions = RequestInit & { skipAuth?: boolean };

let refreshPromise: Promise<void> | null = null;

async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    throw new Error("No refresh token");
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Failed to refresh token");
  }

  const data: { accessToken: string; refreshToken: string } = await res.json();
  setTokens(data.accessToken, data.refreshToken);
}

export async function fetchWithAuth(
  input: string,
  init: FetchWithAuthOptions = {},
) {
  const { skipAuth, headers, ...rest } = init;
  let accessToken = getAccessToken();

  const makeRequest = async (): Promise<Response> => {
    const finalHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...(headers || {}),
    };

    if (!skipAuth && accessToken) {
      (finalHeaders as any).Authorization = `Bearer ${accessToken}`;
    }

    return fetch(`${API_BASE_URL}${input}`, {
      ...rest,
      headers: finalHeaders,
    });
  };

  let res = await makeRequest();

  if (res.status !== 401 || skipAuth) {
    return res;
  }

  // 401 – try refresh (single shared refresh in progress)
  if (!refreshPromise) {
    refreshPromise = refreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    await refreshPromise;
    // tokens updated
    accessToken = getAccessToken();
    res = await makeRequest();
    return res;
  } catch {
    // refresh failed -> logout client-side
    clearTokens();
    return res; // 401
  }
}
