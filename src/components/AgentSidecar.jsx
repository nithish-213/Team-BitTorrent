import React, { useState } from "react";
import { Bot, X, RefreshCw, CheckCircle2, ShieldAlert, ChevronRight } from "lucide-react";
import { runAgent } from "../agent/agentEngine";
import { useUIState } from "../context/UIStateContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const QUICK_ACTIONS = [
  "Why did South Region sales drop in Q2 2025 vs Q1?",
  "Show critical supplier delays in APAC",
  "High risk churn accounts sorted by ARR at risk",
  "Open the attrition analysis",
  "Create a new territory called Pune West in South Region"
];

export default function AgentSidecar() {
  const {
    activePageId,
    setActivePageId,
    setPageFilters,
    setPageSort,
    addTraceRecord,
    catalogPages
  } = useUIState();

  const [isOpen, setIsOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Retrieving pages...");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your application copilot. Ask me to find insights, filter views, compare periods, or run actions."
    }
  ]);

  const apiBase = import.meta.env.VITE_API_URL || "/api";

  const handleSendQuery = async (queryToRun) => {
    const query = queryToRun || inputText;
    if (!query || !query.trim() || isProcessing) return;

    const userMsg = { role: "user", text: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText("");
    setIsProcessing(true);
    setLoadingStep("Retrieving pages...");

    // Animate loading step sequence
    const stepTimer1 = setTimeout(() => setLoadingStep("Planning..."), 600);
    const stepTimer2 = setTimeout(() => setLoadingStep("Executing..."), 1200);

    // Prepare history (last 6 messages)
    const historyPayload = updatedMessages.slice(-6).map(m => ({
      role: m.role,
      content: m.text || ""
    }));

    try {
      const response = await runAgent(query, activePageId, historyPayload);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (response.error) {
        setIsProcessing(false);
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            text: `⚠️ ${response.error}`
          }
        ]);
        return;
      }

      // Record trace for KPIInspector
      if (response.trace) {
        addTraceRecord(response.trace);
      }

      const actionsTakenList = [];
      let sidecarRender = null;

      // Execute actions IN ORDER with ~400ms delay between them
      if (response.actions && Array.isArray(response.actions)) {
        for (let i = 0; i < response.actions.length; i++) {
          const act = response.actions[i];

          if (act.type === "navigate") {
            setActivePageId(act.page_id);
            const title = act.title || catalogPages?.[act.page_id]?.title || act.page_id;
            actionsTakenList.push(`Opened ${title}`);
          } else if (act.type === "set_filters") {
            setPageFilters(act.page_id, act.filters, true);
            const filterEntries = Object.entries(act.filters || {})
              .map(([k, v]) => `${k} = ${v}`)
              .join(", ");
            actionsTakenList.push(`Set filters: ${filterEntries}`);
          } else if (act.type === "set_sort") {
            setPageSort(act.page_id, act.sort, true);
            actionsTakenList.push(`Set sort = ${act.sort}`);
          } else if (act.type === "render") {
            sidecarRender = { kind: act.kind, data: act.data };
            actionsTakenList.push(`Rendered ${act.kind} analysis in sidecar`);
          }

          if (i < response.actions.length - 1) {
            await new Promise(r => setTimeout(r, 400));
          }
        }
      }

      setIsProcessing(false);

      const agentMsg = {
        role: "assistant",
        text: response.answer || "Request executed.",
        actionsTaken: actionsTakenList,
        sidecarRender: sidecarRender,
        citations: response.citations || [],
        pendingConfirmation: response.pending_confirmation || null
      };

      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsProcessing(false);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ Execution error: ${err.message || err}`
        }
      ]);
    }
  };

  const handleConfirm = async (msgIndex, confirmationId) => {
    try {
      const res = await fetch(`${apiBase}/confirm/${confirmationId}`, { method: "POST" });
      const data = await res.json();
      setMessages(prev =>
        prev.map((msg, idx) => {
          if (idx === msgIndex) {
            return {
              ...msg,
              pendingConfirmation: null,
              confirmationStatus: `Confirmed: ${data.description || "Action completed"}`
            };
          }
          return msg;
        })
      );
    } catch (err) {
      alert("Failed to confirm action: " + err.message);
    }
  };

  const handleCancel = async (msgIndex, confirmationId) => {
    try {
      await fetch(`${apiBase}/cancel/${confirmationId}`, { method: "POST" });
      setMessages(prev =>
        prev.map((msg, idx) => {
          if (idx === msgIndex) {
            return {
              ...msg,
              pendingConfirmation: null,
              confirmationStatus: "Action cancelled by user."
            };
          }
          return msg;
        })
      );
    } catch (err) {
      alert("Failed to cancel action: " + err.message);
    }
  };

  if (!isOpen) {
    return (
      <button
        className="btn-primary"
        style={{
          position: "fixed",
          bottom: "40px",
          right: "24px",
          zIndex: 999,
          borderRadius: "30px",
          padding: "10px 18px",
          boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
          fontSize: "13px"
        }}
        onClick={() => setIsOpen(true)}
      >
        <Bot size={18} /> Ask Agent
      </button>
    );
  }

  return (
    <div className="glass-panel agent-sidecar" style={{ bottom: "36px" }}>
      {/* Header */}
      <div className="agent-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "#10b981", width: "10px", height: "10px", borderRadius: "50%" }}></div>
          <div>
            <h4 style={{ fontSize: "13.5px", fontWeight: "700" }}>
              Application Copilot
            </h4>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="agent-body">
        {messages.map((msg, index) => (
          <div key={index} style={{ display: "flex", flexDirection: "column", marginBottom: "12px" }}>
            <div className={`chat-bubble ${msg.role === "user" ? "user" : "agent"}`}>
              <div>{msg.text}</div>
            </div>

            {/* Actions Taken Summary List */}
            {msg.actionsTaken && msg.actionsTaken.length > 0 && (
              <div style={{ marginTop: "6px", padding: "8px 10px", background: "rgba(16, 185, 129, 0.08)", borderRadius: "6px", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "11.5px" }}>
                <div style={{ fontWeight: "700", color: "#10b981", marginBottom: "4px" }}>⚡ Actions taken:</div>
                {msg.actionsTaken.map((actText, aIdx) => (
                  <div key={aIdx} style={{ color: "var(--text-main)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <ChevronRight size={12} color="#10b981" /> {actText}
                  </div>
                ))}
              </div>
            )}

            {/* Sidecar Render Actions (Comparison / Table) */}
            {msg.sidecarRender && (
              <div style={{ marginTop: "10px", padding: "12px", background: "#090d16", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                {msg.sidecarRender.kind === "comparison" && msg.sidecarRender.data && (
                  <div>
                    <h5 style={{ fontSize: "12.5px", fontWeight: "700", marginBottom: "8px", color: "var(--accent-blue)" }}>
                      Comparison Analysis ({msg.sidecarRender.data.metric || "Metric"})
                    </h5>

                    {/* Summary KPI cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px", fontSize: "11px" }}>
                      <div style={{ background: "rgba(255,255,255,0.04)", padding: "6px 8px", borderRadius: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>{msg.sidecarRender.data.period_a}:</span>{" "}
                        <strong>{msg.sidecarRender.data.value_a?.toLocaleString()}</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", padding: "6px 8px", borderRadius: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>{msg.sidecarRender.data.period_b}:</span>{" "}
                        <strong>{msg.sidecarRender.data.value_b?.toLocaleString()}</strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", padding: "6px 8px", borderRadius: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Delta:</span>{" "}
                        <strong style={{ color: (msg.sidecarRender.data.delta || 0) < 0 ? "#ef4444" : "#10b981" }}>
                          {msg.sidecarRender.data.delta?.toLocaleString()}
                        </strong>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", padding: "6px 8px", borderRadius: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>Change:</span>{" "}
                        <strong style={{ color: (msg.sidecarRender.data.pct_change || 0) < 0 ? "#ef4444" : "#10b981" }}>
                          {msg.sidecarRender.data.pct_change}%
                        </strong>
                      </div>
                    </div>

                    {/* Recharts Bar Chart of drivers */}
                    {msg.sidecarRender.data.drivers && msg.sidecarRender.data.drivers.length > 0 && (
                      <div style={{ width: "100%", height: 160, marginBottom: "8px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={msg.sidecarRender.data.drivers}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="group" stroke="var(--text-muted)" fontSize={10} />
                            <YAxis stroke="var(--text-muted)" fontSize={10} />
                            <Tooltip contentStyle={{ background: "#090d16", border: "1px solid var(--border-color)", borderRadius: "6px", fontSize: "11px" }} />
                            <Bar dataKey="delta" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Supporting Signals */}
                    {msg.sidecarRender.data.supporting_signals && msg.sidecarRender.data.supporting_signals.length > 0 && (
                      <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--text-muted)" }}>
                        <div style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "2px" }}>Supporting Signals:</div>
                        {msg.sidecarRender.data.supporting_signals.map((sig, sIdx) => (
                          <div key={sIdx}>• {sig}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {msg.sidecarRender.kind === "table" && msg.sidecarRender.data && (
                  <div>
                    <h5 style={{ fontSize: "12.5px", fontWeight: "700", marginBottom: "8px", color: "var(--accent-blue)" }}>
                      Query Results ({msg.sidecarRender.data.rows?.length || 0} rows)
                    </h5>
                    {msg.sidecarRender.data.rows && msg.sidecarRender.data.rows.length > 0 && (
                      <div className="table-container" style={{ maxHeight: "180px", overflowY: "auto" }}>
                        <table className="custom-table" style={{ fontSize: "11px" }}>
                          <thead>
                            <tr>
                              {Object.keys(msg.sidecarRender.data.rows[0]).map(col => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.sidecarRender.data.rows.map((row, rIdx) => (
                              <tr key={rIdx}>
                                {Object.values(row).map((val, cIdx) => (
                                  <td key={cIdx}>{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Citations Chips */}
            {msg.citations && msg.citations.length > 0 && (
              <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {msg.citations.map((cit, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => setActivePageId(cit.page_id)}
                    style={{
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      color: "#93c5fd",
                      borderRadius: "12px",
                      padding: "2px 8px",
                      fontSize: "10.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    Source: {cit.title || cit.page_id}
                  </button>
                ))}
              </div>
            )}

            {/* Pending Confirmation Warning Card */}
            {msg.pendingConfirmation && (
              <div style={{ marginTop: "10px", padding: "12px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24", fontWeight: "700", fontSize: "12px", marginBottom: "6px" }}>
                  <ShieldAlert size={16} /> Confirmation Required
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-main)", marginBottom: "10px" }}>
                  {msg.pendingConfirmation.description}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn-primary"
                    onClick={() => handleConfirm(index, msg.pendingConfirmation.confirmation_id)}
                    style={{ backgroundColor: "#10b981", fontSize: "12px", padding: "4px 12px" }}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleCancel(index, msg.pendingConfirmation.confirmation_id)}
                    style={{ fontSize: "12px", padding: "4px 12px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation status message if resolved */}
            {msg.confirmationStatus && (
              <div style={{ marginTop: "6px", fontSize: "11.5px", color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> {msg.confirmationStatus}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-blue)", fontSize: "12px", margin: "10px 0" }}>
            <RefreshCw size={14} className="spin" style={{ animation: "spin 1s linear infinite" }} />
            {loadingStep}
          </div>
        )}

        {/* Quick Action Chips */}
        <div style={{ marginTop: "auto", paddingTop: "10px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em", marginBottom: "6px" }}>
            💡 Quick Actions:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {QUICK_ACTIONS.map((actionText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuery(actionText)}
                disabled={isProcessing}
                style={{
                  textAlign: "left",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: "var(--text-main)",
                  fontSize: "11.5px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
                onMouseOver={(e) => e.target.style.borderColor = "var(--accent-blue)"}
                onMouseOut={(e) => e.target.style.borderColor = "var(--border-color)"}
              >
                {actionText}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <form
        className="agent-input-container"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
      >
        <input
          type="text"
          className="agent-input-field"
          placeholder="Ask me anything..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={isProcessing || !inputText.trim()}
          style={{ padding: "8px 14px", backgroundColor: "#10b981" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
