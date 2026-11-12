import { randomUUID } from "node:crypto";
/**
 * Domínio do Orçamento Schulz S/A
 * Regras de validação e estruturação da folha de processos CNC.
 */

export class OrcamentoValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "OrcamentoValidationError";
    this.statusCode = 400;
  }
}

export function sanitizeNumero(valor, padrao = 0) {
  const num = Number(valor);
  return Number.isFinite(num) ? num : padrao;
}

export function gerarCodigoOrcamento() {
  const ano = new Date().getFullYear();
  const aleatorio = randomUUID().slice(0, 8).toUpperCase();
  return `ORC-${ano}-${aleatorio}`;
}

export function validarEFormatarOrcamento(dados, isEdicao = false) {
  if (!dados || typeof dados !== "object") {
    throw new OrcamentoValidationError("O payload do orçamento é obrigatório.");
  }

  if (!dados.descricaoPeca || !String(dados.descricaoPeca).trim()) {
    throw new OrcamentoValidationError("A descrição da peça é obrigatória.");
  }

  const agora = new Date().toISOString();
  const id = dados.id || dados._id || (isEdicao ? null : gerarCodigoOrcamento());

  if (isEdicao && !id) {
    throw new OrcamentoValidationError("Identificador do orçamento não informado para atualização.");
  }

  const lote = Math.max(1, sanitizeNumero(dados.lotePadrao, 1));
  const operacoes = Array.isArray(dados.operacoes) ? dados.operacoes : [];

  const operacoesFormatadas = operacoes.map((op, idx) => ({
    id: op.id || `OP-${(idx + 1) * 10}`,
    ordem: idx + 1,
    codigo: String(op.codigo || `USIN-OP-${idx + 1}`).trim(),
    descricao: String(op.descricao || `Operação ${idx + 1}`).trim(),
    centroTrabalho: String(op.centroTrabalho || "Centro de Usinagem CNC").trim(),
    tempoSetupMin: Math.max(0, sanitizeNumero(op.tempoSetupMin, 0)),
    tempoCicloMin: Math.max(0, sanitizeNumero(op.tempoCicloMin, 0)),
    custoHoraMaquina: Math.max(0, sanitizeNumero(op.custoHoraMaquina, 150)),
    custoHoraHomem: Math.max(0, sanitizeNumero(op.custoHoraHomem, 45)),
    custoFerramentalItem: Math.max(0, sanitizeNumero(op.custoFerramentalItem, 0)),
    zerarCusto: Boolean(op.zerarCusto),
    observacao: op.observacao ? String(op.observacao).trim() : ""
  }));

  return {
    id,
    cliente: String(dados.cliente || "Schulz S/A").trim(),
    unidade: String(dados.unidade || "Unidade Joinville - SC").trim(),
    codigoPeca: String(dados.codigoPeca || "SCH-0001").trim(),
    descricaoPeca: String(dados.descricaoPeca).trim(),
    material: String(dados.material || "Aço Beneficiado").trim(),
    dureza: String(dados.dureza || "30 HRC").trim(),
    pesoKg: Math.max(0.1, sanitizeNumero(dados.pesoKg, 1.0)),
    lotePadrao: lote,
    status: dados.status || "Pendente",
    responsavel: String(dados.responsavel || "Engenharia de Manufatura").trim(),
    centroCusto: String(dados.centroCusto || "CC-310 (Usinagem Pesada CNC)").trim(),
    custoMateriaPrima: Math.max(0, sanitizeNumero(dados.custoMateriaPrima, 0)),
    margemLucroPercentual: Math.max(0, sanitizeNumero(dados.margemLucroPercentual, 20)),
    impostosPercentual: Math.max(0, sanitizeNumero(dados.impostosPercentual, 14.25)),
    desenhoTecnico: dados.desenhoTecnico || {
      numero: `DWG-${dados.codigoPeca || "SCH-0001"}-REV-A`,
      revisao: "Rev. A",
      toleranciaGeral: "ISO 2768-mK",
      rugosidade: "Ra 1.6 um",
      dimensoes: "Conforme desenho dimensional Schulz",
      svgTipo: "virabrequim"
    },
    operacoes: operacoesFormatadas,
    criadoEm: dados.criadoEm || agora,
    atualizadoEm: agora
  };
}
