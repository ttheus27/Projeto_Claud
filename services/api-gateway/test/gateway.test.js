import { test } from "node:test";
import assert from "node:assert/strict";
import { createGateway } from "../src/app.js";

test("gateway exige login, protege cookie, encaminha para BFF e encerra a sessão", async () => {
  const forwarded = [];
  const app = createGateway({ bffUrl: "http://bff:8080", internalToken: "segredo-interno", username: "aluno", password: "senha-teste-segura", httpFetch: async (url, options) => {
    forwarded.push({ url, options });return new Response(JSON.stringify({ data: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  } });
  const server = await new Promise(resolve => { const instance = app.listen(0, "127.0.0.1", () => resolve(instance)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(base + "/api/orcamentos")).status, 401);
    const login = credentials => fetch(base + "/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) });
    assert.equal((await login({ username: "aluno", password: "errada" })).status, 401);
    const session = await login({ username: "aluno", password: "senha-teste-segura" });
    assert.equal(session.status, 200);
    const cookie = session.headers.get("set-cookie");assert.match(cookie, /HttpOnly/);assert.match(cookie, /SameSite=Strict/);
    const headers = { Cookie: cookie.split(";")[0], "x-internal-api-token": "forjado" };
    assert.equal((await fetch(base + "/api/orcamentos", { headers })).status, 200);
    assert.equal(forwarded[0].url, "http://bff:8080/api/orcamentos");assert.equal(forwarded[0].options.headers["x-internal-api-token"], "segredo-interno");assert.equal(forwarded[0].options.headers.cookie, undefined);
    assert.equal((await fetch(base + "/api/session", { headers: { Origin: base } })).status, 401);
    assert.equal((await fetch(base + "/api/orcamentos", { headers: { ...headers, Origin: "https://outro-site.example" } })).status, 403);
    assert.equal((await fetch(base + "/api/session", { method: "DELETE", headers })).status, 204);
    assert.equal((await fetch(base + "/api/orcamentos", { headers })).status, 401);
  } finally { await new Promise(resolve => { server.close(resolve);server.closeAllConnections(); }); }
});
