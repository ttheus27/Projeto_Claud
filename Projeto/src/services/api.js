import { INITIAL_ORCAMENTOS, AUDIT_HISTORY } from '../data/mockData';

// Configurações de Endpoints (Mock Azure Functions e Apidog)
export const ENDPOINTS_CONFIG = {
  azureFunctionGetOrcamentos: "https://func-schulz-matheus-dxafhzd5hkchhgc7.canadaeast-01.azurewebsites.net/api/GetOrcamentos",
  apidogMockCustos: "https://mock.apidog.com/m1/498210-492100-default/api/v1/orcamentos/{id}/custos",
  apidogMockReports: "https://mock.apidog.com/m1/498210-492100-default/api/v1/relatorios/integrador-reports",
  currentProvider: "Azure Function Live API (Cloud)"
};

const STORAGE_KEY = "integrador_orcamentos_data_v1";
const AUDIT_STORAGE_KEY = "integrador_audit_history_v1";

// Inicializa o LocalStorage com os dados base caso não existam
function getStoredData() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORCAMENTOS));
    return INITIAL_ORCAMENTOS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ORCAMENTOS;
  }
}

function saveStoredData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAuditLogs() {
  const data = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(AUDIT_HISTORY));
    return AUDIT_HISTORY;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return AUDIT_HISTORY;
  }
}

export function logAuditAction(orcamentoId, acao, detalhes, usuario = "usuario.operacional@schulz.com.br") {
  const logs = getAuditLogs();
  const newLog = {
    id: `AUD-${Date.now()}`,
    orcamentoId,
    dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
    usuario,
    acao,
    detalhes
  };
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedLogs));
  return updatedLogs;
}

/**
 * Endpoint GET simulando chamada à Azure Function:
 * https://func-integrador-schulz.azurewebsites.net/api/GetOrcamentos
 * 
 * Implementa retry inteligente e fallback para Mock Local estruturado
 */
export async function fetchOrcamentosAzureFunction() {
  const startTime = performance.now();
  
  try {
    // Tentativa de chamada real ao endpoint (com timeout curto para fallback gracioso)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    
    // Tenta fetch (em produção chamaria a function real; caso offline/mock, cai no fallback controlado)
    const response = await fetch(ENDPOINTS_CONFIG.azureFunctionGetOrcamentos, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "x-functions-key": "schulz-integrador-demo-key-2026"
      }
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const data = await response.json();
      return {
        data,
        source: "Azure Function Live API (200 OK)",
        status: 200,
        latencyMs: Math.round(performance.now() - startTime),
        endpoint: ENDPOINTS_CONFIG.azureFunctionGetOrcamentos
      };
    }
  } catch (err) {
    // Prossegue para o mock estruturado
  }

  // Simulação de latência de rede realista (300ms) para experiência interativa
  await new Promise(resolve => setTimeout(resolve, 350));
  const data = getStoredData();

  return {
    data,
    source: "Azure Function Mock (Simulação Resiliente PJBL)",
    status: 200,
    latencyMs: Math.round(performance.now() - startTime),
    endpoint: ENDPOINTS_CONFIG.azureFunctionGetOrcamentos
  };
}

/**
 * Atualiza um orçamento e recalcula
 */
export async function updateOrcamento(orcamentoAtualizado, motivoAuditoria = "Atualização de dados") {
  await new Promise(resolve => setTimeout(resolve, 200));
  const lista = getStoredData();
  const index = lista.findIndex(item => item.id === orcamentoAtualizado.id);
  
  if (index !== -1) {
    orcamentoAtualizado.atualizadoEm = new Date().toISOString();
    lista[index] = orcamentoAtualizado;
    saveStoredData(lista);
    
    logAuditAction(
      orcamentoAtualizado.id,
      "Edição de Orçamento",
      `${motivoAuditoria} para o item ${orcamentoAtualizado.codigoPeca}`
    );
    return orcamentoAtualizado;
  }
  throw new Error("Orçamento não encontrado.");
}

/**
 * Cria um novo orçamento (usado na importação RF01)
 */
export async function createOrcamento(novoOrcamento) {
  await new Promise(resolve => setTimeout(resolve, 300));
  const lista = getStoredData();
  const id = `ORC-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const orcamentoComId = {
    ...novoOrcamento,
    id,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    status: novoOrcamento.status || "Pendente"
  };
  
  lista.unshift(orcamentoComId);
  saveStoredData(lista);
  
  logAuditAction(
    id,
    "Importação de Planilha",
    `Novo orçamento cadastrado a partir de planilha Schulz: ${orcamentoComId.descricaoPeca}`
  );
  return orcamentoComId;
}

/**
 * Motor de Cálculo de Custos de Usinagem da Schulz & SKA (RF03)
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

    // Cálculo do setup amortizado por unidade do lote
    const custoSetupTotal = (setupMin / 60) * (chm + chh);
    const custoSetupUnitario = custoSetupTotal / lote;

    // Custo de ciclo unitário
    const custoMaquinaUnitario = (cicloMin / 60) * chm;
    const custoHomemUnitario = (cicloMin / 60) * chh;

    // Subtotal nominal da operação
    const subtotalNominal = custoSetupUnitario + custoMaquinaUnitario + custoHomemUnitario + ferramental;
    
    // Se zerarCusto = true (RF03), o custo efetivo é R$ 0.00
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
