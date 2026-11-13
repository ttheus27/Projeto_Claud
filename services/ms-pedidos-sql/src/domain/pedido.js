import { randomUUID } from "node:crypto";

export class PedidoValidationError extends Error {
  constructor(message) { super(message); this.name = "PedidoValidationError"; this.statusCode = 400; }
}
export const STATUS_PEDIDO = ["Em Planejamento", "Em Usinagem CNC", "Aguardando Expedição", "Concluído"];
export function gerarCodigoPedido() {
  return `PED-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}
function texto(value, campo, max) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new PedidoValidationError(`${campo} é obrigatório e deve ter até ${max} caracteres.`);
  }
  return value.trim();
}
export function validarIdPedido(id) { return texto(id, "ID do pedido", 64); }
export function validarEFormatarPedido(dados, isEdicao = false) {
  if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new PedidoValidationError("Payload de pedido é obrigatório.");
  const lote = Number(dados.lote_producao ?? dados.loteProducao ?? dados.lotePadrao);
  const valor = Number(dados.valor_total ?? dados.valorTotal);
  if (!Number.isInteger(lote) || lote < 1 || lote > 2147483647) throw new PedidoValidationError("Lote de produção deve ser um inteiro positivo.");
  if (!Number.isFinite(valor) || valor < 0 || valor > 999999999999.99) throw new PedidoValidationError("Valor total deve ser um número entre zero e 999999999999,99.");
  const status = dados.status_producao ?? dados.status ?? "Em Planejamento";
  if (!STATUS_PEDIDO.includes(status)) throw new PedidoValidationError("Status de produção inválido.");
  const entrega = dados.data_entrega_prevista ?? dados.dataEntrega;
  const date = typeof entrega === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entrega) ? new Date(`${entrega}T00:00:00Z`) : null;
  if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== entrega || Number(entrega.slice(0, 4)) < 1) throw new PedidoValidationError("Informe uma data de entrega válida (AAAA-MM-DD).");
  return {
    id_pedido: validarIdPedido(dados.id_pedido || dados.id || (!isEdicao && gerarCodigoPedido())),
    codigo_orcamento: texto(dados.codigo_orcamento ?? dados.codigoOrcamento, "Código do orçamento", 64),
    cliente: texto(dados.cliente, "Cliente", 150),
    descricao_peca: texto(dados.descricao_peca ?? dados.descricaoPeca, "Descrição da peça", 300),
    lote_producao: lote, valor_total: Math.round((valor + Number.EPSILON) * 100) / 100,
    status_producao: status, data_entrega_prevista: entrega,
  };
}
