import { describe, expect, it } from 'vitest';
import { calcularCustosOrcamento } from './calcular-custos-orcamento';

describe('Cálculo de custos de orçamento', () => {
  it('DADO um orçamento com matéria-prima e usinagem QUANDO o preço é calculado ENTÃO compõe setup, operação, margem e impostos por peça', () => {
    const resultado = calcularCustosOrcamento({
      lotePadrao: 10,
      custoMateriaPrima: 100,
      margemLucroPercentual: 20,
      impostosPercentual: 10,
      operacoes: [{
        tempoSetupMin: 60,
        tempoCicloMin: 30,
        custoHoraMaquina: 120,
        custoHoraHomem: 60,
        custoFerramentalItem: 5,
        zerarCusto: false
      }]
    });

    expect(resultado.operacoesDetalhadas[0]).toMatchObject({
      custoSetupTotal: 180,
      custoSetupUnitario: 18,
      custoMaquinaUnitario: 60,
      custoHomemUnitario: 30,
      custoEfetivo: 113
    });
    expect(resultado.custoDiretoUnitario).toBe(213);
    expect(resultado.precoFinalUnitario).toBeCloseTo(284, 8);
    expect(resultado.precoTotalLote).toBeCloseTo(2840, 8);
  });

  it('DADO uma operação marcada como custo zerado QUANDO o orçamento é calculado ENTÃO mantém os tempos da produção sem adicionar seu custo ao preço', () => {
    const resultado = calcularCustosOrcamento({
      lotePadrao: 20,
      custoMateriaPrima: 50,
      margemLucroPercentual: 0,
      impostosPercentual: 0,
      operacoes: [{
        tempoSetupMin: 30,
        tempoCicloMin: 12,
        custoHoraMaquina: 100,
        custoHoraHomem: 50,
        custoFerramentalItem: 10,
        zerarCusto: true
      }]
    });

    expect(resultado.operacoesDetalhadas[0].subtotalNominal).toBeCloseTo(43.75, 8);
    expect(resultado.operacoesDetalhadas[0].custoEfetivo).toBe(0);
    expect(resultado.totalTempoSetupMin).toBe(30);
    expect(resultado.totalTempoCicloMin).toBe(12);
    expect(resultado.totalUsinagemPeca).toBe(0);
    expect(resultado.precoFinalUnitario).toBe(50);
  });
});
