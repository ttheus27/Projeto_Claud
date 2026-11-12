export class PedidoValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "PedidoValidationError";
    this.statusCode = 400;
  }
}

export function gerarCodigoPedido() {
  const ano = new Date().getFullYear();
  const num = Math.floor(100 + Math.random() * 900);
  return `PED-${ano}-${num}`;
}

export function validarEFormatarPedido(dados, isEdicao = false) {
  if (!dados || typeof dados !== "object") {
    throw new PedidoValidationError("Payload de pedido é obrigatório.");
  }

  if (!dados.codigo_orcamento && !dados.codigoOrcamento) {
    throw new PedidoValidationError("Código do orçamento de origem é obrigatório para abrir um pedido.");
  }

  const agora = new Date().toISOString();
  const id = dados.id_pedido || dados.id || (isEdicao ? null : gerarCodigoPedido());

  if (isEdicao && !id) {
    throw new PedidoValidationError("ID do pedido obrigatório para atualização.");
  }

  const statusValidos = ["Em Planejamento", "Em Usinagem CNC", "Aguardando Expedição", "Concluído"];
  const status = dados.status_producao || dados.status || "Em Planejamento";

  return {
    id_pedido: id,
    codigo_orcamento: String(dados.codigo_orcamento || dados.codigoOrcamento).trim(),
    cliente: String(dados.cliente || "Schulz S/A").trim(),
    descricao_peca: String(dados.descricao_peca || dados.descricaoPeca || "Peça Usinada").trim(),
    lote_producao: Math.max(1, Number(dados.lote_producao || dados.loteProducao || dados.lotePadrao) || 1),
    valor_total: Math.max(0, Number(dados.valor_total || dados.valorTotal) || 0),
    status_producao: statusValidos.includes(status) ? status : "Em Planejamento",
    data_entrega_prevista: dados.data_entrega_prevista || dados.dataEntrega || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    criado_em: dados.criado_em || agora,
    atualizado_em: agora
  };
}
