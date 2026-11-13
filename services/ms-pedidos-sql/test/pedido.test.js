import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createPedidoUseCases } from "../src/application/pedido-use-cases.js";
import { validarEFormatarPedido } from "../src/domain/pedido.js";
import { createPedidoRouter } from "../src/presentation/pedido.routes.js";

const pedido = { id_pedido: "PED-TEST", codigo_orcamento: "ORC-TEST", cliente: "Cliente", descricao_peca: "Peça", lote_producao: 10, valor_total: 0, status_producao: "Em Planejamento", data_entrega_prevista: "2026-12-15" };
test("valida datas reais, lotes inteiros e status, preservando valor zero", () => {
  assert.equal(validarEFormatarPedido(pedido).valor_total, 0);
  for (const patch of [{ data_entrega_prevista: "2026-02-30" }, { lote_producao: 1.5 }, { valor_total: -1 }, { status_producao: "inexistente" }, { codigo_orcamento: " " }]) {
    assert.throws(() => validarEFormatarPedido({ ...pedido, ...patch }));
  }
});

async function serve(repository, run) {
  const app = express(); app.use(express.json()); app.use("/api", createPedidoRouter(createPedidoUseCases({ listar: async () => [], buscarPorId: async () => null, buscarPorOrcamento: async () => [], criar: async p => p, atualizar: async () => null, excluir: async () => false, ...repository })));
  const server = await new Promise(resolve => { const instance = app.listen(0, "127.0.0.1", () => resolve(instance)); });
  try { await run(`http://127.0.0.1:${server.address().port}/api`); }
  finally { await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }); }
}
test("editar somente o status preserva os demais campos e o ID da URL", async () => {
  let saved;
  await serve({ buscarPorId: async () => pedido, atualizar: async (id, value) => { saved = value; return value; } }, async base => {
    const response = await fetch(`${base}/pedidos/PED-TEST`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_pedido: "OUTRO", status_producao: "Concluído" }) });
    assert.equal(response.status, 200);
    assert.equal(saved.id_pedido, "PED-TEST"); assert.equal(saved.codigo_orcamento, pedido.codigo_orcamento); assert.equal(saved.valor_total, 0); assert.equal(saved.status_producao, "Concluído");
  });
});
test("falhas do banco retornam erro e exclusão inexistente retorna 404", async () => {
  await serve({ listar: async () => { throw Object.assign(new Error("detalhe interno"), { code: "ECONNRESET" }); }, excluir: async () => false }, async base => {
    const response = await fetch(`${base}/pedidos`);
    assert.equal(response.status, 503); assert.ok(!(await response.text()).includes("detalhe interno"));
    assert.equal((await fetch(`${base}/pedidos/ausente`, { method: "DELETE" })).status, 404);
  });
});
