import { test } from "node:test";
import assert from "node:assert/strict";
import { createOrcamentoUseCases } from "../src/application/orcamento-use-cases.js";

function repository(overrides = {}) {
  return { listar: async () => [], buscarPorId: async () => null, criar: async value => value, atualizar: async () => null, excluir: async () => false, ...overrides };
}
test("criar aplica regras de domínio antes de chamar a persistência", async () => {
  let calls = 0;
  const useCases = createOrcamentoUseCases(repository({ criar: async value => { calls++; return value; } }));
  assert.throws(() => useCases.criar({ descricaoPeca: "" }));assert.equal(calls, 0);
  const result = await useCases.criar({ descricaoPeca: "Peça", lotePadrao: 10, custoMateriaPrima: 0 });
  assert.equal(result.custoMateriaPrima, 0);assert.equal(result.lotePadrao, 10);assert.equal(calls, 1);
});
test("editar preserva identidade e criação e aceita alteração parcial", async () => {
  const original = { id: "ORC-1", descricaoPeca: "Peça", lotePadrao: 10, criadoEm: "2026-01-01T00:00:00Z", operacoes: [] };
  let saved;
  const useCases = createOrcamentoUseCases(repository({ buscarPorId: async () => original, atualizar: async (id, value) => { saved = value; return value; } }));
  await useCases.atualizar("ORC-1", { id: "OUTRO", criadoEm: "2027-01-01", lotePadrao: 20 });
  assert.equal(saved.id, "ORC-1");assert.equal(saved.criadoEm, original.criadoEm);assert.equal(saved.descricaoPeca, "Peça");assert.equal(saved.lotePadrao, 20);
});
test("buscar, editar e excluir IDs ausentes produzem erro de aplicação", async () => {
  const useCases = createOrcamentoUseCases(repository());
  for (const action of [() => useCases.buscarPorId("ausente"), () => useCases.atualizar("ausente", {}), () => useCases.excluir("ausente")]) {
    await assert.rejects(action, error => error.statusCode === 404);
  }
});
