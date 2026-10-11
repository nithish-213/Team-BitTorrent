import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("aetheros_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("aetheros_token") || null;
  });

  const [loading, setLoading] = useState(true);
  const apiBase = import.meta.env.VITE_API_URL || "/api";

  // Validate session on mount
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem("aetheros_user", JSON.stringify(data.user));
        } else {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem("aetheros_token");
          localStorage.removeItem("aetheros_user");
        }
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [token, apiBase]);

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Authentication failed.");
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("aetheros_token", data.token);
    localStorage.setItem("aetheros_user", JSON.stringify(data.user));

    return data.user;
  }, [apiBase]);

  const register = useCallback(async ({ username, email, name, password }) => {
    const res = await fetch(`${apiBase}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, name, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Registration failed.");
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("aetheros_token", data.token);
    localStorage.setItem("aetheros_user", JSON.stringify(data.user));

    return data.user;
  }, [apiBase]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${apiBase}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.warn("Logout request failed:", err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("aetheros_token");
      localStorage.removeItem("aetheros_user");
    }
  }, [token, apiBase]);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
