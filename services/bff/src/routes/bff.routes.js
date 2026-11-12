import { Router } from "express";

export function createBffRouter({ aggregate, forward, mongoUrl, sqlUrl, generateOrder, docsTargets }) {
  const router = Router();
  function send(res, result) {
    if (result.contentType) res.type(result.contentType);
    if (result.location?.startsWith("/")) res.set("Location", result.location);
    res.status(result.status).send(result.body);
  }
  async function proxy(req, res, target) {
    try { send(res, await forward({ target, method: req.method, body: req.body, requestId: req.get("x-request-id") })); }
    catch { res.status(503).json({ error: "Serviço indisponível. Sincronize os dados antes de repetir uma alteração." }); }
  }
  router.get("/aggregated-data", async (req, res) => {
    try { res.json(await aggregate()); }
    catch { res.status(503).json({ error: "Não foi possível consultar os serviços." }); }
  });
  for (const [domain, url] of [["orcamentos", mongoUrl], ["pedidos", sqlUrl]]) {
    router.get(`/${domain}`, (req, res) => proxy(req, res, url));
    router.post(`/${domain}`, (req, res) => proxy(req, res, url));
    for (const method of ["get", "put", "delete"]) router[method](`/${domain}/:id`, (req, res) => proxy(req, res, `${url}/${encodeURIComponent(req.params.id)}`));
  }
  router.get("/pedidos/orcamento/:codigo", (req, res) => proxy(req, res, `${sqlUrl}/orcamento/${encodeURIComponent(req.params.codigo)}`));
  router.post("/pedidos/gerar-de-orcamento", async (req, res) => {
    try { send(res, await generateOrder(req.body)); }
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
