import React, { useState } from "react";
import { Activity, Menu } from "lucide-react";
import { UIStateProvider, useUIState } from "./context/UIStateContext";
import NoCodePlatform from "./components/NoCodePlatform";
import AgentSidecar from "./components/AgentSidecar";
import KPIInspector from "./components/KPIInspector";

function MainContent() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const { sessionTraces } = useUIState();

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

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="btn-secondary"
            onClick={() => setIsKpiModalOpen(true)}
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            <Activity size={14} color="#34d399" /> Performance & Trace Inspector {reqCount > 0 ? `(${reqCount} reqs)` : ""}
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

      {/* KPI Evaluation Inspector Modal */}
      <KPIInspector
        isOpen={isKpiModalOpen}
        onClose={() => setIsKpiModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <UIStateProvider>
      <MainContent />
    </UIStateProvider>
  );
}
