"""Agent controller: retrieve -> LLM plans tool calls -> validate/execute -> LLM narrates grounded answer."""
import json, time
import llm, analytics
from retrieval import PAGES, get_retriever
from tools import TOOLS, execute

SYSTEM = """You are the in-app copilot of a no-code business application. You act on the app ONLY through the provided tools.
Rules:
1. Use ONLY page_ids from the candidate list below. Never invent pages, filters, filter values, sorts, metrics or periods.
2. To show something: navigate to the page, then set_filters / set_sort using exact option strings from the candidate's filters.
3. For analysis questions (trend, comparison, decline, 'why'): navigate to the right page, then call compare_periods or query_data. Use group_by to find what drove a change.
4. Every number in your final answer must come from a tool result. If you have no tool result, do not state numbers.
5. If the request is unrelated to this application or too ambiguous, call no tools and say so / ask one short clarifying question.
6. State-changing tools need user confirmation; just call them and tell the user it is awaiting confirmation.
7. Final answer: 2-4 short sentences. Say what you did in the app, then the finding. Mention the page name you used as the source.
8. Set ONLY the filters the user explicitly mentioned. Never add status, date or region filters they did not ask for. For ‘Q2 2025’ use exactly the option 'Q2 2025'"""

def candidate_block(cands, current_page):
    out = []
    for c in cands:
        p = PAGES[c["page_id"]]
        d = analytics.describe(p["id"])
        out.append({"page_id": p["id"], "title": p["title"], "directory": p["directory"], "description": p["description"],
                    "filters": {k: v["options"] for k, v in p["availableFilters"].items()},
                    "sorts": [s["value"] for s in p["availableSorts"]],
                    "dataset": d if d else "none (navigate/filter only)"})
    return f"Current page: {current_page}\nCandidate pages (retrieved by semantic search):\n" + json.dumps(out, indent=1)

def run_agent(query, current_page="dashboard", history=None, k=3):
    t0 = time.time()
    cands = get_retriever().search(query, k)
    messages = [{"role": "system", "content": SYSTEM + "\n\n" + candidate_block(cands, current_page)}]
    messages += (history or [])[-6:] + [{"role": "user", "content": query}]
    state, actions, trace, pending, citations = {"page_id": None, "filters": {}, "sort": None}, [], [], None, []
    provider, answer, steps = None, "", 0
    try:
        for _ in range(4):
            msg, provider = llm.chat(messages, TOOLS)
            if not msg.tool_calls:
                answer = msg.content or ""
                break
            messages.append({"role": "assistant", "content": msg.content or "",
                             "tool_calls": [{"id": t.id, "type": "function", "function": {"name": t.function.name, "arguments": t.function.arguments}} for t in msg.tool_calls]})
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
    return {"answer": answer, "actions": actions, "ui_state": state, "pending_confirmation": pending,
            "citations": list(uniq.values()),
            "trace": {"retrieval": [{**c, "title": PAGES[c["page_id"]]["title"]} for c in cands], "tool_calls": trace,
                      "steps": steps, "provider": provider, "latency_ms": int((time.time() - t0) * 1000),
                      "retrieval_mode": get_retriever().mode}}
