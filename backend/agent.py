"""Agent controller: retrieve -> LLM plans tool calls -> validate/execute -> LLM narrates grounded answer.
Fully context-aware: understands active page, UI filters, selected record, session history, and user role.
"""
import json, time
import llm, analytics
from retrieval import PAGES, get_retriever
from tools import TOOLS, execute

SYSTEM = """You are the in-app copilot of a no-code business application. You act on the app ONLY through the provided tools.
You have FULL REAL-TIME CONTEXT of the user's active screen, current filters, and session.

Core Instructions:
1. Context-Awareness & Pronoun / Entity Resolution:
   - When the user mentions an account, company name, or keyword visible on their screen (e.g. "bluesky", "apex", "pune") or refers to "this", "here", "why did it drop?":
     * Look at the USER'S CURRENT SCREEN CONTEXT (and visible items/rows) first.
     * The user is asking about the data on their active page (e.g., High-Risk Churn Grid, Regional Sales, etc.).
     * Use the active page's dataset to answer or filter/query for the entity mentioned.
   - If the user is already on the relevant page, you do NOT need to call navigate; simply use the current page's dataset.
   - If active UI filters are already applied, respect or incorporate them into your analysis unless the user asks to change them.
2. Tools & Candidates:
   - Use ONLY page_ids from the candidate list below. Never invent pages, filters, filter values, sorts, metrics or periods.
   - To show something: navigate to the page, then set_filters / set_sort using exact option strings from the candidate's filters.
   - For analysis questions (trend, comparison, decline, 'why', account lookup): call query_data or compare_periods. Use group_by to find what drove a change.
3. Grounding:
   - Every number in your final answer must come from a tool result. If you have no tool result, do not state numbers.
   - State-changing tools (like create_territory) need user confirmation; call them and inform the user it is awaiting confirmation.
4. Response Format:
   - 2-4 concise, professional sentences. Say what you analyzed or did in the app, then the finding. Mention the source page name."""

def build_context_block(current_page, active_filters, active_sort, selected_record, user_context, cands):
    curr_info = PAGES.get(current_page, {})
    curr_dataset = analytics.describe(current_page)
    
    screen_context = {
        "active_page_id": current_page,
        "active_page_title": curr_info.get("title", current_page),
        "active_directory": curr_info.get("directory", "General"),
        "active_screen_filters": active_filters or {},
        "active_sort": active_sort,
        "selected_row_or_record": selected_record,
        "user_profile": user_context or {"role": "user", "name": "User"},
        "active_dataset_summary": curr_dataset if curr_dataset else "No attached analytical dataset"
    }

    candidates_info = []
    for c in cands:
        p = PAGES[c["page_id"]]
        d = analytics.describe(p["id"])
        candidates_info.append({
            "page_id": p["id"],
            "title": p["title"],
            "directory": p["directory"],
            "description": p["description"],
            "filters": {k: v["options"] for k, v in p["availableFilters"].items()},
            "sorts": [s["value"] for s in p["availableSorts"]],
            "dataset": d if d else "none (navigate/filter only)"
        })

    return (
        "=== USER'S LIVE APPLICATION CONTEXT ===\n"
        + json.dumps(screen_context, indent=2)
        + "\n\n=== RELEVANT APPLICATION PAGES (Semantic Search) ===\n"
        + json.dumps(candidates_info, indent=2)
    )

def run_agent(query, current_page="dashboard", history=None, active_filters=None, active_sort=None, selected_record=None, user_context=None, k=3):
    t0 = time.time()
    
    # Context-aware retrieval: boost currently viewed page for pronoun/follow-up queries
    cands = get_retriever().search(query, k=k, current_page=current_page)
    
    # CRITICAL: Always ensure the user's currently active page is available as a candidate
    # so queries about visible rows, companies, or values on screen can be answered directly
    cand_ids = [c["page_id"] for c in cands]
    if current_page and current_page in PAGES and current_page not in cand_ids:
        cands.insert(0, {"page_id": current_page, "score": 1.0, "is_current_page": True})
    
    context_str = build_context_block(
        current_page=current_page,
        active_filters=active_filters,
        active_sort=active_sort,
        selected_record=selected_record,
        user_context=user_context,
        cands=cands
    )

    messages = [{"role": "system", "content": SYSTEM + "\n\n" + context_str}]
    messages += (history or [])[-6:] + [{"role": "user", "content": query}]
    
    # State tracking begins with user's current page and active filters
    state = {
        "page_id": current_page,
        "filters": dict(active_filters or {}),
        "sort": active_sort
    }
    actions, trace, pending, citations = [], [], None, []
    provider, answer, steps = None, "", 0
    
    try:
        for _ in range(4):
            msg, provider = llm.chat(messages, TOOLS)
            if not msg.tool_calls:
                answer = msg.content or ""
                break
            messages.append({
                "role": "assistant",
                "content": msg.content or "",
                "tool_calls": [{
                    "id": t.id,
                    "type": "function",
                    "function": {"name": t.function.name, "arguments": t.function.arguments}
                } for t in msg.tool_calls]
            })
            for t in msg.tool_calls:
                steps += 1
                try:
                    args = json.loads(t.function.arguments or "{}")
                except json.JSONDecodeError:
                    args = {}
                result, action = execute(t.function.name, args, state)
                trace.append({"tool": t.function.name, "args": args, "ok": "error" not in result})
                if action: actions.append(action)
                if isinstance(result, dict) and result.get("source"): citations.append(result["source"])
                if isinstance(result, dict) and result.get("status") == "pending_user_confirmation": pending = result
                messages.append({"role": "tool", "tool_call_id": t.id, "content": json.dumps(result)})
    except RuntimeError as e:
        from fallback import plan
        actions, state, answer = plan(query, cands)
        provider = "fallback"

    uniq = {c["page_id"]: c for c in citations}
    return {
        "answer": answer,
        "actions": actions,
        "ui_state": state,
        "pending_confirmation": pending,
        "citations": list(uniq.values()),
        "trace": {
            "retrieval": [{**c, "title": PAGES[c["page_id"]]["title"]} for c in cands],
            "tool_calls": trace,
            "steps": steps,
            "provider": provider,
            "latency_ms": int((time.time() - t0) * 1000),
            "retrieval_mode": get_retriever().mode,
            "context_page": current_page,
            "active_filters": active_filters or {}
        }
    }
