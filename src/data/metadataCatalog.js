// Metadata Catalog, Knowledge Graph & Synthetic Data Store for AetherOS Enterprise Engine

export const NAVIGATION_TREE = [
  {
    id: "dir_overview",
    title: "EXECUTIVE OVERVIEW",
    pages: [
      { id: "dashboard", pageId: "P-100", title: "Executive Dashboard", path: "/overview/dashboard", description: "Company-wide ARR, active tenants, spend and operational performance at a glance" }
    ]
  },
  {
    id: "dir_sales",
    title: "SALES & REVENUE",
    pages: [
      { id: "sales_analytics", pageId: "P-200", title: "Revenue & Deal Analytics", path: "/sales/analytics", description: "Deal pipeline, monthly recurring revenue (MRR), and conversion velocity" },
      { id: "regional_sales", pageId: "P-210", title: "Regional Sales Dashboard", path: "/sales/regional", description: "Territory performance breakdown, North vs South period comparisons, and growth rates" }
    ]
  },
  {
    id: "dir_supply",
    title: "SUPPLY CHAIN & LOGISTICS",
    pages: [
      { id: "operations_supply", pageId: "P-300", title: "Fulfillment & Supplier Grid", path: "/supply/fulfillment", description: "Logistics tracking, supplier delays, warehouse hub status, and shipment logs" }
    ]
  },
  {
    id: "dir_cs",
    title: "CUSTOMER SUCCESS",
    pages: [
      { id: "customer_churn", pageId: "P-400", title: "High-Risk Churn Grid", path: "/cs/churn-risk", description: "Account health scores, ARR at risk, product usage drop-offs, and open escalation tickets" }
    ]
  },
  {
    id: "dir_finance",
    title: "FINANCIAL REPORTS",
    pages: [
      { id: "financial_reports", pageId: "P-500", title: "Quarterly P&L Breakdown", path: "/finance/p-and-l", description: "Profit and loss ledger, operating expenses (Opex), COGS, and gross margin audits" }
    ]
  }
];

export const PAGES_METADATA = {
  dashboard: {
    id: "dashboard",
    pageId: "P-100",
    title: "Executive Dashboard",
    directory: "EXECUTIVE OVERVIEW",
    route: "/overview/dashboard",
    description: "Company-wide ARR, active tenants, spend and operational performance at a glance",
    keywords: ["dashboard", "overview", "executive", "arr", "spend", "mrr", "active tenants", "performance"],
    availableFilters: {
      period: { label: "Period Scope", options: ["Last 12 months", "Last 6 months", "Q3 2025", "Q2 2025", "This Year"] }
    },
    availableSorts: [
      { value: "period_desc", label: "Period (Newest First)" }
    ],
    widgets: [
      { id: "R-001", type: "kpi", title: "ANNUAL RECURRING REVENUE (ARR)", value: "$4,850,000", change: "+18.4% YoY", code: "R-001" },
      { id: "R-002", type: "kpi", title: "MONTHLY RECURRING REVENUE (MRR)", value: "$482,500", change: "+14.2% QoQ", code: "R-002" },
      { id: "R-003", type: "kpi", title: "ACTIVE ENTERPRISE TENANTS", value: "142 Tenants", change: "+12 New Tenants", code: "R-003" },
      { id: "R-004", type: "kpi", title: "AVG CONTRACT VALUE (ACV)", value: "$34,200", change: "+5.1% QoQ", code: "R-004" },
      { id: "R-101", type: "chart", title: "Revenue Trend (Quarterly Spend)", chartType: "bar", code: "R-101 bar" },
      { id: "R-102", type: "chart", title: "Revenue Distribution by Customer Tier", chartType: "donut", code: "R-102 donut" },
      { id: "R-103", type: "grid", title: "Key Account Transactions", code: "R-103 grid" }
    ]
  },
  sales_analytics: {
    id: "sales_analytics",
    pageId: "P-200",
    title: "Revenue & Deal Analytics",
    directory: "SALES & REVENUE",
    route: "/sales/analytics",
    description: "Deal pipeline, monthly recurring revenue (MRR), and conversion velocity",
    keywords: ["sales", "revenue", "mrr", "deals", "closed won", "pipeline", "conversion"],
    availableFilters: {
      date_range: { label: "Date Range", options: ["All Time", "Q1 2025", "Q2 2025", "Q3 2025", "Last 30 Days"] },
      customer_tier: { label: "Customer Tier", options: ["All Tiers", "Enterprise", "Mid-Market", "SMB"] },
      region: { label: "Region", options: ["All Regions", "North America", "EMEA", "APAC", "LATAM"] },
      deal_status: { label: "Deal Status", options: ["All Statuses", "Closed Won", "Under Negotiation", "Prospecting"] }
    },
    availableSorts: [
      { value: "mrr_desc", label: "MRR / Value (High to Low)" },
      { value: "date_desc", label: "Close Date (Newest)" }
    ],
    widgets: [
      { id: "R-201", type: "grid", title: "Sales Deal Pipeline Grid", code: "R-201 grid" }
    ]
  },
  regional_sales: {
    id: "regional_sales",
    pageId: "P-210",
    title: "Regional Sales Dashboard",
    directory: "SALES & REVENUE",
    route: "/sales/regional",
    description: "Territory performance breakdown, North vs South period comparisons, and growth rates",
    keywords: ["regional", "karnataka", "south region", "north region", "territory", "regional comparison", "decline"],
    availableFilters: {
      date_range: { label: "Date Range", options: ["All Time", "Q1 2025", "Q2 2025", "Q3 2025", "This Year"] },
      region: { label: "Target Region", options: ["All Regions", "South Region", "North Region", "Karnataka", "EMEA", "APAC"] }
    },
    availableSorts: [
      { value: "rev_desc", label: "Revenue (Highest First)" },
      { value: "growth_asc", label: "Decline Rate (Worst First)" }
    ],
    widgets: [
      { id: "R-211", type: "grid", title: "Regional Territory Grid", code: "R-211 grid" }
    ]
  },
  operations_supply: {
    id: "operations_supply",
    pageId: "P-300",
    title: "Fulfillment & Supplier Grid",
    directory: "SUPPLY CHAIN & LOGISTICS",
    route: "/supply/fulfillment",
    description: "Logistics tracking, supplier delays, warehouse hub status, and shipment logs",
    keywords: ["fulfillment", "logistics", "supply chain", "suppliers", "shipment delays", "warehouse", "apac"],
    availableFilters: {
      date_range: { label: "Date Range", options: ["All Time", "Q1 2025", "Q2 2025", "Q3 2025"] },
      region: { label: "Hub Region", options: ["All Regions", "APAC", "EMEA", "North America", "LATAM"] },
      delay_severity: { label: "Delay Severity", options: ["All", "Critical (>15 Days)", "Moderate (5-15 Days)"] }
    },
    availableSorts: [
      { value: "delay_desc", label: "Delay Days (Longest First)" },
      { value: "order_val_desc", label: "Order Value (Highest First)" }
    ],
    widgets: [
      { id: "R-301", type: "grid", title: "Supplier Delay Log", code: "R-301 grid" }
    ]
  },
  customer_churn: {
    id: "customer_churn",
    pageId: "P-400",
    title: "High-Risk Churn Grid",
    directory: "CUSTOMER SUCCESS",
    route: "/cs/churn-risk",
    description: "Account health scores, ARR at risk, product usage drop-offs, and open escalation tickets",
    keywords: ["churn", "churn risk", "customer success", "health score", "arr at risk", "escalation"],
    availableFilters: {
      risk_level: { label: "Risk Level", options: ["All Risk Levels", "High Risk (>75%)", "Medium Risk (40-75%)", "Low Risk (<40%)"] },
      customer_tier: { label: "Subscription Plan", options: ["All Plans", "Enterprise", "Mid-Market", "SMB"] }
    },
    availableSorts: [
      { value: "risk_desc", label: "Risk Score (Highest First)" },
      { value: "arr_desc", label: "ARR at Risk (Highest First)" }
    ],
    widgets: [
      { id: "R-401", type: "grid", title: "At-Risk Account Health Grid", code: "R-401 grid" }
    ]
  },
  financial_reports: {
    id: "financial_reports",
    pageId: "P-500",
    title: "Quarterly P&L Breakdown",
    directory: "FINANCIAL REPORTS",
    route: "/finance/p-and-l",
    description: "Profit and loss ledger, operating expenses (Opex), COGS, and gross margin audits",
    keywords: ["finance", "p&l", "expenses", "profit", "cogs", "opex", "gross margin", "cost center"],
    availableFilters: {
      date_range: { label: "Date Range", options: ["All Time", "Q1 2025", "Q2 2025", "Q3 2025"] },
      customer_tier: { label: "Segment", options: ["All Segments", "Enterprise", "Mid-Market", "SMB"] }
    },
    availableSorts: [
      { value: "margin_desc", label: "Gross Margin % (High to Low)" },
      { value: "expense_desc", label: "Operating Expense (High to Low)" }
    ],
    widgets: [
      { id: "R-501", type: "grid", title: "P&L Financial Ledger Grid", code: "R-501 grid" }
    ]
  }
};

// Enterprise Tenant Context
export const TENANT_CONTEXT = {
  tenantId: "TENANT-9001",
  name: "AetherOS Global Core",
  tier: "Enterprise Core",
  region: "North America & APAC"
};

// Datasets
export const SALES_ANALYTICS_DATASET = [
  { id: "DEAL-901", company: "Acme Corp Global", tier: "Enterprise", region: "North America", date: "2025-08-14", period: "Q3 2025", mrr: 45000, deal_status: "Closed Won", owner: "Sarah Jenkins" },
  { id: "DEAL-902", company: "Nexus Systems GmbH", tier: "Enterprise", region: "EMEA", date: "2025-09-02", period: "Q3 2025", mrr: 38000, deal_status: "Closed Won", owner: "Alex Rivera" },
  { id: "DEAL-903", company: "Pacific Dynamic KK", tier: "Enterprise", region: "APAC", date: "2025-07-28", period: "Q3 2025", mrr: 29000, deal_status: "Under Negotiation", owner: "David Chen" },
  { id: "DEAL-904", company: "Vortex Logistics", tier: "Mid-Market", region: "North America", date: "2025-08-19", period: "Q3 2025", mrr: 18500, deal_status: "Closed Won", owner: "Emma Watson" },
  { id: "DEAL-905", company: "Starlight Retail", tier: "Mid-Market", region: "EMEA", date: "2025-06-11", period: "Q2 2025", mrr: 14200, deal_status: "Closed Won", owner: "Sarah Jenkins" },
  { id: "DEAL-906", company: "CloudScale Inc", tier: "Enterprise", region: "North America", date: "2025-05-24", period: "Q2 2025", mrr: 32000, deal_status: "Closed Won", owner: "Alex Rivera" }
];

export const REGIONAL_SALES_DATASET = [
  { id: "REG-01", territory: "South Region (Karnataka Hub)", region: "South Region", period: "Q2 2025", revenue: 142000, prev_period_rev: 174000, change_pct: -18.4, status: "Declined", cause: "Delayed product delivery & aggressive competitor pricing in Bangalore" },
  { id: "REG-02", territory: "North Region (Delhi NCR Hub)", region: "North Region", period: "Q2 2025", revenue: 285000, prev_period_rev: 254000, change_pct: 12.2, status: "Grew", cause: "Expansion of 3 new enterprise retail accounts" },
  { id: "REG-03", territory: "Karnataka Enterprise Zone", region: "Karnataka", period: "This Year", revenue: 210000, prev_period_rev: 190000, change_pct: 10.5, status: "Grew", cause: "Strong adoption of cloud API integrations" },
  { id: "REG-04", territory: "EMEA Central Territory", region: "EMEA", period: "Q2 2025", revenue: 310000, prev_period_rev: 295000, change_pct: 5.1, status: "Grew", cause: "Consistent renewal rate" }
];

export const OPERATIONS_SUPPLY_DATASET = [
  { id: "SHIP-301", supplier: "Taipei Precision Electronics", hub: "APAC", region: "APAC", delay_days: 18, delay_severity: "Critical (>15 Days)", order_val: 184000, status: "Delayed", tier: "Tier 1 (Strategic)" },
  { id: "SHIP-302", supplier: "Shenzhen Logistics Ltd", hub: "APAC", region: "APAC", delay_days: 22, delay_severity: "Critical (>15 Days)", order_val: 260000, status: "Delayed", tier: "Tier 1 (Strategic)" },
  { id: "SHIP-303", supplier: "Hamburg Freight Services", hub: "EMEA", region: "EMEA", delay_days: 8, delay_severity: "Moderate (5-15 Days)", order_val: 95000, status: "In Transit", tier: "Tier 2 (Standard)" }
];

export const CUSTOMER_CHURN_DATASET = [
  { id: "ACC-501", account: "Apex Financial Systems", tier: "Enterprise", risk_level: "High Risk (>75%)", risk_score: 88, arr: 120000, am: "Sarah Jenkins", drop_reason: "API Integration latency & 3 open P1 support tickets", period: "Q3 2025" },
  { id: "ACC-502", account: "BlueSky Networks", tier: "Enterprise", risk_level: "High Risk (>75%)", risk_score: 82, arr: 95000, am: "Alex Rivera", drop_reason: "Product usage dropped 45% post migration", period: "Q3 2025" }
];

export const FINANCIAL_REPORTS_DATASET = [
  { id: "FIN-101", cost_center: "Cloud Infrastructure & Hosting", type: "COGS", amount: 145000, gross_margin: 78.4, period: "Q3 2025", tier: "Enterprise", region: "North America" },
  { id: "FIN-102", cost_center: "Enterprise R&D Engineering", type: "Opex", amount: 420000, gross_margin: 82.1, period: "Q3 2025", tier: "Enterprise", region: "North America" }
];

// Labeled Benchmark Corpus (Domain 5A Test Cases)
export const BENCHMARK_UTTERANCES = [
  {
    id: "TEST-01",
    utterance: "Compare sales in North and South regions for Q2 and tell me why South declined",
    targetPage: "regional_sales",
    expectedFilters: { date_range: "Q2 2025" },
    expectedSort: "growth_asc",
    category: "Territory Period Comparison & Root Cause"
  },
  {
    id: "TEST-02",
    utterance: "Show me revenue analytics for Enterprise tier in North America for Q3 2025 sorted by highest MRR",
    targetPage: "sales_analytics",
    expectedFilters: { date_range: "Q3 2025", customer_tier: "Enterprise", region: "North America" },
    expectedSort: "mrr_desc",
    category: "Multi-Param Filter & Routing"
  },
  {
    id: "TEST-03",
    utterance: "Which suppliers in APAC have fulfillment delays > 15 days in Q3 2025?",
    targetPage: "operations_supply",
    expectedFilters: { region: "APAC", delay_severity: "Critical (>15 Days)", date_range: "Q3 2025" },
    expectedSort: "delay_desc",
    category: "Logistics Delay Extraction"
  },
  {
    id: "TEST-04",
    utterance: "Navigate to Churn Risk grid and filter by High Risk accounts",
    targetPage: "customer_churn",
    expectedFilters: { risk_level: "High Risk (>75%)" },
    expectedSort: "risk_desc",
    category: "Risk Score Audit"
  },
  {
    id: "TEST-05",
    utterance: "I want to create a new regional sales territory",
    targetPage: "regional_sales",
    expectedFilters: {},
    expectedSort: "rev_desc",
    category: "Dynamic Form Canvas Render"
  },
  {
    id: "TEST-06",
    utterance: "Export quarterly financial P&L report for Enterprise customers",
    targetPage: "financial_reports",
    expectedFilters: { customer_tier: "Enterprise" },
    expectedSort: "margin_desc",
    requiresGuardrail: true,
    category: "Action Guardrail & State Confirmation"
  }
];
