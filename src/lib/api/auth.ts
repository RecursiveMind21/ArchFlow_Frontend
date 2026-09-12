import { fetchWithAuth } from "./fetchWithAuth";
import { setTokens, clearTokens, getRefreshToken } from "../auth/tokens";

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  tandc: boolean;
}) {
  const res = await fetchWithAuth("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Register failed");
  }
  return res.json() as Promise<{ message: string; email: string }>;
}

export async function login(payload: { email: string; password: string }) {
  const res = await fetchWithAuth("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Login failed");
  }
  const data: { accessToken: string; refreshToken: string } = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function verifyOtp(payload: { email: string; otp: string }) {
  const res = await fetchWithAuth("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "OTP verification failed");
  }
  const data: { accessToken: string; refreshToken: string } = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function resendOtp(email: string) {
  const res = await fetchWithAuth(
    `/auth/resend-otp?email=${encodeURIComponent(email)}`,
    { method: "POST", skipAuth: true },
  );
  if (!res.ok) throw new Error("Failed to resend OTP");
  return res.text();
}

export async function me() {
  const res = await fetchWithAuth("/auth/me", { method: "GET" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json() as Promise<{
    authenticated: boolean;
    role: string;
    email: string;
    profileCompleted: boolean;
  }>;
}

export async function logout() {
  const refreshToken = getRefreshToken(); // ✅ use helper, not raw localStorage
  if (refreshToken) {
    await fetchWithAuth("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {}); // best-effort
  }
  clearTokens();
}
