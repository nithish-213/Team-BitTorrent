"""Tool schemas (OpenAI function-calling format) + validation. The LLM can only pick from these;
every argument is checked against the catalog, so hallucinated pages/filters are rejected."""
import difflib, uuid
from retrieval import PAGES
import analytics

TOOLS = [
 {"type": "function", "function": {"name": "navigate", "description": "Open a page of the application.",
   "parameters": {"type": "object", "properties": {"page_id": {"type": "string"}}, "required": ["page_id"]}}},
 {"type": "function", "function": {"name": "set_filters", "description": "Set filters on a page. Keys and values must come from that page's available filters.",
   "parameters": {"type": "object", "properties": {"page_id": {"type": "string"}, "filters": {"type": "object", "additionalProperties": {"type": "string"}}}, "required": ["page_id", "filters"]}}},
 {"type": "function", "function": {"name": "set_sort", "description": "Sort the page's main grid. sort must be one of the page's sort values.",
   "parameters": {"type": "object", "properties": {"page_id": {"type": "string"}, "sort": {"type": "string"}}, "required": ["page_id", "sort"]}}},
 {"type": "function", "function": {"name": "query_data", "description": "Aggregate a metric of a page's dataset, optionally grouped. Use for totals, rankings, 'which/what' questions.",
   "parameters": {"type": "object", "properties": {"page_id": {"type": "string"}, "metric": {"type": "string"}, "group_by": {"type": "string"},
                  "filters": {"type": "object", "additionalProperties": {"type": "string"}}}, "required": ["page_id", "metric"]}}},
 {"type": "function", "function": {"name": "compare_periods", "description": "Compare a metric between two periods (period_a = earlier, period_b = later) and find which group_by values drove the change. Use for trends, declines, 'why did X drop'.",
   "parameters": {"type": "object", "properties": {"page_id": {"type": "string"}, "metric": {"type": "string"}, "period_a": {"type": "string"}, "period_b": {"type": "string"},
                  "group_by": {"type": "string"}, "filters": {"type": "object", "additionalProperties": {"type": "string"}}}, "required": ["page_id", "metric", "period_a", "period_b"]}}},
 {"type": "function", "function": {"name": "create_territory", "description": "STATE-CHANGING: provision a new sales territory. Requires user confirmation before it runs.",
   "parameters": {"type": "object", "properties": {"name": {"type": "string"}, "region": {"type": "string"}}, "required": ["name", "region"]}}},
]

PENDING = {}  # confirmation_id -> description

def _match(value, options):
    for o in options:
        if o.lower() == str(value).lower():
            return o
    m = difflib.get_close_matches(str(value), options, n=1, cutoff=0.6)
    return m[0] if m else None

def validate_filters(page, filters):
    clean, errors = {}, []
    for k, v in (filters or {}).items():
        spec = page["availableFilters"].get(k)
        if not spec:
            errors.append(f"Filter '{k}' does not exist on {page['id']}. Valid filters: { {fk: fv['options'] for fk, fv in page['availableFilters'].items()} }")
            continue
        m = _match(v, spec["options"])
        if m is None:
            errors.append(f"Value '{v}' invalid for filter '{k}'. Valid options: {spec['options']}")
        else:
            clean[k] = m
    return clean, errors

def execute(name, args, state):
    """Returns (result_for_llm, ui_action_or_None). state tracks page/filters/sort."""
    pid = args.get("page_id")
    if name != "create_territory" and pid not in PAGES:
        return {"error": f"Unknown page_id '{pid}'. Use only page ids from the candidate list."}, None
    page = PAGES.get(pid)
    src = {"page_id": pid, "route": page["route"], "title": page["title"]} if page else None

    if name == "navigate":
        state.update(page_id=pid)
        return {"ok": True, "navigated_to": page["title"]}, {"type": "navigate", "page_id": pid, "route": page["route"], "title": page["title"]}

    if name == "set_filters":
        clean, errs = validate_filters(page, args.get("filters"))
        if errs:
            return {"error": errs}, None
        state.setdefault("filters", {}).update(clean)
        return {"ok": True, "applied": clean}, {"type": "set_filters", "page_id": pid, "filters": clean}

    if name == "set_sort":
        valid = [s["value"] for s in page["availableSorts"]]
        sort = _match(args.get("sort"), valid)
        if not sort:
            return {"error": f"Invalid sort. Valid sorts: {valid}"}, None
        state["sort"] = sort
        return {"ok": True, "sort": sort}, {"type": "set_sort", "page_id": pid, "sort": sort}

    if name in ("query_data", "compare_periods"):
        filters, errs = validate_filters(page, args.get("filters"))
        if errs:
            return {"error": errs}, None
        if name == "query_data":
            res = analytics.query_data(pid, args.get("metric"), args.get("group_by"), filters)
        else:
            res = analytics.compare_periods(pid, args.get("metric"), args.get("period_a"), args.get("period_b"), args.get("group_by"), filters)
        if "error" in res:
            return res, None
        res["source"] = src
        kind = "comparison" if name == "compare_periods" else "table"
        return res, {"type": "render", "kind": kind, "page_id": pid, "data": res}

    if name == "create_territory":
        cid = uuid.uuid4().hex[:8]
        desc = f"Create territory '{args.get('name')}' in region '{args.get('region')}'"
        PENDING[cid] = {
            "action": "create_territory",
            "description": desc,
            "args": args
        }
        return {"status": "pending_user_confirmation", "confirmation_id": cid, "description": desc}, None

    return {"error": f"Unknown tool '{name}'"}, None
