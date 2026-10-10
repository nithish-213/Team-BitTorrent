"""One OpenAI-compatible client, three FREE providers, several models each.
Smart fallback: on rate-limit/overload a (provider, model) is put on cooldown so we stop wasting 1-2s per request retrying it."""
import os, json, hashlib, time
from openai import OpenAI

PROVIDERS = {
 "groq": dict(base="https://api.groq.com/openai/v1", key="GROQ_API_KEY", models_env="GROQ_MODELS", default="openai/gpt-oss-120b,openai/gpt-oss-20b"),
 "gemini": dict(base="https://generativelanguage.googleapis.com/v1beta/openai/", key="GEMINI_API_KEY", models_env="GEMINI_MODELS", default="gemini-flash-lite-latest"),
 "openrouter": dict(base="https://openrouter.ai/api/v1", key="OPENROUTER_API_KEY", models_env="OPENROUTER_MODELS", default="apodex/apodex-1.1-mini:free"),
}
_CACHE = {}
_COOLDOWN = {}   # (provider, model) -> unix time until which we skip it
RATE_COOLDOWN_S = int(os.getenv("RATE_COOLDOWN_S", "45"))
BAD_MODEL_COOLDOWN_S = 3600

def _models(cfg):
    return [m.strip() for m in os.getenv(cfg["models_env"], cfg["default"]).split(",") if m.strip()]

def _flatten_for_gemini(messages):
    """Gemini 'thinking' models reject replayed tool_calls that lack thought_signature. Replay tool use as plain text instead."""
    names, out = {}, []
    for m in messages:
        if m.get("role") == "assistant" and m.get("tool_calls"):
            calls = []
            for t in m["tool_calls"]:
                names[t["id"]] = t["function"]["name"]
                calls.append(f"{t['function']['name']}({t['function']['arguments']})")
            out.append({"role": "assistant", "content": "I called: " + "; ".join(calls)})
        elif m.get("role") == "tool":
            out.append({"role": "user", "content": f"Tool result for {names.get(m.get('tool_call_id'), 'tool')}: {m['content']}"})
        else:
            out.append(m)
    return out

def chat(messages, tools=None):
    """Returns (assistant_message, 'provider/model'). Raises RuntimeError if everything fails."""
    order = [p.strip() for p in os.getenv("LLM_ORDER", "groq,gemini,openrouter").split(",")]
    ck = hashlib.sha256(json.dumps([messages, bool(tools)], sort_keys=True, default=str).encode()).hexdigest()
    if ck in _CACHE:
        return _CACHE[ck]
    last = None
    for name in order:
        cfg = PROVIDERS[name]; key = os.getenv(cfg["key"])
        if not key:
            continue
        for model in _models(cfg):
            if _COOLDOWN.get((name, model), 0) > time.time():
                continue
            try:
                client = OpenAI(base_url=cfg["base"], api_key=key, timeout=25, max_retries=0)
                kw = dict(model=model, messages=_flatten_for_gemini(messages) if name == "gemini" else messages, temperature=0)
                if tools:
                    kw.update(tools=tools, tool_choice="auto")
                msg = client.chat.completions.create(**kw).choices[0].message
                _CACHE[ck] = (msg, f"{name}/{model}")
                return _CACHE[ck]
            except Exception as e:
                last = e; s = str(e)
                low = s.lower()
                if "404" in s or "no longer available" in low or "does not exist" in low:
                    _COOLDOWN[(name, model)] = time.time() + BAD_MODEL_COOLDOWN_S      # model name is dead
                elif "per-day" in low or "per day" in low or "quota" in low:
                    _COOLDOWN[(name, model)] = time.time() + 900                        # daily/quota limit: back off 15 min
                else:                                                                   # 429 / 503 / timeout / flaky tool-call JSON
                    _COOLDOWN[(name, model)] = time.time() + RATE_COOLDOWN_S
                print(f"[llm] {name}/{model} failed ({s[:90]}) -> next")
    raise RuntimeError(f"All LLM providers failed or no keys set: {last}")