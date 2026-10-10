"""python eval.py retrieval   -> offline retrieval metrics (no API keys needed)
   python eval.py agent       -> end-to-end metrics with the real LLM (uses your free keys)"""
import json, sys, time
from dotenv import load_dotenv
load_dotenv()
from retrieval import PAGES, get_retriever

DATA = json.load(open("eval_set.json"))
for d in DATA:
    assert d["page"] is None or d["page"] in PAGES, f"bad expected page {d['page']}"

def retrieval_eval():
    R = get_retriever(); items = [d for d in DATA if d["page"]]
    hit1 = hit3 = hit5 = 0; rr = 0; t = time.time()
    for d in items:
        ids = [c["page_id"] for c in R.search(d["q"], 10)]
        r = ids.index(d["page"]) + 1 if d["page"] in ids else None
        hit1 += r == 1; hit3 += bool(r and r <= 3); hit5 += bool(r and r <= 5); rr += 1 / r if r else 0
        if r != 1: print(f"  miss: '{d['q']}' expected {d['page']} got rank {r} (top: {ids[0]})")
    n = len(items)
    print(f"mode={R.mode} pages={len(PAGES)} queries={n}\nRecall@1={hit1/n:.2f} Recall@3={hit3/n:.2f} Recall@5={hit5/n:.2f} MRR={rr/n:.2f} avg_latency_ms={(time.time()-t)/n*1000:.0f}")

def agent_eval():
    from agent import run_agent
    dest = ui = ui_n = ok = sort_ok = sort_n = oos_ok = oos_n = 0; lat = []; steps = []
    for d in DATA:
        r = run_agent(d["q"], "dashboard"); st = r["ui_state"]; lat.append(r["trace"]["latency_ms"]); steps.append(r["trace"]["steps"])
        if d["page"] is None:
            oos_n += 1; good = not r["actions"] or st["page_id"] is None; oos_ok += good
            print(("OK  " if good else "FAIL"), "[out-of-scope]", d["q"]); continue
        page_ok = st["page_id"] == d["page"]; dest += page_ok; good = page_ok
        if "filters" in d:
            ui_n += 1; f_ok = st["filters"] == d["filters"]; ui += f_ok; good &= f_ok
        if "sort" in d:
            sort_n += 1; s_ok = st["sort"] == d["sort"]; sort_ok += s_ok; good &= s_ok
        ok += good
        print(("OK  " if good else "FAIL"), d["q"], "->", st["page_id"], st["filters"], st["sort"], f"({r['trace']['provider']}, {r['trace']['latency_ms']}ms)")
        time.sleep(4)  # be gentle with free-tier rate limits
    n = sum(1 for d in DATA if d["page"])
    print(f"\nIntent-to-destination accuracy: {dest}/{n} = {dest/n:.0%}")
    print(f"UI-state (filters exact match): {ui}/{ui_n} = {ui/max(ui_n,1):.0%}   sorts: {sort_ok}/{sort_n}")
    print(f"Out-of-scope handled correctly: {oos_ok}/{oos_n}")
    print(f"Task success (page+filters+sort): {ok}/{n} = {ok/n:.0%}")
    print(f"Avg steps (tool calls): {sum(steps)/len(steps):.1f}   avg latency: {sum(lat)/len(lat):.0f} ms   p95: {sorted(lat)[int(len(lat)*.95)-1]} ms")

if __name__ == "__main__":
    {"retrieval": retrieval_eval, "agent": agent_eval}[sys.argv[1] if len(sys.argv) > 1 else "retrieval"]()
