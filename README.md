# Hackfest: Context-Aware Application Agent (AetherOS)

An autonomous conversational AI copilot embedded directly into dynamic, no-code enterprise SaaS applications. The agent parses natural language intent, retrieves candidate UI metadata, executes multi-step tool calls over live datasets, controls navigation and filter states, and renders period-over-period analytical insights.

---

## 🌟 Key Features & Capabilities

### 1. Hybrid Semantic RAG & Metadata Catalog
- **Catalog Ingestion**: Operates on `catalog.json`, indexing **~90 pages across ~19 enterprise directories** (Sales, Supply Chain, Customer Success, Finance, HR, IT Ops, Security, Procurement, etc.).
- **Hybrid Retrieval**: Combines `sentence-transformers` (`all-MiniLM-L6-v2`) embeddings with TF-IDF fallback to rank the top candidate pages for any unstructured query.
- **Collapsible Sidebar & Live Search**: Sidebar navigation dynamically builds directory trees with instant live search and expandable/collapsible directory groups.

### 2. Full-Stack Agentic Action Orchestration
- **FastAPI Agent Backend**: Powered by multi-provider LLM support (Groq Llama 3.3 70B, Gemini, OpenRouter) with automatic fallback and rate-limit cooldowns.
- **Strict Tool Schema Grounding**: Restricts LLM tool usage to strict OpenAPI schemas (`navigate`, `set_filters`, `set_sort`, `query_data`, `compare_periods`, `create_territory`).
- **Action Staggering**: Executed actions run sequentially in the UI with a ~400ms stagger delay so users visually observe page navigation, filter setting, and sorting in real-time.
- **Visual Highlight Glow**: Any filter dropdown or sort altered by the agent flashes with a **2-second glowing ring and an "Agent set this" badge**.

### 3. Dynamic Sidecar Companion & Analytics
- **Recharts Analytical Cards**: Renders period-over-period comparison bar charts (`kind: "comparison"`) highlighting top drivers, KPI summary cards (Value A, Value B, Delta, Pct Change), and supporting signal text.
- **Data Table Renderers**: Renders aggregated data rows (`kind: "table"`) directly inside the copilot drawer.
- **Citations**: Displays clickable page chips (`Source: <Page Title>`) for immediate deep-link navigation.
- **State-Changing Guardrails**: Actions requiring user confirmation (e.g., provisioning territories) render interactive Confirm / Cancel dialogs calling `/confirm/{cid}` or `/cancel/{cid}`.

### 4. Generic Page Renderer (`GenericPage.jsx`)
- Dynamic view rendering for all catalog pages with `"synthetic": true`.
- Renders page titles, schema badges, filter dropdowns, sort selections, and deterministic sample data for KPI cards, Recharts charts, and data grids.

### 5. Empirical Performance Inspector (`KPIInspector.jsx`)
- Real-time trace inspector displaying candidate similarity scores, tool execution logs, latency, provider used, step count, and session statistics.

### 6. Isolated Scroll Architecture
- Independent scroll zones for the sidebar navigation, main content workspace, and floating agent sidecar using CSS `overscroll-behavior: contain`.

---

## 🏗️ Repository Architecture & File Structure

```
Hackfest/
├── backend/                        # FastAPI Backend & Agent Reasoning Engine
│   ├── main.py                     # FastAPI routes (/agent, /health, /confirm, /cancel)
│   ├── agent.py                    # Agent reasoning loop (retrieve -> plan -> tool execute -> synthesize)
│   ├── tools.py                    # OpenAI function-calling tools & catalog argument validation
│   ├── analytics.py                # Pandas engine executing query_data & compare_periods over CSVs
│   ├── retrieval.py                # Hybrid Vector Embeddings + TF-IDF candidate retriever
│   ├── llm.py                      # Multi-provider LLM manager (Groq, Gemini, OpenRouter) with cooldowns
│   ├── fallback.py                 # Deterministic fallback planner when LLMs are unavailable
│   ├── eval.py                     # Benchmark evaluation suite measuring accuracy over test utterances
│   ├── catalog.json                # Source of truth metadata catalog (~90 pages, filters, sorts)
│   ├── data/                       # CSV Datasets (operations_supply, sales_analytics, etc.)
│   └── requirements.txt            # Python dependencies (fastapi, uvicorn, scikit-learn, sentence-transformers)
│
├── src/                            # React 19 + Vite Frontend Application
│   ├── App.jsx                     # Top-level application layout & header
│   ├── index.css                   # Custom Vanilla CSS design system & isolated scroll rules
│   ├── agent/
│   │   └── agentEngine.js          # API client calling POST /api/agent with AbortController timeout
│   ├── context/
│   │   └── UIStateContext.jsx      # Central store holding activePageId, filtersByPage, sortByPage & trace logs
│   ├── components/
│   │   ├── NoCodePlatform.jsx      # Workspace component rendering sidebar catalog & 6 custom views
│   │   ├── GenericPage.jsx         # Dynamic renderer for synthetic pages with deterministic sample data
│   │   ├── AgentSidecar.jsx        # Floating copilot drawer with action staggering & Recharts renders
│   │   ├── KPIInspector.jsx        # Live trace inspector modal (real latency, candidate scores, tool logs)
│   │   └── PresentationDeck.jsx    # Project proposal presentation slide deck
│   └── data/
│       ├── catalog.json            # Frontend copy of metadata catalog
│       └── metadataCatalog.js      # Core page metadata constants and static mock datasets
│
├── vite.config.js                  # Vite config with dev proxy (/api -> http://localhost:8000)
├── package.json                    # Node dependencies & npm scripts ("dev:all", "build", "lint")
└── README.md                       # Documentation
```

---

## ⚡ How to Run

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
Navigate to the `backend` directory, create a virtual environment, and install requirements:
```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```
*(Optionally add your `GROQ_API_KEY`, `GEMINI_API_KEY`, or `OPENROUTER_API_KEY` in `backend/.env`)*

### 2. Start Frontend & Backend Together
From the root project directory:
```bash
npm install
npm run dev:all
```
This launches:
- **FastAPI Backend** on `http://localhost:8000`
- **Vite React App** on `http://localhost:5173`

---

## 📊 Benchmark Evaluation Metrics

Run the offline benchmark evaluation suite over 10 labeled test cases:
```bash
cd backend
python eval.py agent
```

### Verified Benchmark Output

```text
--- Summary ---
  Total test cases:          10
  Navigation accuracy:     100.0%  (10/10)
  Filter accuracy:         100.0%  (10/10)
  Sort accuracy:           100.0%  (10/10)
  Strict UI-state accuracy:100.0%  (10/10)  (nav AND filters AND sort all correct)
  Avg latency:             3255ms
  Mode:                     hybrid(embeddings+tfidf)
```

---

## 🛠️ Verification Test Cases

| Prompt / Utterance | Expected App Action |
| :--- | :--- |
| `"Show Enterprise deals that are closed won in Q3 2025"` | Navigates to **Revenue & Deal Analytics**, sets `date_range=Q3 2025`, `customer_tier=Enterprise`, `deal_status=Closed Won`. |
| `"Why did South Region sales drop in Q2 2025 compared to Q1?"` | Navigates to **Regional Sales Dashboard**, sets `region=South Region`, draws Recharts comparison waterfall chart. |
| `"Open the attrition analysis"` | Opens the synthetic **Attrition Analysis** page via `GenericPage.jsx`. |
| `"What's the weather today?"` | Handles out-of-scope gracefully without executing invalid UI actions. |
| `"Create a new territory called Pune West in South Region"` | Displays interactive Confirm / Cancel guardrail dialog. |
