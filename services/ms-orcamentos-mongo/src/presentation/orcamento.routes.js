import { Router } from "express";
import { orcamentoRepository } from "../infrastructure/orcamento.repository.js";
import { validarEFormatarOrcamento, OrcamentoValidationError } from "../domain/orcamento.js";

export const orcamentoRouter = Router();

// GET /api/orcamentos - Lista todos os orçamentos
orcamentoRouter.get("/orcamentos", async (req, res) => {
  try {
    const orcamentos = await orcamentoRepository.listar();
    return res.status(200).json({
      origem: process.env.MONGO_URI ? "MongoDB Atlas" : "MongoDB (Persistência Local Integrada)",
      total: orcamentos.length,
      data: orcamentos
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao consultar orçamentos", details: error.message });
  }
});

// GET /api/orcamentos/:id - Busca um orçamento pelo ID
orcamentoRouter.get("/orcamentos/:id", async (req, res) => {
  try {
    const item = await orcamentoRepository.buscarPorId(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Orçamento não encontrado." });
    }
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar orçamento", details: error.message });
  }
});

// POST /api/orcamentos - Cria um novo orçamento
orcamentoRouter.post("/orcamentos", async (req, res) => {
  try {
    const orcamentoFormatado = validarEFormatarOrcamento(req.body, false);
    const criado = await orcamentoRepository.criar(orcamentoFormatado);
    return res.status(201).json({
      mensagem: "Orçamento gravado com sucesso.",
      orcamento: criado
    });
  } catch (error) {
    if (error instanceof OrcamentoValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno ao criar orçamento", details: error.message });
  }
});

// PUT /api/orcamentos/:id - Atualiza um orçamento existente
orcamentoRouter.put("/orcamentos/:id", async (req, res) => {
  try {
    const orcamentoAtualizado = validarEFormatarOrcamento({ ...req.body, id: req.params.id }, true);
    const resultado = await orcamentoRepository.atualizar(req.params.id, orcamentoAtualizado);
    if (!resultado) {
      return res.status(404).json({ error: "Orçamento não encontrado para atualização." });
    }
    return res.status(200).json({
      mensagem: "Orçamento atualizado com sucesso.",
      orcamento: resultado
    });
  } catch (error) {
    if (error instanceof OrcamentoValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno ao atualizar orçamento", details: error.message });
  }
});

// DELETE /api/orcamentos/:id - Exclui um orçamento
orcamentoRouter.delete("/orcamentos/:id", async (req, res) => {
  try {
    await orcamentoRepository.excluir(req.params.id);
    return res.status(200).json({
      mensagem: "Orçamento removido com sucesso.",
      id: req.params.id
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir orçamento", details: error.message });
  }
});
