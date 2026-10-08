const DEFAULT_AZURE_BASE_URL = "https://cloud-projeto-orc-f-app-aah7f0c3ezdweygp.canadacentral-01.azurewebsites.net/api";

const AZURE_BASE_URL = import.meta.env.VITE_AZURE_FUNCTIONS_BASE_URL || DEFAULT_AZURE_BASE_URL;

// Configure as quatro Azure Functions em .env quando publicar o CRUD no Atlas.
export const ENDPOINTS_CONFIG = {
  azureFunctionGetOrcamentos: import.meta.env.VITE_AZURE_GET_ORCAMENTOS_URL || `${AZURE_BASE_URL}/GetOrcamentos`,
  azureFunctionCreateOrcamento: import.meta.env.VITE_AZURE_CREATE_ORCAMENTO_URL || `${AZURE_BASE_URL}/CreateOrcamento`,
  azureFunctionUpdateOrcamento: import.meta.env.VITE_AZURE_UPDATE_ORCAMENTO_URL || `${AZURE_BASE_URL}/UpdateOrcamento`,
  azureFunctionDeleteOrcamento: import.meta.env.VITE_AZURE_DELETE_ORCAMENTO_URL || `${AZURE_BASE_URL}/DeleteOrcamento`,
  currentProvider: "Azure Functions + MongoDB Atlas"
};

const FUNCTION_KEY = import.meta.env.VITE_AZURE_FUNCTION_KEY;

function getHeaders(hasBody = false) {
  return {
    Accept: "application/json",
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(FUNCTION_KEY ? { "x-functions-key": FUNCTION_KEY } : {})
  };
}

function getOrcamentoId(orcamento) {
  return orcamento?.id || orcamento?._id;
}

function buildUrl(endpoint, id) {
  if (!id) return endpoint;
  if (endpoint.includes("{id}")) {
    return endpoint.replace("{id}", encodeURIComponent(id));
  }

  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}id=${encodeURIComponent(id)}`;
}

function normalizeOrcamentos(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.orcamentos)) return payload.orcamentos;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeOrcamento(payload, fallback) {
  return payload?.orcamento || payload?.data || payload || fallback;
}

async function requestJson(endpoint, options = {}) {
  const response = await fetch(endpoint, options);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.error || payload?.message || `Erro HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function fetchOrcamentosAzureFunction() {
  const startTime = performance.now();
  const payload = await requestJson(ENDPOINTS_CONFIG.azureFunctionGetOrcamentos, {
    method: "GET",
    headers: getHeaders()
  });

  return {
    data: normalizeOrcamentos(payload),
    source: "Azure Functions + MongoDB Atlas",
    status: 200,
    latencyMs: Math.round(performance.now() - startTime),
    endpoint: ENDPOINTS_CONFIG.azureFunctionGetOrcamentos
  };
}

export async function createOrcamento(novoOrcamento) {
  const payload = await requestJson(ENDPOINTS_CONFIG.azureFunctionCreateOrcamento, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({
      ...novoOrcamento,
      criadoEm: novoOrcamento.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      status: novoOrcamento.status || "Pendente"
    })
  });

  return normalizeOrcamento(payload, novoOrcamento);
}

export async function updateOrcamento(orcamentoAtualizado) {
  const id = getOrcamentoId(orcamentoAtualizado);
  if (!id) {
    throw new Error("Orçamento sem ID não pode ser atualizado.");
  }

  const payload = await requestJson(buildUrl(ENDPOINTS_CONFIG.azureFunctionUpdateOrcamento, id), {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify({
      ...orcamentoAtualizado,
      atualizadoEm: new Date().toISOString()
    })
  });

  return normalizeOrcamento(payload, orcamentoAtualizado);
}

export async function deleteOrcamento(orcamento) {
  const id = typeof orcamento === "string" ? orcamento : getOrcamentoId(orcamento);
  if (!id) {
    throw new Error("Orçamento sem ID não pode ser removido.");
  }

  await requestJson(buildUrl(ENDPOINTS_CONFIG.azureFunctionDeleteOrcamento, id), {
    method: "DELETE",
    headers: getHeaders()
  });

  return id;
}

/**
 * Motor de Calculo de Custos de Usinagem da Schulz & SKA (RF03)
 */
export function calcularCustosOrcamento(orcamento) {
  const lote = Number(orcamento.lotePadrao) || 1;
  const materiaPrima = Number(orcamento.custoMateriaPrima) || 0;
  const margem = Number(orcamento.margemLucroPercentual) || 0;
  const impostos = Number(orcamento.impostosPercentual) || 0;

  let totalUsinagemPeca = 0;
  let totalTempoCicloMin = 0;
  let totalTempoSetupMin = 0;

  const operacoesDetalhadas = (orcamento.operacoes || []).map(op => {
    const setupMin = Number(op.tempoSetupMin) || 0;
    const cicloMin = Number(op.tempoCicloMin) || 0;
    const chm = Number(op.custoHoraMaquina) || 0;
    const chh = Number(op.custoHoraHomem) || 0;
    const ferramental = Number(op.custoFerramentalItem) || 0;
    const isZeroed = Boolean(op.zerarCusto);

    totalTempoCicloMin += cicloMin;
    totalTempoSetupMin += setupMin;

    const custoSetupTotal = (setupMin / 60) * (chm + chh);
    const custoSetupUnitario = custoSetupTotal / lote;
    const custoMaquinaUnitario = (cicloMin / 60) * chm;
    const custoHomemUnitario = (cicloMin / 60) * chh;
    const subtotalNominal = custoSetupUnitario + custoMaquinaUnitario + custoHomemUnitario + ferramental;
    const custoEfetivo = isZeroed ? 0 : subtotalNominal;

    if (!isZeroed) {
      totalUsinagemPeca += custoEfetivo;
    }

    return {
      ...op,
      custoSetupTotal,
      custoSetupUnitario,
      custoMaquinaUnitario,
      custoHomemUnitario,
      subtotalNominal,
      custoEfetivo
    };
  });

  const custoDiretoUnitario = materiaPrima + totalUsinagemPeca;
  const valorComMargem = custoDiretoUnitario * (1 + (margem / 100));
  const divisorImpostos = (1 - (impostos / 100)) || 1;
  const precoFinalUnitario = valorComMargem / divisorImpostos;
  const precoTotalLote = precoFinalUnitario * lote;
  const valorLucroUnitario = valorComMargem - custoDiretoUnitario;
  const valorImpostosUnitario = precoFinalUnitario - valorComMargem;

  return {
    lote,
    materiaPrima,
    totalUsinagemPeca,
    custoDiretoUnitario,
    precoFinalUnitario,
    precoTotalLote,
    valorLucroUnitario,
    valorImpostosUnitario,
    totalTempoCicloMin,
    totalTempoSetupMin,
    operacoesDetalhadas
  };
}
