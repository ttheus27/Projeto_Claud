import { Router } from "express";

function entityIdFrom(result) {
  try {
    const body = Buffer.isBuffer(result.body) ? JSON.parse(result.body.toString("utf8")) : result.body;
    const record = body?.pedido ?? body?.orcamento ?? body;
    return record?.id_pedido ?? record?.id ?? record?._id ?? body?.id ?? null;
  } catch {
    return null;
  }
}

export function createBffRouter({ aggregate, forward, mongoUrl, sqlUrl, generateOrder, docsTargets, eventBus }) {
  const router = Router();
  function send(res, result) {
    if (result.contentType) res.type(result.contentType);
    if (result.location?.startsWith("/")) res.set("Location", result.location);
    res.status(result.status).send(result.body);
  }
  function publishIfSuccessful(result, event, req) {
    if (!event || result.status < 200 || result.status >= 300 || !eventBus) return;
    try {
      eventBus.publish({ ...event, entityId: req.params.id || entityIdFrom(result) || event.entityId || null });
    } catch {
      // Falha no feed não pode desfazer uma operação já persistida no serviço.
    }
  }
  async function proxy(req, res, target, event) {
    try {
      const result = await forward({ target, method: req.method, body: req.body, requestId: req.get("x-request-id") });
      publishIfSuccessful(result, event, req);
      send(res, result);
    }
    catch { res.status(503).json({ error: "Serviço indisponível. Sincronize os dados antes de repetir uma alteração." }); }
  }
  router.get("/events", (req, res) => res.json({ source: "BFF in-memory event bus", events: eventBus?.list(req.query.limit) ?? [] }));
  router.get("/aggregated-data", async (req, res) => {
    try { res.json(await aggregate()); }
    catch { res.status(503).json({ error: "Não foi possível consultar os serviços." }); }
  });
  for (const [domain, url] of [["orcamentos", mongoUrl], ["pedidos", sqlUrl]]) {
    router.get(`/${domain}`, (req, res) => proxy(req, res, url));
    const entity = domain === "orcamentos" ? "orcamento" : "pedido";
    const source = domain === "orcamentos" ? "Microserviço MongoDB" : "Microserviço Azure SQL";
    router.post(`/${domain}`, (req, res) => proxy(req, res, url, { type: `${entity}.criado`, entityType: entity, source, description: `${entity === "orcamento" ? "Orçamento" : "Pedido"} criado` }));
    router.get(`/${domain}/:id`, (req, res) => proxy(req, res, `${url}/${encodeURIComponent(req.params.id)}`));
    router.put(`/${domain}/:id`, (req, res) => {
      const statusChange = domain === "pedidos" && req.body?.status_producao;
      const type = statusChange ? "pedido.status_alterado" : `${entity}.atualizado`;
      const description = statusChange ? `Status do pedido alterado para ${req.body.status_producao}` : `${entity === "orcamento" ? "Orçamento" : "Pedido"} atualizado`;
      return proxy(req, res, `${url}/${encodeURIComponent(req.params.id)}`, { type, entityType: entity, source, description, ...(statusChange ? { status: req.body.status_producao } : {}) });
    });
    router.delete(`/${domain}/:id`, (req, res) => proxy(req, res, `${url}/${encodeURIComponent(req.params.id)}`, { type: `${entity}.excluido`, entityType: entity, source, description: `${entity === "orcamento" ? "Orçamento" : "Pedido"} excluído` }));
  }
  router.get("/pedidos/orcamento/:codigo", (req, res) => proxy(req, res, `${sqlUrl}/orcamento/${encodeURIComponent(req.params.codigo)}`));
  router.post("/pedidos/gerar-de-orcamento", async (req, res) => {
    try {
      const result = await generateOrder(req.body);
      publishIfSuccessful(result, { type: "pedido.gerado_de_orcamento", entityType: "pedido", entityId: req.body?.idOrcamento, source: "BFF → Azure SQL", description: `Pedido gerado a partir do orçamento ${req.body?.idOrcamento || ""}`.trim() }, req);
      send(res, result);
    }
    catch { res.status(503).json({ error: "Não foi possível gerar o pedido." }); }
  });
  router.use("/docs/:domain", (req, res) => {
    const target = docsTargets[req.params.domain];
    if (!target) return res.status(404).json({ error: "Documentação não encontrada." });
    return proxy(req, res, target + "/api-docs" + req.url);
  });
  router.get("/openapi/:domain", (req, res) => {
    const target = docsTargets[req.params.domain];
    if (!target) return res.status(404).json({ error: "Documentação não encontrada." });
    return proxy(req, res, target + "/openapi.json");
  });
  return router;
}
