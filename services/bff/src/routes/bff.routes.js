import { Router } from "express";
import { getAggregatedData, fetchWithTimeout } from "../services/aggregator.service.js";

export const bffRouter = Router();

const MS_MONGO_URL = process.env.MS_MONGO_URL || "http://localhost:3001/api/orcamentos";
const MS_SQL_URL = process.env.MS_SQL_URL || "http://localhost:3002/api/pedidos";

// =========================================================================
// 📌 ENDPOINT OBRIGATÓRIO PJBL: GET /api/aggregated-data
// Agrega Microserviço 1 (MongoDB) + Microserviço 2 (Azure SQL) + Azure Function
// =========================================================================
bffRouter.get("/aggregated-data", async (req, res) => {
  try {
    const aggregated = await getAggregatedData();
    return res.status(200).json(aggregated);
  } catch (error) {
    return res.status(500).json({
      error: "Falha na agregação de dados no BFF",
      details: error.message
    });
  }
});

// =========================================================================
// PROXIES TRANSPARENTES PARA O FRONTEND (Microserviço 1 - MongoDB)
// =========================================================================
bffRouter.get("/orcamentos", async (req, res) => {
  try {
    const data = await fetchWithTimeout(MS_MONGO_URL);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Microserviço 1 (Mongo) indisponível", details: error.message });
  }
});

bffRouter.post("/orcamentos", async (req, res) => {
  try {
    const response = await fetch(MS_MONGO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Microserviço 1 (Mongo) indisponível", details: error.message });
  }
});

bffRouter.put("/orcamentos/:id", async (req, res) => {
  try {
    const response = await fetch(`${MS_MONGO_URL}/${req.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Microserviço 1 (Mongo) indisponível", details: error.message });
  }
});

bffRouter.delete("/orcamentos/:id", async (req, res) => {
  try {
    const response = await fetch(`${MS_MONGO_URL}/${req.params.id}`, {
      method: "DELETE"
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Microserviço 1 (Mongo) indisponível", details: error.message });
  }
});

// =========================================================================
// PROXIES TRANSPARENTES PARA O FRONTEND (Microserviço 2 - Azure SQL)
// =========================================================================
bffRouter.get("/pedidos", async (req, res) => {
  try {
    const data = await fetchWithTimeout(MS_SQL_URL);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Microserviço 2 (SQL) indisponível", details: error.message });
  }
});

bffRouter.post("/pedidos", async (req, res) => {
  try {
    const response = await fetch(MS_SQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Microserviço 2 (SQL) indisponível", details: error.message });
  }
});

// Ação de Negócio: Converte Orçamento Aprovado em Pedido na TB_PEDIDOS
bffRouter.post("/pedidos/gerar-de-orcamento", async (req, res) => {
  try {
    const { idOrcamento, codigoPeca, cliente, lotePadrao, precoTotalLote, descricaoPeca } = req.body;
    const novoPedido = {
      codigo_orcamento: idOrcamento || "ORC-NOVO",
      cliente: cliente || "Schulz S/A",
      descricao_peca: descricaoPeca || `Peça ${codigoPeca}`,
      lote_producao: lotePadrao || 100,
      valor_total: precoTotalLote || 0,
      status_producao: "Em Planejamento",
      data_entrega_prevista: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0]
    };

    const response = await fetch(MS_SQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoPedido)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Falha ao gerar pedido no banco SQL", details: error.message });
  }
});
