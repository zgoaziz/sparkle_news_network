import { useState, useCallback } from "react";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "user";
  avatar?: string | null;
  status: "active" | "disabled";
  createdAt: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    try {
      const storedToken = localStorage.getItem("sparkle_token");
      const storedUser = localStorage.getItem("sparkle_user");
      return {
        token: storedToken || null,
        user: storedUser ? JSON.parse(storedUser) : null,
      };
    } catch {
      return { token: null, user: null };
    }
  });

  const login = useCallback((token: string, user: UserProfile) => {
    localStorage.setItem("sparkle_token", token);
    localStorage.setItem("sparkle_user", JSON.stringify(user));
    setAuthState({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sparkle_token");
    localStorage.removeItem("sparkle_user");
    setAuthState({ token: null, user: null });
  }, []);

  const updateUser = useCallback((user: UserProfile) => {
    localStorage.setItem("sparkle_user", JSON.stringify(user));
    setAuthState((prev) => ({ ...prev, user }));
  }, []);

  return {
    ...authState,
    login,
    logout,
    updateUser,
    isAuthenticated: !!authState.token,
    isAdmin: authState.user?.role === "admin" || authState.user?.role === "editor",
  };
}
