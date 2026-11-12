import "../security/internal-auth.js";
import { Router } from "express";
import { getAggregatedData } from "../services/aggregator.service.js";

export const bffRouter = Router();
const mongoUrl = process.env.MS_MONGO_URL || "http://localhost:3001/api/orcamentos";
const sqlUrl = process.env.MS_SQL_URL || "http://localhost:3002/api/pedidos";

async function proxy(req, res, target, body = req.body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 105000);
  try {
    const response = await fetch(target, {
      method: req.method, signal: controller.signal, redirect: "manual",
      headers: { "x-internal-api-token": process.env.INTERNAL_API_TOKEN, ...(["POST", "PUT"].includes(req.method) ? { "Content-Type": "application/json" } : {}) },
      ...(["POST", "PUT"].includes(req.method) ? { body: JSON.stringify(body) } : {}),
    });
    if (response.headers.get("content-type")) res.type(response.headers.get("content-type"));
    const location = response.headers.get("location");
    if (location?.startsWith("/")) res.set("Location", location);
    res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
  } catch { res.status(503).json({ error: "Serviço indisponível. Sincronize os dados antes de repetir uma alteração." }); }
  finally { clearTimeout(timer); }
}

bffRouter.get("/aggregated-data", async (req, res) => {
  try { res.json(await getAggregatedData()); }
  catch { res.status(503).json({ error: "Não foi possível consultar os serviços." }); }
});
for (const [domain, url] of [["orcamentos", mongoUrl], ["pedidos", sqlUrl]]) {
  bffRouter.get(`/${domain}`, (req, res) => proxy(req, res, url));
  bffRouter.post(`/${domain}`, (req, res) => proxy(req, res, url));
  for (const method of ["get", "put", "delete"]) bffRouter[method](`/${domain}/:id`, (req, res) => proxy(req, res, `${url}/${encodeURIComponent(req.params.id)}`));
}
bffRouter.get("/pedidos/orcamento/:codigo", (req, res) => proxy(req, res, `${sqlUrl}/orcamento/${encodeURIComponent(req.params.codigo)}`));
bffRouter.post("/pedidos/gerar-de-orcamento", (req, res) => proxy(req, res, sqlUrl, {
  codigo_orcamento: req.body.idOrcamento, cliente: req.body.cliente,
  descricao_peca: req.body.descricaoPeca, lote_producao: req.body.lotePadrao,
  valor_total: req.body.precoTotalLote, status_producao: "Em Planejamento",
  data_entrega_prevista: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
}));
const docsTargets = { mongo: new URL(mongoUrl).origin, sql: new URL(sqlUrl).origin, bff: "http://localhost:8080" };
bffRouter.use("/docs/:domain", (req, res) => {
  const target = docsTargets[req.params.domain];
  if (!target) return res.status(404).json({ error: "Documentação não encontrada." });
  return proxy(req, res, target + "/api-docs" + req.url);
});
bffRouter.get("/openapi/:domain", (req, res) => {
  const target = docsTargets[req.params.domain];
  if (!target) return res.status(404).json({ error: "Documentação não encontrada." });
  return proxy(req, res, target + "/openapi.json");
});
