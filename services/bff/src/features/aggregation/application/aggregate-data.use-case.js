/** Application slice: orchestrates ports; no HTTP clients, config or drivers. */
export function makeAggregateData({ orcamentosGateway, pedidosGateway, enrichmentGateway, clock = () => new Date().toISOString(), now = () => Date.now() }) {
  return async function aggregateData() {
  const started = now();
  const [mongo, sql] = await Promise.allSettled([orcamentosGateway.listar(), pedidosGateway.listar()]);
  const orcamentos = mongo.status === 'fulfilled' ? mongo.value : [];
  const pedidos = sql.status === 'fulfilled' ? sql.value : [];
  const orcamento = orcamentos[0] || null;
  const valorTotalPedidos = pedidos.reduce((sum, item) => sum + Number(item.valor_total || 0), 0);
  let enriquecimento = null;
  const errors = [];
  if (mongo.status === 'rejected') errors.push({ servico: 'mongo', error: 'Microserviço de orçamentos indisponível.' });
  if (sql.status === 'rejected') errors.push({ servico: 'sql', error: 'Microserviço de pedidos indisponível.' });
  try {
    const payload = await enrichmentGateway.enriquecer({ orcamento, totalPedidos: pedidos.length, valorTotalPedidos });
    if (!payload.enriquecimento || typeof payload.enriquecimento !== 'object') throw new Error('Resposta de cálculo inválida.');
    enriquecimento = payload.enriquecimento;
  } catch { errors.push({ servico: 'function', error: 'Cálculo serverless indisponível.' }); }
  const id = orcamento?.id || orcamento?._id;
  return {
    timestamp: clock(), status: errors.length ? 'partial' : 'success',
    latenciaTotalMs: now() - started,
    nosIntegrados: {
      microservico1Mongo: { status: mongo.status === 'fulfilled' ? 'online' : 'offline', endpoint: orcamentosGateway.endpoint, banco: 'MongoDB Atlas' },
      microservico2Sql: { status: sql.status === 'fulfilled' ? 'online' : 'offline', endpoint: pedidosGateway.endpoint, banco: 'Azure SQL Database' },
      azureFunctionServerless: { status: enriquecimento ? 'online' : 'offline', endpoint: enrichmentGateway.endpoint, tipo: 'HTTP Trigger — cálculo de custos' },
    },
    data: {
      orcamentos, pedidos,
      orcamentoAtivo: orcamento && enriquecimento?.custos ? { ...orcamento, operacoes: enriquecimento.custos.operacoesDetalhadas } : orcamento,
      pedidosAssociados: pedidos.filter(item => item.codigo_orcamento === id),
      enriquecimentoServerless: enriquecimento,
      resumoGeral: { totalOrcamentosCadastrados: orcamentos.length, totalOrdensProducaoSQL: pedidos.length, valorTotalOrdensSQL: valorTotalPedidos },
    },
    errors,
  };
}

}
