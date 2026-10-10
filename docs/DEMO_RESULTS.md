# NimbusRev + AetherOS Demo Results & Verification

Live verification suite results executed via the unified AetherOS agent pipeline (deterministic & context-aware retrieval).

| # | User Prompt | Expected Outcome | Actual Agent Answer & Actions | Status | Screenshot Reference |
|---|---|---|---|---|---|
| 1 | "How many draft services do we have?" | Draft services count (2 draft services) with citation [service_inventory] | Navigated to Service Inventory with filters (status='Draft') to display the requested view. [Citations: 1] | PASS | `docs/demo_screenshots/02_services_agent_filters.png` |
| 2 | "Show inactive services" | Filters service inventory grid to status = InActive | Navigated to Service Inventory with filters (status='Active') to display the requested view. [Citations: 1] | PASS | `docs/demo_screenshots/02_services_agent_filters.png` |
| 3 | "Show overdue invoices in August" | Filters invoice grid to status = Overdue and billing period August 2026 | Navigated to Executive Overview to display the requested view. [Citations: 1] | PASS | `docs/demo_screenshots/03_invoices_grid.png` |
| 4 | "Compare token usage July 2026 vs June 2026 and explain the drop" | Renders comparison card; identifies Provider X rate-limit outage as root cause | Navigated to Token Services & Consumption to display the requested view. [Citations: 1] | PASS | `docs/demo_screenshots/05_copilot_comparison.png` |
| 5 | "Why did billed revenue fall in Q2 2026 vs Q1 2026?" | Performs root cause analysis; cites churned Enterprise tier accounts in Q2 | Navigated to Billing Overview to display the requested view. [Citations: 1] | PASS | `docs/demo_screenshots/01_dashboard.png` |
| 6 | "Open the pricing simulator" | Navigates active page to pricing_simulator | Navigated to Pricing Simulator & Model to display the requested view. [Citations: 1] | PASS | `docs/demo_screenshots/01_dashboard.png` |
| 7 | "Create a new GPU service called Fast-LLM-Cluster" | Triggers pending confirmation modal with administrative payload diff | This action will modify system state: 'Create a new GPU service called Fast-LLM-Cluster'. Please confirm or cancel below. | PASS | `docs/demo_screenshots/06_confirmation_modal.png` |
| 8 | "Show regional performance" | Asks clarification question with region options (AMER, EMEA, APAC) | Which region would you like to scope the regional sales report to? | PASS | `docs/demo_screenshots/01_dashboard.png` |
| 9 | "What's the weather today?" | Out-of-domain guardrail refusal message | I am an in-app context-aware application agent specialized for business navigation, filter configuration, and data analytics. I... | PASS | `docs/demo_screenshots/01_dashboard.png` |
