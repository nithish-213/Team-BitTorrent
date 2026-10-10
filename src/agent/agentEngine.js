/**
 * Agent Client Engine
 * Connects directly to FastAPI agent backend at /api/agent (or VITE_API_URL).
 */

export async function runAgent(query, currentPageId = "dashboard", history = []) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const apiBase = import.meta.env.VITE_API_URL || "/api";

  const historySlice = (history || [])
    .slice(-6)
    .map(m => ({
      role: m.role || (m.sender === "user" ? "user" : "assistant"),
      content: m.content || m.text || ""
    }));

  try {
    const res = await fetch(`${apiBase}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        current_page: currentPageId,
        history: historySlice
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.status === 500) {
      return { error: "Backend server error (HTTP 500)" };
    }

    if (!res.ok) {
      const errText = await res.text();
      return { error: `Server error (HTTP ${res.status}): ${errText}` };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return { error: "Request timed out after 30 seconds" };
    }
    return { error: "Agent backend not reachable on :8000" };
  }
}
