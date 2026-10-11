/**
 * Agent Client Engine
 * Connects directly to FastAPI agent backend at /api/agent (or VITE_API_URL).
 * Passes Authorization Bearer token from localStorage when authenticated.
 */

export async function runAgent(
  query,
  currentPageId = "dashboard",
  history = [],
  activeFilters = {},
  activeSort = null,
  selectedRecord = null
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const apiBase = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem("aetheros_token");

  const historySlice = (history || [])
    .slice(-6)
    .map(m => ({
      role: m.role || (m.sender === "user" ? "user" : "assistant"),
      content: m.content || m.text || ""
    }));

  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${apiBase}/agent`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        current_page: currentPageId,
        history: historySlice,
        active_filters: activeFilters || {},
        active_sort: activeSort,
        selected_record: selectedRecord
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.status === 401) {
      return { error: "Authentication session expired. Please sign in again." };
    }

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
