import React, { useState } from "react";
import { Activity, Menu, LogOut, Shield, User } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UIStateProvider, useUIState } from "./context/UIStateContext";
import NoCodePlatform from "./components/NoCodePlatform";
import AgentSidecar from "./components/AgentSidecar";
import KPIInspector from "./components/KPIInspector";
import LoginPage from "./components/LoginPage";

function MainContent() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const { sessionTraces } = useUIState();
  const { user, logout, isAdmin } = useAuth();

  const reqCount = sessionTraces.length;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top Navbar */}
      <header className="nav-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle Navigation"
          >
            <Menu size={22} />
          </button>
          
          <div className="brand-logo">
            <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", padding: "4px 8px", borderRadius: "6px", color: "#fff", display: "flex", fontWeight: "800", fontSize: "14px" }}>
              æ
            </div>
            <div>
              <span>AetherOS Enterprise</span>
              <span style={{ fontSize: "11.5px", color: "var(--text-muted)", marginLeft: "8px", fontWeight: "400" }}>
                Context-Aware Application Agent
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* User Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: "20px", border: "1px solid var(--border-color)" }}>
            {isAdmin ? (
              <span className="badge-pill indigo" style={{ fontSize: "9.5px", padding: "1px 6px" }}>
                <Shield size={10} style={{ display: "inline", marginRight: "3px" }} /> ADMIN
              </span>
            ) : (
              <span className="badge-pill emerald" style={{ fontSize: "9.5px", padding: "1px 6px" }}>
                <User size={10} style={{ display: "inline", marginRight: "3px" }} /> USER
              </span>
            )}
            <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{user?.name || user?.username}</span>
          </div>

          {/* ADMIN INTERFACE: Performance & Trace Inspector (Strictly hidden for regular users) */}
          {isAdmin && (
            <button
              className="btn-secondary"
              onClick={() => setIsKpiModalOpen(true)}
              style={{ fontSize: "12px", padding: "6px 12px", borderColor: "rgba(99, 102, 241, 0.4)" }}
              title="Admin Performance, System Traces & Execution Logs"
            >
              <Activity size={14} color="#34d399" /> Admin Trace Inspector {reqCount > 0 ? `(${reqCount})` : ""}
            </button>
          )}

          {/* Sign Out Action */}
          <button
            className="btn-secondary"
            onClick={logout}
            style={{ fontSize: "12px", padding: "6px 12px" }}
            title="Sign out of AetherOS session"
          >
            <LogOut size={13} color="#f87171" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <NoCodePlatform
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />
      </div>

      {/* Embedded Context Agent Sidecar Widget */}
      <AgentSidecar />

      {/* ADMIN INTERFACE: KPI & Tracing Inspector Modal (Rendered ONLY when user is an administrator) */}
      {isAdmin && (
        <KPIInspector
          isOpen={isKpiModalOpen}
          onClose={() => setIsKpiModalOpen(false)}
        />
      )}
    </div>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", color: "var(--text-muted)", fontSize: "14px" }}>
        Authenticating AetherOS session...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <UIStateProvider>
      <MainContent />
    </UIStateProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
