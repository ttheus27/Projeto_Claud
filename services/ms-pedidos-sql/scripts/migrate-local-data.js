import fs from "node:fs/promises";
import { pedidoRepository } from "../src/infrastructure/pedido.repository.js";
import { validarEFormatarPedido } from "../src/domain/pedido.js";
import { closePool } from "../src/infrastructure/database.js";

let imported = 0;
try {
  const rows = JSON.parse(await fs.readFile(new URL("../data/tb_pedidos.sql.json", import.meta.url), "utf8"));
  for (const row of rows) {
    const pedido = validarEFormatarPedido({ ...row, status_producao: row.status_producao === "Expedição" ? "Aguardando Expedição" : row.status_producao });
    if (await pedidoRepository.buscarPorId(pedido.id_pedido)) continue;
    await pedidoRepository.criar(pedido);
    imported++;
  }
  console.log(`${imported} pedidos locais importados para o Azure SQL; IDs existentes preservados.`);
} finally { await closePool(); }
