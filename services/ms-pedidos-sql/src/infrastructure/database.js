import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "tb_pedidos.sql.json");

/**
 * Esquema da Tabela Relacional (DER Oficial Arc42):
 * 
 * CREATE TABLE TB_PEDIDOS (
 *   id_pedido VARCHAR(30) PRIMARY KEY,
 *   codigo_orcamento VARCHAR(30) NOT NULL,
 *   cliente VARCHAR(100) NOT NULL,
 *   descricao_peca VARCHAR(150) NOT NULL,
 *   lote_producao INT NOT NULL,
 *   valor_total DECIMAL(10, 2) NOT NULL,
 *   status_producao VARCHAR(30) NOT NULL, -- 'Em Planejamento', 'Em Usinagem CNC', 'Expedição', 'Concluído'
 *   data_entrega_prevista DATE NOT NULL,
 *   criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 */

const SEED_PEDIDOS = [
  {
    id_pedido: "PED-2026-901",
    codigo_orcamento: "ORC-2026-0891",
    cliente: "Schulz Compressores S/A",
    descricao_peca: "Virabrequim Monobloco Forjado 2 Cilindros",
    lote_producao: 500,
    valor_total: 147850.00,
    status_producao: "Em Usinagem CNC",
    data_entrega_prevista: "2026-12-15",
    criado_em: "2026-08-20T10:00:00Z",
    atualizado_em: "2026-08-26T11:30:00Z"
  },
  {
    id_pedido: "PED-2026-902",
    codigo_orcamento: "ORC-2026-0912",
    cliente: "Schulz Automotiva S/A",
    descricao_peca: "Suporte de Pinça de Freio Dianteiro (Ferro Nodular)",
    lote_producao: 1200,
    valor_total: 129480.00,
    status_producao: "Em Planejamento",
    data_entrega_prevista: "2027-01-20",
    criado_em: "2026-09-05T14:15:00Z",
    atualizado_em: "2026-09-08T16:50:00Z"
  }
];

class RelationalSqlEngine {
  constructor() {
    this.tableName = "TB_PEDIDOS";
    this.init();
  }

  init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      console.log(`[SQL ENGINE] Executando DDL: CREATE TABLE ${this.tableName}...`);
      this.writeRows(SEED_PEDIDOS);
      console.log(`[SQL ENGINE] Tabela ${this.tableName} criada e populada com registros iniciais.`);
    }
  }

  readRows() {
    this.init();
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    } catch {
      return [...SEED_PEDIDOS];
    }
  }

  writeRows(rows) {
    fs.writeFileSync(DB_FILE, JSON.stringify(rows, null, 2), "utf-8");
  }

  query(sql, params = []) {
    console.log(`🔍 [SQL QUERY]: "${sql}" | PARAMS: ${JSON.stringify(params)}`);
    const rows = this.readRows();

    // SELECT ALL
    if (sql.startsWith("SELECT * FROM TB_PEDIDOS WHERE codigo_orcamento =")) {
      const codigo = params[0];
      return rows.filter(r => r.codigo_orcamento === codigo);
    }

    if (sql.startsWith("SELECT * FROM TB_PEDIDOS WHERE id_pedido =")) {
      const id = params[0];
      return rows.filter(r => r.id_pedido === id);
    }

    if (sql.startsWith("SELECT * FROM TB_PEDIDOS")) {
      return rows.sort((a, b) => new Date(b.atualizado_em) - new Date(a.atualizado_em));
    }

    // INSERT
    if (sql.startsWith("INSERT INTO TB_PEDIDOS")) {
      const novo = params[0];
      rows.unshift(novo);
      this.writeRows(rows);
      return { rowCount: 1, insertId: novo.id_pedido };
    }

    // UPDATE
    if (sql.startsWith("UPDATE TB_PEDIDOS")) {
      const id = params[params.length - 1];
      const index = rows.findIndex(r => r.id_pedido === id);
      if (index !== -1) {
        rows[index] = { ...rows[index], ...params[0], atualizado_em: new Date().toISOString() };
        this.writeRows(rows);
        return { rowCount: 1, updatedRow: rows[index] };
      }
      return { rowCount: 0 };
    }

    // DELETE
    if (sql.startsWith("DELETE FROM TB_PEDIDOS")) {
      const id = params[0];
      const filtered = rows.filter(r => r.id_pedido !== id);
      const rowCount = rows.length - filtered.length;
      this.writeRows(filtered);
      return { rowCount };
    }

    return rows;
  }
}

export const sqlEngine = new RelationalSqlEngine();
