"""python calibrate.py  -> shows top retrieval score for in-scope vs out-of-scope queries, to choose FALLBACK_MIN_SCORE."""
import json
from dotenv import load_dotenv
load_dotenv()
from retrieval import get_retriever
R = get_retriever(); data = json.load(open("eval_set.json"))
ins = sorted((R.search(d["q"], 1)[0]["score"], d["q"]) for d in data if d["page"])
out = sorted((R.search(d["q"], 1)[0]["score"], d["q"]) for d in data if not d["page"])
print("mode:", R.mode)
print("LOWEST in-scope scores:"); [print(f"  {s:.3f}  {q}") for s, q in ins[:5]]
print("OUT-of-scope scores:"); [print(f"  {s:.3f}  {q}") for s, q in out]
print(f"\nSuggested FALLBACK_MIN_SCORE ~ {(ins[0][0] + out[-1][0]) / 2:.2f} (midway between the lowest in-scope and highest out-of-scope)")