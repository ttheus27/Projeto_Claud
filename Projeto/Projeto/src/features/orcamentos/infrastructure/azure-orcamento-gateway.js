const DEFAULT_AZURE_BASE_URL =
  "https://cloud-projeto-orc-f-app-aah7f0c3ezdweygp.canadacentral-01.azurewebsites.net/api";

function getDefaultEndpoints() {
  const baseUrl =
    import.meta.env.VITE_AZURE_FUNCTIONS_BASE_URL || DEFAULT_AZURE_BASE_URL;

  return {
    listar:
      import.meta.env.VITE_AZURE_GET_ORCAMENTOS_URL ||
      `${baseUrl}/GetOrcamentos`,
    criar:
      import.meta.env.VITE_AZURE_CREATE_ORCAMENTO_URL ||
      `${baseUrl}/CreateOrcamento`,
    atualizar:
      import.meta.env.VITE_AZURE_UPDATE_ORCAMENTO_URL ||
      `${baseUrl}/UpdateOrcamento`,
    excluir:
      import.meta.env.VITE_AZURE_DELETE_ORCAMENTO_URL ||
      `${baseUrl}/DeleteOrcamento`,
  };
}

export const ORCAMENTO_API_CONFIGURATION = {
  endpoints: getDefaultEndpoints(),
  currentProvider: "Azure Functions + MongoDB Atlas",
};

function buildHeaders(functionKey, hasBody = false) {
  return {
    Accept: "application/json",
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(functionKey ? { "x-functions-key": functionKey } : {}),
  };
}

function buildUrl(endpoint, id) {
  if (endpoint.includes("{id}")) {
    return endpoint.replace("{id}", encodeURIComponent(id));
  }

  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}id=${encodeURIComponent(id)}`;
}

function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.orcamentos)) return payload.orcamentos;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeOrcamento(payload, fallback) {
  return payload?.orcamento || payload?.data || payload || fallback;
}

async function requestJson(httpFetch, endpoint, options = {}) {
  const response = await httpFetch(endpoint, options);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      payload?.error || payload?.message || `Erro HTTP ${response.status}`,
    );
  }

  return payload;
}

export function createAzureOrcamentoGateway({
  httpFetch = fetch,
  endpoints = ORCAMENTO_API_CONFIGURATION.endpoints,
  functionKey = import.meta.env.VITE_AZURE_FUNCTION_KEY,
  now = () => globalThis.performance?.now?.() ?? Date.now(),
} = {}) {
  return {
    async listar() {
      const startedAt = now();
      const payload = await requestJson(httpFetch, endpoints.listar, {
        method: "GET",
        headers: buildHeaders(functionKey),
      });

      return {
        data: normalizeCollection(payload),
        source: "Azure Functions + MongoDB Atlas",
        status: 200,
        latencyMs: Math.round(now() - startedAt),
        endpoint: endpoints.listar,
      };
    },

    async criar(orcamento) {
      const payload = await requestJson(httpFetch, endpoints.criar, {
        method: "POST",
        headers: buildHeaders(functionKey, true),
        body: JSON.stringify(orcamento),
      });

      return normalizeOrcamento(payload, orcamento);
    },

    async atualizar(orcamento) {
      const id = orcamento.id || orcamento._id;
      if (!id) {
        throw new Error("Orçamento sem ID não pode ser atualizado.");
      }

      const payload = await requestJson(
        httpFetch,
        buildUrl(endpoints.atualizar, id),
        {
          method: "PUT",
          headers: buildHeaders(functionKey, true),
          body: JSON.stringify(orcamento),
        },
      );

      return normalizeOrcamento(payload, orcamento);
    },

    async excluir(id) {
      await requestJson(httpFetch, buildUrl(endpoints.excluir, id), {
        method: "DELETE",
        headers: buildHeaders(functionKey),
      });

      return id;
    },
  };
}
