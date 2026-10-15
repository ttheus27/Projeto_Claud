export function calcularCustosOrcamento(orcamento) {
  const lote = Number(orcamento.lotePadrao) || 1;
  const materiaPrima = Number(orcamento.custoMateriaPrima) || 0;
  const margem = Number(orcamento.margemLucroPercentual) || 0;
  const impostos = Number(orcamento.impostosPercentual) || 0;

  let totalUsinagemPeca = 0;
  let totalTempoCicloMin = 0;
  let totalTempoSetupMin = 0;

  const operacoesDetalhadas = (orcamento.operacoes || []).map((operacao) => {
    const setupMin = Number(operacao.tempoSetupMin) || 0;
    const cicloMin = Number(operacao.tempoCicloMin) || 0;
    const custoHoraMaquina = Number(operacao.custoHoraMaquina) || 0;
    const custoHoraHomem = Number(operacao.custoHoraHomem) || 0;
    const ferramental = Number(operacao.custoFerramentalItem) || 0;
    const custoZerado = Boolean(operacao.zerarCusto);

    totalTempoCicloMin += cicloMin;
    totalTempoSetupMin += setupMin;

    const custoSetupTotal = (setupMin / 60) * (custoHoraMaquina + custoHoraHomem);
    const custoSetupUnitario = custoSetupTotal / lote;
    const custoMaquinaUnitario = (cicloMin / 60) * custoHoraMaquina;
    const custoHomemUnitario = (cicloMin / 60) * custoHoraHomem;
    const subtotalNominal = custoSetupUnitario + custoMaquinaUnitario + custoHomemUnitario + ferramental;
    const custoEfetivo = custoZerado ? 0 : subtotalNominal;

    totalUsinagemPeca += custoEfetivo;

    return {
      ...operacao,
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

  return {
    lote,
    materiaPrima,
    totalUsinagemPeca,
    custoDiretoUnitario,
    precoFinalUnitario,
    precoTotalLote: precoFinalUnitario * lote,
    valorLucroUnitario: valorComMargem - custoDiretoUnitario,
    valorImpostosUnitario: precoFinalUnitario - valorComMargem,
    totalTempoCicloMin,
    totalTempoSetupMin,
    operacoesDetalhadas
  };
}
