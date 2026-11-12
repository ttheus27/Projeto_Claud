import { Router } from "express";
import { pedidoRepository } from "../infrastructure/pedido.repository.js";
import { validarEFormatarPedido, validarIdPedido, PedidoValidationError } from "../domain/pedido.js";

export function createPedidoRouter(repository = pedidoRepository) {
  const router = Router();
  const handle = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  router.param("id", (req, res, next, id) => {
    try { validarIdPedido(id); next(); } catch (error) { next(error); }
  });
  router.get("/pedidos", handle(async (req, res) => {
    const pedidos = await repository.listar();
    res.json({ origem: "Azure SQL Database", tabela: "TB_PEDIDOS", total: pedidos.length, data: pedidos });
  }));
  router.get("/pedidos/orcamento/:codigo", handle(async (req, res) => {
    const codigo = validarIdPedido(req.params.codigo);
    res.json({ codigoOrcamento: codigo, pedidos: await repository.buscarPorOrcamento(codigo) });
  }));
  router.get("/pedidos/:id", handle(async (req, res) => {
    const pedido = await repository.buscarPorId(req.params.id);
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado." });
    res.json(pedido);
  }));
  router.post("/pedidos", handle(async (req, res) => {
    const pedido = await repository.criar(validarEFormatarPedido(req.body));
    res.status(201).json({ mensagem: "Pedido criado no Azure SQL.", pedido });
  }));
  router.put("/pedidos/:id", handle(async (req, res) => {
    const atual = await repository.buscarPorId(req.params.id);
    if (!atual) return res.status(404).json({ error: "Pedido não encontrado." });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) throw new PedidoValidationError("Envie um objeto JSON para atualizar o pedido.");
    const dados = validarEFormatarPedido({ ...atual, ...req.body, id_pedido: req.params.id }, true);
    const pedido = await repository.atualizar(req.params.id, dados);
    if (!pedido) return res.status(404).json({ error: "Pedido não encontrado." });
    res.json({ mensagem: "Pedido atualizado no Azure SQL.", pedido });
  }));
  router.delete("/pedidos/:id", handle(async (req, res) => {
    if (!await repository.excluir(req.params.id)) return res.status(404).json({ error: "Pedido não encontrado." });
    res.json({ mensagem: "Pedido excluído do Azure SQL.", id: req.params.id });
  }));
  router.use((error, req, res, next) => {
    if (error instanceof PedidoValidationError) return res.status(400).json({ error: error.message });
    if ([2601, 2627].includes(error.number)) return res.status(409).json({ error: "Já existe um pedido com esse identificador." });
    console.error("Falha na operação Azure SQL:", error.code || error.name);
    res.status(503).json({ error: "Não foi possível acessar o Azure SQL. Tente novamente em instantes." });
  });
  return router;
}
export const pedidoRouter = createPedidoRouter();
