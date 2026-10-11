import React, { useState } from "react";
import { Shield, Lock, User, Mail, UserPlus, ArrowRight, AlertCircle, Database, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("signin"); // "signin" | "register"

  // Login form state
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("AdminPassword123!");

  // Registration form state
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        name: regFullName.trim() || regUsername.trim(),
        password: regPassword
      });
      setSuccessMsg("Account created! Redirecting to workspace...");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === "admin") {
      setUsername("admin");
      setPassword("AdminPassword123!");
    } else {
      setUsername("user");
      setPassword("UserPassword123!");
    }
    setError("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.15), rgba(15, 23, 42, 1) 70%)",
        padding: "20px"
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "36px",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.12)"
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
              boxShadow: "0 8px 20px rgba(59, 130, 246, 0.4)",
              color: "#fff",
              fontWeight: "800",
              fontSize: "24px",
              marginBottom: "14px"
            }}
          >
            æ
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-main)" }}>
            AetherOS Enterprise
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            {mode === "signin"
              ? "Sign in to access your business operations workspace"
              : "Create a new MongoDB Atlas user account"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            background: "rgba(255, 255, 255, 0.04)",
            padding: "4px",
            borderRadius: "10px",
            marginBottom: "20px",
            border: "1px solid var(--border-color)"
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccessMsg("");
            }}
            style={{
              padding: "8px 12px",
              fontSize: "12.5px",
              fontWeight: "600",
              borderRadius: "7px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: mode === "signin" ? "var(--accent-blue)" : "transparent",
              color: mode === "signin" ? "#fff" : "var(--text-muted)"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
              setSuccessMsg("");
            }}
            style={{
              padding: "8px 12px",
              fontSize: "12.5px",
              fontWeight: "600",
              borderRadius: "7px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              background: mode === "register" ? "var(--accent-blue)" : "transparent",
              color: mode === "register" ? "#fff" : "var(--text-muted)"
            }}
          >
            Create Account
          </button>
        </div>

        {/* Demo Credentials Quick Switcher (Only in signin mode) */}
        {mode === "signin" && (
          <div
            style={{
              marginBottom: "20px",
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-color)",
              fontSize: "12px"
            }}
          >
            <div style={{ color: "var(--text-dim)", marginBottom: "8px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <Database size={13} color="var(--accent-cyan)" /> MongoDB Atlas Demo Accounts:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleQuickFill("admin")}
                style={{
                  fontSize: "11.5px",
                  padding: "6px 8px",
                  justifyContent: "center",
                  borderColor: username === "admin" ? "var(--accent-blue)" : undefined
                }}
              >
                👑 Admin Demo
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleQuickFill("user")}
                style={{
                  fontSize: "11.5px",
                  padding: "6px 8px",
                  justifyContent: "center",
                  borderColor: username === "user" ? "var(--accent-emerald)" : undefined
                }}
              >
                👤 Regular User Demo
              </button>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#6ee7b7",
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {mode === "signin" ? (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                Username or Corporate Email
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <User size={15} style={{ position: "absolute", left: "10px", color: "var(--text-dim)" }} />
                <input
                  type="text"
                  required
                  className="select-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username (e.g. admin or user)"
                  style={{ width: "100%", paddingLeft: "32px", fontSize: "13px", height: "38px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Lock size={15} style={{ position: "absolute", left: "10px", color: "var(--text-dim)" }} />
                <input
                  type="password"
                  required
                  className="select-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ width: "100%", paddingLeft: "32px", fontSize: "13px", height: "38px" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: "100%", justifyContent: "center", height: "40px", fontSize: "13.5px" }}
            >
              {submitting ? "Signing in..." : <>Sign In to Workspace <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                Full Name
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <User size={15} style={{ position: "absolute", left: "10px", color: "var(--text-dim)" }} />
                <input
                  type="text"
                  required
                  className="select-control"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  style={{ width: "100%", paddingLeft: "32px", fontSize: "13px", height: "38px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                Username
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <UserPlus size={15} style={{ position: "absolute", left: "10px", color: "var(--text-dim)" }} />
                <input
                  type="text"
                  required
                  className="select-control"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Choose a username (min 3 chars)"
                  style={{ width: "100%", paddingLeft: "32px", fontSize: "13px", height: "38px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                Corporate Email
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Mail size={15} style={{ position: "absolute", left: "10px", color: "var(--text-dim)" }} />
                <input
                  type="email"
                  required
                  className="select-control"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width: "100%", paddingLeft: "32px", fontSize: "13px", height: "38px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "22px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Password
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={15} style={{ position: "absolute", left: "10px", color: "var(--text-dim)" }} />
                  <input
                    type="password"
                    required
                    className="select-control"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    style={{ width: "100%", paddingLeft: "32px", fontSize: "13px", height: "38px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Confirm
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <Lock size={15} style={{ position: "absolute", left: "10px", color: "var(--text-dim)" }} />
                  <input
                    type="password"
                    required
                    className="select-control"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat pwd"
                    style={{ width: "100%", paddingLeft: "32px", fontSize: "13px", height: "38px" }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: "100%", justifyContent: "center", height: "40px", fontSize: "13.5px" }}
            >
              {submitting ? "Registering..." : <>Create Account & Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "11px", color: "var(--text-dim)" }}>
            <Shield size={13} color="#10b981" />
            MongoDB Atlas RBAC & Salted PBKDF2 Password Protection
          </div>
        </div>
      </div>
    </div>
  );
}
