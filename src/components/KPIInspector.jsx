import React from "react";
import { X, Activity, ShieldCheck, Terminal } from "lucide-react";
import { useUIState } from "../context/UIStateContext";

export default function KPIInspector({ isOpen, onClose }) {
  const { latestTrace, sessionTraces } = useUIState();

  if (!isOpen) return null;

  const totalRequests = sessionTraces.length;
  const hasData = totalRequests > 0;

  // Compute session metrics from real data
  let avgLatencyMs = 0;
  let avgSteps = 0;
  let toolCallValidPct = 100;

  if (hasData) {
    const sumLatency = sessionTraces.reduce((acc, t) => acc + (t.latency_ms || 0), 0);
    avgLatencyMs = Math.round(sumLatency / totalRequests);

    const sumSteps = sessionTraces.reduce((acc, t) => acc + (t.steps || 0), 0);
    avgSteps = (sumSteps / totalRequests).toFixed(1);

    let totalTools = 0;
    let validTools = 0;
    sessionTraces.forEach(t => {
      (t.tool_calls || []).forEach(tc => {
        totalTools++;
        if (tc.ok !== false && tc.ok !== "error") {
          validTools++;
        }
      });
    });

    if (totalTools > 0) {
      toolCallValidPct = ((validTools / totalTools) * 100).toFixed(1);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: "750px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={20} color="var(--accent-blue)" /> Agent Performance & Trace Inspector
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
              Live execution metrics, vector retrieval scores, tool call logs, and session statistics from the backend
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {!hasData ? (
          <div className="panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
            <Terminal size={32} style={{ margin: "0 auto 12px auto", opacity: 0.5 }} />
            <div>No data yet</div>
            <p style={{ fontSize: "12.5px", color: "var(--text-dim)", marginTop: "4px" }}>
              Send a query in the copilot sidecar to capture real backend execution trace metrics.
            </p>
          </div>
        ) : (
          <div>
            {/* Top Summary Cards (Real computed session metrics) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
              <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Session Requests</div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#60a5fa" }}>{totalRequests}</div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>Total Executions</div>
              </div>

              <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Avg Latency</div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#34d399" }}>{avgLatencyMs} ms</div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>End-to-End Latency</div>
              </div>

              <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Avg Tool Steps</div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#a5b4fc" }}>{avgSteps}</div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>Steps / Request</div>
              </div>

              <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Tool Validity</div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#fbbf24" }}>{toolCallValidPct}%</div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>Valid Tool Calls</div>
              </div>
            </div>

            {/* Latest Request Trace Details */}
            {latestTrace && (
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "13.5px", fontWeight: "700", marginBottom: "8px", color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} /> Latest Request Trace Details
                </h3>

                <div className="panel" style={{ padding: "12px", marginBottom: "12px", fontSize: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Provider:</span>{" "}
                      <strong>{latestTrace.provider || "fallback"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Latency:</span>{" "}
                      <strong>{latestTrace.latency_ms} ms</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Steps:</span>{" "}
                      <strong>{latestTrace.steps}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Retrieval Mode:</span>{" "}
                      <span className="badge-pill indigo" style={{ fontSize: "10px" }}>{latestTrace.retrieval_mode}</span>
                    </div>
                  </div>
                </div>

                {/* Top 5 Retrieved Candidates */}
                {latestTrace.retrieval && latestTrace.retrieval.length > 0 && (
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                      Top Retrieved Page Candidates:
                    </div>
                    <div className="table-container">
                      <table className="custom-table" style={{ fontSize: "11.5px" }}>
                        <thead>
                          <tr>
                            <th>Page ID</th>
                            <th>Page Title</th>
                            <th>Similarity Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latestTrace.retrieval.slice(0, 5).map((cand, idx) => (
                            <tr key={idx}>
                              <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>{cand.page_id}</td>
                              <td><strong>{cand.title || cand.page_id}</strong></td>
                              <td><strong style={{ color: "#34d399" }}>{typeof cand.score === "number" ? cand.score.toFixed(4) : cand.score}</strong></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tool Calls Log */}
                {latestTrace.tool_calls && latestTrace.tool_calls.length > 0 && (
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                      Executed Tool Calls:
                    </div>
                    <div className="table-container">
                      <table className="custom-table" style={{ fontSize: "11.5px" }}>
                        <thead>
                          <tr>
                            <th>Tool Name</th>
                            <th>Arguments</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {latestTrace.tool_calls.map((tc, idx) => (
                            <tr key={idx}>
                              <td style={{ fontFamily: "monospace", color: "#a5b4fc" }}><strong>{tc.tool}</strong></td>
                              <td style={{ fontFamily: "monospace", fontSize: "10.5px", color: "var(--text-muted)" }}>
                                {JSON.stringify(tc.args)}
                              </td>
                              <td>
                                <span className={`badge-pill ${tc.ok !== false && tc.ok !== "error" ? "emerald" : "rose"}`} style={{ fontSize: "10px" }}>
                                  {tc.ok !== false && tc.ok !== "error" ? "PASSED" : "FAILED"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Running Session History Table */}
            <div>
              <div style={{ fontSize: "12.5px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                Session Request History Log ({sessionTraces.length} requests)
              </div>
              <div className="table-container" style={{ maxHeight: "150px", overflowY: "auto" }}>
                <table className="custom-table" style={{ fontSize: "11px" }}>
                  <thead>
                    <tr>
                      <th>Req #</th>
                      <th>Provider</th>
                      <th>Latency</th>
                      <th>Steps</th>
                      <th>Retrieval Mode</th>
                      <th>Tool Calls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionTraces.map((tr, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: "monospace" }}>#{idx + 1}</td>
                        <td>{tr.provider || "fallback"}</td>
                        <td><strong>{tr.latency_ms} ms</strong></td>
                        <td>{tr.steps}</td>
                        <td><span className="badge-pill blue" style={{ fontSize: "10px" }}>{tr.retrieval_mode}</span></td>
                        <td>{tr.tool_calls?.length || 0} calls</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
