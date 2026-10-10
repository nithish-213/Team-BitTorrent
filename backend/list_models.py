from dotenv import load_dotenv
load_dotenv()
import os, requests
from llm import PROVIDERS
from openai import OpenAI

def candidates(name, cfg, key):
    r = requests.get(cfg["base"].rstrip("/") + "/models", headers={"Authorization": f"Bearer {key}"}, timeout=20)
    r.raise_for_status()
    items = r.json().get("data", r.json() if isinstance(r.json(), list) else [])
    ids = [m["id"].replace("models/", "") for m in items]
    if name == "openrouter":
        free = {m["id"] for m in items if str(m.get("pricing", {}).get("prompt")) == "0"
                and "tools" in (m.get("supported_parameters") or [])}
        ids = [i for i in ids if i in free]
    bad = ("whisper", "tts", "guard", "embed", "image", "vision", "audio", "orpheus", "safeguard")
    return [i for i in ids if not any(b in i.lower() for b in bad)]

TOOL = [{"type": "function", "function": {"name": "ping", "description": "ping",
         "parameters": {"type": "object", "properties": {"x": {"type": "string"}}, "required": ["x"]}}}]

for name, cfg in PROVIDERS.items():
    key = os.getenv(cfg["key"])
    if not key:
        print(f"{name}: no key"); continue
    try:
        ids = candidates(name, cfg, key)
    except Exception as e:
        print(f"{name}: could not list models -> {str(e)[:200]}"); continue
    print(f"\n{name}: {len(ids)} candidate models; testing tool calling...")
    c = OpenAI(base_url=cfg["base"], api_key=key, timeout=25, max_retries=0)
    found = 0
    for mid in ids[:25]:
        try:
            r = c.chat.completions.create(model=mid, tools=TOOL, tool_choice="auto", temperature=0,
                messages=[{"role": "user", "content": "Call the ping tool with x=hi"}])
            ok = bool(r.choices[0].message.tool_calls)
            print(f"  {'WORKS (tools)' if ok else 'works, no tool call'}: {mid}")
            found += ok
            if found >= 3: break
        except Exception as e:
            print(f"  fail: {mid} -> {str(e)[:70]}")