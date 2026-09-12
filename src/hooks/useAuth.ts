"use client";

import { useEffect, useState } from "react";
import { me } from "@/lib/api/auth";
import { getAccessToken, clearTokens, ACCESS_TOKEN_KEY, TOKEN_CHANGED_EVENT } from "@/lib/auth/tokens";

export type AuthUser = {
  email: string;
  role: string;
  profileCompleted: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await me();
      setUser({
        email: data.email,
        role: data.role,
        profileCompleted: data.profileCompleted,
      });
    } catch {
      clearTokens(); // token invalid / expired and refresh failed
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // Listen for custom token change events (from same tab)
    const handleTokenChange = () => {
      fetchUser();
    };

    window.addEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACCESS_TOKEN_KEY) {
        fetchUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return { user, loading };
}
