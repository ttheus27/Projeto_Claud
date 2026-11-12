import { Router } from "express";

/** HTTP adapter: parsing and status mapping only; application is injected. */
export function createOrcamentoRouter(useCases) {
  const router = Router();
  const handle = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  router.get("/orcamentos", handle(async (req, res) => {
    const data = await useCases.listar();
    res.json({ origem: "MongoDB Atlas", total: data.length, data });
  }));
  router.get("/orcamentos/:id", handle(async (req, res) => res.json(await useCases.buscarPorId(req.params.id))));
  router.post("/orcamentos", handle(async (req, res) => res.status(201).json({ mensagem: "Orçamento criado.", orcamento: await useCases.criar(req.body) })));
  router.put("/orcamentos/:id", handle(async (req, res) => res.json({ mensagem: "Orçamento atualizado.", orcamento: await useCases.atualizar(req.params.id, req.body) })));
  router.delete("/orcamentos/:id", handle(async (req, res) => res.json({ mensagem: "Orçamento excluído.", id: await useCases.excluir(req.params.id) })));
  router.use((error, req, res, next) => {
    if ([400, 404, 409].includes(error.statusCode)) return res.status(error.statusCode).json({ error: error.message });
    console.error("Falha no serviço orcamentos:", error.code || error.name);
    res.status(503).json({ error: "Não foi possível acessar o serviço de orcamentos. Tente novamente em instantes." });
  });
  return router;
}
