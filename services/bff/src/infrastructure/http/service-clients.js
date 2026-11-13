export async function fetchJson(url, options = {}, timeoutMs = 30000, httpFetch = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await httpFetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally { clearTimeout(timer); }
}
function asCollection(payload) {
  const data = payload?.data || payload?.orcamentos || payload;
  if (!Array.isArray(data)) throw new Error("Resposta de coleção inválida.");
  return data;
}
export function createServiceClients({ mongoUrl, sqlUrl, functionUrl, internalToken, functionKey, httpFetch = fetch }) {
  const headers = { "x-internal-api-token": internalToken };
  return {
    orcamentosGateway: { endpoint: mongoUrl, listar: () => fetchJson(mongoUrl, { headers }, 90000, httpFetch).then(asCollection) },
    pedidosGateway: { endpoint: sqlUrl, listar: () => fetchJson(sqlUrl, { headers }, 120000, httpFetch).then(asCollection) },
    enrichmentGateway: { endpoint: functionUrl, enriquecer: body => fetchJson(functionUrl, {
      method: "POST", headers: { "Content-Type": "application/json", ...(functionKey ? { "x-functions-key": functionKey } : {}) }, body: JSON.stringify(body),
    }, 30000, httpFetch) },
  };
}
