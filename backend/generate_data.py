"""Builds catalog.json (6 real pages + ~84 synthetic pages) and larger synthetic datasets in data/*.csv.
Run once: python generate_data.py"""
import json, re
import numpy as np, pandas as pd

rng = np.random.default_rng(7)
slug = lambda s: re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")

# ---------------- catalog ----------------
base = json.load(open("catalog_base.json"))
pages, nav = base["pages"], base["navigation"]
for p in pages.values():
    p["has_data"] = True

DOMAINS = {
 "HR": ["Headcount Trends","Attrition Analysis","Hiring Pipeline","Payroll Summary","Leave Balances","Training Completion"],
 "Marketing": ["Campaign ROI","Lead Funnel","Email Engagement","Social Media Reach","Ad Spend Breakdown","Webinar Attendance"],
 "IT Operations": ["Incident Tracker","Server Uptime","Ticket Backlog","Cloud Cost Monitor","Patch Compliance","Change Requests"],
 "Security": ["Vulnerability Scan Results","Access Review","Phishing Simulation","Audit Log Explorer","Threat Alerts","Endpoint Coverage"],
 "Procurement": ["Purchase Orders","Vendor Scorecards","Contract Renewals","Spend Under Management","Invoice Matching","RFQ Status"],
 "Support": ["Ticket Volume","First Response Time","CSAT Scores","Escalation Queue","Knowledge Base Usage","Agent Workload"],
 "Product": ["Feature Adoption","Release Calendar","Bug Burndown","Roadmap Progress","User Feedback","Beta Program"],
 "Legal & Compliance": ["Contract Repository","Policy Acknowledgements","Regulatory Filings","Risk Register","Audit Findings","Data Privacy Requests"],
 "Warehouse": ["Inventory Levels","Stock Transfers","Returns Processing","Pick and Pack Throughput","Cycle Count","Dock Scheduling"],
 "Finance Ops": ["Accounts Receivable Aging","Accounts Payable","Budget vs Actual","Cash Flow Forecast","Expense Claims","Tax Provisions"],
 "Customer Onboarding": ["Onboarding Progress","NPS Survey","Renewal Forecast","QBR Schedule","Product Usage Heatmap","Health Score Trends"],
 "Data Platform": ["Pipeline Runs","Data Quality Checks","Query Costs","Dataset Catalog","Access Requests","Storage Growth"],
 "Facilities": ["Space Utilization","Maintenance Requests","Energy Consumption","Visitor Log","Asset Register","Safety Incidents"],
 "Partner Management": ["Partner Pipeline","Reseller Performance","Co-sell Deals","Partner Certifications","MDF Spend","Channel Conflicts"],
}
n = 600
for dom, subjects in DOMAINS.items():
    dir_title = dom.upper()
    dir_pages = []
    for s in subjects:
        pid = f"{slug(dom)}_{slug(s)}"
        n += 10
        page = {
            "id": pid, "pageId": f"P-{n}", "title": s, "directory": dir_title,
            "route": f"/{slug(dom)}/{slug(s)}",
            "description": f"{s} for the {dom} team: trends, status breakdown and detailed records",
            "keywords": [w.lower() for w in s.split()] + [dom.lower()],
            "availableFilters": {
                "date_range": {"label": "Date Range", "options": ["All Time","Q1 2025","Q2 2025","Q3 2025"]},
                "status": {"label": "Status", "options": ["All Statuses","Open","In Progress","Closed"]},
                "region": {"label": "Region", "options": ["All Regions","North America","EMEA","APAC","LATAM"]},
            },
            "availableSorts": [{"value": "recent", "label": "Most Recent"}, {"value": "value_desc", "label": "Value (High to Low)"}],
            "widgets": [
                {"id": f"W-{n}1", "type": "kpi", "title": f"Total {s}", "code": f"W-{n}1"},
                {"id": f"W-{n}2", "type": "chart", "title": f"{s} Trend by Month", "chartType": "line", "code": f"W-{n}2"},
                {"id": f"W-{n}3", "type": "chart", "title": f"{s} by Region", "chartType": "bar", "code": f"W-{n}3"},
                {"id": f"W-{n}4", "type": "grid", "title": f"{s} Detail Records", "code": f"W-{n}4"},
            ],
            "synthetic": True, "has_data": False,
        }
        pages[pid] = page
        dir_pages.append({"id": pid, "pageId": page["pageId"], "title": s, "path": page["route"], "description": page["description"]})
    nav.append({"id": f"dir_{slug(dom)}", "title": dir_title, "pages": dir_pages})

json.dump({"pages": pages, "navigation": nav}, open("catalog.json", "w"), indent=1)
print("pages:", len(pages), "widgets:", sum(len(p["widgets"]) for p in pages.values()))

# ---------------- datasets ----------------
periods = ["Q3 2024","Q4 2024","Q1 2025","Q2 2025","Q3 2025"]
tiers = {"Enterprise": .55, "Mid-Market": .30, "SMB": .15}

# regional sales: story = South Region Enterprise collapsed in Q2 2025 due to delivery delays
regions = {"South Region":210000,"North Region":260000,"Karnataka":170000,"EMEA":300000,"APAC":240000}
rows = []
for r, b in regions.items():
    for i, p in enumerate(periods):
        for t, sh in tiers.items():
            rev = b * sh * (1 + .03*i) * rng.normal(1, .04)
            delay = rng.uniform(2, 6)
            if r == "South Region" and t == "Enterprise" and p == "Q2 2025":
                rev *= .45; delay = rng.uniform(15, 21)
            deals = max(1, int(rev / (9000 if t=="Enterprise" else 4500 if t=="Mid-Market" else 1500)))
            rows.append(dict(region=r, tier=t, period=p, revenue=round(rev), deals=deals, delivery_delay_days=round(delay,1)))
pd.DataFrame(rows).to_csv("data/regional_sales.csv", index=False)

# sales deals
rows = []; statuses = ["Closed Won","Under Negotiation","Prospecting"]
for k in range(300):
    t = rng.choice(list(tiers), p=list(tiers.values())); r = rng.choice(["North America","EMEA","APAC","LATAM"])
    p = rng.choice(periods[2:]); mrr = int(rng.normal({"Enterprise":38000,"Mid-Market":15000,"SMB":4000}[t], 3000))
    rows.append(dict(id=f"DEAL-{900+k}", tier=t, region=r, period=p, mrr=max(mrr,500), deal_status=rng.choice(statuses, p=[.5,.3,.2])))
pd.DataFrame(rows).to_csv("data/sales_analytics.csv", index=False)

# supply
rows = []
for k in range(120):
    r = rng.choice(["APAC","EMEA","North America","LATAM"], p=[.4,.25,.25,.1]); d = int(abs(rng.normal(14 if r=="APAC" else 7, 6)))
    sev = "Critical (>15 Days)" if d > 15 else "Moderate (5-15 Days)" if d >= 5 else "Minor (<5 Days)"
    rows.append(dict(id=f"SHIP-{300+k}", region=r, period=rng.choice(periods[2:]), delay_days=d, delay_severity=sev, order_val=int(rng.uniform(20000, 300000))))
pd.DataFrame(rows).to_csv("data/operations_supply.csv", index=False)

# churn
rows = []
for k in range(80):
    s = int(rng.uniform(10, 95)); lvl = "High Risk (>75%)" if s > 75 else "Medium Risk (40-75%)" if s >= 40 else "Low Risk (<40%)"
    rows.append(dict(id=f"ACC-{500+k}", tier=rng.choice(list(tiers), p=list(tiers.values())), risk_level=lvl, risk_score=s, arr=int(rng.uniform(8000, 150000)), period=rng.choice(periods[2:])))
pd.DataFrame(rows).to_csv("data/customer_churn.csv", index=False)

# finance
rows = []
for r in ["North America","EMEA","APAC","LATAM"]:
    for p in periods[2:]:
        for t in tiers:
            for ctype in ["COGS","Opex","Revenue"]:
                rows.append(dict(region=r, period=p, tier=t, type=ctype, amount=int(rng.uniform(40000, 400000)), gross_margin=round(rng.uniform(55, 82), 1)))
pd.DataFrame(rows).to_csv("data/financial_reports.csv", index=False)
print("datasets written")
