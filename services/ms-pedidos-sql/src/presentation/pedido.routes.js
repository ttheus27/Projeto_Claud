import { Router } from "express";

/** HTTP adapter: parsing and status mapping only; application is injected. */
export function createPedidoRouter(useCases) {
  const router = Router();
  const handle = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  router.get("/pedidos", handle(async (req, res) => {
    const data = await useCases.listar();
    res.json({ origem: "Azure SQL Database", total: data.length, data });
  }));
  router.get("/pedidos/orcamento/:codigo", handle(async (req, res) => {
    res.json({ codigoOrcamento: req.params.codigo, pedidos: await useCases.buscarPorOrcamento(req.params.codigo) });
  }));
  router.get("/pedidos/:id", handle(async (req, res) => res.json(await useCases.buscarPorId(req.params.id))));
  router.post("/pedidos", handle(async (req, res) => res.status(201).json({ mensagem: "Pedido criado.", pedido: await useCases.criar(req.body) })));
  router.put("/pedidos/:id", handle(async (req, res) => res.json({ mensagem: "Pedido atualizado.", pedido: await useCases.atualizar(req.params.id, req.body) })));
  router.delete("/pedidos/:id", handle(async (req, res) => res.json({ mensagem: "Pedido excluído.", id: await useCases.excluir(req.params.id) })));
  router.use((error, req, res, next) => {
    if ([400, 404, 409].includes(error.statusCode)) return res.status(error.statusCode).json({ error: error.message });
    console.error("Falha no serviço pedidos:", error.code || error.name);
    res.status(503).json({ error: "Não foi possível acessar o serviço de pedidos. Tente novamente em instantes." });
  });
  return router;
}
