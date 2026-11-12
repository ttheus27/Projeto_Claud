export const makeGenerateOrder = ({ createOrder, clock = () => Date.now() }) => data => createOrder({
  codigo_orcamento: data.idOrcamento, cliente: data.cliente,
  descricao_peca: data.descricaoPeca, lote_producao: data.lotePadrao,
  valor_total: data.precoTotalLote, status_producao: "Em Planejamento",
  data_entrega_prevista: new Date(clock() + 30 * 86400000).toISOString().slice(0, 10),
});
