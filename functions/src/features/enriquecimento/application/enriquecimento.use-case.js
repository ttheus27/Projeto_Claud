const { calcularCustosOrcamento } = require('../domain/calcular-custos');

function enriquecerOrcamento({ orcamento = null, totalPedidos = 0, valorTotalPedidos = 0 } = {}, clock = () => new Date().toISOString()) {
  const invalid = message => { const error = new Error(message); error.statusCode = 400; throw error; };
  if (!Number.isInteger(totalPedidos) || totalPedidos < 0 || !Number.isFinite(valorTotalPedidos) || valorTotalPedidos < 0) invalid('Totais de pedidos inválidos.');
  if (orcamento && (typeof orcamento !== 'object' || Array.isArray(orcamento))) invalid('Orçamento inválido.');
  if (orcamento) {
    if (!Number.isInteger(Number(orcamento.lotePadrao)) || Number(orcamento.lotePadrao) < 1) invalid('Lote de orçamento inválido.');
    for (const key of ['custoMateriaPrima', 'margemLucroPercentual', 'impostosPercentual']) {
      const value = Number(orcamento[key] ?? 0);
      if (!Number.isFinite(value) || value < 0 || (key === 'impostosPercentual' && value >= 100)) invalid('Parâmetro de custo inválido: ' + key);
    }
    if (!Array.isArray(orcamento.operacoes || [])) invalid('Operações devem ser uma lista.');
    if ((orcamento.operacoes || []).length > 1000) invalid('Número de operações excede o limite.');
    for (const op of orcamento.operacoes || []) {
      if (!op || typeof op !== 'object') invalid('Operação inválida.');
      for (const key of ['tempoSetupMin', 'tempoCicloMin', 'custoHoraMaquina', 'custoHoraHomem', 'custoFerramentalItem']) {
        if (!Number.isFinite(Number(op[key] ?? 0)) || Number(op[key] ?? 0) < 0) invalid('Custo ou tempo de operação inválido.');
      }
    }
  }
  const custos = orcamento ? calcularCustosOrcamento(orcamento) : null;
  if (custos && !Number.isFinite(custos.precoTotalLote)) invalid('O cálculo excede o limite numérico.');
  return {
    statusServerless: 'ONLINE_AZURE_CLOUD',
    orcamentoId: orcamento?.id || orcamento?._id || null,
    indiceAprovacaoDiretoria: !orcamento ? 'SEM_ORCAMENTO' : orcamento.status === 'Aprovado' ? 'APROVADO' : 'EM_ANALISE',
    taxaRiscoLogistica: 1.025,
    aliquotaTributariaEfetiva: Number(orcamento?.impostosPercentual || 0) / 100,
    custos,
    precoTotalLote: custos?.precoTotalLote || 0,
    totalPedidos,
    valorTotalPedidos,
    dataCalculo: clock(),
  };
}
module.exports = { enriquecerOrcamento };
