import React, { useState, useMemo } from "react";
import { 
  TrendingUp, Truck, Users, DollarSign, ChevronRight, ChevronDown, X, 
  Search, Tag, Layers
} from "lucide-react";
import { useUIState } from "../context/UIStateContext";
import GenericPage from "./GenericPage";
import { 
  SALES_ANALYTICS_DATASET, REGIONAL_SALES_DATASET, 
  OPERATIONS_SUPPLY_DATASET, CUSTOMER_CHURN_DATASET, FINANCIAL_REPORTS_DATASET, TENANT_CONTEXT 
} from "../data/metadataCatalog";

const CUSTOM_PAGE_IDS = new Set([
  "dashboard",
  "sales_analytics",
  "regional_sales",
  "operations_supply",
  "customer_churn",
  "financial_reports"
]);

export default function NoCodePlatform({
  mobileNavOpen = false,
  setMobileNavOpen
}) {
  const {
    activePageId,
    setActivePageId,
    filtersByPage,
    setPageFilter,
    sortByPage,
    setPageSort,
    recentlyAgentChanged,
    catalogPages,
    catalogNavigation
  } = useUIState();

  const [showSchemaBadges, setShowSchemaBadges] = useState(true);
  const [selectedRecordModal, setSelectedRecordModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedDirs, setCollapsedDirs] = useState({});

  const currentPage = catalogPages[activePageId] || catalogPages["dashboard"];
  const currentFilters = filtersByPage[activePageId] || {};
  const currentSort = sortByPage[activePageId] || (currentPage?.availableSorts?.[0]?.value || "");
  const pageHighlights = recentlyAgentChanged[activePageId] || { filters: {}, sort: false };

  const handleFilterChange = (filterKey, value) => {
    setPageFilter(activePageId, filterKey, value, false);
  };

  const toggleDirCollapse = (dirId) => {
    setCollapsedDirs(prev => ({
      ...prev,
      [dirId]: !prev[dirId]
    }));
  };

  // Filter navigation tree based on search query
  const filteredNav = useMemo(() => {
    if (!catalogNavigation) return [];
    if (!searchQuery.trim()) return catalogNavigation;

    const q = searchQuery.toLowerCase();
    return catalogNavigation
      .map(dir => {
        const matchingPages = (dir.pages || []).filter(
          p => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
        );
        if (dir.title.toLowerCase().includes(q) || matchingPages.length > 0) {
          return { ...dir, pages: matchingPages.length > 0 ? matchingPages : dir.pages };
        }
        return null;
      })
      .filter(Boolean);
  }, [catalogNavigation, searchQuery]);

  const renderIcon = (dirId) => {
    if (dirId.includes("sales")) return <TrendingUp size={15} />;
    if (dirId.includes("supply") || dirId.includes("procurement") || dirId.includes("warehouse")) return <Truck size={15} />;
    if (dirId.includes("finance")) return <DollarSign size={15} />;
    if (dirId.includes("hr") || dirId.includes("customer")) return <Users size={15} />;
    return <Layers size={15} />;
  };

  return (
    <div className="no-code-layout">
      {/* Sidebar Navigation Hierarchy */}
      <aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ padding: "0 8px 12px 8px", borderBottom: "1px solid var(--border-color)", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", color: "#fff", width: "28px", height: "28px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "14px" }}>
                æ
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700" }}>AetherOS Enterprise</div>
                <div style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>Tenant: {TENANT_CONTEXT.tenantId}</div>
              </div>
            </div>
            {mobileNavOpen && (
              <button onClick={() => setMobileNavOpen && setMobileNavOpen(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search box for navigation */}
          <div style={{ padding: "0 4px 12px 4px" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: "8px", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search catalog pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="select-control"
                style={{ width: "100%", paddingLeft: "28px", fontSize: "11.5px", height: "28px" }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", paddingRight: "4px" }}>
          {filteredNav.map((dir) => {
            const isCollapsed = Boolean(collapsedDirs[dir.id]) && !searchQuery.trim();

            return (
              <div key={dir.id} style={{ marginBottom: "12px" }}>
                <div
                  className="sidebar-group-title"
                  onClick={() => toggleDirCollapse(dir.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {renderIcon(dir.id)} {dir.title}
                  </div>
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </div>

                {!isCollapsed && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                    {dir.pages.map((p) => {
                      const isActive = activePageId === p.id;
                      return (
                        <div
                          key={p.id}
                          className={`nav-item ${isActive ? "active" : ""}`}
                          onClick={() => {
                            setActivePageId(p.id);
                            if (setMobileNavOpen) setMobileNavOpen(false);
                          }}
                          style={{ justifyContent: "space-between" }}
                        >
                          <span style={{ fontSize: "12px" }}>{p.title}</span>
                          {showSchemaBadges && p.pageId && (
                            <span style={{ fontSize: "10px", fontFamily: "monospace", color: isActive ? "#93c5fd" : "var(--text-dim)", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px" }}>
                              {p.pageId}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Context Info */}
        <div style={{ flexShrink: 0, borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "8px" }}>
          <button 
            className="btn-secondary" 
            onClick={() => setShowSchemaBadges(!showSchemaBadges)}
            style={{ width: "100%", justifyContent: "center", fontSize: "11.5px", padding: "6px 10px", marginBottom: "8px" }}
          >
            <Tag size={12} /> {showSchemaBadges ? "Hide Metadata Codes" : "Show Metadata Codes"}
          </button>
          
          <div style={{ fontSize: "11px", color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", padding: "6px 8px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{TENANT_CONTEXT.name}</span>
            <span style={{ color: "var(--accent-emerald)" }}>{TENANT_CONTEXT.tier}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="main-content">
        {/* Breadcrumb Header & Top Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ fontSize: "12.5px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>AetherOS Workspace</span> <ChevronRight size={12} />
            <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{currentPage.title}</span>
            {showSchemaBadges && currentPage.pageId && (
              <span style={{ fontSize: "11px", fontFamily: "monospace", background: "rgba(59,130,246,0.2)", color: "#93c5fd", padding: "1px 6px", borderRadius: "4px", marginLeft: "4px" }}>
                {currentPage.pageId}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {currentPage.availableFilters && Object.entries(currentPage.availableFilters).map(([k, def]) => {
              const isChanged = Boolean(pageHighlights.filters?.[k]);
              const val = currentFilters[k] || def.options?.[0] || "";

              return (
                <div key={k} style={{ position: "relative", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
                  <span>{def.label}:</span>
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
                    onChange={(e) => handleFilterChange(k, e.target.value)}
                  >
                    {(def.options || []).map(o => <option key={o} value={o}>{o}</option>)}
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

            {currentPage.availableSorts && currentPage.availableSorts.length > 0 && (
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
                  onChange={(e) => setPageSort(activePageId, e.target.value, false)}
                >
                  {currentPage.availableSorts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
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

        {/* Page Renderer: 6 Existing Custom Pages or GenericPage */}
        {!CUSTOM_PAGE_IDS.has(activePageId) ? (
          <GenericPage pageMetadata={currentPage} />
        ) : (
          <div>
            {/* PAGE 100: Executive Overview */}
            {activePageId === "dashboard" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h1 style={{ fontSize: "22px", fontWeight: "700" }}>Executive Overview</h1>
                    {showSchemaBadges && <span className="badge-pill blue" style={{ fontSize: "11px" }}>P-100</span>}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Enterprise operational health & key performance metrics</p>
                </div>

                <div className="stats-grid">
                  <div className="panel stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="stat-title">TOTAL REVENUE (Q3)</span>
                      {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-001</span>}
                    </div>
                    <div className="stat-value">$14,250,000</div>
                  </div>

                  <div className="panel stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="stat-title">OPERATIONAL RUN RATE</span>
                      {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-002</span>}
                    </div>
                    <div className="stat-value">$4,850,000</div>
                  </div>

                  <div className="panel stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="stat-title">ACTIVE ENTERPRISE ACCOUNTS</span>
                      {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-003</span>}
                    </div>
                    <div className="stat-value">1,420</div>
                  </div>

                  <div className="panel stat-card">
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="stat-title">SUPPLY FULFILLMENT RATE</span>
                      {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-004</span>}
                    </div>
                    <div className="stat-value">98.4%</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div className="panel" style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Monthly Deal Volume ($k)</h3>
                      {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-101 · bar</span>}
                    </div>
                    <div className="chart-box" style={{ height: "180px" }}>
                      {SALES_ANALYTICS_DATASET.map((item, idx) => (
                        <div key={idx} className="chart-bar-col">
                          <div className="chart-bar-fill" style={{ height: `${Math.min(100, Math.max(20, ((item.mrr || 0) / 50000) * 100))}%` }}></div>
                          <div className="chart-bar-label">{item.company ? item.company.slice(0, 6) : `Item ${idx}`}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel" style={{ padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "13.5px", fontWeight: "600" }}>Regional Revenue Share</h3>
                      {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-102 · breakdown</span>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                          <span>North America</span>
                          <strong>$8.4M (59.0%)</strong>
                        </div>
                        <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", marginTop: "4px" }}>
                          <div style={{ width: "59%", height: "100%", background: "#10b981", borderRadius: "4px" }}></div>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                          <span>EMEA</span>
                          <strong>$4.1M (28.8%)</strong>
                        </div>
                        <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", marginTop: "4px" }}>
                          <div style={{ width: "28.8%", height: "100%", background: "#3b82f6", borderRadius: "4px" }}></div>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                          <span>APAC</span>
                          <strong>$1.75M (12.2%)</strong>
                        </div>
                        <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", marginTop: "4px" }}>
                          <div style={{ width: "12.2%", height: "100%", background: "#a855f7", borderRadius: "4px" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Regional Performance Ledger</h3>
                    {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-103 · grid</span>}
                  </div>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Territory ID</th>
                          <th>Territory Name</th>
                          <th>Region</th>
                          <th>Q2 Revenue</th>
                          <th>QoQ Growth</th>
                          <th>Primary Cause</th>
                        </tr>
                      </thead>
                      <tbody>
                        {REGIONAL_SALES_DATASET.slice(0, 4).map((row) => (
                          <tr key={row.id} style={{ cursor: "pointer" }} onClick={() => setSelectedRecordModal(row)}>
                            <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>{row.id}</td>
                            <td><strong>{row.territory}</strong></td>
                            <td><span className="badge-pill indigo">{row.region}</span></td>
                            <td><strong>${(row.revenue || 0).toLocaleString()}</strong></td>
                            <td><span className={`badge-pill ${row.change_pct < 0 ? "rose" : "emerald"}`}>{row.change_pct}%</span></td>
                            <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{row.cause}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 200: Sales Analytics */}
            {activePageId === "sales_analytics" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h1 style={{ fontSize: "22px", fontWeight: "700" }}>Revenue & Deal Analytics</h1>
                    {showSchemaBadges && <span className="badge-pill blue" style={{ fontSize: "11px" }}>P-200</span>}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Monthly recurring revenue, enterprise deal pipeline, and owner assignments</p>
                </div>

                <div className="panel" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Enterprise Deals Pipeline</h3>
                    {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-201 · grid</span>}
                  </div>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Deal ID</th>
                          <th>Company</th>
                          <th>Tier</th>
                          <th>Region</th>
                          <th>Period</th>
                          <th>MRR ($)</th>
                          <th>Status</th>
                          <th>Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {SALES_ANALYTICS_DATASET.map((row) => (
                          <tr key={row.id}>
                            <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>{row.id}</td>
                            <td><strong>{row.company}</strong></td>
                            <td><span className="badge-pill blue">{row.tier}</span></td>
                            <td><span className="badge-pill indigo">{row.region}</span></td>
                            <td>{row.period}</td>
                            <td><strong>${(row.mrr || 0).toLocaleString()}</strong></td>
                            <td><span className={`badge-pill ${row.deal_status === "Closed Won" ? "emerald" : "amber"}`}>{row.deal_status}</span></td>
                            <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{row.owner}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 210: Regional Sales */}
            {activePageId === "regional_sales" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h1 style={{ fontSize: "22px", fontWeight: "700" }}>Regional Sales Dashboard</h1>
                    {showSchemaBadges && <span className="badge-pill blue" style={{ fontSize: "11px" }}>P-210</span>}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Territory revenue variance analysis & quarterly trend drivers</p>
                </div>

                <div className="panel" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Territory Breakdown</h3>
                    {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-211 · grid</span>}
                  </div>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Territory</th>
                          <th>Region</th>
                          <th>Period</th>
                          <th>Revenue ($)</th>
                          <th>Prev Revenue ($)</th>
                          <th>Growth</th>
                          <th>Underlying Cause</th>
                        </tr>
                      </thead>
                      <tbody>
                        {REGIONAL_SALES_DATASET.map((row) => (
                          <tr key={row.id}>
                            <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>{row.id}</td>
                            <td><strong>{row.territory}</strong></td>
                            <td><span className="badge-pill indigo">{row.region}</span></td>
                            <td>{row.period}</td>
                            <td><strong>${(row.revenue || 0).toLocaleString()}</strong></td>
                            <td>${(row.prev_period_rev || 0).toLocaleString()}</td>
                            <td><span className={`badge-pill ${row.change_pct < 0 ? "rose" : "emerald"}`}>{row.change_pct}%</span></td>
                            <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{row.cause}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 300: Operations & Supply Chain */}
            {activePageId === "operations_supply" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h1 style={{ fontSize: "22px", fontWeight: "700" }}>Fulfillment & Supplier Grid</h1>
                    {showSchemaBadges && <span className="badge-pill blue" style={{ fontSize: "11px" }}>P-300</span>}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Logistics tracking, supplier delays, warehouse hub status, and shipment logs</p>
                </div>

                <div className="panel" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Logistics & Supplier Delay Catalog</h3>
                    {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-301 · grid</span>}
                  </div>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Shipment ID</th>
                          <th>Supplier Name</th>
                          <th>Region Hub</th>
                          <th>Fulfillment Delay</th>
                          <th>Severity</th>
                          <th>Order Value ($)</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {OPERATIONS_SUPPLY_DATASET.map((hub) => (
                          <tr key={hub.id}>
                            <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>{hub.id}</td>
                            <td><strong>{hub.supplier || "Supplier Hub"}</strong></td>
                            <td><span className="badge-pill blue">{hub.hub || hub.region}</span></td>
                            <td><strong>{hub.delay_days} Days</strong></td>
                            <td><span className={`badge-pill ${hub.delay_days > 15 ? "rose" : "amber"}`}>{hub.delay_severity}</span></td>
                            <td><strong>${(hub.order_val || 0).toLocaleString()}</strong></td>
                            <td><span className="badge-pill emerald">{hub.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 400: Customer Churn */}
            {activePageId === "customer_churn" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h1 style={{ fontSize: "22px", fontWeight: "700" }}>High-Risk Churn Grid</h1>
                    {showSchemaBadges && <span className="badge-pill blue" style={{ fontSize: "11px" }}>P-400</span>}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Account health scores, ARR at risk, product usage drop-offs, and open escalation tickets</p>
                </div>

                <div className="panel" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Enterprise Risk Watchlist</h3>
                    {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-401 · grid</span>}
                  </div>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Account ID</th>
                          <th>Customer Name</th>
                          <th>Segment Tier</th>
                          <th>Risk Score</th>
                          <th>ARR at Risk ($)</th>
                          <th>Risk Classification</th>
                          <th>Drop Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {CUSTOMER_CHURN_DATASET.map((acc) => (
                          <tr key={acc.id}>
                            <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>{acc.id}</td>
                            <td><strong>{acc.account || acc.name}</strong></td>
                            <td><span className="badge-pill blue">{acc.tier || acc.segment}</span></td>
                            <td><strong>{acc.risk_score || acc.healthScore} / 100</strong></td>
                            <td><strong>${(acc.arr || 0).toLocaleString()}</strong></td>
                            <td>
                              <span className={`badge-pill ${(acc.risk_score || 0) > 75 ? "rose" : "amber"}`}>
                                {acc.risk_level || acc.riskLevel}
                              </span>
                            </td>
                            <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{acc.drop_reason || "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 500: Financial Ledger */}
            {activePageId === "financial_reports" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h1 style={{ fontSize: "22px", fontWeight: "700" }}>Quarterly P&L Breakdown</h1>
                    {showSchemaBadges && <span className="badge-pill blue" style={{ fontSize: "11px" }}>P-500</span>}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Profit and loss ledger, operating expenses (Opex), COGS, and gross margin audits</p>
                </div>

                <div className="panel" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: "600" }}>Quarterly Financial Ledger</h3>
                    {showSchemaBadges && <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>R-501 · grid</span>}
                  </div>
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Record ID</th>
                          <th>Cost Center</th>
                          <th>Type</th>
                          <th>Amount ($)</th>
                          <th>Gross Margin %</th>
                          <th>Period</th>
                          <th>Region</th>
                        </tr>
                      </thead>
                      <tbody>
                        {FINANCIAL_REPORTS_DATASET.map((q) => (
                          <tr key={q.id}>
                            <td style={{ fontFamily: "monospace", color: "var(--accent-cyan)" }}>{q.id}</td>
                            <td><strong>{q.cost_center}</strong></td>
                            <td><span className="badge-pill blue">{q.type}</span></td>
                            <td><strong>${(q.amount || 0).toLocaleString()}</strong></td>
                            <td><strong style={{ color: "var(--accent-emerald)" }}>{q.gross_margin}%</strong></td>
                            <td>{q.period}</td>
                            <td><span className="badge-pill indigo">{q.region}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal Dialog */}
        {selectedRecordModal && (
          <div className="modal-overlay" onClick={() => setSelectedRecordModal(null)}>
            <div className="modal-card" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
                    {selectedRecordModal.territory || selectedRecordModal.id}
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Region: {selectedRecordModal.region}</p>
                </div>
                <button onClick={() => setSelectedRecordModal(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Current Revenue:</span>
                  <strong>${(selectedRecordModal.revenue || 0).toLocaleString()}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Previous Revenue:</span>
                  <span>${(selectedRecordModal.prev_period_rev || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Growth Rate:</span>
                  <span className={`badge-pill ${selectedRecordModal.change_pct < 0 ? "rose" : "emerald"}`}>{selectedRecordModal.change_pct}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Primary Driver:</span>
                  <span style={{ color: "var(--text-main)", fontWeight: "500" }}>{selectedRecordModal.cause}</span>
                </div>
              </div>

              <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setSelectedRecordModal(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
