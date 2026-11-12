export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export async function requestApi(url, { method = "GET", body, timeoutMs = 110000, httpFetch = fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await httpFetch(url, {
      method, credentials: "include", signal: controller.signal,
      ...(body !== undefined ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
    const text = await response.text();
    let payload;
    try { payload = text ? JSON.parse(text) : null; }
    catch { throw new Error("O serviço retornou uma resposta inválida."); }
    if (!response.ok) {
      if (response.status === 401 && typeof window !== "undefined") window.dispatchEvent(new Event("session-expired"));
      const error = new Error(payload?.error || `Erro HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("A resposta demorou além do limite. Sincronize os dados antes de repetir uma alteração.");
    if (error instanceof TypeError) throw new Error("Conexão indisponível. Tente novamente.");
    throw error;
  } finally { clearTimeout(timer); }
}
