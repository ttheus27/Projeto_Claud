import { API_BASE_URL, requestApi } from "../../../shared/http/api-client";
const endpoint = `${API_BASE_URL}/orcamentos`;
export const ORCAMENTO_API_CONFIGURATION = {
  endpoints: { listar: endpoint, criar: endpoint, atualizar: `${endpoint}/{id}`, excluir: `${endpoint}/{id}` },
  currentProvider: "API Gateway → BFF → Microserviço MongoDB Atlas",
};
export function createOrcamentoGateway({ httpFetch = fetch } = {}) {
  const request = (path = "", method = "GET", body) => requestApi(endpoint + path, { method, body, httpFetch, timeoutMs: 30000 });
  return {
    async listar() {
      const start = Date.now(); const payload = await request();
      if (!Array.isArray(payload?.data)) throw new Error("Resposta inválida do serviço de orçamentos.");
      return { data: payload.data, source: payload.origem, status: 200, endpoint, latencyMs: Date.now() - start };
    },
    async criar(orcamento) { return (await request("", "POST", orcamento)).orcamento; },
    async atualizar(orcamento) {
      const id = orcamento.id || orcamento._id;
      if (!id) throw new Error("Orçamento sem identificador.");
      return (await request(`/${encodeURIComponent(id)}`, "PUT", orcamento)).orcamento;
    },
    async excluir(id) { await request(`/${encodeURIComponent(id)}`, "DELETE"); return id; },
  };
}
