import { INITIAL_ORCAMENTOS } from "../../../data/mockData";

const STORAGE_KEY = "integrador_orcamentos_data_v1";

function getLocalData() {
  if (typeof window === "undefined" || !window.localStorage) {
    return [...INITIAL_ORCAMENTOS];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORCAMENTOS));
      return [...INITIAL_ORCAMENTOS];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_ORCAMENTOS];
  }
}

function saveLocalData(data) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage quota errors
    }
  }
}

const DEFAULT_AZURE_BASE_URL =
  "https://cloud-projeto-orc-f-app.azurewebsites.net/api";

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

async function requestJson(httpFetch, endpoint, options = {}, timeoutMs = 15000) {
  let timerId;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const signal = controller?.signal;

  if (controller && timeoutMs) {
    timerId = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    const response = await httpFetch(endpoint, { ...options, signal });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(
        payload?.error || payload?.message || `Erro HTTP ${response.status}`,
      );
    }

    return payload;
  } finally {
    if (timerId) clearTimeout(timerId);
  }
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
      try {
        const payload = await requestJson(httpFetch, endpoints.listar, {
          method: "GET",
          headers: buildHeaders(functionKey),
        });

        const collection = normalizeCollection(payload);
        if (collection && collection.length > 0) {
          saveLocalData(collection);
          return {
            data: collection,
            source: "Azure Functions + MongoDB Atlas (Nuvem Ativa)",
            status: 200,
            latencyMs: Math.round(now() - startedAt),
            endpoint: endpoints.listar,
          };
        }
      } catch (err) {
        // Fallback resiliente automático conforme previsto no arc42 (ADR-03)
        console.warn(
          "Azure Functions inacessível ou com CORS restrito. Ativando cache resiliente local:",
          err.message,
        );
      }

      const cached = getLocalData();
      return {
        data: cached,
        source: "Modo Resiliente Local (Cache / Mock Schulz)",
        status: 200,
        latencyMs: Math.round(now() - startedAt),
        endpoint: endpoints.listar,
      };
    },

    async criar(orcamento) {
      try {
        const payload = await requestJson(httpFetch, endpoints.criar, {
          method: "POST",
          headers: buildHeaders(functionKey, true),
          body: JSON.stringify(orcamento),
        });
        const created = normalizeOrcamento(payload, orcamento);
        const list = getLocalData();
        list.unshift(created);
        saveLocalData(list);
        return created;
      } catch {
        // Fallback offline
        const list = getLocalData();
        const created = {
          ...orcamento,
          id: orcamento.id || `ORC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          criadoEm: orcamento.criadoEm || new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          status: orcamento.status || "Pendente",
        };
        list.unshift(created);
        saveLocalData(list);
        return created;
      }
    },

    async atualizar(orcamento) {
      const id = orcamento.id || orcamento._id;
      if (!id) {
        throw new Error("Orçamento sem ID não pode ser atualizado.");
      }

      try {
        const payload = await requestJson(
          httpFetch,
          buildUrl(endpoints.atualizar, id),
          {
            method: "PUT",
            headers: buildHeaders(functionKey, true),
            body: JSON.stringify(orcamento),
          },
        );
        const updated = normalizeOrcamento(payload, orcamento);
        const list = getLocalData();
        const idx = list.findIndex((item) => (item.id || item._id) === id);
        if (idx !== -1) {
          list[idx] = updated;
          saveLocalData(list);
        }
        return updated;
      } catch {
        // Fallback offline
        const list = getLocalData();
        const idx = list.findIndex((item) => (item.id || item._id) === id);
        const updated = {
          ...orcamento,
          atualizadoEm: new Date().toISOString(),
        };
        if (idx !== -1) {
          list[idx] = updated;
        } else {
          list.push(updated);
        }
        saveLocalData(list);
        return updated;
      }
    },

    async excluir(id) {
      try {
        await requestJson(httpFetch, buildUrl(endpoints.excluir, id), {
          method: "DELETE",
          headers: buildHeaders(functionKey),
        });
      } catch {
        // Fallback offline
      }

      const list = getLocalData();
      const filtered = list.filter((item) => (item.id || item._id) !== id);
      saveLocalData(filtered);
      return id;
    },
  };
}
