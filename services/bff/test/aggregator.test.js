import { test } from "node:test";
import assert from "node:assert/strict";
import { getAggregatedData } from "../src/services/aggregator.service.js";
const json = value => new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json" } });
test("BFF consulta os dois domínios e usa o cálculo retornado pela Function", async () => {
  let sent;
  const result = await getAggregatedData({ httpFetch: async (url, options) => {
    if (url.endsWith('/api/orcamentos')) return json({ data: [{ id: 'ORC-1' }] });
    if (url.endsWith('/api/pedidos')) return json({ data: [{ id_pedido: 'PED-1', codigo_orcamento: 'ORC-1', valor_total: 100 }, { id_pedido: 'PED-2', codigo_orcamento: 'ORC-OUTRO', valor_total: 200 }] });
    sent = JSON.parse(options.body);return json({ enriquecimento: { precoTotalLote: 777, dataCalculo: '2026-11-12T20:00:00Z' } });
  } });
  assert.equal(result.status, 'success');assert.equal(sent.orcamento.id, 'ORC-1');assert.equal(sent.valorTotalPedidos, 300);
  assert.equal(result.data.enriquecimentoServerless.precoTotalLote, 777);assert.equal(result.data.pedidosAssociados.length, 1);
});
test("falha de um serviço é informada sem fabricar enriquecimento ou dados", async () => {
  const result = await getAggregatedData({ httpFetch: async url => {
    if (url.endsWith('/api/pedidos')) return json({ data: [] });
    throw new Error('indisponível');
  } });
  assert.equal(result.status, 'partial');assert.equal(result.nosIntegrados.microservico1Mongo.status, 'offline');
  assert.equal(result.nosIntegrados.azureFunctionServerless.status, 'offline');assert.equal(result.data.enriquecimentoServerless, null);assert.deepEqual(result.data.orcamentos, []);
});
