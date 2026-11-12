import fs from "node:fs";
import dotenv from "dotenv";
import assert from "node:assert/strict";
import { getPool, closePool, sql } from "../src/infrastructure/database.js";

const base = process.env.PEDIDOS_API_URL || "http://localhost:8090/api/pedidos";
const env = dotenv.parse(fs.readFileSync(new URL("../../api-gateway/.env", import.meta.url)));
const login = await fetch(new URL("/api/session", base), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: env.GATEWAY_USERNAME, password: env.GATEWAY_PASSWORD }) });
assert.equal(login.status, 200);
const cookie = login.headers.get("set-cookie").split(";")[0];
const id = `PED-TEST-${Date.now()}`;
async function request(path = "", method = "GET", body) {
  const response = await fetch(`${base}${path}`, { method, signal: AbortSignal.timeout(110000), headers: { Cookie: cookie },
    ...(body ? { headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify(body) } : {}) });
  return { status: response.status, payload: await response.json() };
}
const before = await request(); assert.equal(before.status, 200); assert.equal(before.payload.origem, "Azure SQL Database");
const originals = before.payload.data.map(row => row.id_pedido);
const body = { id_pedido: id, codigo_orcamento: "ORC-TEST", cliente: "Teste temporário SQL", descricao_peca: "Peça '); DROP TABLE dbo.TB_PEDIDOS;--", lote_producao: 1, valor_total: 0, status_producao: "Em Planejamento", data_entrega_prevista: "2026-12-15" };
let attempted = false;
try {
  attempted = true;
  const created = await request("", "POST", body); assert.equal(created.status, 201); assert.equal(created.payload.pedido.valor_total, 0);
  console.log("CREATE pelo BFF: 201, valor zero preservado.");
  assert.equal((await request("", "POST", body)).status, 409);
  const found = await request(`/${id}`); assert.equal(found.status, 200); assert.equal(found.payload.descricao_peca, body.descricao_peca);
  console.log("READ pelo BFF: conteúdo com caracteres SQL tratado como dado.");
  const updated = await request(`/${id}`, "PUT", { status_producao: "Concluído", valor_total: 123.45 });
  assert.equal(updated.status, 200); assert.equal(updated.payload.pedido.cliente, body.cliente); assert.equal(updated.payload.pedido.status_producao, "Concluído");
  const persisted = await (await getPool()).request().input("id", sql.NVarChar(64), id)
    .query("SELECT DB_NAME() AS banco, valor_total, status_producao FROM dbo.TB_PEDIDOS WHERE id_pedido = @id");
  assert.equal(persisted.recordset[0].banco, "schulz-pedidos"); assert.equal(persisted.recordset[0].valor_total, 123.45);
  assert.equal(persisted.recordset[0].status_producao, "Concluído");
  console.log("UPDATE confirmado por consulta direta ao Azure SQL.");
  assert.equal((await request(`/${id}`, "PUT", { data_entrega_prevista: "2026-02-30" })).status, 400);
} finally {
  try {
    if (attempted) { const deleted = await request(`/${id}`, "DELETE"); assert.equal(deleted.status, 200); }
    assert.equal((await request(`/${id}`)).status, 404);
    const after = await request(); assert.equal(after.status, 200);
    assert.ok(originals.every(id => after.payload.data.some(row => row.id_pedido === id)));
    const count = await (await getPool()).request().input("id", sql.NVarChar(64), id).query("SELECT COUNT(*) AS quantidade FROM dbo.TB_PEDIDOS WHERE id_pedido = @id");
    assert.equal(count.recordset[0].quantidade, 0);
    console.log(`DELETE confirmado no Azure SQL. ${after.payload.data.length} pedidos preservados.`);
  } finally { await closePool(); }
}
