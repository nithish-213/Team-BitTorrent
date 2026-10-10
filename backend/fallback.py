"""Deterministic backup planner used when no LLM is reachable (rate limits, outage).
Page = top retrieval hit (if score is high enough); filters = option strings literally mentioned in the query."""
import os, re
from retrieval import PAGES

MIN_SCORE = float(os.getenv("FALLBACK_MIN_SCORE", "0.25"))

def _variants(opt):
    o = opt.lower()
    base = re.sub(r"\s*\(.*?\)", "", o).strip()      # "Critical (>15 Days)" -> "critical"
    return {o, base} - {""}

def match_filters(query, page):
    q = query.lower(); out = {}
    for key, spec in page["availableFilters"].items():
        best = None
        for opt in spec["options"]:
            if opt.lower().startswith("all"):
                continue
            for v in _variants(opt):
                if re.search(r"(?<![a-z0-9])" + re.escape(v) + r"(?![a-z0-9])", q):
                    if best is None or len(v) > best[0]:
                        best = (len(v), opt)
        if best:
            out[key] = best[1]
    return out

def plan(query, cands):
    """Returns (actions, ui_state, answer)."""
    top = cands[0]
    if top["score"] < MIN_SCORE:
        return [], {"page_id": None, "filters": {}, "sort": None}, \
            "I couldn't match that to anything in this application. Could you rephrase, or ask about a specific page or report?"
    page = PAGES[top["page_id"]]
    filters = match_filters(query, page)
    actions = [{"type": "navigate", "page_id": page["id"], "route": page["route"], "title": page["title"]}]
    if filters:
        actions.append({"type": "set_filters", "page_id": page["id"], "filters": filters})
    desc = ", ".join(f"{k}={v}" for k, v in filters.items())
    answer = f"(Backup mode: language model unavailable) Opened {page['title']}" + (f" and set {desc}." if desc else ".")
    return actions, {"page_id": page["id"], "filters": filters, "sort": None}, answer