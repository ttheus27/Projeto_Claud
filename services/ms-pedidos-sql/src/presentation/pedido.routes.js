import { Router } from "express";
import { pedidoRepository } from "../infrastructure/pedido.repository.js";
import { validarEFormatarPedido, PedidoValidationError } from "../domain/pedido.js";

export const pedidoRouter = Router();

// GET /api/pedidos - Lista todas as ordens/pedidos no banco SQL
pedidoRouter.get("/pedidos", async (req, res) => {
  try {
    const pedidos = await pedidoRepository.listar();
    return res.status(200).json({
      origem: "Azure SQL Database / TB_PEDIDOS (Relacional)",
      tabela: "TB_PEDIDOS",
      total: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao consultar pedidos", details: error.message });
  }
});

// GET /api/pedidos/orcamento/:codigoOrcamento - Busca pedidos vinculados a um orçamento específico
pedidoRouter.get("/pedidos/orcamento/:codigoOrcamento", async (req, res) => {
  try {
    const pedidos = await pedidoRepository.buscarPorOrcamento(req.params.codigoOrcamento);
    return res.status(200).json({
      codigoOrcamento: req.params.codigoOrcamento,
      pedidos
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar pedidos por orçamento", details: error.message });
  }
});

// GET /api/pedidos/:id - Busca pedido por ID
pedidoRouter.get("/pedidos/:id", async (req, res) => {
  try {
    const pedido = await pedidoRepository.buscarPorId(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado no banco SQL." });
    }
    return res.status(200).json(pedido);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao consultar pedido", details: error.message });
  }
});

// POST /api/pedidos - Cria uma nova ordem de produção no banco SQL
pedidoRouter.post("/pedidos", async (req, res) => {
  try {
    const formatado = validarEFormatarPedido(req.body, false);
    const criado = await pedidoRepository.criar(formatado);
    return res.status(201).json({
      mensagem: "Pedido de produção registrado com sucesso na TB_PEDIDOS.",
      pedido: criado
    });
  } catch (error) {
    if (error instanceof PedidoValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao criar pedido", details: error.message });
  }
});

// PUT /api/pedidos/:id - Atualiza status ou dados de um pedido
pedidoRouter.put("/pedidos/:id", async (req, res) => {
  try {
    const formatado = validarEFormatarPedido({ ...req.body, id_pedido: req.params.id }, true);
    const atualizado = await pedidoRepository.atualizar(req.params.id, formatado);
    if (!atualizado) {
      return res.status(404).json({ error: "Pedido não localizado para atualização." });
    }
    return res.status(200).json({
      mensagem: "Pedido atualizado na TB_PEDIDOS.",
      pedido: atualizado
    });
  } catch (error) {
    if (error instanceof PedidoValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao atualizar pedido", details: error.message });
  }
});

// DELETE /api/pedidos/:id - Cancela/Exclui um pedido
pedidoRouter.delete("/pedidos/:id", async (req, res) => {
  try {
    const ok = await pedidoRepository.excluir(req.params.id);
    if (!ok) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }
    return res.status(200).json({
      mensagem: "Pedido removido da TB_PEDIDOS com sucesso.",
      id: req.params.id
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir pedido", details: error.message });
  }
});
