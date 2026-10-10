# Agent backend (FastAPI) — free providers only

## Run
```
cd backend
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # paste your 3 free keys (Groq, Gemini, OpenRouter)
python eval.py retrieval    # offline check, no keys needed
uvicorn main:app --reload --port 8000
python eval.py agent        # real end-to-end metrics -> put these numbers in your slides
```
First run downloads the small embedding model (all-MiniLM-L6-v2). If it can't, retrieval falls back to TF-IDF automatically.
If a provider rejects a model name, change it in `.env` (names change; check the provider's model list).

## API
POST /agent  {query, current_page, history[]}  ->
```
{ answer, actions[], ui_state{page_id,filters,sort}, citations[], pending_confirmation,
  trace{retrieval[], tool_calls[], steps, provider, latency_ms} }
```
actions[] the React app must execute, in order:
- `{type:"navigate", page_id, route, title}`
- `{type:"set_filters", page_id, filters}`  /  `{type:"set_sort", page_id, sort}`
- `{type:"render", kind:"comparison"|"table", data}`  -> draw chart/summary card in the sidecar
POST /confirm/{id} and /cancel/{id} for state-changing requests (e.g. "create a new territory").

## Prompt to give Antigravity for the frontend
"Replace executeAgentPipeline in src/agent/agentEngine.js with a call to POST http://localhost:8000/agent
(send query, current page id, last 6 messages). Execute returned actions in order: navigate -> change the
active page, set_filters/set_sort -> update that page's filter/sort state, render -> show a comparison card
or table in AgentSidecar with a bar chart (recharts). Show the 'trace' (retrieved candidates with scores,
tool calls, provider, latency) in the KPI inspector using the REAL values from the response, remove all
hardcoded confidence scores and the fake API counter. If pending_confirmation is set, show Confirm/Cancel
buttons that call /confirm/{id} or /cancel/{id}. Show a 'Actions taken' list from the actions array."
