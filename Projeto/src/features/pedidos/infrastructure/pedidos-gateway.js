import { API_BASE_URL, requestApi } from "../../../shared/http/api-client";
const DEFAULT_PEDIDOS_URL = `${API_BASE_URL}/pedidos`;
export function createPedidosGateway({ endpoint = DEFAULT_PEDIDOS_URL, httpFetch = fetch } = {}) {
  const request = (path = "", method = "GET", body) => requestApi(endpoint + path, { method, body, httpFetch });
  return {
    async listar() {
      const start = Date.now(); const payload = await request();
      if (!Array.isArray(payload?.data)) throw new Error("Resposta inválida do serviço de pedidos.");
      return { data: payload.data, source: payload.origem, latencyMs: Date.now() - start, status: 200 };
    },
    async buscar(id) { return request(`/${encodeURIComponent(id)}`); },
    async criar(pedido) { return (await request("", "POST", pedido)).pedido; },
    async atualizar(id, pedido) { return (await request(`/${encodeURIComponent(id)}`, "PUT", pedido)).pedido; },
    async atualizarStatus(id, status) { return this.atualizar(id, { status_producao: status }); },
    async excluir(id) { await request(`/${encodeURIComponent(id)}`, "DELETE"); return id; },
  };
}
export const pedidosGateway = createPedidosGateway();
