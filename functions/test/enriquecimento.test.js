const { test } = require('node:test');
const assert = require('node:assert/strict');
const { enriquecerOrcamento } = require('../src/features/enriquecimento/enriquecimento.use-case');
test('cálculo serverless respeita operação bonificada e os parâmetros do orçamento', () => {
 const orcamento = { id: 'ORC-TEST', status: 'Aprovado', lotePadrao: 10, custoMateriaPrima: 100, margemLucroPercentual: 20, impostosPercentual: 10,
 operacoes: [{ tempoCicloMin: 60, custoHoraMaquina: 50, zerarCusto: false }, { tempoCicloMin: 60, custoHoraMaquina: 999, zerarCusto: true }] };
 const result = enriquecerOrcamento({ orcamento, totalPedidos: 1, valorTotalPedidos: 200 }, () => '2026-11-12T20:00:00Z');
 assert.equal(result.custos.custoDiretoUnitario, 150);assert.equal(result.custos.precoFinalUnitario, 200);assert.equal(result.precoTotalLote, 2000);assert.equal(result.aliquotaTributariaEfetiva, .1);assert.equal(result.dataCalculo, '2026-11-12T20:00:00Z');
});
test('entrada inválida não gera um preço aparentemente válido', () => {
 assert.throws(() => enriquecerOrcamento({ orcamento: { lotePadrao: 0 } }));
 assert.throws(() => enriquecerOrcamento({ orcamento: { lotePadrao: 1, impostosPercentual: 100 } }));
 assert.throws(() => enriquecerOrcamento({ totalPedidos: -1 }));
 assert.equal(enriquecerOrcamento({}).indiceAprovacaoDiretoria, 'SEM_ORCAMENTO');
});
