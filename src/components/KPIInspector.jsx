import React, { useState, useEffect } from "react";
import { X, Activity, ShieldCheck, Terminal, Database, Server, RefreshCw, FolderTree, Table, Eye, Layers } from "lucide-react";
import { useUIState } from "../context/UIStateContext";

export default function KPIInspector({ isOpen, onClose }) {
  const { latestTrace, sessionTraces } = useUIState();
  const [activeTab, setActiveTab] = useState("collections"); // "collections" | "traces"
  
  // Admin Metrics & Telemetry
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState("");

  // MongoDB Atlas Collections Management
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("customers");
  const [collectionDocs, setCollectionDocs] = useState([]);
  const [docTotal, setDocTotal] = useState(0);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [reseedLoading, setReseedLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const apiBase = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    if (isOpen) {
      fetchAdminMetrics();
      fetchCollections();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedCollection) {
      fetchCollectionDocs(selectedCollection);
    }
  }, [isOpen, selectedCollection]);

  const fetchAdminMetrics = async () => {
    setLoadingMetrics(true);
    setMetricsError("");
    try {
      const token = localStorage.getItem("aetheros_token");
      const res = await fetch(`${apiBase}/admin/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminMetrics(data);
      } else {
        const err = await res.text();
        setMetricsError(`Failed to load admin metrics: ${err}`);
      }
    } catch (e) {
      setMetricsError(e.message);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const token = localStorage.getItem("aetheros_token");
      const res = await fetch(`${apiBase}/admin/collections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (e) {
      console.error("Error fetching collections:", e);
    }
  };

  const fetchCollectionDocs = async (colName) => {
    setLoadingDocs(true);
    try {
      const token = localStorage.getItem("aetheros_token");
      const res = await fetch(`${apiBase}/admin/collections/${colName}?limit=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCollectionDocs(data.documents || []);
        setDocTotal(data.total || 0);
      }
    } catch (e) {
      console.error("Error fetching collection docs:", e);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleReseed = async () => {
    setReseedLoading(true);
    setStatusMsg("");
    try {
      const token = localStorage.getItem("aetheros_token");
      const res = await fetch(`${apiBase}/admin/collections/reseed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusMsg("All collections successfully synced into MongoDB Atlas!");
        await fetchCollections();
        await fetchCollectionDocs(selectedCollection);
      } else {
        setStatusMsg("Failed to reseed collections.");
      }
    } catch (e) {
      setStatusMsg(`Error: ${e.message}`);
    } finally {
      setReseedLoading(false);
    }
  };

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
    sessionTraces.forEach((t) => {
      (t.tool_calls || []).forEach((tc) => {
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

  // Get table preview columns across all documents in the collection
  const allKeys = Array.from(
    new Set(collectionDocs.flatMap((doc) => Object.keys(doc)))
  );
  // Prioritize meaningful identifier keys first
  const priorityKeys = ["territory_name", "region", "tier", "period", "revenue", "deals", "status", "username", "email", "name", "action"];
  const sortedColumns = [
    ...priorityKeys.filter((k) => allKeys.includes(k)),
    ...allKeys.filter((k) => !priorityKeys.includes(k))
  ];
  const previewColumns = sortedColumns.slice(0, 8);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: "960px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "12px"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge-pill indigo" style={{ fontSize: "10.5px" }}>Administrator Console</span>
              <h2 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Database size={19} color="var(--accent-blue)" /> MongoDB Atlas Backend Management
              </h2>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
              Manage separate database collections in MongoDB Atlas (`HackFest`), monitor telemetry, and inspect real system traces.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              className="btn-secondary"
              onClick={() => {
                fetchAdminMetrics();
                fetchCollections();
                fetchCollectionDocs(selectedCollection);
              }}
              disabled={loadingMetrics}
              style={{ fontSize: "11.5px", padding: "4px 8px" }}
              title="Refresh MongoDB Data"
            >
              <RefreshCw size={13} className={loadingMetrics ? "spin" : ""} /> Refresh
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Telemetry Bar */}
        {adminMetrics && adminMetrics.system && (
          <div className="panel" style={{ padding: "10px 14px", marginBottom: "14px", background: "rgba(15, 23, 42, 0.7)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", fontSize: "11.5px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Database size={15} color="var(--accent-cyan)" />
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Database Backend</div>
                  <strong style={{ color: adminMetrics.system.database_backend === "connected" ? "#34d399" : "#fbbf24" }}>
                    {adminMetrics.system.database_backend === "connected" ? "MongoDB Atlas (Connected)" : "Local In-Memory"}
                  </strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FolderTree size={15} color="var(--accent-indigo)" />
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Total Collections</div>
                  <strong>{collections.length} Collections</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Server size={15} color="var(--accent-emerald)" />
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Catalog Pages</div>
                  <strong>{adminMetrics.system.catalog_pages} Indexed Pages</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Activity size={15} color={adminMetrics.system.active_cooldowns > 0 ? "#ef4444" : "#10b981"} />
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>Model Cooldowns</div>
                  <strong>{adminMetrics.system.active_cooldowns} active</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
          <button
            onClick={() => setActiveTab("collections")}
            className="btn-secondary"
            style={{
              fontSize: "12px",
              padding: "6px 14px",
              background: activeTab === "collections" ? "rgba(59, 130, 246, 0.2)" : "transparent",
              borderColor: activeTab === "collections" ? "var(--accent-blue)" : "var(--border-color)",
              color: activeTab === "collections" ? "var(--accent-blue)" : "var(--text-muted)"
            }}
          >
            <Layers size={13} /> MongoDB Collections Explorer ({collections.length})
          </button>
          <button
            onClick={() => setActiveTab("traces")}
            className="btn-secondary"
            style={{
              fontSize: "12px",
              padding: "6px 14px",
              background: activeTab === "traces" ? "rgba(59, 130, 246, 0.2)" : "transparent",
              borderColor: activeTab === "traces" ? "var(--accent-blue)" : "var(--border-color)",
              color: activeTab === "traces" ? "var(--accent-blue)" : "var(--text-muted)"
            }}
          >
            <Activity size={13} /> Agent Traces & System Telemetry {totalRequests > 0 ? `(${totalRequests})` : ""}
          </button>
        </div>

        {statusMsg && (
          <div style={{ padding: "8px 12px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "6px", color: "#6ee7b7", fontSize: "12px", marginBottom: "12px" }}>
            {statusMsg}
          </div>
        )}

        {/* TAB 1: MongoDB Atlas Collections Explorer */}
        {activeTab === "collections" && (
          <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "250px 1fr", gap: "14px" }}>
            {/* Left Collections List */}
            <div className="panel" style={{ padding: "12px", overflowY: "auto", maxHeight: "480px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)" }}>Atlas Collections</span>
                <button
                  onClick={handleReseed}
                  disabled={reseedLoading}
                  className="btn-secondary"
                  style={{ fontSize: "10.5px", padding: "3px 6px" }}
                  title="Sync and verify all business CSVs into Atlas"
                >
                  <RefreshCw size={11} className={reseedLoading ? "spin" : ""} /> Sync Data
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {collections.map((col) => {
                  const isSelected = selectedCollection === col.name;
                  const isSystem = col.category === "System & Auth";
                  return (
                    <button
                      key={col.name}
                      onClick={() => setSelectedCollection(col.name)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 10px",
                        borderRadius: "6px",
                        border: isSelected ? "1px solid var(--accent-blue)" : "1px solid transparent",
                        background: isSelected ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.02)",
                        color: isSelected ? "#fff" : "var(--text-main)",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "11.5px"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <Database size={13} color={isSystem ? "#a5b4fc" : "#34d399"} />
                        <span style={{ fontWeight: isSelected ? "700" : "500" }}>{col.name}</span>
                      </div>
                      <span className="badge-pill" style={{ fontSize: "9.5px", padding: "1px 5px", background: "rgba(255,255,255,0.06)" }}>
                        {col.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Collection Documents Preview */}
            <div className="panel" style={{ padding: "14px", overflowY: "auto", maxHeight: "480px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-blue)" }}>
                    {selectedCollection}
                  </span>
                  <span className="badge-pill cyan" style={{ fontSize: "10px" }}>
                    {docTotal} total documents in Atlas
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  Showing first {collectionDocs.length} records
                </div>
              </div>

              {loadingDocs ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "12.5px" }}>
                  Loading documents from MongoDB Atlas...
                </div>
              ) : collectionDocs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontSize: "12.5px" }}>
                  No documents found in this collection.
                </div>
              ) : (
                <div className="table-container" style={{ flex: 1, overflow: "auto" }}>
                  <table className="custom-table" style={{ fontSize: "11px" }}>
                    <thead>
                      <tr>
                        {previewColumns.map((colKey) => (
                          <th key={colKey}>{colKey}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {collectionDocs.map((doc, idx) => (
                        <tr key={idx}>
                          {previewColumns.map((colKey) => {
                            const val = doc[colKey];
                            const displayVal = typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "");
                            return (
                              <td key={colKey} style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {displayVal}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Agent Traces & System Telemetry */}
        {activeTab === "traces" && (
          <div style={{ overflowY: "auto", maxHeight: "480px" }}>
            {!hasData ? (
              <div className="panel" style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "13.5px" }}>
                <Terminal size={30} style={{ margin: "0 auto 10px auto", opacity: 0.5 }} />
                <div>No execution trace recorded yet in this session</div>
                <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>
                  Ask questions in the copilot drawer to record vector retrieval scores, provider latency, and tool execution logs.
                </p>
              </div>
            ) : (
              <div>
                {/* Top Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
                  <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Session Requests</div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color: "#60a5fa" }}>{totalRequests}</div>
                  </div>

                  <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Avg Latency</div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color: "#34d399" }}>{avgLatencyMs} ms</div>
                  </div>

                  <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Avg Tool Steps</div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color: "#a5b4fc" }}>{avgSteps}</div>
                  </div>

                  <div className="panel" style={{ padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Tool Validity</div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color: "#fbbf24" }}>{toolCallValidPct}%</div>
                  </div>
                </div>

                {/* Latest Request Trace Details */}
                {latestTrace && (
                  <div style={{ marginBottom: "18px" }}>
                    <h3 style={{ fontSize: "13px", fontWeight: "700", marginBottom: "8px", color: "var(--accent-blue)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShieldCheck size={16} /> Latest Request Trace Details
                    </h3>

                    <div className="panel" style={{ padding: "10px 12px", marginBottom: "10px", fontSize: "11.5px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Provider:</span> <strong>{latestTrace.provider || "fallback"}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Latency:</span> <strong>{latestTrace.latency_ms} ms</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Steps:</span> <strong>{latestTrace.steps}</strong>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Retrieval Mode:</span>{" "}
                          <span className="badge-pill indigo" style={{ fontSize: "10px" }}>{latestTrace.retrieval_mode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tool Calls Log */}
                    {latestTrace.tool_calls && latestTrace.tool_calls.length > 0 && (
                      <div className="table-container" style={{ marginBottom: "12px" }}>
                        <table className="custom-table" style={{ fontSize: "11px" }}>
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
                                <td style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-muted)" }}>{JSON.stringify(tc.args)}</td>
                                <td>
                                  <span className={`badge-pill ${tc.ok !== false && tc.ok !== "error" ? "emerald" : "rose"}`} style={{ fontSize: "9.5px" }}>
                                    {tc.ok !== false && tc.ok !== "error" ? "PASSED" : "FAILED"}
                                  </span>
                                </td>
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
          </div>
        )}
      </div>
    </div>
  );
}
