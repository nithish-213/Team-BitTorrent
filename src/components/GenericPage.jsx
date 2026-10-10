import React from "react";
import { useUIState } from "../context/UIStateContext";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Deterministic seed hash function based on widget ID
function seedHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDeterministicKpiValue(widgetId) {
  const hash = seedHash(widgetId);
  const type = hash % 3;
  if (type === 0) {
    const val = (hash % 900) + 100;
    return `$${val.toLocaleString()},000`;
  } else if (type === 1) {
    const pct = ((hash % 400) / 10 + 10).toFixed(1);
    return `${pct}%`;
  } else {
    const count = (hash % 1200) + 80;
    return `${count.toLocaleString()} units`;
  }
}

function getDeterministicChartData(widgetId) {
  const hash = seedHash(widgetId);
  const months = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"];
  return months.map((m, i) => {
    const val = ((hash * (i + 1) * 31) % 500) + 50;
    return { name: m, value: val };
  });
}

function getDeterministicGridRows(widgetId) {
  const hash = seedHash(widgetId);
  const statuses = ["Active", "Completed", "Pending", "In Review"];
  const categories = ["Enterprise", "Mid-Market", "Standard", "Priority"];

  return Array.from({ length: 5 }, (_, i) => {
    const rHash = hash + i * 17;
    const val = ((rHash % 800) + 50) * 100;
    return {
      id: `REC-${(rHash % 9000) + 1000}`,
      item: `Sample Record #${i + 1}`,
      category: categories[rHash % categories.length],
      status: statuses[rHash % statuses.length],
      val: `$${val.toLocaleString()}`
    };
  });
}

export default function GenericPage({ pageMetadata }) {
  const { filtersByPage, setPageFilter, sortByPage, setPageSort, recentlyAgentChanged } = useUIState();

  if (!pageMetadata) return null;

  const pageId = pageMetadata.id;
  const currentFilters = filtersByPage[pageId] || {};
  const currentSort = sortByPage[pageId] || (pageMetadata.availableSorts?.[0]?.value || "");
  const pageHighlights = recentlyAgentChanged[pageId] || { filters: {}, sort: false };

  const availableFilters = pageMetadata.availableFilters || {};
  const availableSorts = pageMetadata.availableSorts || [];
  const widgets = pageMetadata.widgets || [];

  return (
    <div>
      {/* Page Header & Filter/Sort Controls */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "22px", fontWeight: "700" }}>{pageMetadata.title}</h1>
              {pageMetadata.pageId && (
                <span className="badge-pill blue" style={{ fontSize: "11px" }}>{pageMetadata.pageId}</span>
              )}
              {pageMetadata.synthetic && (
                <span className="badge-pill amber" style={{ fontSize: "10px" }}>Synthetic View</span>
              )}
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
              {pageMetadata.description}
            </p>
          </div>

          {/* Filter & Sort Controls */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            {Object.entries(availableFilters).map(([k, def]) => {
              const isChanged = Boolean(pageHighlights.filters?.[k]);
              const val = currentFilters[k] || def.options?.[0] || "";

              return (
                <div key={k} style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>{def.label || k}:</span>
                  <select
                    className={`select-control ${isChanged ? "agent-highlight-ring" : ""}`}
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderColor: isChanged ? "#10b981" : undefined,
                      boxShadow: isChanged ? "0 0 10px rgba(16, 185, 129, 0.6)" : undefined,
                      transition: "all 0.3s ease"
                    }}
                    value={val}
                    onChange={(e) => setPageFilter(pageId, k, e.target.value)}
                  >
                    {(def.options || []).map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  {isChanged && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-18px",
                        right: "0",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#10b981",
                        background: "rgba(16, 185, 129, 0.15)",
                        padding: "1px 4px",
                        borderRadius: "3px",
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        whiteSpace: "nowrap"
                      }}
                    >
                      Agent set this
                    </span>
                  )}
                </div>
              );
            })}

            {availableSorts.length > 0 && (
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                <span>Sort:</span>
                <select
                  className={`select-control ${pageHighlights.sort ? "agent-highlight-ring" : ""}`}
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderColor: pageHighlights.sort ? "#10b981" : undefined,
                    boxShadow: pageHighlights.sort ? "0 0 10px rgba(16, 185, 129, 0.6)" : undefined,
                    transition: "all 0.3s ease"
                  }}
                  value={currentSort}
                  onChange={(e) => setPageSort(pageId, e.target.value)}
                >
                  {availableSorts.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {pageHighlights.sort && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-18px",
                      right: "0",
                      fontSize: "9px",
                      fontWeight: "700",
                      color: "#10b981",
                      background: "rgba(16, 185, 129, 0.15)",
                      padding: "1px 4px",
                      borderRadius: "3px",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Agent set this
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      {widgets.filter(w => w.type === "kpi").length > 0 && (
        <div className="stats-grid" style={{ marginBottom: "20px" }}>
          {widgets.filter(w => w.type === "kpi").map(widget => (
            <div key={widget.id} className="panel stat-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span className="stat-title">{widget.title}</span>
                <span style={{ fontSize: "10px", color: "var(--text-dim)", background: "rgba(255,255,255,0.06)", padding: "1px 4px", borderRadius: "3px" }}>
                  sample data
                </span>
              </div>
              <div className="stat-value">{getDeterministicKpiValue(widget.id)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      {widgets.filter(w => w.type === "chart").length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: widgets.filter(w => w.type === "chart").length > 1 ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "20px" }}>
          {widgets.filter(w => w.type === "chart").map(widget => {
            const chartData = getDeterministicChartData(widget.id);
            const isLine = widget.chartType === "line";

            return (
              <div key={widget.id} className="panel" style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600" }}>{widget.title}</h3>
                  <span style={{ fontSize: "10px", color: "var(--text-dim)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "3px" }}>
                    sample data
                  </span>
                </div>
                <div style={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {isLine ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip contentStyle={{ background: "#090d16", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} />
                        <Tooltip contentStyle={{ background: "#090d16", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid Placeholders */}
      {widgets.filter(w => w.type === "grid").map(widget => {
        const rows = getDeterministicGridRows(widget.id);

        return (
          <div key={widget.id} className="panel" style={{ padding: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600" }}>{widget.title}</h3>
              <span style={{ fontSize: "10px", color: "var(--text-dim)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "3px" }}>
                sample data
              </span>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Record ID</th>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Estimated Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id}>
                      <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>{row.id}</td>
                      <td><strong>{row.item}</strong></td>
                      <td><span className="badge-pill blue">{row.category}</span></td>
                      <td>
                        <span className={`badge-pill ${row.status === "Active" || row.status === "Completed" ? "emerald" : "amber"}`}>
                          {row.status}
                        </span>
                      </td>
                      <td><strong>{row.val}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
